'use client';

import { useEffect, useRef, useState } from 'react';

const PING_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ''}/api/ping`;
const PING_INTERVAL_MS = 30_000;
const PING_TIMEOUT_MS = 5_000;

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
