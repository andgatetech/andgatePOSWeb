'use client';

import { Building2, MapPin, Phone, Tag } from 'lucide-react';
import React from 'react';
import { getTranslation } from '@/i18n';

interface BasicInfoTabProps {
    formData: {
        store_name: string;
        store_location: string;
        store_contact: string;
        max_discount: string;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ formData, handleInputChange }) => {
    const { t } = getTranslation();
    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('store_information_title')}</h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Store Name */}
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
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/20"
                            placeholder={t('placeholder_store_name')}
                            required
                        />
                    </div>

                    {/* Store Location */}
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
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-[#e79237] focus:ring-2 focus:ring-[#e79237]/20"
                            placeholder={t('placeholder_store_location')}
                        />
                    </div>

                    {/* Store Contact */}
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
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-[#034d79] focus:ring-2 focus:ring-[#034d79]/20"
                            placeholder={t('placeholder_phone')}
                        />
                    </div>

                    {/* Max Discount */}
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
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-[#e79237] focus:ring-2 focus:ring-[#e79237]/20"
                            placeholder="0-100"
                            min="0"
                            max="100"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicInfoTab;
