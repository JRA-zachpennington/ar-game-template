import { VENUE } from "./quest.js";

export function distanceMeters(a, b) {
  const rad = (value) => (value * Math.PI) / 180;
  const deltaLat = rad(b.latitude - a.latitude);
  const deltaLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
      Math.cos(rad(b.latitude)) *
      Math.sin(deltaLng / 2) ** 2;
  return (
    6_371_000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)))
  );
}

export function assessLocation(fix, now = Date.now(), venue = VENUE) {
  if (!fix) return { status: "idle", allowed: false };
  const { latitude, longitude, accuracy, timestamp } = fix;
  if (
    ![latitude, longitude, accuracy, timestamp].every(Number.isFinite) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180 ||
    accuracy < 0 ||
    timestamp > now + 1000
  ) {
    return { status: "unavailable", allowed: false };
  }
  if (now - timestamp > venue.maxFixAgeMs)
    return { status: "stale", allowed: false };
  const distance = distanceMeters(fix, venue);
  if (accuracy > venue.maxAccuracyMeters)
    return { status: "uncertain", allowed: false, distance, accuracy };
  if (distance - accuracy > venue.radiusMeters)
    return { status: "outside", allowed: false, distance, accuracy };
  // Require the entire reported accuracy circle to fit. A vague fix must never
  // enlarge the fence past the configured radius.
  if (distance + accuracy > venue.radiusMeters)
    return { status: "boundary", allowed: false, distance, accuracy };
  return { status: "inside", allowed: true, distance, accuracy };
}

export const LOCATION_STATUS = {
  idle: "Location not checked",
  checking: "Finding your location",
  inside: "In the grove",
  override: "In the grove",
  outside: "Outside the grove",
  boundary: "Near the edge",
  uncertain: "Location unclear",
  stale: "Location expired",
  denied: "Location off",
  unavailable: "Location not found",
  timeout: "Location not found",
  insecure: "Location unavailable",
  unsupported: "Location unavailable",
};

export const LOCATION_COPY = {
  idle: ["This hunt opens at the Brierbrook Grove.", ""],
  checking: [
    "Finding the grove…",
    "Allow location access when your browser asks. An accurate fix may take a moment.",
  ],
  inside: [
    "You’re in the grove",
    "Your location is ready. Let’s find some very small friends.",
  ],
  override: [
    "You’re in the grove",
    "This build skips the GPS check.",
  ],
  outside: [
    "The grove is a little farther away",
    "The hunt only opens at the address below. Come back when you arrive.",
  ],
  boundary: [
    "You’re near the edge",
    "GPS can’t yet place you fully inside the play area. Stay on the host’s property and check again.",
  ],
  uncertain: [
    "A clearer signal, please",
    "Your location is too approximate. Enable precise location and try a clear view of the sky.",
  ],
  stale: [
    "Let’s check your location again",
    "Your last location has expired. Check again to keep collecting.",
  ],
  denied: [
    "Location access is off",
    "Allow location for this site in your browser settings, enable Precise Location on your phone, then try again.",
  ],
  unavailable: [
    "We can’t find your location yet",
    "Check that Location Services are on, then try again outside.",
  ],
  timeout: [
    "The location check took a little long",
    "Try again with a clearer view of the sky.",
  ],
  insecure: [
    "Open the secure game link",
    "Location and camera access need HTTPS. Open the HTTPS version of this site in Safari or Chrome.",
  ],
  unsupported: [
    "Location isn’t available here",
    "Open this game in a current Safari or Chrome browser on your phone.",
  ],
};
