'use client';
import { handleExportCSV, handleExportPDF, handlePrint } from '@/components/custom/currentStockHelper';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import StockReportFilter from '@/components/filters/StockReportFilter';
import Loading from '@/components/layouts/loading';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetCurrentStockReportMutation } from '@/store/features/reports/reportApi';
import { Boxes, FileDown, FileSpreadsheet, Package, Printer, TrendingUp } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import Swal from 'sweetalert2';

interface StockItem {
    product_id: number;
    product_name: string;
    category: string | null;
    brand: string | null;
    store_name: string | null;
    price: number;
    stock_types: Record<string, number>;
    total_qty: number;
    total_value: number;
}

interface StockReportData {
    generated_at: string;
    filters: {
        store_ids: number[];
        category_id?: number;
        brand_id?: number;
        search?: string;
    };
    summary: {
        total_products: number;
        total_quantity: number;
        total_value: number;
    };
    items: StockItem[];
}

const StockReportPage = () => {
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [reportData, setReportData] = useState<StockReportData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const printRef = useRef<HTMLDivElement>(null);
    const { currentStoreId, currentStore } = useCurrentStore();

    const [getCurrentStockReport, { isLoading }] = useGetCurrentStockReportMutation();

    // Fetch report data
    const fetchReport = useCallback(
        async (params: Record<string, any>, format: string = 'json') => {
            try {
                const payload = {
                    ...params,
                    format,
                };

                const response = await getCurrentStockReport(payload).unwrap();

                if (format === 'json') {
                    setReportData(response.data);
                }
            } catch (error: any) {
                console.error('Error fetching stock report:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error?.data?.message || 'Failed to fetch stock report',
                });
            }
        },
        [getCurrentStockReport]
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

    // Export handlers using helper functions
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

    const handleExportExcelReport = async () => {
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
            key: 'product_name',
            label: 'Product Name',
            sortable: true,
            render: (value) => <span className="font-medium text-blue-600">{value}</span>,
        },
        {
            key: 'category',
            label: 'Category',
            sortable: true,
            render: (value) => <span className="text-sm">{value || 'N/A'}</span>,
        },
        {
            key: 'brand',
            label: 'Brand',
            sortable: true,
            render: (value) => <span className="text-sm">{value || 'N/A'}</span>,
        },
        {
            key: 'store_name',
            label: 'Store',
            sortable: true,
        },
        {
            key: 'price',
            label: 'Price',
            render: (value) => <span className="font-medium text-gray-700">৳{value.toFixed(2)}</span>,
        },
        {
            key: 'stock_types',
            label: 'Stock Types',
            render: (value) => (
                <div className="flex flex-wrap gap-1">
                    {Object.entries(value).map(([type, qty]) => (
                        <span key={type} className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800">
                            {type}: {qty}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            key: 'total_qty',
            label: 'Total Quantity',
            render: (value) => <span className="font-bold text-blue-600">{value}</span>,
        },
        {
            key: 'total_value',
            label: 'Total Value',
            render: (value) => <span className="font-bold text-green-600">৳{value.toFixed(2)}</span>,
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
                        <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-2 shadow-lg sm:rounded-xl sm:p-3">
                            <Package className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Stock Report</h1>
                            <p className="text-xs text-gray-500 sm:text-sm">Current inventory and stock levels overview</p>
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
                            onClick={handleExportExcelReport}
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
                <StockReportFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Summary Cards */}
            {reportData && (
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Products</p>
                            <Package className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{reportData.summary.total_products}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Quantity</p>
                            <Boxes className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{reportData.summary.total_quantity}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Value</p>
                            <TrendingUp className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{reportData.summary.total_value.toFixed(2)}</p>
                    </div>
                </div>
            )}

            <div className="relative">
                {/* Loading State */}
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                        <Loading />
                    </div>
                )}

                {/* Table - Screen View (Paginated) */}
                {!isLoading && reportData && (
                    <div className="print:hidden">
                        <ReusableTable
                            data={paginatedData}
                            columns={columns}
                            isLoading={isLoading}
                            emptyState={{
                                icon: <Package className="h-16 w-16" />,
                                title: 'No Stock Data Found',
                                description: 'Try adjusting your filters to see stock records.',
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
            </div>
            {/* Print-Only View (Full Data) */}
            {!isLoading && reportData && (
                <div ref={printRef} className="hidden print:block">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold">Stock Report</h1>
                        <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                        {reportData.filters.category_id && <p className="text-sm text-gray-600">Category ID: {reportData.filters.category_id}</p>}
                        {reportData.filters.brand_id && <p className="text-sm text-gray-600">Brand ID: {reportData.filters.brand_id}</p>}
                        {reportData.filters.search && <p className="text-sm text-gray-600">Search: {reportData.filters.search}</p>}
                    </div>

                    {/* Summary Section */}
                    <div className="mb-6 grid grid-cols-3 gap-4 border-b pb-4">
                        <div>
                            <p className="text-xs text-gray-600">Total Products</p>
                            <p className="text-lg font-bold">{reportData.summary.total_products}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Total Quantity</p>
                            <p className="text-lg font-bold">{reportData.summary.total_quantity}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Total Value</p>
                            <p className="text-lg font-bold">৳{reportData.summary.total_value.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Full Table */}
                    <ReusableTable
                        data={reportData.items}
                        columns={columns}
                        isLoading={false}
                        emptyState={{
                            icon: <Package className="h-16 w-16" />,
                            title: 'No Stock Data Found',
                            description: 'Try adjusting your filters to see stock records.',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default StockReportPage;
