import test from "node:test";
import assert from "node:assert/strict";
import {
  initialQuest,
  questReducer,
  isGathered,
  readQuest,
  writeQuest,
  counts,
} from "../src/game/state.js";
import { FINDS } from "../src/game/quest.js";

test("original seven marker IDs, unique scoring, and location gating", () => {
  let state = initialQuest();
  assert.deepEqual(
    questReducer(state, { type: "collect", id: 4, allowed: false }),
    state,
  );
  assert.deepEqual(
    questReducer(state, { type: "collect", id: 999, allowed: true }),
    state,
  );
  for (const find of FINDS) {
    state = questReducer(state, {
      type: "collect",
      id: find.id,
      allowed: true,
    });
    state = questReducer(state, {
      type: "collect",
      id: find.id,
      allowed: true,
    });
  }
  assert.equal(state.found.length, 7);
  assert.deepEqual(counts(state), { elves: 4, cookies: 3 });
  assert.equal(isGathered(state), true);
  assert.equal(
    questReducer(state, { type: "complete", allowed: false }).complete,
    false,
  );
  assert.equal(
    questReducer(state, { type: "complete", allowed: true }).complete,
    true,
  );
});
test("incomplete hunts cannot finish and a new hunt clears everything", () => {
  const state = questReducer(initialQuest(), {
    type: "collect",
    id: 1,
    allowed: true,
  });
  assert.equal(
    questReducer(state, { type: "complete", allowed: true }).complete,
    false,
  );
  assert.deepEqual(questReducer(state, { type: "reset" }), initialQuest());
});
test("restoration sanitizes corruption, duplicates, unsupported versions and impossible victories", () => {
  const load = (value) => readQuest({ getItem: () => value });
  assert.deepEqual(load("not json"), initialQuest());
  assert.deepEqual(load('{"version":8}'), initialQuest());
  const state = load(
    JSON.stringify({
      version: 1,
      found: [1, 1, 999, "4", 5],
      hints: [4, 4, null],
      elapsed: -2,
      mistakes: -8,
      complete: true,
    }),
  );
  assert.deepEqual(state.found, [1, 5]);
  assert.deepEqual(state.hints, [4]);
  assert.equal(state.complete, false);
  assert.equal(state.elapsed, 0);
  assert.equal(state.mistakes, 0);
});
test("storage failures never prevent play, and persistence contains no GPS or camera data", () => {
  const unavailable = {
    getItem: () => {
      throw Error("Blocked");
    },
    setItem: () => {
      throw Error("Full");
    },
  };
  assert.deepEqual(readQuest(unavailable), initialQuest());
  assert.equal(writeQuest(initialQuest(), unavailable), false);
  let saved;
  writeQuest(initialQuest(), {
    setItem: (_key, value) => {
      saved = JSON.parse(value);
    },
  });
  assert.deepEqual(Object.keys(saved).sort(), [
    "complete",
    "elapsed",
    "found",
    "hints",
    "mistakes",
    "version",
  ]);
});
