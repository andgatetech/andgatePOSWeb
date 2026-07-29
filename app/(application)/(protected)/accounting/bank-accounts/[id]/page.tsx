'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { canManageBankTransactionVoid, canVoidBankTransaction } from '@/lib/bankTransactionVoidReversal';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { RootState } from '@/store';
import {
    useGetBankAccountByIdQuery,
    useGetBankAccountsQuery,
    useGetBankTransactionsQuery,
    useCreateBankTransactionMutation,
    useUpdateBankTransactionMutation,
    useReconcileBankTransactionMutation,
    useVoidAndReverseBankTransactionMutation,
} from '@/store/features/bank/bankApi';
import { ArrowLeft, CheckCircle2, Pencil, Plus, RotateCcw } from 'lucide-react';
import { useSelector } from 'react-redux';

const TRANSACTION_TYPES = [
    { value: 'deposit', label: 'Deposit', sign: 1 },
    { value: 'withdrawal', label: 'Withdrawal', sign: -1 },
    { value: 'transfer_out', label: 'Transfer Out', sign: -1 },
    { value: 'adjustment', label: 'Adjustment', sign: 1 },
];

const STATUS_BADGES: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    cleared: 'bg-blue-100 text-blue-700',
    reconciled: 'bg-green-100 text-green-700',
    voided: 'bg-orange-100 text-orange-700',
};

const emptyForm = {
    transaction_date: new Date().toISOString().slice(0, 10),
    type: 'deposit',
    amount: '',
    reference_no: '',
    description: '',
    related_bank_account_id: '',
    status: 'pending',
    remarks: '',
};

