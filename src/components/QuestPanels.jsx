import { useState } from "react";
import { Elf, Cookie } from "../art/Illustrations.jsx";
import { FINDS, VENUE, asset, findById } from "../game/quest.js";
import { counts } from "../game/state.js";
import { Icon } from "./Icon.jsx";

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
          </div>
        </li>
        <li role="listitem">
          <span>03</span>
          <div>
            <h3>Make a little discovery</h3>
            <p>
              Answer each elf’s riddle. Collect cookies for the picnic. Open
              your field journal whenever you need a hint.
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

export function Journal({ quest, dispatch }) {
  const [selected, setSelected] = useState(null);
  const total = counts(quest);
  return (
    <div className="journal-panel">
      <span className="eyebrow">YOUR FIELD JOURNAL</span>
      <h2>
        Little <em>discoveries.</em>
      </h2>
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
        {selected ? (
          <>
            <h3>{findById(selected).name}</h3>
            <p>
              {quest.found.includes(selected)
                ? findById(selected).reward ||
                  "Safely tucked away for the moonlight picnic."
                : quest.hints.includes(selected)
                  ? findById(selected).hint
                  : "Every good explorer needs a nudge sometimes."}
            </p>
            {!quest.found.includes(selected) &&
              !quest.hints.includes(selected) && (
                <button
                  className="text-button"
                  onClick={() => dispatch({ type: "hint", id: selected })}
                >
                  <Icon name="sparkle" size={17} /> Reveal a gentle hint
                </button>
              )}
          </>
        ) : (
          <p>Choose a friend or cookie to see its story or get a hint.</p>
        )}
      </div>
      <small className="muted">
        Hints suggest hiding spots. Your host chooses exactly where the cards
        go.
      </small>
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

export function HostKit() {
  return (
    <div className="host-panel">
      <div className="no-print">
        <span className="eyebrow">FOR THE ADVENTURE MAKER</span>
        <h2>
          Make a little <em>magic.</em>
        </h2>
        <p>
          Print these seven cards at 100% scale. Keep the black squares flat,
          uncovered, and well lit. Hide them at easy-to-reach spots on the
          host’s property, away from roads and hazards.
        </p>
        <div className="soft-note">
          This hunt is set at <strong>{VENUE.address}</strong>. Try every card
          with a phone before guests arrive. The GPS fence is an approximate 60
          m circle, not a property boundary.
        </div>
        <button className="button primary" onClick={() => window.print()}>
          <Icon name="print" /> Print trail cards
        </button>
      </div>
      <div className="print-cards">
        {FINDS.map((find) => (
          <article className="print-card" key={find.id}>
            <span className="eyebrow">ELF & SEEK · BRIERBROOK GROVE</span>
            <h3>{find.name}</h3>
            <p>{find.role}</p>
            <img
              src={asset(`markers/${find.id}.png`)}
              alt={`AR barcode ${find.id} for ${find.name}`}
              loading="eager"
            />
            <span className="print-card-footer">
              Stop. Scan the square. Find a little magic.
            </span>
            <small className="no-print">
              Suggested hiding clue: {find.hint}
            </small>
          </article>
        ))}
      </div>
    </div>
  );
}
