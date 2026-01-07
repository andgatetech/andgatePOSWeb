'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrency } from '@/hooks/useCurrency';
import { CreditCard, Edit, Eye, Receipt, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

interface ExpensesTableProps {
    expenses: any[];
    isLoading: boolean;
    pagination: {
        currentPage: number;
        totalPages: number;
        itemsPerPage: number;
        totalItems: number;
        onPageChange: (page: number) => void;
        onItemsPerPageChange: (items: number) => void;
    };
    sorting: {
        field: string;
        direction: 'asc' | 'desc';
        onSort: (field: string) => void;
    };
    onViewDetails: (expense: any) => void;
    onEdit: (expense: any) => void;
    onDelete: (expense: any) => void;
}

const PAYMENT_TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    cash: { label: 'Cash', color: 'text-green-700', bgColor: 'bg-green-100' },
    bank: { label: 'Bank', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    card: { label: 'Card', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    others: { label: 'Others', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

const ExpensesTable: React.FC<ExpensesTableProps> = ({ expenses, isLoading, pagination, sorting, onViewDetails, onEdit, onDelete }) => {
    const { formatCurrency } = useCurrency();

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'title',
                label: 'Title',
                render: (value) => <span className="font-medium text-gray-900">{value}</span>,
            },
            {
                key: 'ledger_info',
                label: 'Ledger',
                render: (_, row) => (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{row.ledger_title}</span>
                        {row.expense_ledger_type && (
                            <span className="mt-0.5 inline-flex w-fit items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">{row.expense_ledger_type}</span>
                        )}
                    </div>
                ),
            },
            {
                key: 'notes',
                label: 'Notes',
                render: (value) => {
                    if (!value) return <span className="text-gray-400">-</span>;
                    const truncatedNotes = value.length > 30 ? value.substring(0, 30) + '...' : value;
                    return (
                        <span className="text-sm text-gray-700" title={value}>
                            {truncatedNotes}
                        </span>
                    );
                },
            },
            {
                key: 'debit',
                label: 'Amount',
                sortable: true,
                render: (value) => <span className="text-sm font-semibold text-red-600">{formatCurrency(value)}</span>,
            },
            {
                key: 'payment_type',
                label: 'Payment',
                render: (value) => {
                    const config = PAYMENT_TYPE_CONFIG[value?.toLowerCase()] || PAYMENT_TYPE_CONFIG.others;
                    return (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}>
                            <CreditCard className="h-3 w-3" />
                            {config.label}
                        </span>
                    );
                },
            },
            {
                key: 'store_name',
                label: 'Store',
                render: (value) => <span className="text-sm text-gray-700">{value || 'N/A'}</span>,
            },
            {
                key: 'user_name',
                label: 'User',
                render: (value) => <span className="text-sm text-gray-700">{value || 'N/A'}</span>,
            },
            {
                key: 'created_at',
                label: 'Date',
                sortable: true,
                render: (value) => <span className="text-sm text-gray-900">{new Date(value).toLocaleDateString('en-GB')}</span>,
            },
        ],
        [formatCurrency]
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: 'View Details',
                onClick: onViewDetails,
                className: 'text-blue-600',
                icon: <Eye className="h-4 w-4" />,
            },
            {
                label: 'Edit Expense',
                onClick: onEdit,
                className: 'text-orange-600',
                icon: <Edit className="h-4 w-4" />,
            },
            {
                label: 'Delete Expense',
                onClick: onDelete,
                className: 'text-red-600',
                icon: <Trash2 className="h-4 w-4" />,
            },
        ],
        [onViewDetails, onEdit, onDelete]
    );

    return (
        <ReusableTable
            data={expenses}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            pagination={pagination}
            sorting={sorting}
            emptyState={{
                icon: <Receipt className="mx-auto h-16 w-16" />,
                title: 'No Expenses Found',
                description: 'No expenses match your current filters. Try adjusting your search criteria or add a new expense.',
            }}
        />
    );
};

export default ExpensesTable;
