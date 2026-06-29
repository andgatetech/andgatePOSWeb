'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    useGetPortalDashboardQuery,
    useGetPortalConversionsQuery,
    useGetPortalLedgerQuery,
    useGetPortalPayoutsQuery,
    useRequestPortalPayoutMutation,
    useBookPortalDemoMutation,
    useGetPortalDemoBookingsQuery,
    useGetPortalSubAffiliatesQuery,
    useChangeAffiliatePasswordMutation,
    useLogoutAffiliateMutation,
    getAffiliateToken,
    removeAffiliateToken,
} from '@/store/features/affiliate/affiliatePortalApi';
import { TrendingUp, Users, Wallet, MousePointerClick, LogOut, Loader2, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { getTranslation } from '@/i18n';

type Tab = 'overview' | 'conversions' | 'ledger' | 'payouts' | 'demos' | 'referred-partners';

const toEnglishDigits = (value: string) =>
    value.replace(/[০-৯٠-٩]/g, (digit) => {
        const bn = '০১২৩৪৫৬৭৮৯'.indexOf(digit);
        if (bn >= 0) return String(bn);
        return String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit));
    });

export default function AffiliatePortalPage() {
    const { t } = getTranslation();
    const router = useRouter();
    const [tab, setTab] = useState<Tab>('overview');
    const [showPayoutForm, setShowPayoutForm] = useState(false);
    const [showDemoForm, setShowDemoForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [payoutData, setPayoutData] = useState({ method: 'bkash', account_number: '' });
    const [demoData, setDemoData] = useState({ prospect_name: '', prospect_mobile: '', prospect_business: '', location: '', scheduled_at: '', notes: '' });
    const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' });

    useEffect(() => {
        if (!getAffiliateToken()) router.replace('/affiliate/login');
    }, [router]);

    const { data: dashData, isLoading } = useGetPortalDashboardQuery();
    const { data: conversions } = useGetPortalConversionsQuery({ page: 1 }, { skip: tab !== 'conversions' });
    const { data: ledger }      = useGetPortalLedgerQuery({ page: 1 }, { skip: tab !== 'ledger' });
    const { data: payouts }     = useGetPortalPayoutsQuery({ page: 1 }, { skip: tab !== 'payouts' });
    const { data: demos }          = useGetPortalDemoBookingsQuery({ page: 1 }, { skip: tab !== 'demos' });
    const { data: subAffiliates }  = useGetPortalSubAffiliatesQuery({ page: 1 }, { skip: tab !== 'referred-partners' });

    const [requestPayout, { isLoading: payoutLoading, isSuccess: payoutSuccess, error: payoutError }] = useRequestPortalPayoutMutation();
    const [bookDemo, { isLoading: demoLoading, isSuccess: demoSuccess, error: demoError }] = useBookPortalDemoMutation();
    const [changePassword, { isLoading: passwordLoading, isSuccess: passwordSuccess, error: passwordError, reset: resetPasswordState }] = useChangeAffiliatePasswordMutation();
    const [logoutAffiliate] = useLogoutAffiliateMutation();

    const stats = dashData?.data;
    const referralLink = typeof window !== 'undefined'
        ? toEnglishDigits(`${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/?ref=${stats?.code ?? ''}`)
        : `/?ref=${stats?.code ?? ''}`;

    const TABS: { key: Tab; label: string }[] = [
        { key: 'overview',           label: t('aff_portal_tab_overview')    },
        { key: 'conversions',        label: t('aff_portal_tab_conversions') },
        { key: 'ledger',             label: t('aff_portal_tab_ledger')      },
        { key: 'payouts',            label: t('aff_portal_tab_payouts')     },
        { key: 'demos',              label: t('aff_portal_tab_demos')       },
        { key: 'referred-partners',  label: t('aff_portal_tab_referred')    },
    ];

    const handleLogout = async () => {
        try { await logoutAffiliate().unwrap(); } catch {}
        removeAffiliateToken();
        router.push('/affiliate');
    };

    const openPasswordForm = () => {
        resetPasswordState();
        setPasswordData({ current_password: '', password: '', password_confirmation: '' });
        setShowPasswordForm(true);
    };

    const submitPasswordChange = async () => {
        await changePassword(passwordData).unwrap().catch(() => null);
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
                <p className="text-slate-600">{t('aff_portal_load_error')}</p>
                <Link href="/affiliate/login" className="mt-4 inline-block rounded-xl bg-primary text-white px-6 py-2 font-semibold">{t('aff_portal_login_btn')}</Link>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">{t('aff_portal_title')}</h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="rounded-full bg-primary/10 text-primary px-3 py-0.5 text-sm font-semibold">{stats.tier}</span>
                        <span className="text-slate-500 text-sm">{t('aff_portal_code_label')} <strong className="text-slate-800">{stats.code}</strong></span>
                        {stats.promo_code && <span className="text-slate-500 text-sm">{t('aff_portal_promo_label')} <strong className="text-slate-800">{stats.promo_code}</strong></span>}
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setShowDemoForm(true)} className="rounded-xl border border-primary text-primary px-4 py-2 text-sm font-semibold hover:bg-primary/5">
                        {t('aff_portal_demo_btn')}
                    </button>
                    <button onClick={() => setShowPayoutForm(true)} className="rounded-xl bg-primary text-white px-4 py-2 text-sm font-semibold hover:opacity-90">
                        {t('aff_portal_payout_btn')}
                    </button>
                    <button onClick={openPasswordForm} className="rounded-xl border border-slate-200 text-slate-600 px-3 py-2 text-sm hover:bg-slate-50">
                        <KeyRound className="h-4 w-4" />
                    </button>
                    <button onClick={handleLogout} className="rounded-xl border border-slate-200 text-slate-500 px-3 py-2 text-sm hover:bg-slate-50">
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { icon: MousePointerClick, labelKey: 'aff_portal_total_clicks',    value: stats.total_clicks,                                  color: 'text-blue-500' },
                    { icon: Users,             labelKey: 'aff_portal_active_customers', value: stats.active_customers,                              color: 'text-success'  },
                    { icon: Wallet,            labelKey: 'aff_portal_balance',          value: `৳${Number(stats.balance).toFixed(0)}`,              color: 'text-warning'  },
                    { icon: TrendingUp,        labelKey: 'aff_portal_total_commission', value: `৳${Number(stats.total_earned).toFixed(0)}`,         color: 'text-primary'  },
                ].map(({ icon: Icon, labelKey, value, color }) => (
                    <div key={labelKey} className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
                        <Icon className={`h-5 w-5 mb-2 ${color}`} />
                        <div className="text-xl font-bold">{value}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{t(labelKey)}</div>
                    </div>
                ))}
            </div>

            {/* Referral link + Register CTA */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex flex-col gap-3">
                    <div>
                        <div className="text-xs text-slate-500 mb-1">{t('aff_portal_ref_link_label')}</div>
                        <div className="text-sm font-mono text-slate-800 break-all" lang="en" dir="ltr" translate="no" data-no-localize-digits>
                            {referralLink}
                        </div>
                    </div>
                    <button
                        onClick={() => navigator.clipboard?.writeText(referralLink)}
                        className="w-full rounded-lg bg-primary text-white px-4 py-2 text-xs font-semibold hover:opacity-90"
                    >
                        {t('aff_portal_copy_link_btn')}
                    </button>
                </div>

                <div className="rounded-xl bg-success/5 border border-success/20 p-4 flex flex-col gap-3">
                    <div>
                        <div className="text-xs font-semibold text-success mb-1">{t('aff_portal_shop_reg_label')}</div>
                        <div className="text-xs text-slate-500">
                            {t('aff_portal_shop_reg_desc')}
                        </div>
                    </div>
                    <a
                        href={`/register?ref=${stats.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center rounded-lg bg-success text-white px-4 py-2 text-xs font-semibold hover:opacity-90 transition"
                    >
                        {t('aff_portal_shop_reg_btn')}
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
                                [t('aff_portal_ov_total_clicks'),  stats.total_clicks],
                                [t('aff_portal_ov_unique_clicks'), stats.unique_clicks],
                                [t('aff_portal_ov_trials'),        stats.total_trials],
                                [t('aff_portal_ov_active'),        stats.active_customers],
                                [t('aff_portal_ov_churn'),         stats.churned],
                                [t('aff_portal_ov_total_paid'),    `৳${Number(stats.total_paid).toFixed(0)}`],
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
                                <tr>{[t('aff_portal_col_customer'), t('aff_portal_col_plan'), t('aff_portal_col_status'), t('aff_portal_col_convert_date'), t('aff_portal_col_amount')].map(h => <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
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
                                )) ?? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">{t('aff_portal_empty_conversions')}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'ledger' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>{[t('aff_portal_col_date'), t('aff_portal_col_type'), t('aff_portal_col_amount'), t('aff_portal_col_status'), t('aff_portal_col_note')].map(h => <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
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
                                )) ?? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">{t('aff_portal_empty_ledger')}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'payouts' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>{[t('aff_portal_col_date'), t('aff_portal_col_amount'), t('aff_portal_col_method'), t('aff_portal_col_account'), t('aff_portal_col_trx'), t('aff_portal_col_status')].map(h => <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
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
                                )) ?? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">{t('aff_portal_empty_payouts')}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'demos' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>{[t('aff_portal_col_prospect'), t('aff_portal_col_mobile'), t('aff_portal_col_business'), t('aff_portal_col_date'), t('aff_portal_col_status'), t('aff_portal_col_incentive')].map(h => <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
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
                                            {d.incentive_paid ? <CheckCircle className="h-4 w-4 text-success" /> : <span className="text-slate-400 text-xs">{t('aff_portal_demo_pending')}</span>}
                                        </td>
                                    </tr>
                                )) ?? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">{t('aff_portal_empty_demos')}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'referred-partners' && (
                    <div>
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                            <p className="text-sm text-slate-600">
                                {t('aff_portal_tab_referred')} — <strong className="text-primary">{stats.code}</strong>
                                {' '}<span className="text-xs text-slate-400">{t('aff_portal_referred_note2')}</span>
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                    <tr>{[t('aff_portal_col_name'), t('aff_portal_col_code'), t('aff_portal_col_tier'), t('aff_portal_active_customers'), t('aff_portal_col_total_commission'), t('aff_portal_col_joined')].map(h => <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
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
                                                <div className="text-slate-400 text-sm">{t('aff_portal_empty_referred')}</div>
                                                <div className="text-xs text-slate-400 mt-1">{t('aff_portal_referred_note2')}</div>
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
                            <h3 className="font-bold text-lg">{t('aff_portal_payout_modal_title')}</h3>
                            <button onClick={() => setShowPayoutForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
                        </div>
                        {payoutSuccess ? (
                            <div className="text-center py-6">
                                <CheckCircle className="mx-auto mb-3 h-12 w-12 text-success" />
                                <p className="font-semibold">{t('aff_portal_payout_success')}</p>
                                <button onClick={() => setShowPayoutForm(false)} className="mt-4 rounded-xl bg-primary text-white px-6 py-2 font-semibold">{t('aff_portal_payout_close_btn')}</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                                    {t('aff_portal_payout_available')} <strong className="text-success text-lg">৳{Number(stats.balance).toFixed(0)}</strong>
                                    <span className="text-slate-400 text-xs ml-2">{t('aff_portal_payout_min')}</span>
                                </div>
                                {payoutError && (
                                    <div className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-sm text-danger">
                                        {(payoutError as any)?.data?.message || t('aff_portal_payout_error')}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('aff_portal_payout_method_label')}</label>
                                    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={payoutData.method}
                                        onChange={(e) => setPayoutData({ ...payoutData, method: e.target.value })}>
                                        <option value="bkash">bKash</option>
                                        <option value="nagad">Nagad</option>
                                        <option value="bank">ব্যাংক</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('aff_portal_payout_account_label')}</label>
                                    <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={payoutData.account_number}
                                        onChange={(e) => setPayoutData({ ...payoutData, account_number: e.target.value })} placeholder="01XXXXXXXXX" />
                                </div>
                                <button disabled={payoutLoading || !payoutData.account_number}
                                    onClick={() => requestPayout(payoutData)}
                                    className="w-full rounded-xl bg-primary text-white font-bold py-3 hover:opacity-90 disabled:opacity-50">
                                    {payoutLoading ? t('aff_portal_payout_processing') : t('aff_portal_payout_submit_btn')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Change password modal */}
            {showPasswordForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowPasswordForm(false); }}>
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">{t('aff_portal_pw_modal_title')}</h3>
                            <button onClick={() => setShowPasswordForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
                        </div>
                        {passwordSuccess ? (
                            <div className="text-center py-6">
                                <CheckCircle className="mx-auto mb-3 h-12 w-12 text-success" />
                                <p className="font-semibold">{t('aff_portal_pw_success')}</p>
                                <button onClick={() => setShowPasswordForm(false)} className="mt-4 rounded-xl bg-primary text-white px-6 py-2 font-semibold">{t('aff_portal_pw_close_btn')}</button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {passwordError && (
                                    <div className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-sm text-danger">
                                        {(passwordError as any)?.data?.message || t('aff_portal_pw_error')}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('aff_portal_pw_current')}</label>
                                    <input type="password" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('aff_portal_pw_new')}</label>
                                    <input type="password" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={passwordData.password}
                                        onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('aff_portal_pw_confirm')}</label>
                                    <input type="password" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={passwordData.password_confirmation}
                                        onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })} />
                                </div>
                                <button disabled={passwordLoading || !passwordData.current_password || !passwordData.password || !passwordData.password_confirmation}
                                    onClick={submitPasswordChange}
                                    className="w-full rounded-xl bg-primary text-white font-bold py-3 hover:opacity-90 disabled:opacity-50">
                                    {passwordLoading ? t('aff_portal_pw_changing') : t('aff_portal_pw_submit')}
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
                                <h3 className="font-bold text-lg">{t('aff_portal_demo_modal_title')}</h3>
                                <p className="text-xs text-slate-500">{t('aff_portal_demo_incentive_note')}</p>
                            </div>
                            <button onClick={() => setShowDemoForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
                        </div>
                        {demoSuccess ? (
                            <div className="text-center py-6">
                                <CheckCircle className="mx-auto mb-3 h-12 w-12 text-success" />
                                <p className="font-semibold">{t('aff_portal_demo_success')}</p>
                                <button onClick={() => { setShowDemoForm(false); setTab('demos'); }} className="mt-4 rounded-xl bg-primary text-white px-6 py-2 font-semibold">{t('aff_portal_demo_view_btn')}</button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {demoError && (
                                    <div className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-sm text-danger">
                                        {(demoError as any)?.data?.message || t('aff_portal_demo_error')}
                                    </div>
                                )}
                                {[
                                    { labelKey: 'aff_portal_demo_prospect_name', key: 'prospect_name',    placeholder: 'কাস্টমারের নাম'         },
                                    { labelKey: 'aff_portal_demo_mobile_label',  key: 'prospect_mobile',  placeholder: '01XXXXXXXXX'              },
                                    { labelKey: 'aff_portal_demo_business_label',key: 'prospect_business', placeholder: t('aff_portal_demo_business_ph') },
                                    { labelKey: 'aff_portal_demo_location_label',key: 'location',          placeholder: t('aff_portal_demo_location_ph') },
                                ].map(({ labelKey, key, placeholder }) => (
                                    <div key={key}>
                                        <label className="block text-sm font-medium mb-1">{t(labelKey)}</label>
                                        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                            value={(demoData as any)[key]} placeholder={placeholder}
                                            onChange={(e) => setDemoData({ ...demoData, [key]: e.target.value })} />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('aff_portal_demo_date_label')}</label>
                                    <input type="datetime-local" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                        value={demoData.scheduled_at} onChange={(e) => setDemoData({ ...demoData, scheduled_at: e.target.value })} />
                                </div>
                                <button disabled={demoLoading || !demoData.prospect_name || !demoData.prospect_mobile}
                                    onClick={() => bookDemo(demoData)}
                                    className="w-full rounded-xl bg-primary text-white font-bold py-3 hover:opacity-90 disabled:opacity-50">
                                    {demoLoading ? t('aff_portal_demo_booking') : t('aff_portal_demo_book_btn')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Floating WhatsApp support button */}
            <a
                href={`https://wa.me/8801577303608?text=${encodeURIComponent(`আমি AndgatePOS পার্টনার (কোড: ${stats.code})। আমার একটু সাহায্য দরকার।`)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp-এ সাহায্য নিন"
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 rounded-full bg-[#25d366] text-white px-4 py-3 shadow-lg hover:bg-[#1da851] transition-all hover:scale-105"
            >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-sm font-semibold">{t('aff_portal_wa_help')}</span>
            </a>
        </div>
    );
}
