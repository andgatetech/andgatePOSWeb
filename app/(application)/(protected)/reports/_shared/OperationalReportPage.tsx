'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard, { SummaryRole } from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import DateColumn from '@/components/common/DateColumn';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { AlertTriangle, ArrowLeftRight, Banknote, ClipboardList, FileText, Package, Percent, Receipt, ShieldCheck, User, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type FieldType = 'text' | 'money' | 'number' | 'date';

export interface OperationalReportField {
    key: string;
    label: string;
    type?: FieldType;
    sortable?: boolean;
    width?: number;
    /** Summary-card color meaning. Only read for entries in `summaryFields`; defaults to neutral. */
    role?: SummaryRole;
}

interface OperationalReportPageProps {
    title: string;
    description: string;
    fileName: string;
    icon: 'cash' | 'payment' | 'employee' | 'stock' | 'discount' | 'statement' | 'transfer' | 'audit';
    useReportMutation: any;
    fields: OperationalReportField[];
    summaryFields: OperationalReportField[];
    defaultSort?: string;
}

const ROLE_ICON_COLOR: Record<SummaryRole, string> = {
    revenue: 'text-success',
    cost: 'text-danger',
    neutral: 'text-primary',
    insight: 'text-info',
    warning: 'text-warning',
};

const iconMap = {
    cash: Banknote,
    payment: Wallet,
    employee: User,
    stock: Package,
    discount: Percent,
    statement: Receipt,
    transfer: ArrowLeftRight,
    audit: ShieldCheck,
};

