import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Home, LocationCard, Setup } from "./components/Home.jsx";
import { Celebration, Encounter, Help, Journal } from "./components/QuestPanels.jsx";
import CameraView from "./components/CameraView.jsx";
import Modal from "./components/Modal.jsx";
import { Icon } from "./components/Icon.jsx";
import { Cookie, CookieMark, Elf, ElfAvatar, Forest } from "./art/Illustrations.jsx";
import {
  clearQuest,
  counts,
  formatTime,
  initialQuest,
  isGathered,
  questReducer,
} from "./game/state.js";
import { findById } from "./game/quest.js";
import { useLocationGate } from "./hooks/useLocationGate.js";
import { LOCATION_STATUS } from "./game/geofence.js";
import { chime, respectDeviceMute } from "./game/audio.js";
import { config } from "./game/config.js";
import { shouldCelebrate, victoryShare } from "./game/share.js";
import "./App.css";

function load() {
  try {
    clearQuest(window.localStorage);
  } catch {
    /* ignore */
  }
  return initialQuest();
}

export default function App() {
  const [quest, dispatch] = useReducer(questReducer, undefined, load);
  const [screen, setScreen] = useState("home");
  const [modal, setModal] = useState(null);
  const [encounter, setEncounter] = useState(null);
  const [sound, setSound] = useState(true);
  const [visible, setVisible] = useState(!document.hidden);
  const [camera, setCamera] = useState({
    status: "loading",
    message: "Opening your camera…",
  });
  const [cameraAttempt, setCameraAttempt] = useState(0);
  const [scan, setScan] = useState({ progress: 0, name: "" });
  const [toast, setToast] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const gate = useLocationGate(
    (screen === "setup" || screen === "play") && visible,
  );
  const sighting = useRef({ id: null, start: 0, lastPaint: 0 });
  const dismissed = useRef(null);
  const inEncounter = useRef(false);
  const total = counts(quest);
  const gathered = isGathered(quest);
  const canRun = screen === "play" && gate.allowed && visible;
  const canScan =
    canRun &&
    camera.status === "ready" &&
    !modal &&
    !encounter &&
    !gathered &&
    !celebrate;

  useEffect(() => {
    const changed = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", changed);
    return () => document.removeEventListener("visibilitychange", changed);
  }, []);
  useEffect(() => {
    document.title = `Elf & Seek · ${config.tagline}`;
    respectDeviceMute();
  }, []);
  useEffect(() => {
    if (!canScan) return;
    let previous = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      dispatch({ type: "tick", seconds: (now - previous) / 1000 });
      previous = now;
    }, 1000);
    return () => clearInterval(timer);
  }, [canScan]);
  useEffect(() => {
    if (canScan) return;
    sighting.current = { id: null, start: 0, lastPaint: 0 };
    setScan({ progress: 0, name: "" });
  }, [canScan]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);
  useEffect(() => {
    if (
      !shouldCelebrate({
        screen,
        gathered,
        allowed: gate.allowed,
        already: celebrate,
      })
    )
      return;
    setCelebrate(true);
    setModal(null);
    setEncounter(null);
    inEncounter.current = false;
    setToast(null);
    chime("victory", sound);
  }, [screen, gathered, gate.allowed, celebrate, sound]);

  const onMarkers = useCallback(
    (ids, time) => {
      if (!canScan || !gate.isAllowed() || inEncounter.current) return;
      if (!ids.includes(dismissed.current)) dismissed.current = null;
      const id = ids.find(
        (value) => !quest.found.includes(value) && value !== dismissed.current,
      );
      if (!id) {
        if (sighting.current.id) {
          sighting.current = { id: null, start: 0, lastPaint: 0 };
          setScan({ progress: 0, name: "" });
        }
        return;
      }
      if (sighting.current.id !== id)
        sighting.current = { id, start: time, lastPaint: 0 };
      const progress = Math.min(1, (time - sighting.current.start) / 1100);
      if (time - sighting.current.lastPaint > 90) {
        sighting.current.lastPaint = time;
        setScan({ progress, name: findById(id).name });
      }
      if (progress >= 1) {
        inEncounter.current = true;
        setEncounter(findById(id));
        chime(findById(id).kind, sound);
      }
    },
    [canScan, gate, quest.found, sound],
  );

  const closeEncounter = () => {
    dismissed.current = encounter?.id;
    setEncounter(null);
    inEncounter.current = false;
    sighting.current = { id: null, start: 0, lastPaint: 0 };
  };
  const collect = () => {
    if (!encounter || !gate.isAllowed()) return;
    dispatch({ type: "collect", id: encounter.id, allowed: true });
    setToast(`${encounter.name} added to your journal`);
    chime(encounter.kind, sound);
    closeEncounter();
  };
  const collectWithoutCamera = (id) => {
    if (!config.features.itemCaptureOverride || !gate.isAllowed()) return;
    const find = findById(id);
    if (!find || quest.found.includes(find.id)) return;
    dispatch({ type: "collect", id: find.id, allowed: true });
    setToast(`${find.name} added to your journal`);
    chime(find.kind, sound);
  };
  const enter = () => {
    if (!gate.isAllowed()) return;
    setCamera({ status: "loading", message: "Opening your camera…" });
    setScreen("play");
  };
  const finish = () => {
    if (!gate.isAllowed() || !gathered) return;
    dispatch({ type: "complete", allowed: true });
    setCelebrate(false);
    setScreen("victory");
  };
  const sharePayload = () =>
    victoryShare({
      tagline: config.tagline,
      venue: config.venue,
      url: config.gameUrl,
      time: formatTime(quest.elapsed),
      found: quest.found,
      hints: quest.hints.length,
      mistakes: quest.mistakes,
    });
  const copyResults = async () => {
    const payload = sharePayload();
    try {
      await navigator.clipboard.writeText(payload.text);
      setToast("Results copied — paste anywhere!");
    } catch {
      window.open(payload.tweetUrl, "_blank", "noopener,noreferrer");
    }
  };
  const shareHunt = async () => {
    const payload = sharePayload();
    if (navigator.share) {
      try {
        await navigator.share({
          title: payload.title,
          text: payload.text,
        });
        return;
      } catch {
        /* user cancelled or share failed — fall through to copy */
      }
    }
    await copyResults();
  };
  const restart = () => {
    dispatch({ type: "reset" });
    setModal(null);
    setEncounter(null);
    setCelebrate(false);
    inEncounter.current = false;
    dismissed.current = null;
    setScreen("home");
  };
  const leave = () => {
    if (encounter) return;
    setScreen("home");
    setModal(null);
    setCelebrate(false);
  };
  const retryCamera = () => {
    setCamera({ status: "loading", message: "Opening your camera…" });
    setCameraAttempt((value) => value + 1);
  };

  return (
    <div className={`app ${screen === "play" ? "is-playing" : ""}`}>
      {screen !== "play" && (
        <header className="site-header">
          <a
            className="brand"
            href={import.meta.env.BASE_URL}
            aria-label="Elf and Seek home"
          >
            <span className="brand-mark">
              <Icon name="leaf" size={23} />
            </span>
            <span>
              elf <i>&</i> seek
              <span className="brand-subtitle">{config.tagline}</span>
            </span>
          </a>
          <nav aria-label="Main navigation">
            <button
              className="icon-button"
              aria-label={sound ? "Turn sound off" : "Turn sound on"}
              aria-pressed={sound}
              onClick={() => {
                setSound(!sound);
                if (!sound) chime("find");
              }}
            >
              <Icon name={sound ? "sound" : "muted"} />
            </button>
          </nav>
        </header>
      )}

      {screen === "home" && (
        <Home
          onStart={() => setScreen("setup")}
          onHelp={() => setModal("help")}
          quest={quest}
        />
      )}
      {screen === "setup" && (
        <Setup gate={gate} onEnter={enter} onBack={leave} />
      )}
      {screen === "play" && (
        <main className="play-page">
          <div className="play-backdrop">
            <Forest />
          </div>
          {canRun && camera.status !== "error" && (
            <CameraView
              key={cameraAttempt}
              onMarkers={onMarkers}
              onStatus={setCamera}
            />
          )}
          <div className="quest-hud">
            <div className="hud-counts">
              <span>
                <ElfAvatar />
                <b data-testid="elf-count">{total.elves}</b>
                <span className="hud-of">/ 4 elves</span>
              </span>
              <span>
                <CookieMark />
                <b data-testid="cookie-count">{total.cookies}</b>
                <span className="hud-of">/ 3 cookies</span>
              </span>
            </div>
            <div
              className="quest-track"
              aria-label={`${quest.found.length} of 7 discoveries`}
            >
              {Array.from({ length: 7 }, (_, index) => (
                <span
                  className={index < quest.found.length ? "filled" : ""}
                  key={index}
                />
              ))}
            </div>
            <div className="hud-heading">
              <span className="play-time">
                <Icon name="clock" size={13} />
                {formatTime(quest.elapsed)}
              </span>
            </div>
          </div>
          {canScan && (
            <div className="scan-guide">
              <div
                className={`scan-frame ${scan.progress ? "has-marker" : ""}`}
              >
                <span />
                <span />
                <span />
                <span />
                {scan.progress > 0 && (
                  <div
                    className="scan-progress"
                    role="progressbar"
                    aria-label="Revealing discovery"
                    aria-valuenow={Math.round(scan.progress * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <svg viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="26" />
                      <circle
                        cx="30"
                        cy="30"
                        r="26"
                        style={{
                          strokeDasharray: 164,
                          strokeDashoffset: 164 * (1 - scan.progress),
                        }}
                      />
                    </svg>
                    <Icon name="sparkle" />
                  </div>
                )}
              </div>
              <p role="status">
                {scan.progress
                  ? "A little magic… hold steady"
                  : "Frame a printed trail marker"}
              </p>
              <small>Keep the whole black square in view.</small>
            </div>
          )}
          {canRun && camera.status === "loading" && (
            <div className="camera-status">
              <div className="loader" />
              <h3>{camera.message}</h3>
              <p>The first visit may take a few seconds.</p>
            </div>
          )}
          {canRun && camera.status === "error" && (
            <div className="game-overlay">
              <section className="pause-card">
                <Icon name="camera" size={32} />
                <h2>
                  Let’s try
                  <br />
                  <em>that again.</em>
                </h2>
                <p role="alert">{camera.message}</p>
                <button
                  className="button primary full-width"
                  onClick={retryCamera}
                >
                  Try camera again
                  <Icon name="reset" />
                </button>
                <button className="text-button" onClick={leave}>
                  Back to the grove
                </button>
              </section>
            </div>
          )}
          {(!gate.allowed || !visible) && (
            <div className="game-overlay">
              <section className="pause-card location-pause">
                <span className="eyebrow">ADVENTURE PAUSED</span>
                <p>This hunt lasts until you close the tab.</p>
                <LocationCard gate={gate} compact />
                <button className="text-button" onClick={leave}>
                  Back to the grove
                </button>
              </section>
            </div>
          )}
          {celebrate && gate.allowed && <Celebration onContinue={finish} />}
          <div className="game-bottom">
            <div className="play-actions">
              <button
                className="button primary journal-cta"
                aria-label={`Field journal, ${quest.found.length} of 7`}
                onClick={() => setModal("journal")}
                disabled={celebrate || !!encounter}
              >
                <Icon name="book" />
                Field journal
                <span>{quest.found.length} / 7</span>
              </button>
              <button
                className="icon-button glass"
                aria-label={sound ? "Turn sound off" : "Turn sound on"}
                aria-pressed={sound}
                onClick={() => {
                  setSound(!sound);
                  if (!sound) chime("find");
                }}
              >
                <Icon name={sound ? "sound" : "muted"} />
              </button>
            </div>
            <div className="trail-reminder">
              <span className={`live-dot ${gate.allowed ? "" : "off"}`} />
              {LOCATION_STATUS[gate.status] || "Location not found"}
            </div>
            <footer className="version-stamp">v{config.version}</footer>
          </div>
        </main>
      )}

      {screen === "victory" && (
        <main className="victory-page">
          <div className="victory-world">
            <Forest lit />
            <div className="victory-elves">
              {["#f0b899", "#b9d778", "#c2a9e4", "#f3c968"].map((color) => (
                <Elf key={color} color={color} happy />
              ))}
            </div>
            <div className="victory-cookies">
              <Cookie variant={1} />
              <Cookie variant={2} />
              <Cookie variant={3} />
            </div>
          </div>
          <section className="victory-copy">
            <span className="eyebrow">
              SEVEN LITTLE DISCOVERIES. ONE HAPPY GROVE.
            </span>
            <h1>
              You brought
              <br />
              the <em>magic.</em>
            </h1>
            <p>
              The friends are together, the cookies are accounted for,
              <br className="desktop-break" /> and the wishing tree is glowing.
              Let the picnic begin.
            </p>
            <div className="seeker-badge">
              <Icon name="sparkle" size={30} />
              <span>
                <small>YOU’VE EARNED THE TITLE</small>
                <strong>
                  {quest.hints.length === 0 && quest.mistakes === 0
                    ? "Eagle-eyed elf whisperer"
                    : "Friend of the grove"}
                </strong>
              </span>
            </div>
            <div className="victory-stats">
              <span>
                <strong>4 / 4</strong> Friends reunited
              </span>
              <span>
                <strong>3 / 3</strong> Cookies rescued
              </span>
              <span>
                <strong>{formatTime(quest.elapsed)}</strong> Time exploring
              </span>
            </div>
            <div className="hero-actions">
              <button className="button primary" onClick={copyResults}>
                Copy results
                <Icon name="check" />
              </button>
              <button className="button secondary" onClick={shareHunt}>
                Share…
                <Icon name="sparkle" />
              </button>
              <button
                className="text-button"
                onClick={() => setModal("journal")}
              >
                See your discoveries
                <Icon name="book" size={17} />
              </button>
              <button
                className="text-button"
                onClick={() => setModal("restart")}
              >
                Play again
                <Icon name="reset" size={17} />
              </button>
            </div>
          </section>
        </main>
      )}
      {toast && (
        <div className="discovery-toast" role="status">
          <Icon name="check" />
          {toast}
        </div>
      )}
      {modal && (
        <Modal
          title={
            modal === "journal"
              ? "Your field journal"
              : modal === "restart"
                ? "Start a new adventure"
                : "How to play"
          }
          onClose={() => setModal(null)}
        >
          {modal === "help" && <Help onClose={() => setModal(null)} />}
          {modal === "journal" && (
            <Journal
              quest={quest}
              dispatch={dispatch}
              captureOverride={config.features.itemCaptureOverride}
              onCollect={collectWithoutCamera}
            />
          )}
          {modal === "restart" && (
            <div className="restart-panel">
              <span className="eyebrow">ANOTHER LITTLE ADVENTURE</span>
              <h2>
                Ready for
                <br />
                <em>round two?</em>
              </h2>
              <p>
                This starts a fresh hunt and clears this round’s discoveries.
                Your host can hide the cards in new places.
              </p>
              <button className="button primary full-width" onClick={restart}>
                Start a new adventure
                <Icon name="reset" />
              </button>
              <button className="text-button" onClick={() => setModal(null)}>
                Keep my discoveries
              </button>
            </div>
          )}
        </Modal>
      )}
      {encounter && (
        <Modal
          title={`You found ${encounter.name}`}
          onClose={closeEncounter}
          dismissible={false}
          className="encounter-modal"
        >
          <Encounter
            key={encounter.id}
            find={encounter}
            onCollect={collect}
            onMistake={() => dispatch({ type: "mistake" })}
            allowed={gate.allowed}
          />
        </Modal>
      )}
      {screen !== "play" && (
        <footer className="version-stamp">v{config.version}</footer>
      )}
    </div>
  );
}
