'use client';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import StockAdjustmentReportFilter from '@/components/filters/StockAdjustmentReportFilter';
// import StockAdjustmentReportFilter from '@/components/filters/StockAdjustmentReportFilter';
import Loading from '@/components/layouts/loading';
import { downloadBase64File } from '@/lib/downloadFile';
import { useGetStockAdjustmentReportMutation } from '@/store/features/reports/reportApi';
import { Activity, FileDown, FileSpreadsheet, FileText, Printer, TrendingDown, TrendingUp } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';

interface StockAdjustmentItem {
    id: number;
    reference_no: string;
    product_id: number;
    product_name: string;
    product_sku: string;
    store_name: string;
    stock_type: string;
    direction: 'increase' | 'decrease';
    previous_stock: number;
    adjusted_stock: number;
    adjustment_quantity: number;
    reason: string | null;
    user_name: string;
    created_at: string;
}

interface StockAdjustmentReportData {
    generated_at: string;
    filters: {
        store_ids: number[];
        start_date?: string;
        end_date?: string;
        direction?: string;
        stock_type_id?: number;
        format: string;
    };
    summary: {
        total_adjustments: number;
        total_increases: number;
        total_decreases: number;
        net_change: number;
    };
    items: StockAdjustmentItem[];
}

const StockAdjustmentReportPage = () => {
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [reportData, setReportData] = useState<StockAdjustmentReportData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const printRef = useRef<HTMLDivElement>(null);

    const [getStockAdjustmentReport, { isLoading }] = useGetStockAdjustmentReportMutation();

    // Fetch report data
    const fetchReport = useCallback(
        async (params: Record<string, any>, format: string = 'json') => {
            try {
                const payload = {
                    ...params,
                    format,
                };

                const response = await getStockAdjustmentReport(payload).unwrap();

                if (format === 'json') {
                    setReportData(response.data);
                }
            } catch (error: any) {
                console.error('Error fetching stock adjustment report:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error?.data?.message || 'Failed to fetch stock adjustment report',
                });
            }
        },
        [getStockAdjustmentReport]
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

            const response = await getStockAdjustmentReport(payload).unwrap();

            if (response?.data?.file) {
                downloadBase64File(response.data.file, response.data.filename || `stock-adjustment-report-${new Date().getTime()}.pdf`, response.data.mime_type || 'application/pdf');

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

            const response = await getStockAdjustmentReport(payload).unwrap();

            if (response?.data?.file) {
                downloadBase64File(
                    response.data.file,
                    response.data.filename || `stock-adjustment-report-${new Date().getTime()}.xlsx`,
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
        documentTitle: `Stock Adjustment Report - ${new Date().toLocaleDateString()}`,
    });

    // Get direction badge color
    const getDirectionBadge = (direction: string) => {
        if (direction === 'increase') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    <TrendingUp className="h-3 w-3" />
                    Increase
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                <TrendingDown className="h-3 w-3" />
                Decrease
            </span>
        );
    };

    // Get stock type badge color
    const getStockTypeBadge = (stockType: string) => {
        const colors: Record<string, string> = {
            damage: 'bg-red-100 text-red-800',
            lost: 'bg-orange-100 text-orange-800',
            'in-stock': 'bg-green-100 text-green-800',
            'stock-out': 'bg-yellow-100 text-yellow-800',
        };
        return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[stockType.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>{stockType}</span>;
    };

    // Table columns
    const columns: TableColumn[] = [
        {
            key: 'reference_no',
            label: 'Reference No',
            sortable: true,
            render: (value) => <span className="font-medium text-blue-600">{value}</span>,
        },
        {
            key: 'product_name',
            label: 'Product',
            sortable: true,
            render: (value, row) => (
                <div>
                    <div className="font-medium text-gray-900">{value}</div>
                    <div className="text-xs text-gray-500">{row.product_sku || 'N/A'}</div>
                </div>
            ),
        },
        {
            key: 'store_name',
            label: 'Store',
            sortable: true,
            render: (value) => <span className="text-sm">{value || 'N/A'}</span>,
        },
        {
            key: 'stock_type',
            label: 'Stock Type',
            sortable: true,
            render: (value) => getStockTypeBadge(value),
        },
        {
            key: 'direction',
            label: 'Direction',
            render: (value) => getDirectionBadge(value),
        },
        {
            key: 'previous_stock',
            label: 'Previous',
            render: (value) => <span className="font-medium text-gray-700">{value}</span>,
        },
        {
            key: 'adjusted_stock',
            label: 'Adjusted',
            render: (value) => <span className="font-medium text-gray-700">{value}</span>,
        },
        {
            key: 'change',
            label: 'Change',
            render: (value, row) => (
                <span className={`font-bold ${row.direction === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {row.direction === 'increase' ? '+' : '-'}
                    {Math.abs(value)}
                </span>
            ),
        },
        {
            key: 'user',
            label: 'User',
            sortable: true,
            render: (value) => <span className="text-sm text-gray-600">{value || 'N/A'}</span>,
        },
        {
            key: 'created_at',
            label: 'Date',
            render: (value) => (
                <div>
                    <div className="text-sm text-gray-900">{new Date(value).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{new Date(value).toLocaleTimeString()}</div>
                </div>
            ),
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
                            <Activity className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Stock Adjustment Report</h1>
                            <p className="text-xs text-gray-500 sm:text-sm">Track all stock adjustments and inventory changes</p>
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
                <StockAdjustmentReportFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Summary Cards */}
            {reportData && (
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Total Adjustments</p>
                            <FileText className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{reportData.summary.total_adjustments}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Increases</p>
                            <TrendingUp className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{reportData.summary.total_increases}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Decreases</p>
                            <TrendingDown className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{reportData.summary.total_decreases}</p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium opacity-90">Net Change</p>
                            <Activity className="h-6 w-6 opacity-80" />
                        </div>
                        <p className={`text-3xl font-bold ${reportData.summary.net_change >= 0 ? 'text-white' : 'text-red-200'}`}>
                            {reportData.summary.net_change >= 0 ? '+' : ''}
                            {reportData.summary.net_change}
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
                            icon: <Activity className="h-16 w-16" />,
                            title: 'No Adjustments Found',
                            description: 'Try adjusting your filters to see stock adjustment records.',
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
                        <h1 className="text-2xl font-bold">Stock Adjustment Report</h1>
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
                            <p className="text-xs text-gray-600">Total Adjustments</p>
                            <p className="text-lg font-bold">{reportData.summary.total_adjustments}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Increases</p>
                            <p className="text-lg font-bold text-green-600">{reportData.summary.total_increases}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Decreases</p>
                            <p className="text-lg font-bold text-red-600">{reportData.summary.total_decreases}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Net Change</p>
                            <p className={`text-lg font-bold ${reportData.summary.net_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {reportData.summary.net_change >= 0 ? '+' : ''}
                                {reportData.summary.net_change}
                            </p>
                        </div>
                    </div>

                    {/* Full Table */}
                    <ReusableTable
                        data={reportData.items}
                        columns={columns}
                        isLoading={false}
                        emptyState={{
                            icon: <Activity className="h-16 w-16" />,
                            title: 'No Adjustments Found',
                            description: 'Try adjusting your filters to see stock adjustment records.',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default StockAdjustmentReportPage;
