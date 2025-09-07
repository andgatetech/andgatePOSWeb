'use client';

import { BookOpen, Edit, Eye, Store, Trash2, TrendingDown, TrendingUp, User } from 'lucide-react';
import { useState } from 'react';

const JournalTable = ({ journals }) => {
    const [selectedJournal, setSelectedJournal] = useState(null);

    const formatAmount = (amount) => {
        return Number(amount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTransactionTypeIcon = (debit, credit) => {
        if (debit > 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
        if (credit > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
        return <BookOpen className="h-4 w-4 text-slate-400" />;
    };

    const getTransactionBadge = (debit, credit) => {
        if (debit > 0) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                    <TrendingDown size={12} />
                    Debit
                </span>
            );
        }
        if (credit > 0) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    <TrendingUp size={12} />
                    Credit
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                <BookOpen size={12} />
                Balance
            </span>
        );
    };

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="px-4 py-4 text-left font-semibold text-slate-700">ID</th>
                            <th className="px-4 py-4 text-left font-semibold text-slate-700">Date</th>
                            <th className="px-4 py-4 text-left font-semibold text-slate-700">Ledger</th>
                            <th className="px-4 py-4 text-left font-semibold text-slate-700">Type</th>
                            <th className="px-4 py-4 text-left font-semibold text-slate-700">Debit</th>
                            <th className="px-4 py-4 text-left font-semibold text-slate-700">Credit</th>
                            <th className="px-4 py-4 text-left font-semibold text-slate-700">Store</th>
                            <th className="px-4 py-4 text-left font-semibold text-slate-700">User</th>
                            <th className="px-4 py-4 text-left font-semibold text-slate-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {journals.map((journal, index) => (
                            <tr key={journal.id} className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                                {/* ID */}
                                <td className="px-4 py-4">
                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-sm font-medium text-slate-700">#{journal.id}</span>
                                </td>

                                {/* Date */}
                                <td className="px-4 py-4 text-sm text-slate-600">{formatDate(journal.created_at)}</td>

                                {/* Ledger */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={16} className="text-slate-400" />
                                        <div>
                                            <div className="font-medium text-slate-900">{journal.ledger?.name || journal.ledger?.title || 'N/A'}</div>
                                            {journal.notes && <div className="max-w-48 truncate text-xs text-slate-500">{journal.notes}</div>}
                                        </div>
                                    </div>
                                </td>

                                {/* Transaction Type */}
                                <td className="px-4 py-4">{getTransactionBadge(journal.debit, journal.credit)}</td>

                                {/* Debit */}
                                <td className="px-4 py-4">
                                    {journal.debit > 0 ? <span className="font-bold text-red-600">৳{formatAmount(journal.debit)}</span> : <span className="text-slate-400">-</span>}
                                </td>

                                {/* Credit */}
                                <td className="px-4 py-4">
                                    {journal.credit > 0 ? <span className="font-bold text-green-600">৳{formatAmount(journal.credit)}</span> : <span className="text-slate-400">-</span>}
                                </td>

                                {/* Store */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <Store size={14} className="text-slate-400" />
                                        <span className="text-sm text-slate-600">{journal.store?.store_name || 'N/A'}</span>
                                    </div>
                                </td>

                                {/* User */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-slate-400" />
                                        <span className="text-sm text-slate-600">{journal.user?.name || 'N/A'}</span>
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-4">
                                    <div className="flex gap-2">
                                        <button onClick={() => setSelectedJournal(journal)} className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50" title="View details">
                                            <Eye size={16} />
                                        </button>
                                        <button className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-50" title="Edit journal">
                                            <Edit size={16} />
                                        </button>
                                        <button className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50" title="Delete journal">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Quick View Modal */}
            {selectedJournal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="mx-4 w-full max-w-2xl rounded-2xl bg-white p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">Journal Entry Details</h3>
                            <button onClick={() => setSelectedJournal(null)} className="text-slate-400 hover:text-slate-600">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Entry ID</label>
                                    <p className="text-slate-900">#{selectedJournal.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Date</label>
                                    <p className="text-slate-900">{formatDate(selectedJournal.created_at)}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-600">Ledger</label>
                                <p className="text-slate-900">{selectedJournal.ledger?.name || selectedJournal.ledger?.title || 'N/A'}</p>
                            </div>

                            {selectedJournal.notes && (
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Notes</label>
                                    <p className="text-slate-900">{selectedJournal.notes}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Debit Amount</label>
                                    <p className="text-lg font-bold text-red-600">{selectedJournal.debit > 0 ? `৳${formatAmount(selectedJournal.debit)}` : '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Credit Amount</label>
                                    <p className="text-lg font-bold text-green-600">{selectedJournal.credit > 0 ? `৳${formatAmount(selectedJournal.credit)}` : '-'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Store</label>
                                    <p className="text-slate-900">{selectedJournal.store?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Created by</label>
                                    <p className="text-slate-900">{selectedJournal.user?.name || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setSelectedJournal(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">
                                Close
                            </button>
                            <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Edit Entry</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default JournalTable;
