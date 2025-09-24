'use client';

import { useCreateCustomerMutation } from '@/store/features/customer/customer';
import { Award, Crown, Shield, Star, UserPlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';

const CreateCustomerModal = ({ isOpen, onClose, onSuccess }) => {
    const [isClient, setIsClient] = useState(false);
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
    const [createCustomer, { isLoading }] = useCreateCustomerMutation();

    // stable container for modal
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        is_active: true,
        points: 0,
        balance: 0,
        membership: 'normal',
        details: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setIsClient(true);

        // Create dedicated modal root if not exist
        let modalRoot = document.getElementById('modal-root');
        if (!modalRoot) {
            modalRoot = document.createElement('div');
            modalRoot.id = 'modal-root';
            document.body.appendChild(modalRoot);
        }

        // stable container for this modal instance
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
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
        if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone.trim())) newErrors.phone = 'Invalid phone';
        if (formData.points < 0) newErrors.points = 'Points cannot be negative';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the errors');
            return;
        }

        try {
            const submitData = {
                ...formData,
                points: parseInt(String(formData.points)) || 0,
                balance: parseFloat(String(formData.balance)) || 0,
                email: formData.email.trim() || null,
                phone: formData.phone.trim() || null,
                details: formData.details.trim() || null,
            };

            await createCustomer(submitData).unwrap();

            resetForm();
            toast.success('Customer created successfully!');
            onSuccess?.();
            handleClose();
        } catch (error: any) {
            const msg = error?.data?.message || 'Failed to create customer';
            setErrors({ general: msg });
            toast.error(msg);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            is_active: true,
            points: 0,
            balance: 0,
            membership: 'normal',
            details: '',
        });
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose?.();
    };

    const getMembershipIcon = (membership: string) => {
        switch (membership) {
            case 'platinum':
                return Crown;
            case 'gold':
                return Award;
            case 'silver':
                return Star;
            default:
                return Shield;
        }
    };

    const getMembershipColor = (membership: string) => {
        switch (membership) {
            case 'platinum':
                return 'text-purple-600';
            case 'gold':
                return 'text-yellow-600';
            case 'silver':
                return 'text-gray-600';
            default:
                return 'text-blue-600';
        }
    };

    if (!isClient || !isOpen || !portalContainer) return null;

    const modalContent = (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
                    {/* header */}
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <div className="flex items-center">
                            <UserPlus className="mr-2 h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold">Create New Customer</h3>
                        </div>
                        <button onClick={handleClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        {errors.general && (
                            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
                                <p className="text-sm text-red-600">{errors.general}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Name */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm sm:text-sm ${
                                        errors.name ? 'border-red-300' : ''
                                    }`}
                                    placeholder="Enter customer name"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm sm:text-sm ${
                                        errors.email ? 'border-red-300' : ''
                                    }`}
                                    placeholder="customer@example.com"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm sm:text-sm ${
                                        errors.phone ? 'border-red-300' : ''
                                    }`}
                                    placeholder="+880 1234 567890"
                                />
                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                            </div>

                            {/* Points */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Loyalty Points</label>
                                <input
                                    type="number"
                                    name="points"
                                    min="0"
                                    value={formData.points}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
                                />
                                {errors.points && <p className="mt-1 text-sm text-red-600">{errors.points}</p>}
                            </div>

                            {/* Balance */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Balance (৳)</label>
                                <input
                                    type="number"
                                    name="balance"
                                    step="0.01"
                                    value={formData.balance}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
                                />
                            </div>

                            {/* Membership */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Membership</label>
                                <select
                                    name="membership"
                                    value={formData.membership}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="silver">Silver</option>
                                    <option value="gold">Gold</option>
                                    <option value="platinum">Platinum</option>
                                </select>
                                <div className="mt-1">
                                    {(() => {
                                        const Icon = getMembershipIcon(formData.membership);
                                        return <Icon className={`h-4 w-4 ${getMembershipColor(formData.membership)}`} />;
                                    })()}
                                </div>
                            </div>

                            {/* Active */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                />
                                <label className="ml-2 text-sm text-gray-700">Active Customer</label>
                            </div>

                            {/* Details */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Additional Details</label>
                                <textarea
                                    name="details"
                                    rows={3}
                                    value={formData.details}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Creating...' : 'Create Customer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, portalContainer);
};

export default CreateCustomerModal;
