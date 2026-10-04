import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Home, LocationCard, Setup } from "./components/Home.jsx";
import { Celebration, Encounter, Help, Journal } from "./components/QuestPanels.jsx";
import CameraView from "./components/CameraView.jsx";
import Modal from "./components/Modal.jsx";
import { Icon } from "./components/Icon.jsx";
import { Cookie, CookieMark, Elf, ElfAvatar, Forest } from "./game/themes/elf/art.jsx";
import {
  clearQuest,
  counts,
  formatTime,
  initialQuest,
  isGathered,
  questReducer,
} from "./game/state.js";
import { FINDS, findById } from "./game/quest.js";
import { useLocationGate } from "./hooks/useLocationGate.js";
import { LOCATION_STATUS } from "./game/geofence.js";
import { chime, respectDeviceMute } from "./game/audio.js";
import { config } from "./game/config.js";
import { shouldCelebrate, victoryShare } from "./game/share.js";
import { copy, theme } from "./game/theme.js";
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
    message: copy.openingCamera,
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
  const canRun = screen === "play" && gate.allowed && visible && !gathered;
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
    document.title = `${copy.cardBrand} · ${config.tagline}`;
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
    setToast(copy.addedToast(encounter.name));
    chime(encounter.kind, sound);
    closeEncounter();
  };
  const collectWithoutCamera = (id) => {
    if (!config.features.itemCaptureOverride || !gate.isAllowed()) return;
    const find = findById(id);
    if (!find || quest.found.includes(find.id)) return;
    dispatch({ type: "collect", id: find.id, allowed: true });
    setToast(copy.addedToast(find.name));
    chime(find.kind, sound);
  };
  const enter = () => {
    if (!gate.isAllowed()) return;
    setCamera({ status: "loading", message: copy.openingCamera });
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
      setToast(copy.copiedToast);
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
    setCamera({ status: "loading", message: copy.openingCamera });
    setCameraAttempt((value) => value + 1);
  };

  return (
    <div className={`app ${screen === "play" ? "is-playing" : ""}`}>
      {screen !== "play" && (
        <header className="site-header">
          <a
            className="brand"
            href={import.meta.env.BASE_URL}
            aria-label={`${theme.title} home`}
          >
            <span className="brand-mark">
              <Icon name="leaf" size={23} />
            </span>
            <span>
              {theme.brand.split("&")[0].trim()} <i>&</i>{" "}
              {theme.brand.split("&")[1].trim()}
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
        <Setup gate={gate} onEnter={enter} />
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
                <span className="hud-of">{copy.hudSeekers}</span>
              </span>
              <span>
                <CookieMark />
                <b data-testid="cookie-count">{total.cookies}</b>
                <span className="hud-of">{copy.hudTreats}</span>
              </span>
            </div>
            <div
              className="quest-track"
              aria-label={copy.discoveries(quest.found.length)}
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
                    aria-label={copy.revealing}
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
                {scan.progress ? copy.holdSteady : copy.frameMarker}
              </p>
              <small>{copy.keepSquare}</small>
            </div>
          )}
          {canRun && camera.status === "loading" && (
            <div className="camera-status">
              <div className="loader" />
              <h3>{camera.message}</h3>
              <p>{copy.cameraWait}</p>
            </div>
          )}
          {canRun && camera.status === "error" && (
            <div className="game-overlay">
              <section className="pause-card">
                <Icon name="camera" size={32} />
                <h2>
                  {copy.cameraRetryTitle1}
                  <br />
                  <em>{copy.cameraRetryEm}</em>
                </h2>
                <p role="alert">{camera.message}</p>
                <button
                  className="button primary full-width"
                  onClick={retryCamera}
                >
                  {copy.tryCamera}
                  <Icon name="reset" />
                </button>
                <button className="text-button" onClick={leave}>
                  {copy.backToGrove}
                </button>
              </section>
            </div>
          )}
          {(!gate.allowed || !visible) && (
            <div className="game-overlay">
              <section className="pause-card location-pause">
                <span className="eyebrow">{copy.pausedEyebrow}</span>
                <p>{copy.pausedBody}</p>
                <LocationCard gate={gate} compact />
                <button className="text-button" onClick={leave}>
                  {copy.backToGrove}
                </button>
              </section>
            </div>
          )}
          {celebrate && gate.allowed && <Celebration onContinue={finish} />}
          <div className="game-bottom">
            <div className="play-actions">
              <button
                className="button primary journal-cta"
                aria-label={copy.journalAria(quest.found.length)}
                onClick={() => setModal("journal")}
                disabled={celebrate || !!encounter}
              >
                <Icon name="book" />
                {copy.journalCta}
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
              {LOCATION_STATUS[gate.status] || LOCATION_STATUS.unavailable}
            </div>
          </div>
        </main>
      )}

      {screen === "victory" && (
        <main className="victory-page">
          <div className="victory-world">
            <Forest lit />
            <div className="victory-elves">
              {FINDS.filter((find) => find.kind === "elf").map((find) => (
                <Elf key={find.id} color={find.color} happy />
              ))}
            </div>
            <div className="victory-cookies">
              <Cookie variant={1} />
              <Cookie variant={2} />
              <Cookie variant={3} />
            </div>
          </div>
          <section className="victory-copy">
            <span className="eyebrow">{copy.victoryEyebrow}</span>
            <h1>
              {copy.victoryLine1}
              <br />
              the <em>{copy.victoryEm}</em>
            </h1>
            <p>{copy.victoryLead}</p>
            <div className="seeker-badge">
              <Icon name="sparkle" size={30} />
              <span>
                <small>{copy.titleEarned}</small>
                <strong>
                  {quest.hints.length === 0 && quest.mistakes === 0
                    ? copy.titlePerfect
                    : copy.titleFriend}
                </strong>
              </span>
            </div>
            <div className="victory-stats">
              <span>
                <strong>4 / 4</strong> {copy.statSeekers}
              </span>
              <span>
                <strong>3 / 3</strong> {copy.statTreats}
              </span>
              <span>
                <strong>{formatTime(quest.elapsed)}</strong> {copy.statTime}
              </span>
            </div>
            <div className="hero-actions">
              <button className="button primary" onClick={copyResults}>
                {copy.copyResults}
                <Icon name="check" />
              </button>
              <button className="button secondary" onClick={shareHunt}>
                {copy.share}
                <Icon name="sparkle" />
              </button>
              <button
                className="text-button"
                onClick={() => setModal("journal")}
              >
                {copy.seeDiscoveries}
                <Icon name="book" size={17} />
              </button>
              <button
                className="text-button"
                onClick={() => setModal("restart")}
              >
                {copy.playAgain}
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
              ? copy.journalModal
              : modal === "restart"
                ? copy.restartModal
                : copy.howToPlay
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
              <span className="eyebrow">{copy.restartEyebrow}</span>
              <h2>
                {copy.restartLine1}
                <br />
                <em>{copy.restartEm}</em>
              </h2>
              <p>{copy.restartBody}</p>
              <button className="button primary full-width" onClick={restart}>
                {copy.startFresh}
                <Icon name="reset" />
              </button>
              <button className="text-button" onClick={() => setModal(null)}>
                {copy.keepDiscoveries}
              </button>
            </div>
          )}
        </Modal>
      )}
      {encounter && (
        <Modal
          title={copy.foundTitle(encounter.name)}
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
      {screen === "home" && (
        <footer className="version-stamp">v{config.version}</footer>
      )}
    </div>
  );
}
