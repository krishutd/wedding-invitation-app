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
const MUSIC_FADE_SECONDS = 1.5;
const MUSIC_MAX_VOLUME = 0.6;

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
    "Kadakkavoor, Thiruvananthapuram",
  ],
  muhurthamTime: ["12:10 PM", "12:30 PM"],
  muhurthamVenue: "AL SAJ Convention Centre, Kizhakkottam, Trivandrum",
  receptionTime: "From 6:00 PM onwards",
  receptionVenue: "ARV Convention Centre, Kodungallur",
  mapsUrl: "https://maps.app.goo.gl/E2NiULxt7Lig8HKz7",
  receptionMapsUrl: "https://maps.app.goo.gl/ENAWgVa9UkHYyZqG7",
};

// Set to true to show the optional childhood-photo story page after opening the envelope.
const SHOW_STORY_PAGE = false;

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

function Envelope({ onOpen }) {
  return (
    <motion.button
      className="envelope-stage"
      onClick={onOpen}
      aria-label="Open the wedding invitation"
    >
      <motion.div
        className="envelope"
        whileTap={{ scale: 0.985 }}
        whileHover={{ y: -3 }}
      >
        <div className="envelope-back" />
        <div className="envelope-letter">
          <span className="letter-message">You're cordially invited</span>
          <span className="letter-rule" />
        </div>
        <motion.div className="envelope-flap" initial={false} />
        <div className="envelope-front">
          <div className="envelope-fold left-fold" />
          <div className="envelope-fold right-fold" />
          <div className="envelope-fold bottom-fold" />
        </div>
        <motion.div
          className="wax-seal"
          animate={{ rotate: [0, -6, 6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
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
  const [opening, setOpening] = useState(false);
  const [artworkReady, setArtworkReady] = useState(false);
  const audioRef = useRef(null);
  const resumeMusicOnForegroundRef = useRef(false);
  const artworkTriggerRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = MUSIC_MAX_VOLUME;

    const fadeTimer = window.setInterval(() => {
      if (audio.paused || !Number.isFinite(audio.duration)) return;

      const fadeIn = Math.min(1, audio.currentTime / MUSIC_FADE_SECONDS);
      const secondsRemaining = audio.duration - audio.currentTime;
      const fadeOut = Math.min(1, secondsRemaining / MUSIC_FADE_SECONDS);
      audio.volume = MUSIC_MAX_VOLUME * Math.max(0, Math.min(fadeIn, fadeOut));
    }, 50);

    return () => window.clearInterval(fadeTimer);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Only resume later if playback was active before the page was hidden.
        resumeMusicOnForegroundRef.current = !audio.paused;
        if (!audio.paused) audio.pause();
        return;
      }

      if (resumeMusicOnForegroundRef.current) {
        audio.play().then(() => {
          resumeMusicOnForegroundRef.current = false;
        }).catch(() => {
          // Some mobile browsers may require another user gesture to resume.
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const openInvitation = () => {
    if (opening || page !== "intro") return;
    setOpening(true);
    audioRef.current?.play().catch(() => {});
    window.setTimeout(() => {
      setPage(SHOW_STORY_PAGE ? "story" : "invitation");
      setOpening(false);
    }, 1550);
  };

  const showInvitationPage = () => {
    window.scrollTo(0, 0);
    setPage("invitation");
  };

  return (
    <main
      className={`site-shell ${opening ? "is-opening" : ""}`}
    >
      <audio
        ref={audioRef}
        src={assetUrl("wedding-music.mp3")}
        loop
        preload="none"
      />

      {page === "intro" && (
        <section className="intro-screen">
          <div className="paper-grain" />
          <div className="outer-frame" aria-hidden="true">
          </div>
          <div className="intro-content">
            <Envelope onOpen={openInvitation} />
          </div>
        </section>
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
          transition={{ duration: 0.55 }}
        >
          <section className="invitation-section paper-section" id="invitation">
            <InvitationPageReveal
              artworkTriggerRef={artworkTriggerRef}
              onArtworkStart={() => setArtworkReady(true)}
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
                  <p className="event-time">
                    {WEDDING.muhurthamTime[0]} <span>to</span> {WEDDING.muhurthamTime[1]}
                  </p>
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
