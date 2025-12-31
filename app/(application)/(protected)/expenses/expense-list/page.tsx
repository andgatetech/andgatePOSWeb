'use client';

import ExpenseFilter from '@/components/filters/ExpenseFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useDeleteExpenseMutation, useGetExpensesQuery } from '@/store/features/expense/expenseApi';
import { Plus, Receipt } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import CreateExpenseModal from './components/CreateExpenseModal';
import EditExpenseModal from './components/EditExpenseModal';
import ExpensesTable from './components/ExpensesTable';
import ViewExpenseModal from './components/ViewExpenseModal';

const ExpenseListPage = () => {
    const { currentStoreId } = useCurrentStore();

    // Filter and pagination state
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Modal states
    const [selectedExpense, setSelectedExpense] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Build query params
    const queryParams = useMemo(() => {
        return {
            ...filterParams,
            page: currentPage,
            per_page: itemsPerPage,
            sort_field: sortField,
            sort_direction: sortDirection,
        };
    }, [filterParams, currentPage, itemsPerPage, sortField, sortDirection]);

    // API hooks
    const {
        data: expensesResponse,
        isLoading,
        refetch,
    } = useGetExpensesQuery(queryParams, {
        skip: !filterParams.store_id && !filterParams.store_ids,
    });
    const [deleteExpense] = useDeleteExpenseMutation();

    // Data extraction
    const expenses = expensesResponse?.data?.items || expensesResponse?.data?.data || [];
    const pagination = expensesResponse?.data?.pagination ||
        expensesResponse?.data?.meta || {
            current_page: 1,
            per_page: 10,
            total: 0,
            last_page: 1,
        };

    // Handlers
    const handleFilterChange = useCallback((params: Record<string, any>) => {
        setFilterParams(params);
        setCurrentPage(1);
    }, []);

    const handleSort = useCallback(
        (field: string) => {
            if (sortField === field) {
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            } else {
                setSortField(field);
                setSortDirection('asc');
            }
        },
        [sortField]
    );

    const handleViewDetails = useCallback((expense: any) => {
        setSelectedExpense(expense);
        setIsViewModalOpen(true);
    }, []);

    const handleEdit = useCallback((expense: any) => {
        setSelectedExpense(expense);
        setIsEditModalOpen(true);
    }, []);

    const handleDelete = useCallback(
        async (expense: any) => {
            const confirmed = await showConfirmDialog('Delete Expense?', `Are you sure you want to delete "${expense.title}"? This action cannot be undone.`, 'Yes, delete it!', 'Cancel', false);

            if (confirmed) {
                try {
                    await deleteExpense(expense.id).unwrap();
                    showSuccessDialog('Deleted!', 'Expense has been deleted successfully.');
                } catch (error: any) {
                    showErrorDialog('Error!', error?.data?.message || 'Failed to delete expense.');
                }
            }
        },
        [deleteExpense]
    );

    const handleCreateSuccess = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleEditSuccess = useCallback(() => {
        refetch();
    }, [refetch]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                            <Receipt className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
                            <p className="text-sm text-gray-600">Manage your expense records</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-5 py-2.5 font-semibold text-white shadow-lg transition-all hover:from-red-600 hover:to-rose-700 hover:shadow-xl"
                >
                    <Plus className="h-5 w-5" />
                    Add Expense
                </button>
            </div>

            {/* Filters */}
            <div className="panel">
                <ExpenseFilter onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />
            </div>

            {/* Table */}
            <div className="panel">
                <ExpensesTable
                    expenses={expenses}
                    isLoading={isLoading}
                    pagination={{
                        currentPage: pagination.current_page,
                        totalPages: pagination.last_page,
                        itemsPerPage: pagination.per_page,
                        totalItems: pagination.total,
                        onPageChange: setCurrentPage,
                        onItemsPerPageChange: (items) => {
                            setItemsPerPage(items);
                            setCurrentPage(1);
                        },
                    }}
                    sorting={{
                        field: sortField,
                        direction: sortDirection,
                        onSort: handleSort,
                    }}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            {/* Modals */}
            <ViewExpenseModal expense={selectedExpense} isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />
            <CreateExpenseModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleCreateSuccess} />
            <EditExpenseModal expense={selectedExpense} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={handleEditSuccess} />
        </div>
    );
};

export default ExpenseListPage;
