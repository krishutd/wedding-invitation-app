import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const REVEAL_MS = 4800;
const DUST_COUNT = 150;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const randomBetween = (min, max) => min + Math.random() * (max - min);

/** A short gold-dust sweep that reveals the invitation card once on entry. */
export default function InvitationPageReveal({ artworkTriggerRef, onArtworkStart, skipInitialReveal = false }) {
  const layerRef = useRef(null);
  const veilRef = useRef(null);
  const canvasRef = useRef(null);
  const onArtworkStartRef = useRef(onArtworkStart);
  const artworkStartedRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const [complete, setComplete] = useState(skipInitialReveal);
  onArtworkStartRef.current = onArtworkStart;

  useEffect(() => {
    let frameId = 0;
    let cancelled = false;
    let completed = false;
    const startArtwork = () => {
      if (artworkStartedRef.current) return;
      artworkStartedRef.current = true;
      onArtworkStartRef.current?.();
    };

    const finish = () => {
      if (completed || cancelled) return;
      completed = true;
      setComplete(true);
      startArtwork();
    };

    if (prefersReducedMotion || skipInitialReveal) {
      finish();
      return undefined;
    }

    const layer = layerRef.current;
    const veil = veilRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!layer || !veil || !canvas || !context) {
      finish();
      return undefined;
    }

    const bounds = layer.getBoundingClientRect();
    const width = Math.max(1, bounds.width);
    const height = Math.max(1, bounds.height);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const particles = Array.from({ length: DUST_COUNT }, () => {
      const targetY = randomBetween(0, height);
      const crossingTime = (targetY / height) * REVEAL_MS;
      return {
        x: randomBetween(-8, width + 8),
        targetY,
        startY: targetY - randomBetween(24, 100),
        startTime: Math.max(0, crossingTime - randomBetween(350, 700)),
        duration: randomBetween(330, 600),
        drift: randomBetween(-9, 9),
        size: randomBetween(0.55, 1.55),
        opacity: randomBetween(0.3, 0.78),
        sparkle: Math.random() > 0.76,
      };
    });

    const startedAt = performance.now();
    const drawFrame = (now) => {
      if (cancelled) return;
      const elapsed = now - startedAt;
      const progress = clamp(elapsed / REVEAL_MS);
      veil.style.clipPath = `inset(${progress * 100}% 0 0 0)`;

      const marker = artworkTriggerRef?.current;
      if (!artworkStartedRef.current && marker) {
        const layerBounds = layer.getBoundingClientRect();
        const markerBounds = marker.getBoundingClientRect();
        const markerProgress = clamp((markerBounds.top - layerBounds.top) / Math.max(1, layerBounds.height));
        if (progress >= markerProgress) startArtwork();
      }

      context.clearRect(0, 0, width, height);
      context.save();
      context.globalCompositeOperation = "lighter";

      for (const particle of particles) {
        const rawProgress = clamp((elapsed - particle.startTime) / particle.duration);
        if (rawProgress <= 0) continue;
        const localProgress = 1 - (1 - rawProgress) ** 3;
        const settle = clamp((elapsed - particle.startTime - particle.duration + 160) / 480);
        const x = particle.x + Math.sin(elapsed / 320 + particle.targetY) * 2.2 + particle.drift * (1 - localProgress);
        const y = particle.startY + (particle.targetY - particle.startY) * localProgress;
        const alpha = particle.opacity * (1 - settle);

        context.fillStyle = `rgba(157, 116, 47, ${alpha})`;
        context.beginPath();
        context.arc(x, y, particle.size, 0, Math.PI * 2);
        context.fill();

        if (particle.sparkle && alpha > 0.08) {
          context.strokeStyle = `rgba(197, 160, 86, ${alpha * 0.72})`;
          context.lineWidth = 0.55;
          context.beginPath();
          context.moveTo(x - 2, y);
          context.lineTo(x + 2, y);
          context.moveTo(x, y - 2);
          context.lineTo(x, y + 2);
          context.stroke();
        }
      }

      context.restore();
      if (elapsed < REVEAL_MS) {
        frameId = window.requestAnimationFrame(drawFrame);
      } else {
        veil.style.clipPath = "inset(0 0 100% 0)";
        finish();
      }
    };

    frameId = window.requestAnimationFrame(drawFrame);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
    };
  }, [artworkTriggerRef, prefersReducedMotion, skipInitialReveal]);

  return (
    <div
      className={`invitation-glitter-layer${complete ? " is-complete" : ""}`}
      ref={layerRef}
      aria-hidden="true"
    >
      <div className="invitation-glitter-veil paper-section" ref={veilRef} />
      <canvas className="invitation-glitter-canvas" ref={canvasRef} />
    </div>
  );
}
