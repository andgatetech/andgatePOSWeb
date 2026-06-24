'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import { useCreateServiceJobMutation, useGetBusinessOsQuery, useUpdateServiceJobMutation } from '@/store/features/businessOs/businessOsApi';
import { Wrench } from 'lucide-react';
import { useState } from 'react';

const copy = {
    en: { title: 'Service / Warranty / Repair', desc: 'Track repair and warranty job cards.', customer: 'Customer', item: 'Item / device', problem: 'Problem', date: 'Due date', add: 'Add job', jobs: 'Service jobs', required: 'Customer and item are required.', saved: 'Saved.', empty: 'No service jobs yet.', received: 'Received', working: 'Working', ready: 'Ready', delivered: 'Delivered' },
    bn: { title: 'সার্ভিস / ওয়ারেন্টি / রিপেয়ার', desc: 'রিপেয়ার ও ওয়ারেন্টি জব কার্ড ট্র্যাক করুন।', customer: 'গ্রাহক', item: 'পণ্য / ডিভাইস', problem: 'সমস্যা', date: 'ডেলিভারি তারিখ', add: 'জব যোগ', jobs: 'সার্ভিস জব', required: 'গ্রাহক ও পণ্য দিতে হবে।', saved: 'সেভ হয়েছে।', empty: 'এখনো কোনো সার্ভিস জব নেই।', received: 'রিসিভ হয়েছে', working: 'কাজ চলছে', ready: 'রেডি', delivered: 'ডেলিভারি হয়েছে' },
};

export default function ServiceJobsPage() {
    const { i18n } = getTranslation();
    const t = copy[i18n.language === 'en' ? 'en' : 'bn'];
    const { currentStoreId } = useCurrentStore();
    const { data } = useGetBusinessOsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const [createJob] = useCreateServiceJobMutation();
    const [updateJob] = useUpdateServiceJobMutation();
    const [form, setForm] = useState({ customer: '', item: '', problem: '', dueDate: new Date().toISOString().slice(0, 10) });
    const jobs = data?.data?.repairs || [];
    const labels: Record<string, string> = { received: t.received, working: t.working, ready: t.ready, delivered: t.delivered };
    const add = async () => {
        if (!form.customer.trim() || !form.item.trim()) return showMessage(t.required, 'error');
        await createJob({ store_id: currentStoreId, customer_name: form.customer.trim(), item_name: form.item.trim(), problem: form.problem.trim() || undefined, due_date: form.dueDate, status: 'received' }).unwrap();
        setForm({ customer: '', item: '', problem: '', dueDate: new Date().toISOString().slice(0, 10) });
        showMessage(t.saved, 'success');
    };
    return (
        <div className="space-y-5">
            <div><h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Wrench className="h-5 w-5 text-primary" /> {t.title}</h1><p className="text-sm text-gray-500">{t.desc}</p></div>
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"><div className="grid gap-3 sm:grid-cols-2"><input className="form-input" value={form.customer} onChange={(e) => setForm((p) => ({ ...p, customer: e.target.value }))} placeholder={t.customer} /><input className="form-input" value={form.item} onChange={(e) => setForm((p) => ({ ...p, item: e.target.value }))} placeholder={t.item} /><input className="form-input" value={form.problem} onChange={(e) => setForm((p) => ({ ...p, problem: e.target.value }))} placeholder={t.problem} /><input className="form-input" type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} /></div><button onClick={add} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{t.add}</button></div>
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"><h2 className="font-bold text-gray-900">{t.jobs}</h2>{jobs.length === 0 && <p className="mt-3 text-sm text-gray-500">{t.empty}</p>}<div className="mt-3 space-y-2">{jobs.map((job: any) => <div key={job.id} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-gray-900">{job.customer_name} · {job.item_name}</p><p className="text-xs text-gray-500">{job.problem || '-'} · {job.due_date || ''}</p></div><select value={job.status} onChange={(e) => updateJob({ id: job.id, store_id: currentStoreId, status: e.target.value })} className="rounded border border-gray-200 px-2 py-1 text-xs"><option value="received">{labels.received}</option><option value="working">{labels.working}</option><option value="ready">{labels.ready}</option><option value="delivered">{labels.delivered}</option></select></div>)}</div></div>
        </div>
    );
}
