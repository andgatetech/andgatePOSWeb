'use client';

import Dropdown from '@/components/dropdown';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetExpensesQuery } from '@/store/features/expense/expenseApi';
import { useFullStoreListWithFilterQuery } from '@/store/features/store/storeApi';
import {
    Calendar,
    CalendarRange,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clock,
    CreditCard,
    Edit,
    MoreVertical,
    Plus,
    RotateCcw,
    Search,
    Store,
    Trash2,
    TrendingDown,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
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
const ExpenseFilters = ({ filters, onFiltersChange, stores, isLoadingStores, currentStoreId }) => {
    const [dateFilterType, setDateFilterType] = useState('specific');

    const handleFilterChange = (key, value) => {
        onFiltersChange({ ...filters, [key]: value, page: 1 });
    };

    const handleReset = () => {
        const resetFilters = {
            search: '',
            store_id: currentStoreId || undefined,
            selected_date: '',
            from_date: '',
            to_date: '',
            per_page: 10,
            page: 1,
        };
        onFiltersChange(resetFilters);
        setDateFilterType('specific');
    };

    return (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
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
                        onChange={(e) => {
                            setDateFilterType(e.target.value);
                            // Clear date filters when switching types
                            handleFilterChange('selected_date', '');
                            handleFilterChange('from_date', '');
                            handleFilterChange('to_date', '');
                        }}
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
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>

                {/* Reset Button */}
                <div>
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
const ExpenseTable = ({ expenses, isLoading, filters, sortField, sortDirection, onSort, onEdit, onDelete }) => {
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
        });
    };

    const formatDateTime = (dateString) => {
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
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading expenses...</p>
                </div>
            </div>
        );
    }

    if (!expenses || expenses.length === 0) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-8 text-center">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">#</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Title & Notes</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Amount</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Balance</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Store</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Created By</th>
                            <th
                                className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-200"
                                onClick={() => onSort('created_at')}
                            >
                                <div className="flex items-center gap-2">
                                    Created At
                                    {sortField === 'created_at' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                </div>
                            </th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {expenses.map((expense, index) => (
                            <tr key={expense.id} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="px-4 py-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-100 to-orange-100 text-sm font-semibold text-red-700">
                                        {index + 1 + ((filters.page || 1) - 1) * (filters.per_page || 10)}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 flex-shrink-0">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                                                <CreditCard className="h-6 w-6 text-red-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-semibold text-gray-900">{expense.title || 'N/A'}</div>
                                            <div className="text-xs text-gray-500">{expense.notes || 'No notes'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="h-4 w-4 text-red-500" />
                                        <span className="text-sm font-semibold text-red-600">{formatCurrency(expense.debit)}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            parseFloat(expense.balance) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {formatCurrency(expense.balance)}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center">
                                        <Store className="mr-2 h-4 w-4 text-purple-500" />
                                        <div className="text-sm font-medium text-gray-900">{expense.store?.store_name || '-'}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{expense.user?.name || 'N/A'}</div>
                                            <div className="text-xs text-gray-500">{expense.user?.email || '-'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{formatDate(expense.created_at)}</div>
                                            <div className="text-xs text-gray-500">{new Date(expense.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <Dropdown
                                        offset={[0, 5]}
                                        placement="bottom-end"
                                        btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        button={<MoreVertical className="h-5 w-5" />}
                                    >
                                        <ul className="min-w-[140px] rounded-lg border bg-white shadow-lg">
                                            <li>
                                                <button onClick={() => onEdit(expense)} className="flex w-full items-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Expense
                                                </button>
                                            </li>
                                            <li className="border-t">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`Are you sure you want to delete expense "${expense.title}"? This action cannot be undone.`)) {
                                                            onDelete(expense.id);
                                                        }
                                                    }}
                                                    className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Expense
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
            <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                    Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{total}</span> results
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onPageChange(current_page - 1)}
                        disabled={current_page === 1}
                        className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

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

// Main Expense List Component
const ExpenseList = () => {
    const { currentStoreId, currentStore } = useCurrentStore();

    const [filters, setFilters] = useState({
        search: '',
        store_id: currentStoreId || undefined,
        selected_date: '',
        from_date: '',
        to_date: '',
        per_page: 10,
        page: 1,
    });

    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [modalOpened, setModalOpened] = useState(false);

    useEffect(() => {
        if (currentStoreId) {
            setFilters((prev) => ({
                ...prev,
                store_id: currentStoreId,
                page: 1,
            }));
        }
    }, [currentStoreId]);

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

    // Sort expenses
    const sortedExpenses = [...expenses].sort((a, b) => {
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

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleEditExpense = (expense) => {
        // TODO: Implement edit functionality
        toast.info('Edit functionality will be implemented soon');
        console.log('Edit expense:', expense);
    };

    const handleDeleteExpense = async (expenseId) => {
        // TODO: Implement delete API call
        try {
            // await deleteExpense(expenseId).unwrap();
            toast.success('Expense deleted successfully!');
            console.log('Delete expense:', expenseId);
        } catch (error) {
            console.error('Failed to delete expense:', error);
            toast.error('Failed to delete expense. Please try again.');
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="mx-auto">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-red-800">Error loading expenses. Please try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-orange-700 shadow-md">
                                    <CreditCard className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
                                    <p className="text-sm text-gray-500">{currentStore ? `Track expenses for ${currentStore.store_name}` : 'Track and manage all expenses across stores'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setModalOpened(true)}
                                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                <Plus className="h-4 w-4" />
                                Create Expense
                            </button>
                        </div>
                        {currentStore && (
                            <div className="rounded-lg bg-red-50 p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                                        <Store className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-red-900">Current Store: {currentStore.store_name}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <ExpenseFilters filters={filters} onFiltersChange={handleFiltersChange} stores={stores} isLoadingStores={storesLoading} currentStoreId={currentStoreId} />

                {/* Expense Table */}
                <ExpenseTable
                    expenses={sortedExpenses}
                    isLoading={isLoading}
                    filters={filters}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onEdit={handleEditExpense}
                    onDelete={handleDeleteExpense}
                />

                {/* Pagination */}
                {expensesData?.total && <Pagination meta={pagination} onPageChange={handlePageChange} />}

                {/* Create Expense Modal */}
                <CreateExpenseModal opened={modalOpened} onClose={() => setModalOpened(false)} />
            </div>
        </div>
    );
};

export default ExpenseList;
