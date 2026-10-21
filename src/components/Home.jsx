import { useEffect, useRef, useState } from "react";
import { Elf, Cookie, Forest } from "../game/themes/elf/art.jsx";
import { Icon } from "./Icon.jsx";
import { config, mapsHref } from "../game/config.js";
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

// `hold` freezes the demo while a dialog covers it; the player's own pause
// survives that so closing the dialog does not restart a demo they stopped.
function GameplayPreview({ hold }) {
  const [paused, setPaused] = useState(false);
  return (
    <div className={`play-demo ${paused || hold ? "is-paused" : ""}`}>
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
        className="icon-button glass demo-pause"
        aria-label={paused ? copy.playPreview : copy.pausePreview}
        onClick={() => setPaused((value) => !value)}
      >
        <Icon name={paused ? "play" : "pause"} size={24} />
      </button>
    </div>
  );
}

export function Home({ onStart, onHelp, quest, hold }) {
  return (
    <main className="home-page" id="main" tabIndex={-1}>
      <section className="hero">
        <div className="hero-copy">
          <h1>{copy.heroTitle}</h1>
          <a
            className="venue-mini"
            href={mapsHref(config.venue, navigator)}
            target="_blank"
            rel="noopener noreferrer"
          >
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
          </a>
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
          <GameplayPreview hold={hold} />
        </div>
      </section>
      <section
        className="adventure-strip"
        aria-label={copy.glance}
      >
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
          <h2>
            {gate.status === "idle" ? (
              <>
                <span className="place-lead">{heading}</span>
                <span className="place-name">{config.venue.name}</span>
              </>
            ) : (
              heading
            )}
          </h2>
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
// tap zooms in, then opens the camera. A wrong tap lights the target,
// rocks the words, plays a short descending blip, and replays the line;
// the words never change.
function TrailBriefing({ onEnter, sound }) {
  const [step, setStep] = useState(0);
  const [found, setFound] = useState([]); // steps already acknowledged
  const [misses, setMisses] = useState(0);
  const [advance, setAdvance] = useState(null); // step whose yes-beat is running
  const enter = useRef(onEnter);
  enter.current = onEnter;
  const total = copy.briefing.length;
  const last = step === total - 1;
  const current = copy.briefing[step];
  const art = BRIEFING_ART[step];
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
    setAdvance(step);
  };
  useEffect(() => {
    if (last) return;
    new Image().src = asset(`instructions/${BRIEFING_ART[step + 1].file}`);
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
  // The last yes is the zoom; when it finishes, the camera opens.
  useEffect(() => {
    if (advance !== step) return;
    const id = setTimeout(() => {
      if (last) {
        enter.current();
        return;
      }
      setAdvance(null);
      setStep(step + 1);
      setMisses(0);
    }, 700);
    return () => clearTimeout(id);
  }, [advance, step, last]);
  const { rule, prompt, alt } = current;
  const [left, top, width, height] = art.target;
  return (
    <section
      className={`briefing ${advance === step && last ? "is-zoom" : ""}`}
      aria-labelledby="briefing-title"
    >
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
          chime("miss", sound);
          playBriefing(step, { rule: false, enabled: sound });
        }}
      >
        <img
          src={asset(`instructions/${art.file}`)}
          alt={alt}
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
        <h1 id="briefing-title">{rule}</h1>
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
      {done && advance !== step && (
        <button className="button primary full-width ack" onClick={() => go(step + 1)}>
          {copy.next}
          <Icon name="arrow" />
        </button>
      )}
      <button
        className="text-button"
        disabled={step === 0}
        onClick={() => go(step - 1)}
      >
        {copy.back}
      </button>
    </section>
  );
}

export function Setup({ gate, onEnter, sound }) {
  return (
    <main className="setup-page" id="main" tabIndex={-1}>
      {!gate.allowed && (
        <div className="setup-heading">
          <div className="eyebrow">{copy.setupEyebrow}</div>
          <h1>{copy.setupTitle}</h1>
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
