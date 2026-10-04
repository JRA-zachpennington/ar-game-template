import test from "node:test";
import assert from "node:assert/strict";
import { shouldCelebrate, victoryShare } from "../src/game/share.js";

test("shouldCelebrate only when the hunt just finished on the play screen", () => {
  assert.equal(
    shouldCelebrate({
      screen: "play",
      gathered: true,
      allowed: true,
      already: false,
    }),
    true,
  );
  assert.equal(
    shouldCelebrate({
      screen: "play",
      gathered: true,
      allowed: true,
      already: true,
    }),
    false,
  );
  assert.equal(
    shouldCelebrate({
      screen: "home",
      gathered: true,
      allowed: true,
      already: false,
    }),
    false,
  );
  assert.equal(
    shouldCelebrate({
      screen: "play",
      gathered: false,
      allowed: true,
      already: false,
    }),
    false,
  );
});

test("victoryShare builds a Wordle-style clipboard block", () => {
  const share = victoryShare({
    tagline: "A Brierbrook Adventure",
    venue: {
      name: "The Brierbrook Grove",
      city: "Germantown",
      regionCode: "TN",
    },
    url: "https://example.test/",
    time: "3:05",
    found: [4, 1, 5, 2, 6, 3, 7],
    hints: 0,
    mistakes: 0,
  });
  assert.equal(share.title, "Elf & Seek");
  assert.match(share.text, /^Elf & Seek · A Brierbrook Adventure/m);
  assert.match(share.text, /The Brierbrook Grove · Germantown, TN/);
  assert.match(share.text, /⏱️ 3:05/);
  assert.match(share.text, /🧝🍪🧝🍪🧝🍪🧝/);
  assert.match(share.text, /🟩🟨🟩🟨🟩🟨🟩/);
  assert.match(share.text, /Perfect picnic/);
  assert.match(share.text, /https:\/\/example\.test\//);
  assert.equal(share.text.includes("WOW"), false);
  assert.match(share.tweetUrl, /^https:\/\/twitter\.com\/intent\/tweet\?/);
});

test("victoryShare solution line reflects hints and misses", () => {
  const share = victoryShare({
    tagline: "A Brierbrook Adventure",
    venue: {
      name: "The Brierbrook Grove",
      city: "Germantown",
      regionCode: "TN",
    },
    url: "https://example.test/",
    time: "12:00",
    found: [4, 5, 6, 7, 1, 2, 3],
    hints: 2,
    mistakes: 1,
  });
  assert.match(share.text, /2 hints · 1 miss/);
  assert.match(share.text, /Friend of the grove/);
  assert.doesNotMatch(share.text, /Perfect picnic/);
});
