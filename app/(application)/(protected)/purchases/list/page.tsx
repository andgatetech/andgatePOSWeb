'use client';
import PaymentReceipt from '@/app/(application)/(protected)/purchases/list/components/PaymentReceipt';
import TransactionTrackingModal from '@/app/(application)/(protected)/purchases/list/components/TransactionTrackingModal';

import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
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
import { CheckCircle, FileText, Loader, Package, ShoppingCart, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import DraftsTable from './components/DraftsTable';
import PurchaseCompletedTable from './components/PurchaseCompletedTable';
import PurchaseNewTable from './components/PurchaseNewTable';
import PurchaseProgressTable from './components/PurchaseProgressTable';

type TabType = 'drafts' | 'new' | 'progress' | 'completed';

const PurchaseOrderListPage = () => {
    const router = useRouter();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState<TabType>('drafts');

    // View items modal
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [modalTitle, setModalTitle] = useState('');

    // Transaction tracking modal
    const [transactionModalOpen, setTransactionModalOpen] = useState(false);
    const [selectedTransactionOrder, setSelectedTransactionOrder] = useState<any>(null);

    // Payment modal state (from dues page)
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentModalType, setPaymentModalType] = useState<'partial' | 'full'>('partial');
    const [selectedDue, setSelectedDue] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');

    // Payment receipt state
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptTransaction, setReceiptTransaction] = useState<any>(null);
    const [receiptPurchaseOrder, setReceiptPurchaseOrder] = useState<any>(null);

    // Get payment methods from Redux
    const paymentMethods = useSelector((state: RootState) => state.auth.currentStore?.payment_methods || []);
    const activePaymentMethods = paymentMethods.filter((pm) => pm.is_active);

    // ─── Filters per tab ───
    const [draftFilters, setDraftFilters] = useState<Record<string, any>>({});
    const [newFilters, setNewFilters] = useState<Record<string, any>>({});
    const [progressFilters, setProgressFilters] = useState<Record<string, any>>({});
    const [completedFilters, setCompletedFilters] = useState<Record<string, any>>({});

    // ─── Pagination per tab ───
    const [draftPage, setDraftPage] = useState(1);
    const [draftPerPage, setDraftPerPage] = useState(15);
    const [draftSortField, setDraftSortField] = useState('created_at');
    const [draftSortDirection, setDraftSortDirection] = useState<'asc' | 'desc'>('desc');

    const [newPage, setNewPage] = useState(1);
    const [newPerPage, setNewPerPage] = useState(15);
    const [newSortField, setNewSortField] = useState('created_at');
    const [newSortDirection, setNewSortDirection] = useState<'asc' | 'desc'>('desc');

    const [progressPage, setProgressPage] = useState(1);
    const [progressPerPage, setProgressPerPage] = useState(15);
    const [progressSortField, setProgressSortField] = useState('created_at');
    const [progressSortDirection, setProgressSortDirection] = useState<'asc' | 'desc'>('desc');

    const [completedPage, setCompletedPage] = useState(1);
    const [completedPerPage, setCompletedPerPage] = useState(15);
    const [completedSortField, setCompletedSortField] = useState('created_at');
    const [completedSortDirection, setCompletedSortDirection] = useState<'asc' | 'desc'>('desc');

    // ─── Helper to clean filters ───
    const cleanFilters = (filters: Record<string, any>) => {
        // Remove storeId/store_id as we handle it explicitly with currentStoreId
        const { storeId, store_id, ...rest } = filters;
        return rest;
    };

    // ─── RTK Queries — lazy via `skip` ───
    const { data: draftsResponse, isLoading: draftsLoading } = useGetPurchaseDraftsQuery(
        {
            ...cleanFilters(draftFilters),
            store_id: currentStoreId,
            page: draftPage,
            per_page: draftPerPage,
            sort_field: draftSortField,
            sort_direction: draftSortDirection,
        },
        { skip: activeTab !== 'drafts' }
    );

    const { data: newOrdersResponse, isLoading: newOrdersLoading } = useGetPurchaseOrdersQuery(
        {
            po_filter: 'new',
            ...cleanFilters(newFilters),
            store_id: currentStoreId,
            page: newPage,
            per_page: newPerPage,
            sort_field: newSortField,
            sort_direction: newSortDirection,
        },
        { skip: activeTab !== 'new' }
    );

    const { data: progressOrdersResponse, isLoading: progressOrdersLoading } = useGetPurchaseOrdersQuery(
        {
            po_filter: 'progress',
            ...cleanFilters(progressFilters),
            store_id: currentStoreId,
            page: progressPage,
            per_page: progressPerPage,
            sort_field: progressSortField,
            sort_direction: progressSortDirection,
        },
        { skip: activeTab !== 'progress' }
    );

    const { data: completedOrdersResponse, isLoading: completedOrdersLoading } = useGetPurchaseOrdersQuery(
        {
            po_filter: 'completed',
            ...cleanFilters(completedFilters),
            store_id: currentStoreId,
            page: completedPage,
            per_page: completedPerPage,
            sort_field: completedSortField,
            sort_direction: completedSortDirection,
        },
        { skip: activeTab !== 'completed' }
    );

    // ─── Mutations ───
    const [convertToPO, { isLoading: isConverting }] = useConvertDraftToPurchaseOrderMutation();
    const [deleteDraft] = useDeletePurchaseDraftMutation();
    const [makePartialPayment, { isLoading: isPaymentLoading }] = useMakePartialPaymentMutation();
    const [clearFullDue, { isLoading: isClearingDue }] = useClearFullDueMutation();
    const [deletePurchaseDue] = useDeletePurchaseDueMutation();

    // ─── Extract data ───
    const drafts = draftsResponse?.data?.items || [];
    const draftsPagination = draftsResponse?.data?.pagination;

    const newOrders = newOrdersResponse?.data?.items || [];
    const newOrdersPagination = newOrdersResponse?.data?.pagination;
    const newStats = newOrdersResponse?.data?.stats || null;

    const progressOrders = progressOrdersResponse?.data?.items || [];
    const progressOrdersPagination = progressOrdersResponse?.data?.pagination;
    const progressStats = progressOrdersResponse?.data?.stats || null;

    const completedOrders = completedOrdersResponse?.data?.items || [];
    const completedOrdersPagination = completedOrdersResponse?.data?.pagination;
    const completedStats = completedOrdersResponse?.data?.stats || null;

    // ─── Shared handlers ───
    const handleViewItems = (item: any) => {
        const title = item.draft_reference ? `Draft: ${item.draft_reference}` : `Purchase Order: ${item.invoice_number}`;
        setSelectedItems(item.items || []);
        setModalTitle(title);
        setViewModalOpen(true);
    };

    const handlePrint = (item: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const isDraft = !!item.draft_reference;
        const title = isDraft ? `Draft: ${item.draft_reference}` : `Purchase Order: ${item.invoice_number}`;
        const items = item.items || [];

        const total = items.reduce((sum: number, itm: any) => {
            const subtotal = parseFloat(itm.estimated_subtotal) || parseFloat(itm.subtotal) || parseFloat(itm.total) || 0;
            return sum + subtotal;
        }, 0);

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print ${title}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 40px;
                        color: #333;
                        background: white;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 3px solid #2563eb;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        font-size: 28px;
                        color: #1e40af;
                        margin-bottom: 5px;
                        font-weight: 700;
                    }
                    .header p {
                        color: #6b7280;
                        font-size: 14px;
                    }
                    .info-section {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                        background: #f9fafb;
                        padding: 20px;
                        border-radius: 8px;
                    }
                    .info-box { flex: 1; }
                    .info-box h3 {
                        font-size: 12px;
                        color: #6b7280;
                        text-transform: uppercase;
                        margin-bottom: 8px;
                        font-weight: 600;
                        letter-spacing: 0.5px;
                    }
                    .info-box p {
                        font-size: 16px;
                        color: #111827;
                        font-weight: 500;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                        border: 1px solid #e5e7eb;
                    }
                    thead {
                        background: linear-gradient(to right, #dbeafe, #e0e7ff);
                    }
                    th {
                        padding: 12px;
                        text-align: left;
                        font-size: 13px;
                        font-weight: 600;
                        color: #1e40af;
                        border-bottom: 2px solid #cbd5e1;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                    }
                    td {
                        padding: 12px;
                        border-bottom: 1px solid #e5e7eb;
                        font-size: 14px;
                    }
                    tbody tr:hover { background: #f9fafb; }
                    tbody tr:last-child td { border-bottom: none; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .total-row {
                        background: #f3f4f6;
                        font-weight: 700;
                        font-size: 16px;
                    }
                    .total-row td {
                        padding: 15px 12px;
                        border-top: 2px solid #2563eb;
                    }
                    .badge {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 11px;
                        font-weight: 600;
                        text-transform: uppercase;
                    }
                    .badge-new {
                        background: #fef3c7;
                        color: #92400e;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        color: #6b7280;
                        font-size: 12px;
                    }
                    @media print {
                        body { padding: 20px; }
                        .info-section { break-inside: avoid; }
                        table { break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${isDraft ? '📋 Purchase Draft' : '📦 Purchase Order'}</h1>
                    <p>${item.store_name || 'Store'}</p>
                </div>

                <div class="info-section">
                    <div class="info-box">
                        <h3>${isDraft ? 'Draft Reference' : 'Invoice Number'}</h3>
                        <p>${isDraft ? item.draft_reference : item.invoice_number}</p>
                    </div>
                    ${
                        item.supplier
                            ? `
                        <div class="info-box">
                            <h3>Supplier</h3>
                            <p>${item.supplier.name || item.supplier}</p>
                        </div>
                    `
                            : ''
                    }
                    <div class="info-box">
                        <h3>${isDraft ? 'Estimated Total' : 'Grand Total'}</h3>
                        <p style="color: #2563eb; font-size: 20px;">${formatCurrency(isDraft ? item.estimated_total : item.grand_total)}</p>
                    </div>
                    ${
                        !isDraft
                            ? `
                        <div class="info-box">
                            <h3>Payment Status</h3>
                            <p style="text-transform: uppercase; font-weight: 600; color: ${item.payment_status === 'paid' ? '#059669' : item.payment_status === 'partial' ? '#d97706' : '#dc2626'};">
                                ${item.payment_status || 'N/A'}
                            </p>
                        </div>
                    `
                            : ''
                    }
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 50px;">#</th>
                            <th>Product Name</th>
                            <th class="text-center" style="width: 100px;">Quantity</th>
                            <th class="text-right" style="width: 120px;">Unit Price</th>
                            <th class="text-center" style="width: 80px;">Unit</th>
                            <th class="text-right" style="width: 120px;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items
                            .map((itm: any, idx: number) => {
                                const productName = itm.product_name || itm.product || 'N/A';
                                const variantName = itm.variant_name || null;
                                const isVariant = itm.is_variant || false;
                                const quantity = parseFloat(itm.quantity_ordered) || 0;
                                const unitPrice = parseFloat(itm.purchase_price) || 0;
                                const subtotal = parseFloat(itm.estimated_subtotal) || parseFloat(itm.subtotal) || parseFloat(itm.total) || quantity * unitPrice;
                                const isNew = itm.is_new_product || itm.product_id === null;

                                return `
                                <tr>
                                    <td class="text-center">${idx + 1}</td>
                                    <td>
                                        ${productName}
                                        ${isVariant && variantName ? '<br><span style="font-size: 11px; color: #2563eb; font-weight: 600;">Variant: ' + variantName + '</span>' : ''}
                                        ${isNew ? '<span class="badge badge-new">New</span>' : ''}
                                    </td>
                                    <td class="text-center"><strong>${quantity}</strong></td>
                                    <td class="text-right">${formatCurrency(unitPrice)}</td>
                                    <td class="text-center">${itm.unit || 'piece'}</td>
                                    <td class="text-right"><strong>${formatCurrency(subtotal)}</strong></td>
                                </tr>
                            `;
                            })
                            .join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="5" class="text-right">TOTAL:</td>
                            <td class="text-right" style="color: #2563eb;">${formatCurrency(total)}</td>
                        </tr>
                    </tfoot>
                </table>

                ${
                    !isDraft && item.amount_paid > 0
                        ? `
                    <div class="info-section">
                        <div class="info-box">
                            <h3>Amount Paid</h3>
                            <p style="color: #059669;">${formatCurrency(item.amount_paid)}</p>
                        </div>
                        <div class="info-box">
                            <h3>Amount Due</h3>
                            <p style="color: #dc2626;">${formatCurrency(item.amount_due)}</p>
                        </div>
                    </div>
                `
                        : ''
                }

                <div class="footer">
                    <p>Generated on ${new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p style="margin-top: 5px;">Thank you for your business!</p>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `);

        printWindow.document.close();
    };

    const handleReceiveItems = (order: any) => {
        router.push(`/purchases/receive/${order.id}`);
    };

    const handleViewTransactions = (order: any) => {
        setSelectedTransactionOrder(order);
        setTransactionModalOpen(true);
    };

    // ─── Draft handlers ───
    const handleConvertToPurchaseOrder = async (draft: any) => {
        const isConfirmed = await showConfirmDialog(
            'Convert to Purchase Order?',
            `<p>Convert draft <strong>${draft.draft_reference}</strong> to an official purchase order?</p>`,
            'Yes, Convert',
            'Cancel'
        );

        if (!isConfirmed) return;

        try {
            const response = await convertToPO({
                id: draft.id,
                notes: 'Converted from draft',
            }).unwrap();

            // The response structure might be { success: true, data: { purchase_order: { ... } } } or flattened
            const responseData = response.data || response;
            const purchaseOrder = responseData.purchase_order || responseData;

            // Validate response - if invoice_number is missing, it's likely a backend error (e.g. PHP exception rendered as HTML)
            // or we failed to extract the purchase order correctly
            if (!purchaseOrder || !purchaseOrder.invoice_number) {
                console.error('Invalid purchase order response:', response);
                throw new Error('Failed to create purchase order. Please try again.');
            }

            const invoiceNumber = purchaseOrder.invoice_number;

            showSuccessDialog(
                'Purchase Order Created!',
                `<p>Invoice: <strong>${invoiceNumber}</strong></p><p>Total: <strong>${formatCurrency(purchaseOrder.grand_total || purchaseOrder.total || 0)}</strong></p>`,
                'View Purchase Orders'
            ).then(() => {
                setActiveTab('new');
            });
        } catch (error: any) {
            console.error('Error converting draft:', error);
            const errorMsg = error?.data?.error || error?.data?.message || error?.message || 'Failed to convert draft';
            showErrorDialog('Backend Error', errorMsg);
        }
    };

    const handleDeleteDraft = async (draft: any) => {
        const isConfirmed = await showConfirmDialog('Delete Draft?', `Are you sure you want to delete draft ${draft.draft_reference}?`, 'Yes, Delete', 'Cancel');

        if (!isConfirmed) return;

        try {
            await deleteDraft(draft.id).unwrap();
            showSuccessDialog('Deleted!', 'Draft has been deleted');
        } catch (error: any) {
            showErrorDialog('Error', error?.data?.message || 'Failed to delete draft');
        }
    };

    // ─── Payment modal handlers (from dues) ───
    const openPaymentModal = (type: 'partial' | 'full', due: any) => {
        setPaymentModalType(type);
        setSelectedDue(due);
        setShowPaymentModal(true);
        setPaymentAmount('');
        setPaymentMethod(activePaymentMethods[0]?.payment_method_name || 'cash');
        setPaymentNotes('');
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setSelectedDue(null);
        setPaymentAmount('');
        setPaymentMethod(activePaymentMethods[0]?.payment_method_name || 'cash');
        setPaymentNotes('');
    };

    const handlePartialPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(paymentAmount);
        if (amount <= 0) {
            Swal.fire('Error', 'Payment amount must be greater than 0', 'error');
            return;
        }
        if (amount > selectedDue.amount_due) {
            Swal.fire('Error', 'Payment amount cannot exceed due amount', 'error');
            return;
        }

        try {
            const response = await makePartialPayment({
                id: selectedDue.id,
                store_id: currentStoreId,
                amount,
                payment_method: paymentMethod,
                notes: paymentNotes,
            }).unwrap();

            const updatedPurchaseOrder = {
                ...selectedDue,
                amount_due: selectedDue.amount_due - amount,
                payment_status: selectedDue.amount_due - amount <= 0 ? 'paid' : 'partial',
            };

            const transaction = {
                id: response?.data?.transaction?.id || response?.transaction?.id || Date.now(),
                amount: amount,
                payment_method: paymentMethod,
                paid_at: new Date().toISOString(),
                notes: paymentNotes,
            };

            closePaymentModal();

            setTimeout(() => {
                setReceiptPurchaseOrder(updatedPurchaseOrder);
                setReceiptTransaction(transaction);
                setShowReceipt(true);

                Swal.fire({
                    title: 'Success!',
                    text: 'Partial payment made successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }, 100);
        } catch (err: any) {
            const errorMessage = err?.data?.message || 'Payment failed';
            Swal.fire('Error', errorMessage, 'error');
        }
    };

    const handleFullPayment = async () => {
        if (!selectedDue) return;

        try {
            const response = await clearFullDue({
                id: selectedDue.id,
                store_id: currentStoreId,
                payment_method: paymentMethod,
                notes: paymentNotes || 'Full payment - due cleared',
            }).unwrap();

            const updatedPurchaseOrder = {
                ...selectedDue,
                amount_due: 0,
                payment_status: 'paid',
            };

            const transaction = {
                id: response?.data?.transaction?.id || response?.transaction?.id || Date.now(),
                amount: selectedDue.amount_due,
                payment_method: paymentMethod,
                paid_at: new Date().toISOString(),
                notes: paymentNotes || 'Full payment - due cleared',
            };

            closePaymentModal();

            setTimeout(() => {
                setReceiptPurchaseOrder(updatedPurchaseOrder);
                setReceiptTransaction(transaction);
                setShowReceipt(true);

                Swal.fire({
                    title: 'Success!',
                    text: 'Full due cleared successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }, 100);
        } catch (err: any) {
            const errorMessage = err?.data?.message || 'Failed to clear due';
            Swal.fire('Error', errorMessage, 'error');
        }
    };

    const handleDeleteOrder = async (due: any) => {
        if (due.payment_status !== 'pending' || due.status !== 'ordered') {
            Swal.fire({
                title: 'Delete Not Possible',
                html: `
                    <p class="mb-3">This purchase order cannot be deleted.</p>
                    <div class="text-left bg-gray-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-700 mb-2"><strong>Delete is only allowed when:</strong></p>
                        <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                            <li>Payment Status: <strong class="text-red-600">Pending</strong></li>
                            <li>Order Status: <strong class="text-blue-600">Ordered</strong></li>
                        </ul>
                        <div class="mt-3 pt-3 border-t border-gray-200">
                            <p class="text-sm text-gray-700"><strong>Current Status:</strong></p>
                            <p class="text-sm text-gray-600">Payment: <strong class="text-${due.payment_status === 'pending' ? 'green' : 'red'}-600">${due.payment_status || 'N/A'}</strong></p>
                            <p class="text-sm text-gray-600">Order: <strong class="text-${due.status === 'ordered' ? 'green' : 'red'}-600">${due.status || 'N/A'}</strong></p>
                        </div>
                    </div>
                `,
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#dc2626',
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Delete Purchase Order?',
            html: `<p>Are you sure you want to delete <strong>${due.invoice_number}</strong>?</p><p class="text-sm text-gray-500 mt-2">This action cannot be undone.</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) return;

        try {
            await deletePurchaseDue(due.id).unwrap();
            Swal.fire({
                title: 'Deleted!',
                text: 'Purchase order has been deleted successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (err: any) {
            const errorMessage = err?.data?.message || 'Failed to delete purchase order';
            Swal.fire('Error', errorMessage, 'error');
        }
    };

    // ─── Sorting handlers ───
    const handleDraftSort = (field: string) => {
        if (draftSortField === field) {
            setDraftSortDirection(draftSortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setDraftSortField(field);
            setDraftSortDirection('asc');
        }
    };

    const handleNewSort = (field: string) => {
        if (newSortField === field) {
            setNewSortDirection(newSortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setNewSortField(field);
            setNewSortDirection('asc');
        }
    };

    const handleProgressSort = (field: string) => {
        if (progressSortField === field) {
            setProgressSortDirection(progressSortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setProgressSortField(field);
            setProgressSortDirection('asc');
        }
    };

    const handleCompletedSort = (field: string) => {
        if (completedSortField === field) {
            setCompletedSortDirection(completedSortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setCompletedSortField(field);
            setCompletedSortDirection('asc');
        }
    };

    // ─── Filter components per tab ───
    const renderFilter = () => {
        switch (activeTab) {
            case 'drafts':
                return <UniversalFilter onFilterChange={setDraftFilters} />;
            case 'new':
                return <UniversalFilter onFilterChange={setNewFilters} />;
            case 'progress':
                return <UniversalFilter onFilterChange={setProgressFilters} />;
            case 'completed':
                return <UniversalFilter onFilterChange={setCompletedFilters} />;
        }
    };

    // ─── Tab config ───
    const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
        {
            key: 'drafts',
            label: 'Drafts',
            icon: <FileText className="mr-2 inline h-5 w-5" />,
        },
        {
            key: 'new',
            label: 'Purchase New',
            icon: <ShoppingCart className="mr-2 inline h-5 w-5" />,
        },
        {
            key: 'progress',
            label: 'Purchase Progress',
            icon: <Loader className="mr-2 inline h-5 w-5" />,
        },
        {
            key: 'completed',
            label: 'Completed',
            icon: <CheckCircle className="mr-2 inline h-5 w-5" />,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <section className="mb-8">
                <div className="rounded-2xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md sm:h-12 sm:w-12">
                                <Package className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Purchase Orders</h1>
                                <p className="text-xs text-gray-500 sm:text-sm">Manage your purchase orders and drafts efficiently</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-start sm:flex-shrink-0 sm:justify-end">
                            <Link
                                href="/purchases/create"
                                className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto sm:px-6 sm:py-3"
                            >
                                <Package className="mr-2 h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110 sm:h-5 sm:w-5" />
                                <span className="whitespace-nowrap">Create Purchase Order</span>
                                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className="panel">
                {/* Tabs */}
                <div className="mb-5 flex flex-wrap gap-2 border-b">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            className={`px-4 py-2 font-semibold transition-colors ${activeTab === tab.key ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="mb-5">{renderFilter()}</div>

                {/* Drafts Tab */}
                {activeTab === 'drafts' && (
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
                            onSort: handleDraftSort,
                        }}
                        onViewItems={handleViewItems}
                        onConvertToPO={handleConvertToPurchaseOrder}
                        onDelete={handleDeleteDraft}
                    />
                )}

                {/* Purchase New Tab */}
                {activeTab === 'new' && (
                    <PurchaseNewTable
                        orders={newOrders}
                        isLoading={newOrdersLoading}
                        pagination={{
                            currentPage: newOrdersPagination?.current_page || 1,
                            totalPages: newOrdersPagination?.last_page || 1,
                            itemsPerPage: newOrdersPagination?.per_page || 15,
                            totalItems: newOrdersPagination?.total || 0,
                            onPageChange: setNewPage,
                            onItemsPerPageChange: setNewPerPage,
                        }}
                        sorting={{
                            field: newSortField,
                            direction: newSortDirection,
                            onSort: handleNewSort,
                        }}
                        onViewItems={handleViewItems}
                        onPrint={handlePrint}
                        onReceiveItems={handleReceiveItems}
                        onViewTransactions={handleViewTransactions}
                        onPartialPayment={(order) => openPaymentModal('partial', order)}
                        onClearFullDue={(order) => openPaymentModal('full', order)}
                        onDelete={handleDeleteOrder}
                    />
                )}

                {/* Purchase Progress Tab */}
                {activeTab === 'progress' && (
                    <PurchaseProgressTable
                        orders={progressOrders}
                        isLoading={progressOrdersLoading}
                        pagination={{
                            currentPage: progressOrdersPagination?.current_page || 1,
                            totalPages: progressOrdersPagination?.last_page || 1,
                            itemsPerPage: progressOrdersPagination?.per_page || 15,
                            totalItems: progressOrdersPagination?.total || 0,
                            onPageChange: setProgressPage,
                            onItemsPerPageChange: setProgressPerPage,
                        }}
                        sorting={{
                            field: progressSortField,
                            direction: progressSortDirection,
                            onSort: handleProgressSort,
                        }}
                        onViewItems={handleViewItems}
                        onPrint={handlePrint}
                        onReceiveItems={handleReceiveItems}
                        onViewTransactions={handleViewTransactions}
                        onPartialPayment={(order) => openPaymentModal('partial', order)}
                        onClearFullDue={(order) => openPaymentModal('full', order)}
                    />
                )}

                {/* Completed Tab */}
                {activeTab === 'completed' && (
                    <PurchaseCompletedTable
                        orders={completedOrders}
                        isLoading={completedOrdersLoading}
                        pagination={{
                            currentPage: completedOrdersPagination?.current_page || 1,
                            totalPages: completedOrdersPagination?.last_page || 1,
                            itemsPerPage: completedOrdersPagination?.per_page || 15,
                            totalItems: completedOrdersPagination?.total || 0,
                            onPageChange: setCompletedPage,
                            onItemsPerPageChange: setCompletedPerPage,
                        }}
                        sorting={{
                            field: completedSortField,
                            direction: completedSortDirection,
                            onSort: handleCompletedSort,
                        }}
                        onViewItems={handleViewItems}
                        onPrint={handlePrint}
                        onViewTransactions={handleViewTransactions}
                    />
                )}
            </div>

            {/* View Items Modal */}
            {viewModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                            <h2 className="text-xl font-bold text-gray-800">{modalTitle}</h2>
                            <button onClick={() => setViewModalOpen(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            {selectedItems.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center">
                                    <Package className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                    <p className="text-gray-500">No items found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                                <th className="border-b border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                                                <th className="border-b border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
                                                <th className="border-b border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">Quantity</th>
                                                <th className="border-b border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700">Unit Price</th>
                                                <th className="border-b border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">Unit</th>
                                                <th className="border-b border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            {selectedItems.map((item: any, index: number) => {
                                                const productName = item.product_name || item.product || 'N/A';
                                                const variantName = item.variant_name || null;
                                                const isVariant = item.is_variant || false;
                                                const sku = item.sku || null;
                                                const description = item.description || null;
                                                const unitPrice = parseFloat(item.purchase_price) || 0;
                                                const unit = item.unit || 'piece';
                                                const quantity = parseFloat(item.quantity_ordered) || 0;
                                                const subtotal = parseFloat(item.estimated_subtotal) || parseFloat(item.subtotal) || parseFloat(item.total) || quantity * unitPrice;
                                                const isNewProduct = item.is_new_product || item.product_id === null;

                                                return (
                                                    <tr key={item.id || index} className="border-b border-gray-200 hover:bg-blue-50">
                                                        <td className="px-4 py-3 text-sm">{index + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{productName}</p>
                                                                {isVariant && variantName && <p className="text-xs font-medium text-blue-600">Variant: {variantName}</p>}
                                                                {sku && <p className="text-xs text-gray-500">SKU: {sku}</p>}
                                                                {description && <p className="text-xs text-gray-400">{description}</p>}
                                                                {isNewProduct && (
                                                                    <span className="mt-1 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                                                        New Product
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">{quantity}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(unitPrice)}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">{unit}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(subtotal)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gray-50">
                                                <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                                    Total:
                                                </td>
                                                <td className="px-4 py-3 text-right text-lg font-bold text-primary">
                                                    {formatCurrency(
                                                        selectedItems.reduce((sum, item) => {
                                                            const unitPrice = parseFloat(item.purchase_price) || 0;
                                                            const quantity = parseFloat(item.quantity_ordered) || 0;
                                                            const subtotal = parseFloat(item.estimated_subtotal) || parseFloat(item.subtotal) || parseFloat(item.total) || quantity * unitPrice;
                                                            return sum + subtotal;
                                                        }, 0)
                                                    )}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => setViewModalOpen(false)} className="rounded-lg bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedDue && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="relative max-h-[90vh] w-full max-w-md overflow-auto rounded-lg bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                            <h2 className="text-xl font-bold text-gray-800">{paymentModalType === 'partial' ? 'Make Partial Payment' : 'Clear Full Due'}</h2>
                            <button onClick={closePaymentModal} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {paymentModalType === 'partial' ? (
                                <form onSubmit={handlePartialPayment} className="space-y-4">
                                    <div className="rounded-lg bg-blue-50 p-4">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-700">Total Due:</span>
                                            <span className="font-bold text-red-600">{formatCurrency(selectedDue.amount_due)}</span>
                                        </div>
                                        <div className="text-xs text-gray-600">Invoice: {selectedDue.invoice_number}</div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Payment Amount <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            max={selectedDue.amount_due}
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            className="form-input w-full"
                                            placeholder="Enter payment amount"
                                            required
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Maximum: {formatCurrency(selectedDue.amount_due)}</p>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Payment Method <span className="text-red-500">*</span>
                                        </label>
                                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="form-select w-full" required>
                                            {activePaymentMethods.length > 0 ? (
                                                activePaymentMethods.map((method) => (
                                                    <option key={method.id} value={method.payment_method_name}>
                                                        {method.payment_method_name.charAt(0).toUpperCase() + method.payment_method_name.slice(1)}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="cash">Cash</option>
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Notes (Optional)</label>
                                        <textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} rows={3} className="form-textarea w-full" placeholder="Add payment notes" />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closePaymentModal}
                                            className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                                            disabled={isPaymentLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                                            disabled={isPaymentLoading}
                                        >
                                            {isPaymentLoading ? 'Processing...' : 'Make Payment'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleFullPayment();
                                    }}
                                    className="space-y-4"
                                >
                                    <div className="rounded-lg bg-blue-50 p-4">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-700">Total Due:</span>
                                            <span className="font-bold text-red-600">{formatCurrency(selectedDue.amount_due)}</span>
                                        </div>
                                        <div className="text-xs text-gray-600">Invoice: {selectedDue.invoice_number}</div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Payment Amount <span className="text-red-500">*</span>
                                        </label>
                                        <input type="number" step="0.01" value={selectedDue.amount_due} className="form-input w-full bg-gray-100" readOnly disabled />
                                        <p className="mt-1 text-xs text-green-600">Full amount will be cleared</p>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Payment Method <span className="text-red-500">*</span>
                                        </label>
                                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="form-select w-full" required>
                                            {activePaymentMethods.length > 0 ? (
                                                activePaymentMethods.map((method) => (
                                                    <option key={method.id} value={method.payment_method_name}>
                                                        {method.payment_method_name.charAt(0).toUpperCase() + method.payment_method_name.slice(1)}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="cash">Cash</option>
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Notes (Optional)</label>
                                        <textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} rows={3} className="form-textarea w-full" placeholder="Add payment notes" />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closePaymentModal}
                                            className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                                            disabled={isClearingDue}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                            disabled={isClearingDue}
                                        >
                                            {isClearingDue ? 'Processing...' : 'Clear Full Due'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Receipt Modal */}
            {showReceipt && receiptTransaction && receiptPurchaseOrder && (
                <PaymentReceipt
                    purchaseOrder={receiptPurchaseOrder}
                    transaction={receiptTransaction}
                    onClose={() => {
                        setShowReceipt(false);
                        setReceiptTransaction(null);
                        setReceiptPurchaseOrder(null);
                    }}
                />
            )}

            {/* Transaction Tracking Modal */}
            <TransactionTrackingModal isOpen={transactionModalOpen} purchaseOrder={selectedTransactionOrder} onClose={() => setTransactionModalOpen(false)} />
        </div>
    );
};

export default PurchaseOrderListPage;
