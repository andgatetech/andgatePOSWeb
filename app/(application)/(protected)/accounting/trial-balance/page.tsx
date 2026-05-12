'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { useGetTrialBalanceQuery } from '@/store/features/accounting/accountingApi';
import { CheckCircle, Download, XCircle } from 'lucide-react';
import { useState } from 'react';

const typeColors: Record<string, string> = {
    asset:     'text-blue-600 dark:text-blue-400',
    liability: 'text-red-600 dark:text-red-400',
    equity:    'text-purple-600 dark:text-purple-400',
    revenue:   'text-green-600 dark:text-green-400',
    cogs:      'text-orange-600 dark:text-orange-400',
    expense:   'text-rose-600 dark:text-rose-400',
};

const TrialBalancePage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();

    const today = new Date().toISOString().split('T')[0];
    const firstOfYear = `${new Date().getFullYear()}-01-01`;

    const [from, setFrom] = useState(firstOfYear);
    const [to, setTo] = useState(today);
    const [filterType, setFilterType] = useState('');

    const { data, isLoading, refetch } = useGetTrialBalanceQuery(
        { store_id: currentStoreId, from, to },
        { skip: !currentStoreId }
    );

    const tb = data?.data;
    const allRows: any[] = tb?.accounts ?? [];
    const rows = filterType ? allRows.filter((r: any) => r.type === filterType) : allRows;

    const typeLabel: Record<string, string> = {
        asset:     t('lbl_type_asset'),
        liability: t('lbl_type_liability'),
        equity:    t('lbl_type_equity'),
        revenue:   t('lbl_type_revenue'),
        cogs:      t('lbl_type_cogs'),
        expense:   t('lbl_type_expense'),
    };

    const handleExportCSV = () => {
        const headers = ['Code', 'Account', 'Type', 'Debit', 'Credit'];
        const csvRows = rows.map((r: any) => [
            r.account_code,
            `"${r.name}"`,
            r.type,
            r.total_debit,
            r.total_credit,
        ]);
        const csv = [headers, ...csvRows].map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trial-balance-${to}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('lbl_trial_balance')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('msg_trial_balance_desc')}</p>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100" />
                    <span className="text-gray-400">—</span>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100" />
                    <button onClick={refetch}
                        className="px-4 py-1.5 rounded-lg text-sm bg-primary text-white hover:opacity-90">
                        {t('lbl_apply')}
                    </button>
                    {rows.length > 0 && (
                        <button onClick={handleExportCSV}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <Download className="h-4 w-4" />
                            CSV
                        </button>
                    )}
                </div>
            </div>

            {/* Totals + balance status */}
            {tb && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('lbl_total_debit')}</p>
                        <p className="text-2xl font-bold text-success mt-1">৳{Number(tb.total_debit).toLocaleString()}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('lbl_total_credit')}</p>
                        <p className="text-2xl font-bold text-danger mt-1">৳{Number(tb.total_credit).toLocaleString()}</p>
                    </div>
                    <div className={`rounded-xl border p-5 flex items-center gap-3 ${tb.balanced ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20'}`}>
                        {tb.balanced
                            ? <><CheckCircle className="h-6 w-6 text-success flex-shrink-0" /><p className="text-sm font-medium text-success">{t('msg_trial_balanced')}</p></>
                            : <><XCircle className="h-6 w-6 text-danger flex-shrink-0" /><p className="text-sm font-medium text-danger">{t('msg_trial_unbalanced')}</p></>}
                    </div>
                </div>
            )}

            {/* Type filter chips */}
            <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterType('')}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${!filterType ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    {t('lbl_all')}
                </button>
                {Object.keys(typeLabel).map((type) => (
                    <button key={type} onClick={() => setFilterType(type)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${filterType === type ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                        {typeLabel[type]}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {isLoading ? (
                    <div className="py-20 flex justify-center"><Loader /></div>
                ) : rows.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 dark:text-gray-500">{t('msg_no_records')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3 text-left">{t('lbl_account_code')}</th>
                                    <th className="px-5 py-3 text-left">{t('lbl_account_name')}</th>
                                    <th className="px-5 py-3 text-left">{t('lbl_type')}</th>
                                    <th className="px-5 py-3 text-left">{t('lbl_normal_balance')}</th>
                                    <th className="px-5 py-3 text-right text-success">{t('lbl_debit')}</th>
                                    <th className="px-5 py-3 text-right text-danger">{t('lbl_credit')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {rows.map((row: any, i: number) => {
                                    const hasActivity = row.total_debit > 0 || row.total_credit > 0;
                                    return (
                                        <tr key={i} className={`transition-colors ${hasActivity ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : 'opacity-40'}`}>
                                            <td className="px-5 py-3 font-mono text-gray-500 dark:text-gray-400">{row.account_code}</td>
                                            <td className="px-5 py-3 text-gray-800 dark:text-gray-100">{row.name}</td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs font-medium ${typeColors[row.type] ?? 'text-gray-500'}`}>
                                                    {typeLabel[row.type] ?? row.type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs ${row.normal_balance === 'debit' ? 'text-success' : 'text-danger'}`}>
                                                    {row.normal_balance === 'debit' ? t('lbl_debit') : t('lbl_credit')}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right font-medium text-success">
                                                {row.total_debit > 0 ? `৳${Number(row.total_debit).toLocaleString()}` : '—'}
                                            </td>
                                            <td className="px-5 py-3 text-right font-medium text-danger">
                                                {row.total_credit > 0 ? `৳${Number(row.total_credit).toLocaleString()}` : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {/* Footer totals */}
                            {tb && (
                                <tfoot className="bg-gray-100 dark:bg-gray-800 font-semibold text-sm">
                                    <tr>
                                        <td colSpan={4} className="px-5 py-3 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wide">
                                            {t('lbl_total')}
                                        </td>
                                        <td className="px-5 py-3 text-right text-success">৳{Number(tb.total_debit).toLocaleString()}</td>
                                        <td className="px-5 py-3 text-right text-danger">৳{Number(tb.total_credit).toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrialBalancePage;
