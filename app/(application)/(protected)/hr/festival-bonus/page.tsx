'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import {
    useCreateFestivalBonusRunMutation,
    useGetFestivalBonusRunQuery,
    useGetFestivalBonusRunsQuery,
    usePayFestivalBonusRunMutation,
} from '@/store/features/hr/festivalBonusApi';
import { Banknote, CheckCircle2, Gift, Plus } from 'lucide-react';
import { useState } from 'react';

export default function FestivalBonusPage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', percentage: '' });
    const [selectedRunId, setSelectedRunId] = useState<number | null>(null);

    const { data: runsData, refetch: refetchRuns } = useGetFestivalBonusRunsQuery(
        { store_id: currentStoreId }, { skip: !currentStoreId }
    );
    const { data: runData, refetch: refetchRun } = useGetFestivalBonusRunQuery(
        { runId: selectedRunId as number, store_id: currentStoreId },
        { skip: !selectedRunId || !currentStoreId }
    );
    const [createRun] = useCreateFestivalBonusRunMutation();
    const [payRun, { isLoading: paying }] = usePayFestivalBonusRunMutation();

    const runs = runsData?.data?.runs || [];
    const run = runData?.data?.run;
    const entries = run?.entries || [];

    const handleCreate = async () => {
        if (!form.title || !form.percentage) return showMessage(t('bonus_fields_required'), 'error');
        try {
            const res = await createRun({ store_id: currentStoreId, title: form.title, percentage: Number(form.percentage) }).unwrap();
            setForm({ title: '', percentage: '' });
            setShowForm(false);
            setSelectedRunId(res?.data?.run?.id);
            refetchRuns();
            showMessage(t('bonus_run_created'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    const handlePay = async () => {
        if (!selectedRunId) return;
        try {
            await payRun({ runId: selectedRunId, store_id: currentStoreId, payment_method: 'cash' }).unwrap();
            refetchRun();
            refetchRuns();
            showMessage(t('bonus_paid'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    return (
        <div className="space-y-5 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                        <Gift className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('bonus_title')}</h1>
                        <p className="text-sm text-gray-500">{t('bonus_desc')}</p>
                    </div>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90">
                    <Plus className="h-3.5 w-3.5" /> {t('bonus_new_run')}
                </button>
            </div>

            {showForm && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <input type="text" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder={t('bonus_run_title_placeholder')} />
                        <input type="number" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.percentage} onChange={(e) => setForm((p) => ({ ...p, percentage: e.target.value }))} placeholder={t('bonus_percentage_placeholder')} />
                        <button onClick={handleCreate} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{t('bonus_create_run')}</button>
                    </div>
                </div>
            )}

            <div className="grid gap-5 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:col-span-1">
                    <h3 className="mb-3 text-sm font-semibold text-gray-700">{t('bonus_runs_title')}</h3>
                    {runs.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-400">{t('bonus_no_runs')}</p>
                    ) : (
                        <div className="space-y-2">
                            {runs.map((r: any) => (
                                <button
                                    key={r.id}
                                    onClick={() => setSelectedRunId(r.id)}
                                    className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${
                                        selectedRunId === r.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">{r.title}</span>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-gray-400">{r.percentage}% · {r.entries_count ?? 0} {t('payroll_staff_count')}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:col-span-2">
                    {!run ? (
                        <p className="py-10 text-center text-sm text-gray-400">{t('bonus_select_run')}</p>
                    ) : (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-700">{run.title} ({run.percentage}%)</h3>
                                {run.status !== 'paid' ? (
                                    <button onClick={handlePay} disabled={paying} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                                        <Banknote className="h-3.5 w-3.5" /> {t('bonus_pay_all')}
                                    </button>
                                ) : (
                                    <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> {t('bonus_paid_label')}
                                    </span>
                                )}
                            </div>

                            {entries.length === 0 ? (
                                <p className="py-10 text-center text-sm text-gray-400">{t('bonus_no_entries')}</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase">
                                                <th className="px-3 py-2">{t('lbl_staff')}</th>
                                                <th className="px-3 py-2">{t('bonus_basic_snapshot')}</th>
                                                <th className="px-3 py-2">{t('bonus_amount')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {entries.map((entry: any) => (
                                                <tr key={entry.id} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2.5 font-medium text-gray-900">{entry.user?.name}</td>
                                                    <td className="px-3 py-2.5">৳{entry.basic_salary_snapshot}</td>
                                                    <td className="px-3 py-2.5 font-bold text-gray-900">৳{entry.bonus_amount}</td>
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
