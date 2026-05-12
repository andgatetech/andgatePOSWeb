'use client';

import OrderFilter from '@/components/filters/OrderFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import Loader from '@/lib/Loader';
import { normalizePaymentStatus } from '@/lib/paymentConstants';
import { useGetAllOrdersQuery, useGetOrderReturnByIdQuery } from '@/store/features/Order/Order';
import { getTranslation } from '@/i18n';
import { ShoppingBag } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import PosInvoicePreview from '../pos/PosInvoicePreview';
import OrderDetailsModal from './components/OrderDetailsModal';
import OrderStats from './components/OrderStats';
import OrdersTable from './components/OrdersTable';

const Orders = () => {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore } = useCurrentStore();
    const currentUser = useSelector((state: RootState) => state.auth?.user);
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
    const { data: ordersData, isLoading } = useGetAllOrdersQuery(queryParams, { refetchOnMountOrArgChange: 30 });

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
            return normalizePaymentStatus(order.payment?.status ?? order.payment_status) === 'paid';
        }).length;
        const partialOrders = orders.filter((order: any) => {
            return normalizePaymentStatus(order.payment?.status ?? order.payment_status) === 'partial';
        }).length;
        const dueOrders = orders.filter((order: any) => {
            return normalizePaymentStatus(order.payment?.status ?? order.payment_status) === 'due';
        }).length;
        const pendingOrders = orders.filter((order: any) => {
            return normalizePaymentStatus(order.payment?.status ?? order.payment_status) === 'pending';
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

    // Handle thermal receipt print (direct print without modal)
    const handleThermalReceiptPrint = useCallback((order: any) => {
        setSelectedOrder(order);
        
        // Create HTML content optimized for Android thermal printers
        const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thermal Receipt</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            width: 100%;
            height: auto;
            margin: 0;
            padding: 0;
        }
        @page {
            size: 80mm auto;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.2;
            width: 80mm;
            margin: 0;
            padding: 4px;
            background: white;
            color: black;
            display: table;
        }
        .receipt-container {
            width: 100%;
            margin: 0;
            padding: 0;
            display: table;
        }
        .receipt-header {
            text-align: center;
            margin-bottom: 2px;
            border-bottom: 1px dashed black;
            padding-bottom: 2px;
        }
        .store-name {
            font-size: 13px;
            font-weight: bold;
            margin: 0px 0 1px 0;
            word-wrap: break-word;
            line-height: 1.2;
        }
        .store-info {
            font-size: 8px;
            margin: 0px 0;
            word-wrap: break-word;
            line-height: 1.1;
        }
        .receipt-title {
            font-size: 10px;
            font-weight: bold;
            margin-top: 1px;
            margin-bottom: 0;
        }
        .receipt-divider {
            border-top: 1px dashed black;
            margin: 1px 0;
            height: 0;
        }
        .receipt-section {
            margin: 1px 0;
            padding: 0;
        }
        .receipt-row {
            display: table;
            width: 100%;
            margin: 0px 0;
            font-size: 9px;
            word-wrap: break-word;
            line-height: 1.1;
        }
        .row-label {
            display: table-cell;
            width: 50%;
            text-align: left;
            padding-right: 4px;
            padding: 0px 4px 0px 0px;
        }
        .row-value {
            display: table-cell;
            width: 50%;
            text-align: right;
            font-weight: bold;
            padding: 0;
        }
        .items-section {
            margin: 1px 0;
            padding: 0;
        }
        .item-row {
            margin: 0px 0;
            font-size: 8px;
            word-wrap: break-word;
            padding: 0;
            line-height: 1.1;
        }
        .item-name {
            font-weight: bold;
            margin-bottom: 0px;
            line-height: 1.1;
        }
        .item-details {
            font-size: 7px;
            color: #333;
            line-height: 1;
        }
        .totals-section {
            border-top: 1px solid black;
            border-bottom: 1px solid black;
            margin: 1px 0;
            padding: 1px 0;
        }
        .total-row {
            display: table;
            width: 100%;
            margin: 0px 0;
            font-size: 10px;
            font-weight: bold;
            line-height: 1.1;
        }
        .total-label {
            display: table-cell;
            width: 50%;
            text-align: left;
            padding: 0px 4px 0px 0px;
        }
        .total-value {
            display: table-cell;
            width: 50%;
            text-align: right;
            padding: 0;
        }
        .footer {
            text-align: center;
            margin-top: 1px;
            padding-top: 1px;
            border-top: 1px dashed black;
            font-size: 8px;
            line-height: 1;
        }
        .footer-text {
            margin: 0px 0;
            line-height: 1;
        }
        @media print {
            body {
                margin: 0;
                padding: 4px;
            }
            .receipt-container {
                margin: 0;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="receipt-header">
            <div class="store-name">${currentStore?.store_name || 'andgatePOS'}</div>
            ${currentStore?.store_location ? `<div class="store-info">${currentStore.store_location}</div>` : ''}
            ${currentStore?.store_contact ? `<div class="store-info">Ph: ${currentStore.store_contact}</div>` : ''}
            ${currentStore?.store_email ? `<div class="store-info">${currentStore.store_email}</div>` : ''}
            <div class="receipt-title">RECEIPT</div>
        </div>

        <div class="receipt-section">
            <div class="receipt-row">
                <div class="row-label">Invoice No:</div>
                <div class="row-value">${order.invoice || `#${order.id}`}</div>
            </div>
            ${order.id ? `<div class="receipt-row">
                <div class="row-label">Order ID:</div>
                <div class="row-value">#${order.id}</div>
            </div>` : ''}
            <div class="receipt-row">
                <div class="row-label">Date:</div>
                <div class="row-value">${new Date().toLocaleDateString()}</div>
            </div>
            <div class="receipt-row">
                <div class="row-label">Cashier:</div>
                <div class="row-value">${currentUser?.name || 'Staff'}</div>
            </div>
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-section">
            <div class="receipt-row">
                <div class="row-label">Customer:</div>
                <div class="row-value">${order.is_walk_in ? 'Walk-in' : (order.customer?.name || 'N/A')}</div>
            </div>
            ${!order.is_walk_in && order.customer?.phone ? `<div class="receipt-row">
                <div class="row-label">Ph:</div>
                <div class="row-value">${order.customer.phone}</div>
            </div>` : ''}
        </div>

        <div class="receipt-divider"></div>

        <div class="items-section">
            ${(order.items || []).map((item: any) => {
                const itemName = item.snapshot?.product_name ?? item.product?.name ?? item.product_name ?? 'Unknown';
                const itemPrice = formatCurrency(item.unit_price || item.price);
                const itemQty = item.quantity;
                return `
                <div class="item-row">
                    <div class="item-name">${itemName}</div>
                    <div class="item-details">${itemQty}x${itemPrice}</div>
                    ${item.variant_name || item.variant?.name ? `<div class="item-details">Var: ${item.variant_name || item.variant?.name}</div>` : ''}
                </div>
                `;
            }).join('')}
        </div>

        <div class="receipt-divider"></div>

        <div class="totals-section">
            <div class="total-row">
                <div class="total-label">Subtotal:</div>
                <div class="total-value">${formatCurrency(order.financial?.subtotal ?? order.subtotal ?? order.total)}</div>
            </div>
            ${(order.financial?.tax ?? order.tax ?? 0) > 0 ? `<div class="total-row">
                <div class="total-label">Tax:</div>
                <div class="total-value">${formatCurrency(order.financial?.tax ?? order.tax ?? 0)}</div>
            </div>` : ''}
            ${(order.financial?.discount ?? order.discount ?? 0) > 0 ? `<div class="total-row">
                <div class="total-label">Discount:</div>
                <div class="total-value">-${formatCurrency(order.financial?.discount ?? order.discount ?? 0)}</div>
            </div>` : ''}
            <div class="total-row" style="border-top: 1px solid black; padding-top: 1px; margin-top: 1px;">
                <div class="total-label">TOTAL:</div>
                <div class="total-value">${formatCurrency(order.financial?.grand_total ?? order.grand_total ?? order.total)}</div>
            </div>
            ${(order.financial?.amount_paid ?? order.amount_paid ?? 0) > 0 ? `<div class="total-row">
                <div class="total-label">Paid:</div>
                <div class="total-value">${formatCurrency(order.financial?.amount_paid ?? order.amount_paid ?? 0)}</div>
            </div>` : ''}
            ${(order.financial?.due_amount ?? order.due_amount ?? 0) > 0 ? `<div class="total-row">
                <div class="total-label">Due:</div>
                <div class="total-value">${formatCurrency(order.financial?.due_amount ?? order.due_amount ?? 0)}</div>
            </div>` : ''}
        </div>

        <div class="footer">
            <div class="footer-text">Thank you!</div>
            <div class="footer-text">andgatePOS</div>
        </div>
    </div>
</body>
</html>
        `;

        // Isolated window print — single print() call, works with Bluetooth POS printers
        import('@/lib/printUtil').then(({ printInWindow }) => {
            printInWindow(receiptHTML);
        });
    }, [currentStore, currentUser, formatCurrency]);

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
        return <Loader message={t('order_loading')} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                        <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('order_page_title')}</h1>
                        <p className="text-sm text-gray-500">{t('order_page_desc')}</p>
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
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
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
                    onThermalReceiptPrint={handleThermalReceiptPrint}
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
                                        title: item.snapshot?.product_name ?? item.product?.name ?? item.product_name ?? t('lbl_unknown_product'),
                                        variantName: item.snapshot?.variant_data
                                            ? Object.entries(item.snapshot.variant_data)
                                                  .map(([k, v]) => `${k}: ${v}`)
                                                  .join(', ')
                                            : item.variant_name || item.variant?.name || item.variantName,
                                        quantity: item.quantity,
                                        unit: item.unit || t('lbl_pcs'),
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
    );
};

export default Orders;
