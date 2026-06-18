'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReusableTable from '@/components/common/ReusableTable';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetDemandForecastQuery } from '@/store/features/aiReports/aiReportsApi';
import { AlertTriangle, PackageCheck, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

const CONFIDENCE_COLORS: Record<string, string> = {
    high: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-red-100 text-red-700',
};

const PERIOD_MAP: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
};

const DemandForecastPage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [period, setPeriod] = useState('');

    const params = useMemo(() => {
        const p: Record<string, any> = {};
        if (currentStoreId) p.store_id = currentStoreId;
        if (period && PERIOD_MAP[period]) p.forecast_days = PERIOD_MAP[period];
        return p;
    }, [currentStoreId, period]);

    const { data, isLoading } = useGetDemandForecastQuery(params, { skip: !currentStoreId });

    const summary = useMemo(() => data?.data || {}, [data]);
    const forecasts = useMemo(() => data?.data?.forecasts || [], [data]);
    const periodLabel = period ? t(`lbl_${PERIOD_MAP[period]}_days`) : `${t('lbl_30_days')} (${t('lbl_default')})`;

    const exportColumns = useMemo<ExportColumn[]>(
        () => [
            { key: 'product_name', label: t('lbl_product'), width: 24 },
            { key: 'current_qty', label: t('lbl_current_stock'), width: 12 },
            { key: 'forecasted_daily_qty', label: t('lbl_avg_daily_sales'), width: 13 },
            { key: 'forecasted_total_qty', label: t('lbl_predicted_demand'), width: 14 },
            {
                key: 'will_stockout_in_window',
                label: t('lbl_stockout_risk'),
                width: 12,
                format: (value) => value ? t('lbl_at_risk') : t('lbl_safe'),
            },
            { key: 'confidence', label: t('lbl_confidence'), width: 12, format: (value) => t(`lbl_confidence_${value}`) },
        ],
        [t]
    );

    const exportSummary = useMemo(
        () => [
            { label: t('lbl_forecast_period'), value: periodLabel },
            { label: t('lbl_total_items'), value: summary.total_products || forecasts.length },
            { label: t('lbl_stockout_risk'), value: summary.stockout_risk || 0 },
        ],
        [forecasts.length, periodLabel, summary.stockout_risk, summary.total_products, t]
    );

    const columns = [
        { key: 'product_name', label: t('lbl_product'), sortable: false },
        { key: 'current_qty', label: t('lbl_current_stock'), sortable: false },
        { key: 'forecasted_daily_qty', label: t('lbl_avg_daily_sales'), sortable: false },
        { key: 'forecasted_total_qty', label: t('lbl_predicted_demand'), sortable: false },
        {
            key: 'will_stockout_in_window',
            label: t('lbl_stockout_risk'),
            sortable: false,
            render: (_value: any, row: any) => row.will_stockout_in_window ? (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{t('lbl_at_risk')}</span>
            ) : (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">{t('lbl_safe')}</span>
            ),
        },
        {
            key: 'confidence',
            label: t('lbl_confidence'),
            sortable: false,
            render: (_value: any, row: any) => (
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${CONFIDENCE_COLORS[row.confidence] || 'bg-gray-100 text-gray-600'}`}>
                    {t(`lbl_confidence_${row.confidence}`)}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <TrendingUp className="h-6 w-6" />
                    </span>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">{t('lbl_demand_forecast')}</h1>
                        <p className="text-sm text-slate-500">{t('lbl_demand_forecast_desc')}</p>
                    </div>
                </div>
                <ReportExportToolbar
                    reportTitle={t('lbl_demand_forecast')}
                    reportDescription={t('lbl_demand_forecast_desc')}
                    data={forecasts}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={{ customFilters: [{ label: t('lbl_forecast_period'), value: periodLabel }] }}
                    fileName="demand_forecast"
                />
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
                <label className="text-sm font-medium text-gray-600">{t('lbl_forecast_period')}:</label>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">{t('lbl_30_days')} ({t('lbl_default')})</option>
                    <option value="7d">{t('lbl_7_days')}</option>
                    <option value="30d">{t('lbl_30_days')}</option>
                    <option value="90d">{t('lbl_90_days')}</option>
                </select>
                {summary.total_products > 0 && (
                    <span className="text-sm text-gray-500">
                        {summary.total_products} {t('lbl_products')} | {summary.stockout_risk} {t('lbl_at_risk')}
                    </span>
                )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">{t('lbl_total_items')}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{summary.total_products || forecasts.length}</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-xs font-semibold uppercase text-red-600">{t('lbl_stockout_risk')}</p>
                    <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                        {summary.stockout_risk || 0}
                    </p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-xs font-semibold uppercase text-green-700">{t('lbl_safe')}</p>
                    <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-green-800">
                        <PackageCheck className="h-5 w-5" />
                        {(summary.total_products || forecasts.length) - (summary.stockout_risk || 0)}
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <ReusableTable
                    columns={columns}
                    data={forecasts}
                    isLoading={isLoading}
                    emptyMessage={t('lbl_no_forecast_data')}
                />
            </div>
        </div>
    );
};

export default DemandForecastPage;
