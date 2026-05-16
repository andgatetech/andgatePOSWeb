'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    useGetAdminStatsQuery,
    useGetAdminMembersQuery,
    useApproveAdminMemberMutation,
    useSuspendAdminMemberMutation,
    useGetAdminLedgerQuery,
    useLockAdminCommissionsMutation,
    useGetAdminPayoutsQuery,
    useTriggerAdminPayoutMutation,
    useMarkAdminPayoutFailedMutation,
    useGetAdminDemoBookingsQuery,
    useCompleteAdminDemoBookingMutation,
    useRunAdminTierProgressionMutation,
    useAddAdminBonusMutation,
    useLogoutAffiliateAdminMutation,
    getAffiliateAdminToken,
    removeAffiliateAdminToken,
} from '@/store/features/affiliate/affiliateAdminApi';

type AdminTab = 'overview' | 'members' | 'ledger' | 'payouts' | 'demos';

export default function AffiliateAdminPage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!getAffiliateAdminToken()) {
            router.replace('/affiliate/admin/login');
        } else {
            setReady(true);
        }
    }, [router]);

    if (!ready) return null;
    return <AdminDashboard />;
}

function AdminDashboard() {
    const router = useRouter();
    const [tab, setTab] = useState<AdminTab>('overview');
    const [memberSearch, setMemberSearch] = useState('');
    const [memberStatus, setMemberStatus] = useState('');
    const [payoutModal, setPayoutModal] = useState<{ id: number; name: string } | null>(null);
    const [payoutForm, setPayoutForm] = useState({ method: 'bkash', account_number: '', transaction_id: '' });
    const [bonusModal, setBonusModal] = useState<{ id: number; name: string } | null>(null);
    const [bonusForm, setBonusForm] = useState({ amount: '', note: '' });

    const { data: statsData, refetch: refetchStats } = useGetAdminStatsQuery();
    const { data: membersData, refetch: refetchMembers } = useGetAdminMembersQuery({ search: memberSearch, status: memberStatus });
    const { data: ledgerData }  = useGetAdminLedgerQuery({}, { skip: tab !== 'ledger' });
    const { data: payoutsData } = useGetAdminPayoutsQuery({}, { skip: tab !== 'payouts' });
    const { data: demosData }   = useGetAdminDemoBookingsQuery({}, { skip: tab !== 'demos' });

    const [approveMember]       = useApproveAdminMemberMutation();
    const [suspendMember]       = useSuspendAdminMemberMutation();
    const [lockCommissions, { isLoading: locking }] = useLockAdminCommissionsMutation();
    const [triggerPayout, { isLoading: payingOut }] = useTriggerAdminPayoutMutation();
    const [markFailed]          = useMarkAdminPayoutFailedMutation();
    const [completeDemo]        = useCompleteAdminDemoBookingMutation();
    const [runTierProgression, { isLoading: progressionRunning }] = useRunAdminTierProgressionMutation();
    const [addBonus, { isLoading: bonusLoading }] = useAddAdminBonusMutation();
    const [logoutAdmin]         = useLogoutAffiliateAdminMutation();

    const stats = statsData?.data;

    const handleLogout = async () => {
        try { await logoutAdmin().unwrap(); } catch {}
        removeAffiliateAdminToken();
        router.push('/affiliate/admin/login');
    };

    const TABS: { key: AdminTab; label: string }[] = [
        { key: 'overview', label: 'ওভারভিউ' },
        { key: 'members',  label: 'মেম্বার' },
        { key: 'ledger',   label: 'লেজার' },
        { key: 'payouts',  label: 'পেআউট' },
        { key: 'demos',    label: 'ডেমো' },
    ];

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl font-bold">অ্যাফিলিয়েট অ্যাডমিন</h1>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => runTierProgression().then(() => refetchMembers())}
                        disabled={progressionRunning}
                        className="rounded-xl border border-primary text-primary px-4 py-2 text-sm font-semibold hover:bg-primary/5 disabled:opacity-50"
                    >
                        {progressionRunning ? 'চলছে...' : 'টায়ার আপগ্রেড চালান'}
                    </button>
                    <button
                        onClick={() => lockCommissions().then(() => refetchStats())}
                        disabled={locking}
                        className="rounded-xl bg-primary text-white px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                        {locking ? 'লক হচ্ছে...' : 'কমিশন লক করুন'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="rounded-xl border border-danger/30 text-danger px-4 py-2 text-sm font-semibold hover:bg-danger/5"
                    >
                        লগআউট
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'মোট অ্যাফিলিয়েট', value: stats.total_affiliates, color: 'text-primary' },
                        { label: 'সক্রিয়', value: stats.active_affiliates, color: 'text-success' },
                        { label: 'অ্যাপ্রুভাল মুলতুবি', value: stats.pending_approval, color: 'text-warning' },
                        { label: 'মুলতুবি পেআউট', value: `৳${Number(stats.pending_payout).toFixed(0)}`, color: 'text-danger' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
                            <div className={`text-xl font-bold ${color}`}>{value}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tier breakdown */}
            {stats?.tiers && (
                <div className="mb-6 flex flex-wrap gap-2">
                    {stats.tiers.map((t: any) => (
                        <div key={t.name} className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm flex items-center gap-2">
                            <span className="font-semibold">{t.label}</span>
                            <span className="text-slate-500">{t.members_count} জন</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 mb-4">
                {TABS.map(({ key, label }) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${tab === key ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        {label}
                    </button>
                ))}
            </div>

            <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">

                {/* Members tab */}
                {tab === 'members' && (
                    <>
                        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
                            <input value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)}
                                placeholder="নাম, মোবাইল বা কোড দিয়ে খুঁজুন..."
                                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                            <select value={memberStatus} onChange={(e) => setMemberStatus(e.target.value)}
                                className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                <option value="">সব স্ট্যাটাস</option>
                                <option value="active">সক্রিয়</option>
                                <option value="pending">মুলতুবি</option>
                                <option value="suspended">স্থগিত</option>
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                    <tr>{['নাম', 'মোবাইল', 'কোড', 'টায়ার', 'রেফারেল', 'ব্যালেন্স', 'স্ট্যাটাস', 'অ্যাকশন'].map(h => <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {membersData?.data?.data?.map((m: any) => (
                                        <tr key={m.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium">{m.name}</td>
                                            <td className="px-4 py-3 text-slate-500">{m.mobile}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{m.code}</td>
                                            <td className="px-4 py-3">{m.tier?.label}</td>
                                            <td className="px-4 py-3">{m.active_referrals_count}</td>
                                            <td className="px-4 py-3 font-semibold text-success">৳{Number(m.balance).toFixed(0)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${m.status === 'active' ? 'bg-success/10 text-success' : m.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                                                    {m.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1 flex-wrap">
                                                    {m.status === 'pending' && (
                                                        <button onClick={() => approveMember({ id: m.id }).then(() => refetchMembers())}
                                                            className="rounded bg-success/10 text-success px-2 py-1 text-xs font-semibold hover:bg-success/20">অ্যাপ্রুভ</button>
                                                    )}
                                                    {m.status === 'active' && (
                                                        <>
                                                            <button onClick={() => suspendMember(m.id).then(() => refetchMembers())}
                                                                className="rounded bg-danger/10 text-danger px-2 py-1 text-xs font-semibold hover:bg-danger/20">স্থগিত</button>
                                                            <button onClick={() => { setPayoutModal({ id: m.id, name: m.name }); setPayoutForm({ method: 'bkash', account_number: m.bkash_number ?? '', transaction_id: '' }); }}
                                                                className="rounded bg-primary/10 text-primary px-2 py-1 text-xs font-semibold hover:bg-primary/20">পেআউট</button>
                                                            <button onClick={() => { setBonusModal({ id: m.id, name: m.name }); setBonusForm({ amount: '', note: '' }); }}
                                                                className="rounded bg-warning/10 text-warning px-2 py-1 text-xs font-semibold hover:bg-warning/20">বোনাস</button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) ?? <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">কোনো মেম্বার নেই</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Ledger tab */}
                {tab === 'ledger' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>{['তারিখ', 'অ্যাফিলিয়েট', 'ধরন', 'পরিমাণ', 'স্ট্যাটাস', 'লক তারিখ'].map(h => <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {ledgerData?.data?.data?.map((e: any) => (
                                    <tr key={e.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-500 text-xs">{new Date(e.created_at).toLocaleDateString('bn-BD')}</td>
                                        <td className="px-4 py-3 font-medium">{e.affiliate?.name}</td>
                                        <td className="px-4 py-3 text-xs">{e.type}</td>
                                        <td className={`px-4 py-3 font-semibold ${Number(e.amount) < 0 ? 'text-danger' : 'text-success'}`}>
                                            ৳{e.amount}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${e.status === 'locked' ? 'bg-success/10 text-success' : e.status === 'paid' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                                                {e.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{e.lock_at ? new Date(e.lock_at).toLocaleDateString('bn-BD') : '—'}</td>
                                    </tr>
                                )) ?? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">কোনো এন্ট্রি নেই</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Payouts tab */}
                {tab === 'payouts' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>{['তারিখ', 'অ্যাফিলিয়েট', 'পরিমাণ', 'মাধ্যম', 'একাউন্ট', 'TrxID', 'স্ট্যাটাস', 'অ্যাকশন'].map(h => <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payoutsData?.data?.data?.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString('bn-BD')}</td>
                                        <td className="px-4 py-3 font-medium">{p.affiliate?.name}</td>
                                        <td className="px-4 py-3 font-bold text-success">৳{p.amount}</td>
                                        <td className="px-4 py-3 uppercase text-xs">{p.method}</td>
                                        <td className="px-4 py-3 text-slate-500">{p.account_number}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.transaction_id ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === 'completed' ? 'bg-success/10 text-success' : p.status === 'processing' ? 'bg-warning/10 text-warning' : 'bg-slate-100 text-slate-500'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {p.status === 'processing' && (
                                                <button onClick={() => markFailed({ payoutId: p.id })}
                                                    className="rounded bg-danger/10 text-danger px-2 py-1 text-xs font-semibold hover:bg-danger/20">ব্যর্থ</button>
                                            )}
                                        </td>
                                    </tr>
                                )) ?? <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">কোনো পেআউট নেই</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Demo bookings tab */}
                {tab === 'demos' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>{['অ্যাফিলিয়েট', 'কাস্টমার', 'মোবাইল', 'ব্যবসা', 'তারিখ', 'স্ট্যাটাস', 'অ্যাকশন'].map(h => <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {demosData?.data?.data?.map((d: any) => (
                                    <tr key={d.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium">{d.affiliate?.name}</td>
                                        <td className="px-4 py-3">{d.prospect_name}</td>
                                        <td className="px-4 py-3 text-slate-500">{d.prospect_mobile}</td>
                                        <td className="px-4 py-3 text-slate-500">{d.prospect_business ?? '—'}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{d.scheduled_at ? new Date(d.scheduled_at).toLocaleDateString('bn-BD') : '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${d.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {d.status === 'scheduled' && (
                                                <button onClick={() => completeDemo(d.id)}
                                                    className="rounded bg-success/10 text-success px-2 py-1 text-xs font-semibold hover:bg-success/20">সম্পন্ন ✓</button>
                                            )}
                                        </td>
                                    </tr>
                                )) ?? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">কোনো ডেমো নেই</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Overview tab */}
                {tab === 'overview' && stats && (
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                ['মোট কনভার্সন', stats.total_conversions],
                                ['সক্রিয় কাস্টমার', stats.active_customers],
                                ['মোট পেইড আউট', `৳${Number(stats.total_paid_out).toFixed(0)}`],
                                ['মুলতুবি পেআউট', `৳${Number(stats.pending_payout).toFixed(0)}`],
                            ].map(([label, value]) => (
                                <div key={String(label)} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                                    <span className="text-sm text-slate-600">{label}</span>
                                    <span className="font-bold text-lg">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'overview' && !stats && (
                    <div className="p-12 text-center text-slate-400">লোড হচ্ছে...</div>
                )}
            </div>

            {/* Payout trigger modal */}
            {payoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">পেআউট — {payoutModal.name}</h3>
                            <button onClick={() => setPayoutModal(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">মাধ্যম</label>
                                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={payoutForm.method}
                                    onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })}>
                                    <option value="bkash">bKash</option>
                                    <option value="nagad">Nagad</option>
                                    <option value="bank">Bank</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">একাউন্ট নম্বর</label>
                                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={payoutForm.account_number}
                                    onChange={(e) => setPayoutForm({ ...payoutForm, account_number: e.target.value })} placeholder="01XXXXXXXXX" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">ট্রানজেকশন ID (ঐচ্ছিক)</label>
                                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={payoutForm.transaction_id}
                                    onChange={(e) => setPayoutForm({ ...payoutForm, transaction_id: e.target.value })} placeholder="TrxID123" />
                            </div>
                            <button disabled={payingOut || !payoutForm.account_number}
                                onClick={() => triggerPayout({ affiliateId: payoutModal.id, ...payoutForm }).then(() => { setPayoutModal(null); refetchStats(); refetchMembers(); })}
                                className="w-full rounded-xl bg-primary text-white font-bold py-3 hover:opacity-90 disabled:opacity-50">
                                {payingOut ? 'প্রসেস হচ্ছে...' : 'পেআউট নিশ্চিত করুন'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bonus modal */}
            {bonusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">বোনাস — {bonusModal.name}</h3>
                            <button onClick={() => setBonusModal(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">পরিমাণ (৳)</label>
                                <input type="number" min="1" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={bonusForm.amount}
                                    onChange={(e) => setBonusForm({ ...bonusForm, amount: e.target.value })} placeholder="500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">কারণ</label>
                                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={bonusForm.note}
                                    onChange={(e) => setBonusForm({ ...bonusForm, note: e.target.value })} placeholder="ঈদ বোনাস" />
                            </div>
                            <button disabled={bonusLoading || !bonusForm.amount}
                                onClick={() => addBonus({ affiliateId: bonusModal.id, amount: Number(bonusForm.amount), note: bonusForm.note }).then(() => { setBonusModal(null); refetchStats(); refetchMembers(); })}
                                className="w-full rounded-xl bg-warning text-white font-bold py-3 hover:opacity-90 disabled:opacity-50">
                                {bonusLoading ? 'যোগ হচ্ছে...' : 'বোনাস যোগ করুন'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
