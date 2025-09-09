'use client';

import { useGetSingleProductQuery, useUpdateProductMutation } from '@/store/Product/productApi';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { ArrowLeft, Loader2, Save, Upload, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ProductUpdatePage = () => {
    const { id: productId } = useParams();
    const router = useRouter();

    // RTK Query hooks
    const { data: pd, isLoading, error } = useGetSingleProductQuery(productId);
    const { data: ct } = useGetCategoryQuery();
    const product = pd || {};
    const categories = ct;
    console.log('product', product);
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

    // Form state
    const [formData, setFormData] = useState({
        product_name: '',
        price: '',
        quantity: '',
        description: '',
        available: 'yes',
        purchase_price: '',
        category_id: '',
    });

    // Image management state
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');

    // Toast notification function
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-0 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    };

    // Navigation handlers
    const handleBackToProducts = () => {
        router.push('/apps/products'); // Adjust this path to your products table route
    };

    const handleUpdateSuccess = (message) => {
        showToast(message, 'success');
        router.push('/apps/products'); // Navigate back to products table
    };

    // Initialize form data when product loads
    useEffect(() => {
        if (product?.data) {
            const productData = product.data;
            console.log('productData', productData);
            setFormData({
                product_name: productData.product_name || '',
                price: productData.price || '',
                quantity: productData.quantity || '',
                description: productData.description || '',
                available: productData.available || 'yes',
                purchase_price: productData.purchase_price || '',
                category_id: productData.category_id || '',
            });

            // Initialize existing images
            if (productData.images) {
                const images = productData.images.map((img) => img.image_path);
                setExistingImages(images);
            }
        }
    }, [product]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle new image selection
    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files);

        // Validate file types and sizes
        const validFiles = files.filter((file) => {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            const maxSize = 2 * 1024 * 1024; // 2MB

            if (!validTypes.includes(file.type)) {
                setSubmitError('Only JPG, JPEG, and PNG files are allowed.');
                return false;
            }

            if (file.size > maxSize) {
                setSubmitError('File size must be less than 2MB.');
                return false;
            }

            return true;
        });

        if (validFiles.length > 0) {
            setNewImages((prev) => [...prev, ...validFiles]);

            // Create preview URLs
            const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
            setPreviewUrls((prev) => [...prev, ...newPreviews]);
            setSubmitError('');
        }
    };

    // Remove existing image
    const removeExistingImage = (imagePath) => {
        setExistingImages((prev) => prev.filter((img) => img !== imagePath));
    };

    // Remove new image
    const removeNewImage = (index) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => {
            // Revoke the URL to prevent memory leaks
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    // Handle form submission
    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setErrors({});
    //     setSubmitError('');

    //     try {
    //         const formDataToSend = new FormData();

    //         // Add form fields
    //         Object.keys(formData).forEach((key) => {
    //             if (formData[key] !== '') {
    //                 formDataToSend.append(key, formData[key]);
    //             }
    //         });

    //         // Add existing images
    //         existingImages.forEach((imagePath, index) => {
    //             formDataToSend.append(`existing_images[${index}]`, imagePath);
    //         });

    //         // Add new images
    //         newImages.forEach((file, index) => {
    //             formDataToSend.append(`new_images[${index}]`, file);
    //         });

    //         // Add method override for Laravel
    //         formDataToSend.append('_method', 'PUT');

    //         const result = await updateProduct({ id: productId, data: formDataToSend }).unwrap();

    //         if (result.success) {
    //             handleUpdateSuccess('Product updated successfully!');
    //         }
    //     } catch (error) {
    //         console.error('Update failed:', error);

    //         if (error.data?.errors) {
    //             setErrors(error.data.errors);
    //         } else {
    //             setSubmitError(error.data?.message || 'Failed to update product. Please try again.');
    //         }
    //     }
    // };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitError('');

        try {
            const formDataToSend = new FormData();

            // Add form fields
            Object.keys(formData).forEach((key) => {
                if (formData[key] !== '') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Add existing images correctly for Laravel
            existingImages.forEach((imagePath) => {
                formDataToSend.append('existing_images[]', imagePath);
            });

            // Add new images correctly for Laravel
            newImages.forEach((file) => {
                formDataToSend.append('new_images[]', file);
            });

            // Add method override for Laravel PUT
            formDataToSend.append('_method', 'PUT');

            formDataToSend.forEach((value, key) => {
                console.log(key, value);
            });
            // Call the updateProduct mutation
            const result = await updateProduct({ id: productId, data: formDataToSend }).unwrap();

            if (result.success) {
                showToast('Product updated successfully!', 'success');
                router.push('/apps/products');
            }
        } catch (error) {
            console.error('Update failed:', error);

            if (error.data?.errors) {
                setErrors(error.data.errors);
            } else {
                setSubmitError(error.data?.message || 'Failed to update product. Please try again.');
            }
        }
    };

    // Cleanup preview URLs on unmount
    useEffect(() => {
        return () => {
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading product...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto mt-8 max-w-2xl p-6">
                <div className="rounded-md border border-red-200 bg-red-50 p-4">
                    <p className="text-red-800">Error loading product: {error.message}</p>
                    <button onClick={handleBackToProducts} className="mt-2 text-blue-600 hover:text-blue-700">
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl p-6">
            {/* Header */}
            <div className="mb-6">
                <button onClick={handleBackToProducts} className="mb-4 flex items-center text-gray-600 hover:text-gray-800">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Products
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Update Product</h1>
                <p className="text-gray-600">Edit product details and images</p>
            </div>

            {/* Error Message */}
            {submitError && (
                <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
                    <p className="text-red-800">{submitError}</p>
                </div>
            )}

            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Product Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Product Name</label>
                        <input
                            type="text"
                            name="product_name"
                            value={formData.product_name}
                            onChange={handleInputChange}
                            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.product_name ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter product name"
                        />
                        {errors.product_name && <p className="mt-1 text-sm text-red-500">{errors.product_name[0]}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category_id ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            <option value="">Select category</option>
                            {categories?.data?.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id[0]}</p>}
                    </div>

                    {/* Price */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Selling Price</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="0.00"
                        />
                        {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price[0]}</p>}
                    </div>

                    {/* Purchase Price */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Purchase Price</label>
                        <input
                            type="number"
                            name="purchase_price"
                            value={formData.purchase_price}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.purchase_price ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="0.00"
                        />
                        {errors.purchase_price && <p className="mt-1 text-sm text-red-500">{errors.purchase_price[0]}</p>}
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            min="0"
                            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="0"
                        />
                        {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity[0]}</p>}
                    </div>

                    {/* Availability */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Availability</label>
                        <select
                            name="available"
                            value={formData.available}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="yes">Available</option>
                            <option value="no">Not Available</option>
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter product description"
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description[0]}</p>}
                </div>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Current Images</label>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {existingImages.map((imagePath, index) => (
                                <div key={index} className="relative">
                                    <img src={`${process.env.NEXT_PUBLIC_BASE_PATH}${imagePath}`} alt={`Product image ${index + 1}`} className="h-24 w-full rounded-md border object-cover" />
                                    <button type="button" onClick={() => removeExistingImage(imagePath)} className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Images */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Add New Images</label>
                    <div className="rounded-md border-2 border-dashed border-gray-300 p-6">
                        <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4">
                                <label htmlFor="new_images" className="cursor-pointer">
                                    <span className="mt-2 block text-sm font-medium text-gray-900">Click to upload new images</span>
                                    <span className="mt-1 block text-xs text-gray-500">PNG, JPG, JPEG up to 2MB each</span>
                                </label>
                                <input id="new_images" name="new_images" type="file" multiple accept="image/jpeg,image/jpg,image/png" onChange={handleNewImageChange} className="hidden" />
                            </div>
                        </div>
                    </div>

                    {/* New Image Previews */}
                    {previewUrls.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative">
                                    <img src={url} alt={`New image ${index + 1}`} className="h-24 w-full rounded-md border object-cover" />
                                    <button type="button" onClick={() => removeNewImage(index)} className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {errors.new_images && <p className="mt-1 text-sm text-red-500">{errors.new_images[0]}</p>}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isUpdating}
                        className="flex items-center rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isUpdating ? 'Updating...' : 'Update Product'}
                    </button>

                    <button
                        type="button"
                        onClick={handleBackToProducts}
                        className="rounded-md border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductUpdatePage;
