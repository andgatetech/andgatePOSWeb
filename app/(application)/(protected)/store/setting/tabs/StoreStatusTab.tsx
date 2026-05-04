'use client';

import { Power } from 'lucide-react';
import React from 'react';
import { getTranslation } from '@/i18n';

interface StoreStatusTabProps {
    formData: {
        is_active: boolean;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StoreStatusTab: React.FC<StoreStatusTabProps> = ({ formData, handleInputChange }) => {
    const { t } = getTranslation();
    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('store_status_title')}</h3>

                <div className="rounded-xl bg-gray-50 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${formData.is_active ? 'bg-[#046ca9]/10 text-[#046ca9]' : 'bg-red-100 text-red-600'}`}>
                                <Power className="h-8 w-8" />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900">{formData.is_active ? t('lbl_store_is_active') : t('lbl_store_is_inactive')}</h4>
                                <p className="mt-1 text-sm text-gray-600">
                                    {formData.is_active ? t('msg_store_is_active_desc') : t('msg_store_is_inactive_desc')}
                                </p>
                            </div>
                        </div>

                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleInputChange}
                            className="h-8 w-8 rounded border-gray-300 text-[#046ca9] focus:ring-[#046ca9]"
                        />
                    </div>
                </div>

                {/* Warning Box */}
                <div className={`mt-6 rounded-xl border p-4 ${formData.is_active ? 'border-[#046ca9]/20 bg-[#046ca9]/5' : 'border-red-200 bg-red-50'}`}>
                    <p className={`text-sm ${formData.is_active ? 'text-[#034d79]' : 'text-red-800'}`}>
                        <strong>{t('lbl_note')}:</strong>{' '}
                        {formData.is_active ? t('msg_store_active_note') : t('msg_store_inactive_note')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StoreStatusTab;
