'use client';

import { useGetSingleSupplierQuery, useUpdateSupplierMutation } from '@/store/features/supplier/supplierApi';
import { Mail, MapPin, Phone, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
// Toast function for notifications
const showToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') toast.success(message);
    else toast.error(message);
};

// SweetAlert function for modals
const showSweetAlert = async (config: any) => {
    return await Swal.fire(config);
};

interface SupplierFormData {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: 'active' | 'inactive';
}

const UpdateSupplierPage = () => {
    const router = useRouter();
    const params = useParams();
    const supplierId = params?.id as string;
    const [isClient, setIsClient] = useState(false);

    // RTK Query hooks
    const { data: supplierData, isLoading: supplierLoading, error: supplierError } = useGetSingleSupplierQuery(supplierId);
    const [updateSupplier, { isLoading: updateLoading }] = useUpdateSupplierMutation();

    const [formData, setFormData] = useState<SupplierFormData>({
        id: 0,
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'active',
    });

    const [errors, setErrors] = useState<Partial<SupplierFormData>>({});

    // Ensure client-side rendering
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Populate form data when supplier data is loaded
    useEffect(() => {
        if (supplierData?.data) {
            const supplier = supplierData.data;
            setFormData({
                id: supplier.id,
                name: supplier.name || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                address: supplier.address || '',
                status: supplier.status || 'active',
            });
        }
    }, [supplierData]);

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
                id: formData.id,
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                status: formData.status,
            };

            const result = await updateSupplier(submitData).unwrap();

            // Success modal
            const response = await showSweetAlert({
                title: 'Success!',
                text: 'Supplier has been updated successfully',
                icon: 'success',
                confirmButtonText: 'Go to Suppliers',
                showCancelButton: true,
                cancelButtonText: 'Stay Here',
            });

            if (response.isConfirmed) {
                router.push('/apps/suppliers');
            }
        } catch (error: any) {
            console.error('Update supplier failed', error);
            const errorMessage = error?.data?.message || 'Something went wrong while updating the supplier';

            await showSweetAlert({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Try Again',
            });
        }
    };

    // Handle loading state
    if (!isClient || supplierLoading) {
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
                            Loading supplier data...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Handle error state
    if (supplierError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                        <div className="text-red-800">
                            <h3 className="text-lg font-medium">Error Loading Supplier</h3>
                            <p className="mt-2">Unable to load supplier data. Please check the supplier ID and try again.</p>
                            <button onClick={() => router.push('/apps/suppliers')} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700">
                                Back to Suppliers
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Handle case when supplier data is not found
    if (!supplierData?.data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
                        <div className="text-yellow-800">
                            <h3 className="text-lg font-medium">Supplier Not Found</h3>
                            <p className="mt-2">The supplier with ID {supplierId} was not found.</p>
                            <button onClick={() => router.push('/apps/suppliers')} className="mt-4 rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700">
                                Back to Suppliers
                            </button>
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
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Update Supplier</h1>
                    <p className="text-gray-600">Modify supplier information</p>
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

                                    {/* Status */}
                                    <div className="md:col-span-2">
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
                                        disabled={updateLoading}
                                        className="flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-8 py-3 font-medium text-white transition-all duration-200 hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {updateLoading ? (
                                            <>
                                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <User className="h-4 w-4" />
                                                Update Supplier
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips Card */}
                <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-green-800">
                            <p className="mb-1 font-medium">Supplier Update Tips:</p>
                            <ul className="space-y-1 text-green-700">
                                <li>• Verify all information is accurate before updating</li>
                                <li>• Email changes may affect supplier login access</li>
                                <li>• Status changes will immediately affect supplier operations</li>
                                <li>• Keep contact information current for smooth communication</li>
                                <li>• Address updates help with delivery and logistics</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateSupplierPage;
