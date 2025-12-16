'use client';
import Dropdown from '@/components/dropdown';
import ExpenseFilter from '@/components/filters/ExpenseFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useDeleteExpenseMutation, useGetExpensesQuery } from '@/store/features/expense/expenseApi';
import { ChevronDown, ChevronUp, Clock, CreditCard, Edit, MoreVertical, Plus, Store, Trash2, TrendingDown, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import CreateExpenseModal from './__component/create_expense_modal';
import UpdateExpenseModal from '@/components/custom/UpdateExpenseModal';

// Expense Table Component
const ExpenseTable = ({ expenses, isLoading, onEdit, onDelete, sortField, sortDirection, onSort, isDeleting }) => {
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

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-red-600"></div>
                    <p className="mt-2 text-sm text-gray-600 sm:text-base">Loading expenses...</p>
                </div>
            </div>
        );
    }

    if (!expenses || expenses.length === 0) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-6 text-center sm:p-8">
                    <CreditCard className="mx-auto h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">Try adjusting your search or filter criteria.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden overflow-hidden rounded-xl border bg-white shadow-sm md:block">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Title & Notes</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Amount</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Balance</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Payment Type</th>
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
                                <tr key={expense.id} className={`transition-colors hover:bg-red-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${isDeleting ? 'opacity-50' : ''}`}>
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
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-800">
                                            {expense.payment_type || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center">
                                            <Store className="mr-2 h-4 w-4 text-purple-500" />
                                            <div className="text-sm font-medium text-gray-900">{expense.ledger?.store?.store_name || '-'}</div>
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
                                            btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                            button={<MoreVertical className="h-5 w-5" />}
                                            disabled={isDeleting}
                                        >
                                            <ul className="min-w-[140px] rounded-lg border bg-white shadow-lg">
                                                <li>
                                                    <button
                                                        onClick={() => onEdit(expense)}
                                                        className="flex w-full items-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                                                        disabled={isDeleting}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Expense
                                                    </button>
                                                </li>
                                                <li className="border-t">
                                                    <button
                                                        onClick={() => onDelete(expense.id, expense.title)}
                                                        className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                        disabled={isDeleting}
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

            {/* Mobile/Tablet Card View */}
            <div className="space-y-4 lg:hidden">
                {expenses.map((expense) => (
                    <div key={expense.id} className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${isDeleting ? 'opacity-50' : ''}`}>
                        <div className="p-4">
                            {/* Header */}
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="h-14 w-14 flex-shrink-0 sm:h-16 sm:w-16">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-red-100 sm:h-16 sm:w-16">
                                            <CreditCard className="h-7 w-7 text-red-600 sm:h-8 sm:w-8" />
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-base font-semibold text-gray-900 sm:text-lg">{expense.title || 'N/A'}</h3>
                                        <p className="text-xs text-gray-500 sm:text-sm">{formatDate(expense.created_at)}</p>
                                        <p className="text-xs text-gray-400">ID: {expense.id}</p>
                                    </div>
                                </div>
                                <Dropdown
                                    offset={[0, 5]}
                                    placement="bottom-end"
                                    btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    button={<MoreVertical className="h-5 w-5" />}
                                    disabled={isDeleting}
                                >
                                    <ul className="min-w-[140px] rounded-lg border bg-white shadow-lg">
                                        <li>
                                            <button
                                                onClick={() => onEdit(expense)}
                                                className="flex w-full items-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                                                disabled={isDeleting}
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Expense
                                            </button>
                                        </li>
                                        <li className="border-t">
                                            <button
                                                onClick={() => onDelete(expense.id, expense.title)}
                                                className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Expense
                                            </button>
                                        </li>
                                    </ul>
                                </Dropdown>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 border-t border-gray-100 pt-3">
                                {/* Notes */}
                                <div>
                                    <p className="text-xs font-medium text-gray-500 sm:text-sm">Notes</p>
                                    <p className="mt-0.5 text-xs text-gray-700 sm:text-sm">{expense.notes || 'No notes'}</p>
                                </div>

                                {/* Financial Info */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Amount</p>
                                        <p className="mt-0.5 text-xs font-semibold text-red-600 sm:text-sm">{formatCurrency(expense.debit)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Balance</p>
                                        <p className="mt-0.5">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    parseFloat(expense.balance) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {formatCurrency(expense.balance)}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Payment</p>
                                        <p className="mt-0.5">
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium capitalize text-blue-800">
                                                {expense.payment_type || '-'}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Store & User Info */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Store</p>
                                        <p className="mt-0.5 text-xs text-gray-700 sm:text-sm">{expense.ledger?.store?.store_name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Created By</p>
                                        <p className="mt-0.5 text-xs text-gray-700 sm:text-sm">{expense.user?.name || '-'}</p>
                                        <p className="text-xs text-gray-500">{expense.user?.email || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

// Main Expense Management Component
const ExpenseManagement = () => {
    const { currentStoreId, currentStore } = useCurrentStore();
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);

    const [apiParams, setApiParams] = useState({
        store_ids: 'all',
        start_date: '',
        end_date: '',
        search: '',
        per_page: 10,
        page: 1,
    });

    // Build query parameters - simplified logic
    const queryParams = useMemo(() => {
        const params = { ...apiParams };

        // Clean up conflicting params
        if (params.store_ids === 'all') {
            delete params.store_id;
        } else if (params.store_id && params.store_id !== 'all') {
            delete params.store_ids;
        }

        return params;
    }, [apiParams]);

    const { data: expensesResponse, error, isLoading, isFetching } = useGetExpensesQuery(queryParams);
    const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

    // Reset filter when current store changes
    useEffect(() => {
        console.log('Expenses - Current store changed, resetting filters');
        setApiParams((prev) => ({
            ...prev,
            store_ids: 'all',
            store_id: undefined,
            page: 1, // Only reset page and store filter, keep other filters
        }));
    }, [currentStoreId]);

    // Handle filter changes - memoized callback
    const handleFilterChange = useCallback((newApiParams) => {
        console.log('Filter changed:', newApiParams);

        setApiParams((prevParams) => {
            if (newApiParams.store_id === 'all') {
                return {
                    ...newApiParams,
                    store_ids: 'all',
                    store_id: undefined,
                };
            }
            return newApiParams;
        });
    }, []);

    const expenses = expensesResponse?.data?.data || [];

    // Sort expenses - memoized to prevent unnecessary recalculations
    const sortedExpenses = useMemo(() => {
        return [...expenses].sort((a, b) => {
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
    }, [expenses, sortField, sortDirection]);

    const handleSort = useCallback((field) => {
        setSortField((prevField) => {
            if (prevField === field) {
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                return field;
            } else {
                setSortDirection('asc');
                return field;
            }
        });
    }, []);

    const handleEditExpense = useCallback((expense) => {
        setSelectedExpense(expense);
        setIsUpdateModalOpen(true);
    }, []);

    const handleDeleteExpense = useCallback(
        async (expenseId, expenseTitle) => {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: `You won't be able to revert this expense: "${expenseTitle}"!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel',
            });

            if (result.isConfirmed) {
                try {
                    await deleteExpense(expenseId).unwrap();
                    toast.dismiss();
                    toast.success('Expense deleted successfully', { toastId: 'delete-expense' });
                } catch (error) {
                    console.error('Error deleting expense:', error);
                    toast.dismiss();
                    const errorMessage = error?.data?.message || 'Failed to delete expense';
                    toast.error(errorMessage, { toastId: 'delete-expense-error' });
                }
            }
        },
        [deleteExpense]
    );

    const handleCreateSuccess = useCallback(() => {
        setIsCreateModalOpen(false);
        toast.dismiss();
        toast.success('Expense created successfully!', { toastId: 'create-expense' });
    }, []);

    const handleUpdateSuccess = useCallback(() => {
        setIsUpdateModalOpen(false);
        setSelectedExpense(null);
        toast.dismiss();
        toast.success('Expense updated successfully!', { toastId: 'update-expense' });
    }, []);

    if (error) {
        const errorMessage = error?.data?.message || 'Error loading expenses. Please try again.';
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4">
                <div className="mx-auto">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-800 sm:text-base">{errorMessage}</p>
                        <button onClick={() => window.location.reload()} className="mt-2 text-sm text-red-600 underline hover:text-red-800">
                            Reload page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 lg:p-6">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="rounded-2xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-sm sm:p-6">
                        <div className="mb-4 sm:mb-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-orange-700 shadow-md sm:h-12 sm:w-12">
                                        <CreditCard className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">Expense Management</h1>
                                        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                                            {currentStore ? (
                                                <span className="hidden sm:inline">Track expenses for {currentStore.store_name}</span>
                                            ) : (
                                                <span className="hidden sm:inline">Track and manage all expenses across stores</span>
                                            )}
                                            <span className="sm:hidden">Manage your expenses</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto sm:px-5 sm:py-2.5"
                                    disabled={isDeleting}
                                >
                                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="hidden sm:inline">Create Expense</span>
                                    <span className="sm:hidden">Create New</span>
                                </button>
                            </div>
                        </div>

                        {currentStore && (
                            <div className="rounded-lg bg-red-50 p-3 sm:p-4">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 sm:h-8 sm:w-8">
                                        <Store className="h-3.5 w-3.5 text-red-600 sm:h-4 sm:w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-red-900 sm:text-sm">
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
                <div className="mb-4 sm:mb-6">
                    <ExpenseFilter key={`expense-filter-${currentStoreId}`} onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />
                </div>

                {/* Loading overlay for fetching */}
                {isFetching && !isLoading && (
                    <div className="mb-4 rounded-lg bg-blue-50 p-2 text-center">
                        <p className="text-sm text-blue-600">Refreshing expenses...</p>
                    </div>
                )}

                {/* Expense Table/Cards */}
                <ExpenseTable
                    expenses={sortedExpenses}
                    isLoading={isLoading}
                    onEdit={handleEditExpense}
                    onDelete={handleDeleteExpense}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    isDeleting={isDeleting}
                />

                {/* Pagination info */}
                {expensesResponse?.total && (
                    <div className="mt-4 rounded-lg bg-white p-3 text-center text-sm text-gray-600 shadow-sm">
                        Total: {expensesResponse.total} expense{expensesResponse.total !== 1 ? 's' : ''}
                    </div>
                )}

                {/* Modals */}
                <CreateExpenseModal opened={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleCreateSuccess} />

                {selectedExpense && <UpdateExpenseModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} onSuccess={handleUpdateSuccess} expense={selectedExpense} />}
            </div>
        </div>
    );
};

export default ExpenseManagement;
