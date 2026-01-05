'use client';

import ReportPageLayout from '@/app/(application)/(protected)/reports/_shared/ReportPageLayout';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetPurchaseItemsReportMutation } from '@/store/features/reports/reportApi';
import { Banknote, CheckCircle, FileText, Package, Truck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const PurchaseItemsReportPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('purchase_qty');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getPurchaseItemsReport, { data: reportData, isLoading }] = useGetPurchaseItemsReportMutation();

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
            getPurchaseItemsReport(queryParams);
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
                label: 'Total Unique Items',
                value: summary.total_items || 0,
                icon: <Package className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Total Quantity',
                value: summary.total_quantity || 0,
                icon: <Truck className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: 'Total Received',
                value: summary.total_received || 0,
                icon: <CheckCircle className="h-4 w-4 text-teal-600" />,
                bgColor: 'bg-teal-500',
                lightBg: 'bg-teal-50',
                textColor: 'text-teal-600',
            },
            {
                label: 'Total Amount',
                value: `৳${Number(summary.total_amount || 0).toLocaleString()}`,
                icon: <Banknote className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
        ],
        [summary]
    );

    const columns = useMemo(
        () => [
            { key: 'reference', label: 'Reference', render: (value: any) => <span className="font-mono text-sm text-gray-600">{value || '-'}</span> },
            { key: 'sku', label: 'SKU', render: (value: any) => <span className="font-mono text-sm text-gray-600">{value || '-'}</span> },
            {
                key: 'product_name',
                label: 'Product',
                sortable: true,
                render: (value: any) => <span className="font-medium text-gray-900">{value}</span>,
            },
            { key: 'category', label: 'Category', render: (value: any) => <span className="text-sm text-gray-700">{value || 'Uncategorized'}</span> },
            { key: 'brand', label: 'Brand', render: (value: any) => <span className="text-sm text-gray-700">{value || 'Unbranded'}</span> },
            {
                key: 'instock_qty',
                label: 'Instock',
                render: (value: any) => <span className={`font-semibold ${Number(value) > 0 ? 'text-gray-900' : 'text-red-600'}`}>{value}</span>,
            },
            {
                key: 'purchase_qty',
                label: 'Qty',
                sortable: true,
                render: (value: any) => <span className="font-bold text-blue-600">{value}</span>,
            },
            {
                key: 'received_qty',
                label: 'Received',
                render: (value: any, row: any) => {
                    const isFullyReceived = Number(value) >= Number(row.purchase_qty);
                    return (
                        <span className={`inline-flex items-center gap-1 font-medium ${isFullyReceived ? 'text-green-600' : 'text-orange-600'}`}>
                            {value}
                            {isFullyReceived && <CheckCircle className="h-3 w-3" />}
                        </span>
                    );
                },
            },
            { key: 'unit_price', label: 'Unit Price', render: (value: any) => <span className="text-sm text-gray-700">৳{Number(value || 0).toFixed(2)}</span> },
            { key: 'purchase_amount', label: 'Total', sortable: true, render: (value: any) => <span className="font-semibold text-gray-900">৳{Number(value || 0).toLocaleString()}</span> },
            {
                key: 'due_date',
                label: 'Due Date',
                render: (value: any) => (value ? <span className="text-sm text-gray-700">{new Date(value).toLocaleDateString('en-GB')}</span> : <span className="text-xs text-gray-400">N/A</span>),
            },
        ],
        []
    );

    return (
        <ReportPageLayout
            title="Purchase Items Report"
            description="View details of items purchased across all orders"
            icon={<Package className="h-6 w-6 text-white" />}
            iconBgClass="bg-gradient-to-r from-amber-600 to-amber-700"
        >
            <ReportSummaryCard items={summaryItems} />
            <div className="mb-6">
                <BasicReportFilter onFilterChange={handleFilterChange} placeholder="Search products, SKU..." />
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
                emptyState={{ icon: <FileText className="mx-auto h-16 w-16" />, title: 'No Items Found', description: 'No purchase items match your current filters.' }}
            />
        </ReportPageLayout>
    );
};

export default PurchaseItemsReportPage;
