'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { setReturnOrderId } from '@/store/features/Order/OrderReturnSlice';
import { Download, Edit, Eye, Printer, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

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
    const { formatCurrency } = useCurrency();
    const dispatch = useDispatch();
    const { currentStoreId } = useCurrentStore();
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
                key: 'store',
                label: 'Store',
                render: (value, row) => <span className="text-sm text-gray-700">{value?.name || row.store?.name || 'N/A'}</span>,
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
                key: 'financial',
                label: 'Total Amount',
                sortable: true,
                render: (value, row) => {
                    const total = value?.grand_total ?? row.grand_total ?? row.total ?? 0;
                    return <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>;
                },
            },
            {
                key: 'financial',
                label: 'Due Amount',
                sortable: true,
                render: (value, row) => {
                    const dueAmount = Number(value?.due_amount ?? row.due_amount ?? 0);
                    if (dueAmount > 0) {
                        return <span className="font-semibold text-red-600">{formatCurrency(dueAmount)}</span>;
                    }
                    return <span className="text-sm text-gray-500">{formatCurrency(0)}</span>;
                },
            },
            {
                key: 'payment',
                label: 'Payment Status',
                sortable: true,
                render: (value, row) => {
                    const status = (value?.status ?? row.payment_status)?.toLowerCase() || 'pending';
                    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                        paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
                        completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
                        partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Partial' },
                        due: { bg: 'bg-red-100', text: 'text-red-800', label: 'Due' },
                        unpaid: { bg: 'bg-red-100', text: 'text-red-800', label: 'Unpaid' },
                        pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pending' },
                    };
                    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status || 'Unknown' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
                },
            },
            {
                key: 'payment',
                label: 'Payment Method',
                render: (value, row) => {
                    const method = value?.method ?? row.payment_method ?? 'cash';
                    return <span className="text-sm capitalize text-gray-700">{method === 'due' ? 'Due' : method}</span>;
                },
            },
            {
                key: 'status',
                label: 'Order Status',
                sortable: true,
                render: (value, row) => {
                    const status = value?.toLowerCase() || 'completed';
                    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                        completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
                        fully_returned: { bg: 'bg-red-100', text: 'text-red-800', label: 'Fully Returned' },
                        partially_returned: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Partially Returned' },
                        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
                    };
                    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
                },
            },
            {
                key: 'returns',
                label: 'Refund Amount',
                render: (value, row) => {
                    const hasReturns = value?.has_returns ?? false;
                    const totalReturned = value?.total_returned ?? 0;
                    if (!hasReturns || totalReturned === 0) {
                        return <span className="text-sm text-gray-500">-</span>;
                    }
                    return (
                        <div className="flex flex-col">
                            <span className="font-semibold text-red-600">{formatCurrency(totalReturned)}</span>
                            {value?.count > 0 && (
                                <span className="text-xs text-gray-500">
                                    {value.count} return{value.count > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                key: 'created_at',
                label: 'Date',
                sortable: true,
                render: (value, row) => (
                    <div className="flex flex-col gap-1">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500">Created:</span>
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-900">{new Date(value).toLocaleDateString('en-GB')}</span>
                                <span className="text-xs text-gray-500">{new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500">Updated:</span>
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-900">{new Date(row.updated_at).toLocaleDateString('en-GB')}</span>
                                <span className="text-xs text-gray-500">{new Date(row.updated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>
                ),
            },
        ],
        [formatCurrency]
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: 'Edit Order',
                onClick: (order) => router.push(`/orders/edit/${order.id}`),
                className: 'text-orange-600',
                icon: <Edit className="h-4 w-4" />,
                hidden: (order) => order.status === 'fully_returned',
            },
            {
                label: 'Make Return',
                onClick: (order) => {
                    if (currentStoreId) {
                        dispatch(setReturnOrderId({ storeId: currentStoreId, orderId: order.id }));
                        router.push(`/orders/return?orderId=${order.id}`);
                    }
                },
                className: 'text-amber-600',
                icon: <RotateCcw className="h-4 w-4" />,
                hidden: (order) => {
                    // Hide if order is fully returned
                    if (order.status === 'fully_returned') return true;
                    // Hide if return_status is 'full'
                    if (order.return_status === 'full') return true;
                    // Hide if all items have been fully returned (returnable_quantity = 0 for all items)
                    if (order.items && order.items.length > 0) {
                        const hasReturnableItems = order.items.some((item: any) => (item.returnable_quantity ?? item.quantity ?? 0) > 0);
                        if (!hasReturnableItems) return true;
                    }
                    return false;
                },
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
        [router, onViewDetails, onDownloadInvoice, onPrintInvoice, currentStoreId, dispatch]
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
                icon: <Eye className="mx-auto h-16 w-16" />,
                title: 'No Orders Found',
                description: 'No orders match your current filters. Try adjusting your search criteria.',
            }}
        />
    );
};

export default OrdersTable;
