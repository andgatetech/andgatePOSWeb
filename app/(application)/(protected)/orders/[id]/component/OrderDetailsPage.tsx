'use client';

import PaymentStatusBadge from '@/components/payment/PaymentStatusBadge';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { canManageOrderDeletion, canVoidOrder } from '@/lib/orderDeletion';
import { normalizePaymentStatus } from '@/lib/paymentConstants';
import { escapePrintHtml, printInWindow } from '@/lib/printUtil';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { RootState } from '@/store';
import { useDeleteOrderMutation, useGetOrderByIdQuery } from '@/store/features/Order/Order';
import { useSendOrderInvoiceMutation } from '@/store/features/Order/orderApi';
import { setReturnOrderId } from '@/store/features/Order/OrderReturnSlice';
import { Dialog, Transition } from '@headlessui/react';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    Banknote,
    Barcode,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    CreditCard,
    Download,
    ExternalLink,
    FileText,
    Mail,
    MapPin,
    Package,
    Phone,
    Printer,
    Receipt,
    RotateCcw,
    Send,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Store,
    Tag,
    Trash2,
    TrendingUp,
    User,
    X,
} from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PosInvoicePreview from '@/app/(application)/(protected)/pos/PosInvoicePreview';

const OrderDetailsPage: React.FC = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const params = useParams();
    const dispatch = useDispatch();
    const { formatCurrency, formatNumber } = useCurrency();
    const { currentStoreId, currentStore } = useCurrentStore();
    const currentUser = useSelector((state: RootState) => state.auth?.user);

    const orderIdParam = params?.id ? String(params.id) : '';
    const orderId = Number(orderIdParam) || orderIdParam;

    // Fetch Order Data
    const { data: orderResponse, isLoading, isError, refetch } = useGetOrderByIdQuery(orderId as any, {
        skip: !orderId,
    });

    const order = useMemo(() => {
        if (!orderResponse) return null;
        return orderResponse.data || orderResponse;
    }, [orderResponse]);

    // Modals state
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailToSend, setEmailToSend] = useState('');
    const [copiedInvoice, setCopiedInvoice] = useState(false);
    const [copiedSerial, setCopiedSerial] = useState<string | null>(null);

    // Delete / Void Order state
    const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
    const [deleteOrder, { isLoading: isVoiding }] = useDeleteOrderMutation();
    const [sendOrderInvoice, { isLoading: isSendingEmail }] = useSendOrderInvoiceMutation();

    // Copy to clipboard helper
    const handleCopyText = (text: string, type: 'invoice' | 'serial', serialValue?: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        if (type === 'invoice') {
            setCopiedInvoice(true);
            setTimeout(() => setCopiedInvoice(false), 2000);
        } else if (type === 'serial' && serialValue) {
            setCopiedSerial(serialValue);
            setTimeout(() => setCopiedSerial(null), 2000);
        }
    };

    // Send Email Invoice Handler
    const handleSendInvoiceEmail = async () => {
        if (!currentStoreId || !order) return;
        const targetEmail = (emailToSend || order.customer?.email || '').trim();
        if (!targetEmail) {
            showErrorDialog(t('order_send_invoice_email_required_title') || 'Email Required', t('order_send_invoice_email_required_desc') || 'Please enter a valid customer email address.');
            return;
        }
        try {
            await sendOrderInvoice({ orderId: order.id, store_id: currentStoreId, email: targetEmail }).unwrap();
            showSuccessDialog(t('order_send_invoice_success_title') || 'Invoice Sent', t('order_send_invoice_success_desc') || 'The invoice has been sent to the customer email.');
            setShowEmailModal(false);
            setEmailToSend('');
        } catch (err: any) {
            showErrorDialog(t('order_send_invoice_failed_title') || 'Failed to Send', err?.data?.message || t('order_send_invoice_failed_desc') || 'Could not send the invoice. Please try again.');
        }
    };

    // Void Order Handler
    const handleConfirmVoid = async () => {
        if (!order || !currentStoreId) return;
        try {
            await deleteOrder({ id: order.id, store_id: currentStoreId }).unwrap();
            showSuccessDialog(t('msg_order_void_success') || 'Order Voided', t('msg_order_void_desc') || 'The order and its ledger entries have been successfully voided.');
            setIsVoidModalOpen(false);
            router.push('/orders');
        } catch (err: any) {
            showErrorDialog(t('msg_order_void_failed') || 'Void Failed', err?.data?.message || t('msg_something_went_wrong') || 'Failed to void the order.');
        }
    };

    // Thermal Receipt Printing Handler
    const handleThermalReceiptPrint = useCallback(() => {
        if (!order) return;
        const esc = escapePrintHtml;
        const activeStore = order.store || currentStore;
        const cashierName = order.user?.name || currentUser?.name || 'Staff';

        const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(t('thermal_receipt_title') || 'Thermal Receipt')}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: auto; margin: 0; padding: 0; }
        @page { size: 80mm auto; margin: 0; padding: 0; }
        body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.2;
            width: 80mm;
            height: auto;
            margin: 0;
            padding: 4px;
            background: white;
            color: black;
            display: block;
        }
        .receipt-container { width: 100%; height: auto; margin: 0; padding: 0; page-break-after: avoid; }
        .receipt-header { text-align: center; margin-bottom: 3px; border-bottom: 1px dashed black; padding-bottom: 3px; }
        .store-name { font-size: 13px; font-weight: bold; margin: 0 0 1px 0; line-height: 1.2; }
        .store-info { font-size: 8px; line-height: 1.1; }
        .receipt-title { font-size: 10px; font-weight: bold; margin-top: 2px; }
        .receipt-divider { border-top: 1px dashed black; margin: 2px 0; }
        .receipt-section { margin: 2px 0; }
        .receipt-row { display: table; width: 100%; font-size: 9px; line-height: 1.1; }
        .row-label { display: table-cell; width: 50%; text-align: left; padding-right: 4px; }
        .row-value { display: table-cell; width: 50%; text-align: right; font-weight: bold; }
        .items-section { margin: 2px 0; }
        .item-row { margin: 1px 0; font-size: 8px; line-height: 1.1; }
        .item-name { font-weight: bold; }
        .item-details { font-size: 7px; color: #333; }
        .totals-section { border-top: 1px solid black; border-bottom: 1px solid black; margin: 2px 0; padding: 2px 0; }
        .total-row { display: table; width: 100%; font-size: 10px; font-weight: bold; line-height: 1.2; }
        .total-label { display: table-cell; width: 50%; text-align: left; }
        .total-value { display: table-cell; width: 50%; text-align: right; }
        .footer { text-align: center; margin-top: 3px; padding-top: 2px; border-top: 1px dashed black; font-size: 8px; }
        @media print { body { margin: 0; padding: 4px; } .receipt-container { break-after: avoid; } }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="receipt-header">
            <div class="store-name">${esc(activeStore?.name || activeStore?.store_name || 'Andgate POS')}</div>
            ${activeStore?.address || activeStore?.store_location ? `<div class="store-info">${esc(activeStore.address || activeStore.store_location)}</div>` : ''}
            ${activeStore?.phone || activeStore?.store_contact ? `<div class="store-info">Tel: ${esc(activeStore.phone || activeStore.store_contact)}</div>` : ''}
            <div class="receipt-title">${esc(t('receipt_title') || 'SALES RECEIPT')}</div>
        </div>

        <div class="receipt-section">
            <div class="receipt-row">
                <div class="row-label">${esc(t('receipt_invoice_no') || 'Invoice')}:</div>
                <div class="row-value">${esc(order.invoice || `#${order.id}`)}</div>
            </div>
            <div class="receipt-row">
                <div class="row-label">${esc(t('lbl_date') || 'Date')}:</div>
                <div class="row-value">${esc(order.created_at || new Date().toLocaleString())}</div>
            </div>
            <div class="receipt-row">
                <div class="row-label">${esc(t('receipt_cashier') || 'Cashier')}:</div>
                <div class="row-value">${esc(cashierName)}</div>
            </div>
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-section">
            <div class="receipt-row">
                <div class="row-label">${esc(t('lbl_customer') || 'Customer')}:</div>
                <div class="row-value">${esc(order.is_walk_in ? 'Walk-in' : (order.customer?.name || 'N/A'))}</div>
            </div>
            ${!order.is_walk_in && order.customer?.phone ? `
            <div class="receipt-row">
                <div class="row-label">${esc(t('lbl_phone') || 'Phone')}:</div>
                <div class="row-value">${esc(order.customer.phone)}</div>
            </div>` : ''}
        </div>

        <div class="receipt-divider"></div>

        <div class="items-section">
            ${(order.items || []).map((item: any) => {
                const itemName = item.snapshot?.product_name ?? item.product?.name ?? item.product_name ?? 'Unknown Item';
                const itemPrice = formatCurrency(item.unit_price || item.price || 0);
                const itemQty = item.quantity;
                return `
                <div class="item-row">
                    <div class="item-name">${esc(itemName)}</div>
                    <div class="item-details">${esc(itemQty)} x ${esc(itemPrice)} = ${esc(formatCurrency(item.subtotal || 0))}</div>
                    ${item.serials && item.serials.length ? `<div class="item-details">SN: ${item.serials.map((s: any) => esc(s.serial_number)).join(', ')}</div>` : ''}
                </div>
                `;
            }).join('')}
        </div>

        <div class="receipt-divider"></div>

        <div class="totals-section">
            <div class="total-row">
                <div class="total-label">${esc(t('lbl_subtotal') || 'Subtotal')}:</div>
                <div class="total-value">${esc(formatCurrency(order.financial?.total ?? order.total ?? 0))}</div>
            </div>
            ${(order.financial?.tax ?? order.tax ?? 0) > 0 ? `
            <div class="total-row">
                <div class="total-label">${esc(t('lbl_tax') || 'Tax')}:</div>
                <div class="total-value">${esc(formatCurrency(order.financial?.tax ?? order.tax ?? 0))}</div>
            </div>` : ''}
            ${(order.financial?.discount ?? order.discount ?? 0) > 0 ? `
            <div class="total-row">
                <div class="total-label">${esc(t('lbl_discount') || 'Discount')}:</div>
                <div class="total-value">-${esc(formatCurrency(order.financial?.discount ?? order.discount ?? 0))}</div>
            </div>` : ''}
            <div class="total-row" style="border-top: 1px solid black; padding-top: 2px; margin-top: 2px;">
                <div class="total-label">${esc(t('lbl_total') || 'Grand Total')}:</div>
                <div class="total-value">${esc(formatCurrency(order.financial?.grand_total ?? order.grand_total ?? order.total ?? 0))}</div>
            </div>
            <div class="total-row">
                <div class="total-label">${esc(t('lbl_paid') || 'Paid')}:</div>
                <div class="total-value">${esc(formatCurrency(order.financial?.amount_paid ?? order.amount_paid ?? 0))}</div>
            </div>
            ${(order.financial?.due_amount ?? order.due_amount ?? 0) > 0 ? `
            <div class="total-row">
                <div class="total-label">${esc(t('lbl_due') || 'Due')}:</div>
                <div class="total-value">${esc(formatCurrency(order.financial?.due_amount ?? order.due_amount ?? 0))}</div>
            </div>` : ''}
        </div>

        <div class="footer">
            <div>${esc(t('receipt_thank_you') || 'Thank you for your business!')}</div>
            <div>Andgate POS System</div>
        </div>
    </div>
</body>
</html>
        `;

        printInWindow(receiptHTML);
    }, [order, currentStore, currentUser, formatCurrency, t]);

    // Handle Return Navigation
    const handleInitiateReturn = () => {
        if (!order || !currentStoreId) return;
        dispatch(setReturnOrderId({ storeId: currentStoreId, orderId: order.id }));
        router.push(`/orders/return/create/${order.id}`);
    };

    // Calculate item stats
    const totalItemCount = useMemo(() => {
        if (!order?.items) return 0;
        return order.items.reduce((sum: number, item: any) => sum + Number(item.quantity || 1), 0);
    }, [order]);

    if (isLoading) {
        return <Loader message={t('order_loading') || 'Loading order details...'} />;
    }

    if (isError || !order) {
        return (
            <div className="flex min-h-[500px] flex-col items-center justify-center p-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-inner">
                    <AlertCircle className="h-8 w-8" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">{t('order_not_found_title') || 'Order Not Found'}</h2>
                <p className="mt-1.5 max-w-md text-sm text-slate-500">
                    {t('order_not_found_desc') || 'The requested order details could not be retrieved. It may have been deleted or does not belong to your assigned store.'}
                </p>
                <div className="mt-6 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.push('/orders')}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>{t('lbl_back_to_orders') || 'Back to Orders'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        <span>{t('lbl_retry') || 'Retry'}</span>
                    </button>
                </div>
            </div>
        );
    }

    const paymentStatus = normalizePaymentStatus(order.payment?.status ?? order.payment_status ?? 'paid');
    const grandTotal = Number(order.financial?.grand_total ?? order.grand_total ?? order.total ?? 0);
    const amountPaid = Number(order.financial?.amount_paid ?? order.amount_paid ?? 0);
    const dueAmount = Number(order.financial?.due_amount ?? order.due_amount ?? 0);
    const changeAmount = Number(order.financial?.change_amount ?? order.change_amount ?? 0);
    const hasReturns = Boolean(order.returns?.has_returns || (order.returns?.count && order.returns.count > 0));
    const isFullyReturned = order.status === 'fully_returned' || order.return_status === 'full';
    const canReturnOrder = !isFullyReturned && order.items?.some((i: any) => (i.returnable_quantity ?? i.quantity ?? 0) > 0);
    const canVoid = showVoidButton(currentUser, order);

    function showVoidButton(user: any, ord: any) {
        return canManageOrderDeletion(user) && canVoidOrder(ord);
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Top Navigation & Sticky Header */}
            <div className="-mx-4 -mt-4 sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 shadow-2xs">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.push('/orders')}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition"
                            title={t('lbl_back_to_orders') || 'Back to Orders'}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-slate-900 sm:text-xl flex items-center gap-1.5">
                                    <span>{t('order_invoice') || 'Invoice'}:</span>
                                    <span className="text-indigo-600 font-mono">#{order.invoice || order.id}</span>
                                </h1>
                                <button
                                    type="button"
                                    onClick={() => handleCopyText(order.invoice || String(order.id), 'invoice')}
                                    className="p-1 text-slate-400 hover:text-indigo-600 transition"
                                    title="Copy invoice number"
                                >
                                    {copiedInvoice ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {order.created_at || 'N/A'}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Store className="h-3 w-3" /> {order.store?.name || currentStore?.store_name || 'Store'}</span>
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Thermal Print */}
                        <button
                            type="button"
                            onClick={handleThermalReceiptPrint}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition"
                        >
                            <Printer className="h-4 w-4 text-slate-600" />
                            <span>{t('order_action_thermal_receipt') || 'Thermal Receipt'}</span>
                        </button>

                        {/* PDF Invoice Modal */}
                        <button
                            type="button"
                            onClick={() => setShowInvoicePreview(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-xs font-semibold text-indigo-700 shadow-2xs hover:bg-indigo-100 hover:text-indigo-800 transition"
                        >
                            <FileText className="h-4 w-4 text-indigo-600" />
                            <span>{t('order_action_invoice') || 'PDF Invoice'}</span>
                        </button>

                        {/* Email Invoice */}
                        <button
                            type="button"
                            onClick={() => {
                                setEmailToSend(order.customer?.email || '');
                                setShowEmailModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition"
                        >
                            <Mail className="h-4 w-4 text-slate-600" />
                            <span>{t('order_send_invoice_btn') || 'Email'}</span>
                        </button>

                        {/* Return Order */}
                        {canReturnOrder && (
                            <button
                                type="button"
                                onClick={handleInitiateReturn}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 shadow-2xs hover:bg-amber-100 transition"
                            >
                                <RotateCcw className="h-4 w-4 text-amber-600" />
                                <span>{t('order_action_return') || 'Return / Exchange'}</span>
                            </button>
                        )}

                        {/* Void Order */}
                        {canVoid && (
                            <button
                                type="button"
                                onClick={() => setIsVoidModalOpen(true)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 shadow-2xs hover:bg-rose-100 transition"
                            >
                                <Trash2 className="h-4 w-4 text-rose-600" />
                                <span>{t('order_action_void') || 'Void Order'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* KPI Overview Strip */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {/* Grand Total */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('lbl_grand_total') || 'Grand Total'}</span>
                        <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                            <Banknote className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-xl font-bold text-slate-900 sm:text-2xl">{formatCurrency(grandTotal)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{order.items?.length || 0}</span> {order.items?.length === 1 ? t('lbl_product') : t('lbl_products')} ({totalItemCount} {t('order_kpi_units') || 'units'})
                    </div>
                </div>

                {/* Amount Paid */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('lbl_paid') || 'Amount Paid'}</span>
                        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-xl font-bold text-emerald-600 sm:text-2xl">{formatCurrency(amountPaid)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs">
                        <PaymentStatusBadge status={paymentStatus} />
                    </div>
                </div>

                {/* Due Balance */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('lbl_due') || 'Due Balance'}</span>
                        <div className={`rounded-xl p-2 ${dueAmount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                            <CreditCard className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className={`text-xl font-bold sm:text-2xl ${dueAmount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                            {formatCurrency(dueAmount)}
                        </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                        {dueAmount > 0 ? (
                            <span className="font-medium text-rose-600">{t('order_outstanding_payment') || 'Outstanding payment'}</span>
                        ) : (
                            <span className="text-emerald-600 font-medium">{t('order_fully_settled') || 'Fully settled'}</span>
                        )}
                    </div>
                </div>

                {/* Order Status */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('lbl_status') || 'Order Status'}</span>
                        <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold capitalize text-blue-700 border border-blue-200">
                            {order.status?.replace('_', ' ') || t('status_completed') || 'Completed'}
                        </span>
                    </div>
                    {order.return_status && order.return_status !== 'none' && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-rose-600 font-medium">
                            <RotateCcw className="h-3 w-3" />
                            <span className="capitalize">{order.return_status} {t('lbl_returned') || 'returned'}</span>
                        </div>
                    )}
                </div>

                {/* Staff / Cashier */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs col-span-2 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('order_cashier_staff') || 'Cashier / Staff'}</span>
                        <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                            <User className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 font-bold text-slate-900 truncate" title={order.user?.name || t('lbl_staff') || 'Staff'}>
                        {order.user?.name || t('lbl_staff_cashier') || 'Staff Cashier'}
                    </div>
                    <div className="mt-2 text-xs text-slate-500 truncate" title={order.store?.name || currentStore?.store_name || t('lbl_store') || 'Store'}>
                        {order.store?.name || currentStore?.store_name || t('order_retail_pos') || 'Retail POS'}
                    </div>
                </div>
            </div>

            {/* Main Content Layout (8 Cols Main + 4 Cols Sidebar) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left / Main Column (8 Cols) */}
                <div className="space-y-6 lg:col-span-8">
                    {/* Products & Items Table Card */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-indigo-600" />
                                <h3 className="font-bold text-slate-900">{t('order_items_title') || 'Purchased Products & Items'}</h3>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
                                {order.items?.length || 0} {order.items?.length === 1 ? t('lbl_product') : t('lbl_products')}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-700">
                                <thead className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase font-semibold text-slate-500">
                                    <tr>
                                        <th scope="col" className="px-6 py-3.5">{t('lbl_product') || 'Item Details'}</th>
                                        <th scope="col" className="px-4 py-3.5 text-center">{t('lbl_price') || 'Price'}</th>
                                        <th scope="col" className="px-4 py-3.5 text-center">{t('lbl_qty') || 'Qty'}</th>
                                        <th scope="col" className="px-4 py-3.5 text-right">{t('lbl_total') || 'Total'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(order.items || []).map((item: any, idx: number) => {
                                        const productName = item.snapshot?.product_name ?? item.product?.name ?? item.product_name ?? t('lbl_product');
                                        const sku = item.snapshot?.sku ?? item.product?.sku ?? item.sku ?? 'N/A';
                                        const category = item.product?.category;
                                        const brand = item.product?.brand;
                                        const serials = item.serials || [];
                                        const warranty = item.warranty;
                                        const isReturned = (item.quantity_returned && item.quantity_returned > 0) || item.return_status !== 'none';

                                        return (
                                            <tr key={item.id || idx} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="font-semibold text-slate-900 text-sm">{productName}</div>
                                                            {isReturned && (
                                                                <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200/60">
                                                                    <RotateCcw className="h-3 w-3" />
                                                                    <span>{t('order_returned_badge') || 'Returned'} ({item.quantity_returned || 0})</span>
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Metadata chips */}
                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                            {sku && sku !== 'N/A' && (
                                                                <span className="inline-flex items-center gap-1 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-700">
                                                                    <Barcode className="h-3 w-3 text-slate-400" />
                                                                    SKU: {sku}
                                                                </span>
                                                            )}
                                                            {category && (
                                                                <span className="inline-flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded text-[11px] text-slate-600 border border-slate-200/50">
                                                                    <Tag className="h-2.5 w-2.5 text-slate-400" />
                                                                    {category}
                                                                </span>
                                                            )}
                                                            {brand && (
                                                                <span className="inline-flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded text-[11px] text-slate-600 border border-slate-200/50">
                                                                    {brand}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Serial Numbers Box */}
                                                        {serials.length > 0 && (
                                                            <div className="mt-1 flex flex-wrap items-center gap-1.5 pt-1">
                                                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                                                    <Barcode className="h-3 w-3 text-indigo-500" /> {t('order_serials_label') || 'Serials:'}
                                                                </span>
                                                                {serials.map((serial: any) => (
                                                                    <button
                                                                        key={serial.id}
                                                                        type="button"
                                                                        onClick={() => handleCopyText(serial.serial_number, 'serial', serial.serial_number)}
                                                                        className="group inline-flex items-center gap-1 rounded-md bg-indigo-50/70 px-2 py-0.5 text-xs font-mono font-medium text-indigo-700 border border-indigo-200/60 hover:bg-indigo-100 transition"
                                                                        title={t('order_click_to_copy') || 'Click to copy serial'}
                                                                    >
                                                                        <span>{serial.serial_number}</span>
                                                                        {copiedSerial === serial.serial_number ? (
                                                                            <Check className="h-3 w-3 text-emerald-600" />
                                                                        ) : (
                                                                            <Copy className="h-2.5 w-2.5 opacity-40 group-hover:opacity-100" />
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Warranty Coverage Box */}
                                                        {warranty && (
                                                            <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-200/60 text-xs">
                                                                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                                                                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                                                    <span>{warranty.warranty_type || t('order_protection_plan') || 'Warranty Protection'}</span>
                                                                </div>
                                                                <span className="text-slate-300">•</span>
                                                                <div className="text-slate-600 flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3 text-slate-400" />
                                                                    <span>
                                                                        {warranty.start_date || t('order_sale_date') || 'Sale Date'} → <strong className="text-slate-800">{warranty.end_date || 'N/A'}</strong>
                                                                    </span>
                                                                </div>
                                                                {warranty.remaining_days !== undefined && (
                                                                    <span
                                                                        className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                                            warranty.remaining_days > 30
                                                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                                                : warranty.remaining_days > 0
                                                                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                                                                        }`}
                                                                    >
                                                                        <Clock className="h-3 w-3" />
                                                                        {warranty.remaining_days > 0 ? `${warranty.remaining_days} ${t('order_remains_count') || 'days remain'}` : (t('warranties_badge_expired') || 'Expired')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center whitespace-nowrap font-medium text-slate-900">
                                                    <div>{formatCurrency(item.unit_price || 0)}</div>
                                                    {(item.discount > 0 || item.tax > 0) && (
                                                        <div className="text-[11px] text-slate-400">
                                                            {item.discount > 0 && <span className="text-amber-600">-{formatCurrency(item.discount)}</span>}
                                                            {item.tax > 0 && <span className="text-slate-500"> +{formatCurrency(item.tax)} {t('lbl_tax') || 'tax'}</span>}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-center whitespace-nowrap">
                                                    <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-800 text-xs">
                                                        {item.quantity} {item.unit || 'unit'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap font-bold text-slate-900">
                                                    {formatCurrency(item.subtotal || 0)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment & Transaction History Card */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-emerald-600" />
                                <h3 className="font-bold text-slate-900">{t('order_payment_history') || 'Payments & Transactions History'}</h3>
                            </div>
                            <PaymentStatusBadge status={paymentStatus} />
                        </div>

                        {order.transactions && order.transactions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-700">
                                    <thead className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase font-semibold text-slate-500">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">{t('lbl_type') || 'Type'}</th>
                                            <th scope="col" className="px-4 py-3">{t('lbl_payment_method') || 'Payment Method'}</th>
                                            <th scope="col" className="px-4 py-3">{t('lbl_date') || 'Date & Time'}</th>
                                            <th scope="col" className="px-6 py-3 text-right">{t('lbl_amount') || 'Amount'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {order.transactions.map((txn: any, idx: number) => {
                                            const isRefund = txn.type === 'refund' || txn.amount < 0;
                                            return (
                                                <tr key={txn.id || idx} className="hover:bg-slate-50/50">
                                                    <td className="px-6 py-3.5">
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                                                isRefund ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            }`}
                                                        >
                                                            {txn.type || t('lbl_sale_payment') || 'Sale Payment'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 font-medium text-slate-800 capitalize">
                                                        {txn.payment_method || 'Cash'}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-xs text-slate-500">
                                                        {txn.created_at || '-'}
                                                    </td>
                                                    <td className={`px-6 py-3.5 text-right font-bold whitespace-nowrap ${isRefund ? 'text-rose-600' : 'text-slate-900'}`}>
                                                        {isRefund ? `-${formatCurrency(Math.abs(txn.amount))}` : formatCurrency(txn.amount)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-sm text-slate-500">
                                <CreditCard className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                                <span>{t('order_no_transactions') || 'No detailed payment transactions logged for this invoice.'}</span>
                            </div>
                        )}
                    </div>

                    {/* Returns & Exchanges History Card (Conditional) */}
                    {hasReturns && order.returns?.details && order.returns.details.length > 0 && (
                        <div className="overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-xs">
                            <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50/50 px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <RotateCcw className="h-5 w-5 text-rose-600" />
                                    <h3 className="font-bold text-rose-900">{t('order_returns_title') || 'Returns & Refund Records'}</h3>
                                </div>
                                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                                    {t('order_total_returned') || 'Total Returned'}: {formatCurrency(order.returns.total_returned || 0)}
                                </span>
                            </div>

                            <div className="divide-y divide-rose-100 p-6 space-y-4">
                                {order.returns.details.map((ret: any, rIdx: number) => (
                                    <div key={ret.id || rIdx} className="rounded-xl border border-rose-100 bg-rose-50/30 p-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <span className="font-bold text-rose-900">{t('order_return_number') || 'Return #'} {ret.return_number || ret.id}</span>
                                                <p className="text-xs text-rose-600 mt-0.5">{ret.created_at || 'N/A'}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-rose-700">{formatCurrency(ret.return_amount || 0)}</span>
                                                {ret.reason && <p className="text-xs text-slate-500">{t('order_return_reason') || 'Reason:'} {ret.reason.reason || ret.reason}</p>}
                                            </div>
                                        </div>

                                        {ret.items_returned && ret.items_returned.length > 0 && (
                                            <div className="mt-3 border-t border-rose-100/60 pt-2 text-xs text-slate-700 space-y-1">
                                                <span className="font-semibold text-slate-600">{t('order_returned_items_list') || 'Returned Items:'}</span>
                                                {ret.items_returned.map((ri: any, riIdx: number) => (
                                                    <div key={riIdx} className="flex items-center justify-between text-slate-600 pl-2">
                                                        <span>• {ri.product_name} ({ri.quantity} {ri.unit})</span>
                                                        <span>{formatCurrency(ri.subtotal || 0)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right / Sidebar Column (4 Cols) */}
                <div className="space-y-6 lg:col-span-4">
                    {/* Customer Profile Card */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                        <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3.5 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <User className="h-4 w-4 text-indigo-600" />
                                {t('order_customer') || 'Customer Information'}
                            </h3>
                            {order.is_walk_in && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">
                                    {t('order_walk_in') || 'Walk-in'}
                                </span>
                            )}
                        </div>

                        <div className="p-5 space-y-3">
                            {order.is_walk_in ? (
                                <div className="text-center py-3 text-slate-500 text-sm">
                                    <User className="mx-auto h-8 w-8 text-slate-300 mb-1" />
                                    <p className="font-semibold text-slate-700">{t('order_walk_in') || 'Walk-in Customer'}</p>
                                    <p className="text-xs text-slate-400">{t('order_walk_in_notice') || 'Direct Over-the-counter sale'}</p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('lbl_name') || 'Name'}</label>
                                        <p className="font-bold text-slate-900 text-base">{order.customer?.name || 'N/A'}</p>
                                    </div>

                                    {order.customer?.phone && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> {t('lbl_phone') || 'Phone'}:</span>
                                            <a href={`tel:${order.customer.phone}`} className="font-semibold text-indigo-600 hover:underline">
                                                {order.customer.phone}
                                            </a>
                                        </div>
                                    )}

                                    {order.customer?.email && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" /> {t('lbl_email') || 'Email'}:</span>
                                            <a href={`mailto:${order.customer.email}`} className="font-semibold text-indigo-600 hover:underline truncate max-w-[180px]">
                                                {order.customer.email}
                                            </a>
                                        </div>
                                    )}

                                    {order.customer?.address && (
                                        <div className="text-sm pt-1 border-t border-slate-100">
                                            <span className="text-slate-500 flex items-center gap-1.5 text-xs"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {t('lbl_address') || 'Address'}:</span>
                                            <p className="text-slate-700 text-xs mt-1 pl-5">{order.customer.address}</p>
                                        </div>
                                    )}

                                    {order.customer?.points !== undefined && (
                                        <div className="mt-2 rounded-xl bg-amber-50 p-2.5 text-xs font-medium text-amber-900 border border-amber-200/60 flex items-center justify-between">
                                            <span>{t('order_loyalty_points_balance') || 'Loyalty Points Balance:'}</span>
                                            <span className="font-bold">{order.customer.points} {t('order_pts') || 'pts'}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Financial Summary Card */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                        <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <Banknote className="h-4 w-4 text-emerald-600" />
                                {t('order_financial_breakdown') || 'Order Financial Breakdown'}
                            </h3>
                        </div>

                        <div className="p-5 space-y-3 text-sm">
                            <div className="flex items-center justify-between text-slate-600">
                                <span>{t('lbl_subtotal') || 'Items Subtotal'}</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(order.financial?.total ?? order.total ?? 0)}</span>
                            </div>

                            {(order.financial?.tax ?? order.tax ?? 0) > 0 && (
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>{t('lbl_tax') || 'Tax / VAT'}</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(order.financial?.tax ?? order.tax ?? 0)}</span>
                                </div>
                            )}

                            {(order.financial?.discount ?? order.discount ?? 0) > 0 && (
                                <div className="flex items-center justify-between text-amber-700">
                                    <span>{t('lbl_discount') || 'Discount'}</span>
                                    <span className="font-semibold">-{formatCurrency(order.financial?.discount ?? order.discount ?? 0)}</span>
                                </div>
                            )}

                            <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-base font-bold text-slate-900">
                                <span>{t('lbl_grand_total') || 'Grand Total'}</span>
                                <span className="text-indigo-600">{formatCurrency(grandTotal)}</span>
                            </div>

                            <div className="border-t border-slate-100 pt-2 space-y-1.5 text-xs">
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>{t('lbl_paid') || 'Amount Paid'}</span>
                                    <span className="font-bold text-emerald-600">{formatCurrency(amountPaid)}</span>
                                </div>

                                {changeAmount > 0 && (
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span>{t('order_change_returned') || 'Change Returned'}</span>
                                        <span className="font-semibold text-slate-800">{formatCurrency(changeAmount)}</span>
                                    </div>
                                )}

                                {dueAmount > 0 ? (
                                    <div className="flex items-center justify-between text-rose-600 font-bold bg-rose-50 p-2 rounded-lg border border-rose-200">
                                        <span>{t('lbl_due') || 'Balance Due'}</span>
                                        <span>{formatCurrency(dueAmount)}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between text-emerald-700 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                                        <span>{t('order_payment_status') || 'Payment Status'}</span>
                                        <span>{t('order_fully_paid') || 'Fully Paid ✓'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Store & Register Card */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                        <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <Store className="h-4 w-4 text-slate-600" />
                                {t('order_store_register') || 'Store & Register'}
                            </h3>
                        </div>

                        <div className="p-5 space-y-2.5 text-xs text-slate-600">
                            <div>
                                <span className="font-bold text-slate-900 text-sm">{order.store?.name || currentStore?.store_name || 'Retail Outlet'}</span>
                                {(order.store?.address || currentStore?.store_location) && (
                                    <p className="text-slate-500 mt-0.5">{order.store?.address || currentStore?.store_location}</p>
                                )}
                            </div>
                            {(order.store?.phone || currentStore?.store_contact) && (
                                <div className="flex items-center gap-1.5 pt-1">
                                    <Phone className="h-3 w-3 text-slate-400" />
                                    <span>{order.store?.phone || currentStore?.store_contact}</span>
                                </div>
                            )}
                            <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                                <span className="text-slate-500">{t('order_staff_in_charge') || 'Staff In-Charge:'}</span>
                                <span className="font-semibold text-slate-800">{order.user?.name || currentUser?.name || t('lbl_staff') || 'Staff'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: PDF Invoice Preview */}
            {showInvoicePreview && order && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="relative max-h-[95vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setShowInvoicePreview(false)}
                            className="absolute top-4 right-4 z-10 rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <PosInvoicePreview
                            data={{
                                customer: order.customer || {},
                                items: (order.items || []).map((item: any) => ({
                                    id: item.id,
                                    title: item.snapshot?.product_name ?? item.product?.name ?? item.product_name ?? 'Unknown Item',
                                    variantName: item.snapshot?.variant_data
                                        ? Object.entries(item.snapshot.variant_data)
                                              .map(([k, v]) => `${k}: ${v}`)
                                              .join(', ')
                                        : item.variant_name || item.variant?.name || item.variantName,
                                    quantity: item.quantity,
                                    unit: item.unit,
                                    price: item.unit_price || item.price || 0,
                                    amount: item.subtotal || item.amount || item.total || 0,
                                    tax_rate: item.tax_rate,
                                    serials: item.serials,
                                    warranty: item.warranty,
                                    has_serial: item.has_serials ?? (item.serials && item.serials.length > 0),
                                    has_warranty: item.warranty !== null && item.warranty !== undefined,
                                })),
                                totals: {
                                    subtotal: order.financial?.subtotal ?? order.subtotal ?? order.total,
                                    tax: order.financial?.tax ?? order.tax ?? 0,
                                    discount: order.financial?.discount ?? order.discount ?? 0,
                                    grand_total: order.financial?.grand_total ?? order.grand_total ?? order.total,
                                },
                                invoice: order.invoice,
                                order_id: order.id,
                                isOrderCreated: false,
                                payment_status: order.payment?.status ?? order.payment_status,
                                payment_method: order.payment?.method ?? order.payment_method,
                                amount_paid: order.financial?.amount_paid ?? order.amount_paid,
                                due_amount: order.financial?.due_amount ?? order.due_amount,
                            }}
                            storeId={currentStoreId || order.store_id}
                            onClose={() => setShowInvoicePreview(false)}
                            autoPrint={null}
                        />
                    </div>
                </div>
            )}

            {/* Modal: Email Invoice */}
            <Transition appear show={showEmailModal} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setShowEmailModal(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <Dialog.Title className="text-base font-bold text-slate-900 flex items-center gap-2">
                                            <Mail className="h-5 w-5 text-indigo-600" />
                                            {t('order_send_invoice_title') || 'Send Invoice to Customer'}
                                        </Dialog.Title>
                                        <button onClick={() => setShowEmailModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        <p className="text-xs text-slate-500">
                                            {t('order_send_invoice_desc') || 'Enter the recipient email address to send an electronic PDF invoice for order'} <strong className="text-slate-800">#{order.invoice || order.id}</strong>.
                                        </p>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">{t('order_recipient_email') || 'Recipient Email Address'}</label>
                                            <input
                                                type="email"
                                                value={emailToSend}
                                                onChange={(e) => setEmailToSend(e.target.value)}
                                                placeholder="customer@example.com"
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowEmailModal(false)}
                                            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                                        >
                                            {t('lbl_cancel') || 'Cancel'}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isSendingEmail || !emailToSend.trim()}
                                            onClick={handleSendInvoiceEmail}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60 transition"
                                        >
                                            <Send className="h-3.5 w-3.5" />
                                            <span>{isSendingEmail ? (t('order_sending') || 'Sending...') : (t('order_send_btn') || 'Send Invoice')}</span>
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Modal: Void & Reverse Order Confirmation */}
            <Transition appear show={isVoidModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsVoidModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
                                        <AlertTriangle className="h-6 w-6" />
                                    </div>
                                    <Dialog.Title className="text-lg font-bold text-slate-900">
                                        {t('order_delete_confirm_title') || 'Void & Reverse Order?'}
                                    </Dialog.Title>
                                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                        {t('order_void_confirm_message', { invoice: order.invoice || order.id }) || `Are you sure you want to void order #${order.invoice || order.id}? This will restore stock quantities, deactivate related warranties, release assigned serial numbers, and reverse ledger transactions. This action cannot be undone.`}
                                    </p>

                                    <div className="mt-6 flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsVoidModalOpen(false)}
                                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                                        >
                                            {t('lbl_cancel') || 'Cancel'}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isVoiding}
                                            onClick={handleConfirmVoid}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-rose-700 disabled:opacity-60 transition"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            <span>{isVoiding ? (t('order_voiding_btn') || 'Voiding...') : (t('order_confirm_void_btn') || 'Yes, Void Order')}</span>
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

export default OrderDetailsPage;
