'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import {
    useCreateIncomeMutation,
    useDeleteIncomeMutation,
    useGetIncomeQuery,
} from '@/store/features/accounting/accountingApi';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const paymentMethods = ['cash', 'bank', 'bkash', 'nagad', 'rocket'];

const emptyForm = {
    description: '',
    amount: '',
    payment_method: 'cash',
    income_date: new Date().toISOString().split('T')[0],
    notes: '',
};

const IncomePage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();

    const today = new Date().toISOString().split('T')[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [from, setFrom] = useState(firstOfMonth);
    const [to, setTo] = useState(today);
    const [page, setPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const { data, isLoading } = useGetIncomeQuery(
        { store_id: currentStoreId, from, to, page, per_page: 15 },
        { skip: !currentStoreId }
    );

    const [createIncome, { isLoading: creating }] = useCreateIncomeMutation();
    const [deleteIncome] = useDeleteIncomeMutation();

    const items: any[] = data?.data?.data ?? [];
    const lastPage = data?.data?.last_page ?? 1;
    const total = data?.data?.total ?? 0;
    const totalAmount = items.reduce((sum, e) => sum + (e.amount ?? 0), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.description || !form.amount || !form.income_date) return;
        try {
            await createIncome({
                store_id: currentStoreId,
                description: form.description,
                amount: parseFloat(form.amount),
                payment_method: form.payment_method,
                income_date: form.income_date,
                notes: form.notes,
            }).unwrap();
            showSuccessDialog(t('msg_income_created'));
            setForm(emptyForm);
            setShowForm(false);
        } catch {
            showErrorDialog(t('msg_error_generic'));
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirmDialog(t('msg_delete_confirm'), t('lbl_delete'));
        if (!confirmed) return;
        try {
            await deleteIncome(id).unwrap();
            showSuccessDialog(t('msg_deleted'));
        } catch {
            showErrorDialog(t('msg_error_generic'));
        }
    };

    const pmLabel: Record<string, string> = {
        cash: t('lbl_cash'),
        bank: t('lbl_bank'),
        bkash: 'bKash',
        nagad: 'Nagad',
        rocket: 'Rocket',
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('lbl_income_manager')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('msg_income_manager_desc')}</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90">
                    <Plus className="h-4 w-4" />
                    {t('lbl_add_income')}
                </button>
            </div>

            {/* Summary + Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('lbl_period_total')}</p>
                    <p className="text-2xl font-bold text-success mt-1">৳{totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{total} {t('lbl_entries')}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-3 flex-wrap">
                    <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-transparent text-gray-800 dark:text-gray-100" />
                    <span className="text-gray-400">—</span>
                    <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-transparent text-gray-800 dark:text-gray-100" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {isLoading ? (
                    <div className="py-20 flex justify-center"><Loader /></div>
                ) : items.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 dark:text-gray-500">{t('msg_no_records')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-left">{t('lbl_date')}</th>
                                    <th className="px-4 py-3 text-left">{t('lbl_description')}</th>
                                    <th className="px-4 py-3 text-left">{t('lbl_payment_method')}</th>
                                    <th className="px-4 py-3 text-left">{t('lbl_recorded_by')}</th>
                                    <th className="px-4 py-3 text-right">{t('lbl_amount')}</th>
                                    <th className="px-4 py-3 text-center">{t('lbl_actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {items.map((entry: any) => (
                                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{entry.income_date}</td>
                                        <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                                            <p>{entry.description}</p>
                                            {entry.notes && <p className="text-xs text-gray-400 mt-0.5">{entry.notes}</p>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                                                {pmLabel[entry.payment_method] ?? entry.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{entry.user_name}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-success">৳{Number(entry.amount).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => handleDelete(entry.id)}
                                                className="p-1.5 rounded-lg hover:bg-danger/10 text-danger">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="flex justify-center gap-2">
                    <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                        className="px-4 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">
                        {t('lbl_prev')}
                    </button>
                    <span className="self-center text-sm text-gray-500">{page} / {lastPage}</span>
                    <button disabled={page === lastPage} onClick={() => setPage((p) => p + 1)}
                        className="px-4 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">
                        {t('lbl_next')}
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('lbl_add_income')}</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_description')} *</label>
                                <input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder={t('ph_income_description')}
                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_amount')} *</label>
                                    <input required type="number" min="0.01" step="0.01" value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_date')} *</label>
                                    <input required type="date" value={form.income_date}
                                        onChange={(e) => setForm({ ...form, income_date: e.target.value })}
                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_payment_method')}</label>
                                <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900">
                                    {paymentMethods.map((pm) => <option key={pm} value={pm}>{pmLabel[pm] ?? pm}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_notes')}</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    rows={2} className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    {t('lbl_cancel')}
                                </button>
                                <button type="submit" disabled={creating}
                                    className="flex-1 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-60">
                                    {creating ? t('lbl_saving') : t('lbl_save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncomePage;
