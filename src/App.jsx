import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import StationeryArtwork from "./StationeryArtwork.jsx";
import { InkReveal, EventDay, PaperHandoff, BorderReveal, InvitationBorder, ClosingDivider } from "./StationeryReveal.jsx";
import EnvelopeOpening from "./EnvelopeOpening.jsx";
import { EVENTS, formatEvent } from "./events.js";
import {
  MapPin,
  ArrowRight,
  Heart,
  ExternalLink,
  Volume2,
  VolumeX,
} from "lucide-react";

import { assetUrl } from "./assets.js";
const MUSIC_FADE_SECONDS = 1.5;
const MUSIC_MAX_VOLUME = 0.6;

function preloadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    let finished = false;
    let decoding = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      resolve();
    };
    const decodeImage = () => {
      if (decoding) return;
      decoding = true;
      if (typeof image.decode === "function") {
        image.decode().catch(() => {}).then(finish);
      } else {
        finish();
      }
    };

    image.onload = decodeImage;
    image.onerror = finish;
    image.src = src;

    if (image.complete) {
      if (image.naturalWidth > 0) decodeImage();
      else finish();
    }
  });
}

const WEDDING = {
  groom: "Krishnanand",
  bride: "Archa",
  groomParents: "Mr. V K Pradeep Kumar & Mrs. Hena Pradeep",
  groomAddress: ["Vallomparambath Kuttiparambil (H),", "Kodungallur, Thrissur"],
  brideParents: "Mr. Dileep Balan & Mrs. Manju Dileep",
  brideAddress: ["Dilland (Munduthoppil),", "Kadakkavoor, Thiruvananthapuram"],
  muhurthamTime: ["12:10 PM", "12:30 PM"],
  muhurthamVenue: "AL-SAJ Convention Centre, Kazhakkottam, Trivandrum",
  receptionTime: ["6:00 PM", "9:00 PM"],
  receptionVenue: "ARV Convention Centre, Kodungallur",
  mapsUrl: "https://maps.app.goo.gl/E2NiULxt7Lig8HKz7",
  receptionMapsUrl: "https://maps.app.goo.gl/ENAWgVa9UkHYyZqG7",
};

const LOVE_MESSAGES = {
  groom: "With lots of love - Sreedevi, Varun and Etash",
  bride: "With lots of love - Aswathy and Arjun",
};

function CeremonyVine() {
  return (
    <g fill="none" stroke="#A47A30" strokeWidth=".76" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
      {/* A single flowing creeper follows both edges of the corner. */}
      <path d="M57 5 C45 4 37 4 31 8 C25 12 30 18 24 24 C18 30 7 28 6 38 C5 45 6 50 5 57" />
      {/* Top-edge leaves */}
      <path d="M49 5 C46 1 41 1 38 4 C40 8 45 8 49 5Z" fill="#A47A30" fillOpacity=".13" />
      <path d="M48 5 Q43 4 39 4 M43 4 L42 2.8" />
      <path d="M37 6 C36 2 38 0 42 0 C44 3 41 6 37 6Z" fill="#A47A30" fillOpacity=".13" />
      <path d="M38 5 Q39 2 42 1 M39 3 L37.8 1.8" />
      {/* Leaves alternate along the curve */}
      <path d="M30 13 C25 10 21 12 20 16 C24 20 28 18 30 13Z" fill="#A47A30" fillOpacity=".13" />
      <path d="M29 14 Q25 14 21 16 M25 14 L23.5 12.5" />
      <path d="M25 22 C28 18 32 18 34 21 C32 25 28 26 25 22Z" fill="#A47A30" fillOpacity=".13" />
      <path d="M26 22 Q30 21 33 21 M30 21 L31.4 19.5" />
      <path d="M18 29 C13 26 9 28 9 32 C13 35 17 33 18 29Z" fill="#A47A30" fillOpacity=".13" />
      <path d="M17 29 Q13 30 10 32 M13 30 L11.4 28.7" />
      <path d="M13 38 C17 34 21 35 22 39 C19 43 15 42 13 38Z" fill="#A47A30" fillOpacity=".13" />
      <path d="M14 38 Q18 38 21 39 M18 38 L19.6 36.4" />
      <path d="M7 45 C3 41 0 43 0 47 C3 50 6 49 7 45Z" fill="#A47A30" fillOpacity=".13" />
      <path d="M6 45 Q3 46 1 47 M3 46 L1.5 44.4" />
      <path d="M6 50 C10 47 13 48 14 52 C12 55 8 55 6 50Z" fill="#A47A30" fillOpacity=".13" />
      <path d="M7 50 Q10 51 13 52 M10 51 L11.4 49.5" />
      {/* Fine tendrils curl outward from the young tips. */}
      <path d="M53 5 C58 3 61 5 59 8 C58 9 56 8 57 7 M5 53 C3 59 5 62 8 60 C9 59 8 57 7 58" />
      <path d="M33 9 C36 8 38 9 37 11 C36 12 35 11 36 10 M10 34 C9 37 10 39 12 38 C13 37 12 36 11 37" opacity=".8" />
    </g>
  );
}

