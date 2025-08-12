'use client';

import React, { useEffect, useState } from 'react';
import IconEye from '@/components/icon/icon-eye';
import IconSave from '@/components/icon/icon-save';
import IconX from '@/components/icon/icon-x';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { removeItemRedux, updateItemRedux, clearItemsRedux } from '@/store/features/Order/OrderSlice';

import type { RootState } from '@/store';
import { useCreateOrderMutation } from '@/store/features/Order/Order';
import Swal from 'sweetalert2';
import ComponentsAppsInvoicePreview from './components-apps-invoice-preview';

const BillToForm: React.FC = () => {
    const [showPreview, setShowPreview] = useState(false);
    const dispatch = useDispatch();
    const invoiceItems = useSelector((state: RootState) => state.invoice.items);
    const userId = useSelector((state: RootState) => state.auth.user?.id);

    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        tax: 0,
        discount: 0,
        paymentMethod: '',
        paymentStatus: '',
    });

    const [createOrder] = useCreateOrderMutation();
    const [loading, setLoading] = useState(false);

    const showMessage = (msg = '', type: 'success' | 'error' = 'success') => {
        const toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    useEffect(() => {
        console.log('Current invoice items:', invoiceItems);
    }, [invoiceItems]);

    const handleRemoveItem = (itemId: number) => {
        if (invoiceItems.length <= 1) {
            showMessage('At least one item is required', 'error');
            return;
        }
        dispatch(removeItemRedux(itemId));
    };

    const handleQuantityChange = (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        const item = invoiceItems.find((item) => item.id === itemId);
        if (!item) return;

        if (item.PlaceholderQuantity && newQuantity > item.PlaceholderQuantity) {
            showMessage(`Maximum available quantity is ${item.PlaceholderQuantity}`, 'error');
            return;
        }

        const updatedItem = {
            ...item,
            quantity: newQuantity,
            amount: item.rate * newQuantity,
        };

        dispatch(updateItemRedux(updatedItem));
    };

    const calculateSubtotal = () => invoiceItems.reduce((total, item) => total + item.rate * item.quantity, 0);
    const calculateTax = () => (calculateSubtotal() * formData.tax) / 100;
    const calculateDiscount = () => (calculateSubtotal() * formData.discount) / 100;
    const calculateTotal = () => calculateSubtotal() + calculateTax() - calculateDiscount();

    const clearAllItems = () => {
        if (window.confirm('Are you sure you want to clear all items?')) {
            dispatch(clearItemsRedux());
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'tax' || name === 'discount' ? Number(value) : value,
        }));
    };

    const handleSubmit = async () => {
        if (!formData.customerName.trim() || !formData.customerEmail.trim()) {
            showMessage('Name and email are required', 'error');
            return;
        }
        if (invoiceItems.length === 0) {
            showMessage('At least one item is required', 'error');
            return;
        }
        const invalidItems = invoiceItems.filter((item) => !item.productId || item.quantity <= 0);
        if (invalidItems.length > 0) {
            showMessage('Please select products and set quantities for all items', 'error');
            return;
        }

        const orderData = {
            user_id: userId,
            customer_name: formData.customerName,
            customer_number: formData.customerPhone,
            customer_email: formData.customerEmail,
            payment_method: formData.paymentMethod,
            payment_status: formData.paymentStatus,
            tax: Number(formData.tax),
            total: calculateSubtotal(),
            grand_total: calculateTotal(),
            items: invoiceItems.map((item) => ({
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: item.rate,
                discount: 0,
                tax: Number(formData.tax),
                subtotal: item.rate * item.quantity + (item.rate * item.quantity * formData.tax) / 100,
            })),
        };

        try {
            setLoading(true);
            await createOrder(orderData).unwrap();
            setLoading(false);
            showMessage('Order Create successfully!', 'success');
            dispatch(clearItemsRedux());
            setFormData({
                customerName: '',
                customerEmail: '',
                customerPhone: '',
                tax: 0,
                discount: 0,
                paymentMethod: '',
                paymentStatus: '',
            });
        } catch (error) {
            setLoading(false);
            console.error('Failed to create order:', error);
            showMessage('Failed to create order', 'error');
        }
    };

    const handlePreview = () => {
        if (invoiceItems.length === 0) {
            showMessage('No items to preview', 'error');
            return;
        }
        setShowPreview(true);
    };

    const previewData = {
        customer: {
            name: formData.customerName,
            email: formData.customerEmail,
            phone: formData.customerPhone,
        },
        items: invoiceItems.map((item, idx) => ({
            id: idx + 1,
            title: item.title || 'Untitled',
            quantity: item.quantity,
            price: item.rate,
            amount: item.rate * item.quantity,
        })),
        tax: formData.tax,
        discount: formData.discount,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        totals: {
            subtotal: calculateSubtotal(),
            tax: calculateTax(),
            discount: calculateDiscount(),
            total: calculateTotal(),
        },
    };

    if (showPreview) {
        return (
            <div>
                <button onClick={() => setShowPreview(false)} className="btn btn-secondary mb-4">
                    ← Back to Edit
                </button>
                {(() => {
                    console.log(previewData);
                    return <ComponentsAppsInvoicePreview data={previewData} />;
                })()}
            </div>
        );
    }

    return (
        <div className="relative mt-6 w-full xl:mt-0 xl:w-full">
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="loader"></div>
                </div>
            )}

            <div className="panel mb-5">
                <div className="mt-8 px-4">
                    <div className="flex flex-col justify-between lg:flex-row">
                        <div className="mb-6 w-full lg:w-full">
                            <div className="text-lg font-semibold text-gray-800">Bill To :-</div>
                            <div className="mt-4 flex items-center">
                                <label className="w-1/3 text-sm font-medium">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input type="text" name="customerName" className="form-input flex-1" placeholder="Enter Name" value={formData.customerName} onChange={handleInputChange} />
                            </div>
                            <div className="mt-4 flex items-center">
                                <label className="w-1/3 text-sm font-medium">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input type="email" name="customerEmail" className="form-input flex-1" placeholder="Enter Email" value={formData.customerEmail} onChange={handleInputChange} />
                            </div>

                            <div className="mt-4 flex items-center">
                                <label className="w-1/3 text-sm font-medium">Phone Number</label>
                                <input type="text" name="customerPhone" className="form-input flex-1" placeholder="Enter Phone number" value={formData.customerPhone} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="panel mb-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Order Details</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Items: {invoiceItems.length}</span>
                            <button type="button" onClick={clearAllItems} className="text-sm text-red-600 hover:text-red-800">
                                Clear all
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="p-3 text-left text-xs font-semibold text-gray-700">Item</th>
                                    <th className="p-3 text-left text-xs font-semibold text-gray-700">Qty</th>
                                    <th className="p-3 text-left text-xs font-semibold text-gray-700">Rate</th>
                                    <th className="p-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                                    <th className="p-3 text-left text-xs font-semibold text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceItems.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-200">
                                        <td className="p-3 text-sm">{item.title}</td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                className="form-input w-16"
                                                min={1}
                                                max={item.PlaceholderQuantity || 9999}
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-3 text-sm">{item.rate.toFixed(2)}</td>
                                        <td className="p-3 text-sm">{(item.rate * item.quantity).toFixed(2)}</td>
                                        <td className="p-3">
                                            <button type="button" className="text-red-600 hover:text-red-800" onClick={() => handleRemoveItem(item.id)}>
                                                <IconX />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                        <div className="flex justify-between">
                            <label className="font-semibold">Tax (%)</label>
                            <input type="number" className="form-input w-20" name="tax" value={formData.tax} onChange={handleInputChange} min={0} />
                        </div>
                        <div className="flex justify-between">
                            <label className="font-semibold">Discount (%)</label>
                            <input type="number" className="form-input w-20" name="discount" value={formData.discount} onChange={handleInputChange} min={0} />
                        </div>
                        <div className="flex justify-between">
                            <label className="font-semibold">Payment Method</label>
                            <select name="paymentMethod" className="form-select w-40" value={formData.paymentMethod} onChange={handleInputChange}>
                                <option value="">Select</option>
                                <option value="cash">Cash</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Bank">Bank</option>
                            </select>
                        </div>
                        <div className="flex justify-between">
                            <label className="font-semibold">Payment Status</label>
                            <select name="paymentStatus" className="form-select w-40" value={formData.paymentStatus} onChange={handleInputChange}>
                                <option value="">Select</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>

                        <div className="flex justify-between border-t border-gray-300 pt-4 text-lg font-semibold">
                            <span>Subtotal</span>
                            <span>{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax</span>
                            <span>{calculateTax().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount</span>
                            <span>{calculateDiscount().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-300 pt-4 text-xl font-bold">
                            <span>Total</span>
                            <span>{calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                        <button type="button" className="btn btn-primary flex-1" onClick={handleSubmit} disabled={loading}>
                            Save Order <IconSave />
                        </button>
                        <button type="button" className="btn btn-secondary flex-1" onClick={handlePreview}>
                            Preview <IconEye />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillToForm;
