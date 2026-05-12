'use client';

import ReusableTable from '@/components/common/ReusableTable';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetDemandForecastQuery } from '@/store/features/aiReports/aiReportsApi';
import { TrendingUp } from 'lucide-react';
import { useState, useMemo } from 'react';

const TREND_ICONS: Record<string, string> = {
    up: '↑',
    down: '↓',
    stable: '→',
};

const DemandForecastPage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [period, setPeriod] = useState('');

    const params = useMemo(() => {
        const p: Record<string, any> = {};
        if (currentStoreId) p.store_id = currentStoreId;
        if (period) p.period = period;
        return p;
    }, [currentStoreId, period]);

    const { data, isLoading } = useGetDemandForecastQuery(params, { skip: !currentStoreId });

    const forecasts = useMemo(() => data?.data?.forecasts || data?.data || [], [data]);

    const columns = [
        { key: 'product', label: t('lbl_product'), sortable: false },
        { key: 'period', label: t('lbl_period'), sortable: false },
        { key: 'predicted_demand', label: t('lbl_predicted_demand'), sortable: false },
        {
            key: 'confidence',
            label: t('lbl_confidence'),
            sortable: false,
            render: (row: any) => <span>{row.confidence}%</span>,
        },
        {
            key: 'trend',
            label: t('lbl_trend'),
            sortable: false,
            render: (row: any) => (
                <span className={`font-semibold ${row.trend === 'up' ? 'text-success' : row.trend === 'down' ? 'text-danger' : 'text-gray-500'}`}>
                    {TREND_ICONS[row.trend] || row.trend}
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
                <label className="text-sm font-medium text-gray-600">{t('lbl_period')}:</label>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">{t('lbl_all')}</option>
                    <option value="7d">{t('lbl_7_days')}</option>
                    <option value="30d">{t('lbl_30_days')}</option>
                    <option value="90d">{t('lbl_90_days')}</option>
                </select>
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
