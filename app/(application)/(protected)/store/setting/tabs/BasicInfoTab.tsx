'use client';

import { Building2, Facebook, FileText, Hash, Mail, MapPin, Phone, Receipt, Tag, User } from 'lucide-react';
import React from 'react';
import { getTranslation } from '@/i18n';

interface BasicInfoTabProps {
    formData: {
        store_name: string;
        store_location: string;
        store_contact: string;
        store_email: string;
        store_address: string;
        district: string;
        postal_code: string;
        facebook_page: string;
        whatsapp_no: string;
        manager_name: string;
        manager_phone: string;
        receipt_header: string;
        max_discount: string;
        tax_type: string;
        tax_label: string;
        tax_registration_number: string;
        invoice_prefix: string;
        invoice_footer: string;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm transition-all focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/20';

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ formData, handleInputChange }) => {
    const { t } = getTranslation();
    return (
        <div className="space-y-6">

            {/* ── Store Information ── */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('store_information_title')}</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Building2 className="mr-2 h-4 w-4 text-[#046ca9]" />
                            {t('lbl_store_name')} *
                        </label>
                        <input
                            type="text"
                            name="store_name"
                            value={formData.store_name}
                            onChange={handleInputChange}
                            className={inputCls}
                            placeholder={t('placeholder_store_name')}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Tag className="mr-2 h-4 w-4 text-[#c47920]" />
                            {t('lbl_max_discount')}
                        </label>
                        <input
                            type="number"
                            name="max_discount"
                            value={formData.max_discount}
                            onChange={handleInputChange}
                            className={inputCls}
                            placeholder="0-100"
                            min="0"
                            max="100"
                        />
                    </div>
                </div>
            </div>

            {/* ── Contact Details ── */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('store_contact_section')}</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Phone className="mr-2 h-4 w-4 text-[#034d79]" />
                            {t('lbl_contact_number')}
                        </label>
                        <input
                            type="tel"
                            name="store_contact"
                            value={formData.store_contact}
                            onChange={handleInputChange}
                            className={inputCls}
                            placeholder={t('placeholder_phone')}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Mail className="mr-2 h-4 w-4 text-[#046ca9]" />
                            {t('lbl_store_email')}
                        </label>
                        <input
                            type="email"
                            name="store_email"
                            value={formData.store_email}
                            onChange={handleInputChange}
                            className={inputCls}
                            placeholder={t('ph_store_email')}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <MapPin className="mr-2 h-4 w-4 text-[#e79237]" />
                            {t('lbl_store_address')}
                        </label>
                        <textarea
                            name="store_address"
                            value={formData.store_address}
                            onChange={handleInputChange}
                            rows={2}
                            className={inputCls}
                            placeholder={t('ph_store_address')}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <MapPin className="mr-2 h-4 w-4 text-[#e79237]" />
                            {t('lbl_store_location')}
                        </label>
                        <input
                            type="text"
                            name="store_location"
                            value={formData.store_location}
                            onChange={handleInputChange}
                            className={inputCls}
                            placeholder={t('placeholder_store_location')}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_district')}</label>
                        <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            className={inputCls}
                            placeholder={t('ph_district')}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_postal_code')}</label>
                        <input
                            type="text"
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={handleInputChange}
                            className={inputCls}
                            placeholder={t('ph_postal_code')}
                        />
                    </div>
                </div>
            </div>

            {/* ── Online Presence ── */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('store_online_section')}</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Facebook className="mr-2 h-4 w-4 text-blue-600" />
                            {t('lbl_facebook_page')}
                        </label>
                        <input
                            type="url"
                            name="facebook_page"
                            value={formData.facebook_page}
                            onChange={handleInputChange}
                            className={inputCls}
                            placeholder={t('ph_facebook_page')}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Phone className="mr-2 h-4 w-4 text-green-600" />
                            {t('lbl_whatsapp_no')}
                        </label>
                        <input
                            type="text"
                            name="whatsapp_no"
                            value={formData.whatsapp_no}
                            onChange={handleInputChange}
                            className={inputCls}
                            placeholder={t('ph_whatsapp_no')}
                        />
                    </div>
                </div>
            </div>

            {/* ── Manager & Receipt ── */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('store_manager_section')}</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <User className="mr-2 h-4 w-4 text-[#046ca9]" />
                            {t('lbl_manager_name')}
                        </label>
                        <input
                            type="text"
                            name="manager_name"
                            value={formData.manager_name}
                            onChange={handleInputChange}
                            className={inputCls}
                            placeholder={t('ph_manager_name')}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Phone className="mr-2 h-4 w-4 text-[#034d79]" />
                            {t('lbl_manager_phone')}
                        </label>
                        <input
                            type="tel"
                            name="manager_phone"
                            value={formData.manager_phone}
                            onChange={handleInputChange}
                            className={inputCls}
                            placeholder={t('ph_manager_phone')}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <FileText className="mr-2 h-4 w-4 text-[#046ca9]" />
                            {t('lbl_receipt_header')}
                        </label>
                        <textarea
                            name="receipt_header"
                            value={formData.receipt_header}
                            onChange={handleInputChange}
                            rows={3}
                            className={inputCls}
                            placeholder={t('ph_receipt_header')}
                        />
                        <p className="text-xs text-gray-400">{t('hint_receipt_header')}</p>
                    </div>
                </div>
            </div>

            {/* ── Tax & Invoice ── */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('lbl_tax_invoice_section')}</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                    {/* Tax Type */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Receipt className="mr-2 h-4 w-4 text-[#046ca9]" />
                            {t('lbl_tax_type')}
                        </label>
                        <select
                            name="tax_type"
                            value={formData.tax_type}
                            onChange={handleInputChange}
                            className={inputCls}
                        >
                            <option value="none">{t('tax_type_none')}</option>
                            <option value="tax">{t('tax_type_tax')}</option>
                            <option value="vat">{t('tax_type_vat')}</option>
                            <option value="gst">{t('tax_type_gst')}</option>
                            <option value="sales_tax">{t('tax_type_sales_tax')}</option>
                        </select>
                    </div>

                    {/* Tax Label */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Tag className="mr-2 h-4 w-4 text-[#c47920]" />
                            {t('lbl_tax_label')}
                        </label>
                        <input
                            type="text"
                            name="tax_label"
                            value={formData.tax_label}
                            onChange={handleInputChange}
                            className={inputCls}
                            placeholder={t('ph_tax_label')}
                        />
                    </div>

                    {/* BIN / Tax Registration Number — only when tax is enabled */}
                    {formData.tax_type && formData.tax_type !== 'none' && (
                        <div className="space-y-2 md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Hash className="h-4 w-4 text-[#046ca9]" />
                                {t('lbl_tax_registration_number')}
                                {formData.tax_type === 'vat' && (
                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">BIN</span>
                                )}
                            </label>
                            <input
                                type="text"
                                name="tax_registration_number"
                                value={formData.tax_registration_number}
                                onChange={handleInputChange}
                                className={inputCls}
                                placeholder={t('ph_tax_registration_number')}
                            />
                            <p className="text-xs text-gray-400">{t('hint_tax_registration_number')}</p>
                        </div>
                    )}

                    {/* Invoice Prefix */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <FileText className="mr-2 h-4 w-4 text-gray-500" />
                            {t('lbl_invoice_prefix')}
                        </label>
                        <input
                            type="text"
                            name="invoice_prefix"
                            value={formData.invoice_prefix}
                            onChange={handleInputChange}
                            className={inputCls}
                            placeholder={t('ph_invoice_prefix')}
                        />
                    </div>

                    {/* Invoice Footer */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <FileText className="mr-2 h-4 w-4 text-gray-400" />
                            {t('lbl_invoice_footer')}
                        </label>
                        <textarea
                            name="invoice_footer"
                            value={formData.invoice_footer}
                            onChange={handleInputChange}
                            rows={2}
                            className={inputCls}
                            placeholder={t('ph_invoice_footer')}
                        />
                        <p className="text-xs text-gray-400">{t('hint_invoice_footer')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicInfoTab;
