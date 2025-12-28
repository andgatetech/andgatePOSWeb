'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetDashboardAnalyticsQuery } from '@/store/features/dashboard/dashboad';
import { ShoppingCart, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';
import CountUp from 'react-countup';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Skeleton components for loading state
const ChartSkeleton = () => (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-32 rounded bg-gray-200"></div>
            <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 w-16 rounded-lg bg-gray-200"></div>
                ))}
            </div>
        </div>
        <div className="mb-4 flex gap-4">
            <div className="h-4 w-24 rounded bg-gray-200"></div>
            <div className="h-4 w-24 rounded bg-gray-200"></div>
        </div>
        <div className="h-64 rounded bg-gray-100"></div>
    </div>
);

const InfoCardSkeleton = () => (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-3">
        <div className="mb-3 flex items-center justify-center">
            <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
        </div>
        <div className="space-y-2 text-center">
            <div className="mx-auto h-3 w-16 rounded bg-gray-200"></div>
            <div className="mx-auto h-8 w-20 rounded bg-gray-200"></div>
        </div>
    </div>
);

const CustomerOverviewSkeleton = () => (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-40 rounded bg-gray-200"></div>
            <div className="h-8 w-32 rounded-lg bg-gray-200"></div>
        </div>
        <div className="flex items-center justify-center">
            <div className="h-48 w-48 rounded-full bg-gray-100"></div>
        </div>
    </div>
);

// Info Card Component
// Info Card Component
const InfoCard = ({ title, count, icon: Icon, iconColor, iconBg, cardBg }: any) => (
    <div className={`flex flex-col items-center justify-center gap-2 rounded-xl p-3 text-center transition-all hover:scale-105 ${cardBg || 'bg-gray-50'}`}>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div className="min-w-0">
            <p className="mb-0.5 truncate text-[10px] font-medium uppercase tracking-wide text-gray-500">{title}</p>
            <p className="truncate text-lg font-bold leading-none text-gray-900">
                <CountUp end={count} duration={2} separator="," />
            </p>
        </div>
    </div>
);

