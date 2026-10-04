import { useState } from "react";
import { Elf, Cookie, Forest } from "../art/Illustrations.jsx";
import { Icon } from "./Icon.jsx";
import { config } from "../game/config.js";
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
            <span className="demo-seek">Finding a marker…</span>
            <span className="demo-found">Pip captured</span>
          </p>
        </div>
      </div>
      <button
        type="button"
        className="demo-pause"
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? "Play preview" : "Pause preview"}
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
            Four elves
            <br />
            are <em>hiding.</em>
          </h1>
          <p className="hero-story">
            The moonlight picnic can’t begin without them.
            <br className="desktop-break" /> Follow the trail, solve their
            riddles, and bring
            <br className="desktop-break" /> a little light back to Brierbrook
            Grove.
          </p>
          <div className="hero-actions">
            <button className="button primary" onClick={onStart}>
              {quest.found.length
                ? "Continue your adventure"
                : "Let’s find some elves"}
              <Icon name="arrow" />
            </button>
            <button
              className="icon-button help-mark"
              aria-label="How to play"
              onClick={onHelp}
            >
              ?
            </button>
          </div>
          <p className="starts-at">
            Starts at {config.venue.street}.
          </p>
          <div className="hero-meta">
            <Icon name="clock" size={16} />
            <span>
              Estimated gameplay: <strong>a relaxed 10–15 minutes</strong>
            </span>
          </div>
        </div>
        <div className="hero-world">
          <div className="world-caption">
            <span className="live-dot" />
            <span className="world-est">EST. IN YOUR IMAGINATION</span>
          </div>
          <Forest />
          <GameplayPreview />
        </div>
      </section>
      <section
        className="adventure-strip"
        aria-label="Your adventure at a glance"
      >
        <div className="venue-mini">
          <span className="strip-icon">
            <Icon name="pin" size={24} />
          </span>
          <div>
            <span className="eyebrow">Your adventure starts here</span>
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
            <strong>4 little friends</strong>
            <small>Find. Meet. Solve a riddle.</small>
          </div>
        </div>
        <div className="quest-preview">
          <Cookie className="mini-cookie" />
          <div>
            <strong>3 magic cookies</strong>
            <small>A picnic worth searching for.</small>
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
          <span className="eyebrow">Check your location when you arrive.</span>
          <h3>{heading}</h3>
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
      {Number.isFinite(gate.accuracy) && (
        <p className="location-details">
          GPS accuracy ±{Math.round(gate.accuracy)} m
          {Number.isFinite(gate.distance)
            ? ` · About ${Math.round(gate.distance)} m from the grove’s center`
            : ""}
        </p>
      )}
      {!gate.allowed && (
        <button
          className="button primary full-width"
          disabled={gate.status === "checking"}
          onClick={gate.request}
        >
          {gate.status === "checking"
            ? "Finding your location…"
            : gate.status === "idle"
              ? "Check my location"
              : "Check location again"}
          <Icon name="pin" size={18} />
        </button>
      )}
    </div>
  );
}

export function Setup({ gate, onEnter, onBack }) {
  return (
    <main className="setup-page">
      <button className="text-button back-button" onClick={onBack}>
        <span>←</span> Back to the grove
      </button>
      <div className="setup-heading">
        <div className="eyebrow">BEFORE THE MAGIC BEGINS</div>
        <h1>
          A tiny bit of
          <br />
          <em>trail prep.</em>
        </h1>
      </div>
      <div className="setup-grid">
        {gate.allowed ? (
          <div className="camera-card">
            <Icon name="camera" size={34} />
            <h3>Meet them in your world</h3>
            <p>
              Your rear camera brings the elves to life on the printed trail
              markers.
            </p>
            <ul className="trail-notes">
              <li>Stay on the host’s property and away from the road.</li>
              <li>Stop walking before you look through the camera.</li>
              <li>Children: bring a grown-up along for the adventure.</li>
            </ul>
            <button className="button primary full-width" onClick={onEnter}>
              Open camera & begin
              <Icon name="arrow" />
            </button>
            <small className="permission-note">
              We’ll ask for camera permission next.
            </small>
          </div>
        ) : (
          <LocationCard gate={gate} />
        )}
      </div>
      <p className="privacy-note">
        <Icon name="leaf" size={18} /> Privacy assured: your camera and
        location stay on this device.
      </p>
    </main>
  );
}
