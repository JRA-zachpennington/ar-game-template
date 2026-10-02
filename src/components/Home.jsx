import { Elf, Cookie, Forest } from "../art/Illustrations.jsx";
import { Icon } from "./Icon.jsx";
import { VENUE } from "../game/quest.js";
import { LOCATION_COPY } from "../game/geofence.js";

export function Home({ onStart, onHelp, onHost, quest }) {
  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-star">✦</span> A LITTLE WONDER. RIGHT OUTSIDE.
          </div>
          <h1>
            Small friends.
            <br />
            Big <em>adventure.</em>
          </h1>
          <p className="hero-description">
            Four mischievous elves. Three missing cookies.
            <br className="desktop-break" /> One magical game of hide and seek.
          </p>
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
            <button className="text-button" onClick={onHelp}>
              <Icon name="play" size={16} /> How to play
            </button>
          </div>
          <div className="hero-meta">
            <span>
              <Icon name="clock" size={15} /> A relaxed 10–15 min
            </span>
            <span className="meta-dot">·</span>
            <span>Made for curious explorers</span>
          </div>
        </div>
        <div className="hero-world">
          <div className="world-caption">
            <span className="live-dot" /> THE BRIERBROOK GROVE{" "}
            <span>EST. IN YOUR IMAGINATION</span>
          </div>
          <Forest />
          <div className="hero-elf">
            <Elf />
            <div className="elf-name-tag">
              <span>Pip</span>
              <small>Trail keeper & professional hider</small>
            </div>
          </div>
          <div className="floating-note">
            <Icon name="sparkle" size={16} />
            <span>“Bet you can’t find us.”</span>
          </div>
          <div className="hero-cookie">
            <Cookie />
            <span>Someone dropped a clue…</span>
          </div>
          <div className="world-bottom">
            <span>01 / A WORLD HIDING IN YOURS</span>
            <span>✦</span>
          </div>
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
            <span className="eyebrow">YOUR ADVENTURE STARTS HERE</span>
            <strong>1860 Brierbrook Rd</strong>
            <small>Germantown, Tennessee · Location-locked hunt</small>
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
      <footer className="home-footer">
        <span>Take your time. Look a little closer.</span>
        <button className="text-button" onClick={onHost}>
          Hosting the hunt?
          <Icon name="arrow" size={15} />
        </button>
      </footer>
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
          <span className="eyebrow">LOCATION CHECK</span>
          <h3>{heading}</h3>
        </div>
      </div>
      <p aria-live="polite">{description}</p>
      <div className="venue-address">
        <Icon name="leaf" size={20} />
        <span>
          <strong>{VENUE.name}</strong>
          <small>{VENUE.address}</small>
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
          className="button secondary full-width"
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
        <p>Just you, your camera, and a little curiosity.</p>
      </div>
      <div className="setup-grid">
        <LocationCard gate={gate} />
        <div className="camera-card">
          <span className="step-number">02</span>
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
          <button
            className="button primary full-width"
            disabled={!gate.allowed}
            onClick={onEnter}
          >
            Open camera & begin
            <Icon name="arrow" />
          </button>
          <small className="permission-note">
            We’ll ask for camera permission next.
          </small>
        </div>
      </div>
      <p className="privacy-note">
        <Icon name="leaf" size={16} /> Your camera and location stay on this
        device. Only discoveries and play time are saved in this browser.
      </p>
    </main>
  );
}
