// App knobs. Flip feature flags and the venue here — no rebuild gymnastics
// required beyond redeploy. This is a proximity fence, not a surveyed
// property boundary. See README.

import pkg from "../../package.json" with { type: "json" };

const venue = {
  name: "The Brierbrook Grove",
  street: "1860 Brierbrook Rd",
  city: "Germantown",
  region: "Tennessee",
  regionCode: "TN",
  postalCode: "38138",
  // Property map pin, cross-checked against the Census street-address match.
  latitude: 35.0982848,
  longitude: -89.7970858,
  radiusMeters: 200,
  maxAccuracyMeters: 35,
  maxFixAgeMs: 30_000,
};

export const config = Object.freeze({
  version: pkg.version,
  tagline: "A Brierbrook Adventure",
  // Canonical public play URL for share/copy results (not window.location).
  gameUrl: "https://ar-hide-n-seek.netlify.app",
  features: Object.freeze({
    // When true, skip GPS and treat the player as inside the grove (dev / remote testing).
    locationOverride: true,
    // When true, Field journal can mark finds without scanning a trail card (dev / testing).
    itemCaptureOverride: true,
  }),
  venue: Object.freeze({
    ...venue,
    address: `${venue.street}, ${venue.city}, ${venue.regionCode} ${venue.postalCode}`,
  }),
});
