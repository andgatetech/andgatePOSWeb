'use client';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUpdateLedgerMutation } from '@/store/features/ledger/ledger';
import { Save, Store, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UpdateLedgerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    ledger: any;
}

const UpdateLedgerModal = ({ isOpen, onClose, onSuccess, ledger }: UpdateLedgerModalProps) => {
    const { currentStore } = useCurrentStore();
    const [updateLedger, { isLoading }] = useUpdateLedgerMutation();

    const [formData, setFormData] = useState({
        title: '',
    });

    useEffect(() => {
        if (ledger) {
            setFormData({
                title: ledger.title || '',
            });
        }
    }, [ledger]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await updateLedger({
                ledgerId: ledger.id,
                data: formData,
            }).unwrap();
            onSuccess();
        } catch (error) {
            console.error('Failed to update ledger:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                {/* Modal Header */}
                <div className="border-b border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-4">
                            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Update Ledger</h2>
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
                        {/* Title */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Ledger Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:text-base"
                                placeholder="Enter ledger title"
                                required
                            />
                        </div>

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
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 sm:flex-1"
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
                                        Update Ledger
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

export default UpdateLedgerModal;
