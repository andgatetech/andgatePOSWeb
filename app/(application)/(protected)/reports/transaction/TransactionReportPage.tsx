'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import TransactionReportFilter from '@/components/filters/reports/TransactionReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetTransactionReportMutation } from '@/store/features/reports/reportApi';
import { ArrowLeftRight, Banknote, Calculator, Calendar, CreditCard, FileText, Hash, Store, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const TransactionReportPage = () => {
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getTransactionReport, { data: reportData, isLoading }] = useGetTransactionReportMutation();
    const [getTransactionReportForExport] = useGetTransactionReportMutation();

    const lastQueryParams = useRef<string>('');

    const queryParams = useMemo(() => {
        const params: Record<string, any> = { page: currentPage, per_page: itemsPerPage, sort_field: sortField, sort_direction: sortDirection, ...apiParams };
        if (!params.store_id && !params.store_ids && currentStoreId) params.store_id = currentStoreId;
        return params;
    }, [apiParams, currentStoreId, currentPage, itemsPerPage, sortField, sortDirection]);

    useEffect(() => {
        const queryString = JSON.stringify(queryParams);
        if (lastQueryParams.current === queryString) return;
        if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
            lastQueryParams.current = queryString;
            getTransactionReport(queryParams);
        }
    }, [queryParams]);

    const transactions = useMemo(() => reportData?.data?.pos_transactions || [], [reportData]);
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
            const result = await getTransactionReportForExport(exportParams).unwrap();
            return result?.data?.pos_transactions || [];
        } catch (error) {
            console.error('Failed to fetch export data:', error);
            return transactions;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, transactions, getTransactionReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'invoice', label: 'Invoice', width: 15 },
            { key: 'store_name', label: 'Store', width: 15 },
            { key: 'user_name', label: 'Created By', width: 15 },
            { key: 'payment_status', label: 'Status', width: 10 },
            { key: 'payment_method', label: 'Method', width: 10 },
            { key: 'amount', label: 'Amount', width: 15, format: (v) => formatCurrency(v) },
            { key: 'created_at', label: 'Date', width: 12, format: (v) => (v ? new Date(v).toLocaleDateString('en-GB') : '') },
        ],
        []
    );

    const filterSummary = useMemo(() => {
        const selectedStore = apiParams.store_ids
            ? 'All Stores'
            : apiParams.store_id
            ? userStores.find((s: any) => s.id === apiParams.store_id)?.store_name || currentStore?.store_name || 'All Stores'
            : currentStore?.store_name || 'All Stores';
        const customFilters: { label: string; value: string }[] = [];
        if (apiParams.payment_status && apiParams.payment_status !== 'all')
            customFilters.push({ label: 'Status', value: apiParams.payment_status.charAt(0).toUpperCase() + apiParams.payment_status.slice(1) });
        if (apiParams.payment_method && apiParams.payment_method !== 'all')
            customFilters.push({ label: 'Method', value: apiParams.payment_method.charAt(0).toUpperCase() + apiParams.payment_method.slice(1) });
        let dateType = 'none';
        if (apiParams.date_range_type) dateType = apiParams.date_range_type;
        else if (apiParams.start_date || apiParams.end_date) dateType = 'custom';
        return { dateRange: { startDate: apiParams.start_date, endDate: apiParams.end_date, type: dateType }, storeName: selectedStore, customFilters };
    }, [apiParams, currentStore, userStores]);

    const exportSummary = useMemo(
        () => [
            { label: 'Total Transactions', value: summary.total_transactions || 0 },
            { label: 'Sales Transactions', value: summary.total_sales_transactions || 0 },
            { label: 'Sales Amount', value: formatCurrency(summary.total_sales_amount) },
            { label: 'Refund Transactions', value: summary.total_refund_transactions || 0 },
            { label: 'Refund Amount', value: formatCurrency(summary.total_refund_amount) },
            { label: 'Net Amount', value: formatCurrency(summary.net_amount) },
            { label: 'Average', value: formatCurrency(summary.average_transaction) },
        ],
        [summary, formatCurrency]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: 'Total Transactions',
                value: summary.total_transactions || 0,
                icon: <ArrowLeftRight className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Sales Transactions',
                value: summary.total_sales_transactions || 0,
                icon: <Banknote className="h-4 w-4 text-emerald-600" />,
                bgColor: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            },
            {
                label: 'Sales Amount',
                value: formatCurrency(Number(summary.total_sales_amount || 0)),
                icon: <Calculator className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: 'Refund Transactions',
                value: summary.total_refund_transactions || 0,
                icon: <ArrowLeftRight className="h-4 w-4 text-red-600" />,
                bgColor: 'bg-red-500',
                lightBg: 'bg-red-50',
                textColor: 'text-red-600',
            },
            {
                label: 'Refund Amount',
                value: formatCurrency(Number(summary.total_refund_amount || 0)),
                icon: <CreditCard className="h-4 w-4 text-orange-600" />,
                bgColor: 'bg-orange-500',
                lightBg: 'bg-orange-50',
                textColor: 'text-orange-600',
            },
            {
                label: 'Net Amount',
                value: formatCurrency(Number(summary.net_amount || 0)),
                icon: <Banknote className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
            {
                label: 'Avg. Transaction',
                value: formatCurrency(Number(summary.average_transaction || 0)),
                icon: <Calculator className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
        ],
        [summary, formatCurrency]
    );

    const columns = useMemo(
        () => [
            {
                key: 'invoice',
                label: 'Invoice',
                sortable: true,
                render: (value: any) => (
                    <div className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                ),
            },
            {
                key: 'store_name',
                label: 'Store',
                render: (value: any) => (
                    <div className="flex items-center gap-1.5 font-medium text-gray-700">
                        <Store className="h-3.5 w-3.5 text-gray-400" />
                        {value}
                    </div>
                ),
            },
            {
                key: 'user_name',
                label: 'Created By',
                render: (value: any) => (
                    <div className="flex items-center gap-1.5 text-gray-600">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs">{value}</span>
                    </div>
                ),
            },
            {
                key: 'payment_status',
                label: 'Status',
                sortable: true,
                render: (value: any) => {
                    const status = value?.toLowerCase() || 'pending';
                    const config: Record<string, { bg: string; text: string }> = {
                        paid: { bg: 'bg-green-100', text: 'text-green-800' },
                        partial: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
                        due: { bg: 'bg-red-100', text: 'text-red-800' },
                        pending: { bg: 'bg-orange-100', text: 'text-orange-800' },
                    };
                    const { bg, text } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${bg} ${text}`}>{value}</span>;
                },
            },
            {
                key: 'amount',
                label: 'Transaction Amount',
                sortable: true,
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{formatCurrency(value)}</span>
                        <div className="flex items-center gap-1 text-[10px] font-semibold uppercase text-gray-500">
                            <CreditCard className="h-2.5 w-2.5" /> {row.payment_method || 'N/A'}
                        </div>
                    </div>
                ),
            },
            {
                key: 'created_at',
                label: 'Execution Time',
                sortable: true,
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {new Date(value).toLocaleDateString('en-GB')}
                        </div>
                        <span className="pl-5 text-[10px] text-gray-400">{row.time}</span>
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
                    reportTitle="Money Transactions"
                    reportDescription="Detailed list of all payments and money movements"
                    reportIcon={<ArrowLeftRight className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-blue-600 to-indigo-700"
                    data={transactions}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="transaction_report"
                    fetchAllData={fetchAllDataForExport}
                />
                <ReportSummaryCard items={summaryItems} />
                <div className="mb-6">
                    <TransactionReportFilter onFilterChange={handleFilterChange} />
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
                    emptyState={{
                        icon: <FileText className="mx-auto h-16 w-16 text-gray-300" />,
                        title: 'No Transactions Found',
                        description: 'No audit records match your current filter selection.',
                    }}
                />
            </div>
        </div>
    );
};

export default TransactionReportPage;
