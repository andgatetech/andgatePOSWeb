'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import CustomerReportFilter from '@/components/filters/reports/CustomerReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetCustomerReportMutation } from '@/store/features/reports/reportApi';
import { AlertCircle, Banknote, FileText, Hash, Mail, Phone, ShoppingCart, TrendingDown, Users, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const CustomerReportPage = () => {
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('total_orders');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getCustomerReport, { data: reportData, isLoading }] = useGetCustomerReportMutation();
    const [getCustomerReportForExport] = useGetCustomerReportMutation();

    const lastQueryParams = useRef<string>('');

    const queryParams = useMemo(() => {
        const params: Record<string, any> = { page: currentPage, per_page: itemsPerPage, sort_field: sortField, sort_direction: sortDirection, ...apiParams };
        if (!params.store_id && !params.store_ids && currentStoreId) params.store_id = currentStoreId;
        return params;
    }, [apiParams, currentStoreId, currentPage, itemsPerPage, sortField, sortDirection]);

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
            { key: 'reference', label: 'ID', width: 12 },
            { key: 'customer', label: 'Name', width: 20 },
            { key: 'phone', label: 'Phone', width: 15 },
            { key: 'email', label: 'Email', width: 20 },
            { key: 'total_orders', label: 'Orders', width: 8 },
            { key: 'amount', label: 'Total', width: 12, format: (v) => formatCurrency(v) },
            { key: 'paid', label: 'Paid', width: 12, format: (v) => formatCurrency(v) },
            { key: 'due', label: 'Due', width: 12, format: (v) => formatCurrency(v) },
            { key: 'total_returns', label: 'Returns', width: 8 },
            { key: 'total_return_amount', label: 'Return Amount', width: 12, format: (v) => formatCurrency(v) },
            { key: 'net_purchase_value', label: 'Net Purchase', width: 12, format: (v) => formatCurrency(v) },
            { key: 'return_rate', label: 'Return Rate %', width: 10, format: (v) => `${Number(v || 0).toFixed(2)}%` },
            { key: 'status', label: 'Status', width: 10 },
        ],
        [formatCurrency]
    );

    const filterSummary = useMemo(() => {
        const selectedStore = apiParams.store_ids
            ? 'All Stores'
            : apiParams.store_id
            ? userStores.find((s: any) => s.id === apiParams.store_id)?.store_name || currentStore?.store_name || 'All Stores'
            : currentStore?.store_name || 'All Stores';
        const customFilters: { label: string; value: string }[] = [];
        if (apiParams.only_due) customFilters.push({ label: 'Filter', value: 'Only Due' });
        let dateType = 'none';
        if (apiParams.date_range_type) dateType = apiParams.date_range_type;
        else if (apiParams.start_date || apiParams.end_date) dateType = 'custom';
        return { dateRange: { startDate: apiParams.start_date, endDate: apiParams.end_date, type: dateType }, storeName: selectedStore, customFilters };
    }, [apiParams, currentStore, userStores]);

    const exportSummary = useMemo(
        () => [
            { label: 'Customers', value: summary.total_customers || 0 },
            { label: 'Total Amount', value: formatCurrency(summary.total_amount) },
            { label: 'Total Returned', value: formatCurrency(summary.total_returned) },
            { label: 'Net Purchase Value', value: formatCurrency(summary.net_purchase_value) },
            { label: 'Return Rate', value: `${Number(summary.return_rate || 0).toFixed(2)}%` },
            { label: 'Total Due', value: formatCurrency(summary.total_due) },
        ],
        [summary, formatCurrency]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: 'Total Customers',
                value: summary.total_customers || 0,
                icon: <Users className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Customers with Due',
                value: summary.total_customers_with_due || 0,
                icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
                bgColor: 'bg-amber-500',
                lightBg: 'bg-amber-50',
                textColor: 'text-amber-600',
            },
            {
                label: 'Total Amount',
                value: formatCurrency(summary.total_amount),
                icon: <Banknote className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
            {
                label: 'Total Paid',
                value: formatCurrency(summary.total_paid),
                icon: <Wallet className="h-4 w-4 text-emerald-600" />,
                bgColor: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            },
            {
                label: 'Total Due',
                value: formatCurrency(summary.total_due),
                icon: <TrendingDown className="h-4 w-4 text-red-600" />,
                bgColor: 'bg-red-500',
                lightBg: 'bg-red-50',
                textColor: 'text-red-600',
            },
            {
                label: 'Total Returned',
                value: formatCurrency(summary.total_returned),
                icon: <AlertCircle className="h-4 w-4 text-orange-600" />,
                bgColor: 'bg-orange-500',
                lightBg: 'bg-orange-50',
                textColor: 'text-orange-600',
            },
            {
                label: 'Net Purchase Value',
                value: formatCurrency(summary.net_purchase_value),
                icon: <Banknote className="h-4 w-4 text-emerald-600" />,
                bgColor: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            },
            {
                label: 'Return Rate',
                value: `${Number(summary.return_rate || 0).toFixed(2)}%`,
                icon: <TrendingDown className="h-4 w-4 text-amber-600" />,
                bgColor: 'bg-amber-500',
                lightBg: 'bg-amber-50',
                textColor: 'text-amber-600',
            },
        ],
        [summary, formatCurrency]
    );

    const columns = useMemo(
        () => [
            {
                key: 'reference',
                label: 'Customer ID',
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-gray-400" />
                            <span className="font-mono text-sm font-semibold text-gray-600">{value}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">Code: {row.code}</span>
                    </div>
                ),
            },
            {
                key: 'customer',
                label: 'Customer Details',
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
                label: 'Orders',
                sortable: true,
                render: (value: any) => (
                    <div className="flex items-center gap-1.5">
                        <ShoppingCart className="h-4 w-4 text-gray-400" />
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">{value}</span>
                    </div>
                ),
            },
            { key: 'amount', label: 'Sales Amount', sortable: true, render: (value: any) => <span className="font-bold text-gray-900">{formatCurrency(value)}</span> },
            { key: 'paid', label: 'Paid', render: (value: any) => <span className="font-medium text-emerald-600">{formatCurrency(value)}</span> },
            {
                key: 'due',
                label: 'Outstanding Due',
                sortable: true,
                render: (value: any) => <span className={`font-bold ${Number(value) > 0 ? 'text-red-600' : 'text-gray-400'}`}>{formatCurrency(value)}</span>,
            },
            {
                key: 'total_returns',
                label: 'Returns',
                sortable: true,
                render: (value: any) => (
                    <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${Number(value) > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}`}>
                            {value || 0}
                        </span>
                    </div>
                ),
            },
            {
                key: 'total_return_amount',
                label: 'Return Amount',
                sortable: true,
                render: (value: any) => (
                    <span className={`font-medium ${Number(value) > 0 ? 'text-red-600' : 'text-gray-400'}`}>{Number(value) > 0 ? `-${formatCurrency(value)}` : formatCurrency(0)}</span>
                ),
            },
            {
                key: 'net_purchase_value',
                label: 'Net Purchase',
                sortable: true,
                render: (value: any) => <span className="font-bold text-emerald-600">{formatCurrency(value)}</span>,
            },
            {
                key: 'return_rate',
                label: 'Return Rate %',
                sortable: true,
                render: (value: any) => {
                    const rate = Number(value || 0);
                    const colorClass = rate > 20 ? 'text-red-600 bg-red-100' : rate > 10 ? 'text-yellow-600 bg-yellow-100' : 'text-green-600 bg-green-100';
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
                label: 'Status',
                render: (value: any) => {
                    const status = value?.toLowerCase() || '';
                    const config: Record<string, { bg: string; text: string }> = {
                        paid: { bg: 'bg-green-100', text: 'text-green-800' },
                        partial: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
                        due: { bg: 'bg-red-100', text: 'text-red-800' },
                    };
                    const { bg, text } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${bg} ${text}`}>{value}</span>;
                },
            },
        ],
        [formatCurrency]
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle="Customer Analytics Report"
                    reportDescription="Complete analysis of customer transactions, payments, and outstanding dues"
                    reportIcon={<Users className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-indigo-600 to-indigo-700"
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
                        title: apiParams.only_due ? 'No Dues Found' : 'No Customers Found',
                        description: apiParams.only_due ? 'Great news! No customers currently have outstanding balances.' : 'No orders match your current filters.',
                    }}
                />
            </div>
        </div>
    );
};

export default CustomerReportPage;
