'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetStoreAttributesQuery } from '@/store/features/attribute/attribute';
import { Check, Plus, Tag, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface ProductAttribute {
    attribute_id: number;
    value: string;
    attribute_name?: string;
}

interface AttributesTabProps {
    formData: {
        product_name: string;
        quantity: string;
    };
    productAttributes: ProductAttribute[];
    setProductAttributes: React.Dispatch<React.SetStateAction<ProductAttribute[]>>;
    onPrevious: () => void;
    onNext: () => void;
    onCreateProduct: () => void;
    isCreating: boolean;
    isEditMode?: boolean;
}

const AttributesTab: React.FC<AttributesTabProps> = ({ formData, productAttributes, setProductAttributes, onPrevious, onNext, onCreateProduct, isCreating, isEditMode = false }) => {
    const { currentStore } = useCurrentStore();
    const queryParams = currentStore?.id ? { store_id: currentStore.id } : {};
    const { data: attributesResponse, isLoading: attributesLoading } = useGetStoreAttributesQuery(queryParams, { refetchOnMountOrArgChange: true });
    const attributes = attributesResponse?.data || [];

    // Selected attributes: can be from DB (has id) or custom (has name only)
    const [selectedAttributes, setSelectedAttributes] = useState<Array<{ id: number | string; name: string; isCustom: boolean }>>([]);

    // For search/input functionality
    const [searchQueries, setSearchQueries] = useState<{ [key: string]: string }>({});
    const [showDropdowns, setShowDropdowns] = useState<{ [key: string]: boolean }>({});

    const quantity = parseInt(formData.quantity) || 0;

    // Initialize selected attributes from productAttributes prop
    useEffect(() => {
        if (productAttributes.length > 0 && selectedAttributes.length === 0) {
            const attrs = productAttributes
                .map((attr) => {
                    if (attr.attribute_id > 0) {
                        // DB attribute
                        const dbAttr = attributes.find((a: any) => a.id === attr.attribute_id);
                        return {
                            id: attr.attribute_id,
                            name: dbAttr?.name || '',
                            isCustom: false,
                        };
                    } else if (attr.attribute_name) {
                        // Custom attribute (just name, no DB id)
                        return {
                            id: `custom_${attr.attribute_name}`,
                            name: attr.attribute_name,
                            isCustom: true,
                        };
                    }
                    return null;
                })
                .filter(Boolean) as Array<{ id: number | string; name: string; isCustom: boolean }>;
            setSelectedAttributes(attrs);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attributes]);

    // Sync selected attributes to parent component
    useEffect(() => {
        const attributesData = selectedAttributes.map((attr) => {
            if (attr.isCustom) {
                // Custom attribute: no ID, just name
                return {
                    attribute_id: 0,
                    attribute_name: attr.name,
                    value: '',
                };
            } else {
                // DB attribute: has ID and name
                return {
                    attribute_id: typeof attr.id === 'number' ? attr.id : 0,
                    attribute_name: attr.name, // Include name for VariantsTab to use
                    value: '',
                };
            }
        });
        setProductAttributes(attributesData);
    }, [selectedAttributes, setProductAttributes]);

    // Add new attribute field
    const handleAddAttributeField = () => {
        const tempId = `temp_${Date.now()}`;
        setSelectedAttributes([...selectedAttributes, { id: tempId, name: '', isCustom: false }]);
        setSearchQueries({ ...searchQueries, [tempId]: '' });
        setShowDropdowns({ ...showDropdowns, [tempId]: false });
    };

    // Handle search input change
    const handleSearchChange = (attrId: string | number, value: string) => {
        setSearchQueries({ ...searchQueries, [attrId]: value });
        setShowDropdowns({ ...showDropdowns, [attrId]: true });
    };

    // Select attribute from dropdown (DB attribute) - Just take the name
    const handleSelectAttribute = (tempId: string | number, attribute: any) => {
        const updated = selectedAttributes.map((attr) =>
            attr.id === tempId
                ? {
                      id: attribute.id,
                      name: attribute.name,
                      isCustom: false,
                  }
                : attr
        );
        setSelectedAttributes(updated);
        setSearchQueries({ ...searchQueries, [tempId]: '' });
        setShowDropdowns({ ...showDropdowns, [tempId]: false });
    };

    // Add custom attribute (NO API call, just save name)
    const handleAddCustomAttribute = (tempId: string | number, attributeName: string) => {
        if (!attributeName.trim()) return;

        // Just save the name, NO database creation
        const updated = selectedAttributes.map((attr) => (attr.id === tempId ? { id: `custom_${attributeName}`, name: attributeName.trim(), isCustom: true } : attr));
        setSelectedAttributes(updated);
        setSearchQueries({ ...searchQueries, [tempId]: '' });
        setShowDropdowns({ ...showDropdowns, [tempId]: false });
    };

    // Remove attribute field
    const handleRemoveAttribute = (attrId: number | string) => {
        setSelectedAttributes(selectedAttributes.filter((attr) => attr.id !== attrId));
        const newSearchQueries = { ...searchQueries };
        const newShowDropdowns = { ...showDropdowns };
        delete newSearchQueries[attrId];
        delete newShowDropdowns[attrId];
        setSearchQueries(newSearchQueries);
        setShowDropdowns(newShowDropdowns);
    };

    // Filter attributes based on search for each field
    const getFilteredAttributes = (searchQuery: string) => {
        const availableAttributes = attributes.filter((attr: any) => !selectedAttributes.some((selected) => selected.id === attr.id));

        // If no search query, return first 5 available attributes
        if (!searchQuery || searchQuery.trim() === '') {
            return availableAttributes.slice(0, 5);
        }

        // Otherwise, filter by search query
        return availableAttributes.filter((attr: any) => attr.name.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="border-b border-gray-200 pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <Tag className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Product Attributes</h3>
                            <p className="text-sm text-gray-600">
                                Product: <span className="font-semibold text-blue-700">{formData.product_name || 'Not Set'}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddAttributeField}
                        className="flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 sm:px-6 sm:py-3"
                    >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Add Attribute</span>
                    </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">Select from suggestions or type custom attribute names</p>
            </div>

            {/* Selected Attributes Display */}
            {selectedAttributes.length > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-700">Product Attributes ({selectedAttributes.length})</h4>
                        <p className="text-xs text-blue-700">These attributes will be used for variants</p>
                    </div>
                    <div className="space-y-3">
                        {selectedAttributes.map((attr) => (
                            <div key={attr.id} className="flex items-center gap-2">
                                <div className="flex-1">
                                    <div className="relative">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={searchQueries[attr.id] || attr.name}
                                                onChange={(e) => handleSearchChange(attr.id, e.target.value)}
                                                onFocus={() => {
                                                    setShowDropdowns({ ...showDropdowns, [attr.id]: true });
                                                }}
                                                onBlur={() => {
                                                    setTimeout(() => {
                                                        setShowDropdowns({ ...showDropdowns, [attr.id]: false });
                                                    }, 200);
                                                }}
                                                placeholder="Select from dropdown or type custom attribute (e.g., Size, Color, Material)"
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-gray-500"
                                                disabled={attr.name !== '' && (attr.isCustom || typeof attr.id === 'number')}
                                            />

                                            {/* Tick/Check button for custom input */}
                                            {!attr.isCustom && typeof attr.id === 'string' && attr.id.startsWith('temp_') && searchQueries[attr.id] && searchQueries[attr.id].trim() !== '' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddCustomAttribute(attr.id, searchQueries[attr.id])}
                                                    className="flex items-center justify-center rounded-lg bg-gray-600 p-2.5 text-white transition-colors hover:bg-gray-700"
                                                    title="Add this custom attribute"
                                                >
                                                    <Check className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Dropdown for suggestions and search results */}
                                        {showDropdowns[attr.id] && (
                                            <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                                                {getFilteredAttributes(searchQueries[attr.id] || '').length > 0 ? (
                                                    <div className="max-h-60 overflow-y-auto p-1">
                                                        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            {searchQueries[attr.id] ? 'Search Results' : 'Suggestions'}
                                                        </div>
                                                        {getFilteredAttributes(searchQueries[attr.id] || '').map((dbAttr: any) => (
                                                            <button
                                                                key={dbAttr.id}
                                                                type="button"
                                                                onMouseDown={() => handleSelectAttribute(attr.id, dbAttr)}
                                                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-blue-50"
                                                            >
                                                                <Tag className="h-4 w-4 text-gray-600" />
                                                                <span className="font-medium text-gray-900">{dbAttr.name}</span>
                                                            </button>
                                                        ))}
                                                        {searchQueries[attr.id] && (
                                                            <div className="border-t border-gray-100 px-3 py-2">
                                                                <p className="text-xs text-gray-500">
                                                                    💡 Or type custom name and click the <strong>✓ tick button</strong> to add
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : searchQueries[attr.id] ? (
                                                    <div className="p-4 text-center">
                                                        <p className="text-sm font-medium text-gray-700">No matches found for &quot;{searchQueries[attr.id]}&quot;</p>
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            Click the <strong>✓ tick button</strong> to add as custom attribute
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="p-4 text-center">
                                                        <Tag className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                                        <p className="text-sm text-gray-600">No attributes available</p>
                                                        <p className="mt-1 text-xs text-gray-500">Type a custom attribute name and click the ✓ button</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button type="button" onClick={() => handleRemoveAttribute(attr.id)} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info Card */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                        <p className="mb-1 font-medium">How Product Attributes Work:</p>
                        <ul className="space-y-1 text-blue-700">
                            <li>
                                • Click <strong>&quot;+ Add Attribute&quot;</strong> button at the top to add a new field
                            </li>
                            <li>
                                • <strong>From dropdown:</strong> Select existing attribute (saved in database with ID)
                            </li>
                            <li>
                                • <strong>Custom attribute:</strong> Type name (e.g., &quot;Size&quot;, &quot;GSM&quot;) and click <strong>✓</strong> (NOT saved to database, just attribute name for
                                this product)
                            </li>
                            <li>• A product can have multiple attributes (Size + Color + Material)</li>
                            <li>
                                • <strong>Attribute values</strong> (XL, Red, Cotton, etc.) will be added in the Variants tab
                            </li>
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
                    className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 sm:px-6 sm:py-3"
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

export default AttributesTab;


