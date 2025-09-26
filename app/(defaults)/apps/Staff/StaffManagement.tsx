'use client';
import StaffFilter from '@/components/filters/StaffFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { RootState } from '@/store';
import { useGetStaffMemberQuery, useStaffRegisterMutation } from '@/store/features/store/storeApi';
import { CheckCircle, ChevronDown, ChevronUp, Eye, EyeOff, Mail, Plus, Shield, User, Users, X, XCircle } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

interface StaffMember {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    role_in_store: string;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
    address: string;
    role_in_store: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
    phone?: string;
    address?: string;
}

const StaffManagement = () => {
    const { currentStoreId, userStores } = useCurrentStore();
    const user = useSelector((state: RootState) => state.auth?.user);
    const [staffRegister] = useStaffRegisterMutation();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});

    // Build query parameters based on filter state
    let queryParams: Record<string, any> = {};

    if (Object.keys(apiParams).length > 0) {
        // Filter is active - build parameters from filter

        // Handle store filtering
        if (apiParams.storeId === 'all' || apiParams.store_ids === 'all') {
            // "All Stores" selected - send all user's store IDs as comma-separated string
            const allStoreIds = userStores.map((store: any) => store.id);
            queryParams.store_ids = allStoreIds.join(',');
        } else if (apiParams.store_id) {
            // Specific store ID from filter
            queryParams.store_id = apiParams.store_id;
        } else if (apiParams.storeId && apiParams.storeId !== 'all') {
            // Specific store selected in filter dropdown
            queryParams.store_id = apiParams.storeId;
        } else {
            // No specific store in filter - use current store from sidebar
            if (currentStoreId) {
                queryParams.store_id = currentStoreId;
            }
        }

        // Handle other filters
        if (apiParams.search) queryParams.search = apiParams.search;
        if (apiParams.role) queryParams.role = apiParams.role;
        if (apiParams.dateRange?.startDate) queryParams.start_date = apiParams.dateRange.startDate;
        if (apiParams.dateRange?.endDate) queryParams.end_date = apiParams.dateRange.endDate;
    } else {
        // No filter active - use current store from sidebar (default behavior)
        if (currentStoreId) {
            queryParams.store_id = currentStoreId;
        }
    }

    const { data: staffResponse, isLoading, refetch } = useGetStaffMemberQuery(queryParams);
    const staffMembers = useMemo(() => (staffResponse?.data || []) as StaffMember[], [staffResponse?.data]);

    // State management
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [showModal, setShowModal] = useState(false);

    // Form state for new staff
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        address: '',
        role_in_store: 'staff',
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Reset filter when current store changes from sidebar
    useEffect(() => {
        console.log('Staff - Current store changed, resetting filters');
        setApiParams({});
    }, [currentStoreId]);

    // Handle filter changes from UniversalFilter - RTK Query will auto-refetch when queryParams change
    const handleFilterChange = useCallback(
        (newApiParams: Record<string, any>) => {
            console.log('Staff - Filter changed:', newApiParams);
            console.log('Staff - Current store from sidebar:', currentStoreId);
            setApiParams(newApiParams);
        },
        [currentStoreId]
    );

    console.log('Staff - API Params:', apiParams);
    console.log('Staff - Final Query Params:', queryParams);
    console.log('Staff - Current Store ID:', currentStoreId);
    console.log(
        'Staff - Available User Stores:',
        userStores.map((s) => ({ id: s.id, name: s.store_name }))
    );

    // Toast notification
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-0 ${
            type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    };

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

        setIsSubmitting(true);

        try {
            // Prepare the data with required fields
            const staffData = {
                ...formData,
                store_id: currentStoreId,
                role: formData.role_in_store, // Map role_in_store to role
                subscription_user_id: user?.id, // Store admin's ID from Redux
            };

            console.log('Sending staff data:', staffData);
            console.log('Current Store ID:', currentStoreId);
            console.log('User ID:', user?.id);

            await staffRegister(staffData).unwrap();
            showToast('Staff member registered successfully!', 'success');
            setShowModal(false);
            setFormData({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                phone: '',
                address: '',
                role_in_store: 'staff',
            });
            setShowPassword(false);
            setShowConfirmPassword(false);
            refetch(); // Refresh the staff list
        } catch (error: any) {
            console.error('Registration failed:', error);
            showToast(error?.data?.message || 'Failed to register staff member', 'error');
        } finally {
            setIsSubmitting(false);
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

    // Get role badge styling
    const getRoleBadge = (role: string) => {
        const roleStyles: Record<string, string> = {
            'store admin': 'bg-purple-100 text-purple-800',
            manager: 'bg-blue-100 text-blue-800',
            staff: 'bg-green-100 text-green-800',
            cashier: 'bg-yellow-100 text-yellow-800',
        };

        return roleStyles[role] || 'bg-gray-100 text-gray-800';
    };

    // Get status badge styling
    const getStatusBadge = (status: string) => {
        return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    // Sort staff members (filtering is now done by backend)
    const filteredAndSortedStaff = useMemo(() => {
        if (!staffMembers || staffMembers.length === 0) return [];

        // Sort staff (no filtering needed since backend handles it)
        let sorted = [...staffMembers].sort((a: StaffMember, b: StaffMember) => {
            let aValue = (a as any)[sortField] || '';
            let bValue = (b as any)[sortField] || '';

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return sorted;
    }, [staffMembers, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedStaff.length / itemsPerPage);
    const currentStaff = filteredAndSortedStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Handle sorting
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [apiParams]);

    // Get stats
    const getStats = () => {
        if (!staffMembers || staffMembers.length === 0) return { total: 0, admins: 0, staff: 0, managers: 0 };

        return {
            total: staffMembers.length,
            admins: staffMembers.filter((s: StaffMember) => s.role_in_store === 'store admin').length,
            staff: staffMembers.filter((s: StaffMember) => s.role_in_store === 'staff').length,
            managers: staffMembers.filter((s: StaffMember) => s.role_in_store === 'manager').length,
        };
    };

    const stats = getStats();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading staff members...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Staff Page Header */}
            <section className="mb-8">
                <div className="rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                                <p className="text-sm text-gray-500">Manage your team members and their roles</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowModal(true)}
                                className="group relative inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <Plus className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                                Add Staff Member
                                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            <StaffFilter key={`staff-filter-${currentStoreId}`} onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />

            <div className="mx-auto max-w-7xl p-6">
                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Administrators</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                            </div>
                            <Shield className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Staff Members</p>
                                <p className="text-2xl font-bold text-green-600">{stats.staff}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Managers</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.managers}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="cursor-pointer px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100" onClick={() => handleSort('name')}>
                                        <div className="flex items-center gap-2">
                                            Name
                                            {sortField === 'name' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th className="cursor-pointer px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100" onClick={() => handleSort('email')}>
                                        <div className="flex items-center gap-2">
                                            Email
                                            {sortField === 'email' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                                        onClick={() => handleSort('role_in_store')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Role
                                            {sortField === 'role_in_store' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Phone</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Address</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {currentStaff.map((staff: StaffMember, index: number) => (
                                    <tr key={staff.id || index} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                                                        <User className="h-6 w-6 text-gray-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900">{staff.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail className="mr-2 h-4 w-4" />
                                                {staff.email}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getRoleBadge(staff.role_in_store)}`}>{staff.role_in_store}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{staff.phone || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="max-w-xs truncate" title={staff.address}>
                                                {staff.address || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                            <button className="mr-3 text-indigo-600 hover:text-indigo-900">Edit</button>
                                            <button className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="border-t border-gray-200 bg-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedStaff.length)} of {filteredAndSortedStaff.length} staff
                                    members
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`rounded-md px-3 py-1 text-sm font-medium ${
                                                    currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {currentStaff.length === 0 && (
                        <div className="py-12 text-center">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {Object.keys(apiParams).length > 0 ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first staff member.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={() => {
                                setShowModal(false);
                                setShowPassword(false);
                                setShowConfirmPassword(false);
                            }}
                        ></div>

                        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Staff Member</h3>
                                            <p className="text-sm text-gray-500">Fill in the details to add a new staff member</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowModal(false);
                                                setShowPassword(false);
                                                setShowConfirmPassword(false);
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                                        {/* Left Column */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Full Name *</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                                                        formErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                    }`}
                                                    placeholder="Enter full name"
                                                />
                                                {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Email Address *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                                                        formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                    }`}
                                                    placeholder="Enter email address"
                                                />
                                                {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Password *</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 ${
                                                            formErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                        }`}
                                                        placeholder="Enter password (min. 6 characters)"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Confirm Password *</label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        name="password_confirmation"
                                                        value={formData.password_confirmation}
                                                        onChange={handleInputChange}
                                                        className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 ${
                                                            formErrors.password_confirmation
                                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                        }`}
                                                        placeholder="Confirm password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                {formErrors.password_confirmation && <p className="mt-1 text-sm text-red-600">{formErrors.password_confirmation}</p>}
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Role *</label>
                                                <select
                                                    name="role_in_store"
                                                    value={formData.role_in_store}
                                                    onChange={handleInputChange}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="staff">Staff</option>
                                                    <option value="manager">Manager</option>
                                                    <option value="cashier">Cashier</option>
                                                    <option value="store_admin">Store Admin</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
                                                <textarea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    rows={4}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder="Enter address"
                                                />
                                            </div>

                                            {/* Store Info (Read-only display) */}
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Store</label>
                                                <input
                                                    type="text"
                                                    value={userStores.find((store) => store.id === currentStoreId)?.store_name || 'Current Store'}
                                                    disabled
                                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-3 sm:w-auto"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Staff Member
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setShowPassword(false);
                                            setShowConfirmPassword(false);
                                        }}
                                        disabled={isSubmitting}
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0 sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
