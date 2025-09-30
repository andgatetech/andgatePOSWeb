'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useRegisterSupplierMutation } from '@/store/features/supplier/supplierApi';
import { Mail, MapPin, Phone, Store, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// const showSweetAlert = async (config: any) => {
//     if (typeof window !== 'undefined') {
//         const Swal = (await import('sweetalert2')).default;
//         return new Promise((resolve) => {
//             setTimeout(async () => {
//                 const result = await Swal.fire({
//                     ...config,
//                     confirmButtonColor: config.icon === 'success' ? '#10b981' : '#ef4444',
//                     showCancelButton: config.icon === 'success',
//                     cancelButtonText: config.icon === 'success' ? 'Create Another' : undefined,
//                     cancelButtonColor: '#6b7280',
//                     background: '#ffffff',
//                     color: '#374151',
//                     customClass: {
//                         popup: 'rounded-xl shadow-2xl',
//                         title: 'text-xl font-semibold',
//                         confirmButton: 'rounded-lg px-4 py-2 font-medium',
//                         cancelButton: 'rounded-lg px-4 py-2 font-medium',
//                     },
//                 });
//                 resolve(result);
//             }, 0);
//         });
//     }
// };

interface SupplierFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    status: 'active' | 'inactive';
}

const CreateSupplierPage = () => {
    const { currentStoreId, currentStore } = useCurrentStore();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    const [registerSupplier, { isLoading: createLoading }] = useRegisterSupplierMutation();

    const [formData, setFormData] = useState<SupplierFormData>({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'active',
    });

    const [errors, setErrors] = useState<Partial<SupplierFormData>>({});

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name as keyof SupplierFormData]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<SupplierFormData> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Supplier name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        } else if (formData.address.trim().length < 10) {
            newErrors.address = 'Address must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors below');
            return;
        }

        if (!currentStoreId) {
            toast.error('Please select a store first!');
            return;
        }

        try {
            const submitData = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                status: formData.status,
                store_id: currentStoreId,
            };

            await registerSupplier(submitData).unwrap();

            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                status: 'active',
            });
            setErrors({});
            toast.dismiss();
            toast.success('Supplier created successfully', { toastId: 'create-supplier' });

            // Success modal
            // const response: any = await showSweetAlert({
            //     title: 'Success!',
            //     text: 'Supplier has been created successfully',
            //     icon: 'success',
            //     confirmButtonText: 'Go to Suppliers',
            // });

            router.push('/suppliers');
            // if (response.isConfirmed) {
            // }
        } catch (error: any) {
            console.error('Create supplier failed', error);
            // const errorMessage = error?.data?.message || 'Something went wrong while creating the supplier';
            toast.dismiss();
            toast.error(error?.data?.message || 'Something went wrong while creating the supplier');
            // await showSweetAlert({
            //     title: 'Error!',
            //     text: errorMessage,
            //     icon: 'error',
            //     confirmButtonText: 'Try Again',
            // });
        }
    };

    if (!isClient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="mx-auto">
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                                <User className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Create New Supplier</h1>
                                <p className="text-sm text-gray-500">{currentStore ? `Add a new supplier to ${currentStore.store_name}` : 'Add a new supplier to your network'}</p>
                            </div>
                        </div>
                    </div>
                    {currentStore && (
                        <div className="rounded-lg bg-blue-50 p-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                                    <Store className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Current Store: {currentStore.store_name}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Form Card */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                    <div className="p-8">
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {/* Basic Information Section */}
                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Basic Information</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Supplier Name */}
                                    <div className="md:col-span-2">
                                        <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                                            Supplier Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter supplier name"
                                            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                                                errors.name ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="supplier@example.com"
                                            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                                                errors.email ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+1234567890"
                                            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                                                errors.phone ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Status Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Contact & Status</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Address */}
                                    <div className="md:col-span-2">
                                        <label htmlFor="address" className="mb-2 block text-sm font-medium text-gray-700">
                                            Address <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Enter complete address"
                                            rows={3}
                                            maxLength={500}
                                            className={`w-full resize-none rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                                                errors.address ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                                        <p className="mt-1 text-sm text-gray-500">{formData.address.length}/500 characters</p>
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

                                    {/* Store Info (Read-only) */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Store</label>
                                        <input
                                            type="text"
                                            value={currentStore?.store_name || 'Current Store'}
                                            disabled
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"
                                        />
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
                                        type="submit"
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
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Create Supplier
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
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
