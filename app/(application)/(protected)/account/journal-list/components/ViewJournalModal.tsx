'use client';

import DateColumn from '@/components/common/DateColumn';
import { useCurrency } from '@/hooks/useCurrency';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ViewJournalModalProps {
    journal: any;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
}

const ViewJournalModal: React.FC<ViewJournalModalProps> = ({ journal, isOpen, onClose, onEdit }) => {
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

    if (!isOpen || !journal) return null;

    const balance = parseFloat(journal.balance || '0');
    const debit = parseFloat(journal.debit || '0');
    const credit = parseFloat(journal.credit || '0');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-[360px] rounded-lg border bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="border-b px-6 py-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-medium">Journal #{journal.id}</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">{journal.ledger?.title || journal.ledger_title || 'N/A'}</p>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="space-y-3 p-6 text-sm">
                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">Debit</span>
                        <span className="font-medium text-green-600">{debit > 0 ? formatCurrency(debit) : '—'}</span>
                    </div>

                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">Credit</span>
                        <span className={`font-medium ${credit > 0 ? 'text-red-600' : ''}`}>{credit > 0 ? formatCurrency(credit) : '—'}</span>
                    </div>

                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">Balance</span>
                        <span className="font-medium">{formatCurrency(balance)}</span>
                    </div>

                    <div className="border-b border-gray-200 py-2">
                        <p className="mb-1 text-gray-500">Notes</p>
                        <p>{journal.notes || '—'}</p>
                    </div>

                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">Created by</span>
                        <span>{journal.user?.name || '—'}</span>
                    </div>

                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">Created</span>
                        <DateColumn date={journal.created_at} />
                    </div>

                    <div className="flex justify-between py-2">
                        <span className="text-gray-500">Updated</span>
                        <DateColumn date={journal.updated_at} />
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-2 px-6 pb-6 pt-3">
                    <button onClick={onClose} className="h-9 flex-1 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50">
                        Close
                    </button>
                    {onEdit && (
                        <button onClick={onEdit} className="h-9 flex-1 rounded-md bg-black text-sm font-medium text-white hover:bg-gray-800">
                            Edit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewJournalModal;
