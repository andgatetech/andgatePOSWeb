'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showErrorDialog, showMessage } from '@/lib/toast';
import { useCreateLedgerMutation } from '@/store/features/ledger/ledger';
import { ArrowLeft, BookOpen, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const CreateLedgerPage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const { currentStore, currentStoreId } = useCurrentStore();
    const [createLedger, { isLoading }] = useCreateLedgerMutation();

    const LEDGER_TYPES = [
        { id: 'assets', label: t('account_assets') },
        { id: 'expenses', label: t('expense_title') },
        { id: 'income', label: t('account_income') },
        { id: 'liabilities', label: t('account_liabilities') },
    ];

    const [formData, setFormData] = useState({ title: '', ledger_type: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = t('msg_ledger_title_required');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (!currentStoreId) { showErrorDialog(t('msg_error'), t('msg_select_store_first')); return; }

        try {
            await createLedger({
                store_id: currentStoreId,
                title: formData.title.trim(),
                ledger_type: formData.ledger_type || null,
            }).unwrap();
            showMessage(t('msg_ledger_created'), 'success');
            router.push('/account/ledger-list');
        } catch (error: any) {
            showErrorDialog(t('msg_error'), error?.data?.message || t('msg_failed_create_ledger'));
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
                                <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">{t('lbl_new_ledger')}</h1>
                                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{currentStore ? `${t('lbl_current_store')}: ${currentStore.store_name}` : t('account_ledger')}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.push('/account/ledger-list')}
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
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:mb-6 sm:text-xl">{t('lbl_ledger_information')}</h2>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Title */}
                                <div className="lg:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        {t('lbl_title')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => { setFormData({ ...formData, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: '' }); }}
                                        placeholder={t('placeholder_ledger_title')}
                                        className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#046ca9] focus:ring-[#046ca9]'}`}
                                    />
                                    {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_type')}</label>
                                    <select
                                        value={formData.ledger_type}
                                        onChange={(e) => setFormData({ ...formData, ledger_type: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                    >
                                        <option value="">{t('placeholder_select_type')}</option>
                                        {LEDGER_TYPES.map((type) => (
                                            <option key={type.id} value={type.id}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t bg-gray-50 px-4 py-4 sm:px-6 sm:py-6 md:px-8">
                            <div className="flex flex-col items-center justify-end space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                                <button
                                    type="button"
                                    onClick={() => router.push('/account/ledger-list')}
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

export default CreateLedgerPage;
