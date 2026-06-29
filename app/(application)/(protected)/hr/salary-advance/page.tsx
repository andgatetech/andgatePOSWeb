'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import {
    useApproveSalaryAdvanceMutation,
    useCreateSalaryAdvanceMutation,
    useGetSalaryAdvancesQuery,
    useRejectSalaryAdvanceMutation,
} from '@/store/features/hr/salaryAdvanceApi';
import { useGetStaffMemberQuery } from '@/store/features/store/storeApi';
import { CheckCircle2, HandCoins, Plus, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function SalaryAdvancePage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ user_id: '', amount: '', reason: '' });
    const [statusFilter, setStatusFilter] = useState('');

    const { data, refetch } = useGetSalaryAdvancesQuery(
        { store_id: currentStoreId, status: statusFilter || undefined }, { skip: !currentStoreId }
    );
    const { data: membersData } = useGetStaffMemberQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const [createAdvance] = useCreateSalaryAdvanceMutation();
    const [approveAdvance] = useApproveSalaryAdvanceMutation();
    const [rejectAdvance] = useRejectSalaryAdvanceMutation();

    const advances = data?.data?.advances || [];
    const members = membersData?.data?.data || membersData?.data || [];

    const handleCreate = async () => {
        if (!form.user_id || !form.amount) return showMessage(t('advance_fields_required'), 'error');
        try {
            await createAdvance({ store_id: currentStoreId, user_id: Number(form.user_id), amount: Number(form.amount), reason: form.reason || undefined }).unwrap();
            setForm({ user_id: '', amount: '', reason: '' });
            setShowForm(false);
            refetch();
            showMessage(t('advance_requested'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await approveAdvance({ id, store_id: currentStoreId }).unwrap();
            refetch();
            showMessage(t('advance_approved'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    const handleReject = async (id: number) => {
        try {
            await rejectAdvance({ id, store_id: currentStoreId }).unwrap();
            refetch();
            showMessage(t('advance_rejected'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    return (
        <div className="space-y-5 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                        <HandCoins className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('advance_title')}</h1>
                        <p className="text-sm text-gray-500">{t('advance_desc')}</p>
                    </div>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90">
                    <Plus className="h-3.5 w-3.5" /> {t('advance_new_request')}
                </button>
            </div>

            {showForm && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="grid gap-3 sm:grid-cols-4">
                        <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.user_id} onChange={(e) => setForm((p) => ({ ...p, user_id: e.target.value }))}>
                            <option value="">{t('advance_select_staff')}</option>
                            {members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        <input type="number" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder={t('advance_amount')} />
                        <input type="text" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} placeholder={t('advance_reason')} />
                        <button onClick={handleCreate} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{t('advance_submit')}</button>
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                {['', 'pending', 'approved', 'settled', 'rejected'].map((s) => (
                    <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-full px-3 py-1 text-xs font-semibold ${statusFilter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {s === '' ? t('lbl_all') : s}
                    </button>
                ))}
            </div>

            {advances.length === 0 ? (
                <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
                    <p className="text-sm text-gray-400">{t('advance_no_records')}</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {advances.map((adv: any) => (
                        <div key={adv.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                            <div>
                                <p className="font-semibold text-gray-900">{adv.user?.name} — ৳{adv.amount}</p>
                                <p className="text-xs text-gray-400">{adv.reason || '—'}</p>
                                {adv.status === 'approved' && <p className="text-xs text-amber-600">{t('advance_outstanding')}: ৳{adv.outstanding_balance}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    adv.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                    adv.status === 'settled' ? 'bg-emerald-100 text-emerald-700' :
                                    adv.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                }`}>{adv.status}</span>
                                {adv.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleApprove(adv.id)} className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50" title={t('advance_approve')}>
                                            <CheckCircle2 className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleReject(adv.id)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" title={t('advance_reject')}>
                                            <XCircle className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
