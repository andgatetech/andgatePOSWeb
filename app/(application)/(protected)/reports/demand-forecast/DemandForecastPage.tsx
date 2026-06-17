'use client';

import ReusableTable from '@/components/common/ReusableTable';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetDemandForecastQuery } from '@/store/features/aiReports/aiReportsApi';
import { TrendingUp } from 'lucide-react';
import { useState, useMemo } from 'react';

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

    const columns = [
        { key: 'product_name', label: t('lbl_product'), sortable: false },
        { key: 'current_qty', label: t('lbl_current_stock'), sortable: false },
        { key: 'forecasted_daily_qty', label: t('lbl_avg_daily_sales'), sortable: false },
        { key: 'forecasted_total_qty', label: t('lbl_predicted_demand'), sortable: false },
        {
            key: 'will_stockout_in_window',
            label: t('lbl_stockout_risk'),
            sortable: false,
            render: (row: any) => row.will_stockout_in_window ? (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{t('lbl_at_risk')}</span>
            ) : (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">{t('lbl_safe')}</span>
            ),
        },
        {
            key: 'confidence',
            label: t('lbl_confidence'),
            sortable: false,
            render: (row: any) => (
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${CONFIDENCE_COLORS[row.confidence] || 'bg-gray-100 text-gray-600'}`}>
                    {t(`lbl_confidence_${row.confidence}`)}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#046ca9] to-[#034d79] px-6 py-5 text-white shadow-lg">
                <TrendingUp className="h-8 w-8 flex-shrink-0 opacity-90" />
                <div>
                    <h1 className="text-xl font-bold">{t('lbl_demand_forecast')}</h1>
                    <p className="text-sm opacity-80">{t('lbl_demand_forecast_desc')}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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

            <ReusableTable
                columns={columns}
                data={forecasts}
                isLoading={isLoading}
                emptyMessage={t('lbl_no_forecast_data')}
            />
        </div>
    );
};

export default DemandForecastPage;
