'use client';

import { useGetSingleProductQuery, useUpdateProductMutation } from '@/store/Product/productApi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Props {
    params: { id: string };
}

export default function UpdateProductPage({ params }: Props) {
    const router = useRouter();
    const { id } = params;
    const { data, isLoading } = useGetSingleProductQuery(id); // fetch single product
    const product = data?.data;
    console.log('Product data:', product);
    const [updateProduct] = useUpdateProductMutation();

    const [formData, setFormData] = useState({
        product_name: '',
        description: '',
        quantity: product?.quantity,
        price: product?.price,
        available: 'no', // default unchecked
        purchase_price: product?.purchase_price,
    });

    useEffect(() => {
        if (product) {
            setFormData({
                product_name: product.product_name,
                description: product.description,
                quantity: product.quantity || 0,
                price: Number(product.price),
                available: product.available === 'yes' && product.quantity > 0 ? 'yes' : 'no',
                purchase_price: Number(product.purchase_price),
            });
        }
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target;

        if (name === 'available') {
            // checkbox logic
            setFormData((prev) => ({
                ...prev,
                available: checked ? 'yes' : 'no',
            }));
        } else if (name === 'quantity') {
            const quantityValue = Number(value);
            setFormData((prev) => ({
                ...prev,
                quantity: quantityValue,
                // auto uncheck available if quantity 0
                available: quantityValue > 0 ? prev.available : 'no',
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === 'number' ? Number(value) : value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProduct({ id, ...formData }).unwrap();
            router.push('/apps/products'); // redirect to product list after update
        } catch (error) {
            console.error('Failed to update product:', error);
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="panel mt-6">
            <h1 className="mb-5 text-lg font-semibold">Update Product #{id}</h1>
            <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                <div>
                    <label>Product Name</label>
                    <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} className="form-input w-full" required />
                </div>
                <div>
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} className="form-input w-full" />
                </div>
                <div>
                    <label>Quantity</label>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="form-input w-full" min={0} />
                </div>
                <div>
                    <label>Price</label>
                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="form-input w-full" />
                </div>
                <div>
                    <label>Purchase Price</label>
                    <input type="number" step="0.01" name="purchase_price" value={formData.purchase_price} onChange={handleChange} className="form-input w-full" />
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="available"
                        checked={formData.available === 'yes'}
                        onChange={handleChange}
                        disabled={formData.quantity === 0} // disable if quantity 0
                    />
                    <label>Available</label>
                </div>
                <button type="submit" className="btn btn-primary">
                    Update Product
                </button>
            </form>
        </div>
    );
}
