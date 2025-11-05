'use client';

import React from 'react';

interface BasicInfoTabProps {
    formData: {
        product_name: string;
        description: string;
        category_id: string;
        category_name: string;
        brand_id: string;
        brand_name: string;
        has_attributes: boolean;
        has_warranty: boolean;
        has_serial: boolean;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    showCategoryDropdown: boolean;
    setShowCategoryDropdown: (show: boolean) => void;
    categorySearchTerm: string;
    setCategorySearchTerm: (term: string) => void;
    showBrandDropdown: boolean;
    setShowBrandDropdown: (show: boolean) => void;
    brandSearchTerm: string;
    setBrandSearchTerm: (term: string) => void;
    filteredCategories: any[];
    filteredBrands: any[];
    handleCategorySelect: (category: any) => void;
    handleBrandSelect: (brand: any) => void;
    onNext: () => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
    formData,
    handleChange,
    showCategoryDropdown,
    setShowCategoryDropdown,
    categorySearchTerm,
    setCategorySearchTerm,
    showBrandDropdown,
    setShowBrandDropdown,
    brandSearchTerm,
    setBrandSearchTerm,
    filteredCategories,
    filteredBrands,
    handleCategorySelect,
    handleBrandSelect,
    onNext,
}) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

            <div className="grid grid-cols-1 gap-6">
                {/* Product Name */}
                <div>
                    <label htmlFor="product_name" className="mb-2 block text-sm font-medium text-gray-700">
                        Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="product_name"
                        name="product_name"
                        type="text"
                        value={formData.product_name}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter product description"
                        rows={4}
                        maxLength={1000}
                        className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">{formData.description.length}/1000 characters</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Category Selection */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                className={`w-full rounded-lg border px-4 py-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                    formData.category_name ? 'border-emerald-300 bg-emerald-50 font-medium text-gray-900' : 'border-gray-300 bg-white text-gray-500'
                                }`}
                            >
                                <span className="block truncate pr-8">{formData.category_name || 'Select a category'}</span>
                                <svg
                                    className={`absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transition-transform duration-200 ${
                                        showCategoryDropdown ? 'rotate-180 text-emerald-600' : 'text-gray-400'
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Category Dropdown */}
                            {showCategoryDropdown && (
                                <>
                                    {/* Backdrop */}
                                    <div className="fixed inset-0 z-10 bg-black/20" onClick={() => setShowCategoryDropdown(false)} />

                                    <div className="absolute bottom-full z-20 mb-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
                                        {/* Search Input */}
                                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search categories..."
                                                    value={categorySearchTerm}
                                                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                                                    className="w-full rounded-lg border-2 border-emerald-200 bg-white px-4 py-2.5 pl-10 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                                    autoFocus
                                                />
                                                <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Categories List */}
                                        <div className="max-h-72 overflow-y-auto p-2">
                                            <p className="mb-2 px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-600">
                                                {categorySearchTerm.trim() ? `Found ${filteredCategories.length} categories` : 'Available Categories'}
                                            </p>
                                            {filteredCategories.length > 0 ? (
                                                <div className="space-y-1">
                                                    {filteredCategories.map((cat: any) => (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            onClick={() => {
                                                                handleCategorySelect(cat);
                                                                setShowCategoryDropdown(false);
                                                            }}
                                                            className="w-full rounded-lg px-3 py-3 text-left transition-all duration-150 hover:bg-emerald-50 hover:shadow-sm focus:bg-emerald-50 focus:outline-none"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100">
                                                                    {cat.image_url ? (
                                                                        <img
                                                                            src={cat.image_url}
                                                                            alt={cat.name}
                                                                            className="h-full w-full rounded-lg object-cover"
                                                                            onError={(e) => {
                                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                                                            />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-semibold text-gray-900">{cat.name}</p>
                                                                    {cat.description && <p className="mt-0.5 truncate text-sm text-gray-500">{cat.description}</p>}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="px-4 py-8 text-center">
                                                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                                        />
                                                    </svg>
                                                    <p className="mt-2 text-sm font-medium text-gray-500">{categorySearchTerm.trim() ? 'No categories found' : 'No categories available'}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {formData.category_id && (
                            <div className="mt-3 flex items-center gap-2 rounded-lg border-2 border-emerald-200 bg-emerald-50 px-4 py-2">
                                <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="flex-1 text-sm font-medium text-emerald-900">{formData.category_name}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleChange({
                                            target: { name: 'category_id', value: '' },
                                        } as any);
                                        handleChange({
                                            target: { name: 'category_name', value: '' },
                                        } as any);
                                        setCategorySearchTerm('');
                                    }}
                                    className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-emerald-700 transition-colors hover:bg-emerald-300"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Brand Selection */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Brand <span className="text-xs text-gray-400">(Optional)</span>
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                                className={`w-full rounded-lg border px-4 py-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                                    formData.brand_name ? 'border-cyan-300 bg-cyan-50 font-medium text-gray-900' : 'border-gray-300 bg-white text-gray-500'
                                }`}
                            >
                                <span className="block truncate pr-8">{formData.brand_name || 'Select a brand'}</span>
                                <svg
                                    className={`absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transition-transform duration-200 ${
                                        showBrandDropdown ? 'rotate-180 text-cyan-600' : 'text-gray-400'
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Brand Dropdown */}
                            {showBrandDropdown && (
                                <>
                                    {/* Backdrop */}
                                    <div className="fixed inset-0 z-10 bg-black/20" onClick={() => setShowBrandDropdown(false)} />

                                    <div className="absolute bottom-full z-20 mb-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
                                        {/* Search Input */}
                                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search brands..."
                                                    value={brandSearchTerm}
                                                    onChange={(e) => setBrandSearchTerm(e.target.value)}
                                                    className="w-full rounded-lg border-2 border-cyan-200 bg-white px-4 py-2.5 pl-10 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                                                    autoFocus
                                                />
                                                <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Brands List */}
                                        <div className="max-h-72 overflow-y-auto p-2">
                                            <p className="mb-2 px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-600">
                                                {brandSearchTerm.trim() ? `Found ${filteredBrands.length} brands` : 'Available Brands'}
                                            </p>
                                            {filteredBrands.length > 0 ? (
                                                <div className="space-y-1">
                                                    {filteredBrands.map((brand: any) => (
                                                        <button
                                                            key={brand.id}
                                                            type="button"
                                                            onClick={() => {
                                                                handleBrandSelect(brand);
                                                                setShowBrandDropdown(false);
                                                            }}
                                                            className="w-full rounded-lg px-3 py-3 text-left transition-all duration-150 hover:bg-cyan-50 hover:shadow-sm focus:bg-cyan-50 focus:outline-none"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100">
                                                                    {brand.image_url ? (
                                                                        <img
                                                                            src={brand.image_url}
                                                                            alt={brand.name}
                                                                            className="h-full w-full rounded-lg object-cover"
                                                                            onError={(e) => {
                                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <svg className="h-6 w-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-semibold text-gray-900">{brand.name}</p>
                                                                    {brand.description && <p className="mt-0.5 truncate text-sm text-gray-500">{brand.description}</p>}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="px-4 py-8 text-center">
                                                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                                        />
                                                    </svg>
                                                    <p className="mt-2 text-sm font-medium text-gray-500">{brandSearchTerm.trim() ? 'No brands found' : 'No brands available'}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {formData.brand_id && (
                            <div className="mt-3 flex items-center gap-2 rounded-lg border-2 border-cyan-200 bg-cyan-50 px-4 py-2">
                                <svg className="h-5 w-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="flex-1 text-sm font-medium text-cyan-900">{formData.brand_name}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleChange({
                                            target: { name: 'brand_id', value: '' },
                                        } as any);
                                        handleChange({
                                            target: { name: 'brand_name', value: '' },
                                        } as any);
                                        setBrandSearchTerm('');
                                    }}
                                    className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-200 text-cyan-700 transition-colors hover:bg-cyan-300"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Features Selection */}
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6">
                <h4 className="mb-4 text-sm font-semibold text-gray-700">Product Features</h4>
                <p className="mb-4 text-xs text-gray-500">Select which features apply to this product. This will determine which tabs are available.</p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Has Attributes */}
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm">
                        <input
                            type="checkbox"
                            name="has_attributes"
                            checked={formData.has_attributes}
                            onChange={(e) => {
                                handleChange({
                                    target: {
                                        name: 'has_attributes',
                                        value: e.target.checked,
                                    },
                                } as any);
                            }}
                            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                    />
                                </svg>
                                <span className="font-semibold text-gray-900">Has Attributes</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Product has variants like color, size, etc.</p>
                        </div>
                    </label>

                    {/* Has Warranty */}
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:border-green-300 hover:shadow-sm">
                        <input
                            type="checkbox"
                            name="has_warranty"
                            checked={formData.has_warranty}
                            onChange={(e) => {
                                handleChange({
                                    target: {
                                        name: 'has_warranty',
                                        value: e.target.checked,
                                    },
                                } as any);
                            }}
                            className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                                <span className="font-semibold text-gray-900">Has Warranty</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Product includes warranty coverage</p>
                        </div>
                    </label>

                    {/* Has Serial */}
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-sm">
                        <input
                            type="checkbox"
                            name="has_serial"
                            checked={formData.has_serial}
                            onChange={(e) => {
                                handleChange({
                                    target: {
                                        name: 'has_serial',
                                        value: e.target.checked,
                                    },
                                } as any);
                            }}
                            className="mt-1 h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                                    />
                                </svg>
                                <span className="font-semibold text-gray-900">Has Serial Number / IMEI</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Track individual product units by serial /IMEI</p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Navigation Button */}
            <div className="flex justify-end border-t border-gray-200 pt-6">
                <button
                    type="button"
                    onClick={onNext}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-medium text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200"
                >
                    <span>Next</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default BasicInfoTab;
