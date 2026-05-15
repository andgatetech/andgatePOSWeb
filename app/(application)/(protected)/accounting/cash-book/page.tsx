'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { useGetCashBookQuery } from '@/store/features/accounting/accountingApi';
import { ArrowDownCircle, ArrowUpCircle, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

const CashBookPage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();

    const today = new Date().toISOString().split('T')[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [from, setFrom] = useState(firstOfMonth);
    const [to, setTo] = useState(today);

    const { data, isLoading, refetch } = useGetCashBookQuery(
        { store_id: currentStoreId, from, to },
        { skip: !currentStoreId }
    );

    const cashBook = data?.data;
    const entries = useMemo(() => cashBook?.entries ?? [], [cashBook]);

    const refTypeLabel: Record<string, string> = {
        sale: t('lbl_sale'),
        expense: t('lbl_expense'),
        income: t('lbl_income'),
        purchase: t('lbl_purchase'),
        customer_payment: t('lbl_customer_payment'),
        supplier_payment: t('lbl_supplier_payment'),
        manual: t('lbl_manual'),
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('lbl_cash_book')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('msg_cash_book_desc')}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="input input-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                    />
                    <span className="self-center text-gray-400">—</span>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="input input-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                    />
                    <button onClick={refetch} className="btn btn-sm bg-primary text-white rounded-lg px-4 py-1.5 text-sm hover:opacity-90">
                        {t('lbl_refresh')}
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {cashBook && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-success/10">
                            <ArrowDownCircle className="h-6 w-6 text-success" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('lbl_cash_in')}</p>
                            <p className="text-xl font-bold text-success">৳{Number(cashBook.total_in).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-danger/10">
                            <ArrowUpCircle className="h-6 w-6 text-danger" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('lbl_cash_out')}</p>
                            <p className="text-xl font-bold text-danger">৳{Number(cashBook.total_out).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${cashBook.net >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
                            <TrendingUp className={`h-6 w-6 ${cashBook.net >= 0 ? 'text-success' : 'text-danger'}`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('lbl_net_balance')}</p>
                            <p className={`text-xl font-bold ${cashBook.net >= 0 ? 'text-success' : 'text-danger'}`}>
                                ৳{Number(cashBook.net).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {isLoading ? (
                    <Loader fullScreen={false} className="py-20" />
                ) : entries.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 dark:text-gray-500">{t('msg_no_records')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-left">{t('lbl_date')}</th>
                                    <th className="px-4 py-3 text-left">{t('lbl_description')}</th>
                                    <th className="px-4 py-3 text-left">{t('lbl_type')}</th>
                                    <th className="px-4 py-3 text-left">{t('lbl_account')}</th>
                                    <th className="px-4 py-3 text-right text-success">{t('lbl_cash_in')}</th>
                                    <th className="px-4 py-3 text-right text-danger">{t('lbl_cash_out')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {entries.map((row: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{row.entry_date}</td>
                                        <td className="px-4 py-3 text-gray-800 dark:text-gray-100">{row.description}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                                                {refTypeLabel[row.reference_type] ?? row.reference_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{row.account_name}</td>
                                        <td className="px-4 py-3 text-right font-medium text-success">
                                            {row.debit > 0 ? `৳${Number(row.debit).toLocaleString()}` : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-danger">
                                            {row.credit > 0 ? `৳${Number(row.credit).toLocaleString()}` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashBookPage;
