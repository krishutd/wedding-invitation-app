import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { eventDate, formatEvent } from './events';

import { HEART as heart } from './StationeryReveal.jsx';
const TRAIL_SEGMENTS = 24;
const DATE_RETURN_MS = 1000;
const SEAL_RELEASE_MS = 700;
const FLAP_OPEN_MS = 1000;
const THREAD_TRAVEL_MS = 1350;
const DATE_HEART_MS = 1050;
const FLOW_EASING = 'ease-in-out';
import { assetUrl as asset } from "./assets.js";

export default function EnvelopeOpening({ event, ready, onActivate, onFinish, onPaper }) {
  const root = useRef(null);
  const selected = useRef(null);
  const seal = useRef(null);
  const strand = useRef(null);
  const trail = useRef(null);
  const heartPath = useRef(null);
  const letter = useRef(null);
  const active = useRef(false);
  const mounted = useRef(true);
  const animations = useRef(new Set());
  const watchdog = useRef(null);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const reduced = useReducedMotion();
  const [stage, setStage] = useState('sealed');
  const [thread, setThread] = useState('');

  function animate(node, frames, duration, extra = {}) {
    const animation = node.animate(frames, { duration, fill: 'forwards', easing: 'cubic-bezier(.22,.75,.28,1)', ...extra });
    animations.current.add(animation);
    return animation;
  }
  function finish() {
    if (!mounted.current || !active.current) return;
    active.current = false;
    clearTimeout(watchdog.current);
    animations.current.forEach((animation) => animation.cancel());
    animations.current.clear();
    finishRef.current();
  }
  useEffect(() => {
    mounted.current = true;
    const resize = () => {
      if (active.current) finish();
      else measure();
    };
    function measure() {
      if (!root.current || !selected.current || !seal.current) return;
      const r = root.current.getBoundingClientRect();
      const d = selected.current.getBoundingClientRect();
      const s = seal.current.getBoundingClientRect();
      const x = s.left + s.width / 2 - r.left;
      const y = s.top + s.height / 2 - r.top;
      const tx = d.left + d.width / 2 - r.left;
      const ty = d.top + 41 - r.top;
      // Sweep 310 degrees, leaving an open gap at the top of the seal.
      // The outgoing curve shares the arc's tangent, avoiding a kink or crossing.
      const radius = Math.max(s.width, s.height) / 2 + 5;
      const startAngle = -65 * Math.PI / 180;
      const endAngle = 245 * Math.PI / 180;
      const startX = x + radius * Math.cos(startAngle);
      const startY = y + radius * Math.sin(startAngle);
      const endX = x + radius * Math.cos(endAngle);
      const endY = y + radius * Math.sin(endAngle);
      const controlX = endX - Math.sin(endAngle) * radius * 1.4;
      const controlY = endY + Math.cos(endAngle) * radius * 1.4;
      setThread(`M${startX} ${startY} A${radius} ${radius} 0 1 1 ${endX} ${endY} C${controlX} ${controlY} ${tx - 55} ${ty + 45} ${tx} ${ty}`);
    }
    if (ready) measure();
    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    return () => {
      mounted.current = false;
      clearTimeout(watchdog.current);
      animations.current.forEach((animation) => animation.cancel());
      animations.current.clear();
      window.removeEventListener('resize', resize);
      window.visualViewport?.removeEventListener('resize', resize);
    };
  }, [ready]);

  async function open() {
    if (active.current) return;
    active.current = true;
    onActivate(); // Keep audio.play() in the native user-activation call stack.
    watchdog.current = setTimeout(finish, 17000);
    setStage('drawing');
    try {
      if (reduced || !ready) {
        await animate(root.current, [{ opacity: 1 }, { opacity: 0 }], 200).finished;
        finish();
        return;
      }
      // A short dash train follows the path; its total length is the heart perimeter.
      // Opacity falls toward the tail, rather than leaving the entire route painted.
      const tailLength = Math.min(heartPath.current.getTotalLength() / strand.current.getTotalLength(), 1);
      const segmentLength = tailLength / TRAIL_SEGMENTS;
      const segments = [...trail.current.querySelectorAll('.thread-trail')];
      await Promise.all(segments.map((segment, index) => {
        segment.style.strokeDasharray = `${segmentLength} ${2 + tailLength}`;
        const offset = (index + 1) * segmentLength;
        return animate(segment, [
          { strokeDashoffset: offset, opacity: (1 - index / TRAIL_SEGMENTS) ** 1.4 },
          { strokeDashoffset: offset - 1, opacity: (1 - index / TRAIL_SEGMENTS) ** 1.4 },
        ], THREAD_TRAVEL_MS, { easing: 'linear' }).finished;
      }));
      // As the heart fills, pull the remaining tail into it until no connector remains.
      await Promise.all([
        animate(heartPath.current, [{ strokeDashoffset: 1, stroke: '#A47A30' }, { strokeDashoffset: 0, stroke: '#A47A30', offset: .85 }, { strokeDashoffset: 0, stroke: '#702D36' }], DATE_HEART_MS, { easing: 'ease-in-out' }).finished,
        ...segments.map((segment, index) => {
          const offset = (index + 1) * segmentLength - 1;
          return animate(segment, [
            { strokeDashoffset: offset },
            { strokeDashoffset: offset - tailLength },
          ], DATE_HEART_MS * .85, { easing: 'ease-in-out' }).finished;
        }),
      ]);
      setStage('gathering');
      await animate(trail.current, [{ opacity: 1 }, { opacity: 0 }], 120, { easing: FLOW_EASING }).finished;
      setStage('travelling');
      const d = selected.current.getBoundingClientRect();
      const s = seal.current.getBoundingClientRect();
      const dx = s.left + s.width / 2 - d.left - d.width / 2;
      const dy = s.top + s.height / 2 - d.top - d.height / 2;
      await animate(selected.current, [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(.4)`, opacity: .8 }], DATE_RETURN_MS, { easing: FLOW_EASING }).finished;
      setStage('release');
      animate(selected.current, [{ opacity: .8 }, { opacity: 0 }], 300);
      animate(root.current.querySelector('.seal-ripple'), [{ transform: 'scale(.65)', opacity: .65 }, { transform: 'scale(1.65)', opacity: 0 }], SEAL_RELEASE_MS);
      await animate(seal.current, [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-18px) rotate(-8deg)', opacity: 0 }], SEAL_RELEASE_MS, { easing: FLOW_EASING }).finished;
      setStage('flap');
      const flap = root.current.querySelector('.envelope-flap');
      // Change stacking only while the paper is edge-on, not after it has opened.
      // Both faces rotate on one hinge, avoiding a mirrored front surface on the reverse side.
      const flapMotion = animate(flap, [
        { transform: 'rotateX(0deg)', zIndex: 4, offset: 0 },
        { transform: 'rotateX(-90deg)', zIndex: 4, offset: .5 },
        { transform: 'rotateX(-90.018deg)', zIndex: 0, offset: .5001 },
        { transform: 'rotateX(-180deg)', zIndex: 0, offset: 1 },
      ], FLAP_OPEN_MS, { easing: 'cubic-bezier(.42,0,.58,1)' }).finished;
      // Release the light while the flap is still moving, from its actual seam.
      const envelopeBounds = root.current.querySelector('.envelope').getBoundingClientRect();
      await Promise.all([flapMotion, onPaper?.({
        left: envelopeBounds.left, top: envelopeBounds.top,
        width: envelopeBounds.width, height: envelopeBounds.height,
      })]);
      finish();
    } catch { finish(); }
  }

  return (
    <div className="opening-composition" ref={root} data-stage={stage} aria-busy={!ready}>
      <div className="envelope-heading"><span className="envelope-couple-names">Krishna &amp; Archa</span></div>
      <div className="date-motif" role="img" aria-label={formatEvent(event, { day: 'numeric', month: 'long', year: 'numeric' })}>
        <div className="date-month" aria-hidden="true">{formatEvent(event, { month: 'long', year: 'numeric' })}</div>
        <div className="date-row" aria-hidden="true">
          {[-2, -1, 0, 1, 2].map((offset) => offset ? <span className="date-neighbour" key={offset}>{eventDate(event, offset).getUTCDate()}</span> :
            <span className="date-selected" ref={selected} key={0}>
              <svg viewBox="0 0 48 46"><path ref={heartPath} d={heart} pathLength="1" style={{ strokeDashoffset: reduced ? 0 : 1 }} /></svg>
              <span>{event.day}</span>
            </span>)}
        </div>
      </div>
      <svg className="date-thread" ref={trail} aria-hidden="true">
        <path ref={strand} d={thread} pathLength="1" style={{ opacity: 0 }} />
        {Array.from({ length: TRAIL_SEGMENTS }, (_, index) => (
          <path className="thread-trail" key={index} d={thread} pathLength="1" />
        ))}
      </svg>
      <button type="button" className="envelope-stage" onClick={open} aria-disabled={stage !== 'sealed'} aria-label={`Open the ${event.label} invitation`}>
        <div className="envelope" aria-hidden="true">
          <div className="envelope-back" />
          <div className="envelope-letter paper-section" ref={letter}><span className="letter-message">You're cordially invited</span><span className="letter-rule" /></div>
          <div className="envelope-flap">
            <div className="envelope-flap-face envelope-flap-outer" />
            <div className="envelope-flap-face envelope-flap-inner" />
          </div>
          <div className="envelope-front"><div className="envelope-fold left-fold" /><div className="envelope-fold right-fold" /><div className="envelope-fold bottom-fold" /></div>
          <div className="seal-ripple" />
          <div className="wax-seal" ref={seal}>
            <img className="wax-seal-texture" src={asset('wax-seal-texture.png')} alt="" draggable="false" />
            <img className="wax-seal-ganesha" src={asset('ganesha-seal-engraving.png')} alt="" draggable="false" />
          </div>
        </div>
      </button>
      <span className="opening-hint" aria-hidden="true">Tap to open</span>
    </div>
  );
}
