import test from "node:test";
import assert from "node:assert/strict";
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
