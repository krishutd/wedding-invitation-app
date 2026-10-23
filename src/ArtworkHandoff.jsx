import { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useReducedMotion } from 'framer-motion';
import { createGoldenFormation } from './goldenFormation';
import { assetUrl } from './assets';

/** One timeline, measured from the opening seam to the real invitation artwork. */
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
    const border = page?.querySelector('.invitation-border-host');
    const animations = [];
    let disposed = false, completed = false, readinessTimer, glitterFrame = 0, formation;
    const run = (node, frames, duration, extra = {}) => {
      if (disposed || completed) throw Error('Transition finished');
      const animation = node.animate(frames, { duration, fill: 'both', easing: 'cubic-bezier(.42,0,.22,1)', ...extra });
      animations.push(animation);
      return animation.finished;
    };
    const finish = () => {
      if (disposed || completed) return;
      completed = true;
      if (border) border.style.clipPath = '';
      if (destination) destination.style.visibility = '';
      if (page) { page.style.visibility = 'visible'; page.style.opacity = '1'; page.inert = false; }
      scene.style.visibility = 'hidden';
      doneRef.current();
    };
    const skipKey = event => {
      if (['Tab','Enter',' ','Escape','ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(event.key)) finish();
    };
    const events = ['wheel','touchstart','pointerdown','resize','orientationchange'];
    events.forEach(name => window.addEventListener(name, finish, { passive: true }));
    window.addEventListener('keydown', skipKey);
    window.visualViewport?.addEventListener('resize', finish);
    const watchdog = setTimeout(finish, 10000);
    const threads = [...scene.querySelectorAll('.story-thread')];
    const drawThread = (path, d, duration, delay = 0) => {
      path.setAttribute('d', d);
      const tip = document.createElement('span');
      tip.className = 'thread-tip';
      tip.style.offsetPath = 'path(' + JSON.stringify(d) + ')';
      scene.append(tip);
      run(tip, [{offsetDistance:'0%',opacity:0},{offsetDistance:'18%',opacity:1,offset:.18},{offsetDistance:'100%',opacity:1,offset:.86},{offsetDistance:'100%',opacity:0}],duration,{delay}).catch(() => {});
      return run(path, [
        { strokeDashoffset: 1.22, opacity: 0 },
        { strokeDashoffset: .88, opacity: 1, offset: .18 },
        { strokeDashoffset: 0, opacity: 1, offset: .86 },
        { strokeDashoffset: -.18, opacity: 0 },
      ], duration, { delay });
    };
    async function play() {
      try {
        if (!page || !destination || reduced) { finish(); return; }
        page.inert = true;
        border.style.clipPath = 'inset(0 50% 100% 50%)';
        destination.style.visibility = 'hidden';
        const ready = Promise.resolve().then(() => Promise.all([document.fonts?.ready, image.decode(), destination.decode()]));
        const prepared = await Promise.race([ready.then(() => true), new Promise(resolve => { readinessTimer = setTimeout(() => resolve(false), 700); })]);
        clearTimeout(readinessTimer);
        if (disposed || completed) return;
        if (!prepared || !image.naturalWidth) { finish(); return; }
        const from = art.getBoundingClientRect();
        const mx=from.left+from.width/2, my=from.top+from.height/2;
        const radius=Math.min(Math.hypot(from.width,from.height)*.51,innerWidth*.44,innerHeight*.36);
        const sx=bounds.left+bounds.width/2, sy=bounds.top+bounds.height*.08;
        const seam=scene.querySelector('.living-seam');
        Object.assign(seam.style,{left:bounds.left+bounds.width*.1+'px',top:bounds.top+'px',width:bounds.width*.8+'px'});
        scene.dataset.phase='threads';
        await Promise.all([
          run(seam,[{opacity:0},{opacity:.8,offset:.3},{opacity:0}],1000),
          run(paper,[{opacity:0},{opacity:1}],1000),
          drawThread(threads[0],`M${sx} ${sy} C${sx-40} ${sy-65} ${mx-radius} ${my+radius} ${mx} ${my+radius}`,1000),
        ]);
        // One orbit and the forming artwork share the same timeline.
        const circle=`M${mx} ${my+radius} A${radius} ${radius} 0 1 1 ${mx} ${my-radius} A${radius} ${radius} 0 1 1 ${mx} ${my+radius}`;
        const ring=scene.querySelector('.portal-ring'),orbit=scene.querySelector('.portal-orbit');
        ring.setAttribute('d',circle);orbit.setAttribute('d',circle);
        const ringMotion=run(ring,[{strokeDashoffset:1,opacity:0},{strokeDashoffset:0,opacity:.65,offset:.45},{strokeDashoffset:0,opacity:.5}],3200,{easing:'linear'});
        const orbitMotion=run(orbit,[{strokeDashoffset:0,opacity:0},{opacity:1,offset:.08},{strokeDashoffset:-2,opacity:1}],3200,{easing:'linear'});
        for(let i=0;i<80;i++){
          const angle=Math.PI/2+i/80*Math.PI*4;
          const dust=document.createElement('span');dust.className='portal-dust';
          Object.assign(dust.style,{left:mx+Math.cos(angle)*radius+'px',top:my+Math.sin(angle)*radius+'px'});
          scene.append(dust);
          run(dust,[{opacity:0,transform:'translate(0,0)'},{opacity:.8,offset:.2},{opacity:0,transform:`translate(${-Math.cos(angle)*18}px,${-Math.sin(angle)*18+8}px)`}],700,{delay:i*31}).catch(()=>{});
        }
        scene.dataset.phase = 'reveal';
        art.style.visibility = 'visible';
        const canvas = art.querySelector('canvas');
        formation = createGoldenFormation(canvas, image);
        image.style.visibility = 'hidden';
        const clock = canvas.animate([{opacity:1},{opacity:1}], {duration:3000,fill:'forwards'});
        animations.push(clock);
        const draw = () => {
          if (disposed || completed) return;
          try {
            formation.draw(Math.min(1, Number(clock.currentTime || 0)/clock.effect.getTiming().duration));
            if (clock.playState !== 'finished') glitterFrame = requestAnimationFrame(draw);
          } catch { finish(); }
        };
        draw();
        await Promise.all([clock.finished, ringMotion, orbitMotion]);
        cancelAnimationFrame(glitterFrame);
        image.style.visibility = 'visible';
        formation.dispose();
        canvas.style.visibility = 'hidden';
        if (disposed || completed) return;
        const to = destination.getBoundingClientRect();
        if (![from.width,from.height,to.width,to.height].every(n => n>0 && Number.isFinite(n))) { finish(); return; }
        scene.dataset.destination = to.top>=0 && to.bottom<=innerHeight && Math.abs(to.top-from.top)<innerHeight*.55 ? 'near' : 'below';
        scene.dataset.phase = 'settling';
        if (intro) intro.style.visibility = 'hidden';
        page.style.visibility = 'visible';
        const frame=border.getBoundingClientRect();
        const left=frame.left,right=frame.right,top=frame.top,bottom=frame.bottom;
        const duration=2400;
        const joinY=Math.max(top+2,Math.min(bottom-2,my));
        // Leave the circle directly sideways before any wording is exposed.
        // Each strand then follows half the perimeter; neither crosses the page interior.
        const flourishes=[run(ring,[{opacity:.5},{opacity:0}],400),run(orbit,[{opacity:1},{opacity:0}],400)];
        const paths=[
          `M${left} ${joinY} V${top} H${right} V${joinY}`,
          `M${right} ${joinY} V${bottom} H${left} V${joinY}`,
        ];
        paths.forEach((d,i)=>{
          const edge=i?right:left;
          const approach=document.createElementNS('http://www.w3.org/2000/svg','path');
          approach.setAttribute('pathLength','1');approach.setAttribute('class','story-thread');
          scene.querySelector('.story-light').append(approach);
          flourishes.push(drawThread(approach,`M${mx+(i?radius:-radius)} ${my} L${edge} ${joinY}`,400));
          const path=threads[i+1];path.setAttribute('d',d);path.style.strokeDasharray='1 1';
          flourishes.push(run(path,[{strokeDashoffset:1,opacity:1},{strokeDashoffset:0,opacity:1}],2000,{delay:400,easing:'linear'}));
          const tip=document.createElement('span');tip.className='thread-tip';tip.style.offsetPath='path('+JSON.stringify(d)+')';scene.append(tip);
          flourishes.push(run(tip,[{offsetDistance:'0%',opacity:1},{offsetDistance:'100%',opacity:1}],2000,{delay:400,easing:'linear'}));
        });
        // Only the traced strokes are visible until the perimeter is complete.
        // The original double-line frame then takes over without a moving mask jump.
        border.style.clipPath='';
        flourishes.push(run(border,[{opacity:0},{opacity:0,offset:.90},{opacity:1}],duration,{easing:'linear'}));
        const text=[...page.querySelectorAll('.couple-names, .invite-header')];
        text.forEach((node,i)=>flourishes.push(run(node,[{opacity:0},{opacity:1}],700,{delay:500+i*100})));
        await Promise.all([...flourishes,
          run(page,[{opacity:0},{opacity:1}],700,{delay:400}),
          run(paper,[{opacity:1},{opacity:0}],850,{delay:400}),
          // Even a below-fold destination uses the same continuous image movement.
          run(art,[{transform:'translate(0px,0px) scale(1)'},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width})`}],duration),
        ]);
        finish();
      } catch { finish(); }
    }
    play();
    return () => {
      disposed = true;
      cancelAnimationFrame(glitterFrame); formation?.dispose();
      clearTimeout(watchdog); clearTimeout(readinessTimer);
      animations.forEach(animation => animation.cancel());
      events.forEach(name => window.removeEventListener(name, finish));
      window.removeEventListener('keydown', skipKey);
      window.visualViewport?.removeEventListener('resize', finish);
      if (border) border.style.clipPath = '';
      if (destination) destination.style.visibility = '';
      if (intro) intro.style.visibility = '';
      if (page) {page.style.visibility='';page.style.opacity='';page.inert=false;}
    };
  }, [reduced]);
  const src = assetUrl('radha-krishna-silhouette.png');
  return createPortal(<div className="artwork-handoff" ref={sceneRef} aria-hidden="true" data-phase="seam">
    <div className="handoff-paper paper-section" />
    <span className="living-seam" />
    <div className="handoff-art stationery-art">
      <img className="divine-art" src={src} width="1150" height="1367" alt="" />
      <span className="art-gold" style={{maskImage:`url("${src}")`}} />
      <canvas className="formation-glitter" aria-hidden="true" />
    </div>
    <svg className="story-light" aria-hidden="true">
      <path className="portal-ring" pathLength="1" />
      <path className="portal-orbit" pathLength="1" />
      {[0,1,2].map(i => <path key={i} className="story-thread" pathLength="1" />)}
    </svg>

  </div>, document.body);
}
