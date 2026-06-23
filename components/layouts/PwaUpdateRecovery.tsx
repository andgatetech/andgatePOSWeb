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

        const handleControllerChange = () => {
            if (recentlyReloadedForServiceWorkerUpdate()) {
                return;
            }

            if (!safeSessionStorageSet(RELOAD_KEY, Date.now().toString())) {
                return;
            }

            window.location.reload();
        };

        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

        return () => {
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        };
    }, []);

    return null;
}
