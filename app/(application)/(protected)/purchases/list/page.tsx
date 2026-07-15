'use client';

import PaymentReceipt from '@/app/(application)/(protected)/purchases/list/components/PaymentReceipt';
import TransactionTrackingModal from '@/app/(application)/(protected)/purchases/list/components/TransactionTrackingModal';
import DraftsTable from '@/app/(application)/(protected)/purchases/list/components/DraftsTable';
import PurchaseOrdersTable from '@/app/(application)/(protected)/purchases/list/components/PurchaseOrdersTable';
import DateColumn from '@/components/common/DateColumn';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { escapePrintHtml, printInWindow } from '@/lib/printUtil';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import type { RootState } from '@/store';
import {
    useClearFullDueMutation,
    useConvertDraftToPurchaseOrderMutation,
    useDeletePurchaseDraftMutation,
    useGetPurchaseDraftsQuery,
    useGetPurchaseOrdersQuery,
    useMakePartialPaymentMutation,
} from '@/store/features/PurchaseOrder/PurchaseOrderApi';
import { useDeletePurchaseDueMutation } from '@/store/features/purchaseDue/purchaseDue';
import Swal from 'sweetalert2';
import { FileText, Package, Plus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

type TabType = 'drafts' | 'orders';
type OrderStatusFilter = 'all' | 'ordered' | 'received' | 'due';

const PurchaseOrderListPage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();

    const [activeTab, setActiveTab] = useState<TabType>('orders');
    const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatusFilter>('all');
    const [filterSearch, setFilterSearch] = useState('');

    // ─── Modals ───
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
    const [modalTitle, setModalTitle] = useState('');
    const [transactionModalOpen, setTransactionModalOpen] = useState(false);
    const [selectedTransactionOrder, setSelectedTransactionOrder] = useState<any>(null);

    // ─── Payment ───
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentModalType, setPaymentModalType] = useState<'partial' | 'full'>('partial');
    const [selectedDue, setSelectedDue] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');

    // ─── Receipt ───
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptTransaction, setReceiptTransaction] = useState<any>(null);
    const [receiptPurchaseOrder, setReceiptPurchaseOrder] = useState<any>(null);

    const paymentMethods = useSelector((state: RootState) => state.auth.currentStore?.payment_methods || []);
    const activePaymentMethods = paymentMethods.filter((pm: any) => pm.is_active);

    // ─── Pagination & Sort (consolidated per tab) ───
    const [draftPage, setDraftPage] = useState(1);
    const [draftPerPage, setDraftPerPage] = useState(15);
    const [draftSortField, setDraftSortField] = useState('created_at');
    const [draftSortDirection, setDraftSortDirection] = useState<'asc' | 'desc'>('desc');

    const [orderPage, setOrderPage] = useState(1);
    const [orderPerPage, setOrderPerPage] = useState(15);
    const [orderSortField, setOrderSortField] = useState('created_at');
    const [orderSortDirection, setOrderSortDirection] = useState<'asc' | 'desc'>('desc');

    // ─── RTK Queries ───
    const { data: draftsResponse, isLoading: draftsLoading } = useGetPurchaseDraftsQuery(
        {
            store_id: currentStoreId,
            page: draftPage,
            per_page: draftPerPage,
            sort_field: draftSortField,
            sort_direction: draftSortDirection,
        },
        { skip: activeTab !== 'drafts' || !currentStoreId }
    );

    const orderQueryParams = useMemo(() => {
        const params: Record<string, any> = {
            store_id: currentStoreId,
            page: orderPage,
            per_page: orderPerPage,
            sort_field: orderSortField,
            sort_direction: orderSortDirection,
        };
        if (orderStatusFilter === 'all') {
            params.po_filter = undefined;
        } else if (orderStatusFilter === 'ordered') {
            params.status = 'ordered';
        } else if (orderStatusFilter === 'received') {
            params.status = 'received';
        } else if (orderStatusFilter === 'due') {
            params.payment_status = 'pending';
        }
        if (filterSearch.trim()) params.search = filterSearch.trim();
        return params;
    }, [currentStoreId, orderPage, orderPerPage, orderSortField, orderSortDirection, orderStatusFilter, filterSearch]);

    const { data: ordersResponse, isLoading: ordersLoading } = useGetPurchaseOrdersQuery(orderQueryParams, { skip: activeTab !== 'orders' || !currentStoreId });

    // ─── Mutations ───
    const [convertToPO, { isLoading: isConverting }] = useConvertDraftToPurchaseOrderMutation();
    const [deleteDraft] = useDeletePurchaseDraftMutation();
    const [makePartialPayment, { isLoading: isPaymentLoading }] = useMakePartialPaymentMutation();
    const [clearFullDue, { isLoading: isClearingDue }] = useClearFullDueMutation();
    const [deletePurchaseDue] = useDeletePurchaseDueMutation();

    // ─── Data extraction ───
    const drafts = draftsResponse?.data?.items || [];
    const draftsPagination = draftsResponse?.data?.pagination;

    const orders = ordersResponse?.data?.items || [];
    const ordersPagination = ordersResponse?.data?.pagination;
    const ordersStats = ordersResponse?.data?.stats || null;

    const draftStats = draftsResponse?.data?.stats || null;
    const draftCount = draftsPagination?.total || 0;
    const pendingCount = ordersStats?.pending_count || ordersStats?.new_count || 0;
    const totalDue = ordersStats?.total_due || 0;

    // ─── Summary cards data ───
    const summaryCards = [
        {
            label: t('purchase_drafts'),
            value: draftCount,
            icon: <FileText className="h-5 w-5" />,
            color: 'text-amber-600 bg-amber-50',
        },
        {
            label: t('lbl_pending_orders'),
            value: pendingCount || ordersPagination?.total || 0,
            icon: <ShoppingCart className="h-5 w-5" />,
            color: 'text-blue-600 bg-blue-50',
        },
        {
            label: t('lbl_total_due'),
            value: formatCurrency(totalDue),
            icon: <span className="text-lg font-bold">৳</span>,
            color: 'text-red-600 bg-red-50',
        },
    ];

    // ─── Handlers ───
    const handleViewItems = (item: any) => {
        const title = item.draft_reference ? `${t('lbl_purchase_draft')}: ${item.draft_reference}` : `${t('lbl_purchase_order')}: ${item.invoice_number}`;
        setSelectedItems(item.items || []);
        setSelectedPurchase(item);
        setModalTitle(title);
        setViewModalOpen(true);
    };

    const handlePrint = (item: any) => {
        const esc = escapePrintHtml;
        const isDraft = !!item.draft_reference;
        const title = isDraft ? `${t('lbl_purchase_draft')}: ${item.draft_reference}` : `${t('lbl_purchase_order')}: ${item.invoice_number}`;
        const items = item.items || [];
        const total = items.reduce((sum: number, itm: any) => {
            return sum + (parseFloat(itm.estimated_subtotal) || parseFloat(itm.subtotal) || parseFloat(itm.total) || 0);
        }, 0);

        const html = `<!DOCTYPE html><html><head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <title>${esc(title)}</title>
            <style>
                *{margin:0;padding:0;box-sizing:border-box}
                body{font-family:system-ui,sans-serif;padding:40px;color:#1e293b}
                .header{text-align:center;margin-bottom:30px;border-bottom:3px solid #046ca9;padding-bottom:20px}
                .header h1{font-size:28px;color:#046ca9;margin-bottom:5px}
                .header p{color:#64748b;font-size:14px}
                .info{display:flex;justify-content:space-between;margin-bottom:30px;background:#f8fafc;padding:20px;border-radius:8px}
                .info h3{font-size:12px;color:#64748b;text-transform:uppercase;margin-bottom:8px;font-weight:600}
                .info p{font-size:16px;color:#0f172a;font-weight:500}
                table{width:100%;border-collapse:collapse}
                th{background:#046ca9;color:#fff;padding:12px 16px;text-align:left;font-size:12px;text-transform:uppercase}
                td{padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px}
                tr:nth-child(even){background:#f8fafc}
                .total-row{background:#e0f2fe!important;font-weight:700}
                .text-right{text-align:right}
                @media print{body{padding:20px}}
            </style></head><body>
            <div class="header"><h1>${esc(title)}</h1><p>${esc(item.store_name || t('lbl_store'))}</p></div>
            <div class="info">
                <div><h3>${esc(t('lbl_date'))}</h3><p>${esc(item.created_at || '-')}</p></div>
                ${item.supplier?.name ? `<div><h3>${esc(t('lbl_supplier'))}</h3><p>${esc(item.supplier.name)}</p></div>` : ''}
                <div><h3>${esc(t('lbl_total'))}</h3><p>৳${esc(total.toLocaleString())}</p></div>
            </div>
            <table><thead><tr><th>#</th><th>${esc(t('lbl_product'))}</th><th>${esc(t('lbl_qty'))}</th><th>${esc(t('lbl_unit_price'))}</th><th class="text-right">${esc(
            t('lbl_subtotal')
        )}</th></tr></thead><tbody>
            ${items
                .map((itm: any, i: number) => {
                    const name = itm.product_name || itm.product || t('lbl_na');
                    const qty = itm.quantity_ordered || itm.quantity || 0;
                    const price = parseFloat(itm.purchase_price || itm.unit_price || 0);
                    const subtotal = parseFloat(itm.estimated_subtotal) || parseFloat(itm.subtotal) || qty * price;
                    return `<tr><td>${i + 1}</td><td>${esc(name)}</td><td>${esc(qty)}</td><td>৳${esc(price.toLocaleString())}</td><td class="text-right">৳${esc(subtotal.toLocaleString())}</td></tr>`;
                })
                .join('')}
            <tr class="total-row"><td colspan="4" class="text-right"><strong>${esc(t('lbl_total'))}</strong></td><td class="text-right"><strong>৳${esc(total.toLocaleString())}</strong></td></tr>
            </tbody></table>
            </body></html>`;
        printInWindow(html);
    };

    const handleReceiveItems = (order: any) => router.push(`/purchases/receive/${order.id}`);
    const handleViewTransactions = (order: any) => {
        setSelectedTransactionOrder(order);
        setTransactionModalOpen(true);
    };
    const handleReturn = (order: any) => router.push(`/purchases/return/${order.id}`);

    const handleConvertToPurchaseOrder = async (draft: any) => {
        const isConfirmed = await showConfirmDialog(t('msg_convert_to_po'), `${t('msg_convert_draft_confirm')} <strong>${draft.draft_reference}</strong>?`, t('btn_yes_convert'), t('btn_cancel'));
        if (!isConfirmed) return;

        try {
            const response = await convertToPO({ id: draft.id, payment_notes: t('msg_converted_from_draft') }).unwrap();
            const purchaseOrder = response?.data?.purchase_order || response?.data || response;
            if (!purchaseOrder?.invoice_number) throw new Error(t('msg_error_generic'));

            showSuccessDialog(
                t('msg_po_created'),
                `<p>${t('lbl_invoice')}: <strong>${purchaseOrder.invoice_number}</strong></p><p>${t('lbl_total')}: <strong>${formatCurrency(
                    purchaseOrder.grand_total || purchaseOrder.total || 0
                )}</strong></p>`,
                t('btn_view_purchase_orders')
            ).then(() => setActiveTab('orders'));
        } catch (error: any) {
            showErrorDialog(t('msg_error'), error?.data?.error || error?.data?.message || error?.message || t('msg_error_generic'));
        }
    };

    const handleDeleteDraft = async (draft: any) => {
        const isConfirmed = await showConfirmDialog(t('msg_delete_draft_confirm'), `${t('msg_are_you_sure_delete_draft')} ${draft.draft_reference}?`, t('btn_yes_delete'), t('btn_cancel'));
        if (!isConfirmed) return;
        try {
            await deleteDraft(draft.id).unwrap();
            showSuccessDialog(t('msg_success'), t('purchase_deleted'));
        } catch (error: any) {
            showErrorDialog(t('msg_error'), error?.data?.message || t('purchase_deleted'));
        }
    };

    // ─── Payment ───
    const openPaymentModal = (type: 'partial' | 'full', due: any) => {
        setPaymentModalType(type);
        setSelectedDue(due);
        setPaymentAmount('');
        setPaymentMethod(activePaymentMethods[0]?.payment_method_name || t('lbl_cash'));
        setPaymentNotes('');
        setShowPaymentModal(true);
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setSelectedDue(null);
        setPaymentAmount('');
        setPaymentMethod(activePaymentMethods[0]?.payment_method_name || t('lbl_cash'));
        setPaymentNotes('');
    };

    const handlePartialPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(paymentAmount);
        if (amount <= 0) {
            Swal.fire(t('msg_error'), t('msg_payment_amount_positive'), 'error');
            return;
        }
        if (amount > selectedDue.amount_due) {
            Swal.fire(t('msg_error'), t('msg_payment_exceed_due'), 'error');
            return;
        }

        try {
            const response = await makePartialPayment({ id: selectedDue.id, store_id: currentStoreId, amount, payment_method: paymentMethod, notes: paymentNotes }).unwrap();
            const updated = { ...selectedDue, amount_due: selectedDue.amount_due - amount, payment_status: selectedDue.amount_due - amount <= 0 ? 'paid' : 'partial' };
            const transaction = { id: response?.data?.transaction?.id || Date.now(), amount, payment_method: paymentMethod, paid_at: new Date().toISOString(), notes: paymentNotes };
            closePaymentModal();
            setTimeout(() => {
                setReceiptPurchaseOrder(updated);
                setReceiptTransaction(transaction);
                setShowReceipt(true);
            }, 100);
        } catch (err: any) {
            Swal.fire(t('msg_error'), err?.data?.message || t('msg_payment_failed'), 'error');
        }
    };

    const handleFullPayment = async () => {
        if (!selectedDue) return;
        try {
            const response = await clearFullDue({ id: selectedDue.id, store_id: currentStoreId, payment_method: paymentMethod, notes: paymentNotes || t('msg_due_cleared') }).unwrap();
            const updated = { ...selectedDue, amount_due: 0, payment_status: 'paid' };
            const transaction = {
                id: response?.data?.transaction?.id || Date.now(),
                amount: selectedDue.amount_due,
                payment_method: paymentMethod,
                paid_at: new Date().toISOString(),
                notes: paymentNotes || t('msg_due_cleared'),
            };
            closePaymentModal();
            setTimeout(() => {
                setReceiptPurchaseOrder(updated);
                setReceiptTransaction(transaction);
                setShowReceipt(true);
            }, 100);
        } catch (err: any) {
            Swal.fire(t('msg_error'), err?.data?.message || t('msg_failed_to_clear_due'), 'error');
        }
    };

    const handleDeleteOrder = async (due: any) => {
        if (due.payment_status !== 'pending' || due.status !== 'ordered') {
            Swal.fire({
                title: t('msg_delete_not_possible'),
                html: `<p class="mb-3">${t('msg_po_cannot_be_deleted')}</p>
                    <div class="text-left bg-gray-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-700 mb-2"><strong>${t('msg_delete_allowed_when')}</strong></p>
                        <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                            <li>${t('lbl_payment_status')}: <strong class="text-red-600">${t('lbl_status_pending')}</strong></li>
                            <li>${t('lbl_order_status')}: <strong class="text-blue-600">${t('lbl_status_ordered')}</strong></li>
                        </ul>
                    </div>`,
                icon: 'error',
                confirmButtonText: t('btn_ok'),
                confirmButtonColor: '#dc2626',
            });
            return;
        }
        const result = await Swal.fire({
            title: t('msg_delete_po_confirm'),
            html: `<p>${t('msg_are_you_sure_delete_po')} <strong>${due.invoice_number}</strong>?</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t('btn_yes_delete'),
            cancelButtonText: t('btn_cancel'),
        });
        if (!result.isConfirmed) return;
        try {
            await deletePurchaseDue(due.id).unwrap();
            Swal.fire({ title: t('msg_deleted'), text: t('msg_po_deleted_successfully'), icon: 'success', timer: 2000, showConfirmButton: false });
        } catch (err: any) {
            Swal.fire(t('msg_error'), err?.data?.message || t('msg_failed_to_delete_po'), 'error');
        }
    };

    // ─── Is order in "new" state? (show receive, delete) ───
    const isNewOrder = (order: any) => {
        return order.status === 'ordered' && (!order.quantity_received || order.quantity_received === '0' || parseFloat(order.quantity_received) === 0);
    };
    const isCompleted = (order: any) => {
        return order.payment_status === 'paid' && (order.status === 'received' || order.status === 'completed');
    };

    const getReceiveProgress = (items: any[] = []) => {
        const ordered = items.reduce((sum, item) => sum + (parseFloat(item.quantity_ordered || item.quantity || 0) || 0), 0);
        const received = items.reduce((sum, item) => sum + (parseFloat(item.quantity_received || 0) || 0), 0);
        const remaining = Math.max(0, ordered - received);
        const percent = ordered > 0 ? Math.min(100, Math.round((received / ordered) * 100)) : 0;
        return { ordered, received, remaining, percent };
    };

    const getItemSubtotal = (item: any) => {
        const qty = parseFloat(item.quantity_ordered || item.quantity || 0);
        const price = parseFloat(item.purchase_price || item.unit_price || 0);
        return parseFloat(item.estimated_subtotal) || parseFloat(item.subtotal) || parseFloat(item.total) || qty * price;
    };

    const canReceiveMore = (order: any) => {
        if (!order || ['received', 'completed', 'cancelled'].includes(order.status)) return false;
        return getReceiveProgress(order.items || []).remaining > 0;
    };

    const canPaySupplier = (order: any) => order && parseFloat(order.amount_due || 0) > 0 && order.payment_status !== 'paid';

    // ─── Status filter chips ───
    const statusFilters: { key: OrderStatusFilter; label: string }[] = [
        { key: 'all', label: t('lbl_all') },
        { key: 'ordered', label: t('purchase_lifecycle_goods_not_received') },
        { key: 'received', label: t('purchase_lifecycle_goods_received') },
        { key: 'due', label: t('purchase_lifecycle_supplier_due') },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                        <Package className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('purchase_page_title')}</h1>
                        <p className="text-sm text-gray-500">{t('purchase_page_desc')}</p>
                    </div>
                </div>
                <Link
                    href="/purchases/create"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#046ca9] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#046ca9]/90"
                >
                    <Plus className="h-4 w-4" />
                    {t('btn_create_purchase_order')}
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {summaryCards.map((card) => (
                    <div key={card.label} className="flex items-center gap-4 rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>{card.icon}</div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">{card.label}</p>
                            <p className="text-xl font-bold text-gray-800">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('drafts')}
                        className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors ${
                            activeTab === 'drafts' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FileText className="h-4 w-4" />
                        {t('purchase_drafts')}
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors ${
                            activeTab === 'orders' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <ShoppingCart className="h-4 w-4" />
                        {t('lbl_purchase_orders')}
                    </button>
                </div>

                {/* Status Filter Chips (Orders tab only) */}
                {activeTab === 'orders' && (
                    <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-1.5">
                            {statusFilters.map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => {
                                        setOrderStatusFilter(f.key);
                                        setOrderPage(1);
                                    }}
                                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                                        orderStatusFilter === f.key ? 'bg-[#046ca9] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <div className="w-full sm:w-64">
                            <input
                                type="text"
                                value={filterSearch}
                                onChange={(e) => {
                                    setFilterSearch(e.target.value);
                                    setOrderPage(1);
                                }}
                                placeholder={t('lbl_search') + '...'}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>
                )}

                {/* Drafts Tab */}
                {activeTab === 'drafts' && (
                    <div className="p-4">
                        <DraftsTable
                            drafts={drafts}
                            isLoading={draftsLoading}
                            pagination={{
                                currentPage: draftsPagination?.current_page || 1,
                                totalPages: draftsPagination?.last_page || 1,
                                itemsPerPage: draftsPagination?.per_page || 15,
                                totalItems: draftsPagination?.total || 0,
                                onPageChange: setDraftPage,
                                onItemsPerPageChange: setDraftPerPage,
                            }}
                            sorting={{
                                field: draftSortField,
                                direction: draftSortDirection,
                                onSort: (f) => {
                                    if (draftSortField === f) setDraftSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'));
                                    else {
                                        setDraftSortField(f);
                                        setDraftSortDirection('asc');
                                    }
                                },
                            }}
                            onViewItems={handleViewItems}
                            onConvertToPO={handleConvertToPurchaseOrder}
                            onDelete={handleDeleteDraft}
                        />
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="p-4">
                        <PurchaseOrdersTable
                            orders={orders}
                            isLoading={ordersLoading}
                            pagination={{
                                currentPage: ordersPagination?.current_page || 1,
                                totalPages: ordersPagination?.last_page || 1,
                                itemsPerPage: ordersPagination?.per_page || 15,
                                totalItems: ordersPagination?.total || 0,
                                onPageChange: setOrderPage,
                                onItemsPerPageChange: setOrderPerPage,
                            }}
                            sorting={{
                                field: orderSortField,
                                direction: orderSortDirection,
                                onSort: (f) => {
                                    if (orderSortField === f) setOrderSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'));
                                    else {
                                        setOrderSortField(f);
                                        setOrderSortDirection('asc');
                                    }
                                },
                            }}
                            onViewItems={handleViewItems}
                            onPrint={handlePrint}
                            onReceiveItems={handleReceiveItems}
                            onViewTransactions={handleViewTransactions}
                            onPartialPayment={(order) => openPaymentModal('partial', order)}
                            onDelete={handleDeleteOrder}
                            onReturn={handleReturn}
                            showReceive
                            showDelete
                            showReturn
                        />
                    </div>
                )}
            </div>

            {/* ─── Modals ─── */}

            {/* View Items Modal */}
            {viewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{modalTitle}</h2>
                                <DateColumn date={selectedPurchase?.created_at || selectedPurchase?.updated_at} />
                            </div>
                            <button
                                onClick={() => {
                                    setViewModalOpen(false);
                                    setSelectedPurchase(null);
                                }}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="max-h-[calc(90vh-73px)] overflow-y-auto p-6">
                            {selectedItems.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center">
                                    <Package className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                    <p className="text-gray-500">{t('msg_no_items_found')}</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {(() => {
                                        const progress = getReceiveProgress(selectedItems);
                                        const itemTotal = selectedItems.reduce((sum: number, item: any) => sum + getItemSubtotal(item), 0);
                                        const transactions = selectedPurchase?.pos_transactions || [];
                                        return (
                                            <>
                                                <div className="flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-blue-900">{t('purchase_next_step')}</p>
                                                        <p className="text-sm text-blue-700">
                                                            {canReceiveMore(selectedPurchase)
                                                                ? t('purchase_action_receive_remaining')
                                                                : canPaySupplier(selectedPurchase)
                                                                  ? t('purchase_action_pay_due')
                                                                  : t('purchase_all_done')}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {canReceiveMore(selectedPurchase) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleReceiveItems(selectedPurchase)}
                                                                className="min-h-11 rounded-lg bg-[#046ca9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#046ca9]/90"
                                                            >
                                                                {t('purchase_action_receive_remaining')}
                                                            </button>
                                                        )}
                                                        {canPaySupplier(selectedPurchase) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setViewModalOpen(false);
                                                                    openPaymentModal('partial', selectedPurchase);
                                                                }}
                                                                className="min-h-11 rounded-lg border border-[#046ca9] bg-white px-4 py-2 text-sm font-semibold text-[#046ca9] hover:bg-[#046ca9]/5"
                                                            >
                                                                {t('purchase_action_pay_due')}
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePrint(selectedPurchase)}
                                                            className="min-h-11 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                                        >
                                                            {t('btn_print')}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                    <div className="rounded-lg border border-gray-100 bg-slate-50 p-4">
                                                        <p className="text-sm font-medium text-gray-500">{t('lbl_total')}</p>
                                                        <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(selectedPurchase?.grand_total ?? itemTotal)}</p>
                                                    </div>
                                                    <div className="rounded-lg border border-gray-100 bg-emerald-50 p-4">
                                                        <p className="text-sm font-medium text-emerald-700">{t('lbl_amount_paid')}</p>
                                                        <p className="mt-1 text-xl font-bold text-emerald-700">{formatCurrency(selectedPurchase?.amount_paid || 0)}</p>
                                                    </div>
                                                    <div className="rounded-lg border border-gray-100 bg-amber-50 p-4">
                                                        <p className="text-sm font-medium text-amber-700">{t('lbl_amount_due')}</p>
                                                        <p className="mt-1 text-xl font-bold text-amber-700">{formatCurrency(selectedPurchase?.amount_due || 0)}</p>
                                                    </div>
                                                    <div className="rounded-lg border border-gray-100 bg-blue-50 p-4">
                                                        <p className="text-sm font-medium text-blue-700">{t('lbl_received')}</p>
                                                        <p className="mt-1 text-xl font-bold text-blue-700">{progress.percent}%</p>
                                                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                                                            <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress.percent}%` }} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                                                    <div className="rounded-lg border border-gray-100 p-4">
                                                        <h3 className="mb-3 text-sm font-bold text-gray-800">{t('lbl_purchase_order')}</h3>
                                                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                                                            <div>
                                                                <p className="text-sm text-gray-500">{t('lbl_invoice')}</p>
                                                                <p className="font-semibold text-gray-900">{selectedPurchase?.invoice_number || selectedPurchase?.draft_reference || '-'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">{t('lbl_store')}</p>
                                                                <p className="font-semibold text-gray-900">{selectedPurchase?.store_name || '-'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">{t('lbl_order_status')}</p>
                                                                <p className="font-semibold text-gray-900">{selectedPurchase?.status ? t(`lbl_status_${selectedPurchase.status}`) : '-'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">{t('lbl_payment_status')}</p>
                                                                <p className="font-semibold text-gray-900">{selectedPurchase?.payment_status ? t(`lbl_payment_status_${selectedPurchase.payment_status}`) : '-'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-lg border border-gray-100 p-4">
                                                        <h3 className="mb-3 text-sm font-bold text-gray-800">{t('lbl_supplier')}</h3>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between gap-3">
                                                                <span className="text-gray-500">{t('lbl_name')}</span>
                                                                <span className="text-right font-semibold text-gray-900">{selectedPurchase?.supplier?.name || t('lbl_walk_in_purchase')}</span>
                                                            </div>
                                                            <div className="flex justify-between gap-3">
                                                                <span className="text-gray-500">{t('lbl_phone')}</span>
                                                                <span className="text-right text-gray-800">{selectedPurchase?.supplier?.phone || '-'}</span>
                                                            </div>
                                                            <div className="flex justify-between gap-3">
                                                                <span className="text-gray-500">{t('lbl_email')}</span>
                                                                <span className="text-right text-gray-800">{selectedPurchase?.supplier?.email || '-'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-lg border border-gray-100 p-4">
                                                    <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                                        <h3 className="text-sm font-bold text-gray-800">{t('lbl_items')}</h3>
                                                        <p className="text-xs text-gray-500">
                                                            {t('status_ordered')}: {progress.ordered} · {t('lbl_already_received')}: {progress.received} · {t('purchase_remaining_qty')}: {progress.remaining}
                                                        </p>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="bg-gray-50 text-xs uppercase text-gray-500">
                                                                    <th className="px-4 py-3 text-left">#</th>
                                                                    <th className="px-4 py-3 text-left">{t('lbl_product')}</th>
                                                                    <th className="px-4 py-3 text-right">{t('status_ordered')}</th>
                                                                    <th className="px-4 py-3 text-right">{t('lbl_already_received')}</th>
                                                                    <th className="px-4 py-3 text-right">{t('lbl_unit_price')}</th>
                                                                    <th className="px-4 py-3 text-right">{t('lbl_subtotal')}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {selectedItems.map((itm: any, i: number) => {
                                                                    const productName = itm.product_name || itm.product || t('lbl_na');
                                                                    const orderedQty = parseFloat(itm.quantity_ordered || itm.quantity || 0);
                                                                    const receivedQty = parseFloat(itm.quantity_received || 0);
                                                                    const price = parseFloat(itm.purchase_price || itm.unit_price || 0);
                                                                    const subtotal = getItemSubtotal(itm);
                                                                    return (
                                                                        <tr key={i} className="hover:bg-gray-50">
                                                                            <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                                                            <td className="px-4 py-3">
                                                                                <p className="font-medium text-gray-800">{productName}</p>
                                                                                {itm.variant_name && <p className="text-xs text-gray-500">{t('lbl_variant')}: {itm.variant_name}</p>}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-right text-gray-600">{orderedQty}</td>
                                                                            <td className="px-4 py-3 text-right text-gray-600">{receivedQty}</td>
                                                                            <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(price)}</td>
                                                                            <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatCurrency(subtotal)}</td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                <div className="rounded-lg border border-gray-100 p-4">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <h3 className="text-sm font-bold text-gray-800">{t('lbl_transactions')}</h3>
                                                        <span className="text-xs text-gray-500">{transactions.length}</span>
                                                    </div>
                                                    {transactions.length === 0 ? (
                                                        <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">{t('msg_no_transactions_recorded')}</p>
                                                    ) : (
                                                        <div className="divide-y divide-gray-100">
                                                            {transactions.map((trx: any) => (
                                                                <div key={trx.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                                                                    <div>
                                                                        <p className="font-semibold text-gray-800">{formatCurrency(trx.amount || 0)} · {trx.payment_method || '-'}</p>
                                                                        <p className="text-xs text-gray-500">{trx.paid_at || trx.created_at || '-'}</p>
                                                                    </div>
                                                                    <p className="text-sm text-gray-500">{trx.notes || '-'}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction Tracking Modal */}
            {transactionModalOpen && selectedTransactionOrder && (
                <TransactionTrackingModal
                    isOpen={transactionModalOpen}
                    purchaseOrder={selectedTransactionOrder}
                    onClose={() => {
                        setTransactionModalOpen(false);
                        setSelectedTransactionOrder(null);
                    }}
                />
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedDue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h2 className="text-lg font-bold text-gray-800">{paymentModalType === 'full' ? t('purchase_clear_due') : t('purchase_partial_payment')}</h2>
                            <button onClick={closePaymentModal} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={paymentModalType === 'partial' ? handlePartialPayment : handleFullPayment} className="space-y-4 p-6">
                            <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('lbl_invoice')}</span>
                                    <span className="font-semibold">{selectedDue.invoice_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('lbl_total')}</span>
                                    <span className="font-semibold">{formatCurrency(selectedDue.grand_total)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('lbl_due')}</span>
                                    <span className="font-semibold text-red-600">{formatCurrency(selectedDue.amount_due)}</span>
                                </div>
                            </div>
                            {paymentModalType === 'partial' && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_payment_amount')}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={selectedDue.amount_due}
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                        required
                                    />
                                </div>
                            )}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_payment_method')}</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                >
                                    {activePaymentMethods.map((m: any) => (
                                        <option key={m.id} value={m.payment_method_name}>
                                            {m.payment_method_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_notes')}</label>
                                <input
                                    type="text"
                                    value={paymentNotes}
                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closePaymentModal} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    {t('lbl_cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPaymentLoading || isClearingDue}
                                    className="flex-1 rounded-lg bg-[#046ca9] py-2.5 text-sm font-semibold text-white hover:bg-[#046ca9]/90 disabled:opacity-50"
                                >
                                    {paymentModalType === 'full' ? t('purchase_clear_due') : t('lbl_pay')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Receipt */}
            {showReceipt && receiptTransaction && receiptPurchaseOrder && (
                <PaymentReceipt
                    transaction={receiptTransaction}
                    purchaseOrder={receiptPurchaseOrder}
                    onClose={() => {
                        setShowReceipt(false);
                        setReceiptTransaction(null);
                        setReceiptPurchaseOrder(null);
                    }}
                />
            )}
        </div>
    );
};

export default PurchaseOrderListPage;
