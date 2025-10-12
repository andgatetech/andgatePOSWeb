'use client';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import StockReportFilter from '@/components/filters/StockReportFilter';
import Loading from '@/components/layouts/loading';
import { downloadBase64File } from '@/lib/downloadFile';
import { useGetCurrentStockReportMutation } from '@/store/features/reports/reportApi';
import { Package, FileDown, FileSpreadsheet, Printer, TrendingUp, Boxes } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
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

    // Export handlers
    const handleExportPDF = async () => {
        try {
            const payload = {
                ...filterParams,
                format: 'pdf',
            };

            const response = await getCurrentStockReport(payload).unwrap();

            if (response?.data?.file) {
                downloadBase64File(response.data.file, response.data.filename || `stock-report-${new Date().getTime()}.pdf`, response.data.mime_type || 'application/pdf');

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

            const response = await getCurrentStockReport(payload).unwrap();

            if (response?.data?.file) {
                downloadBase64File(
                    response.data.file,
                    response.data.filename || `stock-report-${new Date().getTime()}.xlsx`,
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
        documentTitle: `Stock Report - ${new Date().toLocaleDateString()}`,
    });

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
            {/* Header Section */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-3 shadow-lg">
                            <Package className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Stock Report</h1>
                            <p className="text-sm text-gray-500">Current inventory and stock levels overview</p>
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
