'use client';

import { useUpdateCustomerMutation } from '@/store/features/customer/customer';
import { useAllStoresQuery } from '@/store/features/store/storeApi';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';

const UpdateCustomerModal = ({ isOpen, onClose, onSuccess, customer }) => {
    const [isClient, setIsClient] = useState(false);
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [updateCustomer, { isLoading }] = useUpdateCustomerMutation();
    const { data: storesData, isLoading: isLoadingStores } = useAllStoresQuery();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        store_id: '',
        membership: 'normal',
        points: 0,
        balance: 0,
        is_active: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // portal setup
    useEffect(() => {
        setIsClient(true);

        let modalRoot = document.getElementById('modal-root');
        if (!modalRoot) {
            modalRoot = document.createElement('div');
            modalRoot.id = 'modal-root';
            document.body.appendChild(modalRoot);
        }

        if (!containerRef.current) {
            containerRef.current = document.createElement('div');
        }
        modalRoot.appendChild(containerRef.current);
        setPortalContainer(containerRef.current);

        return () => {
            if (containerRef.current && modalRoot?.contains(containerRef.current)) {
                modalRoot.removeChild(containerRef.current);
            }
        };
    }, []);

    // populate when customer changes
    useEffect(() => {
        if (customer && isOpen) {
            setFormData({
                name: customer.name || '',
                email: customer.email || '',
                phone: customer.phone || '',
                store_id: customer.store_id || '',
                membership: customer.membership || 'normal',
                points: customer.points || 0,
                balance: customer.balance || 0,
                is_active: customer.is_active ?? true,
            });
        }
    }, [customer, isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.store_id) newErrors.store_id = 'Store is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }

        try {
            const customerData = {
                ...formData,
                points: Number(formData.points),
                balance: Number(formData.balance),
            };

            await updateCustomer({ customerId: customer.id, customerData }).unwrap();

            onSuccess?.();
            handleClose();
        } catch (error: any) {
            const msg = error?.data?.message || 'Failed to update customer';
            setErrors({ submit: msg });
            toast.error(msg);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            store_id: '',
            membership: 'normal',
            points: 0,
            balance: 0,
            is_active: true,
        });
        setErrors({});
        onClose?.();
    };

    if (!isClient || !isOpen || !portalContainer || !customer) return null;

    const modalContent = (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-lg rounded-lg bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <h3 className="text-lg font-semibold">Update Customer</h3>
                        <button onClick={handleClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 p-6">
                        {errors.submit && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{errors.submit}</div>}

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                            />
                            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                        </div>

                        {/* Store */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Store *</label>
                            <select
                                name="store_id"
                                value={formData.store_id}
                                onChange={handleInputChange}
                                disabled={isLoadingStores}
                                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm ${errors.store_id ? 'border-red-300' : 'border-gray-300'}`}
                            >
                                <option value="">Select a store</option>
                                {storesData?.data?.map((store) => (
                                    <option key={store.id} value={store.id}>
                                        {store.store_name}
                                    </option>
                                ))}
                            </select>
                            {errors.store_id && <p className="mt-1 text-sm text-red-600">{errors.store_id}</p>}
                        </div>

                        {/* Membership */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Membership</label>
                            <select name="membership" value={formData.membership} onChange={handleInputChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm">
                                <option value="normal">Normal</option>
                                <option value="silver">Silver</option>
                                <option value="gold">Gold</option>
                                <option value="platinum">Platinum</option>
                            </select>
                        </div>

                        {/* Points & Balance */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Points</label>
                                <input
                                    type="number"
                                    name="points"
                                    value={formData.points}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Balance (৳)</label>
                                <input
                                    type="number"
                                    name="balance"
                                    value={formData.balance}
                                    step="0.01"
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Active */}
                        <div className="flex items-center">
                            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                            <label className="ml-2 text-sm text-gray-700">Customer is active</label>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={handleClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm" disabled={isLoading}>
                                Cancel
                            </button>
                            <button type="submit" disabled={isLoading} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                                {isLoading ? 'Updating...' : 'Update Customer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, portalContainer);
};

export default UpdateCustomerModal;