const OperationalReportPage: React.FC<OperationalReportPageProps> = ({ title, description, fileName, icon, useReportMutation, fields, summaryFields, defaultSort = 'created_at' }) => {
    const { t } = getTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState(defaultSort);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [getReport, { data: reportData, isLoading, isError }] = useReportMutation();
    const [getReportForExport] = useReportMutation();
    const lastQueryParams = useRef('');

    const queryParams = useMemo(() => {
        const params: Record<string, any> = { page: currentPage, per_page: itemsPerPage, sort_field: sortField, sort_direction: sortDirection, ...apiParams };
        if (!params.store_id && !params.store_ids && currentStoreId) params.store_id = currentStoreId;
        return params;
    }, [apiParams, currentStoreId, currentPage, itemsPerPage, sortField, sortDirection]);

    useEffect(() => {
        lastQueryParams.current = '';
    }, [currentStoreId]);

    useEffect(() => {
        const queryString = JSON.stringify(queryParams);
        if (lastQueryParams.current === queryString) return;
        if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
            lastQueryParams.current = queryString;
            getReport(queryParams);
        }
    }, [queryParams, currentStoreId, apiParams, getReport]);

    const rows = useMemo(() => reportData?.data?.rows || [], [reportData]);
    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const pagination = useMemo(() => reportData?.data?.pagination || {}, [reportData]);
    const Icon = iconMap[icon];
    const reportTitle = t(title);
    const reportDescription = t(description);

    const formatValue = useCallback(
        (value: any, type: FieldType = 'text') => {
            if (type === 'money') return formatCurrency(Number(value || 0));
            if (type === 'number') return formatNumber(Number(value || 0));
            return value ?? t('lbl_na');
        },
        [formatCurrency, formatNumber, t]
    );

    const columns = useMemo(
        () =>
            fields.map((field) => ({
                key: field.key,
                label: t(field.label),
                sortable: field.sortable,
                render: (value: any) =>
                    field.type === 'date' ? (
                        <DateColumn date={value} />
                    ) : (
                        <span className={field.type === 'money' || field.type === 'number' ? 'font-semibold text-gray-900' : 'text-gray-700'}>{formatValue(value, field.type)}</span>
                    ),
            })),
        [fields, formatValue, t]
    );

    const exportColumns: ExportColumn[] = useMemo(
        () =>
            fields.map((field) => ({
                key: field.key,
                label: t(field.label),
                width: field.width || 16,
                format: (value) => formatValue(value, field.type),
            })),
        [fields, formatValue, t]
    );

    const summaryItems = useMemo(
        () =>
            summaryFields.map((field, index) => {
                const role: SummaryRole = field.role || 'neutral';
                const iconColor = ROLE_ICON_COLOR[role];
                return {
                    label: t(field.label),
                    value: formatValue(summary[field.key], field.type),
                    role,
                    icon:
                        index % 3 === 0 ? (
                            <Icon className={`h-4 w-4 ${iconColor}`} />
                        ) : index % 3 === 1 ? (
                            <ClipboardList className={`h-4 w-4 ${iconColor}`} />
                        ) : (
                            <Banknote className={`h-4 w-4 ${iconColor}`} />
                        ),
                };
            }),
        [Icon, formatValue, summary, summaryFields, t]
    );

    const exportSummary = useMemo(() => summaryFields.map((field) => ({ label: t(field.label), value: formatValue(summary[field.key], field.type) })), [formatValue, summary, summaryFields, t]);

    const filterSummary = useMemo(() => {
        const selectedStore = apiParams.store_ids
            ? t('lbl_all_stores')
            : apiParams.store_id
            ? userStores.find((s: any) => s.id === apiParams.store_id)?.store_name || currentStore?.store_name || t('lbl_all_stores')
            : currentStore?.store_name || t('lbl_all_stores');

        const dateType = apiParams.date_range_type || (apiParams.start_date || apiParams.end_date ? 'custom' : 'none');
        const customFilters = apiParams.search ? [{ label: t('lbl_search'), value: apiParams.search }] : [];
        return { dateRange: { startDate: apiParams.start_date, endDate: apiParams.end_date, type: dateType }, storeName: selectedStore, customFilters };
    }, [apiParams, currentStore, userStores, t]);

    const fetchAllDataForExport = useCallback(async (): Promise<any[]> => {
        const exportParams: Record<string, any> = { ...apiParams, export: true, sort_field: sortField, sort_direction: sortDirection };
        if (!exportParams.store_id && !exportParams.store_ids && currentStoreId) exportParams.store_id = currentStoreId;
        try {
            const result = await getReportForExport(exportParams).unwrap();
            return result?.data?.rows || [];
        } catch (error) {
            console.error('Failed to fetch operational report export data:', error);
            return rows;
        }
    }, [apiParams, currentStoreId, getReportForExport, rows, sortDirection, sortField]);

    const handleSort = useCallback(
        (field: string) => {
            if (sortField === field) setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            else {
                setSortField(field);
                setSortDirection('asc');
            }
            setCurrentPage(1);
        },
        [sortField]
    );

    if (isLoading && !reportData?.data) return <Loader message={t('report_loading')} />;

    if (isError && !reportData?.data) {
        return (
            <div className="rounded-lg border border-danger bg-danger-light p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
                <AlertTriangle className="mx-auto h-10 w-10 text-danger" />
                <p className="mt-3 font-semibold text-danger dark:text-danger">{t('msg_failed_load_report_try_again')}</p>
                <button
                    type="button"
                    onClick={() => getReport(queryParams)}
                    className="mt-4 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                    {t('btn_retry')}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ReportExportToolbar
                reportTitle={reportTitle}
                reportDescription={reportDescription}
                reportIcon={<Icon className="h-6 w-6 text-white" />}
                data={rows}
                columns={exportColumns}
                summary={exportSummary}
                filterSummary={filterSummary}
                fileName={fileName}
                fetchAllData={fetchAllDataForExport}
            />

            <BasicReportFilter
                onFilterChange={(params) => {
                    setApiParams(params);
                    setCurrentPage(1);
                }}
                placeholder={t('lbl_search')}
            />
            <ReportSummaryCard items={summaryItems} />
            <ReusableTable
                data={rows}
                columns={columns}
                isLoading={isLoading}
                pagination={{
                    currentPage: pagination.current_page || currentPage,
                    totalPages: pagination.last_page || 1,
                    itemsPerPage: pagination.per_page || itemsPerPage,
                    totalItems: pagination.total || 0,
                    onPageChange: setCurrentPage,
                    onItemsPerPageChange: (items) => {
                        setItemsPerPage(items);
                        setCurrentPage(1);
                    },
                }}
                sorting={{ field: sortField, direction: sortDirection, onSort: handleSort }}
                emptyState={{
                    icon: <FileText className="mx-auto h-16 w-16" />,
                    title: t('report_no_data_found'),
                    description: t('report_no_data_hint'),
                }}
            />
        </div>
    );
};

export default OperationalReportPage;
