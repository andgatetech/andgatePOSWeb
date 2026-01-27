'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import OrderReturnsReportFilter from '@/components/filters/reports/OrderReturnsReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import Loader from '@/lib/Loader';
import { useGetOrderReturnsReportMutation } from '@/store/features/reports/reportApi';
import { ArrowLeftRight, FileText, Hash, PackageX, Percent, RefreshCw, TrendingDown, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const OrderReturnsReportPage = () => {
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getOrderReturnsReport, { data: reportData, isLoading }] = useGetOrderReturnsReportMutation();
    const [getOrderReturnsReportForExport] = useGetOrderReturnsReportMutation();

    const lastQueryParams = useRef<string>('');

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

    // Reset lastQueryParams when store changes to force API recall
    useEffect(() => {
        lastQueryParams.current = '';
    }, [currentStoreId]);

    useEffect(() => {
        const queryString = JSON.stringify(queryParams);

        if (lastQueryParams.current === queryString) {
            return;
        }

        if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
            lastQueryParams.current = queryString;
            getOrderReturnsReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const orderReturns = useMemo(() => reportData?.data?.order_returns || [], [reportData]);
    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const pagination = useMemo(() => reportData?.data?.pagination || {}, [reportData]);

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
            const result = await getOrderReturnsReportForExport(exportParams).unwrap();
            return result?.data?.order_returns || [];
        } catch (error) {
            console.error('Failed to fetch all data for export:', error);
            return orderReturns;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, orderReturns, getOrderReturnsReportForExport]);

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

    const summaryItems = useMemo(
        () => [
            {
                label: 'Total Returns',
                value: Number(summary.total_returns || 0).toLocaleString(),
                icon: <PackageX className="h-4 w-4 text-red-600" />,
                bgColor: 'bg-red-500',
                lightBg: 'bg-red-50',
                textColor: 'text-red-600',
            },
            {
                label: 'Returns Only',
                value: Number(summary.total_returns_only || 0).toLocaleString(),
                icon: <RefreshCw className="h-4 w-4 text-orange-600" />,
                bgColor: 'bg-orange-500',
                lightBg: 'bg-orange-50',
                textColor: 'text-orange-600',
            },
            {
                label: 'Exchanges',
                value: Number(summary.total_exchanges || 0).toLocaleString(),
                icon: <ArrowLeftRight className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Return Amount',
                value: formatCurrency(summary.total_return_amount),
                icon: <TrendingDown className="h-4 w-4 text-rose-600" />,
                bgColor: 'bg-rose-500',
                lightBg: 'bg-rose-50',
                textColor: 'text-rose-600',
            },
            {
                label: 'Average Return Value',
                value: formatCurrency(summary.average_return_value),
                icon: <Percent className="h-4 w-4 text-amber-600" />,
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
                key: 'return_number',
                label: 'Return #',
                sortable: true,
                render: (value: any) => (
                    <div className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                ),
            },
            {
                key: 'order',
                label: 'Invoice',
                render: (_: any, row: any) => (
                    <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium text-blue-600">{row.order?.invoice || 'N/A'}</span>
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
                key: 'return_type',
                label: 'Type',
                sortable: true,
                render: (value: any) => {
                    const isReturn = value === 'return';
                    return (
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isReturn ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                            }`}
                        >
                            {isReturn ? <RefreshCw className="h-3 w-3" /> : <ArrowLeftRight className="h-3 w-3" />}
                            {value}
                        </span>
                    );
                },
            },
            {
                key: 'return_reason',
                label: 'Reason',
                render: (value: any) => <span className="text-xs text-gray-600">{value?.name?.replace(/_/g, ' ').toUpperCase() || 'N/A'}</span>,
            },
            {
                key: 'total_return_amount',
                label: 'Return Amount',
                sortable: true,
                render: (value: any) => <span className="font-semibold text-red-600">-{formatCurrency(value)}</span>,
            },
            {
                key: 'payment_status',
                label: 'Status',
                sortable: true,
                render: (value: any) => {
                    const status = value?.toLowerCase() || '';
                    const config: Record<string, { bg: string; text: string }> = {
                        completed: { bg: 'bg-green-100', text: 'text-green-800' },
                        partial: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
                        pending: { bg: 'bg-blue-100', text: 'text-blue-800' },
                    };
                    const { bg, text } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

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
        [formatCurrency]
    );

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'return_number', label: 'Return #', width: 15 },
            {
                key: 'order',
                label: 'Invoice',
                width: 15,
                format: (_, row) => row?.order?.invoice || 'N/A',
            },
            {
                key: 'customer',
                label: 'Customer',
                width: 25,
                format: (_, row) => (row?.is_walk_in ? 'Walk-in' : row?.customer?.name || 'N/A'),
            },
            { key: 'return_type', label: 'Type', width: 12 },
            { key: 'return_reason', label: 'Reason', width: 15 },
            {
                key: 'total_return_amount',
                label: 'Return Amount',
                width: 15,
                format: (value) => formatCurrency(value),
            },
            { key: 'payment_status', label: 'Status', width: 12 },
            {
                key: 'created_at',
                label: 'Date',
                width: 12,
                format: (value) => (value ? new Date(value).toLocaleDateString('en-GB') : ''),
            },
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
        if (apiParams.return_type && apiParams.return_type !== 'all') {
            const typeDisplay = apiParams.return_type.charAt(0).toUpperCase() + apiParams.return_type.slice(1);
            customFilters.push({ label: 'Type', value: typeDisplay });
        }
        if (apiParams.payment_status && apiParams.payment_status !== 'all') {
            const statusDisplay = apiParams.payment_status.charAt(0).toUpperCase() + apiParams.payment_status.slice(1);
            customFilters.push({ label: 'Status', value: statusDisplay });
        }
        if (apiParams.return_reason && apiParams.return_reason !== 'all') {
            const reasonDisplay = apiParams.return_reason.replace(/_/g, ' ').toUpperCase();
            customFilters.push({ label: 'Reason', value: reasonDisplay });
        }

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

    const exportSummary = useMemo(
        () => [
            { label: 'Total Returns', value: summary.total_returns || 0 },
            { label: 'Returns Only', value: summary.total_returns_only || 0 },
            { label: 'Exchanges', value: summary.total_exchanges || 0 },
            { label: 'Return Amount', value: formatCurrency(summary.total_return_amount) },
        ],
        [summary, formatCurrency]
    );

    if (isLoading && !reportData?.data) {
        return <Loader message="Loading report..." />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle="Order Returns Report"
                    reportDescription="Overview of product returns and exchanges"
                    reportIcon={<PackageX className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-red-600 to-rose-700"
                    data={orderReturns}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="order_returns_report"
                    fetchAllData={fetchAllDataForExport}
                />

                <ReportSummaryCard items={summaryItems} />

                <div className="mb-6">
                    <OrderReturnsReportFilter onFilterChange={handleFilterChange} />
                </div>

                <ReusableTable
                    data={orderReturns}
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
                        title: 'No Return Records Found',
                        description: "We couldn't find any returns matching your selected filters.",
                    }}
                />
            </div>
        </div>
    );
};

export default OrderReturnsReportPage;
