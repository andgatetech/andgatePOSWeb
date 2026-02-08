'use client';

import DateColumn from '@/components/common/DateColumn';
import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { Edit, Eye, Package, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface SuppliersTableProps {
    suppliers: any[];
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
    onViewDetails: (supplier: any) => void;
    onEdit: (supplier: any) => void;
    onDelete: (supplier: any) => void;
}

const SuppliersTable: React.FC<SuppliersTableProps> = ({ suppliers, isLoading, pagination, sorting, onViewDetails, onEdit, onDelete }) => {
    const router = useRouter();

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'name',
                label: 'Supplier Name',
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
                label: 'Contact',
                render: (value, row) => (
                    <div className="flex flex-col">
                        {value && <span className="text-sm text-gray-900">{value}</span>}
                        {row.contact_person && <span className="text-xs text-gray-500">Contact: {row.contact_person}</span>}
                    </div>
                ),
            },
            {
                key: 'address',
                label: 'Address',
                render: (value) => {
                    const address = value || 'N/A';
                    const truncatedAddress = address.length > 30 ? address.substring(0, 30) + '...' : address;
                    return (
                        <span className="text-sm text-gray-700" title={address}>
                            {truncatedAddress}
                        </span>
                    );
                },
            },
            {
                key: 'store_name',
                label: 'Store',
                render: (value) => <span className="text-sm text-gray-700">{value || 'N/A'}</span>,
            },
            {
                key: 'status',
                label: 'Status',
                sortable: true,
                render: (value) => {
                    const status = value?.toLowerCase() || 'inactive';
                    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                        active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
                        inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
                        blocked: { bg: 'bg-red-100', text: 'text-red-800', label: 'Blocked' },
                    };
                    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: value || 'Unknown' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
                },
            },
            {
                key: 'created_at',
                label: 'Created Date',
                sortable: true,
                render: (value) => <DateColumn date={value} />,
            },
            {
                key: 'updated_at',
                label: 'Updated Date',
                sortable: true,
                render: (value) => <DateColumn date={value} />,
            },
        ],
        []
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: 'View Details',
                onClick: onViewDetails,
                className: 'text-blue-600',
                icon: <Eye className="h-4 w-4" />,
            },
            {
                label: 'Edit Supplier',
                onClick: onEdit,
                className: 'text-orange-600',
                icon: <Edit className="h-4 w-4" />,
            },
            {
                label: 'Delete Supplier',
                onClick: onDelete,
                className: 'text-red-600',
                icon: <Trash2 className="h-4 w-4" />,
            },
        ],
        [onViewDetails, onEdit, onDelete]
    );

    return (
        <ReusableTable
            data={suppliers}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            pagination={pagination}
            sorting={sorting}
            emptyState={{
                icon: <Package className="mx-auto h-16 w-16" />,
                title: 'No Suppliers Found',
                description: 'No suppliers match your current filters. Try adjusting your search criteria or add a new supplier.',
            }}
        />
    );
};

export default SuppliersTable;
