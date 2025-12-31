'use client';

import { Calendar, CheckCircle, CreditCard, DollarSign, Hash, Receipt, User, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ViewExpenseModalProps {
    expense: any;
    isOpen: boolean;
    onClose: () => void;
}

const PAYMENT_TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    cash: { label: 'Cash', color: 'text-green-700', bgColor: 'bg-green-100' },
    bank: { label: 'Bank', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    card: { label: 'Card', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    others: { label: 'Others', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

const ViewExpenseModal: React.FC<ViewExpenseModalProps> = ({ expense, isOpen, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

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

    const formatCurrency = (amount: string | number) => {
        return `৳${parseFloat(amount?.toString() || '0').toLocaleString()}`;
    };

    const paymentConfig = PAYMENT_TYPE_CONFIG[expense.payment_type?.toLowerCase()] || PAYMENT_TYPE_CONFIG.others;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div ref={modalRef} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white bg-opacity-20 shadow-lg">
                                <Receipt className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{expense.title || 'Expense Details'}</h2>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-white bg-opacity-20 px-3 py-1 text-xs font-medium text-white">ID: #{expense.id}</span>
                                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${paymentConfig.bgColor} ${paymentConfig.color}`}>
                                        <CreditCard className="h-3 w-3" />
                                        {paymentConfig.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20 text-white transition-colors hover:bg-opacity-30">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Amount Card */}
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                        <p className="text-sm font-medium text-red-600">Total Expense Amount</p>
                        <p className="mt-2 text-4xl font-bold text-red-700">{formatCurrency(expense.debit)}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Expense Information */}
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                <Receipt className="h-5 w-5 text-red-600" />
                                Expense Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                                        <Hash className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Expense ID</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">#{expense.id}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                                        <Receipt className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Ledger</p>
                                        <div className="mt-0.5 flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900">{expense.ledger_title || 'N/A'}</span>
                                            {expense.expense_ledger_type && (
                                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{expense.expense_ledger_type}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                                        <DollarSign className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Notes</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">{expense.notes || 'No notes'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                <Calendar className="h-5 w-5 text-red-600" />
                                Details
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                                        <User className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Created By</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">{expense.user_name || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
                                        <Receipt className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Store</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">{expense.store_name || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Created Date</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">
                                            {new Date(expense.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                            <div className="text-sm text-red-800">
                                <p className="font-medium">Expense Record</p>
                                <p className="mt-1 text-xs text-red-700">This expense is recorded in your financial records and linked to the associated ledger and journal entries.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex justify-end">
                        <button onClick={onClose} className="rounded-lg bg-gray-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-gray-700">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewExpenseModal;
