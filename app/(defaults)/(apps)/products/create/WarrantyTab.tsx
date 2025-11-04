'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetWarrantyTypesQuery } from '@/store/features/warrenty/WarrantyTypeApi';
import { Shield } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const sanitizeCount = (value: unknown): number => {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) {
        return 0;
    }
    return Math.floor(num);
};

interface WarrantyTabProps {
    formData: {
        product_name: string;
        quantity: string;
    };
    productWarranties: Array<{ warranty_type_id: number; duration_months?: number; duration_days?: number }>;
    setProductWarranties: React.Dispatch<React.SetStateAction<Array<{ warranty_type_id: number; duration_months?: number; duration_days?: number }>>>;
    productStocks: any[]; // Variants from VariantsTab
    productAttributes: any[]; // Attributes from AttributesTab
    onPrevious: () => void;
    onNext: () => void;
    onCreateProduct: () => void;
    isCreating: boolean;
}

const WarrantyTab: React.FC<WarrantyTabProps> = ({ formData, productWarranties, setProductWarranties, productStocks, productAttributes, onPrevious, onNext, onCreateProduct, isCreating }) => {
    const { currentStore } = useCurrentStore();
    const queryParams = currentStore?.id ? { store_id: currentStore.id } : {};
    const { data: warrantyTypesResponse, isLoading: warrantyTypesLoading } = useGetWarrantyTypesQuery(queryParams);
    const warrantyTypes = warrantyTypesResponse?.data || [];
    const [sameWarrantyForAll, setSameWarrantyForAll] = useState(true);

    // Check if product has variants (attributes)
    const hasVariants = productAttributes && productAttributes.length > 0 && productStocks && productStocks.length > 0;

    const simpleUnitCount = sanitizeCount(formData.quantity);
    const variantUnitCounts = hasVariants ? productStocks.map((stock) => sanitizeCount(stock?.quantity)) : [];
    const totalVariantUnits = variantUnitCounts.reduce((sum, qty) => sum + qty, 0);

    const totalUnits = hasVariants ? totalVariantUnits : simpleUnitCount;
    const variantCount = hasVariants ? productStocks.length : 0;
    const displayUnitCount = totalUnits > 0 ? totalUnits : hasVariants ? variantCount : simpleUnitCount;

    const entryCount = sameWarrantyForAll ? 1 : hasVariants ? variantCount : simpleUnitCount;

    useEffect(() => {
        const defaultWarranty = { warranty_type_id: 0, duration_months: undefined, duration_days: undefined };

        setProductWarranties((prev) => {
            if (sameWarrantyForAll) {
                const firstWarranty = prev[0] ? { ...prev[0] } : { ...defaultWarranty };
                return [firstWarranty];
            }

            if (entryCount <= 0) {
                return [];
            }

            if (prev.length === entryCount) {
                return prev;
            }

            return Array.from({ length: entryCount }, (_, index) => {
                const source = prev[index] || prev[0] || defaultWarranty;
                return { ...source };
            });
        });
    }, [entryCount, sameWarrantyForAll, setProductWarranties]);

    const handleSameWarrantyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSameWarrantyForAll(e.target.checked);
    };

    const handleSingleWarrantyChange = (warrantyTypeId: number) => {
        const selectedType = warrantyTypes.find((wt: any) => wt.id === warrantyTypeId);
        const newWarranty = {
            warranty_type_id: warrantyTypeId,
            duration_months: selectedType?.duration_months || undefined,
            duration_days: selectedType?.duration_days || undefined,
        };
        if (sameWarrantyForAll) {
            setProductWarranties([{ ...newWarranty }]);
        } else {
            setProductWarranties((prev) => {
                if (prev.length === 0) {
                    return [{ ...newWarranty }];
                }
                return prev.map(() => ({ ...newWarranty }));
            });
        }
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
    const progressPercentage = !sameWarrantyForAll && entryCount > 0 ? Math.round((filledWarranties.length / entryCount) * 100) : 0;
    const progressWidth = !sameWarrantyForAll && entryCount > 0 ? `${(filledWarranties.length / entryCount) * 100}%` : '0%';

    // Get variant display name
    const getVariantName = (index: number): string => {
        if (!hasVariants || !productStocks[index]) return `Product #${index + 1}`;

        const variant = productStocks[index];
        if (!variant.variant_data || Object.keys(variant.variant_data).length === 0) {
            return `Variant #${index + 1}`;
        }

        const values = Object.entries(variant.variant_data)
            .filter(([_, value]) => {
                if (value === null || value === undefined) {
                    return false;
                }
                const strValue = String(value);
                return strValue.trim() !== '';
            })
            .map(([_, value]) => String(value))
            .join(' - ');
        return values || `Variant #${index + 1}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Warranty Information</h3>
                </div>
            </div>
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
                        <p className="text-xs text-purple-700 sm:text-sm">
                            One warranty will be applied to all {displayUnitCount} {hasVariants ? 'units across variants' : 'units'}
                        </p>
                        {hasVariants && (
                            <p className="text-[11px] text-purple-600 sm:text-xs">
                                Includes {variantCount} {variantCount === 1 ? 'variant' : 'variants'}
                            </p>
                        )}
                    </div>
                </label>
            </div>

            {/* Variants Info - Show if has variants */}
            {hasVariants && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4">
                    <p className="text-sm font-medium text-blue-900">
                        This product has <span className="font-bold">{productStocks.length} variants</span>. Each variant can have its own warranty.
                    </p>
                    {displayUnitCount > 0 && <p className="text-xs text-blue-700">Total units across variants: {displayUnitCount}</p>}
                </div>
            )}

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
                            <label className="text-xs font-medium text-gray-700 sm:text-sm">
                                Warranty (for all {displayUnitCount} {hasVariants ? 'units across variants' : 'units'})
                            </label>
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
                ) : entryCount === 0 ? (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">Set product quantity or variant stock to assign warranties.</div>
                ) : (
                    // Multiple Warranty Selections
                    <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2 sm:p-4">
                        {Array.from({ length: entryCount }).map((_, index) => (
                            <div key={index} className="flex flex-col gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:flex-row sm:items-center sm:gap-2 sm:p-3">
                                <div className="flex items-center justify-between gap-2 sm:justify-start">
                                    <div className="flex items-center gap-2">
                                        <label className="whitespace-nowrap text-xs font-medium text-gray-700 sm:text-sm">
                                            {hasVariants ? getVariantName(index) : `Warranty #${index + 1}`}
                                            {hasVariants && <span className="ml-2 text-[10px] font-normal text-gray-500 sm:text-xs">Qty: {variantUnitCounts[index] || 0}</span>}
                                        </label>
                                        {productWarranties[index]?.warranty_type_id > 0 && <span className="text-xs font-medium text-green-600">✓</span>}
                                    </div>
                                </div>
                                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 sm:px-3">
                                    <span className="truncate text-xs text-gray-600 sm:text-sm">{hasVariants ? formData.product_name || 'Variant' : formData.product_name || 'Product'}</span>
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
            {!sameWarrantyForAll && filledWarranties.length > 0 && entryCount > 0 && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                        <span>
                            Progress: {filledWarranties.length} / {entryCount}
                        </span>
                        <span className="font-medium text-green-600">{progressPercentage}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                        <div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300" style={{ width: progressWidth }}></div>
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
                            <li>
                                • Use &quot;same warranty for all&quot; to assign one warranty to all {displayUnitCount} {hasVariants ? 'units across variants' : 'units'}
                            </li>
                            <li>• Or assign individual warranties to each {hasVariants ? 'variant' : 'product unit'}</li>
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
