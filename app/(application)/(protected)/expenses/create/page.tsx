'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showErrorDialog, showMessage } from '@/lib/toast';
import type { RootState } from '@/store';
import { useCreateExpenseMutation } from '@/store/features/expense/expenseApi';
import { useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { ArrowLeft, Receipt, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSelector } from 'react-redux';

const CreateExpensePage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const { currentStore, currentStoreId } = useCurrentStore();
    const [createExpense, { isLoading }] = useCreateExpenseMutation();

    const paymentMethods = useSelector((state: RootState) => state.auth.currentStore?.payment_methods || []);
    const activePaymentMethods = paymentMethods.filter((pm) => pm.is_active);

    const { data: ledgersResponse } = useGetLedgersQuery(
        { store_id: currentStoreId, ledger_type: 'Expenses', per_page: 100 },
        { skip: !currentStoreId }
    );
    const ledgers = ledgersResponse?.data?.items || [];

    const [formData, setFormData] = useState({
        title: '',
        ledger_id: '',
        expense_ledger_type: '',
        debit: '',
        payment_type: '',
        notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = t('msg_title_required');
        if (parseFloat(formData.debit || '0') <= 0) newErrors.debit = t('msg_amount_greater_than_0');
        if (!formData.payment_type) newErrors.payment_type = t('msg_payment_type_required');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (!currentStoreId) { showErrorDialog(t('msg_error'), t('msg_select_store_first')); return; }

        try {
            const payload: any = {
                store_id: currentStoreId,
                title: formData.title.trim(),
                debit: parseFloat(formData.debit),
                payment_type: formData.payment_type,
                notes: formData.notes.trim(),
                expense_ledger_type: formData.expense_ledger_type,
            };
            if (formData.ledger_id) payload.ledger_id = parseInt(formData.ledger_id);

            await createExpense(payload).unwrap();
            showMessage(t('msg_expense_created'), 'success');
            router.push('/expenses/expense-list');
        } catch (error: any) {
            showErrorDialog(t('msg_error'), error?.data?.message || t('msg_failed_create_expense'));
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
                                <Receipt className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">{t('lbl_create_expense')}</h1>
                                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{currentStore ? `${t('expense_add_to_store')} ${currentStore.store_name}` : t('expense_title')}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.push('/expenses/expense-list')}
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
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:mb-6 sm:text-xl">{t('lbl_expense_information')}</h2>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Title */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        {t('lbl_title')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => { setFormData({ ...formData, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: '' }); }}
                                        placeholder={t('placeholder_expense_title')}
                                        className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#046ca9] focus:ring-[#046ca9]'}`}
                                    />
                                    {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        {t('lbl_amount')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.debit}
                                        onChange={(e) => { setFormData({ ...formData, debit: e.target.value }); if (errors.debit) setErrors({ ...errors, debit: '' }); }}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${errors.debit ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#046ca9] focus:ring-[#046ca9]'}`}
                                    />
                                    {errors.debit && <p className="mt-1 text-xs text-red-500">{errors.debit}</p>}
                                </div>

                                {/* Ledger */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        {t('lbl_ledger')} <span className="text-gray-400 text-xs">({t('lbl_optional')})</span>
                                    </label>
                                    <select
                                        value={formData.ledger_id}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            const selected = ledgers.find((l: any) => l.id.toString() === id);
                                            setFormData({ ...formData, ledger_id: id, expense_ledger_type: selected ? selected.title : '' });
                                        }}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                    >
                                        <option value="">{t('placeholder_auto_create_expense_ledger')}</option>
                                        {ledgers.map((ledger: any) => (
                                            <option key={ledger.id} value={ledger.id}>{ledger.title}</option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">{t('msg_expense_ledger_hint')}</p>
                                </div>

                                {/* Notes */}
                                <div>
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

                            {/* Payment Type */}
                            <div className="mt-6 border-t pt-6">
                                <label className="mb-3 block text-sm font-medium text-gray-700">
                                    {t('lbl_payment_type')} <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {activePaymentMethods.length > 0 ? activePaymentMethods.map((method) => (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => { setFormData({ ...formData, payment_type: method.payment_method_name }); if (errors.payment_type) setErrors({ ...errors, payment_type: '' }); }}
                                            className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${formData.payment_type === method.payment_method_name ? 'border-[#046ca9] bg-[#046ca9]/10 text-[#046ca9]' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {method.payment_method_name.charAt(0).toUpperCase() + method.payment_method_name.slice(1)}
                                        </button>
                                    )) : (
                                        <button
                                            type="button"
                                            onClick={() => { setFormData({ ...formData, payment_type: 'cash' }); if (errors.payment_type) setErrors({ ...errors, payment_type: '' }); }}
                                            className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${formData.payment_type === 'cash' ? 'border-[#046ca9] bg-[#046ca9]/10 text-[#046ca9]' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {t('lbl_cash')}
                                        </button>
                                    )}
                                </div>
                                {errors.payment_type && <p className="mt-2 text-xs text-red-500">{errors.payment_type}</p>}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t bg-gray-50 px-4 py-4 sm:px-6 sm:py-6 md:px-8">
                            <div className="flex flex-col items-center justify-end space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                                <button
                                    type="button"
                                    onClick={() => router.push('/expenses/expense-list')}
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
                                            <Receipt className="mr-2 h-5 w-5" />
                                            {t('lbl_create_expense')}
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

export default CreateExpensePage;
