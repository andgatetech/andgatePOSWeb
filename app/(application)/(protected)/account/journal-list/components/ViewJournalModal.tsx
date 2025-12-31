'use client';

import { BookOpen, Calendar, CheckCircle, DollarSign, Hash, User, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ViewJournalModalProps {
    journal: any;
    isOpen: boolean;
    onClose: () => void;
}

const ViewJournalModal: React.FC<ViewJournalModalProps> = ({ journal, isOpen, onClose }) => {
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

    if (!isOpen || !journal) return null;

    const formatCurrency = (amount: string | number) => {
        return `৳${parseFloat(amount?.toString() || '0').toLocaleString()}`;
    };

    const balance = parseFloat(journal.balance || '0');
    const debit = parseFloat(journal.debit || '0');
    const credit = parseFloat(journal.credit || '0');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div ref={modalRef} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white bg-opacity-20 shadow-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Journal Entry</h2>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-white bg-opacity-20 px-3 py-1 text-xs font-medium text-white">ID: #{journal.id}</span>
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${balance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {formatCurrency(balance)}
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
                    {/* Financial Summary */}
                    <div className="mb-6 grid grid-cols-3 gap-4">
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                            <p className="text-xs font-medium text-red-600">Debit</p>
                            <p className="mt-1 text-xl font-bold text-red-700">{debit > 0 ? formatCurrency(debit) : '-'}</p>
                        </div>
                        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                            <p className="text-xs font-medium text-green-600">Credit</p>
                            <p className="mt-1 text-xl font-bold text-green-700">{credit > 0 ? formatCurrency(credit) : '-'}</p>
                        </div>
                        <div className={`rounded-xl border p-4 text-center ${balance >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                            <p className={`text-xs font-medium ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Balance</p>
                            <p className={`mt-1 text-xl font-bold ${balance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCurrency(balance)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Journal Information */}
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                <BookOpen className="h-5 w-5 text-emerald-600" />
                                Journal Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                                        <Hash className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Journal ID</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">#{journal.id}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                                        <BookOpen className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Ledger</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">{journal.ledger?.title || journal.ledger_title || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                                        <DollarSign className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Notes</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">{journal.notes || 'No notes'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline & User Information */}
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                <Calendar className="h-5 w-5 text-emerald-600" />
                                Details
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                                        <User className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Created By</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">{journal.user?.name || 'N/A'}</p>
                                        <p className="text-xs text-gray-500">{journal.user?.email || ''}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Created Date</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">
                                            {new Date(journal.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-gray-600">{new Date(journal.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                                        <Calendar className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Last Updated</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">
                                            {new Date(journal.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-gray-600">{new Date(journal.updated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                            <div className="text-sm text-emerald-800">
                                <p className="font-medium">Journal Entry Information</p>
                                <p className="mt-1 text-xs text-emerald-700">This journal entry is part of your financial records. Ensure accuracy before making any modifications.</p>
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

export default ViewJournalModal;
