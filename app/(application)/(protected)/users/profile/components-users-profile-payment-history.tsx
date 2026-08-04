'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import React from 'react';
import { getTranslation } from '@/i18n';
import { useCurrency } from '@/hooks/useCurrency';
import { useGetSubscriptionPaymentHistoryQuery } from '@/store/features/manualPayments/manualPaymentsApi';

const ComponentsUsersProfilePaymentHistory = () => {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();
    const user = useSelector((state: RootState) => state.auth.user);
    const { data, isLoading, isError } = useGetSubscriptionPaymentHistoryQuery(undefined, { skip: !user });

    if (!user) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                <p className="text-sm text-gray-500">{t('profile_no_payment_history')}</p>
            </div>
        );
    }

    const history = Array.isArray(data?.data?.data) ? data.data.data : [];
    const formatDate = (date?: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="panel">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">{t('profile_subscription_history')}</h5>
            </div>
            <div>
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-[#1b2e4b]" />
                        ))}
                    </div>
                ) : isError ? (
                    <p className="text-sm text-red-500">{t('msg_error')}</p>
                ) : history.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 dark:border-[#1b2e4b]">
                                    <th className="py-2 pr-4">{t('lbl_date')}</th>
                                    <th className="py-2 pr-4">{t('lbl_invoice')}</th>
                                    <th className="py-2 pr-4">{t('lbl_plan')}</th>
                                    <th className="py-2 pr-4">{t('lbl_payment_method')}</th>
                                    <th className="py-2 pr-4">{t('lbl_status')}</th>
                                    <th className="py-2 text-right">{t('lbl_amount')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item: any) => (
                                    <tr key={item.id} className="border-b border-gray-50 last:border-0 dark:border-[#1b2e4b]">
                                        <td className="py-3 pr-4 font-medium text-gray-700 dark:text-white-dark">{formatDate(item.payment_date)}</td>
                                        <td className="py-3 pr-4">
                                            <p className="font-mono text-xs font-semibold text-gray-700 dark:text-white-dark">{item.invoice_number || 'N/A'}</p>
                                            {item.transaction_ref && <p className="mt-0.5 text-xs text-gray-400">{item.transaction_ref}</p>}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <p className="font-semibold text-gray-700 dark:text-white-dark">{item.plan_name || 'N/A'}</p>
                                            <p className="mt-0.5 text-xs capitalize text-gray-400">{item.billing_cycle || 'N/A'}</p>
                                        </td>
                                        <td className="py-3 pr-4 capitalize text-gray-600 dark:text-white-dark">{String(item.payment_method || 'N/A').replace('_', ' ')}</td>
                                        <td className="py-3 pr-4">
                                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold capitalize text-green-700">
                                                {item.status || 'paid'}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(item.total_paid || 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-white-dark">{t('profile_no_subscription_history')}</p>
                )}
            </div>
        </div>
    );
};

export default ComponentsUsersProfilePaymentHistory;
