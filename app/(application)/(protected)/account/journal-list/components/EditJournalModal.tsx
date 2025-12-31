'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showErrorDialog, showMessage } from '@/lib/toast';
import { useUpdateJournalMutation } from '@/store/features/journals/journals';
import { useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { BookOpen, ChevronDown, Save, Store, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EditJournalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    journal: any;
}

const EditJournalModal: React.FC<EditJournalModalProps> = ({ isOpen, onClose, onSuccess, journal }) => {
    const { currentStore, currentStoreId } = useCurrentStore();
    const [updateJournal, { isLoading }] = useUpdateJournalMutation();

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

    useEffect(() => {
        if (journal) {
            setFormData({
                ledger_id: journal.ledger_id?.toString() || journal.ledger?.id?.toString() || '',
                debit: journal.debit?.toString() || '',
                credit: journal.credit?.toString() || '',
                notes: journal.notes || '',
            });
        }
    }, [journal]);

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

        try {
            await updateJournal({
                journalId: journal.id,
                data: {
                    ledger_id: parseInt(formData.ledger_id),
                    debit: parseFloat(formData.debit || '0'),
                    credit: parseFloat(formData.credit || '0'),
                    notes: formData.notes.trim(),
                },
            }).unwrap();

            showMessage('Journal entry updated successfully!', 'success');
            setErrors({});
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Failed to update journal entry. Please try again.';
            showErrorDialog('Error!', errorMessage);
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!isOpen || !journal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Modal Header */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white bg-opacity-20 shadow-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Edit Journal Entry</h2>
                                {currentStore && (
                                    <div className="mt-1 flex items-center text-sm text-orange-100">
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
                        {/* Ledger Select */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Ledger <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.ledger_id}
                                    onChange={(e) => {
                                        setFormData({ ...formData, ledger_id: e.target.value });
                                        if (errors.ledger_id) setErrors({ ...errors, ledger_id: '' });
                                    }}
                                    className={`w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-gray-900 transition-all focus:outline-none focus:ring-2 ${
                                        errors.ledger_id ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'
                                    }`}
                                >
                                    <option value="">Select a ledger</option>
                                    {ledgers.map((ledger: any) => (
                                        <option key={ledger.id} value={ledger.id}>
                                            {ledger.title}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            </div>
                            {errors.ledger_id && <p className="mt-1.5 text-xs text-red-500">{errors.ledger_id}</p>}
                        </div>

                        {/* Debit and Credit */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Debit Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.debit}
                                    onChange={(e) => {
                                        setFormData({ ...formData, debit: e.target.value, credit: '' });
                                        if (errors.amount) setErrors({ ...errors, amount: '' });
                                    }}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Credit Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.credit}
                                    onChange={(e) => {
                                        setFormData({ ...formData, credit: e.target.value, debit: '' });
                                        if (errors.amount) setErrors({ ...errors, amount: '' });
                                    }}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        {errors.amount && <p className="-mt-3 text-xs text-red-500">{errors.amount}</p>}

                        {/* Notes */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                                placeholder="Add notes for this journal entry..."
                            />
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
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-orange-600 hover:to-amber-700 disabled:opacity-50"
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
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    Update Entry
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditJournalModal;
