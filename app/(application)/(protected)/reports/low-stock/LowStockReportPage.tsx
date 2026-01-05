'use client';

import ReportPageLayout from '@/app/(application)/(protected)/reports/_shared/ReportPageLayout';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetLowStockReportMutation } from '@/store/features/reports/reportApi';
import { AlertCircle, AlertTriangle, Box, FileText, Package, Tag, TrendingDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const LowStockReportPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('quantity');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const [getLowStockReport, { data: reportData, isLoading }] = useGetLowStockReportMutation();

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
            getLowStockReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const stocks = useMemo(() => reportData?.data?.stocks || [], [reportData]);
    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const byCategory = useMemo(() => reportData?.data?.by_category || [], [reportData]);
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
                label: 'Stock Alert Items',
                value: summary.total_low_stock_items || 0,
                icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
                bgColor: 'bg-orange-500',
                lightBg: 'bg-orange-50',
                textColor: 'text-orange-600',
            },
            {
                label: 'Stock Outs',
                value: summary.out_of_stock_items || 0,
                icon: <AlertCircle className="h-4 w-4 text-rose-600" />,
                bgColor: 'bg-rose-500',
                lightBg: 'bg-rose-50',
                textColor: 'text-rose-600',
            },
            {
                label: 'Critical Threshold',
                value: summary.critical_stock_items || 0,
                icon: <TrendingDown className="h-4 w-4 text-amber-600" />,
                bgColor: 'bg-amber-500',
                lightBg: 'bg-amber-50',
                textColor: 'text-amber-600',
            },
            {
                label: 'Total Items',
                value: summary.total_items_tracked || 0,
                icon: <Package className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
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
                key: 'stock_percentage',
                label: 'Stock Status',
                sortable: true,
                render: (value: any, row: any) => {
                    const percentage = Number(value);
                    const isOut = row.is_out_of_stock;
                    let textColor = 'text-orange-700';

                    if (isOut || percentage <= 0) {
                        textColor = 'text-rose-700';
                    } else if (percentage <= 20) {
                        textColor = 'text-red-700';
                    }

                    return (
                        <div className="flex flex-col gap-1">
                            <span className={`text-xs font-black uppercase tracking-wider ${textColor}`}>{isOut ? 'OUT OF STOCK' : `${percentage.toFixed(0)}% LEVEL`}</span>
                            <span className="text-[10px] text-gray-400">
                                {row.quantity} / {row.low_stock_quantity}
                            </span>
                        </div>
                    );
                },
            },
            {
                key: 'urgency',
                label: 'Urgency',
                render: (value: any) => {
                    const urgency = value?.toLowerCase();
                    const config: Record<string, { bg: string; text: string; icon: any }> = {
                        high: { bg: 'bg-rose-100 border-rose-200', text: 'text-rose-700', icon: AlertCircle },
                        medium: { bg: 'bg-orange-100 border-orange-200', text: 'text-orange-700', icon: AlertTriangle },
                        low: { bg: 'bg-amber-100 border-amber-200', text: 'text-amber-700', icon: Tag },
                    };
                    const { bg, text, icon: Icon } = config[urgency] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: Tag };

                    return (
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${bg} ${text}`}>
                            <Icon className="h-3 w-3" />
                            {value}
                        </span>
                    );
                },
            },
            {
                key: 'restock_cost',
                label: 'Estimated Cost',
                sortable: true,
                render: (value: any, row: any) => (
                    <div className="flex flex-col text-right">
                        <span className="font-bold text-gray-900">৳{Number(value || 0).toLocaleString()}</span>
                        <span className="text-[10px] font-medium text-gray-400">Need {row.quantity_needed} Units</span>
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <ReportPageLayout
            title="Low Stock Report"
            description="List of products that are running low and need restocking"
            icon={<AlertTriangle className="h-6 w-6 text-white" />}
            iconBgClass="bg-gradient-to-r from-orange-600 to-amber-700"
        >
            <ReportSummaryCard items={summaryItems} />

            <div className="mb-6">
                <BasicReportFilter onFilterChange={handleFilterChange} placeholder="Search product name, SKU..." />
            </div>

            <ReusableTable
                data={stocks}
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
                    title: 'Inventory Healthy',
                    description: 'Excellent! All products are currently above their minimum safety levels.',
                }}
            />
        </ReportPageLayout>
    );
};

export default LowStockReportPage;
