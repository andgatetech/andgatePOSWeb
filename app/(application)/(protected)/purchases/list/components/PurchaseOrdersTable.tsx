'use client';

import DateColumn from '@/components/common/DateColumn';
import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { Clock, CreditCard, Eye, PackageCheck, Printer, RotateCcw, Trash2, Truck } from 'lucide-react';
import { useMemo } from 'react';

interface PurchaseOrdersTableProps {
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
    onReceiveItems: (order: any) => void;
    onViewTransactions: (order: any) => void;
    onPartialPayment: (order: any) => void;
    onClearFullDue: (order: any) => void;
    onDelete: (order: any) => void;
    onReturn: (order: any) => void;
    showReceive: boolean;
    showDelete: boolean;
    showReturn: boolean;
}

const statusColors: Record<string, string> = {
    ordered: 'bg-blue-100 text-blue-700',
    received: 'bg-emerald-100 text-emerald-700',
    partially_received: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700',
};

const paymentColors: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    partial: 'bg-amber-100 text-amber-700',
    pending: 'bg-red-100 text-red-700',
    unpaid: 'bg-red-100 text-red-700',
};

const PurchaseOrdersTable: React.FC<PurchaseOrdersTableProps> = ({
    orders,
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
    onReturn,
    showReceive,
    showDelete,
    showReturn,
}) => {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'invoice_number',
                label: t('lbl_invoice'),
                sortable: true,
                render: (value, row) => (
                    <span className="font-semibold text-gray-900">{value || `#${row.id}`}</span>
                ),
            },
            {
                key: 'supplier',
                label: t('lbl_supplier'),
                render: (value) => (
                    <div>
                        <span className="font-medium text-gray-900">
                            {value?.name || t('lbl_walk_in_purchase')}
                        </span>
                        {value?.phone && (
                            <span className="ml-1.5 text-xs text-gray-400">{value.phone}</span>
                        )}
                    </div>
                ),
            },
            {
                key: 'items_count',
                label: t('order_items'),
                render: (value) => (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        {value ?? 0}
                    </span>
                ),
            },
            {
                key: 'grand_total',
                label: t('lbl_total'),
                sortable: true,
                render: (value) => (
                    <span className="font-semibold text-gray-900">{formatCurrency(value || 0)}</span>
                ),
            },
            {
                key: 'amount_paid',
                label: t('lbl_paid'),
                sortable: true,
                render: (value, row) => {
                    const paid = parseFloat(value) || 0;
                    const due = parseFloat(row.amount_due) || 0;
                    return (
                        <div className="space-y-0.5">
                            <span className="text-sm font-medium text-emerald-600">{formatCurrency(paid)}</span>
                            {due > 0 && (
                                <span className="block text-xs text-red-500">{t('lbl_due')}: {formatCurrency(due)}</span>
                            )}
                        </div>
                    );
                },
            },
            {
                key: 'status',
                label: t('lbl_status'),
                sortable: true,
                render: (value) => (
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[value] || 'bg-gray-100 text-gray-600'}`}>
                        {t(`lbl_status_${value}`)}
                    </span>
                ),
            },
            {
                key: 'payment_status',
                label: t('lbl_payment'),
                sortable: true,
                render: (value) => (
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${paymentColors[value] || 'bg-gray-100 text-gray-600'}`}>
                        {t(`lbl_payment_status_${value}`)}
                    </span>
                ),
            },
            {
                key: 'created_at',
                label: t('lbl_created'),
                sortable: true,
                render: (value) => <DateColumn date={value} />,
            },
        ],
        [t, formatCurrency]
    );

    const getActions = useMemo((): TableAction[] | undefined => {
        const actions: TableAction[] = [
            {
                label: t('btn_view'),
                icon: <Eye className="h-4 w-4" />,
                className: 'text-blue-600',
                onClick: onViewItems,
            },
            {
                label: t('btn_print'),
                icon: <Printer className="h-4 w-4" />,
                className: 'text-gray-600',
                onClick: onPrint,
            },
        ];

        if (showReceive) {
            actions.push({
                label: t('purchase_receive'),
                icon: <PackageCheck className="h-4 w-4" />,
                className: 'text-emerald-600',
                onClick: onReceiveItems,
            });
        }

        actions.push({
            label: t('lbl_payment'),
            icon: <CreditCard className="h-4 w-4" />,
            className: 'text-amber-600',
            onClick: (order) => {
                const due = parseFloat(order.amount_due) || 0;
                if (due <= 0) return;
                onPartialPayment(order);
            },
        });

        if (showReturn) {
            actions.push({
                label: t('lbl_return'),
                icon: <RotateCcw className="h-4 w-4" />,
                className: 'text-purple-600',
                onClick: onReturn,
            });
        }

        if (showDelete) {
            actions.push({
                label: t('lbl_delete'),
                icon: <Trash2 className="h-4 w-4" />,
                className: 'text-red-600',
                onClick: onDelete,
            });
        }

        return actions;
    }, [t, onViewItems, onPrint, onReceiveItems, onPartialPayment, onReturn, onDelete, showReceive, showDelete, showReturn]);

    return (
        <ReusableTable
            columns={columns}
            data={orders}
            actions={getActions}
            isLoading={isLoading}
            pagination={pagination}
            sorting={sorting}
            emptyState={{
                icon: <Truck className="mx-auto h-12 w-12" />,
                title: t('purchase_no_data'),
                description: t('purchase_no_data_desc'),
            }}
        />
    );
};

export default PurchaseOrdersTable;
