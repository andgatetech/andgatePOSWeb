'use client';
import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { CheckCircle, CreditCard, Eye } from 'lucide-react';
import React from 'react';

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
    onViewDetails: (due: any) => void;
    onPartialPayment: (due: any) => void;
    onClearFullDue: (due: any) => void;
}

const PurchaseDuesTable: React.FC<PurchaseDuesTableProps> = ({ dues, isLoading, pagination, sorting, onViewDetails, onPartialPayment, onClearFullDue }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { bg: string; text: string; label: string }> = {
            pending: { bg: 'bg-red-100', text: 'text-red-700', label: 'Pending' },
            partial: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Partial' },
            paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
            unpaid: { bg: 'bg-red-100', text: 'text-red-700', label: 'Unpaid' },
        };

        const badge = badges[status] || badges.pending;
        return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>{badge.label}</span>;
    };

    const columns: TableColumn[] = [
        {
            key: 'invoice_number',
            label: 'Invoice',
            sortable: true,
            render: (value) => <span className="font-semibold text-blue-600">{value}</span>,
        },
        {
            key: 'store_name',
            label: 'Store',
            sortable: true,
            render: (value) => <span className="font-medium text-gray-900">{value}</span>,
        },
        {
            key: 'supplier_name',
            label: 'Supplier',
            sortable: true,
            render: (value, row) => <span className="text-sm text-gray-600">{row.supplier?.name || 'Walk-in'}</span>,
        },
        {
            key: 'grand_total',
            label: 'Total Amount',
            sortable: true,
            render: (value) => <span className="font-semibold text-gray-900">৳{formatCurrency(value)}</span>,
        },
        {
            key: 'amount_paid',
            label: 'Paid',
            sortable: true,
            render: (value) => <span className="text-green-600">৳{formatCurrency(value)}</span>,
        },
        {
            key: 'amount_due',
            label: 'Due Amount',
            sortable: true,
            render: (value, row) => {
                const dueAmount = parseFloat(value) || 0;
                const colorClass = dueAmount > 0 ? 'text-red-600' : dueAmount < 0 ? 'text-purple-600' : 'text-gray-600';
                return <span className={`font-bold ${colorClass}`}>৳{formatCurrency(dueAmount)}</span>;
            },
        },
        {
            key: 'payment_status',
            label: 'Status',
            sortable: true,
            render: (value) => getStatusBadge(value),
        },
        {
            key: 'created_at',
            label: 'Created At',
            sortable: true,
            render: (value) => <span className="text-sm text-gray-500">{formatDate(value)}</span>,
        },
    ];

    const actions: TableAction[] = [
        {
            label: 'View Details',
            onClick: onViewDetails,
            className: 'text-blue-600 hover:text-blue-800',
            icon: <Eye className="h-4 w-4" />,
        },
        {
            label: 'Partial Payment',
            onClick: (row: any) => {
                if (row.payment_status !== 'paid' && row.amount_due > 0) {
                    onPartialPayment(row);
                }
            },
            className: 'text-orange-600 hover:text-orange-800',
            icon: <CreditCard className="h-4 w-4" />,
        },
        {
            label: 'Clear Full Due',
            onClick: (row: any) => {
                if (row.payment_status !== 'paid' && row.amount_due > 0) {
                    onClearFullDue(row);
                }
            },
            className: 'text-green-600 hover:text-green-800',
            icon: <CheckCircle className="h-4 w-4" />,
        },
    ];

    return (
        <ReusableTable
            data={dues}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            pagination={pagination}
            sorting={sorting}
            emptyState={{
                icon: (
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                ),
                title: 'No purchase dues found',
                description: 'All purchases are paid or no purchases exist',
            }}
        />
    );
};

export default PurchaseDuesTable;
