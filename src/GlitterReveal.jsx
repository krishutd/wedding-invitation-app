import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const ANIMATION_MS = 8000;
const PARTICLE_COUNT = 210;
const easeOut = (value) => 1 - (1 - value) ** 3;
const randomBetween = (min, max) => min + Math.random() * (max - min);

/** A one-time, image-aware glitter reveal for transparent artwork. */
export default function GlitterReveal({ src, alt, start = true }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const entered = useInView(stageRef, { once: true, amount: 0.18 });
  const prefersReducedMotion = useReducedMotion();
  const [finished, setFinished] = useState(false);
  const showStatic = finished || prefersReducedMotion;

  useEffect(() => {
    if (!start || !entered) return undefined;

    if (prefersReducedMotion) {
      setFinished(true);
      return undefined;
    }

    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !stage || !context) {
      setFinished(true);
      return undefined;
    }

    let frameId = 0;
    let cancelled = false;
    const artwork = new Image();
    artwork.decoding = "async";

    const revealArtwork = () => {
      if (cancelled) return;

      const bounds = stage.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = Math.max(1, Math.round(width));
      sampleCanvas.height = Math.max(1, Math.round(height));
      const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
      if (!sampleContext) {
        setFinished(true);
        return;
      }

      sampleContext.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
      sampleContext.drawImage(artwork, 0, 0, width, height);

      let pixels;
      try {
        pixels = sampleContext.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
      } catch {
        setFinished(true);
        return;
      }

      const opaquePoints = [];
      for (let y = 0; y < sampleCanvas.height; y += 2) {
        for (let x = 0; x < sampleCanvas.width; x += 2) {
          const alpha = pixels[(y * sampleCanvas.width + x) * 4 + 3];
          if (alpha > 48) opaquePoints.push({ x: x + Math.random() * 2, y: y + Math.random() * 2 });
        }
      }

      if (!opaquePoints.length) {
        setFinished(true);
        return;
      }

      const particles = Array.from({ length: PARTICLE_COUNT }, () => {
        const target = opaquePoints[Math.floor(Math.random() * opaquePoints.length)];
        return {
          x: Math.max(-16, Math.min(width + 16, target.x + randomBetween(-width * 0.26, width * 0.26))),
          y: randomBetween(-height * 0.5, Math.max(0, target.y - 14)),
          targetX: target.x,
          targetY: target.y,
          delay: randomBetween(267, 1067),
          duration: randomBetween(4067, 5067),
          size: randomBetween(0.55, 1.65),
          opacity: randomBetween(0.32, 0.86),
          drift: randomBetween(-12, 12),
          sparkle: Math.random() > 0.8,
        };
      });

      const startedAt = performance.now();
      const drawFrame = (now) => {
        if (cancelled) return;
        const elapsed = now - startedAt;
        context.clearRect(0, 0, width, height);

        const revealProgress = easeOut(Math.max(0, Math.min(1, (elapsed - 400) / 5400)));
        if (revealProgress > 0) {
          const radius = Math.hypot(width, height) * 0.58 * revealProgress;
          context.save();
          context.beginPath();
          context.ellipse(width / 2, height / 2, radius, radius, 0, 0, Math.PI * 2);
          context.clip();
          context.globalAlpha = Math.min(1, revealProgress * 1.2);
          context.drawImage(artwork, 0, 0, width, height);
          context.restore();
        }

        context.save();
        context.globalCompositeOperation = "lighter";
        for (const particle of particles) {
          const rawProgress = Math.max(0, Math.min(1, (elapsed - particle.delay) / particle.duration));
          if (rawProgress <= 0) continue;
          const progress = easeOut(rawProgress);
          const float = Math.sin((elapsed / 430) + particle.targetX) * (1 - progress);
          const x = particle.x + (particle.targetX - particle.x) * progress + float * 2 + particle.drift * (1 - progress);
          const y = particle.y + (particle.targetY - particle.y) * progress + float * 0.6;
          const settling = Math.max(0, Math.min(1, (elapsed - 6000) / 1800));
          const alpha = particle.opacity * (1 - settling);

          context.fillStyle = `rgba(157, 116, 47, ${alpha})`;
          context.beginPath();
          context.arc(x, y, particle.size * (1 - progress * 0.18), 0, Math.PI * 2);
          context.fill();

          if (particle.sparkle && alpha > 0.08) {
            context.strokeStyle = `rgba(197, 160, 86, ${alpha * 0.72})`;
            context.lineWidth = 0.55;
            context.beginPath();
            context.moveTo(x - 2.1, y);
            context.lineTo(x + 2.1, y);
            context.moveTo(x, y - 2.1);
            context.lineTo(x, y + 2.1);
            context.stroke();
          }
        }
        context.restore();

        if (elapsed < ANIMATION_MS) {
          frameId = window.requestAnimationFrame(drawFrame);
        } else {
          setFinished(true);
        }
      };

      frameId = window.requestAnimationFrame(drawFrame);
    };

    artwork.onload = revealArtwork;
    artwork.onerror = () => setFinished(true);
    artwork.src = src;

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      artwork.onload = null;
      artwork.onerror = null;
    };
  }, [entered, prefersReducedMotion, src, start]);

  return (
    <div className={`divine-art-stage${entered && start && !showStatic ? " is-animating" : ""}${showStatic ? " is-revealed" : ""}`} ref={stageRef}>
      <img
        className="divine-art"
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        onError={() => setFinished(true)}
      />
      <canvas className="divine-glitter-canvas" ref={canvasRef} aria-hidden="true" />
      <span className="divine-aura" aria-hidden="true" />
    </div>
  );
}
