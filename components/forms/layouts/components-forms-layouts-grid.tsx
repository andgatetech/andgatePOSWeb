'use client';

import PanelCodeHighlight from '@/components/panel-code-highlight';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { useCreateProductMutation } from '@/store/Product/productApi';
// import 'file-upload-with-preview/dist/file-upload-with-preview.min.css';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { toast } from 'react-toastify';

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
        product_name: '',
        description: '',
        price: '',
        available: 'yes',
        quantity: '',
        purchase_price: '',
        sku: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
            // ✅ FormData বানাও
            const fd = new FormData();
            fd.append('category_id', formData.category_id);
            fd.append('product_name', formData.product_name);
            fd.append('description', formData.description);
            fd.append('price', String(formData.price));
            fd.append('quantity', String(formData.quantity));
            fd.append('purchase_price', String(formData.purchase_price));
            fd.append('available', formData.available);

            if (formData.sku) {
                fd.append('sku', formData.sku); // manual input
            }

            // Log FormData
            for (let [key, value] of fd.entries()) {
                console.log(`${key}: ${value}`);
            }

            // ✅ multiple images handle করো
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

            // ✅ RTK mutation call
            const result = await createProduct(fd).unwrap();

            // reset form
            setFormData({
                category_id: '',
                product_name: '',
                description: '',
                price: '',
                available: 'yes',
                quantity: '',
                purchase_price: '',
            });

            toast.success('Product created successfully!');
            router.push('/apps/products');
        } catch (error) {
            console.error('Create product failed', error);
            toast.error('Something went wrong!');
        }
    };

    return (
        <PanelCodeHighlight>
            <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Product Name */}
                <div>
                    <label htmlFor="product_name">Product Name</label>
                    <input id="product_name" name="product_name" type="text" value={formData.product_name} onChange={handleChange} placeholder="Enter Product Name" className="form-input" />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description">Description</label>
                    <input id="description" name="description" type="text" value={formData.description} onChange={handleChange} placeholder="Enter Description" className="form-input" />
                </div>

                {/* Price */}
                <div>
                    <label htmlFor="price">Price</label>
                    <input id="price" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Enter Price" className="form-input" />
                </div>

                {/* Available */}
                <div>
                    <label htmlFor="available">Available</label>
                    <select id="available" name="available" value={formData.available} onChange={handleChange} className="form-select text-white-dark">
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>

                {/* Quantity */}
                <div>
                    <label htmlFor="quantity">Quantity</label>
                    <input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder="Enter Quantity" className="form-input" />
                </div>

                {/* Purchase Price */}
                <div>
                    <label htmlFor="purchase_price">Purchase Price</label>
                    <input id="purchase_price" name="purchase_price" type="number" value={formData.purchase_price} onChange={handleChange} placeholder="Enter Purchase Price" className="form-input" />
                </div>

                {/* Category Searchable Dropdown */}
                <div className="relative">
                    <label htmlFor="category_id">Category</label>
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
                        placeholder="Search Category..."
                        className="form-input w-full"
                        autoComplete="off"
                    />
                    {categories?.length > 0 && formData.category_name && !formData.category_id && (
                        <ul className="absolute z-10 max-h-40 w-full overflow-y-auto border bg-white shadow-lg">
                            {categories
                                .filter((cat: any) => cat.name.toLowerCase().includes(formData.category_name.toLowerCase()))
                                .map((cat: any) => (
                                    <li
                                        key={cat.id}
                                        className="cursor-pointer p-2 hover:bg-gray-200"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                category_name: cat.name,
                                                category_id: cat.id,
                                            }))
                                        }
                                    >
                                        {cat.name}
                                    </li>
                                ))}
                        </ul>
                    )}
                </div>
                {/* SKU Input + Radio */}
                <div>
                    <label>SKU</label>
                    <div className="mb-2 flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="skuOption"
                                value="manual"
                                checked={formData.skuOption === 'manual'}
                                onChange={() => setFormData((prev) => ({ ...prev, skuOption: 'manual', sku: '' }))}
                            />
                            Input SKU
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="skuOption"
                                value="auto"
                                checked={formData.skuOption === 'auto'}
                                onChange={() => setFormData((prev) => ({ ...prev, skuOption: 'auto', sku: '' }))}
                            />
                            Auto-generate SKU
                        </label>
                    </div>

                    <input
                        id="sku"
                        name="sku"
                        type="text"
                        value={formData.sku}
                        onChange={handleChange}
                        placeholder={formData.skuOption === 'manual' ? 'Enter SKU' : 'Will be generated automatically'}
                        className="form-input"
                        disabled={formData.skuOption === 'auto'}
                    />
                    <p className="mt-1 text-sm text-gray-500">{formData.skuOption === 'auto' ? 'SKU will be auto-generated by system.' : 'Enter SKU manually.'}</p>
                </div>

                {/* Image Upload */}
                <div>
                    <label>Upload Images</label>
                    <ImageUploading multiple value={images} onChange={onChange2} maxNumber={10}>
                        {({ imageList, onImageUpload, onImageRemove, onImageUpdate }) => (
                            <div className="upload__image-wrapper">
                                <button type="button" onClick={onImageUpload} className="btn btn-secondary mb-3">
                                    Choose File...
                                </button>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    {imageList.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img src={image.dataURL} alt="img" className="!max-h-48 w-full rounded object-cover shadow" />
                                            <button type="button" className="absolute right-1 top-1 rounded-full bg-red-500 px-2 py-1 text-white" onClick={() => onImageRemove(index)}>
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </ImageUploading>
                </div>

                <button type="submit" disabled={createLoading} className="btn btn-primary !mt-6">
                    {createLoading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </PanelCodeHighlight>
    );
};

export default ComponentsFormsLayoutsGrid;
