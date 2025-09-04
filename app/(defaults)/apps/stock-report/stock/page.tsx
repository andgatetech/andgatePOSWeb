'use client';
import React, { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import {
    Package,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    DollarSign,
    Calendar,
    Filter,
    Download,
    Printer,
    FileText,
    BarChart3,
    PieChart as PieChartIcon,
    Activity,
    Warehouse,
    ShoppingCart,
    Loader,
} from 'lucide-react';
import { useGetStockSummaryQuery, useGetStockMovementQuery, useGetStockCategoryWiseQuery, useGetStockAnalysisQuery } from '@/store/features/stock/stock';

const StockAnalysisReport = () => {
    const [dateRange, setDateRange] = useState('last30days');
    const printRef = useRef();

    // Redux API calls
    const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useGetStockSummaryQuery({ date_range: dateRange });
    const { data: movementData, isLoading: movementLoading, error: movementError } = useGetStockMovementQuery({ date_range: dateRange });
    const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useGetStockCategoryWiseQuery({ date_range: dateRange });
    const { data: analysisData, isLoading: analysisLoading, error: analysisError } = useGetStockAnalysisQuery({ date_range: dateRange });

    const isLoading = summaryLoading || movementLoading || categoryLoading || analysisLoading;
    const hasError = summaryError || movementError || categoryError || analysisError;

    // Colors for charts
    const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    // Calculate percentages for category data
    const categoryWithPercentages = React.useMemo(() => {
        if (!categoryData?.success || !categoryData.data) return [];

        const totalStock = categoryData.data.reduce((sum, cat) => sum + cat.stock_count, 0);
        return categoryData.data.map((cat) => ({
            ...cat,
            percentage: totalStock > 0 ? Math.round((cat.stock_count / totalStock) * 100) : 0,
        }));
    }, [categoryData]);

    // Handle print functionality
    const handlePrint = () => {
        const printContent = printRef.current;
        const WinPrint = window.open('', '', 'width=900,height=650');
        WinPrint.document.write(`
      <html>
        <head>
          <title>Stock Analysis Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ccc; padding-bottom: 10px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
            .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .chart-section { margin: 30px 0; page-break-inside: avoid; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; }
            @media print { .no-print { display: none !important; } }
          </style>
        </head>
        <body onload="window.print();window.close()">${printContent.innerHTML}</body>
      </html>
    `);
        WinPrint.document.close();
    };

    // Handle export to CSV
    const handleExport = () => {
        if (!summaryData?.success || !movementData?.success || !categoryData?.success) {
            alert('Data is still loading. Please wait and try again.');
            return;
        }

        const csvData = [];

        // Add summary data
        csvData.push(['Stock Summary Report']);
        csvData.push(['Generated on', new Date().toISOString()]);
        csvData.push(['Date Range', dateRange]);
        csvData.push(['']);
        csvData.push(['Metric', 'Value']);
        csvData.push(['Total Products', summaryData.data.total_products]);
        csvData.push(['Total Stock Value', summaryData.data.total_stock_value]);
        csvData.push(['Low Stock Items', summaryData.data.low_stock_items]);
        csvData.push(['Out of Stock Items', summaryData.data.out_of_stock]);
        csvData.push(['']);

        // Add movement data
        csvData.push(['Stock Movement Analysis']);
        csvData.push(['Month', 'Stock In', 'Stock Out', 'Net Movement']);
        movementData.data.forEach((row) => {
            csvData.push([row.month, row.stock_in, row.stock_out, row.stock_in - row.stock_out]);
        });
        csvData.push(['']);

        // Add category data
        csvData.push(['Category-wise Stock Distribution']);
        csvData.push(['Category', 'Stock Count', 'Percentage']);
        categoryWithPercentages.forEach((row) => {
            csvData.push([row.category_name, row.stock_count, row.percentage + '%']);
        });

        const csvContent = csvData.map((row) => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-analysis-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const SummaryCard = ({ title, value, icon: Icon, color, trend, isPositive }) => (
        <div className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="mb-1 text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '↗' : '↘'} {trend}
                        </p>
                    )}
                </div>
                <div className={`rounded-full p-3 ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>
    );

    const LoadingSpinner = () => (
        <div className="flex items-center justify-center py-12">
            <Loader className="mr-3 h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading stock data...</span>
        </div>
    );

    const ErrorMessage = ({ error }) => (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                <span className="font-medium text-red-700">Error loading data</span>
            </div>
            <p className="mt-1 text-sm text-red-600">{error?.message || 'Failed to load stock analysis data. Please try again.'}</p>
        </div>
    );

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    // Show error state
    if (hasError) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <ErrorMessage error={summaryError || movementError || categoryError || analysisError} />
                    <button onClick={() => window.location.reload()} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="border-b bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Stock Analysis Report</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Generated on{' '}
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Date Range Filter */}
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="last7days">Last 7 Days</option>
                                <option value="last30days">Last 30 Days</option>
                                <option value="last90days">Last 90 Days</option>
                            </select>

                            {/* Action Buttons */}
                            <button onClick={handlePrint} className="flex items-center space-x-2 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700">
                                <Printer size={16} />
                                <span>Print</span>
                            </button>

                            <button onClick={handleExport} className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
                                <Download size={16} />
                                <span>Export CSV</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div ref={printRef}>
                    {/* Print Header */}
                    <div className="print-header mb-8" style={{ display: 'none' }}>
                        <h1 style={{ fontSize: '24px', margin: '0' }}>Stock Analysis Report</h1>
                        <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                            Report Date: {new Date().toLocaleDateString()} | Period: {dateRange}
                        </p>
                    </div>

                    {/* Section 1: Summary Overview */}
                    {summaryData?.success && (
                        <div className="mb-8">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="flex items-center text-xl font-semibold text-gray-900">
                                    <BarChart3 className="mr-2 text-blue-600" size={24} />
                                    Summary Overview
                                </h2>
                            </div>

                            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <SummaryCard
                                    title="Total Products"
                                    value={summaryData.data.total_products?.toLocaleString() || '0'}
                                    icon={Package}
                                    color="bg-blue-500"
                                    trend="Active inventory"
                                    isPositive={true}
                                />
                                <SummaryCard
                                    title="Stock Value"
                                    value={`${summaryData.data.total_stock_value?.toLocaleString() || '0'}`}
                                    icon={DollarSign}
                                    color="bg-green-500"
                                    trend="Total investment"
                                    isPositive={true}
                                />
                                <SummaryCard
                                    title="Low Stock Items"
                                    value={summaryData.data.low_stock_items?.toString() || '0'}
                                    icon={AlertTriangle}
                                    color="bg-yellow-500"
                                    trend="Needs attention"
                                    isPositive={false}
                                />
                                <SummaryCard
                                    title="Out of Stock"
                                    value={summaryData.data.out_of_stock?.toString() || '0'}
                                    icon={TrendingDown}
                                    color="bg-red-500"
                                    trend="Urgent restock"
                                    isPositive={false}
                                />
                            </div>

                            {/* Stock Health Indicator */}
                            <div className="rounded-lg border bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-medium text-gray-900">Stock Health Overview</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {summaryData.data.total_products > 0
                                                ? Math.round(
                                                      ((summaryData.data.total_products - summaryData.data.low_stock_items - summaryData.data.out_of_stock) / summaryData.data.total_products) * 100
                                                  )
                                                : 0}
                                            %
                                        </div>
                                        <div className="text-sm text-gray-600">Healthy Stock</div>
                                        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                                            <div
                                                className="h-2 rounded-full bg-green-600"
                                                style={{
                                                    width: `${
                                                        summaryData.data.total_products > 0
                                                            ? Math.round(
                                                                  ((summaryData.data.total_products - summaryData.data.low_stock_items - summaryData.data.out_of_stock) /
                                                                      summaryData.data.total_products) *
                                                                      100
                                                              )
                                                            : 0
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {summaryData.data.total_products > 0 ? Math.round((summaryData.data.low_stock_items / summaryData.data.total_products) * 100) : 0}%
                                        </div>
                                        <div className="text-sm text-gray-600">Low Stock</div>
                                        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                                            <div
                                                className="h-2 rounded-full bg-yellow-600"
                                                style={{
                                                    width: `${summaryData.data.total_products > 0 ? Math.round((summaryData.data.low_stock_items / summaryData.data.total_products) * 100) : 0}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">
                                            {summaryData.data.total_products > 0 ? Math.round((summaryData.data.out_of_stock / summaryData.data.total_products) * 100) : 0}%
                                        </div>
                                        <div className="text-sm text-gray-600">Out of Stock</div>
                                        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                                            <div
                                                className="h-2 rounded-full bg-red-600"
                                                style={{
                                                    width: `${summaryData.data.total_products > 0 ? Math.round((summaryData.data.out_of_stock / summaryData.data.total_products) * 100) : 0}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 2: Stock Movement Analysis */}
                    {movementData?.success && movementData.data?.length > 0 && (
                        <div className="mb-8">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="flex items-center text-xl font-semibold text-gray-900">
                                    <Activity className="mr-2 text-green-600" size={24} />
                                    Stock Movement Analysis
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Stock In vs Out Chart */}
                                <div className="rounded-lg border bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 text-lg font-medium text-gray-900">Stock In vs Out (Monthly Trend)</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={movementData.data}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                                            <Tooltip formatter={(value, name) => [`${value?.toLocaleString() || '0'}`, name === 'stock_in' ? 'Stock In' : 'Stock Out']} />
                                            <Bar dataKey="stock_in" fill="#10b981" name="stock_in" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="stock_out" fill="#ef4444" name="stock_out" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Net Movement Trend */}
                                <div className="rounded-lg border bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 text-lg font-medium text-gray-900">Net Stock Movement Trend</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart
                                            data={movementData.data.map((item) => ({
                                                ...item,
                                                net_movement: (item.stock_in || 0) - (item.stock_out || 0),
                                            }))}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                                            <Tooltip formatter={(value) => [`${value?.toLocaleString() || '0'}`, 'Net Movement']} />
                                            <Area type="monotone" dataKey="net_movement" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.6} strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Movement Summary Cards */}
                            <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-medium text-gray-900">Movement Summary</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">${movementData.data.reduce((sum, item) => sum + (item.stock_in || 0), 0).toLocaleString()}</div>
                                        <div className="text-sm text-gray-600">Total Stock In</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">${movementData.data.reduce((sum, item) => sum + (item.stock_out || 0), 0).toLocaleString()}</div>
                                        <div className="text-sm text-gray-600">Total Stock Out</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            ${movementData.data.reduce((sum, item) => sum + ((item.stock_in || 0) - (item.stock_out || 0)), 0).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-600">Net Movement</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">{movementData.data.length}</div>
                                        <div className="text-sm text-gray-600">Months Analyzed</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 3: Category Analysis */}
                    {categoryWithPercentages?.length > 0 && (
                        <div className="mb-8">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="flex items-center text-xl font-semibold text-gray-900">
                                    <PieChartIcon className="mr-2 text-purple-600" size={24} />
                                    Category-wise Stock Distribution
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Pie Chart */}
                                <div className="rounded-lg border bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 text-lg font-medium text-gray-900">Stock Distribution</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={categoryWithPercentages}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ category_name, percentage }) => `${category_name} (${percentage}%)`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="stock_count"
                                            >
                                                {categoryWithPercentages.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [value?.toLocaleString() || '0', 'Stock Count']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Category Table */}
                                <div className="rounded-lg border bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 text-lg font-medium text-gray-900">Category Breakdown</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="py-2 text-left font-medium text-gray-900">Category</th>
                                                    <th className="py-2 text-right font-medium text-gray-900">Stock Count</th>
                                                    <th className="py-2 text-right font-medium text-gray-900">Percentage</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {categoryWithPercentages.map((category, index) => (
                                                    <tr key={category.category_name} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3">
                                                            <div className="flex items-center">
                                                                <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                                                {category.category_name}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-right font-medium">{category.stock_count?.toLocaleString() || '0'}</td>
                                                        <td className="py-3 text-right">
                                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                                {category.percentage}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Category Summary */}
                            <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-medium text-gray-900">Category Insights</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{categoryWithPercentages.length}</div>
                                        <div className="text-sm text-gray-600">Active Categories</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{categoryWithPercentages.length > 0 ? categoryWithPercentages[0].category_name : 'N/A'}</div>
                                        <div className="text-sm text-gray-600">Top Category</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">{categoryWithPercentages.reduce((sum, cat) => sum + (cat.stock_count || 0), 0).toLocaleString()}</div>
                                        <div className="text-sm text-gray-600">Total Stock Items</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Report Footer */}
                    <div className="mt-8 rounded-lg border bg-white p-6 shadow-sm">
                        <div className="text-center text-sm text-gray-500">
                            <p>This report was generated automatically on {new Date().toLocaleString()}</p>
                            <p className="mt-1">Stock Analysis System - Real-time Inventory Tracking</p>
                            <div className="mt-3 border-t border-gray-200 pt-3">
                                <p className="text-xs text-gray-400">Report includes data for the selected period: {dateRange.replace('last', 'Last ').replace('days', ' Days')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockAnalysisReport;
