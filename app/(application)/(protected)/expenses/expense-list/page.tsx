'use client';

import ExpenseFilter from '@/components/filters/ExpenseFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useVoidAndReverseExpenseMutation, useGetExpensesQuery } from '@/store/features/expense/expenseApi';
import { canManageExpenseVoid, canVoidExpense } from '@/lib/expenseVoidReversal';
import { RootState } from '@/store';
import { Plus, Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import ExpensesTable from './components/ExpensesTable';
import ViewExpenseModal from './components/ViewExpenseModal';

const ExpenseListPage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const { currentStoreId } = useCurrentStore();
    const user = useSelector((state: RootState) => state.auth.user);
    const canManageVoid = canManageExpenseVoid(user);

    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [selectedExpense, setSelectedExpense] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const queryParams = useMemo(() => ({
        ...filterParams,
        page: currentPage,
        per_page: itemsPerPage,
        sort_field: sortField,
        sort_direction: sortDirection,
    }), [filterParams, currentPage, itemsPerPage, sortField, sortDirection]);

    const { data: expensesResponse, isLoading } = useGetExpensesQuery(queryParams, {
        skip: !filterParams.store_id && !filterParams.store_ids,
    });
    const [voidExpense] = useVoidAndReverseExpenseMutation();

    const expenses = expensesResponse?.data?.items || expensesResponse?.data?.data || [];
    const pagination = expensesResponse?.data?.pagination || expensesResponse?.data?.meta || {
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    };

    const handleFilterChange = useCallback((params: Record<string, any>) => {
        setFilterParams(params);
        setCurrentPage(1);
    }, []);

    const handleSort = useCallback((field: string) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    }, [sortField]);

    const handleViewDetails = useCallback((expense: any) => {
        setSelectedExpense(expense);
        setIsViewModalOpen(true);
    }, []);

    const handleEdit = useCallback((expense: any) => {
        router.push(`/expenses/edit/${expense.id}`);
    }, [router]);

    const handleVoid = useCallback(async (expense: any) => {
        if (!canManageVoid || !canVoidExpense(expense)) return;

        const reason = window.prompt(t('expense_void_reason_prompt'))?.trim();
        if (!reason) {
            showErrorDialog(t('msg_error'), t('expense_void_reason_required'));
            return;
        }

        const confirmed = await showConfirmDialog(
            t('expense_void_confirm_title'),
            `${t('expense_void_confirm_effects')} ${t('expense_void_confirm_audit')}`,
            t('btn_void_and_reverse'),
            t('btn_cancel'),
            false
        );
        if (!confirmed) return;

        try {
            await voidExpense({ expenseId: expense.id, reason, storeId: currentStoreId || expense.store_id }).unwrap();
            showSuccessDialog(t('msg_success'), t('expense_void_success'));
        } catch (error: any) {
            showErrorDialog(t('msg_error'), error?.data?.message || t('expense_void_failed'));
        }
    }, [canManageVoid, currentStoreId, t, voidExpense]);

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
                    onClick={() => router.push('/expenses/create')}
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
                onVoid={handleVoid}
                canVoid={canManageVoid}
            />

            <ViewExpenseModal expense={selectedExpense} isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />
        </div>
    );
};

export default ExpenseListPage;
