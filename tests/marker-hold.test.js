import test from "node:test";
import assert from "node:assert/strict";
import { holdMarker } from "../src/game/tracker.js";

const fresh = () => ({ seenAt: null, missingAt: null, shown: false });

test("a skittering barcode does not show or hide the model", () => {
  const state = fresh();
  for (let now = 0; now < 400; now += 16) {
    holdMarker(state, now % 32 < 16, now);
    assert.equal(state.shown, false);
  }
  const steady = fresh();
  for (let now = 0; now < 200; now += 16) holdMarker(steady, true, now);
  assert.equal(steady.shown, false);
  holdMarker(steady, true, 200);
  assert.equal(steady.shown, true);
  holdMarker(steady, false, 210);
  holdMarker(steady, true, 230);
  assert.equal(steady.shown, true);
  holdMarker(steady, false, 230);
  holdMarker(steady, false, 429);
  assert.equal(steady.shown, true);
  holdMarker(steady, false, 430);
  assert.equal(steady.shown, false);
});
