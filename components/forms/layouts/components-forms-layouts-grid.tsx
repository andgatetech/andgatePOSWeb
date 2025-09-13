'use client';

import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { useCreateProductMutation, useGetUnitsQuery } from '@/store/Product/productApi';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const EnhancedProductForm = () => {
    const maxNumber = 10;
    const [images, setImages] = useState<any>([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const router = useRouter();

    const { data: ct, isLoading: catLoading } = useGetCategoryQuery();
    const categories = ct?.data || [];
    const [createProduct, { isLoading: createLoading }] = useCreateProductMutation();
    const { data: unitsResponse, isLoading: unitsLoading } = useGetUnitsQuery();
    const units = unitsResponse?.data || [];

    const [formData, setFormData] = useState({
        category_id: '',
        category_name: '',
        product_name: '',
        description: '',
        price: '',
        available: 'yes',
        quantity: '',
        low_stock_quantity: '',
        purchase_price: '',
        sku: '',
        skuOption: 'auto',
        unit: '',
        tax_rate: '',
        tax_included: false,
    });

    // Get recent 5 categories for dropdown
    const recentCategories = categories.slice(0, 5);

    const onChange2 = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCategorySelect = (category: any) => {
        setFormData((prev) => ({
            ...prev,
            category_id: category.id.toString(),
            category_name: category.name,
        }));
        setShowCategoryDropdown(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.category_id) {
            toast.error('Please select a Category!');
            return;
        }
        if (!formData.product_name.trim()) {
            toast.error('Please enter Product Name!');
            return;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            toast.error('Please enter valid Price!');
            return;
        }
        if (!formData.quantity || parseFloat(formData.quantity) < 0) {
            toast.error('Please enter valid Quantity!');
            return;
        }
        if (!formData.purchase_price || parseFloat(formData.purchase_price) <= 0) {
            toast.error('Please enter valid Purchase Price!');
            return;
        }

        // Additional validations
        if (formData.low_stock_quantity && parseFloat(formData.low_stock_quantity) < 0) {
            toast.error('Low stock quantity cannot be negative!');
            return;
        }

        if (formData.tax_rate && (parseFloat(formData.tax_rate) < 0 || parseFloat(formData.tax_rate) > 100)) {
            toast.error('Tax rate must be between 0 and 100!');
            return;
        }

        try {
            const fd = new FormData();
            fd.append('category_id', formData.category_id);
            fd.append('product_name', formData.product_name.trim());
            fd.append('description', formData.description.trim());
            fd.append('price', String(formData.price));
            fd.append('quantity', String(formData.quantity));
            fd.append('purchase_price', String(formData.purchase_price));
            fd.append('available', formData.available);

            // Add low stock quantity
            if (formData.low_stock_quantity) {
                fd.append('low_stock_quantity', String(formData.low_stock_quantity));
            }

            // Add unit field
            if (formData.unit) {
                fd.append('unit', formData.unit);
            }

            // Add tax fields
            if (formData.tax_rate) {
                fd.append('tax_rate', String(formData.tax_rate));
            }
            fd.append('tax_included', String(formData.tax_included));

            // Add SKU if manual
            if (formData.skuOption === 'manual' && formData.sku.trim()) {
                fd.append('sku', formData.sku.trim());
            }

            // Validate and add images
            if (images && images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const img = images[i];
                    const validMimes = ['image/jpeg', 'image/png', 'image/jpg'];

                    if (!validMimes.includes(img.file.type)) {
                        toast.error(`Image ${i + 1}: Only JPG and PNG images are allowed!`);
                        return;
                    }

                    if (img.file.size > 2 * 1024 * 1024) {
                        toast.error(`Image ${i + 1}: File size must be less than 2MB!`);
                        return;
                    }

                    fd.append('images[]', img.file as File);
                }
            }

            const result = await createProduct(fd).unwrap();

            // Reset form
            setFormData({
                category_id: '',
                category_name: '',
                product_name: '',
                description: '',
                price: '',
                available: 'yes',
                quantity: '',
                low_stock_quantity: '',
                purchase_price: '',
                sku: '',
                skuOption: 'auto',
                unit: '',
                tax_rate: '',
                tax_included: false,
            });
            setImages([]);

            // Success modal
            await Swal.fire({
                title: 'Success!',
                text: 'Product has been created successfully',
                icon: 'success',
                confirmButtonText: 'Go to Products',
                confirmButtonColor: '#10b981',
                showCancelButton: true,
                cancelButtonText: 'Create Another',
                cancelButtonColor: '#6b7280',
                background: '#ffffff',
                color: '#374151',
                customClass: {
                    popup: 'rounded-xl shadow-2xl',
                    title: 'text-xl font-semibold',
                    confirmButton: 'rounded-lg px-4 py-2 font-medium',
                    cancelButton: 'rounded-lg px-4 py-2 font-medium',
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push('/apps/products');
                }
            });
        } catch (error: any) {
            console.error('Create product failed', error);

            const errorMessage = error?.data?.message || 'Something went wrong while creating the product';

            await Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Try Again',
                confirmButtonColor: '#ef4444',
                background: '#ffffff',
                color: '#374151',
                customClass: {
                    popup: 'rounded-xl shadow-2xl',
                    title: 'text-xl font-semibold',
                    confirmButton: 'rounded-lg px-4 py-2 font-medium',
                },
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="mx-auto ">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Create New Product</h1>
                    <p className="text-gray-600">Add a new product to your inventory</p>
                </div>

                {/* Main Form Card */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">Product Information</h2>
                    </div>

                    <div className="p-8">
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {/* Basic Information Section */}
                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Basic Information</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Product Name */}
                                    <div className="md:col-span-2">
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
                                    <div className="md:col-span-2">
                                        <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Enter product description"
                                            rows={3}
                                            maxLength={1000}
                                            className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="mt-1 text-sm text-gray-500">{formData.description.length}/1000 characters</p>
                                    </div>

                                    {/* Category Selection */}
                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-left transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                                            >
                                                {formData.category_name || 'Select a category'}
                                                <svg className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {/* Category Dropdown */}
                                            {showCategoryDropdown && (
                                                <div className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                                    <div className="p-2">
                                                        <p className="mb-2 px-3 py-1 text-xs font-semibold uppercase text-gray-500">Recent Categories</p>
                                                        {recentCategories.length > 0 ? (
                                                            recentCategories.map((cat: any) => (
                                                                <button
                                                                    key={cat.id}
                                                                    type="button"
                                                                    onClick={() => handleCategorySelect(cat)}
                                                                    className="w-full rounded-lg border border-transparent px-3 py-3 text-left transition-colors duration-150 hover:border-blue-200 hover:bg-blue-50 focus:border-blue-200 focus:bg-blue-50"
                                                                >
                                                                    <div className="flex items-center space-x-3">
                                                                        {cat.image_url && (
                                                                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                                                                                <img
                                                                                    src={cat.image_url}
                                                                                    alt={cat.name}
                                                                                    className="h-full w-full object-cover"
                                                                                    onError={(e) => {
                                                                                        (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="font-medium text-gray-900">{cat.name}</p>
                                                                            {cat.description && <p className="truncate text-sm text-gray-500">{cat.description}</p>}
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <p className="px-3 py-2 text-sm text-gray-500">No categories available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {formData.category_id && (
                                            <div className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                                                <span>Selected: {formData.category_name}</span>
                                                <button type="button" onClick={() => setFormData((prev) => ({ ...prev, category_id: '', category_name: '' }))} className="ml-2 hover:text-blue-600">
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Stock Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Pricing & Stock</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {/* Selling Price */}
                                    <div>
                                        <label htmlFor="price" className="mb-2 block text-sm font-medium text-gray-700">
                                            Selling Price <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-gray-500">৳</span>
                                            <input
                                                id="price"
                                                name="price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.price}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-8 pr-4 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Purchase Price */}
                                    <div>
                                        <label htmlFor="purchase_price" className="mb-2 block text-sm font-medium text-gray-700">
                                            Purchase Price <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-gray-500">৳</span>
                                            <input
                                                id="purchase_price"
                                                name="purchase_price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.purchase_price}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-8 pr-4 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
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
                                            Low Stock Alert Quantity
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
                                        <p className="mt-1 text-sm text-gray-500">Get alerted when stock reaches this level</p>
                                    </div>

                                    {/* Unit */}
                                    <div>
                                        <label htmlFor="unit" className="mb-2 block text-sm font-medium text-gray-700">
                                            Unit
                                        </label>
                                        <select
                                            id="unit"
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Unit</option>
                                            <option value="piece">Piece</option>
                                            {units.map((unit: any) => (
                                                <option key={unit.id} value={unit.name}>
                                                    {unit.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Available Status */}
                                    <div>
                                        <label htmlFor="available" className="mb-2 block text-sm font-medium text-gray-700">
                                            Availability Status
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

                                {/* Profit Margin Display */}
                                {formData.price && formData.purchase_price && (
                                    <div className="mt-4 rounded-lg bg-green-50 p-3">
                                        <p className="text-sm text-green-700">
                                            <span className="font-medium">Profit Margin: </span>
                                            {(((parseFloat(formData.price) - parseFloat(formData.purchase_price)) / parseFloat(formData.price)) * 100).toFixed(2)}%
                                            <span className="ml-2">(৳{(parseFloat(formData.price) - parseFloat(formData.purchase_price)).toFixed(2)} profit per unit)</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Tax Information Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Tax Information</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Tax Rate */}
                                    <div>
                                        <label htmlFor="tax_rate" className="mb-2 block text-sm font-medium text-gray-700">
                                            Tax Rate (%)
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="tax_rate"
                                                name="tax_rate"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={formData.tax_rate}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 pr-8 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-medium text-gray-500">%</span>
                                        </div>
                                    </div>

                                    {/* Tax Included */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Tax Inclusion</label>
                                        <div className="flex items-center space-x-6 pt-3">
                                            <label className="flex cursor-pointer items-center">
                                                <input
                                                    type="radio"
                                                    name="tax_included"
                                                    value="false"
                                                    checked={!formData.tax_included}
                                                    onChange={() => setFormData((prev) => ({ ...prev, tax_included: false }))}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Tax Exclusive</span>
                                            </label>
                                            <label className="flex cursor-pointer items-center">
                                                <input
                                                    type="radio"
                                                    name="tax_included"
                                                    value="true"
                                                    checked={formData.tax_included}
                                                    onChange={() => setFormData((prev) => ({ ...prev, tax_included: true }))}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Tax Inclusive</span>
                                            </label>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500">{formData.tax_included ? 'Price includes tax amount' : 'Tax will be added to the price'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* SKU Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">SKU Management</h3>

                                <div className="mb-4 flex items-center gap-6">
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="radio"
                                            name="skuOption"
                                            value="auto"
                                            checked={formData.skuOption === 'auto'}
                                            onChange={() => setFormData((prev) => ({ ...prev, skuOption: 'auto', sku: '' }))}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Auto-generate</span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="radio"
                                            name="skuOption"
                                            value="manual"
                                            checked={formData.skuOption === 'manual'}
                                            onChange={() => setFormData((prev) => ({ ...prev, skuOption: 'manual', sku: '' }))}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Manual input</span>
                                    </label>
                                </div>

                                <input
                                    id="sku"
                                    name="sku"
                                    type="text"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    placeholder={formData.skuOption === 'manual' ? 'Enter SKU code' : 'Will be generated automatically'}
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                                    disabled={formData.skuOption === 'auto'}
                                    maxLength={100}
                                />
                            </div>

                            {/* Image Upload Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Product Images</h3>

                                <ImageUploading multiple value={images} onChange={onChange2} maxNumber={maxNumber}>
                                    {({ imageList, onImageUpload, onImageRemove, onImageUpdate }) => (
                                        <div className="space-y-4">
                                            <div className="flex w-full items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={onImageUpload}
                                                    className="group flex h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition-colors duration-200 hover:bg-gray-50"
                                                >
                                                    <div className="flex flex-col items-center justify-center">
                                                        <svg className="mb-2 h-8 w-8 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                            />
                                                        </svg>
                                                        <p className="text-sm text-gray-600 group-hover:text-gray-800">
                                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500">PNG, JPG up to 2MB (Max {maxNumber} images)</p>
                                                    </div>
                                                </button>
                                            </div>

                                            {imageList.length > 0 && (
                                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                                    {imageList.map((image, index) => (
                                                        <div key={index} className="group relative">
                                                            <div className="aspect-square overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100">
                                                                <img
                                                                    src={image.dataURL}
                                                                    alt={`Product ${index + 1}`}
                                                                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                                />
                                                            </div>

                                                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => onImageUpdate(index)}
                                                                        className="rounded-lg bg-blue-600 p-2 text-white transition-colors duration-150 hover:bg-blue-700"
                                                                        title="Update image"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => onImageRemove(index)}
                                                                        className="rounded-lg bg-red-600 p-2 text-white transition-colors duration-150 hover:bg-red-700"
                                                                        title="Remove image"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="absolute left-2 top-2 rounded-full bg-black bg-opacity-70 px-2 py-1 text-xs text-white">{index + 1}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </ImageUploading>
                            </div>

                            {/* Submit Button */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => router.push('/apps/products')}
                                        className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-medium text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {createLoading ? (
                                            <>
                                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Create Product
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Tips Card */}
                <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="mb-1 font-medium">Product Creation Tips:</p>
                            <ul className="space-y-1 text-blue-700">
                                <li>• Use high-quality images for better product presentation</li>
                                <li>• Set competitive pricing based on your purchase price and market research</li>
                                <li>• Write clear, detailed descriptions to help customers understand your product</li>
                                <li>• Set low stock alerts to avoid running out of popular items</li>
                                <li>• Choose appropriate units for accurate inventory tracking</li>
                                <li>• Configure tax settings according to your business requirements</li>
                            </ul>
                        </div>
                    </div>
                </div>

                
            </div>
        </div>
    );
};

export default EnhancedProductForm;
