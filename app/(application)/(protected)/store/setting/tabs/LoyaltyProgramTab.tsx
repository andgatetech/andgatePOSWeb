'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { Gift, Star } from 'lucide-react';
import React from 'react';

interface LoyaltyProgramTabProps {
    formData: {
        loyalty_points_enabled: boolean;
        loyalty_points_rate: string;
        loyalty_redemption_points: string;
        loyalty_redemption_value: string;
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
                    <div className="rounded-xl bg-gradient-to-r from-[#046ca9]/10 to-[#e79237]/15 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e79237]/20 text-[#c47920]">
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
                                className="h-6 w-6 rounded border-gray-300 text-[#046ca9] focus:ring-[#046ca9]"
                            />
                        </div>
                    </div>

                    {/* Points Rate */}
                    {formData.loyalty_points_enabled && (
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                <Star className="mr-2 h-4 w-4 text-[#e79237]" />
                                {t('lbl_points_per')} {symbol}1
                            </label>
                            <input
                                type="number"
                                name="loyalty_points_rate"
                                value={formData.loyalty_points_rate}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/20 md:w-1/2"
                                placeholder={t('placeholder_loyalty_rate')}
                                min="0"
                                step="0.01"
                            />
                            <p className="text-xs text-gray-500">{t('lbl_loyalty_points_rate')} {symbol}1 {t('lbl_spent')}</p>
                        </div>
                    )}

                    {/* Info Box */}
                    {formData.loyalty_points_enabled && formData.loyalty_points_rate && (
                        <div className="rounded-xl border border-[#e79237]/25 bg-[#e79237]/10 p-4">
                            <p className="text-sm text-[#9a5a14]">
                                <strong>{t('lbl_current_rate')}:</strong> {t('lbl_for_every')} <strong>{formData.loyalty_points_rate}</strong> {t('lbl_points')} {symbol}1 {t('lbl_spent')}.
                            </p>
                        </div>
                    )}

                    {/* Redemption Ratio */}
                    {formData.loyalty_points_enabled && (
                        <div className="space-y-2 border-t border-gray-100 pt-6">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                <Star className="mr-2 h-4 w-4 text-[#e79237]" />
                                {t('lbl_loyalty_redemption_ratio')}
                            </label>
                            <p className="text-xs text-gray-500">{t('msg_loyalty_redemption_desc')}</p>
                            <div className="flex w-full items-center gap-3 md:w-1/2">
                                <input
                                    type="number"
                                    name="loyalty_redemption_points"
                                    value={formData.loyalty_redemption_points}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/20"
                                    min="1"
                                    step="1"
                                />
                                <span className="whitespace-nowrap text-sm font-medium text-gray-600">{t('lbl_points')} =</span>
                                <input
                                    type="number"
                                    name="loyalty_redemption_value"
                                    value={formData.loyalty_redemption_value}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/20"
                                    min="0.01"
                                    step="0.01"
                                />
                                <span className="whitespace-nowrap text-sm font-medium text-gray-600">{symbol}</span>
                            </div>
                            {formData.loyalty_redemption_points && formData.loyalty_redemption_value && (
                                <p className="text-xs text-gray-500">
                                    {t('lbl_current_redemption_rate')}: <strong>{formData.loyalty_redemption_points}</strong> {t('lbl_points')} = <strong>{symbol}{formData.loyalty_redemption_value}</strong>
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoyaltyProgramTab;
