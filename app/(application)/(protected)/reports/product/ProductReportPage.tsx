'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetProductReportMutation } from '@/store/features/reports/reportApi';
import { Banknote, BarChart3, Box, FileText, Hash, Layers, Package, ShoppingCart, Tag, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const ProductReportPage = () => {
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('revenue');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getProductReport, { data: reportData, isLoading }] = useGetProductReportMutation();
    const [getProductReportForExport] = useGetProductReportMutation();

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
            getProductReport(queryParams);
        }
    }, [queryParams, currentStoreId, apiParams, getProductReport]);

    const products = useMemo(() => reportData?.data?.pos_products || [], [reportData]);
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
            const result = await getProductReportForExport(exportParams).unwrap();
            return result?.data?.pos_products || [];
        } catch (e) {
            console.error('Export failed:', e);
            return products;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, products, getProductReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'product_name', label: 'Product', width: 25 },
            { key: 'sku', label: 'SKU', width: 12 },
            { key: 'category', label: 'Category', width: 15 },
            { key: 'brand', label: 'Brand', width: 12 },
            { key: 'qty', label: 'Stock', width: 10 },
            { key: 'total_ordered', label: 'Sold', width: 10 },
            { key: 'revenue', label: 'Revenue', width: 15, format: (v) => formatCurrency(v) },
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
            { label: 'Products', value: summary.total_products || 0 },
            { label: 'Revenue', value: formatCurrency(summary.total_revenue) },
        ],
        [summary, formatCurrency]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: 'Unique Products',
                value: Number(summary.total_products || 0).toLocaleString(),
                icon: <Package className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Total Inventory',
                value: Number(summary.total_quantity || 0).toLocaleString(),
                icon: <Layers className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
            {
                label: 'Orders Fulfilled',
                value: Number(summary.total_ordered || 0).toLocaleString(),
                icon: <ShoppingCart className="h-4 w-4 text-emerald-600" />,
                bgColor: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            },
            {
                label: 'Gross Revenue',
                value: formatCurrency(summary.total_revenue),
                icon: <Banknote className="h-4 w-4 text-pink-600" />,
                bgColor: 'bg-pink-500',
                lightBg: 'bg-pink-50',
                textColor: 'text-pink-600',
            },
        ],
        [summary, formatCurrency]
    );

    const columns = useMemo(
        () => [
            {
                key: 'product_name',
                label: 'Product Information',
                sortable: true,
                render: (v: any, r: any) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-bold text-gray-900">
                            <Box className="h-3.5 w-3.5 text-gray-400" />
                            {v}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="rounded border bg-gray-50 px-1 font-mono text-[10px] text-gray-400">{r.sku}</span>
                            {r.variant_data && (
                                <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500">
                                    <Tag className="h-2.5 w-2.5" />
                                    {Object.entries(r.variant_data)
                                        .map(([k, val]) => `${k}: ${val}`)
                                        .join(', ')}
                                </div>
                            )}
                        </div>
                        {r.batch_no && (
                            <div className="mt-0.5 flex items-center gap-1 text-[9px] text-gray-400">
                                <Hash className="h-2 w-2" /> {r.batch_no}
                            </div>
                        )}
                    </div>
                ),
            },
            { key: 'category', label: 'Category', render: (v: any) => <span className="text-sm font-medium text-gray-700">{v || 'Uncategorized'}</span> },
            { key: 'brand', label: 'Brand', render: (v: any) => <span className="text-sm font-medium text-gray-700">{v || 'Unbranded'}</span> },
            {
                key: 'qty',
                label: 'Current Stock',
                sortable: true,
                render: (v: any, r: any) => (
                    <div className="flex flex-col">
                        <span className={`font-bold ${Number(v) > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                            {v} <span className="text-[10px] font-normal lowercase text-gray-500">{r.unit || 'pcs'}</span>
                        </span>
                        <span className="text-[10px] text-gray-400">Rate: {formatCurrency(r.price)}</span>
                    </div>
                ),
            },
            {
                key: 'total_ordered',
                label: 'Quantity Sold',
                sortable: true,
                render: (v: any) => (
                    <div className="flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">{v || 0}</span>
                    </div>
                ),
            },
            {
                key: 'revenue',
                label: 'Total Sales',
                sortable: true,
                render: (v: any) => (
                    <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                        {formatCurrency(v)}
                    </div>
                ),
            },
        ],
        [formatCurrency]
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle="Product Report"
                    reportDescription="Overview of all items and their sales details"
                    reportIcon={<Package className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-pink-600 to-rose-700"
                    data={products}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="product_report"
                    fetchAllData={fetchAllDataForExport}
                />
                <ReportSummaryCard items={summaryItems} />
                <div className="mb-6">
                    <BasicReportFilter onFilterChange={handleFilterChange} placeholder="Search products, SKU, category..." />
                </div>
                <ReusableTable
                    data={products}
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
                    emptyState={{
                        icon: <FileText className="mx-auto h-16 w-16 text-gray-300" />,
                        title: 'Catalogue Entry Not Found',
                        description: 'No products match your current search criteria or category filter.',
                    }}
                />
            </div>
        </div>
    );
};

export default ProductReportPage;
