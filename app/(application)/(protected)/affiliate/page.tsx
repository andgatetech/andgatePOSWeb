'use client';

import {
    useGetAffiliateDashboardQuery,
    useGetAffiliateConversionsQuery,
    useGetAffiliateLedgerQuery,
    useGetAffiliatePayoutsQuery,
    useRequestAffiliatePayoutMutation,
    useBookAffiliateDemoMutation,
    useGetAffiliateDemoBookingsQuery,
} from '@/store/features/affiliate/affiliateApi';
import { useState } from 'react';
import { TrendingUp, Users, Wallet, MousePointerClick, CreditCard, Calendar, ChevronRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

type Tab = 'overview' | 'conversions' | 'ledger' | 'payouts' | 'demos';

export default function AffiliateDashboardPage() {
    const [tab, setTab] = useState<Tab>('overview');
    const [showPayoutForm, setShowPayoutForm] = useState(false);
    const [showDemoForm, setShowDemoForm] = useState(false);
    const [payoutData, setPayoutData] = useState({ method: 'bkash', account_number: '' });
    const [demoData, setDemoData] = useState({ prospect_name: '', prospect_mobile: '', prospect_business: '', location: '', scheduled_at: '', notes: '' });

    const { data: dashData, isLoading } = useGetAffiliateDashboardQuery();
    const { data: conversions } = useGetAffiliateConversionsQuery({ page: 1 }, { skip: tab !== 'conversions' });
    const { data: ledger }      = useGetAffiliateLedgerQuery({ page: 1 }, { skip: tab !== 'ledger' });
    const { data: payouts }     = useGetAffiliatePayoutsQuery({ page: 1 }, { skip: tab !== 'payouts' });
    const { data: demos }       = useGetAffiliateDemoBookingsQuery({ page: 1 }, { skip: tab !== 'demos' });

    const [requestPayout, { isLoading: payoutLoading, isSuccess: payoutSuccess, error: payoutError }] = useRequestAffiliatePayoutMutation();
    const [bookDemo, { isLoading: demoLoading, isSuccess: demoSuccess, error: demoError }] = useBookAffiliateDemoMutation();

    const stats = dashData?.data;

    const TABS: { key: Tab; label: string }[] = [
        { key: 'overview', label: 'ওভারভিউ' },
        { key: 'conversions', label: 'কনভার্সন' },
        { key: 'ledger', label: 'কমিশন লেজার' },
        { key: 'payouts', label: 'পেআউট' },
        { key: 'demos', label: 'ডেমো বুকিং' },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-6 text-center">
                <AlertCircle className="mx-auto mb-3 h-10 w-10 text-warning" />
                <p className="text-slate-600">আপনার কোনো অ্যাফিলিয়েট একাউন্ট নেই।</p>
                <a href="/affiliate" className="mt-4 inline-block rounded-xl bg-primary text-white px-6 py-2 font-semibold hover:opacity-90">
                    রেজিস্ট্রেশন করুন
                </a>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">পার্টনার ড্যাশবোর্ড</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="rounded-full bg-primary/10 text-primary px-3 py-0.5 text-sm font-semibold">{stats.tier}</span>
                        <span className="text-slate-500 text-sm">কোড: <strong className="text-slate-800">{stats.code}</strong></span>
                        {stats.promo_code && <span className="text-slate-500 text-sm">প্রোমো: <strong className="text-slate-800">{stats.promo_code}</strong></span>}
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setShowDemoForm(true)} className="rounded-xl border border-primary text-primary px-4 py-2 text-sm font-semibold hover:bg-primary/5">
                        + ডেমো বুক করুন
                    </button>
                    <button onClick={() => setShowPayoutForm(true)} className="rounded-xl bg-primary text-white px-4 py-2 text-sm font-semibold hover:opacity-90">
                        পেআউট রিকোয়েস্ট
                    </button>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { icon: MousePointerClick, label: 'মোট ক্লিক', value: stats.total_clicks, color: 'text-blue-500' },
                    { icon: Users,             label: 'সক্রিয় কাস্টমার', value: stats.active_customers, color: 'text-success' },
                    { icon: Wallet,            label: 'ব্যালেন্স', value: `৳${Number(stats.balance).toFixed(0)}`, color: 'text-warning' },
                    { icon: TrendingUp,        label: 'মোট আয়', value: `৳${Number(stats.total_earned).toFixed(0)}`, color: 'text-primary' },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
                        <Icon className={`h-5 w-5 mb-2 ${color}`} />
                        <div className="text-xl font-bold">{value}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                    </div>
                ))}
            </div>

            {/* Referral link box */}
            <div className="mb-6 rounded-xl bg-primary/5 border border-primary/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 mb-1">আপনার রেফারেল লিংক</div>
                    <div className="text-sm font-mono text-slate-800 break-all">
                        {typeof window !== 'undefined' ? `${window.location.origin}/?ref=${stats.code}` : `/?ref=${stats.code}`}
                    </div>
                </div>
                <button
                    onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/?ref=${stats.code}`)}
                    className="shrink-0 rounded-lg bg-primary text-white px-4 py-2 text-xs font-semibold hover:opacity-90"
                >
                    কপি করুন
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 mb-4">
                {TABS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${tab === key ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                {tab === 'overview' && (
                    <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                ['মোট ক্লিক', stats.total_clicks],
                                ['ইউনিক ক্লিক', stats.unique_clicks],
                                ['ট্রায়াল', stats.total_trials],
                                ['সক্রিয় কাস্টমার', stats.active_customers],
                                ['চার্ন', stats.churned],
                                ['মোট পেইড', `৳${Number(stats.total_paid).toFixed(0)}`],
                            ].map(([label, value]) => (
                                <div key={String(label)} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                    <span className="text-sm text-slate-600">{label}</span>
                                    <span className="font-semibold">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'conversions' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>
                                    {['কাস্টমার', 'প্ল্যান', 'স্ট্যাটাস', 'কনভার্ট', 'পরিমাণ'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {conversions?.data?.data?.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium">{c.subscriber_name ?? '—'}</td>
                                        <td className="px-4 py-3 text-slate-500">{c.plan_name ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.status === 'active' ? 'bg-success/10 text-success' : c.status === 'trial' ? 'bg-warning/10 text-warning' : 'bg-slate-100 text-slate-500'}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{c.converted_at ? new Date(c.converted_at).toLocaleDateString('bn-BD') : '—'}</td>
                                        <td className="px-4 py-3 font-semibold text-success">৳{c.subscription_amount}</td>
                                    </tr>
                                )) ?? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">কোনো কনভার্সন নেই</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'ledger' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>{['তারিখ', 'ধরন', 'পরিমাণ', 'স্ট্যাটাস', 'নোট'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {ledger?.data?.data?.map((e: any) => (
                                    <tr key={e.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-500">{new Date(e.created_at).toLocaleDateString('bn-BD')}</td>
                                        <td className="px-4 py-3">{e.type}</td>
                                        <td className={`px-4 py-3 font-semibold ${Number(e.amount) < 0 ? 'text-danger' : 'text-success'}`}>
                                            {Number(e.amount) >= 0 ? '+' : ''}৳{e.amount}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${e.status === 'locked' ? 'bg-success/10 text-success' : e.status === 'paid' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                                                {e.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{e.note}</td>
                                    </tr>
                                )) ?? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">কোনো এন্ট্রি নেই</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'payouts' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>{['তারিখ', 'পরিমাণ', 'মাধ্যম', 'একাউন্ট', 'ট্রানজেকশন', 'স্ট্যাটাস'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payouts?.data?.data?.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-500">{new Date(p.created_at).toLocaleDateString('bn-BD')}</td>
                                        <td className="px-4 py-3 font-bold text-success">৳{p.amount}</td>
                                        <td className="px-4 py-3 uppercase">{p.method}</td>
                                        <td className="px-4 py-3 text-slate-500">{p.account_number}</td>
                                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.transaction_id ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === 'completed' ? 'bg-success/10 text-success' : p.status === 'processing' ? 'bg-warning/10 text-warning' : 'bg-slate-100 text-slate-500'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) ?? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">কোনো পেআউট নেই</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'demos' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>{['সম্ভাব্য কাস্টমার', 'মোবাইল', 'ব্যবসা', 'তারিখ', 'স্ট্যাটাস', 'ইনসেন্টিভ'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {demos?.data?.data?.map((d: any) => (
                                    <tr key={d.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium">{d.prospect_name}</td>
                                        <td className="px-4 py-3 text-slate-500">{d.prospect_mobile}</td>
                                        <td className="px-4 py-3 text-slate-500">{d.prospect_business ?? '—'}</td>
                                        <td className="px-4 py-3 text-slate-500">{d.scheduled_at ? new Date(d.scheduled_at).toLocaleDateString('bn-BD') : '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${d.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {d.incentive_paid ? <CheckCircle className="h-4 w-4 text-success" /> : <span className="text-slate-400 text-xs">মুলতুবি</span>}
                                        </td>
                                    </tr>
                                )) ?? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">কোনো ডেমো বুকিং নেই</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Payout Modal */}
            {showPayoutForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowPayoutForm(false); }}>
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">পেআউট রিকোয়েস্ট</h3>
                            <button onClick={() => setShowPayoutForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
                        </div>
                        {payoutSuccess ? (
                            <div className="text-center py-6">
                                <CheckCircle className="mx-auto mb-3 h-12 w-12 text-success" />
                                <p className="font-semibold">পেআউট রিকোয়েস্ট সফল!</p>
                                <p className="text-sm text-slate-500 mt-1">আমরা শীঘ্রই প্রসেস করব।</p>
                                <button onClick={() => setShowPayoutForm(false)} className="mt-4 rounded-xl bg-primary text-white px-6 py-2 font-semibold">বন্ধ করুন</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                                    উপলব্ধ ব্যালেন্স: <strong className="text-success text-lg">৳{Number(stats.balance).toFixed(0)}</strong>
                                    <span className="text-slate-400 text-xs ml-2">(মিনিমাম ৳৫০০)</span>
                                </div>
                                {payoutError && (
                                    <div className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-sm text-danger">
                                        {(payoutError as any)?.data?.message || 'পেআউট ব্যর্থ।'}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium mb-1">পেমেন্ট মাধ্যম</label>
                                    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={payoutData.method}
                                        onChange={(e) => setPayoutData({ ...payoutData, method: e.target.value })}>
                                        <option value="bkash">bKash</option>
                                        <option value="nagad">Nagad</option>
                                        <option value="bank">ব্যাংক</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">একাউন্ট নম্বর</label>
                                    <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={payoutData.account_number}
                                        onChange={(e) => setPayoutData({ ...payoutData, account_number: e.target.value })} placeholder="01XXXXXXXXX" />
                                </div>
                                <button disabled={payoutLoading || !payoutData.account_number}
                                    onClick={() => requestPayout(payoutData)}
                                    className="w-full rounded-xl bg-primary text-white font-bold py-3 hover:opacity-90 disabled:opacity-50">
                                    {payoutLoading ? 'প্রসেস হচ্ছে...' : 'রিকোয়েস্ট করুন'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Demo booking Modal */}
            {showDemoForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowDemoForm(false); }}>
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-lg">ডেমো বুকিং</h3>
                                <p className="text-xs text-slate-500">ডেমো সম্পন্ন হলে ৳২০০ ইনসেন্টিভ পাবেন</p>
                            </div>
                            <button onClick={() => setShowDemoForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
                        </div>
                        {demoSuccess ? (
                            <div className="text-center py-6">
                                <CheckCircle className="mx-auto mb-3 h-12 w-12 text-success" />
                                <p className="font-semibold">ডেমো বুকিং সফল!</p>
                                <button onClick={() => { setShowDemoForm(false); setTab('demos'); }} className="mt-4 rounded-xl bg-primary text-white px-6 py-2 font-semibold">দেখুন</button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {demoError && (
                                    <div className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-sm text-danger">
                                        {(demoError as any)?.data?.message || 'বুকিং ব্যর্থ।'}
                                    </div>
                                )}
                                {[
                                    { label: 'সম্ভাব্য কাস্টমারের নাম *', key: 'prospect_name', placeholder: 'কাস্টমারের নাম' },
                                    { label: 'মোবাইল নম্বর *', key: 'prospect_mobile', placeholder: '01XXXXXXXXX' },
                                    { label: 'ব্যবসার ধরন', key: 'prospect_business', placeholder: 'যেমন: ফার্মেসি, কাপড়ের দোকান' },
                                    { label: 'লোকেশন', key: 'location', placeholder: 'মিরপুর-১০, ঢাকা' },
                                ].map(({ label, key, placeholder }) => (
                                    <div key={key}>
                                        <label className="block text-sm font-medium mb-1">{label}</label>
                                        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                            value={(demoData as any)[key]} placeholder={placeholder}
                                            onChange={(e) => setDemoData({ ...demoData, [key]: e.target.value })} />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-sm font-medium mb-1">নির্ধারিত তারিখ</label>
                                    <input type="datetime-local" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                        value={demoData.scheduled_at} onChange={(e) => setDemoData({ ...demoData, scheduled_at: e.target.value })} />
                                </div>
                                <button disabled={demoLoading || !demoData.prospect_name || !demoData.prospect_mobile}
                                    onClick={() => bookDemo(demoData)}
                                    className="w-full rounded-xl bg-primary text-white font-bold py-3 hover:opacity-90 disabled:opacity-50">
                                    {demoLoading ? 'বুক হচ্ছে...' : 'ডেমো বুক করুন'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
