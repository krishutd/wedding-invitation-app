import { useLayoutEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/** Two finite travelling strokes trace the existing frame, never a second border. */
export default function ThreadBorder({ children }) {
  const hostRef = useRef(null);
  const frameRef = useRef(null);
  const svgRef = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const host = hostRef.current;
    const frame = frameRef.current;
    const svg = svgRef.current;
    if (reduced || !window.requestAnimationFrame) return;
    const paths = [...svg.querySelectorAll('.invitation-thread-stroke')];
    const tips = [...svg.querySelectorAll('.invitation-thread-tip')];
    const glint = svg.querySelector('.invitation-thread-glint');
    let raf = 0;
    let safetyTimer = 0;
    let reached = 0;
    let width = 0;
    let height = 0;
    let disposed = false;
    let first = true;
    let target = 0;
    const hideThread = () => { svg.style.opacity = '0'; host.dataset.threadState = 'settled'; };
    const clip = (depth, spread = width / 2) => {
      frame.style.clipPath = `inset(-20px ${Math.max(-2, width / 2 - spread)}px ${Math.max(-2, height - depth)}px ${Math.max(-2, width / 2 - spread)}px)`;
    };
    const stop = () => { cancelAnimationFrame(raf); clearTimeout(safetyTimer); };
    const settle = () => {
      stop();
      reached = Math.max(reached, target);
      clip(reached);
      hideThread();
    };
    const recover = () => {
      stop();
      reached = height;
      frame.style.clipPath = '';
      hideThread();
    };
    const measure = () => {
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      return rect;
    };
    const travel = (isFirst) => {
      stop();
      const rect = measure();
      target = Math.min(height + 2, Math.max(reached, innerHeight - rect.top + 48));
      if (target <= reached && !isFirst) return;
      // A fast scroll skips the offscreen stretch instead of queueing a long draw.
      const from = isFirst ? 0 : Math.max(reached, -rect.top);
      const horizontal = Math.max(0, width / 2 - 24.5);
      paths.forEach((path, i) => {
        const x = i === 0 ? .5 : width - .5;
        path.setAttribute('d', isFirst
          ? `M${width / 2 + (i === 0 ? -24 : 24)} .5 H${x} V${target}`
          : `M${x} ${from} V${target}`);
      });
      const lengths = paths.map(path => path.getTotalLength());
      paths.forEach((path, i) => { path.style.strokeDasharray = `${Math.min(84, lengths[i])} ${lengths[i] + 84}`; });
      const started = performance.now();
      const duration = isFirst ? 1550 : 620;
      svg.style.opacity = '1';
      host.dataset.threadState = isFirst ? 'top' : 'sides';
      // Hide only decoration; text and links are never part of this mask.
      clip(from, isFirst ? 24 : width / 2);
      const draw = now => {
        if (disposed) return;
        try {
          const progress = Math.min(1, (now - started) / duration);
          const distance = isFirst
            ? (progress < .42 ? horizontal * progress / .42 : horizontal + target * (progress - .42) / .58)
            : (target - from) * progress;
          const depth = isFirst ? Math.max(1, distance - horizontal) : from + distance;
          reached = Math.max(reached, depth);
          clip(reached, isFirst && distance < horizontal ? 24 + distance : width / 2 + 2);
          paths.forEach((path, i) => {
            path.style.strokeDashoffset = String(Math.min(84, lengths[i]) - distance);
            const point = path.getPointAtLength(Math.min(distance, lengths[i]));
            tips[i].setAttribute('cx', point.x);
            tips[i].setAttribute('cy', point.y);
          });
          glint.setAttribute('transform', `translate(${width / 2} 0)`);
          glint.style.opacity = isFirst ? String(Math.max(0, 1 - progress * 3)) : '0';
          svg.style.opacity = String(progress > .83 ? (1 - progress) / .17 : 1);
          host.dataset.threadState = isFirst && distance < horizontal ? 'top' : 'sides';
          if (progress < 1) raf = requestAnimationFrame(draw);
          else settle();
        } catch { recover(); }
      };
      raf = requestAnimationFrame(draw);
      safetyTimer = setTimeout(settle, duration + 250);
    };
    const onScroll = () => {
      const rect = host.getBoundingClientRect();
      const next = Math.min(height + 2, innerHeight - rect.top + 48);
      if (next > target + 12) {
        first = false;
        try { travel(false); } catch { recover(); }
      }
    };
    const onResize = () => {
      // Re-measure without replaying the top ornament or exposing misaligned lines.
      stop();
      measure();
      target = Math.min(height + 2, Math.max(reached, innerHeight - host.getBoundingClientRect().top + 48));
      settle();
    };
    try { travel(first); first = false; } catch { recover(); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
      const rect = host.getBoundingClientRect();
      if (Math.abs(rect.width - width) > 1 || Math.abs(rect.height - height) > 1) onResize();
    }) : null;
    resizeObserver?.observe(host);
    return () => {
      disposed = true;
      stop();
      frame.style.clipPath = '';
      hideThread();
      resizeObserver?.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
    };
  }, [reduced]);

  return <div className="invitation-border-host" ref={hostRef} aria-hidden="true">
    <div className="outer-frame" ref={frameRef}>{children}</div>
    <svg className="invitation-thread" ref={svgRef} preserveAspectRatio="none">
      <g className="invitation-thread-glint"><path d="M-5 0H5 M0 -5V5" /><circle r="2" /></g>
      <path className="invitation-thread-stroke" />
      <path className="invitation-thread-stroke" />
      <circle className="invitation-thread-tip" r="1.8" />
      <circle className="invitation-thread-tip" r="1.8" />
    </svg>
  </div>;
}
