'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Search, Save, EyeOff, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import {
    useGetStockThresholdsQuery,
    useBulkUpdateThresholdsMutation,
    ThresholdItem,
} from '@/store/features/stockThreshold/stockThresholdApi';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';

type DraftRow = {
    low_stock_quantity: number;
    suppress_low_stock: boolean;
    dirty: boolean;
};

export default function StockThresholdsPage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();

    const [search, setSearch]         = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage]             = useState(1);
    const searchTimer                 = useRef<ReturnType<typeof setTimeout> | null>(null);

    // draft edits keyed by stock_id
    const [drafts, setDrafts]         = useState<Record<number, DraftRow>>({});
    const [saving, setSaving]         = useState(false);

    const { data, isFetching, isError, refetch } = useGetStockThresholdsQuery(
        { store_id: currentStoreId ?? undefined, page, per_page: 50, search: debouncedSearch },
        { skip: !currentStoreId }
    );

    const [bulkUpdate] = useBulkUpdateThresholdsMutation();

    const items: ThresholdItem[] = data?.data?.items ?? [];
    const meta = data?.data?.meta;
    const dirtyIds = Object.keys(drafts).filter((id) => drafts[+id]?.dirty).map(Number);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(val);
            setPage(1);
        }, 400);
    };

    const getDraft = (item: ThresholdItem): DraftRow =>
        drafts[item.stock_id] ?? {
            low_stock_quantity: item.low_stock_quantity,
            suppress_low_stock: item.suppress_low_stock,
            dirty: false,
        };

    const setDraft = useCallback((stockId: number, patch: Partial<DraftRow>) => {
        setDrafts((prev) => ({
            ...prev,
            [stockId]: { ...( prev[stockId] ?? { low_stock_quantity: 0, suppress_low_stock: false }), ...patch, dirty: true },
        }));
    }, []);

    const handleThresholdChange = (item: ThresholdItem, value: string) => {
        const num = parseFloat(value);
        setDraft(item.stock_id, { low_stock_quantity: isNaN(num) ? 0 : Math.max(0, num) });
    };

    const handleSuppressToggle = (item: ThresholdItem) => {
        const cur = getDraft(item);
        setDraft(item.stock_id, { suppress_low_stock: !cur.suppress_low_stock });
    };

    const handleSaveAll = async () => {
        if (!currentStoreId || dirtyIds.length === 0) return;
        setSaving(true);
        try {
            const payload = dirtyIds.map((id) => ({
                stock_id: id,
                low_stock_quantity: drafts[id].low_stock_quantity,
                suppress_low_stock: drafts[id].suppress_low_stock,
            }));
            await bulkUpdate({ store_id: currentStoreId, items: payload }).unwrap();
            showSuccessDialog(`${dirtyIds.length} row(s) updated`);
            setDrafts({});
        } catch {
            showErrorDialog('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const urgencyColor = (eff: number, qty: number) => {
        if (qty <= 0) return 'text-red-600 font-semibold';
        if (eff <= 0) return 'text-gray-400';
        const pct = (qty / eff) * 100;
        if (pct <= 25) return 'text-red-600 font-semibold';
        if (pct <= 50) return 'text-orange-500 font-medium';
        if (pct <= 75) return 'text-yellow-600';
        return 'text-green-600';
    };

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t('Stock Threshold Editor')}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {t('Set per-product low stock thresholds and suppress flags in bulk')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => refetch()}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {t('btn_refresh')}
                    </button>
                    {dirtyIds.length > 0 && (
                        <button
                            onClick={handleSaveAll}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? t('btn_saving') : `${t('btn_save')} (${dirtyIds.length})`}
                        </button>
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder={t('placeholder_search_products')}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
            </div>

            {/* Dirty banner */}
            {dirtyIds.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {t('msg_unsaved_threshold_changes', { count: dirtyIds.length })}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                            <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 w-1/3">{t('lbl_product')}</th>
                            <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('lbl_category')}</th>
                            <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-right">{t('lbl_in_stock')}</th>
                            <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-right">{t('Cat. Default')}</th>
                            <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-right min-w-[140px]">{t('lbl_threshold')}</th>
                            <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-center">{t('Suppress')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {!currentStoreId ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Please select a store first.</td>
                            </tr>
                        ) : isError ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-red-500">Could not load stock thresholds. Please refresh and try again.</td>
                            </tr>
                        ) : isFetching && items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t('lbl_loading')}</td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                    {debouncedSearch ? t('msg_no_products_found') : 'No stock rows found for this store. Add products with stock first, then set low-stock thresholds here.'}
                                </td>
                            </tr>
                        ) : items.map((item) => {
                            const draft = getDraft(item);
                            const isDirty = draft.dirty;
                            const effThreshold = draft.low_stock_quantity > 0
                                ? draft.low_stock_quantity
                                : item.category_threshold;

                            return (
                                <tr
                                    key={item.stock_id}
                                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isDirty ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}
                                >
                                    {/* Product */}
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900 dark:text-white truncate max-w-[220px]">
                                            {item.product_name}
                                        </div>
                                        {item.sku && (
                                            <div className="text-xs text-gray-400">{item.sku}</div>
                                        )}
                                    </td>

                                    {/* Category */}
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                        {item.category_name ?? '—'}
                                    </td>

                                    {/* In Stock */}
                                    <td className={`px-4 py-3 text-right tabular-nums ${urgencyColor(effThreshold, item.quantity)}`}>
                                        {item.quantity}
                                    </td>

                                    {/* Category Default */}
                                    <td className="px-4 py-3 text-right tabular-nums text-gray-400">
                                        {item.category_threshold > 0 ? item.category_threshold : '—'}
                                    </td>

                                    {/* Threshold input */}
                                    <td className="px-4 py-3 text-right">
                                        <input
                                            type="number"
                                            min={0}
                                            step={1}
                                            value={draft.low_stock_quantity === 0 ? '' : draft.low_stock_quantity}
                                            placeholder={item.category_threshold > 0 ? String(item.category_threshold) : '0'}
                                            onChange={(e) => handleThresholdChange(item, e.target.value)}
                                            className="w-24 text-right px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                                        />
                                    </td>

                                    {/* Suppress toggle */}
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleSuppressToggle(item)}
                                            title={draft.suppress_low_stock ? t('msg_reenable_stock_alerts') : t('msg_suppress_stock_alerts')}
                                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                                                draft.suppress_low_stock
                                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                                    : 'bg-green-50 dark:bg-green-900/20 text-green-600'
                                            }`}
                                        >
                                            {draft.suppress_low_stock
                                                ? <EyeOff className="w-4 h-4" />
                                                : <Eye className="w-4 h-4" />
                                            }
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{t('msg_products_total', { count: meta.total })}</span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            {t('btn_previous')}
                        </button>
                        <span className="px-3 py-1">{page} / {meta.last_page}</span>
                        <button
                            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                            disabled={page === meta.last_page}
                            className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            {t('btn_next')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
