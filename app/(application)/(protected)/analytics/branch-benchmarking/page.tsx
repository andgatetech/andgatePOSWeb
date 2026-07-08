'use client';

import { useState } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useGetBranchBenchmarkQuery } from '@/store/features/analytics/analyticsApi';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Building2 } from 'lucide-react';

export default function BranchBenchmarkingPage() {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();
    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [startDate, setStartDate] = useState(thirtyDaysAgo);
    const [endDate, setEndDate] = useState(today);

    const { data, isLoading, refetch } = useGetBranchBenchmarkQuery(
        { start_date: startDate, end_date: endDate },
        { skip: !startDate || !endDate }
    );

    const branches = data?.data?.branches || [];

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('lbl_branch_benchmarking')}</h1>
                    <p className="text-sm text-gray-500">{t('lbl_branch_benchmarking_desc')}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_start_date')}</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_end_date')}</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" />
                </div>
                <button onClick={() => refetch()} className="btn btn-primary">{t('lbl_apply')}</button>
            </div>

            {isLoading ? (
                <p className="text-sm text-gray-500">{t('lbl_loading')}</p>
            ) : branches.length === 0 ? (
                <p className="text-sm text-gray-500">{t('msg_no_data_found')}</p>
            ) : (
                <>
                    <div className="h-80 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={branches}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="store_name" />
                                <YAxis tickFormatter={(v) => formatCurrency(v)} />
                                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                                <Legend />
                                <Bar dataKey="sales" fill="#046ca9" />
                                <Bar dataKey="orders" fill="#00ab55" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="px-4 py-3">{t('lbl_branch')}</th>
                                    <th className="px-4 py-3">{t('lbl_sales')}</th>
                                    <th className="px-4 py-3">{t('lbl_orders')}</th>
                                    <th className="px-4 py-3">{t('lbl_average_order_value')}</th>
                                    <th className="px-4 py-3">{t('lbl_customers')}</th>
                                    <th className="px-4 py-3">{t('lbl_new_customers')}</th>
                                    <th className="px-4 py-3">{t('lbl_rank')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {branches.map((b: any) => (
                                    <tr key={b.store_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-gray-400" />
                                                {b.store_name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{formatCurrency(b.sales)}</td>
                                        <td className="px-4 py-3">{b.orders}</td>
                                        <td className="px-4 py-3">{formatCurrency(b.average_order_value)}</td>
                                        <td className="px-4 py-3">{b.customers}</td>
                                        <td className="px-4 py-3">{b.new_customers}</td>
                                        <td className="px-4 py-3">#{b.rank_sales}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
