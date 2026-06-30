'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import {
    useApproveLeaveRequestMutation,
    useCreateLeaveRequestMutation,
    useGetLeaveRequestsQuery,
    useGetLeaveTypesQuery,
    useRejectLeaveRequestMutation,
} from '@/store/features/hr/leaveApi';
import { useCreateHolidayMutation, useDeleteHolidayMutation, useGetHolidaysQuery } from '@/store/features/hr/holidayApi';
import { useGetStaffMemberQuery } from '@/store/features/store/storeApi';
import { CalendarOff, CheckCircle2, Plane, Plus, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';

const formatLeaveDate = (value: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' });
};

type Tab = 'requests' | 'holidays';

export default function LeavePage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [tab, setTab] = useState<Tab>('requests');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ user_id: '', leave_type_id: '', start_date: '', end_date: '', reason: '' });
    const [holidayForm, setHolidayForm] = useState({ name: '', date: '' });
    const [statusFilter, setStatusFilter] = useState('');

    const { data: typesData } = useGetLeaveTypesQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const { data: requestsData, refetch: refetchRequests } = useGetLeaveRequestsQuery(
        { store_id: currentStoreId, status: statusFilter || undefined }, { skip: !currentStoreId }
    );
    const { data: membersData } = useGetStaffMemberQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const { data: holidaysData, refetch: refetchHolidays } = useGetHolidaysQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const [createRequest] = useCreateLeaveRequestMutation();
    const [approveRequest] = useApproveLeaveRequestMutation();
    const [rejectRequest] = useRejectLeaveRequestMutation();
    const [createHoliday] = useCreateHolidayMutation();
    const [deleteHoliday] = useDeleteHolidayMutation();

    const types = typesData?.data?.leave_types || [];
    const requests = requestsData?.data?.requests || [];
    const members = membersData?.data?.data || membersData?.data || [];
    const holidays = holidaysData?.data?.holidays || [];

    const handleCreateRequest = async () => {
        if (!form.user_id || !form.leave_type_id || !form.start_date || !form.end_date) return showMessage(t('leave_fields_required'), 'error');
        try {
            await createRequest({
                store_id: currentStoreId,
                user_id: Number(form.user_id),
                leave_type_id: Number(form.leave_type_id),
                start_date: form.start_date,
                end_date: form.end_date,
                reason: form.reason || undefined,
            }).unwrap();
            setForm({ user_id: '', leave_type_id: '', start_date: '', end_date: '', reason: '' });
            setShowForm(false);
            refetchRequests();
            showMessage(t('leave_requested'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    const handleApprove = async (id: number) => {
        try {
            const res = await approveRequest({ id, store_id: currentStoreId }).unwrap();
            refetchRequests();
            if (res?.data?.exceeds_quota) showMessage(t('leave_exceeds_quota_warning'), 'warning');
            else showMessage(t('leave_approved'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    const handleReject = async (id: number) => {
        try {
            await rejectRequest({ id, store_id: currentStoreId }).unwrap();
            refetchRequests();
            showMessage(t('leave_rejected'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    const handleAddHoliday = async () => {
        if (!holidayForm.name || !holidayForm.date) return showMessage(t('holiday_fields_required'), 'error');
        try {
            await createHoliday({ store_id: currentStoreId, ...holidayForm }).unwrap();
            setHolidayForm({ name: '', date: '' });
            refetchHolidays();
            showMessage(t('holiday_added'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    const handleDeleteHoliday = async (id: number) => {
        try {
            await deleteHoliday({ id, store_id: currentStoreId }).unwrap();
            refetchHolidays();
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    return (
        <div className="space-y-5 p-4 sm:p-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                    <Plane className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('leave_title')}</h1>
                    <p className="text-sm text-gray-500">{t('leave_desc')}</p>
                </div>
            </div>

            <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                {([
                    { key: 'requests' as Tab, label: t('leave_requests_tab'), icon: <Plane className="h-4 w-4" /> },
                    { key: 'holidays' as Tab, label: t('leave_holidays_tab'), icon: <CalendarOff className="h-4 w-4" /> },
                ]).map((tb) => (
                    <button
                        key={tb.key}
                        onClick={() => setTab(tb.key)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                            tab === tb.key ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tb.icon} <span>{tb.label}</span>
                    </button>
                ))}
            </div>

            {tab === 'requests' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {['', 'pending', 'approved', 'rejected'].map((s) => (
                                <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-full px-3 py-1 text-xs font-semibold ${statusFilter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                                    {s === '' ? t('lbl_all') : s}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90">
                            <Plus className="h-3.5 w-3.5" /> {t('leave_new_request')}
                        </button>
                    </div>

                    {showForm && (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <div className="grid gap-3 sm:grid-cols-5">
                                <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.user_id} onChange={(e) => setForm((p) => ({ ...p, user_id: e.target.value }))}>
                                    <option value="">{t('advance_select_staff')}</option>
                                    {members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                                <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.leave_type_id} onChange={(e) => setForm((p) => ({ ...p, leave_type_id: e.target.value }))}>
                                    <option value="">{t('leave_select_type')}</option>
                                    {types.map((tp: any) => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
                                </select>
                                <input type="date" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} />
                                <input type="date" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} />
                                <button onClick={handleCreateRequest} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{t('leave_submit')}</button>
                            </div>
                            <input type="text" className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} placeholder={t('leave_reason_placeholder')} />
                        </div>
                    )}

                    {requests.length === 0 ? (
                        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
                            <p className="text-sm text-gray-400">{t('leave_no_records')}</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {requests.map((req: any) => (
                                <div key={req.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                                    <div>
                                        <p className="font-semibold text-gray-900">{req.user?.name} — {req.leaveType?.name}</p>
                                        <p className="text-xs text-gray-400">{formatLeaveDate(req.start_date)} → {formatLeaveDate(req.end_date)} ({req.days} {t('leave_days')})</p>
                                        {req.reason && <p className="text-xs text-gray-400">{req.reason}</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                            req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                            req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                        }`}>{req.status}</span>
                                        {req.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleApprove(req.id)} className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50" title={t('advance_approve')}>
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleReject(req.id)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" title={t('advance_reject')}>
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
            )}

            {tab === 'holidays' && (
                <div className="space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <input type="text" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={holidayForm.name} onChange={(e) => setHolidayForm((p) => ({ ...p, name: e.target.value }))} placeholder={t('holiday_name_placeholder')} />
                            <input type="date" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={holidayForm.date} onChange={(e) => setHolidayForm((p) => ({ ...p, date: e.target.value }))} />
                            <button onClick={handleAddHoliday} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{t('holiday_add')}</button>
                        </div>
                    </div>

                    {holidays.length === 0 ? (
                        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
                            <p className="text-sm text-gray-400">{t('holiday_no_records')}</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {holidays.map((h: any) => (
                                <div key={h.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                                    <div>
                                        <p className="font-semibold text-gray-900">{h.name}</p>
                                        <p className="text-xs text-gray-400">{formatLeaveDate(h.date)}</p>
                                    </div>
                                    <button onClick={() => handleDeleteHoliday(h.id)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
