'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { Gift, Star } from 'lucide-react';
import React from 'react';

interface LoyaltyProgramTabProps {
    formData: {
        loyalty_points_enabled: boolean;
        loyalty_points_rate: string;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const LoyaltyProgramTab: React.FC<LoyaltyProgramTabProps> = ({ formData, handleInputChange }) => {
    const { t } = getTranslation();
    const { symbol } = useCurrency();
    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('store_loyalty_title')}</h3>

                <div className="space-y-6">
                    {/* Enable/Disable Toggle */}
                    <div className="rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                                    <Gift className="h-6 w-6" />
                                </div>
                                <div>
                                    <label htmlFor="loyalty_points_enabled" className="text-base font-semibold text-gray-900">
                                        {t('lbl_enable_loyalty_points')}
                                    </label>
                                    <p className="mt-1 text-sm text-gray-600">{t('msg_loyalty_points_desc')}</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                id="loyalty_points_enabled"
                                name="loyalty_points_enabled"
                                checked={formData.loyalty_points_enabled}
                                onChange={handleInputChange}
                                className="h-6 w-6 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                            />
                        </div>
                    </div>

                    {/* Points Rate */}
                    {formData.loyalty_points_enabled && (
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                <Star className="mr-2 h-4 w-4 text-yellow-600" />
                                {t('lbl_points_per')} {symbol}1
                            </label>
                            <input
                                type="number"
                                name="loyalty_points_rate"
                                value={formData.loyalty_points_rate}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 md:w-1/2"
                                placeholder={t('placeholder_loyalty_rate')}
                                min="0"
                                step="0.01"
                            />
                            <p className="text-xs text-gray-500">{t('lbl_loyalty_points_rate')} {symbol}1 {t('lbl_spent')}</p>
                        </div>
                    )}

                    {/* Info Box */}
                    {formData.loyalty_points_enabled && formData.loyalty_points_rate && (
                        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                            <p className="text-sm text-yellow-800">
                                <strong>{t('lbl_current_rate')}:</strong> {t('lbl_for_every')} <strong>{formData.loyalty_points_rate}</strong> {t('lbl_points')} {symbol}1 {t('lbl_spent')}.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoyaltyProgramTab;
