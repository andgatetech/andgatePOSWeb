'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showErrorDialog, showMessage } from '@/lib/toast';
import type { RootState } from '@/store';
import { useCreateExpenseMutation } from '@/store/features/expense/expenseApi';
import { useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';

interface CreateExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateExpenseModal: React.FC<CreateExpenseModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { currentStore, currentStoreId } = useCurrentStore();
    const [createExpense, { isLoading }] = useCreateExpenseMutation();

    // Get payment methods from Redux
    const paymentMethods = useSelector((state: RootState) => state.auth.currentStore?.payment_methods || []);
    const activePaymentMethods = paymentMethods.filter((pm) => pm.is_active);

    // Fetch only Expense type ledgers
    const { data: ledgersResponse } = useGetLedgersQuery({ store_id: currentStoreId, ledger_type: 'Expenses', per_page: 100 }, { skip: !currentStoreId || !isOpen });
    const ledgers = ledgersResponse?.data?.items || [];

    const [formData, setFormData] = useState({
        title: '',
        ledger_id: '',
        expense_ledger_type: '',
        debit: '',
        payment_type: '',
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
            setFormData({ title: '', ledger_id: '', debit: '', payment_type: activePaymentMethods[0]?.payment_method_name || '', notes: '', expense_ledger_type: '' });
            setErrors({});
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Failed to create expense. Please try again.';
            showErrorDialog('Error!', errorMessage);
        }
    };

    const handleClose = () => {
        setFormData({ title: '', ledger_id: '', debit: '', payment_type: activePaymentMethods[0]?.payment_method_name || '', notes: '', expense_ledger_type: '' });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleClose}>
            <div className="w-full max-w-[360px] rounded-lg border bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="border-b px-6 py-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-medium">Create Expense</h2>
                            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        {currentStore && <p className="text-xs text-gray-500">{currentStore.store_name}</p>}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="space-y-1.5">
                        <label htmlFor="expense-title" className="text-xs text-gray-500">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="expense-title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => {
                                setFormData({ ...formData, title: e.target.value });
                                if (errors.title) setErrors({ ...errors, title: '' });
                            }}
                            placeholder="Enter expense title"
                            className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                            required
                        />
                        {errors.title && <p className="mt-1.5 text-xs text-red-500">{errors.title}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="expense-ledger" className="text-xs text-gray-500">
                            Ledger <span className="text-gray-400">(Optional)</span>
                        </label>
                        <select
                            id="expense-ledger"
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
                            className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                        >
                            <option value="">Auto-create expense ledger</option>
                            {ledgers.map((ledger: any) => (
                                <option key={ledger.id} value={ledger.id}>
                                    {ledger.title}
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-500">Select an existing expense ledger or leave empty to auto-create</p>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="expense-amount" className="text-xs text-gray-500">
                            Amount <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="expense-amount"
                            type="number"
                            value={formData.debit}
                            onChange={(e) => {
                                setFormData({ ...formData, debit: e.target.value });
                                if (errors.debit) setErrors({ ...errors, debit: '' });
                            }}
                            placeholder="0.00"
                            className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                            min="0"
                            step="0.01"
                            required
                        />
                        {errors.debit && <p className="mt-1.5 text-xs text-red-500">{errors.debit}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">
                            Payment Type <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                            {activePaymentMethods.length > 0 ? (
                                activePaymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, payment_type: method.payment_method_name });
                                            if (errors.payment_type) setErrors({ ...errors, payment_type: '' });
                                        }}
                                        className={`flex flex-col items-center justify-center gap-0.5 rounded-md border p-2 text-xs transition-colors ${
                                            formData.payment_type === method.payment_method_name ? 'border-black bg-black/5 text-black' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="text-base">💳</span>
                                        <span className="text-[10px] leading-tight">{method.payment_method_name.charAt(0).toUpperCase() + method.payment_method_name.slice(1)}</span>
                                    </button>
                                ))
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({ ...formData, payment_type: 'cash' });
                                        if (errors.payment_type) setErrors({ ...errors, payment_type: '' });
                                    }}
                                    className={`flex flex-col items-center justify-center gap-0.5 rounded-md border p-2 text-xs transition-colors ${
                                        formData.payment_type === 'cash' ? 'border-black bg-black/5 text-black' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="text-base">💵</span>
                                    <span className="text-[10px] leading-tight">Cash</span>
                                </button>
                            )}
                        </div>
                        {errors.payment_type && <p className="mt-1.5 text-xs text-red-500">{errors.payment_type}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="expense-notes" className="text-xs text-gray-500">
                            Notes
                        </label>
                        <textarea
                            id="expense-notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Add notes..."
                            rows={2}
                            className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={handleClose} className="h-9 flex-1 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="h-9 flex-1 rounded-md bg-black text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                            {isLoading ? 'Creating...' : 'Create Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateExpenseModal;