function CeremonyFrame() {
  return (
    <svg className="ceremony-frame" viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="#A47A30" strokeWidth="1" vectorEffect="non-scaling-stroke">
        <rect x="4" y="4" width="392" height="392" />
        <rect x="11" y="11" width="378" height="378" opacity=".68" />
      </g>
      <CeremonyVine />
      <g transform="translate(400 0) scale(-1 1)"><CeremonyVine /></g>
      <g transform="translate(0 400) scale(1 -1)"><CeremonyVine /></g>
      <g transform="translate(400 400) scale(-1 -1)"><CeremonyVine /></g>
    </svg>
  );
}

// Set to true to show the optional childhood-photo story page after opening the envelope.
const SHOW_STORY_PAGE = false;

const Reveal = InkReveal;

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

function FamilyDetails({ side, showRelationship = true }) {
  const isGroom = side === "groom";
  const parents = isGroom ? WEDDING.groomParents : WEDDING.brideParents;
  const address = isGroom ? WEDDING.groomAddress : WEDDING.brideAddress;

  return (
    <div className={`${side}-family`}>
      {showRelationship && (
        <span className="family-label">
          {isGroom ? "SON OF" : "DAUGHTER OF"}
        </span>
      )}
      <p className="family-names">{parents}</p>
      <p className="family-address">
        {address.map((line) => (
          <span className="address-line" key={line}>
            {line}
          </span>
        ))}
      </p>
    </div>
  );
}

