'use client';

import { useState } from 'react';
import { Users, TrendingUp, Wallet, CalendarCheck, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import {
    useGetAffiliateStatsQuery,
    useGetAffiliateMembersQuery,
    useApproveAffiliateMemberMutation,
    useSuspendAffiliateMemberMutation,
    useGetAdminAffiliatePayoutsQuery,
    useMarkAffiliatePayoutFailedMutation,
    useGetAdminDemoBookingsQuery,
    useCompleteDemoBookingMutation,
    useRunAffiliateTierProgressionMutation,
    useLockAffiliateCommissionsMutation,
} from '@/store/features/affiliate/affiliateApi';
import { getTranslation } from '@/i18n';

type Tab = 'overview' | 'members' | 'payouts' | 'demos';
type MemberStatus = '' | 'pending' | 'active' | 'suspended';
type PayoutStatus = '' | 'pending' | 'paid' | 'failed';

const statusBadge = (status: string, label: string) => {
    const map: Record<string, string> = {
        active: 'bg-success/20 text-success',
        pending: 'bg-warning/20 text-warning',
        suspended: 'bg-danger/20 text-danger',
        paid: 'bg-success/20 text-success',
        failed: 'bg-danger/20 text-danger',
        completed: 'bg-success/20 text-success',
        booked: 'bg-primary/20 text-primary',
        locked: 'bg-success/20 text-success',
        unlocked: 'bg-warning/20 text-warning',
    };
    return (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {label}
        </span>
    );
};

export default function AffiliateAdminPage() {
    const { i18n } = getTranslation();
    const isBn = i18n.language === 'bn';
    const L = isBn ? {
        title: 'অ্যাফিলিয়েট অ্যাডমিন',
        lockCommissions: 'কমিশন লক করুন',
        runTierProgression: 'টিয়ার আপডেট করুন',
        overview: 'ওভারভিউ',
        members: 'মেম্বার',
        payouts: 'পেআউট',
        demoBookings: 'ডেমো বুকিং',
        totalMembers: 'মোট মেম্বার',
        pendingMembers: 'পেন্ডিং মেম্বার',
        pendingPayouts: 'পেন্ডিং পেআউট',
        pendingDemos: 'পেন্ডিং ডেমো',
        pendingApprovals: 'অনুমোদনের অপেক্ষায়',
        name: 'নাম',
        email: 'ইমেইল',
        phone: 'মোবাইল',
        joined: 'যোগ দিয়েছেন',
        action: 'অ্যাকশন',
        actions: 'অ্যাকশন',
        noPendingApprovals: 'অনুমোদনের অপেক্ষায় কেউ নেই',
        approve: 'অনুমোদন',
        searchMember: 'নাম বা ইমেইল দিয়ে খুঁজুন...',
        allStatus: 'সব অবস্থা',
        pending: 'পেন্ডিং',
        active: 'একটিভ',
        suspended: 'সাসপেন্ড',
        paid: 'পেইড',
        failed: 'ফেইলড',
        booked: 'বুকড',
        completed: 'সম্পন্ন',
        cancelled: 'বাতিল',
        tier: 'টিয়ার',
        referrals: 'রেফারেল',
        balance: 'ব্যালেন্স',
        status: 'অবস্থা',
        noMembers: 'কোনো মেম্বার পাওয়া যায়নি',
        suspend: 'সাসপেন্ড',
        reactivate: 'আবার চালু',
        previous: 'আগে',
        next: 'পরের',
        page: 'পৃষ্ঠা',
        of: 'এর মধ্যে',
        memberCount: 'মেম্বার',
        payoutCount: 'পেআউট',
        bookingCount: 'বুকিং',
        member: 'মেম্বার',
        amount: 'টাকা',
        method: 'মাধ্যম',
        account: 'অ্যাকাউন্ট',
        requested: 'রিকোয়েস্ট',
        noPayouts: 'কোনো পেআউট পাওয়া যায়নি',
        markFailed: 'ফেইলড মার্ক করুন',
        affiliate: 'অ্যাফিলিয়েট',
        prospect: 'সম্ভাব্য কাস্টমার',
        mobile: 'মোবাইল',
        business: 'ব্যবসা',
        scheduled: 'সময়',
        noDemoBookings: 'কোনো ডেমো বুকিং পাওয়া যায়নি',
        complete: 'সম্পন্ন',
    } : {
        title: 'Affiliate Admin Panel',
        lockCommissions: 'Lock commissions',
        runTierProgression: 'Run tier progression',
        overview: 'Overview',
        members: 'Members',
        payouts: 'Payouts',
        demoBookings: 'Demo bookings',
        totalMembers: 'Total members',
        pendingMembers: 'Pending members',
        pendingPayouts: 'Pending payouts',
        pendingDemos: 'Pending demos',
        pendingApprovals: 'Pending approvals',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        joined: 'Joined',
        action: 'Action',
        actions: 'Actions',
        noPendingApprovals: 'No pending approvals',
        approve: 'Approve',
        searchMember: 'Search by name or email...',
        allStatus: 'All status',
        pending: 'Pending',
        active: 'Active',
        suspended: 'Suspended',
        paid: 'Paid',
        failed: 'Failed',
        booked: 'Booked',
        completed: 'Completed',
        cancelled: 'Cancelled',
        tier: 'Tier',
        referrals: 'Referrals',
        balance: 'Balance',
        status: 'Status',
        noMembers: 'No members found',
        suspend: 'Suspend',
        reactivate: 'Reactivate',
        previous: 'Previous',
        next: 'Next',
        page: 'Page',
        of: 'of',
        memberCount: 'members',
        payoutCount: 'payouts',
        bookingCount: 'bookings',
        member: 'Member',
        amount: 'Amount',
        method: 'Method',
        account: 'Account',
        requested: 'Requested',
        noPayouts: 'No payouts found',
        markFailed: 'Mark failed',
        affiliate: 'Affiliate',
        prospect: 'Prospect',
        mobile: 'Mobile',
        business: 'Business',
        scheduled: 'Scheduled',
        noDemoBookings: 'No demo bookings found',
        complete: 'Complete',
    };
    const statusLabel = (status: string) => (L as Record<string, string>)[status] ?? status;
    const [tab, setTab] = useState<Tab>('overview');
    const [memberStatus, setMemberStatus] = useState<MemberStatus>('');
    const [memberSearch, setMemberSearch] = useState('');
    const [memberPage, setMemberPage] = useState(1);
    const [payoutStatus, setPayoutStatus] = useState<PayoutStatus>('');
    const [payoutPage, setPayoutPage] = useState(1);
    const [demoStatus, setDemoStatus] = useState('');
    const [demoPage, setDemoPage] = useState(1);

    const { data: statsData, isLoading: statsLoading } = useGetAffiliateStatsQuery();
    const { data: membersData, isLoading: membersLoading } = useGetAffiliateMembersQuery(
        { page: memberPage, status: memberStatus || undefined, search: memberSearch || undefined },
        { skip: tab !== 'members' && tab !== 'overview' }
    );
    const { data: payoutsData, isLoading: payoutsLoading } = useGetAdminAffiliatePayoutsQuery(
        { page: payoutPage, status: payoutStatus || undefined },
        { skip: tab !== 'payouts' }
    );
    const { data: demosData, isLoading: demosLoading } = useGetAdminDemoBookingsQuery(
        { page: demoPage, status: demoStatus || undefined },
        { skip: tab !== 'demos' }
    );

    const [approveMember] = useApproveAffiliateMemberMutation();
    const [suspendMember] = useSuspendAffiliateMemberMutation();
    const [markPayoutFailed] = useMarkAffiliatePayoutFailedMutation();
    const [completeDemo] = useCompleteDemoBookingMutation();
    const [runTierProgression, { isLoading: tierLoading }] = useRunAffiliateTierProgressionMutation();
    const [lockCommissions, { isLoading: lockLoading }] = useLockAffiliateCommissionsMutation();

    const stats = statsData?.data ?? statsData;

    const handleApprove = async (id: number, name: string) => {
        const confirmed = await showConfirmDialog(`Approve ${name}?`, 'This will activate their affiliate account.');
        if (!confirmed) return;
        try {
            await approveMember({ id }).unwrap();
            showSuccessDialog('Approved', `${name} has been approved.`, 'OK');
        } catch (e: any) {
            showErrorDialog('Error', e?.data?.message ?? 'Failed to approve member');
        }
    };

    const handleSuspend = async (id: number, name: string) => {
        const confirmed = await showConfirmDialog(`Suspend ${name}?`, 'They will lose access to the affiliate portal.');
        if (!confirmed) return;
        try {
            await suspendMember(id).unwrap();
            showSuccessDialog('Suspended', `${name} has been suspended.`, 'OK');
        } catch (e: any) {
            showErrorDialog('Error', e?.data?.message ?? 'Failed to suspend member');
        }
    };

    const handleMarkPayoutFailed = async (payoutId: number) => {
        const confirmed = await showConfirmDialog('Mark as Failed?', 'This will mark the payout as failed and refund the commission balance.');
        if (!confirmed) return;
        try {
            await markPayoutFailed({ payoutId }).unwrap();
            showSuccessDialog('Marked Failed', 'Payout has been marked as failed.', 'OK');
        } catch (e: any) {
            showErrorDialog('Error', e?.data?.message ?? 'Failed to update payout');
        }
    };

    const handleCompleteDemo = async (id: number) => {
        const confirmed = await showConfirmDialog('Mark Demo Complete?', 'This will mark the demo booking as completed and credit the affiliate\'s commission.');
        if (!confirmed) return;
        try {
            await completeDemo(id).unwrap();
            showSuccessDialog('Completed', 'Demo booking marked as completed.', 'OK');
        } catch (e: any) {
            showErrorDialog('Error', e?.data?.message ?? 'Failed to complete demo');
        }
    };

    const handleTierProgression = async () => {
        const confirmed = await showConfirmDialog('Run Tier Progression?', 'This will recalculate tiers for all active affiliates based on current performance.');
        if (!confirmed) return;
        try {
            await runTierProgression().unwrap();
            showSuccessDialog('Done', 'Tier progression completed successfully.', 'OK');
        } catch (e: any) {
            showErrorDialog('Error', e?.data?.message ?? 'Failed to run tier progression');
        }
    };

    const handleLockCommissions = async () => {
        const confirmed = await showConfirmDialog('Lock Commissions?', 'This will lock all pending commissions older than 30 days and make them eligible for payout.');
        if (!confirmed) return;
        try {
            await lockCommissions().unwrap();
            showSuccessDialog('Locked', 'Eligible commissions have been locked for payout.', 'OK');
        } catch (e: any) {
            showErrorDialog('Error', e?.data?.message ?? 'Failed to lock commissions');
        }
    };

    const members = membersData?.data?.data ?? membersData?.data ?? [];
    const membersMeta = membersData?.data?.meta ?? membersData?.meta;
    const payouts = payoutsData?.data?.data ?? payoutsData?.data ?? [];
    const payoutsMeta = payoutsData?.data?.meta ?? payoutsData?.meta;
    const demos = demosData?.data?.data ?? demosData?.data ?? [];
    const demosMeta = demosData?.data?.meta ?? demosData?.meta;

    const tabCls = (t: Tab) =>
        `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`;

    return (
        <div className="pt-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h5 className="text-lg font-semibold dark:text-white-light">{L.title}</h5>
                <div className="flex gap-2">
                    <button
                        onClick={handleLockCommissions}
                        disabled={lockLoading}
                        className="btn btn-outline-success btn-sm flex items-center gap-1"
                    >
                        {lockLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        {L.lockCommissions}
                    </button>
                    <button
                        onClick={handleTierProgression}
                        disabled={tierLoading}
                        className="btn btn-outline-primary btn-sm flex items-center gap-1"
                    >
                        {tierLoading ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                        {L.runTierProgression}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-5 border-b border-[#ebedf2] dark:border-[#191e3a]">
                <div className="flex gap-1 overflow-x-auto">
                    <button className={tabCls('overview')} onClick={() => setTab('overview')}>{L.overview}</button>
                    <button className={tabCls('members')} onClick={() => setTab('members')}>{L.members}</button>
                    <button className={tabCls('payouts')} onClick={() => setTab('payouts')}>{L.payouts}</button>
                    <button className={tabCls('demos')} onClick={() => setTab('demos')}>{L.demoBookings}</button>
                </div>
            </div>

            {/* Overview */}
            {tab === 'overview' && (
                <div>
                    {statsLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
                    ) : (
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="panel flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                                    <Users size={22} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{L.totalMembers}</p>
                                    <p className="text-2xl font-bold">{stats?.total_members ?? stats?.members_count ?? '—'}</p>
                                </div>
                            </div>
                            <div className="panel flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/20">
                                    <AlertCircle size={22} className="text-warning" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{L.pendingMembers}</p>
                                    <p className="text-2xl font-bold">{stats?.pending_members ?? stats?.pending_approvals ?? '—'}</p>
                                </div>
                            </div>
                            <div className="panel flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                                    <Wallet size={22} className="text-success" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{L.pendingPayouts}</p>
                                    <p className="text-2xl font-bold">৳{stats?.pending_payouts_amount ?? stats?.pending_payout ?? '0'}</p>
                                </div>
                            </div>
                            <div className="panel flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-info/20">
                                    <CalendarCheck size={22} className="text-info" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{L.pendingDemos}</p>
                                    <p className="text-2xl font-bold">{stats?.pending_demos ?? stats?.demo_bookings_count ?? '—'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending members quick list */}
                    <div className="panel">
                        <h6 className="mb-4 font-semibold">{L.pendingApprovals}</h6>
                        {membersLoading ? (
                            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-primary" size={24} /></div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table-striped table">
                                    <thead>
                                        <tr>
                                            <th>{L.name}</th>
                                            <th>{L.email}</th>
                                            <th>{L.phone}</th>
                                            <th>{L.joined}</th>
                                            <th className="text-center">{L.action}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.filter((m: any) => m.status === 'pending').length === 0 ? (
                                            <tr><td colSpan={5} className="py-6 text-center text-gray-400">{L.noPendingApprovals}</td></tr>
                                        ) : (
                                            members
                                                .filter((m: any) => m.status === 'pending')
                                                .map((m: any) => (
                                                    <tr key={m.id}>
                                                        <td className="font-medium">{m.name}</td>
                                                        <td>{m.email}</td>
                                                        <td>{m.mobile_number ?? m.phone ?? '—'}</td>
                                                        <td>{m.created_at ? new Date(m.created_at).toLocaleDateString('en-GB') : '—'}</td>
                                                        <td className="text-center">
                                                            <button
                                                                onClick={() => handleApprove(m.id, m.name)}
                                                                className="btn btn-success btn-sm"
                                                            >
                                                                {L.approve}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Members */}
            {tab === 'members' && (
                <div className="panel">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <input
                            type="text"
                            placeholder={L.searchMember}
                            className="form-input w-64"
                            value={memberSearch}
                            onChange={(e) => { setMemberSearch(e.target.value); setMemberPage(1); }}
                        />
                        <select
                            className="form-select w-40"
                            value={memberStatus}
                            onChange={(e) => { setMemberStatus(e.target.value as MemberStatus); setMemberPage(1); }}
                        >
                            <option value="">{L.allStatus}</option>
                            <option value="pending">{L.pending}</option>
                            <option value="active">{L.active}</option>
                            <option value="suspended">{L.suspended}</option>
                        </select>
                    </div>

                    {membersLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table-striped table">
                                    <thead>
                                        <tr>
                                            <th>{L.name}</th>
                                            <th>{L.email}</th>
                                            <th>{L.phone}</th>
                                            <th>{L.tier}</th>
                                            <th>{L.referrals}</th>
                                            <th>{L.balance}</th>
                                            <th>{L.status}</th>
                                            <th className="text-center">{L.actions}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.length === 0 ? (
                                            <tr><td colSpan={8} className="py-6 text-center text-gray-400">{L.noMembers}</td></tr>
                                        ) : (
                                            members.map((m: any) => (
                                                <tr key={m.id}>
                                                    <td className="font-medium">{m.name}</td>
                                                    <td>{m.email}</td>
                                                    <td>{m.mobile_number ?? m.phone ?? '—'}</td>
                                                    <td>
                                                        <span className="text-xs font-semibold">{m.tier?.name ?? '—'}</span>
                                                    </td>
                                                    <td className="text-center">{m.total_referrals ?? m.referrals_count ?? 0}</td>
                                                    <td>৳{Number(m.balance ?? 0).toFixed(2)}</td>
                                                    <td>{statusBadge(m.status, statusLabel(m.status))}</td>
                                                    <td>
                                                        <div className="flex justify-center gap-2">
                                                            {m.status === 'pending' && (
                                                                <button
                                                                    onClick={() => handleApprove(m.id, m.name)}
                                                                    className="btn btn-success btn-sm py-1"
                                                                >
                                                                    <CheckCircle size={14} className="mr-1 inline" />
                                                                    {L.approve}
                                                                </button>
                                                            )}
                                                            {m.status === 'active' && (
                                                                <button
                                                                    onClick={() => handleSuspend(m.id, m.name)}
                                                                    className="btn btn-danger btn-sm py-1"
                                                                >
                                                                    <XCircle size={14} className="mr-1 inline" />
                                                                    {L.suspend}
                                                                </button>
                                                            )}
                                                            {m.status === 'suspended' && (
                                                                <button
                                                                    onClick={() => handleApprove(m.id, m.name)}
                                                                    className="btn btn-outline-success btn-sm py-1"
                                                                >
                                                                    {L.reactivate}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {membersMeta && membersMeta.last_page > 1 && (
                                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                    <span>{L.page} {membersMeta.current_page} {L.of} {membersMeta.last_page} ({membersMeta.total} {L.memberCount})</span>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={memberPage <= 1}
                                            onClick={() => setMemberPage(p => p - 1)}
                                            className="btn btn-outline-primary btn-sm"
                                        >
                                            {L.previous}
                                        </button>
                                        <button
                                            disabled={memberPage >= membersMeta.last_page}
                                            onClick={() => setMemberPage(p => p + 1)}
                                            className="btn btn-outline-primary btn-sm"
                                        >
                                            {L.next}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Payouts */}
            {tab === 'payouts' && (
                <div className="panel">
                    <div className="mb-4">
                        <select
                            className="form-select w-40"
                            value={payoutStatus}
                            onChange={(e) => { setPayoutStatus(e.target.value as PayoutStatus); setPayoutPage(1); }}
                        >
                            <option value="">{L.allStatus}</option>
                            <option value="pending">{L.pending}</option>
                            <option value="paid">{L.paid}</option>
                            <option value="failed">{L.failed}</option>
                        </select>
                    </div>

                    {payoutsLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table-striped table">
                                    <thead>
                                        <tr>
                                            <th>{L.member}</th>
                                            <th>{L.amount}</th>
                                            <th>{L.method}</th>
                                            <th>{L.account}</th>
                                            <th>{L.status}</th>
                                            <th>{L.requested}</th>
                                            <th className="text-center">{L.actions}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payouts.length === 0 ? (
                                            <tr><td colSpan={7} className="py-6 text-center text-gray-400">{L.noPayouts}</td></tr>
                                        ) : (
                                            payouts.map((p: any) => (
                                                <tr key={p.id}>
                                                    <td className="font-medium">{p.affiliate?.name ?? p.affiliate_name ?? '—'}</td>
                                                    <td>৳{Number(p.amount ?? 0).toFixed(2)}</td>
                                                    <td className="capitalize">{p.method ?? p.payment_method ?? '—'}</td>
                                                    <td>{p.account_number ?? '—'}</td>
                                                    <td>{statusBadge(p.status, statusLabel(p.status))}</td>
                                                    <td>{p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : '—'}</td>
                                                    <td className="text-center">
                                                        {p.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleMarkPayoutFailed(p.id)}
                                                                className="btn btn-danger btn-sm py-1"
                                                            >
                                                                {L.markFailed}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {payoutsMeta && payoutsMeta.last_page > 1 && (
                                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                    <span>{L.page} {payoutsMeta.current_page} {L.of} {payoutsMeta.last_page} ({payoutsMeta.total} {L.payoutCount})</span>
                                    <div className="flex gap-2">
                                        <button disabled={payoutPage <= 1} onClick={() => setPayoutPage(p => p - 1)} className="btn btn-outline-primary btn-sm">{L.previous}</button>
                                        <button disabled={payoutPage >= payoutsMeta.last_page} onClick={() => setPayoutPage(p => p + 1)} className="btn btn-outline-primary btn-sm">{L.next}</button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Demo Bookings */}
            {tab === 'demos' && (
                <div className="panel">
                    <div className="mb-4">
                        <select
                            className="form-select w-40"
                            value={demoStatus}
                            onChange={(e) => { setDemoStatus(e.target.value); setDemoPage(1); }}
                        >
                            <option value="">{L.allStatus}</option>
                            <option value="booked">{L.booked}</option>
                            <option value="completed">{L.completed}</option>
                            <option value="cancelled">{L.cancelled}</option>
                        </select>
                    </div>

                    {demosLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table-striped table">
                                    <thead>
                                        <tr>
                                            <th>{L.affiliate}</th>
                                            <th>{L.prospect}</th>
                                            <th>{L.mobile}</th>
                                            <th>{L.business}</th>
                                            <th>{L.scheduled}</th>
                                            <th>{L.status}</th>
                                            <th className="text-center">{L.action}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {demos.length === 0 ? (
                                            <tr><td colSpan={7} className="py-6 text-center text-gray-400">{L.noDemoBookings}</td></tr>
                                        ) : (
                                            demos.map((d: any) => (
                                                <tr key={d.id}>
                                                    <td className="font-medium">{d.affiliate?.name ?? d.affiliate_name ?? '—'}</td>
                                                    <td>{d.prospect_name ?? '—'}</td>
                                                    <td>{d.prospect_mobile ?? '—'}</td>
                                                    <td>{d.prospect_business ?? '—'}</td>
                                                    <td>
                                                        {d.scheduled_at
                                                            ? new Date(d.scheduled_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                            : '—'}
                                                    </td>
                                                    <td>{statusBadge(d.status, statusLabel(d.status))}</td>
                                                    <td className="text-center">
                                                        {d.status === 'booked' && (
                                                            <button
                                                                onClick={() => handleCompleteDemo(d.id)}
                                                                className="btn btn-success btn-sm py-1"
                                                            >
                                                                <CheckCircle size={14} className="mr-1 inline" />
                                                                {L.complete}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {demosMeta && demosMeta.last_page > 1 && (
                                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                    <span>{L.page} {demosMeta.current_page} {L.of} {demosMeta.last_page} ({demosMeta.total} {L.bookingCount})</span>
                                    <div className="flex gap-2">
                                        <button disabled={demoPage <= 1} onClick={() => setDemoPage(p => p - 1)} className="btn btn-outline-primary btn-sm">{L.previous}</button>
                                        <button disabled={demoPage >= demosMeta.last_page} onClick={() => setDemoPage(p => p + 1)} className="btn btn-outline-primary btn-sm">{L.next}</button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
