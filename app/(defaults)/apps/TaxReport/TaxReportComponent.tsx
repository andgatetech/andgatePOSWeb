'use client';
import { useState, useRef, useMemo } from 'react';
import { Download, Printer, Receipt, Filter } from 'lucide-react';

import { useGetAllOrdersQuery } from '@/store/features/Order/Order';
import ReportHeader from '../../components/Report Header/ReportHeader';

const TaxReportComponent = () => {
    const { data: ordersData, isLoading: ordersLoading } = useGetAllOrdersQuery();
    const [selectedStoreId, setSelectedStoreId] = useState(null);
    const [dateFilter, setDateFilter] = useState('all');
    const [customDateFrom, setCustomDateFrom] = useState('');
    const [customDateTo, setCustomDateTo] = useState('');
    const printRef = useRef();

    const handleStoreChange = (storeId) => {
        setSelectedStoreId(storeId || null);
    };

    const dateFilterOptions = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'thisWeek', label: 'This Week' },
        { value: 'lastWeek', label: 'Last Week' },
        { value: 'thisMonth', label: 'This Month' },
        { value: 'lastMonth', label: 'Last Month' },
        { value: 'last30Days', label: 'Last 30 Days' },
        { value: 'last90Days', label: 'Last 90 Days' },
        { value: 'thisYear', label: 'This Year' },
        { value: 'custom', label: 'Custom Range' },
    ];

    const getDateRange = (filter) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (filter) {
            case 'today':
                return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
            case 'yesterday':
                const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                return { start: yesterday, end: today };
            case 'thisWeek':
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                return { start: startOfWeek, end: now };
            case 'lastWeek':
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                const lastWeekEnd = new Date(lastWeekStart);
                lastWeekEnd.setDate(lastWeekStart.getDate() + 7);
                return { start: lastWeekStart, end: lastWeekEnd };
            case 'thisMonth':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return { start: startOfMonth, end: now };
            case 'lastMonth':
                const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
                return { start: lastMonthStart, end: lastMonthEnd };
            case 'last30Days':
                const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                return { start: thirtyDaysAgo, end: now };
            case 'last90Days':
                const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                return { start: ninetyDaysAgo, end: now };
            case 'thisYear':
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                return { start: startOfYear, end: now };
            case 'custom':
                if (customDateFrom && customDateTo) {
                    return {
                        start: new Date(customDateFrom),
                        end: new Date(new Date(customDateTo).getTime() + 24 * 60 * 60 * 1000),
                    };
                }
                return null;
            default:
                return null;
        }
    };

    const processedTaxData = useMemo(() => {
        if (!ordersData?.data) return [];

        let filteredOrders = selectedStoreId ? ordersData.data.filter((order) => order.store_id === selectedStoreId) : ordersData.data;

        const dateRange = getDateRange(dateFilter);
        if (dateRange) {
            filteredOrders = filteredOrders.filter((order) => {
                const orderDate = new Date(order.created_at);
                return orderDate >= dateRange.start && orderDate <= dateRange.end;
            });
        }

        const taxData = [];

        filteredOrders.forEach((order) => {
            order.items.forEach((item) => {
                taxData.push({
                    orderId: order.id,
                    invoice: order.invoice,
                    date: new Date(order.created_at).toLocaleDateString(),
                    dateTime: new Date(order.created_at),
                    productName: item.product.product_name,
                    sku: item.product.sku,
                    quantity: parseFloat(item.quantity),
                    unitPrice: parseFloat(item.unit_price),
                    taxAmount: parseFloat(item.tax),
                    taxRate: parseFloat(item.product.tax_rate),
                    taxIncluded: item.product.tax_included === 1,
                    subtotal: parseFloat(item.subtotal),
                    storeName: order.store.store_name,
                    customerName: order.customer.name,
                });
            });
        });

        return taxData.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    }, [ordersData, selectedStoreId, dateFilter, customDateFrom, customDateTo]);

    const taxSummary = useMemo(() => {
        if (!processedTaxData.length) return {};

        const totalTaxAmount = processedTaxData.reduce((sum, item) => sum + item.taxAmount, 0);
        const totalSubtotal = processedTaxData.reduce((sum, item) => sum + item.subtotal, 0);
        const averageTaxRate = processedTaxData.length > 0 ? processedTaxData.reduce((sum, item) => sum + item.taxRate, 0) / processedTaxData.length : 0;

        return {
            totalTaxAmount,
            totalSubtotal,
            averageTaxRate,
            totalRecords: processedTaxData.length,
        };
    }, [processedTaxData]);

    const exportToCSV = () => {
        const headers = ['Invoice', 'Date', 'Product Name', 'SKU', 'Quantity', 'Unit Price', 'Tax Amount', 'Tax Rate (%)', 'Tax Included', 'Subtotal'];

        const csvContent = [
            headers.join(','),
            ...processedTaxData.map((item) =>
                [
                    item.invoice,
                    item.date,
                    `"${item.productName}"`,
                    item.sku,
                    item.quantity,
                    item.unitPrice.toFixed(2),
                    item.taxAmount.toFixed(2),
                    item.taxRate.toFixed(2),
                    item.taxIncluded ? 'Yes' : 'No',
                    item.subtotal.toFixed(2),
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tax-report-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=800,width=1200');
        printWindow.document.write('<html><head><title>Tax Report</title>');
        printWindow.document.write(`
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    color: #333; 
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #333;
                    padding-bottom: 20px;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                    color: #333;
                }
                .header p {
                    margin: 10px 0;
                    color: #666;
                    font-size: 14px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 30px;
                    font-size: 11px;
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 8px; 
                    text-align: left; 
                }
                th { 
                    background-color: #f8f9fa; 
                    font-weight: bold;
                    color: #495057;
                }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .summary { 
                    margin-top: 30px; 
                    padding: 20px;
                    background-color: #f8f9fa;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                .summary-row { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    margin-bottom: 15px;
                }
                .summary-row:last-child {
                    margin-bottom: 0;
                }
                .summary-label { 
                    font-weight: bold; 
                    color: #495057;
                }
                .summary-value { 
                    font-size: 14px; 
                    font-weight: bold;
                }
                @media print {
                    body { margin: 0; }
                    @page { margin: 0.5in; }
                }
            </style>
        `);
        printWindow.document.write('</head><body>');

        // Header
        printWindow.document.write(`
            <div class="header">
                <h1>Tax Report</h1>
                <p>Comprehensive tax analysis and reporting</p>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
                <p>Filter: ${dateFilterOptions.find((opt) => opt.value === dateFilter)?.label || 'All Time'}</p>
            </div>
        `);

        // Table
        printWindow.document.write(`
            <table>
                <thead>
                    <tr>
                        <th>Invoice</th>
                        <th>Date</th>
                        <th>Product Name</th>
                        <th>SKU</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Tax Amount</th>
                        <th class="text-right">Tax Rate (%)</th>
                        <th class="text-center">Tax Included</th>
                        <th class="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${processedTaxData
                        .map(
                            (item) => `
                        <tr>
                            <td>${item.invoice}<br><small style="color: #666;">${item.date}</small></td>
                            <td>${item.date}</td>
                            <td>${item.productName}<br><small style="color: #666;">${item.sku}</small></td>
                            <td>${item.sku}</td>
                            <td class="text-right">${item.quantity}</td>
                            <td class="text-right">৳${item.unitPrice.toFixed(2)}</td>
                            <td class="text-right">৳${item.taxAmount.toFixed(2)}</td>
                            <td class="text-right">${item.taxRate.toFixed(2)}%</td>
                            <td class="text-center">${item.taxIncluded ? 'Yes' : 'No'}</td>
                            <td class="text-right">৳${item.subtotal.toFixed(2)}</td>
                        </tr>
                    `
                        )
                        .join('')}
                </tbody>
            </table>
        `);

        // Summary
        if (processedTaxData.length > 0) {
            printWindow.document.write(`
                <div class="summary">
                    <div class="summary-row">
                        <span class="summary-label">Total Records:</span>
                        <span class="summary-value">${taxSummary.totalRecords}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Total Tax Collected:</span>
                        <span class="summary-value">৳${taxSummary.totalTaxAmount?.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Total Subtotal:</span>
                        <span class="summary-value">৳${taxSummary.totalSubtotal?.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Average Tax Rate:</span>
                        <span class="summary-value">${taxSummary.averageTaxRate?.toFixed(2)}%</span>
                    </div>
                </div>
            `);
        }

        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    if (ordersLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <ReportHeader title="Tax Report" subtitle="Comprehensive tax analysis" showStoreSelector={true} selectedStoreId={selectedStoreId} onStoreChange={handleStoreChange} />
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="animate-pulse">
                            <div className="mb-4 h-8 rounded bg-gray-200"></div>
                            <div className="h-64 rounded bg-gray-200"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Filter Controls */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow">
                    <h3 className="mb-4 flex items-center text-lg font-medium text-gray-900">
                        <Filter className="mr-2 h-5 w-5" />
                        Filter Options
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Date Range</label>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            >
                                {dateFilterOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {dateFilter === 'custom' && (
                            <>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">From Date</label>
                                    <input
                                        type="date"
                                        value={customDateFrom}
                                        onChange={(e) => setCustomDateFrom(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">To Date</label>
                                    <input
                                        type="date"
                                        value={customDateTo}
                                        onChange={(e) => setCustomDateTo(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Report Table */}
                <div className="rounded-lg bg-white shadow">
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <div className="flex space-x-3">
                            <button
                                onClick={exportToCSV}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </button>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </button>
                        </div>
                    </div>

                    <div ref={printRef} className="print-content">
                        <ReportHeader
                            title="Tax Report"
                            subtitle="Comprehensive tax analysis and reporting"
                            showStoreSelector={true}
                            selectedStoreId={selectedStoreId}
                            onStoreChange={handleStoreChange}
                        />

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Order</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product Name</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Qty</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Unit Price</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Tax Amount</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Tax Rate (%)</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Tax Included</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {processedTaxData.length > 0 ? (
                                        processedTaxData.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{item.invoice}</div>
                                                        <div className="text-gray-500">{item.date}</div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                                                    <div className="text-sm text-gray-500">{item.sku}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">{item.quantity}</td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">৳{item.unitPrice.toFixed(2)}</td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                    <span className={`font-medium ${item.taxAmount > 0 ? 'text-green-600' : 'text-gray-400'}`}>৳{item.taxAmount.toFixed(2)}</span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">{item.taxRate.toFixed(2)}%</td>
                                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                            item.taxIncluded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {item.taxIncluded ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">৳{item.subtotal.toFixed(2)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center text-sm text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <Receipt className="mb-4 h-12 w-12 text-gray-400" />
                                                    <p>No tax data found for the selected filters</p>
                                                    <p className="mt-2 text-xs">Try adjusting your date range or store selection</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {processedTaxData.length > 0 && (
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                                    <div className="text-center">
                                        <p className="font-semibold text-gray-900">Total Records</p>
                                        <p className="text-gray-600">{taxSummary.totalRecords}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-gray-900">Total Tax Collected</p>
                                        <p className="font-bold text-green-600">৳{taxSummary.totalTaxAmount?.toFixed(2)}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-gray-900">Total Subtotal</p>
                                        <p className="font-bold text-blue-600">৳{taxSummary.totalSubtotal?.toFixed(2)}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-gray-900">Average Tax Rate</p>
                                        <p className="font-bold text-purple-600">{taxSummary.averageTaxRate?.toFixed(2)}%</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxReportComponent;
