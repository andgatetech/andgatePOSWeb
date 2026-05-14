'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { unwrapApiData } from '@/lib/api-response';
import { showErrorDialog, showMessage, showSuccessDialog } from '@/lib/toast';
import { useGetSingleSupplierQuery, useUpdateSupplierMutation } from '@/store/features/supplier/supplierApi';
import { ArrowLeft, Store, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SupplierFormData {
    name: string;
    company_name: string;
    email: string;
    phone: string;
    address: string;
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
    notes: string;
    status: 'active' | 'inactive' | 'blocked';
}

const EditSupplierPage = () => {
    const { t } = getTranslation();
    const { id } = useParams();
    const { currentStoreId, currentStore } = useCurrentStore();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    const { data: supplierResponse, isLoading: fetchLoading } = useGetSingleSupplierQuery(id as string);
    const [updateSupplier, { isLoading: updateLoading }] = useUpdateSupplierMutation();

    const [formData, setFormData] = useState<SupplierFormData>({
        name: '',
        company_name: '',
        email: '',
        phone: '',
        address: '',
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
        notes: '',
        status: 'active',
    });

    const [errors, setErrors] = useState<Partial<SupplierFormData>>({});
    const supplier = unwrapApiData(supplierResponse, ['supplier']);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Populate form when supplier data is loaded
    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name || '',
                company_name: supplier.company_name || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                address: supplier.address || '',
                contact_person: supplier.contact_person || '',
                supplier_type: supplier.supplier_type || '',
                opening_balance: supplier.opening_balance || '',
                payment_terms: supplier.payment_terms || '',
                credit_limit: supplier.credit_limit || '',
                preferred_payment_method: supplier.preferred_payment_method || '',
                mobile_banking_number: supplier.mobile_banking_number || '',
                bank_name: supplier.bank_name || '',
                bank_account_name: supplier.bank_account_name || '',
                bank_account_number: supplier.bank_account_number || '',
                trade_license_no: supplier.trade_license_no || '',
                tin_no: supplier.tin_no || '',
                bin_no: supplier.bin_no || '',
                notes: supplier.notes || '',
                status: supplier.status || 'active',
            });
        }
    }, [supplier]);

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

        try {
            const submitData = {
                id: id as string,
                name: formData.name.trim(),
                company_name: formData.company_name.trim() || null,
                email: formData.email.trim() ? formData.email.trim().toLowerCase() : null,
                phone: formData.phone.trim(),
                address: formData.address.trim(),
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
                notes: formData.notes.trim() || null,
                status: formData.status,
            };

            await updateSupplier(submitData).unwrap();

            showSuccessDialog(t('msg_success'), t('supplier_updated'));
            router.push('/suppliers/list');
        } catch (error: any) {
            console.error('Update supplier failed', error);
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

    if (!isClient || fetchLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            {t('supplier_loading')}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.push('/suppliers/list')}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{t('supplier_edit_title')}</h1>
                            <p className="text-sm text-gray-500">{supplier?.name}</p>
                        </div>
                    </div>
                    {supplier?.store_name && (
                        <div className="rounded-xl border border-[#046ca9]/15 bg-[#046ca9]/5 p-3">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#046ca9]/10">
                                    <Store className="h-4 w-4 text-[#034d79]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#034d79]">{t('lbl_store')}: {supplier.store_name}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Form Card */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                    <div className="p-8">
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {/* Basic Information Section */}
                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('lbl_name')}</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Supplier Name */}
                                    <div className="md:col-span-2">
                                        <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                                            {t('lbl_supplier')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder={t('lbl_name')}
                                            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500 ${
                                                errors.name ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="supplier_type" className="mb-2 block text-sm font-medium text-gray-700">{t('supplier_type')}</label>
                                        <select
                                            id="supplier_type"
                                            name="supplier_type"
                                            value={formData.supplier_type}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                                        >
                                            {supplierTypeOptions.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
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
                                            placeholder={t('lbl_email')}
                                            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500 ${
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
                                            placeholder={t('lbl_phone')}
                                            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500 ${
                                                errors.phone ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                    </div>

                                    {/* Contact Person */}
                                    <div>
                                        <label htmlFor="contact_person" className="mb-2 block text-sm font-medium text-gray-700">
                                            {t('supplier_contact_person')}
                                        </label>
                                        <input
                                            id="contact_person"
                                            name="contact_person"
                                            type="text"
                                            value={formData.contact_person}
                                            onChange={handleChange}
                                            placeholder={t('supplier_contact_person_placeholder')}
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                                        />
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
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('supplier_payment_information')}</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="payment_terms" className="mb-2 block text-sm font-medium text-gray-700">{t('supplier_payment_terms')}</label>
                                        <select
                                            id="payment_terms"
                                            name="payment_terms"
                                            value={formData.payment_terms}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
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
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="preferred_payment_method" className="mb-2 block text-sm font-medium text-gray-700">{t('supplier_preferred_payment_method')}</label>
                                        <select
                                            id="preferred_payment_method"
                                            name="preferred_payment_method"
                                            value={formData.preferred_payment_method}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
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
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
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
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="bank_account_number" className="mb-2 block text-sm font-medium text-gray-700">{t('supplier_bank_account_number')}</label>
                                        <input
                                            id="bank_account_number"
                                            name="bank_account_number"
                                            type="text"
                                            value={formData.bank_account_number}
                                            onChange={handleChange}
                                            placeholder={t('supplier_bank_account_number_placeholder')}
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('supplier_business_information')}</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="trade_license_no" className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_trade_license_no')}</label>
                                        <input
                                            id="trade_license_no"
                                            name="trade_license_no"
                                            type="text"
                                            value={formData.trade_license_no}
                                            onChange={handleChange}
                                            placeholder={t('ph_trade_license_no')}
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
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
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="bin_no" className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_bin_no')}</label>
                                        <input
                                            id="bin_no"
                                            name="bin_no"
                                            type="text"
                                            value={formData.bin_no}
                                            onChange={handleChange}
                                            placeholder={t('ph_bin_no')}
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Status Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('lbl_address')}</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Address */}
                                    <div className="md:col-span-2">
                                        <label htmlFor="address" className="mb-2 block text-sm font-medium text-gray-700">
                                            {t('lbl_address')} <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder={t('lbl_address')}
                                            rows={3}
                                            maxLength={500}
                                            className={`w-full resize-none rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500 ${
                                                errors.address ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                                        <p className="mt-1 text-sm text-gray-500">{formData.address.length}/500</p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_notes')}</label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            placeholder={t('supplier_notes_placeholder')}
                                            rows={3}
                                            maxLength={1000}
                                            className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                                        />
                                        <p className="mt-1 text-sm text-gray-500">{formData.notes.length}/1000</p>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label htmlFor="status" className="mb-2 block text-sm font-medium text-gray-700">
                                            {t('lbl_status')}
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option value="active">{t('status_active')}</option>
                                            <option value="inactive">{t('status_inactive')}</option>
                                            <option value="blocked">{t('status_blocked')}</option>
                                        </select>
                                    </div>

                                    {/* Store Info (Read-only) */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_store')}</label>
                                        <input
                                            type="text"
                                            value={supplier?.store_name || 'N/A'}
                                            disabled
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
                                    <button
                                        type="button"
                                        onClick={() => router.push('/suppliers/list')}
                                        className="w-full rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 sm:w-auto"
                                    >
                                        {t('btn_cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-8 py-3 font-medium text-white transition-all duration-200 hover:from-orange-700 hover:to-red-700 focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[160px]"
                                    >
                                        {updateLoading ? (
                                            <>
                                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                {t('btn_updating')}
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {t('supplier_edit_title')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <div className="flex items-start gap-3">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-orange-800">
                            <p className="mb-1 font-medium">{t('supplier_update_guidelines_title')}</p>
                            <ul className="space-y-1 text-orange-700">
                                <li>• {t('supplier_update_guideline_1')}</li>
                                <li>• {t('supplier_update_guideline_2')}</li>
                                <li>• {t('supplier_update_guideline_3')}</li>
                                <li>• {t('supplier_update_guideline_4')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditSupplierPage;
