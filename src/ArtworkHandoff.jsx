import { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useReducedMotion } from 'framer-motion';
import { assetUrl } from './assets';

/** Shares the envelope's completion promise; all paths establish the final page first. */
export default function ArtworkHandoff({ bounds, onDone }) {
  const sceneRef = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const scene = sceneRef.current;
    const paper = scene.querySelector('.handoff-paper');
    const art = scene.querySelector('.handoff-art');
    const image = art.querySelector('img');
    const page = document.querySelector('.invitation-prepared');
    const destination = page?.querySelector('.divine-art');
    const intro = document.querySelector('.intro-screen');
    const animations = [];
    let disposed = false;
    let completed = false;
    let readinessTimer;
    const run = (node, frames, duration, extra = {}) => {
      if (disposed || completed) throw Error('Transition finished');
      const animation = node.animate(frames, { duration, fill: 'forwards', easing: 'cubic-bezier(.22,.75,.28,1)', ...extra });
      animations.push(animation);
      return animation.finished;
    };
    const finish = () => {
      if (disposed || completed) return;
      completed = true;
      // Commit visible content before hiding the overlay or cancelling its animations.
      if (destination) destination.style.visibility = '';
      if (page) { page.style.visibility = 'visible'; page.style.opacity = '1'; page.inert = false; }
      scene.style.visibility = 'hidden';
      doneRef.current();
    };
    const skipKey = event => {
      if (['Tab', 'Enter', ' ', 'Escape', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key)) finish();
    };
    const events = ['wheel', 'touchstart', 'pointerdown', 'resize', 'orientationchange'];
    events.forEach(name => window.addEventListener(name, finish, { passive: true }));
    window.addEventListener('keydown', skipKey);
    window.visualViewport?.addEventListener('resize', finish);
    const watchdog = setTimeout(finish, 4200);
    async function play() {
      try {
        if (!page || !destination || reduced) { finish(); return; }
        page.inert = true;
        destination.style.visibility = 'hidden';
        // React commits sibling image sources after this layout effect; decode after that commit.
        const ready = Promise.resolve().then(() => Promise.all([document.fonts?.ready, image.decode(), destination.decode()]));
        const prepared = await Promise.race([
          ready.then(() => true),
          new Promise(resolve => { readinessTimer = setTimeout(() => resolve(false), 700); }),
        ]);
        clearTimeout(readinessTimer);
        if (disposed || completed) return;
        if (!prepared || !image.naturalWidth) { finish(); return; }
        const { left, top, width, height } = bounds;
        await run(paper, [
          { clipPath: `inset(${Math.max(0,top)}px ${Math.max(0,innerWidth-left-width)}px ${Math.max(0,innerHeight-top-height)}px ${Math.max(0,left)}px)` },
          { clipPath: 'inset(0px)' },
        ], 300);
        scene.dataset.phase = 'reveal';
        art.style.visibility = 'visible';
        const flecks = [...art.querySelectorAll('.art-fleck')];
        flecks.forEach((fleck, i) => {
          const angle = i * 2.399;
          const x = Math.cos(angle) * 80, y = Math.sin(angle) * 90;
          run(fleck, [
            { transform: `translate(${x}px,${y}px)`, opacity: 0 },
            { opacity: .65, offset: .25 },
            { transform: `translate(${x*.25}px,${y*.25}px)`, opacity: 0 },
          ], 1050, { delay: i * 14 }).catch(() => {});
        });
        run(art.querySelector('.art-gold'), [{ opacity: 0 }, { opacity: .3, offset: .3 }, { opacity: 0 }], 1350).catch(() => {});
        await run(image, [
          { '--art-radius': '0%', opacity: .08 },
          { '--art-radius': '78%', opacity: 1, offset: .65 },
          { '--art-radius': '150%', opacity: 1 },
        ], 1350);
        await run(image, [{ opacity: 1 }, { opacity: 1 }], 180);
        if (disposed || completed) return;
        const from = art.getBoundingClientRect();
        const to = destination.getBoundingClientRect();
        if (![from.width, from.height, to.width, to.height].every(n => n > 0 && Number.isFinite(n))) { finish(); return; }
        const nearby = to.top >= 0 && to.bottom <= innerHeight && Math.abs(to.top-from.top) < innerHeight*.55;
        scene.dataset.destination = nearby ? 'near' : 'below';
        scene.dataset.phase = 'settling';
        if (intro) intro.style.visibility = 'hidden';
        page.style.visibility = 'visible';
        const fade = run(page, [{ opacity: 0 }, { opacity: 1 }], 700);
        // The opaque paper fades while typography stays at its final responsive geometry.
        const paperFade = run(paper, [{ opacity: 1 }, { opacity: 0 }], 650);
        const text = [...page.querySelectorAll('.invite-header, .couple-names > div')];
        text.forEach((node, i) => run(node, [{ opacity: .15 }, { opacity: 1 }], 480, { delay: i*45 }).catch(() => {}));

        await Promise.all([fade, paperFade, run(art, [
          { transform: 'translate(0px,0px) scale(1)', opacity: 1 },
          nearby
            ? { transform: `translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width})`, opacity: 1 }
            : { transform: 'translate(0px,18px) scale(.94)', opacity: 0 },
        ], 700)]);
        finish();
      } catch { finish(); }
    }
    play();
    return () => {
      disposed = true;
      clearTimeout(watchdog);
      clearTimeout(readinessTimer);
      animations.forEach(animation => animation.cancel());
      events.forEach(name => window.removeEventListener(name, finish));
      window.removeEventListener('keydown', skipKey);
      window.visualViewport?.removeEventListener('resize', finish);
      if (destination) destination.style.visibility = '';
      if (intro) intro.style.visibility = '';
      if (page) { page.style.visibility = ''; page.style.opacity = ''; page.inert = false; }
    };
  }, [reduced]);
  const src = assetUrl('radha-krishna-silhouette.png');
  return createPortal(<div className="artwork-handoff" ref={sceneRef} aria-hidden="true" data-phase="paper">
    <div className="handoff-paper paper-section" style={{ clipPath: `inset(${Math.max(0,bounds.top)}px ${Math.max(0,innerWidth-bounds.left-bounds.width)}px ${Math.max(0,innerHeight-bounds.top-bounds.height)}px ${Math.max(0,bounds.left)}px)` }} />
    <div className="handoff-art stationery-art">
      <img className="divine-art" src={src} width="1150" height="1367" alt="" />
      <span className="art-gold" style={{ maskImage: `url("${src}")` }} />
      {Array.from({ length: 12 }, (_, i) => <span className="art-fleck" key={i} />)}
    </div>
  </div>, document.body);
}
