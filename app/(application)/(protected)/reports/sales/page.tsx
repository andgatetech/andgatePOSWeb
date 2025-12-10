'use client';
import SalesReportFilter from '@/__components/SalesReportFilter';
import { handleExportCSV, handleExportPDF, handlePrint } from '@/__components/salesReportHelper';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import Loading from '@/components/layouts/loading';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetSalesReportMutation } from '@/store/features/reports/reportApi';
import { AlertCircle, CheckCircle, DollarSign, FileDown, FileSpreadsheet, Printer, ShoppingCart, TrendingUp, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

interface SalesReportItem {
    invoice: string;
    customer_name: string;
    customer_phone: string;
    items_count: number;
    payment_status: string;
    payment_method: string;
    subtotal: number;
    tax: number;
    discount: number;
    grand_total: number;
    order_date: string;
    store?: string;
    category?: string;
    brand?: string;
}

interface SalesReportData {
    generated_at?: string;
    filters?: {
        store_ids: number[];
        start_date?: string;
        end_date?: string;
        payment_status?: string;
        format: string;
    };
    summary: {
        total_orders: number;
        paid_orders: number;
        pending_orders: number;
        failed_orders: number;
        total_revenue: number;
        total_sales: number;
        avg_order_value: number;
    };
    items: SalesReportItem[];
    pagination?: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
}

const SalesReportPage = () => {
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [reportData, setReportData] = useState<SalesReportData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const printRef = useRef<HTMLDivElement>(null);

    const { currentStoreId, currentStore } = useCurrentStore();

    const [getSalesReport, { isLoading }] = useGetSalesReportMutation();

    // Fetch report data with pagination
    const fetchReport = useCallback(
        async (params: Record<string, any>, format: string = 'json') => {
            try {
                const payload = {
                    ...params,
                    format,
                    page: currentPage,
                    per_page: itemsPerPage,
                };

                const response = await getSalesReport(payload).unwrap();

                if (format === 'json') {
                    const apiData = response;
                    const apiSummary = apiData?.summary || {};

                    const transformedData: SalesReportData = {
                        ...apiData,
                        summary: {
                            total_orders: apiSummary.orders_count ?? 0,
                            paid_orders: apiSummary.paid_orders ?? 0,
                            pending_orders: apiSummary.pending_orders ?? 0,
                            failed_orders: apiSummary.failed_orders ?? 0,
                            total_revenue: Number(apiSummary.total_grand ?? apiSummary.total_revenue ?? 0),
                            total_sales: Number(apiSummary.total_sales ?? 0),
                            avg_order_value: apiSummary.orders_count > 0 ? Number(apiSummary.total_grand ?? 0) / apiSummary.orders_count : 0,
                        },
                        items: apiData.items.map((item: any) => ({
                            invoice: item.invoice,
                            customer_name: item.customer_name || 'Walk-in Customer',
                            customer_phone: item.customer_phone || 'N/A',
                            items_count: Number(item.items_count || 0),
                            payment_status: item.payment_status || 'paid',
                            payment_method: item.payment_method || 'N/A',
                            subtotal: Number(item.subtotal || 0),
                            tax: Number(item.tax || 0),
                            discount: Number(item.discount || 0),
                            grand_total: Number(item.grand_total || 0),
                            order_date: item.order_date,
                            store: item.store,
                            category: item.category,
                            brand: item.brand,
                        })),
                    };

                    setReportData(transformedData);
                }
            } catch (error: any) {
                console.error('Error fetching sales report:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error?.data?.message || 'Failed to fetch sales report',
                });
            }
        },
        [getSalesReport, currentPage, itemsPerPage]
    );

    // Trigger API call when pagination changes
    useEffect(() => {
        if (Object.keys(filterParams).length > 0) {
            fetchReport(filterParams);
        }
    }, [currentPage, itemsPerPage, filterParams, fetchReport]);

    // Handle filter changes
    const handleFilterChange = useCallback(
        (params: Record<string, any>) => {
            setFilterParams(params);
            setCurrentPage(1); // Reset to first page when filters change

            // Create a temp fetch function with page 1
            const fetchWithNewFilters = async () => {
                try {
                    const payload = {
                        ...params,
                        format: 'json',
                        page: 1,
                        per_page: itemsPerPage,
                    };

                    const response = await getSalesReport(payload).unwrap();
                    const apiData = response;
                    const apiSummary = apiData?.summary || {};

                    const transformedData: SalesReportData = {
                        ...apiData,
                        summary: {
                            total_orders: apiSummary.orders_count ?? 0,
                            paid_orders: apiSummary.paid_orders ?? 0,
                            pending_orders: apiSummary.pending_orders ?? 0,
                            failed_orders: apiSummary.failed_orders ?? 0,
                            total_revenue: Number(apiSummary.total_grand ?? apiSummary.total_revenue ?? 0),
                            total_sales: Number(apiSummary.total_sales ?? 0),
                            avg_order_value: apiSummary.orders_count > 0 ? Number(apiSummary.total_grand ?? 0) / apiSummary.orders_count : 0,
                        },
                        items: apiData.items.map((item: any) => ({
                            invoice: item.invoice,
                            customer_name: item.customer_name || 'Walk-in Customer',
                            customer_phone: item.customer_phone || 'N/A',
                            items_count: Number(item.items_count || 0),
                            payment_status: item.payment_status || 'paid',
                            payment_method: item.payment_method || 'N/A',
                            subtotal: Number(item.subtotal || 0),
                            tax: Number(item.tax || 0),
                            discount: Number(item.discount || 0),
                            grand_total: Number(item.grand_total || 0),
                            order_date: item.order_date,
                            store: item.store,
                            category: item.category,
                            brand: item.brand,
                        })),
                    };

                    setReportData(transformedData);
                } catch (error: any) {
                    console.error('Error fetching sales report:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error?.data?.message || 'Failed to fetch sales report',
                    });
                }
            };

            fetchWithNewFilters();
        },
        [getSalesReport, itemsPerPage]
    );

    // Handle page changes
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (perPage: number) => {
        setItemsPerPage(perPage);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    /**
     * Generate Print/PDF Content with Store Header
     * Professional POS-style black & white layout
     */
    const handlePrintReport = async () => {
        if (!reportData) return;

        try {
            await handlePrint(reportData, currentStore);
        } catch (error) {
            console.error('Print failed:', error);
            Swal.fire({
                icon: 'error',
                title: 'Print Failed',
                text: 'Failed to print the report. Please try again.',
            });
        }
    };

    const handleExportPDFReport = async () => {
        if (!reportData) return;

        try {
            Swal.fire({
                title: 'Generating PDF...',
                text: 'Please wait while we create your PDF',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            await handleExportPDF(reportData, currentStore);

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'PDF downloaded successfully',
                timer: 2000,
            });
        } catch (error) {
            console.error('PDF export failed:', error);
            Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: 'Failed to export PDF. Please try again.',
            });
        }
    };

    const handleExportCSVReport = async () => {
        if (!reportData) return;

        try {
            Swal.fire({
                title: 'Generating CSV...',
                text: 'Please wait...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            await handleExportCSV(reportData, currentStore);

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'CSV downloaded successfully',
                timer: 2000,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: 'Failed to export CSV',
            });
        }
    };

    // Table columns
    const columns: TableColumn[] = [
        {
            key: 'invoice',
            label: 'Invoice',
            sortable: true,
            render: (value) => <span className="font-medium text-blue-600">{value}</span>,
        },
        {
            key: 'customer_name',
            label: 'Customer',
            sortable: true,
            render: (value, row) => (
                <div>
                    <div className="font-medium text-gray-900">{value || 'Guest Customer'}</div>
                    <div className="text-xs text-gray-500">{row.customer_phone || 'N/A'}</div>
                </div>
            ),
        },
        {
            key: 'items_count',
            label: 'Items',
            render: (value) => <span className="text-center">{value}</span>,
        },
        {
            key: 'payment_status',
            label: 'Status',
            render: (value) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        value === 'paid' ? 'bg-green-100 text-green-800' : value === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                    {value === 'paid' && <CheckCircle className="mr-1 h-3 w-3" />}
                    {value === 'pending' && <AlertCircle className="mr-1 h-3 w-3" />}
                    {value === 'failed' && <XCircle className="mr-1 h-3 w-3" />}
                    {value}
                </span>
            ),
        },
        {
            key: 'payment_method',
            label: 'Payment Method',
            render: (value) => <span className="capitalize">{value || 'N/A'}</span>,
        },
        {
            key: 'subtotal',
            label: 'Subtotal',
            render: (value) => <span className="font-medium">৳{Number(value || 0).toFixed(2)}</span>,
        },
        {
            key: 'tax',
            label: 'Tax',
            render: (value) => <span>৳{Number(value || 0).toFixed(2)}</span>,
        },
        {
            key: 'discount',
            label: 'Discount',
            render: (value) => <span className="text-red-600">৳{Number(value || 0).toFixed(2)}</span>,
        },
        {
            key: 'grand_total',
            label: 'Grand Total',
            render: (value) => <span className="font-bold text-green-600">৳{Number(value || 0).toFixed(2)}</span>,
        },
        {
            key: 'order_date',
            label: 'Date',
            render: (value) => (
                <div>
                    <div>{new Date(value).toLocaleDateString('en-GB')}</div>
                    <div className="text-xs text-gray-400">{new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            ),
        },
    ];

    // Use data from API (server-side pagination)
    const paginatedData = reportData?.items || [];

    // Calculate total pages from API response or summary
    const totalPages = reportData?.pagination?.total_pages || Math.ceil((reportData?.summary?.total_orders || 0) / itemsPerPage);
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section - Responsive */}
            <div className="mb-4 rounded-xl bg-white p-4 shadow-sm sm:mb-6 sm:rounded-2xl sm:p-5 md:mb-8 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Logo and Title */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-2 shadow-lg sm:rounded-xl sm:p-3">
                            <ShoppingCart className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Sales Report</h1>
                            <p className="text-xs text-gray-500 sm:text-sm">Track and analyze all sales transactions</p>
                        </div>
                    </div>

                    {/* Export Buttons - Responsive */}
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <button
                            onClick={handlePrintReport}
                            disabled={!reportData || isLoading}
                            className="flex min-w-[100px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-600 px-3 py-2 text-sm text-white transition-all hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial sm:gap-2 sm:px-4 sm:py-2.5 sm:text-base"
                        >
                            <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Print</span>
                        </button>
                        <button
                            onClick={handleExportPDFReport}
                            disabled={!reportData || isLoading}
                            className="flex min-w-[100px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial sm:gap-2 sm:px-4 sm:py-2.5 sm:text-base"
                        >
                            <FileDown className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>PDF</span>
                        </button>
                        <button
                            onClick={handleExportCSVReport}
                            disabled={!reportData || isLoading}
                            className="flex min-w-[100px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial sm:gap-2 sm:px-4 sm:py-2.5 sm:text-base"
                        >
                            <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Excel</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
                <SalesReportFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Summary Cards */}
            {reportData && (
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Orders</p>
                            <ShoppingCart className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{reportData.summary.total_orders}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Paid Orders</p>
                            <CheckCircle className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{reportData.summary.paid_orders}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Revenue</p>
                            <DollarSign className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{Number(reportData?.summary?.total_revenue ?? 0).toFixed(2)}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Avg Order Value</p>
                            <TrendingUp className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{reportData.summary.avg_order_value.toFixed(2)}</p>
                    </div>
                </div>
            )}

            <div className="relative">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                        <Loading />
                    </div>
                )}

                {!isLoading && reportData && (
                    <ReusableTable
                        data={paginatedData}
                        columns={columns}
                        pagination={{
                            currentPage,
                            totalPages,
                            itemsPerPage,
                            totalItems: reportData?.pagination?.total || reportData?.summary?.total_orders || 0,
                            onPageChange: setCurrentPage,
                            onItemsPerPageChange: (n) => {
                                setItemsPerPage(n);
                                setCurrentPage(1);
                            },
                        }}
                        emptyState={{
                            icon: <ShoppingCart className="h-16 w-16" />,
                            title: 'No Sales Data Found',
                            description: 'Try adjusting your filters to see results.',
                        }}
                    />
                )}
            </div>

            {/* Print-Only View (Full Data) */}
            {!isLoading && reportData && (
                <div ref={printRef} className="hidden print:block">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold">Sales Report</h1>
                        <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                        {reportData?.filters?.start_date && reportData?.filters?.end_date && (
                            <p className="text-sm text-gray-600">
                                Period: {reportData.filters.start_date} to {reportData.filters.end_date}
                            </p>
                        )}
                    </div>

                    {/* Summary Section */}
                    <div className="mb-6 grid grid-cols-4 gap-4 border-b pb-4">
                        <div>
                            <p className="text-xs text-gray-600">Total Orders</p>
                            <p className="text-lg font-bold">{reportData.summary.total_orders}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Paid Orders</p>
                            <p className="text-lg font-bold">{reportData.summary.paid_orders}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Total Revenue</p>
                            <p className="text-lg font-bold">৳{Number(reportData?.summary?.total_revenue ?? 0).toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Avg Order Value</p>
                            <p className="text-lg font-bold">৳{reportData.summary.avg_order_value.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Full Table */}
                    <ReusableTable
                        data={reportData.items}
                        columns={columns}
                        isLoading={false}
                        emptyState={{
                            icon: <ShoppingCart className="h-16 w-16" />,
                            title: 'No Sales Data Found',
                            description: 'Try adjusting your filters to see sales records.',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default SalesReportPage;
