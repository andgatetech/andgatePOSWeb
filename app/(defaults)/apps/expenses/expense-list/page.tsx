'use client';

import { useGetExpensesQuery } from '@/store/features/expense/expenseApi';
import { useFullStoreListWithFilterQuery } from '@/store/features/store/storeApi';
import { Calendar, CalendarRange, Clock, CreditCard, Filter, Plus, RefreshCw, Search, Store, TrendingDown, User, X } from 'lucide-react';
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

const ExpenseList = () => {
    const [filters, setFilters] = useState<FilterState>({ per_page: 10, page: 1 });
    const [modalOpened, setModalOpened] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [dateFilterType, setDateFilterType] = useState('specific'); // 'specific' or 'range'

    const { data: expensesData, isLoading, error, refetch } = useGetExpensesQuery(filters);
    // const { data: storesData, isLoading: storesLoading } = useAllStoresQuery();
    const { data: storesData, isLoading: storesLoading } = useFullStoreListWithFilterQuery();

    const stores = storesData?.data || [];
    const expenses = expensesData?.data?.data || [];
    const pagination = {
        current_page: filters.page || 1,
        last_page: Math.ceil((expensesData?.total || 0) / (filters.per_page || 10)),
        from: ((filters.page || 1) - 1) * (filters.per_page || 10) + 1,
        to: Math.min((filters.page || 1) * (filters.per_page || 10), expensesData?.total || 0),
        total: expensesData?.total || 0,
    };

    const handleChange = (key: keyof FilterState, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    // Handle pagination
    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    const resetFilters = () => {
        setFilters({ per_page: 10, page: 1 });
        setDateFilterType('specific');
    };

    const formatCurrency = (amount: number) => {
        return `৳${new Intl.NumberFormat('en-BD', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0)}`;
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderPagination = () => {
        if (!pagination.last_page || pagination.last_page <= 1) return null;

        const pages = Array.from({ length: pagination.last_page }, (_, i) => i + 1);

        return (
            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
                <div className="text-sm text-slate-600">
                    Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} results
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>

                    {pages.map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`rounded-lg px-3 py-2 text-sm transition-colors ${page === pagination.current_page ? 'bg-blue-600 text-white' : 'border border-slate-300 hover:bg-slate-50'}`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="rounded-t-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-white/20 p-3">
                                    <CreditCard className="h-8 w-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">Expense Management</h1>
                                    <p className="mt-1 text-blue-100">Track and manage all expenses</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setModalOpened(true)}
                                    className="flex items-center gap-2 rounded-lg bg-white/20 px-6 py-3 font-medium transition-all duration-200 hover:scale-105 hover:bg-white/30"
                                >
                                    <Plus size={20} />
                                    Create Expense
                                </button>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 rounded-lg bg-white/20 px-6 py-3 font-medium transition-all duration-200 hover:scale-105 hover:bg-white/30"
                                >
                                    <Filter size={20} />
                                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="border-b border-slate-200 p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="flex items-center text-lg font-semibold text-slate-900">
                                    <Filter className="mr-2 h-5 w-5 text-blue-600" />
                                    Filters & Search
                                </h3>
                                <button onClick={resetFilters} className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-200">
                                    <X size={16} />
                                    Clear All
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                {/* Store Filter */}
                                <div className="relative">
                                    <Store className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <select
                                        value={filters.store_id?.toString() || ''}
                                        onChange={(e) => handleChange('store_id', e.target.value ? Number(e.target.value) : undefined)}
                                        className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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

                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by title, notes, user..."
                                        value={filters.search || ''}
                                        onChange={(e) => handleChange('search', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>

                                {/* Per Page */}
                                <div className="relative">
                                    <select
                                        value={filters.per_page?.toString() || '10'}
                                        onChange={(e) => handleChange('per_page', Number(e.target.value))}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value={5}>5 per page</option>
                                        <option value={10}>10 per page</option>
                                        <option value={25}>25 per page</option>
                                        <option value={50}>50 per page</option>
                                    </select>
                                </div>

                                {/* Refresh */}
                                <button
                                    onClick={() => refetch()}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-3 text-slate-700 transition-colors hover:bg-slate-200"
                                >
                                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                                    Refresh
                                </button>
                            </div>

                            {/* Date Filters */}
                            <div className="mt-6 border-t border-slate-200 pt-6">
                                <div className="mb-4 flex items-center space-x-6">
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <input
                                            type="radio"
                                            name="dateFilterType"
                                            value="specific"
                                            checked={dateFilterType === 'specific'}
                                            onChange={(e) => setDateFilterType(e.target.value)}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <Calendar className="h-4 w-4" />
                                        Specific Date
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <input
                                            type="radio"
                                            name="dateFilterType"
                                            value="range"
                                            checked={dateFilterType === 'range'}
                                            onChange={(e) => setDateFilterType(e.target.value)}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <CalendarRange className="h-4 w-4" />
                                        Date Range
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {dateFilterType === 'specific' ? (
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
                                            <input
                                                type="date"
                                                value={filters.selected_date || ''}
                                                onChange={(e) => {
                                                    handleChange('selected_date', e.target.value);
                                                    handleChange('from_date', '');
                                                    handleChange('to_date', '');
                                                }}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-700">From Date</label>
                                                <input
                                                    type="date"
                                                    value={filters.from_date || ''}
                                                    onChange={(e) => {
                                                        handleChange('from_date', e.target.value);
                                                        handleChange('selected_date', '');
                                                    }}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-700">To Date</label>
                                                <input
                                                    type="date"
                                                    value={filters.to_date || ''}
                                                    onChange={(e) => {
                                                        handleChange('to_date', e.target.value);
                                                        handleChange('selected_date', '');
                                                    }}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex h-64 items-center justify-center">
                                <div className="text-center">
                                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                    <p className="text-slate-600">Loading expenses...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="py-12 text-center">
                                <div className="mb-4 text-6xl">⚠️</div>
                                <h3 className="mb-2 text-xl font-semibold text-slate-600">Error loading expenses</h3>
                                <p className="mb-4 text-slate-400">Something went wrong. Please try again.</p>
                                <button onClick={() => refetch()} className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
                                    Retry
                                </button>
                            </div>
                        ) : expenses.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="mb-4 text-6xl">💰</div>
                                <h3 className="mb-2 text-xl font-semibold text-slate-600">No expenses found</h3>
                                <p className="mb-4 text-slate-400">
                                    {Object.values(filters).some((val) => val && val !== 10 && val !== 1) ? 'Try adjusting your search criteria' : 'No expenses have been created yet'}
                                </p>
                                <button onClick={() => setModalOpened(true)} className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
                                    Create First Expense
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Table Header */}
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="flex items-center text-xl font-semibold text-slate-900">
                                        <CreditCard className="mr-3 h-6 w-6 text-blue-600" />
                                        Expenses ({pagination.total || 0})
                                    </h3>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-200">
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">#</th>
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">Title</th>
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">Notes</th>
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">Debit</th>
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">Balance</th>
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">Created By</th>
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">Created At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenses.map((expense: any, index: number) => (
                                                <tr key={expense.id} className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                                                    <td className="px-4 py-4">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
                                                            {index + 1 + ((filters.page || 1) - 1) * (filters.per_page || 10)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="font-medium text-slate-900">{expense.title || '-'}</div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="max-w-xs">
                                                            <span className="text-sm text-slate-600" title={expense.notes}>
                                                                {expense.notes || '-'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <TrendingDown className="h-4 w-4 text-red-500" />
                                                            <span className="text-base font-bold text-red-600">{formatCurrency(expense.debit)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-base font-semibold text-slate-900">{formatCurrency(expense.balance)}</div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-slate-400" />
                                                            <span className="text-slate-600">{expense.user?.name || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3 text-sm text-slate-900">
                                                            <div className="rounded-lg bg-slate-100 p-2">
                                                                <Clock className="h-4 w-4 text-slate-600" />
                                                            </div>
                                                            <span>{formatDate(expense.created_at)}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {renderPagination()}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Expense Modal */}
            <CreateExpenseModal opened={modalOpened} onClose={() => setModalOpened(false)} />
        </div>
    );
};

export default ExpenseList;
