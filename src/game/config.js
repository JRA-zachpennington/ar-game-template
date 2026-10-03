// App knobs. Flip feature flags and the venue here — no rebuild gymnastics
// required beyond redeploy. This is a proximity fence, not a surveyed
// property boundary. See README.

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
  tagline: "A Brierbrook Adventure",
  features: Object.freeze({
    // When true, skip GPS and treat the player as inside the grove (dev / remote testing).
    locationOverride: true,
  }),
  venue: Object.freeze({
    ...venue,
    address: `${venue.street}, ${venue.city}, ${venue.regionCode} ${venue.postalCode}`,
  }),
});
