'use client';

import ReportPageLayout from '@/app/(application)/(protected)/reports/_shared/ReportPageLayout';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import CustomerReportFilter from '@/components/filters/reports/CustomerReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetCustomerReportMutation } from '@/store/features/reports/reportApi';
import { AlertCircle, Banknote, FileText, Hash, Mail, Phone, ShoppingCart, TrendingDown, Users, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const CustomerReportPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('total_orders');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getCustomerReport, { data: reportData, isLoading }] = useGetCustomerReportMutation();

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

    useEffect(() => {
        const queryString = JSON.stringify(queryParams);
        if (lastQueryParams.current === queryString) return;
        if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
            lastQueryParams.current = queryString;
            getCustomerReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const customers = useMemo(() => reportData?.data?.customers || [], [reportData]);
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
                value: `৳${Number(summary.total_amount || 0).toLocaleString()}`,
                icon: <Banknote className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
            {
                label: 'Total Paid',
                value: `৳${Number(summary.total_paid || 0).toLocaleString()}`,
                icon: <Wallet className="h-4 w-4 text-emerald-600" />,
                bgColor: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            },
            {
                label: 'Total Due',
                value: `৳${Number(summary.total_due || 0).toLocaleString()}`,
                icon: <TrendingDown className="h-4 w-4 text-red-600" />,
                bgColor: 'bg-red-500',
                lightBg: 'bg-red-50',
                textColor: 'text-red-600',
            },
        ],
        [summary]
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
            {
                key: 'amount',
                label: 'Sales Amount',
                sortable: true,
                render: (value: any) => <span className="font-bold text-gray-900">৳{Number(value || 0).toLocaleString()}</span>,
            },
            {
                key: 'paid',
                label: 'Paid',
                render: (value: any) => <span className="font-medium text-emerald-600">৳{Number(value || 0).toLocaleString()}</span>,
            },
            {
                key: 'due',
                label: 'Outstanding Due',
                sortable: true,
                render: (value: any) => <span className={`font-bold ${Number(value) > 0 ? 'text-red-600' : 'text-gray-400'}`}>৳{Number(value || 0).toLocaleString()}</span>,
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
        []
    );

    return (
        <ReportPageLayout
            title="Customer Analytics Report"
            description="Complete analysis of customer transactions, payments, and outstanding dues"
            icon={<Users className="h-6 w-6 text-white" />}
            iconBgClass="bg-gradient-to-r from-indigo-600 to-indigo-700"
        >
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
        </ReportPageLayout>
    );
};

export default CustomerReportPage;
