import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as elf from "../src/game/themes/elf/theme.js";
import * as unicorn from "../src/game/themes/unicorn/theme.js";

test("unicorn skin matches the elf slots and copy keys", () => {
  assert.equal(unicorn.theme.id, "unicorn");
  assert.deepEqual(
    unicorn.theme.finds.map((find) => `${find.id}:${find.kind}`).sort(),
    elf.theme.finds.map((find) => `${find.id}:${find.kind}`).sort(),
  );
  for (const find of unicorn.theme.finds) {
    assert.ok(find.name.trim());
    assert.ok(find.hint.trim());
    assert.match(find.color, /^#[0-9a-f]{6}$/i);
  }
  assert.deepEqual(
    Object.keys(unicorn.copy).sort(),
    Object.keys(elf.copy).sort(),
  );
  assert.deepEqual(
    Object.keys(unicorn.locationStatus).sort(),
    Object.keys(elf.locationStatus).sort(),
  );
  assert.deepEqual(
    Object.keys(unicorn.locationCopy).sort(),
    Object.keys(elf.locationCopy).sort(),
  );
});

test("hints point at grocery zones and nothing says Brierbrook", () => {
  for (const skin of [elf, unicorn]) {
    const hints = skin.theme.finds.map((find) => find.hint);
    assert.ok(hints.filter((h) => /center aisle/i.test(h)).length >= 2);
    assert.ok(hints.some((h) => /dairy/i.test(h)));
    assert.ok(hints.some((h) => /banana/i.test(h)));
    // Values only: the `backToGrove` key name stays, its text must not.
    const values = (_, v) =>
      v && typeof v === "object" && !Array.isArray(v) ? Object.values(v) : v;
    assert.doesNotMatch(
      JSON.stringify([skin.theme, skin.copy, skin.locationStatus, skin.locationCopy], values),
      /brierbrook|grove|meadow/i,
    );
  }
});

test("both skins share one briefing script, with a small mp3 pair per step", () => {
  assert.deepEqual(unicorn.copy.briefing, elf.copy.briefing);
  for (const [index] of elf.copy.briefing.entries()) {
    for (const part of ["rule", "line"]) {
      const file = `public/instructions/${index + 1}-${part}.mp3`;
      const bytes = readFileSync(file);
      const id3 = bytes.toString("ascii", 0, 3) === "ID3";
      const frame = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
      assert.ok(id3 || frame, file);
      assert.ok(bytes.length < 40_000, `${file} is ${bytes.length} bytes`);
    }
  }
  const miss = readFileSync("public/instructions/miss.wav");
  assert.equal(miss.toString("ascii", 0, 4), "RIFF");
  assert.equal(miss.readUInt32LE(24), 22050);
  assert.ok(miss.length < 40_000);
});
