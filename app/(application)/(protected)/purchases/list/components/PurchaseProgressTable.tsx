'use client';

import DateColumn from '@/components/common/DateColumn';
import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { Clock, CreditCard, Download, Eye, PackageCheck, Printer } from 'lucide-react';
import { useMemo } from 'react';

interface PurchaseProgressTableProps {
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
}

const PurchaseProgressTable: React.FC<PurchaseProgressTableProps> = ({
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
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{value || `#${row.id}`}</span>
                    </div>
                ),
            },
            {
                key: 'supplier',
                label: t('lbl_supplier'),
                render: (value) => (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{value?.name || 'Walk-in Purchase'}</span>
                        {value?.phone && <span className="text-xs text-gray-500">{value.phone}</span>}
                    </div>
                ),
            },
            {
                key: 'store_name',
                label: t('lbl_store'),
                render: (value) => <span className="text-sm text-gray-700">{value || 'N/A'}</span>,
            },
            {
                key: 'items',
                label: t('order_items'),
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
                label: t('lbl_total'),
                sortable: true,
                render: (value) => <span className="font-semibold text-gray-900">{formatCurrency(value || 0)}</span>,
            },
            {
                key: 'amount_due',
                label: t('lbl_due'),
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
                label: t('order_payment_status'),
                sortable: true,
                render: (value) => {
                    const status = value?.toLowerCase() || 'pending';
                    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                        paid: { bg: 'bg-green-100', text: 'text-green-800', label: t('status_paid') },
                        partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('status_partial') },
                        pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: t('status_pending') },
                        unpaid: { bg: 'bg-red-100', text: 'text-red-800', label: t('status_unpaid') },
                    };
                    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: value || 'Unknown' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
                },
            },
            {
                key: 'status',
                label: t('lbl_status'),
                sortable: true,
                render: (value) => {
                    const status = value?.toLowerCase() || 'ordered';
                    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                        ordered: { bg: 'bg-blue-100', text: 'text-blue-800', label: t('status_ordered') },
                        partially_received: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('status_partially_received') },
                        received: { bg: 'bg-green-100', text: 'text-green-800', label: t('status_received') },
                        cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: t('status_cancelled') },
                    };
                    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: value || 'Unknown' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
                },
            },
            {
                key: 'created_at',
                label: t('lbl_created'),
                sortable: true,
                render: (value) => <DateColumn date={value} />,
            },
            {
                key: 'updated_at',
                label: t('lbl_updated'),
                sortable: true,
                render: (value) => <DateColumn date={value} />,
            },
        ],
        [t, formatCurrency]
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: t('purchase_action_view'),
                onClick: onViewItems,
                className: 'text-blue-600',
                icon: <Eye className="h-4 w-4" />,
            },
            {
                label: t('purchase_action_receive'),
                onClick: (row: any) => {
                    if (row.status !== 'received' && row.status !== 'cancelled') {
                        onReceiveItems(row);
                    }
                },
                className: 'text-purple-600',
                icon: <PackageCheck className="h-4 w-4" />,
            },
            {
                label: t('purchase_action_receive'),
                onClick: onViewTransactions,
                className: 'text-indigo-600',
                icon: <Clock className="h-4 w-4" />,
            },
            {
                label: t('purchase_partial_payment'),
                onClick: (row: any) => {
                    if (row.payment_status !== 'paid' && row.amount_due > 0) {
                        onPartialPayment(row);
                    }
                },
                className: 'text-orange-600',
                icon: <CreditCard className="h-4 w-4" />,
            },
            {
                label: t('purchase_clear_due'),
                onClick: (row: any) => {
                    if (row.payment_status !== 'paid' && row.amount_due > 0) {
                        onClearFullDue(row);
                    }
                },
                className: 'text-green-600',
                icon: <CreditCard className="h-4 w-4" />,
            },
            {
                label: t('btn_print'),
                onClick: onPrint,
                className: 'text-gray-600',
                icon: <Printer className="h-4 w-4" />,
            },
        ],
        [onViewItems, onReceiveItems, onViewTransactions, onPartialPayment, onClearFullDue, onPrint]
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
                icon: <Download className="mx-auto h-16 w-16" />,
                title: t('purchase_no_data'),
                description: t('order_no_data_desc'),
            }}
        />
    );
};

export default PurchaseProgressTable;
