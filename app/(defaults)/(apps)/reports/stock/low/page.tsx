'use client';
import LowStockReportFilter from '@/__components/LowStockReportFilter';
import { handleExportCSV, handleExportPDF, handlePrint } from '@/__components/lowStockHelper';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import Loading from '@/components/layouts/loading';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetLowStockReportMutation } from '@/store/features/reports/reportApi';
import { AlertTriangle, FileDown, FileSpreadsheet, Package, Printer, TrendingDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

interface LowStockReportItem {
    store: string;
    product: string;
    brand: string;
    category: string;
    sku: string;
    unit: string;
    quantity: number;
    low_limit: number;
    price: number;
}

interface LowStockReportData {
    generated_at?: string;
    filters?: {
        store_ids: number[];
        category_id?: number;
        brand_id?: number;
        format: string;
    };
    summary: {
        total_products: number;
        total_quantity: number;
    };
    items: LowStockReportItem[];
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
}

const LowStockReportPage = () => {
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [reportData, setReportData] = useState<LowStockReportData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const printRef = useRef<HTMLDivElement>(null);
    const { currentStoreId, currentStore } = useCurrentStore();

    const [getLowStockReport, { isLoading }] = useGetLowStockReportMutation();

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

                const response = await getLowStockReport(payload).unwrap();

                if (format === 'json') {
                    setReportData(response.data);
                }
            } catch (error: any) {
                console.error('Error fetching low stock report:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error?.data?.message || 'Failed to fetch low stock report',
                });
            }
        },
        [getLowStockReport, currentPage, itemsPerPage]
    );

    // Trigger API call when pagination changes (but not on initial mount)
    useEffect(() => {
        if (Object.keys(filterParams).length > 0) {
            fetchReport(filterParams);
        }
    }, [currentPage, itemsPerPage]);

    // Handle filter changes
    const handleFilterChange = useCallback(
        (params: Record<string, any>) => {
            setFilterParams(params);
            setCurrentPage(1); // Reset to first page

            // Fetch with new filters immediately
            const fetchWithNewFilters = async () => {
                try {
                    const payload = {
                        ...params,
                        format: 'json',
                        page: 1,
                        per_page: itemsPerPage,
                    };

                    const response = await getLowStockReport(payload).unwrap();
                    setReportData(response.data);
                } catch (error: any) {
                    console.error('Error fetching low stock report:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error?.data?.message || 'Failed to fetch low stock report',
                    });
                }
            };

            fetchWithNewFilters();
        },
        [getLowStockReport, itemsPerPage]
    );

    // Handle page changes
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (perPage: number) => {
        setItemsPerPage(perPage);
        setCurrentPage(1); // Reset to first page
    };

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

    // Calculate stock shortage
    const calculateShortage = (quantity: number, lowLimit: number) => {
        return Math.max(0, lowLimit - quantity);
    };

    // Table columns
    const columns: TableColumn[] = [
        {
            key: 'store',
            label: 'Store',
            sortable: true,
            render: (value) => <span className="font-medium text-gray-900">{value}</span>,
        },
        {
            key: 'product',
            label: 'Product',
            sortable: true,
            render: (value, row) => (
                <div>
                    <div className="font-medium text-gray-900">{value}</div>
                    <div className="text-xs text-gray-500">SKU: {row.sku}</div>
                </div>
            ),
        },
        {
            key: 'brand',
            label: 'Brand',
            sortable: true,
            render: (value) => <span className="text-gray-700">{value}</span>,
        },
        {
            key: 'category',
            label: 'Category',
            sortable: true,
            render: (value) => <span className="text-gray-700">{value}</span>,
        },
        {
            key: 'quantity',
            label: 'Current Stock',
            render: (value, row) => (
                <div className="text-center">
                    <span className={`font-bold ${value === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                        {value} {row.unit}
                    </span>
                </div>
            ),
        },
        {
            key: 'low_limit',
            label: 'Low Limit',
            render: (value, row) => (
                <span className="text-gray-600">
                    {value} {row.unit}
                </span>
            ),
        },
        {
            key: 'shortage',
            label: 'Shortage',
            render: (value, row) => {
                const shortage = calculateShortage(row.quantity, row.low_limit);
                return <span className={`font-bold ${shortage > 0 ? 'text-red-600' : 'text-green-600'}`}>{shortage > 0 ? `${shortage} ${row.unit}` : 'In Stock'}</span>;
            },
        },
        {
            key: 'price',
            label: 'Unit Price',
            render: (value) => <span className="font-medium">৳{Number(value || 0).toFixed(2)}</span>,
        },
        {
            key: 'status',
            label: 'Status',
            render: (value, row) => {
                const shortage = calculateShortage(row.quantity, row.low_limit);
                const status = row.quantity === 0 ? 'Out of Stock' : shortage > 0 ? 'Critical' : 'Low Stock';
                const colorClass = row.quantity === 0 ? 'bg-red-100 text-red-800' : shortage > 0 ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800';

                return (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {status}
                    </span>
                );
            },
        },
    ];

    // Use data from API (server-side pagination)
    const paginatedData = reportData?.items || [];

    // Calculate total pages from API response
    const totalPages = reportData?.pagination?.total_pages || Math.ceil((reportData?.summary?.total_products || 0) / itemsPerPage);

    // Calculate additional summary metrics
    const outOfStockCount = reportData?.items?.filter((item) => item.quantity === 0).length || 0;
    const criticalStockCount = reportData?.items?.filter((item) => item.quantity > 0 && item.quantity < item.low_limit).length || 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section - Fully Responsive */}
            <div className="mb-4 rounded-xl bg-white p-4 shadow-sm sm:mb-6 sm:rounded-2xl sm:p-5 md:mb-8 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Title Section */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-2 shadow-lg sm:rounded-xl sm:p-3">
                            <Package className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Low Stock Report</h1>
                            <p className="text-xs text-gray-500 sm:text-sm">Monitor products with low inventory levels</p>
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
                <LowStockReportFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Summary Cards */}
            {reportData && (
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Low Stock</p>
                            <Package className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{reportData.summary.total_products}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Out of Stock</p>
                            <AlertTriangle className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{outOfStockCount}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Critical Stock</p>
                            <TrendingDown className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{criticalStockCount}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Quantity</p>
                            <Package className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{reportData.summary.total_quantity}</p>
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

                {/* Table - Screen View (Server-side Paginated) */}
                {!isLoading && reportData && (
                    <div className="print:hidden">
                        <ReusableTable
                            data={paginatedData}
                            columns={columns}
                            isLoading={isLoading}
                            emptyState={{
                                icon: <Package className="h-16 w-16" />,
                                title: 'No Low Stock Products',
                                description: 'All products are well stocked or try adjusting your filters.',
                            }}
                            pagination={{
                                currentPage,
                                totalPages,
                                itemsPerPage,
                                totalItems: reportData?.pagination?.total || reportData?.summary?.total_products || 0,
                                onPageChange: handlePageChange,
                                onItemsPerPageChange: handleItemsPerPageChange,
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Print-Only View (Full Data) */}
            {!isLoading && reportData && (
                <div ref={printRef} className="hidden print:block">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold">Low Stock Report</h1>
                        <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                    </div>

                    {/* Summary Section */}
                    <div className="mb-6 grid grid-cols-4 gap-4 border-b pb-4">
                        <div>
                            <p className="text-xs text-gray-600">Total Low Stock</p>
                            <p className="text-lg font-bold">{reportData.summary.total_products}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Out of Stock</p>
                            <p className="text-lg font-bold">{outOfStockCount}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Critical Stock</p>
                            <p className="text-lg font-bold">{criticalStockCount}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Total Quantity</p>
                            <p className="text-lg font-bold">{reportData.summary.total_quantity}</p>
                        </div>
                    </div>

                    {/* Full Table */}
                    <ReusableTable
                        data={reportData.items}
                        columns={columns}
                        isLoading={false}
                        emptyState={{
                            icon: <Package className="h-16 w-16" />,
                            title: 'No Low Stock Products',
                            description: 'All products are well stocked.',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default LowStockReportPage;
