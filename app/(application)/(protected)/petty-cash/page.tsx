'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import { useCreatePettyCashRequestMutation, useGetBusinessOsQuery, useUpdatePettyCashRequestMutation } from '@/store/features/businessOs/businessOsApi';
import { useGetStaffMemberQuery } from '@/store/features/store/storeApi';
import { Banknote, CheckCircle2, Clock, Plus, Search, UserCheck, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

type Tab = 'request' | 'history';

export default function PettyCashPage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const { data, refetch } = useGetBusinessOsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const [createRequest] = useCreatePettyCashRequestMutation();
    const [updateRequest] = useUpdatePettyCashRequestMutation();
    const { data: membersData } = useGetStaffMemberQuery({ store_id: currentStoreId }, { skip: !currentStoreId });

    const [tab, setTab] = useState<Tab>('request');
    const [form, setForm] = useState({ title: '', amount: '', requestedBy: '' });
    const [staffSearch, setStaffSearch] = useState('');
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [filterStatus, setFilterStatus] = useState('');

    const requests = (data?.data?.petty_cash || []).reverse();
    const members = membersData?.data?.data || membersData?.data || [];

    const filteredMembers = staffSearch.trim()
        ? members.filter((m: any) => m.name?.toLowerCase().includes(staffSearch.toLowerCase()))
        : members.slice(0, 5);

    const filteredRequests = filterStatus
        ? requests.filter((r: any) => r.status === filterStatus)
        : requests;

    const stats = useMemo(() => ({
        total: requests.length,
        pending: requests.filter((r: any) => r.status === 'pending').length,
        approved: requests.filter((r: any) => r.status === 'approved').length,
        pendingAmount: requests.filter((r: any) => r.status === 'pending').reduce((s: number, r: any) => s + (parseFloat(r.amount) || 0), 0),
        approvedAmount: requests.filter((r: any) => r.status === 'approved').reduce((s: number, r: any) => s + (parseFloat(r.amount) || 0), 0),
    }), [requests]);

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.amount) return showMessage(t('petty_required'), 'error');
        const payload: any = { store_id: currentStoreId, title: form.title.trim(), amount: Number(form.amount) };
        if (selectedStaff) {
            payload.requested_by = selectedStaff.name;
        } else if (form.requestedBy.trim()) {
            payload.requested_by = form.requestedBy.trim();
        }
        try {
            await createRequest(payload).unwrap();
            setForm({ title: '', amount: '', requestedBy: '' });
            setSelectedStaff(null);
            setStaffSearch('');
            refetch();
            showMessage(t('petty_saved'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    const handleStatus = async (id: number, status: string) => {
        try {
            await updateRequest({ id, store_id: currentStoreId, status }).unwrap();
            refetch();
            showMessage(t('petty_updated'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    return (
        <div className="space-y-5 p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm">
                    <Banknote className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('petty_title')}</h1>
                    <p className="text-sm text-gray-500">{t('petty_desc')}</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { icon: Clock, value: stats.pending, label: t('petty_pending'), color: 'text-amber-600', bg: 'bg-amber-50' },
                    { icon: CheckCircle2, value: stats.approved, label: t('petty_approved'), color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { icon: Banknote, value: formatCurrency(stats.pendingAmount), label: t('petty_pending_amount'), color: 'text-orange-600', bg: 'bg-orange-50' },
                    { icon: Banknote, value: formatCurrency(stats.approvedAmount), label: t('petty_approved_amount'), color: 'text-green-600', bg: 'bg-green-50' },
                ].map((card) => (
                    <div key={card.label} className={`rounded-xl border border-gray-100 p-4 text-center shadow-sm ${card.bg}`}>
                        <card.icon className={`mx-auto mb-1 h-5 w-5 ${card.color}`} />
                        <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
                        <p className="text-xs text-gray-500">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Tab bar */}
            <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                {([
                    { key: 'request' as Tab, label: t('petty_new_request'), icon: <Plus className="h-4 w-4" /> },
                    { key: 'history' as Tab, label: t('petty_history'), icon: <Clock className="h-4 w-4" /> },
                ]).map((tb) => (
                    <button key={tb.key} onClick={() => setTab(tb.key)} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        tab === tb.key ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}>
                        {tb.icon} {tb.label}
                    </button>
                ))}
            </div>

            {/* New Request Tab */}
            {tab === 'request' && (
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="space-y-3">
                        <input className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder={t('petty_title_placeholder')} />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <input className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary" type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder={t('petty_amount')} />
                            <div className="relative">
                                {selectedStaff ? (
                                    <div className="flex h-full items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <UserCheck className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-medium text-gray-900">{selectedStaff.name}</span>
                                        </div>
                                        <button type="button" onClick={() => { setSelectedStaff(null); setStaffSearch(''); }} className="text-gray-400 hover:text-red-500">✕</button>
                                    </div>
                                ) : (
                                    <>
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input type="text" value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)} placeholder={t('petty_requested_by')} className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2.5 text-sm focus:border-primary" />
                                        {staffSearch.trim() && filteredMembers.length > 0 && (
                                            <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-36 overflow-y-auto">
                                                {filteredMembers.map((m: any) => (
                                                    <button key={m.id} type="button" onClick={() => { setSelectedStaff(m); setStaffSearch(''); }} className="flex w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                                                        <span className="font-medium text-gray-900">{m.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <button onClick={handleSubmit} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
                            <Plus className="h-4 w-4" /> {t('petty_add')}
                        </button>
                    </div>
                </div>
            )}

            {/* History Tab */}
            {tab === 'history' && (
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-primary">
                            <option value="">{t('lbl_all')}</option>
                            <option value="pending">{t('petty_pending')}</option>
                            <option value="approved">{t('petty_approved')}</option>
                            <option value="rejected">{t('petty_rejected')}</option>
                        </select>
                    </div>
                    {filteredRequests.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">{t('petty_empty')}</div>
                    ) : (
                        <div className="space-y-2">
                            {filteredRequests.map((item: any) => (
                                <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                            <span className="font-medium text-gray-700">{formatCurrency(item.amount)}</span>
                                            {item.requested_by && <span>· {item.requested_by}</span>}
                                            {item.created_at && <span>· {new Date(item.created_at).toLocaleDateString('en-BD')}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                            item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {item.status === 'approved' ? t('petty_approved') :
                                             item.status === 'rejected' ? t('petty_rejected') : t('petty_pending')}
                                        </span>
                                        {item.status === 'pending' && (
                                            <div className="flex gap-1">
                                                <button onClick={() => handleStatus(item.id, 'approved')} className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100" title={t('petty_approve')}>
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleStatus(item.id, 'rejected')} className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100" title={t('petty_reject')}>
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
