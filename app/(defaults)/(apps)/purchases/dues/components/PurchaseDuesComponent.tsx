'use client';
import PurchaseDuesFilter from '@/components/filters/PurchaseDuesFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useClearFullDueMutation, useGetPurchaseOrdersQuery, useMakePartialPaymentMutation } from '@/store/features/PurchaseOrder/PurchaseOrderApi';
import { CreditCard, DollarSign, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import Swal from 'sweetalert2';
import PurchaseDuesTable from './PurchaseDuesTable';

const PurchaseDuesComponent = () => {
    const { currentStoreId } = useCurrentStore();
    const [filters, setFilters] = useState<Record<string, any>>({});

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
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentNotes, setPaymentNotes] = useState('');

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

    // Extract data from API response
    const dues = duesResponse?.data?.items || [];
    const pagination = duesResponse?.data?.pagination;

    // Calculate summary from items
    const summary =
        dues.length > 0
            ? {
                  total_dues_count: dues.length,
                  pending_count: dues.filter((d: any) => d.payment_status === 'pending').length,
                  partial_count: dues.filter((d: any) => d.payment_status === 'partial').length,
                  paid_count: dues.filter((d: any) => d.payment_status === 'paid').length,
                  total_amount: dues.reduce((sum: number, d: any) => sum + parseFloat(d.grand_total || 0), 0),
                  total_paid: dues.reduce((sum: number, d: any) => sum + parseFloat(d.amount_paid || 0), 0),
                  total_due: dues.reduce((sum: number, d: any) => sum + parseFloat(d.amount_due || 0), 0),
              }
            : null;

    // Filter change handler
    const handleFilterChange = useCallback((newFilters: Record<string, any>) => {
        setFilters(newFilters);
        setCurrentPage(1);
    }, []);

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
        setPaymentMethod('cash');
        setPaymentNotes('');
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDue(null);
        setPaymentAmount('');
        setPaymentMethod('cash');
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
            await makePartialPayment({
                id: selectedDue.id,
                store_id: currentStoreId,
                amount,
                payment_method: paymentMethod,
                notes: paymentNotes,
            }).unwrap();

            Swal.fire('Success!', 'Partial payment made successfully', 'success');
            closeModal();
        } catch (err: any) {
            const errorMessage = err?.data?.message || 'Payment failed';
            Swal.fire('Error', errorMessage, 'error');
        }
    };

    const handleFullPayment = async () => {
        if (!selectedDue) return;

        const result = await Swal.fire({
            title: 'Clear Full Due?',
            html: `<p>This will mark the full due of <strong>৳${formatCurrency(selectedDue.amount_due)}</strong> as paid.</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, clear it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                await clearFullDue({
                    id: selectedDue.id,
                    store_id: currentStoreId,
                    payment_method: paymentMethod,
                    notes: paymentNotes || 'Full payment - due cleared',
                }).unwrap();

                Swal.fire('Success!', 'Full due cleared successfully', 'success');
                closeModal();
            } catch (err: any) {
                const errorMessage = err?.data?.message || 'Failed to clear due';
                Swal.fire('Error', errorMessage, 'error');
            }
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
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
                    {summary && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                            <div className="rounded-lg bg-blue-50 p-3">
                                <p className="text-xs text-blue-600">Total Dues</p>
                                <p className="text-lg font-bold text-blue-900">{summary.total_dues_count || 0}</p>
                            </div>
                            <div className="rounded-lg bg-red-50 p-3">
                                <p className="text-xs text-red-600">Pending</p>
                                <p className="text-lg font-bold text-red-900">{summary.pending_count || 0}</p>
                            </div>
                            <div className="rounded-lg bg-yellow-50 p-3">
                                <p className="text-xs text-yellow-600">Partial</p>
                                <p className="text-lg font-bold text-yellow-900">{summary.partial_count || 0}</p>
                            </div>
                            <div className="rounded-lg bg-green-50 p-3">
                                <p className="text-xs text-green-600">Paid</p>
                                <p className="text-lg font-bold text-green-900">{summary.paid_count || 0}</p>
                            </div>
                            <div className="rounded-lg bg-purple-50 p-3">
                                <p className="text-xs text-purple-600">Total Amount</p>
                                <p className="text-lg font-bold text-purple-900">৳{formatCurrency(summary.total_amount || 0)}</p>
                            </div>
                            <div className="rounded-lg bg-orange-50 p-3">
                                <p className="text-xs text-orange-600">Total Paid</p>
                                <p className="text-lg font-bold text-orange-900">৳{formatCurrency(summary.total_paid || 0)}</p>
                            </div>
                            <div className="rounded-lg bg-red-50 p-3">
                                <p className="text-xs text-red-600">Total Due</p>
                                <p className="text-lg font-bold text-red-900">৳{formatCurrency(summary.total_due || 0)}</p>
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
                    onViewDetails={(due) => openModal('view', due)}
                    onPartialPayment={(due) => openModal('partial', due)}
                    onClearFullDue={(due) => openModal('full', due)}
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
                                                <span className="font-semibold text-gray-900">৳{formatCurrency(selectedDue.grand_total)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-700">Paid Amount:</span>
                                                <span className="font-semibold text-green-600">৳{formatCurrency(selectedDue.amount_paid)}</span>
                                            </div>
                                            <div className="flex justify-between border-t pt-3">
                                                <span className="text-base font-bold text-gray-700">Due Amount:</span>
                                                <span className="text-lg font-bold text-red-600">৳{formatCurrency(selectedDue.amount_due)}</span>
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
                                            <span className="font-bold text-red-600">৳{formatCurrency(selectedDue.amount_due)}</span>
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
                                        <p className="mt-1 text-xs text-gray-500">Maximum: ৳{formatCurrency(selectedDue.amount_due)}</p>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Payment Method <span className="text-red-500">*</span>
                                        </label>
                                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="form-select w-full" required>
                                            <option value="cash">Cash</option>
                                            <option value="debit">Debit Card</option>
                                            <option value="credit">Credit Card</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="cheque">Cheque</option>
                                            <option value="other">Other</option>
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
                                <div className="space-y-4">
                                    <div className="rounded-lg bg-green-50 p-4">
                                        <div className="mb-2 flex justify-between">
                                            <span className="text-sm font-medium text-gray-700">Amount to Clear:</span>
                                            <span className="font-bold text-red-600">৳{formatCurrency(selectedDue.amount_due)}</span>
                                        </div>
                                        <div className="text-xs text-gray-600">Invoice: {selectedDue.invoice_number}</div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Payment Method <span className="text-red-500">*</span>
                                        </label>
                                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="form-select w-full" required>
                                            <option value="cash">Cash</option>
                                            <option value="debit">Debit Card</option>
                                            <option value="credit">Credit Card</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="cheque">Cheque</option>
                                            <option value="other">Other</option>
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
                                            type="button"
                                            onClick={handleFullPayment}
                                            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                            disabled={isClearingDue}
                                        >
                                            <CreditCard className="mr-2 inline h-4 w-4" />
                                            {isClearingDue ? 'Processing...' : 'Clear Due'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseDuesComponent;
