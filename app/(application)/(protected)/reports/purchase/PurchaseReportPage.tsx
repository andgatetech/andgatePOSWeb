'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import PurchaseReportFilter from '@/components/filters/reports/PurchaseReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetPurchaseReportMutation } from '@/store/features/reports/reportApi';
import { Banknote, Calculator, CreditCard, FileText, PieChart, ShoppingCart, TrendingDown, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const PurchaseReportPage = () => {
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Main mutation for UI table display
    const [getPurchaseReport, { data: reportData, isLoading }] = useGetPurchaseReportMutation();
    // Separate mutation instance for export - won't affect UI data
    const [getPurchaseReportForExport] = useGetPurchaseReportMutation();

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
                getPurchaseReport(queryParams);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const orders = useMemo(() => reportData?.data?.pos_purchase_orders || [], [reportData]);
    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const byStatus = useMemo(() => reportData?.data?.by_status || [], [reportData]);
    const byPaymentStatus = useMemo(() => reportData?.data?.by_payment_status || [], [reportData]);
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

    // Fetch ALL data for export (separate API call - doesn't affect UI)
    const fetchAllDataForExport = useCallback(async (): Promise<any[]> => {
        const exportParams: Record<string, any> = {
            ...apiParams,
            export: true,
            sort_field: sortField,
            sort_direction: sortDirection,
        };
        if (!exportParams.store_id && !exportParams.store_ids && currentStoreId) {
            exportParams.store_id = currentStoreId;
        }
        try {
            const result = await getPurchaseReportForExport(exportParams).unwrap();
            return result?.data?.pos_purchase_orders || [];
        } catch (error) {
            console.error('Failed to fetch all data for export:', error);
            return orders;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, orders, getPurchaseReportForExport]);

    // Export columns configuration
    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'invoice_number', label: 'Invoice', width: 15 },
            { key: 'order_reference', label: 'Reference', width: 15 },
            { key: 'supplier_name', label: 'Supplier', width: 20, format: (value, row) => value || row?.supplier || 'N/A' },
            { key: 'status', label: 'Status', width: 12 },
            { key: 'payment_status', label: 'Payment', width: 12 },
            { key: 'grand_total', label: 'Total', width: 15, format: (value) => formatCurrency(value) },
            { key: 'amount_paid', label: 'Paid', width: 15, format: (value) => formatCurrency(value) },
            { key: 'amount_due', label: 'Due', width: 15, format: (value) => formatCurrency(value) },
            { key: 'created_at', label: 'Date', width: 12, format: (value) => (value ? new Date(value).toLocaleDateString('en-GB') : '') },
        ],
        [formatCurrency]
    );

    // Filter summary for export
    const filterSummary = useMemo(() => {
        const selectedStore = apiParams.store_ids
            ? 'All Stores'
            : apiParams.store_id
            ? userStores.find((s: any) => s.id === apiParams.store_id)?.store_name || currentStore?.store_name || 'All Stores'
            : currentStore?.store_name || 'All Stores';
        const customFilters: { label: string; value: string }[] = [];
        if (apiParams.status && apiParams.status !== 'all') {
            customFilters.push({ label: 'Status', value: apiParams.status.charAt(0).toUpperCase() + apiParams.status.slice(1) });
        }
        if (apiParams.payment_status && apiParams.payment_status !== 'all') {
            customFilters.push({ label: 'Payment', value: apiParams.payment_status.charAt(0).toUpperCase() + apiParams.payment_status.slice(1) });
        }
        let dateType = 'none';
        if (apiParams.date_range_type) dateType = apiParams.date_range_type;
        else if (apiParams.start_date || apiParams.end_date) dateType = 'custom';
        return { dateRange: { startDate: apiParams.start_date, endDate: apiParams.end_date, type: dateType }, storeName: selectedStore, customFilters };
    }, [apiParams, currentStore, userStores]);

    // Export summary
    const exportSummary = useMemo(
        () => [
            { label: 'Total Orders', value: summary.total_purchase_orders || 0 },
            { label: 'Total Value', value: formatCurrency(summary.total_purchase_value) },
            { label: 'Paid Amount', value: formatCurrency(summary.total_amount_paid) },
            { label: 'Due Amount', value: formatCurrency(summary.total_amount_due) },
        ],
        [summary, formatCurrency]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: 'Total Orders',
                value: summary.total_purchase_orders || 0,
                icon: <ShoppingCart className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Total Value',
                value: formatCurrency(summary.total_purchase_value),
                icon: <Banknote className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: 'Paid Amount',
                value: formatCurrency(summary.total_amount_paid),
                icon: <Wallet className="h-4 w-4 text-emerald-600" />,
                bgColor: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            },
            {
                label: 'Due Amount',
                value: formatCurrency(summary.total_amount_due),
                icon: <TrendingDown className="h-4 w-4 text-red-600" />,
                bgColor: 'bg-red-500',
                lightBg: 'bg-red-50',
                textColor: 'text-red-600',
            },
            {
                label: 'Avg Order Value',
                value: formatCurrency(summary.average_order_value),
                icon: <Calculator className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
        ],
        [summary, formatCurrency]
    );

    const columns = useMemo(
        () => [
            { key: 'invoice_number', label: 'Invoice', sortable: true, render: (value: any) => <span className="font-semibold text-gray-900">{value}</span> },
            { key: 'order_reference', label: 'Reference', render: (value: any) => <span className="font-mono text-sm text-gray-600">{value || '-'}</span> },
            {
                key: 'supplier_name',
                label: 'Supplier',
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">{value || row.supplier || 'N/A'}</span>
                    </div>
                ),
            },
            {
                key: 'status',
                label: 'Status',
                render: (value: any) => {
                    const config: Record<string, { bg: string; text: string }> = {
                        received: { bg: 'bg-green-100', text: 'text-green-800' },
                        ordered: { bg: 'bg-blue-100', text: 'text-blue-800' },
                        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
                        cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
                    };
                    const { bg, text } = config[value?.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${bg} ${text}`}>{value}</span>;
                },
            },
            {
                key: 'payment_status',
                label: 'Payment',
                render: (value: any) => {
                    const config: Record<string, { bg: string; text: string }> = {
                        paid: { bg: 'bg-green-100', text: 'text-green-800' },
                        partial: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
                        pending: { bg: 'bg-orange-100', text: 'text-orange-800' },
                    };
                    const { bg, text } = config[value?.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${bg} ${text}`}>{value}</span>;
                },
            },
            { key: 'grand_total', label: 'Total', sortable: true, render: (value: any) => <span className="font-bold text-gray-900">{formatCurrency(value)}</span> },
            {
                key: 'amount_paid',
                label: 'Paid/Due',
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-green-600">P: {formatCurrency(value)}</span>
                        <span className={`text-xs font-medium ${Number(row.amount_due) > 0 ? 'text-red-600' : 'text-gray-400'}`}>D: {formatCurrency(row.amount_due)}</span>
                    </div>
                ),
            },
            {
                key: 'items_count',
                label: 'Items',
                render: (value: any) => <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">{value}</span>,
            },
            {
                key: 'created_at',
                label: 'Date',
                sortable: true,
                render: (value: any) => (
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{new Date(value).toLocaleDateString('en-GB')}</span>
                        <span className="text-[10px] text-gray-400">{new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
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
                    reportTitle="Purchase Report"
                    reportDescription="Complete analysis of procurement and purchase history"
                    reportIcon={<ShoppingCart className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-orange-600 to-orange-700"
                    data={orders}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="purchase_report"
                    fetchAllData={fetchAllDataForExport}
                />

                <ReportSummaryCard items={summaryItems} />

                <div className="mb-6 grid gap-6 lg:grid-cols-2">
                    {/* Status Breakdown */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-orange-100 p-2">
                                        <PieChart className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Orders by Status</h3>
                                        <p className="text-xs text-gray-500">Distribution of purchase status</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col divide-y divide-gray-100">
                            {byStatus.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2.5 w-2.5 rounded-full ${item.status === 'received' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                        <span className="text-sm font-medium capitalize text-gray-700">{item.status}</span>
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">{item.count} orders</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{formatCurrency(item.total)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Status Breakdown */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-emerald-100 p-2">
                                        <CreditCard className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Payment Breakdown</h3>
                                        <p className="text-xs text-gray-500">Summary of payment statuses</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col divide-y divide-gray-100">
                            {byPaymentStatus.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-2.5 w-2.5 rounded-full ${
                                                item.payment_status === 'paid' ? 'bg-green-500' : item.payment_status === 'partial' ? 'bg-yellow-500' : 'bg-orange-500'
                                            }`}
                                        />
                                        <span className="text-sm font-medium capitalize text-gray-700">{item.payment_status}</span>
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">{item.count} orders</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">{formatCurrency(item.total)}</p>
                                        {Number(item.total_due) > 0 && <p className="mt-1 text-[10px] font-medium leading-none text-red-500">Due: {formatCurrency(item.total_due)}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <PurchaseReportFilter onFilterChange={handleFilterChange} />
                </div>

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
                    emptyState={{ icon: <FileText className="mx-auto h-16 w-16" />, title: 'No Purchases Found', description: 'No purchases match your current filters.' }}
                />
            </div>
        </div>
    );
};

export default PurchaseReportPage;
