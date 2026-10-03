import test from "node:test";
import assert from "node:assert/strict";
import { config } from "../src/game/config.js";
import { LOCATION_COPY } from "../src/game/geofence.js";

test("locationOverride feature flag skips the GPS check", () => {
  assert.equal(typeof config.features.locationOverride, "boolean");
  assert.equal(config.features.locationOverride, true);
  assert.ok(LOCATION_COPY.override?.[0]);
});

test("venue address and coordinates are configured in one place", () => {
  const { venue } = config;
  assert.equal(
    venue.address,
    `${venue.street}, ${venue.city}, ${venue.regionCode} ${venue.postalCode}`,
  );
  assert.equal(typeof venue.name, "string");
  assert.equal(typeof config.tagline, "string");
  assert.ok(config.tagline.length > 0);
  assert.match(config.version, /^\d+\.\d+\.\d+$/);
  assert.equal(typeof venue.latitude, "number");
  assert.equal(typeof venue.longitude, "number");
  assert.ok(venue.radiusMeters > 0);
  assert.ok(venue.maxAccuracyMeters > 0);
  assert.ok(venue.maxFixAgeMs > 0);
});
