'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetStoreAttributesQuery } from '@/store/features/attribute/attribute';
import { Tag } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface AttributesTabProps {
    formData: {
        product_name: string;
        quantity: string;
    };
    productAttributes: Array<{ attribute_id: number; value: string }>;
    setProductAttributes: React.Dispatch<React.SetStateAction<Array<{ attribute_id: number; value: string }>>>;
    onPrevious: () => void;
    onNext: () => void;
    onCreateProduct: () => void;
    isCreating: boolean;
}

const AttributesTab: React.FC<AttributesTabProps> = ({ formData, productAttributes, setProductAttributes, onPrevious, onNext, onCreateProduct, isCreating }) => {
    const { currentStore } = useCurrentStore();
    const queryParams = currentStore?.id ? { store_id: currentStore.id } : {};
    const { data: attributesResponse, isLoading: attributesLoading } = useGetStoreAttributesQuery(queryParams);
    const attributes = attributesResponse?.data || [];
    const [sameAttributeForAll, setSameAttributeForAll] = useState(true);

    const quantity = parseInt(formData.quantity) || 0;

    // Initialize attributes based on quantity
    useEffect(() => {
        if (quantity > 0 && productAttributes.length !== quantity) {
            setProductAttributes(new Array(quantity).fill({ attribute_id: 0, value: '' }).map(() => ({ attribute_id: 0, value: '' })));
        }
    }, [quantity, productAttributes.length, setProductAttributes]);

    const handleSameAttributeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSameAttributeForAll(e.target.checked);
        if (e.target.checked && productAttributes[0]) {
            // Apply first attribute to all
            setProductAttributes(new Array(quantity).fill(null).map(() => ({ ...productAttributes[0] })));
        }
    };

    const handleSingleAttributeChange = (field: 'attribute_id' | 'value', value: string | number) => {
        const newAttribute = {
            attribute_id: field === 'attribute_id' ? (typeof value === 'number' ? value : parseInt(value as string) || 0) : productAttributes[0]?.attribute_id || 0,
            value: field === 'value' ? (value as string) : productAttributes[0]?.value || '',
        };
        // Update all entries with same attribute
        setProductAttributes(new Array(quantity).fill(null).map(() => ({ ...newAttribute })));
    };

    const handleAttributeChange = (index: number, field: 'attribute_id' | 'value', value: string | number) => {
        const updated = [...productAttributes];
        updated[index] = {
            ...updated[index],
            [field]: field === 'attribute_id' ? (typeof value === 'number' ? value : parseInt(value as string) || 0) : value,
        };
        setProductAttributes(updated);
    };

    const filledAttributes = productAttributes.filter((attr) => attr.attribute_id > 0 && attr.value.trim() !== '');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Tag className="h-6 w-6 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Product Attributes</h3>
                </div>
            </div>

            {/* Same Attribute Checkbox */}
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 sm:p-4">
                <label className="flex cursor-pointer items-start gap-2 sm:items-center sm:gap-3">
                    <input
                        type="checkbox"
                        checked={sameAttributeForAll}
                        onChange={handleSameAttributeChange}
                        className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500 sm:mt-0 sm:h-5 sm:w-5"
                    />
                    <div>
                        <p className="text-sm font-medium text-purple-900 sm:text-base">Use same attribute for all products</p>
                        <p className="text-xs text-purple-700 sm:text-sm">One attribute will be applied to all {quantity} units</p>
                    </div>
                </label>
            </div>

            <div className="space-y-3">
                {attributesLoading ? (
                    <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8">
                        <div className="text-center">
                            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
                            <p className="text-sm text-gray-600">Loading attributes...</p>
                        </div>
                    </div>
                ) : attributes.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
                        <div className="text-center">
                            <Tag className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                            <h4 className="mb-1 text-sm font-semibold text-gray-700">No Attributes Available</h4>
                            <p className="text-xs text-gray-500">Please create attributes in Store Settings first.</p>
                        </div>
                    </div>
                ) : sameAttributeForAll ? (
                    // Single Attribute Selection
                    <div className="rounded-lg border border-gray-300 bg-white p-3 sm:p-4">
                        <div className="mb-2">
                            <label className="text-xs font-medium text-gray-700 sm:text-sm">Attribute (for all {quantity} units)</label>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 sm:px-3">
                                <span className="truncate text-xs text-gray-600 sm:text-sm">{formData.product_name || 'Product'}</span>
                            </div>
                            <select
                                value={productAttributes[0]?.attribute_id || ''}
                                onChange={(e) => handleSingleAttributeChange('attribute_id', parseInt(e.target.value) || 0)}
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Select attribute type</option>
                                {attributes.map((attribute: any) => (
                                    <option key={attribute.id} value={attribute.id}>
                                        {attribute.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={productAttributes[0]?.value || ''}
                                onChange={(e) => handleSingleAttributeChange('value', e.target.value)}
                                placeholder="e.g., Red, Large, Cotton"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 sm:w-48"
                            />
                        </div>
                    </div>
                ) : (
                    // Multiple Attribute Selections
                    <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2 sm:p-4">
                        {Array.from({ length: quantity }).map((_, index) => (
                            <div key={index} className="flex flex-col gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:flex-row sm:items-center sm:gap-2 sm:p-3">
                                <div className="flex items-center justify-between gap-2 sm:justify-start">
                                    <div className="flex items-center gap-2">
                                        <label className="whitespace-nowrap text-xs font-medium text-gray-700 sm:text-sm">Attribute #{index + 1}</label>
                                        {productAttributes[index]?.attribute_id > 0 && productAttributes[index]?.value.trim() && <span className="text-xs font-medium text-emerald-600">✓</span>}
                                    </div>
                                </div>
                                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 sm:px-3">
                                    <span className="truncate text-xs text-gray-600 sm:text-sm">{formData.product_name || 'Product'}</span>
                                </div>
                                <select
                                    value={productAttributes[index]?.attribute_id || ''}
                                    onChange={(e) => handleAttributeChange(index, 'attribute_id', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 sm:flex-1 sm:px-3 sm:text-sm"
                                >
                                    <option value="">Select attribute type</option>
                                    {attributes.map((attribute: any) => (
                                        <option key={attribute.id} value={attribute.id}>
                                            {attribute.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={productAttributes[index]?.value || ''}
                                    onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                    placeholder="Value"
                                    className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 sm:w-40 sm:px-3 sm:text-sm"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary */}
            {!sameAttributeForAll && filledAttributes.length > 0 && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                        <span>
                            Progress: {filledAttributes.length} / {quantity}
                        </span>
                        <span className="font-medium text-emerald-600">{Math.round((filledAttributes.length / quantity) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                            className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
                            style={{ width: `${(filledAttributes.length / quantity) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Info Card */}
            {/* Info Card */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                        <p className="mb-1 font-medium">About Product Attributes:</p>
                        <ul className="space-y-1 text-blue-700">
                            <li>• Select attribute type (Color, Size, Material) and enter its value</li>
                            <li>• Use &quot;same attribute for all&quot; to assign one attribute to all {quantity} units</li>
                            <li>• Or assign individual attributes to each product unit</li>
                            <li>• Make sure to configure attributes in Store Settings first</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
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

export default AttributesTab;
