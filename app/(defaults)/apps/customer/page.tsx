'use client';
import { useDeleteCustomerMutation, useGetStoreCustomersListQuery } from '@/store/features/customer/customer';
import { useAllStoresQuery } from '@/store/features/store/storeApi';
import { Award, ChevronLeft, ChevronRight, Crown, Edit, MoreVertical, Plus, Search, Shield, Star, Store, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import CreateCustomerModal from './__components/CreateCustomerModal';
import UpdateCustomerModal from './__components/UpdateCustomerModal';

// Action Dropdown Component
const ActionDropdown = ({ customer, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleEdit = () => {
        onEdit(customer);
        setIsOpen(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete customer "${customer.name}"? This action cannot be undone.`)) {
            onDelete(customer.id);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <MoreVertical className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <button onClick={handleEdit} className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Edit className="mr-3 h-4 w-4" />
                        Edit Customer
                    </button>
                    <button onClick={handleDelete} className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                        <Trash2 className="mr-3 h-4 w-4" />
                        Delete Customer
                    </button>
                </div>
            )}
        </div>
    );
};

// Membership Badge Component
const MembershipBadge = ({ membership }) => {
    const getBadgeConfig = (membership) => {
        switch (membership) {
            case 'platinum':
                return {
                    icon: Crown,
                    bgColor: 'bg-purple-100',
                    textColor: 'text-purple-800',
                    borderColor: 'border-purple-200',
                    label: 'Platinum',
                };
            case 'gold':
                return {
                    icon: Award,
                    bgColor: 'bg-yellow-100',
                    textColor: 'text-yellow-800',
                    borderColor: 'border-yellow-200',
                    label: 'Gold',
                };
            case 'silver':
                return {
                    icon: Star,
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    borderColor: 'border-gray-200',
                    label: 'Silver',
                };
            default:
                return {
                    icon: Shield,
                    bgColor: 'bg-blue-100',
                    textColor: 'text-blue-800',
                    borderColor: 'border-blue-200',
                    label: 'Normal',
                };
        }
    };

    const config = getBadgeConfig(membership);
    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
            <IconComponent className="mr-1 h-3 w-3" />
            {config.label}
        </span>
    );
};

// Filters Component
const CustomerFilters = ({ filters, onFiltersChange, stores, isLoadingStores }) => {
    const handleFilterChange = (key, value) => {
        onFiltersChange({ ...filters, [key]: value, page: 1 }); // Reset to page 1 when filtering
    };

    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={filters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Store Filter */}
                <div>
                    <select
                        value={filters.store_id || ''}
                        onChange={(e) => handleFilterChange('store_id', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        disabled={isLoadingStores}
                    >
                        <option value="">All Stores</option>
                        {stores?.data?.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.store_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Membership Filter */}
                <div>
                    <select
                        value={filters.membership || ''}
                        onChange={(e) => handleFilterChange('membership', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Memberships</option>
                        <option value="normal">Normal</option>
                        <option value="silver">Silver</option>
                        <option value="gold">Gold</option>
                        <option value="platinum">Platinum</option>
                    </select>
                </div>

                {/* Per Page */}
                <div>
                    <select
                        value={filters.per_page || 10}
                        onChange={(e) => handleFilterChange('per_page', parseInt(e.target.value))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

// Customer Table Component
const CustomerTable = ({ customers, isLoading, onEdit, onDelete }) => {
    if (isLoading) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading customers...</p>
                </div>
            </div>
        );
    }

    if (!customers || customers.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="p-8 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Membership</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Points</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Balance</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {customers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                    <div className="text-sm text-gray-500">ID: {customer.id}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm text-gray-900">{customer.email}</div>
                                    <div className="text-sm text-gray-500">{customer.phone}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <MembershipBadge membership={customer.membership} />
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{customer.points.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <span className={`font-medium ${customer.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>৳{customer.balance}</span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {customer.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <ActionDropdown customer={customer} onEdit={onEdit} onDelete={onDelete} />
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

        // Adjust if we're near the beginning or end
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
        <div className="rounded-b-lg border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                    Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{total}</span> results
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onPageChange(current_page - 1)}
                        disabled={current_page === 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    {getPageNumbers().map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${
                                page === current_page ? 'z-10 border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => onPageChange(current_page + 1)}
                        disabled={current_page === last_page}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Customer List Component
const CustomerListSystem = () => {
    const [filters, setFilters] = useState({
        search: '',
        store_id: '',
        membership: '',
        per_page: 10,
        page: 1,
    });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Redux queries and mutations
    const { data: storesData, isLoading: isLoadingStores } = useAllStoresQuery();
    const { data: customersData, isLoading: isLoadingCustomers, error } = useGetStoreCustomersListQuery(filters);
    const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handlePageChange = (page) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        // The table will automatically refresh due to RTK Query cache invalidation
    };

    const handleUpdateSuccess = () => {
        setIsUpdateModalOpen(false);
        setSelectedCustomer(null);
        // The table will automatically refresh due to RTK Query cache invalidation
    };

    const handleEditCustomer = (customer) => {
        setSelectedCustomer(customer);
        setIsUpdateModalOpen(true);
    };

    const handleDeleteCustomer = async (customerId) => {
        try {
            await deleteCustomer(customerId).unwrap();
            // Success feedback could be added here (toast notification, etc.)
        } catch (error) {
            console.error('Failed to delete customer:', error);
            // Error handling could be improved with user feedback
            alert('Failed to delete customer. Please try again.');
        }
    };

    const selectedStore = useMemo(() => {
        if (!filters.store_id || !storesData?.data) return null;
        return storesData.data.find((store) => store.id == filters.store_id);
    }, [filters.store_id, storesData]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-red-800">Error loading customers. Please try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center text-2xl font-bold text-gray-900">
                            <Users className="mr-2 h-6 w-6" />
                            Customer Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage and view customer information across all stores
                            {selectedStore && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                    <Store className="mr-1 h-3 w-3" />
                                    {selectedStore.store_name}
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Create Customer Button */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Customer
                    </button>
                </div>

                {/* Filters */}
                <CustomerFilters filters={filters} onFiltersChange={handleFiltersChange} stores={storesData} isLoadingStores={isLoadingStores} />

                {/* Customer Table */}
                <CustomerTable customers={customersData?.data} isLoading={isLoadingCustomers || isDeleting} onEdit={handleEditCustomer} onDelete={handleDeleteCustomer} />

                {/* Pagination */}
                {customersData?.meta && <Pagination meta={customersData.meta} onPageChange={handlePageChange} />}

                {/* Create Customer Modal */}
                <CreateCustomerModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleCreateSuccess} />

                {/* Update Customer Modal */}
                <UpdateCustomerModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => {
                        setIsUpdateModalOpen(false);
                        setSelectedCustomer(null);
                    }}
                    onSuccess={handleUpdateSuccess}
                    customer={selectedCustomer}
                />
            </div>
        </div>
    );
};

export default CustomerListSystem;
