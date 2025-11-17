'use client';

import React from 'react';

interface PricingTabProps {
    formData: {
        purchase_price: string;
        price: string;
        wholesale_price: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onPrevious: () => void;
    onNext: () => void;
    onCreateProduct: () => void;
    isCreating: boolean;
    isEditMode?: boolean;
}

const PricingTab: React.FC<PricingTabProps> = ({ formData, handleChange, onPrevious, onNext, onCreateProduct, isCreating, isEditMode = false }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Purchase Price */}
                <div>
                    <label htmlFor="purchase_price" className="mb-2 block text-sm font-medium text-gray-700">
                        Purchase Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-gray-500">৳</span>
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
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-8 pr-4 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Selling Price */}
                <div>
                    <label htmlFor="price" className="mb-2 block text-sm font-medium text-gray-700">
                        Selling Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-gray-500">৳</span>
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
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-8 pr-4 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Wholesale Price */}
                <div>
                    <label htmlFor="wholesale_price" className="mb-2 block text-sm font-medium text-gray-700">
                        Wholesale Price
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-gray-500">৳</span>
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
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-8 pr-4 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Price for bulk purchases</p>
                </div>
            </div>

            {/* Profit Margin Display */}
            {formData.price && formData.purchase_price && parseFloat(formData.price) > 0 && parseFloat(formData.purchase_price) > 0 && (
                <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-900">Profit Margin</p>
                            <p className="text-2xl font-bold text-green-600">{(((parseFloat(formData.price) - parseFloat(formData.purchase_price)) / parseFloat(formData.price)) * 100).toFixed(2)}%</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-green-900">Profit per Unit</p>
                            <p className="text-2xl font-bold text-green-600">৳{(parseFloat(formData.price) - parseFloat(formData.purchase_price)).toFixed(2)}</p>
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
                            <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                        </>
                    ) : (
                        <>
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>{isEditMode ? 'Update Product' : 'Create Product'}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PricingTab;
