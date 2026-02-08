'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrency } from '@/hooks/useCurrency';
import { Eye, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

interface OrderReturnsTableProps {
    returns: any[];
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
    onViewDetails: (orderReturn: any) => void;
}

const OrderReturnsTable: React.FC<OrderReturnsTableProps> = ({ returns, isLoading, pagination, sorting, onViewDetails }) => {
    const { formatCurrency } = useCurrency();
    const router = useRouter();

    const handleViewDetails = useCallback(
        (orderReturn: any) => {
            router.push(`/orders/return/${orderReturn.id}`);
        },
        [router]
    );

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'return_number',
                label: 'Return #',
                sortable: true,
                render: (value, row) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{value || `#${row.id}`}</span>
                        {row.order_invoice && <span className="text-xs text-gray-500">Order: {row.order_invoice}</span>}
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
                key: 'return_type',
                label: 'Type',
                render: (value) => {
                    const isReturn = value === 'return';
                    return (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isReturn ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                            {isReturn ? 'Return' : 'Exchange'}
                        </span>
                    );
                },
            },
            {
                key: 'return_items',
                label: 'Items',
                render: (value, row) => {
                    const items = row.return_items || [];
                    if (items.length === 0) return <span className="text-sm text-gray-400">No items</span>;
                    if (items.length === 1) {
                        return <span className="text-sm text-gray-700">{items[0].product_name}</span>;
                    }
                    return (
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-700">{items[0].product_name}</span>
                            {items.length > 1 && <span className="text-xs text-gray-500">+{items.length - 1} more</span>}
                        </div>
                    );
                },
            },
            {
                key: 'return_items_qty',
                label: 'Qty',
                render: (value, row) => {
                    const items = row.return_items || [];
                    const totalQty = items.reduce((sum: number, item: any) => sum + (item.quantity_returned || item.quantity || 0), 0);
                    return <span className="text-sm font-medium text-gray-700">{totalQty}</span>;
                },
            },
            {
                key: 'total_return_amount',
                label: 'Return Amount',
                sortable: true,
                render: (value) => <span className="font-semibold text-red-600">{formatCurrency(value || 0)}</span>,
            },
            {
                key: 'net_amount',
                label: 'Net Amount',
                sortable: true,
                render: (value) => {
                    const netAmount = Number(value || 0);
                    if (netAmount < 0) {
                        return (
                            <div className="flex flex-col">
                                <span className="font-semibold text-emerald-600">{formatCurrency(Math.abs(netAmount))}</span>
                                <span className="text-xs text-emerald-600">Refund</span>
                            </div>
                        );
                    } else if (netAmount > 0) {
                        return (
                            <div className="flex flex-col">
                                <span className="font-semibold text-amber-600">{formatCurrency(netAmount)}</span>
                                <span className="text-xs text-amber-600">Customer Paid</span>
                            </div>
                        );
                    }
                    return (
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-600">{formatCurrency(0)}</span>
                            <span className="text-xs text-gray-500">Even Exchange</span>
                        </div>
                    );
                },
            },
            {
                key: 'payment_method',
                label: 'Payment Method',
                render: (value) => <span className="text-sm capitalize text-gray-700">{value || 'Cash'}</span>,
            },
            {
                key: 'payment_status',
                label: 'Status',
                render: (value) => {
                    const status = value?.toLowerCase() || 'pending';
                    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                        refunded: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Refunded' },
                        completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
                        paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
                        pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pending' },
                    };
                    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: value || 'Unknown' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
                },
            },
            {
                key: 'processed_by',
                label: 'Processed By',
                render: (value, row) => <span className="text-sm text-gray-700">{value || row.user?.name || 'N/A'}</span>,
            },
            {
                key: 'created_at',
                label: 'Return Date',
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
        [formatCurrency]
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: 'View Details',
                onClick: handleViewDetails,
                className: 'text-blue-600',
                icon: <Eye className="h-4 w-4" />,
            },
        ],
        [handleViewDetails]
    );

    return (
        <ReusableTable
            data={returns}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            pagination={pagination}
            sorting={sorting}
            emptyState={{
                icon: <RotateCcw className="mx-auto h-16 w-16" />,
                title: 'No Returns Found',
                description: 'No order returns match your current filters. Try adjusting your search criteria.',
            }}
        />
    );
};

export default OrderReturnsTable;
