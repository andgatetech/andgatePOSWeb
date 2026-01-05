'use client';

import ReportPageLayout from '@/app/(application)/(protected)/reports/_shared/ReportPageLayout';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import AdjustmentReportFilter from '@/components/filters/reports/AdjustmentReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetStockAdjustmentReportMutation } from '@/store/features/reports/reportApi';
import { ArrowDown, ArrowDownUp, ArrowUp, Calendar, FileText, Hash, Info, Package, Store, TrendingUp, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const AdjustmentReportPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getStockAdjustmentReport, { data: reportData, isLoading }] = useGetStockAdjustmentReportMutation();

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
            getStockAdjustmentReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const adjustments = useMemo(() => reportData?.data?.adjustments || [], [reportData]);
    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const byDirection = useMemo(() => reportData?.data?.by_direction || [], [reportData]);
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
                label: 'Adjustment Events',
                value: summary.total_adjustments || 0,
                icon: <ArrowDownUp className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Gross Increase',
                value: `+${Number(summary.total_increase_quantity || 0).toLocaleString()}`,
                icon: <ArrowUp className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: 'Gross Decrease',
                value: `-${Number(summary.total_decrease_quantity || 0).toLocaleString()}`,
                icon: <ArrowDown className="h-4 w-4 text-red-600" />,
                bgColor: 'bg-red-500',
                lightBg: 'bg-red-50',
                textColor: 'text-red-600',
            },
            {
                label: 'Summary',
                value: `${summary.net_change >= 0 ? '+' : ''}${Number(summary.net_change || 0).toLocaleString()}`,
                icon: <TrendingUp className="h-4 w-4 text-purple-600" />,
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
                key: 'reference_no',
                label: 'Ref ID',
                render: (value: any) => (
                    <div className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-mono text-xs font-bold text-gray-600">{value}</span>
                    </div>
                ),
            },
            {
                key: 'product_name',
                label: 'Product',
                sortable: true,
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-bold text-gray-900">
                            <Package className="h-3.5 w-3.5 text-gray-400" />
                            {value}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                            <span className="rounded border bg-gray-50 px-1 font-mono text-[10px] text-gray-400">{row.sku}</span>
                            <span className="flex items-center gap-1 text-[10px] italic text-gray-400">
                                <Store className="h-2.5 w-2.5" /> {row.store_name}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                key: 'adjustment_quantity',
                label: 'Stock Change',
                sortable: true,
                render: (value: any, row: any) => {
                    const isIncrease = row.direction?.toLowerCase() === 'increase';
                    return (
                        <div className="flex flex-col">
                            <div className={`flex items-center gap-1 font-bold ${isIncrease ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {isIncrease ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                                {Number(value).toLocaleString()}
                            </div>
                            <span className="text-[10px] text-gray-400">
                                {row.previous_stock} → {row.adjusted_stock}
                            </span>
                        </div>
                    );
                },
            },
            {
                key: 'reason',
                label: 'Reason',
                render: (value: any, row: any) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-sm font-medium capitalize text-gray-700">
                            <Info className="h-3.5 w-3.5 text-gray-400" />
                            {value || 'N/A'}
                        </div>
                        {row.notes && <span className="max-w-[150px] truncate pl-5 text-[10px] italic text-gray-400">{row.notes}</span>}
                    </div>
                ),
            },
            {
                key: 'adjusted_by_name',
                label: 'Adjusted By',
                render: (value: any) => (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        {value}
                    </div>
                ),
            },
            {
                key: 'adjusted_at',
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
            title="Stock Adjustment Report"
            description="Log of manual stock changes and corrections"
            icon={<ArrowDownUp className="h-6 w-6 text-white" />}
            iconBgClass="bg-gradient-to-r from-slate-600 to-zinc-700"
        >
            <ReportSummaryCard items={summaryItems} />

            <div className="mb-6">
                <AdjustmentReportFilter onFilterChange={handleFilterChange} />
            </div>

            <ReusableTable
                data={adjustments}
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
                    title: 'No Adjustments Recorded',
                    description: 'No stock correction logs found in the selected audit period.',
                }}
            />
        </ReportPageLayout>
    );
};

export default AdjustmentReportPage;
