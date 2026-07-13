'use client';

import { useEffect, useMemo, useState } from 'react';
import { getTranslation } from '@/i18n';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useApproveStockCountMutation, useCreateStockCountMutation, useGetStockCountsQuery } from '@/store/features/Product/productApi';
import type { RootState } from '@/store';
import { clearStockItems, removeStockItem } from '@/store/features/StockAdjustment/stockAdjustmentSlice';
import { AlertTriangle, CheckCircle2, ClipboardList, Loader2, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { showMessage } from '@/lib/toast';
import { useDispatch, useSelector } from 'react-redux';

const normalizeSessions = (response: any) => {
    const payload = response?.data?.data || response?.data?.items || response?.data || response?.items || response;
    return Array.isArray(payload) ? payload : [];
};

export default function StockCountPage() {
    const { t } = getTranslation();
    const { formatNumber } = useCurrency();
    const dispatch = useDispatch();
    const { currentStore, currentStoreId } = useCurrentStore();
    const [title, setTitle] = useState('');
    const [countedByItemId, setCountedByItemId] = useState<Record<number, number>>({});
    const [submitError, setSubmitError] = useState('');
    const [createStockCount, { isLoading: isCreating }] = useCreateStockCountMutation();
    const [approveStockCount, { isLoading: isApproving }] = useApproveStockCountMutation();
    const selectedItems = useSelector((state: RootState) => (currentStoreId && state.stockAdjustment.itemsByStore ? state.stockAdjustment.itemsByStore[currentStoreId] || [] : []));
    const { data: countsResponse, refetch } = useGetStockCountsQuery({ store_id: currentStoreId, per_page: 10 }, { skip: !currentStoreId });

    useEffect(() => {
        setCountedByItemId((prev) => {
            const next = { ...prev };
            selectedItems.forEach((item: any) => {
                if (next[item.id] === undefined) {
                    next[item.id] = Number(item.PlaceholderQuantity ?? item.quantity ?? 0);
                }
            });

            Object.keys(next).forEach((id) => {
                if (!selectedItems.some((item: any) => String(item.id) === id)) {
                    delete next[Number(id)];
                }
            });

            return next;
        });
    }, [selectedItems]);

    const resolveStockId = (item: any) => item.stockId ?? item.productStockId ?? item.product_stock_id ?? item.stock_id;

    const countLines = useMemo(() => selectedItems.map((item: any) => {
        const systemQuantity = Number(item.PlaceholderQuantity ?? item.quantity ?? 0);
        const countedQuantity = countedByItemId[item.id] ?? systemQuantity;
        const productStockId = Number(resolveStockId(item));
        return {
            itemId: item.id,
            product_stock_id: Number.isFinite(productStockId) && productStockId > 0 ? productStockId : null,
            label: item.variantName ? `${item.title || item.name} / ${item.variantName}` : (item.title || item.name),
            sku: item.sku,
            unit: item.unit,
            system_quantity: systemQuantity,
            counted_quantity: countedQuantity,
            variance: countedQuantity - systemQuantity,
        };
    }), [selectedItems, countedByItemId]);

    const updateCountedQuantity = (itemId: number, quantity: number) => {
        setCountedByItemId((prev) => ({ ...prev, [itemId]: Math.max(0, Number.isFinite(quantity) ? quantity : 0) }));
    };

    const removeLine = (itemId: number) => {
        if (!currentStoreId) return;
        dispatch(removeStockItem({ storeId: currentStoreId, id: itemId }));
    };

    const clearDraft = () => {
        if (!currentStoreId) return;
        dispatch(clearStockItems(currentStoreId));
        setCountedByItemId({});
    };

    const saveCount = async () => {
        setSubmitError('');
        if (!currentStoreId) {
            setSubmitError(t('stock_count_select_store'));
            showMessage(t('stock_count_select_store'), 'error');
            return;
        }
        if (countLines.length === 0) {
            setSubmitError(t('stock_count_select_products'));
            showMessage(t('stock_count_select_products'), 'error');
            return;
        }
        const invalidLine = countLines.find((line) => !line.product_stock_id);
        if (invalidLine) {
            setSubmitError(t('stock_count_missing_stock'));
            showMessage(t('stock_count_missing_stock'), 'error');
            return;
        }
        try {
            await createStockCount({
                store_id: currentStoreId,
                title: title || t('stock_count_default_title'),
                items: countLines.map((line) => ({
                    product_stock_id: line.product_stock_id,
                    counted_quantity: line.counted_quantity,
                })),
            }).unwrap();
            clearDraft();
            setTitle('');
            showMessage(t('stock_count_created'), 'success');
            refetch();
        } catch (error: any) {
            const message = error?.data?.message || t('stock_count_create_failed');
            setSubmitError(message);
            showMessage(message, 'error');
        }
    };

    const approve = async (id: number) => {
        try {
            await approveStockCount({ id }).unwrap();
            showMessage(t('stock_count_approved'), 'success');
            refetch();
        } catch (error: any) {
            showMessage(error?.data?.message || t('stock_count_approve_failed'), 'error');
        }
    };

    const sessions = normalizeSessions(countsResponse);
    const totalVarianceLines = countLines.filter((line) => Math.abs(line.variance) > 0.00001).length;
    const totalPositiveVariance = countLines.reduce((sum, line) => sum + Math.max(0, line.variance), 0);
    const totalNegativeVariance = countLines.reduce((sum, line) => sum + Math.min(0, line.variance), 0);

    return (
        <div className="flex h-full flex-col bg-[#f6f9fc]">
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="rounded-xl border border-[#d7e6f2] bg-white px-6 py-5 text-center shadow-lg">
                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sky-100 border-t-sky-600" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">{t('stock_count_saving')}</p>
                    </div>
                </div>
            )}

            <div className="border-b border-[#d7e6f2] bg-white p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{t('stock_count_title')}</h1>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">{t('stock_count_subtitle')}</p>
                            <p className="mt-1 text-sm text-gray-500">
                                {currentStore?.store_name && <span className="font-medium">{currentStore.store_name}</span>}
                                {currentStore?.store_name && <span className="mx-2">•</span>}
                                <span className="font-semibold text-[#034d79]">{countLines.length} {countLines.length === 1 ? 'Item' : 'Items'}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-lg border border-[#d7e6f2] bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-[#eef6fb]">
                            <RefreshCw className="h-4 w-4" />
                            {t('btn_refresh')}
                        </button>
                        <button type="button" onClick={clearDraft} disabled={countLines.length === 0} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                            <Trash2 className="h-4 w-4" />
                            {t('btn_clear')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto px-4 pb-4 sm:px-6">
                <div className="mx-auto max-w-5xl space-y-4">
                    {submitError && (
                        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">{t('stock_count_needs_attention')}</p>
                                <p className="mt-0.5">{submitError}</p>
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl border border-[#d7e6f2] bg-white p-4 shadow-sm">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">{t('stock_count_title_placeholder')}</label>
                        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t('stock_count_title_placeholder')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500" />
                    </div>

                    {countLines.length === 0 ? (
                        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
                            <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />
                            <h2 className="mt-4 text-lg font-bold text-slate-800">{t('stock_count_empty')}</h2>
                            <p className="mt-2 text-sm text-slate-500">{t('transfer_step_search_desc')}</p>
                        </div>
                    ) : (
                        countLines.map((line) => (
                            <div key={line.itemId} className="rounded-xl border border-[#d7e6f2] bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start gap-2">
                                            <button type="button" onClick={() => removeLine(line.itemId)} className="mt-0.5 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600" title={t('btn_remove')}>
                                                <X className="h-4 w-4" />
                                            </button>
                                            <div className="min-w-0">
                                                <h3 className="truncate text-base font-semibold text-gray-900">{line.label}</h3>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                                    {line.sku && <span className="rounded-md bg-gray-100 px-2 py-1 font-medium">SKU: {line.sku}</span>}
                                                    <span className="rounded-md bg-blue-100 px-2 py-1 font-medium text-blue-700">{t('stock_count_system_qty')}: {formatNumber(line.system_quantity)}</span>
                                                    {line.unit && <span className="rounded-md bg-gray-100 px-2 py-1 font-medium">{line.unit}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-[160px_140px]">
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">{t('stock_count_counted_qty')}</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={line.counted_quantity}
                                                onChange={(event) => updateCountedQuantity(line.itemId, Number(event.target.value))}
                                                className="h-11 w-full rounded-lg border border-gray-300 px-3 text-right text-lg font-bold text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">{t('stock_count_variance')}</label>
                                            <div className={`flex h-11 items-center justify-end rounded-lg border px-3 text-lg font-bold ${line.variance === 0 ? 'border-gray-200 bg-gray-50 text-gray-700' : line.variance > 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                                                {line.variance > 0 ? '+' : ''}{formatNumber(line.variance)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><ClipboardList className="h-4 w-4" />{t('stock_count_recent_sessions')}</h2>
                            <button type="button" onClick={() => refetch()} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {sessions.map((session: any) => (
                                <div key={session.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-900">{session.reference_no} <span className="text-sm font-normal text-slate-500">{session.title || ''}</span></p>
                                        <p className="text-xs text-slate-500">{t('stock_count_variance_lines')}: {session.variance_count ?? '-'} | {t('stock_count_status')}: {session.status}</p>
                                    </div>
                                    <button type="button" onClick={() => approve(session.id)} disabled={isApproving || session.status === 'approved'} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50">
                                        <CheckCircle2 className="h-4 w-4" />
                                        {session.status === 'approved' ? t('stock_count_approved_status') : t('stock_count_approve')}
                                    </button>
                                </div>
                            ))}
                            {sessions.length === 0 && <div className="px-4 py-8 text-center text-sm text-slate-400">{t('stock_count_no_sessions')}</div>}
                        </div>
                    </section>
                </div>
            </div>

            <div className="border-t border-[#d7e6f2] bg-white shadow-lg">
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="rounded-lg bg-gray-100 px-4 py-2">
                                <div className="text-xs text-gray-600">{t('stock_count_selected_items')}</div>
                                <div className="text-lg font-bold text-gray-900">{countLines.length}</div>
                            </div>
                            <div className="rounded-lg bg-amber-100 px-4 py-2">
                                <div className="text-xs text-amber-700">{t('stock_count_variance_lines')}</div>
                                <div className="text-lg font-bold text-amber-700">{totalVarianceLines}</div>
                            </div>
                            <div className="rounded-lg bg-emerald-100 px-4 py-2">
                                <div className="text-xs text-emerald-700">{t('stock_count_positive_variance')}</div>
                                <div className="text-lg font-bold text-emerald-700">+{formatNumber(totalPositiveVariance)}</div>
                            </div>
                            <div className="rounded-lg bg-red-100 px-4 py-2">
                                <div className="text-xs text-red-700">{t('stock_count_negative_variance')}</div>
                                <div className="text-lg font-bold text-red-700">{formatNumber(totalNegativeVariance)}</div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={saveCount}
                            disabled={isCreating || countLines.length === 0}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#046ca9] to-[#034d79] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-[#035f95] hover:to-[#023d61] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[190px]"
                        >
                            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isCreating ? t('stock_count_saving') : t('stock_count_create_session')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
