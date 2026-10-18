import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import GlitterReveal from "./GlitterReveal.jsx";
import InvitationPageReveal from "./InvitationPageReveal.jsx";
import {
  MapPin,
  ArrowRight,
  Heart,
  ExternalLink,
} from "lucide-react";

const assetUrl = (path) => `${import.meta.env.BASE_URL}assets/${path}`;

const WEDDING = {
  groom: "Krishnanand",
  bride: "Archa",
  groomParents: "Mr. V K Pradeep Kumar & Mrs. Hena Pradeep",
  groomAddress: [
    "Vallomparambath Kuttiparambil (H),",
    "Kodungallur, Thrissur",
  ],
  brideParents: "Mr. Dileep Balan & Mrs. Manju Dileep",
  brideAddress: [
    "Dilland (Munduthoppil),",
    "Kadakkavoor P.O, Thiruvananthapuram",
  ],
  muhurthamTime: "12:10 PM – 12:30 PM",
  muhurthamVenue: "AL SAJ Convention Centre, Kizhakkottam, Trivandrum",
  receptionTime: "From 6:00 PM onwards",
  receptionVenue: "ARV Convention Centre, Kodungallur",
  mapsUrl: "https://maps.app.goo.gl/E2NiULxt7Lig8HKz7",
  receptionMapsUrl: "https://maps.app.goo.gl/ENAWgVa9UkHYyZqG7",
};

// Set to true to show the optional childhood-photo story page after opening the envelope.
const SHOW_STORY_PAGE = false;
const ENVELOPE_TURN_DURATION = 1.6;
const SEAL_DUST_DURATION = 750;
const SEAL_DISSOLVE_START_MS = 1000;
const FLAP_OPEN_START_MS = 1500;
const FLAP_OPEN_DURATION = 0.95;
const ENVELOPE_FADE_DURATION = 1.1;
const ENVELOPE_TURN_EASE = [0.65, 0, 0.35, 1];
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const randomBetween = (min, max) => min + Math.random() * (max - min);

function Reveal({ children, className = "", delay = 0, amount = 0.22 }) {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, amount });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: reduced ? 0 : 1.15,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}


function SealDustTransition({ sealRef, onComplete }) {
  const canvasRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    const bounds = sealRef.current?.getBoundingClientRect();
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !bounds?.width || !bounds?.height) {
      onCompleteRef.current?.();
      return undefined;
    }

    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();

    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const radiusX = bounds.width * 0.49;
    const radiusY = bounds.height * 0.49;
    const palette = ["#8c682d", "#a77e37", "#c2a15f", "#745326"];
    const particles = Array.from({ length: 190 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.sqrt(Math.random());
      return {
        x: centerX + Math.cos(angle) * distance * radiusX,
        y: centerY + Math.sin(angle) * distance * radiusY,
        drift: randomBetween(34, 68),
        sway: randomBetween(-7, 7),
        delay: randomBetween(0, 150),
        size: randomBetween(0.65, 1.45),
        opacity: randomBetween(0.2, 0.52),
        color: palette[Math.floor(Math.random() * palette.length)],
      };
    });

    let frame = 0;
    let startTime = 0;
    const draw = (time) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = clamp(elapsed / SEAL_DUST_DURATION);
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const particle of particles) {
        const localProgress = clamp((elapsed - particle.delay) / (SEAL_DUST_DURATION - particle.delay));
        if (localProgress <= 0) continue;
        const eased = localProgress * localProgress * (3 - 2 * localProgress);
        const x = particle.x - particle.drift * eased;
        const y = particle.y + Math.sin(localProgress * Math.PI) * particle.sway;
        const opacity = particle.opacity * (1 - localProgress) ** 1.25;
        context.globalAlpha = opacity;
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(x, y, particle.size * (1 - localProgress * 0.18), 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;

      if (progress < 1) {
        frame = window.requestAnimationFrame(draw);
      } else {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        onCompleteRef.current?.();
      }
    };

    window.addEventListener("resize", resize);
    frame = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [sealRef]);

  return <canvas ref={canvasRef} className="seal-dust-transition" aria-hidden="true" />;
}

