'use client';

import PanelCodeHighlight from '@/components/panel-code-highlight';
import { useGetCategoriesQuery } from '@/store/features/category/categoryApi';
import { useGetSuppliersQuery } from '@/store/features/supplier/supplierApi';
import { useCreateProductMutation } from '@/store/Product/productApi';
import React, { useState } from 'react';

const ComponentsFormsLayoutsGrid = () => {
    const { data: categories, isLoading: catLoading } = useGetCategoriesQuery();
    const { data: suppliers, isLoading: supLoading } = useGetSuppliersQuery();
    const [createProduct, { isLoading: createLoading }] = useCreateProductMutation();
    // Local State
    const [formData, setFormData] = useState({
        category_id: '',
        supplier_id: '',
        product_name: '',
        description: '',
        price: '',
        available: 'yes',
        quantity: '',
        purchase_price: '',
    });

    // Handle Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('Form Data:', formData);
            const result = await createProduct({
                ...formData,
                category_id: Number(formData.category_id),
                supplier_id: Number(formData.supplier_id),
                price: Number(formData.price),
                quantity: Number(formData.quantity),
                purchase_price: Number(formData.purchase_price),
            }).unwrap();
            console.log('Create product result:', result);
            //   alert("Product created successfully!");
            setFormData({
                category_id: '',
                supplier_id: '',
                product_name: '',
                description: '',
                price: '',
                available: 'yes',
                quantity: '',
                purchase_price: '',
            });
        } catch (error) {
            console.error('Create product failed', error);
            //   alert("Something went wrong!");
        }
    };

    return (
        <PanelCodeHighlight>
            <div className="mb-5">
                <form className="space-y-5" onSubmit={handleSubmit}>
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
                        <input
                            id="purchase_price"
                            name="purchase_price"
                            type="number"
                            value={formData.purchase_price}
                            onChange={handleChange}
                            placeholder="Enter Purchase Price"
                            className="form-input"
                        />
                    </div>

                    {/* Category Select */}
                    <div>
                        <label htmlFor="category_id">Category</label>
                        <select id="category_id" name="category_id" value={formData.category_id} onChange={handleChange} className="form-select text-white-dark">
                            <option value="">Select Category</option>
                            {catLoading ? (
                                <option>Loading...</option>
                            ) : (
                                categories?.data?.map((cat: any) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Supplier Select */}
                    <div>
                        <label htmlFor="supplier_id">Supplier</label>
                        <select id="supplier_id" name="supplier_id" value={formData.supplier_id} onChange={handleChange} className="form-select text-white-dark">
                            <option value="">Select Supplier</option>
                            {supLoading ? (
                                <option>Loading...</option>
                            ) : (
                                suppliers?.data?.map((sup: any) => (
                                    <option key={sup.id} value={sup.id}>
                                        {sup.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={createLoading} className="btn btn-primary !mt-6">
                        {createLoading ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>
        </PanelCodeHighlight>
    );
};

export default ComponentsFormsLayoutsGrid;
