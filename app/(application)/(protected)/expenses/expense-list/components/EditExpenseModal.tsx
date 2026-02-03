'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showErrorDialog, showMessage } from '@/lib/toast';
import { useUpdateExpenseMutation } from '@/store/features/expense/expenseApi';
import { useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EditExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    expense: any;
}

const PAYMENT_TYPES = [
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'card', label: 'Card', icon: '💳' },
    { value: 'others', label: 'Others', icon: '📋' },
];

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({ isOpen, onClose, onSuccess, expense }) => {
    const { currentStore, currentStoreId } = useCurrentStore();
    const [updateExpense, { isLoading }] = useUpdateExpenseMutation();

    // Fetch only Expense type ledgers
    const { data: ledgersResponse } = useGetLedgersQuery({ store_id: currentStoreId, ledger_type: 'Expenses', per_page: 100 }, { skip: !currentStoreId || !isOpen });
    const ledgers = ledgersResponse?.data?.items || [];

    const [formData, setFormData] = useState({
        title: '',
        ledger_id: '',
        debit: '',
        payment_type: 'cash',
        notes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (expense) {
            setFormData({
                title: expense.title || '',
                ledger_id: expense.ledger_id?.toString() || '',
                debit: expense.debit?.toString() || '',
                payment_type: expense.payment_type || 'cash',
                notes: expense.notes || '',
            });
        }
    }, [expense]);

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

        try {
            const payload: any = {
                title: formData.title.trim(),
                debit: parseFloat(formData.debit),
                payment_type: formData.payment_type,
                notes: formData.notes.trim(),
            };

            if (formData.ledger_id) {
                payload.ledger_id = parseInt(formData.ledger_id);
            }

            await updateExpense({
                expenseId: expense.id,
                data: payload,
            }).unwrap();

            showMessage('Expense updated successfully!', 'success');
            setErrors({});
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Failed to update expense. Please try again.';
            showErrorDialog('Error!', errorMessage);
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!isOpen || !expense) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleClose}>
            <div className="w-full max-w-[360px] rounded-lg border bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="border-b px-6 py-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-medium">Edit Expense</h2>
                            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        {currentStore && <p className="text-xs text-gray-500">{currentStore.store_name}</p>}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="space-y-1.5">
                        <label htmlFor="edit-expense-title" className="text-xs text-gray-500">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="edit-expense-title"
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
                        <label htmlFor="edit-expense-ledger" className="text-xs text-gray-500">
                            Ledger
                        </label>
                        <select
                            id="edit-expense-ledger"
                            value={formData.ledger_id}
                            onChange={(e) => setFormData({ ...formData, ledger_id: e.target.value })}
                            className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                        >
                            <option value="">Select a ledger</option>
                            {ledgers.map((ledger: any) => (
                                <option key={ledger.id} value={ledger.id}>
                                    {ledger.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="edit-expense-amount" className="text-xs text-gray-500">
                            Amount <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="edit-expense-amount"
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
                            {PAYMENT_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => {
                                        setFormData({ ...formData, payment_type: type.value });
                                        if (errors.payment_type) setErrors({ ...errors, payment_type: '' });
                                    }}
                                    className={`flex flex-col items-center justify-center gap-0.5 rounded-md border p-2 text-xs transition-colors ${
                                        formData.payment_type === type.value ? 'border-black bg-black/5 text-black' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="text-base">{type.icon}</span>
                                    <span className="text-[10px] leading-tight">{type.label}</span>
                                </button>
                            ))}
                        </div>
                        {errors.payment_type && <p className="mt-1.5 text-xs text-red-500">{errors.payment_type}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="edit-expense-notes" className="text-xs text-gray-500">
                            Notes
                        </label>
                        <textarea
                            id="edit-expense-notes"
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
                            {isLoading ? 'Updating...' : 'Update Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditExpenseModal;
