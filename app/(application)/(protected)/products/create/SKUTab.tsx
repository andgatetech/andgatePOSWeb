'use client';

import CameraScanner from '@/app/(application)/(protected)/pos/pos-left-side/CameraScanner';
import { Barcode, Camera } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { ProductStock } from './VariantsTab';

interface SKUTabProps {
    formData: {
        sku: string;
        skuOption: 'auto' | 'manual';
        has_attributes?: boolean;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    onPrevious: () => void;
    onNext: () => void;
    onCreateProduct: () => void;
    isCreating: boolean;
    isEditMode?: boolean;
    skuError?: string | null;
    // Variant product support
    productStocks?: ProductStock[];
    setProductStocks?: React.Dispatch<React.SetStateAction<ProductStock[]>>;
}

const SKUTab: React.FC<SKUTabProps> = ({
    formData,
    handleChange,
    setFormData,
    onPrevious,
    onNext,
    onCreateProduct,
    isCreating,
    isEditMode = false,
    skuError = null,
    productStocks = [],
    setProductStocks,
}) => {
    const [showScanner, setShowScanner] = useState(false);
    const [activeScanIndex, setActiveScanIndex] = useState<number | null>(null); // Which variant we're scanning for

    // Handle camera scan — fill the SKU field with scanned value
    const handleScan = useCallback(
        (decodedText: string) => {
            if (formData.has_attributes && activeScanIndex !== null && setProductStocks) {
                // Scanning for a variant product
                setProductStocks((prev) => {
                    const updated = [...prev];
                    if (updated[activeScanIndex]) {
                        updated[activeScanIndex] = { ...updated[activeScanIndex], sku: decodedText };
                    }
                    return updated;
                });
            } else {
                // Scanning for a simple product
                setFormData((prev: any) => ({ ...prev, sku: decodedText, skuOption: 'manual' }));
            }
            toast.success(`Scanned: ${decodedText}`, {
                duration: 2000,
                position: 'top-center',
                style: {
                    background: '#10b981',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                },
            });
            setShowScanner(false);
            setActiveScanIndex(null);
        },
        [setFormData, formData.has_attributes, activeScanIndex, setProductStocks]
    );

    const handleScannerClose = useCallback(() => {
        setShowScanner(false);
        setActiveScanIndex(null);
    }, []);

    // Update variant SKU
    const handleVariantSkuChange = (index: number, value: string) => {
        if (setProductStocks) {
            setProductStocks((prev) => {
                const updated = [...prev];
                if (updated[index]) {
                    updated[index] = { ...updated[index], sku: value };
                }
                return updated;
            });
        }
    };

    // Get variant display name
    const getVariantName = (stock: ProductStock): string => {
        if (!stock.variant_data || Object.keys(stock.variant_data).length === 0) {
            return 'Variant';
        }
        const values = Object.values(stock.variant_data)
            .filter((v) => v.trim() !== '')
            .join(' / ');
        return values || 'Variant';
    };

    const isVariantProduct = formData.has_attributes && productStocks.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Barcode className="h-6 w-6 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">SKU Management</h3>
            </div>

            {isVariantProduct ? (
                /* ===== VARIANT PRODUCT: Per-variant SKU fields ===== */
                <div className="space-y-4">
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                        <p className="text-sm text-indigo-800">
                            <span className="font-medium">Variant Product:</span> Each variant has its own SKU. Leave empty for auto-generated SKUs.
                        </p>
                    </div>

                    {productStocks.map((stock, index) => (
                        <div key={index} className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-sm">
                            <div className="mb-2 flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">#{index + 1}</div>
                                <span className="text-sm font-medium text-gray-900">{getVariantName(stock)}</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={(stock as any).sku || ''}
                                    onChange={(e) => handleVariantSkuChange(index, e.target.value)}
                                    placeholder="Enter SKU or leave empty for auto-generate"
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500"
                                    maxLength={100}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveScanIndex(index);
                                        setShowScanner(!showScanner);
                                    }}
                                    className="flex items-center gap-1.5 rounded-lg border-2 border-blue-400 bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-100"
                                    title="Scan barcode with camera"
                                >
                                    <Camera className="h-4 w-4" />
                                    <span className="hidden sm:inline">Scan</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* ===== SIMPLE PRODUCT: Single SKU field ===== */
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

                    {/* SKU Input with Scan Button */}
                    <div>
                        <label htmlFor="sku" className="mb-2 block text-sm font-medium text-gray-700">
                            SKU Code {formData.skuOption === 'manual' && <span className="text-red-500">*</span>}
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="sku"
                                name="sku"
                                type="text"
                                value={formData.sku}
                                onChange={handleChange}
                                placeholder={formData.skuOption === 'manual' ? 'Enter SKU code (e.g., PRD-12345)' : 'Will be generated automatically'}
                                className={`w-full rounded-lg border px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${
                                    skuError ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 bg-gray-50 focus:ring-gray-500'
                                }`}
                                disabled={formData.skuOption === 'auto'}
                                maxLength={100}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData((prev: any) => ({ ...prev, skuOption: 'manual' }));
                                    setActiveScanIndex(null);
                                    setShowScanner(!showScanner);
                                }}
                                className={`flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                    showScanner && activeScanIndex === null ? 'border-red-400 bg-red-50 text-red-600 hover:bg-red-100' : 'border-blue-400 bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}
                                title={showScanner ? 'Close camera scanner' : 'Scan barcode with camera'}
                            >
                                <Camera className="h-5 w-5" />
                                <span className="hidden sm:inline">{showScanner && activeScanIndex === null ? 'Close' : 'Scan'}</span>
                            </button>
                        </div>
                        {skuError && (
                            <p className="mt-1.5 flex items-center gap-1 text-sm font-medium text-red-600">
                                <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {skuError}
                            </p>
                        )}
                        {!skuError && formData.skuOption === 'auto' && <p className="mt-1 text-xs text-gray-500">A unique SKU will be automatically generated when you create the product</p>}
                    </div>
                </div>
            )}

            {/* Camera Scanner */}
            <CameraScanner
                isOpen={showScanner}
                onClose={handleScannerClose}
                onScan={handleScan}
                autoClose={false}
                title="Scan SKU / Barcode"
                helperText="Point camera at the product barcode"
                subHelperText="Scanned value will be saved as the SKU code"
            />

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
                            {isVariantProduct ? (
                                <>
                                    <li>• Each variant should have a unique SKU (e.g., SHIRT-RED-M, SHIRT-BLU-L)</li>
                                    <li>• Leave empty to let the system auto-generate SKUs</li>
                                </>
                            ) : (
                                <>
                                    <li>• Examples: PROD-001, SHIRT-BLU-M, LAPTOP-HP-15</li>
                                    <li>• Auto-generated SKUs ensure uniqueness across your inventory</li>
                                </>
                            )}
                            <li>• 📷 Use the Scan button to capture a barcode with your camera</li>
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
