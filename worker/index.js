// Remove the document cache introduced in June 2026. Cached Next.js HTML can
// reference a different deployment's chunks and break every client transition.
self.addEventListener('activate', (event) => {
    event.waitUntil(caches.delete('pages-cache'));
});

self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (_) {
        data = { title: 'AndgatePOS', body: event.data ? event.data.text() : '' };
    }

    const title = data.title || 'AndgatePOS';
    const options = {
        body: data.body || data.message || '',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: data.tag || 'andgate-notification',
        data: { url: data.action_url || '/dashboard' },
        vibrate: [200, 100, 200],
        requireInteraction: data.severity === 'critical',
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/dashboard';

    event.waitUntil(
        clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url.includes(url) && 'focus' in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow(url);
            })
    );
});
