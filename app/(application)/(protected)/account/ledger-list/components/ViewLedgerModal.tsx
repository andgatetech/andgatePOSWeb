'use client';

import { BookOpen, Calendar, CheckCircle, Hash, Store, X, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ViewLedgerModalProps {
    ledger: any;
    isOpen: boolean;
    onClose: () => void;
}

const ViewLedgerModal: React.FC<ViewLedgerModalProps> = ({ ledger, isOpen, onClose }) => {
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

    if (!isOpen || !ledger) return null;

    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
        active: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-5 w-5" /> },
        inactive: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <XCircle className="h-5 w-5" /> },
    };

    const typeConfig: Record<string, { bg: string; text: string }> = {
        assets: { bg: 'bg-blue-100', text: 'text-blue-800' },
        expenses: { bg: 'bg-red-100', text: 'text-red-800' },
        income: { bg: 'bg-green-100', text: 'text-green-800' },
        liabilities: { bg: 'bg-orange-100', text: 'text-orange-800' },
    };

    const currentStatus = ledger.status?.toLowerCase() || 'inactive';
    const currentType = ledger.ledger_type?.toLowerCase() || 'unknown';
    const status = statusConfig[currentStatus] || statusConfig.inactive;
    const type = typeConfig[currentType] || { bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div ref={modalRef} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white bg-opacity-20 shadow-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{ledger.title}</h2>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${status.bg} ${status.text}`}>
                                        {status.icon}
                                        <span className="capitalize">{currentStatus}</span>
                                    </span>
                                    {ledger.ledger_type && <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${type.bg} ${type.text}`}>{ledger.ledger_type}</span>}
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
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Ledger Information */}
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                <BookOpen className="h-5 w-5 text-indigo-600" />
                                Ledger Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                                        <Hash className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Ledger ID</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">#{ledger.id}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                                        <BookOpen className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Total Journals</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">{ledger.journals_count || 0} entries</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                                        <Store className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Store</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">{ledger.store_name || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Information */}
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                <Calendar className="h-5 w-5 text-indigo-600" />
                                Timeline
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Created Date</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">
                                            {new Date(ledger.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-gray-600">{new Date(ledger.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                                        <Calendar className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Last Updated</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">
                                            {new Date(ledger.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-gray-600">{new Date(ledger.updated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100">
                                        <CheckCircle className="h-4 w-4 text-teal-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Account Status</p>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}>
                                                {status.icon}
                                                <span className="capitalize">{currentStatus}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                        <div className="flex items-start gap-3">
                            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-indigo-800">
                                <p className="font-medium">Ledger Information</p>
                                <p className="mt-1 text-xs text-indigo-700">This ledger is used to track financial transactions. View the journals for detailed transaction history.</p>
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

export default ViewLedgerModal;
