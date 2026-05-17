'use client';

import { FormEvent, useMemo, useState } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { CreditCard, FileText, PackageCheck } from 'lucide-react';
import { getTranslation } from '@/i18n';
import { useGetPlansQuery } from '@/store/features/plans/plansApi';
import { useGetManualPaymentSummaryQuery, useGetManualPaymentsQuery, useSubmitManualPaymentMutation } from '@/store/features/manualPayments/manualPaymentsApi';

const methods = [
    { value: 'bkash', label: 'bKash' },
    { value: 'nagad', label: 'Nagad' },
    { value: 'rocket', label: 'Rocket' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'other', label: 'Other' },
];

export default function ManualPaymentsPage() {
    const { t } = getTranslation();
    const { data: plansData } = useGetPlansQuery();
    const { data: summaryData } = useGetManualPaymentSummaryQuery();
    const { data: paymentsData } = useGetManualPaymentsQuery();
    const [submitPayment, { isLoading }] = useSubmitManualPaymentMutation();
    const plans = useMemo(() => plansData?.data || [], [plansData?.data]);
    const [form, setForm] = useState({
        package_id: '',
        billing_cycle: 'monthly',
        custom_duration_days: '',
        payment_method: 'bkash',
        sender_account: '',
        transaction_id: '',
        amount: '',
        payment_date: new Date().toISOString().slice(0, 16),
        customer_note: '',
    });
    const [receipt, setReceipt] = useState<File | null>(null);
    const latest = summaryData?.data.latest_payment;
    const subscription = summaryData?.data.subscription;
    const payments = paymentsData?.data?.data || paymentsData?.data || [];
    const methodLabels: Record<string, string> = {
        bkash: 'bKash',
        nagad: 'Nagad',
        rocket: 'Rocket',
        bank_transfer: t('bd_payments_bank'),
        cash: t('bd_payments_cash'),
        other: t('manual_payments_custom'),
    };
    const statusLabel = (status?: string) => {
        if (!status) return t('manual_payments_na');
        const statusMap: Record<string, string> = {
            submitted: t('manual_payments_status_submitted'),
            under_review: t('manual_payments_status_under_review'),
            approved: t('manual_payments_status_approved'),
            rejected: t('manual_payments_status_rejected'),
            duplicate: t('manual_payments_status_duplicate'),
            correction_requested: t('manual_payments_status_correction_requested'),
            cancelled: t('manual_payments_status_cancelled'),
            active: t('manual_payments_status_active'),
            expired: t('manual_payments_status_expired'),
            pending: t('manual_payments_status_pending'),
        };
        return statusMap[status] || status.replaceAll('_', ' ');
    };

    const selectedPlan = useMemo(() => plans.find((plan) => String(plan.id) === form.package_id), [plans, form.package_id]);
    const expectedAmount = useMemo(() => {
        if (!selectedPlan) return 0;
        const price = form.billing_cycle === 'yearly' ? Number(selectedPlan.yearly_price) : Number(selectedPlan.monthly_price);
        return Math.max(0, price + Number(selectedPlan.setup_fee || 0) - Number(selectedPlan.discount || 0));
    }, [selectedPlan, form.billing_cycle]);

    const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const body = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value) body.append(key, value);
        });
        if (receipt) body.append('receipt', receipt);

        try {
            await submitPayment(body).unwrap();
            await Swal.fire(t('manual_payments_submitted_title'), t('manual_payments_submitted_msg'), 'success');
        } catch (error: any) {
            await Swal.fire(t('manual_payments_not_submitted'), error?.data?.message || t('manual_payments_check_details'), 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="panel">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-28 shrink-0 items-center justify-center rounded-md border border-white-light bg-white px-2 dark:border-[#17263c]">
                            <Image src="/images/andgatePOS.jpeg" alt="AndgatePOS" width={104} height={34} className="h-8 w-auto object-contain" unoptimized />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase text-primary">{t('manual_payments_brand_badge')}</p>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">{t('manual_payments_title')}</h1>
                        </div>
                    </div>
                </div>
                <p className="mt-3 max-w-3xl text-sm text-gray-600 dark:text-gray-300">{t('manual_payments_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <section className="panel">
                    <div className="flex items-center gap-2">
                        <div className="rounded-md bg-primary/10 p-2 text-primary"><PackageCheck className="h-5 w-5" /></div>
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('manual_payments_current_package')}</h2>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                        <p><span className="text-gray-500">{t('manual_payments_package')}:</span> <span className="font-semibold">{subscription?.plan_name_en || t('manual_payments_no_active_package')}</span></p>
                        <p><span className="text-gray-500">{t('manual_payments_status')}:</span> <span className="font-semibold capitalize">{statusLabel(subscription?.status) || t('manual_payments_none')}</span></p>
                        <p><span className="text-gray-500">{t('manual_payments_expiry')}:</span> <span className="font-semibold">{subscription?.expire_date ? new Date(subscription.expire_date).toLocaleDateString('en-US') : t('manual_payments_na')}</span></p>
                        <p><span className="text-gray-500">{t('manual_payments_latest_payment')}:</span> <span className="font-semibold capitalize">{statusLabel(latest?.status)}</span></p>
                    </div>
                    {latest?.rejected_reason && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{latest.rejected_reason}</div>}
                </section>

                <form onSubmit={handleSubmit} className="panel space-y-4 xl:col-span-2">
                    <div className="flex items-center gap-2">
                        <div className="rounded-md bg-primary/10 p-2 text-primary"><CreditCard className="h-5 w-5" /></div>
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('manual_payments_submit')}</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {t('manual_payments_package')}
                            <select required value={form.package_id} onChange={(e) => update('package_id', e.target.value)} className="form-select mt-1">
                                <option value="">{t('manual_payments_select_package')}</option>
                                {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name_en}</option>)}
                            </select>
                        </label>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {t('manual_payments_billing_cycle')}
                            <select value={form.billing_cycle} onChange={(e) => update('billing_cycle', e.target.value)} className="form-select mt-1">
                                <option value="monthly">{t('manual_payments_monthly')}</option>
                                <option value="yearly">{t('manual_payments_yearly')}</option>
                                <option value="custom">{t('manual_payments_custom')}</option>
                            </select>
                        </label>
                        {form.billing_cycle === 'custom' && (
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {t('manual_payments_custom_days')}
                                <input value={form.custom_duration_days} onChange={(e) => update('custom_duration_days', e.target.value)} type="number" min={1} className="form-input mt-1" />
                            </label>
                        )}
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {t('manual_payments_payment_method')}
                            <select value={form.payment_method} onChange={(e) => update('payment_method', e.target.value)} className="form-select mt-1">
                                {methods.map((method) => <option key={method.value} value={method.value}>{methodLabels[method.value] || method.label}</option>)}
                            </select>
                        </label>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {t('manual_payments_sender_account')}
                            <input value={form.sender_account} onChange={(e) => update('sender_account', e.target.value)} className="form-input mt-1" />
                        </label>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {t('manual_payments_transaction_id')}
                            <input value={form.transaction_id} onChange={(e) => update('transaction_id', e.target.value)} className="form-input mt-1" />
                        </label>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {t('manual_payments_paid_amount')}
                            <input required value={form.amount} onChange={(e) => update('amount', e.target.value)} type="number" min={1} className="form-input mt-1" />
                        </label>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {t('manual_payments_payment_datetime')}
                            <input required value={form.payment_date} onChange={(e) => update('payment_date', e.target.value)} type="datetime-local" className="form-input mt-1" />
                        </label>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {t('manual_payments_receipt')}
                            <input onChange={(e) => setReceipt(e.target.files?.[0] || null)} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" className="form-input mt-1" />
                        </label>
                        <div className="rounded-md border border-primary/20 bg-primary/10 p-3 text-sm font-semibold text-primary">
                            {t('manual_payments_expected_amount')}: <strong>৳ {expectedAmount.toLocaleString('en-US')}</strong>
                        </div>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        {t('manual_payments_customer_note')}
                        <textarea value={form.customer_note} onChange={(e) => update('customer_note', e.target.value)} rows={3} className="form-textarea mt-1" />
                    </label>
                    <button disabled={isLoading} className="btn btn-primary disabled:opacity-60">
                        {isLoading ? t('manual_payments_submitting') : t('manual_payments_submit')}
                    </button>
                </form>
            </div>

            <section className="panel p-0">
                <div className="border-b border-white-light px-5 py-4 dark:border-[#17263c]">
                    <div className="flex items-center gap-2">
                        <div className="rounded-md bg-primary/10 p-2 text-primary"><FileText className="h-4 w-4" /></div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('manual_payments_history_title')}</h2>
                            <p className="mt-1 text-xs text-gray-500">{t('manual_payments_history_subtitle')}</p>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/60">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">{t('manual_payments_date')}</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">{t('manual_payments_package')}</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">{t('manual_payments_method')}</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">{t('manual_payments_transaction_id')}</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">{t('manual_payments_amount')}</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">{t('manual_payments_status')}</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">{t('manual_payments_admin_note')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {payments.length > 0 ? (
                                payments.map((payment: any) => (
                                    <tr key={payment.id}>
                                        <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US') : new Date(payment.created_at).toLocaleDateString('en-US')}</td>
                                        <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{payment.package?.name_en || t('manual_payments_package')}</td>
                                        <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{String(payment.provider || payment.payment_method).replaceAll('_', ' ')}</td>
                                        <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{payment.transaction_id || t('manual_payments_na')}</td>
                                        <td className="px-5 py-3 text-right font-semibold text-gray-900 dark:text-white">৳ {Number(payment.amount || 0).toLocaleString('en-US')}</td>
                                        <td className="px-5 py-3">
                                            <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold capitalize text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                                {statusLabel(payment.status)}
                                            </span>
                                        </td>
                                        <td className="max-w-xs px-5 py-3 text-gray-600 dark:text-gray-300">{payment.rejected_reason || payment.admin_note || t('manual_payments_na')}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-500">
                                        {t('manual_payments_no_history')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
