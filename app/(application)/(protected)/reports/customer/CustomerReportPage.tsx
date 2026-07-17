'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import CustomerReportFilter from '@/components/filters/reports/CustomerReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { useGetCustomerReportMutation } from '@/store/features/reports/reportApi';
import { AlertCircle, AlertTriangle, Banknote, FileText, Hash, Mail, Phone, ShoppingCart, TrendingDown, Users, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const CustomerReportPage = () => {
    const { t } = getTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('total_orders');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getCustomerReport, { data: reportData, isLoading, isError }] = useGetCustomerReportMutation();
    const [getCustomerReportForExport] = useGetCustomerReportMutation();

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
        const timeoutId = setTimeout(() => {
            const queryString = JSON.stringify(queryParams);
            if (lastQueryParams.current === queryString) return;

            if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
                lastQueryParams.current = queryString;
                getCustomerReport(queryParams);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const customers = useMemo(() => reportData?.data?.pos_customers || [], [reportData]);
    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const pagination = useMemo(() => reportData?.data?.pagination || {}, [reportData]);

    const handleFilterChange = useCallback((newApiParams: Record<string, any>) => {
        setApiParams(newApiParams);
        setCurrentPage(1);
    }, []);
    const handleSort = useCallback(
        (field: string) => {
            if (sortField === field) setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'));
            else {
                setSortField(field);
                setSortDirection('asc');
            }
            setCurrentPage(1);
        },
        [sortField]
    );
    const handlePageChange = useCallback((page: number) => setCurrentPage(page), []);
    const handleItemsPerPageChange = useCallback((items: number) => {
        setItemsPerPage(items);
        setCurrentPage(1);
    }, []);

    const fetchAllDataForExport = useCallback(async (): Promise<any[]> => {
        const exportParams: Record<string, any> = { ...apiParams, export: true, sort_field: sortField, sort_direction: sortDirection };
        if (!exportParams.store_id && !exportParams.store_ids && currentStoreId) exportParams.store_id = currentStoreId;
        try {
            const result = await getCustomerReportForExport(exportParams).unwrap();
            return result?.data?.pos_customers || [];
        } catch (error) {
            console.error('Failed to fetch export data:', error);
            return customers;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, customers, getCustomerReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'reference', label: t('lbl_id'), width: 12 },
            { key: 'customer', label: t('lbl_name'), width: 20 },
            { key: 'phone', label: t('lbl_phone'), width: 15 },
            { key: 'email', label: t('lbl_email'), width: 20 },
            { key: 'total_orders', label: t('lbl_order'), width: 8 },
            { key: 'amount', label: t('lbl_total'), width: 12, format: (v) => formatCurrency(v) },
            { key: 'paid', label: t('lbl_paid'), width: 12, format: (v) => formatCurrency(v) },
            { key: 'due', label: t('lbl_due'), width: 12, format: (v) => formatCurrency(v) },
            { key: 'total_returns', label: t('lbl_return'), width: 8 },
            { key: 'total_return_amount', label: t('lbl_return'), width: 12, format: (v) => formatCurrency(v) },
            { key: 'net_purchase_value', label: t('lbl_net_purchase'), width: 12, format: (v) => formatCurrency(v) },
            { key: 'return_rate', label: t('lbl_return_rate'), width: 10, format: (v) => `${Number(v || 0).toFixed(2)}%` },
            { key: 'status', label: t('lbl_status'), width: 10 },
        ],
        [t, formatCurrency]
    );

    const filterSummary = useMemo(() => {
        const selectedStore = apiParams.store_ids
            ? t('lbl_all_stores')
            : apiParams.store_id
            ? userStores.find((s: any) => s.id === apiParams.store_id)?.store_name || currentStore?.store_name || t('lbl_all_stores')
            : currentStore?.store_name || t('lbl_all_stores');
        const customFilters: { label: string; value: string }[] = [];
        if (apiParams.only_due) customFilters.push({ label: t('btn_filter'), value: t('lbl_only_due') });
        let dateType = 'none';
        if (apiParams.date_range_type) dateType = apiParams.date_range_type;
        else if (apiParams.start_date || apiParams.end_date) dateType = 'custom';
        return { dateRange: { startDate: apiParams.start_date, endDate: apiParams.end_date, type: dateType }, storeName: selectedStore, customFilters };
    }, [apiParams, currentStore, userStores, t]);

    const exportSummary = useMemo(
        () => [
            { label: 'customer_title', value: summary.total_customers || 0 },
            { label: 'lbl_total', value: formatCurrency(summary.total_amount) },
            { label: 'lbl_return', value: formatCurrency(summary.total_returned) },
            { label: 'lbl_net_purchase', value: formatCurrency(summary.net_purchase_value) },
            { label: 'lbl_return_rate', value: `${Number(summary.return_rate || 0).toFixed(2)}%` },
            { label: 'lbl_due', value: formatCurrency(summary.total_due) },
        ],
        [summary, formatCurrency]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: t('customer_total'),
                value: formatNumber(summary.total_customers || 0),
                icon: <Users className="h-4 w-4 text-primary" />,
                role: 'neutral' as const,
            },
            {
                label: t('lbl_customers_with_due'),
                value: formatNumber(summary.total_customers_with_due || 0),
                icon: <AlertCircle className="h-4 w-4 text-warning" />,
                role: 'warning' as const,
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
                icon: <Wallet className="h-4 w-4 text-success" />,
                role: 'revenue' as const,
            },
            {
                label: t('lbl_due'),
                value: formatCurrency(summary.total_due),
                icon: <TrendingDown className="h-4 w-4 text-warning" />,
                role: 'warning' as const,
            },
            {
                label: t('lbl_return'),
                value: formatCurrency(summary.total_returned),
                icon: <AlertCircle className="h-4 w-4 text-danger" />,
                role: 'cost' as const,
            },
            {
                label: t('lbl_net_purchase'),
                value: formatCurrency(summary.net_purchase_value),
                icon: <Banknote className="h-4 w-4 text-success" />,
                role: 'revenue' as const,
            },
            {
                label: t('lbl_return_rate'),
                value: `${Number(summary.return_rate || 0).toFixed(2)}%`,
                icon: <TrendingDown className="h-4 w-4 text-info" />,
                role: 'insight' as const,
            },
        ],
        [summary, formatCurrency, formatNumber, t]
    );

    const columns = useMemo(
        () => [
            {
                key: 'reference',
                label: t('lbl_customer'),
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-gray-400" />
                            <span className="font-mono text-sm font-semibold text-gray-600">{value}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{t('lbl_code')}: {row.code}</span>
                    </div>
                ),
            },
            {
                key: 'customer',
                label: t('lbl_customer'),
                sortable: true,
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{value}</span>
                        <div className="mt-1 flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                <Phone className="h-3 w-3" /> {row.phone}
                            </div>
                            {row.email && (
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                    <Mail className="h-3 w-3" /> {row.email}
                                </div>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                key: 'total_orders',
                label: t('lbl_order'),
                sortable: true,
                render: (value: any) => (
                    <div className="flex items-center gap-1.5">
                        <ShoppingCart className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{value}</span>
                    </div>
                ),
            },
            { key: 'amount', label: t('lbl_amount'), sortable: true, render: (value: any) => <span className="font-bold text-gray-900">{formatCurrency(value)}</span> },
            { key: 'paid', label: t('lbl_paid'), render: (value: any) => <span className="font-medium text-success">{formatCurrency(value)}</span> },
            {
                key: 'due',
                label: t('lbl_due'),
                sortable: true,
                render: (value: any) => <span className={`font-bold ${Number(value) > 0 ? 'text-danger' : 'text-gray-400'}`}>{formatCurrency(value)}</span>,
            },
            {
                key: 'total_returns',
                label: t('lbl_return'),
                sortable: true,
                render: (value: any) => (
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm text-gray-700">{value || 0}</span>
                    </div>
                ),
            },
            {
                key: 'total_return_amount',
                label: t('lbl_amount'),
                sortable: true,
                render: (value: any) => (
                    <span className={`font-medium ${Number(value) > 0 ? 'text-danger' : 'text-gray-400'}`}>{Number(value) > 0 ? `-${formatCurrency(value)}` : formatCurrency(0)}</span>
                ),
            },
            {
                key: 'net_purchase_value',
                label: t('lbl_purchase'),
                sortable: true,
                render: (value: any) => <span className="font-bold text-success">{formatCurrency(value)}</span>,
            },
            {
                key: 'return_rate',
                label: t('lbl_return_rate'),
                sortable: true,
                render: (value: any) => {
                    const rate = Number(value || 0);
                    const colorClass = rate > 20 ? 'text-danger bg-danger-light' : rate > 10 ? 'text-warning bg-warning-light' : 'text-success bg-success-light';
                    return (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${colorClass}`}>
                            {rate > 20 && <AlertCircle className="mr-0.5 h-3 w-3" />}
                            {rate.toFixed(2)}%
                        </span>
                    );
                },
            },
            {
                key: 'status',
                label: t('lbl_status'),
                render: (value: any) => {
                    const status = value?.toLowerCase() || '';
                    const config: Record<string, { bg: string; text: string }> = {
                        paid: { bg: 'bg-success-light', text: 'text-success' },
                        partial: { bg: 'bg-warning-light', text: 'text-warning' },
                        due: { bg: 'bg-danger-light', text: 'text-danger' },
                    };
                    const { bg, text } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${bg} ${text}`}>{value}</span>;
                },
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
                    reportTitle={t('report_customer_title')}
                    reportDescription={t('report_customer_title')}
                    reportIcon={<Users className="h-6 w-6 text-white" />}
                    iconBgClass="bg-[#046ca9]"
                    data={customers}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="customer_report"
                    fetchAllData={fetchAllDataForExport}
                />
                <ReportSummaryCard items={summaryItems} />
                <div className="mb-6">
                    <CustomerReportFilter onFilterChange={handleFilterChange} />
                </div>
                {isError && !reportData?.data && (
                    <div className="mb-6 rounded-lg border border-danger bg-danger-light p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
                        <AlertTriangle className="mx-auto h-10 w-10 text-danger" />
                        <p className="mt-3 font-semibold text-danger dark:text-danger">{t('msg_failed_load_report_try_again')}</p>
                        <button type="button" onClick={() => getCustomerReport(queryParams)} className="mt-4 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
                            {t('btn_retry')}
                        </button>
                    </div>
                )}
                <ReusableTable
                    data={customers}
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
                        title: t('msg_no_data'),
                        description: t('msg_no_data'),
                    }}
                />
            </div>
        </div>
    );
};

export default CustomerReportPage;
