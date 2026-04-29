'use client';

import DateColumn from '@/components/common/DateColumn';
import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { Edit, Eye, Trash2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface CustomersTableProps {
    customers: any[];
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
    onViewDetails: (customer: any) => void;
    onEdit: (customer: any) => void;
    onDelete: (customer: any) => void;
}

const CustomersTable: React.FC<CustomersTableProps> = ({ customers, isLoading, pagination, sorting, onViewDetails, onEdit, onDelete }) => {
    const { t } = getTranslation();
    const router = useRouter();
    const { formatCurrency } = useCurrency();

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'name',
                label: t('customer_col_name'),
                sortable: true,
                render: (value, row) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{value || 'N/A'}</span>
                        {row.email && <span className="text-xs text-gray-500">{row.email}</span>}
                    </div>
                ),
            },
            {
                key: 'phone',
                label: t('lbl_phone'),
                render: (value) => <span className="text-sm text-gray-900">{value || 'N/A'}</span>,
            },
            {
                key: 'membership',
                label: t('customer_col_membership'),
                sortable: true,
                render: (value) => {
                    const membership = value?.toLowerCase() || 'normal';
                    const membershipConfig: Record<string, { bg: string; text: string; label: string }> = {
                        normal: { bg: 'bg-gray-100', text: 'text-gray-800', label: t('status_normal') },
                        silver: { bg: 'bg-slate-100', text: 'text-slate-800', label: t('status_silver') },
                        gold: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('status_gold') },
                        platinum: { bg: 'bg-purple-100', text: 'text-purple-800', label: t('status_platinum') },
                    };
                    const config = membershipConfig[membership] || { bg: 'bg-gray-100', text: 'text-gray-800', label: value || 'Normal' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
                },
            },
            {
                key: 'points',
                label: t('lbl_loyalty_points'),
                sortable: true,
                render: (value) => (
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-gray-900">{value || 0}</span>
                        <span className="text-xs text-gray-500">pts</span>
                    </div>
                ),
            },
            {
                key: 'balance',
                label: t('lbl_balance'),
                sortable: true,
                render: (value) => {
                    const balance = parseFloat(value || 0);
                    const isPositive = balance > 0;
                    return (
                        <div className="flex flex-col">
                            <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrency(Math.abs(balance))}</span>
                            {balance < 0 && <span className="text-xs text-red-500">{t('lbl_due')}</span>}
                        </div>
                    );
                },
            },
            {
                key: 'is_active',
                label: t('lbl_status'),
                sortable: true,
                render: (value) => {
                    const isActive = value === true || value === 1;
                    return (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {isActive ? t('status_active') : t('status_inactive')}
                        </span>
                    );
                },
            },
            {
                key: 'store_name',
                label: t('lbl_store'),
                render: (value) => <span className="text-sm text-gray-700">{value || 'N/A'}</span>,
            },
            {
                key: 'created_at',
                label: t('customer_col_joined_date'),
                sortable: true,
                render: (value) => <DateColumn date={value} />,
            },
        ],
        [t, formatCurrency]
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: t('customer_action_view'),
                onClick: onViewDetails,
                className: 'text-blue-600',
                icon: <Eye className="h-4 w-4" />,
            },
            {
                label: t('customer_action_edit'),
                onClick: onEdit,
                className: 'text-orange-600',
                icon: <Edit className="h-4 w-4" />,
            },
            {
                label: t('customer_action_delete'),
                onClick: onDelete,
                className: 'text-red-600',
                icon: <Trash2 className="h-4 w-4" />,
            },
        ],
        [onViewDetails, onEdit, onDelete]
    );

    return (
        <ReusableTable
            data={customers}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            pagination={pagination}
            sorting={sorting}
            emptyState={{
                icon: <Users className="mx-auto h-16 w-16" />,
                title: t('customer_no_data'),
                description: t('customer_no_data_desc'),
            }}
        />
    );
};

export default CustomersTable;
