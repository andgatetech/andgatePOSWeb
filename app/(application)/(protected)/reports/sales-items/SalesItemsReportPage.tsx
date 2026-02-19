'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetSalesItemsReportMutation } from '@/store/features/reports/reportApi';
import { BarChart3, FileText, Layers, Package, ShoppingCart, Tag, TrendingDown, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SalesItemsReportPage = () => {
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('sold_qty');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getSalesItemsReport, { data: reportData, isLoading }] = useGetSalesItemsReportMutation();
    const [getSalesItemsReportForExport] = useGetSalesItemsReportMutation();

    const lastQueryParams = useRef<string>('');

    const queryParams = useMemo(() => {
        const params: Record<string, any> = { page: currentPage, per_page: itemsPerPage, sort_field: sortField, sort_direction: sortDirection, ...apiParams };
        if (!params.store_id && !params.store_ids && currentStoreId) params.store_id = currentStoreId;
        return params;
    }, [apiParams, currentStoreId, currentPage, itemsPerPage, sortField, sortDirection]);

    // Reset lastQueryParams when store changes to force API recall
    useEffect(() => {
        lastQueryParams.current = '';
    }, [currentStoreId]);

    useEffect(() => {
        const queryString = JSON.stringify(queryParams);
        if (lastQueryParams.current === queryString) return;
        if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
            lastQueryParams.current = queryString;
            getSalesItemsReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const items = useMemo(() => reportData?.data?.items || [], [reportData]);
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
            const result = await getSalesItemsReportForExport(exportParams).unwrap();
            return result?.data?.items || [];
        } catch (e) {
            console.error('Export failed:', e);
            return items;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, items, getSalesItemsReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'product_name', label: 'Product', width: 25 },
            { key: 'sku', label: 'SKU', width: 18 },
            { key: 'variant', label: 'Variant', width: 15, format: (v) => (v && typeof v === 'object' ? Object.values(v).join(' / ') : v || '') },
            { key: 'category', label: 'Category', width: 15 },
            { key: 'brand', label: 'Brand', width: 12 },
            { key: 'sold_qty', label: 'Sold Qty', width: 10 },
            { key: 'sold_amount', label: 'Sold Amount', width: 15, format: (v) => formatCurrency(v) },
            { key: 'cost_of_goods', label: 'Cost of Goods', width: 15, format: (v) => formatCurrency(v) },
            { key: 'unit_profit', label: 'Unit Profit', width: 12, format: (v) => formatCurrency(v) },
            { key: 'total_profit', label: 'Total Profit', width: 15, format: (v) => formatCurrency(v) },
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
            { label: 'Unique Items', value: summary.total_items || 0 },
            { label: 'Total Qty Sold', value: summary.total_sold_qty || 0 },
            { label: 'Total Sold Amount', value: formatCurrency(summary.total_sold_amount) },
            { label: 'Total Profit', value: formatCurrency(summary.total_profit) },
        ],
        [summary, formatCurrency]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: 'Unique Items Sold',
                value: summary.total_items || 0,
                icon: <Package className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Total Quantity Sold',
                value: Number(summary.total_sold_qty || 0).toLocaleString(),
                icon: <ShoppingCart className="h-4 w-4 text-orange-600" />,
                bgColor: 'bg-orange-500',
                lightBg: 'bg-orange-50',
                textColor: 'text-orange-600',
            },
            {
                label: 'Total Sold Amount',
                value: formatCurrency(summary.total_sold_amount),
                icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
                bgColor: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            },
            {
                label: 'Total Profit',
                value: formatCurrency(summary.total_profit),
                icon: <BarChart3 className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
        ],
        [summary, formatCurrency]
    );

    const columns = useMemo(
        () => [
            {
                key: 'product_name',
                label: 'Product',
                sortable: true,
                render: (v: any, row: any) => {
                    const variantStr = row.variant && typeof row.variant === 'object' ? Object.values(row.variant).join(' / ') : row.variant || null;
                    return (
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{v}</span>
                            {variantStr && <span className="text-xs text-indigo-600">{variantStr}</span>}
                        </div>
                    );
                },
            },
            {
                key: 'sku',
                label: 'SKU',
                sortable: true,
                render: (v: any) => <span className="font-mono text-xs text-gray-500">{v}</span>,
            },
            {
                key: 'category',
                label: 'Category',
                sortable: true,
                render: (v: any) => (
                    <span className="inline-flex items-center gap-1.5 rounded bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                        <Layers className="h-3 w-3" /> {v || 'N/A'}
                    </span>
                ),
            },
            {
                key: 'brand',
                label: 'Brand',
                sortable: true,
                render: (v: any) => (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Tag className="h-3.5 w-3.5 text-gray-400" />
                        {v || 'Unbranded'}
                    </div>
                ),
            },
            {
                key: 'sold_qty',
                label: 'Sold Qty',
                sortable: true,
                render: (v: any) => <span className="font-bold text-gray-900">{Number(v).toLocaleString()}</span>,
            },
            {
                key: 'sold_amount',
                label: 'Sold Amount',
                sortable: true,
                render: (v: any) => <span className="font-bold text-emerald-600">{formatCurrency(v)}</span>,
            },
            {
                key: 'cost_of_goods',
                label: 'Cost of Goods',
                sortable: true,
                render: (v: any) => <span className="font-medium text-gray-600">{formatCurrency(v)}</span>,
            },
            {
                key: 'unit_profit',
                label: 'Unit Profit',
                sortable: true,
                render: (v: any) => {
                    const profit = Number(v);
                    return (
                        <div className="flex items-center gap-1">
                            {profit >= 0 ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                            <span className={`font-medium ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(profit)}</span>
                        </div>
                    );
                },
            },
            {
                key: 'total_profit',
                label: 'Total Profit',
                sortable: true,
                render: (v: any) => {
                    const profit = Number(v);
                    return (
                        <span className={`font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            {profit >= 0 ? '+' : ''}
                            {formatCurrency(profit)}
                        </span>
                    );
                },
            },
        ],
        [formatCurrency]
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle="Sold Items Report"
                    reportDescription="List of all products and how many units were sold"
                    reportIcon={<BarChart3 className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-teal-500 to-emerald-600"
                    data={items}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="sales_items_report"
                    fetchAllData={fetchAllDataForExport}
                />
                <ReportSummaryCard items={summaryItems} />
                <div className="mb-6">
                    <BasicReportFilter onFilterChange={handleFilterChange} placeholder="Search product name, SKU, or category..." />
                </div>
                <ReusableTable
                    data={items}
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
                        title: 'No Sales Data Found',
                        description: 'No items were sold matching your current filter criteria.',
                    }}
                />
            </div>
        </div>
    );
};

export default SalesItemsReportPage;
