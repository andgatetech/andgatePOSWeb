'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ViewLedgerModalProps {
    ledger: any;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
}

const ViewLedgerModal: React.FC<ViewLedgerModalProps> = ({ ledger, isOpen, onClose, onEdit }) => {
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

    const status = ledger.status?.toLowerCase() || 'inactive';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-[360px] rounded-lg border bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="border-b px-6 py-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-medium">{ledger.title}</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">{ledger.store_name || 'N/A'}</p>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="space-y-3 p-6 text-sm">
                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">ID</span>
                        <span className="font-medium">#{ledger.id}</span>
                    </div>

                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">Journals</span>
                        <span className="font-medium">{ledger.journals_count || 0}</span>
                    </div>

                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">Status</span>
                        <span className={`font-medium capitalize ${status === 'active' ? 'text-green-600' : ''}`}>{status}</span>
                    </div>

                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">Created</span>
                        <span>{new Date(ledger.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>

                    <div className="flex justify-between py-2">
                        <span className="text-gray-500">Updated</span>
                        <span>{new Date(ledger.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-2 px-6 pb-6 pt-3">
                    <button onClick={onClose} className="h-9 flex-1 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50">
                        Close
                    </button>
                    <button onClick={onEdit} className="h-9 flex-1 rounded-md bg-black text-sm font-medium text-white hover:bg-gray-800">
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewLedgerModal;
