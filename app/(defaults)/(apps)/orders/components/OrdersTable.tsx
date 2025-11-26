'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { Download, Edit, Eye, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface OrdersTableProps {
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
    onViewDetails: (order: any) => void;
    onDownloadInvoice: (order: any) => void;
    onPrintInvoice: (order: any) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, isLoading, pagination, sorting, onViewDetails, onDownloadInvoice, onPrintInvoice }) => {
    const router = useRouter();
    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'invoice',
                label: 'Invoice',
                sortable: true,
                render: (value, row) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{value || `#${row.id}`}</span>
                    </div>
                ),
            },
            {
                key: 'customer',
                label: 'Customer',
                render: (value, row) => (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{row.is_walk_in ? 'Walk-in Customer' : value?.name || 'N/A'}</span>
                        {!row.is_walk_in && value?.phone && <span className="text-xs text-gray-500">{value.phone}</span>}
                    </div>
                ),
            },
            {
                key: 'store_name',
                label: 'Store',
                render: (value, row) => <span className="text-sm text-gray-700">{value || row.store?.store_name || 'N/A'}</span>,
            },
            {
                key: 'items_count',
                label: 'Items',
                render: (value, row) => {
                    const itemCount = value ?? row.items?.length ?? row.order_items?.length ?? 0;
                    return (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                    );
                },
            },
            {
                key: 'grand_total',
                label: 'Total Amount',
                sortable: true,
                render: (value, row) => {
                    const total = value ?? row.total ?? row.totals?.grand_total ?? 0;
                    return <span className="font-semibold text-gray-900">৳{Number(total).toFixed(2)}</span>;
                },
            },
            {
                key: 'due_amount',
                label: 'Due Amount',
                sortable: true,
                render: (value, row) => {
                    const dueAmount = Number(value || 0);
                    if (dueAmount > 0) {
                        return <span className="font-semibold text-red-600">৳{dueAmount.toFixed(2)}</span>;
                    }
                    return <span className="text-sm text-gray-500">৳0.00</span>;
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
                        completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
                        partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Partial' },
                        due: { bg: 'bg-red-100', text: 'text-red-800', label: 'Due' },
                        unpaid: { bg: 'bg-red-100', text: 'text-red-800', label: 'Unpaid' },
                        pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pending' },
                    };
                    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: value || 'Unknown' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
                },
            },
            {
                key: 'payment_method',
                label: 'Payment Method',
                render: (value) => {
                    const method = value || 'cash';
                    return <span className="text-sm capitalize text-gray-700">{method === 'due' ? 'Due' : method}</span>;
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
                label: 'Edit Order',
                onClick: (order) => router.push(`/orders/edit/${order.id}`),
                className: 'text-orange-600',
                icon: <Edit className="h-4 w-4" />,
            },
            {
                label: 'View Details',
                onClick: onViewDetails,
                className: 'text-blue-600',
                icon: <Eye className="h-4 w-4" />,
            },
            {
                label: 'Download Invoice',
                onClick: onDownloadInvoice,
                className: 'text-green-600',
                icon: <Download className="h-4 w-4" />,
            },
            {
                label: 'Print Invoice',
                onClick: onPrintInvoice,
                className: 'text-purple-600',
                icon: <Printer className="h-4 w-4" />,
            },
        ],
        [router, onViewDetails, onDownloadInvoice, onPrintInvoice]
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
                icon: <Eye className="h-16 w-16" />,
                title: 'No Orders Found',
                description: 'No orders match your current filters. Try adjusting your search criteria.',
            }}
        />
    );
};

export default OrdersTable;
