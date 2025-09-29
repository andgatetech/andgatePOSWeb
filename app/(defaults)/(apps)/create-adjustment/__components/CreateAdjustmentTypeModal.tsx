'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useCreateAdjustmentTypeMutation } from '@/store/features/AdjustmentType/adjustmentTypeApi';
import { AlertCircle, CheckCircle, Store, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const CreateAdjustmentTypeModal = ({ isOpen, onClose, onSuccess }) => {
    // const [mounted, setMounted] = useState(false);

    // useEffect(() => {
    //     setMounted(true);
    //     // return () => setMounted(false);
    // }, []);

    const { currentStoreId, currentStore } = useCurrentStore();
    const [formData, setFormData] = useState({
        type: '',
        description: '',
        store_id: currentStoreId,
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [createAdjustmentType] = useCreateAdjustmentTypeMutation();
    useEffect(() => {
        if (isOpen) {
            setFormData({
                type: '',
                description: '',
                store_id: currentStoreId || '', // ✅ keep store
            });
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen, currentStoreId]);

    // Reset form when modal opens/closes

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        if (!formData.type.trim()) newErrors.type = 'Type is required';
        else if (formData.type.length > 255) newErrors.type = 'Type must be less than 255 characters';

        if (!formData.description.trim()) newErrors.description = 'Description is required';
        else if (formData.description.length > 255) newErrors.description = 'Description must be less than 255 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await createAdjustmentType({
                type: formData.type.trim(),
                description: formData.description.trim(),
                store_id: currentStoreId,
            }).unwrap();
            toast.success('Adjustment type created successfully');
            onSuccess();
            handleClose();
        } catch (error) {
            if (error?.data?.errors) setErrors(error.data.errors);
            else setErrors({ general: error?.data?.message || 'Failed to create adjustment type' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            type: '',
            description: '',
            store_id: currentStoreId,
        });
        setErrors({});
        onClose();
    };

    // Don't render if modal is closed
    // if (!isOpen || !mounted) return null;
    if (!isOpen) return null;

    return (
        <div key={isOpen ? 'open' : 'closed'} className="fixed inset-0 z-50 flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />

            {/* Modal */}
            <div className="relative mx-4 max-h-screen w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Create Adjustment Type</h2>
                        <p className="mt-1 text-sm text-gray-500">Add a new inventory adjustment type</p>
                    </div>
                    <button onClick={onClose} disabled={isSubmitting} className="flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-gray-100 disabled:opacity-50">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* General error */}
                    {errors.general && (
                        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                            <div>
                                <h4 className="text-sm font-medium text-red-800">Error</h4>
                                <p className="mt-1 text-sm text-red-700">{errors.general}</p>
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
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

                    {/* Type field */}
                    <div className="mb-4">
                        <label htmlFor="adjustment-type" className="mb-2 block text-sm font-medium text-gray-700">
                            Adjustment Type <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="adjustment-type"
                            type="text"
                            value={formData.type}
                            onChange={(e) => handleInputChange('type', e.target.value)}
                            disabled={isSubmitting}
                            placeholder="e.g., Stock Loss, Damaged Goods, Expired Items"
                            className={`w-full rounded-lg border px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                                errors.type ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                            }`}
                            maxLength={255}
                        />
                        {errors.type && (
                            <div className="mt-2 flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <p className="text-sm">{errors.type}</p>
                            </div>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                            <p className="text-xs text-gray-500">Choose a descriptive name for this adjustment type</p>
                            <p className="text-xs text-gray-400">{formData.type.length}/255</p>
                        </div>
                    </div>

                    {/* Description field */}
                    <div className="mb-6">
                        <label htmlFor="adjustment-description" className="mb-2 block text-sm font-medium text-gray-700">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="adjustment-description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            disabled={isSubmitting}
                            placeholder="Provide a detailed explanation of when and why this adjustment type should be used..."
                            rows={4}
                            className={`w-full resize-none rounded-lg border px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                                errors.description ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                            }`}
                            maxLength={255}
                        />
                        {errors.description && (
                            <div className="mt-2 flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <p className="text-sm">{errors.description}</p>
                            </div>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                            <p className="text-xs text-gray-500">Explain the purpose and usage of this adjustment type</p>
                            <p className="text-xs text-gray-400">{formData.description.length}/255</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 rounded-b-xl border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.type || !formData.description}
                        className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <CheckCircle className="h-4 w-4" />}
                        {isSubmitting ? 'Creating...' : 'Create Type'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateAdjustmentTypeModal;
