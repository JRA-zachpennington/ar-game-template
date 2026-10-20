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

test("accessibilityEmail is a single, well-formed address for the statement", () => {
  // The host sets this in package.json; a blank or malformed value fails the
  // check. The placeholder is the RFC 2606 example domain until the host sets a
  // real mailbox (tracked in the task folder), not an invented real address.
  assert.equal(typeof config.accessibilityEmail, "string");
  assert.match(config.accessibilityEmail, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
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
  assert.equal(venue.name, "Superlo Foods");
  assert.equal(venue.postalCode, "38117");
  assert.equal(config.tagline, "A grocery adventure");
  assert.match(config.version, /^\d+\.\d+\.\d+(\.\d+)?$/);
  assert.equal(typeof venue.latitude, "number");
  assert.equal(typeof venue.longitude, "number");
  assert.ok(venue.radiusMeters > 0);
  assert.ok(venue.maxAccuracyMeters > 0);
  assert.ok(venue.maxFixAgeMs > 0);
});
