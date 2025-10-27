'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetWarrantyTypesQuery } from '@/store/features/warrenty/WarrantyTypeApi';
import { Shield } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface WarrantyTabProps {
    formData: {
        product_name: string;
        quantity: string;
    };
    productWarranties: Array<{ warranty_type_id: number; duration_months?: number; duration_days?: number }>;
    setProductWarranties: React.Dispatch<React.SetStateAction<Array<{ warranty_type_id: number; duration_months?: number; duration_days?: number }>>>;
    onPrevious: () => void;
    onNext: () => void;
    onCreateProduct: () => void;
    isCreating: boolean;
}

const WarrantyTab: React.FC<WarrantyTabProps> = ({ formData, productWarranties, setProductWarranties, onPrevious, onNext, onCreateProduct, isCreating }) => {
    const { currentStore } = useCurrentStore();
    const queryParams = currentStore?.id ? { store_id: currentStore.id } : {};
    const { data: warrantyTypesResponse, isLoading: warrantyTypesLoading } = useGetWarrantyTypesQuery(queryParams);
    const warrantyTypes = warrantyTypesResponse?.data || [];
    const [sameWarrantyForAll, setSameWarrantyForAll] = useState(true);

    const quantity = parseInt(formData.quantity) || 0;

    // Initialize warranties based on quantity
    useEffect(() => {
        if (quantity > 0 && productWarranties.length !== quantity) {
            setProductWarranties(
                new Array(quantity)
                    .fill({ warranty_type_id: 0, duration_months: undefined, duration_days: undefined })
                    .map(() => ({ warranty_type_id: 0, duration_months: undefined, duration_days: undefined }))
            );
        }
    }, [quantity, productWarranties.length, setProductWarranties]);

    const handleSameWarrantyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSameWarrantyForAll(e.target.checked);
        if (e.target.checked && productWarranties[0]) {
            // Apply first warranty to all
            setProductWarranties(new Array(quantity).fill(null).map(() => ({ ...productWarranties[0] })));
        }
    };

    const handleSingleWarrantyChange = (warrantyTypeId: number) => {
        const selectedType = warrantyTypes.find((wt: any) => wt.id === warrantyTypeId);
        const newWarranty = {
            warranty_type_id: warrantyTypeId,
            duration_months: selectedType?.duration_months || undefined,
            duration_days: selectedType?.duration_days || undefined,
        };
        // Update all entries with same warranty
        setProductWarranties(new Array(quantity).fill(null).map(() => ({ ...newWarranty })));
    };

    const handleWarrantyChange = (index: number, warrantyTypeId: number) => {
        const selectedType = warrantyTypes.find((wt: any) => wt.id === warrantyTypeId);
        const updated = [...productWarranties];
        updated[index] = {
            warranty_type_id: warrantyTypeId,
            duration_months: selectedType?.duration_months || undefined,
            duration_days: selectedType?.duration_days || undefined,
        };
        setProductWarranties(updated);
    };

    const filledWarranties = productWarranties.filter((w) => w.warranty_type_id > 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Warranty Information</h3>
                </div>
            </div>
            {/* Same Warranty Checkbox */}
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 sm:p-4">
                <label className="flex cursor-pointer items-start gap-2 sm:items-center sm:gap-3">
                    <input
                        type="checkbox"
                        checked={sameWarrantyForAll}
                        onChange={handleSameWarrantyChange}
                        className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500 sm:mt-0 sm:h-5 sm:w-5"
                    />
                    <div>
                        <p className="text-sm font-medium text-purple-900 sm:text-base">Use same warranty for all products</p>
                        <p className="text-xs text-purple-700 sm:text-sm">One warranty will be applied to all {quantity} units</p>
                    </div>
                </label>
            </div>

            <div className="space-y-3">
                {warrantyTypesLoading ? (
                    <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8">
                        <div className="text-center">
                            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
                            <p className="text-sm text-gray-600">Loading warranty types...</p>
                        </div>
                    </div>
                ) : warrantyTypes.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
                        <div className="text-center">
                            <Shield className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                            <h4 className="mb-1 text-sm font-semibold text-gray-700">No Warranty Types Available</h4>
                            <p className="text-xs text-gray-500">Please create warranty types first.</p>
                        </div>
                    </div>
                ) : sameWarrantyForAll ? (
                    // Single Warranty Selection
                    <div className="rounded-lg border border-gray-300 bg-white p-3 sm:p-4">
                        <div className="mb-2">
                            <label className="text-xs font-medium text-gray-700 sm:text-sm">Warranty (for all {quantity} units)</label>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 sm:px-3">
                                <span className="truncate text-xs text-gray-600 sm:text-sm">{formData.product_name || 'Product'}</span>
                            </div>
                            <select
                                value={productWarranties[0]?.warranty_type_id || ''}
                                onChange={(e) => handleSingleWarrantyChange(parseInt(e.target.value) || 0)}
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Select warranty type</option>
                                {warrantyTypes.map((type: any) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name} ({type.duration_months ? `${type.duration_months} months` : ''}
                                        {type.duration_months && type.duration_days ? ', ' : ''}
                                        {type.duration_days ? `${type.duration_days} days` : ''})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ) : (
                    // Multiple Warranty Selections
                    <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2 sm:p-4">
                        {Array.from({ length: quantity }).map((_, index) => (
                            <div key={index} className="flex flex-col gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:flex-row sm:items-center sm:gap-2 sm:p-3">
                                <div className="flex items-center justify-between gap-2 sm:justify-start">
                                    <div className="flex items-center gap-2">
                                        <label className="whitespace-nowrap text-xs font-medium text-gray-700 sm:text-sm">Warranty #{index + 1}</label>
                                        {productWarranties[index]?.warranty_type_id > 0 && <span className="text-xs font-medium text-green-600">✓</span>}
                                    </div>
                                </div>
                                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 sm:px-3">
                                    <span className="truncate text-xs text-gray-600 sm:text-sm">{formData.product_name || 'Product'}</span>
                                </div>
                                <select
                                    value={productWarranties[index]?.warranty_type_id || ''}
                                    onChange={(e) => handleWarrantyChange(index, parseInt(e.target.value) || 0)}
                                    className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs focus:border-green-500 focus:ring-2 focus:ring-green-500 sm:flex-1 sm:px-3 sm:text-sm"
                                >
                                    <option value="">Select warranty type</option>
                                    {warrantyTypes.map((type: any) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name} ({type.duration_months ? `${type.duration_months} months` : ''}
                                            {type.duration_months && type.duration_days ? ', ' : ''}
                                            {type.duration_days ? `${type.duration_days} days` : ''})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Summary */}
            {!sameWarrantyForAll && filledWarranties.length > 0 && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                        <span>
                            Progress: {filledWarranties.length} / {quantity}
                        </span>
                        <span className="font-medium text-green-600">{Math.round((filledWarranties.length / quantity) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                            className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                            style={{ width: `${(filledWarranties.length / quantity) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}
            {/* Info Card */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                        <p className="mb-1 font-medium">About Product Warranty:</p>
                        <ul className="space-y-1 text-blue-700">
                            <li>• Select warranty type from predefined templates</li>
                            <li>• Duration (months/days) is automatically set from warranty type</li>
                            <li>• Use "same warranty for all" to assign one warranty to all {quantity} units</li>
                            <li>• Or assign individual warranties to each product unit</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-6">
                <button
                    type="button"
                    onClick={onPrevious}
                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 sm:px-6 sm:py-3"
                >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                </button>
                <button type="button" onClick={onNext} className="flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white sm:px-6 sm:py-3">
                    <span>Next</span>
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={onCreateProduct}
                    disabled={isCreating}
                    className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 sm:px-6 sm:py-3"
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

export default WarrantyTab;
