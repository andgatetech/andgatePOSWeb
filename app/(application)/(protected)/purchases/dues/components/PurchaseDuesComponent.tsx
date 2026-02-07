'use client';
import PaymentReceipt from '@/app/(application)/(protected)/purchases/list/components/PaymentReceipt';
import TransactionTrackingModal from '@/app/(application)/(protected)/purchases/list/components/TransactionTrackingModal';
import PurchaseDuesFilter from '@/components/filters/PurchaseDuesFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import type { RootState } from '@/store';
import { useClearFullDueMutation, useGetPurchaseOrdersQuery, useMakePartialPaymentMutation } from '@/store/features/PurchaseOrder/PurchaseOrderApi';
import { useDeletePurchaseDueMutation } from '@/store/features/purchaseDue/purchaseDue';
import { DollarSign, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import PurchaseDuesTable from './PurchaseDuesTable';

const PurchaseDuesComponent = () => {
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const [filters, setFilters] = useState<Record<string, any>>({ exclude_completed: 'true' });

    // Pagination and sorting state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'view' | 'partial' | 'full'>('view');
    const [selectedDue, setSelectedDue] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');

    // Get payment methods from Redux
    const paymentMethods = useSelector((state: RootState) => state.auth.currentStore?.payment_methods || []);
    const activePaymentMethods = paymentMethods.filter((pm) => pm.is_active);

    // Payment receipt state
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptTransaction, setReceiptTransaction] = useState<any>(null);
    const [receiptPurchaseOrder, setReceiptPurchaseOrder] = useState<any>(null);

    // Transaction tracking modal state
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<any>(null);

    // Fetch purchase orders (dues) with filters
    const { data: duesResponse, isLoading } = useGetPurchaseOrdersQuery({
        ...filters,
        store_id: currentStoreId,
        page: currentPage,
        per_page: itemsPerPage,
        sort_field: sortField,
        sort_direction: sortDirection,
    });

    const [makePartialPayment, { isLoading: isPaymentLoading }] = useMakePartialPaymentMutation();
    const [clearFullDue, { isLoading: isClearingDue }] = useClearFullDueMutation();
    const [deletePurchaseDue] = useDeletePurchaseDueMutation();

    // Extract data from API response (filtering is handled by backend with exclude_completed parameter)
    const dues = duesResponse?.data?.items || [];
    const pagination = duesResponse?.data?.pagination;
    const stats = duesResponse?.data?.stats || null;

    // Filter change handler
    const handleFilterChange = useCallback((newFilters: Record<string, any>) => {
        setFilters(newFilters);
        setCurrentPage(1);
    }, []);

    // Print handler
    const handlePrint = (item: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const title = `Purchase Order: ${item.invoice_number}`;
        const items = item.items || [];

        const total = items.reduce((sum: number, itm: any) => {
            const subtotal = parseFloat(itm.subtotal) || parseFloat(itm.total) || 0;
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
                        border-bottom: 3px solid #dc2626;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        font-size: 28px;
                        color: #b91c1c;
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
                        background: #fef2f2;
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
                        background: linear-gradient(to right, #fee2e2, #fecaca);
                    }
                    th {
                        padding: 12px;
                        text-align: left;
                        font-size: 13px;
                        font-weight: 600;
                        color: #b91c1c;
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
                        border-top: 2px solid #dc2626;
                    }
                    .due-section {
                        background: #fef2f2;
                        padding: 20px;
                        border-radius: 8px;
                        border-left: 4px solid #dc2626;
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
                    <h1>💰 Purchase Due Invoice</h1>
                    <p>${item.store_name || 'Store'}</p>
                </div>

                <div class="info-section">
                    <div class="info-box">
                        <h3>Invoice Number</h3>
                        <p>${item.invoice_number}</p>
                    </div>
                    ${
                        item.supplier
                            ? `
                        <div class="info-box">
                            <h3>Supplier</h3>
                            <p>${item.supplier.name || 'Walk-in Purchase'}</p>
                        </div>
                    `
                            : ''
                    }
                    <div class="info-box">
                        <h3>Grand Total</h3>
                        <p style="color: #2563eb; font-size: 20px;">${formatCurrency(item.grand_total)}</p>
                    </div>
                    <div class="info-box">
                        <h3>Payment Status</h3>
                        <p style="text-transform: uppercase; font-weight: 600; color: ${item.payment_status === 'paid' ? '#059669' : item.payment_status === 'partial' ? '#d97706' : '#dc2626'};">
                            ${item.payment_status || 'N/A'}
                        </p>
                    </div>
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
                                const subtotal = parseFloat(itm.subtotal) || parseFloat(itm.total) || quantity * unitPrice;

                                return `
                                <tr>
                                    <td class="text-center">${idx + 1}</td>
                                    <td>
                                        ${productName}
                                        ${isVariant && variantName ? '<br><span style="font-size: 11px; color: #2563eb; font-weight: 600;">Variant: ' + variantName + '</span>' : ''}
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
                            <td class="text-right" style="color: #dc2626;">${formatCurrency(total)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div class="due-section">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <div>
                            <h3 style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px;">Amount Paid</h3>
                            <p style="font-size: 18px; color: #059669; font-weight: 700;">${formatCurrency(item.amount_paid)}</p>
                        </div>
                        <div>
                            <h3 style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px;">Amount Due</h3>
                            <p style="font-size: 24px; color: #dc2626; font-weight: 700;">${formatCurrency(item.amount_due)}</p>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p>Generated on ${new Date().toLocaleString()}</p>
                    <p style="margin-top: 5px;">Please clear the due amount at your earliest convenience.</p>
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

    // Pagination handlers
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleItemsPerPageChange = useCallback((items: number) => {
        setItemsPerPage(items);
        setCurrentPage(1);
    }, []);

    // Sorting handler
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Modal handlers
    const openModal = (type: 'view' | 'partial' | 'full', due: any) => {
        setModalType(type);
        setSelectedDue(due);
        setShowModal(true);
        setPaymentAmount('');
        setPaymentMethod(activePaymentMethods[0]?.payment_method_name || '');
        setPaymentNotes('');
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDue(null);
        setPaymentAmount('');
        setPaymentMethod(activePaymentMethods[0]?.payment_method_name || '');
        setPaymentNotes('');
    };

    // Payment handlers
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

            // Update purchase order with new amount_due for receipt
            const updatedPurchaseOrder = {
                ...selectedDue,
                amount_due: selectedDue.amount_due - amount,
                payment_status: selectedDue.amount_due - amount <= 0 ? 'paid' : 'partial',
            };

            // Create transaction object for receipt
            const transaction = {
                id: response?.data?.transaction?.id || response?.transaction?.id || Date.now(),
                amount: amount,
                payment_method: paymentMethod,
                paid_at: new Date().toISOString(),
                notes: paymentNotes,
            };

            // Close payment modal first
            closeModal();

            // Set receipt data and show
            setTimeout(() => {
                setReceiptPurchaseOrder(updatedPurchaseOrder);
                setReceiptTransaction(transaction);
                setShowReceipt(true);

                console.log('Receipt should show:', { updatedPurchaseOrder, transaction });

                // Show success message
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

            // Update purchase order with amount_due = 0 for receipt
            const updatedPurchaseOrder = {
                ...selectedDue,
                amount_due: 0,
                payment_status: 'paid',
            };

            // Create transaction object for receipt
            const transaction = {
                id: response?.data?.transaction?.id || response?.transaction?.id || Date.now(),
                amount: selectedDue.amount_due,
                payment_method: paymentMethod,
                paid_at: new Date().toISOString(),
                notes: paymentNotes || 'Full payment - due cleared',
            };

            // Close payment modal first
            closeModal();

            // Set receipt data and show
            setTimeout(() => {
                setReceiptPurchaseOrder(updatedPurchaseOrder);
                setReceiptTransaction(transaction);
                setShowReceipt(true);

                console.log('Receipt should show:', { updatedPurchaseOrder, transaction });

                // Show success message
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

    const handleDelete = async (due: any) => {
        // Check if purchase due can be deleted (only pending payment and ordered status)
        if (due.payment_status !== 'pending' || due.status !== 'ordered') {
            Swal.fire({
                title: 'Delete Not Possible',
                html: `
                    <p class="mb-3">This purchase due cannot be deleted.</p>
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
            title: 'Delete Purchase Due?',
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
                text: 'Purchase due has been deleted successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (err: any) {
            const errorMessage = err?.data?.message || 'Failed to delete purchase due';
            Swal.fire('Error', errorMessage, 'error');
        }
    };

    // Utility functions
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { bg: string; text: string; label: string }> = {
            pending: { bg: 'bg-red-100', text: 'text-red-700', label: 'Pending' },
            partial: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Partial' },
            paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
            unpaid: { bg: 'bg-red-100', text: 'text-red-700', label: 'Unpaid' },
        };

        const badge = badges[status] || badges.pending;
        return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>{badge.label}</span>;
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <section className="mb-8">
                <div className="rounded-2xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-red-700 shadow-md sm:h-12 sm:w-12">
                                <DollarSign className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Purchase Dues Management</h1>
                                <p className="text-xs text-gray-500 sm:text-sm">Track and manage all purchase dues efficiently</p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    {stats && (
                        <div className="space-y-2">
                            {/* First Row - Payment Status */}
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                                <div className="rounded-lg bg-blue-50 p-2.5">
                                    <p className="text-[10px] font-medium text-blue-600">Total Dues</p>
                                    <p className="text-lg font-bold text-blue-900">{stats.total_purchase_orders || 0}</p>
                                </div>
                                <div className="rounded-lg bg-red-50 p-2.5">
                                    <p className="text-[10px] font-medium text-red-600">Payment Pending</p>
                                    <p className="text-lg font-bold text-red-900">{stats.payment_status_pending || 0}</p>
                                </div>
                                <div className="rounded-lg bg-yellow-50 p-2.5">
                                    <p className="text-[10px] font-medium text-yellow-600">Partially Paid</p>
                                    <p className="text-lg font-bold text-yellow-900">{stats.payment_status_partial || 0}</p>
                                </div>
                                <div className="rounded-lg bg-green-50 p-2.5">
                                    <p className="text-[10px] font-medium text-green-600">Fully Paid</p>
                                    <p className="text-lg font-bold text-green-900">{stats.payment_status_paid || 0}</p>
                                </div>
                                <div className="rounded-lg bg-orange-50 p-2.5">
                                    <p className="text-[10px] font-medium text-orange-600">Overdue</p>
                                    <p className="text-lg font-bold text-orange-900">{stats.payment_status_due || 0}</p>
                                </div>
                            </div>

                            {/* Second Row - Receiving Status & Financial */}
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                                <div className="rounded-lg bg-indigo-50 p-2.5">
                                    <p className="text-[10px] font-medium text-indigo-600">Not Received</p>
                                    <p className="text-lg font-bold text-indigo-900">{stats.receiving_status_ordered || 0}</p>
                                </div>
                                <div className="rounded-lg bg-amber-50 p-2.5">
                                    <p className="text-[10px] font-medium text-amber-600">Partially Received</p>
                                    <p className="text-lg font-bold text-amber-900">{stats.receiving_status_partially_received || 0}</p>
                                </div>
                                <div className="rounded-lg bg-teal-50 p-2.5">
                                    <p className="text-[10px] font-medium text-teal-600">Fully Received</p>
                                    <p className="text-lg font-bold text-teal-900">{stats.receiving_status_received || 0}</p>
                                </div>
                                <div className="rounded-lg bg-purple-50 p-2.5">
                                    <p className="text-[10px] font-medium text-purple-600">Total Amount</p>
                                    <p className="text-base font-bold text-purple-900">{formatCurrency(stats.total_order_amount || 0)}</p>
                                </div>
                                <div className="rounded-lg bg-emerald-50 p-2.5">
                                    <p className="text-[10px] font-medium text-emerald-600">Amount Due</p>
                                    <p className="text-base font-bold text-emerald-900">{formatCurrency(stats.total_amount_due || 0)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <div className="panel">
                {/* Filter Bar */}
                <div className="mb-5">
                    <PurchaseDuesFilter onFilterChange={handleFilterChange} />
                </div>

                {/* Purchase Dues Table */}
                <PurchaseDuesTable
                    dues={dues}
                    isLoading={isLoading}
                    pagination={{
                        currentPage: pagination?.current_page || 1,
                        totalPages: pagination?.last_page || 1,
                        itemsPerPage: pagination?.per_page || 15,
                        totalItems: pagination?.total || 0,
                        onPageChange: handlePageChange,
                        onItemsPerPageChange: handleItemsPerPageChange,
                    }}
                    sorting={{
                        field: sortField,
                        direction: sortDirection,
                        onSort: handleSort,
                    }}
                    onViewItems={(due) => openModal('view', due)}
                    onPrint={handlePrint}
                    onReceiveItems={(due) => (window.location.href = `/purchases/receive/${due.id}`)}
                    onViewTransactions={(due) => {
                        setSelectedOrderForTracking(due);
                        setShowTransactionModal(true);
                    }}
                    onPartialPayment={(due) => openModal('partial', due)}
                    onClearFullDue={(due) => openModal('full', due)}
                    onDelete={handleDelete}
                />
            </div>

            {/* Modal */}
            {showModal && selectedDue && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="relative max-h-[90vh] w-full max-w-md overflow-auto rounded-lg bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {modalType === 'view' && 'Purchase Due Details'}
                                {modalType === 'partial' && 'Make Partial Payment'}
                                {modalType === 'full' && 'Clear Full Due'}
                            </h2>
                            <button onClick={closeModal} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {modalType === 'view' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Invoice Number</label>
                                            <p className="font-semibold text-gray-900">{selectedDue.invoice_number}</p>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                                            <div>{getStatusBadge(selectedDue.payment_status)}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Store</label>
                                            <p className="text-gray-900">{selectedDue.store_name}</p>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Supplier</label>
                                            <p className="text-gray-900">{selectedDue.supplier?.name || 'Walk-in'}</p>
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                                                <span className="font-semibold text-gray-900">{formatCurrency(selectedDue.grand_total)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-700">Paid Amount:</span>
                                                <span className="font-semibold text-green-600">{formatCurrency(selectedDue.amount_paid)}</span>
                                            </div>
                                            <div className="flex justify-between border-t pt-3">
                                                <span className="text-base font-bold text-gray-700">Due Amount:</span>
                                                <span className="text-lg font-bold text-red-600">{formatCurrency(selectedDue.amount_due)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedDue.notes && (
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                                            <p className="text-gray-900">{selectedDue.notes}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Created At</label>
                                            <p className="text-gray-600">{formatDate(selectedDue.created_at)}</p>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Updated At</label>
                                            <p className="text-gray-600">{formatDate(selectedDue.updated_at)}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button onClick={closeModal} className="rounded-lg bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">
                                            Close
                                        </button>
                                    </div>
                                </div>
                            ) : modalType === 'partial' ? (
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
                                            onClick={closeModal}
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
                                            onClick={closeModal}
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
            <TransactionTrackingModal isOpen={showTransactionModal} purchaseOrder={selectedOrderForTracking} onClose={() => setShowTransactionModal(false)} />
        </div>
    );
};

export default PurchaseDuesComponent;
