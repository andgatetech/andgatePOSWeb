'use client';

import { Clock, Sunrise, Sunset } from 'lucide-react';
import React from 'react';
import { getTranslation } from '@/i18n';

interface OperatingHoursTabProps {
    formData: {
        opening_time: string;
        closing_time: string;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OperatingHoursTab: React.FC<OperatingHoursTabProps> = ({ formData, handleInputChange }) => {
    const { t } = getTranslation();
    const calculateTotalHours = () => {
        if (formData.opening_time && formData.closing_time) {
            const openTime = new Date(`1970-01-01T${formData.opening_time}`);
            const closeTime = new Date(`1970-01-01T${formData.closing_time}`);
            const diff = closeTime.getTime() - openTime.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m`;
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('store_business_hours_title')}</h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Opening Time */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Sunrise className="mr-2 h-4 w-4 text-[#e79237]" />
                            {t('lbl_opening_time')}
                        </label>
                        <input
                            type="time"
                            name="opening_time"
                            value={formData.opening_time}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-[#e79237] focus:ring-2 focus:ring-[#e79237]/20"
                        />
                    </div>

                    {/* Closing Time */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Sunset className="mr-2 h-4 w-4 text-[#034d79]" />
                            {t('lbl_closing_time')}
                        </label>
                        <input
                            type="time"
                            name="closing_time"
                            value={formData.closing_time}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-[#034d79] focus:ring-2 focus:ring-[#034d79]/20"
                        />
                    </div>
                </div>

                {/* Total Hours Display */}
                {calculateTotalHours() && (
                    <div className="mt-6 rounded-xl bg-gradient-to-r from-[#046ca9]/10 to-[#e79237]/15 p-4">
                        <div className="flex items-center justify-center space-x-3">
                            <Clock className="h-5 w-5 text-[#046ca9]" />
                            <span className="text-sm font-medium text-gray-700">{t('lbl_total_operating_hours')}</span>
                            <span className="text-lg font-bold text-[#034d79]">{calculateTotalHours()}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperatingHoursTab;
