'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { setReturnOrderId } from '@/store/features/Order/OrderReturnSlice';
import { Download, Edit, Eye, RotateCcw } from 'lucide-react';
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
    onOpenInvoicePreview: (order: any) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, isLoading, pagination, sorting, onViewDetails, onOpenInvoicePreview }) => {
    const { t } = getTranslation();
    const router = useRouter();
    const { formatCurrency } = useCurrency();
    const dispatch = useDispatch();
    const { currentStoreId } = useCurrentStore();
    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'invoice',
                label: t('lbl_invoice'),
                sortable: true,
                render: (value, row) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{value || `#${row.id}`}</span>
                    </div>
                ),
            },
            {
                key: 'customer',
                label: t('lbl_customer'),
                render: (value, row) => (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{row.is_walk_in ? 'Walk-in Customer' : value?.name || 'N/A'}</span>
                        {!row.is_walk_in && value?.phone && <span className="text-xs text-gray-500">{value.phone}</span>}
                    </div>
                ),
            },
            {
                key: 'store',
                label: t('lbl_store'),
                render: (value, row) => <span className="text-sm text-gray-700">{value?.name || row.store?.name || 'N/A'}</span>,
            },
            {
                key: 'items_count',
                label: t('order_items'),
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
                label: t('lbl_total'),
                sortable: true,
                render: (value, row) => {
                    const total = value?.grand_total ?? row.grand_total ?? row.total ?? 0;
                    return <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>;
                },
            },
            {
                key: 'financial_due',
                label: t('lbl_due'),
                sortable: true,
                render: (value, row) => {
                    const dueAmount = Number(row.financial?.due_amount ?? row.due_amount ?? 0);
                    if (dueAmount > 0) {
                        return <span className="font-semibold text-red-600">{formatCurrency(dueAmount)}</span>;
                    }
                    return <span className="text-sm text-gray-500">{formatCurrency(0)}</span>;
                },
            },
            {
                key: 'payment',
                label: t('order_payment_status'),
                sortable: true,
                render: (value, row) => {
                    const status = (value?.status ?? row.payment_status)?.toLowerCase() || 'pending';
                    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                        paid: { bg: 'bg-green-100', text: 'text-green-800', label: t('status_paid') },
                        completed: { bg: 'bg-green-100', text: 'text-green-800', label: t('status_paid') },
                        partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('status_partial') },
                        due: { bg: 'bg-red-100', text: 'text-red-800', label: t('lbl_due') },
                        unpaid: { bg: 'bg-red-100', text: 'text-red-800', label: t('status_unpaid') },
                        pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: t('status_pending') },
                    };
                    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status || 'Unknown' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
                },
            },
            {
                key: 'payment_method',
                label: t('lbl_payment_method'),
                render: (value, row) => {
                    const method = row.payment?.method ?? row.payment_method ?? 'cash';
                    return <span className="text-sm capitalize text-gray-700">{method === 'due' ? 'Due' : method}</span>;
                },
            },
            {
                key: 'status',
                label: t('lbl_status'),
                sortable: true,
                render: (value, row) => {
                    const status = value?.toLowerCase() || 'completed';
                    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                        completed: { bg: 'bg-green-100', text: 'text-green-800', label: t('status_completed') },
                        fully_returned: { bg: 'bg-red-100', text: 'text-red-800', label: t('status_fully_returned') },
                        partially_returned: { bg: 'bg-orange-100', text: 'text-orange-800', label: t('status_partially_returned') },
                        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('status_pending') },
                    };
                    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
                },
            },
            {
                key: 'returns',
                label: t('lbl_return'),
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
                label: t('lbl_date'),
                sortable: true,
                render: (value, row) => {
                    const formatRawDateTime = (dateTimeStr: string) => {
                        if (!dateTimeStr) return { date: '-', time: '' };
                        const parts = dateTimeStr.split(' ');
                        return {
                            date: parts[0] || '-',
                            time: parts.slice(1).join(' ') || '',
                        };
                    };

                    const created = formatRawDateTime(value);
                    const updated = formatRawDateTime(row.updated_at);

                    return (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="w-12 text-[10px] font-bold uppercase text-emerald-600">Created:</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium text-gray-900">{created.date}</span>
                                    <span className="text-[10px] text-gray-500">{created.time}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-12 text-[10px] font-bold uppercase text-amber-600">Updated:</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium text-gray-900">{updated.date}</span>
                                    <span className="text-[10px] text-gray-500">{updated.time}</span>
                                </div>
                            </div>
                        </div>
                    );
                },
            },
        ],
        [t, formatCurrency]
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: t('order_action_edit'),
                onClick: (order: any) => router.push(`/orders/edit/${order.id}`),
                className: 'text-orange-600',
                icon: <Edit className="h-4 w-4" />,
                hidden: (order: any) => order.status === 'fully_returned',
            },
            {
                label: t('order_action_return'),
                onClick: (order: any) => {
                    if (currentStoreId) {
                        dispatch(setReturnOrderId({ storeId: currentStoreId, orderId: order.id }));
                        router.push(`/orders/return?orderId=${order.id}`);
                    }
                },
                className: 'text-amber-600',
                icon: <RotateCcw className="h-4 w-4" />,
                hidden: (order: any) => {
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
                label: t('order_action_view'),
                onClick: onViewDetails,
                className: 'text-blue-600',
                icon: <Eye className="h-4 w-4" />,
            },
            {
                label: t('order_action_invoice'),
                onClick: onOpenInvoicePreview,
                className: 'text-green-600',
                icon: <Download className="h-4 w-4" />,
            },
        ],
        [t, router, onViewDetails, onOpenInvoicePreview, currentStoreId, dispatch]
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
                title: t('order_no_data'),
                description: t('order_no_data_desc'),
            }}
        />
    );
};

export default OrdersTable;
