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
});
