'use client';

import ReportPageLayout from '@/app/(application)/(protected)/reports/_shared/ReportPageLayout';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import TransactionReportFilter from '@/components/filters/reports/TransactionReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetTransactionReportMutation } from '@/store/features/reports/reportApi';
import { ArrowLeftRight, Banknote, Calculator, Calendar, CreditCard, FileText, Hash, Store, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const TransactionReportPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getTransactionReport, { data: reportData, isLoading }] = useGetTransactionReportMutation();

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
            getTransactionReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const transactions = useMemo(() => reportData?.data?.transactions || [], [reportData]);
    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const byStatus = useMemo(() => reportData?.data?.by_status || [], [reportData]);
    const byMethod = useMemo(() => reportData?.data?.by_payment_method || [], [reportData]);
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
                label: 'Total Transactions',
                value: summary.total_transactions || 0,
                icon: <ArrowLeftRight className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Total Volume',
                value: `৳${Number(summary.total_amount || 0).toLocaleString()}`,
                icon: <Banknote className="h-4 w-4 text-emerald-600" />,
                bgColor: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            },
            {
                label: 'Avg. Transaction',
                value: `৳${Number(summary.average_transaction || 0).toLocaleString()}`,
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
                label: 'Registry / Store',
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-medium text-gray-700">
                            <Store className="h-3.5 w-3.5 text-gray-400" />
                            {value}
                        </div>
                        <div className="flex items-center gap-1.5 pl-5 text-[10px] text-gray-400">
                            <User className="h-3 w-3" /> {row.user_name}
                        </div>
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
                        <span className="font-bold text-gray-900">৳{Number(value || 0).toLocaleString()}</span>
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
        <ReportPageLayout
            title="Money Transactions"
            description="Detailed list of all payments and money movements"
            icon={<ArrowLeftRight className="h-6 w-6 text-white" />}
            iconBgClass="bg-gradient-to-r from-blue-600 to-indigo-700"
        >
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
        </ReportPageLayout>
    );
};

export default TransactionReportPage;
