'use client';
import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrency } from '@/hooks/useCurrency';
import { Clock, CreditCard, Download, Eye, PackageCheck, Printer, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

interface PurchaseDuesTableProps {
    dues: any[];
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
    onViewItems: (due: any) => void;
    onPrint: (due: any) => void;
    onReceiveItems: (due: any) => void;
    onViewTransactions: (due: any) => void;
    onPartialPayment: (due: any) => void;
    onClearFullDue: (due: any) => void;
    onDelete: (due: any) => void;
}

const PurchaseDuesTable: React.FC<PurchaseDuesTableProps> = ({
    dues,
    isLoading,
    pagination,
    sorting,
    onViewItems,
    onPrint,
    onReceiveItems,
    onViewTransactions,
    onPartialPayment,
    onClearFullDue,
    onDelete,
}) => {
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
                    const newItems = value?.filter((item: any) => item.is_new_product).length || 0;
                    return (
                        <div className="flex flex-col gap-1">
                            <span className="inline-flex w-fit items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </span>
                            {newItems > 0 && <span className="text-xs text-green-600">+{newItems} new</span>}
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
                key: 'amount_due',
                label: 'Due Amount',
                sortable: true,
                render: (value) => {
                    const dueAmount = Number(value || 0);
                    if (dueAmount > 0) {
                        return <span className="font-semibold text-red-600">{formatCurrency(dueAmount)}</span>;
                    }
                    return <span className="text-sm text-gray-500">{formatCurrency(0)}</span>;
                },
            },
            {
                key: 'payment_status',
                label: 'Payment Status',
                sortable: true,
                render: (value) => {
                    const status = value?.toLowerCase() || 'pending';
                    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                        paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
                        partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Partial' },
                        pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pending' },
                        unpaid: { bg: 'bg-red-100', text: 'text-red-800', label: 'Unpaid' },
                    };
                    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: value || 'Unknown' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
                },
            },
            {
                key: 'status',
                label: 'Order Status',
                sortable: true,
                render: (value) => {
                    const status = value?.toLowerCase() || 'ordered';
                    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                        ordered: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Ordered' },
                        partially_received: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Partially Received' },
                        received: { bg: 'bg-green-100', text: 'text-green-800', label: 'Received' },
                        cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
                        draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
                    };
                    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: value || 'Unknown' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
                },
            },
            {
                key: 'created_at',
                label: 'Created Date',
                sortable: true,
                render: (value) => {
                    if (!value) return <span className="text-sm text-gray-500">-</span>;
                    const parts = value.split(' ');
                    const date = parts[0] || '-';
                    const time = parts.slice(1).join(' ') || '';
                    return (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{date}</span>
                            <span className="text-xs text-gray-500">{time}</span>
                        </div>
                    );
                },
            },
            {
                key: 'updated_at',
                label: 'Updated Date',
                sortable: true,
                render: (value) => {
                    if (!value) return <span className="text-sm text-gray-500">-</span>;
                    const parts = value.split(' ');
                    const date = parts[0] || '-';
                    const time = parts.slice(1).join(' ') || '';
                    return (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{date}</span>
                            <span className="text-xs text-gray-500">{time}</span>
                        </div>
                    );
                },
            },
        ],
        []
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
                label: 'Receive Items',
                onClick: (row: any) => {
                    if (row.status !== 'received' && row.status !== 'cancelled') {
                        onReceiveItems(row);
                    }
                },
                className: 'text-purple-600',
                icon: <PackageCheck className="h-4 w-4" />,
            },
            {
                label: 'View Transactions',
                onClick: onViewTransactions,
                className: 'text-indigo-600',
                icon: <Clock className="h-4 w-4" />,
            },
            {
                label: 'Partial Payment',
                onClick: (row: any) => {
                    if (row.payment_status !== 'paid' && row.amount_due > 0) {
                        onPartialPayment(row);
                    }
                },
                className: 'text-orange-600',
                icon: <CreditCard className="h-4 w-4" />,
            },
            {
                label: 'Clear Full Due',
                onClick: (row: any) => {
                    if (row.payment_status !== 'paid' && row.amount_due > 0) {
                        onClearFullDue(row);
                    }
                },
                className: 'text-green-600',
                icon: <CreditCard className="h-4 w-4" />,
            },
            {
                label: 'Print',
                onClick: onPrint,
                className: 'text-gray-600',
                icon: <Printer className="h-4 w-4" />,
            },
            {
                label: 'Delete',
                onClick: onDelete,
                className: 'text-red-600',
                icon: <Trash2 className="h-4 w-4" />,
            },
        ],
        [onViewItems, onReceiveItems, onViewTransactions, onPartialPayment, onClearFullDue, onPrint, onDelete]
    );

    return (
        <ReusableTable
            data={dues}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            pagination={pagination}
            sorting={sorting}
            emptyState={{
                icon: <Download className="mx-auto h-16 w-16" />,
                title: 'No Purchase Dues Found',
                description: 'No purchase dues match your current filters. Try adjusting your search criteria.',
            }}
        />
    );
};

export default PurchaseDuesTable;
