'use client';

import Loader from '@/lib/Loader';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetDailySummaryQuery, useGetWeeklySummaryQuery } from '@/store/features/aiReports/aiReportsApi';
import { Sparkles, TrendingUp, ShoppingCart, Package, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useCurrency } from '@/hooks/useCurrency';

type Tab = 'daily' | 'weekly';

const SmartSummaryPage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState<Tab>('daily');

    const params = useMemo(() => (currentStoreId ? { store_id: currentStoreId } : {}), [currentStoreId]);

    const { data: dailyData, isLoading: dailyLoading } = useGetDailySummaryQuery(params, { skip: !currentStoreId });
    const { data: weeklyData, isLoading: weeklyLoading } = useGetWeeklySummaryQuery(params, { skip: !currentStoreId });

    const rawData = activeTab === 'daily' ? dailyData?.data || {} : weeklyData?.data || {};
    const isLoading = activeTab === 'daily' ? dailyLoading : weeklyLoading;

    const metrics = rawData?.metrics || {};
    const topProducts = metrics?.top_products || [];
    const narrative = activeTab === 'daily' ? rawData?.narrative : null;

    const stats = [
        { label: t('lbl_revenue'), value: formatCurrency(metrics.revenue || 0), icon: <TrendingUp className="h-5 w-5 text-success" /> },
        { label: t('lbl_total_orders'), value: metrics.order_count || 0, icon: <ShoppingCart className="h-5 w-5 text-primary" /> },
        { label: t('lbl_new_customers'), value: metrics.new_customers || 0, icon: <Package className="h-5 w-5 text-warning" /> },
        { label: t('lbl_returns'), value: metrics.return_count || 0, icon: <AlertCircle className="h-5 w-5 text-danger" /> },
    ];

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#046ca9] to-[#034d79] px-6 py-5 text-white shadow-lg">
                <Sparkles className="h-8 w-8 flex-shrink-0 opacity-90" />
                <div>
                    <h1 className="text-xl font-bold">{t('lbl_smart_summary')}</h1>
                    <p className="text-sm opacity-80">{t('lbl_smart_summary_desc')}</p>
                </div>
            </div>

            <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit">
                {(['daily', 'weekly'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                            activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab === 'daily' ? t('lbl_daily') : t('lbl_weekly')}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <Loader fullScreen={false} className="py-10" />
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50">
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                                    <p className="text-lg font-bold text-gray-800">{String(stat.value)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {narrative && (
                        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                            <h3 className="mb-2 font-semibold text-gray-700">{t('lbl_summary')}</h3>
                            <p className="text-sm leading-relaxed text-gray-600">{narrative}</p>
                        </div>
                    )}

                    {topProducts.length > 0 && (
                        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                            <h3 className="mb-3 font-semibold text-gray-700">{t('lbl_top_products')}</h3>
                            <ul className="divide-y divide-gray-100">
                                {topProducts.map((p: any, i: number) => (
                                    <li key={i} className="flex items-center justify-between py-2 text-sm">
                                        <span className="text-gray-700">{p.product_name}</span>
                                        <span className="font-medium text-primary">{p.qty_sold} {t('lbl_units')}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SmartSummaryPage;
