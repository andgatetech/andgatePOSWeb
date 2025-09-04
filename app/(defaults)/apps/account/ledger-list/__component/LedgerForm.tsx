'use client';

import { useState } from 'react';
import { FileText, Building2 } from 'lucide-react';
import { useCreateLedgerMutation } from '@/store/features/ledger/ledger';

const CreateLedgerForm = ({ onSuccess, onCancel, stores = [] }) => {
    const [formData, setFormData] = useState({
        title: '',
        store_id: '',
    });

    const [errors, setErrors] = useState({});
    const [createLedger, { isLoading }] = useCreateLedgerMutation();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Ledger title is required';
        } else if (formData.title.trim().length < 3) {
            newErrors.title = 'Ledger title must be at least 3 characters';
        }

        if (!formData.store_id) {
            newErrors.store_id = 'Please select a store';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const result = await createLedger(formData).unwrap();

            // Reset form
            setFormData({ title: '', store_id: '' });
            setErrors({});

            // Call success callback
            if (onSuccess) {
                onSuccess(result);
            }
        } catch (error) {
            console.error('Failed to create ledger:', error);

            // Handle validation errors from server
            if (error.data?.errors) {
                setErrors(error.data.errors);
            } else {
                setErrors({
                    general: error.data?.message || 'Failed to create ledger. Please try again.',
                });
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleCancel = () => {
        // Reset form
        setFormData({ title: '', store_id: '' });
        setErrors({});

        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="space-y-6">
            {/* General Error */}
            {errors.general && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-600">{errors.general}</p>
                </div>
            )}

            {/* Title Field */}
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    Ledger Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter ledger title..."
                        className={`w-full rounded-lg border py-3 pl-10 pr-4 transition-all focus:ring-2 ${
                            errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
                        }`}
                    />
                </div>
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Store Selection */}
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    Select Store <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <select
                        name="store_id"
                        value={formData.store_id}
                        onChange={handleChange}
                        className={`w-full rounded-lg border py-3 pl-10 pr-4 transition-all focus:ring-2 ${
                            errors.store_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
                        }`}
                    >
                        <option value="">Choose a store...</option>
                        {stores.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.store_name}
                            </option>
                        ))}
                    </select>
                </div>
                {errors.store_id && <p className="mt-1 text-sm text-red-600">{errors.store_id}</p>}
            </div>

            {/* Store Info */}
            {formData.store_id && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <p className="text-sm text-blue-700">
                            Selected store: <span className="font-medium">{stores.find((s) => s.id.toString() === formData.store_id)?.name}</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="rounded-lg border border-slate-300 px-6 py-2.5 text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading || !formData.title.trim() || !formData.store_id}
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-white transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                            Creating...
                        </div>
                    ) : (
                        'Create Ledger'
                    )}
                </button>
            </div>
        </div>
    );
};

export default CreateLedgerForm;
