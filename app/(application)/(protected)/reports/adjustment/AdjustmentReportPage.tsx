'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import AdjustmentReportFilter from '@/components/filters/reports/AdjustmentReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetStockAdjustmentReportMutation } from '@/store/features/reports/reportApi';
import { ArrowDown, ArrowDownUp, ArrowUp, Calendar, FileText, Hash, Info, Package, Store, TrendingUp, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const AdjustmentReportPage = () => {
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getStockAdjustmentReport, { data: reportData, isLoading }] = useGetStockAdjustmentReportMutation();
    const [getStockAdjustmentReportForExport] = useGetStockAdjustmentReportMutation();

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
            getStockAdjustmentReport(queryParams);
        }
    }, [queryParams, currentStoreId, apiParams, getStockAdjustmentReport]);

    const adjustments = useMemo(() => reportData?.data?.adjustments || [], [reportData]);
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
            const result = await getStockAdjustmentReportForExport(exportParams).unwrap();
            return result?.data?.adjustments || [];
        } catch (e) {
            console.error('Export failed:', e);
            return adjustments;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, adjustments, getStockAdjustmentReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'reference_no', label: 'Reference', width: 12 },
            { key: 'product_name', label: 'Product', width: 20 },
            { key: 'store_name', label: 'Store', width: 15 },
            { key: 'adjustment_quantity', label: 'Qty', width: 10, format: (v, r) => `${r.direction === 'increase' ? '+' : ''}${v}` },
            { key: 'reason', label: 'Reason', width: 20 },
            { key: 'adjusted_by_name', label: 'Adjusted By', width: 15 },
            { key: 'adjusted_at', label: 'Date', width: 15, format: (v) => (v ? new Date(v).toLocaleDateString('en-GB') : '') },
        ],
        []
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
            { label: 'Events', value: summary.total_adjustments || 0 },
            { label: 'Net Change', value: `${summary.net_change >= 0 ? '+' : ''}${Number(summary.net_change || 0).toLocaleString()}` },
        ],
        [summary]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: 'Adjustment Events',
                value: summary.total_adjustments || 0,
                icon: <ArrowDownUp className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Gross Increase',
                value: `+${Number(summary.total_increase_quantity || 0).toLocaleString()}`,
                icon: <ArrowUp className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: 'Gross Decrease',
                value: `-${Number(summary.total_decrease_quantity || 0).toLocaleString()}`,
                icon: <ArrowDown className="h-4 w-4 text-red-600" />,
                bgColor: 'bg-red-500',
                lightBg: 'bg-red-50',
                textColor: 'text-red-600',
            },
            {
                label: 'Summary',
                value: `${summary.net_change >= 0 ? '+' : ''}${Number(summary.net_change || 0).toLocaleString()}`,
                icon: <TrendingUp className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
        ],
        [summary]
    );

    const columns = useMemo(
        () => [
            {
                key: 'reference_no',
                label: 'Ref ID',
                render: (v: any) => (
                    <div className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-mono text-xs font-bold text-gray-600">{v}</span>
                    </div>
                ),
            },
            {
                key: 'product_name',
                label: 'Product',
                sortable: true,
                render: (v: any, r: any) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-bold text-gray-900">
                            <Package className="h-3.5 w-3.5 text-gray-400" />
                            {v}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                            <span className="rounded border bg-gray-50 px-1 font-mono text-[10px] text-gray-400">{r.sku}</span>
                            <span className="flex items-center gap-1 text-[10px] italic text-gray-400">
                                <Store className="h-2.5 w-2.5" /> {r.store_name}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                key: 'adjustment_quantity',
                label: 'Stock Change',
                sortable: true,
                render: (v: any, r: any) => {
                    const i = r.direction?.toLowerCase() === 'increase';
                    return (
                        <div className="flex flex-col">
                            <div className={`flex items-center gap-1 font-bold ${i ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {i ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                                {Number(v).toLocaleString()}
                            </div>
                            <span className="text-[10px] text-gray-400">
                                {r.previous_stock} → {r.adjusted_stock}
                            </span>
                        </div>
                    );
                },
            },
            {
                key: 'reason',
                label: 'Reason',
                render: (v: any, r: any) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-sm font-medium capitalize text-gray-700">
                            <Info className="h-3.5 w-3.5 text-gray-400" />
                            {v || 'N/A'}
                        </div>
                        {r.notes && <span className="max-w-[150px] truncate pl-5 text-[10px] italic text-gray-400">{r.notes}</span>}
                    </div>
                ),
            },
            {
                key: 'adjusted_by_name',
                label: 'Adjusted By',
                render: (v: any) => (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        {v}
                    </div>
                ),
            },
            {
                key: 'adjusted_at',
                label: 'Date & Time',
                sortable: true,
                render: (v: any) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {new Date(v).toLocaleDateString('en-GB')}
                        </div>
                        <span className="pl-5 text-[10px] text-gray-400">{new Date(v).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle="Stock Adjustment Report"
                    reportDescription="Log of manual stock changes and corrections"
                    reportIcon={<ArrowDownUp className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-slate-600 to-zinc-700"
                    data={adjustments}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="adjustment_report"
                    fetchAllData={fetchAllDataForExport}
                />
                <ReportSummaryCard items={summaryItems} />
                <div className="mb-6">
                    <AdjustmentReportFilter onFilterChange={handleFilterChange} />
                </div>
                <ReusableTable
                    data={adjustments}
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
                        title: 'No Adjustments Recorded',
                        description: 'No stock correction logs found in the selected audit period.',
                    }}
                />
            </div>
        </div>
    );
};

export default AdjustmentReportPage;
