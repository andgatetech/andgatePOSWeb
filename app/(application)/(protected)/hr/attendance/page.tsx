'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import { useCreateStaffAttendanceMutation, useGetBusinessOsQuery } from '@/store/features/businessOs/businessOsApi';
import { useGetStaffMemberQuery } from '@/store/features/store/storeApi';
import { CalendarCheck, Clock, LogIn, LogOut, Search, UserCheck, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function HrAttendancePage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [staffSearch, setStaffSearch] = useState('');
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [note, setNote] = useState('');
    const [filterStaff, setFilterStaff] = useState('');
    const [filterType, setFilterType] = useState('');

    const { data, refetch } = useGetBusinessOsQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    );
    const { data: membersData } = useGetStaffMemberQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    );
    const [createAttendance] = useCreateStaffAttendanceMutation();

    const shifts = (data?.data?.shifts || []).reverse();
    const members = membersData?.data?.data || membersData?.data || [];

    const filteredShifts = shifts.filter((s: any) => {
        if (filterStaff && !s.staff_name?.toLowerCase().includes(filterStaff.toLowerCase())) return false;
        if (filterType && s.type !== filterType) return false;
        return true;
    });

    const todayShifts = shifts.filter((s: any) => {
        const d = new Date(s.recorded_at || s.created_at);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    });

    const todaySummary = {
        total: todayShifts.length,
        in: todayShifts.filter((s: any) => s.type === 'in').length,
        out: todayShifts.filter((s: any) => s.type === 'out').length,
        unique: new Set(todayShifts.map((s: any) => s.staff_name)).size,
    };

    const filteredMembers = staffSearch.trim()
        ? members.filter((m: any) => m.name?.toLowerCase().includes(staffSearch.toLowerCase()))
        : members.slice(0, 5);

    const handleRecordAttendance = async (type: 'in' | 'out') => {
        const payload: any = { store_id: currentStoreId, type, note: note.trim() || undefined };
        if (selectedStaff) {
            payload.staff_id = selectedStaff.id;
        } else {
            return showMessage(t('attendance_select_staff'), 'error');
        }
        try {
            await createAttendance(payload).unwrap();
            setNote('');
            refetch();
            showMessage(t('attendance_saved'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                    <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('hr_attendance_title')}</h1>
                    <p className="text-sm text-gray-500">{t('feature_attendance_desc')}</p>
                </div>
            </div>

            {/* Today Summary */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { icon: Clock, value: todaySummary.total, label: t('attendance_today_total') },
                    { icon: LogIn, value: todaySummary.in, label: t('attendance_today_in') },
                    { icon: LogOut, value: todaySummary.out, label: t('attendance_today_out') },
                    { icon: Users, value: todaySummary.unique, label: t('attendance_today_staff') },
                ].map((card) => (
                    <div key={card.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm text-center">
                        <card.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                        <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                        <p className="text-xs text-gray-500">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Record Attendance */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">{t('attendance_record_new')}</h3>
                <div className="space-y-3">
                    {/* Staff Selector */}
                    <div className="relative">
                        {selectedStaff ? (
                            <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-semibold text-gray-900">{selectedStaff.name}</span>
                                    {selectedStaff.phone && <span className="text-xs text-gray-400">{selectedStaff.phone}</span>}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setSelectedStaff(null); setStaffSearch(''); }}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={staffSearch}
                                        onChange={(e) => setStaffSearch(e.target.value)}
                                        placeholder={t('attendance_search_staff')}
                                        className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                {staffSearch.trim() && filteredMembers.length > 0 && (
                                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                                        {filteredMembers.map((m: any) => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => { setSelectedStaff(m); setStaffSearch(''); }}
                                                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                                            >
                                                <span className="font-medium text-gray-900">{m.name}</span>
                                                {m.phone && <span className="text-xs text-gray-400">{m.phone}</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={t('attendance_note_placeholder')}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleRecordAttendance('in')}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                            <LogIn className="h-4 w-4" /> {t('attendance_check_in')}
                        </button>
                        <button
                            onClick={() => handleRecordAttendance('out')}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                        >
                            <LogOut className="h-4 w-4" /> {t('attendance_check_out')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Attendance Log */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">{t('attendance_recent_log')}</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={filterStaff}
                            onChange={(e) => setFilterStaff(e.target.value)}
                            placeholder={t('attendance_filter_staff')}
                            className="w-40 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-primary"
                        />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-primary"
                        >
                            <option value="">{t('lbl_all')}</option>
                            <option value="in">{t('attendance_label_in')}</option>
                            <option value="out">{t('attendance_label_out')}</option>
                        </select>
                    </div>
                </div>

                {filteredShifts.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-400">{t('attendance_no_records')}</div>
                ) : (
                    <div className="space-y-1.5 max-h-96 overflow-y-auto">
                        {filteredShifts.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-50 px-4 py-3 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <span className={`flex h-2 w-2 rounded-full ${item.type === 'in' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{item.staff_name}</p>
                                        {item.note && <p className="text-xs text-gray-400">{item.note}</p>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${item.type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {item.type === 'in' ? t('attendance_label_in') : t('attendance_label_out')}
                                    </span>
                                    <p className="mt-0.5 text-xs text-gray-400">
                                        {new Date(item.recorded_at || item.created_at).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
