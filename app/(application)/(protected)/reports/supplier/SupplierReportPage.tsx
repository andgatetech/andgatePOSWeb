'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import DateColumn from '@/components/common/DateColumn';
import ReusableTable from '@/components/common/ReusableTable';
import PurchaseReportFilter from '@/components/filters/reports/PurchaseReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetSupplierReportMutation } from '@/store/features/reports/reportApi';
import { AlertTriangle, Banknote, FileText, Package, Receipt, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SupplierReportPage = () => {
    const { t } = getTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getSupplierReport, { data: reportData, isLoading, isError }] = useGetSupplierReportMutation();
    const [getSupplierReportForExport] = useGetSupplierReportMutation();

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
            getSupplierReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const orders = useMemo(() => reportData?.data?.pos_orders || [], [reportData]);
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
            const result = await getSupplierReportForExport(exportParams).unwrap();
            return result?.data?.pos_orders || [];
        } catch (e) {
            console.error('Export failed:', e);
            return orders;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, orders, getSupplierReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'reference', label: t('lbl_reference'), width: 15 },
            { key: 'supplier', label: t('lbl_supplier'), width: 20 },
            { key: 'total_items', label: t('order_items'), width: 10 },
            { key: 'amount', label: t('lbl_amount'), width: 15, format: (v) => formatCurrency(v) },
            { key: 'payment_method', label: t('lbl_payment_method'), width: 12 },
            { key: 'status', label: t('lbl_status'), width: 12 },
            { key: 'created_at', label: t('lbl_date'), width: 12, format: (v) => v || '' },
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
    }, [apiParams, currentStore, userStores, t]);

    const exportSummary = useMemo(
        () => [
            { label: t('report_total_sales'), value: formatNumber(summary.total_orders || 0) },
            { label: t('lbl_total'), value: formatCurrency(summary.total_amount) },
            { label: t('lbl_due'), value: formatCurrency(summary.total_due) },
        ],
        [summary, formatCurrency, formatNumber]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: t('report_total_sales'),
                value: formatNumber(summary.total_orders || 0),
                icon: <Receipt className="h-4 w-4 text-primary" />,
                role: 'neutral' as const,
            },
            {
                label: t('lbl_total'),
                value: formatCurrency(summary.total_amount),
                icon: <Banknote className="h-4 w-4 text-primary" />,
                role: 'neutral' as const,
            },
            {
                label: t('report_total_paid'),
                value: formatCurrency(summary.total_paid),
                icon: <Banknote className="h-4 w-4 text-danger" />,
                role: 'cost' as const,
            },
            {
                label: t('lbl_due'),
                value: formatCurrency(summary.total_due),
                icon: <Banknote className="h-4 w-4 text-warning" />,
                role: 'warning' as const,
            },
        ],
        [summary, formatCurrency, formatNumber, t]
    );

    const columns = useMemo(
        () => [
            { key: 'reference', label: t('lbl_reference'), sortable: true, render: (v: any) => <span className="font-mono text-sm font-semibold text-gray-900">{v || 'N/A'}</span> },
            {
                key: 'supplier',
                label: t('lbl_supplier'),
                render: (v: any) => (
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{v || 'N/A'}</span>
                    </div>
                ),
            },
            {
                key: 'total_items',
                label: t('order_items'),
                sortable: true,
                render: (v: any) => (
                    <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{v}</span>
                    </div>
                ),
            },
            { key: 'amount', label: t('lbl_amount'), sortable: true, render: (v: any) => <span className="font-semibold text-gray-900">{formatCurrency(v)}</span> },
            {
                key: 'payment_method',
                label: t('lbl_payment_method'),
                render: (v: any) => (!v || v === 'N/A' ? <span className="text-xs text-gray-400">{t('lbl_not_specified')}</span> : <span className="text-sm capitalize text-gray-700">{v}</span>),
            },
            {
                key: 'status',
                label: t('lbl_status'),
                render: (v: any) => {
                    const s = v?.toLowerCase();
                    let c = 'bg-gray-100 text-gray-800';
                    if (s === 'received') c = 'bg-success-light text-success';
                    else if (s === 'ordered') c = 'bg-info-light text-info';
                    else if (s === 'pending') c = 'bg-warning-light text-warning';
                    else if (s === 'cancelled') c = 'bg-danger-light text-danger';
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${c}`}>{v}</span>;
                },
            },
            {
                key: 'created_at',
                label: t('lbl_order_date'),
                sortable: true,
                render: (v) => <DateColumn date={v} />,
            },
        ],
        [t, formatCurrency]
    );

    if (isLoading && !reportData?.data) {
        return <Loader message={t('report_loading')} />;
    }

    return (
        <div className="min-h-screen bg-[#f6f8fb]">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle={t('report_supplier_title')}
                    reportDescription={t('report_supplier_desc')}
                    reportIcon={<Users className="h-6 w-6 text-white" />}
                    iconBgClass="bg-[#046ca9]"
                    data={orders}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="supplier_report"
                    fetchAllData={fetchAllDataForExport}
                />
                <ReportSummaryCard items={summaryItems} />
                <div className="mb-6">
                    <PurchaseReportFilter onFilterChange={handleFilterChange} />
                </div>
                {isError && !reportData?.data && (
                    <div className="mb-6 rounded-lg border border-danger bg-danger-light p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
                        <AlertTriangle className="mx-auto h-10 w-10 text-danger" />
                        <p className="mt-3 font-semibold text-danger dark:text-danger">{t('msg_failed_load_report_try_again')}</p>
                        <button type="button" onClick={() => getSupplierReport(queryParams)} className="mt-4 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
                            {t('btn_retry')}
                        </button>
                    </div>
                )}
                <ReusableTable
                    data={orders}
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
                    emptyState={{ icon: <FileText className="mx-auto h-16 w-16" />, title: t('report_no_orders_found'), description: t('report_no_supplier_orders_desc') }}
                />
            </div>
        </div>
    );
};

export default SupplierReportPage;
