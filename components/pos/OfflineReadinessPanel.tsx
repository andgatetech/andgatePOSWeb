'use client';

import { getTranslation } from '@/i18n';
import { getStorageEstimate, getStoragePersisted } from '@/lib/offline/offlineDb';
import type { RootState } from '@/store';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { AlertTriangle, CheckCircle, CloudOff, Database, HardDrive, RefreshCw, ShieldCheck, ShoppingCart, WifiOff, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

interface OfflineReadinessPanelProps {
    productCount: number;
    categoryCount: number;
    brandCount: number;
    customerCount: number;
    paymentMethodCount: number;
    lastSyncedAt: string | null;
    onSyncNow?: () => void;
    onClose: () => void;
}

interface StorageInfo {
    usedMB: number;
    quotaMB: number;
    percent: number;
}

function formatTime(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function OfflineReadinessPanel({
    productCount,
    categoryCount,
    brandCount,
    customerCount,
    paymentMethodCount,
    lastSyncedAt,
    onSyncNow,
    onClose,
}: OfflineReadinessPanelProps) {
    const { t } = getTranslation();
    const isOnline = useOnlineStatus();
    const { queue } = useSelector((state: RootState) => state.offlineOrders);
    const [storage, setStorage] = useState<StorageInfo | null>(null);
    const [isStoragePersistent, setIsStoragePersistent] = useState<boolean | null>(null);
    const [animating, setAnimating] = useState(false);

    const pendingOrders = queue.filter((o) => o.status === 'pending' || o.status === 'failed').length;
    const syncedOrders = queue.filter((o) => o.status === 'synced').length;

    const isReady =
        productCount > 0 &&
        categoryCount > 0 &&
        paymentMethodCount > 0;

    const hasFreshSync = lastSyncedAt
        ? Date.now() - new Date(lastSyncedAt).getTime() < 1000 * 60 * 60 * 24
        : false;

    const readinessTone = !isReady ? 'danger' : !hasFreshSync || isStoragePersistent === false ? 'warning' : 'success';

    useEffect(() => {
        getStorageEstimate().then(setStorage).catch(() => {});
        getStoragePersisted().then(setIsStoragePersistent).catch(() => {});
    }, []);

    const handleSyncNow = () => {
        setAnimating(true);
        setTimeout(() => setAnimating(false), 1500);
        onSyncNow?.();
    };

    const statusColor = readinessTone === 'success' ? 'text-success' : readinessTone === 'warning' ? 'text-warning' : 'text-danger';
    const statusLabel = readinessTone === 'success'
        ? t('pos_offline_ready')
        : readinessTone === 'warning'
        ? t('pos_offline_ready_with_caution')
        : t('pos_offline_not_ready');
    const storageHealth =
        storage === null ? t('pos_storage_unknown') :
        storage.percent < 70 ? t('pos_storage_ok') :
        storage.percent < 90 ? t('pos_storage_warning') :
        t('pos_storage_critical');

    const storageColor =
        storage === null ? 'text-gray-500' :
        storage.percent < 70 ? 'text-success' :
        storage.percent < 90 ? 'text-warning' :
        'text-danger';

    return (
        <div className="w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl sm:w-96 dark:border-gray-700 dark:bg-gray-900">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isOnline ? (
                        <Database className="h-4 w-4 text-primary" />
                    ) : (
                        <WifiOff className="h-4 w-4 text-danger" />
                    )}
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t('pos_offline_status')}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Readiness badge */}
            <div className={`mb-3 rounded-lg px-3 py-2 ${
                readinessTone === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : readinessTone === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
            }`}>
                <div className="flex items-center gap-2">
                    {readinessTone === 'success' ? <CheckCircle className={`h-4 w-4 ${statusColor}`} /> : <AlertTriangle className={`h-4 w-4 ${statusColor}`} />}
                    <span className={`text-sm font-semibold ${statusColor}`}>{statusLabel}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-300">
                    {readinessTone === 'success'
                        ? t('pos_offline_ready_desc')
                        : readinessTone === 'warning'
                        ? t('pos_offline_caution_desc')
                        : t('pos_offline_not_ready_desc')}
                </p>
            </div>

            {/* Data counts */}
            <div className="mb-4 space-y-2">
                <Row label={t('pos_cached_products')} value={productCount} ok={productCount > 0} />
                <Row label={t('pos_cached_categories')} value={categoryCount} ok={categoryCount > 0} />
                <Row label={t('pos_cached_brands')} value={brandCount} ok={brandCount > 0} />
                <Row label={t('pos_cached_customers')} value={customerCount} ok={customerCount > 0} soft />
                <Row label={t('pos_cached_payment_methods')} value={paymentMethodCount} ok={paymentMethodCount > 0} />
            </div>

            <hr className="mb-3 border-gray-200 dark:border-gray-700" />

            {/* Sync info */}
            <div className="mb-3 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                    <span>{t('pos_last_sync')}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        {formatTime(lastSyncedAt)} {!hasFreshSync && lastSyncedAt ? t('pos_sync_stale') : ''}
                    </span>
                </div>
                {pendingOrders > 0 && (
                    <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                            <ShoppingCart className="h-3 w-3" />
                            {t('pos_queued_orders')}
                        </span>
                        <span className="font-semibold text-warning">{pendingOrders}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        {t('pos_storage_health')}
                    </span>
                    <span className={`font-medium ${storageColor}`}>
                        {storageHealth}
                        {storage && ` (${storage.usedMB}MB)`}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                        {isStoragePersistent ? <ShieldCheck className="h-3 w-3" /> : <HardDrive className="h-3 w-3" />}
                        {t('pos_storage_persistence')}
                    </span>
                    <span className={`font-medium ${isStoragePersistent ? 'text-success' : isStoragePersistent === false ? 'text-warning' : 'text-gray-500'}`}>
                        {isStoragePersistent === null ? t('pos_storage_unknown') : isStoragePersistent ? t('pos_storage_protected') : t('pos_storage_may_clear')}
                    </span>
                </div>
                {syncedOrders > 0 && (
                    <div className="flex justify-between">
                        <span>{t('pos_recently_synced_orders')}</span>
                        <span className="font-semibold text-success">{syncedOrders}</span>
                    </div>
                )}
            </div>

            {/* Sync now */}
            {isOnline && (
                <button
                    onClick={handleSyncNow}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary/90 active:scale-95"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${animating ? 'animate-spin' : ''}`} />
                    {t('btn_sync_now')}
                </button>
            )}

            {!isOnline && (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:bg-red-900/20">
                    <CloudOff className="h-3.5 w-3.5" />
                    {t('pos_offline_mode')}
                </div>
            )}
        </div>
    );
}

function Row({ label, value, ok, soft = false }: { label: string; value: number; ok: boolean; soft?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
            <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {value.toLocaleString()}
                </span>
                <span className={`inline-block h-2 w-2 rounded-full ${ok ? 'bg-success' : soft ? 'bg-warning' : 'bg-danger'}`} />
            </div>
        </div>
    );
}
