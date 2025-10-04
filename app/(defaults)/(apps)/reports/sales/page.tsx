'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetAllOrdersQuery } from '@/store/features/Order/Order';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
    ChevronLeft, 
    ChevronRight, 
    DollarSign, 
    Download, 
    FileText, 
    Printer, 
    TrendingUp,
    ShoppingCart,
    CheckCircle,
    AlertCircle,
    XCircle
} from 'lucide-react';
import { useRef, useState } from 'react';
import UniversalFilter, { FilterOptions } from '@/__components/Universalfilters';

const SalesReportPage = () => {
    const printRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const { currentStoreId, userStores } = useCurrentStore();

    // Filter state
    const [filters, setFilters] = useState({
        search: '',
        store_id: currentStoreId || undefined,
        payment_status: undefined,
        from_date: '',
        to_date: '',
        per_page: 15,
        page: 1,
    });

    // Fetch orders with filters
    const queryParams = {
        ...(filters.store_id && { store_id: filters.store_id }),
        ...(filters.search && { search: filters.search }),
        ...(filters.payment_status && filters.payment_status !== 'all' && { payment_status: filters.payment_status }),
        ...(filters.from_date && { start_date: filters.from_date }),
        ...(filters.to_date && { end_date: filters.to_date }),
    };

    const { data: response, isLoading } = useGetAllOrdersQuery(queryParams);
    const orders = response?.data || [];

    // Manual pagination since API doesn't provide pagination
    const totalOrders = orders.length;
    const totalPages = Math.ceil(totalOrders / filters.per_page);
    const startIndex = (filters.page - 1) * filters.per_page;
    const endIndex = startIndex + filters.per_page;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    // Calculate summary statistics
    const summary = {
        totalOrders: totalOrders,
        paidOrders: orders.filter((o) => o.payment_status === 'paid').length,
        pendingOrders: orders.filter((o) => o.payment_status === 'pending').length,
        failedOrders: orders.filter((o) => o.payment_status === 'failed').length,
        totalRevenue: orders
            .filter((o) => o.payment_status === 'paid')
            .reduce((sum, o) => sum + parseFloat(o.grand_total || 0), 0),
        totalSales: orders.reduce((sum, o) => sum + parseFloat(o.grand_total || 0), 0),
        avgOrderValue: totalOrders > 0 
            ? orders.reduce((sum, o) => sum + parseFloat(o.grand_total || 0), 0) / totalOrders 
            : 0,
    };

    // Handle filter changes from UniversalFilter
    const handleFilterChange = (newFilters: FilterOptions) => {
        setFilters((prev) => ({
            ...prev,
            search: newFilters.search || '',
            store_id: newFilters.storeId === 'all' ? undefined : newFilters.storeId,
            payment_status: newFilters.paymentStatus === 'all' ? undefined : newFilters.paymentStatus,
            from_date: newFilters.dateRange?.startDate || '',
            to_date: newFilters.dateRange?.endDate || '',
            page: 1,
        }));
    };

    // Print functionality
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const headerHtml = headerRef.current?.innerHTML || '';
        const tableHtml = printRef.current?.innerHTML || '';

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sales Report</title>
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
                    .store-header {
                        text-align: center;
                        margin-bottom: 24px;
                    }
                    .store-name {
                        font-size: 28px;
                        font-weight: bold;
                        color: #111827;
                        margin: 0;
                    }
                    .report-title {
                        font-size: 24px;
                        font-weight: 600;
                        color: #111827;
                        margin-top: 16px;
                        padding-top: 16px;
                        border-top: 1px solid #e5e7eb;
                    }
                    .status-paid { color: #059669; font-weight: bold; }
                    .status-pending { color: #d97706; font-weight: bold; }
                    .status-failed { color: #dc2626; font-weight: bold; }
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
        if (!orders.length) return;

        const headers = [
            'Invoice',
            'Customer Name',
            'Customer Phone',
            'Items Count',
            'Payment Status',
            'Payment Method',
            'Subtotal',
            'Tax',
            'Discount',
            'Grand Total',
            'Order Date'
        ];

        const csvContent = [
            headers.join(','),
            ...orders.map((order) =>
                [
                    `"${order.invoice}"`,
                    `"${order.customer?.name || 'Guest'}"`,
                    `"${order.customer?.phone || 'N/A'}"`,
                    order.items?.length || 0,
                    `"${order.payment_status}"`,
                    `"${order.transaction?.payment_method || 'N/A'}"`,
                    parseFloat(order.total || 0).toFixed(2),
                    parseFloat(order.tax || 0).toFixed(2),
                    parseFloat(order.discount || 0).toFixed(2),
                    parseFloat(order.grand_total || 0).toFixed(2),
                    `"${new Date(order.created_at).toLocaleDateString()}"`,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Download PDF functionality
    const handleDownloadPDF = async () => {
        if (!printRef.current || !headerRef.current) return;

        try {
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            tempContainer.style.width = '210mm';
            tempContainer.style.backgroundColor = 'white';
            tempContainer.style.padding = '20px';
            tempContainer.style.fontFamily = 'Arial, sans-serif';

            const headerClone = headerRef.current.cloneNode(true);
            const tableClone = printRef.current.cloneNode(true);

            tempContainer.appendChild(headerClone);
            tempContainer.appendChild(tableClone);
            document.body.appendChild(tempContainer);

            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
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
            pdf.save(`sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    // Handle page change
    const handlePageChange = (page) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    // Handle per page change
    const handlePerPageChange = (perPage) => {
        setFilters((prev) => ({ ...prev, per_page: perPage, page: 1 }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div ref={headerRef}>
                <div className="bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="store-header text-center">
                            <h1 className="store-name text-3xl font-bold text-gray-900">Agora</h1>
                            <p className="mt-2 text-sm text-gray-600">Store Management System</p>
                        </div>
                        <div className="mt-4 border-t border-gray-200 pt-4">
                            <h2 className="text-2xl font-semibold text-gray-900">Sales Report</h2>
                            <p className="mt-1 text-sm text-gray-600">Track and analyze all sales transactions</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Universal Filter */}
                <UniversalFilter
                    onFilterChange={handleFilterChange}
                    placeholder="Search by invoice, customer name, or phone..."
                    showStoreFilter={true}
                    showDateFilter={true}
                    showSearch={true}
                    customFilters={[
                        {
                            key: 'paymentStatus',
                            label: 'Payment Status',
                            type: 'select',
                            options: [
                                { value: 'paid', label: 'Paid' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'failed', label: 'Failed' },
                            ],
                            icon: <CheckCircle className="h-5 w-5 text-gray-400" />,
                            defaultValue: 'all',
                        },
                    ]}
                    className="mb-6"
                />

                {/* Action Buttons */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Export CSV
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">Total: {totalOrders} orders</div>
                        <select
                            value={filters.per_page}
                            onChange={(e) => handlePerPageChange(Number(e.target.value))}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value={10}>10 per page</option>
                            <option value={15}>15 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                        </select>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500">
                                    <ShoppingCart className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-3 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500">Total Orders</dt>
                                    <dd className="text-lg font-semibold text-gray-900">{summary.totalOrders}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
                                    <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-3 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500">Paid Orders</dt>
                                    <dd className="text-lg font-semibold text-green-600">{summary.paidOrders}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500">
                                    <DollarSign className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-3 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500">Total Revenue</dt>
                                    <dd className="text-lg font-semibold text-gray-900">৳{summary.totalRevenue.toFixed(2)}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-3 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500">Avg Order Value</dt>
                                    <dd className="text-lg font-semibold text-gray-900">৳{summary.avgOrderValue.toFixed(2)}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div ref={printRef} className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Invoice</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Payment Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Payment Method</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Subtotal</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Tax</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Discount</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Grand Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-500">
                                            Loading sales data...
                                        </td>
                                    </tr>
                                ) : paginatedOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-500">
                                            No sales found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.invoice}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="font-medium text-gray-900">{order.customer?.name || 'Guest Customer'}</div>
                                                <div className="text-xs text-gray-500">{order.customer?.phone || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-900">{order.items?.length || 0}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    order.payment_status === 'paid' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : order.payment_status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {order.payment_status === 'paid' && <CheckCircle className="mr-1 h-3 w-3" />}
                                                    {order.payment_status === 'pending' && <AlertCircle className="mr-1 h-3 w-3" />}
                                                    {order.payment_status === 'failed' && <XCircle className="mr-1 h-3 w-3" />}
                                                    {order.payment_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm capitalize text-gray-500">{order.transaction?.payment_method || 'N/A'}</td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-900">৳{parseFloat(order.total || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-900">৳{parseFloat(order.tax || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-900">৳{parseFloat(order.discount || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">৳{parseFloat(order.grand_total || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div>{new Date(order.created_at).toLocaleDateString('en-GB')}</div>
                                                <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(filters.page - 1)}
                                    disabled={filters.page === 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(filters.page + 1)}
                                    disabled={filters.page === totalPages}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, totalOrders)}</span> of{' '}
                                        <span className="font-medium">{totalOrders}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                        <button
                                            onClick={() => handlePageChange(filters.page - 1)}
                                            disabled={filters.page === 1}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter((page) => page === 1 || page === totalPages || Math.abs(page - filters.page) <= 1)
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
                                                                filters.page === page ? 'z-10 bg-blue-600 text-white focus:ring-blue-500' : 'text-gray-900'
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
                                                            filters.page === page ? 'z-10 bg-blue-600 text-white focus:ring-blue-500' : 'text-gray-900'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            })}
                                        <button
                                            onClick={() => handlePageChange(filters.page + 1)}
                                            disabled={filters.page === totalPages}
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

export default SalesReportPage;