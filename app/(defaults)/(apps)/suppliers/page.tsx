'use client';

import Dropdown from '@/components/dropdown';
import { useFullStoreListWithFilterQuery } from '@/store/features/store/storeApi';
import { useDeleteSupplierMutation, useGetSuppliersQuery } from '@/store/features/supplier/supplierApi';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Edit, MoreVertical, Plus, RotateCcw, Search, Store as StoreIcon, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

interface Supplier {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: 'active' | 'inactive';
    store_id?: number;
    store?: {
        id: number;
        store_name: string;
    };
    created_at: string;
    updated_at: string;
}

interface Store {
    id: number;
    store_name: string;
}

// Filters Component
const SupplierFilters = ({ filters, onFiltersChange, stores, isLoadingStores, currentStoreId }) => {
    const handleFilterChange = (key: string, value: any) => {
        onFiltersChange({ ...filters, [key]: value, page: 1 });
    };

    const handleReset = () => {
        const resetFilters = {
            search: '',
            store_id: currentStoreId || '',
            status: '',
            per_page: 10,
            page: 1,
        };
        onFiltersChange(resetFilters);
    };

    return (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {/* Search */}
                <div className="relative sm:col-span-2 lg:col-span-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={filters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Store Filter */}
                <div className="w-full">
                    <select
                        value={filters.store_id || ''}
                        onChange={(e) => handleFilterChange('store_id', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        disabled={isLoadingStores}
                    >
                        <option value="">All Stores</option>
                        {stores?.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.store_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div className="w-full">
                    <select
                        value={filters.status || ''}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                {/* Reset Button */}
                <div className="w-full">
                    <button
                        onClick={handleReset}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-600 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        title="Reset Filters"
                    >
                        <RotateCcw className="h-4 w-4" />
                        <span className="text-sm">Reset</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Supplier Table Component
const SupplierTable = ({ suppliers, isLoading, onEdit, onDelete, sortField, sortDirection, onSort }) => {
    if (isLoading) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading suppliers...</p>
                </div>
            </div>
        );
    }

    if (!suppliers || suppliers.length === 0) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-8 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No suppliers found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th
                                className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-200"
                                onClick={() => onSort('name')}
                            >
                                <div className="flex items-center gap-2">
                                    Supplier
                                    {sortField === 'name' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                </div>
                            </th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Contact</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Store</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Address</th>
                            <th
                                className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-200"
                                onClick={() => onSort('status')}
                            >
                                <div className="flex items-center gap-2">
                                    Status
                                    {sortField === 'status' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                </div>
                            </th>
                            <th
                                className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-200"
                                onClick={() => onSort('created_at')}
                            >
                                <div className="flex items-center gap-2">
                                    Created
                                    {sortField === 'created_at' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                </div>
                            </th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {suppliers.map((supplier, index) => (
                            <tr key={supplier.id} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="px-4 py-4">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 flex-shrink-0">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                                                <Users className="h-6 w-6 text-purple-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-semibold text-gray-900">{supplier.name}</div>
                                            <div className="text-xs text-gray-500">ID: {supplier.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="text-sm text-gray-900">{supplier.email}</div>
                                    <div className="text-xs text-gray-500">{supplier.phone}</div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center">
                                        <StoreIcon className="mr-2 h-4 w-4 text-purple-500" />
                                        <div className="text-sm font-medium text-gray-900">{supplier.store?.store_name || '-'}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="max-w-xs truncate text-sm text-gray-900" title={supplier.address}>
                                        {supplier.address}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {supplier.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">{formatDate(supplier.created_at)}</td>
                                <td className="px-4 py-4">
                                    <Dropdown
                                        offset={[0, 5]}
                                        placement="bottom-end"
                                        btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        button={<MoreVertical className="h-5 w-5" />}
                                    >
                                        <ul className="min-w-[140px] rounded-lg border bg-white shadow-lg">
                                            <li>
                                                <button onClick={() => onEdit(supplier.id)} className="flex w-full items-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Supplier
                                                </button>
                                            </li>
                                            <li className="border-t">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`Are you sure you want to delete supplier "${supplier.name}"? This action cannot be undone.`)) {
                                                            onDelete(supplier);
                                                        }
                                                    }}
                                                    className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Supplier
                                                </button>
                                            </li>
                                        </ul>
                                    </Dropdown>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Pagination Component
const Pagination = ({ meta, onPageChange }) => {
    if (!meta || meta.last_page <= 1) {
        return null;
    }

    const { current_page, last_page, total, per_page } = meta;

    const getPageNumbers = () => {
        const pages = [];
        const showPages = 5;
        const halfShow = Math.floor(showPages / 2);

        let start = Math.max(1, current_page - halfShow);
        let end = Math.min(last_page, current_page + halfShow);

        if (end - start < showPages - 1) {
            if (start === 1) {
                end = Math.min(last_page, start + showPages - 1);
            } else {
                start = Math.max(1, end - showPages + 1);
            }
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    const startItem = (current_page - 1) * per_page + 1;
    const endItem = Math.min(current_page * per_page, total);

    return (
        <div className="rounded-b-xl border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-center text-sm text-gray-700 sm:text-left">
                    Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{total}</span> results
                </div>

                <div className="flex items-center justify-center space-x-2">
                    <button
                        onClick={() => onPageChange(current_page - 1)}
                        disabled={current_page === 1}
                        className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="hidden sm:flex sm:items-center sm:space-x-2">
                        {getPageNumbers().map((page) => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`relative inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                                    page === current_page ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center sm:hidden">
                        <span className="text-sm text-gray-700">
                            Page {current_page} of {last_page}
                        </span>
                    </div>

                    <button
                        onClick={() => onPageChange(current_page + 1)}
                        disabled={current_page === last_page}
                        className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Suppliers Component
const SuppliersPage = () => {
    const currentStore = useSelector((state: any) => state.auth.currentStore);
    const currentStoreId = useSelector((state: any) => state.auth.currentStoreId);

    const [filters, setFilters] = useState({
        search: '',
        store_id: currentStoreId || '',
        status: '',
        per_page: 10,
        page: 1,
    });

    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    useEffect(() => {
        if (currentStoreId) {
            setFilters((prev) => ({
                ...prev,
                store_id: currentStoreId,
                page: 1,
            }));
        }
    }, [currentStoreId]);

    const queryArgs = useMemo(
        () => ({
            search: filters.search || undefined,
            store_id: filters.store_id || undefined,
            status: filters.status || undefined,
        }),
        [filters.search, filters.store_id, filters.status]
    );

    // API hooks
    const { data: suppliersResponse, isLoading, error } = useGetSuppliersQuery(queryArgs);
    const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();
    const { data: storesData, isLoading: isLoadingStores } = useFullStoreListWithFilterQuery();

    const suppliers: Supplier[] = suppliersResponse?.data?.data || [];

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const handleEditSupplier = (supplierId: number) => {
        window.location.href = `/apps/suppliers/${supplierId}`;
    };

    const handleDeleteSupplier = async (supplier: Supplier) => {
        try {
            await deleteSupplier(supplier.id).unwrap();
            toast.success('Supplier deleted successfully!');
        } catch (error: any) {
            console.error('Failed to delete supplier:', error);
            toast.error('Failed to delete supplier. Please try again.');
        }
    };

    // Sort suppliers
    const sortedSuppliers = [...suppliers].sort((a, b) => {
        let aValue = a[sortField] || '';
        let bValue = b[sortField] || '';

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

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-red-800">Error loading suppliers. Please try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="rounded-2xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-sm sm:p-6">
                        <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 shadow-md sm:h-12 sm:w-12">
                                    <Users className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">Supplier Management</h1>
                                    <p className="mt-1 truncate text-xs text-gray-500 sm:text-sm">
                                        {currentStore ? `Manage suppliers for ${currentStore.store_name}` : 'Manage and organize your suppliers'}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/suppliers/create-supplier"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:w-auto"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Supplier</span>
                            </Link>
                        </div>
                        {currentStore && (
                            <div className="rounded-lg bg-purple-50 p-3 sm:p-4">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 sm:h-8 sm:w-8">
                                        <StoreIcon className="h-3.5 w-3.5 text-purple-600 sm:h-4 sm:w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-purple-900 sm:text-sm">Current Store: {currentStore.store_name}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <SupplierFilters filters={filters} onFiltersChange={handleFiltersChange} stores={storesData?.data} isLoadingStores={isLoadingStores} currentStoreId={currentStoreId} />

                {/* Supplier Table */}
                <SupplierTable
                    suppliers={sortedSuppliers}
                    isLoading={isLoading || isDeleting}
                    onEdit={handleEditSupplier}
                    onDelete={handleDeleteSupplier}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                />

                {/* Pagination */}
                {suppliersResponse?.data?.meta && <Pagination meta={suppliersResponse.data.meta} onPageChange={handlePageChange} />}
            </div>
        </div>
    );
};

export default SuppliersPage;
