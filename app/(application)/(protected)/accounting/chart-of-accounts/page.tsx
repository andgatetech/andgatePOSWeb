'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import {
    useCreateAccountMutation,
    useGetAccountsQuery,
    useSeedDefaultAccountsMutation,
    useUpdateAccountMutation,
} from '@/store/features/accounting/accountingApi';
import { Edit2, Plus, RefreshCw, Shield } from 'lucide-react';
import { useState } from 'react';

const ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'revenue', 'cogs', 'expense'] as const;

const typeColors: Record<string, string> = {
    asset:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    liability: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    equity:    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    revenue:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    cogs:      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    expense:   'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

const emptyForm = {
    account_code: '',
    name: '',
    name_bn: '',
    type: 'asset' as string,
    subtype: '',
    normal_balance: 'debit' as string,
    description: '',
};

const ChartOfAccountsPage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();

    const [filterType, setFilterType] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);

    const { data, isLoading, refetch } = useGetAccountsQuery(
        { store_id: currentStoreId, type: filterType || undefined },
        { skip: !currentStoreId }
    );

    const [createAccount, { isLoading: creating }] = useCreateAccountMutation();
    const [updateAccount, { isLoading: updating }] = useUpdateAccountMutation();
    const [seedDefaults, { isLoading: seeding }] = useSeedDefaultAccountsMutation();

    const accounts: any[] = data?.data ?? [];
    const grouped = ACCOUNT_TYPES.reduce<Record<string, any[]>>((acc, type) => {
        acc[type] = accounts.filter((a) => a.type === type);
        return acc;
    }, {} as Record<string, any[]>);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (a: any) => {
        if (a.is_system) return;
        setEditingId(a.id);
        setForm({
            account_code: a.account_code,
            name: a.name,
            name_bn: a.name_bn ?? '',
            type: a.type,
            subtype: a.subtype ?? '',
            normal_balance: a.normal_balance,
            description: a.description ?? '',
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateAccount({ id: editingId, name: form.name, name_bn: form.name_bn, subtype: form.subtype, description: form.description }).unwrap();
            } else {
                await createAccount({ ...form, store_id: currentStoreId }).unwrap();
            }
            showSuccessDialog(editingId ? t('msg_account_updated') : t('msg_account_created'));
            setShowForm(false);
        } catch {
            showErrorDialog(t('msg_error_generic'));
        }
    };

    const handleSeedDefaults = async () => {
        const confirmed = await showConfirmDialog(t('msg_seed_defaults_confirm'), t('lbl_seed_defaults'));
        if (!confirmed) return;
        try {
            await seedDefaults({ store_id: currentStoreId }).unwrap();
            showSuccessDialog(t('msg_seeded'));
            refetch();
        } catch {
            showErrorDialog(t('msg_error_generic'));
        }
    };

    const visibleTypes = filterType ? [filterType] : ACCOUNT_TYPES;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('lbl_chart_of_accounts')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('msg_chart_of_accounts_desc')}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={handleSeedDefaults} disabled={seeding}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <RefreshCw className={`h-4 w-4 ${seeding ? 'animate-spin' : ''}`} />
                        {t('lbl_seed_defaults')}
                    </button>
                    <button onClick={openCreate}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm bg-primary text-white hover:opacity-90">
                        <Plus className="h-4 w-4" />
                        {t('lbl_add_account')}
                    </button>
                </div>
            </div>

            {/* Type filter */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilterType('')}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${!filterType ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    {t('lbl_all')}
                </button>
                {ACCOUNT_TYPES.map((type) => (
                    <button key={type} onClick={() => setFilterType(type)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${filterType === type ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                        {t(`lbl_type_${type}`)}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <Loader fullScreen={false} className="py-20" />
            ) : (
                <div className="space-y-4">
                    {visibleTypes.map((type) => {
                        const rows = grouped[type] ?? [];
                        if (!rows.length) return null;
                        return (
                            <div key={type} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-widest ${typeColors[type]}`}>
                                    {t(`lbl_type_${type}`)} ({rows.length})
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-400 uppercase">
                                            <tr>
                                                <th className="px-4 py-2.5 text-left">{t('lbl_code')}</th>
                                                <th className="px-4 py-2.5 text-left">{t('lbl_account_name')}</th>
                                                <th className="px-4 py-2.5 text-left">{t('lbl_subtype')}</th>
                                                <th className="px-4 py-2.5 text-left">{t('lbl_normal_balance')}</th>
                                                <th className="px-4 py-2.5 text-center">{t('lbl_system')}</th>
                                                <th className="px-4 py-2.5 text-center">{t('lbl_actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {rows.map((a: any) => (
                                                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-300">{a.account_code}</td>
                                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                                                        {a.name}
                                                        {a.name_bn && <span className="ml-2 text-xs text-gray-400">{a.name_bn}</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{a.subtype ?? '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-xs font-medium ${a.normal_balance === 'debit' ? 'text-success' : 'text-danger'}`}>
                                                            {a.normal_balance === 'debit' ? t('lbl_debit') : t('lbl_credit')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {a.is_system && <Shield className="h-3.5 w-3.5 text-gray-400 mx-auto" />}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {!a.is_system && (
                                                            <button onClick={() => openEdit(a)}
                                                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {editingId ? t('lbl_edit_account') : t('lbl_add_account')}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {!editingId && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_account_code')} *</label>
                                        <input required value={form.account_code} onChange={(e) => setForm({ ...form, account_code: e.target.value })}
                                            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_type')} *</label>
                                        <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                                            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900">
                                            {ACCOUNT_TYPES.map((t2) => <option key={t2} value={t2}>{t2}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_account_name')} *</label>
                                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_name_bn')}</label>
                                <input value={form.name_bn} onChange={(e) => setForm({ ...form, name_bn: e.target.value })}
                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_subtype')}</label>
                                    <input value={form.subtype} onChange={(e) => setForm({ ...form, subtype: e.target.value })}
                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                                </div>
                                {!editingId && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_normal_balance')} *</label>
                                        <select required value={form.normal_balance} onChange={(e) => setForm({ ...form, normal_balance: e.target.value })}
                                            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900">
                                            <option value="debit">{t('lbl_debit')}</option>
                                            <option value="credit">{t('lbl_credit')}</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_description')}</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={2} className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    {t('lbl_cancel')}
                                </button>
                                <button type="submit" disabled={creating || updating}
                                    className="flex-1 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-60">
                                    {creating || updating ? t('lbl_saving') : t('lbl_save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartOfAccountsPage;