function Envelope({ onOpen, onFlapOpen, onEnvelopeFadeComplete, openingPhase, envelopeRef, sealRef, turnScale }) {
  const opening = openingPhase !== "idle";
  const flapOpen = ["open", "envelope-fade"].includes(openingPhase);
  const envelopeFading = openingPhase === "envelope-fade";
  const sealDissolving = ["seal", "open", "envelope-fade"].includes(openingPhase);
  return (
    <motion.button
      className={`envelope-stage${opening ? " envelope-stage-opening" : ""}`}
      onClick={onOpen}
      aria-label="Open the wedding invitation"
      disabled={opening}
    >
      <motion.div
        ref={envelopeRef}
        className="envelope"
        animate={{
          rotate: opening ? 90 : 0,
          scale: opening ? turnScale : 1,
          opacity: envelopeFading ? 0 : 1,
        }}
        transition={{
          rotate: { duration: ENVELOPE_TURN_DURATION, ease: ENVELOPE_TURN_EASE },
          scale: { duration: ENVELOPE_TURN_DURATION, ease: ENVELOPE_TURN_EASE },
          opacity: envelopeFading
            ? { duration: ENVELOPE_FADE_DURATION, ease: [0.4, 0, 0.2, 1] }
            : { duration: 0.18 },
        }}
        onAnimationComplete={() => {
          if (envelopeFading) onEnvelopeFadeComplete();
        }}
      >
        <div className="envelope-back" />
        <motion.div
          className="envelope-letter"
          aria-hidden="true"
          style={{ zIndex: 1 }}
        >
          <div className="letter-card-inner" />
        </motion.div>
        <motion.div
          className="envelope-flap"
          initial={false}
          animate={flapOpen ? { rotateX: -180 } : { rotateX: 0 }}
          transition={{ duration: FLAP_OPEN_DURATION, ease: [0.42, 0, 0.24, 1] }}
          onAnimationComplete={() => {
            if (openingPhase === "open") onFlapOpen();
          }}
        >
          <div className="envelope-flap-face flap-face-front" />
          <div className="envelope-flap-face flap-face-back" />
        </motion.div>
        <div className="envelope-front">
          <div className="envelope-fold left-fold" />
          <div className="envelope-fold right-fold" />
          <div className="envelope-fold bottom-fold" />
        </div>
        <motion.div
          ref={sealRef}
          className="wax-seal"
          animate={sealDissolving
            ? { opacity: 0, scale: 0.97, filter: "blur(2px)", rotate: 0 }
            : opening
              ? { opacity: 1, scale: 1, filter: "blur(0px)", rotate: 0 }
            : { rotate: [0, -6, 6, 0], opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={sealDissolving
            ? { duration: SEAL_DUST_DURATION / 1000, ease: [0.35, 0, 0.25, 1] }
            : opening
              ? { duration: ENVELOPE_TURN_DURATION, ease: ENVELOPE_TURN_EASE }
            : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            className="wax-seal-texture"
            src={assetUrl("wax-seal-texture.png")}
            alt=""
            aria-hidden="true"
            draggable="false"
          />
          <img
            className="wax-seal-ganesha"
            src={assetUrl("ganesha-seal-engraving.png")}
            alt=""
            aria-hidden="true"
            draggable="false"
          />
        </motion.div>
      </motion.div>
    </motion.button>
  );
}

function PhotoPlaceholder({ label, name }) {
  return (
    <div className="photo-placeholder">
      <div className="photo-placeholder-inner">
        <Heart size={24} strokeWidth={1.2} />
        <span>{label}</span>
        <strong>{name}</strong>
        <small>Replace with your childhood photo</small>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("intro");
  const [openingPhase, setOpeningPhase] = useState("idle");
  const [skipInvitationReveal, setSkipInvitationReveal] = useState(false);
  const [turnScale, setTurnScale] = useState(1.25);
  const [sealDustDone, setSealDustDone] = useState(false);
  const [artworkReady, setArtworkReady] = useState(false);
  const audioRef = useRef(null);
  const artworkTriggerRef = useRef(null);
  const envelopeRef = useRef(null);
  const sealRef = useRef(null);
  const openingTimersRef = useRef([]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => () => openingTimersRef.current.forEach((timer) => window.clearTimeout(timer)), []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 1;
  }, []);

  const openInvitation = () => {
    if (openingPhase !== "idle" || page !== "intro") return;
    audioRef.current?.play().catch(() => {});
    if (prefersReducedMotion) {
      setSkipInvitationReveal(true);
      setPage(SHOW_STORY_PAGE ? "story" : "invitation");
      return;
    }

    const envelope = envelopeRef.current;
    const localWidth = envelope?.offsetWidth || 414;
    const localHeight = envelope?.offsetHeight || 285;
    const rotatedWidth = localHeight;
    const rotatedHeight = localWidth;
    const fittedScale = Math.min(
      1.25,
      (window.innerWidth * 0.9) / rotatedWidth,
      (window.innerHeight * 0.78) / rotatedHeight,
    );
    setTurnScale(Math.max(0.72, fittedScale));
    setSealDustDone(false);
    setOpeningPhase("turn");

    openingTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    openingTimersRef.current = [
      window.setTimeout(() => setOpeningPhase("seal"), SEAL_DISSOLVE_START_MS),
      window.setTimeout(() => setOpeningPhase("open"), FLAP_OPEN_START_MS),
    ];
  };

  const finishFlapOpening = () => {
    setOpeningPhase("envelope-fade");
  };

  const finishEnvelopeFade = () => {
    setSkipInvitationReveal(false);
    setPage(SHOW_STORY_PAGE ? "story" : "invitation");
    setOpeningPhase("idle");
  };

  const showInvitationPage = () => {
    window.scrollTo(0, 0);
    setSkipInvitationReveal(false);
    setPage("invitation");
  };

  return (
    <main
      className={`site-shell ${openingPhase !== "idle" ? "is-opening" : ""}`}
    >
      <audio
        ref={audioRef}
        src={assetUrl("wedding-music.mp3")}
        loop
        preload="none"
      />

      {page === "intro" && (
        <section className={`intro-screen${openingPhase === "envelope-fade" ? " is-transitioning" : ""}`}>
          <div className="paper-grain" />
          <div className="outer-frame" aria-hidden="true">
          </div>
          <div className="intro-content">
            <Envelope
              onOpen={openInvitation}
              onFlapOpen={finishFlapOpening}
              onEnvelopeFadeComplete={finishEnvelopeFade}
              openingPhase={openingPhase}
              envelopeRef={envelopeRef}
              sealRef={sealRef}
              turnScale={turnScale}
            />
          </div>
        </section>
      )}

      {!sealDustDone && ["seal", "open", "envelope-fade"].includes(openingPhase) && (
        <SealDustTransition
          sealRef={sealRef}
          onComplete={() => setSealDustDone(true)}
        />
      )}

      {page === "story" && (
        <motion.div
          key="story"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
        >
          <section className="reveal-section paper-section" id="reveal">
            <div className="outer-frame compact-frame" aria-hidden="true" />
            <Reveal>
              <div className="section-kicker">OUR LITTLE BEGINNINGS</div>
            </Reveal>
            <div className="childhood-photos">
              <Reveal delay={0.12}>
                <PhotoPlaceholder label="THE LITTLE BOY" name="Krishnanand" />
              </Reveal>
              <Reveal delay={0.32}>
                <PhotoPlaceholder label="THE LITTLE GIRL" name="Archa" />
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <div className="announcement">
                <span className="announcement-script">And now,</span>
                <h1>
                  we're getting
                  <br />
                  <em>married!</em>
                </h1>
                <span className="tiny-divider">✦ &nbsp; ✦ &nbsp; ✦</span>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <button
                className="page-next-button"
                onClick={showInvitationPage}
              >
                <span>OUR INVITATION</span>
                <ArrowRight size={16} />
              </button>
            </Reveal>
          </section>
        </motion.div>
      )}

      {page === "invitation" && (
        <motion.div
          key="invitation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.15, ease: [0.4, 0, 0.2, 1] }}
        >
          <section className="invitation-section paper-section" id="invitation">
            <InvitationPageReveal
              artworkTriggerRef={artworkTriggerRef}
              onArtworkStart={() => setArtworkReady(true)}
              skipInitialReveal={skipInvitationReveal}
            />
            <div className="outer-frame" aria-hidden="true">
              <span className="outer-frame-top" />
              <img className="top-ganesha" src={assetUrl("ganesha-seal-engraving.png")} alt="" />
            </div>
            <Reveal>
              <header className="invite-header">
                <div className="section-kicker">
                  TOGETHER
                  <br />
                  WITH OUR FAMILIES
                </div>
                <p>
                  We are delighted to invite you
                  <br />
                  to the wedding of
                </p>
              </header>
            </Reveal>

            <Reveal>
              <div className="groom-family">
                <span className="family-label">SON OF</span>
                <p className="family-names">{WEDDING.groomParents}</p>
                <p className="family-address">
                  {WEDDING.groomAddress.map((line) => (
                    <span className="address-line" key={line}>{line}</span>
                  ))}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="couple-names">
                <h2>{WEDDING.groom}</h2>
                <div className="and-line">
                  <span /> <i>and</i> <span />
                </div>
                <h2>{WEDDING.bride}</h2>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="bride-family">
                <span className="family-label">DAUGHTER OF</span>
                <p className="family-names">{WEDDING.brideParents}</p>
                <p className="family-address">
                  {WEDDING.brideAddress.map((line) => (
                    <span className="address-line" key={line}>{line}</span>
                  ))}
                </p>
              </div>
            </Reveal>

            <div className="art-reveal-trigger" ref={artworkTriggerRef} aria-hidden="true" />
            <Reveal delay={0.08} amount={0.28}>
              <div className="art-section">
                <GlitterReveal
                  src={assetUrl("radha-krishna-silhouette.png")}
                  alt="Krishna and Radha beneath a leafy arch and golden moon"
                  start={artworkReady}
                />
              </div>
            </Reveal>

            <div className="ceremonies">
              <Reveal delay={0.05}>
                <article className="ceremony-card">
                  <span className="family-label">WEDDING</span>
                  <div className="event-date" aria-label="Tuesday, 19 January 2027">
                    <span className="event-day">19</span>
                    <span className="event-date-copy">
                      <span className="event-weekday">Tuesday</span>
                      <span className="event-month-year">January 2027</span>
                    </span>
                  </div>
                  <span className="event-time-label">TIME</span>
                  <p className="event-time">12:10 PM <span>to</span> 12:30 PM</p>
                  <span className="family-label venue-label">VENUE</span>
                  <p className="venue-name">{WEDDING.muhurthamVenue}</p>
                  <a
                    className="map-link"
                    href={WEDDING.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MapPin size={15} /> Open in Maps <ExternalLink size={13} />
                  </a>
                </article>
              </Reveal>
              <Reveal delay={0.14}>
                <article className="ceremony-card">
                  <span className="family-label">RECEPTION</span>
                  <div className="event-date" aria-label="Thursday, 21 January 2027">
                    <span className="event-day">21</span>
                    <span className="event-date-copy">
                      <span className="event-weekday">Thursday</span>
                      <span className="event-month-year">January 2027</span>
                    </span>
                  </div>
                  <span className="event-time-label">TIME</span>
                  <p className="event-time">6:00 PM <span>onwards</span></p>
                  <span className="family-label venue-label">VENUE</span>
                  <p className="venue-name">{WEDDING.receptionVenue}</p>
                  <a
                    className="map-link"
                    href={WEDDING.receptionMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MapPin size={15} /> Open in Maps <ExternalLink size={13} />
                  </a>
                </article>
              </Reveal>
            </div>

            <Reveal>
              <p className="presence-note">
                Together with our families, we warmly invite you and your family to join us for the wedding and reception.
                Your presence and blessings will make these celebrations truly special.
              </p>
            </Reveal>
          </section>
        </motion.div>
      )}
    </main>
  );
}

export default App;
