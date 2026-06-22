'use client';

import { useEffect } from 'react';

const RELOAD_KEY = 'andgatepos-sw-update-reloaded';

const safeSessionStorageGet = (key: string): string | null => {
    try {
        return sessionStorage.getItem(key);
    } catch {
        return null;
    }
};

const safeSessionStorageSet = (key: string, value: string) => {
    try {
        sessionStorage.setItem(key, value);
    } catch {
        // Storage can be blocked in mobile/private contexts; skip the reload guard.
    }
};

const safeSessionStorageRemove = (key: string) => {
    try {
        sessionStorage.removeItem(key);
    } catch {
        // Storage can be blocked in mobile/private contexts.
    }
};

export default function PwaUpdateRecovery() {
    useEffect(() => {
        if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
            return;
        }

        const handleControllerChange = () => {
            if (safeSessionStorageGet(RELOAD_KEY) === 'true') {
                return;
            }

            safeSessionStorageSet(RELOAD_KEY, 'true');
            window.location.reload();
        };

        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

        return () => {
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        };
    }, []);

    useEffect(() => {
        safeSessionStorageRemove(RELOAD_KEY);
    }, []);

    return null;
}
