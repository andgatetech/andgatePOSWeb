'use client';
import SalesReportFilter from '@/__components/SalesReportFilter';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import Loading from '@/components/layouts/loading';
import { downloadBase64File } from '@/lib/downloadFile';
import { useGetSalesReportMutation } from '@/store/features/reports/reportApi';
import { AlertCircle, CheckCircle, DollarSign, FileDown, FileSpreadsheet, Printer, ShoppingCart, TrendingUp, XCircle } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
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
}

interface SalesReportData {
    generated_at: string;
    filters: {
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
}

const SalesReportPage = () => {
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [reportData, setReportData] = useState<SalesReportData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const printRef = useRef<HTMLDivElement>(null);

    const [getSalesReport, { isLoading }] = useGetSalesReportMutation();

    // Fetch report data
    const fetchReport = useCallback(
        async (params: Record<string, any>, format: string = 'json') => {
            try {
                const payload = { ...params, format };
                const response = await getSalesReport(payload).unwrap();

                if (format === 'json') {
                    const apiData = response;
                    const apiSummary = apiData?.summary || {};

                    const transformedData = {
                        ...apiData,
                        summary: {
                            // 🟢 Support both old and new field names for UI
                            total_orders: apiSummary.orders_count ?? 0,
                            paid_orders: apiSummary.orders_count ?? 0,
                            pending_orders: 0,
                            failed_orders: 0,
                            total_revenue: Number(apiSummary.total_grand ?? apiSummary.total_revenue ?? 0),
                            total_sales: Number(apiSummary.total_sales ?? 0),
                            avg_order_value: apiSummary.orders_count > 0 ? Number(apiSummary.total_grand ?? 0) / apiSummary.orders_count : 0,
                        },
                        // items: apiData.items.map((item: any) => ({
                        //     invoice: item.invoice,
                        //     customer_name: item.customer,
                        //     customer_phone: item.customer_phone || 'N/A',
                        //     items_count: 1,
                        //     payment_status: item.payment_status || 'paid',
                        //     payment_method: item.payment_method || 'N/A',
                        //     subtotal: Number(item.total || 0),
                        //     tax: Number(item.tax || 0),
                        //     discount: Number(item.discount || 0),
                        //     grand_total: Number(item.grand_total || 0),
                        //     order_date: item.sales_date,
                        // })),
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
        [getSalesReport]
    );

    // Handle filter changes
    const handleFilterChange = useCallback(
        (params: Record<string, any>) => {
            setFilterParams(params);
            setCurrentPage(1);
            fetchReport(params);
        },
        [fetchReport]
    );

    // Export handlers
    const handleExportPDF = async () => {
        try {
            const payload = {
                ...filterParams,
                format: 'pdf',
            };

            const response = await getSalesReport(payload).unwrap();

            if (response?.data?.file) {
                downloadBase64File(response.data.file, response.data.filename || `sales-report-${new Date().getTime()}.pdf`, response.data.mime_type || 'application/pdf');

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'PDF downloaded successfully',
                    timer: 2000,
                });
            }
        } catch (error: any) {
            console.error('Failed to export PDF:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error?.data?.message || 'Failed to export PDF',
            });
        }
    };

    const handleExportExcel = async () => {
        try {
            const payload = {
                ...filterParams,
                format: 'excel',
            };

            const response = await getSalesReport(payload).unwrap();

            if (response?.data?.file) {
                downloadBase64File(
                    response.data.file,
                    response.data.filename || `sales-report-${new Date().getTime()}.xlsx`,
                    response.data.mime_type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                );

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Excel downloaded successfully',
                    timer: 2000,
                });
            }
        } catch (error: any) {
            console.error('Failed to export Excel:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error?.data?.message || 'Failed to export Excel',
            });
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Sales Report - ${new Date().toLocaleDateString()}`,
    });

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

    // Pagination
    const paginatedData = reportData?.items?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];
    const totalPages = Math.ceil((reportData?.items?.length || 0) / itemsPerPage);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-3 shadow-lg">
                            <ShoppingCart className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
                            <p className="text-sm text-gray-500">Track and analyze all sales transactions</p>
                        </div>
                    </div>

                    {/* Export Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            disabled={!reportData || isLoading}
                            className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2.5 text-white transition-all hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Printer className="h-5 w-5" />
                            Print
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={!reportData || isLoading}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FileDown className="h-5 w-5" />
                            PDF
                        </button>
                        <button
                            onClick={handleExportExcel}
                            disabled={!reportData || isLoading}
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FileSpreadsheet className="h-5 w-5" />
                            Excel
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
                        <p className="text-3xl font-bold">
                            ৳{' '}
                            {(
                                reportData?.summary?.avg_order_value ??
                                (reportData?.summary?.total_revenue && reportData?.summary?.total_orders ? reportData.summary.total_revenue / reportData.summary.total_orders : 0)
                            ).toFixed(2)}
                        </p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && <Loading />}

            {/* Table - Screen View (Paginated) */}
            {!isLoading && reportData && (
                <div className="print:hidden">
                    <ReusableTable
                        data={paginatedData}
                        columns={columns}
                        isLoading={isLoading}
                        emptyState={{
                            icon: <ShoppingCart className="h-16 w-16" />,
                            title: 'No Sales Data Found',
                            description: 'Try adjusting your filters to see sales records.',
                        }}
                        pagination={{
                            currentPage,
                            totalPages,
                            itemsPerPage,
                            totalItems: reportData.items.length,
                            onPageChange: setCurrentPage,
                            onItemsPerPageChange: setItemsPerPage,
                        }}
                    />
                </div>
            )}

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
                            {/* <p className="text-lg font-bold">৳{reportData.summary.total_revenue.toFixed(2)}</p> */}
                            <p className="text-lg font-bold">৳{Number(reportData?.summary?.total_revenue ?? 0).toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Avg Order Value</p>
                            {/* <p className="text-lg font-bold">৳{reportData.summary.avg_order_value.toFixed(2)}</p> */}
                            <p className="text-lg font-bold">৳{(Number(reportData?.summary?.total_grand ?? 0) / Number(reportData?.summary?.orders_count ?? 1) || 0).toFixed(2)}</p>
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
