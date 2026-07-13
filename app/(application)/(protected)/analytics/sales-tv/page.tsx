'use client';

import { useEffect } from 'react';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useGetSalesTvQuery } from '@/store/features/analytics/analyticsApi';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Tv } from 'lucide-react';

export default function SalesTvPage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const { data, isLoading, refetch } = useGetSalesTvQuery(currentStoreId ? { store_id: currentStoreId } : {}, { skip: false, pollingInterval: 30000 });

    const tv = data?.data;

    useEffect(() => {
        const timer = setInterval(() => refetch(), 30000);
        return () => clearInterval(timer);
    }, [refetch]);

    return (
        <div className="min-h-screen space-y-6 bg-gray-950 p-6 text-white">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Tv className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-black">{t('lbl_sales_tv')}</h1>
                </div>
                <p className="text-sm text-gray-400">
                    {t('lbl_refreshed')}: {tv?.refreshed_at ? new Date(tv.refreshed_at).toLocaleTimeString() : '-'}
                </p>
            </div>

            {isLoading ? (
                <p className="text-gray-400">{t('lbl_loading')}</p>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="rounded-lg bg-[#eef7fc] p-6">
                            <p className="text-sm text-gray-300">{t('lbl_sales_today')}</p>
                            <p className="mt-2 text-4xl font-black">{formatCurrency(tv?.sales_today || 0)}</p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 p-6">
                            <p className="text-sm text-gray-300">{t('lbl_orders_today')}</p>
                            <p className="mt-2 text-4xl font-black">{tv?.orders_today || 0}</p>
                        </div>
                        <div className="rounded-lg bg-[#fff4e6] p-6">
                            <p className="text-sm text-gray-300">{t('lbl_average_order_value')}</p>
                            <p className="mt-2 text-4xl font-black">{formatCurrency(tv?.average_order_value || 0)}</p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-6">
                            <p className="text-sm text-gray-300">{t('lbl_yesterday_sales')}</p>
                            <p className="mt-2 text-4xl font-black">{formatCurrency(tv?.yesterday_sales || 0)}</p>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-lg bg-gray-900 p-5">
                            <h3 className="mb-4 text-lg font-bold">{t('lbl_hourly_sales')}</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={tv?.hourly_sales || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="label" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" tickFormatter={(v) => formatCurrency(v)} />
                                        <Tooltip formatter={(v: any) => formatCurrency(v)} />
                                        <Bar dataKey="total" fill="#046ca9" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-lg bg-gray-900 p-5">
                            <h3 className="mb-4 text-lg font-bold">{t('lbl_top_products')}</h3>
                            <div className="space-y-2">
                                {(tv?.top_products || []).map((p: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between rounded-lg bg-gray-800 p-3">
                                        <span className="text-sm">{p.product_name}</span>
                                        <span className="font-bold text-success">
                                            {p.quantity} sold · {formatCurrency(p.revenue)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
