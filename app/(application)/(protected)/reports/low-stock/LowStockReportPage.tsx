'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetLowStockReportMutation, useCreateReorderDraftMutation } from '@/store/features/reports/reportApi';
import { AlertCircle, AlertTriangle, Box, FileText, Package, Phone, ShoppingCart, Tag, TrendingDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const LowStockReportPage = () => {
    const { t } = getTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const router = useRouter();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('quantity');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [reorderLoading, setReorderLoading] = useState<number | null>(null);

    const [getLowStockReport, { data: reportData, isLoading }] = useGetLowStockReportMutation();
    const [getLowStockReportForExport] = useGetLowStockReportMutation();
    const [createReorderDraft, { isLoading: isDraftLoading }] = useCreateReorderDraftMutation();

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

    const toggleSelect = useCallback((id: number) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    }, []);

    const toggleSelectAll = useCallback(() => {
        const allIds = stocks.map((s: any) => s.product_id);
        setSelectedIds((prev) => prev.length === allIds.length ? [] : allIds);
    }, [stocks]);

    const handleQuickReorder = useCallback(async (productId: number) => {
        if (!currentStoreId) return;
        setReorderLoading(productId);
        try {
            const result = await createReorderDraft({ store_id: currentStoreId, product_ids: [productId] }).unwrap();
            router.push(result.data.redirect_url);
        } catch {
            alert('Failed to create reorder draft. Please try again.');
        } finally {
            setReorderLoading(null);
        }
    }, [currentStoreId, createReorderDraft, router]);

    const handleBatchReorder = useCallback(async () => {
        if (!currentStoreId || selectedIds.length === 0) return;
        try {
            const result = await createReorderDraft({ store_id: currentStoreId, product_ids: selectedIds }).unwrap();
            setSelectedIds([]);
            router.push(result.data.redirect_url);
        } catch {
            alert('Failed to create reorder draft. Please try again.');
        }
    }, [currentStoreId, selectedIds, createReorderDraft, router]);

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
            { key: 'product_name', label: t('lbl_product'), width: 25 },
            { key: 'sku', label: t('lbl_sku'), width: 12 },
            { key: 'category', label: t('lbl_category'), width: 15 },
            { key: 'brand', label: t('brand_title'), width: 12 },
            { key: 'quantity', label: t('lbl_stock'), width: 10 },
            { key: 'stock_percentage', label: t('lbl_stock_pct'), width: 10, format: (v) => `${Number(v).toFixed(0)}%` },
            { key: 'urgency', label: t('lbl_urgency'), width: 10 },
            { key: 'restock_cost', label: t('lbl_restock_cost'), width: 15, format: (v) => formatCurrency(v) },
        ],
        [t, formatCurrency]
    );

    const filterSummary = useMemo(() => {
        const selectedStore = apiParams.store_ids
            ? t('lbl_all_stores')
            : apiParams.store_id
            ? userStores.find((s: any) => s.id === apiParams.store_id)?.store_name || currentStore?.store_name || t('lbl_all_stores')
            : currentStore?.store_name || t('lbl_all_stores');
        let dateType = 'none';
        if (apiParams.date_range_type) dateType = apiParams.date_range_type;
        else if (apiParams.start_date || apiParams.end_date) dateType = 'custom';
        return { dateRange: { startDate: apiParams.start_date, endDate: apiParams.end_date, type: dateType }, storeName: selectedStore, customFilters: [] };
    }, [apiParams, currentStore, userStores]);

    const exportSummary = useMemo(
        () => [
            { label: 'lbl_low_stock_items', value: summary.total_low_stock_items || 0 },
            { label: 'lbl_out_of_stock_items', value: summary.out_of_stock_items || 0 },
            { label: 'lbl_total_items', value: summary.total_items_tracked || 0 },
        ],
        [summary]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: t('lbl_stock_alert'),
                value: formatNumber(summary.total_low_stock_items || 0),
                icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
                bgColor: 'bg-orange-500',
                lightBg: 'bg-orange-50',
                textColor: 'text-orange-600',
            },
            {
                label: t('lbl_stock_outs'),
                value: formatNumber(summary.out_of_stock_items || 0),
                icon: <AlertCircle className="h-4 w-4 text-rose-600" />,
                bgColor: 'bg-rose-500',
                lightBg: 'bg-rose-50',
                textColor: 'text-rose-600',
            },
            {
                label: t('lbl_critical_threshold'),
                value: formatNumber(summary.critical_stock_items || 0),
                icon: <TrendingDown className="h-4 w-4 text-amber-600" />,
                bgColor: 'bg-amber-500',
                lightBg: 'bg-amber-50',
                textColor: 'text-amber-600',
            },
            {
                label: t('order_items'),
                value: formatNumber(summary.total_items_tracked || 0),
                icon: <Package className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
        ],
        [summary]
    );

    const allSelected = stocks.length > 0 && selectedIds.length === stocks.length;

    const columns = useMemo(
        () => [
            {
                key: '_select',
                label: (
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-primary"
                        title="Select all"
                    />
                ),
                render: (_: any, r: any) => (
                    <input
                        type="checkbox"
                        checked={selectedIds.includes(r.product_id)}
                        onChange={() => toggleSelect(r.product_id)}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-primary"
                    />
                ),
            },
            {
                key: 'product_name',
                label: t('product_title'),
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
                        {r.supplier?.name && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-600">
                                <Phone className="h-2.5 w-2.5" />
                                <span>{r.supplier.name}{r.supplier.phone ? ` · ${r.supplier.phone}` : ''}</span>
                            </div>
                        )}
                    </div>
                ),
            },
            { key: 'category', label: t('lbl_category'), render: (v: any) => <span className="text-sm font-medium text-gray-700">{v || 'Uncategorized'}</span> },
            { key: 'brand', label: t('brand_title'), render: (v: any) => <span className="text-sm font-medium text-gray-700">{v || 'Unbranded'}</span> },
            {
                key: 'stock_percentage',
                label: t('lbl_stock_status'),
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
                label: t('lbl_urgency'),
                render: (v: any) => {
                    const u = v?.toLowerCase();
                    const c: any = {
                        critical: { bg: 'bg-red-100 border-red-200', text: 'text-red-700', icon: AlertCircle },
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
                label: t('lbl_estimated_cost'),
                sortable: true,
                render: (v: any, r: any) => (
                    <div className="flex flex-col text-right">
                        <span className="font-bold text-gray-900">{formatCurrency(v)}</span>
                        <span className="text-[10px] font-medium text-gray-400">Need {r.quantity_needed} Units</span>
                    </div>
                ),
            },
            {
                key: '_reorder',
                label: '',
                render: (_: any, r: any) => (
                    <button
                        onClick={() => handleQuickReorder(r.product_id)}
                        disabled={reorderLoading === r.product_id || isDraftLoading}
                        className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary transition hover:bg-primary/20 disabled:opacity-50"
                        title="Quick Reorder"
                    >
                        <ShoppingCart className="h-3 w-3" />
                        {reorderLoading === r.product_id ? '...' : 'Reorder'}
                    </button>
                ),
            },
        ],
        [t, formatCurrency, selectedIds, allSelected, reorderLoading, isDraftLoading, toggleSelect, toggleSelectAll, handleQuickReorder]
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle={t('report_low_stock_title')}
                    reportDescription={t('report_low_stock_desc')}
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
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div className="flex-1">
                        <BasicReportFilter onFilterChange={handleFilterChange} placeholder="Search product name, SKU..." />
                    </div>
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBatchReorder}
                            disabled={isDraftLoading}
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-primary/90 disabled:opacity-60"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            {isDraftLoading ? 'Creating...' : `Reorder ${selectedIds.length} Selected`}
                        </button>
                    )}
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
