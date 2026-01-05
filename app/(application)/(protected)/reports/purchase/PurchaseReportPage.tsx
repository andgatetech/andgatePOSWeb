'use client';

import ReportPageLayout from '@/app/(application)/(protected)/reports/_shared/ReportPageLayout';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import PurchaseReportFilter from '@/components/filters/reports/PurchaseReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetPurchaseReportMutation } from '@/store/features/reports/reportApi';
import { Banknote, Calculator, CreditCard, FileText, PieChart, ShoppingCart, TrendingDown, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const PurchaseReportPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getPurchaseReport, { data: reportData, isLoading }] = useGetPurchaseReportMutation();

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
            getPurchaseReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const orders = useMemo(() => reportData?.data?.purchase_orders || [], [reportData]);
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
                value: `৳${Number(summary.total_purchase_value || 0).toLocaleString()}`,
                icon: <Banknote className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: 'Paid Amount',
                value: `৳${Number(summary.total_amount_paid || 0).toLocaleString()}`,
                icon: <Wallet className="h-4 w-4 text-emerald-600" />,
                bgColor: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            },
            {
                label: 'Due Amount',
                value: `৳${Number(summary.total_amount_due || 0).toLocaleString()}`,
                icon: <TrendingDown className="h-4 w-4 text-red-600" />,
                bgColor: 'bg-red-500',
                lightBg: 'bg-red-50',
                textColor: 'text-red-600',
            },
            {
                label: 'Avg Order Value',
                value: `৳${Number(summary.average_order_value || 0).toLocaleString()}`,
                icon: <Calculator className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
        ],
        [summary]
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
                        {row.store_name && <span className="text-[10px] text-gray-400">{row.store_name}</span>}
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
            { key: 'grand_total', label: 'Total', sortable: true, render: (value: any) => <span className="font-bold text-gray-900">৳{Number(value || 0).toLocaleString()}</span> },
            {
                key: 'amount_paid',
                label: 'Paid/Due',
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-green-600">P: ৳{Number(value || 0).toLocaleString()}</span>
                        <span className={`text-xs font-medium ${Number(row.amount_due) > 0 ? 'text-red-600' : 'text-gray-400'}`}>D: ৳{Number(row.amount_due || 0).toLocaleString()}</span>
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
        []
    );

    return (
        <ReportPageLayout
            title="Purchase Report"
            description="Complete analysis of procurement and purchase history"
            icon={<ShoppingCart className="h-6 w-6 text-white" />}
            iconBgClass="bg-gradient-to-r from-orange-600 to-orange-700"
        >
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
                                <span className="font-bold text-gray-900">৳{Number(item.total).toLocaleString()}</span>
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
                                    <p className="text-sm font-bold text-gray-900">৳{Number(item.total).toLocaleString()}</p>
                                    {Number(item.total_due) > 0 && <p className="mt-1 text-[10px] font-medium leading-none text-red-500">Due: ৳{Number(item.total_due).toLocaleString()}</p>}
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
        </ReportPageLayout>
    );
};

export default PurchaseReportPage;
