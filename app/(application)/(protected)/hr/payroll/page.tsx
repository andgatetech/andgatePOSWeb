'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import {
    useGetPayrollCyclesQuery,
    useCreatePayrollCycleMutation,
    useGetPayrollCycleQuery,
    useGeneratePayrollEntriesMutation,
    usePayPayrollCycleMutation,
} from '@/store/features/hr/payrollApi';
import { Banknote, Calculator, CheckCircle2, Plus, Wallet } from 'lucide-react';
import { useState } from 'react';

const formatCycleDate = (value: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function PayrollPage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ period_start: '', period_end: '' });
    const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);

    const { data: cyclesData, refetch: refetchCycles } = useGetPayrollCyclesQuery(
        { store_id: currentStoreId }, { skip: !currentStoreId }
    );
    const { data: cycleData, refetch: refetchCycle } = useGetPayrollCycleQuery(
        { cycleId: selectedCycleId as number, store_id: currentStoreId },
        { skip: !selectedCycleId || !currentStoreId }
    );
    const [createCycle] = useCreatePayrollCycleMutation();
    const [generateEntries, { isLoading: generating }] = useGeneratePayrollEntriesMutation();
    const [payCycle, { isLoading: paying }] = usePayPayrollCycleMutation();

    const cycles = cyclesData?.data?.cycles || [];
    const cycle = cycleData?.data?.cycle;
    const entries = cycle?.entries || [];

    const handleCreate = async () => {
        if (!form.period_start || !form.period_end) return showMessage(t('payroll_period_required'), 'error');
        try {
            const res = await createCycle({ store_id: currentStoreId, ...form }).unwrap();
            setForm({ period_start: '', period_end: '' });
            setShowForm(false);
            setSelectedCycleId(res?.data?.cycle?.id);
            refetchCycles();
            showMessage(t('payroll_cycle_created'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    const handleGenerate = async () => {
        if (!selectedCycleId) return;
        try {
            await generateEntries({ cycleId: selectedCycleId, store_id: currentStoreId }).unwrap();
            refetchCycle();
            refetchCycles();
            showMessage(t('payroll_entries_generated'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    const handlePay = async () => {
        if (!selectedCycleId) return;
        try {
            await payCycle({ cycleId: selectedCycleId, store_id: currentStoreId, payment_method: 'cash' }).unwrap();
            refetchCycle();
            refetchCycles();
            showMessage(t('payroll_paid'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    return (
        <div className="space-y-5 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                        <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('payroll_title')}</h1>
                        <p className="text-sm text-gray-500">{t('payroll_desc')}</p>
                    </div>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90">
                    <Plus className="h-3.5 w-3.5" /> {t('payroll_new_cycle')}
                </button>
            </div>

            {showForm && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <input type="date" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.period_start} onChange={(e) => setForm((p) => ({ ...p, period_start: e.target.value }))} />
                        <input type="date" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.period_end} onChange={(e) => setForm((p) => ({ ...p, period_end: e.target.value }))} />
                        <button onClick={handleCreate} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{t('payroll_create_cycle')}</button>
                    </div>
                </div>
            )}

            <div className="grid gap-5 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:col-span-1">
                    <h3 className="mb-3 text-sm font-semibold text-gray-700">{t('payroll_cycles_title')}</h3>
                    {cycles.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-400">{t('payroll_no_cycles')}</p>
                    ) : (
                        <div className="space-y-2">
                            {cycles.map((c: any) => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedCycleId(c.id)}
                                    className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${
                                        selectedCycleId === c.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">{formatCycleDate(c.period_start)} → {formatCycleDate(c.period_end)}</span>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                            c.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                            c.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                        }`}>{c.status}</span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-gray-400">{c.entries_count ?? 0} {t('payroll_staff_count')}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:col-span-2">
                    {!cycle ? (
                        <p className="py-10 text-center text-sm text-gray-400">{t('payroll_select_cycle')}</p>
                    ) : (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-700">{formatCycleDate(cycle.period_start)} → {formatCycleDate(cycle.period_end)}</h3>
                                <div className="flex gap-2">
                                    {cycle.status !== 'paid' && (
                                        <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-1.5 rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
                                            <Calculator className="h-3.5 w-3.5" /> {t('payroll_generate')}
                                        </button>
                                    )}
                                    {cycle.status === 'processing' && entries.length > 0 && (
                                        <button onClick={handlePay} disabled={paying} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                                            <Banknote className="h-3.5 w-3.5" /> {t('payroll_pay_all')}
                                        </button>
                                    )}
                                    {cycle.status === 'paid' && (
                                        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> {t('payroll_paid_label')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {entries.length === 0 ? (
                                <p className="py-10 text-center text-sm text-gray-400">{t('payroll_no_entries')}</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase">
                                                <th className="px-3 py-2">{t('lbl_staff')}</th>
                                                <th className="px-3 py-2">{t('payroll_basic')}</th>
                                                <th className="px-3 py-2">{t('payroll_overtime')}</th>
                                                <th className="px-3 py-2">{t('payroll_advance_deduction')}</th>
                                                <th className="px-3 py-2">{t('payroll_absence_deduction')}</th>
                                                <th className="px-3 py-2">{t('payroll_net')}</th>
                                                <th className="px-3 py-2">{t('lbl_status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {entries.map((entry: any) => (
                                                <tr key={entry.id} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2.5 font-medium text-gray-900">{entry.user?.name}</td>
                                                    <td className="px-3 py-2.5">৳{entry.basic_salary}</td>
                                                    <td className="px-3 py-2.5">৳{entry.overtime_amount}</td>
                                                    <td className="px-3 py-2.5 text-red-600">−৳{entry.advance_deduction}</td>
                                                    <td className="px-3 py-2.5 text-red-600">−৳{entry.absence_deduction}</td>
                                                    <td className="px-3 py-2.5 font-bold text-gray-900">৳{entry.net_amount}</td>
                                                    <td className="px-3 py-2.5">
                                                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${entry.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {entry.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
