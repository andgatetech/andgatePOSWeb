// 'use client';

// import { useCurrentStore } from '@/hooks/useCurrentStore';
// import { useGetPurchaseOrderChartDataQuery } from '@/store/features/PurchaseOrder/PurchaseOrderApi';
// import { format } from 'date-fns';
// import { BarChart3, Calendar } from 'lucide-react';
// import dynamic from 'next/dynamic';
// import React, { useState } from 'react';

// // ✅ Dynamically import ApexCharts to avoid SSR issues
// const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// const PurchaseSaleChart: React.FC = () => {
//     const { currentStoreId } = useCurrentStore();

//     // Default date range = current month
//     const [startDate, setStartDate] = useState<string>(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
//     const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

//     // ✅ Fetch report data
//     const { data, isLoading, isError } = useGetPurchaseOrderChartDataQuery(
//         {
//             store_id: currentStoreId,
//             start_date: startDate,
//             end_date: endDate,
//         },
//         { skip: !currentStoreId }
//     );

//     const chartData = data?.data?.chart || { labels: [], purchases: [], sales: [] };

//     // ✅ Apex Chart Config
//     const chartOptions: ApexCharts.ApexOptions = {
//         chart: {
//             type: 'bar',
//             height: 350,
//             toolbar: { show: false },
//             zoom: { enabled: false },
//         },
//         plotOptions: {
//             bar: {
//                 horizontal: false,
//                 columnWidth: '55%',
//                 borderRadius: 6,
//             },
//         },
//         dataLabels: { enabled: false },
//         stroke: {
//             show: true,
//             width: 3,
//             colors: ['transparent'],
//         },
//         xaxis: {
//             categories: chartData.labels,
//             labels: {
//                 rotate: -45,
//                 style: {
//                     fontSize: '12px',
//                 },
//             },
//         },
//         yaxis: {
//             title: { text: 'Amount (৳)' },
//         },
//         fill: { opacity: 1 },
//         tooltip: {
//             y: {
//                 formatter: (val: number) => `৳${val.toLocaleString()}`,
//             },
//         },
//         colors: ['#f59e0b', '#3b82f6'], // amber for purchase, blue for sale
//         legend: {
//             position: 'top',
//             horizontalAlign: 'right',
//         },
//     };

//     const series = [
//         {
//             name: 'Purchases',
//             data: chartData.purchases || [],
//         },
//         {
//             name: 'Sales',
//             data: chartData.sales || [],
//         },
//     ];

//     return (
//         <div className="panel h-full w-full">
//             <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div className="flex items-center gap-2">
//                     <BarChart3 className="h-5 w-5 text-blue-500" />
//                     <h5 className="text-lg font-semibold dark:text-white-light">Purchase vs Sales Report</h5>
//                 </div>

//                 {/* ✅ Date Range Filter */}
//                 <div className="flex items-center gap-2">
//                     <div className="flex items-center gap-1">
//                         <Calendar className="h-4 w-4 text-gray-500" />
//                         <input
//                             type="date"
//                             className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
//                             value={startDate}
//                             onChange={(e) => setStartDate(e.target.value)}
//                         />
//                     </div>
//                     <span className="text-gray-500">to</span>
//                     <div className="flex items-center gap-1">
//                         <Calendar className="h-4 w-4 text-gray-500" />
//                         <input
//                             type="date"
//                             className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
//                             value={endDate}
//                             onChange={(e) => setEndDate(e.target.value)}
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* ✅ Chart */}
//             <div className="w-full">
//                 {isLoading ? (
//                     <div className="flex h-[300px] items-center justify-center">
//                         <p className="animate-pulse text-gray-500">Loading chart...</p>
//                     </div>
//                 ) : isError ? (
//                     <div className="flex h-[300px] items-center justify-center">
//                         <p className="text-red-500">Failed to load report.</p>
//                     </div>
//                 ) : chartData.labels.length === 0 ? (
//                     <div className="flex h-[300px] items-center justify-center">
//                         <p className="text-gray-500">No data available for selected dates.</p>
//                     </div>
//                 ) : (
//                     <ReactApexChart options={chartOptions} series={series} type="bar" height={350} />
//                 )}
//             </div>
//         </div>
//     );
// };

