'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import { useCreateCashClosingMutation, useGetBusinessOsQuery, useGetCashClosingPrefillQuery, useUpdateCashClosingMutation } from '@/store/features/businessOs/businessOsApi';
import { ArrowDownUp, Calculator, CheckCircle2, Clock, Download, Receipt, RefreshCw, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function CashClosingPage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const { data, refetch } = useGetBusinessOsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const { data: prefillData } = useGetCashClosingPrefillQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const [createClosing] = useCreateCashClosingMutation();
    const [updateClosing] = useUpdateCashClosingMutation();

    const [form, setForm] = useState({
        openingCash: '', cashSales: '', cashExpense: '',
        dueCollection: '', supplierPayment: '', actualCash: '', note: ''
    });

    useEffect(() => {
        if (prefillData?.data) {
            const p = prefillData.data;
            setForm((prev) => ({
                openingCash: p.opening_cash?.toString() || '',
                cashSales: p.cash_sales?.toString() || '',
                cashExpense: p.cash_expense?.toString() || '',
                dueCollection: p.due_collection?.toString() || '',
                supplierPayment: p.supplier_payment?.toString() || '',
                actualCash: prev.actualCash, note: prev.note,
            }));
        }
    }, [prefillData]);

    const closings = (data?.data?.closings || []).reverse();

    const expected = useMemo(() =>
        Number(form.openingCash || 0) + Number(form.cashSales || 0) + Number(form.dueCollection || 0)
        - Number(form.cashExpense || 0) - Number(form.supplierPayment || 0),
    [form]);
    const difference = Number(form.actualCash || 0) - expected;

    const todayClosings = closings.filter((c: any) => {
        const d = new Date(c.created_at);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    });

    const submit = async () => {
        if (!form.actualCash) return showMessage(t('closing_required'), 'error');
        try {
            await createClosing({
                store_id: currentStoreId,
                opening_cash: Number(form.openingCash || 0),
                cash_sales: Number(form.cashSales || 0),
                cash_expense: Number(form.cashExpense || 0),
                due_collection: Number(form.dueCollection || 0),
                supplier_payment: Number(form.supplierPayment || 0),
                actual_cash: Number(form.actualCash || 0),
                note: form.note || undefined,
            }).unwrap();
            setForm({ openingCash: '', cashSales: '', cashExpense: '', dueCollection: '', supplierPayment: '', actualCash: '', note: '' });
            refetch();
            showMessage(t('closing_saved'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    const handleStatus = async (id: number, status: string) => {
        try {
            await updateClosing({ id, store_id: currentStoreId, status }).unwrap();
            refetch();
            showMessage(t('closing_updated'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    const todayStats = {
        count: todayClosings.length,
        approved: todayClosings.filter((c: any) => c.status === 'approved').length,
        totalDifference: todayClosings.reduce((s: number, c: any) => s + (parseFloat(c.difference) || 0), 0),
    };

    return (
        <div className="space-y-5 p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                    <Receipt className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('closing_title')}</h1>
                    <p className="text-sm text-gray-500">{t('closing_desc')}</p>
                </div>
            </div>

            {/* Today Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { icon: Clock, value: todayStats.count, label: t('closing_today') },
                    { icon: CheckCircle2, value: todayStats.approved, label: t('closing_approved') },
                    { icon: ArrowDownUp, value: formatCurrency(todayStats.totalDifference), label: t('closing_difference') },
                ].map((card) => (
                    <div key={card.label} className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
                        <card.icon className="mx-auto mb-1 h-4 w-4 text-primary" />
                        <div className="text-lg font-bold text-gray-900">{card.value}</div>
                        <p className="text-xs text-gray-500">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* New Closing Form */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    {t('closing_new')}
                    {prefillData?.data && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> Values pulled from today&apos;s transactions
                        </span>
                    )}
                </h3>
                <div className="space-y-3">
                    {/* Cash In */}
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">{t('closing_cash_in')}</p>
                        <div className="grid gap-2 sm:grid-cols-3">
                            <input type="number" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary" value={form.openingCash} onChange={(e) => setForm((p) => ({ ...p, openingCash: e.target.value }))} placeholder={t('closing_opening')} />
                            <input type="number" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary" value={form.cashSales} onChange={(e) => setForm((p) => ({ ...p, cashSales: e.target.value }))} placeholder={t('closing_sales')} />
                            <input type="number" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary" value={form.dueCollection} onChange={(e) => setForm((p) => ({ ...p, dueCollection: e.target.value }))} placeholder={t('closing_collection')} />
                        </div>
                    </div>

                    {/* Cash Out */}
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-500">{t('closing_cash_out')}</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <input type="number" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary" value={form.cashExpense} onChange={(e) => setForm((p) => ({ ...p, cashExpense: e.target.value }))} placeholder={t('closing_expense')} />
                            <input type="number" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary" value={form.supplierPayment} onChange={(e) => setForm((p) => ({ ...p, supplierPayment: e.target.value }))} placeholder={t('closing_supplier')} />
                        </div>
                    </div>

                    {/* Actual Cash */}
                    <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-3">
                        <label className="mb-1 block text-xs font-semibold text-gray-700">{t('closing_actual')} *</label>
                        <p className="mb-2 text-xs text-gray-400">{t('closing_actual_hint')}</p>
                        <input type="number" className="w-full rounded-lg border border-primary/30 bg-white px-3 py-2.5 text-lg font-bold focus:border-primary" value={form.actualCash} onChange={(e) => setForm((p) => ({ ...p, actualCash: e.target.value }))} placeholder="0" />
                    </div>

                    <textarea className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:border-primary" rows={2} value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} placeholder={t('closing_note')} />

                    {/* Calculation Summary */}
                    <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Calculator className="h-4 w-4 text-primary" />
                            <span className="text-gray-600">{t('closing_expected')}:</span>
                            <span className="font-bold text-gray-900">{formatCurrency(expected)}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm">
                            <ArrowDownUp className="h-4 w-4 text-primary" />
                            <span className="text-gray-600">{t('closing_difference_label')}:</span>
                            <span className={`font-bold ${difference < 0 ? 'text-red-600' : difference > 0 ? 'text-emerald-600' : 'text-gray-600'}`}>
                                {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                            </span>
                        </div>
                    </div>

                    <button onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
                        <Receipt className="h-4 w-4" /> {t('closing_submit')}
                    </button>
                </div>
            </div>

            {/* History */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">{t('closing_history')}</h3>
                {closings.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-400">{t('closing_empty')}</div>
                ) : (
                    <div className="space-y-2">
                        {closings.slice(0, 20).map((item: any) => (
                            <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900">{formatCurrency(item.actual_cash || 0)}</span>
                                        <span className={`text-xs font-medium ${parseFloat(item.difference || 0) < 0 ? 'text-red-600' : parseFloat(item.difference || 0) > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            ({parseFloat(item.difference || 0) > 0 ? '+' : ''}{formatCurrency(item.difference || 0)})
                                        </span>
                                    </div>
                                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                        {item.note && <span>{item.note} · </span>}
                                        <span>{new Date(item.created_at).toLocaleDateString('en-BD')} {new Date(item.created_at).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                        item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                        item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {item.status === 'approved' ? t('closing_approved') :
                                         item.status === 'rejected' ? t('closing_rejected') : t('closing_status_submitted')}
                                    </span>
                                    {item.status === 'submitted' && (
                                        <div className="flex gap-1">
                                            <button onClick={() => handleStatus(item.id, 'approved')} className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100" title={t('closing_approve')}>
                                                <CheckCircle2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleStatus(item.id, 'rejected')} className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100" title={t('closing_reject')}>
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
        </div>
    );
}
