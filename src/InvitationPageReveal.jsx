import { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// Reveal real DOM text: wrapping, selection, links and screen-reader order stay intact.
const TEXT = ".family-label, .family-names, .family-address, .invite-header > p, .couple-names h2, .and-line, .event-day, .event-weekday, .event-month-year, .event-time-label, .event-time, .venue-name, .map-link, .other-event-note, .presence-note, .with-love-note";
const MASK = "linear-gradient(105deg, #000 0%, #000 42%, transparent 58%, transparent 100%)";

export default function InvitationPageReveal({ active = true, onArtworkStart }) {
  const marker = useRef(null);
  const reduced = useReducedMotion();
  const callback = useRef(onArtworkStart);
  callback.current = onArtworkStart;

  useLayoutEffect(() => {
    if (active) callback.current?.();
    const section = marker.current?.closest(".invitation-section");
    if (!section || reduced) return;
    const animations = new Map();
    let observer;
    const finish = (node) => {
      animations.get(node)?.cancel();
      animations.delete(node);
      observer?.unobserve(node);
    };
    const reveal = (node, delay = 0) => {
      const animation = animations.get(node);
      if (!animation || animation.playState !== "paused") return;
      animation.effect.updateTiming({ delay });
      animation.play();
      animation.finished.then(() => finish(node), () => {});
      observer?.unobserve(node);
    };
    try {
      if (!("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver(entries => {
        let order = 0;
        for (const entry of entries) {
          if (entry.isIntersecting) reveal(entry.target, Math.min(order++ * 130, 650));
        }
      }, { threshold: 0, rootMargin: "0px 0px -16px 0px" });
      for (const node of section.querySelectorAll(TEXT)) {
        if (!node.animate) continue;
        const animation = node.animate([
          { maskPosition: "100% 0", opacity: 0, filter: "blur(2px)", offset: 0 },
          { maskPosition: "72% 0", opacity: .65, filter: "blur(1px)", offset: .3 },
          { maskPosition: "0% 0", opacity: 1, filter: "blur(0px)", offset: 1 },
        ].map(frame => ({ ...frame, maskImage: MASK, maskSize: "300% 100%", maskRepeat: "no-repeat" })), {
          duration: node.matches("h2") ? 2400 : 1800,
          easing: "cubic-bezier(.22,.61,.36,1)", fill: "both",
        });
        animation.pause();
        animation.currentTime = 0;
        animations.set(node, animation);
        // Prepare concealed text before the handoff exposes the paper.
        // Start observing only after the artwork has settled.
        if (active) observer.observe(node);
      }
    } catch {
      // Animation support must never prevent a guest reading the invitation.
      observer?.disconnect();
      for (const animation of animations.values()) animation.cancel();
      animations.clear();
    }
    const focus = event => {
      for (const node of animations.keys()) {
        if (node === event.target || node.contains(event.target)) finish(node);
      }
    };
    section.addEventListener("focusin", focus);
    return () => {
      observer?.disconnect();
      for (const animation of animations.values()) animation.cancel();
      section.removeEventListener("focusin", focus);
    };
  }, [active, reduced]);

  return <span ref={marker} aria-hidden="true" hidden />;
}
