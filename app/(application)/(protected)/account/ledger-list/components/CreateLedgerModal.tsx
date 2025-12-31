'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showErrorDialog, showMessage } from '@/lib/toast';
import { useCreateLedgerMutation } from '@/store/features/ledger/ledger';
import { BookOpen, ChevronDown, Plus, Store, X } from 'lucide-react';
import { useState } from 'react';

interface CreateLedgerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const LEDGER_TYPES = [
    { value: 'Assets', label: 'Assets', description: 'Cash, Bank, Inventory, Equipment' },
    { value: 'Expenses', label: 'Expenses', description: 'Rent, Salaries, Utilities' },
    { value: 'Income', label: 'Income', description: 'Sales, Service Revenue' },
    { value: 'Liabilities', label: 'Liabilities', description: 'Loans, Payables' },
];

const CreateLedgerModal: React.FC<CreateLedgerModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { currentStore, currentStoreId } = useCurrentStore();
    const [createLedger, { isLoading }] = useCreateLedgerMutation();

    const [formData, setFormData] = useState({
        title: '',
        ledger_type: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Ledger title is required';
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
            await createLedger({
                store_id: currentStoreId,
                title: formData.title.trim(),
                ledger_type: formData.ledger_type || null,
            }).unwrap();

            showMessage('Ledger created successfully!', 'success');
            setFormData({ title: '', ledger_type: '' });
            setErrors({});
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Failed to create ledger. Please try again.';
            showErrorDialog('Error!', errorMessage);
        }
    };

    const handleClose = () => {
        setFormData({ title: '', ledger_type: '' });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Modal Header */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white bg-opacity-20 shadow-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Create New Ledger</h2>
                                {currentStore && (
                                    <div className="mt-1 flex items-center text-sm text-indigo-100">
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
                                Ledger Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => {
                                    setFormData({ ...formData, title: e.target.value });
                                    if (errors.title) setErrors({ ...errors, title: '' });
                                }}
                                className={`w-full rounded-xl border px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 ${
                                    errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                                }`}
                                placeholder="e.g., Cash Account, Sales Revenue"
                            />
                            {errors.title && <p className="mt-1.5 text-xs text-red-500">{errors.title}</p>}
                        </div>

                        {/* Ledger Type Select */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Ledger Type</label>
                            <div className="relative">
                                <select
                                    value={formData.ledger_type}
                                    onChange={(e) => setFormData({ ...formData, ledger_type: e.target.value })}
                                    className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                >
                                    <option value="">Select a type (optional)</option>
                                    {LEDGER_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            </div>
                            {formData.ledger_type && <p className="mt-1.5 text-xs text-gray-500">{LEDGER_TYPES.find((t) => t.value === formData.ledger_type)?.description}</p>}
                        </div>

                        {/* Ledger Type Cards */}
                        <div className="grid grid-cols-2 gap-3">
                            {LEDGER_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, ledger_type: type.value })}
                                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                                        formData.ledger_type === type.value
                                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className={`text-sm font-semibold ${formData.ledger_type === type.value ? 'text-indigo-700' : 'text-gray-900'}`}>{type.label}</div>
                                    <div className="mt-0.5 text-xs text-gray-500">{type.description}</div>
                                </button>
                            ))}
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
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
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
                                    Create Ledger
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateLedgerModal;
