'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetLowStockReportMutation } from '@/store/features/reports/reportApi';
import { AlertCircle, AlertTriangle, Box, FileText, Package, Tag, TrendingDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const LowStockReportPage = () => {
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('quantity');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const [getLowStockReport, { data: reportData, isLoading }] = useGetLowStockReportMutation();
    const [getLowStockReportForExport] = useGetLowStockReportMutation();

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
            getLowStockReport(queryParams);
        }
    }, [queryParams, currentStoreId, apiParams, getLowStockReport]);

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
            const result = await getLowStockReportForExport(exportParams).unwrap();
            return result?.data?.stocks || [];
        } catch (e) {
            console.error('Export failed:', e);
            return stocks;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, stocks, getLowStockReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'product_name', label: 'Product', width: 25 },
            { key: 'sku', label: 'SKU', width: 12 },
            { key: 'category', label: 'Category', width: 15 },
            { key: 'brand', label: 'Brand', width: 12 },
            { key: 'quantity', label: 'Stock', width: 10 },
            { key: 'stock_percentage', label: 'Stock %', width: 10, format: (v) => `${Number(v).toFixed(0)}%` },
            { key: 'urgency', label: 'Urgency', width: 10 },
            { key: 'restock_cost', label: 'Restock Cost', width: 15, format: (v) => formatCurrency(v) },
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
            { label: 'Low Stock Items', value: summary.total_low_stock_items || 0 },
            { label: 'Out of Stock Items', value: summary.out_of_stock_items || 0 },
            { label: 'Total Items Tracked', value: summary.total_items_tracked || 0 },
        ],
        [summary]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: 'Stock Alert Items',
                value: summary.total_low_stock_items || 0,
                icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
                bgColor: 'bg-orange-500',
                lightBg: 'bg-orange-50',
                textColor: 'text-orange-600',
            },
            {
                label: 'Stock Outs',
                value: summary.out_of_stock_items || 0,
                icon: <AlertCircle className="h-4 w-4 text-rose-600" />,
                bgColor: 'bg-rose-500',
                lightBg: 'bg-rose-50',
                textColor: 'text-rose-600',
            },
            {
                label: 'Critical Threshold',
                value: summary.critical_stock_items || 0,
                icon: <TrendingDown className="h-4 w-4 text-amber-600" />,
                bgColor: 'bg-amber-500',
                lightBg: 'bg-amber-50',
                textColor: 'text-amber-600',
            },
            {
                label: 'Total Items',
                value: summary.total_items_tracked || 0,
                icon: <Package className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
        ],
        [summary]
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
                    </div>
                ),
            },
            { key: 'category', label: 'Category', render: (v: any) => <span className="text-sm font-medium text-gray-700">{v || 'Uncategorized'}</span> },
            { key: 'brand', label: 'Brand', render: (v: any) => <span className="text-sm font-medium text-gray-700">{v || 'Unbranded'}</span> },
            {
                key: 'stock_percentage',
                label: 'Stock Status',
                sortable: true,
                render: (v: any, r: any) => {
                    const pct = Number(v);
                    const isOut = r.is_out_of_stock;
                    let tc = 'text-orange-700';
                    if (isOut || pct <= 0) tc = 'text-rose-700';
                    else if (pct <= 20) tc = 'text-red-700';
                    return (
                        <div className="flex flex-col gap-1">
                            <span className={`text-xs font-black uppercase tracking-wider ${tc}`}>{isOut ? 'OUT OF STOCK' : `${pct.toFixed(0)}% LEVEL`}</span>
                            <span className="text-[10px] text-gray-400">
                                {r.quantity} / {r.low_stock_quantity}
                            </span>
                        </div>
                    );
                },
            },
            {
                key: 'urgency',
                label: 'Urgency',
                render: (v: any) => {
                    const u = v?.toLowerCase();
                    const c: any = {
                        high: { bg: 'bg-rose-100 border-rose-200', text: 'text-rose-700', icon: AlertCircle },
                        medium: { bg: 'bg-orange-100 border-orange-200', text: 'text-orange-700', icon: AlertTriangle },
                        low: { bg: 'bg-amber-100 border-amber-200', text: 'text-amber-700', icon: Tag },
                    };
                    const { bg, text, icon: Icon } = c[u] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: Tag };
                    return (
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${bg} ${text}`}>
                            <Icon className="h-3 w-3" />
                            {v}
                        </span>
                    );
                },
            },
            {
                key: 'restock_cost',
                label: 'Estimated Cost',
                sortable: true,
                render: (v: any, r: any) => (
                    <div className="flex flex-col text-right">
                        <span className="font-bold text-gray-900">{formatCurrency(v)}</span>
                        <span className="text-[10px] font-medium text-gray-400">Need {r.quantity_needed} Units</span>
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
                    reportTitle="Low Stock Report"
                    reportDescription="List of products that are running low and need restocking"
                    reportIcon={<AlertTriangle className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-orange-600 to-amber-700"
                    data={stocks}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="low_stock_report"
                    fetchAllData={fetchAllDataForExport}
                />
                <ReportSummaryCard items={summaryItems} />
                <div className="mb-6">
                    <BasicReportFilter onFilterChange={handleFilterChange} placeholder="Search product name, SKU..." />
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
                    emptyState={{
                        icon: <FileText className="mx-auto h-16 w-16 text-gray-300" />,
                        title: 'Inventory Healthy',
                        description: 'Excellent! All products are currently above their minimum safety levels.',
                    }}
                />
            </div>
        </div>
    );
};

export default LowStockReportPage;
