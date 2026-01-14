'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { Building2, Clock, Coins, CreditCard, MapPin, Package, Phone, Settings, Store, Trash2 } from 'lucide-react';
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
                render: (value, row) => {
                    const logoUrl = value || row.logo_path;
                    return (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                            {logoUrl ? (
                                <Image
                                    src={logoUrl}
                                    alt={`${row.store_name} logo`}
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 rounded-lg object-cover"
                                    onError={(e) => {
                                        // Fallback to icon if image fails to load
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <Store className={`h-6 w-6 text-gray-400 ${logoUrl ? 'hidden' : ''}`} />
                        </div>
                    );
                },
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
                key: 'currency',
                label: 'Currency',
                render: (value, row) => {
                    // Handle both 'currency' (single object) and 'currencies' (array)
                    const currencyData = row.currency || (row.currencies && row.currencies.length > 0 ? row.currencies[0] : null);

                    return (
                        <div className="flex items-center gap-1.5">
                            <Coins className="h-4 w-4 text-gray-400" />
                            {currencyData ? (
                                <div className="text-sm">
                                    <div className="font-medium text-gray-900">{currencyData.currency_code}</div>
                                    <div className="text-xs text-gray-500">{currencyData.currency_symbol}</div>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400">Not set</span>
                            )}
                        </div>
                    );
                },
            },
            {
                key: 'payment_methods',
                label: 'Payment Methods',
                render: (value) => (
                    <div className="flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        {value && value.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {value.slice(0, 2).map((method: any) => (
                                    <span key={method.id} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                        {method.payment_method_name}
                                    </span>
                                ))}
                                {value.length > 2 && <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">+{value.length - 2}</span>}
                            </div>
                        ) : (
                            <span className="text-sm text-gray-400">None</span>
                        )}
                    </div>
                ),
            },
            {
                key: 'units',
                label: 'Units',
                render: (value) => (
                    <div className="flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-gray-400" />
                        {value && value.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {value.slice(0, 2).map((unit: any) => (
                                    <span key={unit.id} className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                                        {unit.name}
                                    </span>
                                ))}
                                {value.length > 2 && <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">+{value.length - 2}</span>}
                            </div>
                        ) : (
                            <span className="text-sm text-gray-400">None</span>
                        )}
                    </div>
                ),
            },
            {
                key: 'opening_time',
                label: 'Working Hours',
                render: (value, row) => {
                    // Format time from "09:00:00" to "9:00 AM"
                    const formatTime = (time: string) => {
                        if (!time) return '';
                        const [hours, minutes] = time.split(':');
                        const hour = parseInt(hours);
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const displayHour = hour % 12 || 12;
                        return `${displayHour}:${minutes} ${ampm}`;
                    };

                    return (
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {value && row.closing_time ? (
                                <div className="text-sm text-gray-700">
                                    <div className="font-medium">{formatTime(value)}</div>
                                    <div className="text-xs text-gray-500">to {formatTime(row.closing_time)}</div>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400">Not set</span>
                            )}
                        </div>
                    );
                },
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
