'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showErrorDialog, showMessage, showSuccessDialog } from '@/lib/toast';
import { useGetSingleSupplierQuery, useUpdateSupplierMutation } from '@/store/features/supplier/supplierApi';
import { Store, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SupplierFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    contact_person?: string;
    status: 'active' | 'inactive' | 'blocked';
}

const EditSupplierPage = () => {
    const { id } = useParams();
    const { currentStoreId, currentStore } = useCurrentStore();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    const { data: supplierResponse, isLoading: fetchLoading } = useGetSingleSupplierQuery(id as string);
    const [updateSupplier, { isLoading: updateLoading }] = useUpdateSupplierMutation();

    const [formData, setFormData] = useState<SupplierFormData>({
        name: '',
        email: '',
        phone: '',
        address: '',
        contact_person: '',
        status: 'active',
    });

    const [errors, setErrors] = useState<Partial<SupplierFormData>>({});

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Populate form when supplier data is loaded
    useEffect(() => {
        if (supplierResponse?.data) {
            const supplier = supplierResponse.data;
            setFormData({
                name: supplier.name || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                address: supplier.address || '',
                contact_person: supplier.contact_person || '',
                status: supplier.status || 'active',
            });
        }
    }, [supplierResponse]);

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
            showMessage('Supplier name is required', 'error');
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
            showMessage('Name must be at least 2 characters', 'error');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
            if (!newErrors.name) showMessage('Email is required', 'error');
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
            if (!newErrors.name) showMessage('Please enter a valid email address', 'error');
        }

        const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
            if (!newErrors.name && !newErrors.email) showMessage('Phone number is required', 'error');
        } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
            if (!newErrors.name && !newErrors.email) showMessage('Please enter a valid phone number', 'error');
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
            if (!newErrors.name && !newErrors.email && !newErrors.phone) showMessage('Address is required', 'error');
        } else if (formData.address.trim().length < 10) {
            newErrors.address = 'Address must be at least 10 characters';
            if (!newErrors.name && !newErrors.email && !newErrors.phone) showMessage('Address must be at least 10 characters', 'error');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const submitData = {
                id: id as string,
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                contact_person: formData.contact_person?.trim() || null,
                status: formData.status,
            };

            await updateSupplier(submitData).unwrap();

            showSuccessDialog('Success!', 'Supplier updated successfully');
            router.push('/suppliers/list');
        } catch (error: any) {
            console.error('Update supplier failed', error);
            const errorMessage = error?.data?.message || 'Something went wrong while updating the supplier';
            showErrorDialog('Error!', errorMessage, 'Try Again');
        }
    };

    if (!isClient || fetchLoading) {
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

    const supplier = supplierResponse?.data;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 shadow-md">
                                <User className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Edit Supplier</h1>
                                <p className="text-sm text-gray-500">Update supplier information for {supplier?.name}</p>
                            </div>
                        </div>
                    </div>
                    {supplier?.store_name && (
                        <div className="rounded-lg bg-orange-50 p-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                                    <Store className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-orange-900">Store: {supplier.store_name}</p>
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
                                            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500 ${
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
                                            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500 ${
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
                                            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500 ${
                                                errors.phone ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                    </div>

                                    {/* Contact Person */}
                                    <div className="md:col-span-2">
                                        <label htmlFor="contact_person" className="mb-2 block text-sm font-medium text-gray-700">
                                            Contact Person
                                        </label>
                                        <input
                                            id="contact_person"
                                            name="contact_person"
                                            type="text"
                                            value={formData.contact_person}
                                            onChange={handleChange}
                                            placeholder="Enter contact person name"
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                                        />
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
                                            className={`w-full resize-none rounded-lg border bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500 ${
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
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="blocked">Blocked</option>
                                        </select>
                                    </div>

                                    {/* Store Info (Read-only) */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Store</label>
                                        <input
                                            type="text"
                                            value={supplier?.store_name || 'N/A'}
                                            disabled
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
                                    <button
                                        type="button"
                                        onClick={() => router.push('/suppliers/list')}
                                        className="w-full rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-8 py-3 font-medium text-white transition-all duration-200 hover:from-orange-700 hover:to-red-700 focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[160px]"
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
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Update Supplier
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <div className="flex items-start gap-3">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-orange-800">
                            <p className="mb-1 font-medium">Update Guidelines:</p>
                            <ul className="space-y-1 text-orange-700">
                                <li>• Email changes may affect supplier login credentials</li>
                                <li>• Ensure contact information is current for better communication</li>
                                <li>• Blocked suppliers cannot participate in new transactions</li>
                                <li>• Contact person field is optional but recommended</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditSupplierPage;
