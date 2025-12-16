'use client';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useCreateJournalMutation } from '@/store/features/journals/journals';
import { useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { Store, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const CreateJournalModal = ({ isOpen, onClose, onSuccess }) => {
    const { currentStoreId, currentStore } = useCurrentStore();

    const [formData, setFormData] = useState({
        ledger_id: '',
        notes: '',
        debit: '',
        credit: '',
        store_id: currentStoreId,
    });

    const [errors, setErrors] = useState({});

    // Redux queries and mutations
    const { data: ledgersData, isLoading: isLoadingLedgers } = useGetLedgersQuery({ store_id: currentStoreId });
    const [createJournal, { isLoading }] = useCreateJournalMutation();
  

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

        if (!formData.ledger_id) {
            newErrors.ledger_id = 'Ledger is required';
        }

        if (!formData.notes.trim()) {
            newErrors.notes = 'Notes are required';
        }

        const debitAmount = parseFloat(formData.debit) || 0;
        const creditAmount = parseFloat(formData.credit) || 0;

        if (debitAmount === 0 && creditAmount === 0) {
            newErrors.amount = 'Either debit or credit amount is required';
        }

        if (debitAmount > 0 && creditAmount > 0) {
            newErrors.amount = 'Only one of debit or credit should have a value';
        }

        if (debitAmount < 0 || creditAmount < 0) {
            newErrors.amount = 'Amounts cannot be negative';
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
                debit: formData.debit ? parseFloat(formData.debit).toFixed(2) : '0.00',
                credit: formData.credit ? parseFloat(formData.credit).toFixed(2) : '0.00',
            };

            await createJournal(submitData).unwrap();
            // onSuccess();
            handleClose();
            setTimeout(() => {
                onSuccess();
            }, 50);
        } catch (error) {
            console.error('Failed to create journal entry:', error);

            // Handle validation errors from API
            if (error?.data?.errors) {
                setErrors(error.data.errors);
            } else {
                toast.error('Failed to create journal entry. Please try again.');
            }
        }
    };

    const handleClose = () => {
        setFormData({
            ledger_id: '',
            notes: '',
            debit: '',
            credit: '',
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
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Create Journal Entry</h3>
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
                            </div>

                            {/* Ledger Selection */}
                            <div>
                                <label htmlFor="ledger_id" className="block text-sm font-medium text-gray-700">
                                    Ledger *
                                </label>
                                <select
                                    id="ledger_id"
                                    name="ledger_id"
                                    value={formData.ledger_id}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                                        errors.ledger_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    disabled={isLoadingLedgers}
                                >
                                    <option value="">Select a ledger</option>
                                    {ledgersData?.data?.map((ledger) => (
                                        <option key={ledger.id} value={ledger.id}>
                                            {ledger.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.ledger_id && <p className="mt-1 text-sm text-red-600">{errors.ledger_id}</p>}
                            </div>

                            {/* Notes */}
                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                    Notes *
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                                        errors.notes ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    placeholder="Enter transaction details..."
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>

                            {/* Amount Section */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Debit */}
                                <div>
                                    <label htmlFor="debit" className="block text-sm font-medium text-gray-700">
                                        Debit Amount
                                    </label>
                                    <div className="relative mt-1 rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 sm:text-sm">৳</span>
                                        </div>
                                        <input
                                            type="number"
                                            id="debit"
                                            name="debit"
                                            value={formData.debit}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            min="0"
                                            className={`block w-full rounded-md border py-2 pl-8 pr-3 shadow-sm focus:outline-none focus:ring-2 ${
                                                errors.amount ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                            }`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* Credit */}
                                <div>
                                    <label htmlFor="credit" className="block text-sm font-medium text-gray-700">
                                        Credit Amount
                                    </label>
                                    <div className="relative mt-1 rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 sm:text-sm">৳</span>
                                        </div>
                                        <input
                                            type="number"
                                            id="credit"
                                            name="credit"
                                            value={formData.credit}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            min="0"
                                            className={`block w-full rounded-md border py-2 pl-8 pr-3 shadow-sm focus:outline-none focus:ring-2 ${
                                                errors.amount ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                            }`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}

                            {/* Info Note */}
                            <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> Enter amount in either Debit OR Credit field, not both. Debit increases expenses/assets, Credit increases income/liabilities.
                                </p>
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
                                'Create Entry'
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

export default CreateJournalModal;
