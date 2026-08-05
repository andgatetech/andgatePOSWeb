'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { AlertCircle } from 'lucide-react';
import React from 'react';

interface PricingTabProps {
    formData: {
        purchase_price: string;
        price: string;
        wholesale_price: string;
        units: string;
    };
    errors?: Record<string, string>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    units: any[];
    onPrevious: () => void;
    onNext: () => void;
    onCreateProduct: () => void;
    isCreating: boolean;
    isEditMode?: boolean;
}

const PricingTab: React.FC<PricingTabProps> = ({ formData, errors = {}, handleChange, units, onPrevious, onNext, onCreateProduct, isCreating, isEditMode = false }) => {
    const { t } = getTranslation();
    const { symbol, formatCurrency } = useCurrency();
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('lbl_price')}</h3>
            <p className="text-sm text-gray-600">{t('msg_pricing_tab_help')}</p>

            <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
                <p className="font-semibold">{t('lbl_price_base_unit_title')}</p>
                <p className="mt-1 leading-5">{t('hint_price_base_unit')}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div>
                    <label htmlFor="units" className="mb-2 block text-sm font-medium text-gray-700">
                        {t('lbl_price_unit')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="units"
                        name="units"
                        value={formData.units}
                        onChange={handleChange}
                        className={`w-full rounded-lg border px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 ${
                            errors.units
                                ? 'border-red-500 bg-red-50/30 text-gray-900 focus:border-red-500 focus:ring-red-200'
                                : 'border-gray-300 bg-gray-50 focus:border-transparent focus:bg-white focus:ring-gray-500'
                        }`}
                    >
                        <option value="">{t('lbl_unit')}</option>
                        <option value="Piece">{t('lbl_piece_default')}</option>
                        {units.map((unit: any) => (
                            <option key={unit.id} value={unit.name}>
                                {unit.name}
                            </option>
                        ))}
                    </select>
                    {errors.units ? (
                        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{errors.units}</span>
                        </p>
                    ) : (
                        <p className="mt-1 text-xs text-gray-500">{t('hint_price_unit')}</p>
                    )}
                </div>

                {/* Purchase Price */}
                <div>
                    <label htmlFor="purchase_price" className="mb-2 block text-sm font-medium text-gray-700">
                        {t('lbl_purchase_price')}
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-gray-500">{symbol}</span>
                        <input
                            id="purchase_price"
                            name="purchase_price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.purchase_price}
                            onChange={handleChange}
                            onKeyPress={(e) => {
                                if (!/[0-9.]/.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            placeholder="0.00"
                            className={`w-full rounded-lg border py-3 pl-8 pr-4 transition-all duration-200 focus:outline-none focus:ring-2 ${
                                errors.purchase_price
                                    ? 'border-red-500 bg-red-50/30 text-gray-900 focus:border-red-500 focus:ring-red-200'
                                    : 'border-gray-300 bg-gray-50 focus:border-transparent focus:bg-white focus:ring-gray-500'
                            }`}
                        />
                    </div>
                    {errors.purchase_price ? (
                        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{errors.purchase_price}</span>
                        </p>
                    ) : (
                        <p className="mt-1 text-xs text-gray-500">{t('lbl_purchase_price_hint')} {formData.units ? t('hint_per_selected_unit', { unit: formData.units }) : ''}</p>
                    )}
                </div>

                {/* Selling Price */}
                <div>
                    <label htmlFor="price" className="mb-2 block text-sm font-medium text-gray-700">
                        {t('lbl_selling_price')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-gray-500">{symbol}</span>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={handleChange}
                            onKeyPress={(e) => {
                                if (!/[0-9.]/.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            placeholder="0.00"
                            className={`w-full rounded-lg border py-3 pl-8 pr-4 transition-all duration-200 focus:outline-none focus:ring-2 ${
                                errors.price
                                    ? 'border-red-500 bg-red-50/30 text-gray-900 focus:border-red-500 focus:ring-red-200'
                                    : 'border-gray-300 bg-gray-50 focus:border-transparent focus:bg-white focus:ring-gray-500'
                            }`}
                        />
                    </div>
                    {errors.price ? (
                        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{errors.price}</span>
                        </p>
                    ) : (
                        <p className="mt-1 text-xs text-gray-500">{t('lbl_selling_price_hint')} {formData.units ? t('hint_per_selected_unit', { unit: formData.units }) : ''}</p>
                    )}
                </div>

                {/* Wholesale Price */}
                <div>
                    <label htmlFor="wholesale_price" className="mb-2 block text-sm font-medium text-gray-700">
                        {t('lbl_wholesale_price')}
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-gray-500">{symbol}</span>
                        <input
                            id="wholesale_price"
                            name="wholesale_price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.wholesale_price}
                            onChange={handleChange}
                            onKeyPress={(e) => {
                                if (!/[0-9.]/.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            placeholder="0.00"
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-8 pr-4 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-gray-500"
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{t('lbl_wholesale_price_hint')} {formData.units ? t('hint_per_selected_unit', { unit: formData.units }) : ''}</p>
                </div>
            </div>

            {/* Profit Margin Display */}
            {formData.price && parseFloat(formData.price) > 0 && formData.purchase_price !== '' && !isNaN(parseFloat(formData.purchase_price)) && parseFloat(formData.purchase_price) >= 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-100 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-700">{t('lbl_profit')}</p>
                            <p className="text-2xl font-bold text-gray-600">{(((parseFloat(formData.price) - parseFloat(formData.purchase_price)) / parseFloat(formData.price)) * 100).toFixed(2)}%</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-700">{t('lbl_profit')}</p>
                            <p className="text-2xl font-bold text-gray-600">{formatCurrency(parseFloat(formData.price) - parseFloat(formData.purchase_price))}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-6">
                <button
                    type="button"
                    onClick={onPrevious}
                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 sm:px-6 sm:py-3"
                >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>{t('btn_back')}</span>
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    className="flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-700 sm:px-6 sm:py-3"
                >
                    <span>{t('btn_save')}</span>
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default PricingTab;
