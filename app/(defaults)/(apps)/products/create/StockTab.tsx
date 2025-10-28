'use client';

import React from 'react';

interface StockTabProps {
    formData: {
        units: string;
        quantity: string;
        low_stock_quantity: string;
        available: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    units: any[];
    onPrevious: () => void;
    onNext: () => void;
    onCreateProduct: () => void;
    isCreating: boolean;
}

const StockTab: React.FC<StockTabProps> = ({ formData, handleChange, units, onPrevious, onNext, onCreateProduct, isCreating }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Stock Management</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Unit */}
                <div>
                    <label htmlFor="units" className="mb-2 block text-sm font-medium text-gray-700">
                        Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="units"
                        name="units"
                        value={formData.units}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Unit</option>
                        {units.map((unit: any) => (
                            <option key={unit.id} value={unit.name}>
                                {unit.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Quantity */}
                <div>
                    <label htmlFor="quantity" className="mb-2 block text-sm font-medium text-gray-700">
                        Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Low Stock Quantity */}
                <div>
                    <label htmlFor="low_stock_quantity" className="mb-2 block text-sm font-medium text-gray-700">
                        Low Stock Alert
                    </label>
                    <input
                        id="low_stock_quantity"
                        name="low_stock_quantity"
                        type="number"
                        min="0"
                        value={formData.low_stock_quantity}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Alert when stock reaches this level</p>
                </div>

                {/* Available Status */}
                <div>
                    <label htmlFor="available" className="mb-2 block text-sm font-medium text-gray-700">
                        Availability
                    </label>
                    <select
                        id="available"
                        name="available"
                        value={formData.available}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="yes">Available</option>
                        <option value="no">Out of Stock</option>
                    </select>
                </div>
            </div>

            {/* Stock Status Display */}
            {formData.quantity && parseFloat(formData.quantity) > 0 && (
                <div
                    className={`rounded-lg border p-4 ${
                        parseFloat(formData.quantity) <= parseFloat(formData.low_stock_quantity || '0')
                            ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50'
                            : 'border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${parseFloat(formData.quantity) <= parseFloat(formData.low_stock_quantity || '0') ? 'text-orange-900' : 'text-blue-900'}`}>
                                Stock Status
                            </p>
                            <p className={`text-2xl font-bold ${parseFloat(formData.quantity) <= parseFloat(formData.low_stock_quantity || '0') ? 'text-orange-600' : 'text-blue-600'}`}>
                                {parseFloat(formData.quantity) <= parseFloat(formData.low_stock_quantity || '0') ? 'Low Stock' : 'In Stock'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className={`text-sm font-medium ${parseFloat(formData.quantity) <= parseFloat(formData.low_stock_quantity || '0') ? 'text-orange-900' : 'text-blue-900'}`}>
                                Available Quantity
                            </p>
                            <p className={`text-2xl font-bold ${parseFloat(formData.quantity) <= parseFloat(formData.low_stock_quantity || '0') ? 'text-orange-600' : 'text-blue-600'}`}>
                                {formData.quantity} {formData.units}
                            </p>
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

export default StockTab;
