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

    // Redirect if no order ID found at all
    useEffect(() => {
        if (currentStoreId && !orderId) {
            router.push('/orders');
        }
    }, [orderId, router, currentStoreId]);

    // Fetch order data
    const {
        data: orderData,
        isLoading,
        error,
    } = useGetOrderByIdQuery(orderId!, {
        skip: !orderId,
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
