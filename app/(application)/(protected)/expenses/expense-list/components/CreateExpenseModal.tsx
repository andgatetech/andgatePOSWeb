'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showErrorDialog, showMessage } from '@/lib/toast';
import { useCreateExpenseMutation } from '@/store/features/expense/expenseApi';
import { useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { ChevronDown, Plus, Receipt, Store, X } from 'lucide-react';
import { useState } from 'react';

interface CreateExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PAYMENT_TYPES = [
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'bank', label: 'Bank Transfer', icon: '🏦' },
    { value: 'card', label: 'Card', icon: '💳' },
    { value: 'others', label: 'Others', icon: '📋' },
];

const CreateExpenseModal: React.FC<CreateExpenseModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { currentStore, currentStoreId } = useCurrentStore();
    const [createExpense, { isLoading }] = useCreateExpenseMutation();

    // Fetch only Expense type ledgers
    const { data: ledgersResponse } = useGetLedgersQuery({ store_id: currentStoreId, ledger_type: 'Expenses', per_page: 100 }, { skip: !currentStoreId || !isOpen });
    const ledgers = ledgersResponse?.data?.items || [];

    const [formData, setFormData] = useState({
        title: '',
        ledger_id: '',
        expense_ledger_type: '',
        debit: '',
        payment_type: 'cash',
        notes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        const debit = parseFloat(formData.debit || '0');
        if (debit <= 0) {
            newErrors.debit = 'Amount must be greater than 0';
        }

        if (!formData.payment_type) {
            newErrors.payment_type = 'Payment type is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (!currentStoreId) {
            showErrorDialog('Error!', 'Please select a store first.');
            return;
        }

        try {
            const payload: any = {
                store_id: currentStoreId,
                title: formData.title.trim(),
                debit: parseFloat(formData.debit),
                payment_type: formData.payment_type,
                notes: formData.notes.trim(),
                expense_ledger_type: formData.expense_ledger_type, // Added field to payload
            };

            // Only include ledger_id if selected
            if (formData.ledger_id) {
                payload.ledger_id = parseInt(formData.ledger_id);
            }

            await createExpense(payload).unwrap();

            showMessage('Expense created successfully!', 'success');
            setFormData({ title: '', ledger_id: '', debit: '', payment_type: 'cash', notes: '', expense_ledger_type: '' });
            setErrors({});
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Failed to create expense. Please try again.';
            showErrorDialog('Error!', errorMessage);
        }
    };

    const handleClose = () => {
        setFormData({ title: '', ledger_id: '', debit: '', payment_type: 'cash', notes: '', expense_ledger_type: '' });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
                {/* Modal Header */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white bg-opacity-20 shadow-lg">
                                <Receipt className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Create Expense</h2>
                                {currentStore && (
                                    <div className="mt-1 flex items-center text-sm text-red-100">
                                        <Store className="mr-1.5 h-4 w-4" />
                                        <span>{currentStore.store_name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button onClick={handleClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20 text-white transition-colors hover:bg-opacity-30">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-5">
                        {/* Title Input */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => {
                                    setFormData({ ...formData, title: e.target.value });
                                    if (errors.title) setErrors({ ...errors, title: '' });
                                }}
                                className={`w-full rounded-xl border px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 ${
                                    errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-red-500 focus:ring-red-200'
                                }`}
                                placeholder="e.g., Office Rent, Utilities"
                            />
                            {errors.title && <p className="mt-1.5 text-xs text-red-500">{errors.title}</p>}
                        </div>

                        {/* Ledger Select (Optional) */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Ledger (Optional)</label>
                            <div className="relative">
                                <select
                                    value={formData.ledger_id}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectedLedger = ledgers.find((l: any) => l.id.toString() === selectedId);
                                        setFormData((prev) => ({
                                            ...prev,
                                            ledger_id: selectedId,
                                            expense_ledger_type: selectedLedger ? selectedLedger.title : '',
                                        }));
                                    }}
                                    className="w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 pr-10 text-gray-900 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                                >
                                    <option value="">Auto-create expense ledger</option>
                                    {ledgers.map((ledger: any) => (
                                        <option key={ledger.id} value={ledger.id}>
                                            {ledger.title}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Select an existing expense ledger or leave empty to auto-create</p>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.debit}
                                onChange={(e) => {
                                    setFormData({ ...formData, debit: e.target.value });
                                    if (errors.debit) setErrors({ ...errors, debit: '' });
                                }}
                                className={`w-full rounded-xl border px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 ${
                                    errors.debit ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-red-500 focus:ring-red-200'
                                }`}
                                placeholder="0.00"
                            />
                            {errors.debit && <p className="mt-1.5 text-xs text-red-500">{errors.debit}</p>}
                        </div>

                        {/* Payment Type */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Payment Type <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {PAYMENT_TYPES.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, payment_type: type.value });
                                            if (errors.payment_type) setErrors({ ...errors, payment_type: '' });
                                        }}
                                        className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 transition-all ${
                                            formData.payment_type === type.value ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className="text-lg">{type.icon}</span>
                                        <span className="font-medium">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                            {errors.payment_type && <p className="mt-1.5 text-xs text-red-500">{errors.payment_type}</p>}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                                placeholder="Add notes for this expense..."
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-red-600 hover:to-rose-700 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-5 w-5" />
                                    Create Expense
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateExpenseModal;
