'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showErrorDialog, showMessage, showSuccessDialog } from '@/lib/toast';
import { useRegisterSupplierMutation } from '@/store/features/supplier/supplierApi';
import { ArrowLeft, Plus, Store, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface SupplierFormData {
    name: string;
    company_name: string;
    email: string;
    phone: string;
    contact_person: string;
    supplier_type: string;
    opening_balance: string;
    payment_terms: string;
    credit_limit: string;
    preferred_payment_method: string;
    mobile_banking_number: string;
    bank_name: string;
    bank_account_name: string;
    bank_account_number: string;
    trade_license_no: string;
    tin_no: string;
    bin_no: string;
    address: string;
    notes: string;
    status: 'active' | 'inactive';
}

const CreateSupplierPage = () => {
    const { t } = getTranslation();
    const { currentStoreId, currentStore } = useCurrentStore();
    const router = useRouter();
    const [registerSupplier, { isLoading: createLoading }] = useRegisterSupplierMutation();

    const [formData, setFormData] = useState<SupplierFormData>({
        name: '',
        company_name: '',
        email: '',
        phone: '',
        contact_person: '',
        supplier_type: '',
        opening_balance: '',
        payment_terms: '',
        credit_limit: '',
        preferred_payment_method: '',
        mobile_banking_number: '',
        bank_name: '',
        bank_account_name: '',
        bank_account_number: '',
        trade_license_no: '',
        tin_no: '',
        bin_no: '',
        address: '',
        notes: '',
        status: 'active',
    });

    const [errors, setErrors] = useState<Partial<SupplierFormData>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name as keyof SupplierFormData]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<SupplierFormData> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('msg_supplier_name_required');
            showMessage(t('msg_supplier_name_required'), 'error');
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

        if (!formData.address.trim()) {
            newErrors.address = t('msg_address_required');
            if (!newErrors.name && !newErrors.email && !newErrors.phone) showMessage(t('msg_address_required'), 'error');
        } else if (formData.address.trim().length < 10) {
            newErrors.address = t('msg_address_min_10_chars');
            if (!newErrors.name && !newErrors.email && !newErrors.phone) showMessage(t('msg_address_min_10_chars'), 'error');
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
                company_name: formData.company_name.trim() || null,
                email: formData.email.trim() ? formData.email.trim().toLowerCase() : null,
                phone: formData.phone.trim(),
                contact_person: formData.contact_person.trim() || null,
                supplier_type: formData.supplier_type || null,
                opening_balance: Number(formData.opening_balance || 0),
                payment_terms: formData.payment_terms || null,
                credit_limit: formData.credit_limit ? Number(formData.credit_limit) : null,
                preferred_payment_method: formData.preferred_payment_method || null,
                mobile_banking_number: formData.mobile_banking_number.trim() || null,
                bank_name: formData.bank_name.trim() || null,
                bank_account_name: formData.bank_account_name.trim() || null,
                bank_account_number: formData.bank_account_number.trim() || null,
                trade_license_no: formData.trade_license_no.trim() || null,
                tin_no: formData.tin_no.trim() || null,
                bin_no: formData.bin_no.trim() || null,
                address: formData.address.trim(),
                notes: formData.notes.trim() || null,
                status: formData.status,
                store_id: currentStoreId,
            };

            await registerSupplier(submitData).unwrap();

            // Reset form
            setFormData({
                name: '',
                company_name: '',
                email: '',
                phone: '',
                contact_person: '',
                supplier_type: '',
                opening_balance: '',
                payment_terms: '',
                credit_limit: '',
                preferred_payment_method: '',
                mobile_banking_number: '',
                bank_name: '',
                bank_account_name: '',
                bank_account_number: '',
                trade_license_no: '',
                tin_no: '',
                bin_no: '',
                address: '',
                notes: '',
                status: 'active',
            });
            setErrors({});
            showSuccessDialog(t('msg_success'), t('supplier_created'));

            router.push('/suppliers/list');
        } catch (error: any) {
            console.error('Create supplier failed', error);
            const errorMessage = error?.data?.message || t('msg_error_occurred');
            showErrorDialog(t('msg_error'), errorMessage, t('btn_confirm'));
        }
    };

    const supplierTypeOptions = [
        { value: '', label: t('supplier_type_select') },
        { value: 'wholesaler', label: t('supplier_type_wholesaler') },
        { value: 'distributor', label: t('supplier_type_distributor') },
        { value: 'manufacturer', label: t('supplier_type_manufacturer') },
        { value: 'service_provider', label: t('supplier_type_service_provider') },
        { value: 'other', label: t('supplier_type_other') },
    ];

    const paymentTermOptions = [
        { value: '', label: t('supplier_terms_select') },
        { value: 'cash', label: t('supplier_terms_cash') },
        { value: '7_days', label: t('supplier_terms_7_days') },
        { value: '15_days', label: t('supplier_terms_15_days') },
        { value: '30_days', label: t('supplier_terms_30_days') },
    ];

    const paymentMethodOptions = [
        { value: '', label: t('supplier_payment_method_select') },
        { value: 'cash', label: t('bd_payments_cash') },
        { value: 'mobile_banking', label: t('lbl_mobile_banking') },
        { value: 'bank_transfer', label: t('lbl_bank_transfer') },
        { value: 'cheque', label: t('supplier_payment_method_cheque') },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f9fc] via-white to-[#fff7ed] p-2 sm:p-4 md:p-6">
            <div className="mx-auto">
                <div className="mb-4 rounded-xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-sm sm:mb-6 sm:rounded-2xl sm:p-6 md:mb-8">
                    <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:mb-6 sm:flex-row sm:items-center">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#046ca9] to-[#034d79] shadow-md sm:h-12 sm:w-12 sm:rounded-xl">
                                <Truck className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">{t('supplier_create_title')}</h1>
                                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{currentStore ? `${t('supplier_add')} ${currentStore.store_name}` : t('supplier_add')}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.push('/suppliers/list')}
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
                                <p className="text-xs font-medium text-[#034d79] sm:text-sm">
                                    {t('lbl_current_store')}: {currentStore.store_name}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="overflow-hidden rounded-xl bg-white shadow-xl sm:rounded-2xl">
                        <div className="p-4 sm:p-6 md:p-8">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:mb-6 sm:text-xl">{t('lbl_basic_information')}</h2>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="lg:col-span-2">
                                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                                        {t('lbl_supplier')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder={t('placeholder_enter_name')}
                                        className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                                            errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#046ca9] focus:ring-[#046ca9]'
                                        }`}
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="company_name" className="mb-2 block text-sm font-medium text-gray-700">{t('supplier_company_name')}</label>
                                    <input
                                        id="company_name"
                                        name="company_name"
                                        type="text"
                                        value={formData.company_name}
                                        onChange={handleChange}
                                        placeholder={t('supplier_company_name_placeholder')}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contact_person" className="mb-2 block text-sm font-medium text-gray-700">{t('supplier_contact_person')}</label>
                                    <input
                                        id="contact_person"
                                        name="contact_person"
                                        type="text"
                                        value={formData.contact_person}
                                        onChange={handleChange}
                                        placeholder={t('supplier_contact_person_placeholder')}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="supplier_type" className="mb-2 block text-sm font-medium text-gray-700">{t('supplier_type')}</label>
                                    <select
                                        id="supplier_type"
                                        name="supplier_type"
                                        value={formData.supplier_type}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                    >
                                        {supplierTypeOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>

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
                                        placeholder={t('placeholder_email')}
                                        className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                                            errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#046ca9] focus:ring-[#046ca9]'
                                        }`}
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                </div>

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
                                        placeholder={t('placeholder_phone')}
                                        className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                                            errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#046ca9] focus:ring-[#046ca9]'
                                        }`}
                                    />
                                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label htmlFor="mobile_banking_number" className="mb-2 block text-sm font-medium text-gray-700">{t('supplier_mobile_banking_number')}</label>
                                    <input
                                        id="mobile_banking_number"
                                        name="mobile_banking_number"
                                        type="tel"
                                        value={formData.mobile_banking_number}
                                        onChange={handleChange}
                                        placeholder={t('supplier_mobile_banking_placeholder')}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 border-t pt-6 sm:mt-8 sm:pt-8">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:mb-6 sm:text-xl">{t('supplier_payment_information')}</h2>

                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div>
                                        <label htmlFor="opening_balance" className="mb-2 block text-sm font-medium text-gray-700">{t('supplier_opening_balance')}</label>
                                        <input
                                            id="opening_balance"
                                            name="opening_balance"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.opening_balance}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="payment_terms" className="mb-2 block text-sm font-medium text-gray-700">{t('supplier_payment_terms')}</label>
                                        <select
                                            id="payment_terms"
                                            name="payment_terms"
                                            value={formData.payment_terms}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                        >
                                            {paymentTermOptions.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="credit_limit" className="mb-2 block text-sm font-medium text-gray-700">{t('supplier_credit_limit')}</label>
                                        <input
                                            id="credit_limit"
                                            name="credit_limit"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.credit_limit}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="preferred_payment_method" className="mb-2 block text-sm font-medium text-gray-700">{t('supplier_preferred_payment_method')}</label>
                                        <select
                                            id="preferred_payment_method"
                                            name="preferred_payment_method"
                                            value={formData.preferred_payment_method}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                        >
                                            {paymentMethodOptions.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="bank_name" className="mb-2 block text-sm font-medium text-gray-700">{t('supplier_bank_name')}</label>
                                        <input
                                            id="bank_name"
                                            name="bank_name"
                                            type="text"
                                            value={formData.bank_name}
                                            onChange={handleChange}
                                            placeholder={t('supplier_bank_name_placeholder')}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="bank_account_name" className="mb-2 block text-sm font-medium text-gray-700">{t('supplier_bank_account_name')}</label>
                                        <input
                                            id="bank_account_name"
                                            name="bank_account_name"
                                            type="text"
                                            value={formData.bank_account_name}
                                            onChange={handleChange}
                                            placeholder={t('supplier_bank_account_name_placeholder')}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                        />
                                    </div>

                                    <div className="lg:col-span-2">
                                        <label htmlFor="bank_account_number" className="mb-2 block text-sm font-medium text-gray-700">{t('supplier_bank_account_number')}</label>
                                        <input
                                            id="bank_account_number"
                                            name="bank_account_number"
                                            type="text"
                                            value={formData.bank_account_number}
                                            onChange={handleChange}
                                            placeholder={t('supplier_bank_account_number_placeholder')}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 border-t pt-6 sm:mt-8 sm:pt-8">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:mb-6 sm:text-xl">{t('supplier_business_information')}</h2>

                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div>
                                        <label htmlFor="trade_license_no" className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_trade_license_no')}</label>
                                        <input
                                            id="trade_license_no"
                                            name="trade_license_no"
                                            type="text"
                                            value={formData.trade_license_no}
                                            onChange={handleChange}
                                            placeholder={t('ph_trade_license_no')}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="tin_no" className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_tin_no')}</label>
                                        <input
                                            id="tin_no"
                                            name="tin_no"
                                            type="text"
                                            value={formData.tin_no}
                                            onChange={handleChange}
                                            placeholder={t('ph_tin_no')}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                        />
                                    </div>

                                    <div className="lg:col-span-2">
                                        <label htmlFor="bin_no" className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_bin_no')}</label>
                                        <input
                                            id="bin_no"
                                            name="bin_no"
                                            type="text"
                                            value={formData.bin_no}
                                            onChange={handleChange}
                                            placeholder={t('ph_bin_no')}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 border-t pt-6 sm:mt-8 sm:pt-8">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:mb-6 sm:text-xl">{t('lbl_contact')}</h2>

                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div className="lg:col-span-2">
                                        <label htmlFor="address" className="mb-2 block text-sm font-medium text-gray-700">
                                            {t('lbl_address')} <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder={t('placeholder_address')}
                                            rows={3}
                                            maxLength={500}
                                            className={`w-full resize-none rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                                                errors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#046ca9] focus:ring-[#046ca9]'
                                            }`}
                                        />
                                        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                                        <p className="mt-1 text-xs text-gray-500">{formData.address.length}/500</p>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_notes')}</label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            placeholder={t('supplier_notes_placeholder')}
                                            rows={3}
                                            maxLength={1000}
                                            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">{formData.notes.length}/1000</p>
                                    </div>

                                    <div>
                                        <label htmlFor="status" className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_status')}</label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                        >
                                            <option value="active">{t('status_active')}</option>
                                            <option value="inactive">{t('status_inactive')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_store')}</label>
                                        <input
                                            type="text"
                                            value={currentStore?.store_name || t('lbl_store')}
                                            disabled
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t bg-gray-50 px-4 py-4 sm:px-6 sm:py-6 md:px-8">
                            <div className="flex flex-col items-center justify-end space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                                <button
                                    type="button"
                                    onClick={() => router.push('/suppliers/list')}
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
                                            <Plus className="mr-2 h-5 w-5" />
                                            {t('supplier_create_title')}
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

export default CreateSupplierPage;
