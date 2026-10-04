import { findById } from "./quest.js";

/** Wordle-style clipboard paste for the post-hunt share moment. */
export function victoryShare({
  tagline,
  venue,
  url,
  time,
  found = [],
  hints = 0,
  mistakes = 0,
}) {
  const grid = found
    .map((id) => (findById(id)?.kind === "cookie" ? "🍪" : "🧝"))
    .join("");
  const squares = found
    .map((id) => (findById(id)?.kind === "cookie" ? "🟨" : "🟩"))
    .join("");
  const perfect = hints === 0 && mistakes === 0;
  const solution = perfect
    ? "Perfect picnic — no hints, no wrong guesses!"
    : [
        hints === 0 ? "0 hints" : `${hints} hint${hints === 1 ? "" : "s"}`,
        mistakes === 0
          ? "0 misses"
          : `${mistakes} miss${mistakes === 1 ? "" : "es"}`,
      ].join(" · ") + " — still a Friend of the grove.";

  const text = [
    `Elf & Seek · ${tagline}`,
    `${venue.name} · ${venue.city}, ${venue.regionCode}`,
    `⏱️ ${time}`,
    "",
    grid || "🧝🧝🧝🧝🍪🍪🍪",
    squares || "🟩🟩🟩🟩🟨🟨🟨",
    "",
    solution,
    url,
  ].join("\n");

  return {
    title: "Elf & Seek",
    text,
    url,
    tweetUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  };
}

export function shouldCelebrate({ screen, gathered, allowed, already }) {
  return screen === "play" && gathered && allowed && !already;
}
