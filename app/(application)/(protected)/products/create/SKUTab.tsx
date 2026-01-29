'use client';

import { Barcode } from 'lucide-react';
import React from 'react';

interface SKUTabProps {
    formData: {
        sku: string;
        skuOption: 'auto' | 'manual';
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    onPrevious: () => void;
    onNext: () => void;
    onCreateProduct: () => void;
    isCreating: boolean;
    isEditMode?: boolean;
}

const SKUTab: React.FC<SKUTabProps> = ({ formData, handleChange, setFormData, onPrevious, onNext, onCreateProduct, isCreating, isEditMode = false }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Barcode className="h-6 w-6 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">SKU Management</h3>
            </div>

            <div className="space-y-6">
                {/* SKU Option Selection */}
                <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">SKU Generation Method</label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                                formData.skuOption === 'auto' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                        >
                            <input
                                type="radio"
                                name="skuOption"
                                value="auto"
                                checked={formData.skuOption === 'auto'}
                                onChange={() => setFormData((prev: any) => ({ ...prev, skuOption: 'auto', sku: '' }))}
                                className="h-5 w-5 text-gray-600 focus:ring-gray-500"
                            />
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Auto-generate</p>
                                <p className="text-xs text-gray-500">System will create a unique SKU automatically</p>
                            </div>
                        </label>

                        <label
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                                formData.skuOption === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                        >
                            <input
                                type="radio"
                                name="skuOption"
                                value="manual"
                                checked={formData.skuOption === 'manual'}
                                onChange={() => setFormData((prev: any) => ({ ...prev, skuOption: 'manual', sku: '' }))}
                                className="h-5 w-5 text-gray-600 focus:ring-gray-500"
                            />
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Manual input</p>
                                <p className="text-xs text-gray-500">Enter your own custom SKU code</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* SKU Input */}
                <div>
                    <label htmlFor="sku" className="mb-2 block text-sm font-medium text-gray-700">
                        SKU Code {formData.skuOption === 'manual' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        id="sku"
                        name="sku"
                        type="text"
                        value={formData.sku}
                        onChange={handleChange}
                        placeholder={formData.skuOption === 'manual' ? 'Enter SKU code (e.g., PRD-12345)' : 'Will be generated automatically'}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                        disabled={formData.skuOption === 'auto'}
                        maxLength={100}
                    />
                    {formData.skuOption === 'auto' && <p className="mt-1 text-xs text-gray-500">A unique SKU will be automatically generated when you create the product</p>}
                </div>
            </div>

            {/* SKU Information Card */}
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-indigo-800">
                        <p className="mb-1 font-medium">About SKU (Stock Keeping Unit):</p>
                        <ul className="space-y-1 text-indigo-700">
                            <li>• SKU is a unique identifier for tracking inventory</li>
                            <li>• Use a consistent naming convention for easy management</li>
                            <li>• Examples: PROD-001, SHIRT-BLU-M, LAPTOP-HP-15</li>
                            <li>• Auto-generated SKUs ensure uniqueness across your inventory</li>
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
                    className="flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-3"
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

export default SKUTab;


