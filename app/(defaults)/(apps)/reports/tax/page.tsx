'use client';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import SubscriptionError from '@/components/common/SubscriptionError';
import TaxReportFilter from '@/components/filters/TaxReportFilter';
import Loading from '@/components/layouts/loading';
import useSubscriptionError from '@/hooks/useSubscriptionError';
import { downloadBase64File } from '@/lib/downloadFile';
import { useGetTaxReportMutation } from '@/store/features/reports/reportApi';
import { DollarSign, FileDown, FileSpreadsheet, Percent, Printer, Receipt, TrendingUp } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';

interface TaxReportItem {
    invoice: string;
    store_name: string;
    product_name: string;
    quantity: number;
    unit: string;
    unit_price: number;
    tax_rate: number;
    tax_type: string;
    taxable_amount: number;
    tax_amount: number;
    gross_amount: number;
}

interface TaxReportData {
    generated_at: string;
    filters: {
        store_ids: number[];
        start_date?: string;
        end_date?: string;
        format: string;
    };
    summary: {
        items_count: number;
        taxable_amount: number;
        tax_amount: number;
        gross_amount: number;
    };
    items: TaxReportItem[];
}

const TaxReportPage = () => {
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [reportData, setReportData] = useState<TaxReportData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const printRef = useRef<HTMLDivElement>(null);

    const [getTaxReport, { isLoading, error }] = useGetTaxReportMutation();

    // Check for subscription errors
    const { hasSubscriptionError, subscriptionError } = useSubscriptionError(error);

    // Fetch report data
    const fetchReport = useCallback(
        async (params: Record<string, any>, format: string = 'json') => {
            try {
                const payload = {
                    ...params,
                    format,
                };

                const response = await getTaxReport(payload).unwrap();

                if (format === 'json') {
                    setReportData(response.data);
                }
            } catch (error: any) {
                console.error('Error fetching tax report:', error);
                // Don't show Swal error if it's a subscription error (will be handled by useSubscriptionError hook)
                if (error?.status !== 403) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error?.data?.message || 'Failed to fetch tax report',
                    });
                }
            }
        },
        [getTaxReport]
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

            const response = await getTaxReport(payload).unwrap();

            // Backend returns base64 encoded PDF
            if (response?.data?.file) {
                downloadBase64File(response.data.file, response.data.filename || `tax-report-${new Date().getTime()}.pdf`, response.data.mime_type || 'application/pdf');

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

            const response = await getTaxReport(payload).unwrap();

            // Backend returns base64 encoded Excel
            if (response?.data?.file) {
                downloadBase64File(
                    response.data.file,
                    response.data.filename || `tax-report-${new Date().getTime()}.xlsx`,
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
        documentTitle: `Tax Report - ${new Date().toLocaleDateString()}`,
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
            key: 'product_name',
            label: 'Product',
            sortable: true,
        },
        {
            key: 'quantity',
            label: 'Qty',
            render: (value, row) => `${value} ${row.unit}`,
        },
        {
            key: 'unit_price',
            label: 'Unit Price',
            render: (value) => `৳${value.toFixed(2)}`,
        },
        {
            key: 'tax_rate',
            label: 'Tax Rate',
            render: (value) => <span className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">{value}%</span>,
        },
        {
            key: 'tax_type',
            label: 'Tax Type',
            render: (value) => (
                <span className={`rounded px-2 py-1 text-xs font-medium ${value === 'inclusive' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {value === 'inclusive' ? 'Inclusive' : 'Exclusive'}
                </span>
            ),
        },
        {
            key: 'taxable_amount',
            label: 'Taxable Amount',
            render: (value) => <span className="font-medium">৳{value.toFixed(2)}</span>,
        },
        {
            key: 'tax_amount',
            label: 'Tax Amount',
            render: (value) => <span className="font-semibold text-red-600">৳{value.toFixed(2)}</span>,
        },
        {
            key: 'gross_amount',
            label: 'Gross Amount',
            render: (value) => <span className="font-bold text-green-600">৳{value.toFixed(2)}</span>,
        },
    ];

    // Pagination
    const paginatedData = reportData?.items?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];
    const totalPages = Math.ceil((reportData?.items?.length || 0) / itemsPerPage);

    // Show subscription error component if subscription middleware error occurs
    if (hasSubscriptionError) {
        return <SubscriptionError errorType={subscriptionError.errorType!} message={subscriptionError.message} details={subscriptionError.details} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
                            <Receipt className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Tax Report</h1>
                            <p className="text-sm text-gray-500">Comprehensive tax analysis and insights</p>
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
                <TaxReportFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Summary Cards */}
            {reportData && (
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Items</p>
                            <Receipt className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{reportData.summary.items_count}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Taxable Amount</p>
                            <DollarSign className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{reportData.summary.taxable_amount.toFixed(2)}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Tax Amount</p>
                            <Percent className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{reportData.summary.tax_amount.toFixed(2)}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Gross Amount</p>
                            <TrendingUp className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{reportData.summary.gross_amount.toFixed(2)}</p>
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
                            icon: (
                                <div className="flex justify-center">
                                    <Receipt className="h-16 w-16" />
                                </div>
                            ),
                            title: 'No Tax Data Found',
                            description: 'Try adjusting your filters to see tax records.',
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
                        <h1 className="text-2xl font-bold">Tax Report</h1>
                        <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                        {reportData.filters.start_date && reportData.filters.end_date && (
                            <p className="text-sm text-gray-600">
                                Period: {reportData.filters.start_date} to {reportData.filters.end_date}
                            </p>
                        )}
                    </div>

                    {/* Summary Section */}
                    <div className="mb-6 grid grid-cols-4 gap-4 border-b pb-4">
                        <div>
                            <p className="text-xs text-gray-600">Total Items</p>
                            <p className="text-lg font-bold">{reportData.summary.items_count}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Taxable Amount</p>
                            <p className="text-lg font-bold">৳{reportData.summary.taxable_amount.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Tax Amount</p>
                            <p className="text-lg font-bold">৳{reportData.summary.tax_amount.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Gross Amount</p>
                            <p className="text-lg font-bold">৳{reportData.summary.gross_amount.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Full Table */}
                    <ReusableTable
                        data={reportData.items}
                        columns={columns}
                        isLoading={false}
                        emptyState={{
                            icon: (
                                <div className="flex justify-center">
                                    <Receipt className="h-16 w-16" />
                                </div>
                            ),
                            title: 'No Tax Data Found',
                            description: 'Try adjusting your filters to see tax records.',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default TaxReportPage;
