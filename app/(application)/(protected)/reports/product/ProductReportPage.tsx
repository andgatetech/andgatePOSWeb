'use client';

import ReportPageLayout from '@/app/(application)/(protected)/reports/_shared/ReportPageLayout';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetProductReportMutation } from '@/store/features/reports/reportApi';
import { Banknote, BarChart3, Box, FileText, Hash, Layers, Package, ShoppingCart, Tag, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const ProductReportPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('revenue');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getProductReport, { data: reportData, isLoading }] = useGetProductReportMutation();

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
            getProductReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const products = useMemo(() => reportData?.data?.products || [], [reportData]);
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
                label: 'Unique Products',
                value: Number(summary.total_products || 0).toLocaleString(),
                icon: <Package className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Total Inventory',
                value: Number(summary.total_quantity || 0).toLocaleString(),
                icon: <Layers className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
            {
                label: 'Orders Fulfilled',
                value: Number(summary.total_ordered || 0).toLocaleString(),
                icon: <ShoppingCart className="h-4 w-4 text-emerald-600" />,
                bgColor: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            },
            {
                label: 'Gross Revenue',
                value: `৳${Number(summary.total_revenue || 0).toLocaleString()}`,
                icon: <Banknote className="h-4 w-4 text-pink-600" />,
                bgColor: 'bg-pink-500',
                lightBg: 'bg-pink-50',
                textColor: 'text-pink-600',
            },
        ],
        [summary]
    );

    const columns = useMemo(
        () => [
            {
                key: 'product_name',
                label: 'Product Information',
                sortable: true,
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-bold text-gray-900">
                            <Box className="h-3.5 w-3.5 text-gray-400" />
                            {value}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="rounded border bg-gray-50 px-1 font-mono text-[10px] text-gray-400">{row.sku}</span>
                            {row.variant_data && (
                                <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500">
                                    <Tag className="h-2.5 w-2.5" />
                                    {Object.entries(row.variant_data)
                                        .map(([key, val]) => `${key}: ${val}`)
                                        .join(', ')}
                                </div>
                            )}
                        </div>
                        {row.batch_no && (
                            <div className="mt-0.5 flex items-center gap-1 text-[9px] text-gray-400">
                                <Hash className="h-2 w-2" /> {row.batch_no}
                            </div>
                        )}
                    </div>
                ),
            },
            {
                key: 'category',
                label: 'Category',
                render: (value: any) => <span className="text-sm font-medium text-gray-700">{value || 'Uncategorized'}</span>,
            },
            {
                key: 'brand',
                label: 'Brand',
                render: (value: any) => <span className="text-sm font-medium text-gray-700">{value || 'Unbranded'}</span>,
            },
            {
                key: 'qty',
                label: 'Current Stock',
                sortable: true,
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <span className={`font-bold ${Number(value) > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                            {value} <span className="text-[10px] font-normal lowercase text-gray-500">{row.unit || 'pcs'}</span>
                        </span>
                        <span className="text-[10px] text-gray-400">Rate: ৳{Number(row.price || 0).toLocaleString()}</span>
                    </div>
                ),
            },
            {
                key: 'total_ordered',
                label: 'Quantity Sold',
                sortable: true,
                render: (value: any) => (
                    <div className="flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">{value || 0}</span>
                    </div>
                ),
            },
            {
                key: 'revenue',
                label: 'Total Sales',
                sortable: true,
                render: (value: any) => (
                    <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />৳{Number(value || 0).toLocaleString()}
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <ReportPageLayout
            title="Product Report"
            description="Overview of all items and their sales details"
            icon={<Package className="h-6 w-6 text-white" />}
            iconBgClass="bg-gradient-to-r from-pink-600 to-rose-700"
        >
            <ReportSummaryCard items={summaryItems} />

            <div className="mb-6">
                <BasicReportFilter onFilterChange={handleFilterChange} placeholder="Search products, SKU, category..." />
            </div>

            <ReusableTable
                data={products}
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
                    title: 'Catalogue Entry Not Found',
                    description: 'No products match your current search criteria or category filter.',
                }}
            />
        </ReportPageLayout>
    );
};

export default ProductReportPage;
