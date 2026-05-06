'use client';

import OrderFilter from '@/components/filters/OrderFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import Loader from '@/lib/Loader';
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

    // Handle thermal receipt print (direct print without modal)
    const handleThermalReceiptPrint = useCallback((order: any) => {
        setSelectedOrder(order);
        // Create a temporary element for thermal receipt printing
        const printContent = document.createElement('div');
        printContent.innerHTML = `
            <style>
                @page {
                    size: 58mm auto;
                    margin: 0;
                }
                body {
                    margin: 0;
                    padding: 3mm;
                    font-family: monospace;
                    font-size: 10px;
                    line-height: 1.2;
                    color: black;
                    background: white;
                }
                .receipt-header {
                    text-align: center;
                    margin-bottom: 8px;
                }
                .receipt-title {
                    font-size: 11px;
                    font-weight: bold;
                    text-transform: uppercase;
                    margin: 4px 0;
                }
                .divider {
                    border-top: 1px dashed black;
                    margin: 8px 0;
                }
                .receipt-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 2px 0;
                    font-size: 9px;
                }
                .receipt-label {
                    flex: 1;
                }
                .receipt-value {
                    font-weight: bold;
                }
                .items-section {
                    margin: 8px 0;
                }
                .item-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 2px 0;
                    font-size: 8px;
                }
                .item-name {
                    flex: 1;
                    word-break: break-word;
                }
                .item-details {
                    text-align: right;
                }
                .totals-section {
                    margin-top: 8px;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    font-weight: bold;
                    margin: 2px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 8px;
                    font-size: 8px;
                }
            </style>
            <div class="receipt-header">
                <div style="font-size: 15px; font-weight: bold; text-transform: uppercase; word-break: break-word;">${currentStore?.store_name || 'andgatePOS'}</div>
                ${currentStore?.store_location ? `<div style="font-size: 8px; word-break: break-word;">${currentStore.store_location}</div>` : ''}
                ${currentStore?.store_contact ? `<div style="font-size: 8px;">Phone: ${currentStore.store_contact}</div>` : ''}
                ${currentStore?.store_email ? `<div style="font-size: 8px; word-break: break-word;">${currentStore.store_email}</div>` : ''}
                <div class="receipt-title">Receipt</div>
            </div>
            <div class="divider"></div>
            <div>
                <div class="receipt-row">
                    <span class="receipt-label">Invoice No:</span>
                    <span class="receipt-value">${order.invoice || `#${order.id}`}</span>
                </div>
                ${order.id ? `<div class="receipt-row">
                    <span class="receipt-label">Order ID:</span>
                    <span class="receipt-value">#${order.id}</span>
                </div>` : ''}
                <div class="receipt-row">
                    <span class="receipt-label">Date:</span>
                    <span class="receipt-value">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Cashier:</span>
                    <span class="receipt-value">${currentUser?.name || 'Staff'}</span>
                </div>
            </div>
            <div class="divider"></div>
            <div>
                <div class="receipt-row">
                    <span class="receipt-label">Customer:</span>
                    <span class="receipt-value">${order.is_walk_in ? 'Walk-in Customer' : (order.customer?.name || 'N/A')}</span>
                </div>
                ${!order.is_walk_in && order.customer?.phone ? `<div class="receipt-row">
                    <span class="receipt-label">Phone:</span>
                    <span class="receipt-value">${order.customer.phone}</span>
                </div>` : ''}
            </div>
            <div class="divider"></div>
            <div class="items-section">
                ${(order.items || []).map((item: any) => `
                    <div class="item-row">
                        <span class="item-name">${item.snapshot?.product_name ?? item.product?.name ?? item.product_name ?? 'Unknown Product'}</span>
                        <span class="item-details">${item.quantity}x ${formatCurrency(item.unit_price || item.price)}</span>
                    </div>
                    ${item.variant_name || item.variant?.name ? `<div style="font-size: 7px; color: #666; margin-left: 4px;">${item.variant_name || item.variant?.name}</div>` : ''}
                `).join('')}
            </div>
            <div class="divider"></div>
            <div class="totals-section">
                <div class="receipt-row">
                    <span class="receipt-label">Subtotal:</span>
                    <span class="receipt-value">${formatCurrency(order.financial?.subtotal ?? order.subtotal ?? order.total)}</span>
                </div>
                ${(order.financial?.tax ?? order.tax ?? 0) > 0 ? `<div class="receipt-row">
                    <span class="receipt-label">Tax:</span>
                    <span class="receipt-value">${formatCurrency(order.financial?.tax ?? order.tax ?? 0)}</span>
                </div>` : ''}
                ${(order.financial?.discount ?? order.discount ?? 0) > 0 ? `<div class="receipt-row">
                    <span class="receipt-label">Discount:</span>
                    <span class="receipt-value">-${formatCurrency(order.financial?.discount ?? order.discount ?? 0)}</span>
                </div>` : ''}
                <div class="total-row">
                    <span>Total:</span>
                    <span>${formatCurrency(order.financial?.grand_total ?? order.grand_total ?? order.total)}</span>
                </div>
                ${(order.financial?.amount_paid ?? order.amount_paid ?? 0) > 0 ? `<div class="receipt-row">
                    <span class="receipt-label">Paid:</span>
                    <span class="receipt-value">${formatCurrency(order.financial?.amount_paid ?? order.amount_paid ?? 0)}</span>
                </div>` : ''}
                ${(order.financial?.due_amount ?? order.due_amount ?? 0) > 0 ? `<div class="receipt-row">
                    <span class="receipt-label">Due:</span>
                    <span class="receipt-value">${formatCurrency(order.financial?.due_amount ?? order.due_amount ?? 0)}</span>
                </div>` : ''}
            </div>
            <div class="divider"></div>
            <div class="footer">
                <div>Thank you for your business!</div>
                <div>Powered by andgatePOS</div>
            </div>
        `;

        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Thermal Receipt</title></head><body>');
            printWindow.document.write(printContent.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();

            // Wait for content to load then print
            printWindow.onload = () => {
                printWindow.print();
                printWindow.close();
            };
        }
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
