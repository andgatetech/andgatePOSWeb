'use client';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import TransactionReportFilter from '@/components/filters/TransactionReportFilter';
import Loading from '@/components/layouts/loading';
import { downloadBase64File } from '@/lib/downloadFile';
import { useGetTransactionReportMutation } from '@/store/features/reports/reportApi';
import { AlertCircle, CreditCard, DollarSign, FileDown, FileSpreadsheet, Printer, TrendingUp } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';

interface TransactionItem {
    transaction_id: number;
    order_id: number;
    invoice: string;
    store_name: string;
    user_name: string;
    payment_status: string;
    payment_method: string;
    amount: number;
    created_at: string;
}

interface TransactionReportData {
    generated_at: string;
    filters: {
        store_ids: number[];
        start_date?: string;
        end_date?: string;
        payment_status?: string;
        payment_method?: string;
        format: string;
    };
    summary: {
        transactions_count: number;
        total_amount: number;
        paid_amount: number;
        unpaid_amount: number;
        partial_amount: number;
    };
    items: TransactionItem[];
}

const OrderTransactionReportPage = () => {
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [reportData, setReportData] = useState<TransactionReportData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const printRef = useRef<HTMLDivElement>(null);

    const [getTransactionReport, { isLoading }] = useGetTransactionReportMutation();

    // Fetch report data
    const fetchReport = useCallback(
        async (params: Record<string, any>, format: string = 'json') => {
            try {
                const payload = {
                    ...params,
                    format,
                };

                const response = await getTransactionReport(payload).unwrap();

                if (format === 'json') {
                    setReportData(response.data);
                }
            } catch (error: any) {
                console.error('Error fetching transaction report:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error?.data?.message || 'Failed to fetch transaction report',
                });
            }
        },
        [getTransactionReport]
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

            const response = await getTransactionReport(payload).unwrap();

            if (response?.data?.file) {
                downloadBase64File(response.data.file, response.data.filename || `transaction-report-${new Date().getTime()}.pdf`, response.data.mime_type || 'application/pdf');

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

            const response = await getTransactionReport(payload).unwrap();

            if (response?.data?.file) {
                downloadBase64File(
                    response.data.file,
                    response.data.filename || `transaction-report-${new Date().getTime()}.xlsx`,
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
        documentTitle: `Transaction Report - ${new Date().toLocaleDateString()}`,
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
            key: 'store_name',
            label: 'Store',
            sortable: true,
        },
        {
            key: 'user_name',
            label: 'User',
            sortable: true,
        },
        {
            key: 'payment_method',
            label: 'Payment Method',
            render: (value) => {
                const methodColors: Record<string, string> = {
                    cash: 'bg-green-100 text-green-800',
                    card: 'bg-blue-100 text-blue-800',
                    mobile: 'bg-purple-100 text-purple-800',
                    bank_transfer: 'bg-indigo-100 text-indigo-800',
                };
                return <span className={`rounded px-2 py-1 text-xs font-medium ${methodColors[value] || 'bg-gray-100 text-gray-800'}`}>{value?.replace('_', ' ').toUpperCase()}</span>;
            },
        },
        {
            key: 'payment_status',
            label: 'Status',
            render: (value) => {
                const statusColors: Record<string, string> = {
                    paid: 'bg-green-100 text-green-800',
                    unpaid: 'bg-red-100 text-red-800',
                    partial: 'bg-yellow-100 text-yellow-800',
                };
                return <span className={`rounded px-2 py-1 text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>{value?.toUpperCase()}</span>;
            },
        },
        {
            key: 'amount',
            label: 'Amount',
            render: (value) => <span className="font-bold text-green-600">৳{value.toFixed(2)}</span>,
        },
        {
            key: 'created_at',
            label: 'Date',
            render: (value) => (
                <span className="text-sm text-gray-600">
                    {new Date(value).toLocaleDateString()} {new Date(value).toLocaleTimeString()}
                </span>
            ),
        },
    ];

    // Pagination
    const paginatedData = reportData?.items?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];
    const totalPages = Math.ceil((reportData?.items?.length || 0) / itemsPerPage);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section - Fully Responsive */}
            <div className="mb-4 rounded-xl bg-white p-4 shadow-sm sm:mb-6 sm:rounded-2xl sm:p-5 md:mb-8 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Title Section */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-2 shadow-lg sm:rounded-xl sm:p-3">
                            <CreditCard className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Transaction Report</h1>
                            <p className="text-xs text-gray-500 sm:text-sm">Complete payment and transaction history</p>
                        </div>
                    </div>

                    {/* Export Buttons - Responsive */}
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <button
                            onClick={handlePrint}
                            disabled={!reportData || isLoading}
                            className="flex min-w-[100px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-600 px-3 py-2 text-sm text-white transition-all hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial sm:gap-2 sm:px-4 sm:py-2.5 sm:text-base"
                        >
                            <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Print</span>
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={!reportData || isLoading}
                            className="flex min-w-[100px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial sm:gap-2 sm:px-4 sm:py-2.5 sm:text-base"
                        >
                            <FileDown className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>PDF</span>
                        </button>
                        <button
                            onClick={handleExportExcel}
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
                <TransactionReportFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Summary Cards */}
            {reportData && (
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-5">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Transactions</p>
                            <CreditCard className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{reportData.summary.transactions_count}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Amount</p>
                            <TrendingUp className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{reportData.summary.total_amount.toFixed(2)}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Paid</p>
                            <DollarSign className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{reportData.summary.paid_amount.toFixed(2)}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Partial</p>
                            <AlertCircle className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{reportData.summary.partial_amount.toFixed(2)}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Unpaid</p>
                            <AlertCircle className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{reportData.summary.unpaid_amount.toFixed(2)}</p>
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
                            icon: <CreditCard className="h-16 w-16" />,
                            title: 'No Transactions Found',
                            description: 'Try adjusting your filters to see transaction records.',
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
                        <h1 className="text-2xl font-bold">Transaction Report</h1>
                        <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                        {reportData.filters.start_date && reportData.filters.end_date && (
                            <p className="text-sm text-gray-600">
                                Period: {reportData.filters.start_date} to {reportData.filters.end_date}
                            </p>
                        )}
                    </div>

                    {/* Summary Section */}
                    <div className="mb-6 grid grid-cols-5 gap-4 border-b pb-4">
                        <div>
                            <p className="text-xs text-gray-600">Total Transactions</p>
                            <p className="text-lg font-bold">{reportData.summary.transactions_count}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Total Amount</p>
                            <p className="text-lg font-bold">৳{reportData.summary.total_amount.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Paid</p>
                            <p className="text-lg font-bold">৳{reportData.summary.paid_amount.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Partial</p>
                            <p className="text-lg font-bold">৳{reportData.summary.partial_amount.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Unpaid</p>
                            <p className="text-lg font-bold">৳{reportData.summary.unpaid_amount.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Full Table */}
                    <ReusableTable
                        data={reportData.items}
                        columns={columns}
                        isLoading={false}
                        emptyState={{
                            icon: <CreditCard className="h-16 w-16" />,
                            title: 'No Transactions Found',
                            description: 'Try adjusting your filters to see transaction records.',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default OrderTransactionReportPage;
