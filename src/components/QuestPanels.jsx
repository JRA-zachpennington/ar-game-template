import { useState } from "react";
import { Elf, Cookie } from "../art/Illustrations.jsx";
import { FINDS, findById } from "../game/quest.js";
import { counts } from "../game/state.js";
import { copy } from "../game/theme.js";
import { Icon } from "./Icon.jsx";

const CONFETTI = Array.from({ length: 56 }, (_, i) => ({
  left: (i * 47) % 100,
  delay: (i % 14) * 0.12,
  duration: 2.1 + (i % 6) * 0.35,
  hue: (i * 41) % 360,
  drift: ((i % 9) - 4) * 14,
  size: 7 + (i % 5) * 2,
}));

const BURSTS = [
  { top: "18%", left: "22%", delay: 0 },
  { top: "28%", left: "72%", delay: 0.35 },
  { top: "14%", left: "50%", delay: 0.7 },
  { top: "40%", left: "38%", delay: 1.05 },
  { top: "22%", left: "84%", delay: 1.4 },
];

export function Help({ onClose }) {
  return (
    <div className="help-panel">
      <span className="eyebrow">{copy.fieldGuide}</span>
      <h2>
        {copy.helpLine1}
        <br />A little <em>{copy.helpEm}</em>
      </h2>
      <p>{copy.helpLead}</p>
      <ol className="how-steps" role="list">
        {copy.helpSteps.map((step, index) => (
          <li role="listitem" key={step.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              {index === 1 && (
                <figure className="trail-card-sample">
                  <p>{copy.cardBrand}</p>
                  <img src="/markers/1.png" alt={copy.cardAlt} />
                  <small>{copy.cardCaption}</small>
                </figure>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="soft-note">{copy.helpPace}</div>
      <button className="button primary full-width" onClick={onClose}>
        {copy.ready}
        <Icon name="arrow" />
      </button>
    </div>
  );
}

export function Journal({ quest, dispatch, captureOverride, onCollect }) {
  const [selected, setSelected] = useState(null);
  const total = counts(quest);
  const selectedFind = selected ? findById(selected) : null;
  const selectedFound = selected != null && quest.found.includes(selected);
  return (
    <div className="journal-panel">
      <span className="eyebrow">{copy.journalEyebrow}</span>
      <p>{copy.journalTally(total.elves, total.cookies)}</p>
      <div className="journal-grid">
        {FINDS.map((find) => {
          const found = quest.found.includes(find.id);
          return (
            <button
              className={`journal-entry ${found ? "found" : ""} ${selected === find.id ? "selected" : ""}`}
              key={find.id}
              onClick={() => setSelected(find.id)}
              aria-label={`${find.name}, ${found ? copy.discovered : copy.stillHiding}`}
            >
              <div className="journal-art">
                {find.kind === "elf" ? (
                  <Elf color={find.color} happy={found} />
                ) : (
                  <Cookie variant={find.id} />
                )}
              </div>
              <strong>{find.name}</strong>
              <small>{found ? copy.foundBang : copy.stillHiding}</small>
              {found && (
                <span className="entry-check">
                  <Icon name="check" size={12} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="journal-detail" aria-live="polite">
        {selectedFind ? (
          <>
            <h3>{selectedFind.name}</h3>
            <p>
              {selectedFound
                ? selectedFind.reward
                : quest.hints.includes(selected)
                  ? selectedFind.hint
                  : copy.hintPrompt}
            </p>
            {!selectedFound && !quest.hints.includes(selected) && (
              <button
                className="text-button"
                onClick={() => dispatch({ type: "hint", id: selected })}
              >
                <Icon name="sparkle" size={17} /> {copy.revealHint}
              </button>
            )}
            {!selectedFound && captureOverride && (
              <button
                className="button primary full-width"
                data-testid="capture-override"
                onClick={() => onCollect?.(selected)}
              >
                {copy.addWithoutCamera}
                <Icon name="check" />
              </button>
            )}
          </>
        ) : (
          <p>{copy.journalEmpty}</p>
        )}
      </div>
    </div>
  );
}

export function Celebration({ onContinue }) {
  return (
    <div className="game-overlay celebration-overlay" role="dialog" aria-modal="true" aria-labelledby="celebration-title">
      <div className="celebration-sky" aria-hidden="true">
        {CONFETTI.map((bit, index) => (
          <span
            key={index}
            className="confetti-bit"
            style={{
              left: `${bit.left}%`,
              animationDelay: `${bit.delay}s`,
              animationDuration: `${bit.duration}s`,
              background: `hsl(${bit.hue} 85% 62%)`,
              width: bit.size,
              height: bit.size * 0.55,
              ["--drift"]: `${bit.drift}px`,
            }}
          />
        ))}
        {BURSTS.map((burst, index) => (
          <span
            key={`burst-${index}`}
            className="firework-burst"
            style={{
              top: burst.top,
              left: burst.left,
              animationDelay: `${burst.delay}s`,
            }}
          />
        ))}
      </div>
      <section className="celebration-card">
        <span className="eyebrow">{copy.celebrateEyebrow}</span>
        <h2 id="celebration-title">
          {copy.celebrateLine1}
          <br />
          you found <em>{copy.celebrateEm}</em>
        </h2>
        <p>{copy.celebrateLead}</p>
        <button className="button primary full-width" onClick={onContinue}>
          {copy.lightTree}
          <Icon name="sparkle" />
        </button>
      </section>
    </div>
  );
}

export function Encounter({ find, onCollect, onMistake, allowed }) {
  const [wrong, setWrong] = useState(null);
  const [solved, setSolved] = useState(find.kind === "cookie");
  const choose = (index) => {
    if (index === find.answer) {
      setSolved(true);
      setWrong(null);
    } else {
      setWrong(index);
      onMistake();
    }
  };
  return (
    <div className="encounter-panel">
      <span className="eyebrow">
        {find.kind === "elf" ? copy.foundEyebrowSeeker : copy.foundEyebrowTreat}
      </span>
      <div className={`encounter-art ${find.kind}`}>
        {find.kind === "elf" ? (
          <Elf color={find.color} happy={solved} />
        ) : (
          <Cookie variant={find.id} />
        )}
        <span className="sparkle-decoration">✦</span>
      </div>
      <h2>
        {find.name}
        <span className="title-dot">.</span>
      </h2>
      <span className="character-role">{find.role}</span>
      <p className="character-dialogue">“{find.greeting}”</p>
      {find.kind === "elf" && !solved && (
        <div className="riddle">
          <h3>{find.riddle}</h3>
          <div className="answer-list">
            {find.choices.map((choice, index) => (
              <button
                className={`answer-button ${wrong === index ? "wrong" : ""}`}
                key={choice}
                onClick={() => choose(index)}
              >
                <span>{String.fromCharCode(65 + index)}</span>
                {choice}
                <Icon name="arrow" size={17} />
              </button>
            ))}
          </div>
          <p className="riddle-feedback" role="status">
            {wrong !== null ? copy.riddleWrong : copy.riddleWait}
          </p>
        </div>
      )}
      {solved && (
        <>
          <div className="reward-note">
            <Icon name="sparkle" />
            {find.reward}
          </div>
          <button
            className="button primary full-width"
            disabled={!allowed}
            onClick={onCollect}
          >
            {find.kind === "elf" ? copy.invite(find.name) : copy.tuck}
            <Icon name="check" />
          </button>
        </>
      )}
      {!allowed && (
        <p role="status">{copy.locationPaused}</p>
      )}
    </div>
  );
}

