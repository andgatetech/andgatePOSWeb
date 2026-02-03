'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ViewExpenseModalProps {
    expense: any;
    isOpen: boolean;
    onClose: () => void;
}

const PAYMENT_TYPE_LABELS: Record<string, string> = {
    cash: 'Cash',
    bank_transfer: 'Bank Transfer',
    card: 'Card',
    others: 'Others',
    bank: 'Bank Transfer',
};

const ViewExpenseModal: React.FC<ViewExpenseModalProps> = ({ expense, isOpen, onClose }) => {
    const { formatCurrency } = useCurrency();

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !expense) return null;

    const paymentTypeLabel = PAYMENT_TYPE_LABELS[expense.payment_type?.toLowerCase()] || 'Others';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-[360px] rounded-lg border bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="border-b px-6 py-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-medium">{expense.title || 'Expense Details'}</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">ID: #{expense.id}</p>
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                {paymentTypeLabel}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-4">
                    {/* Total Amount */}
                    <div className="text-center py-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Total Expense Amount</p>
                        <p className="text-2xl font-semibold">{formatCurrency(expense.debit)}</p>
                    </div>

                    {/* Expense Information */}
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Expense Information
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-1.5 border-b border-gray-200">
                                <span className="text-gray-500">Expense ID</span>
                                <span className="font-medium">#{expense.id}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-200">
                                <span className="text-gray-500">Ledger</span>
                                <span className="font-medium">{expense.ledger_title || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-200">
                                <span className="text-gray-500">Notes</span>
                                <span>{expense.notes || 'No notes'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Details
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-1.5 border-b border-gray-200">
                                <span className="text-gray-500">Created By</span>
                                <span>{expense.user_name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-200">
                                <span className="text-gray-500">Store</span>
                                <span>{expense.store_name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-gray-500">Created Date</span>
                                <span>{new Date(expense.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className="bg-gray-50 rounded-md p-3">
                        <p className="text-xs text-gray-600 leading-relaxed">
                            <span className="font-medium">Expense Record</span>
                            <br />
                            This expense is recorded in your financial records and linked to the associated ledger and journal entries.
                        </p>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-2 px-6 pb-6 pt-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-9 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewExpenseModal;
