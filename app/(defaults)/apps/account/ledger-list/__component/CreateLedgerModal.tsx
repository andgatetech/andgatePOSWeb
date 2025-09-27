'use client';
import { useCreateLedgerMutation } from '@/store/features/ledger/ledger';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { X, Store } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CreateLedgerModal = ({ isOpen, onClose, onSuccess }) => {
    const { currentStoreId, currentStore } = useCurrentStore();

    const [formData, setFormData] = useState({
        title: '',
        store_id: currentStoreId,
    });

    const [errors, setErrors] = useState({});

    // Redux mutation
    const [createLedger, { isLoading }] = useCreateLedgerMutation();

    // Update store_id when currentStoreId changes
    useEffect(() => {
        setFormData((prev) => ({ ...prev, store_id: currentStoreId }));
    }, [currentStoreId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Ledger title is required';
        } else if (formData.title.trim().length < 3) {
            newErrors.title = 'Ledger title must be at least 3 characters long';
        } else if (formData.title.trim().length > 255) {
            newErrors.title = 'Ledger title must not exceed 255 characters';
        }

        if (!currentStoreId) {
            newErrors.store_id = 'Store is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Prepare data for API
            const submitData = {
                ...formData,
                title: formData.title.trim(),
            };

            await createLedger(submitData).unwrap();
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Failed to create ledger:', error);

            // Handle validation errors from API
            if (error?.data?.errors) {
                setErrors(error.data.errors);
            } else if (error?.data?.message) {
                // Handle duplicate ledger error
                if (error.data.message.includes('already exists')) {
                    setErrors({ title: 'A ledger with this title already exists for this store' });
                } else {
                    toast.error(error.data.message);
                }
            } else {
                toast.error('Failed to create ledger. Please try again.');
            }
        }
    };

    const handleClose = () => {
        setFormData({
            title: '',
            store_id: currentStoreId,
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

                <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
                    &#8203;
                </span>

                <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        {/* Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Create Ledger</h3>
                            <button onClick={handleClose} className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Store Display */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Store</label>
                                <div className="relative mt-1">
                                    <input
                                        type="text"
                                        value={currentStore?.store_name || 'No Store Selected'}
                                        readOnly
                                        className="block w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-50 py-2 pl-10 pr-3 text-gray-900 focus:outline-none"
                                    />
                                    <Store className="absolute left-3 top-2.5 h-4 w-4 text-purple-500" />
                                </div>
                                {errors.store_id && <p className="mt-1 text-sm text-red-600">{errors.store_id}</p>}
                            </div>

                            {/* Ledger Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Ledger Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                                        errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    placeholder="Enter ledger title (e.g., Sales, Expenses, Cash)"
                                    maxLength="255"
                                />
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                <p className="mt-1 text-xs text-gray-500">{formData.title.length}/255 characters</p>
                            </div>

                            {/* Info Note */}
                            <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                                <h4 className="mb-1 text-sm font-medium text-blue-800">Ledger Examples:</h4>
                                <ul className="space-y-1 text-sm text-blue-700">
                                    <li>
                                        • <strong>Assets:</strong> Cash, Bank Account, Inventory
                                    </li>
                                    <li>
                                        • <strong>Expenses:</strong> Rent, Utilities, Marketing
                                    </li>
                                    <li>
                                        • <strong>Income:</strong> Sales Revenue, Service Income
                                    </li>
                                    <li>
                                        • <strong>Liabilities:</strong> Accounts Payable, Loans
                                    </li>
                                </ul>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            {isLoading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                    Creating...
                                </>
                            ) : (
                                'Create Ledger'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateLedgerModal;
