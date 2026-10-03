import test from "node:test";
import assert from "node:assert/strict";
import { config } from "../src/game/config.js";
import { LOCATION_COPY } from "../src/game/geofence.js";

test("locationOverride feature flag is configurable and off for guests", () => {
  assert.equal(typeof config.features.locationOverride, "boolean");
  assert.equal(config.features.locationOverride, false);
  assert.ok(LOCATION_COPY.override?.[0]);
});
