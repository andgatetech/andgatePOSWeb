'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import { useCreateStaffAttendanceMutation, useGetBusinessOsQuery } from '@/store/features/businessOs/businessOsApi';
import { CalendarCheck } from 'lucide-react';
import { useState } from 'react';

const copy = {
    en: { title: 'HR Attendance', desc: 'Staff check-in and check-out records.', staff: 'Staff name', note: 'Note', in: 'Check in', out: 'Check out', recent: 'Recent attendance', saved: 'Saved.', required: 'Staff name is required.', empty: 'No attendance records yet.', labelIn: 'In', labelOut: 'Out' },
    bn: { title: 'HR হাজিরা', desc: 'স্টাফের চেক ইন ও চেক আউট রেকর্ড।', staff: 'স্টাফের নাম', note: 'নোট', in: 'চেক ইন', out: 'চেক আউট', recent: 'সাম্প্রতিক হাজিরা', saved: 'সেভ হয়েছে।', required: 'স্টাফের নাম দিতে হবে।', empty: 'এখনো কোনো হাজিরা রেকর্ড নেই।', labelIn: 'ইন', labelOut: 'আউট' },
};

export default function HrAttendancePage() {
    const { i18n } = getTranslation();
    const t = copy[i18n.language === 'en' ? 'en' : 'bn'];
    const { currentStoreId } = useCurrentStore();
    const { data } = useGetBusinessOsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const [createAttendance] = useCreateStaffAttendanceMutation();
    const [form, setForm] = useState({ staff: '', note: '' });
    const shifts = data?.data?.shifts || [];
    const add = async (type: 'in' | 'out') => {
        if (!form.staff.trim()) return showMessage(t.required, 'error');
        await createAttendance({ store_id: currentStoreId, staff_name: form.staff.trim(), type, note: form.note.trim() || undefined }).unwrap();
        setForm({ staff: '', note: '' });
        showMessage(t.saved, 'success');
    };
    return (
        <div className="space-y-5">
            <div><h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><CalendarCheck className="h-5 w-5 text-primary" /> {t.title}</h1><p className="text-sm text-gray-500">{t.desc}</p></div>
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-2"><input className="form-input" value={form.staff} onChange={(e) => setForm((p) => ({ ...p, staff: e.target.value }))} placeholder={t.staff} /><input className="form-input" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} placeholder={t.note} /></div>
                <div className="mt-3 flex gap-2"><button onClick={() => add('in')} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white">{t.in}</button><button onClick={() => add('out')} className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white">{t.out}</button></div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"><h2 className="font-bold text-gray-900">{t.recent}</h2>{shifts.length === 0 && <p className="mt-3 text-sm text-gray-500">{t.empty}</p>}<div className="mt-3 space-y-2">{shifts.map((item: any) => <div key={item.id} className="rounded-lg border border-gray-100 p-3 text-sm"><p className="font-semibold text-gray-900">{item.staff_name} · {item.type === 'in' ? t.labelIn : t.labelOut}</p><p className="text-xs text-gray-500">{item.recorded_at || item.created_at || ''}</p></div>)}</div></div>
        </div>
    );
}
