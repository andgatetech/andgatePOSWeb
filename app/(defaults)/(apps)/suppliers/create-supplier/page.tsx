'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useAllStoresQuery, useFullStoreListWithFilterQuery } from '@/store/features/store/storeApi';
import { useRegisterSupplierMutation } from '@/store/features/supplier/supplierApi';
import { Mail, MapPin, Phone, Store, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// Toast function for notifications
const showToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') toast.success(message);
    else toast.error(message);
};

// SweetAlert function for modals
// const showSweetAlert = async (config: any) => {
//     return await Swal.fire(config);
// };

const showSweetAlert = async (config: any) => {
    if (typeof window !== 'undefined') {
        const Swal = (await import('sweetalert2')).default;
        // run inside next tick so hydration finishes
        return new Promise((resolve) => {
            setTimeout(async () => {
                const result = await Swal.fire(config);
                resolve(result);
            }, 0);
        });
    }
};

interface SupplierFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    status: 'active' | 'inactive';
    store_id: string;
}

const CreateSupplierPage = () => {
    const { currentStoreId, currentStore } = useCurrentStore();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    // RTK Query hooks
    const [registerSupplier, { isLoading: createLoading }] = useRegisterSupplierMutation();
    // const { data: storesData, isLoading: storesLoading, error: storesError } = useAllStoresQuery();
    const { data: storesData, isLoading: storesLoading, error: storesError } = useFullStoreListWithFilterQuery();

    console.log('Stores Data:', storesData);

    const [formData, setFormData] = useState<SupplierFormData>({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'active',
        store_id: currentStoreId || '',
    });

    const [errors, setErrors] = useState<Partial<SupplierFormData>>({});

    // Ensure client-side rendering
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name as keyof SupplierFormData]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<SupplierFormData> = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Supplier name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation
        const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        // Address validation
        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        } else if (formData.address.trim().length < 10) {
            newErrors.address = 'Address must be at least 10 characters';
        }

        // Store validation
        // if (!formData.store_id) {
        //     newErrors.store_id = 'Please select a store';
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            showToast('Please fix the errors below', 'error');
            return;
        }

        try {
            const submitData = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                status: formData.status,
                store_id: currentStoreId, // Convert to number as per schema
            };

            const result = await registerSupplier(submitData).unwrap();

            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                status: 'active',
                store_id: currentStoreId,
            });
            setErrors({});

            // Success modal
            const response = await showSweetAlert({
                title: 'Success!',
                text: 'Supplier has been created successfully',
                icon: 'success',
                confirmButtonText: 'Go to Suppliers',
                showCancelButton: true,
                cancelButtonText: 'Create Another',
            });

            // if (typeof window !== 'undefined') {
            //     const Swal = (await import('sweetalert2')).default;
            //     const response = await Swal.fire({
            //         title: 'Success!',
            //         text: 'Supplier has been created successfully',
            //         icon: 'success',
            //         confirmButtonText: 'Go to Suppliers',
            //         showCancelButton: true,
            //         cancelButtonText: 'Create Another',
            //     });
            // }

            if (response.isConfirmed) {
                router.push('/apps/suppliers');
            }
        } catch (error: any) {
            console.error('Create supplier failed', error);
            const errorMessage = error?.data?.message || 'Something went wrong while creating the supplier';

            await showSweetAlert({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Try Again',
            });
        }
    };

    // Handle stores loading state
    if (!isClient || storesLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="mx-auto max-w-4xl">
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Loading...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Handle stores error state
    if (storesError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                        <div className="text-red-800">
                            <p className="font-medium">Error loading stores</p>
                            <p className="mt-1 text-sm">Please refresh the page and try again.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Create New Supplier</h1>
                    <p className="text-gray-600">Add a new supplier to your network</p>
                </div>

                {/* Main Form Card */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">Supplier Information</h2>
                    </div>

                    <div className="p-8">
                        <div className="space-y-8">
                            {/* Basic Information Section */}
                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Basic Information</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Supplier Name */}
                                    <div className="md:col-span-2">
                                        <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                                            Supplier Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter supplier name"
                                                className={`w-full rounded-lg border bg-gray-50 py-3 pl-12 pr-4 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                                                    errors.name ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            />
                                        </div>
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="supplier@example.com"
                                                className={`w-full rounded-lg border bg-gray-50 py-3 pl-12 pr-4 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                                                    errors.email ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            />
                                        </div>
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+1234567890"
                                                className={`w-full rounded-lg border bg-gray-50 py-3 pl-12 pr-4 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                                                    errors.phone ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            />
                                        </div>
                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                    </div>

                                    {/* Store Selection */}
                                    {/* <div className="md:col-span-2">
                                        <label htmlFor="store_id" className="mb-2 block text-sm font-medium text-gray-700">
                                            Store <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Store className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <select
                                                id="store_id"
                                                name="store_id"
                                                value={formData.store_id}
                                                onChange={handleChange}
                                                className={`w-full appearance-none rounded-lg border bg-gray-50 py-3 pl-12 pr-10 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                                                    errors.store_id ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            >
                                                <option value="">Select a store</option>
                                                {storesData?.data?.map((store: any) => (
                                                    <option key={store.id} value={store.id}>
                                                        {store.store_name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                                    <path
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                        fillRule="evenodd"
                                                    ></path>
                                                </svg>
                                            </div>
                                        </div>
                                        {errors.store_id && <p className="mt-1 text-sm text-red-600">{errors.store_id}</p>}
                                        <p className="mt-1 text-sm text-gray-500">Total stores available: {storesData?.data?.length || 0}</p>
                                    </div> */}

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Store</label>
                                        <div className="relative mt-1">
                                            <input
                                                type="text"
                                                value={currentStore?.store_name || 'No Store Selected'}
                                                readOnly
                                                className="block w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-50 py-2 pl-10 pr-3 text-gray-900 focus:outline-none"
                                            />
                                            <Store className="absolute left-3 top-2.5 h-4 w-4 text-purple-500" />
                                        </div>
                                        {errors.store_id && <p className="mt-1 text-sm text-red-600">{errors.store_id}</p>}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label htmlFor="status" className="mb-2 block text-sm font-medium text-gray-700">
                                            Status
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>

                                    {/* Address */}
                                    <div className="md:col-span-2">
                                        <label htmlFor="address" className="mb-2 block text-sm font-medium text-gray-700">
                                            Address <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                                            <textarea
                                                id="address"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Enter complete address"
                                                rows={3}
                                                maxLength={500}
                                                className={`w-full resize-none rounded-lg border bg-gray-50 py-3 pl-12 pr-4 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                                                    errors.address ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            />
                                        </div>
                                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                                        <p className="mt-1 text-sm text-gray-500">{formData.address.length}/500 characters</p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => router.push('/apps/suppliers')}
                                        className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={createLoading}
                                        className="flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-medium text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {createLoading ? (
                                            <>
                                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <User className="h-4 w-4" />
                                                Create Supplier
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips Card */}
                <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="mb-1 font-medium">Supplier Creation Tips:</p>
                            <ul className="space-y-1 text-blue-700">
                                <li>• Ensure email address is valid and unique in the system</li>
                                <li>• Provide complete address information for better communication</li>
                                <li>• Phone number should include country code for international suppliers</li>
                                <li>• Select the appropriate store that will work with this supplier</li>
                                <li>• Set status to 'Active' to enable immediate operations</li>
                                <li>• Keep supplier information updated for smooth business operations</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateSupplierPage;
