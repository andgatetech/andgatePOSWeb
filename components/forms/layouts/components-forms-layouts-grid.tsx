'use client';

import PanelCodeHighlight from '@/components/panel-code-highlight';
import { useGetCategoriesQuery } from '@/store/features/category/categoryApi';
import { useGetAllStoreAdminStoresQuery } from '@/store/features/store/storeApi';
import { useGetSuppliersQuery } from '@/store/features/supplier/supplierApi';
import { useCreateProductMutation } from '@/store/Product/productApi';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const ComponentsFormsLayoutsGrid = () => {
    const router = useRouter();
    const { data: ct, isLoading: catLoading } = useGetCategoriesQuery();
    const { data: sp, isLoading: supLoading } = useGetSuppliersQuery();
    // const { data: st, isLoading: storeLoading } = useGetAllStoreAdminStoresQuery();
    const suppliers = sp?.data || [];
    const categories = ct?.data || [];
    // const stores = st?.data || [];
    const [createProduct, { isLoading: createLoading }] = useCreateProductMutation();

    const [formData, setFormData] = useState({
        category_id: '',
        product_name: '',
        description: '',
        price: '',
        available: 'yes',
        quantity: '',
        purchase_price: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.category_id) {
            toast.error('Please select Category!');
            return;
        }

        try {
            const result = await createProduct({
                ...formData,
                category_id: Number(formData.category_id),
                price: Number(formData.price),
                quantity: Number(formData.quantity),
                purchase_price: Number(formData.purchase_price),
            }).unwrap();

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

                {/* Store Searchable Dropdown
                <div className="relative">
                    <label htmlFor="store_id">Store</label>
                    <input
                        id="store_id"
                        type="text"
                        value={formData.store_name || ''}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                store_name: e.target.value,
                                store_id: '',
                            }))
                        }
                        placeholder="Search Store..."
                        className="form-input w-full"
                        autoComplete="off"
                    />
                    {stores?.length > 0 && formData.store_name && !formData.store_id && (
                        <ul className="absolute z-10 max-h-40 w-full overflow-y-auto border bg-white shadow-lg">
                            {stores
                                .filter((store: any) => store.name.toLowerCase().includes(formData.store_name.toLowerCase()))
                                .map((store: any) => (
                                    <li
                                        key={store.id}
                                        className="cursor-pointer p-2 hover:bg-gray-200"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                store_name: store.name,
                                                store_id: store.id,
                                            }))
                                        }
                                    >
                                        {store.name}
                                    </li>
                                ))}
                        </ul>
                    )}
                </div> */}

                {/* Supplier Searchable Dropdown */}
                {/* <div className="relative">
                    <label htmlFor="supplier_id">Supplier</label>
                    <input
                        id="supplier_id"
                        type="text"
                        value={formData.supplier_name || ''}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                supplier_name: e.target.value,
                                supplier_id: '',
                            }))
                        }
                        placeholder="Search Supplier..."
                        className="form-input w-full"
                        autoComplete="off"
                    />
                    {suppliers?.length > 0 && formData.supplier_name && !formData.supplier_id && (
                        <ul className="absolute z-10 max-h-40 w-full overflow-y-auto border bg-white shadow-lg">
                            {suppliers
                                .filter((sup: any) => sup.name.toLowerCase().includes(formData.supplier_name.toLowerCase()))
                                .map((sup: any) => (
                                    <li
                                        key={sup.id}
                                        className="cursor-pointer p-2 hover:bg-gray-200"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                supplier_name: sup.name,
                                                supplier_id: sup.id,
                                            }))
                                        }
                                    >
                                        {sup.name}
                                    </li>
                                ))}
                        </ul>
                    )}
                </div> */}

                <button type="submit" disabled={createLoading} className="btn btn-primary !mt-6">
                    {createLoading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </PanelCodeHighlight>
    );
};

export default ComponentsFormsLayoutsGrid;
