'use client';

import DateColumn from '@/components/common/DateColumn';
import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrency } from '@/hooks/useCurrency';
import { BookOpen, Edit, Eye, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

interface JournalsTableProps {
    journals: any[];
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
    onViewDetails: (journal: any) => void;
    onEdit: (journal: any) => void;
    onDelete: (journal: any) => void;
}

const JournalsTable: React.FC<JournalsTableProps> = ({ journals, isLoading, pagination, sorting, onViewDetails, onEdit, onDelete }) => {
    const { formatCurrency } = useCurrency();

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'ledger',
                label: 'Ledger',
                render: (value, row) => (
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                            <BookOpen className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="font-medium text-gray-900">{value?.title || row.ledger_title || 'N/A'}</span>
                    </div>
                ),
            },
            {
                key: 'notes',
                label: 'Notes',
                render: (value) => {
                    const notes = value || 'N/A';
                    const truncatedNotes = notes.length > 40 ? notes.substring(0, 40) + '...' : notes;
                    return (
                        <span className="text-sm text-gray-700" title={notes}>
                            {truncatedNotes}
                        </span>
                    );
                },
            },
            {
                key: 'debit',
                label: 'Debit',
                sortable: true,
                render: (value) => {
                    const amount = parseFloat(value || '0');
                    return <span className={`text-sm font-semibold ${amount > 0 ? 'text-red-600' : 'text-gray-400'}`}>{amount > 0 ? formatCurrency(value) : '-'}</span>;
                },
            },
            {
                key: 'credit',
                label: 'Credit',
                sortable: true,
                render: (value) => {
                    const amount = parseFloat(value || '0');
                    return <span className={`text-sm font-semibold ${amount > 0 ? 'text-green-600' : 'text-gray-400'}`}>{amount > 0 ? formatCurrency(value) : '-'}</span>;
                },
            },
            {
                key: 'balance',
                label: 'Balance',
                sortable: true,
                render: (value) => {
                    const balance = parseFloat(value || '0');
                    return (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${balance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {formatCurrency(value)}
                        </span>
                    );
                },
            },
            {
                key: 'user',
                label: 'User',
                render: (value, row) => (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{value?.name || row.user_name || 'N/A'}</span>
                        <span className="text-xs text-gray-500">{value?.email || row.user_email || ''}</span>
                    </div>
                ),
            },
            {
                key: 'created_at',
                label: 'Date',
                sortable: true,
                render: (value) => <DateColumn date={value} />,
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
                label: 'Edit Entry',
                onClick: onEdit,
                className: 'text-orange-600',
                icon: <Edit className="h-4 w-4" />,
            },
            {
                label: 'Delete Entry',
                onClick: onDelete,
                className: 'text-red-600',
                icon: <Trash2 className="h-4 w-4" />,
            },
        ],
        [onViewDetails, onEdit, onDelete]
    );

    return (
        <ReusableTable
            data={journals}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            pagination={pagination}
            sorting={sorting}
            emptyState={{
                icon: <BookOpen className="mx-auto h-16 w-16" />,
                title: 'No Journal Entries Found',
                description: 'No journal entries match your current filters. Try adjusting your search criteria or add a new entry.',
            }}
        />
    );
};

export default JournalsTable;
