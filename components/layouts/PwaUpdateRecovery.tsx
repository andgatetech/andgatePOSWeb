'use client';

import { useEffect } from 'react';

const RELOAD_KEY = 'andgatepos-sw-update-reloaded';
const RELOAD_GUARD_MS = 30_000;

const safeSessionStorageGet = (key: string): string | null => {
    try {
        return sessionStorage.getItem(key);
    } catch {
        return null;
    }
};

const safeSessionStorageSet = (key: string, value: string): boolean => {
    try {
        sessionStorage.setItem(key, value);
        return true;
    } catch {
        return false;
    }
};

const recentlyReloadedForServiceWorkerUpdate = () => {
    const lastReloadedAt = Number(safeSessionStorageGet(RELOAD_KEY) || 0);
    return Number.isFinite(lastReloadedAt) && Date.now() - lastReloadedAt < RELOAD_GUARD_MS;
};

export default function PwaUpdateRecovery() {
    useEffect(() => {
        if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
            return;
        }

        const checkForUpdate = () => {
            navigator.serviceWorker.getRegistration().then((registration) => {
                registration?.update().catch(() => {});
            }).catch(() => {});
        };

        const handleControllerChange = () => {
            if (recentlyReloadedForServiceWorkerUpdate()) {
                return;
            }

            if (!safeSessionStorageSet(RELOAD_KEY, Date.now().toString())) {
                return;
            }

            window.location.reload();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') checkForUpdate();
        };

        checkForUpdate();
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
        window.addEventListener('focus', checkForUpdate);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
            window.removeEventListener('focus', checkForUpdate);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return null;
}
