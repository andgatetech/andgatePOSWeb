'use client';

import ReportPageLayout from '@/app/(application)/(protected)/reports/_shared/ReportPageLayout';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import SalesReportFilter from '@/components/filters/reports/SalesReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetSalesReportMutation } from '@/store/features/reports/reportApi';
import { Banknote, Calendar, CreditCard, FileText, Hash, Package, Percent, Receipt, ShoppingCart, TrendingDown, User, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SalesReportPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getSalesReport, { data: reportData, isLoading }] = useGetSalesReportMutation();

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
                label: 'Items',
                render: (value: any) => (
                    <div className="flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-gray-400" />
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">{value}</span>
                    </div>
                ),
            },
            {
                key: 'grand_total',
                label: 'Total Amount',
                sortable: true,
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">৳{Number(value || 0).toLocaleString()}</span>
                        <div className="flex items-center gap-1 text-[10px] font-semibold uppercase text-gray-500">
                            <CreditCard className="h-2.5 w-2.5" /> {row.payment_method || 'N/A'}
                        </div>
                    </div>
                ),
            },
            {
                key: 'due_amount',
                label: 'Paid / Due',
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-emerald-600">P: ৳{Number(row.amount_paid || 0).toLocaleString()}</span>
                        <span className={`text-xs font-semibold ${Number(value) > 0 ? 'text-red-600' : 'text-gray-400'}`}>D: ৳{Number(value || 0).toLocaleString()}</span>
                    </div>
                ),
            },
            {
                key: 'status',
                label: 'Status',
                sortable: true,
                render: (value: any, row: any) => {
                    const payStatus = row.payment_status?.toLowerCase() || '';
                    const config: Record<string, { bg: string; text: string }> = {
                        paid: { bg: 'bg-green-100', text: 'text-green-800' },
                        partial: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
                        due: { bg: 'bg-red-100', text: 'text-red-800' },
                        pending: { bg: 'bg-blue-100', text: 'text-blue-800' },
                    };
                    const { bg, text } = config[payStatus] || { bg: 'bg-gray-100', text: 'text-gray-800' };

                    return (
                        <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${bg} ${text}`}>{row.payment_status || 'N/A'}</span>
                            <span className="pl-1 text-[10px] font-medium uppercase italic text-gray-400">{value}</span>
                        </div>
                    );
                },
            },
            {
                key: 'created_at',
                label: 'Order Date',
                sortable: true,
                render: (value: any) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {new Date(value).toLocaleDateString('en-GB')}
                        </div>
                        <span className="pl-5 text-[10px] text-gray-400">{new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <ReportPageLayout
            title="Sales Report"
            description="Overview of your store sales and income"
            icon={<ShoppingCart className="h-6 w-6 text-white" />}
            iconBgClass="bg-gradient-to-r from-emerald-600 to-teal-700"
        >
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
        </ReportPageLayout>
    );
};

export default SalesReportPage;
