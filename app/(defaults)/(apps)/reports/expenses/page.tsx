'use client';
import ExpenseReportFilter from '@/__components/ExpenseReportFilter';
import { handleExportCSV, handleExportPDF, handlePrint } from '@/__components/expenseHelper';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import Loading from '@/components/layouts/loading';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetExpensesReportMutation } from '@/store/features/reports/reportApi';
import { AlertCircle, DollarSign, FileDown, FileSpreadsheet, Printer, Receipt, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

interface ExpenseReportItem {
    source: string;
    store_name: string;
    ledger_name: string;
    journal_name: string | null;
    amount: number;
    note: string | null;
    created_by: string;
    created_at: string;
}

interface ExpenseReportData {
    generated_at?: string;
    filters?: {
        store_id?: number;
        start_date?: string;
        end_date?: string;
        format: string;
    };
    summary: {
        total_entries: number;
        total_amount: number;
    };
    items: ExpenseReportItem[];
    pagination?: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
}

const ExpenseReportPage = () => {
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [reportData, setReportData] = useState<ExpenseReportData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const printRef = useRef<HTMLDivElement>(null);
    const { currentStoreId, currentStore } = useCurrentStore();
    const [getExpensesReport, { isLoading }] = useGetExpensesReportMutation();

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
                const response = await getExpensesReport(payload).unwrap();
                if (format === 'json') {
                    const apiData = response?.data || response;
                    const apiSummary = apiData?.summary || {};
                    const transformedData: ExpenseReportData = {
                        ...apiData,
                        summary: {
                            total_entries: apiSummary.total_entries ?? 0,
                            total_amount: Number(apiSummary.total_amount ?? 0),
                        },
                        items: apiData.items.map((item: any) => ({
                            source: item.source,
                            store_name: item.store_name || 'N/A',
                            ledger_name: item.ledger_name || 'N/A',
                            journal_name: item.journal_name || null,
                            amount: Number(item.amount || 0),
                            note: item.note || null,
                            created_by: item.created_by || 'Unknown',
                            created_at: item.created_at,
                        })),
                    };
                    setReportData(transformedData);
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
        [getExpensesReport, currentPage, itemsPerPage]
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
                    const response = await getExpensesReport(payload).unwrap();
                    const apiData = response?.data || response;
                    const apiSummary = apiData?.summary || {};
                    const transformedData: ExpenseReportData = {
                        ...apiData,
                        summary: {
                            total_entries: apiSummary.total_entries ?? 0,
                            total_amount: Number(apiSummary.total_amount ?? 0),
                        },
                        items: apiData.items.map((item: any) => ({
                            source: item.source,
                            store_name: item.store_name || 'N/A',
                            ledger_name: item.ledger_name || 'N/A',
                            journal_name: item.journal_name || null,
                            amount: Number(item.amount || 0),
                            note: item.note || null,
                            created_by: item.created_by || 'Unknown',
                            created_at: item.created_at,
                        })),
                    };
                    setReportData(transformedData);
                } catch (error: any) {
                    console.error('Error fetching expense report:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error?.data?.message || 'Failed to fetch expense report',
                    });
                }
            };
            fetchWithNewFilters();
        },
        [getExpensesReport, itemsPerPage]
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
            key: 'source',
            label: 'Source',
            render: (value) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${value === 'Expense Table' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}
                >
                    {value}
                </span>
            ),
        },
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
            render: (value) => <span className="text-gray-600">{value || '-'}</span>,
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
    const totalPages = reportData?.pagination?.total_pages || Math.ceil((reportData?.summary?.total_entries || 0) / itemsPerPage);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section - Responsive */}
            <div className="mb-4 rounded-xl bg-white p-4 shadow-sm sm:mb-6 sm:rounded-2xl sm:p-5 md:mb-8 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Logo and Title */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="rounded-lg bg-gradient-to-br from-red-500 to-red-600 p-2 shadow-lg sm:rounded-xl sm:p-3">
                            <Receipt className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Expense Report</h1>
                            <p className="text-xs text-gray-500 sm:text-sm">Track and analyze all business expenses</p>
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
                <ExpenseReportFilter onFilterChange={handleFilterChange} />
            </div>
            {/* Summary Cards */}
            {reportData && (
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Expenses</p>
                            <Receipt className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{reportData.summary.total_entries}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Amount</p>
                            <DollarSign className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{Number(reportData?.summary?.total_amount ?? 0).toFixed(2)}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Pending Expenses</p>
                            <AlertCircle className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">0</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Avg Expense Value</p>
                            <TrendingUp className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{reportData.summary.total_entries > 0 ? (reportData.summary.total_amount / reportData.summary.total_entries).toFixed(2) : '0.00'}</p>
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
                            totalItems: reportData?.pagination?.total || reportData?.summary?.total_entries || 0,
                            onPageChange: setCurrentPage,
                            onItemsPerPageChange: (n) => {
                                setItemsPerPage(n);
                                setCurrentPage(1);
                            },
                        }}
                        emptyState={{
                            icon: <Receipt className=" mx-auto h-16 w-16" />,
                            title: 'No Expense Data Found',
                            description: 'Try adjusting your filters to see results.',
                        }}
                    />
                )}
            </div>
            {/* Print-Only View (Full Data) */}
            {!isLoading && reportData && (
                <div ref={printRef} className="hidden print:block">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold">Expense Report</h1>
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
                            <p className="text-xs text-gray-600">Total Expenses</p>
                            <p className="text-lg font-bold">{reportData.summary.total_entries}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Total Amount</p>
                            <p className="text-lg font-bold">৳{Number(reportData?.summary?.total_amount ?? 0).toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Pending Expenses</p>
                            <p className="text-lg font-bold">0</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Avg Expense</p>
                            <p className="text-lg font-bold">৳{reportData.summary.total_entries > 0 ? (reportData.summary.total_amount / reportData.summary.total_entries).toFixed(2) : '0.00'}</p>
                        </div>
                    </div>
                    {/* Full Table */}
                    <ReusableTable
                        data={reportData.items}
                        columns={columns}
                        isLoading={false}
                        emptyState={{
                            icon: <Receipt className="h-16 w-16" />,
                            title: 'No Expense Data Found',
                            description: 'Try adjusting your filters to see expense records.',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ExpenseReportPage;
