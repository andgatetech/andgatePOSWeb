'use client';

import type { RootState } from '@/store';
import { useGetAllProductsQuery } from '@/store/Product/productApi';
import { useCreatePurchaseMutation } from '@/store/features/purchase/purchase';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const CreatePurchase = () => {
    const { data: productsData } = useGetAllProductsQuery();
    const [createPurchase, { isLoading }] = useCreatePurchaseMutation();
    const products = productsData?.data || [];

    // current user (for user_id)
    const currentUser = useSelector((state: RootState) => state.auth.user);

    // Add Product (left)
    const [search, setSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [quantity, setQuantity] = useState(0);
    const [itemTax, setItemTax] = useState(0);
    const [purchasePrice, setPurchasePrice] = useState(0);
    const [unitPrice, setUnitPrice] = useState(0);
    const [error, setError] = useState('');

    // Items added
    const [items, setItems] = useState<any[]>([]);

    // Order meta (right)
    const [status, setStatus] = useState<'draft' | 'delivered' | 'received' | 'cancelled'>('draft');
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending');
    const [paymentType, setPaymentType] = useState<'debit' | 'credit' | 'hold'>('debit');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'paypal' | 'stripe' | 'hold'>('stripe');
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [orderTax, setOrderTax] = useState<number>(0); // total amount tax for payload

    const filteredProducts = products.filter((p: any) => p.product_name?.toLowerCase().includes(search.toLowerCase()));

    const handleSelectProduct = (p: any) => {
        setSelectedProduct(p);
        setQuantity(1);
        setItemTax(0);
        setPurchasePrice(p.purchase_price ?? 0);
        setUnitPrice(p.unit_price ?? p.price ?? 0);
        setError('');
        setSearch(p.product_name);
    };

    const handleQuantityChange = (value: number) => {
        setQuantity(value);
        if (selectedProduct && value > (selectedProduct.quantity ?? selectedProduct.stock_quantity ?? 0)) {
            setError('Quantity exceeds available stock!');
        } else {
            setError('');
        }
    };

    const handleAddItem = () => {
        if (!selectedProduct) return;
        const available = selectedProduct.quantity ?? selectedProduct.stock_quantity ?? 0;
        if (quantity <= 0 || quantity > available) return;

        const newItem = {
            id: selectedProduct.id,
            product_id: selectedProduct.id,
            product_name: selectedProduct.product_name,
            quantity,
            tax: itemTax, // per-item tax %
            purchase_price: purchasePrice,
            unit_price: unitPrice,
        };

        setItems((prev) => {
            const updatedItems = [...prev, newItem];

            // payment_amount
            const totalAmount = updatedItems.reduce((sum, it) => {
                const amount = it.purchase_price * it.quantity;
                const total = amount + (amount * it.tax) / 100;
                return sum + total;
            }, 0);
            setPaymentAmount(totalAmount);

            return updatedItems;
        });

        // reset item editor
        setSelectedProduct(null);
        setSearch('');
        setQuantity(0);
        setItemTax(0);
        setPurchasePrice(0);
        setUnitPrice(0);
    };

    const removeItem = (id: number) => {
        setItems((prev) => {
            const updatedItems = prev.filter((it) => it.id !== id);

            const totalAmount = updatedItems.reduce((sum, it) => {
                const amount = it.purchase_price * it.quantity;
                const total = amount + (amount * it.tax) / 100;
                return sum + total;
            }, 0);
            setPaymentAmount(totalAmount);

            return updatedItems;
        });
    };

    const handleSubmit = async () => {
        if (!currentUser?.id) {
            toast.error('User not logged in!');
            return;
        }
        if (items.length === 0) {
            toast.error('No items added!');
            return;
        }

        // Build payload exactly as your API expects
        const payload = {
            user_id: currentUser.id,
            status,
            tax: Number(orderTax),
            payment_amount: Number(paymentAmount),
            payment_type: String(paymentType),
            payment_method: String(paymentMethod),
            payment_status: paymentStatus,
            items: items.map((it) => ({
                product_id: it.product_id,
                quantity: Number(it.quantity),
                purchase_price: Number(it.purchase_price),
                unit_price: Number(it.unit_price),
                tax: Number(it.tax),
            })),
        };

        console.log('Payload:', payload);

        try {
            const res = await createPurchase(payload).unwrap();
            console.log('Purchase created:', res);
            toast.success('Purchase created successfully!');
            // clear state
            setItems([]);
            setStatus('draft');
            setPaymentStatus('pending');
            setPaymentType('cash');
            setPaymentMethod('stripe');
            setPaymentAmount(0);
            setOrderTax(0);
        } catch (err) {
            console.error('Error creating purchase:', err);
            toast.error('Failed to create purchase!');
        }
    };

    return (
        <div className="flex gap-6 p-6">
            {/* Left: Add Product */}
            <div className="w-1/2 rounded border p-4 shadow">
                <h2 className="mb-4 text-lg font-semibold">Add Product</h2>

                <input type="text" placeholder="Search product..." className="form-input mb-2 w-full" value={search} onChange={(e) => setSearch(e.target.value)} />

                {filteredProducts.length > 0 && search && !selectedProduct && (
                    <ul className="mb-2 max-h-40 overflow-y-auto rounded border">
                        {filteredProducts.map((p: any) => (
                            <li key={p.id} className="cursor-pointer p-2 hover:bg-gray-100" onClick={() => handleSelectProduct(p)}>
                                {p.product_name} (Stock: {p.quantity ?? p.stock_quantity ?? 0})
                            </li>
                        ))}
                    </ul>
                )}

                {selectedProduct && (
                    <>
                        <p className="mb-1">Selected: {selectedProduct.product_name}</p>
                        <div className="mb-2 grid grid-cols-2">
                            <div>
                                <label className="mb-1 block">Quantity (Available: {selectedProduct.quantity ?? selectedProduct.stock_quantity ?? 0})</label>
                                <input
                                    type="number"
                                    className={`form-input mb-1 w-24 ${error ? 'border-red-500' : ''}`}
                                    value={quantity}
                                    min={1}
                                    max={selectedProduct.quantity ?? selectedProduct.stock_quantity ?? 0}
                                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                                />
                                {error && <p className="text-sm text-red-500">{error}</p>}
                            </div>
                            <div>
                                <label className="mb-1 mt-2 block">Purchase Price</label>
                                <input type="number" className="form-input mb-2 w-32" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} />
                            </div>

                            <div>
                                <label className="mb-1 mt-2 block">Unit Price</label>
                                <input type="number" className="form-input mb-2 w-32" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} />
                            </div>
                            <div>
                                <label className="mb-1 mt-2 block">Item Tax (%)</label>
                                <input type="number" className="form-input w-24" value={itemTax} onChange={(e) => setItemTax(Number(e.target.value))} />
                            </div>
                        </div>
                    </>
                )}

                <button
                    className={`btn btn-primary mt-2 ${error || !selectedProduct || quantity <= 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                    disabled={!!error || !selectedProduct || quantity <= 0}
                    onClick={handleAddItem}
                >
                    Add Item
                </button>
            </div>

            {/* Right: Order Details */}
            <div className="w-1/2 rounded border p-4 shadow">
                <h2 className="mb-4 text-lg font-semibold">Order Details</h2>

                {/* Status & Payments */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Status</label>
                        <select className="form-select w-full" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                            <option value="draft">Draft</option>
                            <option value="delivered">Delivered</option>
                            <option value="received">Received</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Payment Status</label>
                        <select className="form-select w-full" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as any)}>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Payment Type</label>
                        <select className="form-select w-full" value={paymentType} onChange={(e) => setPaymentType(e.target.value as any)}>
                            <option value="debit">Debit</option>
                            <option value="credit">Credit</option>
                            <option value="hold">Hold</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Payment Method</label>
                        <select className="form-select w-full" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="paypal">PayPal</option>
                            <option value="stripe">Stripe</option>
                            <option value="hold">Hold</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Payment Amount</label>
                        <input type="number" className="form-input w-full" value={paymentAmount} onChange={(e) => setPaymentAmount(Number(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Tax (%)</label>
                        <input type="number" className="form-input w-full" value={orderTax} onChange={(e) => setOrderTax(Number(e.target.value))} />
                    </div>
                </div>

                {items.length === 0 ? (
                    <p>No products added yet.</p>
                ) : (
                    <table className="mb-4 w-full border">
                        <thead>
                            <tr>
                                <th className="border px-2 py-1">Item</th>
                                <th className="border px-2 py-1">Qty</th>
                                <th className="border px-2 py-1">Purchase Price</th>
                                <th className="border px-2 py-1">Unit Price</th>
                                <th className="border px-2 py-1">Tax (%)</th>
                                <th className="border px-2 py-1">Amount</th>
                                <th className="border px-2 py-1">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => {
                                const amount = item.unit_price * item.quantity;
                                const total = amount + (amount * item.tax) / 100;
                                return (
                                    <tr key={item.id}>
                                        <td className="border px-2 py-1">{item.product_name}</td>
                                        <td className="border px-2 py-1">{item.quantity}</td>
                                        <td className="border px-2 py-1">{item.purchase_price}</td>
                                        <td className="border px-2 py-1">{item.unit_price}</td>
                                        <td className="border px-2 py-1">{item.tax}</td>
                                        <td className="border px-2 py-1">{total.toFixed(2)}</td>
                                        <td className="border px-2 py-1">
                                            <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.id)}>
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={isLoading || items.length === 0}
                    className={`btn btn-success w-full ${isLoading || items.length === 0 ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                    {isLoading ? 'Creating...' : 'Create Purchase'}
                </button>
            </div>
        </div>
    );
};

export default CreatePurchase;
