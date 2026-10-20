// App knobs. Flip feature flags and the venue here — no rebuild gymnastics
// required beyond redeploy. This is a proximity fence, not a surveyed
// property boundary. See README.

import { theme } from "./theme.js";
import { accessibilityEmail, version } from "./version.js";

const venue = {
  name: "Superlo Foods",
  street: "4744 Spottswood Ave",
  city: "Memphis",
  region: "Tennessee",
  regionCode: "TN",
  postalCode: "38117",
  // US Census address geocoder match for 4744 Spottswood Ave (street-address estimate).
  // Calibrate on site; the 200 m radius covers store + lot either way.
  latitude: 35.112176,
  longitude: -89.903743,
  radiusMeters: 200,
  maxAccuracyMeters: 35,
  maxFixAgeMs: 30_000,
};

export const config = Object.freeze({
  version,
  accessibilityEmail,
  tagline: theme.tagline,
  // Canonical public play URL for share/copy results (not window.location).
  gameUrl: "https://ar-hide-n-seek.netlify.app",
  features: Object.freeze({
    // When true, a player outside the fence can still continue from
    // "Check my location". A fix inside the fence skips that step.
    locationOverride: true,
    // When true, Field journal can mark finds without scanning a trail card (dev / testing).
    itemCaptureOverride: true,
  }),
  venue: Object.freeze({
    ...venue,
    address: `${venue.street}, ${venue.city}, ${venue.regionCode} ${venue.postalCode}`,
  }),
});
