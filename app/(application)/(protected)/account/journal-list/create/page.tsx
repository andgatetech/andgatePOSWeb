'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showErrorDialog, showMessage } from '@/lib/toast';
import { useCreateJournalMutation } from '@/store/features/journals/journals';
import { useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { ArrowLeft, BookOpen, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const CreateJournalPage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const { currentStore, currentStoreId } = useCurrentStore();
    const [createJournal, { isLoading }] = useCreateJournalMutation();

    const { data: ledgersResponse } = useGetLedgersQuery(
        { store_id: currentStoreId, per_page: 100 },
        { skip: !currentStoreId }
    );
    const ledgers = ledgersResponse?.data?.items || [];

    const [formData, setFormData] = useState({ ledger_id: '', debit: '', credit: '', notes: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.ledger_id) newErrors.ledger_id = t('msg_select_ledger');
        const debit = parseFloat(formData.debit || '0');
        const credit = parseFloat(formData.credit || '0');
        if (debit === 0 && credit === 0) newErrors.amount = t('msg_debit_or_credit_required');
        if (debit > 0 && credit > 0) newErrors.amount = t('msg_cannot_have_both_debit_credit');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (!currentStoreId) { showErrorDialog(t('msg_error'), t('msg_select_store_first')); return; }

        try {
            await createJournal({
                store_id: currentStoreId,
                ledger_id: parseInt(formData.ledger_id),
                debit: parseFloat(formData.debit || '0'),
                credit: parseFloat(formData.credit || '0'),
                notes: formData.notes.trim(),
            }).unwrap();
            showMessage(t('msg_journal_created'), 'success');
            router.push('/account/journal-list');
        } catch (error: any) {
            showErrorDialog(t('msg_error'), error?.data?.message || t('msg_failed_create_journal'));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f9fc] via-white to-[#fff7ed] p-2 sm:p-4 md:p-6">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-4 rounded-xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-sm sm:mb-6 sm:rounded-2xl sm:p-6 md:mb-8">
                    <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:mb-6 sm:flex-row sm:items-center">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#046ca9] to-[#034d79] shadow-md sm:h-12 sm:w-12 sm:rounded-xl">
                                <BookOpen className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">{t('lbl_new_journal')}</h1>
                                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{currentStore ? `${t('lbl_current_store')}: ${currentStore.store_name}` : t('account_journal')}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.push('/account/journal-list')}
                            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 sm:w-auto sm:justify-start sm:rounded-xl sm:px-4 sm:text-sm"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>{t('btn_back')}</span>
                        </button>
                    </div>
                    {currentStore && (
                        <div className="rounded-lg bg-[#046ca9]/5 p-3 sm:p-4">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#046ca9]/10 sm:h-8 sm:w-8">
                                    <Store className="h-3.5 w-3.5 text-[#046ca9] sm:h-4 sm:w-4" />
                                </div>
                                <p className="text-xs font-medium text-[#034d79] sm:text-sm">{t('lbl_current_store')}: {currentStore.store_name}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit}>
                    <div className="overflow-hidden rounded-xl bg-white shadow-xl sm:rounded-2xl">
                        <div className="p-4 sm:p-6 md:p-8">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:mb-6 sm:text-xl">{t('lbl_journal_information')}</h2>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Ledger */}
                                <div className="lg:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        {t('account_ledger')} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.ledger_id}
                                        onChange={(e) => { setFormData({ ...formData, ledger_id: e.target.value }); if (errors.ledger_id) setErrors({ ...errors, ledger_id: '' }); }}
                                        className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${errors.ledger_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#046ca9] focus:ring-[#046ca9]'}`}
                                    >
                                        <option value="">{t('placeholder_select_ledger')}</option>
                                        {ledgers.map((ledger: any) => (
                                            <option key={ledger.id} value={ledger.id}>{ledger.title}</option>
                                        ))}
                                    </select>
                                    {errors.ledger_id && <p className="mt-1 text-xs text-red-500">{errors.ledger_id}</p>}
                                </div>

                                {/* Debit */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_debit')}</label>
                                    <input
                                        type="number"
                                        value={formData.debit}
                                        onChange={(e) => { setFormData({ ...formData, debit: e.target.value }); if (errors.amount) setErrors({ ...errors, amount: '' }); }}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                    />
                                </div>

                                {/* Credit */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_credit')}</label>
                                    <input
                                        type="number"
                                        value={formData.credit}
                                        onChange={(e) => { setFormData({ ...formData, credit: e.target.value }); if (errors.amount) setErrors({ ...errors, amount: '' }); }}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                    />
                                </div>
                                {errors.amount && <p className="text-xs text-red-500 lg:col-span-2">{errors.amount}</p>}

                                {/* Notes */}
                                <div className="lg:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_notes')}</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder={t('placeholder_notes')}
                                        rows={3}
                                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t bg-gray-50 px-4 py-4 sm:px-6 sm:py-6 md:px-8">
                            <div className="flex flex-col items-center justify-end space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                                <button
                                    type="button"
                                    onClick={() => router.push('/account/journal-list')}
                                    disabled={isLoading}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                >
                                    {t('btn_cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#046ca9] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            {t('lbl_creating')}
                                        </>
                                    ) : (
                                        <>
                                            <BookOpen className="mr-2 h-5 w-5" />
                                            {t('btn_create')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateJournalPage;