export default function Analytics() {
    const { currentStoreId } = useCurrentStore();
    const [chartPeriod, setChartPeriod] = useState('daily');
    const [customerPeriod, setCustomerPeriod] = useState('today');

    const {
        data: analyticsData,
        isLoading,
        isError,
    } = useGetDashboardAnalyticsQuery({
        store_id: currentStoreId,
        chart_period: chartPeriod,
        customer_period: customerPeriod,
    });

    const periodButtons = [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Yearly', value: 'yearly' },
    ];

    const customerPeriodOptions = [
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'this_week' },
        { label: 'This Month', value: 'this_month' },
        { label: 'This Year', value: 'this_year' },
    ];

    if (isLoading) {
        return (
            <div className="space-y-4 sm:space-y-6">
                {/* Chart and Info Cards Skeleton - Side by Side */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <ChartSkeleton />
                    </div>
                    <div className="flex flex-col gap-4 sm:gap-6 lg:col-span-1">
                        <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
                            <div className="mb-4 h-6 w-40 rounded bg-gray-200"></div>
                            <div className="grid grid-cols-3 gap-2">
                                {[...Array(3)].map((_, index) => (
                                    <InfoCardSkeleton key={index} />
                                ))}
                            </div>
                        </div>
                        <CustomerOverviewSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !analyticsData?.data) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center sm:p-6">
                <p className="text-sm text-red-600 sm:text-base">Failed to load analytics data. Please try again.</p>
            </div>
        );
    }

    const { sales_purchase_chart, overall_information, customers_overview } = analyticsData.data;

    // Prepare chart data
    const chartData = sales_purchase_chart.chart_data.labels.map((label: string, index: number) => ({
        name: label,
        'Total Sales': sales_purchase_chart.chart_data.datasets[0].data[index],
        'Total Purchase': sales_purchase_chart.chart_data.datasets[1].data[index],
    }));

    // Prepare pie chart data
    const rawPieData = [
        { name: 'First Time', value: customers_overview.first_time.count, percentage: customers_overview.first_time.percentage },
        { name: 'Return', value: customers_overview.return.count, percentage: customers_overview.return.percentage },
    ];

    const hasData = rawPieData.some((item) => item.value > 0);

    const pieData = hasData ? rawPieData : [{ name: 'No Data', value: 1, percentage: 0 }];

    const COLORS = hasData ? ['#fb923c', '#10b981'] : ['#f3f4f6']; // Orange/Green or Gray-100 placeholder

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Sales & Purchase Chart and Overall Information - Side by Side */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                {/* Sales & Purchase Chart */}
                <div className="lg:col-span-2">
                    <div className="h-full rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">📊 Sales & Purchase</h2>
                            <div className="flex gap-2">
                                {periodButtons.map((period) => (
                                    <button
                                        key={period.value}
                                        onClick={() => setChartPeriod(period.value)}
                                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                            chartPeriod === period.value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {period.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                                <span className="text-sm text-gray-600">
                                    Total Purchase: <span className="font-semibold text-gray-900">{sales_purchase_chart.total_purchase.formatted}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-gray-700"></div>
                                <span className="text-sm text-gray-600">
                                    Total Sales: <span className="font-semibold text-gray-900">{sales_purchase_chart.total_sales.formatted}</span>
                                </span>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '14px' }} />
                                <Bar dataKey="Total Sales" fill="#374151" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="Total Purchase" fill="#fb923c" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-4">
                        {/* Overall Information */}
                        <div className="mb-4">
                            <h2 className="mb-3 text-sm font-bold text-gray-900 sm:text-base">Overall Information</h2>
                            <div className="grid grid-cols-3 gap-2">
                                <InfoCard title="Suppliers" count={overall_information.suppliers.count} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-100" cardBg="bg-blue-50/50" />
                                <InfoCard title="Customers" count={overall_information.customers.count} icon={UserCheck} iconColor="text-orange-600" iconBg="bg-orange-100" cardBg="bg-orange-50/50" />
                                <InfoCard title="Orders" count={overall_information.orders.count} icon={ShoppingCart} iconColor="text-emerald-600" iconBg="bg-emerald-100" cardBg="bg-emerald-50/50" />
                            </div>
                        </div>

                        <div className="my-2 border-t border-gray-100"></div>

                        {/* Customers Overview */}
                        <div className="flex flex-1 flex-col justify-center">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-900 sm:text-base">Customers Overview</h3>
                                <select
                                    value={customerPeriod}
                                    onChange={(e) => setCustomerPeriod(e.target.value)}
                                    className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {customerPeriodOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-row items-center justify-between gap-4">
                                {/* Donut Chart */}
                                <div className="relative flex-shrink-0">
                                    <PieChart width={120} height={120}>
                                        <Pie data={pieData} cx={60} cy={60} innerRadius={38} outerRadius={55} dataKey="value" stroke="none">
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                            }}
                                        />
                                    </PieChart>
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                        <p className="text-lg font-bold text-gray-900">
                                            <CountUp end={customers_overview.total_active} duration={2} />
                                        </p>
                                        <p className="text-[10px] text-gray-600">Total</p>
                                    </div>
                                </div>

                                {/* Metric Cards */}
                                <div className="flex w-full flex-col gap-2">
                                    {/* First Time Card */}
                                    <div className="flex-1 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center transition-colors hover:bg-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="text-left">
                                                <p className="text-[10px] font-medium text-orange-500">First Time</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    <CountUp end={customers_overview.first_time.count} duration={2} separator="," decimals={1} decimal="." />K
                                                </p>
                                            </div>
                                            <div className="rounded-md bg-green-100 px-1.5 py-0.5">
                                                <span className="text-[10px] font-semibold text-green-700">↑ {customers_overview.first_time.percentage}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Return Card */}
                                    <div className="flex-1 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center transition-colors hover:bg-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="text-left">
                                                <p className="text-[10px] font-medium text-teal-500">Return</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    <CountUp end={customers_overview.return.count} duration={2} separator="," decimals={1} decimal="." />K
                                                </p>
                                            </div>
                                            <div className="rounded-md bg-green-100 px-1.5 py-0.5">
                                                <span className="text-[10px] font-semibold text-green-700">↑ {customers_overview.return.percentage}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
