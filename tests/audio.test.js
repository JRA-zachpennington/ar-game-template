import test from "node:test";
import assert from "node:assert/strict";

let built = 0;
let resumed = 0;
let listened = 0;
const listeners = {};
globalThis.window = {
  AudioContext: class {
    constructor() {
      built++;
    }
    resume() {
      resumed++;
      return Promise.resolve();
    }
  },
};
globalThis.document = {
  addEventListener: (type, fn) => {
    listened++;
    listeners[type] = fn;
  },
};
const { warmAudio, chime } = await import("../src/game/audio.js");

test("warming twice builds one suspended context and resumes nothing before a gesture", () => {
  warmAudio();
  warmAudio();
  assert.equal(built, 1);
  assert.equal(resumed, 0);
  assert.equal(listened, 2); // pointerdown + keydown, once, not per call
});
test("the first tap anywhere resumes the warmed context", () => {
  listeners.pointerdown();
  assert.equal(resumed, 1);
});
test("a chime while sound is off does nothing", () => {
  chime("find", false);
  assert.equal(built, 1);
  assert.equal(resumed, 1);
});
test("without Web Audio, warming and chiming stay silent and do not throw", async () => {
  window.AudioContext = undefined;
  const silent = await import("../src/game/audio.js?no-web-audio");
  silent.warmAudio();
  silent.chime("find", true);
  assert.equal(built, 1);
});
