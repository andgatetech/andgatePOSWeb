'use client';

import { FormEvent, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { useGetPlansQuery } from '@/store/features/plans/plansApi';
import { useGetManualPaymentSummaryQuery, useSubmitManualPaymentMutation } from '@/store/features/manualPayments/manualPaymentsApi';

const methods = [
    { value: 'bkash', label: 'bKash' },
    { value: 'nagad', label: 'Nagad' },
    { value: 'rocket', label: 'Rocket' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'other', label: 'Other' },
];

export default function ManualPaymentsPage() {
    const { data: plansData } = useGetPlansQuery();
    const { data: summaryData } = useGetManualPaymentSummaryQuery();
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
            await Swal.fire('Submitted', 'Payment submitted. Admin verification is required before activation.', 'success');
        } catch (error: any) {
            await Swal.fire('Not submitted', error?.data?.message || 'Please check payment details.', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manual Payment & Renewal</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Submit bKash, Nagad, Rocket, bank, cash or other payment details for admin verification.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Current Package</h2>
                    <div className="mt-4 space-y-2 text-sm">
                        <p><span className="text-gray-500">Package:</span> <span className="font-semibold">{subscription?.plan_name_en || 'No active package'}</span></p>
                        <p><span className="text-gray-500">Status:</span> <span className="font-semibold capitalize">{subscription?.status || 'none'}</span></p>
                        <p><span className="text-gray-500">Expiry:</span> <span className="font-semibold">{subscription?.expire_date ? new Date(subscription.expire_date).toLocaleDateString('en-US') : 'N/A'}</span></p>
                        <p><span className="text-gray-500">Latest payment:</span> <span className="font-semibold capitalize">{latest?.status?.replaceAll('_', ' ') || 'N/A'}</span></p>
                    </div>
                    {latest?.rejected_reason && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{latest.rejected_reason}</div>}
                </section>

                <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 xl:col-span-2">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Package
                            <select required value={form.package_id} onChange={(e) => update('package_id', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300 text-sm dark:bg-gray-800">
                                <option value="">Select package</option>
                                {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name_en}</option>)}
                            </select>
                        </label>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Billing cycle
                            <select value={form.billing_cycle} onChange={(e) => update('billing_cycle', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300 text-sm dark:bg-gray-800">
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="custom">Custom</option>
                            </select>
                        </label>
                        {form.billing_cycle === 'custom' && (
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Custom days
                                <input value={form.custom_duration_days} onChange={(e) => update('custom_duration_days', e.target.value)} type="number" min={1} className="mt-1 w-full rounded-lg border-gray-300 text-sm dark:bg-gray-800" />
                            </label>
                        )}
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Payment method
                            <select value={form.payment_method} onChange={(e) => update('payment_method', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300 text-sm dark:bg-gray-800">
                                {methods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
                            </select>
                        </label>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Sender / account number
                            <input value={form.sender_account} onChange={(e) => update('sender_account', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300 text-sm dark:bg-gray-800" />
                        </label>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Transaction ID
                            <input value={form.transaction_id} onChange={(e) => update('transaction_id', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300 text-sm dark:bg-gray-800" />
                        </label>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Paid amount
                            <input required value={form.amount} onChange={(e) => update('amount', e.target.value)} type="number" min={1} className="mt-1 w-full rounded-lg border-gray-300 text-sm dark:bg-gray-800" />
                        </label>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Payment date/time
                            <input required value={form.payment_date} onChange={(e) => update('payment_date', e.target.value)} type="datetime-local" className="mt-1 w-full rounded-lg border-gray-300 text-sm dark:bg-gray-800" />
                        </label>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Receipt
                            <input onChange={(e) => setReceipt(e.target.files?.[0] || null)} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm dark:bg-gray-800" />
                        </label>
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                            Expected package amount: <strong>৳ {expectedAmount.toLocaleString('en-US')}</strong>
                        </div>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Customer note
                        <textarea value={form.customer_note} onChange={(e) => update('customer_note', e.target.value)} rows={3} className="mt-1 w-full rounded-lg border-gray-300 text-sm dark:bg-gray-800" />
                    </label>
                    <button disabled={isLoading} className="rounded-lg bg-[#046ca9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#035b8e] disabled:opacity-60">
                        {isLoading ? 'Submitting...' : 'Submit Payment for Verification'}
                    </button>
                </form>
            </div>
        </div>
    );
}
