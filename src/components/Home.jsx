import { useEffect, useState } from "react";
import { Elf, Cookie, Forest } from "../game/themes/elf/art.jsx";
import { Icon } from "./Icon.jsx";
import { config } from "../game/config.js";
import { chime, hush, playBriefing } from "../game/audio.js";
import { asset } from "../game/quest.js";
import { copy } from "../game/theme.js";
import { LOCATION_COPY } from "../game/geofence.js";

const MARKER_CELLS = [
  1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0,
  1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1,
];

function MarkerGlyph() {
  return (
    <svg viewBox="0 0 7 7" className="marker-glyph" aria-hidden="true">
      {MARKER_CELLS.map((on, index) =>
        on ? (
          <rect
            key={index}
            x={index % 7}
            y={Math.floor(index / 7)}
            width="1"
            height="1"
          />
        ) : null,
      )}
    </svg>
  );
}

function GameplayPreview() {
  const [paused, setPaused] = useState(false);
  return (
    <div className={`play-demo ${paused ? "is-paused" : ""}`}>
      <div className="demo-stage" aria-hidden="true">
        <div className="demo-grove-marker">
          <MarkerGlyph />
        </div>
        <div className="demo-phone">
          <div className="demo-screen">
            <div className="demo-frame-marker">
              <MarkerGlyph />
            </div>
            <Elf className="demo-elf" />
            <span className="demo-scan" />
            <span className="demo-bracket tl" />
            <span className="demo-bracket tr" />
            <span className="demo-bracket bl" />
            <span className="demo-bracket br" />
          </div>
          <p className="demo-label">
            <span className="demo-seek">{copy.demoSeeking}</span>
            <span className="demo-found">{copy.demoFound}</span>
          </p>
        </div>
      </div>
      <button
        type="button"
        className="demo-pause"
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? copy.playPreview : copy.pausePreview}
      </button>
    </div>
  );
}

export function Home({ onStart, onHelp, quest }) {
  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <h1>
            {copy.heroLine1}
            <br />
            {copy.heroLine2}
            <em>{copy.heroEm}</em>
          </h1>
          <p className="hero-story">
            {copy.heroStory.map((line, index) => (
              <span key={line}>
                {index > 0 && <br className="desktop-break" />}
                {index > 0 ? ` ${line}` : line}
              </span>
            ))}
          </p>
          <div className="hero-actions">
            <button className="button primary" onClick={onStart}>
              {quest.found.length ? copy.continue : copy.start}
              <Icon name="arrow" />
            </button>
            <button
              className="icon-button help-mark"
              aria-label={copy.howToPlay}
              onClick={onHelp}
            >
              ?
            </button>
          </div>
          <p className="starts-at">
            {copy.startsAt(config.venue.street)}
          </p>
          <div className="hero-meta">
            <Icon name="clock" size={16} />
            <span>
              {copy.estimate}
              <strong>{copy.estimateStrong}</strong>
            </span>
          </div>
        </div>
        <div className="hero-world">
          <div className="world-caption">
            <span className="live-dot" />
            <span className="world-est">{copy.imagination}</span>
          </div>
          <Forest />
          <GameplayPreview />
        </div>
      </section>
      <section
        className="adventure-strip"
        aria-label={copy.glance}
      >
        <div className="venue-mini">
          <span className="strip-icon">
            <Icon name="pin" size={24} />
          </span>
          <div>
            <span className="eyebrow">{copy.startsHere}</span>
            <strong>{config.venue.name}</strong>
            <span className="venue-street">{config.venue.street}</span>
            <small>
              {config.venue.city}, {config.venue.region}
            </small>
          </div>
        </div>
        <div className="quest-preview">
          <div className="mini-elf">
            <Elf />
          </div>
          <div>
            <strong>{copy.seekersBlurbTitle}</strong>
            <small>{copy.seekersBlurb}</small>
          </div>
        </div>
        <div className="quest-preview">
          <Cookie className="mini-cookie" />
          <div>
            <strong>{copy.treatsBlurbTitle}</strong>
            <small>{copy.treatsBlurb}</small>
          </div>
        </div>
      </section>
    </main>
  );
}

export function LocationCard({ gate, compact = false }) {
  const [heading, description] =
    LOCATION_COPY[gate.status] || LOCATION_COPY.unavailable;
  return (
    <div
      className={`location-card ${gate.allowed ? "is-ready" : ""} ${compact ? "compact" : ""}`}
    >
      <div className="location-heading">
        <span
          className={`status-orb ${gate.status === "checking" ? "spinning" : ""}`}
        >
          <Icon name={gate.allowed ? "check" : "pin"} size={22} />
        </span>
        <div>
          <span className="eyebrow">{copy.checkArrive}</span>
          <h3>
            {gate.status === "idle" ? (
              <>
                <span className="place-lead">{heading}</span>
                <span className="place-name">{config.venue.name}</span>
              </>
            ) : (
              heading
            )}
          </h3>
        </div>
      </div>
      {description && <p aria-live="polite">{description}</p>}
      <div className="venue-address">
        <Icon name="leaf" size={20} />
        <span>
          <strong>{config.venue.name}</strong>
          <small>{config.venue.address}</small>
        </span>
      </div>
      {!gate.allowed && (
        <button
          className="button primary full-width"
          disabled={gate.status === "checking"}
          onClick={gate.request}
        >
          {gate.status === "checking"
            ? copy.findingLocation
            : gate.status === "idle"
              ? copy.checkLocation
              : copy.checkAgain}
          <Icon name="pin" size={18} />
        </button>
      )}
    </div>
  );
}

