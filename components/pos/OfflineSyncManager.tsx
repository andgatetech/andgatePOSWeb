'use client';

import { getTranslation } from '@/i18n';
import {
    deleteSyncedOfflineOrders,
    getOfflineOrders,
    saveOfflineOrders,
    updateOfflineOrderStatus,
} from '@/lib/offline/offlineDb';
import { useCreateOrderMutation } from '@/store/features/Order/Order';
import {
    clearSyncedOrders,
    markOrderFailed,
    markOrderSynced,
    markOrderSyncing,
    retryFailedOrders,
    setIsSyncing,
    setLastSyncAt,
    setOfflineOrders,
} from '@/store/features/offline/offlineOrdersSlice';
import type { RootState } from '@/store';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function OfflineSyncManager() {
    const { t } = getTranslation();
    const dispatch = useDispatch();
    const isOnline = useOnlineStatus();
    const [createOrder] = useCreateOrderMutation();

    const { queue, isSyncing, lastSyncAt } = useSelector(
        (state: RootState) => state.offlineOrders
    );

    const pendingOrders = queue.filter((o) => o.status === 'pending');
    const failedOrders = queue.filter((o) => o.status === 'failed');
    const syncingOrders = queue.filter((o) => o.status === 'syncing');
    const totalQueued = pendingOrders.length + failedOrders.length + syncingOrders.length;

    const [showSyncedFlash, setShowSyncedFlash] = useState(false);
    const prevOnlineRef = useRef(isOnline);
    const isSyncingRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        getOfflineOrders()
            .then(async (orders) => {
                if (cancelled) return;
                // Orders left in 'syncing' from a previous session (app closed mid-sync) — recover them
                const stuckIds = orders.filter((o) => o.status === 'syncing').map((o) => o.localId);
                if (stuckIds.length > 0) {
                    await Promise.all(
                        stuckIds.map((id) => updateOfflineOrderStatus(id, 'pending').catch(() => {}))
                    );
                    const refreshed = await getOfflineOrders().catch(() => orders);
                    if (!cancelled) dispatch(setOfflineOrders(refreshed));
                } else {
                    dispatch(setOfflineOrders(orders));
                }
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, [dispatch]);

    // Auto-sync when coming back online
    useEffect(() => {
        const wasOffline = !prevOnlineRef.current;
        prevOnlineRef.current = isOnline;

        if (isOnline && wasOffline && (pendingOrders.length > 0 || failedOrders.length > 0)) {
            syncAll();
        }
    }, [isOnline]);

    // Sync whenever the durable queue is hydrated while online (covers post-mount recovery).
    useEffect(() => {
        const toSync = pendingOrders.length + failedOrders.length;
        if (isOnline && toSync > 0 && !isSyncingRef.current) {
            syncAll();
        }
    }, [isOnline, pendingOrders.length, failedOrders.length]);

    const syncAll = async () => {
        if (isSyncingRef.current) return;

        isSyncingRef.current = true;
        dispatch(setIsSyncing(true));

        const durableQueue = await getOfflineOrders().catch(() => queue);
        const queueById = new Map(queue.map((order) => [order.localId, order]));
        durableQueue.forEach((order) => queueById.set(order.localId, order));
        const mergedQueue = Array.from(queueById.values());
        const ordersToSync = mergedQueue.filter((o) => o.status === 'pending' || o.status === 'failed' || o.status === 'syncing');
        dispatch(setOfflineOrders(mergedQueue));
        if (ordersToSync.length === 0) {
            dispatch(setIsSyncing(false));
            isSyncingRef.current = false;
            return;
        }

        for (const order of ordersToSync) {
            dispatch(markOrderSyncing(order.localId));
            await updateOfflineOrderStatus(order.localId, 'syncing');
            try {
                await createOrder(order.payload).unwrap();
                dispatch(markOrderSynced(order.localId));
                await updateOfflineOrderStatus(order.localId, 'synced');
            } catch (err: any) {
                const msg =
                    err?.data?.message || err?.data?.error || err?.error || 'Sync failed';
                dispatch(markOrderFailed({ localId: order.localId, error: msg }));
                await updateOfflineOrderStatus(order.localId, 'failed', msg);
            }
        }

        dispatch(setLastSyncAt(new Date().toISOString()));
        dispatch(clearSyncedOrders());
        await deleteSyncedOfflineOrders().catch(() => {});
        const remainingOrders = await getOfflineOrders().catch(() => []);
        dispatch(setOfflineOrders(remainingOrders));
        dispatch(setIsSyncing(false));
        isSyncingRef.current = false;

        const stillFailed = remainingOrders.filter((o) => o.status === 'failed').length;
        if (stillFailed === 0) {
            setShowSyncedFlash(true);
            setTimeout(() => setShowSyncedFlash(false), 3000);
        }
    };

    const handleRetry = () => {
        dispatch(retryFailedOrders());
        saveOfflineOrders(
            queue.map((order) => (order.status === 'failed' ? { ...order, status: 'pending' } : order))
        ).catch(() => {});
        syncAll();
    };

    // Nothing to show when online, no queue, no flash
    if (isOnline && totalQueued === 0 && failedOrders.length === 0 && !showSyncedFlash) {
        return null;
    }

    return (
        <div className="fixed left-0 right-0 top-0 z-[200] flex flex-col gap-0.5">
            {/* Offline banner */}
            {!isOnline && (
                <div className="flex items-center justify-between bg-red-600 px-4 py-2 text-white shadow-lg">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-white" />
                        <span className="text-sm font-semibold">{t('pos_offline_mode')}</span>
                        <span className="hidden text-xs text-white/80 sm:inline">
                            — {t('pos_offline_banner_msg')}
                        </span>
                    </div>
                    {totalQueued > 0 && (
                        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
                            {totalQueued} {t('pos_queued')}
                        </span>
                    )}
                </div>
            )}

            {/* Syncing banner */}
            {isOnline && isSyncing && (
                <div className="flex items-center gap-2 bg-amber-500 px-4 py-2 text-white shadow-lg">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span className="text-sm font-semibold">
                        {t('pos_syncing_orders')} ({syncingOrders.length + pendingOrders.length}{' '}
                        {t('pos_remaining')})
                    </span>
                </div>
            )}

            {/* Pending queue reminder (online, not yet syncing) */}
            {isOnline && !isSyncing && totalQueued > 0 && failedOrders.length === 0 && (
                <div className="flex items-center justify-between bg-primary px-4 py-2 text-white shadow-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                            {totalQueued} {t('pos_offline_queued_orders')}
                        </span>
                    </div>
                    <button
                        onClick={syncAll}
                        className="rounded-lg bg-white/20 px-3 py-1 text-xs font-bold transition hover:bg-white/30"
                    >
                        {t('btn_sync_now')}
                    </button>
                </div>
            )}

            {/* Failed orders */}
            {isOnline && failedOrders.length > 0 && (
                <div className="flex items-center justify-between bg-danger px-4 py-2 text-white shadow-lg">
                    <span className="text-sm font-semibold">
                        {failedOrders.length} {t('pos_sync_failed')}
                    </span>
                    <button
                        onClick={handleRetry}
                        className="rounded-lg bg-white/20 px-3 py-1 text-xs font-bold transition hover:bg-white/30"
                    >
                        {t('btn_retry')}
                    </button>
                </div>
            )}

            {/* Synced flash */}
            {showSyncedFlash && (
                <div className="flex items-center gap-2 bg-success px-4 py-2 text-white shadow-lg">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-semibold">{t('pos_orders_synced')}</span>
                </div>
            )}
        </div>
    );
}
