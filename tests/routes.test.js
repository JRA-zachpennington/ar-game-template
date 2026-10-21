import assert from "node:assert/strict";
import test from "node:test";
import {
  isAppPath,
  pathForScreen,
  screenFromPath,
} from "../src/game/routes.js";

test("each game mode has a path", () => {
  assert.equal(screenFromPath("/"), "home");
  assert.equal(screenFromPath("/instructions"), "setup");
  assert.equal(screenFromPath("/instructions/"), "setup");
  assert.equal(screenFromPath("/game"), "play");
  assert.equal(screenFromPath("/win"), "victory");
  assert.equal(screenFromPath("/journal"), "journal");
  assert.equal(pathForScreen("home"), "/");
  assert.equal(pathForScreen("setup"), "/instructions");
  assert.equal(pathForScreen("play"), "/game");
  assert.equal(pathForScreen("victory"), "/win");
  assert.equal(pathForScreen("journal"), "/journal");
});

test("briefing audio under /instructions/ is not a screen", () => {
  assert.equal(isAppPath("/instructions/1-rule.mp3"), false);
  assert.equal(screenFromPath("/instructions/1-rule.mp3"), "home");
  assert.equal(isAppPath("/accessibility"), false);
});

test("paths round-trip under a base url", () => {
  assert.equal(pathForScreen("play", "/app/"), "/app/game");
  assert.equal(screenFromPath("/app/win/", "/app/"), "victory");
  assert.equal(isAppPath("/app/instructions", "/app/"), true);
});
