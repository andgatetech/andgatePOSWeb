'use client';
import { useGetSingleProductQuery, useUpdateProductMutation } from '@/store/Product/productApi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ImageUploading from 'react-images-uploading';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
interface Props {
    params: { id: string };
}

export default function UpdateProductPage({ params }: Props) {
    const token = useSelector((state: any) => state.auth.token);
    const router = useRouter();
    const { id } = params;
    const { data, isLoading } = useGetSingleProductQuery(id); // fetch single product
    const product = data?.data;
    const [images, setImages] = useState<any[]>([]);

    // 🆕 API থেকে product আসলে image set হবে
    useEffect(() => {
        if (product) {
            setImages(
                product.images
                    ? product.images.map((img: string) => ({
                          dataURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${img}`, // প্রিভিউর জন্য ফুল URL
                          path: img, // ব্যাকএন্ডে পাঠানোর জন্য স্টোরেজ পাথ
                          file: null,
                      }))
                    : []
            );
        }
    }, [product]);

    console.log('Product data:', product);
    const [updateProduct] = useUpdateProductMutation();

    // 🆕 image uploader onChange
    const onChange2 = (imageList: any[]) => {
        setImages(imageList);
    };

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

    // ---------------- handleSubmit ----------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // ✅ পুরানো (existing) আর নতুন ইমেজ আলাদা করা
            const existingImages = images.filter((img) => img.path && !img.file).map((img) => img.path);

            const newImages = images.filter((img) => img.file);

            // ✅ FormData বানানো
            const formDataToSend = new FormData();
            formDataToSend.append('product_name', formData.product_name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('quantity', String(formData.quantity));
            formDataToSend.append('price', String(formData.price));
            formDataToSend.append('purchase_price', String(formData.purchase_price));
            formDataToSend.append('available', formData.available);

            // পুরানো ইমেজ পাথ অ্যাড
            existingImages.forEach((path, idx) => {
                formDataToSend.append(`existing_images[${idx}]`, path);
            });

            // নতুন ইমেজ ফাইল অ্যাড
            newImages.forEach((img, idx) => {
                formDataToSend.append(`new_images[${idx}]`, img.file);
            });

            // Debugging log
            console.log('FormData entries:');
            for (let [key, value] of formDataToSend.entries()) {
                console.log(`${key}: ${value instanceof File ? value.name : value}`);
            }

            // ✅ API Call
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/products/${id}`, {
                method: 'POST', // 👈 Laravel এর জন্য update() তে `POST` + `_method=PUT`
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: (() => {
                    formDataToSend.append('_method', 'PUT'); // 👈 এটা MUST
                    return formDataToSend;
                })(),
            });

            const res = await response.json();
            console.log('API Response:', res);

            if (res.success) {
                toast.success('Product updated successfully');
            } else {
                toast.error('Update failed');
            }
        } catch (error) {
            console.error('Failed to update product:', error);
            toast.error('Failed to update product');
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
                {/* 🆕 Image Upload Field */}
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
