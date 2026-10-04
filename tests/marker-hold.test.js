import test from "node:test";
import assert from "node:assert/strict";
import { holdIfUpdated, holdMarker } from "../src/game/tracker.js";

const fresh = () => ({ lastAt: null, score: 0, shown: false });
const HOLD = 200;

test("a skittering barcode does not show or hide the model", () => {
  const state = fresh();
  for (let now = 0; now < 400; now += 16) {
    holdMarker(state, now % 32 < 16, now);
    assert.equal(state.shown, false);
  }
  const steady = fresh();
  // Charge in uneven steps — lock when score meets or exceeds HOLD, not at a
  // magic wall-clock tick.
  for (const now of [0, 16, 40, 70, 110, 160, 199]) holdMarker(steady, true, now);
  assert.ok(steady.score < HOLD);
  assert.equal(steady.shown, false);
  holdMarker(steady, true, 220);
  assert.ok(steady.score >= HOLD);
  assert.equal(steady.shown, true);
  holdMarker(steady, false, 230);
  holdMarker(steady, true, 250);
  assert.equal(steady.shown, true);
  // Still shown until fully drained (meets-or-exceeds HOLD of miss time).
  holdMarker(steady, false, 250);
  holdMarker(steady, false, 449);
  assert.ok(steady.score > 0);
  assert.equal(steady.shown, true);
  holdMarker(steady, false, 460);
  assert.ok(steady.score <= 0);
  assert.equal(steady.shown, false);
});

test("render frames between detector ticks are not misses", () => {
  const state = fresh();
  // 60fps drawing, 30fps detector, barcode present on every detector tick.
  for (let now = 0; now <= 400; now += 16) {
    holdIfUpdated(state, true, now % 32 === 0, now);
  }
  assert.ok(state.score >= HOLD);
  assert.equal(state.shown, true);

  const blip = fresh();
  holdIfUpdated(blip, true, true, 0);
  holdIfUpdated(blip, true, false, 16);
  assert.ok(blip.score < HOLD);
  assert.equal(blip.shown, false);
});

test("brief outdoor flicker still reaches a lock", () => {
  const state = fresh();
  // ~90% duty: one missed frame every 10 — the old seenAt reset never locked.
  for (let now = 0; now <= 400; now += 16) {
    holdMarker(state, now % 160 < 144, now);
  }
  assert.ok(state.score >= HOLD);
  assert.equal(state.shown, true);
});
