'use client';

import { useEffect } from 'react';

const RELOAD_MARKER = 'andgatepos_pwa_reload_at';
const RELOAD_COOLDOWN_MS = 30000;

const shouldReloadForUpdate = () => {
    const lastReload = Number(sessionStorage.getItem(RELOAD_MARKER) || 0);
    const now = Date.now();

    if (Number.isFinite(lastReload) && now - lastReload < RELOAD_COOLDOWN_MS) {
        return false;
    }

    sessionStorage.setItem(RELOAD_MARKER, String(now));
    return true;
};

export default function PWAUpdateManager() {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        let refreshing = false;

        const reloadForUpdate = () => {
            if (refreshing || !shouldReloadForUpdate()) return;
            refreshing = true;
            window.location.reload();
        };

        const activateWaitingWorker = (registration: ServiceWorkerRegistration) => {
            if (!registration.waiting) return;
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            reloadForUpdate();
        };

        const onControllerChange = () => reloadForUpdate();

        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

        navigator.serviceWorker.ready
            .then((registration) => {
                activateWaitingWorker(registration);

                registration.addEventListener('updatefound', () => {
                    const worker = registration.installing;
                    if (!worker) return;

                    worker.addEventListener('statechange', () => {
                        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                            activateWaitingWorker(registration);
                            reloadForUpdate();
                        }
                    });
                });

                registration.update().catch(() => {});
            })
            .catch(() => {});

        return () => {
            navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
        };
    }, []);

    return null;
}
