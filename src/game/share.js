import { findById } from "./quest.js";
import { copy, theme } from "./theme.js";

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
    .map((id) =>
      findById(id)?.kind === "cookie" ? theme.treatEmoji : theme.seekerEmoji,
    )
    .join("");
  const squares = found
    .map((id) => (findById(id)?.kind === "cookie" ? "🟨" : "🟩"))
    .join("");
  const perfect = hints === 0 && mistakes === 0;
  const solution = perfect
    ? copy.sharePerfect
    : [copy.shareHints(hints), copy.shareMisses(mistakes)].join(" · ") +
      ` — ${copy.shareAlmost}`;

  const text = [
    `${theme.title} · ${tagline}`,
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
    title: theme.title,
    text,
    url,
    tweetUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  };
}

export function shouldCelebrate({ screen, gathered, allowed, already }) {
  return screen === "play" && gathered && allowed && !already;
}
