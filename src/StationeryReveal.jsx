import { useEffect, useRef } from 'react';

import { useReducedMotion } from 'framer-motion';

// The DOM is visible by default. Only a successfully created animation can hide it.
export function useOnceReveal(ref, frames, options = {}) {
  const reduced = useReducedMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || !node.animate) return;
    if (node.closest(".invitation-section") && node.hasAttribute("data-diary-text-group")) return;
    let animation;
    let observer;
    const settle = () => animation?.cancel();
    const run = () => {
      observer?.disconnect();
      try {
        animation = node.animate(frames, { duration: 700, easing: 'ease-out', ...options });
        animation.finished.catch(() => {});
      } catch { settle(); }
    };
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) run();
      }, { rootMargin: '0px 0px 60px 0px', threshold: 0 });
      observer.observe(node);
    } else run();
    node.addEventListener('focusin', settle);
    return () => { observer?.disconnect(); settle(); node.removeEventListener('focusin', settle); };
  }, [reduced]);
}

export function InkReveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useOnceReveal(ref, [{ opacity: .18 }, { opacity: 1 }], { duration: 650 + delay * 1000 });
  return <div ref={ref} className={className} data-diary-text-group>{children}</div>;
}

export function EventDay({ event }) {
  return <span className="event-day">{event.day}</span>;
}

export function BorderReveal({ children, className }) {
  const ref = useRef(null);
  useOnceReveal(ref, [{ clipPath: 'inset(0 50% 100% 50%)', opacity: .2 }, { clipPath: 'inset(0 0 0 0)', opacity: 1 }], { duration: 950 });
  return <span ref={ref} className={className}>{children}</span>;
}

export function ClosingDivider({ children }) {
  const ref = useRef(null);
  useOnceReveal(ref, [{ opacity: .55 }, { opacity: 1, offset: .45 }, { opacity: .8, offset: .7 }, { opacity: 1 }], { duration: 900 });
  return <div ref={ref} className="love-divider" aria-hidden="true">{children}</div>;
}
