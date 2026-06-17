'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { AlertTriangle, Eye, EyeOff, Package, Save, Tag } from 'lucide-react';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useCurrency } from '@/hooks/useCurrency';
import UniversalFilter, { FilterOptions } from '@/components/common/UniversalFilter';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import {
    useGetStockThresholdsQuery,
    useBulkUpdateThresholdsMutation,
    ThresholdItem,
} from '@/store/features/stockThreshold/stockThresholdApi';
import { showToast } from '@/lib/toast';

type DraftRow = {
    low_stock_quantity: number;
    suppress_low_stock: boolean;
    dirty: boolean;
};

export default function StockThresholdsPage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { formatNumber } = useCurrency();

    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState<number | 'all'>('all');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(50);

    // draft edits keyed by stock_id
    const [drafts, setDrafts] = useState<Record<number, DraftRow>>({});
    const [saving, setSaving] = useState(false);

    const { data: categoriesResponse } = useGetCategoryQuery(currentStoreId ? { store_id: currentStoreId } : {});
    const categories = useMemo(() => {
        const list = categoriesResponse?.data?.items ?? categoriesResponse?.data ?? [];
        return Array.isArray(list) ? list : [];
    }, [categoriesResponse]);

    const { data, isFetching, isError, refetch } = useGetStockThresholdsQuery(
        {
            store_id: currentStoreId ?? undefined,
            page,
            per_page: perPage,
            search: search || undefined,
            category_id: categoryId === 'all' ? undefined : categoryId,
        },
        { skip: !currentStoreId }
    );

    const [bulkUpdate] = useBulkUpdateThresholdsMutation();

    const items: ThresholdItem[] = data?.data?.items ?? [];
    const meta = data?.data?.meta;
    const totalPages = meta?.last_page ?? 1;
    const totalRecords = meta?.total ?? 0;
    const startRecord = totalRecords === 0 ? 0 : (page - 1) * perPage + 1;
    const endRecord = Math.min(page * perPage, totalRecords);
    const dirtyIds = Object.keys(drafts).filter((id) => drafts[+id]?.dirty).map(Number);

    const handleFilterChange = useCallback((filters: FilterOptions) => {
        setSearch(filters.search || '');
        setPage(1);
    }, []);

    const getDraft = (item: ThresholdItem): DraftRow =>
        drafts[item.stock_id] ?? {
            low_stock_quantity: item.low_stock_quantity,
            suppress_low_stock: item.suppress_low_stock,
            dirty: false,
        };

    const setDraft = useCallback((stockId: number, patch: Partial<DraftRow>) => {
        setDrafts((prev) => ({
            ...prev,
            [stockId]: { ...(prev[stockId] ?? { low_stock_quantity: 0, suppress_low_stock: false }), ...patch, dirty: true },
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
            showToast(`${dirtyIds.length} row(s) updated`, 'success');
            setDrafts({});
        } catch {
            showToast('Failed to save changes', 'error');
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

    const goToPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

    const customFilters = (
        <div className="relative">
            <select
                value={categoryId}
                onChange={(e) => {
                    setCategoryId(e.target.value === 'all' ? 'all' : parseInt(e.target.value));
                    setPage(1);
                }}
                className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={categories.length === 0}
            >
                <option value="all">{categories.length === 0 ? t('lbl_no_categories') : t('lbl_all_categories')}</option>
                {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>
            <Tag className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                        <Package className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('Stock Threshold Editor')}</h1>
                        <p className="text-sm text-gray-500">{t('Set per-product low stock thresholds and suppress flags in bulk')}</p>
                    </div>
                </div>
                {dirtyIds.length > 0 && (
                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? t('btn_saving') : `${t('btn_save')} (${dirtyIds.length})`}
                    </button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <UniversalFilter
                    onFilterChange={handleFilterChange}
                    placeholder={t('placeholder_search_products')}
                    showStoreFilter={false}
                    showDateFilter={false}
                    showSearch={true}
                    customFilters={customFilters}
                    customActiveCount={categoryId !== 'all' ? 1 : 0}
                />
            </div>

            {/* Dirty banner */}
            {dirtyIds.length > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-2.5 text-sm text-yellow-800">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    {t('msg_unsaved_threshold_changes', { count: dirtyIds.length })}
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 w-1/3">{t('lbl_product')}</th>
                                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">{t('lbl_category')}</th>
                                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-700">{t('lbl_in_stock')}</th>
                                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-700">{t('Cat. Default')}</th>
                                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-700 min-w-[140px]">{t('lbl_threshold')}</th>
                                <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-700">{t('Suppress')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
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
                                        {search ? t('msg_no_products_found') : 'No stock rows found for this store. Add products with stock first, then set low-stock thresholds here.'}
                                    </td>
                                </tr>
                            ) : items.map((item, index) => {
                                const draft = getDraft(item);
                                const isDirty = draft.dirty;
                                const effThreshold = draft.low_stock_quantity > 0
                                    ? draft.low_stock_quantity
                                    : item.category_threshold;

                                return (
                                    <tr
                                        key={item.stock_id}
                                        className={`border-b border-gray-100 transition-colors hover:bg-[#046ca9]/5 ${isDirty ? 'bg-yellow-50/60' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
                                    >
                                        {/* Product */}
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 truncate max-w-[220px]">
                                                {item.product_name}
                                            </div>
                                            {item.sku && (
                                                <div className="text-xs text-gray-400">{item.sku}</div>
                                            )}
                                        </td>

                                        {/* Category */}
                                        <td className="px-4 py-3 text-gray-500">
                                            {item.category_name ?? '—'}
                                        </td>

                                        {/* In Stock */}
                                        <td className={`px-4 py-3 text-right tabular-nums ${urgencyColor(effThreshold, item.quantity)}`}>
                                            {formatNumber(item.quantity)}
                                        </td>

                                        {/* Category Default */}
                                        <td className="px-4 py-3 text-right tabular-nums text-gray-400">
                                            {item.category_threshold > 0 ? formatNumber(item.category_threshold) : '—'}
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
                                                className="w-24 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-right text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                                            />
                                        </td>

                                        {/* Suppress toggle */}
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleSuppressToggle(item)}
                                                title={draft.suppress_low_stock ? t('msg_reenable_stock_alerts') : t('msg_suppress_stock_alerts')}
                                                className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                                    draft.suppress_low_stock
                                                        ? 'bg-gray-100 text-gray-400'
                                                        : 'bg-green-50 text-green-600'
                                                }`}
                                            >
                                                {draft.suppress_low_stock
                                                    ? <EyeOff className="h-4 w-4" />
                                                    : <Eye className="h-4 w-4" />
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
                {currentStoreId && !isError && totalRecords > 0 && (
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/80 px-5 py-3 sm:flex-row">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                                {t('lbl_showing')}{' '}
                                <span className="font-semibold text-gray-700">{formatNumber(startRecord)}</span>
                                {' '}{t('lbl_to')}{' '}
                                <span className="font-semibold text-gray-700">{formatNumber(endRecord)}</span>
                                {' '}{t('lbl_of')}{' '}
                                <span className="font-semibold text-gray-700">{formatNumber(totalRecords)}</span>
                                {' '}{t('lbl_items')}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs">{t('lbl_show')}:</span>
                                <select
                                    value={perPage}
                                    onChange={(e) => { setPage(1); setPerPage(Number(e.target.value)); }}
                                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                                >
                                    <option value={20}>{formatNumber(20)}</option>
                                    <option value={50}>{formatNumber(50)}</option>
                                    <option value={100}>{formatNumber(100)}</option>
                                    <option value={200}>{formatNumber(200)}</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => goToPage(page - 1)}
                                disabled={page <= 1}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {t('btn_previous')}
                            </button>
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) pageNum = i + 1;
                                else if (page <= 3) pageNum = i + 1;
                                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                else pageNum = page - 2 + i;
                                return (
                                    <button
                                        key={pageNum}
                                        type="button"
                                        onClick={() => goToPage(pageNum)}
                                        className={`min-w-[32px] rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                                            page === pageNum
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary'
                                        }`}
                                    >
                                        {formatNumber(pageNum)}
                                    </button>
                                );
                            })}
                            <button
                                type="button"
                                onClick={() => goToPage(page + 1)}
                                disabled={page >= totalPages}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {t('btn_next')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
