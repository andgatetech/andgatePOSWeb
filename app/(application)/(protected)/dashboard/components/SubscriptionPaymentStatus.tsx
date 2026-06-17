'use client';

import Link from 'next/link';
import { AlertCircle, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import { useGetManualPaymentSummaryQuery } from '@/store/features/manualPayments/manualPaymentsApi';
import { getTranslation } from '@/i18n';

const statusClass: Record<string, string> = {
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    submitted: 'bg-amber-50 text-amber-700 border-amber-200',
    under_review: 'bg-amber-50 text-amber-700 border-amber-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    duplicate: 'bg-red-50 text-red-700 border-red-200',
    correction_requested: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function SubscriptionPaymentStatus() {
    const { t } = getTranslation();
    const { data, isLoading } = useGetManualPaymentSummaryQuery();
    const summary = data?.data;
    const subscription = summary?.subscription;
    const latest = summary?.latest_payment;
    const status = latest?.status || subscription?.status || 'no_payment';

    const statusLabel = status.replaceAll('_', ' ');

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <CreditCard className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('lbl_package_and_payment')}</h2>
                    {isLoading ? (
                        <p className="mt-1 text-xs text-gray-500">{t('lbl_loading_status')}</p>
                    ) : (
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                            <span>{subscription?.plan_name_en || t('msg_no_active_package')}</span>
                            {subscription?.expire_date && <span>{t('lbl_expires')}: {new Date(subscription.expire_date).toLocaleDateString('en-US')}</span>}
                            {summary?.remaining_days !== null && summary?.remaining_days !== undefined && <span>{summary.remaining_days} {t('lbl_days_left')}</span>}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${statusClass[status] || 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                    {status === 'approved' ? <CheckCircle2 className="h-3.5 w-3.5" /> : status === 'rejected' || status === 'duplicate' ? <AlertCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    {statusLabel}
                </span>
                <Link href="/manual-payments" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
                    {t('btn_submit_renew_payment')}
                </Link>
            </div>

            {latest?.status === 'rejected' && latest?.rejected_reason && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {t('lbl_rejected')}: {latest.rejected_reason}
                </div>
            )}
            {summary?.has_pending_payment && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                    {t('msg_payment_verification_pending')}
                </div>
            )}
        </div>
    );
}
