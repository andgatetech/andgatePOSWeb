'use client';
import { Download, Filter, Printer, Receipt } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import ReportHeader from '@/__components/ReportHeader';
import { useGetStockAdjustmentsQuery } from '@/store/features/StockAdjustment/stockAdjustmentApi';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isToday from 'dayjs/plugin/isToday';

dayjs.extend(isoWeek);
dayjs.extend(isToday);

const StockAdjustmentListPage = () => {
    const [selectedStoreId, setSelectedStoreId] = useState(null);
    const [adjustmentTypeId, setAdjustmentTypeId] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [customDateFrom, setCustomDateFrom] = useState('');
    const [customDateTo, setCustomDateTo] = useState('');
    const printRef = useRef();

    const getDateRange = (filter: string) => {
        const now = dayjs();

        switch (filter) {
            case 'today':
                return { start: now.startOf('day'), end: now.endOf('day') };

            case 'yesterday':
                return {
                    start: now.subtract(1, 'day').startOf('day'),
                    end: now.subtract(1, 'day').endOf('day'),
                };

            case 'thisWeek':
                return { start: now.startOf('week'), end: now.endOf('week') };

            case 'lastWeek':
                return {
                    start: now.subtract(1, 'week').startOf('week'),
                    end: now.subtract(1, 'week').endOf('week'),
                };

            case 'thisMonth':
                return { start: now.startOf('month'), end: now.endOf('month') };

            case 'lastMonth':
                return {
                    start: now.subtract(1, 'month').startOf('month'),
                    end: now.subtract(1, 'month').endOf('month'),
                };

            case 'last30Days':
                return { start: now.subtract(30, 'day'), end: now };

            case 'last90Days':
                return { start: now.subtract(90, 'day'), end: now };

            case 'thisYear':
                return { start: now.startOf('year'), end: now.endOf('year') };

            case 'custom':
                if (customDateFrom && customDateTo) {
                    return {
                        start: dayjs(customDateFrom).startOf('day'),
                        end: dayjs(customDateTo).endOf('day'), // include full "to" date
                    };
                }
                return null;

            default:
                return null;
        }
    };
    const range = getDateRange(dateFilter);
    const { data: adjustmentsData, isLoading } = useGetStockAdjustmentsQuery({
        store_id: selectedStoreId || undefined,
        adjustment_type_id: adjustmentTypeId || undefined,
        // from: customDateFrom || undefined,
        // to: customDateTo || undefined,
        // from: range?.start.format('YYYY-MM-DD'),
        // to: range?.end.format('YYYY-MM-DD'),
        from: range ? range.start.format('YYYY-MM-DD HH:mm:ss') : undefined,
        to: range ? range.end.format('YYYY-MM-DD HH:mm:ss') : undefined,
    });

    const handleStoreChange = (storeId) => {
        setSelectedStoreId(storeId || null);
    };

    // Date filter options
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

    // Process adjustments
    const processedAdjustments = useMemo(() => {
        if (!adjustmentsData?.data) return [];

        return adjustmentsData.data.map((adj) => ({
            id: adj.id,
            reference: adj.reference_no,
            product: adj.product?.product_name,
            store: adj.product?.store?.store_name,
            adjustmentType: adj.adjustment_type?.type,
            reason: adj.reason,
            previousStock: adj.previous_stock,
            adjustedStock: adj.adjusted_stock,
            direction: adj.direction, // increase / decrease
            user: adj.user?.name,
            date: new Date(adj.created_at).toLocaleDateString(),
            dateTime: new Date(adj.created_at),
        }));
    }, [adjustmentsData]);

    // Summary
    const summary = useMemo(() => {
        if (!processedAdjustments.length) return {};

        const total = processedAdjustments.length;
        const increased = processedAdjustments.filter((a) => a.direction === 'increase').length;
        const decreased = processedAdjustments.filter((a) => a.direction === 'decrease').length;

        return { total, increased, decreased };
    }, [processedAdjustments]);

    const exportToPDF = async () => {
        if (!printRef.current) return;

        const element = printRef.current;

        // Use html2canvas to capture the content
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`stock-adjustments-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Reference', 'Product', 'Store', 'Adjustment Type', 'Direction', 'Previous Stock', 'Adjusted Stock', 'Reason', 'User', 'Date'];

        const csvContent = [
            headers.join(','),
            ...processedAdjustments.map((item) =>
                [item.reference, `"${item.product}"`, item.store, item.adjustmentType, item.direction, item.previousStock, item.adjustedStock, `"${item.reason}"`, item.user, item.date].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-adjustments-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <ReportHeader title="Stock Adjustments" subtitle="List of all stock adjustments" showStoreSelector={true} selectedStoreId={selectedStoreId} onStoreChange={handleStoreChange} />
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
                {/* Filters */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow">
                    <h3 className="mb-4 flex items-center text-lg font-medium text-gray-900">
                        <Filter className="mr-2 h-5 w-5" /> Filter Options
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
                                    <label className="mb-2 block text-sm font-medium text-gray-700">From</label>
                                    <input type="date" value={customDateFrom} onChange={(e) => setCustomDateFrom(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">To</label>
                                    <input type="date" value={customDateTo} onChange={(e) => setCustomDateTo(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg bg-white shadow">
                    <div className="flex justify-between border-b border-gray-200 px-6 py-4">
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
                            <button
                                onClick={exportToPDF}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </button>
                        </div>
                    </div>

                    <div ref={printRef} className="print-content">
                        <ReportHeader title="Stock Adjustments" subtitle="List of all stock adjustments" showStoreSelector={true} selectedStoreId={selectedStoreId} onStoreChange={handleStoreChange} />

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Reference</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Store</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Direction</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Prev Stock</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Adj Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {processedAdjustments.length > 0 ? (
                                        processedAdjustments.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 text-sm">{item.reference}</td>
                                                <td className="px-6 py-4 text-sm">{item.product}</td>
                                                <td className="px-6 py-4 text-sm">{item.store}</td>
                                                <td className="px-6 py-4 text-sm">{item.adjustmentType}</td>
                                                <td className={`px-6 py-4 text-sm font-semibold ${item.direction === 'increase' ? 'text-green-600' : 'text-red-600'}`}>{item.direction}</td>

                                                <td className="px-6 py-4 text-right text-sm">{item.previousStock}</td>
                                                <td className="px-6 py-4 text-right text-sm">{item.adjustedStock}</td>
                                                <td className="px-6 py-4 text-sm">{item.user}</td>
                                                <td className="px-6 py-4 text-sm">{item.date}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="px-6 py-12 text-center text-sm text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <Receipt className="mb-4 h-12 w-12 text-gray-400" />
                                                    <p>No stock adjustments found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary */}
                        {processedAdjustments.length > 0 && (
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                                    <div>
                                        <p className="font-semibold">Total Adjustments</p>
                                        <p>{summary.total}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-green-600">Increased</p>
                                        <p>{summary.increased}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-red-600">Decreased</p>
                                        <p>{summary.decreased}</p>
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

export default StockAdjustmentListPage;
