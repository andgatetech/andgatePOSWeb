'use client';

import ReportPageLayout from '@/app/(application)/(protected)/reports/_shared/ReportPageLayout';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetTaxReportMutation } from '@/store/features/reports/reportApi';
import { Banknote, Calculator, FileText, Percent, ShoppingCart } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const TaxReportPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('period');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getTaxReport, { data: reportData, isLoading }] = useGetTaxReportMutation();

    const lastQueryParams = useRef<string>('');

    const queryParams = useMemo(() => {
        const params: Record<string, any> = { page: currentPage, per_page: itemsPerPage, sort_field: sortField, sort_direction: sortDirection, group_by: 'date', ...apiParams };
        if (!params.store_id && !params.store_ids && currentStoreId) params.store_id = currentStoreId;
        return params;
    }, [apiParams, currentStoreId, currentPage, itemsPerPage, sortField, sortDirection]);

    useEffect(() => {
        const queryString = JSON.stringify(queryParams);
        if (lastQueryParams.current === queryString) return;
        if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
            lastQueryParams.current = queryString;
            getTaxReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const items = useMemo(() => reportData?.data?.items || [], [reportData]);
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
                label: 'Total Tax',
                value: `৳${Number(summary.total_tax_collected || 0).toLocaleString()}`,
                icon: <Calculator className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Total Orders',
                value: summary.total_orders || 0,
                icon: <ShoppingCart className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: 'Total Sales',
                value: `৳${Number(summary.total_sales || 0).toLocaleString()}`,
                icon: <Banknote className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
            {
                label: 'Effective Rate',
                value: `${Number(summary.effective_tax_rate || 0).toFixed(2)}%`,
                icon: <Percent className="h-4 w-4 text-orange-600" />,
                bgColor: 'bg-orange-500',
                lightBg: 'bg-orange-50',
                textColor: 'text-orange-600',
            },
        ],
        [summary]
    );

    const columns = useMemo(
        () => [
            { key: 'period', label: 'Period', sortable: true, render: (value: any) => <span className="font-semibold text-gray-900">{value}</span> },
            { key: 'tax_collected', label: 'Tax Collected', sortable: true, render: (value: any) => <span className="font-semibold text-blue-600">৳{Number(value || 0).toFixed(2)}</span> },
            {
                key: 'orders_count',
                label: 'Orders',
                render: (value: any) => <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">{value}</span>,
            },
            { key: 'total_sales', label: 'Sales', sortable: true, render: (value: any) => <span className="text-gray-900">৳{Number(value || 0).toLocaleString()}</span> },
            { key: 'taxable_sales', label: 'Taxable Sales', render: (value: any) => <span className="text-gray-700">৳{Number(value || 0).toLocaleString()}</span> },
            { key: 'non_taxable_sales', label: 'Non-Taxable', render: (value: any) => <span className="text-gray-500">৳{Number(value || 0).toLocaleString()}</span> },
            { key: 'items_count', label: 'Items', render: (value: any) => <span className="text-gray-700">{value}</span> },
            {
                key: 'effective_rate',
                label: 'Rate',
                render: (value: any) => <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">{Number(value || 0).toFixed(2)}%</span>,
            },
        ],
        []
    );

    return (
        <ReportPageLayout title="Tax Report" description="View tax collection summary" icon={<Calculator className="h-6 w-6 text-white" />} iconBgClass="bg-gradient-to-r from-sky-600 to-sky-700">
            <ReportSummaryCard items={summaryItems} />
            <div className="mb-6">
                <BasicReportFilter onFilterChange={handleFilterChange} placeholder="Search..." />
            </div>
            <ReusableTable
                data={items}
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
                emptyState={{ icon: <FileText className="mx-auto h-16 w-16" />, title: 'No Tax Data Found', description: 'No tax records match your current filters.' }}
            />
        </ReportPageLayout>
    );
};

export default TaxReportPage;
