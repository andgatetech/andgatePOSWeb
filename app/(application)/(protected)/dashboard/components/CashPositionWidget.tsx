'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetDashboardCashPositionQuery } from '@/store/features/dashboard/dashboad';
import { Landmark, Wallet } from 'lucide-react';
import Link from 'next/link';

interface CashAccount {
    account_id: number;
    account_code: string;
    name: string;
    balance: number;
}

export default function CashPositionWidget() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const { data, isLoading, isError } = useGetDashboardCashPositionQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    );

    if (isLoading) {
        return <div className="h-32 animate-pulse rounded-xl bg-gray-200" />;
    }

    if (isError || !data?.data) return null;

    const accounts: CashAccount[] = data.data.accounts || [];
    const total = Number(data.data.total_cash_position || 0);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                        <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('dashboard_cash_position')}</p>
                        <h3 className="text-2xl font-black text-gray-900">{formatCurrency(total)}</h3>
                    </div>
                </div>
                <Link href="/accounting/cash-book" className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50">
                    {t('lbl_view_all')}
                </Link>
            </div>

            {accounts.length > 0 && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {accounts.map((account) => (
                        <div key={account.account_id} className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                            <span className="flex items-center gap-1.5 truncate text-xs text-gray-600">
                                <Landmark className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                {account.name}
                            </span>
                            <span className="shrink-0 text-sm font-bold text-gray-900">{formatCurrency(account.balance)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
