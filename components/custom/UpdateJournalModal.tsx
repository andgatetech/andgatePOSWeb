'use client';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { useUpdateJournalMutation } from '@/store/features/journals/journals';
import { Save, Store, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UpdateJournalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    journal: any;
}

const UpdateJournalModal = ({ isOpen, onClose, onSuccess, journal }: UpdateJournalModalProps) => {
    const { currentStore, currentStoreId } = useCurrentStore();
    const [updateJournal, { isLoading }] = useUpdateJournalMutation();
    const { data: ledgersData } = useGetLedgersQuery({ store_id: currentStoreId });

    const [formData, setFormData] = useState({
        ledger_id: '',
        notes: '',
        debit: '',
        credit: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (journal) {
            setFormData({
                ledger_id: journal.ledger_id?.toString() || '',
                notes: journal.notes || '',
                debit: journal.debit || '',
                credit: journal.credit || '',
            });
        }
    }, [journal]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.ledger_id) {
            newErrors.ledger_id = 'Ledger is required';
        }

        if (!formData.notes.trim()) {
            newErrors.notes = 'Notes are required';
        }

        const debit = parseFloat(formData.debit) || 0;
        const credit = parseFloat(formData.credit) || 0;

        if (debit === 0 && credit === 0) {
            newErrors.amount = 'Either debit or credit amount must be greater than 0';
        }

        if (debit > 0 && credit > 0) {
            newErrors.amount = 'Only one of debit or credit can have a value';
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
            await updateJournal({
                journalId: journal.id,
                data: {
                    ...formData,
                    debit: parseFloat(formData.debit) || 0,
                    credit: parseFloat(formData.credit) || 0,
                },
            }).unwrap();
            onSuccess();
        } catch (error) {
           
        }
    };

    const handleAmountChange = (field: 'debit' | 'credit', value: string) => {
        const otherField = field === 'debit' ? 'credit' : 'debit';

        setFormData({
            ...formData,
            [field]: value,
            [otherField]: '', // Clear the other field
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                {/* Modal Header */}
                <div className="border-b border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-4">
                            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Update Journal Entry</h2>
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
                        {/* Ledger Selection */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Ledger <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.ledger_id}
                                onChange={(e) => setFormData({ ...formData, ledger_id: e.target.value })}
                                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500 sm:text-base ${
                                    errors.ledger_id ? 'border-red-300' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Select a ledger</option>
                                {ledgersData?.data?.map((ledger: any) => (
                                    <option key={ledger.id} value={ledger.id}>
                                        {ledger.title}
                                    </option>
                                ))}
                            </select>
                            {errors.ledger_id && <p className="mt-1 text-xs text-red-500">{errors.ledger_id}</p>}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Notes <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500 sm:text-base ${
                                    errors.notes ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Enter journal entry notes"
                            />
                            {errors.notes && <p className="mt-1 text-xs text-red-500">{errors.notes}</p>}
                        </div>

                        {/* Debit and Credit */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Debit */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Debit (৳)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.debit}
                                    onChange={(e) => handleAmountChange('debit', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500 sm:text-base"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Credit */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Credit (৳)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.credit}
                                    onChange={(e) => handleAmountChange('credit', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500 sm:text-base"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}

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
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 sm:flex-1"
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
                                        Update Entry
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

export default UpdateJournalModal;
