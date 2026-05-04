'use client';

import ExpenseFilter from '@/components/filters/ExpenseFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useDeleteExpenseMutation, useGetExpensesQuery } from '@/store/features/expense/expenseApi';
import { Plus, Receipt } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import CreateExpenseModal from './components/CreateExpenseModal';
import EditExpenseModal from './components/EditExpenseModal';
import ExpensesTable from './components/ExpensesTable';
import ViewExpenseModal from './components/ViewExpenseModal';

const ExpenseListPage = () => {
    const { t } = getTranslation();
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
            const confirmed = await showConfirmDialog(t('msg_delete_expense_confirm'), `${t('msg_are_you_sure_delete_expense')} "${expense.title}"?`, t('btn_yes_delete_it'), t('btn_cancel'), false);

            if (confirmed) {
                try {
                    await deleteExpense(expense.id).unwrap();
                    showSuccessDialog(t('msg_deleted'), t('msg_expense_deleted'));
                } catch (error: any) {
                    showErrorDialog(t('msg_error'), error?.data?.message || t('msg_failed_delete_expense'));
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

    if (isLoading) {
        return <Loader message={t('expense_loading')} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                        <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('lbl_expenses')}</h1>
                        <p className="text-sm text-gray-500">{t('expense_page_desc')}</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    {t('btn_add_expense')}
                </button>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <ExpenseFilter onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />
            </div>

            {/* Table */}
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

            {/* Modals */}
            <ViewExpenseModal expense={selectedExpense} isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />
            <CreateExpenseModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleCreateSuccess} />
            <EditExpenseModal expense={selectedExpense} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={handleEditSuccess} />
        </div>
    );
};

export default ExpenseListPage;
