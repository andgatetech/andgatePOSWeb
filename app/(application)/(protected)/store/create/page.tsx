'use client';

import SubscriptionError from '@/components/common/SubscriptionError';
import useSubscriptionError from '@/hooks/useSubscriptionError';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import { RootState } from '@/store';
import { useCreateStoreMutation } from '@/store/features/store/storeApi';
import { ArrowLeft, Building2, MapPin, Phone, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSelector } from 'react-redux';

const CreateStorePage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
    const [createStore, { isLoading, error: createError }] = useCreateStoreMutation();
    const { hasSubscriptionError, subscriptionError } = useSubscriptionError(createError);

    const [formData, setFormData] = useState({ store_name: '', address: '', store_phone: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.store_name.trim() || !formData.address.trim()) {
            showMessage(t('msg_fill_required_fields'), 'error');
            return;
        }

        try {
            await createStore({
                user_id: user?.id,
                store_name: formData.store_name.trim(),
                address: formData.address.trim(),
                ...(formData.store_phone.trim() && { store_phone: formData.store_phone.trim() }),
            }).unwrap();
            showMessage(t('msg_store_created'), 'success');
            router.push('/store');
        } catch (error: any) {
            if (error?.status !== 403) {
                showMessage(t('msg_failed_create_store'), 'error');
            }
        }
    };

    if (hasSubscriptionError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f4f9fc] via-white to-[#fff7ed] p-2 sm:p-4 md:p-6">
                <div className="mx-auto max-w-2xl">
                    <SubscriptionError errorType={subscriptionError.errorType!} message={subscriptionError.message} details={subscriptionError.details} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f9fc] via-white to-[#fff7ed] p-2 sm:p-4 md:p-6">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-4 rounded-xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-sm sm:mb-6 sm:rounded-2xl sm:p-6 md:mb-8">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#046ca9] to-[#034d79] shadow-md sm:h-12 sm:w-12 sm:rounded-xl">
                                <Store className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">{t('store_create_new_title')}</h1>
                                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{t('store_create_subtitle')}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.push('/store')}
                            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 sm:w-auto sm:justify-start sm:rounded-xl sm:px-4 sm:text-sm"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>{t('btn_back')}</span>
                        </button>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit}>
                    <div className="overflow-hidden rounded-xl bg-white shadow-xl sm:rounded-2xl">
                        <div className="p-4 sm:p-6 md:p-8">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:mb-6 sm:text-xl">{t('lbl_store_information')}</h2>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Store Name */}
                                <div className="lg:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        {t('lbl_store_name')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="store_name"
                                            value={formData.store_name}
                                            onChange={handleChange}
                                            placeholder={t('placeholder_store_name_example')}
                                            required
                                            className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="lg:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        {t('lbl_store_address')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder={t('placeholder_store_address_example')}
                                            required
                                            rows={3}
                                            className="w-full resize-none rounded-lg border border-gray-300 py-3 pl-11 pr-4 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        {t('lbl_store_phone')} <span className="text-xs text-gray-400">({t('lbl_optional')})</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="store_phone"
                                            value={formData.store_phone}
                                            onChange={handleChange}
                                            placeholder={t('placeholder_store_phone_example')}
                                            className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t bg-gray-50 px-4 py-4 sm:px-6 sm:py-6 md:px-8">
                            <div className="flex flex-col items-center justify-end space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                                <button
                                    type="button"
                                    onClick={() => router.push('/store')}
                                    disabled={isLoading}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                >
                                    {t('btn_cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !formData.store_name.trim() || !formData.address.trim()}
                                    className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#046ca9] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            {t('lbl_creating')}
                                        </>
                                    ) : (
                                        <>
                                            <Store className="mr-2 h-5 w-5" />
                                            {t('btn_create_store')}
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

export default CreateStorePage;
