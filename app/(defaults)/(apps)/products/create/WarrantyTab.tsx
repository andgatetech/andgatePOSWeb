'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useCreateWarrantyTypeMutation, useGetWarrantyTypesQuery } from '@/store/features/warrenty/WarrantyTypeApi';
import { Check, Shield } from 'lucide-react';
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
    const [createWarrantyType] = useCreateWarrantyTypeMutation();

    const [sameWarrantyForAll, setSameWarrantyForAll] = useState(true);

    // For search/input functionality
    const [searchQueries, setSearchQueries] = useState<{ [key: number]: string }>({});
    const [showDropdowns, setShowDropdowns] = useState<{ [key: number]: boolean }>({});

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

    // Handle search input change
    const handleSearchChange = (index: number, value: string) => {
        setSearchQueries({ ...searchQueries, [index]: value });
        setShowDropdowns({ ...showDropdowns, [index]: true });

        // Clear warranty selection when user starts typing (like AttributesTab)
        if (value !== '') {
            const updated = [...productWarranties];
            updated[index] = {
                warranty_type_id: 0,
                duration_months: undefined,
                duration_days: undefined,
            };
            setProductWarranties(updated);
        }
    };

    // Select warranty from dropdown
    const handleSelectWarranty = (index: number, warranty: any) => {
        const updated = [...productWarranties];
        updated[index] = {
            warranty_type_id: warranty.id,
            duration_months: warranty.duration_months || undefined,
            duration_days: warranty.duration_days || undefined,
        };
        setProductWarranties(updated);

        // Clear search query by deleting it from state
        const newSearchQueries = { ...searchQueries };
        delete newSearchQueries[index];
        setSearchQueries(newSearchQueries);
        setShowDropdowns({ ...showDropdowns, [index]: false });
    };

    // Add custom warranty duration (NO API call, just save duration_days locally)
    const handleAddCustomWarranty = (index: number) => {
        const daysInput = searchQueries[index];
        const days = parseInt(daysInput);

        if (!daysInput || !days || days <= 0) {
            alert('Please enter a valid warranty duration in days');
            return;
        }

        // Just save the duration locally, NO database creation
        const updated = [...productWarranties];
        updated[index] = {
            warranty_type_id: 0, // 0 means custom warranty (not from DB)
            duration_months: undefined,
            duration_days: days, // Only store the days
        };
        setProductWarranties(updated);

        // Clear search query by deleting it from state
        const newSearchQueries = { ...searchQueries };
        delete newSearchQueries[index];
        setSearchQueries(newSearchQueries);
        setShowDropdowns({ ...showDropdowns, [index]: false });
    };

    // Filter warranties based on search (by duration)
    const getFilteredWarranties = (searchQuery: string, currentIndex: number) => {
        const selectedIds = productWarranties.map((w) => w.warranty_type_id).filter((id, idx) => idx !== currentIndex && id > 0);
        const availableWarranties = warrantyTypes.filter((wt: any) => !selectedIds.includes(wt.id));

        if (!searchQuery || searchQuery.trim() === '') {
            return availableWarranties.slice(0, 5);
        }

        // Search by duration (days or months)
        const query = searchQuery.toLowerCase();
        return availableWarranties.filter((wt: any) => {
            const durationText = `${wt.duration_months || ''} ${wt.duration_days || ''}`.toLowerCase();
            return durationText.includes(query) || (wt.duration_days && wt.duration_days.toString().includes(query)) || (wt.duration_months && wt.duration_months.toString().includes(query));
        });
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
                ) : sameWarrantyForAll ? (
                    // Single Warranty Selection with Search
                    <div className="rounded-lg border border-gray-300 bg-white p-3 sm:p-4">
                        <div className="mb-2">
                            <label className="text-xs font-medium text-gray-700 sm:text-sm">
                                Warranty (for all {displayUnitCount} {hasVariants ? 'units across variants' : 'units'})
                            </label>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="relative">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={
                                            searchQueries[0] !== undefined
                                                ? searchQueries[0]
                                                : productWarranties[0]?.warranty_type_id > 0
                                                ? (() => {
                                                      const w = warrantyTypes.find((wt: any) => wt.id === productWarranties[0].warranty_type_id);
                                                      return w
                                                          ? `${w.duration_months ? w.duration_months + ' months' : ''}${w.duration_months && w.duration_days ? ', ' : ''}${
                                                                w.duration_days ? w.duration_days + ' days' : ''
                                                            }`
                                                          : '';
                                                  })()
                                                : productWarranties[0]?.duration_days
                                                ? `${productWarranties[0].duration_days} days`
                                                : ''
                                        }
                                        onChange={(e) => handleSearchChange(0, e.target.value)}
                                        onFocus={() => setShowDropdowns({ ...showDropdowns, [0]: true })}
                                        onBlur={() => {
                                            setTimeout(() => setShowDropdowns({ ...showDropdowns, [0]: false }), 200);
                                        }}
                                        placeholder="Select from dropdown or type duration in days (e.g., 365, 730)"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500"
                                        disabled={
                                            !!(productWarranties[0]?.warranty_type_id > 0 || (productWarranties[0]?.duration_days && productWarranties[0]?.duration_days > 0)) &&
                                            searchQueries[0] === undefined
                                        }
                                    />

                                    {/* Tick button to create custom warranty */}
                                    {productWarranties[0]?.warranty_type_id === 0 && searchQueries[0] && searchQueries[0].trim() !== '' && (
                                        <button
                                            type="button"
                                            onClick={() => handleAddCustomWarranty(0)}
                                            className="flex items-center justify-center rounded-lg bg-green-600 p-2.5 text-white transition-colors hover:bg-green-700"
                                            title="Create custom warranty"
                                        >
                                            <Check className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>

                                {/* Dropdown for backend warranty durations */}
                                {showDropdowns[0] && (
                                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                                        {getFilteredWarranties(searchQueries[0] || '', 0).length > 0 ? (
                                            <div className="max-h-60 overflow-y-auto p-1">
                                                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{searchQueries[0] ? 'Search Results' : 'Suggestions'}</div>
                                                {getFilteredWarranties(searchQueries[0] || '', 0).map((wt: any) => (
                                                    <button
                                                        key={wt.id}
                                                        type="button"
                                                        onMouseDown={() => handleSelectWarranty(0, wt)}
                                                        className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-green-50"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="h-4 w-4 text-green-600" />
                                                            <span className="font-medium text-gray-900">
                                                                {wt.duration_months ? `${wt.duration_months} months` : ''}
                                                                {wt.duration_months && wt.duration_days ? ', ' : ''}
                                                                {wt.duration_days ? `${wt.duration_days} days` : ''}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                                {searchQueries[0] && (
                                                    <div className="border-t border-gray-100 px-3 py-2">
                                                        <p className="text-xs text-gray-500">
                                                            💡 Or type duration in days (e.g., 365) and click the <strong>✓ tick button</strong> to add
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : searchQueries[0] ? (
                                            <div className="p-4 text-center">
                                                <p className="text-sm font-medium text-gray-700">No matches found for &quot;{searchQueries[0]}&quot;</p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Type duration in days and click the <strong>✓ tick button</strong> to create custom warranty
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center">
                                                <Shield className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                                <p className="text-sm text-gray-600">No warranty types available</p>
                                                <p className="mt-1 text-xs text-gray-500">Type duration in days and click the ✓ button</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : entryCount === 0 ? (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">Set product quantity or variant stock to assign warranties.</div>
                ) : (
                    // Multiple Warranty Selections
                    <div className="max-h-[500px] space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2 sm:p-4">
                        {Array.from({ length: entryCount }).map((_, index) => {
                            const selectedWarranty = warrantyTypes.find((w: any) => w.id === productWarranties[index]?.warranty_type_id);
                            return (
                                <div key={index} className="rounded-lg border border-gray-300 bg-white p-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700">
                                            {hasVariants ? getVariantName(index) : `Warranty #${index + 1}`}
                                            {hasVariants && <span className="ml-2 text-xs font-normal text-gray-500">Qty: {variantUnitCounts[index] || 0}</span>}
                                        </label>
                                        {productWarranties[index]?.warranty_type_id > 0 && <span className="text-xs font-medium text-green-600">✓ Selected</span>}
                                    </div>

                                    <div className="relative">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={
                                                    searchQueries[index] !== undefined
                                                        ? searchQueries[index]
                                                        : productWarranties[index]?.warranty_type_id > 0
                                                        ? (() => {
                                                              const w = warrantyTypes.find((wt: any) => wt.id === productWarranties[index].warranty_type_id);
                                                              return w
                                                                  ? `${w.duration_months ? w.duration_months + ' months' : ''}${w.duration_months && w.duration_days ? ', ' : ''}${
                                                                        w.duration_days ? w.duration_days + ' days' : ''
                                                                    }`
                                                                  : '';
                                                          })()
                                                        : productWarranties[index]?.duration_days
                                                        ? `${productWarranties[index].duration_days} days`
                                                        : ''
                                                }
                                                onChange={(e) => handleSearchChange(index, e.target.value)}
                                                onFocus={() => setShowDropdowns({ ...showDropdowns, [index]: true })}
                                                onBlur={() => {
                                                    setTimeout(() => setShowDropdowns({ ...showDropdowns, [index]: false }), 200);
                                                }}
                                                placeholder="Select from dropdown or type days (e.g., 365)"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500"
                                                disabled={
                                                    !!(productWarranties[index]?.warranty_type_id > 0 || (productWarranties[index]?.duration_days && productWarranties[index]?.duration_days > 0)) &&
                                                    searchQueries[index] === undefined
                                                }
                                            />

                                            {/* Tick button for custom warranty */}
                                            {productWarranties[index]?.warranty_type_id === 0 && searchQueries[index] && searchQueries[index].trim() !== '' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddCustomWarranty(index)}
                                                    className="flex items-center justify-center rounded-lg bg-green-600 p-2 text-white hover:bg-green-700"
                                                    title="Create warranty"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Dropdown for backend warranties */}
                                        {showDropdowns[index] && (
                                            <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                                                {getFilteredWarranties(searchQueries[index] || '', index).length > 0 ? (
                                                    <div className="max-h-48 overflow-y-auto p-1">
                                                        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                                                            {searchQueries[index] ? 'Search Results' : 'Suggestions'}
                                                        </div>
                                                        {getFilteredWarranties(searchQueries[index] || '', index).map((wt: any) => (
                                                            <button
                                                                key={wt.id}
                                                                type="button"
                                                                onMouseDown={() => handleSelectWarranty(index, wt)}
                                                                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-green-50"
                                                            >
                                                                <div className="flex items-center gap-1">
                                                                    <Shield className="h-3 w-3 text-green-600" />
                                                                    <span className="font-medium text-gray-900">
                                                                        {wt.duration_months ? `${wt.duration_months} months` : ''}
                                                                        {wt.duration_months && wt.duration_days ? ', ' : ''}
                                                                        {wt.duration_days ? `${wt.duration_days} days` : ''}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        ))}
                                                        {searchQueries[index] && (
                                                            <div className="border-t border-gray-100 px-2 py-1">
                                                                <p className="text-[10px] text-gray-500">
                                                                    💡 Or type days (e.g., 365) and click <strong>✓</strong> to add
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : searchQueries[index] ? (
                                                    <div className="p-3 text-center">
                                                        <p className="text-xs text-gray-600">No matches found</p>
                                                        <p className="mt-1 text-[10px] text-gray-500">
                                                            Type days and click <strong>✓</strong> to create
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="p-3 text-center">
                                                        <Shield className="mx-auto mb-1 h-6 w-6 text-gray-400" />
                                                        <p className="text-xs text-gray-600">No warranties available</p>
                                                        <p className="mt-1 text-[10px] text-gray-500">Type days and click ✓</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
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
