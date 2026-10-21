import test from "node:test";
import assert from "node:assert/strict";
import { config, mapsHref } from "../src/game/config.js";
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
  // check.
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

test("venue link opens Apple Maps on iPhone and Google Maps elsewhere", () => {
  const { venue } = config;
  const place = `${venue.name}, ${venue.address}`;
  const iphone = mapsHref(venue, {
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
  });
  assert.match(iphone, /^https:\/\/maps\.apple\.com\/\?ll=35\.112176,-89\.903743&q=/);
  assert.equal(decodeURIComponent(iphone.split("q=")[1]), place);
  const desktop = mapsHref(venue, { userAgent: "Mozilla/5.0 (Windows NT 10.0)" });
  assert.match(desktop, /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
  assert.equal(decodeURIComponent(desktop.split("query=")[1]), place);
});
