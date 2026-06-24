'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import { useCreateCashClosingMutation, useGetBusinessOsQuery, useUpdateCashClosingMutation } from '@/store/features/businessOs/businessOsApi';
import { CheckCircle2, Receipt, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

const copy = {
    en: { title: 'Cash & Counter Closing', desc: 'Cashier submits counted cash. Owner/manager approves.', opening: 'Opening cash', sales: 'Cash sales', expense: 'Cash expense', collection: 'Due collection', supplier: 'Supplier payment', actual: 'Actual counted cash', expected: 'Expected cash', difference: 'Difference', note: 'Note', submit: 'Submit closing', recent: 'Recent closings', approve: 'Approve', reject: 'Reject', saved: 'Saved.', required: 'Actual cash is required.', noRecords: 'No closing records yet.' },
    bn: { title: 'ক্যাশ ও কাউন্টার ক্লোজিং', desc: 'ক্যাশিয়ার গোনা ক্যাশ সাবমিট করবে। মালিক/ম্যানেজার অনুমোদন করবে।', opening: 'শুরুর ক্যাশ', sales: 'ক্যাশ বিক্রি', expense: 'ক্যাশ খরচ', collection: 'বাকি আদায়', supplier: 'সাপ্লায়ার পেমেন্ট', actual: 'গোনা ক্যাশ', expected: 'হিসাবের ক্যাশ', difference: 'পার্থক্য', note: 'নোট', submit: 'ক্লোজিং সাবমিট', recent: 'সাম্প্রতিক ক্লোজিং', approve: 'অনুমোদন', reject: 'রিজেক্ট', saved: 'সেভ হয়েছে।', required: 'গোনা ক্যাশ দিতে হবে।', noRecords: 'এখনো কোনো ক্লোজিং নেই।' },
};

export default function CashClosingPage() {
    const { i18n } = getTranslation();
    const t = copy[i18n.language === 'en' ? 'en' : 'bn'];
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const { data } = useGetBusinessOsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const [createClosing] = useCreateCashClosingMutation();
    const [updateClosing] = useUpdateCashClosingMutation();
    const [form, setForm] = useState({ openingCash: '', cashSales: '', cashExpense: '', dueCollection: '', supplierPayment: '', actualCash: '', note: '' });
    const closings = data?.data?.closings || [];
    const expected = useMemo(() => Number(form.openingCash || 0) + Number(form.cashSales || 0) + Number(form.dueCollection || 0) - Number(form.cashExpense || 0) - Number(form.supplierPayment || 0), [form]);
    const difference = Number(form.actualCash || 0) - expected;

    const submit = async () => {
        if (!form.actualCash) return showMessage(t.required, 'error');
        await createClosing({ store_id: currentStoreId, opening_cash: Number(form.openingCash || 0), cash_sales: Number(form.cashSales || 0), cash_expense: Number(form.cashExpense || 0), due_collection: Number(form.dueCollection || 0), supplier_payment: Number(form.supplierPayment || 0), actual_cash: Number(form.actualCash || 0), note: form.note || undefined }).unwrap();
        setForm({ openingCash: '', cashSales: '', cashExpense: '', dueCollection: '', supplierPayment: '', actualCash: '', note: '' });
        showMessage(t.saved, 'success');
    };

    return (
        <div className="space-y-5">
            <div><h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Receipt className="h-5 w-5 text-primary" /> {t.title}</h1><p className="text-sm text-gray-500">{t.desc}</p></div>
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(['openingCash', 'cashSales', 'cashExpense', 'dueCollection', 'supplierPayment', 'actualCash'] as const).map((key) => (
                        <input key={key} type="number" className="form-input" value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={{ openingCash: t.opening, cashSales: t.sales, cashExpense: t.expense, dueCollection: t.collection, supplierPayment: t.supplier, actualCash: t.actual }[key]} />
                    ))}
                </div>
                <textarea className="form-textarea mt-3" rows={2} value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} placeholder={t.note} />
                <div className="mt-3 grid gap-2 rounded-lg bg-gray-50 p-3 text-sm sm:grid-cols-2"><span>{t.expected}: <b>{formatCurrency(expected)}</b></span><span className={difference < 0 ? 'text-red-600' : difference > 0 ? 'text-green-600' : ''}>{t.difference}: <b>{formatCurrency(difference)}</b></span></div>
                <button onClick={submit} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{t.submit}</button>
            </div>
            <RecordList title={t.recent} empty={t.noRecords} items={closings.map((item: any) => ({ id: item.id, primary: `${item.created_at || ''} · ${formatCurrency(item.actual_cash || 0)}`, secondary: `${t.difference}: ${formatCurrency(item.difference || 0)} · ${item.status}`, status: item.status }))} onApprove={(id) => updateClosing({ id, store_id: currentStoreId, status: 'approved' })} onReject={(id) => updateClosing({ id, store_id: currentStoreId, status: 'rejected' })} approve={t.approve} reject={t.reject} />
        </div>
    );
}

const RecordList = ({ title, empty, items, onApprove, onReject, approve, reject }: any) => (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"><h2 className="font-bold text-gray-900">{title}</h2>{items.length === 0 && <p className="mt-3 text-sm text-gray-500">{empty}</p>}<div className="mt-3 space-y-2">{items.map((item: any) => <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-gray-900">{item.primary}</p><p className="text-xs text-gray-500">{item.secondary}</p></div>{item.status === 'submitted' && <div className="flex gap-2"><button onClick={() => onApprove(item.id)} className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 className="h-4 w-4" />{approve}</button><button onClick={() => onReject(item.id)} className="inline-flex items-center gap-1 text-red-600"><XCircle className="h-4 w-4" />{reject}</button></div>}</div>)}</div></div>
);
