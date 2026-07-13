'use client';

import { useState } from 'react';
import BrandedPageHeader from '@/components/common/BrandedPageHeader';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useGetCashFlowForecastQuery } from '@/store/features/analytics/analyticsApi';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function CashFlowForecastPage() {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();
    const [daysBack, setDaysBack] = useState(90);
    const [forecastDays, setForecastDays] = useState(30);

    const { data, isLoading, refetch } = useGetCashFlowForecastQuery({ days_back: daysBack, forecast_days: forecastDays }, { skip: false });

    const result = data?.data;

    const chartData = [
        ...(result?.history?.map((h: any) => ({ date: h.date, net: h.net, projected_net: null })) || []),
        ...(result?.forecast?.map((f: any) => ({ date: f.date, net: null, projected_net: f.projected_net })) || []),
    ];

    return (
        <div className="min-h-[calc(100vh-120px)] bg-[#f6f8fb] p-4 sm:p-6">
            <div className="mx-auto max-w-7xl space-y-5">
                <BrandedPageHeader icon={<TrendingUp className="h-6 w-6" />} title={t('lbl_cash_flow_forecast')} description={t('lbl_cash_flow_forecast_desc')} />

                <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_historical_days')}</label>
                        <input type="number" min={7} max={365} value={daysBack} onChange={(e) => setDaysBack(Number(e.target.value))} className="form-input" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_forecast_days')}</label>
                        <input type="number" min={7} max={365} value={forecastDays} onChange={(e) => setForecastDays(Number(e.target.value))} className="form-input" />
                    </div>
                    <button onClick={() => refetch()} className="btn btn-primary">
                        {t('lbl_apply')}
                    </button>
                </div>

                {isLoading ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">{t('lbl_loading')}</div>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                                <p className="text-sm text-gray-500">{t('lbl_average_daily_net')}</p>
                                <p className="mt-2 text-2xl font-black text-gray-900">{formatCurrency(result?.average_daily_net || 0)}</p>
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                                <p className="text-sm text-gray-500">{t('lbl_trend_per_day')}</p>
                                <p className="mt-2 text-2xl font-black text-gray-900">{formatCurrency(result?.trend_per_day || 0)}</p>
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                                <p className="text-sm text-gray-500">{t('lbl_projected_end_balance')}</p>
                                <p className="mt-2 text-2xl font-black text-primary">{formatCurrency(result?.forecast?.[result.forecast.length - 1]?.running_balance || 0)}</p>
                            </div>
                        </div>

                        <div className="h-80 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} />
                                    <YAxis tickFormatter={(v) => formatCurrency(v)} />
                                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                                    <Line type="monotone" dataKey="net" stroke="#046ca9" dot={false} strokeWidth={2} connectNulls />
                                    <Line type="monotone" dataKey="projected_net" stroke="#e2a03f" dot={false} strokeDasharray="5 5" strokeWidth={2} connectNulls />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
