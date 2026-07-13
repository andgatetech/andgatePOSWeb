'use client';

import { useState } from 'react';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetStoreMfsAccountsQuery, useCreateStoreMfsAccountMutation, useUpdateStoreMfsAccountMutation, useDeleteStoreMfsAccountMutation } from '@/store/features/storeMfsAccount/storeMfsAccountApi';
import { Pencil, Smartphone, Star, Trash2 } from 'lucide-react';

const PROVIDERS = [
    { value: 'bkash', label: 'bKash', color: 'bg-pink-600' },
    { value: 'nagad', label: 'Nagad', color: 'bg-amber-500' },
    { value: 'rocket', label: 'Rocket', color: 'bg-purple-600' },
    { value: 'upay', label: 'Upay', color: 'bg-blue-600' },
];

interface MfsAccount {
    id?: number;
    provider: string;
    account_number: string;
    account_type: 'personal' | 'merchant';
    account_name: string;
    is_default: boolean;
    is_active: boolean;
    sort_order: number;
}

const emptyForm: MfsAccount = {
    provider: 'bkash',
    account_number: '',
    account_type: 'personal',
    account_name: '',
    is_default: false,
    is_active: true,
    sort_order: 0,
};

export default function MfsAccountsTab() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { data, isLoading, refetch } = useGetStoreMfsAccountsQuery(String(currentStoreId), { skip: !currentStoreId });
    const [createAccount, { isLoading: creating }] = useCreateStoreMfsAccountMutation();
    const [updateAccount, { isLoading: updating }] = useUpdateStoreMfsAccountMutation();
    const [deleteAccount] = useDeleteStoreMfsAccountMutation();

    const [form, setForm] = useState<MfsAccount>(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);

    const accounts = data?.data?.accounts || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentStoreId || !form.account_number) return;

        try {
            if (editingId) {
                await updateAccount({ storeId: currentStoreId, accountId: editingId, ...form }).unwrap();
            } else {
                await createAccount({ storeId: currentStoreId, ...form }).unwrap();
            }
            setForm(emptyForm);
            setEditingId(null);
            refetch();
        } catch (e) {
            // handled by RTK
        }
    };

    const startEdit = (account: MfsAccount) => {
        setForm(account);
        setEditingId(account.id || null);
    };

    const handleDelete = async (id: number) => {
        if (!currentStoreId) return;
        if (!confirm(t('msg_confirm_delete'))) return;
        try {
            await deleteAccount({ storeId: currentStoreId, accountId: id }).unwrap();
            refetch();
        } catch (e) {
            // handled by RTK
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                    <Smartphone className="h-5 w-5 text-primary" />
                    {editingId ? t('lbl_edit_mfs_account') : t('lbl_add_mfs_account')}
                </h3>
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_provider')}</label>
                        <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="form-select w-full">
                            {PROVIDERS.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_account_number')}</label>
                        <input value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} placeholder="01XXXXXXXXX" required className="form-input w-full" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_account_type')}</label>
                        <select value={form.account_type} onChange={(e) => setForm({ ...form, account_type: e.target.value as any })} className="form-select w-full">
                            <option value="personal">{t('lbl_personal')}</option>
                            <option value="merchant">{t('lbl_merchant')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_account_name')}</label>
                        <input value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} placeholder={t('lbl_optional')} className="form-input w-full" />
                    </div>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="form-checkbox" />
                            {t('lbl_default')}
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="form-checkbox" />
                            {t('lbl_active')}
                        </label>
                    </div>
                    <div className="flex items-end justify-end gap-2">
                        {editingId && (
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    setForm(emptyForm);
                                    setEditingId(null);
                                }}
                            >
                                {t('lbl_cancel')}
                            </button>
                        )}
                        <button type="submit" disabled={creating || updating} className="btn btn-primary">
                            {editingId ? t('lbl_update') : t('lbl_add')}
                        </button>
                    </div>
                </form>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-gray-900">{t('lbl_mfs_accounts')}</h3>
                {isLoading ? (
                    <p className="text-sm text-gray-500">{t('lbl_loading')}</p>
                ) : accounts.length === 0 ? (
                    <p className="text-sm text-gray-500">{t('msg_no_mfs_accounts')}</p>
                ) : (
                    <div className="space-y-2">
                        {accounts.map((account: MfsAccount) => {
                            const provider = PROVIDERS.find((p) => p.value === account.provider);
                            return (
                                <div key={account.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${provider?.color || 'bg-gray-500'}`}>
                                            {provider?.label?.[0] || account.provider[0]?.toUpperCase()}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {provider?.label || account.provider}
                                                {account.is_default && <Star className="ml-1 inline h-3 w-3 text-amber-500" />}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {account.account_number} · {account.account_type}
                                                {account.account_name ? ` · ${account.account_name}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="rounded p-2 text-gray-600 hover:bg-gray-200" onClick={() => startEdit(account)}>
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button className="rounded p-2 text-danger hover:bg-red-100" onClick={() => handleDelete(account.id!)}>
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
