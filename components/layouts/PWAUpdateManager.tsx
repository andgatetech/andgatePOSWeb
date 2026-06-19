'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

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
    const [waitingRegistration, setWaitingRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const activeCartCount = useSelector((state: RootState) => {
        const storeId = state.auth.currentStoreId;
        if (!storeId || !state.invoice.itemsByStore) return 0;
        return state.invoice.itemsByStore[storeId]?.length || 0;
    });
    const activeCartCountRef = useRef(activeCartCount);

    useEffect(() => {
        activeCartCountRef.current = activeCartCount;
    }, [activeCartCount]);

    const reloadForUpdate = useCallback(() => {
        if (!shouldReloadForUpdate()) return;
        window.location.reload();
    }, []);

    const activateWaitingWorker = useCallback((registration: ServiceWorkerRegistration) => {
        if (!registration.waiting) return;

        if (activeCartCountRef.current > 0) {
            setWaitingRegistration(registration);
            return;
        }

        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        reloadForUpdate();
    }, [reloadForUpdate]);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        let refreshing = false;

        const handleReloadForUpdate = () => {
            if (refreshing || !shouldReloadForUpdate()) return;
            refreshing = true;
            window.location.reload();
        };

        const onControllerChange = () => handleReloadForUpdate();

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
                        }
                    });
                });

                registration.update().catch(() => {});
            })
            .catch(() => {});

        return () => {
            navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
        };
    }, [activateWaitingWorker]);

    useEffect(() => {
        if (!waitingRegistration || activeCartCount > 0) return;
        waitingRegistration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        reloadForUpdate();
    }, [activeCartCount, reloadForUpdate, waitingRegistration]);

    if (!waitingRegistration || activeCartCount === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] max-w-sm rounded border border-primary/20 bg-white p-4 text-sm shadow-lg dark:border-primary/40 dark:bg-slate-900">
            <div className="font-semibold text-slate-900 dark:text-white">Update ready</div>
            <div className="mt-1 text-slate-600 dark:text-slate-300">
                Finish the current sale first. AndGate POS will update automatically when the cart is clear.
            </div>
            <button
                type="button"
                className="mt-3 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                onClick={() => {
                    waitingRegistration.waiting?.postMessage({ type: 'SKIP_WAITING' });
                    reloadForUpdate();
                }}
            >
                Update now
            </button>
        </div>
    );
}
