'use client';

import { useGetExpensesQuery } from '@/store/features/expense/expenseApi';
import { useFullStoreListWithFilterQuery } from '@/store/features/store/storeApi';
import { Calendar, CalendarRange, ChevronLeft, ChevronRight, Clock, CreditCard, Plus, Search, Store, TrendingDown, User } from 'lucide-react';
import { useState } from 'react';
import CreateExpenseModal from './__component/create_expense_modal';

interface FilterState {
    search?: string;
    store_id?: number;
    selected_date?: string;
    from_date?: string;
    to_date?: string;
    per_page?: number;
    page?: number;
}

// Filters Component
const ExpenseFilters = ({ filters, onFiltersChange, stores, isLoadingStores }) => {
    const [dateFilterType, setDateFilterType] = useState('specific');

    const handleFilterChange = (key, value) => {
        onFiltersChange({ ...filters, [key]: value, page: 1 });
    };

    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={filters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Store Filter */}
                <div>
                    <select
                        value={filters.store_id?.toString() || ''}
                        onChange={(e) => handleFilterChange('store_id', e.target.value ? Number(e.target.value) : undefined)}
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

                {/* Date Filter Type */}
                <div>
                    <select
                        value={dateFilterType}
                        onChange={(e) => setDateFilterType(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="specific">Specific Date</option>
                        <option value="range">Date Range</option>
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
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
            </div>

            {/* Date Inputs */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {dateFilterType === 'specific' ? (
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <input
                            type="date"
                            placeholder="Select date"
                            value={filters.selected_date || ''}
                            onChange={(e) => {
                                handleFilterChange('selected_date', e.target.value);
                                handleFilterChange('from_date', '');
                                handleFilterChange('to_date', '');
                            }}
                            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                ) : (
                    <>
                        <div className="relative">
                            <CalendarRange className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="date"
                                placeholder="From date"
                                value={filters.from_date || ''}
                                onChange={(e) => {
                                    handleFilterChange('from_date', e.target.value);
                                    handleFilterChange('selected_date', '');
                                }}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <CalendarRange className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="date"
                                placeholder="To date"
                                value={filters.to_date || ''}
                                onChange={(e) => {
                                    handleFilterChange('to_date', e.target.value);
                                    handleFilterChange('selected_date', '');
                                }}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// Expense Table Component
const ExpenseTable = ({ expenses, isLoading, filters }) => {
    const formatCurrency = (amount) => {
        return `৳${new Intl.NumberFormat('en-BD', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0)}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading expenses...</p>
                </div>
            </div>
        );
    }

    if (!expenses || expenses.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="p-8 text-center">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
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
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title & Notes</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Balance</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created By</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {expenses.map((expense, index) => (
                            <tr key={expense.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
                                        {index + 1 + ((filters.page || 1) - 1) * (filters.per_page || 10)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{expense.title || 'N/A'}</div>
                                    <div className="text-sm text-gray-500">{expense.notes || 'No notes'}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="h-4 w-4 text-red-500" />
                                        <span className="text-sm font-semibold text-red-600">{formatCurrency(expense.debit)}</span>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(expense.balance)}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">{expense.user?.name || 'N/A'}</span>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">{formatDate(expense.created_at)}</span>
                                    </div>
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

// Main Expense List Component
const ExpenseList = () => {
    const [filters, setFilters] = useState({ per_page: 10, page: 1 });
    const [modalOpened, setModalOpened] = useState(false);

    const { data: expensesData, isLoading, error } = useGetExpensesQuery(filters);
    const { data: storesData, isLoading: storesLoading } = useFullStoreListWithFilterQuery();

    const stores = storesData?.data || [];
    const expenses = expensesData?.data?.data || [];

    const pagination = {
        current_page: filters.page || 1,
        last_page: Math.ceil((expensesData?.total || 0) / (filters.per_page || 10)),
        total: expensesData?.total || 0,
        per_page: filters.per_page || 10,
    };

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handlePageChange = (page) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const selectedStore = stores.find((store) => store.id == filters.store_id);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-red-800">Error loading expenses. Please try again.</p>
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
                            <CreditCard className="mr-2 h-6 w-6" />
                            Expense Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Track and manage all expenses across stores
                            {selectedStore && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                    <Store className="mr-1 h-3 w-3" />
                                    {selectedStore.store_name}
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Create Expense Button */}
                    <button
                        onClick={() => setModalOpened(true)}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Expense
                    </button>
                </div>

                {/* Filters */}
                <ExpenseFilters filters={filters} onFiltersChange={handleFiltersChange} stores={stores} isLoadingStores={storesLoading} />

                {/* Expense Table */}
                <ExpenseTable expenses={expenses} isLoading={isLoading} filters={filters} />

                {/* Pagination */}
                {expensesData?.total && <Pagination meta={pagination} onPageChange={handlePageChange} />}

                {/* Create Expense Modal */}
                <CreateExpenseModal opened={modalOpened} onClose={() => setModalOpened(false)} />
            </div>
        </div>
    );
};

export default ExpenseList;
