'use client';

import { useAllStoresQuery } from '@/store/features/store/storeApi';
import { useDeleteSupplierMutation, useGetSuppliersQuery } from '@/store/features/supplier/supplierApi';
import { Edit, Filter, MoreVertical, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

// Toast function for notifications
const showToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') toast.success(message);
    else toast.error(message);
};

interface Supplier {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

const SuppliersPage = () => {
    // States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    // New state for selected store
    const [selectedStore, setSelectedStore] = useState('');

    // API hooks
    const {
        data: suppliersResponse,
        isLoading,
        error,
        refetch,
    } = useGetSuppliersQuery({
        search: searchTerm,
        store_id: selectedStore,
    });
    const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();

    const suppliers: Supplier[] = suppliersResponse?.data?.data || [];

    // API hook for all stores
    const { data: storesResponse } = useAllStoresQuery();
    const stores = storesResponse?.data || [];

    // Filter suppliers based on search term and status
    // const filteredSuppliers = useMemo(() => {
    //     return suppliers.filter((supplier) => {
    //         const matchesSearch =
    //             supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) || supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) || supplier.phone.includes(searchTerm);

    //         const matchesStatus = !statusFilter || supplier.status === statusFilter;

    //         return matchesSearch && matchesStatus;
    //     });
    // }, [suppliers, searchTerm, statusFilter]);

    // Update filteredSuppliers to include store filter
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter((supplier) => {
            const matchesSearch =
                supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) || supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) || supplier.phone.includes(searchTerm);

            const matchesStatus = !statusFilter || supplier.status === statusFilter;

            const matchesStore = !selectedStore || supplier.store_id === Number(selectedStore);

            return matchesSearch && matchesStatus && matchesStore;
        });
    }, [suppliers, searchTerm, statusFilter, selectedStore]);

    // Handle delete supplier with SweetAlert2 and react-toastify
    const handleDeleteSupplier = async (supplier: Supplier) => {
        try {
            const result = await Swal.fire({
                title: 'Delete Supplier',
                text: `Are you sure you want to delete "${supplier.name}"? This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, Delete',
                cancelButtonText: 'Cancel',
                reverseButtons: true,
                customClass: {
                    confirmButton: 'bg-red-600 hover:bg-red-700',
                    cancelButton: 'bg-gray-500 hover:bg-gray-600',
                },
            });

            if (result.isConfirmed) {
                await deleteSupplier(supplier.id).unwrap();

                // Show success toast
                showToast('Supplier deleted successfully!', 'success');

                // Show success SweetAlert
                await Swal.fire({
                    title: 'Deleted!',
                    text: `${supplier.name} has been deleted successfully.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });

                // Refresh the list
                refetch();
            }
        } catch (error: any) {
            console.error('Delete supplier failed:', error);
            const errorMessage = error?.data?.message || 'Failed to delete supplier. Please try again.';

            // Show error toast
            showToast(errorMessage, 'error');

            // Show error SweetAlert
            await Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
    };

    // Count active filters
    // const activeFiltersCount = useMemo(() => {
    //     let count = 0;
    //     if (searchTerm) count++;
    //     if (statusFilter) count++;
    //     return count;
    // }, [searchTerm, statusFilter]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (searchTerm) count++;
        if (statusFilter) count++;
        if (selectedStore) count++;
        return count;
    }, [searchTerm, statusFilter, selectedStore]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-md border border-red-200 bg-red-50 p-4">
                        <div className="text-red-800">
                            <h3 className="text-lg font-medium">Error Loading Suppliers</h3>
                            <p className="mt-1">Please try again later.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
                            <p className="mt-1 text-gray-600">Manage your suppliers and their information</p>
                        </div>
                        <Link
                            href="/apps/suppliers/create-supplier"
                            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Supplier
                        </Link>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center gap-4">
                        {/* Search Input */}
                        <div className="min-w-64 flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search suppliers by name, email, or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                showFilters || activeFiltersCount > 0 ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                            {activeFiltersCount > 0 && <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">{activeFiltersCount}</span>}
                        </button>

                        {/* Clear Filters */}
                        {activeFiltersCount > 0 && (
                            <button onClick={clearFilters} className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                                <X className="mr-1 h-4 w-4" />
                                Clear
                            </button>
                        )}

                        {/* Refresh */}
                        <button
                            onClick={refetch}
                            disabled={isLoading}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Advanced Filters */}
                    {/* {showFilters && (
                        <div className="border-t pt-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )} */}

                    {showFilters && (
                        <div className="border-t pt-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Store</label>
                                    <select
                                        value={selectedStore}
                                        onChange={(e) => setSelectedStore(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Stores</option>
                                        {stores.map((store) => (
                                            <option key={store.id} value={store.id}>
                                                {store.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Existing Status Filter */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Active Filters Display */}
                {activeFiltersCount > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {searchTerm && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                                Search: "{searchTerm}"
                                <button onClick={() => setSearchTerm('')} className="ml-2 text-blue-600 hover:text-blue-800">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {statusFilter && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                                Status: {statusFilter}
                                <button onClick={() => setStatusFilter('')} className="ml-2 text-blue-600 hover:text-blue-800">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {/* Results Summary */}
                <div className="mb-4 text-sm text-gray-600">
                    Showing {filteredSuppliers.length} of {suppliers.length} suppliers
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Address</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <tr key={index} className="animate-pulse">
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-32 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-48 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-64 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-6 w-16 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-24 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="ml-auto h-8 w-8 rounded bg-gray-200"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredSuppliers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <Search className="mb-4 h-12 w-12 text-gray-300" />
                                                <h3 className="mb-1 text-lg font-medium text-gray-900">No suppliers found</h3>
                                                <p className="mb-4 text-gray-500">{activeFiltersCount > 0 ? 'Try adjusting your search or filters' : 'Get started by adding your first supplier'}</p>
                                                {activeFiltersCount > 0 ? (
                                                    <button onClick={clearFilters} className="font-medium text-blue-600 hover:text-blue-500">
                                                        Clear all filters
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href="/apps/suppliers/create"
                                                        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add First Supplier
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSuppliers.map((supplier) => (
                                        <tr key={supplier.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{supplier.email}</div>
                                                <div className="text-sm text-gray-500">{supplier.phone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs truncate text-sm text-gray-900" title={supplier.address}>
                                                    {supplier.address}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                        supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {supplier.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(supplier.created_at).toLocaleDateString()}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setOpenDropdown(openDropdown === supplier.id ? null : supplier.id)}
                                                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>

                                                    {openDropdown === supplier.id && (
                                                        <div className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                                            <div className="py-1">
                                                                <Link
                                                                    href={`/apps/suppliers/${supplier.id}`}
                                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                    onClick={() => setOpenDropdown(null)}
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                                <button
                                                                    onClick={() => {
                                                                        setOpenDropdown(null);
                                                                        handleDeleteSupplier(supplier);
                                                                    }}
                                                                    className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                                                    disabled={isDeleting}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Click outside to close dropdown */}
            {openDropdown && <div className="fixed inset-0 z-0" onClick={() => setOpenDropdown(null)} />}
        </div>
    );
};

export default SuppliersPage;
