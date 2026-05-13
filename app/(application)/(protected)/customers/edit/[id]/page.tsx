'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showErrorDialog, showMessage, showSuccessDialog } from '@/lib/toast';
import { useGetSingleCustomerQuery, useUpdateCustomerMutation } from '@/store/features/customer/customer';
import { ArrowLeft, Store, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CustomerFormData {
    name: string;
    customer_type: string;
    email: string;
    phone: string;
    alternative_phone: string;
    preferred_contact_method: string;
    date_of_birth: string;
    gender: string;
    membership: 'normal' | 'silver' | 'gold' | 'platinum';
    points: number;
    balance: number;
    credit_limit: string;
    nid_no: string;
    trade_name: string;
    is_active: boolean;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    details: string;
    delivery_note: string;
}

const EditCustomerPage = () => {
    const { t } = getTranslation();
    const { id } = useParams();
    const { symbol } = useCurrency();
    const { currentStoreId, currentStore } = useCurrentStore();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    const { data: customerResponse, isLoading: fetchLoading } = useGetSingleCustomerQuery(id as string);
    const [updateCustomer, { isLoading: updateLoading }] = useUpdateCustomerMutation();

    const [formData, setFormData] = useState<CustomerFormData>({
        name: '',
        customer_type: '',
        email: '',
        phone: '',
        alternative_phone: '',
        preferred_contact_method: '',
        date_of_birth: '',
        gender: '',
        membership: 'normal',
        points: 0,
        balance: 0,
        credit_limit: '',
        nid_no: '',
        trade_name: '',
        is_active: true,
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        details: '',
        delivery_note: '',
    });

    const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Populate form when customer data is loaded
    useEffect(() => {
        if (customerResponse?.data) {
            const customer = customerResponse.data;
            setFormData({
                name: customer.name || '',
                customer_type: customer.customer_type || '',
                email: customer.email || '',
                phone: customer.phone || '',
                alternative_phone: customer.alternative_phone || '',
                preferred_contact_method: customer.preferred_contact_method || '',
                date_of_birth: customer.date_of_birth || '',
                gender: customer.gender || '',
                membership: customer.membership || 'normal',
                points: customer.points || 0,
                balance: customer.balance || 0,
                credit_limit: customer.credit_limit || '',
                nid_no: customer.nid_no || '',
                trade_name: customer.trade_name || '',
                is_active: customer.is_active === true || customer.is_active === 1,
                address_line1: customer.address_line1 || '',
                address_line2: customer.address_line2 || '',
                city: customer.city || '',
                state: customer.state || '',
                postal_code: customer.postal_code || '',
                details: customer.details || '',
                delivery_note: customer.delivery_note || '',
            });
        }
    }, [customerResponse]);

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

        try {
            const submitData = {
                name: formData.name.trim(),
                customer_type: formData.customer_type || null,
                email: formData.email.trim() ? formData.email.trim().toLowerCase() : null,
                phone: formData.phone.trim(),
                alternative_phone: formData.alternative_phone.trim() || null,
                preferred_contact_method: formData.preferred_contact_method || null,
                date_of_birth: formData.date_of_birth || null,
                gender: formData.gender || null,
                membership: formData.membership,
                points: formData.points,
                balance: formData.balance,
                credit_limit: formData.credit_limit ? Number(formData.credit_limit) : null,
                nid_no: formData.nid_no.trim() || null,
                trade_name: formData.trade_name.trim() || null,
                is_active: formData.is_active,
                address_line1: formData.address_line1.trim() || null,
                address_line2: formData.address_line2.trim() || null,
                city: formData.city.trim() || null,
                state: formData.state.trim() || null,
                postal_code: formData.postal_code.trim() || null,
                country_code: 'BD',
                details: formData.details.trim() || null,
                delivery_note: formData.delivery_note.trim() || null,
            };

            await updateCustomer({ customerId: id as string, customerData: submitData }).unwrap();

            showSuccessDialog(t('msg_success'), t('customer_updated'));
            router.push('/customers/list');
        } catch (error: any) {
            console.error('Update customer failed', error);
            const errorMessage = error?.data?.message || t('msg_error_occurred');
            showErrorDialog(t('msg_error'), errorMessage, t('btn_submit'));
        }
    };

    const customerTypeOptions = [
        { value: '', label: t('customer_type_select') },
        { value: 'regular', label: t('customer_type_regular') },
        { value: 'wholesale', label: t('customer_type_wholesale') },
        { value: 'reseller', label: t('customer_type_reseller') },
        { value: 'corporate', label: t('customer_type_corporate') },
    ];

    const contactMethodOptions = [
        { value: '', label: t('customer_contact_method_select') },
        { value: 'call', label: t('customer_contact_call') },
        { value: 'sms', label: t('customer_contact_sms') },
        { value: 'whatsapp', label: t('customer_contact_whatsapp') },
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
                            {t('lbl_loading')}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const customer = customerResponse?.data;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.push('/customers/list')}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{t('customer_edit_title')}</h1>
                            <p className="text-sm text-gray-500">{customer?.name}</p>
                        </div>
                    </div>
                    {customer?.store_name && (
                        <div className="rounded-xl border border-[#046ca9]/15 bg-[#046ca9]/5 p-3">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#046ca9]/10">
                                    <Store className="h-4 w-4 text-[#034d79]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#034d79]">{t('lbl_store')}: {customer.store_name}</p>
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
                                            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500 ${
                                                errors.name ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="customer_type" className="mb-2 block text-sm font-medium text-gray-700">{t('customer_type')}</label>
                                        <select id="customer_type" name="customer_type" value={formData.customer_type} onChange={handleChange} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500">
                                            {customerTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
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
                                            placeholder="customer@example.com"
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
                                            placeholder="+1234567890"
                                            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500 ${
                                                errors.phone ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="alternative_phone" className="mb-2 block text-sm font-medium text-gray-700">{t('customer_alternative_phone')}</label>
                                        <input id="alternative_phone" name="alternative_phone" type="tel" value={formData.alternative_phone} onChange={handleChange} placeholder={t('customer_alternative_phone_placeholder')} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500" />
                                    </div>

                                    <div>
                                        <label htmlFor="preferred_contact_method" className="mb-2 block text-sm font-medium text-gray-700">{t('customer_preferred_contact_method')}</label>
                                        <select id="preferred_contact_method" name="preferred_contact_method" value={formData.preferred_contact_method} onChange={handleChange} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500">
                                            {contactMethodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="date_of_birth" className="mb-2 block text-sm font-medium text-gray-700">{t('customer_date_of_birth')}</label>
                                        <input id="date_of_birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500" />
                                    </div>

                                    <div>
                                        <label htmlFor="gender" className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_gender')}</label>
                                        <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500">
                                            <option value="">{t('customer_gender_select')}</option>
                                            <option value="male">{t('lbl_male')}</option>
                                            <option value="female">{t('lbl_female')}</option>
                                            <option value="other">{t('lbl_other')}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('customer_address_information')}</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="address_line1" className="mb-2 block text-sm font-medium text-gray-700">{t('customer_address_line1')}</label>
                                        <input id="address_line1" name="address_line1" type="text" value={formData.address_line1} onChange={handleChange} placeholder={t('customer_address_line1_placeholder')} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500" />
                                    </div>
                                    <div>
                                        <label htmlFor="address_line2" className="mb-2 block text-sm font-medium text-gray-700">{t('customer_address_line2')}</label>
                                        <input id="address_line2" name="address_line2" type="text" value={formData.address_line2} onChange={handleChange} placeholder={t('customer_address_line2_placeholder')} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500" />
                                    </div>
                                    <div>
                                        <label htmlFor="city" className="mb-2 block text-sm font-medium text-gray-700">{t('customer_city_area')}</label>
                                        <input id="city" name="city" type="text" value={formData.city} onChange={handleChange} placeholder={t('customer_city_area_placeholder')} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500" />
                                    </div>
                                    <div>
                                        <label htmlFor="state" className="mb-2 block text-sm font-medium text-gray-700">{t('customer_district')}</label>
                                        <input id="state" name="state" type="text" value={formData.state} onChange={handleChange} placeholder={t('customer_district_placeholder')} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label htmlFor="delivery_note" className="mb-2 block text-sm font-medium text-gray-700">{t('customer_delivery_note')}</label>
                                        <textarea id="delivery_note" name="delivery_note" value={formData.delivery_note} onChange={handleChange} placeholder={t('customer_delivery_note_placeholder')} rows={2} maxLength={1000} className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500" />
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
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
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
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    {/* Balance */}
                                    <div>
                                        <label htmlFor="balance" className="mb-2 block text-sm font-medium text-gray-700">
                                            {t('customer_opening_balance')} ({symbol})
                                        </label>
                                        <input
                                            id="balance"
                                            name="balance"
                                            type="number"
                                            step="0.01"
                                            value={formData.balance}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">{t('msg_negative_for_due')}</p>
                                    </div>

                                    <div>
                                        <label htmlFor="credit_limit" className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_credit_limit')} ({symbol})</label>
                                        <input id="credit_limit" name="credit_limit" type="number" min="0" step="0.01" value={formData.credit_limit} onChange={handleChange} placeholder="0.00" className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('lbl_additional_information')}</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="trade_name" className="mb-2 block text-sm font-medium text-gray-700">{t('customer_trade_name')}</label>
                                        <input id="trade_name" name="trade_name" type="text" value={formData.trade_name} onChange={handleChange} placeholder={t('customer_trade_name_placeholder')} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500" />
                                    </div>
                                    <div>
                                        <label htmlFor="nid_no" className="mb-2 block text-sm font-medium text-gray-700">{t('customer_nid_no')}</label>
                                        <input id="nid_no" name="nid_no" type="text" value={formData.nid_no} onChange={handleChange} placeholder={t('customer_nid_no_placeholder')} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500" />
                                    </div>
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
                                            className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
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
                                                className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-2 focus:ring-orange-500"
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
                                            value={customer?.store_name || 'N/A'}
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
                                        onClick={() => router.push('/customers/list')}
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
                                                {t('customer_update_btn')}
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
                            <p className="mb-1 font-medium">{t('lbl_update_guidelines')}</p>
                            <ul className="space-y-1 text-orange-700">
                                <li>• {t('customer_update_tip_1')}</li>
                                <li>• {t('customer_update_tip_2')}</li>
                                <li>• {t('customer_update_tip_3')}</li>
                                <li>• {t('customer_update_tip_4')}</li>
                                <li>• {t('customer_update_tip_5')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCustomerPage;
