'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { endOfDay, endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns';
import { Award, Calendar, ChevronDown, RotateCcw, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const DATE_FILTER_OPTIONS = [
    { value: 'none', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' },
];

type DateFilterType = 'none' | 'today' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';

const TopPerformingBrandsChart = () => {
    const { currentStoreId } = useCurrentStore();

    const [dateFilterType, setDateFilterType] = useState<DateFilterType>('none');
    const [customStartDate, setCustomStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    // Compute date range
    const getDateRange = useCallback(() => {
        const now = new Date();
        switch (dateFilterType) {
            case 'today':
                return {
                    start_date: format(startOfDay(now), 'yyyy-MM-dd'),
                    end_date: format(endOfDay(now), 'yyyy-MM-dd'),
                };
            case 'this_week':
                return {
                    start_date: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                    end_date: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                };
            case 'last_week':
                return {
                    start_date: format(startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                    end_date: format(endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                };
            case 'this_month':
                return {
                    start_date: format(startOfMonth(now), 'yyyy-MM-dd'),
                    end_date: format(endOfMonth(now), 'yyyy-MM-dd'),
                };
            case 'last_month':
                return {
                    start_date: format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd'),
                    end_date: format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd'),
                };
            case 'custom':
                return {
                    start_date: customStartDate,
                    end_date: customEndDate,
                };
            default:
                return null;
        }
    }, [dateFilterType, customStartDate, customEndDate]);

    // Build API query params
    const filters = useMemo(() => {
        const params: any = { store_id: currentStoreId, refetchTrigger };
        const dateRange = getDateRange();
        if (dateRange) {
            params.start_date = dateRange.start_date;
            params.end_date = dateRange.end_date;
        }
        return params;
    }, [currentStoreId, getDateRange, refetchTrigger]);

    // Fetch data from API
    // TODO: Fix backend API - temporarily commented
    // const { data, isLoading, isError, refetch } = useGetTopPerformerBrandsQuery(filters);
    const data = null;
    const isLoading = false;
    const isError = false;
    const refetch = () => {};

    // Force refetch when filters change
    useEffect(() => {
        refetch();
    }, [filters, refetch]);

    // Reset filters
    const resetFilters = () => {
        setDateFilterType('none');
        setCustomStartDate(format(new Date(), 'yyyy-MM-dd'));
        setCustomEndDate(format(new Date(), 'yyyy-MM-dd'));
        setRefetchTrigger((prev) => prev + 1);
    };

    // Handle response safely
    const brandsData = data?.data || [];
    const brandNames = brandsData.map((b) => b.brand_name);
    const salesData = brandsData.map((b) => parseFloat(b.total_sales));

    // Calculate statistics
    const totalSales = salesData.reduce((sum, val) => sum + val, 0);
    const averageSales = brandsData.length > 0 ? totalSales / brandsData.length : 0;
    const topBrand = brandsData.length > 0 ? brandsData[0] : null;

    // Apex Chart Config
    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'bar',
            height: 380,
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        plotOptions: {
            bar: {
                borderRadius: 8,
                horizontal: false,
                columnWidth: '60%',
                distributed: true,
                dataLabels: {
                    position: 'top',
                },
            },
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => `৳${val.toLocaleString()}`,
            offsetY: -20,
            style: {
                fontSize: '11px',
                colors: ['#304758'],
                fontWeight: 600,
            },
        },
        xaxis: {
            categories: brandNames,
            labels: {
                style: {
                    fontSize: '12px',
                },
                rotate: -45,
            },
        },
        yaxis: {
            title: {
                text: 'Total Sales (৳)',
                style: {
                    fontSize: '13px',
                    fontWeight: 600,
                },
            },
            labels: {
                formatter: (val: number) => `৳${val.toLocaleString()}`,
            },
        },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'],
        tooltip: {
            theme: 'dark',
            y: {
                formatter: (val: number) => `৳${val.toLocaleString()}`,
                title: {
                    formatter: () => 'Sales:',
                },
            },
        },
        legend: {
            show: false,
        },
        grid: {
            borderColor: '#e5e7eb',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
    };

    const series = [
        {
            name: 'Total Sales',
            data: salesData,
        },
    ];

    return (
        <div className="panel h-full w-full">
            {/* Header */}
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-500" />
                    <h5 className="text-lg font-semibold dark:text-white-light">Top Performing Brands</h5>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Date Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDateDropdown(!showDateDropdown)}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                        >
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{DATE_FILTER_OPTIONS.find((opt) => opt.value === dateFilterType)?.label || 'All Time'}</span>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>

                        {showDateDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowDateDropdown(false)} />
                                <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                    {DATE_FILTER_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => {
                                                setDateFilterType(opt.value as DateFilterType);
                                                if (opt.value !== 'custom') {
                                                    setShowDateDropdown(false);
                                                    setRefetchTrigger((prev) => prev + 1);
                                                }
                                            }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                                dateFilterType === opt.value ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-gray-200'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}

                                    {/* Custom Date Range Inputs */}
                                    {dateFilterType === 'custom' && (
                                        <div className="space-y-3 border-t border-gray-100 p-4 dark:border-gray-700">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">From Date</label>
                                                <input
                                                    type="date"
                                                    value={customStartDate}
                                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">To Date</label>
                                                <input
                                                    type="date"
                                                    value={customEndDate}
                                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setRefetchTrigger((prev) => prev + 1);
                                                    setShowDateDropdown(false);
                                                }}
                                                className="w-full rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                                            >
                                                Apply Range
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        title="Reset Filters"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div className="w-full">
                {isLoading ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-purple-500"></div>
                            <p className="text-sm text-gray-500">Loading brand performance data...</p>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <div className="text-center">
                            <Award className="mx-auto mb-2 h-12 w-12 text-red-300" />
                            <p className="text-red-500">Failed to load brand data.</p>
                            <p className="mt-1 text-sm text-gray-500">Please try again later.</p>
                        </div>
                    </div>
                ) : brandsData.length === 0 ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <div className="text-center">
                            <Award className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                            <p className="text-gray-500">No sales data available.</p>
                            <p className="mt-1 text-sm text-gray-400">Start making sales to see brand performance here.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <ReactApexChart options={chartOptions} series={series} type="bar" height={380} />

                        {/* Statistics Summary */}
                        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-200 pt-5 dark:border-gray-700 md:grid-cols-3">
                            {/* Total Sales */}
                            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-900/20 dark:to-blue-800/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Sales</p>
                                        <p className="mt-1 text-xl font-bold text-blue-900 dark:text-blue-200">৳{totalSales.toLocaleString()}</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
                                </div>
                            </div>

                            {/* Average Sales */}
                            <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4 dark:from-green-900/20 dark:to-green-800/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-green-600 dark:text-green-400">Average Sales</p>
                                        <p className="mt-1 text-xl font-bold text-green-900 dark:text-green-200">৳{Math.round(averageSales).toLocaleString()}</p>
                                    </div>
                                    <Award className="h-8 w-8 text-green-500 opacity-50" />
                                </div>
                            </div>

                            {/* Top Brand */}
                            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:from-purple-900/20 dark:to-purple-800/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Top Brand</p>
                                        <p className="mt-1 text-lg font-bold text-purple-900 dark:text-purple-200">{topBrand ? topBrand.brand_name : 'N/A'}</p>
                                        {topBrand && <p className="text-xs text-purple-600 dark:text-purple-400">৳{parseFloat(topBrand.total_sales).toLocaleString()}</p>}
                                    </div>
                                    <Award className="h-8 w-8 text-purple-500 opacity-50" />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TopPerformingBrandsChart;
