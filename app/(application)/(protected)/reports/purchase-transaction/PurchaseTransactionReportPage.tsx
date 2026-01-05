'use client';

import ReportPageLayout from '@/app/(application)/(protected)/reports/_shared/ReportPageLayout';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetPurchaseTransactionReportMutation } from '@/store/features/reports/reportApi';
import { ArrowLeftRight, Banknote, CreditCard, FileText, Receipt, Store, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const PurchaseTransactionReportPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getPurchaseTransactionReport, { data: reportData, isLoading }] = useGetPurchaseTransactionReportMutation();

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
            getPurchaseTransactionReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const transactions = useMemo(() => reportData?.data?.transactions || [], [reportData]);
    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const byPaymentMethod = useMemo(() => reportData?.data?.by_payment_method || [], [reportData]);
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
                label: 'Total Transactions',
                value: summary.total_transactions || 0,
                icon: <ArrowLeftRight className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Total Paid',
                value: `৳${Number(summary.total_amount_paid || 0).toLocaleString()}`,
                icon: <Banknote className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: 'Average Payment',
                value: `৳${Number(summary.average_payment || 0).toLocaleString()}`,
                icon: <Receipt className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
        ],
        [summary]
    );

    const columns = useMemo(
        () => [
            {
                key: 'invoice_number',
                label: 'Invoice',
                sortable: true,
                render: (value: any) => <span className="font-mono text-sm font-semibold text-gray-900">{value}</span>,
            },
            {
                key: 'supplier_name',
                label: 'Supplier',
                render: (value: any) => (
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{value || 'N/A'}</span>
                    </div>
                ),
            },
            {
                key: 'store_name',
                label: 'Store',
                render: (value: any) => (
                    <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{value}</span>
                    </div>
                ),
            },
            {
                key: 'payment_method',
                label: 'Method',
                render: (value: any) => <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-800">{value}</span>,
            },
            {
                key: 'amount',
                label: 'Amount Paid',
                sortable: true,
                render: (value: any) => <span className="font-bold text-green-600">৳{Number(value || 0).toLocaleString()}</span>,
            },
            {
                key: 'user_name',
                label: 'Processed By',
                render: (value: any) => <span className="text-sm text-gray-600">{value}</span>,
            },
            {
                key: 'paid_at',
                label: 'Payment Date',
                sortable: true,
                render: (value: any) => (
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{new Date(value).toLocaleDateString('en-GB')}</span>
                        <span className="text-xs text-gray-500">{new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                ),
            },
            {
                key: 'notes',
                label: 'Notes',
                render: (value: any) => (
                    <span className="max-w-[150px] truncate text-xs text-gray-500" title={value}>
                        {value || '-'}
                    </span>
                ),
            },
        ],
        []
    );

    return (
        <ReportPageLayout
            title="Purchase Transaction Report"
            description="View and track all payments made for purchase orders"
            icon={<ArrowLeftRight className="h-6 w-6 text-white" />}
            iconBgClass="bg-gradient-to-r from-cyan-600 to-cyan-700"
        >
            <ReportSummaryCard items={summaryItems} />

            {/* Payment Method Breakdown */}
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
                                    <span className="text-2xl font-bold text-gray-900">৳{Number(item.total).toLocaleString()}</span>
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
        </ReportPageLayout>
    );
};

export default PurchaseTransactionReportPage;