// export default PurchaseSaleChart;

'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetPurchaseOrderChartDataQuery } from '@/store/features/PurchaseOrder/PurchaseOrderApi';
import { BarChart3, Calendar, ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type FilterType = 'daily' | 'weekly' | 'monthly' | 'yearly';

const FILTER_OPTIONS = [
    { value: 'daily', label: 'Daily (This Month)' },
    { value: 'weekly', label: 'Weekly (This Year)' },
    { value: 'monthly', label: 'Monthly (This Year)' },
    { value: 'yearly', label: 'Yearly (Last 5 Years)' },
];

const PurchaseSaleChart: React.FC = () => {
    const { currentStoreId } = useCurrentStore();
    const [filterType, setFilterType] = useState<FilterType>('monthly');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Year and month selectors for specific filters
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    // Generate year options (last 10 years)
    const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);
    const monthOptions = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    // Fetch report data
    const { data, isLoading, isError } = useGetPurchaseOrderChartDataQuery(
        {
            store_id: currentStoreId,
            filter_type: filterType,
            year: selectedYear,
            month: selectedMonth,
        },
        { skip: !currentStoreId }
    );

    const chartData = data?.data?.chart || { labels: [], purchases: [], sales: [] };

    // Apex Chart Config
    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 6,
            },
        },
        dataLabels: { enabled: false },
        stroke: {
            show: true,
            width: 3,
            colors: ['transparent'],
        },
        xaxis: {
            categories: chartData.labels,
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px',
                },
            },
        },
        yaxis: {
            title: { text: 'Amount (৳)' },
            labels: {
                formatter: (val: number) => `৳${val.toLocaleString()}`,
            },
        },
        fill: { opacity: 1 },
        tooltip: {
            y: {
                formatter: (val: number) => `৳${val.toLocaleString()}`,
            },
        },
        colors: ['#f59e0b', '#3b82f6'], // amber for purchase, blue for sale
        legend: {
            position: 'top',
            horizontalAlign: 'right',
        },
    };

    const series = [
        {
            name: 'Purchases',
            data: chartData.purchases || [],
        },
        {
            name: 'Sales',
            data: chartData.sales || [],
        },
    ];

    return (
        <div className="panel h-full w-full">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <h5 className="text-lg font-semibold dark:text-white-light">Purchase vs Sales Report</h5>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Filter Type Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                        >
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{FILTER_OPTIONS.find((opt) => opt.value === filterType)?.label}</span>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>

                        {showFilterDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
                                <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                    {FILTER_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => {
                                                setFilterType(opt.value as FilterType);
                                                setShowFilterDropdown(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                                filterType === opt.value ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-gray-200'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Conditional Selectors */}
                    {filterType === 'daily' && (
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            >
                                {monthOptions.map((month) => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            >
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {filterType === 'weekly' && (
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            {yearOptions.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    )}

                    {filterType === 'monthly' && (
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            {yearOptions.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Chart */}
            <div className="w-full">
                {isLoading ? (
                    <div className="flex h-[300px] items-center justify-center">
                        <p className="animate-pulse text-gray-500">Loading chart...</p>
                    </div>
                ) : isError ? (
                    <div className="flex h-[300px] items-center justify-center">
                        <p className="text-red-500">Failed to load report.</p>
                    </div>
                ) : chartData.labels.length === 0 ? (
                    <div className="flex h-[300px] items-center justify-center">
                        <p className="text-gray-500">No data available for selected period.</p>
                    </div>
                ) : (
                    <ReactApexChart options={chartOptions} series={series} type="bar" height={350} />
                )}
            </div>
        </div>
    );
};

export default PurchaseSaleChart;
