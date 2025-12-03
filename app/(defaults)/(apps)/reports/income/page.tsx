'use client';
import { handleExportCSV, handleExportPDF, handlePrint } from '@/__components/incomeReportHelper';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import UniversalFilter from '@/components/common/UniversalFilter';
import Loading from '@/components/layouts/loading';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { downloadBase64File } from '@/lib/downloadFile';
import { useGetIncomeReportMutation } from '@/store/features/reports/reportApi';
import { CreditCard, DollarSign, FileDown, FileSpreadsheet, Package, Printer, Store, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

interface IncomeReportItem {
    sl: number;
    reference_no: string;
    income_for: string;
    store: string;
    category: string;
    brand: string;
    payment_type: string;
    amount: number;
    income_date: string;
}

interface IncomeReportData {
    generated_at?: string;
    filters?: {
        store_ids: number[];
        from_date?: string;
        to_date?: string;
        category_id?: number;
        brand_id?: number;
        format: string;
    };
    summary: {
        total_income: number;
        transactions: number;
    };
    items: IncomeReportItem[];
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
}

interface IncomeReportFileResponse {
    file: string;
    filename: string;
    mime_type: string;
}

const IncomeReportPage = () => {
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [reportData, setReportData] = useState<IncomeReportData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const printRef = useRef<HTMLDivElement>(null);
    const { currentStoreId, currentStore } = useCurrentStore();

    const [getIncomeReport, { isLoading }] = useGetIncomeReportMutation();

    // Fetch report data with pagination
    const fetchReport = useCallback(
        async (params: Record<string, any>, format: string = 'json') => {
            try {
                const payload = {
                    ...params,
                    format,
                    ...(format === 'json' && {
                        page: currentPage,
                        per_page: itemsPerPage,
                    }),
                };

                const response = await getIncomeReport(payload).unwrap();

                if (format === 'json') {
                    setReportData(response as IncomeReportData);
                } else {
                    // Handle file export
                    const fileResponse = response as IncomeReportFileResponse;
                    if (fileResponse?.file) {
                        const defaultName = format === 'pdf' ? `income-report-${new Date().getTime()}.pdf` : `income-report-${new Date().getTime()}.xlsx`;

                        const defaultMime = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

                        downloadBase64File(fileResponse.file, fileResponse.filename || defaultName, fileResponse.mime_type || defaultMime);

                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: `${format.toUpperCase()} downloaded successfully`,
                            timer: 2000,
                        });
                    }
                }
            } catch (error: any) {
                console.error('Error fetching income report:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error?.data?.message || 'Failed to fetch income report',
                });
            }
        },
        [getIncomeReport, currentPage, itemsPerPage]
    );

    // Trigger API call when pagination changes (but not on initial mount)
    useEffect(() => {
        if (Object.keys(filterParams).length > 0) {
            fetchReport(filterParams);
        }
    }, [currentPage, itemsPerPage]);

    // In IncomeReportPage.tsx, update handleFilterChange:
    const handleFilterChange = useCallback(
        (params: Record<string, any>) => {
            // Transform params to backend-expected keys
            const transformedParams = {
                ...params,
                // Flatten dateRange to from_date/to_date
                ...(params.dateRange && {
                    from_date: params.dateRange.startDate,
                    to_date: params.dateRange.endDate,
                }),
                // Rename storeId to store_id
                ...(params.storeId !== undefined && { store_id: params.storeId }),
                // Add category_id/brand_id if you implement them later (e.g., from customFilters)
                // ...(params.category_id && { category_id: params.category_id }),
                // ...(params.brand_id && { brand_id: params.brand_id }),
            };

            setFilterParams(transformedParams); // Use transformed
            setCurrentPage(1); // Reset to first page

            // Fetch with transformed params
            const fetchWithNewFilters = async () => {
                try {
                    const payload = {
                        ...transformedParams,
                        format: 'json',
                        page: 1,
                        per_page: itemsPerPage,
                    };
                    console.log('API Payload:', payload); // Debug: Log to verify
                    const response = await getIncomeReport(payload).unwrap();
                    setReportData(response as IncomeReportData);
                } catch (error: any) {
                    console.error('Error fetching income report:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error?.data?.message || 'Failed to fetch income report',
                    });
                }
            };
            fetchWithNewFilters();
        },
        [getIncomeReport, itemsPerPage]
    );

    // Handle page changes
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (perPage: number) => {
        setItemsPerPage(perPage);
        setCurrentPage(1); // Reset to first page
    };

    const handlePrintReport = async () => {
        if (!reportData) return;
        try {
            console.log(reportData);
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
            key: 'sl',
            label: 'SL',
            render: (value) => <span className="font-medium text-gray-900">{value}</span>,
        },
        {
            key: 'reference_no',
            label: 'Reference No',
            sortable: true,
            render: (value) => <span className="font-medium text-blue-600">{value}</span>,
        },
        {
            key: 'income_for',
            label: 'Income For',
            sortable: true,
            render: (value) => <span className="text-gray-900">{value}</span>,
        },
        {
            key: 'store',
            label: 'Store',
            render: (value) => (
                <div className="flex items-center">
                    <Store className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{value}</span>
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Category',
            render: (value) => <span className="text-gray-600">{value}</span>,
        },
        {
            key: 'brand',
            label: 'Brand',
            render: (value) => <span className="text-gray-600">{value}</span>,
        },
        {
            key: 'payment_type',
            label: 'Payment Type',
            render: (value) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        value?.toLowerCase() === 'cash' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}
                >
                    {value}
                </span>
            ),
        },
        {
            key: 'amount',
            label: 'Amount',
            render: (value) => <span className="font-bold text-green-600">৳{Number(value || 0).toFixed(2)}</span>,
        },
        {
            key: 'income_date',
            label: 'Date',
            render: (value) => (
                <div>
                    <div>{new Date(value).toLocaleDateString('en-GB')}</div>
                    <div className="text-xs text-gray-400">
                        {new Date(value).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                </div>
            ),
        },
    ];

    // Calculate summary statistics from current page data
    const summary = reportData
        ? {
              totalIncome: reportData.summary.total_income,
              totalTransactions: reportData.summary.transactions,
              averageIncome: reportData.summary.transactions > 0 ? reportData.summary.total_income / reportData.summary.transactions : 0,
              cashPayments: reportData.items.filter((r) => r.payment_type?.toLowerCase() === 'cash').length,
              digitalPayments: reportData.items.filter((r) => r.payment_type?.toLowerCase() !== 'cash').length,
          }
        : null;

    // Use data from API (server-side pagination)
    const paginatedData = reportData?.items || [];

    // Calculate total pages from API response
    const totalPages = reportData?.pagination?.total_pages || Math.ceil((reportData?.summary?.transactions || 0) / itemsPerPage);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section - Responsive */}
            <div className="mb-4 rounded-xl bg-white p-4 shadow-sm sm:mb-6 sm:rounded-2xl sm:p-5 md:mb-8 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Logo and Title */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-2 shadow-lg sm:rounded-xl sm:p-3">
                            <DollarSign className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Income Report</h1>
                            <p className="text-xs text-gray-500 sm:text-sm">Track and analyze all income transactions</p>
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
                <UniversalFilter
                    onFilterChange={handleFilterChange}
                    placeholder="Search by reference, income for, store, category, or brand..."
                    showStoreFilter={true}
                    showDateFilter={true}
                    showSearch={true}
                    initialFilters={{
                        dateRange: { type: 'this_month' },
                    }}
                />
            </div>

            {/* Summary Cards */}
            {reportData && summary && (
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Income</p>
                            <DollarSign className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{summary.totalIncome.toFixed(2)}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Transactions</p>
                            <Package className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{summary.totalTransactions}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Average Income</p>
                            <TrendingUp className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{summary.averageIncome.toFixed(2)}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Cash / Digital</p>
                            <CreditCard className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">
                            {summary.cashPayments} / {summary.digitalPayments}
                        </p>
                    </div>
                </div>
            )}

            {/* Table Section Only */}
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
                            totalItems: reportData?.pagination?.total || 0,
                            // onPageChange: handlePageChange,
                            onPageChange: (page: number) => setCurrentPage(page),
                            onItemsPerPageChange: handleItemsPerPageChange,
                        }}
                    />
                )}
            </div>

            {/* Print-Only View (Full Data) */}
            {!isLoading && reportData && (
                <div ref={printRef} className="hidden print:block">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold">Income Report</h1>
                        <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                        {reportData?.filters?.from_date && reportData?.filters?.to_date && (
                            <p className="text-sm text-gray-600">
                                Period: {reportData.filters.from_date} to {reportData.filters.to_date}
                            </p>
                        )}
                    </div>

                    {/* Summary Section */}
                    {summary && (
                        <div className="mb-6 grid grid-cols-4 gap-4 border-b pb-4">
                            <div>
                                <p className="text-xs text-gray-600">Total Income</p>
                                <p className="text-lg font-bold">৳{summary.totalIncome.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Total Transactions</p>
                                <p className="text-lg font-bold">{summary.totalTransactions}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Average Income</p>
                                <p className="text-lg font-bold">৳{summary.averageIncome.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Cash / Digital</p>
                                <p className="text-lg font-bold">
                                    {summary.cashPayments} / {summary.digitalPayments}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Full Table */}
                    <ReusableTable
                        data={reportData.items}
                        columns={columns}
                        isLoading={false}
                        emptyState={{
                            icon: <DollarSign className="mx-auto h-16 w-16" />,
                            title: 'No Income Data Found',
                            description: 'Try adjusting your filters to see income records.',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default IncomeReportPage;
