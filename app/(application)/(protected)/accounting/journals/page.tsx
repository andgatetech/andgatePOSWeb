'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { useGetJournalsQuery } from '@/store/features/accounting/accountingApi';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const JournalsPage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();

    const today = new Date().toISOString().split('T')[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [from, setFrom] = useState(firstOfMonth);
    const [to, setTo] = useState(today);
    const [refType, setRefType] = useState('');
    const [page, setPage] = useState(1);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const { data, isLoading } = useGetJournalsQuery(
        { store_id: currentStoreId, from, to, reference_type: refType || undefined, page, per_page: 20 },
        { skip: !currentStoreId }
    );

    const journals = data?.data?.data ?? [];
    const lastPage = data?.data?.last_page ?? 1;
    const total = data?.data?.total ?? 0;

    const refTypeLabel: Record<string, string> = {
        sale: t('lbl_sale'),
        sale_return: t('lbl_sale_return'),
        expense: t('lbl_expense'),
        income: t('lbl_income'),
        purchase: t('lbl_purchase'),
        customer_payment: t('lbl_customer_payment'),
        supplier_payment: t('lbl_supplier_payment'),
        manual: t('lbl_manual'),
    };

    const refTypeBadgeColor: Record<string, string> = {
        sale: 'bg-success/10 text-success',
        sale_return: 'bg-warning/10 text-warning',
        expense: 'bg-danger/10 text-danger',
        income: 'bg-primary/10 text-primary',
        purchase: 'bg-purple-100 text-purple-700',
        customer_payment: 'bg-teal-100 text-teal-700',
        supplier_payment: 'bg-orange-100 text-orange-700',
        manual: 'bg-gray-100 text-gray-600',
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('lbl_journal_ledger')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('msg_journal_ledger_desc')}</p>
                </div>
                <span className="text-sm text-gray-400">{t('lbl_total')}: {total}</span>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex flex-wrap gap-3">
                <input
                    type="date"
                    value={from}
                    onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-transparent text-gray-800 dark:text-gray-100"
                />
                <span className="self-center text-gray-400">—</span>
                <input
                    type="date"
                    value={to}
                    onChange={(e) => { setTo(e.target.value); setPage(1); }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-transparent text-gray-800 dark:text-gray-100"
                />
                <select
                    value={refType}
                    onChange={(e) => { setRefType(e.target.value); setPage(1); }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                >
                    <option value="">{t('lbl_all_types')}</option>
                    {Object.keys(refTypeLabel).map((k) => (
                        <option key={k} value={k}>{refTypeLabel[k]}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {isLoading ? (
                    <Loader fullScreen={false} className="py-20" />
                ) : journals.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 dark:text-gray-500">{t('msg_no_records')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-left w-8"></th>
                                    <th className="px-4 py-3 text-left">{t('lbl_date')}</th>
                                    <th className="px-4 py-3 text-left">{t('lbl_description')}</th>
                                    <th className="px-4 py-3 text-left">{t('lbl_type')}</th>
                                    <th className="px-4 py-3 text-right">{t('lbl_debit')}</th>
                                    <th className="px-4 py-3 text-right">{t('lbl_credit')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {journals.map((j: any) => (
                                    <>
                                        <tr
                                            key={j.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                            onClick={() => setExpandedId(expandedId === j.id ? null : j.id)}
                                        >
                                            <td className="px-4 py-3 text-gray-400">
                                                {expandedId === j.id
                                                    ? <ChevronUp className="h-4 w-4" />
                                                    : <ChevronDown className="h-4 w-4" />}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{j.entry_date}</td>
                                            <td className="px-4 py-3 text-gray-800 dark:text-gray-100">{j.description}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${refTypeBadgeColor[j.reference_type] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {refTypeLabel[j.reference_type] ?? j.reference_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-200">৳{Number(j.total_debit).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-200">৳{Number(j.total_credit).toLocaleString()}</td>
                                        </tr>
                                        {expandedId === j.id && (
                                            <tr key={`${j.id}-lines`} className="bg-gray-50 dark:bg-gray-800/40">
                                                <td colSpan={6} className="px-8 py-3">
                                                    <table className="w-full text-xs">
                                                        <thead>
                                                            <tr className="text-gray-400 dark:text-gray-500 uppercase">
                                                                <th className="text-left pb-1">{t('lbl_account')}</th>
                                                                <th className="text-left pb-1">{t('lbl_note')}</th>
                                                                <th className="text-right pb-1 text-success">{t('lbl_debit')}</th>
                                                                <th className="text-right pb-1 text-danger">{t('lbl_credit')}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                            {j.lines.map((line: any, li: number) => (
                                                                <tr key={li}>
                                                                    <td className="py-1 text-gray-700 dark:text-gray-300 font-medium">
                                                                        {line.account_code} — {line.account_name}
                                                                    </td>
                                                                    <td className="py-1 text-gray-500 dark:text-gray-400">{line.description}</td>
                                                                    <td className="py-1 text-right text-success">
                                                                        {line.debit > 0 ? `৳${Number(line.debit).toLocaleString()}` : ''}
                                                                    </td>
                                                                    <td className="py-1 text-right text-danger">
                                                                        {line.credit > 0 ? `৳${Number(line.credit).toLocaleString()}` : ''}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="flex justify-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-4 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        {t('lbl_prev')}
                    </button>
                    <span className="self-center text-sm text-gray-500">{page} / {lastPage}</span>
                    <button
                        disabled={page === lastPage}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-4 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        {t('lbl_next')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default JournalsPage;
