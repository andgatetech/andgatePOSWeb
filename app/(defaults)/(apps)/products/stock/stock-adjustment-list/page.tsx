'use client';

import ReportHeader from '@/__components/ReportHeader';
import { useGetAdjustmentTypesQuery } from '@/store/features/AdjustmentType/adjustmentTypeApi';
import { useGetStockAdjustmentsQuery } from '@/store/features/StockAdjustment/stockAdjustmentApi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ChevronLeft, ChevronRight, Download, FileText, Printer, TrendingDown, TrendingUp } from 'lucide-react';
import { useRef, useState } from 'react';

interface StockAdjustment {
    id: number;
    product_id: number;
    product_stock_type_id: number;
    previous_stock: number;
    adjusted_stock: number;
    reference_no: string;
    reason: string;
    user_id: number;
    direction: 'increase' | 'decrease';
    created_at: string;
    updated_at: string;
    product: {
        id: number;
        product_name: string;
        sku: string;
        store: {
            id: number;
            store_name: string;
        };
    };
    product_stock_type: {
        id: number;
        type: string;
        description: string;
    };
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface StockAdjustmentResponse {
    current_page: number;
    data: StockAdjustment[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

const StockAdjustmentReportPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [stockTypeId, setStockTypeId] = useState('');
    const [direction, setDirection] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [customDateFrom, setCustomDateFrom] = useState('');
    const [customDateTo, setCustomDateTo] = useState('');
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

    const printRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    // Get date range based on filter
    const getDateRange = (filter: string) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (filter) {
            case 'today':
                return {
                    from: today.toISOString().split('T')[0],
                    to: today.toISOString().split('T')[0],
                };
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                return {
                    from: yesterday.toISOString().split('T')[0],
                    to: yesterday.toISOString().split('T')[0],
                };
            case 'thisWeek':
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                return {
                    from: startOfWeek.toISOString().split('T')[0],
                    to: today.toISOString().split('T')[0],
                };
            case 'lastWeek':
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                const lastWeekEnd = new Date(lastWeekStart);
                lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
                return {
                    from: lastWeekStart.toISOString().split('T')[0],
                    to: lastWeekEnd.toISOString().split('T')[0],
                };
            case 'thisMonth':
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                return {
                    from: startOfMonth.toISOString().split('T')[0],
                    to: today.toISOString().split('T')[0],
                };
            case 'lastMonth':
                const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                return {
                    from: lastMonthStart.toISOString().split('T')[0],
                    to: lastMonthEnd.toISOString().split('T')[0],
                };
            case 'last30Days':
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                return {
                    from: thirtyDaysAgo.toISOString().split('T')[0],
                    to: today.toISOString().split('T')[0],
                };
            case 'last90Days':
                const ninetyDaysAgo = new Date(today);
                ninetyDaysAgo.setDate(today.getDate() - 90);
                return {
                    from: ninetyDaysAgo.toISOString().split('T')[0],
                    to: today.toISOString().split('T')[0],
                };
            case 'thisYear':
                const startOfYear = new Date(today.getFullYear(), 0, 1);
                return {
                    from: startOfYear.toISOString().split('T')[0],
                    to: today.toISOString().split('T')[0],
                };
            case 'custom':
                if (customDateFrom && customDateTo) {
                    return {
                        from: customDateFrom,
                        to: customDateTo,
                    };
                }
                return null;
            default:
                return null;
        }
    };

    const dateRange = getDateRange(dateFilter);

    // Build query parameters
    const queryParams: any = {
        page: currentPage,
        per_page: perPage,
    };

    if (selectedStoreId && selectedStoreId !== '' && selectedStoreId !== 'all') {
        queryParams.store_id = selectedStoreId;
    }
    if (stockTypeId && stockTypeId !== '' && stockTypeId !== 'all') {
        queryParams.product_stock_type_id = stockTypeId;
    }
    if (direction && direction !== '' && direction !== 'all') {
        queryParams.direction = direction;
    }
    if (dateRange) {
        queryParams.from = dateRange.from + ' 00:00:00';
        queryParams.to = dateRange.to + ' 23:59:59';
    }

    // API Queries
    const { data: adjustmentResponse, isLoading: adjustmentLoading, error: adjustmentError } = useGetStockAdjustmentsQuery(queryParams);

    // const { data: stockTypesResponse, isLoading: stockTypesLoading } = useGetStockTypesQuery();
    const { data: stockTypesResponse, isLoading: stockTypesLoading } = useGetAdjustmentTypesQuery();

    const adjustmentData = adjustmentResponse as StockAdjustmentResponse;
    const adjustments = adjustmentData?.data || [];
    const stockTypes = stockTypesResponse?.data || [];
    const pagination = adjustmentData;

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

    // Direction options
    const directionOptions = [
        { value: 'all', label: 'All Directions' },
        { value: 'increase', label: 'Increase' },
        { value: 'decrease', label: 'Decrease' },
    ];

    // Get direction badge color
    const getDirectionBadgeColor = (direction: string) => {
        switch (direction) {
            case 'increase':
                return 'bg-green-100 text-green-800';
            case 'decrease':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get stock type badge color
    const getStockTypeBadgeColor = (stockType: string) => {
        switch (stockType) {
            case 'damage':
                return 'bg-red-100 text-red-800';
            case 'lost':
                return 'bg-orange-100 text-orange-800';
            case 'in-stock':
                return 'bg-green-100 text-green-800';
            case 'stock-out':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Print functionality
    const handlePrint = async () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const headerHtml = headerRef.current?.innerHTML || '';
        const tableHtml = printRef.current?.innerHTML || '';

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Stock Adjustment Report</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background: white; 
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px; 
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 8px; 
                        text-align: left; 
                    }
                    th { 
                        background-color: #f9fafb; 
                        font-weight: bold; 
                    }
                    .header-content {
                        border-bottom: 1px solid #e5e7eb;
                        padding-bottom: 20px;
                        margin-bottom: 20px;
                    }
                    .store-logo {
                        width: 60px;
                        height: 60px;
                        object-fit: contain;
                        border: 2px solid #e5e7eb;
                        border-radius: 8px;
                        margin-right: 12px;
                    }
                    .store-header {
                        text-align: center;
                        margin-bottom: 24px;
                    }
                    .store-title {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 12px;
                    }
                    .store-name {
                        font-size: 28px;
                        font-weight: bold;
                        color: #111827;
                        margin: 0;
                    }
                    .store-subtitle {
                        font-size: 18px;
                        font-weight: 500;
                        color: #4b5563;
                        margin-bottom: 8px;
                    }
                    .store-details {
                        font-size: 14px;
                        color: #4b5563;
                        line-height: 1.4;
                    }
                    .report-title {
                        font-size: 24px;
                        font-weight: 600;
                        color: #111827;
                        margin-top: 16px;
                        padding-top: 16px;
                        border-top: 1px solid #e5e7eb;
                    }
                    .status-badge {
                        display: inline-flex;
                        align-items: center;
                        padding: 2px 8px;
                        border-radius: 9999px;
                        font-size: 12px;
                        font-weight: 500;
                        margin: 2px;
                    }
                    .direction-increase { background-color: #dcfce7; color: #166534; }
                    .direction-decrease { background-color: #fee2e2; color: #991b1b; }
                    .stock-damage { background-color: #fee2e2; color: #991b1b; }
                    .stock-lost { background-color: #fed7aa; color: #9a3412; }
                    .stock-in { background-color: #dcfce7; color: #166534; }
                    .stock-out { background-color: #fef3c7; color: #92400e; }
                    .stock-default { background-color: #f3f4f6; color: #374151; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <div class="header-content">${headerHtml}</div>
                <div>${tableHtml}</div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    // Export to CSV
    const handleExportCSV = () => {
        if (!adjustments.length) return;

        const headers = ['Reference No', 'Product', 'Store', 'Stock Type', 'Direction', 'Previous Stock', 'Adjusted Stock', 'Reason', 'User', 'Date'];

        const csvContent = [
            headers.join(','),
            ...adjustments.map((adjustment) =>
                [
                    `"${adjustment.reference_no}"`,
                    `"${adjustment.product?.product_name || 'N/A'}"`,
                    `"${adjustment.product?.store?.store_name || 'N/A'}"`,
                    `"${adjustment.product_stock_type?.type || 'N/A'}"`,
                    `"${adjustment.direction}"`,
                    adjustment.previous_stock,
                    adjustment.adjusted_stock,
                    `"${adjustment.reason || 'N/A'}"`,
                    `"${adjustment.user?.name || 'N/A'}"`,
                    `"${new Date(adjustment.created_at).toLocaleDateString()}"`,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `stock-adjustments-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Download PDF functionality
    const handleDownloadPDF = async () => {
        if (!printRef.current || !headerRef.current) return;

        try {
            const loadingToast = document.createElement('div');
            loadingToast.textContent = 'Generating PDF...';
            loadingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
            document.body.appendChild(loadingToast);

            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            tempContainer.style.width = '210mm';
            tempContainer.style.backgroundColor = 'white';
            tempContainer.style.padding = '20px';
            tempContainer.style.fontFamily = 'Arial, sans-serif';

            const headerClone = headerRef.current.cloneNode(true) as HTMLElement;
            const tableClone = printRef.current.cloneNode(true) as HTMLElement;

            headerClone.style.borderBottom = '1px solid #e5e7eb';
            headerClone.style.paddingBottom = '20px';
            headerClone.style.marginBottom = '20px';

            tempContainer.appendChild(headerClone);
            tempContainer.appendChild(tableClone);
            document.body.appendChild(tempContainer);

            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: tempContainer.scrollWidth,
                height: tempContainer.scrollHeight,
            });

            document.body.removeChild(tempContainer);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`stock-adjustments-report-${new Date().toISOString().split('T')[0]}.pdf`);

            document.body.removeChild(loadingToast);

            const successToast = document.createElement('div');
            successToast.textContent = 'PDF downloaded successfully!';
            successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
            document.body.appendChild(successToast);
            setTimeout(() => document.body.removeChild(successToast), 3000);
        } catch (error) {
            console.error('Error generating PDF:', error);
            const errorToast = document.createElement('div');
            errorToast.textContent = 'Failed to generate PDF. Please try again.';
            errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
            document.body.appendChild(errorToast);
            setTimeout(() => document.body.removeChild(errorToast), 3000);
        }
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle store change
    const handleStoreChange = (storeId: string) => {
        setSelectedStoreId(storeId);
        setCurrentPage(1);
    };

    // Calculate summary statistics
    const summary = {
        total: adjustments.length,
        increases: adjustments.filter((adj) => adj.direction === 'increase').length,
        decreases: adjustments.filter((adj) => adj.direction === 'decrease').length,
    };

    if (adjustmentError) {
        return (
            <div className="min-h-screen bg-gray-50">
                <ReportHeader
                    title="Stock Adjustment Report"
                    subtitle="Track all stock adjustments and changes"
                    showStoreSelector={true}
                    selectedStoreId={selectedStoreId}
                    onStoreChange={handleStoreChange}
                />
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-red-50 p-4">
                        <div className="text-red-800">
                            <h3 className="text-sm font-medium">Error loading adjustment data</h3>
                            <p className="mt-1 text-sm">Please try again later.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div ref={headerRef}>
                <ReportHeader
                    title="Stock Adjustment Report"
                    subtitle="Track all stock adjustments and changes"
                    showStoreSelector={true}
                    selectedStoreId={selectedStoreId}
                    onStoreChange={handleStoreChange}
                />
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Action Buttons */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Export CSV
                        </button>
                    </div>

                    <div className="text-sm text-gray-500">Total: {pagination?.total || 0} adjustments</div>
                </div>

                {/* Summary Cards */}
                {adjustments.length > 0 && (
                    <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div className="ml-3 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Total Adjustments</dt>
                                        <dd className="text-lg font-semibold text-gray-900">{summary.total}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
                                        <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div className="ml-3 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Stock Increases</dt>
                                        <dd className="text-lg font-semibold text-gray-900">{summary.increases}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500">
                                        <TrendingDown className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div className="ml-3 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Stock Decreases</dt>
                                        <dd className="text-lg font-semibold text-gray-900">{summary.decreases}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        {/* Date Range Filter */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Date Range</label>
                            <select
                                value={dateFilter}
                                onChange={(e) => {
                                    setDateFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                            >
                                {dateFilterOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Stock Type Filter */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Stock Type</label>
                            <select
                                value={stockTypeId}
                                onChange={(e) => {
                                    setStockTypeId(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                disabled={stockTypesLoading}
                            >
                                <option value="">All Stock Types</option>
                                {stockTypes.map((type: any) => (
                                    <option key={type.id} value={type.id}>
                                        {type.type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Direction Filter */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Direction</label>
                            <select
                                value={direction}
                                onChange={(e) => {
                                    setDirection(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                            >
                                {directionOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Per Page */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Items per page</label>
                            <select
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                            >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>

                    {/* Custom Date Range */}
                    {dateFilter === 'custom' && (
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">From Date</label>
                                <input
                                    type="date"
                                    value={customDateFrom}
                                    onChange={(e) => {
                                        setCustomDateFrom(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <input
                                    type="date"
                                    value={customDateTo}
                                    onChange={(e) => {
                                        setCustomDateTo(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div ref={printRef} className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reference No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Store</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stock Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Direction</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Previous Stock</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Adjusted Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {adjustmentLoading ? (
                                    Array.from({ length: perPage }).map((_, index) => (
                                        <tr key={index} className="animate-pulse">
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-32 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-32 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-24 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-20 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-20 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-16 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-16 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-32 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-20 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-24 rounded bg-gray-200"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : adjustments.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-500">
                                            No stock adjustments found
                                        </td>
                                    </tr>
                                ) : (
                                    adjustments.map((adjustment) => (
                                        <tr key={adjustment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{adjustment.reference_no}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div>
                                                    <div className="font-medium">{adjustment.product?.product_name || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">{adjustment.product?.sku || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{adjustment.product?.store?.store_name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStockTypeBadgeColor(
                                                        adjustment.product_stock_type?.type || ''
                                                    )}`}
                                                >
                                                    {adjustment.product_stock_type?.type || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDirectionBadgeColor(adjustment.direction)}`}>
                                                    {adjustment.direction === 'increase' ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                                                    {adjustment.direction === 'increase' ? 'Increase' : 'Decrease'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-900">{Number(adjustment.previous_stock).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-900">{Number(adjustment.adjusted_stock).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="max-w-xs truncate" title={adjustment.reason || 'N/A'}>
                                                    {adjustment.reason || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{adjustment.user?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div>
                                                    <div>{new Date(adjustment.created_at).toLocaleDateString()}</div>
                                                    <div className="text-xs text-gray-400">{new Date(adjustment.created_at).toLocaleTimeString()}</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.last_page}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{pagination.from}</span> to <span className="font-medium">{pagination.to}</span> of{' '}
                                        <span className="font-medium">{pagination.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                                            .filter((page) => page === 1 || page === pagination.last_page || Math.abs(page - currentPage) <= 1)
                                            .map((page, index, array) => {
                                                if (index > 0 && array[index - 1] < page - 1) {
                                                    return [
                                                        <span
                                                            key={`ellipsis-${page}`}
                                                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                                                        >
                                                            ...
                                                        </span>,
                                                        <button
                                                            key={page}
                                                            onClick={() => handlePageChange(page)}
                                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                                currentPage === page ? 'z-10 bg-blue-600 text-white focus:ring-blue-500' : 'text-gray-900'
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>,
                                                    ];
                                                }
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                            currentPage === page ? 'z-10 bg-blue-600 text-white focus:ring-blue-500' : 'text-gray-900'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            })}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === pagination.last_page}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockAdjustmentReportPage;
