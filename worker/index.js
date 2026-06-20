// Remove the document cache introduced in June 2026. Cached Next.js HTML can
// reference a different deployment's chunks and break every client transition.
self.addEventListener('activate', (event) => {
    event.waitUntil(caches.delete('pages-cache'));
});
