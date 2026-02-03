'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showErrorDialog, showMessage } from '@/lib/toast';
import { useCreateLedgerMutation } from '@/store/features/ledger/ledger';
import { X } from 'lucide-react';
import { useState } from 'react';

interface CreateLedgerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const LEDGER_TYPES = [
    { id: 'assets', label: 'Assets' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'income', label: 'Income' },
    { id: 'liabilities', label: 'Liabilities' },
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[360px] rounded-lg border bg-white shadow-lg">
                {/* Modal Header */}
                <div className="border-b px-6 py-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-medium">New Ledger</h2>
                            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        {currentStore && <p className="text-xs text-gray-500">{currentStore.store_name}</p>}
                    </div>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="space-y-1.5">
                        <label htmlFor="ledger-title" className="text-xs text-gray-500">
                            Title
                        </label>
                        <input
                            id="ledger-title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ledger title"
                            className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                            required
                        />
                        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="ledger-type" className="text-xs text-gray-500">
                            Type
                        </label>
                        <select
                            id="ledger-type"
                            value={formData.ledger_type}
                            onChange={(e) => setFormData({ ...formData, ledger_type: e.target.value })}
                            className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                        >
                            <option value="">Select type</option>
                            {LEDGER_TYPES.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={handleClose} className="h-9 flex-1 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="h-9 flex-1 rounded-md bg-black text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                            {isLoading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateLedgerModal;
