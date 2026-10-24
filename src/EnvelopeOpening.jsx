import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { eventDate, formatEvent } from "./events";

import { chooseDate, ORGANIC_LOOP } from "./threadChoosesDate.js";
const TRAIL_SEGMENTS = 24;
const SEAL_RELEASE_MS = 700;
const FLAP_OPEN_MS = 1000;
const FLOW_EASING = "ease-in-out";
import { assetUrl as asset } from "./assets.js";

export default function EnvelopeOpening({
  side = "groom",
  event,
  ready,
  onActivate,
  onFinish,
  onPaper,
}) {
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
  const [stage, setStage] = useState("sealed");
  const [thread, setThread] = useState("");
  const names = side === "bride"
    ? "ആർച്ച & കൃഷ്ണാനന്ദ്"
    : "കൃഷ്ണാനന്ദ് & ആർച്ച";

  function animate(node, frames, duration, extra = {}) {
    const animation = node.animate(frames, {
      duration,
      fill: "forwards",
      easing: "cubic-bezier(.22,.75,.28,1)",
      ...extra,
    });
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
      const startAngle = (-65 * Math.PI) / 180;
      const endAngle = (245 * Math.PI) / 180;
      const startX = x + radius * Math.cos(startAngle);
      const startY = y + radius * Math.sin(startAngle);
      const endX = x + radius * Math.cos(endAngle);
      const endY = y + radius * Math.sin(endAngle);
      const controlX = endX - Math.sin(endAngle) * radius * 1.4;
      const controlY = endY + Math.cos(endAngle) * radius * 1.4;
      setThread(
        `M${startX} ${startY} A${radius} ${radius} 0 1 1 ${endX} ${endY} C${controlX} ${controlY} ${tx - 55} ${ty + 45} ${tx} ${ty}`,
      );
    }
    if (ready) measure();
    window.addEventListener("resize", resize);
    window.visualViewport?.addEventListener("resize", resize);
    return () => {
      mounted.current = false;
      clearTimeout(watchdog.current);
      animations.current.forEach((animation) => animation.cancel());
      animations.current.clear();
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
    };
  }, [ready]);

  async function open() {
    if (!ready || active.current) return;
    active.current = true;
    onActivate(); // Keep audio.play() in the native user-activation call stack.
    watchdog.current = setTimeout(finish, 22000);
    setStage("drawing");
    try {
      if (reduced || !ready) {
        await animate(root.current, [{ opacity: 1 }, { opacity: 0 }], 200)
          .finished;
        finish();
        return;
      }
      await chooseDate({
        root: root.current, strand: strand.current,
        loop: heartPath.current, seal: seal.current, animate, setStage,
      });
      setStage("release");
      animate(
        root.current.querySelector(".seal-ripple"),
        [
          { transform: "scale(.65)", opacity: 0.65 },
          { transform: "scale(1.65)", opacity: 0 },
        ],
        SEAL_RELEASE_MS,
      );
      await animate(
        seal.current,
        [
          { transform: "translateY(0)", opacity: 1 },
          { transform: "translateY(-18px) rotate(-8deg)", opacity: 0 },
        ],
        SEAL_RELEASE_MS,
        { easing: FLOW_EASING },
      ).finished;
      setStage("flap");
      const flap = root.current.querySelector(".envelope-flap");
      // Change stacking only while the paper is edge-on, not after it has opened.
      // Both faces rotate on one hinge, avoiding a mirrored front surface on the reverse side.
      const flapMotion = animate(
        flap,
        [
          { transform: "rotateX(0deg)", zIndex: 4, offset: 0 },
          { transform: "rotateX(-90deg)", zIndex: 4, offset: 0.5 },
          { transform: "rotateX(-90.018deg)", zIndex: 0, offset: 0.5001 },
          { transform: "rotateX(-180deg)", zIndex: 0, offset: 1 },
        ],
        FLAP_OPEN_MS,
        { easing: "cubic-bezier(.42,0,.58,1)" },
      ).finished;
      // Release the light while the flap is still moving, from its actual seam.
      const envelopeBounds = root.current
        .querySelector(".envelope")
        .getBoundingClientRect();
      await Promise.all([
        flapMotion,
        onPaper?.({
          left: envelopeBounds.left,
          top: envelopeBounds.top,
          width: envelopeBounds.width,
          height: envelopeBounds.height,
        }),
      ]);
      finish();
    } catch {
      finish();
    }
  }

  return (
    <div
      className="opening-composition"
      ref={root}
      data-stage={stage}
      aria-busy={!ready}
    >
      <div className="envelope-heading">
        <span className="envelope-couple-names envelope-name-malayalam" lang="ml">{names}</span>
      </div>
      <div
        className="date-motif"
        role="img"
        aria-label={formatEvent(event, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      >
        <div className="date-month" aria-hidden="true">
          <span className="date-month-name">{formatEvent(event, { month: "long" })}</span>
          <span className="date-year">{formatEvent(event, { year: "numeric" })}</span>
        </div>
        <div className="date-row" aria-hidden="true">
          {[-2, -1, 0, 1, 2].map((offset) =>
            offset ? (
              <span className="date-neighbour" key={offset}>
                {eventDate(event, offset).getUTCDate()}
              </span>
            ) : (
              <span className="date-selected" ref={selected} key={0}>
                <svg viewBox="0 0 48 46">
                  <path
                    ref={heartPath}
                    d={ORGANIC_LOOP}
                    pathLength="1"
                    style={{ strokeDashoffset: reduced ? 0 : 1, opacity: reduced ? 1 : 0 }}
                  />
                </svg>
                <span>{event.day}</span>
              </span>
            ),
          )}
        </div>
      </div>
      <svg className="date-thread" ref={trail} aria-hidden="true">
        <path ref={strand} d={thread} pathLength="1" style={{ opacity: 0 }} />
        {Array.from({ length: TRAIL_SEGMENTS }, (_, index) => (
          <path
            className="thread-trail"
            key={index}
            d={thread}
            pathLength="1"
          />
        ))}
        <path className="thread-tug" pathLength="1" />
      </svg>
      <button
        type="button"
        className="envelope-stage"
        onClick={open}
        disabled={!ready}
        aria-disabled={!ready || stage !== "sealed"}
        aria-label={`Open the ${event.label} invitation`}
      >
        <div className="envelope" aria-hidden="true">
          <div className="envelope-back" />
          <div className="envelope-letter paper-section" ref={letter}>
            <span className="letter-message">You're cordially invited</span>
            <span className="letter-rule" />
          </div>
          <div className="envelope-flap">
            <div className="envelope-flap-face envelope-flap-outer" />
            <div className="envelope-flap-face envelope-flap-inner" />
          </div>
          <div className="envelope-front">
            <div className="envelope-fold left-fold" />
            <div className="envelope-fold right-fold" />
            <div className="envelope-fold bottom-fold" />
          </div>
          <div className="seal-ripple" />
          <div className="wax-seal" ref={seal}>
            <img
              className="wax-seal-texture"
              src={asset("wax-seal-texture.webp")}
              alt=""
              draggable="false"
            />
            <img
              className="wax-seal-ganesha"
              src={asset("ganesha-seal-engraving.webp")}
              alt=""
              draggable="false"
            />
          </div>
        </div>
      </button>
      <span className="opening-hint" aria-hidden="true">
        Tap to open
      </span>
    </div>
  );
}
