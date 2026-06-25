'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import { useCreateStaffAttendanceMutation, useGetAttendanceListQuery, useGetAttendanceSummaryQuery, useGetAttendanceTodayQuery } from '@/store/features/businessOs/businessOsApi';
import { useGetStaffMemberQuery } from '@/store/features/store/storeApi';
import { ArrowRightLeft, CalendarCheck, Clock, Download, Filter, LogIn, LogOut, Search, UserCheck, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

type Tab = 'record' | 'log' | 'summary';

export default function HrAttendancePage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [tab, setTab] = useState<Tab>('record');
    const [staffSearch, setStaffSearch] = useState('');
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [note, setNote] = useState('');
    const [logFilterName, setLogFilterName] = useState('');
    const [logFilterType, setLogFilterType] = useState('');
    const [summaryDate, setSummaryDate] = useState(new Date().toISOString().split('T')[0]);

    const { data: todayData, refetch: refetchToday } = useGetAttendanceTodayQuery(
        { store_id: currentStoreId }, { skip: !currentStoreId }
    );
    const { data: logData, refetch: refetchLog } = useGetAttendanceListQuery(
        { store_id: currentStoreId, staff_name: logFilterName || undefined, type: logFilterType || undefined, per_page: 50 },
        { skip: !currentStoreId }
    );
    const { data: summaryData } = useGetAttendanceSummaryQuery(
        { store_id: currentStoreId, date: summaryDate },
        { skip: !currentStoreId }
    );
    const { data: membersData } = useGetStaffMemberQuery(
        { store_id: currentStoreId }, { skip: !currentStoreId }
    );
    const [createAttendance] = useCreateStaffAttendanceMutation();

    const today = todayData?.data || {};
    const logItems = logData?.data?.items || [];
    const summary = summaryData?.data?.summary || [];

    const members = membersData?.data?.data || membersData?.data || [];
    const filteredMembers = staffSearch.trim()
        ? members.filter((m: any) => m.name?.toLowerCase().includes(staffSearch.toLowerCase()))
        : members.slice(0, 5);

    const handleRecord = async (type: 'in' | 'out') => {
        if (!selectedStaff) return showMessage(t('attendance_select_staff'), 'error');
        const payload: any = { store_id: currentStoreId, type, note: note.trim() || undefined };
        payload.staff_id = selectedStaff.id;
        try {
            await createAttendance(payload).unwrap();
            setNote('');
            refetchToday();
            refetchLog();
            showMessage(t('attendance_saved'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    const summaryCards = [
        { icon: Clock, value: today.total || 0, label: t('attendance_today_total') },
        { icon: LogIn, value: today.check_ins || 0, label: t('attendance_today_in') },
        { icon: LogOut, value: today.check_outs || 0, label: t('attendance_today_out') },
        { icon: Users, value: today.unique_staff || 0, label: t('attendance_today_staff') },
    ];

    return (
        <div className="space-y-5 p-4 sm:p-6">
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
                {summaryCards.map((card) => (
                    <div key={card.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
                        <card.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                        <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                        <p className="text-xs text-gray-500">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Tab bar */}
            <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                {([
                    { key: 'record' as Tab, label: t('attendance_record_new'), icon: <ArrowRightLeft className="h-4 w-4" /> },
                    { key: 'log' as Tab, label: t('attendance_recent_log'), icon: <Filter className="h-4 w-4" /> },
                    { key: 'summary' as Tab, label: t('attendance_summary'), icon: <Download className="h-4 w-4" /> },
                ]).map((tb) => (
                    <button
                        key={tb.key}
                        onClick={() => setTab(tb.key)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                            tab === tb.key ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tb.icon} <span className="hidden sm:inline">{tb.label}</span>
                    </button>
                ))}
            </div>

            {/* Record Tab */}
            {tab === 'record' && (
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="space-y-3">
                        <div className="relative">
                            {selectedStaff ? (
                                <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-semibold text-gray-900">{selectedStaff.name}</span>
                                        {selectedStaff.phone && <span className="text-xs text-gray-400">{selectedStaff.phone}</span>}
                                    </div>
                                    <button type="button" onClick={() => { setSelectedStaff(null); setStaffSearch(''); }} className="text-gray-400 hover:text-red-500">✕</button>
                                </div>
                            ) : (
                                <>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input type="text" value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)} placeholder={t('attendance_search_staff')} className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2.5 text-sm focus:border-primary" />
                                    </div>
                                    {staffSearch.trim() && filteredMembers.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                                            {filteredMembers.map((m: any) => (
                                                <button key={m.id} type="button" onClick={() => { setSelectedStaff(m); setStaffSearch(''); }} className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50">
                                                    <span className="font-medium text-gray-900">{m.name}</span>
                                                    {m.phone && <span className="text-xs text-gray-400">{m.phone}</span>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('attendance_note_placeholder')} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary" />
                        <div className="flex gap-2">
                            <button onClick={() => handleRecord('in')} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"><LogIn className="h-4 w-4" /> {t('attendance_check_in')}</button>
                            <button onClick={() => handleRecord('out')} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"><LogOut className="h-4 w-4" /> {t('attendance_check_out')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Tab */}
            {tab === 'log' && (
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                        <input type="text" value={logFilterName} onChange={(e) => setLogFilterName(e.target.value)} placeholder={t('attendance_filter_staff')} className="w-44 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-primary" />
                        <select value={logFilterType} onChange={(e) => setLogFilterType(e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-primary">
                            <option value="">{t('lbl_all')}</option>
                            <option value="in">{t('attendance_label_in')}</option>
                            <option value="out">{t('attendance_label_out')}</option>
                        </select>
                    </div>
                    {logItems.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">{t('attendance_no_records')}</div>
                    ) : (
                        <div className="space-y-1.5 max-h-[32rem] overflow-y-auto">
                            {logItems.map((item: any) => (
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
            )}

            {/* Summary Tab */}
            {tab === 'summary' && (
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-600">{t('lbl_date')}:</label>
                        <input type="date" value={summaryDate} onChange={(e) => setSummaryDate(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-primary" />
                    </div>
                    {summary.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">{t('attendance_no_records')}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase">
                                        <th className="px-4 py-2">{t('lbl_staff')}</th>
                                        <th className="px-4 py-2">{t('attendance_label_in')}</th>
                                        <th className="px-4 py-2">{t('attendance_label_out')}</th>
                                        <th className="px-4 py-2">{t('attendance_hours')}</th>
                                        <th className="px-4 py-2">{t('lbl_status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {summary.map((row: any) => (
                                        <tr key={row.staff_name} className="hover:bg-gray-50">
                                            <td className="px-4 py-2.5 font-medium text-gray-900">{row.staff_name}</td>
                                            <td className="px-4 py-2.5 text-emerald-600">{row.check_in || '—'}</td>
                                            <td className="px-4 py-2.5 text-gray-600">{row.check_out || '—'}</td>
                                            <td className="px-4 py-2.5 font-medium text-gray-900">{row.hours_worked ? `${row.hours_worked}h` : '—'}</td>
                                            <td className="px-4 py-2.5">
                                                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                    row.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    row.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {row.status === 'completed' ? t('attendance_status_completed') :
                                                     row.status === 'active' ? t('attendance_status_active') : t('attendance_status_absent')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
