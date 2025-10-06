'use client';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import UniversalFilter from '@/components/common/UniversalFilter';
import Loading from '@/components/layouts/loading';
import { downloadBase64File } from '@/lib/downloadFile';
import { useGetIncomeReportMutation } from '@/store/features/reports/reportApi';
import { CreditCard, DollarSign, FileDown, FileSpreadsheet, Package, Printer, Store, TrendingUp } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
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
    generated_at: string;
    filters: {
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
}

interface IncomeReportFileResponse {
    file: string;
    filename: string;
    mime_type: string;
}

interface IncomeReportResponse {
    success: boolean;
    message: string;
    data: IncomeReportData | IncomeReportFileResponse;
}

const IncomeReportPage = () => {
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [reportData, setReportData] = useState<IncomeReportData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const printRef = useRef<HTMLDivElement>(null);

    // const reportData = reportDatas?.data;

    const [getIncomeReport, { isLoading }] = useGetIncomeReportMutation();

    // Fetch report data
    // const fetchReport = useCallback(
    //     async (params: Record<string, any>, format: string = 'json') => {
    //         try {
    //             const payload = { ...params, format };
    //             const response = await getIncomeReport(payload).unwrap();

    //             if (format === 'json') {
    //                 setReportData(response);
    //             }
    //         } catch (error: any) {
    //             console.error('Error fetching income report:', error);
    //             Swal.fire({
    //                 icon: 'error',
    //                 title: 'Error',
    //                 text: error?.data?.message || 'Failed to fetch income report',
    //             });
    //         }
    //     },
    //     [getIncomeReport]
    // );

    const fetchReport = useCallback(
        async (params: Record<string, any>, format: string = 'json') => {
            try {
                const payload = { ...params, format };
                const response: IncomeReportResponse = await getIncomeReport(payload).unwrap();

                if (format === 'json') {
                    // Set actual report data to state
                    setReportData(response.data as IncomeReportData);
                } else {
                    // Handle file export
                    const fileResponse = response.data as IncomeReportFileResponse;
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
        [getIncomeReport]
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
    // const handleExportPDF = async () => {
    //     try {
    //         const payload = {
    //             ...filterParams,
    //             format: 'pdf',
    //         };

    //         const response = await getIncomeReport(payload).unwrap();

    //         if (response?.data?.file) {
    //             downloadBase64File(response.data.file, response.data.filename || `income-report-${new Date().getTime()}.pdf`, response.data.mime_type || 'application/pdf');

    //             Swal.fire({
    //                 icon: 'success',
    //                 title: 'Success',
    //                 text: 'PDF downloaded successfully',
    //                 timer: 2000,
    //             });
    //         }
    //     } catch (error: any) {
    //         console.error('Failed to export PDF:', error);
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Error',
    //             text: error?.data?.message || 'Failed to export PDF',
    //         });
    //     }
    // };

    // const handleExportExcel = async () => {
    //     try {
    //         const payload = {
    //             ...filterParams,
    //             format: 'excel',
    //         };

    //         const response = await getIncomeReport(payload).unwrap();

    //         if (response?.data?.file) {
    //             downloadBase64File(
    //                 response.data.file,
    //                 response.data.filename || `income-report-${new Date().getTime()}.xlsx`,
    //                 response.data.mime_type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    //             );

    //             Swal.fire({
    //                 icon: 'success',
    //                 title: 'Success',
    //                 text: 'Excel downloaded successfully',
    //                 timer: 2000,
    //             });
    //         }
    //     } catch (error: any) {
    //         console.error('Failed to export Excel:', error);
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Error',
    //             text: error?.data?.message || 'Failed to export Excel',
    //         });
    //     }
    // };

    const handleExportPDF = () => fetchReport(filterParams, 'pdf');
    const handleExportExcel = () => fetchReport(filterParams, 'excel');

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Income Report - ${new Date().toLocaleDateString()}`,
    });

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

    // Calculate summary statistics
    const summary = reportData
        ? {
              totalIncome: reportData.summary.total_income,
              totalTransactions: reportData.summary.transactions,
              averageIncome: reportData.summary.transactions > 0 ? reportData.summary.total_income / reportData.summary.transactions : 0,
              cashPayments: reportData.items.filter((r) => r.payment_type?.toLowerCase() === 'cash').length,
              digitalPayments: reportData.items.filter((r) => r.payment_type?.toLowerCase() !== 'cash').length,
          }
        : null;

    // Pagination
    const paginatedData = reportData?.items?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];
    const totalPages = Math.ceil((reportData?.items?.length || 0) / itemsPerPage);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-lg">
                            <DollarSign className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Income Report</h1>
                            <p className="text-sm text-gray-500">Track and analyze all income transactions</p>
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
                            icon: <DollarSign className="h-16 w-16" />,
                            title: 'No Income Data Found',
                            description: 'Try adjusting your filters to see income records.',
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
                        <h1 className="text-2xl font-bold">Income Report</h1>
                        <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                        {reportData.filters.from_date && reportData.filters.to_date && (
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
                            icon: <DollarSign className="h-16 w-16" />,
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
