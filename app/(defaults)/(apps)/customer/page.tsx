'use client';
import Dropdown from '@/components/dropdown';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useDeleteCustomerMutation, useGetStoreCustomersListQuery } from '@/store/features/customer/customer';
import {
    Award,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Crown,
    Edit,
    Mail,
    MoreVertical,
    Phone,
    Plus,
    RotateCcw,
    Search,
    Shield,
    Star,
    Store,
    Trash2,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CreateCustomerModal from './__components/CreateCustomerModal';
import UpdateCustomerModal from './__components/UpdateCustomerModal';

// ==================== CUSTOMER FILTER COMPONENT ====================
// Separate filter component following JournalFilter pattern
const CustomerFilter = ({ onFilterChange, currentStoreId }) => {
    const [filters, setFilters] = useState({
        search: '',
        storeId: 'all',
        customFilters: {
            membership: '',
            per_page: 10,
            page: 1,
        },
    });

    // Get user stores from Redux
    const user = useSelector((state) => state.auth?.user);
    const userStores = useMemo(() => user?.stores || [], [user?.stores]);

    // Build API parameters
    const buildApiParams = useCallback(() => {
        const params = {};

        if (filters.search) {
            params.search = filters.search;
        }

        if (filters.storeId !== undefined) {
            if (filters.storeId === 'all') {
                const allStoreIds = userStores.map((store) => store.id);
                if (allStoreIds.length > 0) {
                    params.store_ids = allStoreIds.join(',');
                }
            } else {
                params.store_id = filters.storeId;
            }
        }

        if (filters.customFilters) {
            Object.assign(params, filters.customFilters);
        }

        return params;
    }, [filters, userStores]);

    // Send API params when filters change
    useEffect(() => {
        const apiParams = buildApiParams();
        onFilterChange(apiParams);
    }, [filters, buildApiParams, onFilterChange]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => {
            const newFilters = { ...prev };

            if (key === 'search') {
                newFilters.search = value;
                newFilters.customFilters = { ...prev.customFilters, page: 1 };
            } else if (key === 'storeId') {
                newFilters.storeId = value === '' ? 'all' : Number(value);
                newFilters.customFilters = { ...prev.customFilters, page: 1 };
            } else if (key === 'membership') {
                newFilters.customFilters = { ...prev.customFilters, membership: value, page: 1 };
            } else if (key === 'per_page') {
                newFilters.customFilters = { ...prev.customFilters, per_page: parseInt(value), page: 1 };
            }

            return newFilters;
        });
    };

    const handleReset = () => {
        setFilters({
            search: '',
            storeId: 'all',
            customFilters: {
                membership: '',
                per_page: 10,
                page: 1,
            },
        });
    };

    return (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <select
                        value={filters.storeId === 'all' ? '' : filters.storeId}
                        onChange={(e) => handleFilterChange('storeId', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Stores</option>
                        {userStores.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.store_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <select
                        value={filters.customFilters.membership}
                        onChange={(e) => handleFilterChange('membership', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Memberships</option>
                        <option value="normal">Normal</option>
                        <option value="silver">Silver</option>
                        <option value="gold">Gold</option>
                        <option value="platinum">Platinum</option>
                    </select>
                </div>

                <div>
                    <select
                        value={filters.customFilters.per_page}
                        onChange={(e) => handleFilterChange('per_page', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>

                <div>
                    <button
                        onClick={handleReset}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== MEMBERSHIP BADGE ====================
const MembershipBadge = ({ membership }) => {
    const getBadgeConfig = (membership) => {
        switch (membership) {
            case 'platinum':
                return { icon: Crown, bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-200', label: 'Platinum' };
            case 'gold':
                return { icon: Award, bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-200', label: 'Gold' };
            case 'silver':
                return { icon: Star, bgColor: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-gray-200', label: 'Silver' };
            default:
                return { icon: Shield, bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-200', label: 'Normal' };
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

// ==================== CUSTOMER TABLE ====================
const CustomerTable = ({ customers, isLoading, apiParams, sortField, sortDirection, onSort, onEdit, onDelete }) => {
    const formatCurrency = (amount) => {
        return `৳${new Intl.NumberFormat('en-BD').format(amount || 0)}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading customers...</p>
            </div>
        );
    }

    if (!customers || customers.length === 0) {
        return (
            <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-700">#</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-700">Customer</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-700">Contact</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-700">Membership</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-700">Points</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-700">Balance</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-700">Status</th>
                            <th className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase text-gray-700 hover:bg-gray-200" onClick={() => onSort('created_at')}>
                                <div className="flex items-center gap-2">
                                    Joined
                                    {sortField === 'created_at' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                </div>
                            </th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {customers.map((customer, index) => (
                            <tr key={customer.id} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="px-4 py-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-semibold text-blue-700">
                                        {index + 1 + ((apiParams?.page || 1) - 1) * (apiParams?.per_page || 10)}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="text-sm font-semibold text-gray-900">{customer.name}</div>
                                    <div className="text-xs text-gray-500">ID: {customer.id}</div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <span className="truncate">{customer.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            {customer.phone}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <MembershipBadge membership={customer.membership} />
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className="text-sm font-semibold">{customer.points.toLocaleString()}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            parseFloat(customer.balance) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {formatCurrency(customer.balance)}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {customer.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="text-sm font-medium text-gray-900">{formatDate(customer.created_at)}</div>
                                    <div className="text-xs text-gray-500">{new Date(customer.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                {/* <td className="px-4 py-4">
                                    <div className="flex gap-2">
                                        <button onClick={() => onEdit(customer)} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100" title="Edit">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => onDelete(customer.id, customer.name)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100" title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td> */}
                                <td className="px-4 py-4">
                                    <Dropdown
                                        offset={[0, 5]}
                                        placement="bottom-end"
                                        btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        button={<MoreVertical className="h-5 w-5" />}
                                    >
                                        <ul className="min-w-[140px] rounded-lg border bg-white shadow-lg">
                                            <li>
                                                <button onClick={() => onEdit(customer)} className="flex w-full items-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Entry
                                                </button>
                                            </li>
                                            <li className="border-t">
                                                <button
                                                    onClick={() => onDelete(customer.id, customer.name)}
                                                    className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Entry
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

// ==================== PAGINATION ====================
const Pagination = ({ meta, onPageChange }) => {
    if (!meta || meta.last_page <= 1) return null;

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
        <div className="mt-4 rounded-xl border bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{total}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onPageChange(current_page - 1)}
                        disabled={current_page === 1}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    {getPageNumbers().map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`rounded-lg border px-4 py-2 text-sm ${page === current_page ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => onPageChange(current_page + 1)}
                        disabled={current_page === last_page}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================
const CustomerListSystem = () => {
    // Replace with your actual hooks
    const { currentStoreId, currentStore } = useCurrentStore();

    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // API params state
    const [apiParams, setApiParams] = useState({});

    // RTK Query - replace with your actual import
    const { data: customersData, isLoading, error } = useGetStoreCustomersListQuery(apiParams);
    const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();

    const customers = customersData?.data || [];
    const meta = customersData?.meta;

    // Handle filter changes from CustomerFilter
    const handleFilterChange = useCallback((newApiParams) => {
        console.log('API Params changed:', newApiParams);
        setApiParams(newApiParams);
    }, []);

    // Reset filters when store changes
    useEffect(() => {
        console.log('Current store changed:', currentStoreId);
        setApiParams({});
    }, [currentStoreId]);

    // Sort customers
    const sortedCustomers = useMemo(() => {
        return [...customers].sort((a, b) => {
            let aValue = a[sortField] || '';
            let bValue = b[sortField] || '';

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            return sortDirection === 'asc' ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1;
        });
    }, [customers, sortField, sortDirection]);

    const handlePageChange = useCallback((page) => {
        setApiParams((prev) => ({ ...prev, page }));
    }, []);

    const handleSort = (field) => {
        setSortDirection(sortField === field && sortDirection === 'asc' ? 'desc' : 'asc');
        setSortField(field);
    };

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        toast.success('Customer created successfully!');
    };

    const handleUpdateSuccess = () => {
        setIsUpdateModalOpen(false);
        setSelectedCustomer(null);
        toast.success('Customer updated successfully!');
    };

    const handleEditCustomer = (customer) => {
        setSelectedCustomer(customer);
        setIsUpdateModalOpen(true);
    };

    const handleDeleteCustomer = async (customerId) => {
        try {
            await deleteCustomer(customerId).unwrap();
            toast.success('Customer deleted successfully!');
        } catch (error) {
            console.error('Failed to delete customer:', error);
            toast.error('Failed to delete customer. Please try again.');
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-red-800">Error loading customers. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="rounded-2xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-sm sm:p-6">
                        <div className="mb-4 sm:mb-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md sm:h-12 sm:w-12">
                                        <Users className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">Customer Management</h1>
                                        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                                            {currentStore ? (
                                                <span className="hidden sm:inline">Manage customers for {currentStore.store_name}</span>
                                            ) : (
                                                <span className="hidden sm:inline">Manage and view your customers</span>
                                            )}
                                            <span className="sm:hidden">Manage your customers</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto sm:px-5 sm:py-2.5"
                                >
                                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="hidden sm:inline">Create Customer</span>
                                    <span className="sm:hidden">Create New</span>
                                </button>
                            </div>
                        </div>

                        {currentStore && (
                            <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:h-8 sm:w-8">
                                        <Store className="h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-blue-900 sm:text-sm">
                                            <span className="hidden sm:inline">Current Store: </span>
                                            {currentStore.store_name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <CustomerFilter key={`customer-filter-${currentStoreId}`} onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />

                {/* Table */}
                <CustomerTable
                    customers={sortedCustomers}
                    isLoading={isLoading}
                    apiParams={apiParams}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onEdit={handleEditCustomer}
                    onDelete={handleDeleteCustomer}
                />

                {/* Pagination */}
                {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}

                {/* Modals */}
                {/* {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="rounded-lg bg-white p-6">
                            <h2 className="text-xl font-bold">Create Customer Modal</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="mt-4 rounded bg-gray-200 px-4 py-2">
                                Close
                            </button>
                        </div>
                    </div>
                )} */}
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
                {/* {isUpdateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="rounded-lg bg-white p-6">
                            <h2 className="text-xl font-bold">Update Customer: {selectedCustomer?.name}</h2>
                            <button onClick={() => setIsUpdateModalOpen(false)} className="mt-4 rounded bg-gray-200 px-4 py-2">
                                Close
                            </button>
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default CustomerListSystem;
