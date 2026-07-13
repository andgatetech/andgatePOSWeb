'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080';

const PROVIDER_LABELS: Record<string, string> = {
    bkash: 'bKash',
    nagad: 'Nagad',
    rocket: 'Rocket',
    upay: 'Upay',
};

const PROVIDER_COLORS: Record<string, string> = {
    bkash: 'bg-pink-600',
    nagad: 'bg-amber-500',
    rocket: 'bg-purple-600',
    upay: 'bg-blue-600',
};

export default function PayPage() {
    const params = useParams();
    const token = params?.token as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [link, setLink] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        payment_method: '',
        transaction_reference: '',
        paid_amount: '',
        customer_name: '',
        customer_phone: '',
        notes: '',
    });

    useEffect(() => {
        if (!token) return;

        fetch(`${API_BASE}/api/pay/${token}`)
            .then(async (res) => {
                const json = await res.json();
                if (!res.ok || !json.success) {
                    throw new Error(json.message || 'Failed to load payment link');
                }
                return json.data.link;
            })
            .then((data) => {
                setLink(data);
                setForm((f) => ({
                    ...f,
                    paid_amount: String(data.amount),
                    customer_name: data.customer?.name || '',
                    customer_phone: data.customer?.phone || '',
                }));
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.payment_method || !form.transaction_reference) return;

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/api/pay/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_method: form.payment_method,
                    transaction_reference: form.transaction_reference,
                    paid_amount: form.paid_amount ? parseFloat(form.paid_amount) : undefined,
                    customer_name: form.customer_name || undefined,
                    customer_phone: form.customer_phone || undefined,
                    notes: form.notes || undefined,
                }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.message || 'Payment submission failed');
            }
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (error && !link) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
                    <div className="mb-4 text-5xl">⚠️</div>
                    <h1 className="mb-2 text-xl font-bold text-gray-900">Link Not Available</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
                    <div className="mb-4 text-5xl">🎉</div>
                    <h1 className="mb-2 text-xl font-bold text-gray-900">Payment Submitted</h1>
                    <p className="text-gray-600">
                        Thank you! The shop will verify your transaction reference and update your due amount.
                    </p>
                </div>
            </div>
        );
    }

    const mfsAccounts = link?.mfs_accounts || [];
    const isExpired = link?.status === 'expired';
    const isPaid = link?.status === 'paid';
    const isCancelled = link?.status === 'cancelled';
    const disabled = isExpired || isPaid || isCancelled || submitting;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="mx-auto w-full max-w-md">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">{link?.store?.name || 'Payment Request'}</h1>
                    <p className="text-sm text-gray-500">Secure payment request</p>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-lg">
                    <div className="mb-6 text-center">
                        <p className="text-sm text-gray-500">Amount due</p>
                        <p className="text-4xl font-bold text-gray-900">BDT {Number(link?.amount || 0).toFixed(2)}</p>
                        {link?.customer?.name && <p className="mt-1 text-sm text-gray-600">For: {link.customer.name}</p>}
                    </div>

                    {isExpired && (
                        <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">This payment link has expired.</div>
                    )}
                    {isPaid && (
                        <div className="mb-4 rounded-lg bg-green-50 p-3 text-center text-sm text-green-700">This payment has already been recorded.</div>
                    )}
                    {isCancelled && (
                        <div className="mb-4 rounded-lg bg-gray-100 p-3 text-center text-sm text-gray-700">This payment link has been cancelled.</div>
                    )}

                    {mfsAccounts.length > 0 && (
                        <div className="mb-6">
                            <p className="mb-3 text-sm font-medium text-gray-700">Send money to:</p>
                            <div className="space-y-2">
                                {mfsAccounts.map((acc: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${PROVIDER_COLORS[acc.provider] || 'bg-gray-500'}`}>
                                                {PROVIDER_LABELS[acc.provider]?.[0] || acc.provider[0]?.toUpperCase()}
                                            </span>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{PROVIDER_LABELS[acc.provider] || acc.provider}</p>
                                                <p className="text-xs text-gray-500 capitalize">{acc.account_type} account</p>
                                            </div>
                                        </div>
                                        <p className="font-mono text-sm font-semibold text-gray-900">{acc.account_number}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Payment method used</label>
                            <select
                                value={form.payment_method}
                                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                                disabled={disabled}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100"
                            >
                                <option value="">Select payment method</option>
                                {mfsAccounts.map((acc: any) => (
                                    <option key={acc.account_number} value={acc.provider}>
                                        {PROVIDER_LABELS[acc.provider] || acc.provider} - {acc.account_number}
                                    </option>
                                ))}
                                <option value="cash">Cash</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Transaction reference / Txn ID</label>
                            <input
                                type="text"
                                value={form.transaction_reference}
                                onChange={(e) => setForm({ ...form, transaction_reference: e.target.value })}
                                disabled={disabled}
                                required
                                placeholder="e.g. 8XJ2A99C"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Paid amount</label>
                            <input
                                type="number"
                                min={0.01}
                                step={0.01}
                                value={form.paid_amount}
                                onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
                                disabled={disabled}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Your name</label>
                                <input
                                    type="text"
                                    value={form.customer_name}
                                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                                    disabled={disabled}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Your phone</label>
                                <input
                                    type="tel"
                                    value={form.customer_phone}
                                    onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                                    disabled={disabled}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Notes (optional)</label>
                            <textarea
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                disabled={disabled}
                                rows={2}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100"
                            />
                        </div>

                        {error && <p className="text-sm text-danger">{error}</p>}

                        <button
                            type="submit"
                            disabled={disabled}
                            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? 'Submitting...' : 'I have paid — submit reference'}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs text-gray-400">Powered by AndgateBOS</p>
            </div>
        </div>
    );
}