function App() {
  const [handoff, setHandoff] = useState(null);
  const paperResolve = useRef(null);
  const [page, setPage] = useState("intro");
  const [introReady, setIntroReady] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const audioRef = useRef(null);
  const musicStartedByUserRef = useRef(false);
  const musicEnabledRef = useRef(true);
  const resumeMusicOnForegroundRef = useRef(false);
  const params = new URLSearchParams(window.location.search);
  const invitationSide =
    params.get("side")?.toLowerCase() === "bride" ? "bride" : "groom";
  const requestedInvite = params.get("invite")?.toLowerCase();
  const inviteType =
    requestedInvite === "wedding" || requestedInvite === "reception"
      ? requestedInvite
      : "both";
  const selectedEvent = EVENTS[inviteType === "reception" ? "reception" : "wedding"];
  const firstName = invitationSide === "bride" ? WEDDING.bride : WEDDING.groom;
  const secondName = invitationSide === "bride" ? WEDDING.groom : WEDDING.bride;
  const secondFamilySide = invitationSide === "bride" ? "groom" : "bride";

  useEffect(() => {
    let cancelled = false;
    const introAssets = [
      "envelope-botanical-background.png",
      "envelope-botanical-overlay.png",
      "envelope-paper-texture.png",
      "wax-seal-texture.png",
      "ganesha-seal-engraving.png",
    ];

    Promise.all([
      Promise.all(introAssets.map((asset) => preloadImage(assetUrl(asset)))),
      document.fonts?.ready ?? Promise.resolve(),
    ]).then(() => {
      if (!cancelled) setIntroReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
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
        resumeMusicOnForegroundRef.current =
          musicEnabledRef.current && musicStartedByUserRef.current && !audio.paused;
        if (!audio.paused) audio.pause();
        return;
      }

      if (
        musicEnabledRef.current &&
        musicStartedByUserRef.current &&
        resumeMusicOnForegroundRef.current
      ) {
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
    if (page !== "intro") return;
    musicStartedByUserRef.current = true;
    audioRef.current?.play().catch(() => {});

  };

  const toggleMusic = () => {
    const enabled = !musicEnabledRef.current;
    musicEnabledRef.current = enabled;
    setMusicEnabled(enabled);

    const audio = audioRef.current;
    if (!enabled) {
      resumeMusicOnForegroundRef.current = false;
      audio?.pause();
      return;
    }

    if (musicStartedByUserRef.current) {
      audio?.play().catch(() => {});
    }
  };

  const showInvitationPage = () => {
    window.scrollTo(0, 0);
    setPage("invitation");
  };

  return (
    <main
      className="site-shell"
    >
      <audio
        ref={audioRef}
        src={assetUrl("wedding-music.mp3")}
        loop
        autoPlay={false}
        preload="none"
      />

      {handoff && <PaperHandoff handoff={handoff} presented={page !== "intro"} onCovered={() => paperResolve.current?.()} onDone={() => setHandoff(null)} />}

      {page === "intro" && (
        <section
          className="intro-screen"
          style={{
            "--intro-botanical-background": `url("${assetUrl("envelope-botanical-background.png")}")`,
            "--envelope-botanical-overlay": `url("${assetUrl("envelope-botanical-overlay.png")}")`,
            "--envelope-paper-texture": `url("${assetUrl("envelope-paper-texture.png")}")`,
          }}
        >
          <div className="paper-grain" />
          <div className="outer-frame" aria-hidden="true"></div>
          <div className="intro-content">
            <EnvelopeOpening
              event={selectedEvent}
              onPaper={(bounds) => new Promise(resolve => { paperResolve.current = resolve; setHandoff(bounds); })}
              ready={introReady}
              onActivate={openInvitation}
              onFinish={() => {
                setPage(SHOW_STORY_PAGE ? "story" : "invitation");
                requestAnimationFrame(() => document.getElementById("invitation")?.focus({ preventScroll: true }));
              }}
            />
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
              <button className="page-next-button" onClick={showInvitationPage}>
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
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.85 }}
        >
          <section
            className="invitation-section paper-section"
            id="invitation"
            tabIndex={-1}
          >
            <button
              className="music-toggle"
              type="button"
              onClick={toggleMusic}
              aria-label={musicEnabled ? "Turn music off" : "Turn music on"}
              aria-pressed={musicEnabled}
              title={musicEnabled ? "Turn music off" : "Turn music on"}
            >
              {musicEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span>Music {musicEnabled ? "on" : "off"}</span>
            </button>
            <InvitationBorder>
              <BorderReveal className="outer-frame-top" />
              <BorderReveal className="frame-corner frame-corner--top-left" />
              <BorderReveal className="frame-corner frame-corner--top-right" />
              <BorderReveal className="frame-corner frame-corner--bottom-left" />
              <BorderReveal className="frame-corner frame-corner--bottom-right" />
              <img
                className="top-ganesha"
                src={assetUrl("ganesha-seal-engraving.png")}
                alt=""
              />
            </InvitationBorder>
            <Reveal immediate>
              <header className="invite-header">
                <FamilyDetails side={invitationSide} showRelationship={false} />
                <p>
                  are delighted to invite you
                  <br />
                  to the{" "}
                  {inviteType === "reception" ? "wedding reception" : "wedding"}{" "}
                  of their {invitationSide === "groom" ? "son" : "daughter"}
                </p>
              </header>
            </Reveal>

            <div>
              <div className="couple-names">
                <InkReveal delay={0.12}><h2>{firstName}</h2></InkReveal>
                <InkReveal delay={0.24}><div className="and-line">
                  <span /> <i>and</i> <span />
                </div></InkReveal>
                <InkReveal delay={0.36}><h2>{secondName}</h2></InkReveal>
              </div>
            </div>

            <Reveal delay={0.45}>
              <FamilyDetails side={secondFamilySide} />
            </Reveal>

            <div>
              <div className="art-section">
                <StationeryArtwork
                  src={assetUrl("radha-krishna-silhouette.png")}
                  alt="Krishna and Radha beneath a leafy arch and golden moon"
                />
              </div>
            </div>

            <div
              className={`ceremonies${
                inviteType === "both" ? "" : " single-ceremony"
              }`}
            >
              {inviteType !== "reception" && (
                <Reveal delay={0.05}>
                  <article className="ceremony-card">
                    <BorderReveal className="ceremony-frame-reveal"><CeremonyFrame /></BorderReveal>
                    <span className="family-label">WEDDING</span>
                    <div
                      className="event-date"
                      aria-label={formatEvent(EVENTS.wedding, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    >
                      <EventDay event={EVENTS.wedding} selected={selectedEvent === EVENTS.wedding} />
                      <span className="event-date-copy">
                        <span className="event-weekday">{formatEvent(EVENTS.wedding, { weekday: "long" })}</span>
                        <span className="event-month-year">{formatEvent(EVENTS.wedding, { month: "long", year: "numeric" })}</span>
                      </span>
                    </div>
                    <span className="event-time-label">TIME</span>
                    <p className="event-time">
                      {WEDDING.muhurthamTime[0]} <span>to</span>{" "}
                      {WEDDING.muhurthamTime[1]}
                    </p>
                    <span className="family-label venue-label">VENUE</span>
                    <p className="venue-name">{WEDDING.muhurthamVenue}</p>
                    <a
                      className="map-link"
                      href={WEDDING.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MapPin size={15} /> Open in Maps{" "}
                      <ExternalLink size={13} />
                    </a>
                  </article>
                </Reveal>
              )}
              {inviteType !== "wedding" && (
                <Reveal delay={0.14}>
                  <article className="ceremony-card">
                    <CeremonyFrame />
                    <span className="family-label">RECEPTION</span>
                    <div
                      className="event-date"
                      aria-label={formatEvent(EVENTS.reception, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    >
                      <EventDay event={EVENTS.reception} selected={selectedEvent === EVENTS.reception} />
                      <span className="event-date-copy">
                        <span className="event-weekday">{formatEvent(EVENTS.reception, { weekday: "long" })}</span>
                        <span className="event-month-year">{formatEvent(EVENTS.reception, { month: "long", year: "numeric" })}</span>
                      </span>
                    </div>
                    <span className="event-time-label">TIME</span>
                    <p className="event-time">
                      {WEDDING.receptionTime[0]} <span>to</span>{" "}
                      {WEDDING.receptionTime[1]}
                    </p>
                    <span className="family-label venue-label">VENUE</span>
                    <p className="venue-name">{WEDDING.receptionVenue}</p>
                    <a
                      className="map-link"
                      href={WEDDING.receptionMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MapPin size={15} /> Open in Maps{" "}
                      <ExternalLink size={13} />
                    </a>
                  </article>
                </Reveal>
              )}
            </div>

            {inviteType === "wedding" && (
              <Reveal>
                <p className="other-event-note">
                  The wedding reception is on Thursday, 21 January 2027, from{" "}
                  {WEDDING.receptionTime[0]} to {WEDDING.receptionTime[1]} at{" "}
                  {WEDDING.receptionVenue}.
                </p>
              </Reveal>
            )}
            {inviteType === "reception" && (
              <Reveal>
                <p className="other-event-note">
                  The wedding is on Tuesday, 19 January 2027, from{" "}
                  {WEDDING.muhurthamTime[0]} to {WEDDING.muhurthamTime[1]} at{" "}
                  {WEDDING.muhurthamVenue}.
                </p>
              </Reveal>
            )}

            <Reveal>
              <p className="presence-note">
                We warmly invite you and your family
                to join us for{" "}
                {inviteType === "both"
                  ? "the wedding and reception"
                  : inviteType === "reception"
                    ? "the wedding reception"
                    : "the wedding"}
                . Your presence and blessings will make{" "}
                {inviteType === "both"
                  ? "these celebrations"
                  : "this celebration"}{" "}
                truly special.
              </p>
            </Reveal>

            <Reveal>
              <div className="love-signoff">
                <ClosingDivider>
                  <span />
                  <i>✿</i>
                  <span />
                </ClosingDivider>
                <p className="with-love-note">
                  {LOVE_MESSAGES[invitationSide]}
                </p>
              </div>
            </Reveal>
          </section>
        </motion.div>
      )}
    </main>
  );
}

export default App;
