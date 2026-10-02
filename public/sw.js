/* Installable PWA shell — never cache HTML/JS so iOS home-screen always
   picks up new deploys. Icons stay optional; navigation is network-only. */
const CACHE = "elf-seek-v3";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // Always hit the network for documents / navigations / scripts / styles.
  // Stale cache was freezing the iOS home-screen shortcut on old HTML.
  if (
    req.mode === "navigate" ||
    req.destination === "document" ||
    req.destination === "script" ||
    req.destination === "style" ||
    req.destination === "worker" ||
    req.url.includes("/assets/") ||
    req.url.endsWith(".html") ||
    req.url.endsWith("/sw.js") ||
    req.url.endsWith("manifest.webmanifest")
  ) {
    event.respondWith(fetch(req));
    return;
  }
  // Icons only: cache after first network hit.
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req)),
  );
});
