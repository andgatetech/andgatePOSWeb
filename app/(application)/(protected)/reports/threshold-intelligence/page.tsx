'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import React, { useState } from 'react';
import { TrendingDown, TrendingUp, Minus, ArrowRightLeft, AlertTriangle, CheckCircle, RefreshCw, Lightbulb } from 'lucide-react';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetThresholdIntelligenceQuery } from '@/store/features/aiReports/aiReportsApi';
import { useBulkUpdateThresholdsMutation } from '@/store/features/stockThreshold/stockThresholdApi';
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
    if (trend === 'deteriorating') return <TrendingDown className="h-4 w-4 text-danger" />;
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-success" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
};

const DaysUntilBadge = ({ days }: { days: number | null }) => {
    if (days === null) return <span className="text-xs text-gray-400">—</span>;
    const cls =
        days <= 3
            ? 'bg-danger-light text-danger dark:bg-red-900/30 dark:text-red-300'
            : days <= 7
            ? 'bg-warning-light text-warning dark:bg-orange-900/30 dark:text-orange-300'
            : days <= 14
            ? 'bg-warning-light text-warning dark:bg-yellow-900/30 dark:text-yellow-300'
            : 'bg-success-light text-success dark:bg-green-900/30 dark:text-green-300';
    return <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{days}d</span>;
};

