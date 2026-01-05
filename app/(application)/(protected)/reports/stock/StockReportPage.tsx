'use client';

import ReportPageLayout from '@/app/(application)/(protected)/reports/_shared/ReportPageLayout';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import StockReportFilter from '@/components/filters/reports/StockReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetStockReportMutation } from '@/store/features/reports/reportApi';
import { AlertTriangle, Banknote, CheckCircle, FileText, Layers, Package, TrendingUp, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const StockReportPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('quantity');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getStockReport, { data: reportData, isLoading }] = useGetStockReportMutation();

    const lastQueryParams = useRef<string>('');

    const queryParams = useMemo(() => {
        const params: Record<string, any> = { page: currentPage, per_page: itemsPerPage, sort_field: sortField, sort_direction: sortDirection, ...apiParams };
        if (!params.store_id && !params.store_ids && currentStoreId) params.store_id = currentStoreId;
        return params;
    }, [apiParams, currentStoreId, currentPage, itemsPerPage, sortField, sortDirection]);

    useEffect(() => {
        const queryString = JSON.stringify(queryParams);
        if (lastQueryParams.current === queryString) return;
        if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
            lastQueryParams.current = queryString;
            getStockReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const stocks = useMemo(() => reportData?.data?.stocks || [], [reportData]);
    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const pagination = useMemo(() => reportData?.data?.pagination || {}, [reportData]);

    const handleFilterChange = useCallback((newApiParams: Record<string, any>) => {
        setApiParams(newApiParams);
        setCurrentPage(1);
    }, []);
    const handleSort = useCallback(
        (field: string) => {
            if (sortField === field) setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'));
            else {
                setSortField(field);
                setSortDirection('asc');
            }
            setCurrentPage(1);
        },
        [sortField]
    );
    const handlePageChange = useCallback((page: number) => setCurrentPage(page), []);
    const handleItemsPerPageChange = useCallback((items: number) => {
        setItemsPerPage(items);
        setCurrentPage(1);
    }, []);

    const summaryItems = useMemo(
        () => [
            {
                label: 'Total Items',
                value: summary.total_items || 0,
                icon: <Package className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Total Quantity',
                value: (summary.total_quantity || 0).toLocaleString(),
                icon: <Layers className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
            {
                label: 'In Stock',
                value: summary.in_stock || 0,
                icon: <CheckCircle className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: 'Out of Stock',
                value: summary.out_of_stock || 0,
                icon: <XCircle className="h-4 w-4 text-red-600" />,
                bgColor: 'bg-red-500',
                lightBg: 'bg-red-50',
                textColor: 'text-red-600',
            },
        ],
        [summary]
    );

    const columns = useMemo(
        () => [
            { key: 'sku', label: 'SKU', render: (value: any) => <span className="font-mono text-sm text-gray-600">{value || '-'}</span> },
            {
                key: 'product_name',
                label: 'Product',
                sortable: true,
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{value}</span>
                        {row.variant_data && (
                            <span className="text-xs text-gray-500">
                                {Object.entries(row.variant_data)
                                    .map(([key, val]) => `${key}: ${val}`)
                                    .join(', ')}
                            </span>
                        )}
                        {row.batch_no && <span className="text-xs text-gray-400">Batch: {row.batch_no}</span>}
                    </div>
                ),
            },
            { key: 'category', label: 'Category', render: (value: any) => <span className="text-sm text-gray-700">{value || 'Uncategorized'}</span> },
            { key: 'brand', label: 'Brand', render: (value: any) => <span className="text-sm text-gray-700">{value || 'Unbranded'}</span> },
            {
                key: 'quantity',
                label: 'Stock',
                sortable: true,
                render: (value: any, row: any) => {
                    const isLowStock = row.is_low_stock;
                    const isOutOfStock = row.is_out_of_stock;
                    let colorClass = 'text-gray-900';
                    if (isOutOfStock) colorClass = 'text-red-600';
                    else if (isLowStock) colorClass = 'text-orange-600';

                    return (
                        <div className="flex items-center gap-2">
                            <span className={`font-bold ${colorClass}`}>{value}</span>
                            {isLowStock && !isOutOfStock && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                            {isOutOfStock && <XCircle className="h-4 w-4 text-red-500" />}
                        </div>
                    );
                },
            },
            {
                key: 'stock_value',
                label: 'Stock Value',
                sortable: true,
                render: (value: any) => <span className="font-semibold text-blue-600">৳{Number(value || 0).toLocaleString()}</span>,
            },
            {
                key: 'retail_value',
                label: 'Retail Value',
                sortable: true,
                render: (value: any) => <span className="font-semibold text-green-600">৳{Number(value || 0).toLocaleString()}</span>,
            },
            {
                key: 'profit_margin',
                label: 'Margin %',
                sortable: true,
                render: (value: any) => {
                    const margin = Number(value);
                    const isNegative = margin < 0;
                    return <span className={`font-semibold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>{margin.toFixed(2)}%</span>;
                },
            },
            {
                key: 'price',
                label: 'Selling Price',
                render: (value: any) => <span className="text-sm text-gray-700">৳{Number(value || 0).toLocaleString()}</span>,
            },
            {
                key: 'available',
                label: 'Status',
                render: (value: any, row: any) => {
                    if (row.is_out_of_stock) {
                        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Out of Stock</span>;
                    }
                    if (row.is_low_stock) {
                        return <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">Low Stock</span>;
                    }
                    return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">In Stock</span>;
                },
            },
        ],
        []
    );

    return (
        <ReportPageLayout
            title="Stock Report"
            description="View complete inventory stock levels"
            icon={<Layers className="h-6 w-6 text-white" />}
            iconBgClass="bg-gradient-to-r from-indigo-600 to-indigo-700"
        >
            <ReportSummaryCard items={summaryItems} />

            {/* Financial Overview Cards */}
            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm">
                    <div className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-500 p-3">
                                <Banknote className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-700">Total Stock Value</p>
                                <p className="text-2xl font-bold text-blue-900">৳{Number(summary.total_stock_value || 0).toLocaleString()}</p>
                                <p className="text-xs text-blue-600">Purchase cost</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 shadow-sm">
                    <div className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-green-500 p-3">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-green-700">Total Retail Value</p>
                                <p className="text-2xl font-bold text-green-900">৳{Number(summary.total_retail_value || 0).toLocaleString()}</p>
                                <p className="text-xs text-green-600">Selling price</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-sm">
                    <div className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-emerald-500 p-3">
                                <Banknote className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-emerald-700">Potential Profit</p>
                                <p className="text-2xl font-bold text-emerald-900">৳{Number(summary.potential_profit || 0).toLocaleString()}</p>
                                <p className="text-xs text-emerald-600">If all sold at retail</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <StockReportFilter onFilterChange={handleFilterChange} />
            </div>
            <ReusableTable
                data={stocks}
                columns={columns}
                isLoading={isLoading}
                pagination={{
                    currentPage,
                    totalPages: pagination.last_page || 1,
                    itemsPerPage,
                    totalItems: pagination.total || 0,
                    onPageChange: handlePageChange,
                    onItemsPerPageChange: handleItemsPerPageChange,
                }}
                sorting={{ field: sortField, direction: sortDirection, onSort: handleSort }}
                emptyState={{ icon: <FileText className="mx-auto h-16 w-16" />, title: 'No Stock Found', description: 'No stock items match your current filters.' }}
            />
        </ReportPageLayout>
    );
};

export default StockReportPage;
