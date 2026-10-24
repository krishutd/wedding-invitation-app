import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import StationeryArtwork from "./StationeryArtwork.jsx";
import InvitationPageReveal from "./InvitationPageReveal.jsx";
import {
  InkReveal,
  EventDay,
  BorderReveal,
  ClosingDivider,
} from "./StationeryReveal.jsx";
import ArtworkHandoff from "./ArtworkHandoff.jsx";
import InvitationBorder from "./ThreadBorder.jsx";
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

import { assetUrl, botanicalAsset, radhaKrishnaAsset } from "./assets.js";
import { preloadIntroAssets } from "./introAssets.js";
const MUSIC_FADE_SECONDS = 1.5;
const MUSIC_MAX_VOLUME = 0.6;

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

function CeremonyFrame() {
  return (
    <svg
      className="ceremony-frame"
      viewBox="0 0 400 400"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="#A47A30"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      >
        <rect x="4" y="4" width="392" height="392" />
        <rect x="11" y="11" width="378" height="378" opacity=".68" />
      </g>
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
  const selectedEvent =
    EVENTS[inviteType === "reception" ? "reception" : "wedding"];
  const firstName = invitationSide === "bride" ? WEDDING.bride : WEDDING.groom;
  const secondName = invitationSide === "bride" ? WEDDING.groom : WEDDING.bride;
  const secondFamilySide = invitationSide === "bride" ? "groom" : "bride";

  // Remove the bootstrap indicator only after React commits the complete intro.
  useEffect(() => {
    if (introReady) document.getElementById("invitation-loading")?.remove();
  }, [introReady]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      preloadIntroAssets(),
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
          musicEnabledRef.current &&
          musicStartedByUserRef.current &&
          !audio.paused;
        if (!audio.paused) audio.pause();
        return;
      }

      if (
        musicEnabledRef.current &&
        musicStartedByUserRef.current &&
        resumeMusicOnForegroundRef.current
      ) {
        audio
          .play()
          .then(() => {
            resumeMusicOnForegroundRef.current = false;
          })
          .catch(() => {
            // Some mobile browsers may require another user gesture to resume.
          });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    <main className={`site-shell${page === "intro" && !introReady ? " is-loading" : ""}`} aria-busy={page === "intro" && !introReady} style={{
      "--intro-botanical-background": `url("${assetUrl(botanicalAsset())}")`,
    }}>
      <audio
        ref={audioRef}
        src={assetUrl("wedding-music-2.mp3")}
        loop
        autoPlay={false}
        preload="none"
      />

      {handoff && (
        <ArtworkHandoff
          bounds={handoff}
          onDone={() => {
            setPage("invitation");
            setHandoff(null);
            paperResolve.current?.();
            requestAnimationFrame(() =>
              document
                .getElementById("invitation")
                ?.focus({ preventScroll: true }),
            );
          }}
        />
      )}

      {page === "intro" && (
        <section
          className="intro-screen"
          style={{
            "--intro-botanical-background": `url("${assetUrl(botanicalAsset())}")`,
            "--envelope-botanical-overlay": `url("${assetUrl("envelope-botanical-overlay.webp")}")`,
            "--envelope-paper-texture": `url("${assetUrl("envelope-paper-texture.webp")}")`,
          }}
        >
          <div className="paper-grain" />
          <div className="outer-frame" aria-hidden="true"></div>
          <div className="intro-content">
            <EnvelopeOpening
              side={invitationSide}
              event={selectedEvent}
              onPaper={(bounds) =>
                new Promise((resolve) => {
                  paperResolve.current = resolve;
                  setHandoff(bounds);
                })
              }
              ready={introReady}
              onActivate={openInvitation}
              onFinish={() => {
                setHandoff(null);
                setPage(SHOW_STORY_PAGE ? "story" : "invitation");
                requestAnimationFrame(() =>
                  document
                    .getElementById("invitation")
                    ?.focus({ preventScroll: true }),
                );
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

      {(page === "invitation" || handoff) && (
        <motion.div
          key="invitation"
          className={page === "intro" ? "invitation-prepared" : undefined}
          inert={page === "intro"}
          aria-hidden={page === "intro" ? true : undefined}
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
            <InvitationPageReveal active={page === "invitation"} />
            <InvitationBorder>
              <span className="outer-frame-top" />
              <span className="frame-corner frame-corner--top-left" />
              <span className="frame-corner frame-corner--top-right" />
              <span className="frame-corner frame-corner--bottom-left" />
              <span className="frame-corner frame-corner--bottom-right" />
              <img
                className="top-ganesha"
                src={assetUrl("ganesha-seal-engraving.webp")}
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
                  {inviteType === "reception"
                    ? "wedding reception"
                    : "wedding"}{" "}
                  of their {invitationSide === "groom" ? "son" : "daughter"}
                </p>
              </header>
            </Reveal>

            <div>
              <div className="couple-names">
                <InkReveal delay={0.12}>
                  <h2>{firstName}</h2>
                </InkReveal>
                <InkReveal delay={0.24}>
                  <div className="and-line">
                    <span /> <i>and</i> <span />
                  </div>
                </InkReveal>
                <InkReveal delay={0.36}>
                  <h2>{secondName}</h2>
                </InkReveal>
              </div>
            </div>

            <Reveal delay={0.45}>
              <FamilyDetails side={secondFamilySide} />
            </Reveal>

            <div>
              <div className="art-section">
                <StationeryArtwork
                  src={assetUrl(radhaKrishnaAsset())}
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
                    <BorderReveal className="ceremony-frame-reveal">
                      <CeremonyFrame />
                    </BorderReveal>
                    <span className="family-label">WEDDING</span>
                    <div
                      className="event-date"
                      aria-label={formatEvent(EVENTS.wedding, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    >
                      <EventDay
                        event={EVENTS.wedding}
                      />
                      <span className="event-date-copy">
                        <span className="event-weekday">
                          {formatEvent(EVENTS.wedding, { weekday: "long" })}
                        </span>
                        <span className="event-month-year">
                          {formatEvent(EVENTS.wedding, {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </span>
                    </div>
                    <span className="event-time-label">Muhurtham</span>
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
                      aria-label={formatEvent(EVENTS.reception, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    >
                      <EventDay
                        event={EVENTS.reception}
                      />
                      <span className="event-date-copy">
                        <span className="event-weekday">
                          {formatEvent(EVENTS.reception, { weekday: "long" })}
                        </span>
                        <span className="event-month-year">
                          {formatEvent(EVENTS.reception, {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
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
                We warmly invite you and your family to join us for{" "}
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
