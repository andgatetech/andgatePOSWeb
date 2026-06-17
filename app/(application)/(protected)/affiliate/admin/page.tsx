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

type Tab = 'overview' | 'members' | 'payouts' | 'demos';
type MemberStatus = '' | 'pending' | 'active' | 'suspended';
type PayoutStatus = '' | 'pending' | 'paid' | 'failed';

const statusBadge = (status: string) => {
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
            {status}
        </span>
    );
};

export default function AffiliateAdminPage() {
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
                <h5 className="text-lg font-semibold dark:text-white-light">Affiliate Admin Panel</h5>
                <div className="flex gap-2">
                    <button
                        onClick={handleLockCommissions}
                        disabled={lockLoading}
                        className="btn btn-outline-success btn-sm flex items-center gap-1"
                    >
                        {lockLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        Lock Commissions
                    </button>
                    <button
                        onClick={handleTierProgression}
                        disabled={tierLoading}
                        className="btn btn-outline-primary btn-sm flex items-center gap-1"
                    >
                        {tierLoading ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                        Run Tier Progression
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-5 border-b border-[#ebedf2] dark:border-[#191e3a]">
                <div className="flex gap-1 overflow-x-auto">
                    <button className={tabCls('overview')} onClick={() => setTab('overview')}>Overview</button>
                    <button className={tabCls('members')} onClick={() => setTab('members')}>Members</button>
                    <button className={tabCls('payouts')} onClick={() => setTab('payouts')}>Payouts</button>
                    <button className={tabCls('demos')} onClick={() => setTab('demos')}>Demo Bookings</button>
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
                                    <p className="text-sm text-gray-500">Total Members</p>
                                    <p className="text-2xl font-bold">{stats?.total_members ?? stats?.members_count ?? '—'}</p>
                                </div>
                            </div>
                            <div className="panel flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/20">
                                    <AlertCircle size={22} className="text-warning" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pending Members</p>
                                    <p className="text-2xl font-bold">{stats?.pending_members ?? stats?.pending_approvals ?? '—'}</p>
                                </div>
                            </div>
                            <div className="panel flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                                    <Wallet size={22} className="text-success" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pending Payouts</p>
                                    <p className="text-2xl font-bold">৳{stats?.pending_payouts_amount ?? stats?.pending_payout ?? '0'}</p>
                                </div>
                            </div>
                            <div className="panel flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-info/20">
                                    <CalendarCheck size={22} className="text-info" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pending Demos</p>
                                    <p className="text-2xl font-bold">{stats?.pending_demos ?? stats?.demo_bookings_count ?? '—'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending members quick list */}
                    <div className="panel">
                        <h6 className="mb-4 font-semibold">Pending Approvals</h6>
                        {membersLoading ? (
                            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-primary" size={24} /></div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table-striped table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Joined</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.filter((m: any) => m.status === 'pending').length === 0 ? (
                                            <tr><td colSpan={5} className="py-6 text-center text-gray-400">No pending approvals</td></tr>
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
                                                                Approve
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
                            placeholder="Search by name or email..."
                            className="form-input w-64"
                            value={memberSearch}
                            onChange={(e) => { setMemberSearch(e.target.value); setMemberPage(1); }}
                        />
                        <select
                            className="form-select w-40"
                            value={memberStatus}
                            onChange={(e) => { setMemberStatus(e.target.value as MemberStatus); setMemberPage(1); }}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
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
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Tier</th>
                                            <th>Referrals</th>
                                            <th>Balance</th>
                                            <th>Status</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.length === 0 ? (
                                            <tr><td colSpan={8} className="py-6 text-center text-gray-400">No members found</td></tr>
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
                                                    <td>{statusBadge(m.status)}</td>
                                                    <td>
                                                        <div className="flex justify-center gap-2">
                                                            {m.status === 'pending' && (
                                                                <button
                                                                    onClick={() => handleApprove(m.id, m.name)}
                                                                    className="btn btn-success btn-sm py-1"
                                                                >
                                                                    <CheckCircle size={14} className="mr-1 inline" />
                                                                    Approve
                                                                </button>
                                                            )}
                                                            {m.status === 'active' && (
                                                                <button
                                                                    onClick={() => handleSuspend(m.id, m.name)}
                                                                    className="btn btn-danger btn-sm py-1"
                                                                >
                                                                    <XCircle size={14} className="mr-1 inline" />
                                                                    Suspend
                                                                </button>
                                                            )}
                                                            {m.status === 'suspended' && (
                                                                <button
                                                                    onClick={() => handleApprove(m.id, m.name)}
                                                                    className="btn btn-outline-success btn-sm py-1"
                                                                >
                                                                    Reactivate
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
                                    <span>Page {membersMeta.current_page} of {membersMeta.last_page} ({membersMeta.total} members)</span>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={memberPage <= 1}
                                            onClick={() => setMemberPage(p => p - 1)}
                                            className="btn btn-outline-primary btn-sm"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            disabled={memberPage >= membersMeta.last_page}
                                            onClick={() => setMemberPage(p => p + 1)}
                                            className="btn btn-outline-primary btn-sm"
                                        >
                                            Next
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
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
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
                                            <th>Member</th>
                                            <th>Amount</th>
                                            <th>Method</th>
                                            <th>Account</th>
                                            <th>Status</th>
                                            <th>Requested</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payouts.length === 0 ? (
                                            <tr><td colSpan={7} className="py-6 text-center text-gray-400">No payouts found</td></tr>
                                        ) : (
                                            payouts.map((p: any) => (
                                                <tr key={p.id}>
                                                    <td className="font-medium">{p.affiliate?.name ?? p.affiliate_name ?? '—'}</td>
                                                    <td>৳{Number(p.amount ?? 0).toFixed(2)}</td>
                                                    <td className="capitalize">{p.method ?? p.payment_method ?? '—'}</td>
                                                    <td>{p.account_number ?? '—'}</td>
                                                    <td>{statusBadge(p.status)}</td>
                                                    <td>{p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : '—'}</td>
                                                    <td className="text-center">
                                                        {p.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleMarkPayoutFailed(p.id)}
                                                                className="btn btn-danger btn-sm py-1"
                                                            >
                                                                Mark Failed
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
                                    <span>Page {payoutsMeta.current_page} of {payoutsMeta.last_page} ({payoutsMeta.total} payouts)</span>
                                    <div className="flex gap-2">
                                        <button disabled={payoutPage <= 1} onClick={() => setPayoutPage(p => p - 1)} className="btn btn-outline-primary btn-sm">Previous</button>
                                        <button disabled={payoutPage >= payoutsMeta.last_page} onClick={() => setPayoutPage(p => p + 1)} className="btn btn-outline-primary btn-sm">Next</button>
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
                            <option value="">All Status</option>
                            <option value="booked">Booked</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
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
                                            <th>Affiliate</th>
                                            <th>Prospect</th>
                                            <th>Mobile</th>
                                            <th>Business</th>
                                            <th>Scheduled</th>
                                            <th>Status</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {demos.length === 0 ? (
                                            <tr><td colSpan={7} className="py-6 text-center text-gray-400">No demo bookings found</td></tr>
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
                                                    <td>{statusBadge(d.status)}</td>
                                                    <td className="text-center">
                                                        {d.status === 'booked' && (
                                                            <button
                                                                onClick={() => handleCompleteDemo(d.id)}
                                                                className="btn btn-success btn-sm py-1"
                                                            >
                                                                <CheckCircle size={14} className="mr-1 inline" />
                                                                Complete
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
                                    <span>Page {demosMeta.current_page} of {demosMeta.last_page} ({demosMeta.total} bookings)</span>
                                    <div className="flex gap-2">
                                        <button disabled={demoPage <= 1} onClick={() => setDemoPage(p => p - 1)} className="btn btn-outline-primary btn-sm">Previous</button>
                                        <button disabled={demoPage >= demosMeta.last_page} onClick={() => setDemoPage(p => p + 1)} className="btn btn-outline-primary btn-sm">Next</button>
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
