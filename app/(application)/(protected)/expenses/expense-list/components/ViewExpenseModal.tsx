'use client';

import DateColumn from '@/components/common/DateColumn';
import { useCurrency } from '@/hooks/useCurrency';
import { X } from 'lucide-react';
import { useEffect } from 'react';

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
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{paymentTypeLabel}</span>
                        </div>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="space-y-4 p-6">
                    {/* Total Amount */}
                    <div className="rounded-lg bg-gray-50 py-3 text-center">
                        <p className="mb-1 text-xs text-gray-500">Total Expense Amount</p>
                        <p className="text-2xl font-semibold">{formatCurrency(expense.debit)}</p>
                    </div>

                    {/* Expense Information */}
                    <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Expense Information</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between border-b border-gray-200 py-1.5">
                                <span className="text-gray-500">Expense ID</span>
                                <span className="font-medium">#{expense.id}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 py-1.5">
                                <span className="text-gray-500">Ledger</span>
                                <span className="font-medium">{expense.ledger_title || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 py-1.5">
                                <span className="text-gray-500">Notes</span>
                                <span>{expense.notes || 'No notes'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Details</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between border-b border-gray-200 py-1.5">
                                <span className="text-gray-500">Created By</span>
                                <span>{expense.user_name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 py-1.5">
                                <span className="text-gray-500">Store</span>
                                <span>{expense.store_name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-gray-500">Created Date</span>
                                <span>
                                    <DateColumn date={expense.created_at} />
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className="rounded-md bg-gray-50 p-3">
                        <p className="text-xs leading-relaxed text-gray-600">
                            <span className="font-medium">Expense Record</span>
                            <br />
                            This expense is recorded in your financial records and linked to the associated ledger and journal entries.
                        </p>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-2 px-6 pb-6 pt-3">
                    <button onClick={onClose} className="h-9 flex-1 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewExpenseModal;
