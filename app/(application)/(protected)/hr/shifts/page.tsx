'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import {
    useAssignShiftMutation,
    useCreateShiftTemplateMutation,
    useDeleteShiftAssignmentMutation,
    useGetShiftRosterQuery,
    useGetShiftTemplatesQuery,
} from '@/store/features/hr/shiftApi';
import { useGetStaffMemberQuery } from '@/store/features/store/storeApi';
import { CalendarRange, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

function startOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}

export default function ShiftsPage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [templateForm, setTemplateForm] = useState({ name: '', start_time: '09:00', end_time: '17:00' });
    const [assignForm, setAssignForm] = useState({ user_id: '', shift_template_id: '', date: '' });
    const [weekStart] = useState(() => startOfWeek(new Date()));

    const weekDates = useMemo(() => Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
    }), [weekStart]);

    const { data: templatesData, refetch: refetchTemplates } = useGetShiftTemplatesQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const { data: rosterData, refetch: refetchRoster } = useGetShiftRosterQuery(
        { store_id: currentStoreId, date_from: weekDates[0], date_to: weekDates[6] },
        { skip: !currentStoreId }
    );
    const { data: membersData } = useGetStaffMemberQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const [createTemplate] = useCreateShiftTemplateMutation();
    const [assignShift] = useAssignShiftMutation();
    const [deleteAssignment] = useDeleteShiftAssignmentMutation();

    const templates = templatesData?.data?.templates || [];
    const roster = rosterData?.data?.shifts || [];
    const members = membersData?.data?.data || membersData?.data || [];

    const handleCreateTemplate = async () => {
        if (!templateForm.name) return showMessage(t('shift_fields_required'), 'error');
        try {
            await createTemplate({ store_id: currentStoreId, ...templateForm }).unwrap();
            setTemplateForm({ name: '', start_time: '09:00', end_time: '17:00' });
            setShowTemplateForm(false);
            refetchTemplates();
            showMessage(t('shift_template_created'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    const handleAssign = async (date: string) => {
        if (!assignForm.user_id || !assignForm.shift_template_id) return showMessage(t('shift_assign_required'), 'error');
        try {
            await assignShift({ store_id: currentStoreId, user_id: Number(assignForm.user_id), shift_template_id: Number(assignForm.shift_template_id), date }).unwrap();
            refetchRoster();
            showMessage(t('shift_assigned'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    const handleRemove = async (id: number) => {
        try {
            await deleteAssignment({ id, store_id: currentStoreId }).unwrap();
            refetchRoster();
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    return (
        <div className="space-y-5 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                        <CalendarRange className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('shift_title')}</h1>
                        <p className="text-sm text-gray-500">{t('shift_desc')}</p>
                    </div>
                </div>
                <button onClick={() => setShowTemplateForm(!showTemplateForm)} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90">
                    <Plus className="h-3.5 w-3.5" /> {t('shift_new_template')}
                </button>
            </div>

            {showTemplateForm && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="grid gap-3 sm:grid-cols-4">
                        <input type="text" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={templateForm.name} onChange={(e) => setTemplateForm((p) => ({ ...p, name: e.target.value }))} placeholder={t('shift_name_placeholder')} />
                        <input type="time" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={templateForm.start_time} onChange={(e) => setTemplateForm((p) => ({ ...p, start_time: e.target.value }))} />
                        <input type="time" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={templateForm.end_time} onChange={(e) => setTemplateForm((p) => ({ ...p, end_time: e.target.value }))} />
                        <button onClick={handleCreateTemplate} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{t('shift_save_template')}</button>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {templates.map((tpl: any) => (
                    <span key={tpl.id} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {tpl.name} ({tpl.start_time}–{tpl.end_time})
                    </span>
                ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={assignForm.user_id} onChange={(e) => setAssignForm((p) => ({ ...p, user_id: e.target.value }))}>
                        <option value="">{t('advance_select_staff')}</option>
                        {members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={assignForm.shift_template_id} onChange={(e) => setAssignForm((p) => ({ ...p, shift_template_id: e.target.value }))}>
                        <option value="">{t('shift_select_template')}</option>
                        {templates.map((tpl: any) => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
                    </select>
                </div>
                <p className="mt-2 text-xs text-gray-400">{t('shift_assign_hint')}</p>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date) => {
                    const dayShifts = roster.filter((s: any) => s.date === date);
                    return (
                        <div key={date} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-xs font-semibold text-gray-500">{new Date(date).toLocaleDateString('en-BD', { weekday: 'short', day: 'numeric' })}</p>
                                <button onClick={() => handleAssign(date)} className="rounded p-0.5 text-primary hover:bg-primary/10">
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <div className="space-y-1">
                                {dayShifts.map((s: any) => (
                                    <div key={s.id} className="flex items-center justify-between gap-1 rounded-lg bg-gray-50 px-2 py-1.5 text-xs">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-gray-800">{s.user?.name}</p>
                                            {s.shiftTemplate && (
                                                <span className="mt-0.5 inline-block rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                                    {s.shiftTemplate.name} · {s.shiftTemplate.start_time}–{s.shiftTemplate.end_time}
                                                </span>
                                            )}
                                        </div>
                                        <button onClick={() => handleRemove(s.id)} className="shrink-0 text-gray-400 hover:text-red-500">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
