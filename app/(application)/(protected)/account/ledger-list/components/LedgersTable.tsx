'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { BookOpen, Edit, Eye, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

interface LedgersTableProps {
    ledgers: any[];
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
    onViewDetails: (ledger: any) => void;
    onEdit: (ledger: any) => void;
    onDelete: (ledger: any) => void;
}

const LedgersTable: React.FC<LedgersTableProps> = ({ ledgers, isLoading, pagination, sorting, onViewDetails, onEdit, onDelete }) => {
    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'title',
                label: 'Ledger Name',
                sortable: true,
                render: (value, row) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{value || 'N/A'}</span>
                        {row.ledger_type && <span className="text-xs text-gray-500">{row.ledger_type}</span>}
                    </div>
                ),
            },
            {
                key: 'ledger_type',
                label: 'Type',
                sortable: true,
                render: (value) => {
                    const type = value?.toLowerCase() || 'unknown';
                    const typeConfig: Record<string, { bg: string; text: string; label: string }> = {
                        assets: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Assets' },
                        expenses: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expenses' },
                        income: { bg: 'bg-green-100', text: 'text-green-800', label: 'Income' },
                        liabilities: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Liabilities' },
                    };
                    const config = typeConfig[type] || { bg: 'bg-gray-100', text: 'text-gray-800', label: value || 'Unknown' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
                },
            },
            {
                key: 'store_name',
                label: 'Store',
                render: (value) => <span className="text-sm text-gray-700">{value || 'N/A'}</span>,
            },
            {
                key: 'journals_count',
                label: 'Journals',
                sortable: true,
                render: (value) => (
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                            <BookOpen className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="font-semibold text-gray-900">{value || 0}</span>
                    </div>
                ),
            },
            {
                key: 'status',
                label: 'Status',
                sortable: true,
                render: (value) => {
                    const status = value?.toLowerCase() || 'inactive';
                    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                        active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
                        inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
                    };
                    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: value || 'Unknown' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
                },
            },
            {
                key: 'created_at',
                label: 'Created Date',
                sortable: true,
                render: (value) => (
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{new Date(value).toLocaleDateString('en-GB')}</span>
                        <span className="text-xs text-gray-500">{new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                ),
            },
            {
                key: 'updated_at',
                label: 'Updated Date',
                sortable: true,
                render: (value) => (
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{new Date(value).toLocaleDateString('en-GB')}</span>
                        <span className="text-xs text-gray-500">{new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                ),
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
                label: 'Edit Ledger',
                onClick: onEdit,
                className: 'text-orange-600',
                icon: <Edit className="h-4 w-4" />,
            },
            {
                label: 'Delete Ledger',
                onClick: onDelete,
                className: 'text-red-600',
                icon: <Trash2 className="h-4 w-4" />,
            },
        ],
        [onViewDetails, onEdit, onDelete]
    );

    return (
        <ReusableTable
            data={ledgers}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            pagination={pagination}
            sorting={sorting}
            emptyState={{
                icon: <BookOpen className="mx-auto h-16 w-16" />,
                title: 'No Ledgers Found',
                description: 'No ledgers match your current filters. Try adjusting your search criteria or add a new ledger.',
            }}
        />
    );
};

export default LedgersTable;
