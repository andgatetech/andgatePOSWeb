'use client';

import { Dialog, Transition } from '@headlessui/react';
import { FileText, X } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { getTranslation } from '@/i18n';

interface ReturnReason {
    id: number;
    name: string;
}

interface ReturnReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    reasons: ReturnReason[];
    onConfirm: (reasonId: number, notes: string) => void;
}

export default function ReturnReasonModal({ isOpen, onClose, reasons, onConfirm }: ReturnReasonModalProps) {
    const { t } = getTranslation();
    const [reasonId, setReasonId] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setReasonId('');
            setNotes('');
            setError(null);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reasonId) {
            setError(t('msg_select_return_reason'));
            return;
        }
        setError(null);
        onConfirm(parseInt(reasonId, 10), notes.trim());
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-2xl transition-all sm:rounded-2xl">
                                <form onSubmit={handleSubmit}>
                                    <div className="flex items-start justify-between border-b border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-white p-4 sm:p-6">
                                        <div className="flex-1">
                                            <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-primary/70">{t('pos_return_reason')}</p>
                                            <Dialog.Title as="h3" className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                                <FileText className="h-5 w-5 text-primary" />
                                                {t('pos_select_return_reason')}
                                            </Dialog.Title>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="ml-3 rounded-full bg-white/80 p-2 text-gray-400 shadow-sm transition-all hover:bg-primary/10 hover:text-primary"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-4 p-4 sm:p-6">
                                        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

                                        <div>
                                            <label htmlFor="return-reason" className="mb-1.5 block text-sm font-medium text-gray-700">
                                                {t('pos_select_return_reason')} <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="return-reason"
                                                value={reasonId}
                                                onChange={(e) => setReasonId(e.target.value)}
                                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="">{t('pos_select_reason_placeholder')}</option>
                                                {reasons.map((reason) => (
                                                    <option key={reason.id} value={reason.id}>
                                                        {reason.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="return-notes" className="mb-1.5 block text-sm font-medium text-gray-700">
                                                {t('pos_return_notes_optional')}
                                            </label>
                                            <textarea
                                                id="return-notes"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder={t('pos_return_notes_placeholder')}
                                                rows={3}
                                                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3 sm:px-6">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                                        >
                                            {t('btn_cancel')}
                                        </button>
                                        <button type="submit" className="rounded-lg bg-warning px-4 py-2 text-sm font-medium text-white transition hover:bg-warning/90">
                                            {t('btn_submit_return')}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
