'use client';

import DateColumn from '@/components/common/DateColumn';
import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrency } from '@/hooks/useCurrency';
import { CheckCircle, Clock, Eye, Printer } from 'lucide-react';
import { useMemo } from 'react';

interface PurchaseCompletedTableProps {
    orders: any[];
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
    onViewItems: (order: any) => void;
    onPrint: (order: any) => void;
    onViewTransactions: (order: any) => void;
}

const PurchaseCompletedTable: React.FC<PurchaseCompletedTableProps> = ({ orders, isLoading, pagination, sorting, onViewItems, onPrint, onViewTransactions }) => {
    const { formatCurrency } = useCurrency();

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'invoice_number',
                label: 'Invoice',
                sortable: true,
                render: (value, row) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{value || `#${row.id}`}</span>
                    </div>
                ),
            },
            {
                key: 'supplier',
                label: 'Supplier',
                render: (value) => (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{value?.name || 'Walk-in Purchase'}</span>
                        {value?.phone && <span className="text-xs text-gray-500">{value.phone}</span>}
                    </div>
                ),
            },
            {
                key: 'store_name',
                label: 'Store',
                render: (value) => <span className="text-sm text-gray-700">{value || 'N/A'}</span>,
            },
            {
                key: 'items',
                label: 'Items',
                render: (value) => {
                    const itemCount = value?.length || 0;
                    return (
                        <div className="flex flex-col gap-1">
                            <span className="inline-flex w-fit items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </span>
                        </div>
                    );
                },
            },
            {
                key: 'grand_total',
                label: 'Total Amount',
                sortable: true,
                render: (value) => <span className="font-semibold text-gray-900">{formatCurrency(value || 0)}</span>,
            },
            {
                key: 'amount_paid',
                label: 'Amount Paid',
                sortable: true,
                render: (value) => <span className="font-semibold text-green-600">{formatCurrency(value || 0)}</span>,
            },
            {
                key: 'payment_status',
                label: 'Payment Status',
                sortable: true,
                render: () => <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Paid</span>,
            },
            {
                key: 'status',
                label: 'Order Status',
                sortable: true,
                render: () => <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Received</span>,
            },
            {
                key: 'created_at',
                label: 'Created Date',
                sortable: true,
                render: (value) => <DateColumn date={value} />,
            },
            {
                key: 'updated_at',
                label: 'Completed Date',
                sortable: true,
                render: (value) => <DateColumn date={value} />,
            },
        ],
        [formatCurrency]
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: 'View Items',
                onClick: onViewItems,
                className: 'text-blue-600',
                icon: <Eye className="h-4 w-4" />,
            },
            {
                label: 'View Transactions',
                onClick: onViewTransactions,
                className: 'text-indigo-600',
                icon: <Clock className="h-4 w-4" />,
            },
            {
                label: 'Print',
                onClick: onPrint,
                className: 'text-gray-600',
                icon: <Printer className="h-4 w-4" />,
            },
        ],
        [onViewItems, onViewTransactions, onPrint]
    );

    return (
        <ReusableTable
            data={orders}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            pagination={pagination}
            sorting={sorting}
            emptyState={{
                icon: <CheckCircle className="mx-auto h-16 w-16" />,
                title: 'No Completed Purchase Orders',
                description: 'No completed purchase orders yet. Orders appear here when fully received and paid.',
            }}
        />
    );
};

export default PurchaseCompletedTable;
