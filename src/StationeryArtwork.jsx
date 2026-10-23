import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/** Reuses the transparent source as both artwork and gold silhouette mask. */
export default function StationeryArtwork({ src, alt }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const node = ref.current;
    if (reduced || !node.animate) return;
    let observer;
    const animations = [];
    const run = () => {
      observer?.disconnect();
      try {
        const image = node.querySelector('img');
        const gold = node.querySelector('.art-gold');
        const frames = [
          { '--art-radius': '0%', opacity: .1 },
          { '--art-radius': '75%', opacity: 1, offset: .6 },
          { '--art-radius': '150%', opacity: 1 },
        ];
        animations.push(image.animate(frames, { duration: 1250, easing: 'ease-out' }));
        animations.push(gold.animate([{ opacity: 0 }, { opacity: .45, offset: .25 }, { opacity: 0 }], { duration: 1250 }));
        node.querySelectorAll('.art-fleck').forEach((fleck, i) => {
          const angle = i * 2.399;
          const x = Math.cos(angle) * 55;
          const y = Math.sin(angle) * 65;
          animations.push(fleck.animate([
            { transform: `translate(${x * .3}px,${y * .3}px)`, opacity: 0 },
            { transform: `translate(${x}px,${y}px)`, opacity: .6, offset: .55 },
            { transform: `translate(${x * 1.1}px,${y * 1.1 + 4}px)`, opacity: 0 },
          ], { duration: 1100, delay: i * 8 }));
        });
        animations.forEach(animation => animation.finished.catch(() => {}));
      } catch { animations.forEach(animation => animation.cancel()); }
    };
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) run(); }, { rootMargin: '60px' });
      observer.observe(node);
    }
    return () => { observer?.disconnect(); animations.forEach(animation => animation.cancel()); };
  }, [reduced, src]);
  return <div ref={ref} className="divine-art-stage stationery-art">
    <img className="divine-art" width="1150" height="1367" src={src} alt={alt} decoding="async" />
    <span className="art-gold" style={{ maskImage: `url("${src}")` }} aria-hidden="true" />
    {Array.from({ length: 12 }, (_, i) => <span className="art-fleck" key={i} aria-hidden="true" />)}
  </div>;
}
