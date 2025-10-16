'use client';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import IdleProductFilter from '@/components/filters/IdleProductFilter';
import Loading from '@/components/layouts/loading';
import { downloadBase64File } from '@/lib/downloadFile';
import { useGetIdleProductReportMutation } from '@/store/features/reports/reportApi';
import { DollarSign, FileDown, FileSpreadsheet, Package, PackageX, Printer } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';

interface IdleProductItem {
    product_id: number;
    product_name: string;
    sku: string;
    store_name: string;
    category: string;
    brand: string;
    stock_quantity: number;
    unit_price: number;
    stock_value: number;
    last_sale_date: string;
    days_since_last_sale: number | string;
    idle_days_threshold: number;
}

interface IdleProductReportData {
    generated_at: string;
    filters: {
        store_ids: number[];
        idle_days: number;
        cutoff_date: string;
        format: string;
    };
    summary: {
        idle_products_count: number;
        total_idle_stock_quantity: number;
        total_idle_stock_value: number;
    };
    items: IdleProductItem[];
}

const IdleProductReportPage = () => {
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [reportData, setReportData] = useState<IdleProductReportData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const printRef = useRef<HTMLDivElement>(null);

    const [getIdleProductReport, { isLoading }] = useGetIdleProductReportMutation();

    // Fetch report data
    const fetchReport = useCallback(
        async (params: Record<string, any>, format: string = 'json') => {
            try {
                const payload = {
                    ...params,
                    format,
                };

                const response = await getIdleProductReport(payload).unwrap();

                if (format === 'json') {
                    setReportData(response.data);
                }
            } catch (error: any) {
                console.error('Error fetching idle product report:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error?.data?.message || 'Failed to fetch idle product report',
                });
            }
        },
        [getIdleProductReport]
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

            const response = await getIdleProductReport(payload).unwrap();

            if (response?.data?.file) {
                downloadBase64File(response.data.file, response.data.filename || `idle-product-report-${new Date().getTime()}.pdf`, response.data.mime_type || 'application/pdf');

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

            const response = await getIdleProductReport(payload).unwrap();

            if (response?.data?.file) {
                downloadBase64File(
                    response.data.file,
                    response.data.filename || `idle-product-report-${new Date().getTime()}.xlsx`,
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
        documentTitle: `Idle Product Report - ${new Date().toLocaleDateString()}`,
    });

    // Table columns
    const columns: TableColumn[] = [
        {
            key: 'product_name',
            label: 'Product',
            sortable: true,
            render: (value) => <span className="font-medium text-blue-600">{value}</span>,
        },
        {
            key: 'sku',
            label: 'SKU',
            sortable: true,
            render: (value) => <span className="font-mono text-xs text-gray-600">{value}</span>,
        },
        {
            key: 'store_name',
            label: 'Store',
            sortable: true,
        },
        {
            key: 'category',
            label: 'Category',
            render: (value) => <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">{value}</span>,
        },
        {
            key: 'brand',
            label: 'Brand',
            render: (value) => <span className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">{value}</span>,
        },
        {
            key: 'stock_quantity',
            label: 'Stock',
            render: (value) => <span className="font-semibold">{value}</span>,
        },
        {
            key: 'unit_price',
            label: 'Unit Price',
            render: (value) => `৳${value.toFixed(2)}`,
        },
        {
            key: 'stock_value',
            label: 'Stock Value',
            render: (value) => <span className="font-bold text-green-600">৳{value.toFixed(2)}</span>,
        },
        {
            key: 'last_sale_date',
            label: 'Last Sale',
            render: (value) => {
                if (value === 'Never') {
                    return <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800">Never</span>;
                }
                return <span className="text-sm text-gray-600">{new Date(value).toLocaleDateString()}</span>;
            },
        },
        {
            key: 'days_since_last_sale',
            label: 'Days Idle',
            render: (value) => {
                if (value === 'Never') {
                    return <span className="rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">∞</span>;
                }
                const days = Number(value);
                let colorClass = 'bg-yellow-100 text-yellow-800';
                if (days > 90) colorClass = 'bg-red-100 text-red-800';
                else if (days > 30) colorClass = 'bg-orange-100 text-orange-800';

                return <span className={`rounded px-2 py-1 text-xs font-medium ${colorClass}`}>{days} days</span>;
            },
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
                        <div className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-2 shadow-lg sm:rounded-xl sm:p-3">
                            <PackageX className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Idle Product Report</h1>
                            <p className="text-xs text-gray-500 sm:text-sm">Track slow-moving and stagnant inventory</p>
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
                <IdleProductFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Summary Cards */}
            {reportData && (
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Idle Products</p>
                            <PackageX className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{reportData.summary.idle_products_count}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Idle Stock</p>
                            <Package className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{reportData.summary.total_idle_stock_quantity.toFixed(0)}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Stock Value</p>
                            <DollarSign className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">৳{reportData.summary.total_idle_stock_value.toFixed(2)}</p>
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
                            icon: <PackageX className="h-16 w-16" />,
                            title: 'No Idle Products Found',
                            description: 'All products are selling well! Try adjusting your idle days threshold.',
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
                        <h1 className="text-2xl font-bold">Idle Product Report</h1>
                        <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">Idle Days Threshold: {reportData.filters.idle_days} days</p>
                    </div>

                    {/* Summary Section */}
                    <div className="mb-6 grid grid-cols-3 gap-4 border-b pb-4">
                        <div>
                            <p className="text-xs text-gray-600">Idle Products</p>
                            <p className="text-lg font-bold">{reportData.summary.idle_products_count}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Total Idle Stock</p>
                            <p className="text-lg font-bold">{reportData.summary.total_idle_stock_quantity.toFixed(0)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Stock Value</p>
                            <p className="text-lg font-bold">৳{reportData.summary.total_idle_stock_value.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Full Table */}
                    <ReusableTable
                        data={reportData.items}
                        columns={columns}
                        isLoading={false}
                        emptyState={{
                            icon: <PackageX className="h-16 w-16" />,
                            title: 'No Idle Products Found',
                            description: 'All products are selling well! Try adjusting your idle days threshold.',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default IdleProductReportPage;
