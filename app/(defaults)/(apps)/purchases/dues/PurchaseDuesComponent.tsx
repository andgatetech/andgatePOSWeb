'use client';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import Dropdown from '@/components/dropdown';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useClearFullDueMutation, useGetPurchaseDuesQuery, useMakePartialPaymentMutation } from '@/store/features/purchaseDue/purchaseDue';
import { CheckCircle, CreditCard, DollarSign, Eye, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import PurchaseDuesFilter from './PurchaseDuesFilter';

const PurchaseDuesComponent = () => {
    const { currentStoreId, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const {
        data: duesResponse,
        error,
        isLoading,
    } = useGetPurchaseDuesQuery({
        ...apiParams,
        page: currentPage,
        per_page: itemsPerPage,
    });
    const [makePartialPayment] = useMakePartialPaymentMutation();
    const [clearFullDue] = useClearFullDueMutation();

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('view'); // 'view', 'partial', 'full'
    const [selectedDue, setSelectedDue] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset filter when current store changes from sidebar
    useEffect(() => {
        console.log('Purchase Dues - Current store changed, resetting filters');
        setApiParams({});
    }, [currentStoreId]);

    // Handle filter changes from PurchaseDuesFilter - RTK Query will auto-refetch when apiParams change
    const handleFilterChange = useCallback((newApiParams: Record<string, any>) => {
        console.log('PurchaseDuesComponent - Received API Params:', newApiParams);
        setApiParams(newApiParams);
        setCurrentPage(1); // Reset to first page when filters change
    }, []);

    // Pagination handlers
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleItemsPerPageChange = useCallback((items: number) => {
        setItemsPerPage(items);
        setCurrentPage(1); // Reset to first page when items per page changes
    }, []);

    const dues = useMemo(() => duesResponse?.data?.dues || [], [duesResponse?.data?.dues]);

    const showMessage = (msg = '', type: 'success' | 'error' = 'success') => {
        Swal.fire({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    const openModal = (type: string, due: any = null) => {
        setModalType(type);
        setSelectedDue(due);
        setShowModal(true);
        setPaymentAmount('');
        setPaymentMethod('cash');
        setPaymentNotes('');

        if (type === 'partial' && due) {
            // Set max amount to due amount
            setPaymentAmount('');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDue(null);
        setPaymentAmount('');
        setPaymentMethod('cash');
        setPaymentNotes('');
    };

    const handlePartialPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const amount = parseFloat(paymentAmount);
            if (amount <= 0) {
                showMessage('Payment amount must be greater than 0', 'error');
                setLoading(false);
                return;
            }
            if (amount > selectedDue.due_amount) {
                showMessage('Payment amount cannot exceed due amount', 'error');
                setLoading(false);
                return;
            }

            await makePartialPayment({
                id: selectedDue.id,
                amount,
                payment_method: paymentMethod,
                notes: paymentNotes,
            }).unwrap();
            showMessage('Partial payment made successfully', 'success');
            closeModal();
        } catch (err: any) {
            console.error('Error:', err);
            const errorMessage = err?.data?.message || 'Payment failed';
            showMessage(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFullPayment = async () => {
        if (!selectedDue) return;

        const result = await Swal.fire({
            title: 'Clear Full Due?',
            text: `This will mark the full due of ${selectedDue.due_amount} as paid. Continue?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, clear it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                await clearFullDue({
                    id: selectedDue.id,
                    payment_method: paymentMethod,
                    notes: paymentNotes || 'Full payment - due cleared',
                }).unwrap();
                showMessage('Full due cleared successfully', 'success');
                closeModal();
            } catch (err: any) {
                console.error('Error:', err);
                const errorMessage = err?.data?.message || 'Failed to clear due';
                showMessage(errorMessage, 'error');
            } finally {
                setLoading(false);
            }
        }
    };

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
        };

        const badge = badges[status] || badges.pending;
        return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>{badge.label}</span>;
    };

    // Define table columns
    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'invoice_number',
                label: 'Invoice',
                sortable: true,
                render: (value) => <span className="font-semibold text-blue-600">{value}</span>,
            },
            {
                key: 'store_name',
                label: 'Store',
                sortable: true,
                render: (value) => <span className="font-medium text-gray-900">{value}</span>,
            },
            {
                key: 'supplier_name',
                label: 'Supplier',
                sortable: true,
                render: (value) => <span className="text-sm text-gray-600">{value || 'N/A'}</span>,
            },
            {
                key: 'total_amount',
                label: 'Total Amount',
                sortable: true,
                render: (value) => <span className="font-semibold text-gray-900">৳{formatCurrency(value)}</span>,
            },
            {
                key: 'paid_amount',
                label: 'Paid',
                sortable: true,
                render: (value) => <span className="text-green-600">৳{formatCurrency(value)}</span>,
            },
            {
                key: 'due_amount',
                label: 'Due Amount',
                sortable: true,
                render: (value) => <span className={`font-bold ${value > 0 ? 'text-red-600' : value < 0 ? 'text-purple-600' : 'text-gray-600'}`}>৳{formatCurrency(value)}</span>,
            },
            {
                key: 'status',
                label: 'Status',
                sortable: true,
                render: (value) => getStatusBadge(value),
            },
            {
                key: 'created_at',
                label: 'Created At',
                sortable: true,
                render: (value) => <span className="text-sm text-gray-500">{formatDate(value)}</span>,
            },
        ],
        []
    );

    // Add actions dropdown to dues
    const duesWithActions = useMemo(
        () =>
            dues.map((due: any) => ({
                ...due,
                actions: (
                    <div className="flex justify-center">
                        <Dropdown
                            offset={[0, 5]}
                            placement="bottom-end"
                            btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            button={
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                </svg>
                            }
                        >
                            <ul className="min-w-[180px] rounded-lg border bg-white shadow-lg">
                                <li>
                                    <button
                                        onClick={() => openModal('view', due)}
                                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View Details
                                    </button>
                                </li>
                                {due.status !== 'paid' && due.due_amount > 0 && (
                                    <>
                                        <li className="border-t">
                                            <button
                                                onClick={() => openModal('partial', due)}
                                                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50"
                                            >
                                                <CreditCard className="h-4 w-4" />
                                                Partial Payment
                                            </button>
                                        </li>
                                        <li className="border-t">
                                            <button
                                                onClick={() => openModal('full', due)}
                                                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-green-600 transition-colors hover:bg-green-50"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                Clear Full Due
                                            </button>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </Dropdown>
                    </div>
                ),
            })),
        [dues]
    );

    // Add Actions column
    const columnsWithActions: TableColumn[] = useMemo(
        () => [
            ...columns,
            {
                key: 'actions',
                label: 'Actions',
                render: (value: any) => value,
                className: 'w-20 text-center',
            },
        ],
        [columns]
    );

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">Error loading purchase dues. Please try again later.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Purchase Dues Page Header */}
            <section className="mb-8">
                <div className="rounded-2xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-sm sm:p-6">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-red-700 shadow-md sm:h-12 sm:w-12">
                                <DollarSign className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Purchase Dues Management</h1>
                                <p className="text-xs text-gray-500 sm:text-sm">Track and manage all purchase dues</p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    {duesResponse?.data?.summary && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                            <div className="rounded-lg bg-blue-50 p-3">
                                <p className="text-xs text-blue-600">Total Dues</p>
                                <p className="text-lg font-bold text-blue-900">{duesResponse.data.summary.total_dues_count}</p>
                            </div>
                            <div className="rounded-lg bg-red-50 p-3">
                                <p className="text-xs text-red-600">Pending</p>
                                <p className="text-lg font-bold text-red-900">{duesResponse.data.summary.pending_count}</p>
                            </div>
                            <div className="rounded-lg bg-yellow-50 p-3">
                                <p className="text-xs text-yellow-600">Partial</p>
                                <p className="text-lg font-bold text-yellow-900">{duesResponse.data.summary.partial_count}</p>
                            </div>
                            <div className="rounded-lg bg-green-50 p-3">
                                <p className="text-xs text-green-600">Paid</p>
                                <p className="text-lg font-bold text-green-900">{duesResponse.data.summary.paid_count}</p>
                            </div>
                            <div className="rounded-lg bg-purple-50 p-3">
                                <p className="text-xs text-purple-600">Total Amount</p>
                                <p className="text-lg font-bold text-purple-900">৳{formatCurrency(duesResponse.data.summary.total_amount)}</p>
                            </div>
                            <div className="rounded-lg bg-orange-50 p-3">
                                <p className="text-xs text-orange-600">Total Paid</p>
                                <p className="text-lg font-bold text-orange-900">৳{formatCurrency(duesResponse.data.summary.total_paid)}</p>
                            </div>
                            <div className="rounded-lg bg-red-50 p-3">
                                <p className="text-xs text-red-600">Total Due</p>
                                <p className="text-lg font-bold text-red-900">৳{formatCurrency(duesResponse.data.summary.total_due)}</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Filter Bar */}
            <PurchaseDuesFilter key={`purchase-dues-filter-${currentStoreId}`} onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />

            {/* Purchase Dues Table */}
            <div className="mt-6">
                <ReusableTable
                    data={duesWithActions}
                    columns={columnsWithActions}
                    isLoading={isLoading}
                    pagination={{
                        currentPage: currentPage,
                        totalPages: Math.ceil((duesResponse?.data?.summary?.total_dues_count || 0) / itemsPerPage),
                        itemsPerPage: itemsPerPage,
                        totalItems: duesResponse?.data?.summary?.total_dues_count || 0,
                        onPageChange: handlePageChange,
                        onItemsPerPageChange: handleItemsPerPageChange,
                    }}
                    emptyState={{
                        icon: (
                            <div className="flex justify-center">
                                <DollarSign className="h-16 w-16 text-gray-400" />
                            </div>
                        ),
                        title: 'No purchase dues found',
                        description: 'All purchases are paid or no purchases exist',
                    }}
                />
            </div>

            {/* Modal */}
            {showModal && selectedDue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {modalType === 'view' && 'Purchase Due Details'}
                                {modalType === 'partial' && 'Make Partial Payment'}
                                {modalType === 'full' && 'Clear Full Due'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
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
                                            <div>{getStatusBadge(selectedDue.status)}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Store</label>
                                            <p className="text-gray-900">{selectedDue.store_name}</p>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Supplier</label>
                                            <p className="text-gray-900">{selectedDue.supplier_name || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                                                <span className="font-semibold text-gray-900">৳{formatCurrency(selectedDue.total_amount)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-700">Paid Amount:</span>
                                                <span className="font-semibold text-green-600">৳{formatCurrency(selectedDue.paid_amount)}</span>
                                            </div>
                                            <div className="flex justify-between border-t pt-3">
                                                <span className="text-base font-bold text-gray-700">Due Amount:</span>
                                                <span className="text-lg font-bold text-red-600">৳{formatCurrency(selectedDue.due_amount)}</span>
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
                                </div>
                            ) : modalType === 'partial' ? (
                                <form onSubmit={handlePartialPayment} className="space-y-4">
                                    <div className="rounded-lg bg-blue-50 p-4">
                                        <div className="mb-2 flex justify-between">
                                            <span className="text-sm font-medium text-gray-700">Total Due:</span>
                                            <span className="font-bold text-red-600">৳{formatCurrency(selectedDue.due_amount)}</span>
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
                                            max={selectedDue.due_amount}
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-orange-500"
                                            placeholder="Enter payment amount"
                                            required
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Maximum: ৳{formatCurrency(selectedDue.due_amount)}</p>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Payment Method <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-orange-500"
                                            required
                                        >
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
                                        <textarea
                                            value={paymentNotes}
                                            onChange={(e) => setPaymentNotes(e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-orange-500"
                                            placeholder="Add payment notes"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                                            disabled={loading}
                                        >
                                            {loading ? 'Processing...' : 'Make Payment'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="rounded-lg bg-green-50 p-4">
                                        <div className="mb-2 flex justify-between">
                                            <span className="text-sm font-medium text-gray-700">Amount to Clear:</span>
                                            <span className="font-bold text-red-600">৳{formatCurrency(selectedDue.due_amount)}</span>
                                        </div>
                                        <div className="text-xs text-gray-600">Invoice: {selectedDue.invoice_number}</div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Payment Method <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
                                            required
                                        >
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
                                        <textarea
                                            value={paymentNotes}
                                            onChange={(e) => setPaymentNotes(e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
                                            placeholder="Add payment notes"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleFullPayment}
                                            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                            disabled={loading}
                                        >
                                            {loading ? 'Processing...' : 'Clear Due'}
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
