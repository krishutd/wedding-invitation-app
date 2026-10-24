// The lower point is also the connector endpoint. Unequal lobes keep the knot organic.
export const ORGANIC_LOOP = 'M24 41 C13 35 -1 24 5 12 C9 4 20 7 25 13 C31 7 43 9 44 20 C44 30 33 38 24 41';

export async function chooseDate({ root, strand, loop, seal, animate, setStage }) {
  const bounds = root.getBoundingClientRect();
  const sealBounds = seal.getBoundingClientRect();
  const selected = root.querySelector('.date-selected').getBoundingClientRect();
  const anchor = { x: sealBounds.left + sealBounds.width / 2 - bounds.left, y: sealBounds.top + 2 - bounds.top };
  const destination = { x: selected.left + selected.width / 2 - bounds.left, y: selected.top + 41 - bounds.top };
  const segments = [...root.querySelectorAll('.thread-trail')];
  const tailLength = Math.min(loop.getTotalLength() / strand.getTotalLength(), 1);
  const segmentLength = tailLength / segments.length;
  setStage('drawing');
  // Restore the original seal orbit and direct, fading trail to the date.
  // No painted connector remains behind the moving thread.
  await Promise.all(segments.map((segment, index) => {
    segment.style.strokeDasharray = `${segmentLength} ${2 + tailLength}`;
    const offset = (index + 1) * segmentLength;
    const opacity = (1 - index / segments.length) ** 1.4;
    return animate(segment, [
      { strokeDashoffset: offset, opacity },
      { strokeDashoffset: offset - 1, opacity },
    ], 1350, { easing: 'linear' }).finished;
  }));
  setStage('looping');
  await Promise.all([
    // A fully offset rounded dash can leave a painted endpoint on mobile SVG
    // renderers. Reveal it only once the stroke has actually started growing.
    animate(loop, [
      { strokeDashoffset: 1, opacity: 0 },
      { strokeDashoffset: .98, opacity: 1, offset: .02 },
      { strokeDashoffset: 0, opacity: 1 },
    ], 1050, { easing: 'ease-in-out' }).finished,
    ...segments.map((segment, index) => {
      const offset = (index + 1) * segmentLength - 1;
      return animate(segment, [
        { strokeDashoffset: offset },
        { strokeDashoffset: offset - tailLength },
      ], 1050 * .85, { easing: 'ease-in-out' }).finished;
    }),
  ]);
  setStage('holding');
  // Measure before starting any motion; transform only, so the date and thread
  // anchors stay fixed and the rest of the sequence keeps its original timing.
  const dateBounds = root.querySelector('.date-selected').getBoundingClientRect();
  const labels = ['.date-month-name', '.date-year'].map(selector => root.querySelector(selector));
  const labelMoves = labels.map((node, index) => {
    const rect = node.getBoundingClientRect();
    const x = index === 0
      ? dateBounds.left - 3 - rect.right
      : dateBounds.right + 3 - rect.left;
    const y = dateBounds.top + dateBounds.height / 2 - 1.5 - (rect.top + rect.height / 2);
    return { node, transform: `translate(${x}px, ${y}px)` };
  });
  // Run alongside the thread story without adding a wait to its timeline.
  // Cancellation on unmount/resize is expected and handled by the owner.
  for (const { node, transform } of labelMoves) {
    animate(node, [
      { transform: 'translate(0px, 0px)' },
      { transform },
    ], 2000, { easing: 'cubic-bezier(.42,0,.58,1)' }).finished.catch(() => {});
  }
  await Promise.all([...root.querySelectorAll('.date-neighbour')].map(node =>
    animate(node, [{ opacity: 1 }, { opacity: 0 }], 650).finished));
  await animate(loop, [{ opacity: 1 }, { opacity: 1 }], 700).finished;
  setStage('tightening');
  strand.setAttribute('d', `M${anchor.x} ${anchor.y} L${destination.x} ${destination.y}`);
  strand.style.strokeDasharray = '1 1';
  // Tighten only the loop about its anchored lower point; the numeral never moves.
  loop.style.transformBox = 'view-box';
  loop.style.transformOrigin = '24px 41px';
  await Promise.all([
    animate(loop, [{ transform: 'scale(1)' }, { transform: 'scale(.92)' }], 600).finished,
    animate(strand, [{ strokeDashoffset: -1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1 }], 600).finished,
  ]);
  setStage('tugging');
  const pulse = root.querySelector('.thread-tug');
  pulse.setAttribute('d', strand.getAttribute('d'));
  await animate(pulse, [
    { strokeDashoffset: -1, opacity: 0 },
    { strokeDashoffset: -.85, opacity: 1, offset: .12 },
    { strokeDashoffset: 0, opacity: 1 },
  ], 650, { easing: 'ease-in-out' }).finished;
  // Return at impact so EnvelopeOpening starts its seal release immediately.
  // The connector and heart dissolve alongside it, without a separate seal bounce.
  strand.style.strokeDasharray = '1 1';
  for (const animation of [
    animate(pulse, [{ opacity: 1 }, { opacity: 0 }], 150),
    animate(strand, [{ strokeDashoffset: 0, opacity: 1 }, { strokeDashoffset: 1, opacity: 0 }], 260),
    animate(loop, [{ opacity: 1 }, { opacity: 0 }], 260),
  ]) animation.finished.catch(() => {});
}
