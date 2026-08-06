'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import PaymentStatusBadge from '@/components/payment/PaymentStatusBadge';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { canVoidOrder } from '@/lib/orderDeletion';
import { setReturnOrderId } from '@/store/features/Order/OrderReturnSlice';
import { Download, Edit, ExternalLink, Eye, Printer, Receipt, RotateCcw, Trash2 } from 'lucide-react';
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
    onThermalReceiptPrint: (order: any) => void;
    onDeleteRequest: (order: any) => void;
    showDelete: boolean;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
    orders,
    isLoading,
    pagination,
    sorting,
    onViewDetails,
    onOpenInvoicePreview,
    onThermalReceiptPrint,
    onDeleteRequest,
    showDelete,
}) => {
    const { t } = getTranslation();
    const router = useRouter();
    const { formatCurrency, formatNumber } = useCurrency();
    const dispatch = useDispatch();
    const { currentStoreId } = useCurrentStore();

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'invoice',
                label: t('lbl_invoice'),
                sortable: true,
                render: (value, row) => (
                    <div className="flex flex-col items-start gap-1">
                        <button
                            type="button"
                            onClick={() => router.push(`/orders/${row.id}`)}
                            className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 transition-colors border border-indigo-200/60 shadow-2xs"
                            title={t('order_view_title') || 'View Order Details'}
                        >
                            <Receipt className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
                            <span>{value || `#${row.id}`}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                ),
            },
            {
                key: 'customer',
                label: t('lbl_customer'),
                render: (value, row) => (
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{row.is_walk_in ? t('pos_walk_in_customer') : value?.name || t('lbl_na')}</span>
                        {!row.is_walk_in && value?.phone && <span className="text-xs text-slate-500">{value.phone}</span>}
                    </div>
                ),
            },
            {
                key: 'store',
                label: t('lbl_store'),
                render: (value, row) => <span className="text-sm text-slate-700">{value?.name || row.store?.name || t('lbl_na')}</span>,
            },
            {
                key: 'items_count',
                label: t('order_items'),
                render: (value, row) => {
                    const itemCount = value ?? row.items?.length ?? row.order_items?.length ?? 0;
                    return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {t('msg_item_count', { count: itemCount })}
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
                    const dueAmount = Number(row.financial?.due_amount ?? row.due_amount ?? 0);
                    return (
                        <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{formatCurrency(total)}</span>
                            {dueAmount > 0 ? (
                                <span className="text-xs font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded inline-block mt-0.5 border border-rose-200/60">
                                    {t('lbl_due')}: {formatCurrency(dueAmount)}
                                </span>
                            ) : null}
                        </div>
                    );
                },
            },
            {
                key: 'payment',
                label: t('order_payment_status'),
                sortable: true,
                render: (value, row) => {
                    const status = (value?.status ?? row.payment_status) || 'pending';
                    const method = row.payment?.method ?? row.payment_method ?? 'cash';
                    return (
                        <div className="flex flex-col gap-1">
                            <PaymentStatusBadge status={status} />
                            <span className="text-xs capitalize text-slate-500">{method === 'due' ? t('lbl_due') : method}</span>
                        </div>
                    );
                },
            },
            {
                key: 'status',
                label: t('lbl_status'),
                sortable: true,
                render: (value, row) => {
                    const status = value?.toLowerCase() || 'completed';
                    const statusConfig: Record<string, { bg: string; text: string; label: string; border: string }> = {
                        completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: t('status_completed') },
                        voided: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Voided' },
                        cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Cancelled' },
                        fully_returned: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: t('status_fully_returned') },
                        partially_returned: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: t('status_partially_returned') },
                        pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: t('status_pending') },
                    };
                    const config = statusConfig[status] || { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200', label: status };
                    return (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
                            {config.label}
                        </span>
                    );
                },
            },
            {
                key: 'returns',
                label: t('lbl_return'),
                render: (value, row) => {
                    const hasReturns = value?.has_returns ?? false;
                    const totalReturned = value?.total_returned ?? 0;
                    if (!hasReturns || totalReturned === 0) {
                        return <span className="text-sm text-slate-300">-</span>;
                    }
                    return (
                        <div className="flex flex-col">
                            <span className="font-semibold text-rose-600">{formatCurrency(totalReturned)}</span>
                            {value?.count > 0 && (
                                <span className="text-xs text-slate-500">
                                    {t('msg_return_count', { count: value.count })}
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
                            date: (parts[0] || '-').replace(/\d+/g, (match) => formatNumber(match, { useGrouping: false })),
                            time: (parts.slice(1).join(' ') || '').replace(/\d+/g, (match) => formatNumber(match, { useGrouping: false })),
                        };
                    };

                    const created = formatRawDateTime(value);
                    const wasEdited = !!row.updated_at && row.updated_at !== value;
                    const updated = wasEdited ? formatRawDateTime(row.updated_at) : null;

                    return (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">{created.date}</span>
                            <span className="text-xs text-slate-500">{created.time}</span>
                            {wasEdited && updated && (
                                <span className="mt-1 text-[11px] text-slate-400" title={`${t('lbl_updated')}: ${updated.date} ${updated.time}`}>
                                    {t('lbl_updated')} {updated.date}
                                </span>
                            )}
                        </div>
                    );
                },
            },
        ],
        [t, router, formatCurrency, formatNumber]
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: t('order_action_view') || 'View Order Details',
                onClick: (order: any) => router.push(`/orders/${order.id}`),
                className: 'text-indigo-600 font-medium',
                icon: <Eye className="h-4 w-4" />,
            },
            {
                label: t('order_action_edit'),
                onClick: (order: any) => router.push(`/orders/edit/${order.id}`),
                className: 'text-slate-700',
                icon: <Edit className="h-4 w-4" />,
                hidden: (order: any) => order.status !== 'draft',
            },
            {
                label: t('order_action_invoice'),
                onClick: onOpenInvoicePreview,
                className: 'text-slate-700',
                icon: <Download className="h-4 w-4" />,
            },
            {
                label: t('order_action_thermal_receipt'),
                onClick: onThermalReceiptPrint,
                className: 'text-slate-700',
                icon: <Printer className="h-4 w-4" />,
            },
            {
                label: t('order_action_return'),
                onClick: (order: any) => {
                    if (currentStoreId) {
                        dispatch(setReturnOrderId({ storeId: currentStoreId, orderId: order.id }));
                        router.push(`/orders/return/create/${order.id}`);
                    }
                },
                className: 'text-amber-600',
                icon: <RotateCcw className="h-4 w-4" />,
                hidden: (order: any) => {
                    if (order.status === 'fully_returned') return true;
                    if (order.return_status === 'full') return true;
                    if (order.items && order.items.length > 0) {
                        const hasReturnableItems = order.items.some((item: any) => (item.returnable_quantity ?? item.quantity ?? 0) > 0);
                        if (!hasReturnableItems) return true;
                    }
                    return false;
                },
            },
            {
                label: t('order_action_void') || 'Void & Reverse',
                onClick: onDeleteRequest,
                className: 'text-rose-600',
                icon: <Trash2 className="h-4 w-4" />,
                hidden: (order: any) => !showDelete || !canVoidOrder(order),
            },
        ],
        [t, router, onViewDetails, onOpenInvoicePreview, onThermalReceiptPrint, onDeleteRequest, currentStoreId, dispatch, showDelete]
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
                icon: <Receipt className="mx-auto h-16 w-16 text-slate-300" />,
                title: t('order_no_data'),
                description: t('order_no_data_desc'),
            }}
        />
    );
};

export default OrdersTable;
