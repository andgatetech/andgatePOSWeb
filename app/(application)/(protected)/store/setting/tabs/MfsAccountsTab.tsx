'use client';

import { useEffect, useMemo, useState } from 'react';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useGetStoreMfsAccountsQuery, useCreateStoreMfsAccountMutation, useUpdateStoreMfsAccountMutation, useDeleteStoreMfsAccountMutation } from '@/store/features/storeMfsAccount/storeMfsAccountApi';
import { CheckCircle2, Pencil, Smartphone, Star, Trash2, XCircle } from 'lucide-react';

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

interface MfsAccountsTabProps {
    paymentMethods?: any[];
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

const providerFromPaymentMethod = (name?: string) => {
    const normalized = String(name || '').toLowerCase();
    if (normalized.includes('bkash')) return 'bkash';
    if (normalized.includes('nagad')) return 'nagad';
    if (normalized.includes('rocket')) return 'rocket';
    if (normalized.includes('upay')) return 'upay';
    return '';
};

export default function MfsAccountsTab({ paymentMethods = [] }: MfsAccountsTabProps) {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const storeId = useMemo(() => {
        const normalized = Number(currentStoreId || 0);
        return Number.isFinite(normalized) && normalized > 0 ? normalized : 0;
    }, [currentStoreId]);
    const { data, isLoading, refetch } = useGetStoreMfsAccountsQuery(storeId, { skip: !storeId });
    const [createAccount, { isLoading: creating }] = useCreateStoreMfsAccountMutation();
    const [updateAccount, { isLoading: updating }] = useUpdateStoreMfsAccountMutation();
    const [deleteAccount] = useDeleteStoreMfsAccountMutation();

    const [form, setForm] = useState<MfsAccount>(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [inlineError, setInlineError] = useState<string>('');

    const [accounts, setAccounts] = useState<MfsAccount[]>([]);

    useEffect(() => {
        const rawAccounts = data?.data?.accounts || data?.accounts || [];
        setAccounts(Array.isArray(rawAccounts) ? rawAccounts : []);
    }, [data]);
    const activeMfsMethods = paymentMethods.filter((method: any) => {
        const isActive = method?.is_active === true || method?.is_active === 1 || method?.is_active === '1';
        return isActive && providerFromPaymentMethod(method?.payment_method_name);
    });
    const mappedProviders = PROVIDERS.map((provider) => {
        const methods = activeMfsMethods.filter((method: any) => providerFromPaymentMethod(method?.payment_method_name) === provider.value);
        const providerAccounts = accounts
            .filter((account: MfsAccount) => account.provider === provider.value && account.is_active)
            .sort((a: MfsAccount, b: MfsAccount) => Number(Boolean(b.is_default)) - Number(Boolean(a.is_default)));
        return {
            provider,
            methods,
            account: providerAccounts[0] || null,
        };
    });

    const errorMessage = (error: any, fallback: string) => {
        const errors = error?.data?.errors?.errors || error?.data?.errors;
        if (errors && typeof errors === 'object') {
            const first = Object.values(errors).flat()[0];
            if (first) return String(first);
        }
        const status = error?.status ? `${error.status}: ` : '';
        return `${status}${error?.data?.message || error?.message || fallback}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setInlineError('');
        if (!storeId) {
            showErrorDialog(t('msg_please_select_store'));
            setInlineError(t('msg_please_select_store'));
            return;
        }
        if (!form.account_number.trim()) {
            showErrorDialog(t('msg_mfs_account_number_required'));
            setInlineError(t('msg_mfs_account_number_required'));
            return;
        }

        try {
            let savedAccount: MfsAccount | null = null;
            if (editingId) {
                const response: any = await updateAccount({ storeId, accountId: editingId, ...form }).unwrap();
                savedAccount = response?.data?.account || response?.account || null;
                showSuccessDialog(t('msg_mfs_account_updated'));
            } else {
                const response: any = await createAccount({ storeId, ...form }).unwrap();
                savedAccount = response?.data?.account || response?.account || null;
                showSuccessDialog(t('msg_mfs_account_created'));
            }
            if (savedAccount) {
                setAccounts((prev) => {
                    const withoutSaved = prev.filter((account) => account.id !== savedAccount?.id);
                    return [...withoutSaved, savedAccount as MfsAccount].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || (a.id || 0) - (b.id || 0));
                });
            }
            setForm(emptyForm);
            setEditingId(null);
            await refetch();
        } catch (e: any) {
            const message = errorMessage(e, editingId ? t('msg_failed_update_mfs_account') : t('msg_failed_create_mfs_account'));
            setInlineError(message);
            showErrorDialog(message);
        }
    };

    const startEdit = (account: MfsAccount) => {
        setForm(account);
        setEditingId(account.id || null);
    };

    const handleDelete = async (id: number) => {
        if (!storeId) return;
        if (!confirm(t('msg_confirm_delete'))) return;
        setInlineError('');
        try {
            await deleteAccount({ storeId, accountId: id }).unwrap();
            showSuccessDialog(t('msg_mfs_account_deleted'));
            await refetch();
        } catch (e: any) {
            const message = errorMessage(e, t('msg_failed_delete_mfs_account'));
            setInlineError(message);
            showErrorDialog(message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <div className="mb-4">
                    <h3 className="text-base font-bold text-blue-900">{t('mfs_mapping_title')}</h3>
                    <p className="mt-1 text-sm text-blue-700">{t('mfs_mapping_desc')}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    {mappedProviders.map(({ provider, methods, account }) => {
                        const methodEnabled = methods.length > 0;
                        const mapped = methodEnabled && account;
                        return (
                            <div key={provider.value} className="flex items-start justify-between gap-3 rounded-lg border border-white bg-white p-3 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${provider.color}`}>
                                        {provider.label[0]}
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{provider.label}</p>
                                        <p className="text-sm text-gray-600">
                                            {methodEnabled ? methods.map((method: any) => method.payment_method_name).join(', ') : t('mfs_payment_method_disabled')}
                                        </p>
                                        {account ? (
                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {account.account_number} · {account.account_type}
                                            </p>
                                        ) : (
                                            <p className="mt-1 text-sm text-amber-700">{t('mfs_account_missing')}</p>
                                        )}
                                    </div>
                                </div>
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${mapped ? 'bg-emerald-50 text-emerald-700' : methodEnabled ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {mapped ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                    {mapped ? t('mfs_mapped') : methodEnabled ? t('mfs_needs_account') : t('mfs_not_used')}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                    <Smartphone className="h-5 w-5 text-primary" />
                    {editingId ? t('lbl_edit_mfs_account') : t('lbl_add_mfs_account')}
                </h3>
                {inlineError && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                        {inlineError}
                    </div>
                )}
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
                        <button type="submit" disabled={creating || updating || !storeId} className="btn btn-primary">
                            {creating || updating ? t('btn_saving') : editingId ? t('lbl_update') : t('lbl_add')}
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
