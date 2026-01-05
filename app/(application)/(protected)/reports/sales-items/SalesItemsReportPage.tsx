'use client';

import ReportPageLayout from '@/app/(application)/(protected)/reports/_shared/ReportPageLayout';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetSalesItemsReportMutation } from '@/store/features/reports/reportApi';
import { BarChart3, Boxes, FileText, Layers, Package, ShoppingCart, Tag, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SalesItemsReportPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('sold_qty');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getSalesItemsReport, { data: reportData, isLoading }] = useGetSalesItemsReportMutation();

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
            getSalesItemsReport(queryParams);
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
                label: 'Unique Items Sold',
                value: summary.total_items || 0,
                icon: <Package className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Total Quantity Sold',
                value: Number(summary.total_sold_qty || 0).toLocaleString(),
                icon: <ShoppingCart className="h-4 w-4 text-orange-600" />,
                bgColor: 'bg-orange-500',
                lightBg: 'bg-orange-50',
                textColor: 'text-orange-600',
            },
            {
                label: 'Gross Profit (Sold Value)',
                value: `৳${Number(summary.total_sold_amount || 0).toLocaleString()}`,
                icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
                bgColor: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            },
            {
                label: 'Avg Revenue / Item',
                value: `৳${Number(summary.total_sold_amount / (summary.total_sold_qty || 1)).toFixed(2)}`,
                icon: <BarChart3 className="h-4 w-4 text-purple-600" />,
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
                key: 'product_name',
                label: 'Product Information',
                sortable: true,
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{value}</span>
                        <div className="mt-0.5 flex items-center gap-2">
                            <span className="rounded border bg-gray-50 px-1 font-mono text-[10px] text-gray-400">{row.sku}</span>
                            <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                <Layers className="h-2.5 w-2.5" /> {row.category}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                key: 'brand',
                label: 'Brand',
                render: (value: any) => (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Tag className="h-3.5 w-3.5 text-gray-400" />
                        {value || 'Unbranded'}
                    </div>
                ),
            },
            {
                key: 'sold_qty',
                label: 'Sold Qty',
                sortable: true,
                render: (value: any) => <span className="font-bold text-gray-900">{Number(value).toLocaleString()}</span>,
            },
            {
                key: 'sold_amount',
                label: 'Revenue Generated',
                sortable: true,
                render: (value: any) => <span className="font-bold text-emerald-600">৳{Number(value || 0).toLocaleString()}</span>,
            },
            {
                key: 'instock_qty',
                label: 'Availability',
                render: (value: any) => {
                    const stock = Number(value);
                    let colorClass = 'bg-blue-100 text-blue-800';
                    let label = 'In Stock';

                    if (stock === 0) {
                        colorClass = 'bg-red-100 text-red-800';
                        label = 'Out of Stock';
                    } else if (stock < 10) {
                        colorClass = 'bg-amber-100 text-amber-800';
                        label = 'Low Stock';
                    }

                    return (
                        <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>{label}</span>
                            <span className="flex items-center justify-center gap-1 text-[11px] font-medium text-gray-500">
                                <Boxes className="h-3 w-3" /> {stock}
                            </span>
                        </div>
                    );
                },
            },
        ],
        []
    );

    return (
        <ReportPageLayout
            title="Sold Items Report"
            description="List of all products and how many units were sold"
            icon={<BarChart3 className="h-6 w-6 text-white" />}
            iconBgClass="bg-gradient-to-r from-teal-500 to-emerald-600"
        >
            <ReportSummaryCard items={summaryItems} />

            <div className="mb-6">
                <BasicReportFilter onFilterChange={handleFilterChange} placeholder="Search product name, SKU, or category..." />
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
                emptyState={{
                    icon: <FileText className="mx-auto h-16 w-16 text-gray-300" />,
                    title: 'No Sales Data Found',
                    description: 'No items were sold matching your current filter criteria.',
                }}
            />
        </ReportPageLayout>
    );
};

export default SalesItemsReportPage;
