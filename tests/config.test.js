import test from "node:test";
import assert from "node:assert/strict";
import { config } from "../src/game/config.js";
import { LOCATION_COPY } from "../src/game/geofence.js";

test("locationOverride is available for players outside the fence", () => {
  assert.equal(typeof config.features.locationOverride, "boolean");
  assert.equal(config.features.locationOverride, true);
  assert.ok(LOCATION_COPY.override?.[0]);
});

test("itemCaptureOverride feature flag marks finds without the camera", () => {
  assert.equal(typeof config.features.itemCaptureOverride, "boolean");
  assert.equal(config.features.itemCaptureOverride, true);
});

test("gameUrl is the canonical public play link for share results", () => {
  assert.match(config.gameUrl, /^https:\/\//);
  assert.match(config.gameUrl, /netlify\.app/);
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
