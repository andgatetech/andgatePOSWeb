'use client';

import OrderActionsComponent from '@/__components/OrderActionsComponent';
import { useGetAllOrdersQuery } from '@/store/features/Order/Order';
import { useAllStoresQuery } from '@/store/features/store/storeApi';
import { debounce } from 'lodash';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useMemo, useState } from 'react';

const ComponentsAppsInvoiceList = () => {
    // Modal states
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);

    // Filter states
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

    // DataTable states
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'desc',
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

    const { data: storesResponse, isLoading: storesLoading } = useAllStoresQuery({});

    // Extract data from API responses
    const orders = useMemo(() => {
        return Array.isArray(ordersResponse?.data) ? ordersResponse.data : ordersResponse?.data?.data || [];
    }, [ordersResponse]);

    const pagination = useMemo(() => {
        // If the response has pagination data, use it
        if (ordersResponse?.data && !Array.isArray(ordersResponse.data)) {
            return ordersResponse.data;
        }
        // If no pagination data, create default pagination based on orders length
        const ordersArray = Array.isArray(ordersResponse?.data) ? ordersResponse.data : [];
        return {
            total: ordersArray.length,
            per_page: filters.per_page,
            current_page: filters.page,
            last_page: Math.ceil(ordersArray.length / filters.per_page),
        };
    }, [ordersResponse, filters.per_page, filters.page]);
    const stores = storesResponse?.data || [];

    // Debounced search function
    const debouncedSearch = useMemo(
        () =>
            debounce((searchTerm: string) => {
                setFilters((prev) => ({
                    ...prev,
                    search: searchTerm,
                    page: 1,
                }));
            }, 500),
        []
    );

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        debouncedSearch(value);
    };

    // Handle filter changes
    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: 1, // Reset to first page when filters change
        }));
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    // Handle per page change
    const handlePerPageChange = (newPerPage: number) => {
        setFilters((prev) => ({
            ...prev,
            per_page: newPerPage,
            page: 1, // Reset to first page
        }));
    };

    // Clear filters
    const clearFilters = () => {
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

    // Modal handlers
    const handleViewDetails = (order: any) => {
        setSelectedOrder(order);
        setDetailsModalOpen(true);
    };

    const handleViewInvoice = (order: any) => {
        setSelectedOrder(order);
        setInvoiceModalOpen(true);
    };

    const handleViewReceipt = (order: any) => {
        setSelectedOrder(order);
        setReceiptModalOpen(true);
    };

    // Format orders for display
    const formattedOrders = useMemo(() => {
        if (!Array.isArray(orders)) return [];

        return orders.map((order) => ({
            id: order.id,
            invoice: order.invoice || String(order.id).padStart(6, '0'),
            name: order.customer?.name || 'N/A',
            email: order.customer?.email || '',
            createdBy: order.user?.name || order.created_by || 'N/A',
            storeName: order.store?.store_name || 'N/A',
            date: order.created_at ? new Date(order.created_at).toLocaleDateString() : '',
            amount: Number(order.grand_total) || 0,
            status: {
                tooltip: order.payment_status || 'unknown',
                color: order.payment_status === 'paid' ? 'success' : order.payment_status === 'pending' ? 'warning' : 'danger',
            },
            originalOrder: order,
        }));
    }, [orders]);

    // Debug logs
    console.log('Orders Response:', ordersResponse);
    console.log('Extracted Orders:', orders);
    console.log('Pagination:', pagination);
    console.log('Formatted Orders:', formattedOrders);

    // Payment status options
    const paymentStatusOptions = [
        { value: '', label: 'All Status' },
        { value: 'paid', label: 'Paid' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' },
    ];

    // Per page options
    const perPageOptions = [10, 20, 30, 50, 100];

    return (
        <div className="panel border-white-light px-0 shadow-sm dark:border-[#1b2e4b]">
            <div className="invoice-table">
                {/* Header Section */}
                <div className="mb-6 flex flex-col gap-6 rounded-t-lg bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:from-gray-800 dark:to-gray-900">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Order Management</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage and track your orders ({pagination.total || 0} total orders)</p>
                    </div>

                    {/* Filters Section */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                        {/* Search */}
                        <div className="xl:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                            <input
                                type="text"
                                placeholder="Search by customer name, email, or staff name..."
                                onChange={handleSearchChange}
                                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                            />
                        </div>

                        {/* Store Filter */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Store</label>
                            <select
                                value={filters.store_id}
                                onChange={(e) => handleFilterChange('store_id', e.target.value)}
                                className="form-select w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                                disabled={storesLoading}
                            >
                                <option value="">All Stores</option>
                                {stores.map((store: any) => (
                                    <option key={store.id} value={store.id}>
                                        {store.store_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Status Filter */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</label>
                            <select
                                value={filters.payment_status}
                                onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                                className="form-select w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                            >
                                {paymentStatusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Specific Date Filter */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Specific Date</label>
                            <input
                                type="date"
                                value={filters.date}
                                onChange={(e) => handleFilterChange('date', e.target.value)}
                                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                            />
                        </div>

                        {/* From Date */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                            <input
                                type="date"
                                value={filters.from_date}
                                onChange={(e) => handleFilterChange('from_date', e.target.value)}
                                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                            />
                        </div>

                        {/* To Date */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                            <input
                                type="date"
                                value={filters.to_date}
                                onChange={(e) => handleFilterChange('to_date', e.target.value)}
                                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                            />
                        </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={clearFilters} className="btn btn-outline-secondary btn-sm rounded-lg px-4 py-2">
                            Clear Filters
                        </button>
                        <button onClick={() => refetch()} className="btn btn-primary btn-sm rounded-lg px-4 py-2" disabled={isLoading}>
                            {isLoading ? 'Refreshing...' : 'Refresh'}
                        </button>

                        {/* Active Filters Display */}
                        <div className="flex flex-wrap gap-2">
                            {filters.store_id && <span className="badge badge-outline-primary">Store: {stores.find((s: any) => s.id == filters.store_id)?.name || filters.store_id}</span>}
                            {filters.payment_status && <span className="badge badge-outline-info">Status: {filters.payment_status}</span>}
                            {filters.date && <span className="badge badge-outline-success">Date: {filters.date}</span>}
                            {filters.from_date && filters.to_date && (
                                <span className="badge badge-outline-success">
                                    Date: {filters.from_date} to {filters.to_date}
                                </span>
                            )}
                            {filters.search && <span className="badge badge-outline-warning">Search: &quot;{filters.search}&quot;</span>}
                        </div>
                    </div>
                </div>

                {/* DataTable */}
                <div className="datatables px-6 pb-6">
                    {error && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                            Error loading orders. Please try again.
                        </div>
                    )}

                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={formattedOrders}
                            columns={[
                                {
                                    accessor: 'invoice',
                                    sortable: false,
                                    render: ({ invoice }) => <div className="px-3 py-2 font-semibold text-primary">#{invoice}</div>,
                                },
                                {
                                    accessor: 'name',
                                    title: 'Customer',
                                    sortable: false,
                                    render: ({ name, email }) => (
                                        <div className="flex items-center px-3 py-2">
                                            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-medium text-white">
                                                {name?.charAt(0)?.toUpperCase() || 'N'}
                                            </div>
                                            <div>
                                                <div className="font-semibold">{name}</div>
                                                {email && <div className="text-xs text-gray-500">{email}</div>}
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'createdBy',
                                    title: 'Staff',
                                    sortable: false,
                                    render: ({ createdBy }) => <div className="px-3 py-2 text-gray-600 dark:text-gray-400">{createdBy}</div>,
                                },
                                {
                                    accessor: 'storeName',
                                    title: 'Store',
                                    sortable: false,
                                    render: ({ storeName }) => <div className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">{storeName}</div>,
                                },
                                {
                                    accessor: 'date',
                                    sortable: false,
                                    render: ({ date }) => <div className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{date}</div>,
                                },
                                {
                                    accessor: 'amount',
                                    sortable: false,
                                    textAlignment: 'right',
                                    render: ({ amount }) => <div className="px-3 py-2 text-right text-lg font-bold text-green-600 dark:text-green-400">৳{amount.toFixed(2)}</div>,
                                },
                                {
                                    accessor: 'status',
                                    sortable: false,
                                    render: ({ status }) => (
                                        <div className="px-3 py-2">
                                            <span className={`badge badge-outline-${status.color} rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide`}>{status.tooltip}</span>
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'action',
                                    title: 'Actions',
                                    sortable: false,
                                    textAlignment: 'center',
                                    render: (record) => (
                                        <div className="px-3 py-2">
                                            <OrderActionsComponent order={record.originalOrder} />
                                        </div>
                                    ),
                                },
                            ]}
                            highlightOnHover
                            totalRecords={pagination.total || 0}
                            recordsPerPage={filters.per_page}
                            page={filters.page}
                            onPageChange={handlePageChange}
                            recordsPerPageOptions={perPageOptions}
                            onRecordsPerPageChange={handlePerPageChange}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            fetching={isLoading}
                            loaderColor="blue"
                            loaderSize="lg"
                            paginationText={({ from, to, totalRecords }) => (
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Showing <span className="font-semibold text-gray-900 dark:text-white">{from}</span> to <span className="font-semibold text-gray-900 dark:text-white">{to}</span> of{' '}
                                    <span className="font-semibold text-gray-900 dark:text-white">{totalRecords}</span> entries
                                </span>
                            )}
                            rowClassName="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                            noRecordsText="No orders found"
                            emptyState={
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="mb-2 text-gray-400">
                                        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-medium text-gray-500">No orders found</p>
                                    <p className="text-sm text-gray-400">Try adjusting your search criteria or filters</p>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Modals - Uncomment when ready to use */}
            {/* <OrderItemsModal open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} order={selectedOrder} /> */}
            {/* <InvoiceModal open={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} order={selectedOrder} /> */}
            {/* <ReceiptModal open={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} order={selectedOrder} /> */}
        </div>
    );
};

export default ComponentsAppsInvoiceList;
