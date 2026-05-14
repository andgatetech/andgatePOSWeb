'use client';

import Loader from '@/lib/Loader';
import { useGetOrderByIdQuery, useUpdateOrderMutation } from '@/store/features/Order/Order';
import { clearItemsRedux, setItemsRedux, setOrderData } from '@/store/features/Order/OrderEditSlice';
import { ArrowLeft, Loader2, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import PosLeftSide from '../../../pos/PosLeftSide';
import OrderEditRightSide from './components/OrderEditRightSide';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { unwrapApiData } from '@/lib/api-response';

const OrderEditPage = () => {
    const { t } = getTranslation();
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch();
    const { currentStoreId } = useCurrentStore();
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
    const order = unwrapApiData(orderData, ['order']);

    // Load order data into Redux when fetched
    useEffect(() => {
        if (order && currentStoreId) {
            // Store original order data
            dispatch(setOrderData({ storeId: currentStoreId, orderId: order.id, order }));

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
                        description: item.sku || '',
                        sku: item.sku || '',
                        barcode: item.barcode || null,
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

            dispatch(setItemsRedux({ storeId: currentStoreId, items: transformedItems }));
            setIsLoadingOrder(false);
        }
    }, [order, dispatch, currentStoreId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (currentStoreId) {
                dispatch(clearItemsRedux(currentStoreId));
            }
        };
    }, [dispatch, currentStoreId]);

    if (!orderId) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">{t('msg_invalid_order_id')}</h1>
                    <Link href="/orders" className="mt-4 inline-block text-blue-600 hover:underline">
                        {t('btn_back_to_orders')}
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading || isLoadingOrder) {
        return <Loader message={t('order_loading')} />;
    }

    if (error || !orderData?.success) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">{t('msg_failed_load_order')}</h1>
                    <p className="mt-2 text-gray-600">{t('msg_try_again_later')}</p>
                    <Link href="/orders" className="mt-4 inline-block rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90">
                        {t('btn_back_to_orders')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-transparent">
                <div className="mx-auto  px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/orders" className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                                <Pencil className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{t('order_action_edit')}</h1>
                                <p className="text-sm text-gray-500">
                                    {t('lbl_invoice')}: <span className="font-semibold">{order.invoice}</span> | {t('lbl_customer')}:{' '}
                                    <span className="font-semibold">{order.is_walk_in ? t('order_walk_in') : order.customer?.name || t('lbl_na')}</span>
                                </p>
                            </div>
                        </div>
                        {isUpdating && (
                            <div className="flex items-center gap-2 text-blue-600">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm font-medium">{t('btn_updating')}</span>
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
                        label: t('product_title'),
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
