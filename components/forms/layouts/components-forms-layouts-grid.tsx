'use client';

import PanelCodeHighlight from '@/components/panel-code-highlight';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { useCreateProductMutation } from '@/store/Product/productApi';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const ComponentsFormsLayoutsGrid = () => {
    const maxNumber = 69;
    const [images, setImages] = useState<any>([]);
    const router = useRouter();
    const { data: ct, isLoading: catLoading } = useGetCategoryQuery();
    const categories = ct?.data || [];
    const [createProduct, { isLoading: createLoading }] = useCreateProductMutation();

    const onChange2 = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]);
    };

    const [formData, setFormData] = useState({
        category_id: '',
        category_name: '',
        product_name: '',
        description: '',
        price: '',
        available: 'yes',
        quantity: '',
        purchase_price: '',
        sku: '',
        skuOption: 'auto',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.category_id) {
            toast.error('Please select a Category!');
            return;
        }
        if (!formData.product_name) {
            toast.error('Please enter Product Name!');
            return;
        }
        if (!formData.price) {
            toast.error('Please enter Price!');
            return;
        }
        if (!formData.quantity) {
            toast.error('Please enter Quantity!');
            return;
        }
        if (!formData.purchase_price) {
            toast.error('Please enter Purchase Price!');
            return;
        }

        try {
            const fd = new FormData();
            fd.append('category_id', formData.category_id);
            fd.append('product_name', formData.product_name);
            fd.append('description', formData.description);
            fd.append('price', String(formData.price));
            fd.append('quantity', String(formData.quantity));
            fd.append('purchase_price', String(formData.purchase_price));
            fd.append('available', formData.available);

            if (formData.sku) {
                fd.append('sku', formData.sku);
            }

            if (images && images.length > 0) {
                images.forEach((img) => {
                    const validMimes = ['image/jpeg', 'image/png', 'image/jpg'];
                    if (!validMimes.includes(img.file.type)) {
                        toast.error('Only JPG and PNG images are allowed!');
                        return;
                    }
                    if (img.file.size > 2 * 1024 * 1024) {
                        toast.error('Image size must be less than 2MB!');
                        return;
                    }
                    fd.append('images[]', img.file as File);
                });
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
                purchase_price: '',
                sku: '',
                skuOption: 'auto',
            });
            setImages([]);

            // Show success modal with SweetAlert2
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
        } catch (error) {
            console.error('Create product failed', error);

            // Show error modal with SweetAlert2
            await Swal.fire({
                title: 'Error!',
                text: 'Something went wrong while creating the product',
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
            <div className="">
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
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Basic Information Section */}
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
                                        className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label htmlFor="price" className="mb-2 block text-sm font-medium text-gray-700">
                                        Selling Price <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 transform font-medium text-gray-500">$</span>
                                        <input
                                            id="price"
                                            name="price"
                                            type="number"
                                            step="0.01"
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
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 transform font-medium text-gray-500">$</span>
                                        <input
                                            id="purchase_price"
                                            name="purchase_price"
                                            type="number"
                                            step="0.01"
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
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        placeholder="Enter quantity"
                                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                                    />
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
                                        <option value="yes">✅ Available</option>
                                        <option value="no">❌ Out of Stock</option>
                                    </select>
                                </div>
                            </div>

                            {/* Category Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Category & SKU</h3>

                                {/* Category Searchable Dropdown */}
                                <div className="relative mb-6">
                                    <label htmlFor="category_id" className="mb-2 block text-sm font-medium text-gray-700">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="category_id"
                                            type="text"
                                            value={formData.category_name || ''}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    category_name: e.target.value,
                                                    category_id: '',
                                                }))
                                            }
                                            placeholder="Search and select category..."
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                                            autoComplete="off"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {categories?.length > 0 && formData.category_name && !formData.category_id && (
                                        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                            {categories
                                                .filter((cat: any) => cat.name.toLowerCase().includes(formData.category_name.toLowerCase()))
                                                .map((cat: any) => (
                                                    <li
                                                        key={cat.id}
                                                        className="cursor-pointer border-b border-gray-100 px-4 py-3 transition-colors duration-150 last:border-b-0 hover:bg-blue-50"
                                                        onClick={() =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                category_name: cat.name,
                                                                category_id: cat.id,
                                                            }))
                                                        }
                                                    >
                                                        <div className="font-medium text-gray-900">{cat.name}</div>
                                                    </li>
                                                ))}
                                        </ul>
                                    )}

                                    {/* Selected Category Display */}
                                    {formData.category_id && (
                                        <div className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                                            <span>Selected: {formData.category_name}</span>
                                            <button type="button" onClick={() => setFormData((prev) => ({ ...prev, category_id: '', category_name: '' }))} className="ml-2 hover:text-blue-600">
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* SKU Section */}
                                <div>
                                    <label className="mb-3 block text-sm font-medium text-gray-700">SKU Management</label>

                                    {/* SKU Radio Options */}
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

                                    {/* SKU Input */}
                                    <input
                                        id="sku"
                                        name="sku"
                                        type="text"
                                        value={formData.sku}
                                        onChange={handleChange}
                                        placeholder={formData.skuOption === 'manual' ? 'Enter SKU code' : 'Will be generated automatically'}
                                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                                        disabled={formData.skuOption === 'auto'}
                                    />
                                    <p className="mt-2 text-sm text-gray-500">
                                        {formData.skuOption === 'auto' ? '🤖 SKU will be automatically generated by the system' : '✏️ Enter a unique SKU code for this product'}
                                    </p>
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Product Images</h3>

                                <ImageUploading multiple value={images} onChange={onChange2} maxNumber={10}>
                                    {({ imageList, onImageUpload, onImageRemove, onImageUpdate }) => (
                                        <div className="space-y-4">
                                            {/* Upload Button */}
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
                                                        <p className="text-xs text-gray-500">PNG, JPG up to 2MB (Max 10 images)</p>
                                                    </div>
                                                </button>
                                            </div>

                                            {/* Image Preview Grid */}
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

                                                            {/* Image Actions */}
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

                                                            {/* Image Counter */}
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

                {/* Additional Info Card */}
                <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="mb-1 font-medium">Quick Tips:</p>
                            <ul className="space-y-1 text-blue-700">
                                <li>• Use high-quality images for better product presentation</li>
                                <li>• Set competitive pricing based on your purchase price</li>
                                <li>• Write clear, detailed descriptions to attract customers</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComponentsFormsLayoutsGrid;
