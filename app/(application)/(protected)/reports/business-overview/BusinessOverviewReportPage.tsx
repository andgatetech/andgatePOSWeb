'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetBusinessOverviewReportMutation } from '@/store/features/reports/reportApi';
import { Banknote, Building2, FileText, PackageSearch, Receipt, TrendingUp, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const BusinessOverviewReportPage = () => {
    const { t } = getTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [getReport, { data: reportData, isLoading }] = useGetBusinessOverviewReportMutation();
    const lastQueryParams = useRef('');

    const queryParams = useMemo(() => {
        const params = { period: 'monthly', ...apiParams };
        if (!params.store_id && !params.store_ids && currentStoreId && userStores.length <= 1) {
            params.store_id = currentStoreId;
        }
        return params;
    }, [apiParams, currentStoreId, userStores.length]);

    useEffect(() => {
        const queryString = JSON.stringify(queryParams);
        if (lastQueryParams.current === queryString) return;
        if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
            lastQueryParams.current = queryString;
            getReport(queryParams);
        }
    }, [apiParams, currentStoreId, getReport, queryParams]);

    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const stores = useMemo(() => reportData?.data?.stores || [], [reportData]);

    const handleFilterChange = useCallback((newApiParams: Record<string, any>) => {
        setApiParams(newApiParams);
    }, []);

    const selectedStoreName = useMemo(() => {
        if (apiParams.store_ids) return t('lbl_all_stores');
        if (apiParams.store_id) return userStores.find((s: any) => s.id === apiParams.store_id)?.store_name || currentStore?.store_name || t('lbl_all_stores');
        return currentStore?.store_name || t('lbl_all_stores');
    }, [apiParams, currentStore, userStores, t]);

    const summaryItems = useMemo(
        () => [
            {
                label: t('lbl_stores'),
                value: `${formatNumber(summary.active_store_count || 0)} / ${formatNumber(summary.store_count || 0)}`,
                icon: <Building2 className="h-4 w-4 text-primary" />,
                role: 'neutral' as const,
            },
            {
                label: t('lbl_net_sales'),
                value: formatCurrency(summary.net_sales),
                icon: <Banknote className="h-4 w-4 text-success" />,
                role: 'revenue' as const,
            },
            {
                label: t('lbl_collection'),
                value: formatCurrency(summary.collected),
                icon: <Wallet className="h-4 w-4 text-success" />,
                role: 'revenue' as const,
            },
            {
                label: t('lbl_business_profit'),
                value: formatCurrency(summary.business_profit),
                icon: <TrendingUp className="h-4 w-4 text-info" />,
                role: 'insight' as const,
            },
            {
                label: t('lbl_inventory_value'),
                value: formatCurrency(summary.inventory_value),
                icon: <PackageSearch className="h-4 w-4 text-primary" />,
                role: 'neutral' as const,
            },
            {
                label: t('lbl_orders'),
                value: formatNumber(summary.total_orders || 0),
                icon: <Receipt className="h-4 w-4 text-primary" />,
                role: 'neutral' as const,
            },
        ],
        [summary, formatCurrency, formatNumber, t]
    );

    const columns = useMemo(
        () => [
            {
                key: 'store_name',
                label: t('lbl_store'),
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{value}</span>
                        <span className="text-xs text-gray-500">{row.store_location || '-'}</span>
                    </div>
                ),
            },
            { key: 'total_orders', label: t('lbl_orders'), render: (v: any) => formatNumber(v || 0) },
            { key: 'net_sales', label: t('lbl_net_sales'), render: (v: any) => <span className="font-semibold text-gray-900">{formatCurrency(v)}</span> },
            { key: 'collected', label: t('lbl_collected'), render: (v: any) => <span className="font-semibold text-emerald-700">{formatCurrency(v)}</span> },
            { key: 'due', label: t('lbl_due'), render: (v: any) => <span className={Number(v) > 0 ? 'font-semibold text-red-600' : 'text-gray-500'}>{formatCurrency(v)}</span> },
            { key: 'cogs', label: t('lbl_cogs'), render: (v: any) => formatCurrency(v) },
            { key: 'expenses', label: t('lbl_expenses'), render: (v: any) => formatCurrency(v) },
            {
                key: 'business_profit',
                label: t('lbl_business_profit'),
                render: (v: any, row: any) => (
                    <div className="flex flex-col">
                        <span className={Number(v) >= 0 ? 'font-bold text-emerald-700' : 'font-bold text-red-600'}>{formatCurrency(v)}</span>
                        <span className="text-xs text-gray-500">{row.profit_margin}%</span>
                    </div>
                ),
            },
            { key: 'inventory_value', label: t('lbl_inventory_value'), render: (v: any) => formatCurrency(v) },
            { key: 'low_stock_items', label: t('lbl_low_stock_items'), render: (v: any) => formatNumber(v || 0) },
        ],
        [formatCurrency, formatNumber, t]
    );

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'store_name', label: t('lbl_store'), width: 24 },
            { key: 'total_orders', label: t('lbl_orders'), width: 12 },
            { key: 'items_sold', label: t('lbl_items_sold'), width: 12 },
            { key: 'gross_sales', label: t('lbl_gross_sales'), width: 15, format: (v) => formatCurrency(v) },
            { key: 'returns', label: t('lbl_returns'), width: 15, format: (v) => formatCurrency(v) },
            { key: 'net_sales', label: t('lbl_net_sales'), width: 15, format: (v) => formatCurrency(v) },
            { key: 'collected', label: t('lbl_collected'), width: 15, format: (v) => formatCurrency(v) },
            { key: 'due', label: t('lbl_due'), width: 15, format: (v) => formatCurrency(v) },
            { key: 'cogs', label: t('lbl_cogs'), width: 15, format: (v) => formatCurrency(v) },
            { key: 'expenses', label: t('lbl_expenses'), width: 15, format: (v) => formatCurrency(v) },
            { key: 'business_profit', label: t('lbl_business_profit'), width: 15, format: (v) => formatCurrency(v) },
            { key: 'profit_margin', label: t('lbl_profit_margin'), width: 12, format: (v) => `${v}%` },
            { key: 'inventory_value', label: t('lbl_inventory_value'), width: 15, format: (v) => formatCurrency(v) },
            { key: 'low_stock_items', label: t('lbl_low_stock_items'), width: 12 },
        ],
        [formatCurrency, t]
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <ReportExportToolbar
                reportTitle={t('report_business_overview_title')}
                reportDescription={t('report_business_overview_desc')}
                reportIcon={<Building2 className="h-6 w-6 text-white" />}
                iconBgClass="bg-[#046ca9]"
                data={stores}
                columns={exportColumns}
                summary={[
                    { label: 'lbl_net_sales', value: formatCurrency(summary.net_sales) },
                    { label: 'lbl_business_profit', value: formatCurrency(summary.business_profit) },
                    { label: 'lbl_inventory_value', value: formatCurrency(summary.inventory_value) },
                ]}
                filterSummary={{
                    storeName: selectedStoreName,
                    dateRange: { startDate: apiParams.start_date, endDate: apiParams.end_date, type: apiParams.date_range_type || apiParams.period || 'monthly' },
                    customFilters: [],
                }}
                fileName="business_overview_report"
            />

            <ReportSummaryCard items={summaryItems} />

            <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <BasicReportFilter onFilterChange={handleFilterChange} placeholder={t('lbl_search_store')} defaultAllStores />
            </div>

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <ReusableTable
                    data={stores}
                    columns={columns}
                    isLoading={isLoading}
                    emptyState={{
                        icon: <FileText className="mx-auto h-16 w-16 text-gray-300" />,
                        title: t('msg_no_data_found'),
                        description: t('msg_adjust_filters_and_try_again'),
                    }}
                />
            </div>
        </div>
    );
};

export default BusinessOverviewReportPage;
