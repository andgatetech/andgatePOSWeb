'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetDashboardSummaryQuery } from '@/store/features/dashboard/dashboad';
import { Clock, DollarSign, FileText, Gift, Layers, RefreshCw, Settings, Shield } from 'lucide-react';
import Link from 'next/link';
import CountUp from 'react-countup';

// Skeleton component for loading state
const MetricCardSkeleton = () => (
    <div className="animate-pulse rounded-2xl bg-gray-200 p-4 shadow-lg sm:p-6">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-12 w-12 rounded-xl bg-gray-300 sm:h-14 sm:w-14"></div>
                <div>
                    <div className="mb-2 h-3 w-20 rounded bg-gray-300 sm:h-4 sm:w-24"></div>
                    <div className="h-6 w-24 rounded bg-gray-300 sm:h-8 sm:w-32"></div>
                </div>
            </div>
            <div className="h-6 w-14 rounded-lg bg-gray-300 sm:h-8 sm:w-16"></div>
        </div>
    </div>
);

const DetailCardSkeleton = () => (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 shadow-md sm:p-6">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
            <div className="h-10 w-10 rounded-xl bg-gray-200 sm:h-12 sm:w-12"></div>
        </div>
        <div className="space-y-2 sm:space-y-3">
            <div className="h-6 w-28 rounded bg-gray-200 sm:h-8 sm:w-32"></div>
            <div className="h-3 w-20 rounded bg-gray-200 sm:h-4 sm:w-24"></div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                <div className="h-3 w-16 rounded bg-gray-200 sm:h-4 sm:w-20"></div>
            </div>
        </div>
    </div>
);

const MetricCard = ({ title, value, change, changeType, icon: Icon, bgColor, iconBg, iconColor, numericValue, route }: any) => {
    const { symbol } = useCurrency();
    const isPositive = changeType === 'positive';
    const isNegative = changeType === 'negative';

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-start justify-between">
                <p className="text-2xl font-bold text-gray-900">
                    {symbol}
                    <CountUp end={numericValue} duration={2} decimals={2} separator="," />
                </p>
                <div className={`${iconBg} flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
            </div>
            <p className="mb-2 text-sm text-gray-600">{title}</p>
            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                <p className={`text-sm font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                    {isPositive ? '+' : ''}
                    {change}
                </p>
                <Link href={route} className="text-sm font-medium text-blue-600 hover:underline">View All</Link>
            </div>
        </div>
    );
};

