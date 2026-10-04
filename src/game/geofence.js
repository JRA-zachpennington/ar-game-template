import { VENUE } from "./quest.js";
import { locationCopy, locationStatus } from "./theme.js";

export const LOCATION_STATUS = locationStatus;
export const LOCATION_COPY = locationCopy;

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

// On-site players skip the location card. Override keeps that card only when
// the fix is outside the fence, until the player chooses to continue.
export function presentLocation(assessment, { override, requested }) {
  if (assessment.allowed) return assessment;
  if (override && requested) {
    return {
      status: "override",
      allowed: true,
      distance: assessment.distance,
      accuracy: assessment.accuracy,
    };
  }
  if (override && assessment.status === "outside") {
    return { status: "idle", allowed: false };
  }
  return assessment;
}

