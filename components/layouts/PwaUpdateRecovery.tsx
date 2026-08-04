'use client';

import type { RootState } from '@/store';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

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
    const [updatePending, setUpdatePending] = useState(false);
    const hasActiveCart = useSelector((state: RootState) =>
        Object.values(state.invoice.itemsByStore || {}).some((items) => Array.isArray(items) && items.length > 0)
    );
    const hasOfflineSyncWork = useSelector((state: RootState) =>
        state.offlineOrders.isSyncing ||
        state.offlineOrders.queue.some((order) => order.status === 'pending' || order.status === 'syncing' || order.status === 'failed')
    );

    useEffect(() => {
        if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
            return;
        }

        const checkForUpdate = () => {
            navigator.serviceWorker.getRegistration().then((registration) => {
                registration?.update().catch(() => {});
            }).catch(() => {});
        };

        const reloadNow = () => {
            if (recentlyReloadedForServiceWorkerUpdate()) {
                return;
            }

            if (hasActiveCart || hasOfflineSyncWork) {
                return;
            }

            if (!safeSessionStorageSet(RELOAD_KEY, Date.now().toString())) {
                return;
            }

            window.location.reload();
        };

        const handleControllerChange = () => {
            if (hasActiveCart || hasOfflineSyncWork) {
                setUpdatePending(true);
                return;
            }
            reloadNow();
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
    }, [hasActiveCart, hasOfflineSyncWork]);

    useEffect(() => {
        if (!updatePending || hasActiveCart || hasOfflineSyncWork) return;

        if (recentlyReloadedForServiceWorkerUpdate()) {
            setUpdatePending(false);
            return;
        }

        if (!safeSessionStorageSet(RELOAD_KEY, Date.now().toString())) {
            return;
        }

        window.location.reload();
    }, [hasActiveCart, hasOfflineSyncWork, updatePending]);

    return null;
}
