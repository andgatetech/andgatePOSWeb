'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
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
    const formatCurrency = (amount: string | number) => {
        return `৳${parseFloat(amount?.toString() || '0').toLocaleString()}`;
    };

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'title',
                label: 'Title',
                render: (value, row) => (
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                            <Receipt className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{value || 'N/A'}</span>
                            <span className="text-xs text-gray-500">{row.ledger_title || row.ledger?.title || ''}</span>
                        </div>
                    </div>
                ),
            },
            {
                key: 'notes',
                label: 'Notes',
                render: (value) => {
                    const notes = value || 'N/A';
                    const truncatedNotes = notes.length > 35 ? notes.substring(0, 35) + '...' : notes;
                    return (
                        <span className="text-sm text-gray-700" title={notes}>
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
                render: (value, row) => <span className="text-sm text-gray-700">{value || row.store?.store_name || 'N/A'}</span>,
            },
            {
                key: 'user_name',
                label: 'User',
                render: (value, row) => <span className="text-sm text-gray-700">{value || row.user?.name || 'N/A'}</span>,
            },
            {
                key: 'created_at',
                label: 'Date',
                sortable: true,
                render: (value) => <span className="text-sm text-gray-900">{new Date(value).toLocaleDateString('en-GB')}</span>,
            },
        ],
        []
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