export default function BankAccountDetailPage() {
    const { t } = getTranslation();
    const router = useRouter();
    const { id } = useParams();
    const { formatCurrency } = useCurrency();
    const { currentStoreId } = useCurrentStore();
    const user = useSelector((state: RootState) => state.auth.user);
    const canManageVoid = canManageBankTransactionVoid(user);
    const accountId = Number(id);

    const { data: accountData } = useGetBankAccountByIdQuery(accountId, { skip: !accountId });
    const { data: accountsData } = useGetBankAccountsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const { data: txData, isLoading: txLoading, refetch: refetchTx } = useGetBankTransactionsQuery({ store_id: currentStoreId, bank_account_id: accountId }, { skip: !currentStoreId || !accountId });

    const [createTx, { isLoading: creating }] = useCreateBankTransactionMutation();
    const [updateTx, { isLoading: updating }] = useUpdateBankTransactionMutation();
    const [reconcileTx, { isLoading: reconciling }] = useReconcileBankTransactionMutation();
    const [voidAndReverseTx, { isLoading: voiding }] = useVoidAndReverseBankTransactionMutation();

    const [modalOpen, setModalOpen] = useState(false);
    const [reconcileModal, setReconcileModal] = useState<any>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);

    const account = accountData?.data?.account;
    const accounts = (accountsData?.data?.accounts || []).filter((a: any) => a.id !== accountId);
    const transactions = txData?.data?.transactions || [];
    const summary = txData?.data?.summary || {};

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (tx: any) => {
        setEditingId(tx.id);
        setForm({
            transaction_date: tx.transaction_date,
            type: tx.type,
            amount: String(tx.amount),
            reference_no: tx.reference_no || '',
            description: tx.description || '',
            related_bank_account_id: tx.related_bank_account?.id || '',
            status: tx.status,
            remarks: tx.remarks || '',
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentStoreId) return;
        try {
            const payload = {
                store_id: currentStoreId,
                bank_account_id: accountId,
                transaction_date: form.transaction_date,
                type: form.type,
                amount: parseFloat(form.amount),
                reference_no: form.reference_no || undefined,
                description: form.description || undefined,
                status: form.status,
                remarks: form.remarks || undefined,
                related_bank_account_id: form.type === 'transfer_out' && form.related_bank_account_id ? Number(form.related_bank_account_id) : undefined,
            };
            if (editingId) {
                await updateTx({ id: editingId, ...payload }).unwrap();
            } else {
                await createTx(payload).unwrap();
            }
            setModalOpen(false);
            refetchTx();
        } catch (e) {
            // handled by RTK
        }
    };

    const handleReconcile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reconcileModal) return;
        try {
            await reconcileTx({
                id: reconcileModal.id,
                reconciled_date: reconcileModal.reconciled_date,
                statement_reference: reconcileModal.statement_reference,
                remarks: reconcileModal.remarks,
            }).unwrap();
            setReconcileModal(null);
            refetchTx();
        } catch (e) {
            // handled by RTK
        }
    };

    const handleVoidAndReverse = async (tx: any) => {
        if (!canManageVoid || !canVoidBankTransaction(tx)) return;
        const reason = window.prompt(t('bank_transaction_void_reason_prompt'))?.trim();
        if (!reason) {
            showErrorDialog(t('msg_error'), t('bank_transaction_void_reason_required'));
            return;
        }
        const confirmed = await showConfirmDialog(
            t('bank_transaction_void_confirm_title'),
            `${t('bank_transaction_void_confirm_effects')} ${t('bank_transaction_void_confirm_audit')}`,
            t('btn_void_and_reverse'),
            t('btn_cancel'),
            false,
        );
        if (!confirmed) return;
        try {
            await voidAndReverseTx({ id: tx.id, reason, storeId: currentStoreId || tx.store_id }).unwrap();
            showSuccessDialog(t('msg_success'), t('bank_transaction_void_success'));
            refetchTx();
        } catch (error: any) {
            showErrorDialog(t('msg_error'), error?.data?.message || t('bank_transaction_void_failed'));
        }
    };

    if (!account) {
        return <p className="text-sm text-gray-500">{t('lbl_loading')}</p>;
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{account.bank_name}</h1>
                        <p className="text-sm text-gray-500">
                            {account.account_name} · {account.account_number}
                        </p>
                    </div>
                </div>
                {account.is_active ? (
                    <button onClick={openCreate} className="btn btn-primary inline-flex items-center gap-2">
                        <Plus className="h-4 w-4" /> {t('lbl_add_transaction')}
                    </button>
                ) : (
                    <span className="rounded bg-orange-100 px-3 py-2 text-sm font-medium text-orange-800">{t('bank_account_archived_read_only')}</span>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-500">{t('lbl_current_balance')}</p>
                    <p className="mt-2 text-2xl font-black text-gray-900">{formatCurrency(account.current_balance)}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-500">{t('lbl_opening_balance')}</p>
                    <p className="mt-2 text-2xl font-black text-gray-900">{formatCurrency(account.opening_balance)}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-500">{t('lbl_total_deposits')}</p>
                    <p className="mt-2 text-2xl font-black text-success">{formatCurrency(summary.total_deposits || 0)}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-500">{t('lbl_total_withdrawals')}</p>
                    <p className="mt-2 text-2xl font-black text-danger">{formatCurrency(summary.total_withdrawals || 0)}</p>
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-4">
                    <h3 className="font-bold text-gray-900">{t('lbl_bank_transactions')}</h3>
                </div>
                {txLoading ? (
                    <p className="p-5 text-sm text-gray-500">{t('lbl_loading')}</p>
                ) : transactions.length === 0 ? (
                    <p className="p-5 text-sm text-gray-500">{t('msg_no_bank_transactions')}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="px-4 py-3">{t('lbl_date')}</th>
                                    <th className="px-4 py-3">{t('lbl_type')}</th>
                                    <th className="px-4 py-3">{t('lbl_reference')}</th>
                                    <th className="px-4 py-3">{t('lbl_description')}</th>
                                    <th className="px-4 py-3 text-right">{t('lbl_amount')}</th>
                                    <th className="px-4 py-3">{t('lbl_status')}</th>
                                    <th className="px-4 py-3 text-right">{t('lbl_action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{tx.transaction_date}</td>
                                        <td className="px-4 py-3 capitalize">{tx.type.replace('_', ' ')}</td>
                                        <td className="px-4 py-3">{tx.reference_no || '-'}</td>
                                        <td className="px-4 py-3">{tx.description || '-'}</td>
                                        <td className={`px-4 py-3 text-right font-semibold ${['deposit', 'transfer_in'].includes(tx.type) ? 'text-success' : 'text-danger'}`}>
                                            {formatCurrency(tx.amount)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGES[tx.status] || 'bg-gray-100'}`}>{tx.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {tx.status !== 'reconciled' && (
                                                    <button
                                                        onClick={() => setReconcileModal({ id: tx.id, reconciled_date: new Date().toISOString().slice(0, 10), statement_reference: '', remarks: '' })}
                                                        className="rounded p-1.5 text-green-600 hover:bg-green-50"
                                                        title={t('lbl_reconcile')}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => openEdit(tx)} className="rounded p-1.5 text-gray-500 hover:bg-gray-100">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                {canManageVoid && canVoidBankTransaction(tx) && (
                                                    <button
                                                        onClick={() => handleVoidAndReverse(tx)}
                                                        disabled={voiding}
                                                        className="rounded p-1.5 text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                                                        title={t('btn_void_and_reverse')}
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-gray-900">{editingId ? t('lbl_edit_transaction') : t('lbl_add_transaction')}</h3>
                        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_date')}</label>
                                <input type="date" value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} required className="form-input w-full" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_type')}</label>
                                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="form-select w-full">
                                    {TRANSACTION_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {form.type === 'transfer_out' && (
                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_to_account')}</label>
                                    <select
                                        value={form.related_bank_account_id}
                                        onChange={(e) => setForm({ ...form, related_bank_account_id: e.target.value })}
                                        required
                                        className="form-select w-full"
                                    >
                                        <option value="">{t('lbl_select_account')}</option>
                                        {accounts.map((a: any) => (
                                            <option key={a.id} value={a.id}>
                                                {a.bank_name} - {a.account_number}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_amount')}</label>
                                <input type="number" min={0.01} step={0.01} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required className="form-input w-full" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_reference_no')}</label>
                                <input value={form.reference_no} onChange={(e) => setForm({ ...form, reference_no: e.target.value })} className="form-input w-full" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_description')}</label>
                                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-input w-full" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_status')}</label>
                                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="form-select w-full">
                                    <option value="pending">{t('lbl_pending')}</option>
                                    <option value="cleared">{t('lbl_cleared')}</option>
                                    <option value="reconciled">{t('lbl_reconciled')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_remarks')}</label>
                                <input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className="form-input w-full" />
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

            {reconcileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-gray-900">{t('lbl_reconcile_transaction')}</h3>
                        <form onSubmit={handleReconcile} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_reconciled_date')}</label>
                                <input
                                    type="date"
                                    value={reconcileModal.reconciled_date}
                                    onChange={(e) => setReconcileModal({ ...reconcileModal, reconciled_date: e.target.value })}
                                    required
                                    className="form-input w-full"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_statement_reference')}</label>
                                <input
                                    value={reconcileModal.statement_reference}
                                    onChange={(e) => setReconcileModal({ ...reconcileModal, statement_reference: e.target.value })}
                                    className="form-input w-full"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_remarks')}</label>
                                <textarea
                                    value={reconcileModal.remarks}
                                    onChange={(e) => setReconcileModal({ ...reconcileModal, remarks: e.target.value })}
                                    rows={2}
                                    className="form-textarea w-full"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setReconcileModal(null)} className="btn btn-outline-secondary">
                                    {t('lbl_cancel')}
                                </button>
                                <button type="submit" disabled={reconciling} className="btn btn-primary">
                                    {t('lbl_reconcile')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
