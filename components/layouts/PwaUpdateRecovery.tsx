'use client';

import { useEffect } from 'react';

const RELOAD_KEY = 'andgatepos-sw-update-reloaded';

export default function PwaUpdateRecovery() {
    useEffect(() => {
        if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
            return;
        }

        const handleControllerChange = () => {
            if (sessionStorage.getItem(RELOAD_KEY) === 'true') {
                return;
            }

            sessionStorage.setItem(RELOAD_KEY, 'true');
            window.location.reload();
        };

        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

        return () => {
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        };
    }, []);

    useEffect(() => {
        sessionStorage.removeItem(RELOAD_KEY);
    }, []);

    return null;
}
