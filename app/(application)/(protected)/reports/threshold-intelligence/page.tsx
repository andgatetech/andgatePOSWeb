'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import React, { useState } from 'react';
import {
    TrendingDown, TrendingUp, Minus, ArrowRightLeft,
    AlertTriangle, CheckCircle, RefreshCw, Lightbulb,
} from 'lucide-react';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetThresholdIntelligenceQuery } from '@/store/features/aiReports/aiReportsApi';
import {
    useBulkUpdateThresholdsMutation,
} from '@/store/features/stockThreshold/stockThresholdApi';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';

type Rec = {
    stock_id: number;
    product_id: number;
    product_name: string;
    category: string | null;
    sku: string | null;
    quantity: number;
    current_threshold: number;
    effective_threshold: number;
    recommended_threshold: number;
    threshold_gap: number | null;
    needs_adjustment: boolean;
    avg_daily_sales_30d: number;
    avg_daily_sales_7d: number;
    days_until_stockout: number | null;
    days_until_stockout_prev: number | null;
    stockout_trend: 'improving' | 'deteriorating' | 'stable';
    velocity_acceleration: number;
    lead_days: number;
};

type Transfer = {
    product_id: number;
    product_name: string;
    sku: string | null;
    deficit_qty: number;
    units_needed: number;
    surplus_store_name: string;
    surplus_qty: number;
    transferable_qty: number;
    avg_daily_sales: number;
};

const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'deteriorating') return <TrendingDown className="w-4 h-4 text-red-500" />;
    if (trend === 'improving')     return <TrendingUp   className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
};

const DaysUntilBadge = ({ days }: { days: number | null }) => {
    if (days === null) return <span className="text-gray-400 text-xs">—</span>;
    const cls = days <= 3  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              : days <= 7  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
              : days <= 14 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
              :              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    return (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
            {days}d
        </span>
    );
};

