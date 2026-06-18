'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReusableTable from '@/components/common/ReusableTable';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetReorderSuggestionsQuery } from '@/store/features/aiReports/aiReportsApi';
import { useCreateReorderDraftMutation } from '@/store/features/reports/reportApi';
import { AlertTriangle, BrainCircuit, PackageCheck, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

const ReorderSuggestionsPage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [createReorderDraft, { isLoading: isCreatingDraft }] = useCreateReorderDraftMutation();

    const params = useMemo(() => {
        const p: Record<string, any> = {};
        if (currentStoreId) p.store_id = currentStoreId;
        return p;
    }, [currentStoreId]);

    const { data, isLoading } = useGetReorderSuggestionsQuery(params, { skip: !currentStoreId });

    const suggestions = useMemo(() => data?.data?.suggestions || data?.data || [], [data]);
    const selectedSuggestions = useMemo(
        () => suggestions.filter((item: any) => selectedIds.includes(Number(item.product_id))),
        [selectedIds, suggestions]
    );

    const summary = useMemo(() => {
        const totals = suggestions.reduce(
            (acc: any, item: any) => {
                const urgency = item.urgency || 'low';
                acc.totalQty += Number(item.suggested_reorder_qty) || 0;
                acc.estimatedCost += Number(item.estimated_cost) || 0;
                acc.urgency[urgency] = (acc.urgency[urgency] || 0) + 1;
                return acc;
            },
            { totalQty: 0, estimatedCost: 0, urgency: { critical: 0, high: 0, medium: 0, low: 0 } }
        );

        return {
            totalItems: suggestions.length,
            totalQty: totals.totalQty,
            estimatedCost: totals.estimatedCost,
            criticalCount: totals.urgency.critical || 0,
            highCount: totals.urgency.high || 0,
        };
    }, [suggestions]);

    const toggleSelect = useCallback((productId: number) => {
        setSelectedIds((prev) => prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]);
    }, []);

    const toggleSelectAll = useCallback(() => {
        const allIds = suggestions.map((item: any) => Number(item.product_id)).filter(Boolean);
        setSelectedIds((prev) => prev.length === allIds.length ? [] : allIds);
    }, [suggestions]);

    const handleCreateDraft = useCallback(async (productIds: number[]) => {
        if (!currentStoreId || productIds.length === 0) return;
        try {
            const result = await createReorderDraft({ store_id: currentStoreId, product_ids: productIds }).unwrap();
            setSelectedIds([]);
            router.push(result.data.redirect_url);
        } catch {
            alert(t('msg_reorder_draft_failed'));
        }
    }, [createReorderDraft, currentStoreId, router, t]);

    const exportColumns = useMemo<ExportColumn[]>(
        () => [
            { key: 'product_name', label: t('lbl_product_name'), width: 24 },
            { key: 'sku', label: t('lbl_sku'), width: 13 },
            { key: 'category', label: t('lbl_category'), width: 14 },
            { key: 'current_qty', label: t('lbl_current_stock'), width: 11 },
            { key: 'low_stock_qty', label: t('lbl_reorder_point'), width: 11 },
            { key: 'avg_daily_sales', label: t('lbl_avg_daily_sales'), width: 12 },
            { key: 'days_until_stockout', label: t('lbl_days_left'), width: 10, format: (value) => value ?? 'N/A' },
            { key: 'suggested_reorder_qty', label: t('lbl_suggested_qty'), width: 12 },
            { key: 'estimated_cost', label: t('lbl_estimated_cost'), width: 13 },
            { key: 'urgency', label: t('lbl_urgency'), width: 10, format: (value) => t(`lbl_urgency_${value}`) },
        ],
        [t]
    );

    const exportSummary = useMemo(
        () => [
            { label: t('lbl_total_items'), value: summary.totalItems },
            { label: t('lbl_suggested_qty'), value: summary.totalQty },
            { label: t('lbl_critical_high'), value: summary.criticalCount + summary.highCount },
            { label: t('lbl_estimated_cost'), value: summary.estimatedCost.toFixed(2) },
        ],
        [summary, t]
    );

    const columns = [
        {
            key: '_select',
            label: '',
            sortable: false,
            render: (_value: any, row: any) => (
                <input
                    type="checkbox"
                    checked={selectedIds.includes(Number(row.product_id))}
                    onChange={() => toggleSelect(Number(row.product_id))}
                    className="form-checkbox h-4 w-4"
                />
            ),
        },
        { key: 'product_name', label: t('lbl_product_name'), sortable: false },
        { key: 'sku', label: t('lbl_sku'), sortable: false },
        { key: 'current_qty', label: t('lbl_current_stock'), sortable: false },
        { key: 'low_stock_qty', label: t('lbl_reorder_point'), sortable: false },
        { key: 'suggested_reorder_qty', label: t('lbl_suggested_qty'), sortable: false },
        { key: 'estimated_cost', label: t('lbl_estimated_cost'), sortable: false },
        {
            key: 'urgency',
            label: t('lbl_urgency'),
            sortable: false,
            render: (row: any) => (
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                    row.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                    row.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                    row.urgency === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                }`}>
                    {t(`lbl_urgency_${row.urgency}`)}
                </span>
            ),
        },
        {
            key: '_action',
            label: '',
            sortable: false,
            render: (_value: any, row: any) => (
                <button
                    type="button"
                    onClick={() => handleCreateDraft([Number(row.product_id)])}
                    disabled={isCreatingDraft}
                    className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {t('btn_reorder')}
                </button>
            ),
        },
    ];

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BrainCircuit className="h-6 w-6" />
                    </span>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">{t('lbl_reorder_suggestions')}</h1>
                        <p className="text-sm text-slate-500">{t('lbl_reorder_suggestions_desc')}</p>
                    </div>
                </div>
                <ReportExportToolbar
                    reportTitle={t('lbl_reorder_suggestions')}
                    reportDescription={t('lbl_reorder_suggestions_desc')}
                    data={suggestions}
                    columns={exportColumns}
                    summary={exportSummary}
                    fileName="reorder_suggestions"
                />
            </div>

            <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">{t('lbl_total_items')}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{summary.totalItems}</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-xs font-semibold uppercase text-red-600">{t('lbl_critical_high')}</p>
                    <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                        {summary.criticalCount + summary.highCount}
                    </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">{t('lbl_suggested_qty')}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{summary.totalQty}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">{t('lbl_selected')}</p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                        <p className="text-2xl font-bold text-slate-900">{selectedSuggestions.length}</p>
                        {suggestions.length > 0 && (
                            <button
                                type="button"
                                onClick={toggleSelectAll}
                                className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary"
                            >
                                {selectedIds.length === suggestions.length ? t('lbl_clear_short') : t('lbl_select_all_short')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                    <p className="text-sm font-semibold text-primary">
                        {t('lbl_selected_for_purchase_draft').replace('{{count}}', String(selectedIds.length))}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={toggleSelectAll}
                            className="rounded-md border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary"
                        >
                            {selectedIds.length === suggestions.length ? t('lbl_clear_selection') : t('lbl_select_all_short')}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleCreateDraft(selectedIds)}
                            disabled={isCreatingDraft}
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            <PackageCheck className="h-4 w-4" />
                            {isCreatingDraft ? t('btn_creating') : t('btn_create_purchase_draft')}
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <ReusableTable
                    columns={columns}
                    data={suggestions}
                    isLoading={isLoading}
                    emptyMessage={t('lbl_no_reorder_suggestions')}
                />
            </div>
        </div>
    );
};

export default ReorderSuggestionsPage;
