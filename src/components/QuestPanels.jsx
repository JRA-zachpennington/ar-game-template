import { useState } from "react";
import { Elf, Cookie } from "../art/Illustrations.jsx";
import { FINDS, findById } from "../game/quest.js";
import { counts } from "../game/state.js";
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
      <span className="eyebrow">THE FIELD GUIDE</span>
      <h2>
        A little look.
        <br />A little <em>magic.</em>
      </h2>
      <p>
        Find four hidden elves and three cookies, then light the wishing tree
        for their moonlight picnic.
      </p>
      <ol className="how-steps" role="list">
        <li role="listitem">
          <span>01</span>
          <div>
            <h3>Arrive at the grove</h3>
            <p>
              Check in at Brierbrook. Ask your host where the safe play area
              begins and ends.
            </p>
          </div>
        </li>
        <li role="listitem">
          <span>02</span>
          <div>
            <h3>Look for printed trail cards</h3>
            <p>
              Hold your camera over the whole black square. Keep it visible for
              a moment to reveal a friend or cookie.
            </p>
            <figure className="trail-card-sample">
              <p>Elf &amp; Seek</p>
              <img
                src="/markers/1.png"
                alt="Printed trail card: a black square with a white block pattern"
              />
              <small>Stop. Scan the square.</small>
            </figure>
          </div>
        </li>
        <li role="listitem">
          <span>03</span>
          <div>
            <h3>Make a little discovery</h3>
            <p>
              Answer each elf’s riddle. Collect cookies for the picnic.
            </p>
          </div>
        </li>
        <li role="listitem">
          <span>04</span>
          <div>
            <h3>Need a hint?</h3>
            <p>
              Open your field journal and choose Reveal hint.
            </p>
          </div>
        </li>
      </ol>
      <div className="soft-note">
        There’s no countdown. Stop to scan, explore at your own pace, and stay
        on the host’s property.
      </div>
      <button className="button primary full-width" onClick={onClose}>
        I’m ready to explore
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
      <span className="eyebrow">YOUR FIELD JOURNAL</span>
      <p>
        {total.elves} of 4 friends · {total.cookies} of 3 picnic cookies
      </p>
      <div className="journal-grid">
        {FINDS.map((find) => {
          const found = quest.found.includes(find.id);
          return (
            <button
              className={`journal-entry ${found ? "found" : ""} ${selected === find.id ? "selected" : ""}`}
              key={find.id}
              onClick={() => setSelected(find.id)}
              aria-label={`${find.name}, ${found ? "discovered" : "still hiding"}`}
            >
              <div className="journal-art">
                {find.kind === "elf" ? (
                  <Elf color={find.color} happy={found} />
                ) : (
                  <Cookie variant={find.id} />
                )}
              </div>
              <strong>{find.name}</strong>
              <small>{found ? "Found!" : "Still hiding"}</small>
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
                ? selectedFind.reward ||
                  "Safely tucked away for the moonlight picnic."
                : quest.hints.includes(selected)
                  ? selectedFind.hint
                  : "Every good explorer needs a nudge sometimes."}
            </p>
            {!selectedFound && !quest.hints.includes(selected) && (
              <button
                className="text-button"
                onClick={() => dispatch({ type: "hint", id: selected })}
              >
                <Icon name="sparkle" size={17} /> Reveal hint
              </button>
            )}
            {!selectedFound && captureOverride && (
              <button
                className="button primary full-width"
                data-testid="capture-override"
                onClick={() => onCollect?.(selected)}
              >
                Add without camera
                <Icon name="check" />
              </button>
            )}
          </>
        ) : (
          <p>Choose a friend or cookie to see its story or get a hint.</p>
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
        <span className="eyebrow">SEVEN FOR SEVEN</span>
        <h2 id="celebration-title">
          WOW —
          <br />
          you found <em>them all!</em>
        </h2>
        <p>
          Every friend, every cookie. The wishing tree is ready to light up the
          grove.
        </p>
        <button className="button primary full-width" onClick={onContinue}>
          Light the wishing tree
          <Icon name="sparkle" />
        </button>
      </section>
    </div>
  );
}

export function Encounter({ find, onCollect, onMistake, allowed, onClose }) {
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
        {find.kind === "elf" ? "A SMALL FRIEND, FOUND" : "A VERY GOOD FIND"}
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
            {wrong !== null
              ? "Almost! Have another little think."
              : "A little riddle to earn a little trust."}
          </p>
        </div>
      )}
      {solved && (
        <>
          <div className="reward-note">
            <Icon name="sparkle" />
            {find.reward || "One more treat for the moonlight picnic."}
          </div>
          <button
            className="button primary full-width"
            disabled={!allowed}
            onClick={onCollect}
          >
            {find.kind === "elf"
              ? `Invite ${find.name} along`
              : "Tuck it in my basket"}
            <Icon name="check" />
          </button>
        </>
      )}
      {!allowed && (
        <p role="status">Location check paused. Your discovery will wait.</p>
      )}
      <button className="text-button encounter-later" onClick={onClose}>
        Keep looking for now
      </button>
    </div>
  );
}

