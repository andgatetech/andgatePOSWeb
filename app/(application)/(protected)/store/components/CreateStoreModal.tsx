'use client';
import SubscriptionError from '@/components/common/SubscriptionError';
import useSubscriptionError from '@/hooks/useSubscriptionError';
import { showMessage } from '@/lib/toast';
import { RootState } from '@/store';
import { useCreateStoreMutation } from '@/store/features/store/storeApi';
import { Building2, MapPin, Store, X } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';

interface CreateStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateStoreModal: React.FC<CreateStoreModalProps> = ({ isOpen, onClose }) => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [createStore, { error: createError }] = useCreateStoreMutation();
    const { hasSubscriptionError, subscriptionError } = useSubscriptionError(createError);

    const [formData, setFormData] = useState({
        store_name: '',
        address: '',
        store_phone: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.store_name.trim() || !formData.address.trim()) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const storeData = {
                user_id: user?.id,
                store_name: formData.store_name.trim(),
                address: formData.address.trim(),
                ...(formData.store_phone.trim() && { store_phone: formData.store_phone.trim() }),
            };

            await createStore(storeData).unwrap();

            setFormData({ store_name: '', address: '', store_phone: '' });
            showMessage('Store created successfully!', 'success');
            onClose();
        } catch (error: any) {
            console.error('Error creating store:', error);
            if (error?.status !== 403) {
                showMessage('Failed to create store. Please try again.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    if (hasSubscriptionError) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4">
                <div className="w-full max-w-lg rounded-2xl bg-white p-6">
                    <div className="flex justify-end">
                        <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <SubscriptionError errorType={subscriptionError.errorType!} message={subscriptionError.message} details={subscriptionError.details} />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={onClose} />

                <div className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-sm transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                        <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700">
                                <Store className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Create New Store</h3>
                                <p className="text-sm text-gray-500">Add a new store to your business</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        {/* Store Name */}
                        <div>
                            <label htmlFor="store_name" className="mb-2 block text-sm font-medium text-gray-700">
                                Store Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    id="store_name"
                                    name="store_name"
                                    value={formData.store_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Downtown Coffee Branch 1"
                                    required
                                    className="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label htmlFor="address" className="mb-2 block text-sm font-medium text-gray-700">
                                Store Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 456 Oak Avenue, Uptown Mall, City 67890"
                                    required
                                    rows={3}
                                    className="block w-full resize-none rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Store Phone (Optional) */}
                        <div>
                            <label htmlFor="store_phone" className="mb-2 block text-sm font-medium text-gray-700">
                                Store Phone <span className="text-xs text-gray-400">(Optional)</span>
                            </label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                </svg>
                                <input
                                    type="tel"
                                    id="store_phone"
                                    name="store_phone"
                                    value={formData.store_phone}
                                    onChange={handleInputChange}
                                    placeholder="e.g., +1 (555) 123-4567"
                                    className="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.store_name.trim() || !formData.address.trim()}
                                className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Store className="mr-2 h-4 w-4" />
                                        Create Store
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateStoreModal;
