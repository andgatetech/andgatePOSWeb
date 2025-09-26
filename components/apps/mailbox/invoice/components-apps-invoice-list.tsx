'use client';

import OrderItemsModal from '@/components/apps/mailbox/invoice/ordeo_items_modal';
import InvoiceModal from '@/__components/InvoiceModal';
import { useGetAllOrdersQuery } from '@/store/features/Order/Order';
import { useAllStoresQuery } from '@/store/features/store/storeApi';
import { debounce } from 'lodash';
import { Eye, FileText, Filter, MoreVertical, Printer, RefreshCw, Search, X, ShoppingBag, Calendar, DollarSign } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

// Smart Action Dropdown Component (reusing our floating dropdown)
const OrderActionDropdown = ({ order }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, placement: 'bottom-right' });
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

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

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = 192; // w-48 = 12rem = 192px
            const dropdownHeight = 120; // Approximate height of 3 menu items
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let top = buttonRect.bottom + 8; // 8px margin
            let left = buttonRect.right - dropdownWidth;
            let placement = 'bottom-right';

            // Check if dropdown fits below the button
            if (top + dropdownHeight > viewportHeight) {
                // Position above the button
                top = buttonRect.top - dropdownHeight - 8;
                placement = placement.replace('bottom', 'top');
            }

            // Check if dropdown fits on the right side
            if (left < 0) {
                // Position on the left side of the button
                left = buttonRect.left;
                placement = placement.replace('right', 'left');
            }

            // Ensure dropdown doesn't go beyond viewport bounds
            if (left + dropdownWidth > viewportWidth) {
                left = viewportWidth - dropdownWidth - 8;
            }
            if (left < 8) {
                left = 8;
            }

            setPosition({ top, left, placement });
        }
    }, [isOpen]);

    const handleViewDetails = () => {
        setDetailsModalOpen(true);
        setIsOpen(false);
    };

    const handleViewInvoice = () => {
        setInvoiceModalOpen(true);
        setIsOpen(false);
    };

    const handleViewReceipt = () => {
        setReceiptModalOpen(true);
        setIsOpen(false);
    };

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <button
                    ref={buttonRef}
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <MoreVertical className="h-4 w-4" />
                </button>
            </div>

            {/* Portal-like dropdown positioned absolutely to viewport */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: position.top,
                        left: position.left,
                        zIndex: 9999,
                    }}
                    className="w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                    <button onClick={handleViewDetails} className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Eye className="mr-3 h-4 w-4" />
                        View Details
                    </button>
                    <button onClick={handleViewInvoice} className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <FileText className="mr-3 h-4 w-4" />
                        View Invoice
                    </button>
                    <button onClick={handleViewReceipt} className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Printer className="mr-3 h-4 w-4" />
                        View Receipt
                    </button>
                </div>
            )}

            {/* Modals */}
            <OrderItemsModal open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} order={order} />
            <InvoiceModal open={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} order={order} />
            {/* <ReceiptModal open={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} order={order} /> */}
        </>
    );
};

