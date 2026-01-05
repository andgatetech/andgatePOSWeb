'use client';

import ReportPageLayout from '@/app/(application)/(protected)/reports/_shared/ReportPageLayout';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import IdleProductReportFilter from '@/components/filters/reports/IdleProductReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetIdleProductReportMutation } from '@/store/features/reports/reportApi';
import { AlertTriangle, Banknote, BarChart3, Box, Calendar, Clock, FileText, Package, Store, Tag, Timer } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const IdleProductReportPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({ idle_days: 30 });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('days_idle');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getIdleProductReport, { data: reportData, isLoading }] = useGetIdleProductReportMutation();

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
            getIdleProductReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const products = useMemo(() => reportData?.data?.products || [], [reportData]);
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
                label: 'Idle SKUs',
                value: summary.total_idle_items || 0,
                icon: <Package className="h-4 w-4 text-orange-600" />,
                bgColor: 'bg-orange-500',
                lightBg: 'bg-orange-50',
                textColor: 'text-orange-600',
            },
            {
                label: 'Aging Threshold',
                value: `${summary.idle_days_threshold || 0} Days`,
                icon: <Clock className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Trapped Capital',
                value: `৳${Number(summary.total_idle_value || 0).toLocaleString()}`,
                icon: <Banknote className="h-4 w-4 text-rose-600" />,
                bgColor: 'bg-rose-500',
                lightBg: 'bg-rose-50',
                textColor: 'text-rose-600',
            },
            {
                label: 'Analysis Cutoff',
                value: summary.cutoff_date ? new Date(summary.cutoff_date).toLocaleDateString('en-GB') : 'N/A',
                icon: <Calendar className="h-4 w-4 text-purple-600" />,
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
                label: 'Aging Inventory',
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
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">{value || 'Uncategorized'}</span>
                        <div className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-tight text-gray-400">
                            <Store className="h-2.5 w-2.5" /> {row.store_name}
                        </div>
                    </div>
                ),
            },
            {
                key: 'brand',
                label: 'Brand',
                render: (value: any) => <span className="text-sm font-medium text-gray-700">{value || 'Unbranded'}</span>,
            },
            {
                key: 'quantity',
                label: 'Current Stock',
                sortable: true,
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{Number(value).toLocaleString()} Units</span>
                        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-rose-600">Value: ৳{Number(row.stock_value || 0).toLocaleString()}</span>
                    </div>
                ),
            },
            {
                key: 'last_sold_at',
                label: 'Last Sale Date',
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <div className={`flex items-center gap-1.5 text-sm font-bold ${value ? 'text-amber-700' : 'text-rose-700'}`}>
                            {value ? (
                                <>
                                    <BarChart3 className="h-3.5 w-3.5" />
                                    {new Date(value).toLocaleDateString('en-GB')}
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Never Sold
                                </>
                            )}
                        </div>
                        <span className="mt-1 pl-5 text-[10px] text-gray-400">Purchased: {row.purchase_date ? new Date(row.purchase_date).toLocaleDateString('en-GB') : 'Unknown'}</span>
                    </div>
                ),
            },
            {
                key: 'days_idle',
                label: 'Days Since Last Sale',
                sortable: true,
                render: (value: any) => {
                    const days = Number(value);
                    let intensity = 'bg-amber-100 text-amber-700 border-amber-200';
                    if (days > 180) intensity = 'bg-rose-100 text-rose-700 border-rose-200';
                    else if (days > 90) intensity = 'bg-orange-100 text-orange-700 border-orange-200';

                    return (
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${intensity}`}>
                            <Timer className="h-3 w-3" />
                            {days} Days
                        </span>
                    );
                },
            },
        ],
        []
    );

    return (
        <ReportPageLayout
            title="Slow Moving Items"
            description="Tracking products that have not been sold recently"
            icon={<Clock className="h-6 w-6 text-white" />}
            iconBgClass="bg-gradient-to-r from-amber-600 to-orange-700"
        >
            <ReportSummaryCard items={summaryItems} />

            <div className="mb-6">
                <IdleProductReportFilter onFilterChange={handleFilterChange} />
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
                    title: 'Portfolio Currently Active',
                    description: 'No dormant products found based on your current aging criteria.',
                }}
            />
        </ReportPageLayout>
    );
};

export default IdleProductReportPage;
