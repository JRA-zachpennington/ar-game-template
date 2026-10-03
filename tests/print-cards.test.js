import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../src/App.css"),
  "utf8",
);

test("print stylesheet forces a page break after each trail card", () => {
  const printBlock = css.split("@media print")[1];
  assert.ok(printBlock, "missing @media print block");
  assert.match(printBlock, /size:\s*letter\s+landscape/);
  assert.match(printBlock, /\.print-card\s*\{[^}]*break-after:\s*page/s);
  assert.match(printBlock, /\.print-card\s*\{[^}]*page-break-after:\s*always/s);
  assert.match(
    printBlock,
    /\.print-card\s*\+\s*\.print-card\s*\{[^}]*break-before:\s*page/s,
  );
  assert.match(
    printBlock,
    /\.print-card\s*\+\s*\.print-card\s*\{[^}]*page-break-before:\s*always/s,
  );
  assert.match(printBlock, /display:\s*block\s*!important/);
});
