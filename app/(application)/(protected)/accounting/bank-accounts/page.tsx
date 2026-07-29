'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetBankAccountsQuery, useCreateBankAccountMutation, useUpdateBankAccountMutation, useArchiveBankAccountMutation, useSafeDeleteBankAccountMutation } from '@/store/features/bank/bankApi';
import { Archive, Building2, Pencil, Plus, Trash2 } from 'lucide-react';

const ACCOUNT_TYPES = [
    { value: 'current', label: 'Current' },
    { value: 'savings', label: 'Savings' },
    { value: 'fd', label: 'Fixed Deposit' },
    { value: 'others', label: 'Others' },
];

const emptyForm = {
    bank_name: '',
    branch_name: '',
    account_name: '',
    account_number: '',
    account_type: 'current',
    currency: 'BDT',
    opening_balance: '',
    notes: '',
    is_active: true,
};

export default function BankAccountsPage() {
    const { t } = getTranslation();
    const router = useRouter();
    const { formatCurrency } = useCurrency();
    const { currentStoreId } = useCurrentStore();
    const [showArchived, setShowArchived] = useState(false);
    const { data, isLoading, refetch } = useGetBankAccountsQuery({ store_id: currentStoreId, ...(showArchived ? { include_archived: true } : {}) }, { skip: !currentStoreId });
    const [createAccount, { isLoading: creating }] = useCreateBankAccountMutation();
    const [updateAccount, { isLoading: updating }] = useUpdateBankAccountMutation();
    const [archiveAccount] = useArchiveBankAccountMutation();
    const [safeDeleteAccount] = useSafeDeleteBankAccountMutation();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);

    const accounts = data?.data?.accounts || [];

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (account: any) => {
        setEditingId(account.id);
        setForm({
            bank_name: account.bank_name || '',
            branch_name: account.branch_name || '',
            account_name: account.account_name || '',
            account_number: account.account_number || '',
            account_type: account.account_type || 'current',
            currency: account.currency || 'BDT',
            opening_balance: String(account.opening_balance || ''),
            notes: account.notes || '',
            is_active: account.is_active ?? true,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentStoreId) return;
        try {
            const payload = {
                store_id: currentStoreId,
                ...form,
                opening_balance: form.opening_balance ? parseFloat(form.opening_balance) : 0,
            };
            if (editingId) {
                await updateAccount({ id: editingId, ...payload }).unwrap();
            } else {
                await createAccount(payload).unwrap();
            }
            setModalOpen(false);
            refetch();
        } catch (e) {
            // handled by RTK
        }
    };

    const handleArchive = async (id: number) => {
        if (!confirm(t('bank_account_archive_reason'))) return;
        try {
            await archiveAccount({ id, store_id: currentStoreId }).unwrap();
            refetch();
        } catch (e) {
            // handled by RTK
        }
    };

    const handleSafeDelete = async (id: number) => {
        if (!confirm(t('bank_account_safe_delete_reason'))) return;
        try {
            await safeDeleteAccount({ id, store_id: currentStoreId }).unwrap();
            refetch();
        } catch (e) {
            // Referenced accounts are intentionally rejected by the backend.
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('lbl_bank_accounts')}</h1>
                    <p className="text-sm text-gray-500">{t('lbl_bank_accounts_desc')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowArchived(!showArchived)} className="btn btn-outline-secondary text-sm">
                        {showArchived ? t('bank_account_hide_archived') : t('bank_account_show_archived')}
                    </button>
                    <button onClick={openCreate} className="btn btn-primary inline-flex items-center gap-2">
                        <Plus className="h-4 w-4" /> {t('lbl_add_bank_account')}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <p className="text-sm text-gray-500">{t('lbl_loading')}</p>
            ) : accounts.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                    <Building2 className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-3 text-sm text-gray-500">{t('msg_no_bank_accounts')}</p>
                    <button onClick={openCreate} className="btn btn-outline-primary mt-4">
                        {t('lbl_add_bank_account')}
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {accounts.map((account: any) => (
                        <div
                            key={account.id}
                            onClick={() => router.push(`/accounting/bank-accounts/${account.id}`)}
                            className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-lg font-bold text-gray-900">{account.bank_name}</p>
                                    <p className="text-sm text-gray-500">{account.account_name}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEdit(account);
                                        }}
                                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleArchive(account.id); }}
                                        className="rounded p-1.5 text-orange-600 hover:bg-orange-50"
                                        title={t('bank_account_archive_action')}
                                    >
                                        <Archive className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleSafeDelete(account.id); }}
                                        className="rounded p-1.5 text-danger hover:bg-red-50"
                                        title={t('bank_account_safe_delete_action')}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-gray-500">{t('lbl_account_number')}</p>
                                    <p className="font-semibold text-gray-900">{account.account_number}</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-gray-500">{t('lbl_account_type')}</p>
                                    <p className="font-semibold capitalize text-gray-900">{account.account_type}</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-gray-500">{t('lbl_current_balance')}</p>
                                    <p className="font-bold text-gray-900">{formatCurrency(account.current_balance)}</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-gray-500">{t('lbl_opening_balance')}</p>
                                    <p className="font-semibold text-gray-900">{formatCurrency(account.opening_balance)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-gray-900">{editingId ? t('lbl_edit_bank_account') : t('lbl_add_bank_account')}</h3>
                        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_bank_name')}</label>
                                <input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} required className="form-input w-full" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_branch_name')}</label>
                                <input value={form.branch_name} onChange={(e) => setForm({ ...form, branch_name: e.target.value })} className="form-input w-full" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_account_name')}</label>
                                <input value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} required className="form-input w-full" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_account_number')}</label>
                                <input value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} required className="form-input w-full" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_account_type')}</label>
                                <select value={form.account_type} onChange={(e) => setForm({ ...form, account_type: e.target.value })} className="form-select w-full">
                                    {ACCOUNT_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_opening_balance')}</label>
                                <input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={form.opening_balance}
                                    onChange={(e) => setForm({ ...form, opening_balance: e.target.value })}
                                    className="form-input w-full"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_notes')}</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="form-textarea w-full" />
                            </div>
                            <div className="flex items-center gap-2 sm:col-span-2">
                                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="form-checkbox" />
                                <label className="text-sm">{t('lbl_active')}</label>
                            </div>
                            <div className="flex justify-end gap-2 sm:col-span-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline-secondary">
                                    {t('lbl_cancel')}
                                </button>
                                <button type="submit" disabled={creating || updating} className="btn btn-primary">
                                    {editingId ? t('lbl_update') : t('lbl_add')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