export default function ThresholdIntelligencePage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [leadDays, setLeadDays] = useState(7);
    const [applyingIds, setApplyingIds] = useState<Set<number>>(new Set());
    const [tab, setTab] = useState<'recommendations' | 'transfers'>('recommendations');

    const { data, isFetching, refetch } = useGetThresholdIntelligenceQuery(
        { store_id: currentStoreId!, lead_days: leadDays },
        { skip: !currentStoreId }
    );

    const [bulkUpdate] = useBulkUpdateThresholdsMutation();

    const d = data?.data;
    const recs: Rec[]       = d?.recommendations ?? [];
    const transfers: Transfer[] = d?.transfer_suggestions ?? [];
    const needsAdj  = d?.needs_adjustment ?? 0;
    const detCount  = d?.deteriorating_count ?? 0;

    const recommendationExportColumns: ExportColumn[] = [
        { key: 'product_name', label: t('lbl_product'), width: 24 },
        { key: 'category', label: t('lbl_category'), width: 14 },
        { key: 'sku', label: t('lbl_sku'), width: 12 },
        { key: 'quantity', label: t('lbl_in_stock'), width: 10 },
        { key: 'effective_threshold', label: t('Current Threshold'), width: 13 },
        { key: 'recommended_threshold', label: t('Recommended'), width: 13 },
        { key: 'threshold_gap', label: t('Threshold Gap'), width: 11, format: (value) => value ?? 0 },
        { key: 'avg_daily_sales_30d', label: t('lbl_avg_per_day'), width: 12 },
        { key: 'days_until_stockout', label: t('lbl_days_left'), width: 10, format: (value) => value ?? 'N/A' },
        { key: 'stockout_trend', label: t('Trend'), width: 12 },
    ];

    const transferExportColumns: ExportColumn[] = [
        { key: 'product_name', label: t('lbl_product'), width: 24 },
        { key: 'sku', label: t('lbl_sku'), width: 12 },
        { key: 'deficit_qty', label: t('Deficit Qty'), width: 11 },
        { key: 'units_needed', label: t('Units Needed'), width: 12 },
        { key: 'surplus_store_name', label: t('Transfer From'), width: 20 },
        { key: 'transferable_qty', label: t('Available'), width: 12 },
        { key: 'avg_daily_sales', label: t('lbl_avg_per_day'), width: 12 },
    ];

    const handleApply = async (rec: Rec) => {
        if (!currentStoreId) return;
        setApplyingIds((s) => new Set(s).add(rec.stock_id));
        try {
            await bulkUpdate({
                store_id: currentStoreId,
                items: [{ stock_id: rec.stock_id, low_stock_quantity: rec.recommended_threshold }],
            }).unwrap();
            showSuccessDialog(t('msg_threshold_updated'));
        } catch {
            showErrorDialog(t('msg_threshold_update_failed'));
        } finally {
            setApplyingIds((s) => { const n = new Set(s); n.delete(rec.stock_id); return n; });
        }
    };

    const handleApplyAll = async () => {
        if (!currentStoreId) return;
        const toApply = recs.filter((r) => r.needs_adjustment);
        if (!toApply.length) return;
        try {
            await bulkUpdate({
                store_id: currentStoreId,
                items: toApply.map((r) => ({ stock_id: r.stock_id, low_stock_quantity: r.recommended_threshold })),
            }).unwrap();
            showSuccessDialog(`${toApply.length} thresholds updated`);
            refetch();
        } catch {
            showErrorDialog('Failed to apply recommendations');
        }
    };

    return (
        <div className="p-4 space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        {t('Threshold Intelligence')}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {t('Velocity-based threshold recommendations and stockout trend analysis')}
                    </p>
                    <p className="mt-2 max-w-3xl text-xs leading-5 text-gray-500 dark:text-gray-400">
                        {t('Use this when low-stock alerts feel too early or too late. It reviews recent sales speed and suggests better alert quantities before products run out.')}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-500">{t('Lead days')}:</label>
                        <select
                            value={leadDays}
                            onChange={(e) => setLeadDays(+e.target.value)}
                            className="text-sm px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            {[3, 5, 7, 10, 14, 21, 30].map((d) => (
                                <option key={d} value={d}>{d} days</option>
                            ))}
                        </select>
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            title={t('lbl_refresh')}
                        >
                            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <ReportExportToolbar
                        reportTitle={tab === 'recommendations' ? t('Threshold Intelligence') : t('Transfer Suggestions')}
                        reportDescription={tab === 'recommendations'
                            ? t('Velocity-based threshold recommendations and stockout trend analysis')
                            : t('Stock transfer opportunities across stores')}
                        data={tab === 'recommendations' ? recs : transfers}
                        columns={tab === 'recommendations' ? recommendationExportColumns : transferExportColumns}
                        summary={[
                            { label: t('Lead days'), value: leadDays },
                            { label: t('Products analysed'), value: d?.total_products ?? 0 },
                            { label: t('Thresholds to fix'), value: needsAdj },
                            { label: t('Transfer tips'), value: transfers.length },
                        ]}
                        filterSummary={{ customFilters: [{ label: t('Lead days'), value: `${leadDays} days` }] }}
                        fileName={`threshold_intelligence_${tab}`}
                    />
                </div>
            </div>

            {/* Summary cards */}
            {d && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: t('Products analysed'), value: d.total_products, color: 'text-gray-700 dark:text-gray-200' },
                        { label: t('Thresholds to fix'), value: needsAdj, color: needsAdj > 0 ? 'text-orange-600' : 'text-green-600' },
                        { label: t('Deteriorating'), value: detCount, color: detCount > 0 ? 'text-red-600' : 'text-green-600' },
                        { label: t('Transfer tips'), value: transfers.length, color: transfers.length > 0 ? 'text-blue-600' : 'text-gray-400' },
                    ].map((card) => (
                        <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
                {(['recommendations', 'transfers'] as const).map((tabId) => (
                    <button
                        key={tabId}
                        onClick={() => setTab(tabId)}
                        className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                            tab === tabId
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        {t(tabId === 'recommendations' ? 'Recommendations' : 'Transfer Suggestions')}
                        {tabId === 'recommendations' && needsAdj > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                {needsAdj}
                            </span>
                        )}
                        {tabId === 'transfers' && transfers.length > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                {transfers.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Recommendations tab */}
            {tab === 'recommendations' && (
                <div className="space-y-3">
                    {needsAdj > 0 && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleApplyAll}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                            >
                                <CheckCircle className="w-4 h-4" />
                                {t('Apply all recommendations')} ({needsAdj})
                            </button>
                        </div>
                    )}

                    {isFetching && recs.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">{t('lbl_loading')}</div>
                    ) : recs.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">{t('msg_no_data')}</div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 w-1/4">{t('lbl_product')}</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-right">{t('lbl_in_stock')}</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-right">{t('Curr. Threshold')}</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-right">{t('Recommended')}</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-right">{t('lbl_avg_per_day')}</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-center">{t('Days left')}</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-center">{t('Trend')}</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {recs.map((rec) => (
                                        <tr
                                            key={rec.stock_id}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                                                rec.needs_adjustment ? 'bg-orange-50/30 dark:bg-orange-900/5' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                                                    {rec.product_name}
                                                </div>
                                                <div className="text-xs text-gray-400">{rec.category ?? '—'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">{rec.quantity}</td>
                                            <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                                                {rec.effective_threshold > 0 ? rec.effective_threshold : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {rec.recommended_threshold > 0 ? (
                                                    <span className={`font-semibold ${
                                                        rec.needs_adjustment
                                                            ? rec.threshold_gap! > 0 ? 'text-orange-600' : 'text-blue-600'
                                                            : 'text-green-600'
                                                    }`}>
                                                        {rec.recommended_threshold}
                                                        {rec.threshold_gap !== null && rec.threshold_gap !== 0 && (
                                                            <span className="ml-1 text-xs font-normal opacity-70">
                                                                ({rec.threshold_gap > 0 ? '+' : ''}{rec.threshold_gap})
                                                            </span>
                                                        )}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums text-gray-500 text-xs">
                                                {rec.avg_daily_sales_30d > 0 ? rec.avg_daily_sales_30d.toFixed(2) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <DaysUntilBadge days={rec.days_until_stockout} />
                                                    {rec.days_until_stockout_prev !== null && rec.days_until_stockout !== null && (
                                                        <span className="text-xs text-gray-400">
                                                            ← {rec.days_until_stockout_prev}d
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <TrendIcon trend={rec.stockout_trend} />
                                                    <span className="text-xs text-gray-500 capitalize">{rec.stockout_trend}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {rec.needs_adjustment && rec.recommended_threshold > 0 && (
                                                    <button
                                                        onClick={() => handleApply(rec)}
                                                        disabled={applyingIds.has(rec.stock_id)}
                                                        className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors whitespace-nowrap"
                                                    >
                                                        {applyingIds.has(rec.stock_id) ? t('Applying...') : t('btn_apply')}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Transfer suggestions tab */}
            {tab === 'transfers' && (
                <div className="space-y-3">
                    {transfers.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            {t('No transfer opportunities found across your stores')}
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 w-1/3">{t('lbl_product')}</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-right">{t('Deficit Qty')}</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-right">{t('Units Needed')}</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('Transfer From')}</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-right">{t('Available')}</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-right">{t('lbl_avg_per_day')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {transfers.map((tr, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {tr.product_name}
                                                </div>
                                                {tr.sku && <div className="text-xs text-gray-400">{tr.sku}</div>}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums text-red-600 font-medium">
                                                {tr.deficit_qty}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums text-orange-600 font-medium">
                                                {tr.units_needed}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                                    <span className="text-blue-700 dark:text-blue-400 font-medium">
                                                        {tr.surplus_store_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums text-green-600">
                                                {tr.transferable_qty}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums text-gray-500 text-xs">
                                                {tr.avg_daily_sales > 0 ? tr.avg_daily_sales.toFixed(2) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
