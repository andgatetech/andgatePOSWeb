'use client';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUpdateExpenseMutation } from '@/store/features/expense/expenseApi';
import { Save, Store, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UpdateExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    expense: any;
}

const UpdateExpenseModal = ({ isOpen, onClose, onSuccess, expense }: UpdateExpenseModalProps) => {
    const { currentStore } = useCurrentStore();
    const [updateExpense, { isLoading }] = useUpdateExpenseMutation();

    const [formData, setFormData] = useState({
        title: '',
        notes: '',
        debit: '',
        payment_type: 'cash',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (expense) {
            setFormData({
                title: expense.title || '',
                notes: expense.notes || '',
                debit: expense.debit || '',
                payment_type: expense.payment_type || 'cash',
            });
        }
    }, [expense]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        const debit = parseFloat(formData.debit) || 0;
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

        if (!validateForm()) {
            return;
        }

        try {
            await updateExpense({
                expenseId: expense.id,
                data: {
                    ...formData,
                    debit: parseFloat(formData.debit),
                },
            }).unwrap();
            onSuccess();
        } catch (error) {
          
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                {/* Modal Header */}
                <div className="border-b border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-4">
                            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Update Expense</h2>
                            {currentStore && (
                                <div className="mt-1 flex items-center text-xs text-gray-600 sm:text-sm">
                                    <Store className="mr-1 h-3 w-3 flex-shrink-0 text-gray-500 sm:h-4 sm:w-4" />
                                    <span className="truncate">{currentStore.store_name}</span>
                                </div>
                            )}
                        </div>
                        <button onClick={onClose} className="flex-shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                    <div className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-red-500 sm:text-base ${
                                    errors.title ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Enter expense title"
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-red-500 sm:text-base"
                                placeholder="Enter expense notes (optional)"
                            />
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Amount (৳) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.debit}
                                onChange={(e) => setFormData({ ...formData, debit: e.target.value })}
                                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-red-500 sm:text-base ${
                                    errors.debit ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="0.00"
                            />
                            {errors.debit && <p className="mt-1 text-xs text-red-500">{errors.debit}</p>}
                        </div>

                        {/* Payment Type */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Payment Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.payment_type}
                                onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-red-500 sm:text-base ${
                                    errors.payment_type ? 'border-red-300' : 'border-gray-300'
                                }`}
                            >
                                <option value="cash">Cash</option>
                                <option value="bank">Bank</option>
                                <option value="card">Card</option>
                                <option value="others">Others</option>
                            </select>
                            {errors.payment_type && <p className="mt-1 text-xs text-red-500">{errors.payment_type}</p>}
                        </div>

                        {/* Form Actions */}
                        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:from-red-700 hover:to-orange-700 disabled:opacity-50 sm:flex-1"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Update Expense
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateExpenseModal;
