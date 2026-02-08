'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import DateColumn from '@/components/common/DateColumn';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetPurchaseItemsReportMutation } from '@/store/features/reports/reportApi';
import { Banknote, CheckCircle, FileText, Package, Truck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const PurchaseItemsReportPage = () => {
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('purchase_qty');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getPurchaseItemsReport, { data: reportData, isLoading }] = useGetPurchaseItemsReportMutation();
    const [getPurchaseItemsReportForExport] = useGetPurchaseItemsReportMutation();

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
            getPurchaseItemsReport(queryParams);
        }
    }, [queryParams, currentStoreId, apiParams, getPurchaseItemsReport]);

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
            const result = await getPurchaseItemsReportForExport(exportParams).unwrap();
            return result?.data?.items || [];
        } catch (e) {
            console.error('Export failed:', e);
            return items;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, items, getPurchaseItemsReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'reference', label: 'Reference', width: 15 },
            { key: 'product_name', label: 'Product', width: 25 },
            { key: 'category', label: 'Category', width: 15 },
            { key: 'purchase_qty', label: 'Qty', width: 10 },
            { key: 'received_qty', label: 'Received', width: 10 },
            { key: 'unit_price', label: 'Unit Price', width: 12, format: (v) => formatCurrency(v) },
            { key: 'purchase_amount', label: 'Total', width: 15, format: (v) => formatCurrency(v) },
            { key: 'due_date', label: 'Due Date', width: 12, format: (v) => v || '' },
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
            { label: 'Total Quantity', value: summary.total_quantity || 0 },
            { label: 'Total Amount', value: formatCurrency(summary.total_amount) },
        ],
        [summary, formatCurrency]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: 'Total Unique Items',
                value: summary.total_items || 0,
                icon: <Package className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Total Quantity',
                value: summary.total_quantity || 0,
                icon: <Truck className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: 'Total Received',
                value: summary.total_received || 0,
                icon: <CheckCircle className="h-4 w-4 text-teal-600" />,
                bgColor: 'bg-teal-500',
                lightBg: 'bg-teal-50',
                textColor: 'text-teal-600',
            },
            {
                label: 'Total Amount',
                value: formatCurrency(summary.total_amount),
                icon: <Banknote className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
        ],
        [summary, formatCurrency]
    );

    const columns = useMemo(
        () => [
            { key: 'reference', label: 'Reference', render: (v: any) => <span className="font-mono text-sm text-gray-600">{v || '-'}</span> },
            { key: 'sku', label: 'SKU', render: (v: any) => <span className="font-mono text-sm text-gray-600">{v || '-'}</span> },
            { key: 'product_name', label: 'Product', sortable: true, render: (v: any) => <span className="font-medium text-gray-900">{v}</span> },
            { key: 'category', label: 'Category', render: (v: any) => <span className="text-sm text-gray-700">{v || 'Uncategorized'}</span> },
            { key: 'brand', label: 'Brand', render: (v: any) => <span className="text-sm text-gray-700">{v || 'Unbranded'}</span> },
            { key: 'instock_qty', label: 'Instock', render: (v: any) => <span className={`font-semibold ${Number(v) > 0 ? 'text-gray-900' : 'text-red-600'}`}>{v}</span> },
            { key: 'purchase_qty', label: 'Qty', sortable: true, render: (v: any) => <span className="font-bold text-blue-600">{v}</span> },
            {
                key: 'received_qty',
                label: 'Received',
                render: (v: any, r: any) => {
                    const f = Number(v) >= Number(r.purchase_qty);
                    return (
                        <span className={`inline-flex items-center gap-1 font-medium ${f ? 'text-green-600' : 'text-orange-600'}`}>
                            {v}
                            {f && <CheckCircle className="h-3 w-3" />}
                        </span>
                    );
                },
            },
            { key: 'unit_price', label: 'Unit Price', render: (v: any) => <span className="text-sm text-gray-700">{formatCurrency(v)}</span> },
            { key: 'purchase_amount', label: 'Total', sortable: true, render: (v: any) => <span className="font-semibold text-gray-900">{formatCurrency(v)}</span> },
            {
                key: 'due_date',
                label: 'Due Date',
                render: (v: any) => (v ? <DateColumn date={v} /> : <span className="text-xs text-gray-400">N/A</span>),
            },
        ],
        [formatCurrency]
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle="Purchase Items Report"
                    reportDescription="View details of items purchased across all orders"
                    reportIcon={<Package className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-amber-600 to-amber-700"
                    data={items}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="purchase_items_report"
                    fetchAllData={fetchAllDataForExport}
                />
                <ReportSummaryCard items={summaryItems} />
                <div className="mb-6">
                    <BasicReportFilter onFilterChange={handleFilterChange} placeholder="Search products, SKU..." />
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
                    emptyState={{ icon: <FileText className="mx-auto h-16 w-16" />, title: 'No Items Found', description: 'No purchase items match your current filters.' }}
                />
            </div>
        </div>
    );
};

export default PurchaseItemsReportPage;
