'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import DateColumn from '@/components/common/DateColumn';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetPurchaseTransactionReportMutation } from '@/store/features/reports/reportApi';
import { ArrowLeftRight, Banknote, CreditCard, FileText, Receipt, Store, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const PurchaseTransactionReportPage = () => {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getPurchaseTransactionReport, { data: reportData, isLoading }] = useGetPurchaseTransactionReportMutation();
    const [getPurchaseTransactionReportForExport] = useGetPurchaseTransactionReportMutation();

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
            getPurchaseTransactionReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const transactions = useMemo(() => reportData?.data?.pos_transactions || [], [reportData]);
    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const byPaymentMethod = useMemo(() => reportData?.data?.by_payment_method || [], [reportData]);
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
            const result = await getPurchaseTransactionReportForExport(exportParams).unwrap();
            return result?.data?.pos_transactions || [];
        } catch (e) {
            console.error('Export failed:', e);
            return transactions;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, transactions, getPurchaseTransactionReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'invoice_number', label: t('lbl_invoice'), width: 15 },
            { key: 'supplier_name', label: t('lbl_supplier'), width: 20 },
            { key: 'store_name', label: t('lbl_store'), width: 15 },
            { key: 'payment_method', label: t('lbl_payment_method'), width: 10 },
            { key: 'amount', label: t('lbl_amount'), width: 15, format: (v) => formatCurrency(v) },
            { key: 'user_name', label: t('lbl_processed_by'), width: 15 },
            { key: 'paid_at', label: t('lbl_date'), width: 15, format: (v) => v || '' },
        ],
        [t, formatCurrency]
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
            { label: t('lbl_transactions'), value: summary.total_transactions || 0 },
            { label: t('report_total_paid'), value: formatCurrency(summary.total_amount_paid) },
        ],
        [t, summary, formatCurrency]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: t('lbl_transactions'),
                value: summary.total_transactions || 0,
                icon: <ArrowLeftRight className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: t('report_total_paid'),
                value: formatCurrency(summary.total_amount_paid),
                icon: <Banknote className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: t('lbl_average_payment'),
                value: formatCurrency(summary.average_payment),
                icon: <Receipt className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
        ],
        [t, summary, formatCurrency]
    );

    const columns = useMemo(
        () => [
            { key: 'invoice_number', label: t('lbl_invoice'), sortable: true, render: (v: any) => <span className="font-mono text-sm font-semibold text-gray-900">{v}</span> },
            {
                key: 'supplier_name',
                label: t('lbl_supplier'),
                render: (v: any) => (
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{v || 'N/A'}</span>
                    </div>
                ),
            },
            {
                key: 'store_name',
                label: t('lbl_store'),
                render: (v: any) => (
                    <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{v}</span>
                    </div>
                ),
            },
            {
                key: 'payment_method',
                label: t('lbl_payment_method'),
                render: (v: any) => <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-800">{v}</span>,
            },
            { key: 'amount', label: t('lbl_amount_paid'), sortable: true, render: (v: any) => <span className="font-bold text-green-600">{formatCurrency(v)}</span> },
            { key: 'user_name', label: t('lbl_processed_by'), render: (v: any) => <span className="text-sm text-gray-600">{v}</span> },
            {
                key: 'paid_at',
                label: t('lbl_payment_date'),
                sortable: true,
                render: (v) => <DateColumn date={v} />,
            },
            {
                key: 'notes',
                label: t('lbl_notes'),
                render: (v: any) => (
                    <span className="max-w-[150px] truncate text-xs text-gray-500" title={v}>
                        {v || '-'}
                    </span>
                ),
            },
        ],
        [t, formatCurrency]
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle="Purchase Transaction Report"
                    reportDescription="View and track all payments made for purchase orders"
                    reportIcon={<ArrowLeftRight className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-cyan-600 to-cyan-700"
                    data={transactions}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="purchase_transaction_report"
                    fetchAllData={fetchAllDataForExport}
                />
                <ReportSummaryCard items={summaryItems} />
                {byPaymentMethod.length > 0 && (
                    <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-gray-600" />
                                <h3 className="font-semibold text-gray-900">Payments by Method</h3>
                            </div>
                        </div>
                        <div className="grid divide-x divide-gray-200 md:grid-cols-4">
                            {byPaymentMethod.map((item: any, idx: number) => (
                                <div key={idx} className="p-6">
                                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{item.payment_method}</p>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-gray-900">{formatCurrency(item.total)}</span>
                                        <span className="text-xs text-gray-500">({item.count} tx)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="mb-6">
                    <BasicReportFilter onFilterChange={handleFilterChange} placeholder="Search transactions..." />
                </div>
                <ReusableTable
                    data={transactions}
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
                    emptyState={{ icon: <FileText className="mx-auto h-16 w-16" />, title: 'No Transactions Found', description: 'No purchase transactions found for the selected period.' }}
                />
            </div>
        </div>
    );
};

export default PurchaseTransactionReportPage;
