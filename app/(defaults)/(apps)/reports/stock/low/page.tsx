'use client';
import LowStockReportFilter from '@/__components/LowStockReportFilter';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import Loading from '@/components/layouts/loading';
import { downloadBase64File } from '@/lib/downloadFile';
import { useGetLowStockReportMutation } from '@/store/features/reports/reportApi';
import { AlertTriangle, FileDown, FileSpreadsheet, Package, Printer, TrendingDown } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
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
    generated_at: string;
    filters: {
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
}

const LowStockReportPage = () => {
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [reportData, setReportData] = useState<LowStockReportData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const printRef = useRef<HTMLDivElement>(null);

    const [getLowStockReport, { isLoading }] = useGetLowStockReportMutation();

    // Fetch report data
    const fetchReport = useCallback(
        async (params: Record<string, any>, format: string = 'json') => {
            try {
                const payload = { ...params, format };
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
        [getLowStockReport]
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

            const response = await getLowStockReport(payload).unwrap();

            if (response?.data?.file) {
                downloadBase64File(response.data.file, response.data.filename || `low-stock-report-${new Date().getTime()}.pdf`, response.data.mime_type || 'application/pdf');

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

            const response = await getLowStockReport(payload).unwrap();

            if (response?.data?.file) {
                downloadBase64File(
                    response.data.file,
                    response.data.filename || `low-stock-report-${new Date().getTime()}.xlsx`,
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
        documentTitle: `Low Stock Report - ${new Date().toLocaleDateString()}`,
    });

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

    // Pagination
    const paginatedData = reportData?.items?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];
    const totalPages = Math.ceil((reportData?.items?.length || 0) / itemsPerPage);

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
                            icon: <Package className="h-16 w-16" />,
                            title: 'No Low Stock Products',
                            description: 'All products are well stocked or try adjusting your filters.',
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
