'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { Gift, Star } from 'lucide-react';
import React from 'react';

interface LoyaltyProgramTabProps {
    formData: {
        loyalty_points_enabled: boolean;
        loyalty_points_rate: string;
        loyalty_earning_points: string;
        loyalty_earning_spend: string;
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
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('store_loyalty_title')}</h3>

                <div className="space-y-6">
                    {/* Enable/Disable Toggle */}
                    <div className="rounded-lg bg-gradient-to-r from-[#046ca9]/10 to-[#e79237]/15 p-6">
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

                    {/* Earning & Redemption — shown together so the two rates aren't mistaken for duplicates */}
                    {formData.loyalty_points_enabled && (
                        <div className="space-y-4 border-t border-gray-100 pt-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Earning Rate */}
                                <div className="rounded-lg border border-[#046ca9]/20 bg-[#046ca9]/5 p-5">
                                    <label className="mb-1 flex items-center text-sm font-semibold text-gray-900">
                                        <Star className="mr-2 h-4 w-4 text-[#046ca9]" />
                                        {t('lbl_earning_rate_title')}
                                    </label>
                                    <p className="mb-3 text-xs text-gray-500">{t('msg_earning_rate_desc', { symbol })}</p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            name="loyalty_earning_points"
                                            value={formData.loyalty_earning_points}
                                            onChange={handleInputChange}
                                            className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center transition-all focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/20"
                                            min="1"
                                            step="1"
                                        />
                                        <span className="whitespace-nowrap text-sm font-medium text-gray-600">{t('lbl_points')} /</span>
                                        <input
                                            type="number"
                                            name="loyalty_earning_spend"
                                            value={formData.loyalty_earning_spend}
                                            onChange={handleInputChange}
                                            className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center transition-all focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/20"
                                            min="0.01"
                                            step="0.01"
                                        />
                                        <span className="whitespace-nowrap text-sm font-medium text-gray-600">{symbol} {t('lbl_spent')}</span>
                                    </div>
                                    {formData.loyalty_earning_points && formData.loyalty_earning_spend && (
                                        <p className="mt-3 text-xs text-[#035b8c]">
                                            <strong>{formData.loyalty_earning_points}</strong> {t('lbl_points')} /{' '}
                                            <strong>
                                                {symbol}
                                                {formData.loyalty_earning_spend}
                                            </strong>{' '}
                                            {t('lbl_spent')}.
                                        </p>
                                    )}
                                </div>

                                {/* Redemption Ratio */}
                                <div className="rounded-lg border border-[#e79237]/25 bg-[#e79237]/10 p-5">
                                    <label className="mb-1 flex items-center text-sm font-semibold text-gray-900">
                                        <Gift className="mr-2 h-4 w-4 text-[#c47920]" />
                                        {t('lbl_loyalty_redemption_ratio')}
                                    </label>
                                    <p className="mb-3 text-xs text-gray-500">{t('msg_loyalty_redemption_desc')}</p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            name="loyalty_redemption_points"
                                            value={formData.loyalty_redemption_points}
                                            onChange={handleInputChange}
                                            className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center transition-all focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/20"
                                            min="1"
                                            step="1"
                                        />
                                        <span className="whitespace-nowrap text-sm font-medium text-gray-600">{t('lbl_points')} =</span>
                                        <input
                                            type="number"
                                            name="loyalty_redemption_value"
                                            value={formData.loyalty_redemption_value}
                                            onChange={handleInputChange}
                                            className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center transition-all focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/20"
                                            min="0.01"
                                            step="0.01"
                                        />
                                        <span className="whitespace-nowrap text-sm font-medium text-gray-600">{symbol}</span>
                                    </div>
                                    {formData.loyalty_redemption_points && formData.loyalty_redemption_value && (
                                        <p className="mt-3 text-xs text-[#9a5a14]">
                                            <strong>{formData.loyalty_redemption_points}</strong> {t('lbl_points')} ={' '}
                                            <strong>
                                                {symbol}
                                                {formData.loyalty_redemption_value}
                                            </strong>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Combined plain-language summary */}
                            {formData.loyalty_earning_points && formData.loyalty_earning_spend && formData.loyalty_redemption_points && formData.loyalty_redemption_value && (
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-xs text-gray-600">
                                        <strong>{t('lbl_how_it_works')}:</strong>{' '}
                                        {t('msg_loyalty_combined_summary', {
                                            earnPoints: formData.loyalty_earning_points,
                                            earnSpend: formData.loyalty_earning_spend,
                                            redeemPoints: formData.loyalty_redemption_points,
                                            redeemValue: formData.loyalty_redemption_value,
                                            symbol,
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoyaltyProgramTab;
