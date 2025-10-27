'use client';

import React from 'react';

interface TaxTabProps {
    formData: {
        tax_rate: string;
        tax_included: boolean;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    onPrevious: () => void;
    onNext: () => void;
    onCreateProduct: () => void;
    isCreating: boolean;
}

const TaxTab: React.FC<TaxTabProps> = ({ formData, handleChange, setFormData, onPrevious, onNext, onCreateProduct, isCreating }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Tax Information</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Tax Rate */}
                <div>
                    <label htmlFor="tax_rate" className="mb-2 block text-sm font-medium text-gray-700">
                        Tax Rate (%)
                    </label>
                    <div className="relative">
                        <input
                            id="tax_rate"
                            name="tax_rate"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.tax_rate}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 pr-8 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-medium text-gray-500">%</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Enter tax percentage (0-100)</p>
                </div>

                {/* Tax Included */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Tax Inclusion</label>
                    <div className="flex items-center space-x-6 pt-3">
                        <label className="flex cursor-pointer items-center">
                            <input
                                type="radio"
                                name="tax_included"
                                value="false"
                                checked={!formData.tax_included}
                                onChange={() => setFormData((prev: any) => ({ ...prev, tax_included: false }))}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Tax Exclusive</span>
                        </label>
                        <label className="flex cursor-pointer items-center">
                            <input
                                type="radio"
                                name="tax_included"
                                value="true"
                                checked={formData.tax_included}
                                onChange={() => setFormData((prev: any) => ({ ...prev, tax_included: true }))}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Tax Inclusive</span>
                        </label>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">{formData.tax_included ? 'Price includes tax amount' : 'Tax will be added to the price'}</p>
                </div>
            </div>

            {/* Tax Information Card */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                        <p className="mb-1 font-medium">Tax Configuration Tips:</p>
                        <ul className="space-y-1 text-blue-700">
                            <li>• Tax Exclusive: Tax will be added on top of the selling price</li>
                            <li>• Tax Inclusive: Selling price already includes the tax amount</li>
                            <li>• Standard tax rates vary by region (e.g., VAT, GST, Sales Tax)</li>
                            <li>• Consult your local tax regulations for correct rates</li>
                        </ul>
                    </div>
                </div>
            </div>

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
                    <span>Previous</span>
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    className="flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-700 sm:px-6 sm:py-3"
                >
                    <span>Next</span>
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={onCreateProduct}
                    disabled={isCreating}
                    className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:from-green-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-3"
                >
                    {isCreating ? (
                        <>
                            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            <span>Creating...</span>
                        </>
                    ) : (
                        <>
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Create Product</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default TaxTab;
