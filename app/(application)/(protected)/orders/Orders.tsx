'use client';

import OrderFilter from '@/components/filters/OrderFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import Loader from '@/lib/Loader';
import { useGetAllOrdersQuery, useGetOrderReturnByIdQuery } from '@/store/features/Order/Order';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PosInvoicePreview from '../pos/PosInvoicePreview';
import OrderDetailsModal from './components/OrderDetailsModal';
import OrderStats from './components/OrderStats';
import OrdersTable from './components/OrdersTable';

const Orders = () => {
    const { currentStoreId } = useCurrentStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [showReturnInvoice, setShowReturnInvoice] = useState(false);
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);

    // Check if we should show return invoice
    const returnId = searchParams.get('showReturn');

    // Fetch return details if returnId is present
    const { data: returnData } = useGetOrderReturnByIdQuery(returnId ? parseInt(returnId) : 0, { skip: !returnId });

    // Show return invoice when data is loaded
    useEffect(() => {
        if (returnData?.success && returnData?.data) {
            setShowReturnInvoice(true);
        }
    }, [returnData]);

    // Close return invoice and clear URL parameter
    const handleCloseReturnInvoice = useCallback(() => {
        setShowReturnInvoice(false);
        router.push('/orders');
    }, [router]);

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
        if (apiParams.payment_status) params.payment_status = apiParams.payment_status;
        if (apiParams.payment_method) params.payment_method = apiParams.payment_method;
        if (apiParams.customer_id) params.customer_id = apiParams.customer_id;
        if (apiParams.start_date) params.start_date = apiParams.start_date;
        if (apiParams.end_date) params.end_date = apiParams.end_date;

        // Default to current store if not explicitly provided
        if (!params.store_id && !params.store_ids && currentStoreId) {
            params.store_id = currentStoreId;
        }

        return params;
    }, [apiParams, currentStoreId, currentPage, itemsPerPage, sortField, sortDirection]);

    // Fetch orders
    const { data: ordersData, isLoading } = useGetAllOrdersQuery(queryParams, { refetchOnMountOrArgChange: true });

    // Extract orders and pagination
    const orders = useMemo(() => {
        return ordersData?.data?.items || [];
    }, [ordersData]);

    const paginationMeta = useMemo(() => {
        return ordersData?.data?.pagination;
    }, [ordersData]);

    // Calculate stats
    const stats = useMemo(() => {
        const totalOrders = paginationMeta?.total || 0;
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + Number(order.financial?.grand_total ?? order.grand_total ?? 0), 0);
        const paidOrders = orders.filter((order: any) => {
            const paymentStatus = order.payment?.status ?? order.payment_status;
            return paymentStatus === 'paid' || paymentStatus === 'completed';
        }).length;
        const partialOrders = orders.filter((order: any) => {
            const paymentStatus = order.payment?.status ?? order.payment_status;
            return paymentStatus === 'partial';
        }).length;
        const dueOrders = orders.filter((order: any) => {
            const paymentStatus = order.payment?.status ?? order.payment_status;
            return paymentStatus === 'due' || paymentStatus === 'unpaid';
        }).length;
        const pendingOrders = orders.filter((order: any) => {
            const paymentStatus = order.payment?.status ?? order.payment_status;
            return paymentStatus === 'pending';
        }).length;

        return { totalOrders, totalRevenue, paidOrders, partialOrders, dueOrders, pendingOrders };
    }, [orders, paginationMeta]);

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
    const handleViewDetails = useCallback((order: any) => {
        setSelectedOrder(order);
        setIsDetailsModalOpen(true);
    }, []);

    // Handle opening invoice preview (for download/print)
    const handleOpenInvoicePreview = useCallback((order: any) => {
        setSelectedOrder(order);
        setShowInvoicePreview(true);
    }, []);

    // Close invoice preview
    const handleCloseInvoicePreview = useCallback(() => {
        setShowInvoicePreview(false);
    }, []);

    // Reset page when store changes
    useEffect(() => {
        setCurrentPage(1);
        setApiParams({});
    }, [currentStoreId]);

    const totalPages = paginationMeta?.last_page || 1;

    const totalItems = paginationMeta?.total || 0;

    if (isLoading) {
        return <Loader message="Loading orders..." />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
                                    <p className="text-sm text-gray-500">View and manage all your orders</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <OrderStats
                    totalOrders={stats.totalOrders}
                    totalRevenue={stats.totalRevenue}
                    paidOrders={stats.paidOrders}
                    partialOrders={stats.partialOrders}
                    dueOrders={stats.dueOrders}
                    pendingOrders={stats.pendingOrders}
                />

                {/* Filters */}
                <div className="mb-6">
                    <OrderFilter onFilterChange={handleFilterChange} />
                </div>

                {/* Orders Table */}
                <OrdersTable
                    orders={orders}
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
                    onOpenInvoicePreview={handleOpenInvoicePreview}
                />

                {/* Order Details Modal */}
                <OrderDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} order={selectedOrder} />

                {/* Order Invoice Preview Modal */}
                {showInvoicePreview && selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white">
                            <PosInvoicePreview
                                data={{
                                    customer: selectedOrder.customer || {},
                                    items: (selectedOrder.items || []).map((item: any) => ({
                                        id: item.id,
                                        title: item.snapshot?.product_name ?? item.product?.name ?? item.product_name ?? 'Unknown Product',
                                        variantName: item.snapshot?.variant_data
                                            ? Object.entries(item.snapshot.variant_data)
                                                  .map(([k, v]) => `${k}: ${v}`)
                                                  .join(', ')
                                            : item.variant_name || item.variant?.name || item.variantName,
                                        quantity: item.quantity,
                                        unit: item.unit || 'Pcs',
                                        price: item.unit_price || item.price,
                                        amount: item.subtotal || item.amount || item.total,
                                        tax_rate: item.tax_rate,
                                        serials: item.serials,
                                        warranty: item.warranty,
                                    })),
                                    totals: {
                                        subtotal: selectedOrder.financial?.subtotal ?? selectedOrder.subtotal ?? selectedOrder.total,
                                        tax: selectedOrder.financial?.tax ?? selectedOrder.tax ?? 0,
                                        discount: selectedOrder.financial?.discount ?? selectedOrder.discount ?? 0,
                                        grand_total: selectedOrder.financial?.grand_total ?? selectedOrder.grand_total ?? selectedOrder.total,
                                    },
                                    invoice: selectedOrder.invoice,
                                    order_id: selectedOrder.id,
                                    isOrderCreated: false,
                                    payment_status: selectedOrder.payment?.status ?? selectedOrder.payment_status,
                                    payment_method: selectedOrder.payment?.method ?? selectedOrder.payment_method,
                                    amount_paid: selectedOrder.financial?.amount_paid ?? selectedOrder.amount_paid,
                                    due_amount: selectedOrder.financial?.due_amount ?? selectedOrder.due_amount,
                                }}
                                storeId={currentStoreId ?? undefined}
                                onClose={handleCloseInvoicePreview}
                            />
                        </div>
                    </div>
                )}

                {/* Return Invoice Preview Modal */}
                {showReturnInvoice && returnData?.data && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white">
                            <PosInvoicePreview
                                data={{
                                    ...returnData.data,
                                    isReturn: true,
                                    isOrderCreated: true,
                                }}
                                storeId={currentStoreId ?? undefined}
                                onClose={handleCloseReturnInvoice}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
