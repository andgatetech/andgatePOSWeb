'use client';

import ReportPageLayout from '@/app/(application)/(protected)/reports/_shared/ReportPageLayout';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import PurchaseReportFilter from '@/components/filters/reports/PurchaseReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetSupplierReportMutation } from '@/store/features/reports/reportApi';
import { Banknote, FileText, Package, Receipt, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SupplierReportPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getSupplierReport, { data: reportData, isLoading }] = useGetSupplierReportMutation();

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
            getSupplierReport(queryParams);
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

    const summaryItems = useMemo(
        () => [
            {
                label: 'Total Orders',
                value: summary.total_orders || 0,
                icon: <Receipt className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
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
                icon: <Banknote className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: 'Total Due',
                value: `৳${Number(summary.total_due || 0).toLocaleString()}`,
                icon: <Banknote className="h-4 w-4 text-red-600" />,
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
                label: 'Reference',
                sortable: true,
                render: (value: any) => <span className="font-mono text-sm font-semibold text-gray-900">{value || 'N/A'}</span>,
            },
            {
                key: 'supplier',
                label: 'Supplier',
                render: (value: any) => (
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{value || 'N/A'}</span>
                    </div>
                ),
            },
            {
                key: 'total_items',
                label: 'Items',
                sortable: true,
                render: (value: any) => (
                    <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{value}</span>
                    </div>
                ),
            },
            {
                key: 'amount',
                label: 'Amount',
                sortable: true,
                render: (value: any) => <span className="font-semibold text-gray-900">৳{Number(value || 0).toLocaleString()}</span>,
            },
            {
                key: 'payment_method',
                label: 'Payment Method',
                render: (value: any) => {
                    if (!value || value === 'N/A') {
                        return <span className="text-xs text-gray-400">Not specified</span>;
                    }
                    return <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-800">{value}</span>;
                },
            },
            {
                key: 'status',
                label: 'Status',
                render: (value: any) => {
                    const status = value?.toLowerCase();
                    let colorClass = 'bg-gray-100 text-gray-800';
                    if (status === 'received') colorClass = 'bg-green-100 text-green-800';
                    else if (status === 'ordered') colorClass = 'bg-blue-100 text-blue-800';
                    else if (status === 'pending') colorClass = 'bg-yellow-100 text-yellow-800';
                    else if (status === 'cancelled') colorClass = 'bg-red-100 text-red-800';

                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colorClass}`}>{value}</span>;
                },
            },
            {
                key: 'created_at',
                label: 'Order Date',
                sortable: true,
                render: (value: any) => (
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{new Date(value).toLocaleDateString('en-GB')}</span>
                        <span className="text-xs text-gray-500">{new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <ReportPageLayout
            title="Supplier Report"
            description="View all supplier purchase orders"
            icon={<Users className="h-6 w-6 text-white" />}
            iconBgClass="bg-gradient-to-r from-cyan-600 to-cyan-700"
        >
            <ReportSummaryCard items={summaryItems} />

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
                emptyState={{ icon: <FileText className="mx-auto h-16 w-16" />, title: 'No Orders Found', description: 'No supplier orders match your current filters.' }}
            />
        </ReportPageLayout>
    );
};

export default SupplierReportPage;
