'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { Building2, MapPin, Phone, Settings, Store, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface StoresTableProps {
    stores: any[];
    isLoading: boolean;
    pagination?: {
        currentPage: number;
        totalPages: number;
        itemsPerPage: number;
        totalItems: number;
        onPageChange: (page: number) => void;
        onItemsPerPageChange: (items: number) => void;
    };
    sorting?: {
        field: string;
        direction: 'asc' | 'desc';
        onSort: (field: string) => void;
    };
    onDelete: (store: any) => void;
}

const StoresTable: React.FC<StoresTableProps> = ({ stores, isLoading, pagination, sorting, onDelete }) => {
    const router = useRouter();

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'logo_path',
                label: 'Logo',
                render: (value, row) => (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                        {value ? (
                            <Image src={value} alt={`${row.store_name} logo`} width={48} height={48} className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                            <Store className="h-6 w-6 text-gray-400" />
                        )}
                    </div>
                ),
            },
            {
                key: 'store_name',
                label: 'Store Details',
                sortable: true,
                render: (value, row) => (
                    <div className="space-y-1">
                        <div className="font-semibold text-gray-900">{value}</div>
                        {(row.store_location || row.store_contact) && (
                            <div className="flex flex-col gap-1 text-sm text-gray-500">
                                {row.store_location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {row.store_location}
                                    </div>
                                )}
                                {row.store_contact && (
                                    <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {row.store_contact}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ),
            },
            {
                key: 'currencies',
                label: 'Currency',
                render: (value) => (
                    <div className="text-sm font-medium text-gray-700">
                        {value && value.length > 0 ? (
                            <span>
                                {value[0].currency_code} ({value[0].currency_symbol})
                            </span>
                        ) : (
                            <span className="text-gray-400">-</span>
                        )}
                    </div>
                ),
            },
            {
                key: 'opening_time',
                label: 'Working Hours',
                render: (value, row) => (
                    <div className="text-sm">
                        {value && row.closing_time ? (
                            <span className="text-gray-700">
                                {value} - {row.closing_time}
                            </span>
                        ) : (
                            <span className="text-gray-400">Not set</span>
                        )}
                    </div>
                ),
            },
            {
                key: 'is_active',
                label: 'Status',
                sortable: true,
                render: (value, row) => {
                    const isActive = (value === true || value === 1 || value === '1') && !row.store_disabled;
                    return (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {isActive ? 'Active' : 'Inactive'}
                        </span>
                    );
                },
            },
        ],
        []
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: 'Settings',
                onClick: () => router.push('/store/setting'),
                icon: <Settings className="h-4 w-4" />,
            },
            {
                label: 'Delete Store',
                onClick: onDelete,
                className: 'text-red-600',
                icon: <Trash2 className="h-4 w-4" />,
            },
        ],
        [onDelete, router]
    );

    return (
        <ReusableTable
            data={stores}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            pagination={pagination}
            sorting={sorting}
            emptyState={{
                icon: <Building2 className="mx-auto h-16 w-16" />,
                title: 'No Stores Found',
                description: 'No stores match your current filters. Try adding a new store.',
            }}
        />
    );
};

export default StoresTable;
