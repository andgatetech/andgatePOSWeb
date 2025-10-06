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
    journal_name: string;
    amount: number;
    note: string | null;
    created_by: string;
    created_at: string;
}

interface ExpenseReportData {
    generated_at: string;
    filters: {
        store_ids: number[];
        start_date?: string;
        end_date?: string;
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

                if (format === 'json') {
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
            key: 'journal_name',
            label: 'Journal',
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

    console.log('Report Data:', reportData);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-3 shadow-lg">
                            <Receipt className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Expense Report</h1>
                            <p className="text-sm text-gray-500">Track and analyze all business expenses</p>
                        </div>
                    </div>

                    {/* Export Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handlePrint}
                            disabled={!reportData || isLoading}
                            className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Printer className="h-5 w-5" />
                            Print
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={!reportData || isLoading}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FileDown className="h-5 w-5" />
                            PDF
                        </button>
                        <button
                            onClick={handleExportExcel}
                            disabled={!reportData || isLoading}
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FileSpreadsheet className="h-5 w-5" />
                            Excel
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
                <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Expenses</p>
                            <Receipt className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{reportData.summary.total_expenses}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Amount</p>
                            <DollarSign className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{reportData.summary.total_amount.toFixed(2)}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Average Expense</p>
                            <TrendingUp className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{reportData.summary.total_expenses > 0 ? (reportData.summary.total_amount / reportData.summary.total_expenses).toFixed(2) : '0.00'}</p>
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