export default function ThresholdIntelligencePage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [leadDays, setLeadDays] = useState(7);
    const [applyingIds, setApplyingIds] = useState<Set<number>>(new Set());
    const [tab, setTab] = useState<'recommendations' | 'transfers'>('recommendations');

    const { data, isFetching, refetch } = useGetThresholdIntelligenceQuery({ store_id: currentStoreId!, lead_days: leadDays }, { skip: !currentStoreId });

    const [bulkUpdate] = useBulkUpdateThresholdsMutation();

    const d = data?.data;
    const recs: Rec[] = d?.recommendations ?? [];
    const transfers: Transfer[] = d?.transfer_suggestions ?? [];
    const needsAdj = d?.needs_adjustment ?? 0;
    const detCount = d?.deteriorating_count ?? 0;

    const recommendationExportColumns: ExportColumn[] = [
        { key: 'product_name', label: t('lbl_product'), width: 24 },
        { key: 'category', label: t('lbl_category'), width: 14 },
        { key: 'sku', label: t('lbl_sku'), width: 12 },
        { key: 'quantity', label: t('lbl_in_stock'), width: 10 },
        { key: 'effective_threshold', label: t('lbl_current_threshold'), width: 13 },
        { key: 'recommended_threshold', label: t('Recommended'), width: 13 },
        { key: 'threshold_gap', label: t('lbl_threshold_gap'), width: 11, format: (value) => value ?? 0 },
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
            setApplyingIds((s) => {
                const n = new Set(s);
                n.delete(rec.stock_id);
                return n;
            });
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
        <div className="space-y-5 p-4">
            {/* Header */}
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                        <Lightbulb className="h-5 w-5 text-warning" />
                        {t('Threshold Intelligence')}
                    </h1>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{t('Velocity-based threshold recommendations and stockout trend analysis')}</p>
                    <p className="mt-2 max-w-3xl text-xs leading-5 text-gray-500 dark:text-gray-400">{t('msg_threshold_intelligence_desc')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-500">{t('Lead days')}:</label>
                        <select
                            value={leadDays}
                            onChange={(e) => setLeadDays(+e.target.value)}
                            className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-700 dark:bg-gray-900"
                        >
                            {[3, 5, 7, 10, 14, 21, 30].map((d) => (
                                <option key={d} value={d}>
                                    {d} days
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            title={t('lbl_refresh')}
                        >
                            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <ReportExportToolbar
                        reportTitle={tab === 'recommendations' ? t('Threshold Intelligence') : t('Transfer Suggestions')}
                        reportDescription={tab === 'recommendations' ? t('Velocity-based threshold recommendations and stockout trend analysis') : t('lbl_transfer_suggestions')}
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
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: t('Products analysed'), value: d.total_products, color: 'text-gray-700 dark:text-gray-200' },
                        { label: t('Thresholds to fix'), value: needsAdj, color: needsAdj > 0 ? 'text-warning' : 'text-success' },
                        { label: t('Deteriorating'), value: detCount, color: detCount > 0 ? 'text-danger' : 'text-success' },
                        { label: t('Transfer tips'), value: transfers.length, color: transfers.length > 0 ? 'text-info' : 'text-gray-400' },
                    ].map((card) => (
                        <div key={card.label} className="rounded-lg border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                            <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{card.label}</div>
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
                        className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium capitalize transition-colors ${
                            tab === tabId ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        {t(tabId === 'recommendations' ? 'Recommendations' : 'Transfer Suggestions')}
                        {tabId === 'recommendations' && needsAdj > 0 && (
                            <span className="ml-1.5 rounded-full bg-warning-light px-1.5 py-0.5 text-xs text-warning dark:bg-orange-900/30 dark:text-orange-300">{needsAdj}</span>
                        )}
                        {tabId === 'transfers' && transfers.length > 0 && (
                            <span className="ml-1.5 rounded-full bg-info-light px-1.5 py-0.5 text-xs text-info dark:bg-blue-900/30 dark:text-blue-300">{transfers.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Recommendations tab */}
            {tab === 'recommendations' && (
                <div className="space-y-3">
                    {needsAdj > 0 && (
                        <div className="flex justify-end">
                            <button onClick={handleApplyAll} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary/90">
                                <CheckCircle className="h-4 w-4" />
                                {t('Apply all recommendations')} ({needsAdj})
                            </button>
                        </div>
                    )}

                    {isFetching && recs.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">{t('lbl_loading')}</div>
                    ) : recs.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">{t('msg_no_data')}</div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-left dark:bg-gray-800">
                                        <th className="w-1/4 px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('lbl_product')}</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">{t('lbl_in_stock')}</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">{t('Curr. Threshold')}</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">{t('Recommended')}</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">{t('lbl_avg_per_day')}</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-300">{t('Days left')}</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-300">{t('Trend')}</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {recs.map((rec) => (
                                        <tr
                                            key={rec.stock_id}
                                            className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${rec.needs_adjustment ? 'bg-warning-light/30 dark:bg-orange-900/5' : ''}`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="max-w-[200px] truncate font-medium text-gray-900 dark:text-white">{rec.product_name}</div>
                                                <div className="text-xs text-gray-400">{rec.category ?? '—'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">{rec.quantity}</td>
                                            <td className="px-4 py-3 text-right tabular-nums text-gray-500">{rec.effective_threshold > 0 ? rec.effective_threshold : '—'}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {rec.recommended_threshold > 0 ? (
                                                    <span className={`font-semibold ${rec.needs_adjustment ? (rec.threshold_gap! > 0 ? 'text-warning' : 'text-info') : 'text-success'}`}>
                                                        {rec.recommended_threshold}
                                                        {rec.threshold_gap !== null && rec.threshold_gap !== 0 && (
                                                            <span className="ml-1 text-xs font-normal opacity-70">
                                                                ({rec.threshold_gap > 0 ? '+' : ''}
                                                                {rec.threshold_gap})
                                                            </span>
                                                        )}
                                                    </span>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right text-xs tabular-nums text-gray-500">{rec.avg_daily_sales_30d > 0 ? rec.avg_daily_sales_30d.toFixed(2) : '—'}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <DaysUntilBadge days={rec.days_until_stockout} />
                                                    {rec.days_until_stockout_prev !== null && rec.days_until_stockout !== null && (
                                                        <span className="text-xs text-gray-400">← {rec.days_until_stockout_prev}d</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <TrendIcon trend={rec.stockout_trend} />
                                                    <span className="text-xs capitalize text-gray-500">{rec.stockout_trend}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {rec.needs_adjustment && rec.recommended_threshold > 0 && (
                                                    <button
                                                        onClick={() => handleApply(rec)}
                                                        disabled={applyingIds.has(rec.stock_id)}
                                                        className="whitespace-nowrap rounded-lg bg-primary/10 px-2.5 py-1 text-xs text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
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
                        <div className="py-12 text-center text-gray-400">{t('No transfer opportunities found across your stores')}</div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-left dark:bg-gray-800">
                                        <th className="w-1/3 px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('lbl_product')}</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">{t('Deficit Qty')}</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">{t('Units Needed')}</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('Transfer From')}</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">{t('Available')}</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">{t('lbl_avg_per_day')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {transfers.map((tr, i) => (
                                        <tr key={i} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 dark:text-white">{tr.product_name}</div>
                                                {tr.sku && <div className="text-xs text-gray-400">{tr.sku}</div>}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium tabular-nums text-danger">{tr.deficit_qty}</td>
                                            <td className="px-4 py-3 text-right font-medium tabular-nums text-warning">{tr.units_needed}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <ArrowRightLeft className="h-3.5 w-3.5 flex-shrink-0 text-info" />
                                                    <span className="font-medium text-info dark:text-info">{tr.surplus_store_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums text-success">{tr.transferable_qty}</td>
                                            <td className="px-4 py-3 text-right text-xs tabular-nums text-gray-500">{tr.avg_daily_sales > 0 ? tr.avg_daily_sales.toFixed(2) : '—'}</td>
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
