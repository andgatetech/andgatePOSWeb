'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetDashboardCustomerDuesQuery } from '@/store/features/dashboard/dashboad';
import { AlertCircle, CalendarClock, Phone, UserRound, WalletCards } from 'lucide-react';
import Link from 'next/link';

export default function CustomerDueSnapshot() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const { data, isLoading } = useGetDashboardCustomerDuesQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    );

    const summary = data?.data;
    const topDues = summary?.top_dues || [];
    const hasDue = Number(summary?.total_remaining || 0) > 0;

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="h-44 animate-pulse rounded-xl bg-gray-200 lg:col-span-2" />
                <div className="h-44 animate-pulse rounded-xl bg-gray-200" />
            </div>
        );
    }

    if (!summary || !hasDue) {
        return (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            <WalletCards className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-emerald-900">{t('dashboard_customer_due_snapshot')}</h3>
                            <p className="text-xs text-emerald-700">{t('dashboard_no_customer_due')}</p>
                        </div>
                    </div>
                    <Link href="/customers/due" className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100">
                        {t('lbl_view_all')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm lg:col-span-2">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">{t('lbl_customer_due')}</p>
                        <h3 className="mt-1 text-2xl font-black text-gray-900">{formatCurrency(summary.total_remaining || 0)}</h3>
                        <p className="mt-1 text-sm text-gray-500">{t('dashboard_customer_due_desc')}</p>
                    </div>
                    <Link href="/customers/due" className="rounded-lg bg-[#046ca9] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#034d79]">
                        {t('dashboard_collect_due')}
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Metric icon={UserRound} label={t('dashboard_due_customers')} value={summary.customers_with_due || 0} tone="blue" />
                    <Metric icon={CalendarClock} label={t('dashboard_due_today')} value={summary.promised_today || 0} tone="amber" />
                    <Metric icon={AlertCircle} label={t('dashboard_promise_missed')} value={summary.promise_overdue || 0} tone="red" />
                    <Metric icon={WalletCards} label={t('lbl_over_30_days')} value={summary.over_30_days || 0} tone="slate" />
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">{t('dashboard_top_due_customers')}</h3>
                    <Link href="/customers/due" className="text-xs font-semibold text-[#046ca9] hover:text-[#034d79]">
                        {t('lbl_view_all')}
                    </Link>
                </div>

                <div className="space-y-2">
                    {topDues.slice(0, 4).map((due: any) => (
                        <div key={due.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-2">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">{due.customer_name}</p>
                                <p className="flex items-center gap-1 text-xs text-gray-500">
                                    <Phone className="h-3 w-3" />
                                    {due.phone || t('lbl_no_phone')}
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-sm font-bold text-amber-700">{formatCurrency(due.remaining || 0)}</p>
                                {due.promised_payment_date && <p className="text-[10px] text-gray-400">{due.promised_payment_date}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Metric({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: number; tone: 'blue' | 'amber' | 'red' | 'slate' }) {
    const tones = {
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        red: 'bg-red-50 text-red-700 border-red-100',
        slate: 'bg-slate-50 text-slate-700 border-slate-100',
    };

    return (
        <div className={`rounded-lg border p-3 ${tones[tone]}`}>
            <Icon className="mb-2 h-4 w-4" />
            <p className="text-lg font-black">{value}</p>
            <p className="text-[11px] font-medium leading-tight opacity-80">{label}</p>
        </div>
    );
}
