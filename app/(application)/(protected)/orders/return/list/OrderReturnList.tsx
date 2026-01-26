'use client';

import OrderReturnFilter from '@/components/filters/OrderReturnFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import Loader from '@/lib/Loader';
import { useGetAllOrderReturnsQuery } from '@/store/features/Order/Order';
import { RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import OrderReturnDetailsModal from './components/OrderReturnDetailsModal';
import OrderReturnStats from './components/OrderReturnStats';
import OrderReturnsTable from './components/OrderReturnsTable';

const OrderReturnList = () => {
    const { formatCurrency } = useCurrency();
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedReturn, setSelectedReturn] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Build query parameters
    const queryParams = useMemo(() => {
        const params: Record<string, any> = {
            page: currentPage,
            per_page: itemsPerPage,
            sort_field: sortField,
            sort_direction: sortDirection,
        };

        // Add filter params
        if (apiParams.store_id) params.store_id = apiParams.store_id;
        if (apiParams.store_ids) params.store_ids = apiParams.store_ids;
        if (apiParams.search) params.search = apiParams.search;
        if (apiParams.return_type) params.return_type = apiParams.return_type;
        if (apiParams.order_id) params.order_id = apiParams.order_id;
        if (apiParams.start_date) params.start_date = apiParams.start_date;
        if (apiParams.end_date) params.end_date = apiParams.end_date;

        // Default to current store if not explicitly provided
        if (!params.store_id && !params.store_ids && currentStoreId) {
            params.store_id = currentStoreId;
        }

        return params;
    }, [apiParams, currentStoreId, currentPage, itemsPerPage, sortField, sortDirection]);

    // Fetch order returns
    const { data: returnsData, isLoading } = useGetAllOrderReturnsQuery(queryParams);

    // Extract returns and pagination
    const returns = useMemo(() => {
        return returnsData?.data?.items || [];
    }, [returnsData]);

    const paginationMeta = useMemo(() => {
        return returnsData?.data?.pagination;
    }, [returnsData]);

    // Calculate stats
    const stats = useMemo(() => {
        const totalReturns = paginationMeta?.total || 0;
        const totalRefundAmount = returns.reduce((sum: number, ret: any) => {
            const netAmount = Number(ret.net_amount || 0);
            return netAmount < 0 ? sum + Math.abs(netAmount) : sum;
        }, 0);
        const totalExchangeAmount = returns.reduce((sum: number, ret: any) => {
            const netAmount = Number(ret.net_amount || 0);
            return netAmount > 0 ? sum + netAmount : sum;
        }, 0);
        const pureReturns = returns.filter((ret: any) => ret.return_type === 'return').length;
        const exchanges = returns.filter((ret: any) => ret.return_type === 'exchange').length;

        return { totalReturns, totalRefundAmount, totalExchangeAmount, pureReturns, exchanges };
    }, [returns, paginationMeta]);

    // Handle filter changes
    const handleFilterChange = useCallback((newApiParams: Record<string, any>) => {
        setApiParams(newApiParams);
        setCurrentPage(1);
    }, []);

    // Handle sorting
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

    // Handle pagination
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleItemsPerPageChange = useCallback((items: number) => {
        setItemsPerPage(items);
        setCurrentPage(1);
    }, []);

    // Handle view details
    const handleViewDetails = useCallback((orderReturn: any) => {
        setSelectedReturn(orderReturn);
        setIsDetailsModalOpen(true);
    }, []);

    // Reset page when store changes
    useEffect(() => {
        setCurrentPage(1);
        setApiParams({});
    }, [currentStoreId]);

    const totalPages = paginationMeta?.last_page || 1;
    const totalItems = paginationMeta?.total || 0;

    if (isLoading) {
        return <Loader message="Loading order returns..." />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-orange-700 shadow-md">
                                    <RotateCcw className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Order Returns Management</h1>
                                    <p className="text-sm text-gray-500">View and manage all order returns and exchanges</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <OrderReturnStats
                    totalReturns={stats.totalReturns}
                    totalRefundAmount={stats.totalRefundAmount}
                    totalExchangeAmount={stats.totalExchangeAmount}
                    pureReturns={stats.pureReturns}
                    exchanges={stats.exchanges}
                />

                {/* Filters */}
                <div className="mb-6">
                    <OrderReturnFilter onFilterChange={handleFilterChange} />
                </div>

                {/* Returns Table */}
                <OrderReturnsTable
                    returns={returns}
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        totalPages,
                        itemsPerPage,
                        totalItems,
                        onPageChange: handlePageChange,
                        onItemsPerPageChange: handleItemsPerPageChange,
                    }}
                    sorting={{
                        field: sortField,
                        direction: sortDirection,
                        onSort: handleSort,
                    }}
                    onViewDetails={handleViewDetails}
                />

                {/* Return Details Modal */}
                <OrderReturnDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} orderReturn={selectedReturn} />
            </div>
        </div>
    );
};

export default OrderReturnList;
