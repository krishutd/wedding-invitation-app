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
    animate(loop, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], 1050, { easing: 'ease-in-out' }).finished,
    ...segments.map((segment, index) => {
      const offset = (index + 1) * segmentLength - 1;
      return animate(segment, [
        { strokeDashoffset: offset },
        { strokeDashoffset: offset - tailLength },
      ], 1050 * .85, { easing: 'ease-in-out' }).finished;
    }),
  ]);
  setStage('holding');
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
    { strokeDashoffset: 0, opacity: 1, offset: .92 },
    { strokeDashoffset: .08, opacity: 0 },
  ], 650, { easing: 'ease-in-out' }).finished;
  setStage('release');
  await animate(seal, [
    { transform: 'translateY(0) rotate(0deg)' },
    { transform: 'translateY(-5px) rotate(-5deg)', offset: .55 },
    { transform: 'translateY(0) rotate(0deg)' },
  ], 260).finished;
  // Erase from the date toward the seal, following the direction of the tug.
  strand.style.strokeDasharray = '1 1';
  await Promise.all([
    animate(strand, [{ strokeDashoffset: 0, opacity: 1 }, { strokeDashoffset: 1, opacity: 0 }], 260).finished,
    animate(loop, [{ opacity: 1 }, { opacity: 0 }], 260).finished,
  ]);
}
