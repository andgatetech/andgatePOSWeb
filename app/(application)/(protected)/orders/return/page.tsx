'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import Loader from '@/lib/Loader';
import { RootState } from '@/store';
import { useGetOrderByIdQuery } from '@/store/features/Order/Order';
import { clearReturnSession, initReturnSession, selectOrderReturnSession } from '@/store/features/Order/OrderReturnSlice';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PosLeftSide from '../../pos/PosLeftSide';
import PosRightSide from '../../pos/PosRightSide';

const OrderReturnPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const { currentStoreId } = useCurrentStore();

    // Get return session from Redux
    const returnSession = useSelector((state: RootState) => (currentStoreId ? selectOrderReturnSession(currentStoreId)(state) : null));

    // Priority: URL Param > Redux State
    const urlOrderId = searchParams.get('orderId');
    const orderId = urlOrderId ? parseInt(urlOrderId) : returnSession?.orderId;

    const [isLoadingOrder, setIsLoadingOrder] = useState(true);

    // Redirect if no order ID found at all OR if session is cleared but URL has orderId
    useEffect(() => {
        if (currentStoreId && !orderId) {
            router.push('/orders');
        }
        // If URL has orderId but no session exists, redirect (means return was completed)
        if (currentStoreId && urlOrderId && !returnSession) {
            router.push('/orders');
        }
    }, [orderId, urlOrderId, returnSession, router, currentStoreId]);

    // Fetch order data - skip if returnSession is already cleared (after successful return)
    const {
        data: orderData,
        isLoading,
        error,
    } = useGetOrderByIdQuery(orderId!, {
        skip: !orderId || !returnSession || (urlOrderId && !returnSession),
    });

    // Initialize return session when order is loaded
    useEffect(() => {
        if (orderData?.success && orderData?.data && currentStoreId) {
            const order = orderData.data;

            // Initialize return session with complete order data
            dispatch(
                initReturnSession({
                    storeId: currentStoreId,
                    orderId: order.id,
                    order: order,
                })
            );

            setIsLoadingOrder(false);
        } else if (orderData && !orderData.success) {
            // Order not found or deleted
            setIsLoadingOrder(false);
        }
    }, [orderData, dispatch, currentStoreId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (currentStoreId) {
                dispatch(clearReturnSession(currentStoreId));
            }
        };
    }, [dispatch, currentStoreId]);

    if (!orderId) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader message="Initializing Return..." />
            </div>
        );
    }

    if (isLoading || isLoadingOrder) {
        return <Loader message="Loading Order for Return..." />;
    }

    if (error || !orderData?.success || !orderData?.data) {
        // Check if it's a 404 or order not found error
        const isOrderNotFound = error && 'status' in error && error.status === 404;
        const errorMessage =
            error && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
                ? String(error.data.message)
                : isOrderNotFound
                ? 'This order no longer exists or has been fully returned'
                : 'Failed to load order';

        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="rounded-lg bg-white p-8 text-center shadow-lg">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">Order Not Available</h1>
                    <p className="mb-6 text-gray-600">{errorMessage}</p>
                    <Link href="/orders" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const order = orderData.data;

    // Check if order has any returnable items
    const hasReturnableItems = order?.items?.some((item: any) => item.returnable_quantity > 0);

    if (!hasReturnableItems) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="rounded-lg bg-white p-8 text-center shadow-lg">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                        <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">No Items Available for Return</h1>
                    <p className="mb-2 text-gray-600">This order has been fully returned.</p>
                    <p className="mb-6 text-sm text-gray-500">Invoice: {order.invoice}</p>
                    <Link href="/orders" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white shadow-sm">
                <div className="mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/orders" className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Order Return / Exchange</h1>
                                <p className="text-sm text-gray-600">
                                    Invoice: <span className="font-semibold">{order.invoice}</span> | Customer:{' '}
                                    <span className="font-semibold">{order.is_walk_in ? 'Walk-in' : order.customer?.name || 'N/A'}</span> | Payment:{' '}
                                    <span className="font-semibold capitalize">{order.payment?.payment_method || 'N/A'}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-1.5 text-amber-800">
                            <span className="text-sm font-medium">Return Mode</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* POS Layout */}
            <div>
                <PosLeftSide
                    mobileButtonConfig={{
                        showIcon: null,
                        hideIcon: null,
                        label: 'Products (Exchange)',
                    }}
                    reduxSlice="orderReturn"
                >
                    <PosRightSide mode="return" reduxSlice="orderReturn" orderId={orderId} originalOrder={order} />
                </PosLeftSide>
            </div>
        </div>
    );
};

export default OrderReturnPage;
