'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import SalesReportFilter from '@/components/filters/reports/SalesReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetSalesReportMutation } from '@/store/features/reports/reportApi';
import { Banknote, FileText, Hash, Percent, Receipt, ShoppingCart, TrendingDown, User, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SalesReportPage = () => {
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Main mutation for UI table display
    const [getSalesReport, { data: reportData, isLoading }] = useGetSalesReportMutation();

    // Separate mutation instance for export - won't affect UI data
    const [getSalesReportForExport] = useGetSalesReportMutation();

    // Track last query to prevent duplicate API calls
    const lastQueryParams = useRef<string>('');

    // Build query params
    const queryParams = useMemo(() => {
        const params: Record<string, any> = {
            page: currentPage,
            per_page: itemsPerPage,
            sort_field: sortField,
            sort_direction: sortDirection,
            ...apiParams,
        };

        if (!params.store_id && !params.store_ids && currentStoreId) {
            params.store_id = currentStoreId;
        }

        return params;
    }, [apiParams, currentStoreId, currentPage, itemsPerPage, sortField, sortDirection]);

    // Fetch data - with deduplication to prevent multiple calls
    useEffect(() => {
        const queryString = JSON.stringify(queryParams);

        // Skip if same query as last call
        if (lastQueryParams.current === queryString) {
            return;
        }

        if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
            lastQueryParams.current = queryString;
            getSalesReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const orders = useMemo(() => reportData?.data?.orders || [], [reportData]);
    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const pagination = useMemo(() => reportData?.data?.pagination || {}, [reportData]);

    // Fetch ALL data for export (separate API call - doesn't affect UI)
    const fetchAllDataForExport = useCallback(async (): Promise<any[]> => {
        const exportParams: Record<string, any> = {
            ...apiParams,
            export: true, // Backend returns ALL data when export=true (no pagination)
            sort_field: sortField,
            sort_direction: sortDirection,
        };

        if (!exportParams.store_id && !exportParams.store_ids && currentStoreId) {
            exportParams.store_id = currentStoreId;
        }

        try {
            // Use separate RTK Query mutation instance to fetch export data without affecting UI
            const result = await getSalesReportForExport(exportParams).unwrap();
            return result?.data?.orders || [];
        } catch (error) {
            console.error('Failed to fetch all data for export:', error);
            // Fallback to currently loaded data
            return orders;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, orders, getSalesReportForExport]);

    const handleFilterChange = useCallback((newApiParams: Record<string, any>) => {
        setApiParams(newApiParams);
        setCurrentPage(1);
    }, []);

    const handleSort = useCallback(
        (field: string) => {
            if (sortField === field) {
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            } else {
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

    // Summary stats
    const summaryItems = useMemo(
        () => [
            {
                label: 'Total Orders',
                value: Number(summary.total_orders || 0).toLocaleString(),
                icon: <ShoppingCart className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Gross Sales',
                value: `৳${Number(summary.total_sales || 0).toLocaleString()}`,
                icon: <Banknote className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: 'Collection',
                value: `৳${Number(summary.total_amount_paid || 0).toLocaleString()}`,
                icon: <Wallet className="h-4 w-4 text-emerald-600" />,
                bgColor: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            },
            {
                label: 'Outstanding',
                value: `৳${Number(summary.total_due_amount || 0).toLocaleString()}`,
                icon: <TrendingDown className="h-4 w-4 text-red-600" />,
                bgColor: 'bg-red-500',
                lightBg: 'bg-red-50',
                textColor: 'text-red-600',
            },
            {
                label: 'Discounts',
                value: `৳${Number(summary.total_discount || 0).toLocaleString()}`,
                icon: <Percent className="h-4 w-4 text-amber-600" />,
                bgColor: 'bg-amber-500',
                lightBg: 'bg-amber-50',
                textColor: 'text-amber-600',
            },
            {
                label: 'Avg Order',
                value: `৳${Number(summary.average_order_value || 0).toLocaleString()}`,
                icon: <Receipt className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
        ],
        [summary]
    );

    // Table columns
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
                key: 'customer',
                label: 'Customer',
                render: (_: any, row: any) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-medium text-gray-900">
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            {row.is_walk_in ? 'Walk-in Customer' : row.customer?.name || 'N/A'}
                        </div>
                        {!row.is_walk_in && row.customer?.phone && <span className="pl-5 text-[10px] text-gray-500">{row.customer.phone}</span>}
                    </div>
                ),
            },
            {
                key: 'items_count',
                label: 'Qty',
                render: (value: any) => <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">{value}</span>,
            },
            {
                key: 'grand_total',
                label: 'Total',
                sortable: true,
                render: (value: any) => <span className="font-bold text-gray-900">৳{Number(value || 0).toLocaleString()}</span>,
            },
            {
                key: 'amount_paid',
                label: 'Paid',
                render: (value: any) => <span className="font-semibold text-emerald-600">৳{Number(value || 0).toLocaleString()}</span>,
            },
            {
                key: 'due_amount',
                label: 'Due',
                render: (value: any) => <span className={`font-semibold ${Number(value) > 0 ? 'text-red-600' : 'text-gray-400'}`}>৳{Number(value || 0).toLocaleString()}</span>,
            },
            {
                key: 'payment_status',
                label: 'Status',
                sortable: true,
                render: (value: any) => {
                    const payStatus = value?.toLowerCase() || '';
                    const config: Record<string, { bg: string; text: string }> = {
                        paid: { bg: 'bg-green-100', text: 'text-green-800' },
                        partial: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
                        due: { bg: 'bg-red-100', text: 'text-red-800' },
                        pending: { bg: 'bg-blue-100', text: 'text-blue-800' },
                    };
                    const { bg, text } = config[payStatus] || { bg: 'bg-gray-100', text: 'text-gray-800' };

                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${bg} ${text}`}>{value || 'N/A'}</span>;
                },
            },
            {
                key: 'created_at',
                label: 'Date',
                sortable: true,
                render: (value: any) => (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">{new Date(value).toLocaleDateString('en-GB')}</span>
                        <span className="text-[10px] text-gray-400">{new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                ),
            },
        ],
        []
    );

    // Export columns configuration
    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'invoice', label: 'Invoice', width: 15 },
            {
                key: 'customer',
                label: 'Customer',
                width: 25,
                format: (_, row) => (row?.is_walk_in ? 'Walk-in' : row?.customer?.name || 'N/A'),
            },
            { key: 'items_count', label: 'Qty', width: 8 },
            {
                key: 'grand_total',
                label: 'Total',
                width: 15,
                format: (value) => `৳${Number(value || 0).toLocaleString()}`,
            },
            {
                key: 'amount_paid',
                label: 'Paid',
                width: 15,
                format: (value) => `৳${Number(value || 0).toLocaleString()}`,
            },
            {
                key: 'due_amount',
                label: 'Due',
                width: 15,
                format: (value) => `৳${Number(value || 0).toLocaleString()}`,
            },
            { key: 'payment_status', label: 'Status', width: 12 },
            {
                key: 'created_at',
                label: 'Date',
                width: 12,
                format: (value) => (value ? new Date(value).toLocaleDateString('en-GB') : ''),
            },
        ],
        []
    );

    // Filter summary for export
    const filterSummary = useMemo(() => {
        const selectedStore = apiParams.store_ids
            ? 'All Stores'
            : apiParams.store_id
            ? userStores.find((s: any) => s.id === apiParams.store_id)?.store_name || currentStore?.store_name || 'All Stores'
            : currentStore?.store_name || 'All Stores';

        const customFilters: { label: string; value: string }[] = [];
        if (apiParams.payment_status && apiParams.payment_status !== 'all') {
            // Capitalize first letter for display
            const statusDisplay = apiParams.payment_status.charAt(0).toUpperCase() + apiParams.payment_status.slice(1);
            customFilters.push({ label: 'Status', value: statusDisplay });
        }
        if (apiParams.payment_method && apiParams.payment_method !== 'all') {
            // Capitalize first letter for display
            const methodDisplay = apiParams.payment_method.charAt(0).toUpperCase() + apiParams.payment_method.slice(1);
            customFilters.push({ label: 'Method', value: methodDisplay });
        }

        // Determine date range type from apiParams
        let dateType = 'none';
        if (apiParams.date_range_type) {
            dateType = apiParams.date_range_type;
        } else if (apiParams.start_date || apiParams.end_date) {
            dateType = 'custom';
        }

        return {
            dateRange: {
                startDate: apiParams.start_date,
                endDate: apiParams.end_date,
                type: dateType,
            },
            storeName: selectedStore,
            customFilters,
        };
    }, [apiParams, currentStore, userStores]);

    // Summary for export
    const exportSummary = useMemo(
        () => [
            { label: 'Total Orders', value: summary.total_orders || 0 },
            { label: 'Gross Sales', value: `৳${Number(summary.total_sales || 0).toLocaleString()}` },
            { label: 'Collection', value: `৳${Number(summary.total_amount_paid || 0).toLocaleString()}` },
            { label: 'Outstanding', value: `৳${Number(summary.total_due_amount || 0).toLocaleString()}` },
        ],
        [summary]
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                {/* Unified Export Toolbar with Report Header */}
                <ReportExportToolbar
                    reportTitle="Sales Report"
                    reportDescription="Overview of your store sales and income"
                    reportIcon={<ShoppingCart className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-emerald-600 to-teal-700"
                    data={orders}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="sales_report"
                    fetchAllData={fetchAllDataForExport}
                />

                <ReportSummaryCard items={summaryItems} />

                <div className="mb-6">
                    <SalesReportFilter onFilterChange={handleFilterChange} />
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
                    emptyState={{
                        icon: <FileText className="mx-auto h-16 w-16 text-gray-300" />,
                        title: 'No Sales Records Found',
                        description: "We couldn't find any orders matching your selected filters.",
                    }}
                />
            </div>
        </div>
    );
};

export default SalesReportPage;
