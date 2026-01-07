'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetSalesItemsReportMutation } from '@/store/features/reports/reportApi';
import { BarChart3, Boxes, FileText, Layers, Package, ShoppingCart, Tag, TrendingUp } from 'lucide-react';
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

    useEffect(() => {
        const queryString = JSON.stringify(queryParams);
        if (lastQueryParams.current === queryString) return;
        if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
            lastQueryParams.current = queryString;
            getSalesItemsReport(queryParams);
        }
    }, [queryParams, currentStoreId, apiParams, getSalesItemsReport]);

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
            { key: 'sku', label: 'SKU', width: 12 },
            { key: 'category', label: 'Category', width: 15 },
            { key: 'brand', label: 'Brand', width: 12 },
            { key: 'sold_qty', label: 'Sold Qty', width: 10 },
            { key: 'sold_amount', label: 'Revenue', width: 15, format: (v) => formatCurrency(v) },
            { key: 'instock_qty', label: 'Stock', width: 10 },
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
            { label: 'Total Revenue', value: formatCurrency(summary.total_sold_amount) },
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
                label: 'Gross Profit (Sold Value)',
                value: formatCurrency(summary.total_sold_amount),
                icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
                bgColor: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            },
            {
                label: 'Avg Revenue / Item',
                value: formatCurrency(summary.total_sold_amount / (summary.total_sold_qty || 1)),
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
                label: 'Product Information',
                sortable: true,
                render: (v: any, r: any) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{v}</span>
                        <div className="mt-0.5 flex items-center gap-2">
                            <span className="rounded border bg-gray-50 px-1 font-mono text-[10px] text-gray-400">{r.sku}</span>
                            <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                <Layers className="h-2.5 w-2.5" /> {r.category}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                key: 'brand',
                label: 'Brand',
                render: (v: any) => (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Tag className="h-3.5 w-3.5 text-gray-400" />
                        {v || 'Unbranded'}
                    </div>
                ),
            },
            { key: 'sold_qty', label: 'Sold Qty', sortable: true, render: (v: any) => <span className="font-bold text-gray-900">{Number(v).toLocaleString()}</span> },
            { key: 'sold_amount', label: 'Revenue Generated', sortable: true, render: (v: any) => <span className="font-bold text-emerald-600">{formatCurrency(v)}</span> },
            {
                key: 'instock_qty',
                label: 'Availability',
                render: (v: any) => {
                    const s = Number(v);
                    let c = 'bg-blue-100 text-blue-800';
                    let l = 'In Stock';
                    if (s === 0) {
                        c = 'bg-red-100 text-red-800';
                        l = 'Out of Stock';
                    } else if (s < 10) {
                        c = 'bg-amber-100 text-amber-800';
                        l = 'Low Stock';
                    }
                    return (
                        <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${c}`}>{l}</span>
                            <span className="flex items-center justify-center gap-1 text-[11px] font-medium text-gray-500">
                                <Boxes className="h-3 w-3" /> {s}
                            </span>
                        </div>
                    );
                },
            },
        ],
        []
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
