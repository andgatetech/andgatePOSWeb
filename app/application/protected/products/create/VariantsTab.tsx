'use client';

import { ChevronDown, ChevronUp, Copy, Image as ImageIcon, Package, Plus, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import ImageUploading, { ImageListType } from 'react-images-uploading';

export interface ProductAttribute {
    attribute_id: number;
    value: string;
    attribute_name?: string;
}

export interface ProductStock {
    price: string;
    purchase_price: string;
    wholesale_price: string;
    quantity: string;
    low_stock_quantity: string;
    tax_rate: string;
    tax_included: boolean;
    available: 'yes' | 'no';
    batch_no: string;
    purchase_date: string;
    unit: string;
    variant_data: { [key: string]: string }; // e.g., { "Color": "Red", "Size": "XL" }
    images: ImageListType;
}

interface VariantsTabProps {
    productAttributes: ProductAttribute[];
    productStocks: ProductStock[];
    setProductStocks: React.Dispatch<React.SetStateAction<ProductStock[]>>;
    units: any[];
    defaultUnit: string;
    formData: {
        product_name: string;
    };
    onPrevious: () => void;
    onNext: () => void;
    onCreateProduct: () => void;
    isCreating: boolean;
    isEditMode?: boolean;
}

const VariantsTab: React.FC<VariantsTabProps> = ({
    productAttributes,
    productStocks,
    setProductStocks,
    units,
    defaultUnit,
    formData,
    onPrevious,
    onNext,
    onCreateProduct,
    isCreating,
    isEditMode = false,
}) => {
    const [expandedVariantIndex, setExpandedVariantIndex] = useState<number | null>(null);
    const maxImagesPerVariant = 5;

    // Get attribute names from AttributesTab
    const attributeNames = productAttributes.map((attr) => attr.attribute_name || '').filter((name) => name.trim() !== '');

    // Add new blank variant
    const handleAddVariant = () => {
        const newVariantData: { [key: string]: string } = {};
        attributeNames.forEach((name) => {
            newVariantData[name] = ''; // Empty value, user will select from dropdown
        });

        const newVariant: ProductStock = {
            price: '',
            purchase_price: '',
            wholesale_price: '',
            quantity: '',
            low_stock_quantity: '',
            tax_rate: '',
            tax_included: false,
            available: 'yes',
            batch_no: '',
            purchase_date: '',
            unit: defaultUnit || '',
            variant_data: newVariantData,
            images: [],
        };
        setProductStocks([...productStocks, newVariant]);
        setExpandedVariantIndex(productStocks.length); // Auto-expand new variant
    };

    // Update variant field
    const handleVariantChange = (index: number, field: keyof ProductStock, value: any) => {
        const updated = [...productStocks];
        updated[index] = { ...updated[index], [field]: value };
        setProductStocks(updated);
    };

    // Update variant attribute value (e.g., Color, Size)
    const handleVariantAttributeChange = (index: number, attributeName: string, value: string) => {
        const updated = [...productStocks];
        updated[index] = {
            ...updated[index],
            variant_data: {
                ...updated[index].variant_data,
                [attributeName]: value,
            },
        };
        setProductStocks(updated);
    };

    // Delete a variant
    const handleDeleteVariant = (index: number) => {
        const updated = productStocks.filter((_, i) => i !== index);
        setProductStocks(updated);
        if (expandedVariantIndex === index) {
            setExpandedVariantIndex(null);
        }
    };

    const handleDuplicateVariant = (index: number) => {
        const variantToDuplicate = productStocks[index];
        if (!variantToDuplicate) {
            return;
        }

        const duplicatedVariant: ProductStock = {
            ...variantToDuplicate,
            variant_data: { ...variantToDuplicate.variant_data },
            images: variantToDuplicate.images ? variantToDuplicate.images.map((image) => ({ ...image })) : [],
        };

        const updated = [...productStocks];
        updated.splice(index + 1, 0, duplicatedVariant);
        setProductStocks(updated);
        setExpandedVariantIndex(index + 1);
    };

    // Handle variant images
    const handleVariantImagesChange = (index: number, imageList: ImageListType) => {
        handleVariantChange(index, 'images', imageList);
    };

    // Get variant display name
    const getVariantName = (stock: ProductStock): string => {
        if (!stock.variant_data || Object.keys(stock.variant_data).length === 0) {
            return 'New Variant';
        }
        const values = Object.entries(stock.variant_data)
            .filter(([_, value]) => value.trim() !== '')
            .map(([key, value]) => `${key}: ${value}`)
            .join(' / ');
        return values || 'New Variant';
    };

    // Get variant short name
    const getVariantShortName = (stock: ProductStock): string => {
        if (!stock.variant_data || Object.keys(stock.variant_data).length === 0) {
            return 'Variant';
        }
        const values = Object.values(stock.variant_data)
            .filter((v) => v.trim() !== '')
            .join(' - ');
        return values || 'Variant';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 p-2">
                            <Package className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
                            <p className="text-sm text-gray-600">
                                Product: <span className="font-semibold text-purple-700">{formData.product_name || 'Not Set'}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                                {productStocks.length} variant{productStocks.length !== 1 ? 's' : ''} configured
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddVariant}
                        disabled={attributeNames.length === 0}
                        className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-3"
                        title={attributeNames.length === 0 ? 'Add attributes first in Attributes tab' : ''}
                    >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Add Variant</span>
                    </button>
                </div>
                {attributeNames.length === 0 && (
                    <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                        ⚠️ Please add attributes in the <strong>Attributes</strong> tab first (e.g., Color, Size)
                    </div>
                )}
                {attributeNames.length > 0 && productStocks.length === 0 && (
                    <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                        💡 Click <strong>Add Variant</strong> to create your first variant
                    </div>
                )}
            </div>

            {/* Variants List */}
            <div className="space-y-4">
                {productStocks.map((stock, index) => (
                    <div key={index} className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all hover:border-purple-300">
                        {/* Variant Header */}
                        <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow">
                                    <span className="font-bold text-purple-600">#{index + 1}</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{getVariantShortName(stock)}</h4>
                                    <p className="text-xs text-gray-600">{getVariantName(stock)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setExpandedVariantIndex(expandedVariantIndex === index ? null : index)}
                                    className="rounded-lg p-2 text-purple-600 transition-colors hover:bg-purple-100"
                                >
                                    {expandedVariantIndex === index ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDuplicateVariant(index)}
                                    className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-100"
                                    title="Duplicate variant"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleDeleteVariant(index)} className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-100" title="Delete variant">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Variant Details - Expandable */}
                        {expandedVariantIndex === index && (
                            <div className="space-y-6 p-6">
                                {/* Attribute Selection */}
                                {attributeNames.length > 0 && (
                                    <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
                                        <h5 className="mb-3 text-sm font-semibold text-purple-900">Variant Attributes</h5>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {attributeNames.map((attributeName) => (
                                                <div key={attributeName}>
                                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                        {attributeName} <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={stock.variant_data[attributeName] || ''}
                                                        onChange={(e) => handleVariantAttributeChange(index, attributeName, e.target.value)}
                                                        placeholder={`Enter ${attributeName}`}
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Pricing Section */}
                                <div>
                                    <h5 className="mb-3 text-sm font-semibold text-gray-900">Pricing</h5>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Selling Price <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                                                <input
                                                    type="number"
                                                    value={stock.price}
                                                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Purchase Price <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                                                <input
                                                    type="number"
                                                    value={stock.purchase_price}
                                                    onChange={(e) => handleVariantChange(index, 'purchase_price', e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Wholesale Price</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                                                <input
                                                    type="number"
                                                    value={stock.wholesale_price}
                                                    onChange={(e) => handleVariantChange(index, 'wholesale_price', e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stock Section */}
                                <div>
                                    <h5 className="mb-3 text-sm font-semibold text-gray-900">Stock & Inventory</h5>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Quantity <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={stock.quantity}
                                                onChange={(e) => handleVariantChange(index, 'quantity', e.target.value)}
                                                placeholder="0"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Unit <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={stock.unit}
                                                onChange={(e) => handleVariantChange(index, 'unit', e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="">Select Unit</option>
                                                {units.map((unit: any) => (
                                                    <option key={unit.id} value={unit.name}>
                                                        {unit.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Low Stock Alert</label>
                                            <input
                                                type="number"
                                                value={stock.low_stock_quantity}
                                                onChange={(e) => handleVariantChange(index, 'low_stock_quantity', e.target.value)}
                                                placeholder="0"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Batch Number</label>
                                            <input
                                                type="text"
                                                value={stock.batch_no}
                                                onChange={(e) => handleVariantChange(index, 'batch_no', e.target.value)}
                                                placeholder="Optional"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Purchase Date</label>
                                            <input
                                                type="date"
                                                value={stock.purchase_date}
                                                onChange={(e) => handleVariantChange(index, 'purchase_date', e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Tax Section */}
                                <div>
                                    <h5 className="mb-3 text-sm font-semibold text-gray-900">Tax</h5>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                                            <input
                                                type="number"
                                                value={stock.tax_rate}
                                                onChange={(e) => handleVariantChange(index, 'tax_rate', e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div className="flex items-center gap-3 pt-7">
                                            <label className="flex cursor-pointer items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={stock.tax_included}
                                                    onChange={(e) => handleVariantChange(index, 'tax_included', e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Tax Included in Price</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Images Section */}
                                <div>
                                    <h5 className="mb-3 text-sm font-semibold text-gray-900">Variant Images</h5>
                                    <ImageUploading
                                        multiple
                                        value={stock.images}
                                        onChange={(imageList) => handleVariantImagesChange(index, imageList)}
                                        maxNumber={maxImagesPerVariant}
                                        dataURLKey="data_url"
                                    >
                                        {({ imageList, onImageUpload, onImageRemove, isDragging, dragProps }) => (
                                            <div className="space-y-4">
                                                <button
                                                    type="button"
                                                    onClick={onImageUpload}
                                                    {...dragProps}
                                                    className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-sm font-medium transition-colors ${
                                                        isDragging
                                                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                                                            : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-purple-400 hover:bg-purple-50'
                                                    }`}
                                                >
                                                    <ImageIcon className="h-5 w-5" />
                                                    <span>Click or Drop Images (Max {maxImagesPerVariant})</span>
                                                </button>

                                                {imageList.length > 0 && (
                                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                                        {imageList.map((image, imgIndex) => (
                                                            <div key={imgIndex} className="group relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
                                                                <Image src={image['data_url']} alt={`Variant ${index + 1} Image ${imgIndex + 1}`} fill className="object-cover" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onImageRemove(imgIndex)}
                                                                    className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </ImageUploading>
                                </div>

                                {/* Save Variant Button */}
                                <div className="flex justify-end border-t border-gray-200 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Collapse the variant after saving
                                            setExpandedVariantIndex(null);
                                        }}
                                        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Save & Close</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-between">
                <button
                    type="button"
                    onClick={onPrevious}
                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                </button>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onNext}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-purple-600 bg-white px-6 py-3 text-sm font-medium text-purple-600 transition-colors hover:bg-purple-50 sm:flex-initial"
                    >
                        <span>Next</span>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <button
                        type="button"
                        onClick={onCreateProduct}
                        disabled={isCreating || productStocks.length === 0}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial"
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
                                <Package className="h-5 w-5" />
                                <span>{isEditMode ? 'Update Product' : 'Create Product'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VariantsTab;
