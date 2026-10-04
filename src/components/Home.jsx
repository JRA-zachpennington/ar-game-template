import { useState } from "react";
import { Elf, Cookie, Forest } from "../game/themes/elf/art.jsx";
import { Icon } from "./Icon.jsx";
import { config } from "../game/config.js";
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

export function Setup({ gate, onEnter }) {
  return (
    <main className="setup-page">
      <div className="setup-heading">
        <div className="eyebrow">{copy.setupEyebrow}</div>
        <h1>
          {copy.setupLine1}
          <br />
          <em>{copy.setupEm}</em>
        </h1>
      </div>
      <div className="setup-grid">
        {gate.allowed ? (
          <div className="camera-card">
            <Icon name="camera" size={34} />
            <h3>{copy.cameraTitle}</h3>
            <p>{copy.cameraBody}</p>
            <ul className="trail-notes">
              {copy.trailNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            <button className="button primary full-width" onClick={onEnter}>
              {copy.openCamera}
              <Icon name="arrow" />
            </button>
            <small className="permission-note">{copy.cameraNext}</small>
          </div>
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
