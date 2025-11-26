'use client';

import { useGetOrderByIdQuery, useUpdateOrderMutation } from '@/store/features/Order/Order';
import { clearItemsRedux, setItemsRedux, setOrderData } from '@/store/features/Order/OrderEditSlice';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import PosLeftSide from '../../../pos/PosLeftSide';
import OrderEditRightSide from './components/OrderEditRightSide';

const OrderEditPage = () => {
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch();
    const orderId = params?.id ? parseInt(params.id as string) : null;

    const [isLoadingOrder, setIsLoadingOrder] = useState(true);

    // Fetch order data
    const {
        data: orderData,
        isLoading,
        error,
    } = useGetOrderByIdQuery(orderId!, {
        skip: !orderId,
    });

    const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();

    // Load order data into Redux when fetched
    useEffect(() => {
        if (orderData?.success && orderData?.data) {
            const order = orderData.data;

            // Store original order data
            dispatch(setOrderData({ orderId: order.id, order }));

            // Transform order items to match Item interface
            // Single order API has nested product object: item.product.id, item.product.name, etc.
            const transformedItems =
                order.items?.map((item: any, index: number) => {
                    const productId = item.product?.id || item.product_id;
                    // Use negative IDs for UI, but store original item.id for update action
                    const uniqueId = -(index + 1);

                    return {
                        id: uniqueId,
                        orderItemId: item.id, // Store original order_item ID for backend
                        productId: productId,
                        stockId: item.product_stock_id || undefined,
                        title: item.product?.name || item.product_name,
                        description: item.product?.sku || item.sku,
                        sku: item.product?.sku || item.sku,
                        rate: parseFloat(item.unit_price),
                        regularPrice: parseFloat(item.unit_price),
                        wholesalePrice: parseFloat(item.unit_price),
                        quantity: item.quantity,
                        amount: parseFloat(item.subtotal),
                        unit: item.unit || 'Piece',
                        tax_rate: parseFloat(item.tax || 0),
                        tax_included: item.tax_included || false,
                        discount: parseFloat(item.discount || 0),
                        PlaceholderQuantity: item.quantity + 100,
                        isWholesale: false,
                        // Additional fields
                        variantName: null,
                        variantData: null,
                        has_serial: false,
                        serials: [],
                        has_warranty: false,
                        warranty: null,
                        // Track if this is from original order
                        isOriginalItem: true,
                    };
                }) || [];

            dispatch(setItemsRedux(transformedItems));
            setIsLoadingOrder(false);
        }
    }, [orderData, dispatch]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(clearItemsRedux());
        };
    }, [dispatch]);

    if (!orderId) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Invalid Order ID</h1>
                    <Link href="/orders" className="mt-4 inline-block text-blue-600 hover:underline">
                        ← Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading || isLoadingOrder) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="text-center">
                    {/* Modern Spinner */}
                    <div className="relative mx-auto mb-8 h-20 w-20">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary"></div>
                    </div>

                    {/* Loading Text */}
                    <h3 className="text-lg font-semibold text-gray-700">Order Loading ...</h3>
                </div>
            </div>
        );
    }

    if (error || !orderData?.success) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Failed to load order</h1>
                    <p className="mt-2 text-gray-600">Please try again later</p>
                    <Link href="/orders" className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
                        ← Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const order = orderData.data;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white shadow-sm">
                <div className="mx-auto  px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/orders" className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Edit Order</h1>
                                <p className="text-sm text-gray-600">
                                    Invoice: <span className="font-semibold">{order.invoice}</span> | Customer:{' '}
                                    <span className="font-semibold">{order.is_walk_in ? 'Walk-in' : order.customer?.name || 'N/A'}</span>
                                </p>
                            </div>
                        </div>
                        {isUpdating && (
                            <div className="flex items-center gap-2 text-blue-600">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm font-medium">Updating...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* POS Layout */}
            <div>
                {/* Left Side - Product Selection */}

                <PosLeftSide
                    mobileButtonConfig={{
                        showIcon: null,
                        hideIcon: null,
                        label: 'Products',
                    }}
                    reduxSlice="orderEdit"
                >
                    {/* Right Side - Order Summary & Update */}

                    <OrderEditRightSide orderId={orderId} originalOrder={order} />
                </PosLeftSide>
            </div>
        </div>
    );
};

export default OrderEditPage;
