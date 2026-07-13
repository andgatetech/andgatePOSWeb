'use client';

import { useState } from 'react';
import BrandedPageHeader from '@/components/common/BrandedPageHeader';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useGetBreakEvenQuery } from '@/store/features/analytics/analyticsApi';
import { TrendingUp } from 'lucide-react';

export default function BreakEvenPage() {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();
    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [startDate, setStartDate] = useState(thirtyDaysAgo);
    const [endDate, setEndDate] = useState(today);

    const { data, isLoading, refetch } = useGetBreakEvenQuery({ start_date: startDate, end_date: endDate }, { skip: !startDate || !endDate });

    const r = data?.data;

    return (
        <div className="min-h-[calc(100vh-120px)] bg-[#f6f8fb] p-4 sm:p-6">
            <div className="mx-auto max-w-7xl space-y-5">
                <BrandedPageHeader icon={<TrendingUp className="h-6 w-6" />} title={t('lbl_break_even')} description={t('lbl_break_even_desc')} />

                <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_start_date')}</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_end_date')}</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" />
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
                            <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="mb-2 flex items-center gap-2 text-danger">
                                    <TrendingUp className="h-5 w-5" />
                                    <span className="text-sm font-medium">{t('lbl_fixed_costs')}</span>
                                </div>
                                <p className="text-2xl font-black text-gray-900">{formatCurrency(r?.fixed_costs || 0)}</p>
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
                                <p className="text-sm text-gray-500">{t('lbl_net_revenue')}</p>
                                <p className="mt-2 text-2xl font-black text-gray-900">{formatCurrency(r?.net_revenue || 0)}</p>
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
                                <p className="text-sm text-gray-500">{t('lbl_variable_costs')}</p>
                                <p className="mt-2 text-2xl font-black text-gray-900">{formatCurrency(r?.variable_costs || 0)}</p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border border-[#cde2ef] bg-[#eef7fc] p-5 shadow-sm">
                                <p className="text-sm text-primary">{t('lbl_break_even_revenue')}</p>
                                <p className="mt-2 text-3xl font-black text-primary">{formatCurrency(r?.break_even_revenue || 0)}</p>
                            </div>
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                                <p className="text-sm text-success">{t('lbl_break_even_orders')}</p>
                                <p className="mt-2 text-3xl font-black text-success">{r?.break_even_orders || 0}</p>
                            </div>
                            <div className="rounded-lg border border-[#f3d6ad] bg-[#fff4e6] p-5 shadow-sm">
                                <p className="text-sm text-warning">{t('lbl_safety_margin')}</p>
                                <p className="mt-2 text-3xl font-black text-warning">{r?.safety_margin_percent || 0}%</p>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="mb-3 font-bold text-gray-900">{t('lbl_contribution_margin')}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('lbl_revenue')}</span>
                                    <span className="font-medium">{formatCurrency(r?.revenue || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('lbl_discounts')}</span>
                                    <span className="font-medium">{formatCurrency(r?.discounts || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('lbl_net_revenue')}</span>
                                    <span className="font-medium">{formatCurrency(r?.net_revenue || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('lbl_variable_costs')}</span>
                                    <span className="font-medium">{formatCurrency(r?.variable_costs || 0)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-gray-700">{t('lbl_contribution_margin')}</span>
                                    <span className="font-bold">{formatCurrency(r?.contribution_margin || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('lbl_contribution_margin_ratio')}</span>
                                    <span className="font-medium">{((r?.contribution_margin_ratio || 0) * 100).toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
