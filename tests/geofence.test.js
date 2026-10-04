import test from "node:test";
import assert from "node:assert/strict";
import {
  assessLocation,
  distanceMeters,
  presentLocation,
} from "../src/game/geofence.js";
import { VENUE } from "../src/game/quest.js";
const now = 1_800_000_000_000;
const fix = (changes) => ({
  latitude: VENUE.latitude,
  longitude: VENUE.longitude,
  accuracy: 8,
  timestamp: now,
  ...changes,
});

test("admits a recent precise venue fix and computes distance in meters", () => {
  assert.equal(assessLocation(fix(), now).allowed, true);
  assert.equal(distanceMeters(VENUE, VENUE), 0);
  assert.ok(
    Math.abs(
      distanceMeters(VENUE, { ...VENUE, latitude: VENUE.latitude + 0.001 }) -
        111.19,
    ) < 0.1,
  );
});
test("outside, boundary-overlapping, and coarse fixes fail closed", () => {
  assert.equal(
    assessLocation(fix({ latitude: VENUE.latitude + 0.002 }), now).status,
    "outside",
  );
  assert.equal(
    assessLocation(
      fix({
        latitude: VENUE.latitude + (VENUE.radiusMeters - 10) / 111_195,
        accuracy: 15,
      }),
      now,
    ).status,
    "boundary",
  );
  assert.equal(assessLocation(fix({ accuracy: 200 }), now).allowed, false);
  assert.equal(assessLocation(fix({ accuracy: 36 }), now).status, "uncertain");
});
test("fix freshness expires even without a new geolocation event", () => {
  assert.equal(assessLocation(fix(), now + 30000).allowed, true);
  assert.equal(assessLocation(fix(), now + 30001).status, "stale");
});
test("missing, invalid, out-of-range and future fixes cannot authorize collection", () => {
  for (const data of [
    null,
    fix({ accuracy: NaN }),
    fix({ accuracy: -1 }),
    fix({ latitude: 91 }),
    fix({ longitude: 181 }),
    fix({ timestamp: now + 2000 }),
    fix({ timestamp: undefined }),
  ])
    assert.equal(assessLocation(data, now).allowed, false);
});
test("an on-site fix skips the location card, including when override is on", () => {
  const inside = assessLocation(fix(), now);
  assert.equal(presentLocation(inside, { override: false, requested: false }).allowed, true);
  assert.equal(presentLocation(inside, { override: true, requested: false }).status, "inside");
});
test("override keeps Check my location when the fix is outside the fence", () => {
  const outside = assessLocation(fix({ latitude: VENUE.latitude + 0.002 }), now);
  assert.equal(outside.status, "outside");
  assert.deepEqual(
    presentLocation(outside, { override: true, requested: false }),
    { status: "idle", allowed: false },
  );
  assert.equal(
    presentLocation(outside, { override: true, requested: true }).allowed,
    true,
  );
  assert.equal(
    presentLocation(outside, { override: false, requested: false }).status,
    "outside",
  );
});
test("the uncertainty circle cannot be used to expand the play area", () => {
  for (let distance = VENUE.radiusMeters; distance < 500; distance += 10)
    for (let accuracy = 5; accuracy < 200; accuracy += 10) {
      assert.equal(
        assessLocation(
          fix({ latitude: VENUE.latitude + distance / 111195, accuracy }),
          now,
        ).allowed,
        false,
      );
    }
});
