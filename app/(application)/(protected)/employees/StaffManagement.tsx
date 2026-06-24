'use client';
import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import StaffFilter from '@/components/filters/StaffFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { showMessage } from '@/lib/toast';
import { useGetStaffMemberQuery } from '@/store/features/store/storeApi';
import { Mail, Pencil, Plus, Shield, Trash2, User, Users, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface StaffMember {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    role_in_store: string;
    role_id?: number;
    role_name?: string;
}

const StaffManagement = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const { currentStoreId, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});


    // Pagination & Sorting State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Build query parameters based on filter state
    let queryParams: Record<string, any> = {};

    if (Object.keys(apiParams).length > 0) {
        if (apiParams.storeId === 'all' || apiParams.store_ids === 'all') {
            const allStoreIds = userStores.map((store: any) => store.id);
            queryParams.store_ids = allStoreIds.join(',');
        } else if (apiParams.store_id) {
            queryParams.store_id = apiParams.store_id;
        } else if (apiParams.storeId && apiParams.storeId !== 'all') {
            queryParams.store_id = apiParams.storeId;
        } else {
            if (currentStoreId) {
                queryParams.store_id = currentStoreId;
            }
        }

        if (apiParams.search) queryParams.search = apiParams.search;
        if (apiParams.role) queryParams.role = apiParams.role;
        if (apiParams.dateRange?.startDate) queryParams.start_date = apiParams.dateRange.startDate;
        if (apiParams.dateRange?.endDate) queryParams.end_date = apiParams.dateRange.endDate;
    } else {
        if (currentStoreId) {
            queryParams.store_id = currentStoreId;
        }
    }

    const { data: staffResponse, isLoading } = useGetStaffMemberQuery(queryParams, { refetchOnMountOrArgChange: 30 });
    const staffMembers = useMemo(() => (staffResponse?.data || []) as StaffMember[], [staffResponse?.data]);

    useEffect(() => {
        setApiParams({});
    }, [currentStoreId]);

    const handleFilterChange = useCallback(
        (newApiParams: Record<string, any>) => {
            console.log('Staff - Filter changed:', newApiParams);
            console.log('Staff - Current store from sidebar:', currentStoreId);
            setApiParams(newApiParams);
        },
        [currentStoreId]
    );

    console.log('Staff - API Params:', apiParams);
    console.log('Staff - Final Query Params:', queryParams);
    console.log('Staff - Current Store ID:', currentStoreId);
    console.log(
        'Staff - Available User Stores:',
        userStores.map((s) => ({ id: s.id, name: s.store_name }))
    );


    // Define table columns
    const columns: TableColumn[] = [
        {
            key: 'name',
            label: t('lbl_name'),
            sortable: true,
            render: (_value, row) => (
                <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                            <User className="h-6 w-6 text-gray-600" />
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="font-medium text-gray-900">{row.name}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'email',
            label: t('lbl_email'),
            sortable: true,
            render: (value) => (
                <div className="flex items-center text-sm text-gray-600">
                    <Mail className="mr-2 h-4 w-4" />
                    {value}
                </div>
            ),
        },
        {
            key: 'phone',
            label: t('lbl_phone'),
            sortable: false,
            render: (value) => <span className="text-sm text-gray-500">{value || 'N/A'}</span>,
        },
        {
            key: 'address',
            label: t('lbl_address'),
            sortable: false,
            render: (value) => (
                <div className="max-w-xs truncate text-sm text-gray-500" title={value}>
                    {value || 'N/A'}
                </div>
            ),
        },
        {
            key: 'role_name',
            label: t('lbl_role'),
            sortable: false,
            render: (_value, row) => {
                if (row.role_in_store === 'business_admin') {
                    return (
                        <span className="inline-flex items-center rounded-full bg-[#034d79]/10 px-2.5 py-0.5 text-xs font-medium text-[#034d79]">
                            {t('role_store_owner')}
                        </span>
                    );
                }
                return row.role_name ? (
                    <span className="inline-flex items-center rounded-full bg-[#046ca9]/10 px-2.5 py-0.5 text-xs font-medium text-[#046ca9]">
                        {row.role_name}
                    </span>
                ) : (
                    <span className="text-xs text-gray-400">{t('lbl_no_role')}</span>
                );
            },
        },
    ];

    // Define table actions
    const actions: TableAction[] = [
        {
            label: t('employee_action_edit'),
            icon: <Pencil className="h-4 w-4" />,
            className: 'text-gray-700',
            onClick: (row) => {
                const params = new URLSearchParams({
                    name: row.name || '',
                    phone: row.phone || '',
                    address: row.address || '',
                    store_id: String(currentStoreId || ''),
                    role_id: String(row.role_id || ''),
                    role_in_store: row.role_in_store || '',
                });
                router.push(`/employees/edit/${row.id}?${params.toString()}`);
            },
        },
        {
            label: t('btn_delete'),
            icon: <Trash2 className="h-4 w-4" />,
            className: 'text-danger',
            onClick: (row) => {
                showMessage(t('msg_employee_delete_coming_soon'), 'info');
            },
        },
    ];

    // Handle table sorting
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [apiParams]);

    const getStats = () => {
        if (!staffMembers || staffMembers.length === 0) return { total: 0, withRole: 0, withoutRole: 0 };
        return {
            total: staffMembers.length,
            withRole: staffMembers.filter((s: StaffMember) => !!s.role_id || s.role_in_store === 'business_admin').length,
            withoutRole: staffMembers.filter((s: StaffMember) => !s.role_id && s.role_in_store !== 'business_admin').length,
        };
    };

    const stats = getStats();

    if (isLoading) {
        return <Loader message={t('msg_loading_staff')} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('employee_management_title')}</h1>
                        <p className="text-sm text-gray-500">{t('employee_management_subtitle')}</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push('/employees/create')}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-105"
                >
                    <Plus className="h-4 w-4" />
                    {t('employee_add')}
                </button>
            </div>

            {/* Filter Bar */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <StaffFilter key={`staff-filter-${currentStoreId}`} onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
                <div className="rounded-lg border bg-white p-3 shadow-sm sm:p-4 md:p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-600 sm:text-sm">{t('employee_stats_total')}</p>
                            <p className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">{stats.total}</p>
                        </div>
                        <Users className="h-6 w-6 text-[#046ca9] sm:h-7 sm:w-7 md:h-8 md:w-8" />
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-3 shadow-sm sm:p-4 md:p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-600 sm:text-sm">{t('employee_stats_with_role')}</p>
                            <p className="text-lg font-bold text-[#034d79] sm:text-xl md:text-2xl">{stats.withRole}</p>
                        </div>
                        <Shield className="h-6 w-6 text-[#034d79] sm:h-7 sm:w-7 md:h-8 md:w-8" />
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-3 shadow-sm sm:p-4 md:p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-600 sm:text-sm">{t('employee_stats_without_role')}</p>
                            <p className="text-lg font-bold text-[#e79237] sm:text-xl md:text-2xl">{stats.withoutRole}</p>
                        </div>
                        <XCircle className="h-6 w-6 text-[#e79237] sm:h-7 sm:w-7 md:h-8 md:w-8" />
                    </div>
                </div>
            </div>

                {/* Reusable Table */}
                <ReusableTable
                    data={staffMembers}
                    columns={columns}
                    actions={actions}
                    isLoading={isLoading}
                    emptyState={{
                        icon: <Users className="h-16 w-16" />,
                        title: t('msg_no_staff_found'),
                        description: Object.keys(apiParams).length > 0 ? t('msg_adjust_filters') : t('msg_add_first_staff'),
                    }}
                    pagination={{
                        currentPage,
                        totalPages: Math.ceil(staffMembers.length / itemsPerPage),
                        itemsPerPage,
                        totalItems: staffMembers.length,
                        onPageChange: setCurrentPage,
                        onItemsPerPageChange: setItemsPerPage,
                    }}
                    sorting={{
                        field: sortField,
                        direction: sortDirection,
                        onSort: handleSort,
                    }}
                />

        </div>
    );
};

export default StaffManagement;
