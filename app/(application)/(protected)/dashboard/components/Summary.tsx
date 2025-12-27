'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetDashboardSummaryQuery } from '@/store/features/dashboard/dashboad';
import { Clock, DollarSign, FileText, Gift, Layers, RefreshCw, Settings, Shield, TrendingDown, TrendingUp } from 'lucide-react';

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

const MetricCard = ({ title, value, change, changeType, icon: Icon, bgColor, iconBg }: any) => {
    const isPositive = changeType === 'positive';
    const isNegative = changeType === 'negative';

    return (
        <div className={`${bgColor} rounded-2xl p-4 shadow-lg transition-shadow duration-300 hover:shadow-xl sm:p-5 lg:p-6`}>
            <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
                    <div className={`${iconBg} flex-shrink-0 rounded-xl p-2 sm:p-2.5`}>
                        <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate text-xs font-medium text-white/90 sm:text-sm">{title}</p>
                        <h3 className="break-words text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">{value}</h3>
                    </div>
                </div>
                <div className={`flex-shrink-0 rounded-lg bg-white px-1.5 py-1 sm:px-2 sm:py-1.5 ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                    <div className="flex items-center gap-0.5 text-xs font-semibold sm:text-sm">
                        {isPositive && <TrendingUp className="h-3 w-3" />}
                        {isNegative && <TrendingDown className="h-3 w-3" />}
                        <span className="whitespace-nowrap">{change}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailCard = ({ title, value, change, changeType, icon: Icon, iconColor, iconBg }: any) => {
    const isPositive = changeType === 'positive';
    const isNegative = changeType === 'negative';

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md sm:p-5 lg:p-6">
            <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
                <h4 className="min-w-0 flex-1 overflow-hidden break-words text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">{value}</h4>
                <div className={`${iconBg} flex-shrink-0 rounded-xl p-2 sm:p-2.5`}>
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`} />
                </div>
            </div>

            <p className="mb-3 truncate text-xs font-medium text-gray-600 sm:text-sm">{title}</p>

            <div className="flex items-center justify-between gap-2">
                <span className={`min-w-0 flex-1 truncate text-xs font-semibold sm:text-sm ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>{change}</span>
                <button className="flex-shrink-0 whitespace-nowrap text-xs font-medium text-gray-500 underline hover:text-gray-700 sm:text-sm">View All</button>
            </div>
        </div>
    );
};

export default function Summary() {
    const { currentStoreId } = useCurrentStore();
    const { data: dashboardData, isLoading, isError } = useGetDashboardSummaryQuery({ store_id: currentStoreId });

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

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
            change: formatPercentage(cards.total_sales.percentage_change),
            changeType: cards.total_sales.trend,
            icon: FileText,
            bgColor: 'bg-gradient-to-br from-orange-400 to-orange-500',
            iconBg: 'bg-white/20',
        },
        {
            title: 'Total Sales Return',
            value: formatCurrency(cards.total_sales_return.current),
            change: formatPercentage(cards.total_sales_return.percentage_change),
            changeType: cards.total_sales_return.trend,
            icon: RefreshCw,
            bgColor: 'bg-gradient-to-br from-slate-700 to-slate-800',
            iconBg: 'bg-white/20',
        },
        {
            title: 'Total Purchase',
            value: formatCurrency(cards.total_purchase.current),
            change: formatPercentage(cards.total_purchase.percentage_change),
            changeType: cards.total_purchase.trend,
            icon: Gift,
            bgColor: 'bg-gradient-to-br from-teal-500 to-teal-600',
            iconBg: 'bg-white/20',
        },
        {
            title: 'Total Purchase Return',
            value: formatCurrency(cards.total_purchase_return.current),
            change: formatPercentage(cards.total_purchase_return.percentage_change),
            changeType: cards.total_purchase_return.trend,
            icon: Shield,
            bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
            iconBg: 'bg-white/20',
        },
    ];

    const bottomMetrics = [
        {
            title: 'Profit',
            value: formatCurrency(cards.profit.current),
            change: `${formatPercentage(cards.profit.percentage_change)} vs Last Month`,
            changeType: cards.profit.trend,
            icon: Layers,
            iconColor: 'text-cyan-600',
            iconBg: 'bg-cyan-50',
        },
        {
            title: 'Invoice Due',
            value: formatCurrency(cards.invoice_due.current),
            change: `${formatPercentage(cards.invoice_due.percentage_change)} vs Last Month`,
            changeType: cards.invoice_due.trend,
            icon: Clock,
            iconColor: 'text-green-600',
            iconBg: 'bg-green-50',
        },
        {
            title: 'Total Expenses',
            value: formatCurrency(cards.total_expenses.current),
            change: `${formatPercentage(cards.total_expenses.percentage_change)} vs Last Month`,
            changeType: cards.total_expenses.trend,
            icon: Settings,
            iconColor: 'text-orange-600',
            iconBg: 'bg-orange-50',
        },
        {
            title: 'Total Payment Returns',
            value: formatCurrency(cards.total_payment_returns.current),
            change: `${formatPercentage(cards.total_payment_returns.percentage_change)} vs Last Month`,
            changeType: cards.total_payment_returns.trend,
            icon: DollarSign,
            iconColor: 'text-purple-600',
            iconBg: 'bg-purple-50',
        },
    ];

    return (
        <div className="space-y-4 sm:space-y-8">
            {/* Top Metrics - Colorful Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
                {topMetrics.map((metric, index) => (
                    <MetricCard key={index} {...metric} />
                ))}
            </div>

            {/* Bottom Metrics - White Cards with Details */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
                {bottomMetrics.map((metric, index) => (
                    <DetailCard key={index} {...metric} />
                ))}
            </div>
        </div>
    );
}
