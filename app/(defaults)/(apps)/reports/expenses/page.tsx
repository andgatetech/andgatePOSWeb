'use client';
import ExpenseReportFilter from '@/__components/ExpenseReportFilter';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import Loading from '@/components/layouts/loading';
import { downloadBase64File } from '@/lib/downloadFile';
import { useGetExpensesReportMutation } from '@/store/features/reports/reportApi';
import { DollarSign, FileDown, FileSpreadsheet, Printer, Receipt, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';

interface ExpenseReportItem {
    store_name: string;
    ledger_name: string;
    amount: number;
    note: string | null;
    created_by: string;
    created_at: string;
}

interface ExpenseReportData {
    generated_at: string;
    filters: {
        store_ids: number[];
        start_date?: string | null;
        end_date?: string | null;
        format: string;
    };
    summary: {
        total_expenses: number;
        total_amount: number;
    };
    items: ExpenseReportItem[];
}

const ExpenseReportPage = () => {
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [reportData, setReportData] = useState<ExpenseReportData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const printRef = useRef<HTMLDivElement>(null);

    const [getExpensesReport, { isLoading }] = useGetExpensesReportMutation();

    // Fetch report data
    const fetchReport = useCallback(
        async (params: Record<string, any>, format: string = 'json') => {
            try {
                const payload = { ...params, format };
                const response = await getExpensesReport(payload).unwrap();

                if (format === 'json' && response?.data) {
                    setReportData(response.data);
                    setCurrentPage(1);
                }
            } catch (error: any) {
                console.error('Error fetching expense report:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error?.data?.message || 'Failed to fetch expense report',
                });
            }
        },
        [getExpensesReport]
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

            const response = await getExpensesReport(payload).unwrap();

            if (response?.data?.file) {
                downloadBase64File(response.data.file, response.data.filename || `expense-report-${new Date().getTime()}.pdf`, response.data.mime_type || 'application/pdf');

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'PDF downloaded successfully',
                    timer: 2000,
                    showConfirmButton: false,
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

            const response = await getExpensesReport(payload).unwrap();

            if (response?.data?.file) {
                downloadBase64File(
                    response.data.file,
                    response.data.filename || `expense-report-${new Date().getTime()}.xlsx`,
                    response.data.mime_type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                );

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Excel downloaded successfully',
                    timer: 2000,
                    showConfirmButton: false,
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
        documentTitle: `Expense Report - ${new Date().toLocaleDateString()}`,
    });

    // Table columns
    const columns: TableColumn[] = [
        {
            key: 'store_name',
            label: 'Store',
            sortable: true,
            render: (value) => <span className="font-medium text-gray-900">{value || 'N/A'}</span>,
        },
        {
            key: 'ledger_name',
            label: 'Ledger',
            sortable: true,
            render: (value) => <span className="text-gray-700">{value || 'N/A'}</span>,
        },
        {
            key: 'amount',
            label: 'Amount',
            render: (value) => <span className="font-bold text-red-600">৳{Number(value || 0).toFixed(2)}</span>,
        },
        {
            key: 'note',
            label: 'Note',
            render: (value) => (
                <span className="block max-w-xs truncate text-sm text-gray-500" title={value || ''}>
                    {value || 'N/A'}
                </span>
            ),
        },
        {
            key: 'created_by',
            label: 'Created By',
            sortable: true,
            render: (value) => <span className="font-medium text-gray-900">{value || 'Unknown'}</span>,
        },
        {
            key: 'created_at',
            label: 'Date',
            render: (value) => (
                <div className="text-sm">
                    <div className="text-gray-900">{new Date(value).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{new Date(value).toLocaleTimeString()}</div>
                </div>
            ),
        },
    ];

    // Pagination
    const totalItems = reportData?.items?.length || 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    // Auto-adjust currentPage if it exceeds totalPages
    useEffect(() => {
        if (reportData && totalItems > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage, reportData, totalItems]);

    const paginatedData = reportData?.items?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Header Section - Fully Responsive */}
            <div className="mb-6 rounded-xl bg-white p-4 shadow-sm sm:mb-8 sm:rounded-2xl sm:p-5 md:p-6">
                <div className="mb-4 flex flex-col gap-4 sm:mb-6 md:flex-row md:items-center md:justify-between">
                    {/* Title Section */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="rounded-lg bg-gradient-to-br from-red-500 to-red-600 p-2 shadow-lg sm:rounded-xl sm:p-2.5 md:p-3">
                            <Receipt className="h-6 w-6 text-white sm:h-7 sm:w-7 md:h-8 md:w-8" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Expense Report</h1>
                            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">Track and analyze all business expenses</p>
                        </div>
                    </div>

                    {/* Export Buttons - Responsive */}
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <button
                            onClick={handlePrint}
                            disabled={!reportData || isLoading}
                            className="flex items-center gap-1.5 rounded-lg bg-gray-600 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                        >
                            <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="xs:inline hidden">Print</span>
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={!reportData || isLoading}
                            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                        >
                            <FileDown className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="xs:inline hidden">PDF</span>
                        </button>
                        <button
                            onClick={handleExportExcel}
                            disabled={!reportData || isLoading}
                            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                        >
                            <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="xs:inline hidden">Excel</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
                <ExpenseReportFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Summary Cards */}
            {reportData && (
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg sm:p-6">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-medium opacity-90 sm:text-sm">Total Expenses</p>
                            <Receipt className="h-5 w-5 opacity-80 sm:h-6 sm:w-6" />
                        </div>
                        <p className="text-2xl font-bold sm:text-3xl">{reportData.summary.total_expenses}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-5 text-white shadow-lg sm:p-6">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-medium opacity-90 sm:text-sm">Total Amount</p>
                            <DollarSign className="h-5 w-5 opacity-80 sm:h-6 sm:w-6" />
                        </div>
                        <p className="text-2xl font-bold sm:text-3xl">৳{reportData.summary.total_amount.toFixed(2)}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 text-white shadow-lg sm:col-span-2 sm:p-6 lg:col-span-1">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-medium opacity-90 sm:text-sm">Average Expense</p>
                            <TrendingUp className="h-5 w-5 opacity-80 sm:h-6 sm:w-6" />
                        </div>
                        <p className="text-2xl font-bold sm:text-3xl">
                            ৳{reportData.summary.total_expenses > 0 ? (reportData.summary.total_amount / reportData.summary.total_expenses).toFixed(2) : '0.00'}
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
                        isLoading={false}
                        emptyState={{
                            icon: <Receipt className="h-16 w-16" />,
                            title: 'No Expense Data Found',
                            description: 'Try adjusting your filters to see expense records.',
                        }}
                        pagination={
                            totalItems > 0
                                ? {
                                      currentPage,
                                      totalPages,
                                      itemsPerPage,
                                      totalItems,
                                      onPageChange: setCurrentPage,
                                      onItemsPerPageChange: (items) => {
                                          setItemsPerPage(items);
                                          setCurrentPage(1);
                                      },
                                  }
                                : undefined
                        }
                    />
                </div>
            )}

            {/* Print-Only View (Full Data) */}
            {!isLoading && reportData && reportData.items.length > 0 && (
                <div ref={printRef} className="hidden print:block">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold">Expense Report</h1>
                        <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                        {reportData.filters.start_date && reportData.filters.end_date && (
                            <p className="text-sm text-gray-600">
                                Period: {reportData.filters.start_date} to {reportData.filters.end_date}
                            </p>
                        )}
                    </div>

                    {/* Summary Section */}
                    <div className="mb-6 grid grid-cols-3 gap-4 border-b pb-4">
                        <div>
                            <p className="text-xs text-gray-600">Total Expenses</p>
                            <p className="text-lg font-bold">{reportData.summary.total_expenses}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Total Amount</p>
                            <p className="text-lg font-bold">৳{reportData.summary.total_amount.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Average Expense</p>
                            <p className="text-lg font-bold">৳{reportData.summary.total_expenses > 0 ? (reportData.summary.total_amount / reportData.summary.total_expenses).toFixed(2) : '0.00'}</p>
                        </div>
                    </div>

                    {/* Full Table */}
                    <ReusableTable data={reportData.items} columns={columns} isLoading={false} />
                </div>
            )}
        </div>
    );
};

export default ExpenseReportPage;
