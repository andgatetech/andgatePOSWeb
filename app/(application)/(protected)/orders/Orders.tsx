'use client';

import OrderFilter from '@/components/filters/OrderFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import Loader from '@/lib/Loader';
import { normalizePaymentStatus } from '@/lib/paymentConstants';
import { escapePrintHtml, printInWindow } from '@/lib/printUtil';
import { useGetAllOrdersQuery, useDeleteOrderMutation } from '@/store/features/Order/Order';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { getTranslation } from '@/i18n';
import { ShoppingBag, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
    const router = useRouter();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);
    
    // Delete state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<any>(null);
    const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

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

    // Handle delete request
    const handleDeleteRequest = useCallback((order: any) => {
        setOrderToDelete(order);
        setIsDeleteModalOpen(true);
    }, []);

    // Confirm delete
    const handleConfirmDelete = async () => {
        if (!orderToDelete || !currentStoreId) return;

        try {
            await deleteOrder({ id: orderToDelete.id, store_id: currentStoreId }).unwrap();
            showSuccessDialog(t('order_void_success') || 'Order voided successfully');
            setIsDeleteModalOpen(false);
            setOrderToDelete(null);
            // Re-fetch to update stats, though RTK Query handles cache invalidation
        } catch (error: any) {
            console.error('Failed to void order:', error);
            showErrorDialog(error?.data?.message || t('order_void_error') || 'Failed to void order');
        }
    };

    // Handle thermal receipt print (direct print without modal)
    const handleThermalReceiptPrint = useCallback((order: any) => {
        setSelectedOrder(order);
        const esc = escapePrintHtml;
        
        // Create HTML content optimized for Android thermal printers
        const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(t('thermal_receipt_title'))}</title>
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
            height: auto;
            min-height: 0;
            margin: 0;
            padding: 4px;
            background: white;
            color: black;
            display: block;
            overflow: visible;
        }
        .receipt-container {
            width: 100%;
            height: auto;
            min-height: 0;
            margin: 0;
            padding: 0;
            display: block;
            page-break-after: avoid;
            break-after: avoid;
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
                height: auto;
                min-height: 0;
            }
            .receipt-container {
                margin: 0;
                padding: 0;
                page-break-after: avoid;
                break-after: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="receipt-header">
            <div class="store-name">${esc(currentStore?.store_name || 'AndgateBOS')}</div>
            ${currentStore?.store_location ? `<div class="store-info">${esc(currentStore.store_location)}</div>` : ''}
            ${currentStore?.store_contact ? `<div class="store-info">Ph: ${esc(currentStore.store_contact)}</div>` : ''}
            ${currentStore?.store_email ? `<div class="store-info">${esc(currentStore.store_email)}</div>` : ''}
            <div class="receipt-title">${esc(t('receipt_title'))}</div>
        </div>

        <div class="receipt-section">
            <div class="receipt-row">
                <div class="row-label">${esc(t('receipt_invoice_no'))}:</div>
                <div class="row-value">${esc(order.invoice || `#${order.id}`)}</div>
            </div>
            ${order.id ? `<div class="receipt-row">
                <div class="row-label">${esc(t('receipt_order_id'))}:</div>
                <div class="row-value">#${esc(order.id)}</div>
            </div>` : ''}
            <div class="receipt-row">
                <div class="row-label">${esc(t('lbl_date'))}:</div>
                <div class="row-value">${esc(new Date().toLocaleDateString())}</div>
            </div>
            <div class="receipt-row">
                <div class="row-label">${esc(t('receipt_cashier'))}:</div>
                <div class="row-value">${esc(currentUser?.name || 'Staff')}</div>
            </div>
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-section">
            <div class="receipt-row">
                <div class="row-label">${esc(t('lbl_customer'))}:</div>
                <div class="row-value">${esc(order.is_walk_in ? 'Walk-in' : (order.customer?.name || 'N/A'))}</div>
            </div>
            ${!order.is_walk_in && order.customer?.phone ? `<div class="receipt-row">
                <div class="row-label">${esc(t('lbl_phone'))}:</div>
                <div class="row-value">${esc(order.customer.phone)}</div>
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
                    <div class="item-name">${esc(itemName)}</div>
                    <div class="item-details">${esc(itemQty)}x${esc(itemPrice)}</div>
                    ${item.variant_name || item.variant?.name ? `<div class="item-details">Var: ${esc(item.variant_name || item.variant?.name)}</div>` : ''}
                </div>
                `;
            }).join('')}
        </div>

        <div class="receipt-divider"></div>

        <div class="totals-section">
            <div class="total-row">
                <div class="total-label">${esc(t('lbl_subtotal'))}:</div>
                <div class="total-value">${esc(formatCurrency(order.financial?.subtotal ?? order.subtotal ?? order.total))}</div>
            </div>
            ${(order.financial?.tax ?? order.tax ?? 0) > 0 ? `<div class="total-row">
                <div class="total-label">${esc(t('lbl_tax'))}:</div>
                <div class="total-value">${esc(formatCurrency(order.financial?.tax ?? order.tax ?? 0))}</div>
            </div>` : ''}
            ${(order.financial?.discount ?? order.discount ?? 0) > 0 ? `<div class="total-row">
                <div class="total-label">${esc(t('lbl_discount'))}:</div>
                <div class="total-value">-${esc(formatCurrency(order.financial?.discount ?? order.discount ?? 0))}</div>
            </div>` : ''}
            <div class="total-row" style="border-top: 1px solid black; padding-top: 1px; margin-top: 1px;">
                <div class="total-label">${esc(t('lbl_total'))}:</div>
                <div class="total-value">${esc(formatCurrency(order.financial?.grand_total ?? order.grand_total ?? order.total))}</div>
            </div>
            ${(order.financial?.amount_paid ?? order.amount_paid ?? 0) > 0 ? `<div class="total-row">
                <div class="total-label">${esc(t('lbl_paid'))}:</div>
                <div class="total-value">${esc(formatCurrency(order.financial?.amount_paid ?? order.amount_paid ?? 0))}</div>
            </div>` : ''}
            ${(order.financial?.due_amount ?? order.due_amount ?? 0) > 0 ? `<div class="total-row">
                <div class="total-label">${esc(t('lbl_due'))}:</div>
                <div class="total-value">${esc(formatCurrency(order.financial?.due_amount ?? order.due_amount ?? 0))}</div>
            </div>` : ''}
        </div>

        <div class="footer">
            <div class="footer-text">${esc(t('receipt_thank_you'))}</div>
            <div class="footer-text">AndgateBOS</div>
        </div>
    </div>
</body>
</html>
        `;

        // Isolated window print — single print() call, works with Bluetooth POS printers
        printInWindow(receiptHTML);
    }, [currentStore, currentUser, formatCurrency, t]);

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
                    onDeleteRequest={handleDeleteRequest}
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
                                        unit: item.unit,
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

                {/* Delete Confirmation Modal */}
                <Transition appear show={isDeleteModalOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={() => !isDeleting && setIsDeleteModalOpen(false)}>
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:h-10 sm:w-10">
                                                <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                                            </div>
                                            <div>
                                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                                    {t('order_void_confirm_title') || 'Void Order'}
                                                </Dialog.Title>
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-500">
                                                        {t('order_void_confirm_desc') || `Are you sure you want to void this order (${orderToDelete?.invoice || orderToDelete?.id})? This action will reverse stock, payments, points, and cannot be undone.`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                                onClick={() => setIsDeleteModalOpen(false)}
                                                disabled={isDeleting}
                                            >
                                                {t('btn_cancel')}
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                                                onClick={handleConfirmDelete}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? t('btn_processing') || 'Processing...' : t('btn_void_order') || 'Void Order'}
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
        </div>
    );
};

export default Orders;
