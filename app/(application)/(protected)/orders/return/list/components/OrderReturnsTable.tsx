'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
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
    const { t } = getTranslation();
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
                label: t('lbl_id'),
                sortable: true,
                render: (value, row) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{value || `#${row.id}`}</span>
                        {row.order_invoice && <span className="text-xs text-gray-500">{t('lbl_order')}: {row.order_invoice}</span>}
                    </div>
                ),
            },
            {
                key: 'customer',
                label: t('lbl_customer'),
                render: (value, row) => (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{row.is_walk_in ? t('pos_walk_in_customer') : value?.name || t('lbl_na')}</span>
                        {!row.is_walk_in && value?.phone && <span className="text-xs text-gray-500">{value.phone}</span>}
                    </div>
                ),
            },
            {
                key: 'return_type',
                label: t('lbl_type'),
                render: (value) => {
                    const typeConfig: Record<string, { className: string; label: string }> = {
                        return: { className: 'bg-red-100 text-red-800', label: t('lbl_pure_return') },
                        exchange: { className: 'bg-blue-100 text-blue-800', label: t('lbl_exchange') },
                        return_and_buy: { className: 'bg-purple-100 text-purple-800', label: t('lbl_return_and_buy') },
                    };
                    const config = typeConfig[value] || typeConfig.return;
                    return (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
                            {config.label}
                        </span>
                    );
                },
            },
            {
                key: 'return_items',
                label: t('order_items'),
                render: (value, row) => {
                    const items = row.return_items || [];
                    if (items.length === 0) return <span className="text-sm text-gray-400">{t('lbl_no_items')}</span>;
                    if (items.length === 1) {
                        return <span className="text-sm text-gray-700">{items[0].product_name}</span>;
                    }
                    return (
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-700">{items[0].product_name}</span>
                            {items.length > 1 && <span className="text-xs text-gray-500">+{items.length - 1} {t('lbl_more')}</span>}
                        </div>
                    );
                },
            },
            {
                key: 'return_items_qty',
                label: t('lbl_quantity'),
                render: (value, row) => {
                    const items = row.return_items || [];
                    const totalQty = items.reduce((sum: number, item: any) => sum + (item.quantity_returned || item.quantity || 0), 0);
                    return <span className="text-sm font-medium text-gray-700">{totalQty}</span>;
                },
            },
            {
                key: 'total_return_amount',
                label: t('lbl_amount'),
                sortable: true,
                render: (value) => <span className="font-semibold text-danger">{formatCurrency(value || 0)}</span>,
            },
            {
                key: 'net_amount',
                label: t('lbl_total'),
                sortable: true,
                render: (value) => {
                    const netAmount = Number(value || 0);
                    if (netAmount < 0) {
                        return (
                            <div className="flex flex-col">
                                <span className="font-semibold text-success">{formatCurrency(Math.abs(netAmount))}</span>
                                <span className="text-xs text-success">{t('lbl_refund')}</span>
                            </div>
                        );
                    } else if (netAmount > 0) {
                        return (
                            <div className="flex flex-col">
                                <span className="font-semibold text-warning">{formatCurrency(netAmount)}</span>
                                <span className="text-xs text-warning">{t('lbl_customer_paid')}</span>
                            </div>
                        );
                    }
                    return (
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-600">{formatCurrency(0)}</span>
                            <span className="text-xs text-gray-500">{t('lbl_even_exchange')}</span>
                        </div>
                    );
                },
            },
            {
                key: 'payment_method',
                label: t('lbl_payment_method'),
                render: (value) => <span className="text-sm capitalize text-gray-700">{value || t('lbl_cash')}</span>,
            },
            {
                key: 'payment_status',
                label: t('lbl_status'),
                render: (value) => {
                    const status = value?.toLowerCase() || 'pending';
                    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                        refunded: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: t('status_refunded') },
                        completed: { bg: 'bg-green-100', text: 'text-green-800', label: t('status_completed') },
                        paid: { bg: 'bg-green-100', text: 'text-green-800', label: t('status_paid') },
                        pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: t('status_pending') },
                    };
                    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: value || t('lbl_unknown') };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
                },
            },
            {
                key: 'processed_by',
                label: t('lbl_employee'),
                render: (value, row) => <span className="text-sm text-gray-700">{value || row.user?.name || t('lbl_na')}</span>,
            },
            {
                key: 'created_at',
                label: t('lbl_date'),
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
        [t, formatCurrency]
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: t('order_action_view'),
                onClick: handleViewDetails,
                className: 'text-gray-700',
                icon: <Eye className="h-4 w-4" />,
            },
        ],
        [t, handleViewDetails]
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
                title: t('order_no_data'),
                description: t('order_no_data_desc'),
            }}
        />
    );
};

export default OrderReturnsTable;
