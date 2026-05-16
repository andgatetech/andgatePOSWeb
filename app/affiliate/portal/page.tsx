'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    useGetPortalDashboardQuery,
    useGetPortalConversionsQuery,
    useGetPortalLedgerQuery,
    useGetPortalPayoutsQuery,
    useRequestPortalPayoutMutation,
    useBookPortalDemoMutation,
    useGetPortalDemoBookingsQuery,
    useGetPortalSubAffiliatesQuery,
    useLogoutAffiliateMutation,
    getAffiliateToken,
    removeAffiliateToken,
} from '@/store/features/affiliate/affiliatePortalApi';
import { TrendingUp, Users, Wallet, MousePointerClick, LogOut, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

type Tab = 'overview' | 'conversions' | 'ledger' | 'payouts' | 'demos' | 'sub-affiliates';

export default function AffiliatePortalPage() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>('overview');
    const [showPayoutForm, setShowPayoutForm] = useState(false);
    const [showDemoForm, setShowDemoForm] = useState(false);
    const [payoutData, setPayoutData] = useState({ method: 'bkash', account_number: '' });
    const [demoData, setDemoData] = useState({ prospect_name: '', prospect_mobile: '', prospect_business: '', location: '', scheduled_at: '', notes: '' });

    // Guard: redirect to login if no affiliate token
    useEffect(() => {
        if (!getAffiliateToken()) router.replace('/affiliate/login');
    }, [router]);

    const { data: dashData, isLoading } = useGetPortalDashboardQuery();
    const { data: conversions } = useGetPortalConversionsQuery({ page: 1 }, { skip: tab !== 'conversions' });
    const { data: ledger }      = useGetPortalLedgerQuery({ page: 1 }, { skip: tab !== 'ledger' });
    const { data: payouts }     = useGetPortalPayoutsQuery({ page: 1 }, { skip: tab !== 'payouts' });
    const { data: demos }          = useGetPortalDemoBookingsQuery({ page: 1 }, { skip: tab !== 'demos' });
    const { data: subAffiliates }  = useGetPortalSubAffiliatesQuery({ page: 1 }, { skip: tab !== 'sub-affiliates' });

    const [requestPayout, { isLoading: payoutLoading, isSuccess: payoutSuccess, error: payoutError }] = useRequestPortalPayoutMutation();
    const [bookDemo, { isLoading: demoLoading, isSuccess: demoSuccess, error: demoError }] = useBookPortalDemoMutation();
    const [logoutAffiliate] = useLogoutAffiliateMutation();

    const stats = dashData?.data;

    const TABS: { key: Tab; label: string }[] = [
        { key: 'overview',        label: 'ওভারভিউ' },
        { key: 'conversions',     label: 'কনভার্সন' },
        { key: 'ledger',          label: 'কমিশন লেজার' },
        { key: 'payouts',         label: 'পেআউট' },
        { key: 'demos',           label: 'ডেমো বুকিং' },
        { key: 'sub-affiliates',  label: 'সাব-পার্টনার' },
    ];

    const handleLogout = async () => {
        try { await logoutAffiliate().unwrap(); } catch {}
        removeAffiliateToken();
        router.push('/affiliate');
    };

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
                <p className="text-slate-600">ড্যাশবোর্ড লোড হয়নি।</p>
                <a href="/affiliate/login" className="mt-4 inline-block rounded-xl bg-primary text-white px-6 py-2 font-semibold">লগইন করুন</a>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">পার্টনার ড্যাশবোর্ড</h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="rounded-full bg-primary/10 text-primary px-3 py-0.5 text-sm font-semibold">{stats.tier}</span>
                        <span className="text-slate-500 text-sm">কোড: <strong className="text-slate-800">{stats.code}</strong></span>
                        {stats.promo_code && <span className="text-slate-500 text-sm">প্রোমো: <strong className="text-slate-800">{stats.promo_code}</strong></span>}
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setShowDemoForm(true)} className="rounded-xl border border-primary text-primary px-4 py-2 text-sm font-semibold hover:bg-primary/5">
                        + ডেমো বুক
                    </button>
                    <button onClick={() => setShowPayoutForm(true)} className="rounded-xl bg-primary text-white px-4 py-2 text-sm font-semibold hover:opacity-90">
                        পেআউট
                    </button>
                    <button onClick={handleLogout} className="rounded-xl border border-slate-200 text-slate-500 px-3 py-2 text-sm hover:bg-slate-50">
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { icon: MousePointerClick, label: 'মোট ক্লিক',      value: stats.total_clicks,       color: 'text-blue-500' },
                    { icon: Users,             label: 'সক্রিয় কাস্টমার', value: stats.active_customers,   color: 'text-success' },
                    { icon: Wallet,            label: 'ব্যালেন্স',        value: `৳${Number(stats.balance).toFixed(0)}`,      color: 'text-warning' },
                    { icon: TrendingUp,        label: 'মোট আয়',          value: `৳${Number(stats.total_earned).toFixed(0)}`,  color: 'text-primary' },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
                        <Icon className={`h-5 w-5 mb-2 ${color}`} />
                        <div className="text-xl font-bold">{value}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                    </div>
                ))}
            </div>

            {/* Referral link + Register CTA */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Referral link copy */}
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex flex-col gap-3">
                    <div>
                        <div className="text-xs text-slate-500 mb-1">আপনার রেফারেল লিংক</div>
                        <div className="text-sm font-mono text-slate-800 break-all" lang="en" dir="ltr" translate="no">
                            {typeof window !== 'undefined' ? `${window.location.origin}/?ref=${stats.code}` : `/?ref=${stats.code}`}
                        </div>
                    </div>
                    <button
                        onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/?ref=${stats.code}`)}
                        className="w-full rounded-lg bg-primary text-white px-4 py-2 text-xs font-semibold hover:opacity-90"
                    >
                        লিংক কপি করুন
                    </button>
                </div>

                {/* Direct shop registration CTA */}
                <div className="rounded-xl bg-success/5 border border-success/20 p-4 flex flex-col gap-3">
                    <div>
                        <div className="text-xs font-semibold text-success mb-1">🏪 সরাসরি শপ রেজিস্ট্রেশন</div>
                        <div className="text-xs text-slate-500">
                            কোনো প্রসপেক্টকে সাথে বসিয়ে এখনই রেজিস্ট্রেশন করুন — কমিশন অটো ট্র্যাক হবে।
                        </div>
                    </div>
                    <a
                        href={`/register?ref=${stats.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center rounded-lg bg-success text-white px-4 py-2 text-xs font-semibold hover:opacity-90 transition"
                    >
                        রেজিস্ট্রেশন ফর্ম খুলুন →
                    </a>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 mb-4">
                {TABS.map(({ key, label }) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${tab === key ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
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
                                <tr>{['কাস্টমার', 'প্ল্যান', 'স্ট্যাটাস', 'কনভার্ট', 'পরিমাণ'].map(h => <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
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
                                <tr>{['তারিখ', 'ধরন', 'পরিমাণ', 'স্ট্যাটাস', 'নোট'].map(h => <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
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
                                <tr>{['তারিখ', 'পরিমাণ', 'মাধ্যম', 'একাউন্ট', 'TrxID', 'স্ট্যাটাস'].map(h => <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payouts?.data?.data?.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-500">{new Date(p.created_at).toLocaleDateString('bn-BD')}</td>
                                        <td className="px-4 py-3 font-bold text-success">৳{p.amount}</td>
                                        <td className="px-4 py-3 uppercase text-xs">{p.method}</td>
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
                                <tr>{['সম্ভাব্য কাস্টমার', 'মোবাইল', 'ব্যবসা', 'তারিখ', 'স্ট্যাটাস', 'ইনসেন্টিভ'].map(h => <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
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

                {tab === 'sub-affiliates' && (
                    <div>
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                            <p className="text-sm text-slate-600">
                                আপনার রেফারেল কোড <strong className="text-primary">{stats.code}</strong> দিয়ে রেজিস্ট্রেশন করা পার্টনারদের তালিকা।
                                {' '}<span className="text-xs text-slate-400">প্লাটিনাম পার্টনাররা সাব-পার্টনারের প্রতিটি বিক্রিতে +৫% ওভাররাইড পান।</span>
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                    <tr>{['নাম', 'কোড', 'টায়ার', 'সক্রিয় রেফারেল', 'মোট আয়', 'যোগদান'].map(h => <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {subAffiliates?.data?.data?.map((s: any) => (
                                        <tr key={s.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium">{s.name}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.code}</td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">{s.tier ?? '—'}</span>
                                            </td>
                                            <td className="px-4 py-3">{s.active_referrals}</td>
                                            <td className="px-4 py-3 font-semibold text-success">৳{Number(s.total_earned).toFixed(0)}</td>
                                            <td className="px-4 py-3 text-slate-400 text-xs">{s.joined_at}</td>
                                        </tr>
                                    )) ?? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-10 text-center">
                                                <div className="text-slate-400 text-sm">এখনো কোনো সাব-পার্টনার নেই</div>
                                                <div className="text-xs text-slate-400 mt-1">আপনার রেফারেল কোড শেয়ার করুন — নতুন পার্টনার রেজিস্ট্রেশনে আপনার কোড দিলে তারা আপনার সাব-পার্টনার হবেন</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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
                                    { label: 'মোবাইল নম্বর *',           key: 'prospect_mobile', placeholder: '01XXXXXXXXX' },
                                    { label: 'ব্যবসার ধরন',              key: 'prospect_business', placeholder: 'যেমন: ফার্মেসি, কাপড়ের দোকান' },
                                    { label: 'লোকেশন',                   key: 'location', placeholder: 'মিরপুর-১০, ঢাকা' },
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

            {/* Floating WhatsApp support button */}
            <a
                href={`https://wa.me/8801577303608?text=${encodeURIComponent(`আমি andgatePOS পার্টনার (কোড: ${stats.code})। আমার একটু সাহায্য দরকার।`)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp-এ সাহায্য নিন"
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 rounded-full bg-[#25d366] text-white px-4 py-3 shadow-lg hover:bg-[#1da851] transition-all hover:scale-105"
            >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-sm font-semibold">সাহায্য</span>
            </a>
        </div>
    );
}
