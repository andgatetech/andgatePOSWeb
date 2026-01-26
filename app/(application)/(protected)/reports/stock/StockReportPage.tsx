'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import StockReportFilter from '@/components/filters/reports/StockReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import Loader from '@/lib/Loader';
import { useGetStockReportMutation } from '@/store/features/reports/reportApi';
import { AlertTriangle, CheckCircle, FileText, Layers, Package, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const StockReportPage = () => {
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('quantity');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getStockReport, { data: reportData, isLoading }] = useGetStockReportMutation();
    const [getStockReportForExport] = useGetStockReportMutation();

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
    }, [queryParams, currentStoreId, apiParams, getStockReport]);

    const stocks = useMemo(() => reportData?.data?.stocks || [], [reportData]);
    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const pagination = useMemo(() => reportData?.data?.pagination || {}, [reportData]);

    const handleFilterChange = useCallback((n: Record<string, any>) => {
        setApiParams(n);
        setCurrentPage(1);
    }, []);
    const handleSort = useCallback(
        (f: string) => {
            if (sortField === f) setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'));
            else {
                setSortField(f);
                setSortDirection('asc');
            }
            setCurrentPage(1);
        },
        [sortField]
    );
    const handlePageChange = useCallback((p: number) => setCurrentPage(p), []);
    const handleItemsPerPageChange = useCallback((i: number) => {
        setItemsPerPage(i);
        setCurrentPage(1);
    }, []);

    const fetchAllDataForExport = useCallback(async (): Promise<any[]> => {
        const exportParams: Record<string, any> = { ...apiParams, export: true, sort_field: sortField, sort_direction: sortDirection };
        if (!exportParams.store_id && !exportParams.store_ids && currentStoreId) exportParams.store_id = currentStoreId;
        try {
            const result = await getStockReportForExport(exportParams).unwrap();
            return result?.data?.stocks || [];
        } catch (e) {
            console.error('Export failed:', e);
            return stocks;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, stocks, getStockReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'sku', label: 'SKU', width: 12 },
            { key: 'product_name', label: 'Product', width: 25 },
            { key: 'category', label: 'Category', width: 15 },
            { key: 'brand', label: 'Brand', width: 12 },
            { key: 'quantity', label: 'Stock', width: 10 },
            { key: 'stock_value', label: 'Stock Value', width: 15, format: (v) => formatCurrency(v) },
            { key: 'retail_value', label: 'Retail Value', width: 15, format: (v) => formatCurrency(v) },
            { key: 'profit_margin', label: 'Margin %', width: 10, format: (v) => `${Number(v).toFixed(2)}%` },
            { key: 'price', label: 'Price', width: 12, format: (v) => formatCurrency(v) },
        ],
        [formatCurrency]
    );

    const filterSummary = useMemo(() => {
        const selectedStore = apiParams.store_ids
            ? 'All Stores'
            : apiParams.store_id
            ? userStores.find((s: any) => s.id === apiParams.store_id)?.store_name || currentStore?.store_name || 'All Stores'
            : currentStore?.store_name || 'All Stores';
        let dateType = 'none';
        if (apiParams.date_range_type) dateType = apiParams.date_range_type;
        else if (apiParams.start_date || apiParams.end_date) dateType = 'custom';
        return { dateRange: { startDate: apiParams.start_date, endDate: apiParams.end_date, type: dateType }, storeName: selectedStore, customFilters: [] };
    }, [apiParams, currentStore, userStores]);

    const exportSummary = useMemo(
        () => [
            { label: 'Total Items', value: summary.total_items || 0 },
            { label: 'Total Quantity', value: (summary.total_quantity || 0).toLocaleString() },
            { label: 'Returned to Stock', value: (summary.quantity_returned_to_stock || 0).toLocaleString() },
            { label: 'Total Stock Value', value: formatCurrency(summary.total_stock_value) },
        ],
        [summary, formatCurrency]
    );

    const summaryItems = useMemo(
        () => [
            { label: 'Total Items', value: summary.total_items || 0, icon: <Package className="h-4 w-4 text-blue-600" />, bgColor: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-600' },
            {
                label: 'Total Quantity',
                value: (summary.total_quantity || 0).toLocaleString(),
                icon: <Layers className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
            { label: 'In Stock', value: summary.in_stock || 0, icon: <CheckCircle className="h-4 w-4 text-green-600" />, bgColor: 'bg-green-500', lightBg: 'bg-green-50', textColor: 'text-green-600' },
            { label: 'Out of Stock', value: summary.out_of_stock || 0, icon: <XCircle className="h-4 w-4 text-red-600" />, bgColor: 'bg-red-500', lightBg: 'bg-red-50', textColor: 'text-red-600' },
            {
                label: 'Returned to Stock',
                value: (summary.quantity_returned_to_stock || 0).toLocaleString(),
                icon: <Package className="h-4 w-4 text-emerald-600" />,
                bgColor: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            },
        ],
        [summary]
    );

    const columns = useMemo(
        () => [
            { key: 'sku', label: 'SKU', render: (v: any) => <span className="font-mono text-sm text-gray-600">{v || '-'}</span> },
            {
                key: 'product_name',
                label: 'Product',
                sortable: true,
                render: (v: any, r: any) => (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{v}</span>
                        {r.variant_data && (
                            <span className="text-xs text-gray-500">
                                {Object.entries(r.variant_data)
                                    .map(([k, val]) => `${k}: ${val}`)
                                    .join(', ')}
                            </span>
                        )}
                        {r.batch_no && <span className="text-xs text-gray-400">Batch: {r.batch_no}</span>}
                    </div>
                ),
            },
            { key: 'category', label: 'Category', render: (v: any) => <span className="text-sm text-gray-700">{v || 'Uncategorized'}</span> },
            { key: 'brand', label: 'Brand', render: (v: any) => <span className="text-sm text-gray-700">{v || 'Unbranded'}</span> },
            {
                key: 'quantity',
                label: 'Stock',
                sortable: true,
                render: (v: any, r: any) => {
                    const isLow = r.is_low_stock;
                    const isOut = r.is_out_of_stock;
                    let c = 'text-gray-900';
                    if (isOut) c = 'text-red-600';
                    else if (isLow) c = 'text-orange-600';
                    return (
                        <div className="flex items-center gap-2">
                            <span className={`font-bold ${c}`}>{v}</span>
                            {isLow && !isOut && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                            {isOut && <XCircle className="h-4 w-4 text-red-500" />}
                        </div>
                    );
                },
            },
            { key: 'stock_value', label: 'Stock Value', sortable: true, render: (v: any) => <span className="font-semibold text-blue-600">{formatCurrency(v)}</span> },
            { key: 'retail_value', label: 'Retail Value', sortable: true, render: (v: any) => <span className="font-semibold text-green-600">{formatCurrency(v)}</span> },
            {
                key: 'profit_margin',
                label: 'Margin %',
                sortable: true,
                render: (v: any) => <span className={`font-semibold ${Number(v) < 0 ? 'text-red-600' : 'text-green-600'}`}>{Number(v).toFixed(2)}%</span>,
            },
            { key: 'price', label: 'Selling Price', render: (v: any) => <span className="text-sm text-gray-700">{formatCurrency(v)}</span> },
            {
                key: 'available',
                label: 'Status',
                render: (v: any, r: any) =>
                    r.is_out_of_stock ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Out of Stock</span>
                    ) : r.is_low_stock ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">Low Stock</span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">In Stock</span>
                    ),
            },
        ],
        [formatCurrency]
    );

    if (isLoading && !reportData?.data) {
        return <Loader message="Loading stock report..." />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle="Stock Report"
                    reportDescription="View complete inventory stock levels"
                    reportIcon={<Layers className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-indigo-600 to-indigo-700"
                    data={stocks}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="stock_report"
                    fetchAllData={fetchAllDataForExport}
                />
                <ReportSummaryCard items={summaryItems} />

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
            </div>
        </div>
    );
};

export default StockReportPage;
