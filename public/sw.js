// Retire the prototype's service worker. Existing installations update this same
// URL, then navigate to the new game. New installs do not register a worker.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await self.registration.unregister();
    const windows = await self.clients.matchAll({ type: 'window' });
    await Promise.all(windows.filter(client => client.url.startsWith(self.registration.scope)).map(client => client.navigate(client.url)));
  })());
});
