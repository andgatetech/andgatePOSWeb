'use client';

import ReportPageLayout from '@/app/(application)/(protected)/reports/_shared/ReportPageLayout';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetExpenseReportMutation } from '@/store/features/reports/reportApi';
import { Banknote, Calculator, Calendar, CreditCard, FileText, Receipt, Store, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const ExpenseReportPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getExpenseReport, { data: reportData, isLoading }] = useGetExpenseReportMutation();

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
            getExpenseReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const expenses = useMemo(() => reportData?.data?.expenses || [], [reportData]);
    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const byPaymentType = useMemo(() => reportData?.data?.summary?.by_payment_type || [], [reportData]);
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
                label: 'Expense Records',
                value: summary.expense_count || 0,
                icon: <FileText className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Total Expenses',
                value: `৳${Number(summary.total_expenses || 0).toLocaleString()}`,
                icon: <Banknote className="h-4 w-4 text-rose-600" />,
                bgColor: 'bg-rose-500',
                lightBg: 'bg-rose-50',
                textColor: 'text-rose-600',
            },
            {
                label: 'Avg. Expense',
                value: `৳${Number(summary.average_expense || 0).toLocaleString()}`,
                icon: <Calculator className="h-4 w-4 text-amber-600" />,
                bgColor: 'bg-amber-500',
                lightBg: 'bg-amber-50',
                textColor: 'text-amber-600',
            },
        ],
        [summary]
    );

    const columns = useMemo(
        () => [
            {
                key: 'title',
                label: 'Expense Title',
                sortable: true,
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{value}</span>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase text-gray-400">
                            <Receipt className="h-3 w-3" /> {row.ledger_title}
                            <span className="mx-1">•</span>
                            {row.expense_ledger_type}
                        </div>
                    </div>
                ),
            },
            {
                key: 'store_name',
                label: 'Store / User',
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
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
                key: 'payment_type',
                label: 'Payment',
                render: (value: any) => (
                    <div className="flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium capitalize text-gray-700">{value}</span>
                    </div>
                ),
            },
            {
                key: 'amount',
                label: 'Amount',
                sortable: true,
                render: (value: any) => <span className="font-bold text-rose-600">৳{Number(value || 0).toLocaleString()}</span>,
            },
            {
                key: 'created_at',
                label: 'Date & Time',
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
            title="Expense Report"
            description="List of all operational and administrative expenses"
            icon={<Receipt className="h-6 w-6 text-white" />}
            iconBgClass="bg-gradient-to-r from-rose-600 to-red-700"
        >
            <ReportSummaryCard items={summaryItems} />

            <div className="mb-6">
                <BasicReportFilter onFilterChange={handleFilterChange} placeholder="Search expense titles, users..." />
            </div>

            <ReusableTable
                data={expenses}
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
                    title: 'No Expense Records',
                    description: "We couldn't find any expenses matching your selected range.",
                }}
            />
        </ReportPageLayout>
    );
};

export default ExpenseReportPage;