// Payment Status Badge Component
const PaymentStatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return {
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-800',
                    label: 'Paid',
                };
            case 'pending':
                return {
                    bgColor: 'bg-yellow-100',
                    textColor: 'text-yellow-800',
                    label: 'Pending',
                };
            case 'failed':
                return {
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-800',
                    label: 'Failed',
                };
            case 'refunded':
                return {
                    bgColor: 'bg-purple-100',
                    textColor: 'text-purple-800',
                    label: 'Refunded',
                };
            default:
                return {
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    label: status || 'Unknown',
                };
        }
    };

    const config = getStatusConfig(status);

    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.textColor}`}>{config.label}</span>;
};

// Main Order List Component
const OrderListComponent = () => {
    // States
    const [searchTerm, setSearchTerm] = useState('');
    const [storeFilter, setStoreFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // API filters state
    const [filters, setFilters] = useState({
        store_id: '',
        payment_status: '',
        date: '',
        from_date: '',
        to_date: '',
        search: '',
        per_page: 10,
        page: 1,
    });

    // API queries
    const {
        data: ordersResponse,
        isLoading,
        error,
        refetch,
    } = useGetAllOrdersQuery({
        params: filters,
    });

    const { data: storesResponse, isLoading: storesLoading } = useAllStoresQuery();

    // Extract data from API responses
    const orders = useMemo(() => {
        return Array.isArray(ordersResponse?.data) ? ordersResponse.data : [];
    }, [ordersResponse]);

    console.log('orders', orders);

    const stores = storesResponse?.data || [];

    // Debounced search function
    const debouncedSearch = useMemo(
        () =>
            debounce((searchTerm) => {
                setFilters((prev) => ({
                    ...prev,
                    search: searchTerm,
                    page: 1,
                }));
            }, 500),
        []
    );

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: 1, // Reset to first page when filters change
        }));

        // Update local state for UI
        switch (key) {
            case 'store_id':
                setStoreFilter(value);
                break;
            case 'payment_status':
                setStatusFilter(value);
                break;
            case 'date':
                setDateFilter(value);
                break;
            case 'from_date':
                setFromDate(value);
                break;
            case 'to_date':
                setToDate(value);
                break;
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setStoreFilter('');
        setStatusFilter('');
        setDateFilter('');
        setFromDate('');
        setToDate('');
        setFilters({
            store_id: '',
            payment_status: '',
            date: '',
            from_date: '',
            to_date: '',
            search: '',
            per_page: 10,
            page: 1,
        });
    };

    // Count active filters
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.store_id) count++;
        if (filters.payment_status) count++;
        if (filters.date) count++;
        if (filters.from_date && filters.to_date) count++;
        return count;
    }, [filters]);

    // Payment status options
    const paymentStatusOptions = [
        { value: '', label: 'All Status' },
        { value: 'paid', label: 'Paid' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' },
    ];

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-md border border-red-200 bg-red-50 p-4">
                        <div className="text-red-800">
                            <h3 className="text-lg font-medium">Error Loading Orders</h3>
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
                            <h1 className="flex items-center text-3xl font-bold text-gray-900">
                                <ShoppingBag className="mr-3 h-8 w-8" />
                                Order Management
                            </h1>
                            <p className="mt-1 text-gray-600">Manage and track your orders ({orders.length} total orders)</p>
                        </div>
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
                                    placeholder="Search by customer name, email, or invoice..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
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
                    {showFilters && (
                        <div className="border-t pt-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                                {/* Store Filter */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Store</label>
                                    <select
                                        value={storeFilter}
                                        onChange={(e) => handleFilterChange('store_id', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                        disabled={storesLoading}
                                    >
                                        <option value="">All Stores</option>
                                        {stores.map((store) => (
                                            <option key={store.id} value={store.id}>
                                                {store.store_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Payment Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    >
                                        {paymentStatusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Specific Date */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Specific Date</label>
                                    <input
                                        type="date"
                                        value={dateFilter}
                                        onChange={(e) => handleFilterChange('date', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* From Date */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">From Date</label>
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => handleFilterChange('from_date', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* To Date */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">To Date</label>
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => handleFilterChange('to_date', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Active Filters Display */}
                {activeFiltersCount > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {filters.search && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                                Search: "{filters.search}"
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        handleFilterChange('search', '');
                                    }}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {filters.store_id && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                                Store: {stores.find((s) => s.id.toString() === filters.store_id)?.store_name || filters.store_id}
                                <button
                                    onClick={() => {
                                        setStoreFilter('');
                                        handleFilterChange('store_id', '');
                                    }}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {filters.payment_status && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                                Status: {filters.payment_status}
                                <button
                                    onClick={() => {
                                        setStatusFilter('');
                                        handleFilterChange('payment_status', '');
                                    }}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {filters.date && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                                Date: {filters.date}
                                <button
                                    onClick={() => {
                                        setDateFilter('');
                                        handleFilterChange('date', '');
                                    }}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {filters.from_date && filters.to_date && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                                Date: {filters.from_date} to {filters.to_date}
                                <button
                                    onClick={() => {
                                        setFromDate('');
                                        setToDate('');
                                        setFilters((prev) => ({
                                            ...prev,
                                            from_date: '',
                                            to_date: '',
                                            page: 1,
                                        }));
                                    }}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {/* Results Summary */}
                <div className="mb-4 text-sm text-gray-600">Showing {orders.length} orders</div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Invoice</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Store</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created By</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <tr key={`loading-${index}`} className="animate-pulse">
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-24 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-32 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-28 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-24 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-20 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-16 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-6 w-16 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="ml-auto h-8 w-8 rounded bg-gray-200"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <ShoppingBag className="mb-4 h-12 w-12 text-gray-300" />
                                                <h3 className="mb-1 text-lg font-medium text-gray-900">No orders found</h3>
                                                <p className="mb-4 text-gray-500">{activeFiltersCount > 0 ? 'Try adjusting your search or filters' : 'No orders have been placed yet'}</p>
                                                {activeFiltersCount > 0 && (
                                                    <button onClick={clearFilters} className="font-medium text-blue-600 hover:text-blue-500">
                                                        Clear all filters
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="font-semibold text-blue-600">#{order.invoice}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-medium text-white">
                                                        {order.customer?.name?.charAt(0)?.toUpperCase() || 'N'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{order.customer?.name || 'N/A'}</div>
                                                        {order.customer?.email && <div className="text-xs text-gray-500">{order.customer.email}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{order.store?.store_name || 'N/A'}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm text-gray-600">{order.user?.name || 'N/A'}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Calendar className="mr-1 h-4 w-4" />
                                                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center text-lg font-bold text-green-600">
                                                    <DollarSign className="mr-1 h-4 w-4" />৳{Number(order.grand_total || 0).toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <PaymentStatusBadge status={order.payment_status} />
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <OrderActionDropdown order={order} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderListComponent;
