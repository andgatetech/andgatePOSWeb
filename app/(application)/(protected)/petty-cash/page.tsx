'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import { useCreatePettyCashRequestMutation, useGetBusinessOsQuery, useUpdatePettyCashRequestMutation } from '@/store/features/businessOs/businessOsApi';
import { Banknote, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

const copy = {
    en: { title: 'Petty Cash', desc: 'Staff requests small cash. Owner or manager approves.', request: 'Request title', amount: 'Amount', by: 'Requested by', add: 'Add request', pending: 'Pending requests', history: 'Petty cash history', approve: 'Approve', reject: 'Reject', saved: 'Saved.', required: 'Title and amount are required.', empty: 'No petty cash records yet.' },
    bn: { title: 'পেটি ক্যাশ', desc: 'স্টাফ ছোট ক্যাশ রিকোয়েস্ট করবে। মালিক বা ম্যানেজার অনুমোদন করবে।', request: 'রিকোয়েস্টের নাম', amount: 'পরিমাণ', by: 'রিকোয়েস্ট করেছে', add: 'রিকোয়েস্ট যোগ', pending: 'পেন্ডিং রিকোয়েস্ট', history: 'পেটি ক্যাশ ইতিহাস', approve: 'অনুমোদন', reject: 'রিজেক্ট', saved: 'সেভ হয়েছে।', required: 'নাম ও পরিমাণ দিতে হবে।', empty: 'এখনো কোনো পেটি ক্যাশ রেকর্ড নেই।' },
};

export default function PettyCashPage() {
    const { i18n } = getTranslation();
    const t = copy[i18n.language === 'en' ? 'en' : 'bn'];
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const { data } = useGetBusinessOsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const [createRequest] = useCreatePettyCashRequestMutation();
    const [updateRequest] = useUpdatePettyCashRequestMutation();
    const [form, setForm] = useState({ title: '', amount: '', requestedBy: '' });
    const requests = data?.data?.petty_cash || [];

    const add = async () => {
        if (!form.title.trim() || !form.amount) return showMessage(t.required, 'error');
        await createRequest({ store_id: currentStoreId, title: form.title.trim(), amount: Number(form.amount), requested_by: form.requestedBy.trim() || undefined }).unwrap();
        setForm({ title: '', amount: '', requestedBy: '' });
        showMessage(t.saved, 'success');
    };

    return (
        <div className="space-y-5">
            <div><h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Banknote className="h-5 w-5 text-primary" /> {t.title}</h1><p className="text-sm text-gray-500">{t.desc}</p></div>
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-3">
                    <input className="form-input" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder={t.request} />
                    <input className="form-input" type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder={t.amount} />
                    <input className="form-input" value={form.requestedBy} onChange={(e) => setForm((p) => ({ ...p, requestedBy: e.target.value }))} placeholder={t.by} />
                </div>
                <button onClick={add} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{t.add}</button>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <h2 className="font-bold text-gray-900">{t.history}</h2>
                {requests.length === 0 && <p className="mt-3 text-sm text-gray-500">{t.empty}</p>}
                <div className="mt-3 space-y-2">
                    {requests.map((item: any) => (
                        <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <div><p className="font-semibold text-gray-900">{item.title} · {formatCurrency(item.amount)}</p><p className="text-xs text-gray-500">{item.requested_by || '-'} · {item.status}</p></div>
                            {item.status === 'pending' && <div className="flex gap-2"><button onClick={() => updateRequest({ id: item.id, store_id: currentStoreId, status: 'approved' })} className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 className="h-4 w-4" />{t.approve}</button><button onClick={() => updateRequest({ id: item.id, store_id: currentStoreId, status: 'rejected' })} className="inline-flex items-center gap-1 text-red-600"><XCircle className="h-4 w-4" />{t.reject}</button></div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
