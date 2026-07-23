'use client';

import { apiBaseUrl } from '@/lib/api-url';
import { useEffect, useRef, useState } from 'react';

// Same-origin, proxied path — matches how every other API call in this app reaches
// the backend (see lib/api-url.ts). A direct cross-origin URL here (the previous
// behavior) is exposed to CORS/network failures the rest of the app never hits via
// the proxy, so the ping could report "offline" while the app was otherwise fully
// functional — permanently stuck showing the offline banner and blocking sync.
const PING_URL = `${apiBaseUrl()}/ping`;
const PING_INTERVAL_MS = 30_000;
const PING_TIMEOUT_MS = 10_000; // 10s — tolerates slow 3G connections

async function checkConnectivity(): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
        const res = await fetch(PING_URL, {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal,
        });
        clearTimeout(timer);
        return res.ok;
    } catch {
        return false;
    }
}

export function useOnlineStatus(): boolean {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startHeartbeat = () => {
        if (intervalRef.current) return;
        intervalRef.current = setInterval(async () => {
            const alive = await checkConnectivity();
            setIsOnline(alive);
        }, PING_INTERVAL_MS);
    };

    const stopHeartbeat = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        const handleOnline = async () => {
            // navigator says online — confirm with a real ping before trusting it
            const alive = await checkConnectivity();
            setIsOnline(alive);
            if (alive) startHeartbeat();
        };

        const handleOffline = () => {
            setIsOnline(false);
            stopHeartbeat();
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        checkConnectivity().then((alive) => {
            setIsOnline(alive);
            if (alive) startHeartbeat();
        });

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            stopHeartbeat();
        };
    }, []);

    return isOnline;
}
