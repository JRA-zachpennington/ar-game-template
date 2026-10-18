import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("PWA manifest is standalone with home-screen icons", () => {
  const manifest = JSON.parse(
    readFileSync(new URL("../public/manifest.webmanifest", import.meta.url)),
  );
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /apple-mobile-web-app-capable" content="yes"/);
  assert.match(html, /rel="manifest"/);
  assert.match(html, /viewport-fit=cover/);
  const css = readFileSync(new URL("../src/App.css", import.meta.url), "utf8");
  assert.doesNotMatch(css, /max\(40px, env\(safe-area-inset-top/);
  assert.match(css, /@media \(display-mode: standalone\)/);
  const sw = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(sw, /elf-seek-v3/);
  assert.match(sw, /mode === "navigate"/);
});