// Briefing art plus the thing to tap in each picture (% of the image box).
const BRIEFING_ART = [
  { file: "1-holding-hands.png", target: [42, 2, 52, 95] }, // the bear
  { file: "2-walk.png", target: [4, 28, 38, 58] }, // the walking pup
  { file: "3-stop-camera.png", target: [63, 21, 25, 26] }, // STOP sign
  { file: "4-scan.png", target: [67, 19, 25, 25] }, // the code
];

// One rule per screen. Tapping the named thing in the picture is the
// acknowledgment; that tap moves on once the "yes" has landed. The last
// step keeps a button because it opens the camera. A wrong tap lights the
// target, rocks the words, and replays the line; the words never change.
function TrailBriefing({ onEnter, sound }) {
  const [step, setStep] = useState(0);
  const [found, setFound] = useState([]); // steps already acknowledged
  const [misses, setMisses] = useState(0);
  const [advance, setAdvance] = useState(null); // step whose yes-beat is running
  const total = copy.briefing.length;
  const last = step === total - 1;
  const { rule, prompt } = copy.briefing[step];
  const [left, top, width, height] = BRIEFING_ART[step].target;
  const done = found.includes(step);
  const speak = (enabled) => playBriefing(step, { prompt: !done, enabled });
  const go = (next) => {
    setAdvance(null);
    setStep(next);
    setMisses(0);
  };
  const hit = () => {
    if (done) {
      if (!last) go(step + 1);
      return;
    }
    setFound((steps) => [...steps, step]);
    setMisses(0);
    hush();
    chime("find", sound);
    if (!last) setAdvance(step);
  };
  useEffect(() => {
    if (!last) new Image().src = asset(`instructions/${BRIEFING_ART[step + 1].file}`);
  }, [step, last]);
  useEffect(() => {
    playBriefing(step, { enabled: sound });
    return hush;
    // Narrate once per step; the replay button covers later toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  useEffect(() => {
    if (!sound) hush();
  }, [sound]);
  // Long enough to see the yes, short enough that it isn't a second gate.
  useEffect(() => {
    if (advance !== step) return;
    const id = setTimeout(() => {
      setAdvance(null);
      setStep(step + 1);
      setMisses(0);
    }, 700);
    return () => clearTimeout(id);
  }, [advance, step]);
  return (
    <section className="briefing" aria-labelledby="briefing-title">
      <span className="eyebrow">{copy.stepOf(step + 1, total)}</span>
      <div className="quest-track" aria-hidden="true">
        {BRIEFING_ART.map((art, index) => (
          <span className={found.includes(index) ? "filled" : ""} key={art.file} />
        ))}
      </div>
      <div
        className={`briefing-scene ${done ? "is-done" : ""} ${misses ? "is-hint" : ""}`}
        onClick={() => {
          if (done) return;
          setMisses((n) => n + 1);
          playBriefing(step, { rule: false, enabled: sound });
        }}
      >
        <img
          src={asset(`instructions/${BRIEFING_ART[step].file}`)}
          alt=""
          width="512"
          height="512"
        />
        <button
          className="target"
          aria-label={prompt}
          aria-pressed={done}
          style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
          onClick={(event) => {
            event.stopPropagation();
            hit();
          }}
        >
          <Icon name="sparkle" size={34} />
        </button>
      </div>
      {/* key remounts the block so the quake restarts on every miss. */}
      <div className={`briefing-words ${misses ? "is-quake" : ""}`} key={misses}>
        <h2 id="briefing-title">{rule}</h2>
        <p className="briefing-prompt" role="status">
          <button
            className="icon-button read-aloud"
            aria-label={copy.readAloud}
            onClick={() => speak(true)}
          >
            <Icon name="sound" size={18} />
          </button>
          {done ? copy.tapYes : prompt}
        </p>
      </div>
      {last ? (
        <button
          className="button primary full-width ack"
          disabled={!done}
          onClick={onEnter}
        >
          {copy.openCamera}
          <Icon name="arrow" />
        </button>
      ) : (
        done &&
        advance !== step && (
          <button className="button primary full-width ack" onClick={() => go(step + 1)}>
            {copy.next}
            <Icon name="arrow" />
          </button>
        )
      )}
      {last ? (
        <small className="permission-note">{copy.cameraNext}</small>
      ) : (
        <button
          className="text-button"
          disabled={step === 0}
          onClick={() => go(step - 1)}
        >
          {copy.back}
        </button>
      )}
    </section>
  );
}

export function Setup({ gate, onEnter, sound }) {
  return (
    <main className="setup-page">
      {!gate.allowed && (
        <div className="setup-heading">
          <div className="eyebrow">{copy.setupEyebrow}</div>
          <h1>
            {copy.setupLine1}
            <br />
            <em>{copy.setupEm}</em>
          </h1>
        </div>
      )}
      <div className={`setup-grid ${gate.allowed ? "is-briefing" : ""}`}>
        {gate.allowed ? (
          <TrailBriefing onEnter={onEnter} sound={sound} />
        ) : (
          <LocationCard gate={gate} />
        )}
      </div>
      <p className="privacy-note">
        <Icon name="leaf" size={18} /> {copy.privacy}
      </p>
    </main>
  );
}
