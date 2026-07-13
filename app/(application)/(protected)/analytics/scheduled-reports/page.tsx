'use client';

import { useState } from 'react';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import {
    useCreateScheduledReportMutation,
    useDeleteScheduledReportMutation,
    useGetCustomReportsQuery,
    useGetScheduledReportsQuery,
    useRunScheduledReportNowMutation,
    useUpdateScheduledReportMutation,
} from '@/store/features/analytics/analyticsApi';
import { CalendarClock, Mail, Pencil, Play, Plus, Trash2 } from 'lucide-react';

const FREQUENCIES = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
];

const WEEKDAYS = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
];

const emptyForm = {
    custom_report_id: '',
    name: '',
    frequency: 'daily',
    day_of_week: 1,
    day_of_month: 1,
    time: '08:00',
    recipients: [''],
    format: 'html',
    is_active: true,
};

export default function ScheduledReportsPage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { data, isLoading, refetch } = useGetScheduledReportsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const { data: reportsData } = useGetCustomReportsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const [createItem] = useCreateScheduledReportMutation();
    const [updateItem] = useUpdateScheduledReportMutation();
    const [deleteItem] = useDeleteScheduledReportMutation();
    const [runNow] = useRunScheduledReportNowMutation();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<any>(emptyForm);

    const items = data?.data?.scheduled_reports || [];
    const customReports = reportsData?.data?.reports || [];

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (item: any) => {
        setEditingId(item.id);
        setForm({
            custom_report_id: item.custom_report_id || '',
            name: item.name,
            frequency: item.frequency,
            day_of_week: item.day_of_week ?? 1,
            day_of_month: item.day_of_month ?? 1,
            time: item.time ? item.time.slice(0, 5) : '08:00',
            recipients: item.recipients?.length ? item.recipients : [''],
            format: item.format,
            is_active: item.is_active,
        });
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('msg_confirm_delete'))) return;
        await deleteItem(id).unwrap();
        refetch();
    };

    const updateRecipient = (index: number, value: string) => {
        const list = [...form.recipients];
        list[index] = value;
        setForm({ ...form, recipients: list });
    };

    const addRecipient = () => setForm({ ...form, recipients: [...form.recipients, ''] });
    const removeRecipient = (index: number) => {
        const list = form.recipients.filter((_: string, i: number) => i !== index);
        setForm({ ...form, recipients: list });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentStoreId) return;
        const payload = {
            store_id: currentStoreId,
            custom_report_id: form.custom_report_id ? Number(form.custom_report_id) : null,
            name: form.name,
            frequency: form.frequency,
            day_of_week: form.frequency === 'weekly' ? Number(form.day_of_week) : null,
            day_of_month: form.frequency === 'monthly' ? Number(form.day_of_month) : null,
            time: form.time,
            recipients: form.recipients.filter((r: string) => r.trim()),
            format: form.format,
            is_active: form.is_active,
        };
        if (editingId) {
            await updateItem({ id: editingId, ...payload }).unwrap();
        } else {
            await createItem(payload).unwrap();
        }
        setModalOpen(false);
        refetch();
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('lbl_scheduled_reports')}</h1>
                    <p className="text-sm text-gray-500">{t('lbl_scheduled_reports_desc')}</p>
                </div>
                <button onClick={openCreate} className="btn btn-primary inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" /> {t('lbl_add_scheduled_report')}
                </button>
            </div>

            {isLoading ? (
                <p className="text-sm text-gray-500">{t('lbl_loading')}</p>
            ) : items.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                    <CalendarClock className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-3 text-sm text-gray-500">{t('msg_no_scheduled_reports')}</p>
                    <button onClick={openCreate} className="btn btn-outline-primary mt-4">
                        {t('lbl_add_scheduled_report')}
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((item: any) => (
                        <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-bold text-gray-900">{item.name}</p>
                                    <p className="text-xs capitalize text-gray-500">
                                        {item.frequency} · {item.time}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(item)} className="rounded p-1.5 text-gray-500 hover:bg-gray-100">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => runNow(item.id).then(() => alert(t('msg_queued')))} className="rounded p-1.5 text-success hover:bg-green-50">
                                        <Play className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="rounded p-1.5 text-danger hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1 text-sm text-gray-600">
                                <p>
                                    {t('lbl_report')}: {item.custom_report?.name || '-'}
                                </p>
                                <p className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> {(item.recipients || []).join(', ')}
                                </p>
                                <p>
                                    {t('lbl_format')}: {item.format}
                                </p>
                                <p>
                                    {t('lbl_next_run')}: {item.next_run_at ? new Date(item.next_run_at).toLocaleString() : '-'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-gray-900">{editingId ? t('lbl_edit_scheduled_report') : t('lbl_add_scheduled_report')}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_name')}</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="form-input w-full" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_custom_report')}</label>
                                <select value={form.custom_report_id} onChange={(e) => setForm({ ...form, custom_report_id: e.target.value })} className="form-select w-full">
                                    <option value="">{t('lbl_select_report')}</option>
                                    {customReports.map((r: any) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_frequency')}</label>
                                    <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="form-select w-full">
                                        {FREQUENCIES.map((f) => (
                                            <option key={f.value} value={f.value}>
                                                {f.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_time')}</label>
                                    <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required className="form-input w-full" />
                                </div>
                            </div>
                            {form.frequency === 'weekly' && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_day_of_week')}</label>
                                    <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })} className="form-select w-full">
                                        {WEEKDAYS.map((d) => (
                                            <option key={d.value} value={d.value}>
                                                {d.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {form.frequency === 'monthly' && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_day_of_month')}</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={31}
                                        value={form.day_of_month}
                                        onChange={(e) => setForm({ ...form, day_of_month: Number(e.target.value) })}
                                        className="form-input w-full"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_recipients')}</label>
                                <div className="space-y-2">
                                    {form.recipients.map((email: string, idx: number) => (
                                        <div key={idx} className="flex gap-2">
                                            <input type="email" value={email} onChange={(e) => updateRecipient(idx, e.target.value)} className="form-input flex-1" />
                                            {form.recipients.length > 1 && (
                                                <button type="button" onClick={() => removeRecipient(idx)} className="btn btn-outline-danger text-sm">
                                                    {t('lbl_remove')}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={addRecipient} className="btn btn-outline-secondary mt-2 text-sm">
                                    {t('lbl_add_recipient')}
                                </button>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_format')}</label>
                                <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} className="form-select w-full">
                                    <option value="html">HTML Email</option>
                                    <option value="csv">CSV Attachment</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="form-checkbox" />
                                <label className="text-sm">{t('lbl_active')}</label>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline-secondary">
                                    {t('lbl_cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? t('lbl_update') : t('lbl_save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
