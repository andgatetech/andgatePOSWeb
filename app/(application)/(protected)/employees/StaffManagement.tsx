'use client';
import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import StaffFilter from '@/components/filters/StaffFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { showMessage } from '@/lib/toast';
import { useAssignRoleMutation, useGetRolesQuery, useUnassignRoleMutation } from '@/store/features/roles/rolesApi';
import { useGetStaffMemberQuery } from '@/store/features/store/storeApi';
import { CheckCircle, Loader2, Mail, Pencil, Plus, Shield, Trash2, User, Users, XCircle } from 'lucide-react';
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

    const { data: staffResponse, isLoading, refetch: refetchStaffMembers } = useGetStaffMemberQuery(queryParams, { refetchOnMountOrArgChange: 30 });
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

    // Role assignment
    const { data: rolesResponse } = useGetRolesQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const availableRoles = useMemo(() => {
        const d = rolesResponse as any;
        if (Array.isArray(d?.data?.data)) return d.data.data as { id: number; name: string }[];
        if (Array.isArray(d?.data)) return d.data as { id: number; name: string }[];
        return [] as { id: number; name: string }[];
    }, [rolesResponse]);
    const [assignRole] = useAssignRoleMutation();
    const [unassignRole] = useUnassignRoleMutation();
    const [assigningRole, setAssigningRole] = useState<Record<number, boolean>>({});

    const handleRoleChange = useCallback(
        async (staffId: number, newRoleId: string, currentRoleId?: number) => {
            setAssigningRole((prev) => ({ ...prev, [staffId]: true }));
            try {
                if (newRoleId === '') {
                    if (currentRoleId) {
                        await unassignRole({ roleId: currentRoleId, user_id: staffId }).unwrap();
                        showMessage(t('msg_role_unassigned'));
                    }
                } else {
                    await assignRole({ roleId: Number(newRoleId), user_id: staffId }).unwrap();
                    showMessage(t('msg_role_assigned'));
                }
                refetchStaffMembers();
            } catch (error: any) {
                showMessage(error?.data?.message || t('msg_failed_assign_role'), 'error');
            } finally {
                setAssigningRole((prev) => ({ ...prev, [staffId]: false }));
            }
        },
        [assignRole, unassignRole, refetchStaffMembers, t]
    );

    const getRoleBadge = (role: string) => {
        const roleStyles: Record<string, string> = {
            'store admin': 'bg-[#046ca9]/10 text-[#034d79]',
            manager: 'bg-[#046ca9]/10 text-[#046ca9]',
            staff: 'bg-[#e79237]/15 text-[#9a5a14]',
            cashier: 'bg-[#e79237]/15 text-[#c47920]',
        };

        return roleStyles[role] || 'bg-gray-100 text-gray-800';
    };

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
            key: 'role_in_store',
            label: t('lbl_role'),
            sortable: true,
            render: (value) => <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getRoleBadge(value)}`}>{value}</span>,
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
            label: t('lbl_custom_role'),
            sortable: false,
            render: (_value, row) =>
                assigningRole[row.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#046ca9]" />
                ) : (
                    <select
                        value={row.role_id ?? ''}
                        onChange={(e) => handleRoleChange(row.id, e.target.value, row.role_id)}
                        className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:border-[#046ca9] focus:outline-none focus:ring-1 focus:ring-[#046ca9]"
                    >
                        <option value="">{t('lbl_no_role')}</option>
                        {availableRoles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                ),
        },
    ];

    // Define table actions
    const actions: TableAction[] = [
        {
            label: t('employee_action_edit'),
            icon: <Pencil className="h-4 w-4" />,
            className: 'text-[#046ca9]',
            onClick: (row) => {
                const params = new URLSearchParams({
                    name: row.name || '',
                    phone: row.phone || '',
                    address: row.address || '',
                    role: row.role_in_store || 'staff',
                    store_id: String(currentStoreId || ''),
                    role_id: String(row.role_id || ''),
                });
                router.push(`/employees/edit/${row.id}?${params.toString()}`);
            },
        },
        {
            label: t('btn_delete'),
            icon: <Trash2 className="h-4 w-4" />,
            className: 'text-red-700',
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
        if (!staffMembers || staffMembers.length === 0) return { total: 0, admins: 0, staff: 0, managers: 0 };

        return {
            total: staffMembers.length,
            admins: staffMembers.filter((s: StaffMember) => s.role_in_store === 'store admin').length,
            staff: staffMembers.filter((s: StaffMember) => s.role_in_store === 'staff').length,
            managers: staffMembers.filter((s: StaffMember) => s.role_in_store === 'manager').length,
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
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">{t('employee_stats_admins')}</p>
                                <p className="text-lg font-bold text-[#034d79] sm:text-xl md:text-2xl">{stats.admins}</p>
                            </div>
                            <Shield className="h-6 w-6 text-[#034d79] sm:h-7 sm:w-7 md:h-8 md:w-8" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-3 shadow-sm sm:p-4 md:p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">{t('employee_page_title')}</p>
                                <p className="text-lg font-bold text-[#e79237] sm:text-xl md:text-2xl">{stats.staff}</p>
                            </div>
                            <CheckCircle className="h-6 w-6 text-[#e79237] sm:h-7 sm:w-7 md:h-8 md:w-8" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-3 shadow-sm sm:p-4 md:p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">{t('employee_stats_managers')}</p>
                                <p className="text-lg font-bold text-[#046ca9] sm:text-xl md:text-2xl">{stats.managers}</p>
                            </div>
                            <XCircle className="h-6 w-6 text-[#046ca9] sm:h-7 sm:w-7 md:h-8 md:w-8" />
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
