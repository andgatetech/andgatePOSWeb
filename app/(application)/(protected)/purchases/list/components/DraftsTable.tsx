'use client';

import DateColumn from '@/components/common/DateColumn';
import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { Edit, Eye, FileText, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface DraftsTableProps {
    drafts: any[];
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
    onViewItems: (draft: any) => void;
    onConvertToPO: (draft: any) => void;
    onDelete: (draft: any) => void;
}

const DraftsTable: React.FC<DraftsTableProps> = ({ drafts, isLoading, pagination, sorting, onViewItems, onConvertToPO, onDelete }) => {
    const { t } = getTranslation();
    const router = useRouter();
    const { formatCurrency } = useCurrency();

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'draft_reference',
                label: t('lbl_reference'),
                sortable: true,
                render: (value, row) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                ),
            },
            {
                key: 'supplier',
                label: t('lbl_supplier'),
                render: (value, row) => (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{row.purchase_type === 'walk_in' ? 'Walk-in Purchase' : value?.name || 'N/A'}</span>
                    </div>
                ),
            },
            {
                key: 'store',
                label: t('lbl_store'),
                render: (value) => <span className="text-sm text-gray-700">{value?.name || 'N/A'}</span>,
            },
            {
                key: 'summary',
                label: t('order_items'),
                render: (value) => {
                    const totalItems = value?.total_items || 0;
                    const existingProducts = value?.existing_products || 0;
                    const newProducts = value?.new_products || 0;
                    return (
                        <div className="flex flex-col gap-1">
                            <span className="inline-flex w-fit items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                {totalItems} {totalItems === 1 ? 'item' : 'items'}
                            </span>
                            {newProducts > 0 && <span className="text-xs text-green-600">+{newProducts} new</span>}
                        </div>
                    );
                },
            },
            {
                key: 'estimated_total',
                label: t('lbl_total'),
                sortable: true,
                render: (value) => <span className="font-semibold text-gray-900">{formatCurrency(value || 0)}</span>,
            },
            {
                key: 'status',
                label: t('lbl_status'),
                sortable: true,
                render: (value) => {
                    const status = value?.toLowerCase() || 'preparing';
                    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                        preparing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('status_preparing') },
                        pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: t('status_pending') },
                        draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: t('status_draft') },
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
                label: t('purchase_action_edit'),
                onClick: (draft) => router.push(`/purchases/edit/${draft.id}`),
                className: 'text-orange-600',
                icon: <Edit className="h-4 w-4" />,
            },
            {
                label: t('purchase_action_view'),
                onClick: onViewItems,
                className: 'text-blue-600',
                icon: <Eye className="h-4 w-4" />,
            },
            {
                label: t('purchase_action_receive'),
                onClick: onConvertToPO,
                className: 'text-green-600',
                icon: <FileText className="h-4 w-4" />,
            },
            {
                label: t('purchase_action_delete'),
                onClick: onDelete,
                className: 'text-red-600',
                icon: <Trash2 className="h-4 w-4" />,
            },
        ],
        [t, router, onViewItems, onConvertToPO, onDelete]
    );

    return (
        <ReusableTable
            data={drafts}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            pagination={pagination}
            sorting={sorting}
            emptyState={{
                icon: <FileText className="mx-auto h-16 w-16" />,
                title: t('purchase_no_data'),
                description: t('order_no_data_desc'),
            }}
        />
    );
};

export default DraftsTable;