const DetailCard = ({ title, value, change, changeType, icon: Icon, iconColor, iconBg, bgColor, numericValue, route }: any) => {
    const { symbol } = useCurrency();
    const isPositive = changeType === 'positive';
    const isNegative = changeType === 'negative';

    return (
        <Link href={route} className="block transition-transform hover:scale-[1.02]">
            <div className={`rounded-lg p-4 text-white ${bgColor}`}>
                <div className="flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium opacity-90">{title}</p>
                        <p className="text-2xl font-bold">
                            {symbol}
                            <CountUp end={numericValue} duration={2} decimals={2} separator="," />
                        </p>
                        <span
                            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                                isPositive ? 'bg-white/20 text-white' : isNegative ? 'bg-red-500/20 text-white' : 'bg-white/20 text-white'
                            }`}
                        >
                            {isPositive ? '↑' : isNegative ? '↓' : ''} {change}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default function Summary() {
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const { data: dashboardData, isLoading, isError } = useGetDashboardSummaryQuery({ store_id: currentStoreId });

    const formatPercentage = (percentage: number) => {
        const sign = percentage > 0 ? '+' : '';
        return `${sign}${percentage.toFixed(0)}%`;
    };

    if (isLoading) {
        return (
            <div className="space-y-4 sm:space-y-8">
                {/* Top Metrics - Colorful Cards Skeleton */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
                    {[...Array(4)].map((_, index) => (
                        <MetricCardSkeleton key={index} />
                    ))}
                </div>

                {/* Bottom Metrics - White Cards with Details Skeleton */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
                    {[...Array(4)].map((_, index) => (
                        <DetailCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        );
    }

    if (isError || !dashboardData?.data) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center sm:p-6">
                <p className="text-sm text-red-600 sm:text-base">Failed to load dashboard data. Please try again.</p>
            </div>
        );
    }

    const { cards } = dashboardData.data;

    const topMetrics = [
        {
            title: 'Total Sales',
            value: formatCurrency(cards.total_sales.current),
            numericValue: cards.total_sales.current,
            change: formatPercentage(cards.total_sales.percentage_change),
            changeType: cards.total_sales.trend,
            icon: FileText,
            bgColor: 'bg-gradient-to-br from-orange-400 to-orange-500',
            iconBg: 'bg-white/20',
            route: '/reports/sales',
        },
        {
            title: 'Total Sales Return',
            value: formatCurrency(cards.total_sales_return.current),
            numericValue: cards.total_sales_return.current,
            change: formatPercentage(cards.total_sales_return.percentage_change),
            changeType: cards.total_sales_return.trend,
            icon: RefreshCw,
            bgColor: 'bg-gradient-to-br from-slate-700 to-slate-800',
            iconBg: 'bg-white/20',
            route: '/reports/order-returns',
        },
        {
            title: 'Total Purchase',
            value: formatCurrency(cards.total_purchase.current),
            numericValue: cards.total_purchase.current,
            change: formatPercentage(cards.total_purchase.percentage_change),
            changeType: cards.total_purchase.trend,
            icon: Gift,
            bgColor: 'bg-gradient-to-br from-teal-500 to-teal-600',
            iconBg: 'bg-white/20',
            route: '/reports/purchases',
        },
        {
            title: 'Total Purchase Return',
            value: formatCurrency(cards.total_purchase_return.current),
            numericValue: cards.total_purchase_return.current,
            change: formatPercentage(cards.total_purchase_return.percentage_change),
            changeType: cards.total_purchase_return.trend,
            icon: Shield,
            bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
            iconBg: 'bg-white/20',
            route: '/reports/purchases',
        },
    ];

    const bottomMetrics = [
        {
            title: 'Profit',
            value: formatCurrency(cards.profit.current),
            numericValue: cards.profit.current,
            change: `${formatPercentage(cards.profit.percentage_change)} vs Last Month`,
            changeType: cards.profit.trend,
            icon: Layers,
            iconColor: 'text-cyan-600',
            iconBg: 'bg-cyan-50',
            route: '/reports/profit-loss',
        },
        {
            title: 'Invoice Due',
            value: formatCurrency(cards.invoice_due.current),
            numericValue: cards.invoice_due.current,
            change: `${formatPercentage(cards.invoice_due.percentage_change)} vs Last Month`,
            changeType: cards.invoice_due.trend,
            icon: Clock,
            iconColor: 'text-green-600',
            iconBg: 'bg-green-50',
            route: '/reports/sales',
        },
        {
            title: 'Total Expenses',
            value: formatCurrency(cards.total_expenses.current),
            numericValue: cards.total_expenses.current,
            change: `${formatPercentage(cards.total_expenses.percentage_change)} vs Last Month`,
            changeType: cards.total_expenses.trend,
            icon: Settings,
            iconColor: 'text-orange-600',
            iconBg: 'bg-orange-50',
            route: '/reports/expenses',
        },
        {
            title: 'Total Payment Returns',
            value: formatCurrency(cards.total_payment_returns.current),
            numericValue: cards.total_payment_returns.current,
            change: `${formatPercentage(cards.total_payment_returns.percentage_change)} vs Last Month`,
            changeType: cards.total_payment_returns.trend,
            icon: DollarSign,
            iconColor: 'text-purple-600',
            iconBg: 'bg-purple-50',
            route: '/reports/order-returns',
        },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Top Metrics - Colorful Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-4">
                {topMetrics.map((metric, index) => (
                    <DetailCard key={index} {...metric} />
                ))}
            </div>

            {/* Bottom Metrics - White Cards with Details */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-4">
                {bottomMetrics.map((metric, index) => (
                    <MetricCard key={index} {...metric} />
                ))}
            </div>
        </div>
    );
}
