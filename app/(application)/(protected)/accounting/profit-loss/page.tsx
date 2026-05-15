'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { useGetProfitAndLossQuery } from '@/store/features/accounting/accountingApi';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const ProfitLossPage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();

    const firstOfYear = `${new Date().getFullYear()}-01-01`;
    const today = new Date().toISOString().split('T')[0];

    const [from, setFrom] = useState(firstOfYear);
    const [to, setTo] = useState(today);

    const { data, isLoading, refetch } = useGetProfitAndLossQuery(
        { store_id: currentStoreId, from, to },
        { skip: !currentStoreId }
    );

    const pl = data?.data;

    const summaryCards = pl
        ? [
              { label: t('lbl_gross_revenue'), value: pl.revenue, color: 'text-success', bg: 'bg-success/10' },
              { label: t('lbl_sales_returns'), value: -pl.sales_returns, color: 'text-warning', bg: 'bg-warning/10' },
              { label: t('lbl_net_revenue'), value: pl.net_revenue, color: 'text-primary', bg: 'bg-primary/10' },
              { label: t('lbl_cogs'), value: -pl.cogs, color: 'text-danger', bg: 'bg-danger/10' },
              { label: t('lbl_gross_profit'), value: pl.gross_profit, color: pl.gross_profit >= 0 ? 'text-success' : 'text-danger', bg: pl.gross_profit >= 0 ? 'bg-success/10' : 'bg-danger/10' },
              { label: t('lbl_total_expenses'), value: -pl.expenses, color: 'text-danger', bg: 'bg-danger/10' },
          ]
        : [];

    const netProfit = pl?.net_profit ?? 0;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('lbl_profit_loss')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('msg_profit_loss_desc')}</p>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100" />
                    <span className="text-gray-400">—</span>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100" />
                    <button onClick={refetch}
                        className="px-4 py-1.5 rounded-lg text-sm bg-primary text-white hover:opacity-90">
                        {t('lbl_apply')}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <Loader fullScreen={false} className="py-20" />
            ) : !pl ? null : (
                <>
                    {/* Net Profit Banner */}
                    <div className={`rounded-2xl p-6 flex items-center gap-5 ${netProfit >= 0 ? 'bg-success/10 border border-success/20' : 'bg-danger/10 border border-danger/20'}`}>
                        <div className={`p-4 rounded-xl ${netProfit >= 0 ? 'bg-success/20' : 'bg-danger/20'}`}>
                            {netProfit >= 0
                                ? <TrendingUp className="h-8 w-8 text-success" />
                                : <TrendingDown className="h-8 w-8 text-danger" />}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('lbl_net_profit')}</p>
                            <p className={`text-4xl font-bold mt-1 ${netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                                ৳{Math.abs(netProfit).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {pl.period.from} → {pl.period.to}
                            </p>
                        </div>
                        {netProfit < 0 && (
                            <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-danger/20 text-danger">{t('lbl_net_loss')}</span>
                        )}
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {summaryCards.map((card) => (
                            <div key={card.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                                <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                                <p className={`text-xl font-bold mt-1 ${card.color}`}>
                                    {card.value < 0 ? '-' : ''}৳{Math.abs(card.value).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Breakdown Tables */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue */}
                        <BreakdownTable
                            title={t('lbl_revenue_breakdown')}
                            rows={pl.breakdown?.revenue ?? []}
                            positiveColor="text-success"
                            t={t}
                        />
                        {/* Expenses */}
                        <BreakdownTable
                            title={t('lbl_expense_breakdown')}
                            rows={[...(pl.breakdown?.expense ?? []), ...(pl.breakdown?.cogs ?? [])]}
                            positiveColor="text-danger"
                            t={t}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

interface BreakdownTableProps {
    title: string;
    rows: any[];
    positiveColor: string;
    t: (key: string) => string;
}

const BreakdownTable = ({ title, rows, positiveColor, t }: BreakdownTableProps) => {
    if (!rows.length) return null;
    const total = rows.reduce((s: number, r: any) => s + Math.abs(Number(r.balance ?? 0)), 0);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{title}</h3>
                <span className={`text-sm font-bold ${positiveColor}`}>৳{total.toLocaleString()}</span>
            </div>
            <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-400 uppercase">
                    <tr>
                        <th className="px-5 py-2.5 text-left">{t('lbl_account')}</th>
                        <th className="px-5 py-2.5 text-right">{t('lbl_balance')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {rows.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                            <td className="px-5 py-2.5 text-gray-700 dark:text-gray-300">
                                <span className="font-mono text-xs text-gray-400 mr-2">{row.account_code}</span>
                                {row.name}
                            </td>
                            <td className={`px-5 py-2.5 text-right font-medium ${positiveColor}`}>
                                ৳{Math.abs(Number(row.balance ?? 0)).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProfitLossPage;
