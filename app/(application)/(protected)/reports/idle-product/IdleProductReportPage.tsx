'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import DateColumn from '@/components/common/DateColumn';
import ReusableTable from '@/components/common/ReusableTable';
import IdleProductReportFilter from '@/components/filters/reports/IdleProductReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetIdleProductReportMutation } from '@/store/features/reports/reportApi';
import { AlertTriangle, Banknote, BarChart3, Box, Calendar, Clock, FileText, Package, Store, Tag, Timer } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const IdleProductReportPage = () => {
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({ idle_days: 30 });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('days_idle');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getIdleProductReport, { data: reportData, isLoading }] = useGetIdleProductReportMutation();
    const [getIdleProductReportForExport] = useGetIdleProductReportMutation();

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
            getIdleProductReport(queryParams);
        }
    }, [queryParams, currentStoreId, apiParams, getIdleProductReport]);

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
            const result = await getIdleProductReportForExport(exportParams).unwrap();
            return result?.data?.pos_products || [];
        } catch (e) {
            console.error('Export failed:', e);
            return products;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, products, getIdleProductReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'product_name', label: 'Product', width: 25 },
            { key: 'sku', label: 'SKU', width: 12 },
            { key: 'category', label: 'Category', width: 15 },
            { key: 'brand', label: 'Brand', width: 12 },
            { key: 'quantity', label: 'Stock', width: 10 },
            { key: 'stock_value', label: 'Value', width: 12, format: (v) => formatCurrency(v) },
            { key: 'last_sold_at', label: 'Last Sale', width: 15, format: (v) => v || 'Never' },
            { key: 'days_idle', label: 'Days Idle', width: 10 },
        ],
        [formatCurrency]
    );

    const filterSummary = useMemo(() => {
        const selectedStore = apiParams.store_ids
            ? 'All Stores'
            : apiParams.store_id
            ? userStores.find((s: any) => s.id === apiParams.store_id)?.store_name || currentStore?.store_name || 'All Stores'
            : currentStore?.store_name || 'All Stores';
        const customFilters: { label: string; value: string }[] = [];
        if (apiParams.idle_days) customFilters.push({ label: 'Idle Days', value: `>${apiParams.idle_days} Days` });
        let dateType = 'none';
        if (apiParams.date_range_type) dateType = apiParams.date_range_type;
        else if (apiParams.start_date || apiParams.end_date) dateType = 'custom';
        return { dateRange: { startDate: apiParams.start_date, endDate: apiParams.end_date, type: dateType }, storeName: selectedStore, customFilters };
    }, [apiParams, currentStore, userStores]);

    const exportSummary = useMemo(
        () => [
            { label: 'Idle Items', value: summary.total_idle_items || 0 },
            { label: 'Trapped Capital', value: formatCurrency(summary.total_idle_value) },
            { label: 'Date', value: new Date().toISOString() },
        ],
        [summary, formatCurrency]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: 'Idle SKUs',
                value: summary.total_idle_items || 0,
                icon: <Package className="h-4 w-4 text-orange-600" />,
                bgColor: 'bg-orange-500',
                lightBg: 'bg-orange-50',
                textColor: 'text-orange-600',
            },
            {
                label: 'Aging Threshold',
                value: `${summary.idle_days_threshold || 0} Days`,
                icon: <Clock className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Trapped Capital',
                value: formatCurrency(summary.total_idle_value),
                icon: <Banknote className="h-4 w-4 text-rose-600" />,
                bgColor: 'bg-rose-500',
                lightBg: 'bg-rose-50',
                textColor: 'text-rose-600',
            },
            {
                label: 'Analysis Cutoff',
                value: summary.cutoff_date || 'N/A',
                icon: <Calendar className="h-4 w-4 text-purple-600" />,
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
                label: 'Aging Inventory',
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
            {
                key: 'category',
                label: 'Category',
                render: (v: any, r: any) => (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">{v || 'Uncategorized'}</span>
                        <div className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-tight text-gray-400">
                            <Store className="h-2.5 w-2.5" /> {r.store_name}
                        </div>
                    </div>
                ),
            },
            { key: 'brand', label: 'Brand', render: (v: any) => <span className="text-sm font-medium text-gray-700">{v || 'Unbranded'}</span> },
            {
                key: 'quantity',
                label: 'Current Stock',
                sortable: true,
                render: (v: any, r: any) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{Number(v).toLocaleString()} Units</span>
                        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-rose-600">Value: {formatCurrency(r.stock_value)}</span>
                    </div>
                ),
            },
            {
                key: 'last_sold_at',
                label: 'Last Sale Date',
                render: (v: any, r: any) => (
                    <div className="flex flex-col">
                        <div className={`flex items-center gap-1.5 text-sm font-bold ${v ? 'text-amber-700' : 'text-rose-700'}`}>
                            {v ? (
                                <>
                                    <BarChart3 className="h-3.5 w-3.5" />
                                    <DateColumn date={v} />
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Never Sold
                                </>
                            )}
                        </div>
                        <span className="mt-1 pl-5 text-[10px] text-gray-400">Purchased: {r.purchase_date || 'Unknown'}</span>
                    </div>
                ),
            },
            {
                key: 'days_idle',
                label: 'Days Since Last Sale',
                sortable: true,
                render: (v: any) => {
                    const d = Number(v);
                    let i = 'bg-amber-100 text-amber-700 border-amber-200';
                    if (d > 180) i = 'bg-rose-100 text-rose-700 border-rose-200';
                    else if (d > 90) i = 'bg-orange-100 text-orange-700 border-orange-200';
                    return (
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${i}`}>
                            <Timer className="h-3 w-3" />
                            {d} Days
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
                    reportTitle="Slow Moving Items"
                    reportDescription="Tracking products that have not been sold recently"
                    reportIcon={<Clock className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-amber-600 to-orange-700"
                    data={products}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="idle_product_report"
                    fetchAllData={fetchAllDataForExport}
                />
                <ReportSummaryCard items={summaryItems} />
                <div className="mb-6">
                    <IdleProductReportFilter onFilterChange={handleFilterChange} />
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
                        title: 'Portfolio Currently Active',
                        description: 'No dormant products found based on your current aging criteria.',
                    }}
                />
            </div>
        </div>
    );
};

export default IdleProductReportPage;
