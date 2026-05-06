'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showErrorDialog, showMessage, showSuccessDialog } from '@/lib/toast';
import { useCreateCustomerMutation } from '@/store/features/customer/customer';
import { ArrowLeft, Store, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CustomerFormData {
    name: string;
    email: string;
    phone: string;
    membership: 'normal' | 'silver' | 'gold' | 'platinum';
    points: number;
    balance: number;
    is_active: boolean;
    details: string;
}

const CreateCustomerPage = () => {
    const { t } = getTranslation();
    const { symbol } = useCurrency();
    const { currentStoreId, currentStore } = useCurrentStore();
    const router = useRouter();
    const [createCustomer, { isLoading: createLoading }] = useCreateCustomerMutation();

    const [formData, setFormData] = useState<CustomerFormData>({
        name: '',
        email: '',
        phone: '',
        membership: 'normal',
        points: 0,
        balance: 0,
        is_active: true,
        details: '',
    });

    const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else if (name === 'points' || name === 'balance') {
            setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        if (errors[name as keyof CustomerFormData]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<CustomerFormData> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('msg_customer_name_required');
            showMessage(t('msg_customer_name_required'), 'error');
        } else if (formData.name.trim().length < 2) {
            newErrors.name = t('msg_name_min_2_chars');
            showMessage(t('msg_name_min_2_chars'), 'error');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email.trim() && !emailRegex.test(formData.email)) {
            newErrors.email = t('msg_invalid_email');
            if (!newErrors.name) showMessage(t('msg_invalid_email'), 'error');
        }

        const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = t('msg_phone_required');
            if (!newErrors.name && !newErrors.email) showMessage(t('msg_phone_required'), 'error');
        } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = t('msg_invalid_phone');
            if (!newErrors.name && !newErrors.email) showMessage(t('msg_invalid_phone'), 'error');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!currentStoreId) {
            showMessage(t('msg_select_store_first'), 'error');
            return;
        }

        try {
            const submitData = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                membership: formData.membership,
                points: formData.points,
                balance: formData.balance,
                is_active: formData.is_active,
                details: formData.details.trim() || null,
                store_id: currentStoreId,
            };

            await createCustomer(submitData).unwrap();

            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                membership: 'normal',
                points: 0,
                balance: 0,
                is_active: true,
                details: '',
            });
            setErrors({});
            showSuccessDialog(t('msg_success'), t('customer_created'));

            router.push('/customers/list');
        } catch (error: any) {
            console.error('Create customer failed', error);
            const errorMessage = error?.data?.message || t('msg_error_occurred');
            showErrorDialog(t('msg_error'), errorMessage, t('btn_submit'));
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
                                <User className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">{t('customer_create_title')}</h1>
                                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{currentStore ? `${t('customer_add_to_store')} ${currentStore.store_name}` : t('customer_page_desc')}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.push('/customers/list')}
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

                {/* Main Form Card */}
                <form onSubmit={handleSubmit}>
                <div className="overflow-hidden rounded-xl bg-white shadow-xl sm:rounded-2xl">
                    <div className="p-4 sm:p-6 md:p-8">
                        <div className="space-y-8">
                            {/* Basic Information Section */}
                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('lbl_basic_information')}</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Customer Name */}
                                    <div className="md:col-span-2">
                                        <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                                            {t('lbl_full_name')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder={t('customer_name_placeholder')}
                                            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary ${
                                                errors.name ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                                            {t('lbl_email')}
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="customer@example.com"
                                            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary ${
                                                errors.email ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
                                            {t('lbl_phone')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+1234567890"
                                            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary ${
                                                errors.phone ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Membership & Loyalty Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('lbl_membership_loyalty')}</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    {/* Membership */}
                                    <div>
                                        <label htmlFor="membership" className="mb-2 block text-sm font-medium text-gray-700">
                                            {t('lbl_loyalty_tier')}
                                        </label>
                                        <select
                                            id="membership"
                                            name="membership"
                                            value={formData.membership}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="normal">{t('status_normal')}</option>
                                            <option value="silver">{t('status_silver')}</option>
                                            <option value="gold">{t('status_gold')}</option>
                                            <option value="platinum">{t('status_platinum')}</option>
                                        </select>
                                    </div>

                                    {/* Points */}
                                    <div>
                                        <label htmlFor="points" className="mb-2 block text-sm font-medium text-gray-700">
                                            {t('lbl_loyalty_points')}
                                        </label>
                                        <input
                                            id="points"
                                            name="points"
                                            type="number"
                                            min="0"
                                            value={formData.points}
                                            onChange={handleChange}
                                            placeholder="0"
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    {/* Balance */}
                                    <div>
                                        <label htmlFor="balance" className="mb-2 block text-sm font-medium text-gray-700">
                                            {t('lbl_balance')} ({symbol})
                                        </label>
                                        <input
                                            id="balance"
                                            name="balance"
                                            type="number"
                                            step="0.01"
                                            value={formData.balance}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">{t('msg_negative_for_due')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('lbl_additional_information')}</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Details */}
                                    <div className="md:col-span-2">
                                        <label htmlFor="details" className="mb-2 block text-sm font-medium text-gray-700">
                                            {t('customer_details_label')}
                                        </label>
                                        <textarea
                                            id="details"
                                            name="details"
                                            value={formData.details}
                                            onChange={handleChange}
                                            placeholder={t('placeholder_customer_notes')}
                                            rows={3}
                                            maxLength={500}
                                            className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary"
                                        />
                                        <p className="mt-1 text-sm text-gray-500">{formData.details.length}/500 characters</p>
                                    </div>

                                    {/* Active Status */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_account_status')}</label>
                                        <div className="flex items-center space-x-3">
                                            <input
                                                id="is_active"
                                                name="is_active"
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={handleChange}
                                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-primary"
                                            />
                                            <label htmlFor="is_active" className="text-sm text-gray-700">
                                                {t('lbl_active_account')}
                                            </label>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">{t('msg_inactive_account_desc')}</p>
                                    </div>

                                    {/* Store Info (Read-only) */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_store')}</label>
                                        <input
                                            type="text"
                                            value={currentStore?.store_name || 'Current Store'}
                                            disabled
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Form Footer */}
                    <div className="border-t bg-gray-50 px-4 py-4 sm:px-6 sm:py-6 md:px-8">
                        <div className="flex flex-col items-center justify-end space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                            <button
                                type="button"
                                onClick={() => router.push('/customers/list')}
                                disabled={createLoading}
                                className="w-full rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                {t('btn_cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={createLoading}
                                className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#046ca9] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                {createLoading ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        {t('btn_creating')}
                                    </>
                                ) : (
                                    <>
                                        <User className="mr-2 h-5 w-5" />
                                        {t('customer_create_btn')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                </form>

                {/* Tips Card */}
                <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="mb-1 font-medium">{t('lbl_customer_creation_tips')}</p>
                            <ul className="space-y-1 text-blue-700">
                                <li>• {t('customer_tip_1')}</li>
                                <li>• {t('customer_tip_2')}</li>
                                <li>• {t('customer_tip_3')}</li>
                                <li>• {t('customer_tip_4')}</li>
                                <li>• {t('customer_tip_5')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCustomerPage;
