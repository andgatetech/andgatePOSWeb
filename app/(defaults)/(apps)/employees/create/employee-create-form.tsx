'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { RootState } from '@/store';
import { useGetAllPermissionsQuery,  } from '@/store/features/auth/authApi';
import { useStaffRegisterMutation } from '@/store/features/store/storeApi';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Shield, Store, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';

interface Permission {
    id: number;
    name: string;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
    address: string;
    role_in_store: string;
    permissions: number[]; // Store permission IDs
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
    phone?: string;
    address?: string;
}

const EmployeeCreateForm = () => {
    const router = useRouter();
    const { currentStoreId, currentStore } = useCurrentStore();
    const user = useSelector((state: RootState) => state.auth?.user);
    const [staffRegister, { isLoading: isSubmitting }] = useStaffRegisterMutation();
    const { data: permissionsResponse, isLoading: permissionsLoading } = useGetAllPermissionsQuery({});

    // Extract permissions array from response
    const allPermissions = useMemo(() => {
        return permissionsResponse?.data?.permissions || [];
    }, [permissionsResponse]);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        address: '',
        role_in_store: 'staff',
        permissions: [],
    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [selectAll, setSelectAll] = useState(false);

    // Group permissions by category (e.g., "products", "sales", etc.)
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};

        allPermissions.forEach((permission: Permission) => {
            const [category] = permission.name.split('.');
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(permission);
        });

        return groups;
    }, [allPermissions]);

    // Validate form
    const validateForm = () => {
        const errors: FormErrors = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }

        if (!formData.password.trim()) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (!formData.password_confirmation.trim()) {
            errors.password_confirmation = 'Please confirm your password';
        } else if (formData.password !== formData.password_confirmation) {
            errors.password_confirmation = 'Passwords do not match';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Prepare the data with required fields
            const staffData = {
                ...formData,
                store_id: currentStoreId,
                role: formData.role_in_store,
                subscription_user_id: user?.id,
                // Send 'all' as string if selectAll is true, otherwise send permissions array
                permissions: selectAll ? 'all' : formData.permissions,
            };

            console.log('Sending staff data:', staffData);

            await staffRegister(staffData).unwrap();

            await Swal.fire({
                title: 'Success!',
                text: 'Employee registered successfully!',
                icon: 'success',
                confirmButtonText: 'Go to Employees',
                confirmButtonColor: '#10b981',
                background: '#ffffff',
                color: '#374151',
                customClass: {
                    popup: 'rounded-xl shadow-2xl',
                    title: 'text-xl font-semibold',
                    confirmButton: 'rounded-lg px-4 py-2 font-medium',
                },
            });

            router.push('/employees');
        } catch (error: any) {
            console.error('Registration failed:', error);

            const errorMessage = error?.data?.message || 'Failed to register employee. Please try again.';

            await Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Try Again',
                confirmButtonColor: '#ef4444',
                background: '#ffffff',
                color: '#374151',
                customClass: {
                    popup: 'rounded-xl shadow-2xl',
                    title: 'text-xl font-semibold',
                    confirmButton: 'rounded-lg px-4 py-2 font-medium',
                },
            });
        }
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear specific error when user starts typing
        if (formErrors[name as keyof FormErrors]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // Handle permission toggle
    const handlePermissionToggle = (permissionId: number) => {
        setFormData((prev) => {
            const permissions = prev.permissions.includes(permissionId) ? prev.permissions.filter((id) => id !== permissionId) : [...prev.permissions, permissionId];

            return { ...prev, permissions };
        });
        setSelectAll(false); // Uncheck "Select All" when individual permissions are toggled
    };

    // Handle select all toggle
    const handleSelectAllToggle = () => {
        if (selectAll) {
            // Deselect all
            setSelectAll(false);
            setFormData((prev) => ({ ...prev, permissions: [] }));
        } else {
            // Select all
            setSelectAll(true);
            setFormData((prev) => ({ ...prev, permissions: allPermissions.map((p: Permission) => p.id) }));
        }
    };

    // Handle category toggle (select/deselect all permissions in a category)
    const handleCategoryToggle = (category: string) => {
        const categoryPermissions = groupedPermissions[category];
        const categoryPermissionIds = categoryPermissions.map((p) => p.id);
        const allSelected = categoryPermissionIds.every((id) => formData.permissions.includes(id));

        if (allSelected) {
            // Deselect all in category
            setFormData((prev) => ({
                ...prev,
                permissions: prev.permissions.filter((id) => !categoryPermissionIds.includes(id)),
            }));
        } else {
            // Select all in category
            setFormData((prev) => ({
                ...prev,
                permissions: [...new Set([...prev.permissions, ...categoryPermissionIds])],
            }));
        }
        setSelectAll(false);
    };

    if (permissionsLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading permissions...</p>
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
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Create New Employee</h1>
                                <p className="text-sm text-gray-500">{currentStore ? `Add a new employee to ${currentStore.store_name}` : 'Add a new employee to your team'}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.push('/employees')}
                            className="flex items-center space-x-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Employees</span>
                        </button>
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
                <form onSubmit={handleSubmit}>
                    <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                        <div className="p-8">
                            <h2 className="mb-6 text-xl font-semibold text-gray-900">Employee Information</h2>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                                                formErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                            }`}
                                            placeholder="Enter employee full name"
                                        />
                                        {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                                                formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                            }`}
                                            placeholder="Enter email address"
                                        />
                                        {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 ${
                                                    formErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                }`}
                                                placeholder="Enter password (min. 6 characters)"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {formErrors.password && <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Confirm Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="password_confirmation"
                                                value={formData.password_confirmation}
                                                onChange={handleInputChange}
                                                className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 ${
                                                    formErrors.password_confirmation
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                }`}
                                                placeholder="Re-enter password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {formErrors.password_confirmation && <p className="mt-1 text-xs text-red-500">{formErrors.password_confirmation}</p>}
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Phone */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Phone Number</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter phone number"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Address</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter address"
                                        />
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Role <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="role_in_store"
                                            value={formData.role_in_store}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="staff">Staff</option>
                                            <option value="cashier">Cashier</option>
                                            <option value="manager">Manager</option>
                                            <option value="store admin">Store Admin</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Permissions Section */}
                            <div className="mt-8 border-t pt-8">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Shield className="h-6 w-6 text-blue-600" />
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Permissions</h2>
                                            <p className="text-sm text-gray-500">Select the permissions for this employee</p>
                                        </div>
                                    </div>

                                    {/* Select All Checkbox */}
                                    <div className="flex items-center space-x-2 rounded-lg bg-blue-50 px-4 py-2">
                                        <input
                                            type="checkbox"
                                            id="selectAll"
                                            checked={selectAll}
                                            onChange={handleSelectAllToggle}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <label htmlFor="selectAll" className="cursor-pointer text-sm font-medium text-blue-900">
                                            Select All Permissions
                                        </label>
                                    </div>
                                </div>

                                {/* Permissions Grid */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {Object.entries(groupedPermissions).map(([category, permissions]) => {
                                        const categoryPermissionIds = permissions.map((p) => p.id);
                                        const allSelected = categoryPermissionIds.every((id) => formData.permissions.includes(id) || selectAll);
                                        const someSelected = categoryPermissionIds.some((id) => formData.permissions.includes(id)) && !allSelected;

                                        return (
                                            <div key={category} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                {/* Category Header */}
                                                <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-3">
                                                    <h3 className="text-sm font-semibold uppercase text-gray-700">{category}</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCategoryToggle(category)}
                                                        className={`text-xs font-medium transition-colors ${allSelected ? 'text-red-600 hover:text-red-700' : 'text-blue-600 hover:text-blue-700'}`}
                                                    >
                                                        {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
                                                    </button>
                                                </div>

                                                {/* Permissions List */}
                                                <div className="space-y-2">
                                                    {permissions.map((permission) => {
                                                        const isChecked = formData.permissions.includes(permission.id) || selectAll;
                                                        const [, action] = permission.name.split('.');

                                                        return (
                                                            <div key={permission.id} className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`permission-${permission.id}`}
                                                                    checked={isChecked}
                                                                    onChange={() => handlePermissionToggle(permission.id)}
                                                                    disabled={selectAll}
                                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                                                />
                                                                <label htmlFor={`permission-${permission.id}`} className="flex-1 cursor-pointer text-sm text-gray-700">
                                                                    {action || permission.name}
                                                                </label>
                                                                {isChecked && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Selected Count */}
                                <div className="mt-4 rounded-lg bg-blue-50 p-4">
                                    <p className="text-sm text-blue-900">
                                        <span className="font-semibold">{selectAll ? 'All' : formData.permissions.length}</span> permission{formData.permissions.length !== 1 ? 's' : ''} selected
                                        {selectAll && ` (${allPermissions.length} total)`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form Footer */}
                        <div className="border-t bg-gray-50 px-8 py-6">
                            <div className="flex items-center justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/employees')}
                                    disabled={isSubmitting}
                                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="group relative inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Users className="mr-2 h-5 w-5" />
                                            Create Employee
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeCreateForm;
