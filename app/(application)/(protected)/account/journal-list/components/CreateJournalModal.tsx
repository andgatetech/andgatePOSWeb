'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showErrorDialog, showMessage } from '@/lib/toast';
import { useCreateJournalMutation } from '@/store/features/journals/journals';
import { useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { X } from 'lucide-react';
import { useState } from 'react';

interface CreateJournalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateJournalModal: React.FC<CreateJournalModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { currentStore, currentStoreId } = useCurrentStore();
    const [createJournal, { isLoading }] = useCreateJournalMutation();

    // Fetch ledgers for the dropdown
    const { data: ledgersResponse } = useGetLedgersQuery({ store_id: currentStoreId, per_page: 100 }, { skip: !currentStoreId || !isOpen });
    const ledgers = ledgersResponse?.data?.items || [];

    const [formData, setFormData] = useState({
        ledger_id: '',
        debit: '',
        credit: '',
        notes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.ledger_id) {
            newErrors.ledger_id = 'Please select a ledger';
        }

        const debit = parseFloat(formData.debit || '0');
        const credit = parseFloat(formData.credit || '0');

        if (debit === 0 && credit === 0) {
            newErrors.amount = 'Either debit or credit amount is required';
        }

        if (debit > 0 && credit > 0) {
            newErrors.amount = 'Cannot have both debit and credit in one entry';
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
            await createJournal({
                store_id: currentStoreId,
                ledger_id: parseInt(formData.ledger_id),
                debit: parseFloat(formData.debit || '0'),
                credit: parseFloat(formData.credit || '0'),
                notes: formData.notes.trim(),
            }).unwrap();

            showMessage('Journal entry created successfully!', 'success');
            setFormData({ ledger_id: '', debit: '', credit: '', notes: '' });
            setErrors({});
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Failed to create journal entry. Please try again.';
            showErrorDialog('Error!', errorMessage);
        }
    };

    const handleClose = () => {
        setFormData({ ledger_id: '', debit: '', credit: '', notes: '' });
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
                            <h2 className="text-base font-medium">New Journal</h2>
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
                        <label htmlFor="journal-ledger" className="text-xs text-gray-500">
                            Ledger
                        </label>
                        <select
                            id="journal-ledger"
                            value={formData.ledger_id}
                            onChange={(e) => setFormData({ ...formData, ledger_id: e.target.value })}
                            className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                            required
                        >
                            <option value="">Select ledger</option>
                            {ledgers.map((ledger: any) => (
                                <option key={ledger.id} value={ledger.id}>
                                    {ledger.title}
                                </option>
                            ))}
                        </select>
                        {errors.ledger_id && <p className="text-xs text-red-500">{errors.ledger_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label htmlFor="debit-amount" className="text-xs text-gray-500">
                                Debit
                            </label>
                            <input
                                id="debit-amount"
                                type="number"
                                value={formData.debit}
                                onChange={(e) => setFormData({ ...formData, debit: e.target.value })}
                                placeholder="0.00"
                                className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="credit-amount" className="text-xs text-gray-500">
                                Credit
                            </label>
                            <input
                                id="credit-amount"
                                type="number"
                                value={formData.credit}
                                onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
                                placeholder="0.00"
                                className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>
                    {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}

                    <div className="space-y-1.5">
                        <label htmlFor="journal-notes" className="text-xs text-gray-500">
                            Notes
                        </label>
                        <textarea
                            id="journal-notes"
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
                            {isLoading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateJournalModal;
