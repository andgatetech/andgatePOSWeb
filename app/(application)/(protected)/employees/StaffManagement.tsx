'use client';
import PermissionSelector from '@/app/(application)/(protected)/employees/employees/PermissionSelector';
import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import StaffFilter from '@/components/filters/StaffFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { showMessage } from '@/lib/toast';
import { RootState } from '@/store';
import { useGetUserPermissionsQuery, useUpdateUserPermissionMutation } from '@/store/features/auth/authApi';
import { useGetStaffMemberQuery } from '@/store/features/store/storeApi';
import { CheckCircle, Loader2, Mail, Pencil, Plus, Shield, ShieldCheck, Trash2, User, Users, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

interface StaffMember {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    role_in_store: string;
}

interface Permission {
    id: number;
    name: string;
}

const StaffManagement = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const { currentStoreId, userStores } = useCurrentStore();
    const adminUser = useSelector((state: RootState) => state.auth?.user);
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [permissionModalOpen, setPermissionModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [selectAllPermissions, setSelectAllPermissions] = useState(false);

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

    const {
        data: userPermissionsResponse,
        isFetching: userPermissionsLoading,
        refetch: refetchUserPermissions,
    } = useGetUserPermissionsQuery(selectedStaff?.id ?? 0, {
        skip: !selectedStaff?.id,
    });

    // Fetch all available permissions using the admin's own account
    const { data: allPermissionsResponse, isFetching: allPermissionsLoading } = useGetUserPermissionsQuery(adminUser?.id ?? 0, {
        skip: !adminUser?.id,
    });

    const allPermissions = useMemo<Permission[]>(() => allPermissionsResponse?.data?.permissions || [], [allPermissionsResponse]);
    const permissionsLoading = userPermissionsLoading || allPermissionsLoading;
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};

        allPermissions.forEach((permission) => {
            const [category] = permission.name.split('.');
            const key = category || 'general';
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(permission);
        });

        return groups;
    }, [allPermissions]);

    const permissionFetchLoading = permissionsLoading || (permissionModalOpen && userPermissionsLoading);
    const [updateUserPermission, { isLoading: isUpdatingPermission }] = useUpdateUserPermissionMutation();

    // Reset filters when store changes
    useEffect(() => {
        setApiParams({});
    }, [currentStoreId]);

    // Load user permissions when modal opens
    useEffect(() => {
        if (!selectedStaff) {
            setSelectedPermissions([]);
            setSelectAllPermissions(false);
            return;
        }

        const apiPermissions =
            userPermissionsResponse?.data?.permissions ??
            userPermissionsResponse?.permissions ??
            userPermissionsResponse?.data ??
            (Array.isArray(userPermissionsResponse) ? userPermissionsResponse : undefined);

        if (!apiPermissions) {
            setSelectedPermissions([]);
            setSelectAllPermissions(false);
            return;
        }

        if (apiPermissions === 'all') {
            setSelectAllPermissions(true);
            setSelectedPermissions(allPermissions.map((permission) => permission.name));
            return;
        }

        let derivedNames: string[] = [];

        if (Array.isArray(apiPermissions)) {
            if (apiPermissions.length === 0) {
                derivedNames = [];
            } else if (typeof apiPermissions[0] === 'string') {
                derivedNames = apiPermissions as string[];
            } else if (typeof apiPermissions[0] === 'number' && allPermissions.length) {
                const idSet = new Set(apiPermissions as number[]);
                derivedNames = allPermissions.filter((permission) => idSet.has(permission.id)).map((permission) => permission.name);
            }
        } else if (typeof apiPermissions === 'object') {
            const permissionsObj = apiPermissions as { ids?: number[]; names?: string[] };
            if (Array.isArray(permissionsObj.names) && permissionsObj.names.length > 0) {
                derivedNames = permissionsObj.names;
            } else if (Array.isArray(permissionsObj.ids) && permissionsObj.ids.length > 0 && allPermissions.length) {
                const idSet = new Set(permissionsObj.ids);
                derivedNames = allPermissions.filter((permission) => idSet.has(permission.id)).map((permission) => permission.name);
            }
        }

        const uniqueNames = Array.from(new Set(derivedNames));
        const hasAllPermissions = uniqueNames.length > 0 && uniqueNames.length === allPermissions.length;

        setSelectAllPermissions(hasAllPermissions);
        setSelectedPermissions(hasAllPermissions ? allPermissions.map((permission) => permission.name) : uniqueNames);
    }, [selectedStaff, userPermissionsResponse, allPermissions]);

    useEffect(() => {
        if (permissionModalOpen && selectedStaff?.id) {
            refetchUserPermissions();
        }
    }, [permissionModalOpen, selectedStaff?.id, refetchUserPermissions]);

    const handlePermissionToggle = (permissionName: string) => {
        setSelectedPermissions((prev) => {
            if (prev.includes(permissionName)) {
                return prev.filter((name) => name !== permissionName);
            }
            return [...prev, permissionName];
        });
        setSelectAllPermissions(false);
    };

    const handleCategoryToggle = (category: string, permissions: Permission[]) => {
        const categoryPermissionNames = permissions.map((p) => p.name);
        if (categoryPermissionNames.length === 0) return;

        const allSelected = categoryPermissionNames.every((name) => selectedPermissions.includes(name));
        setSelectedPermissions((prev) => {
            if (allSelected) {
                return prev.filter((name) => !categoryPermissionNames.includes(name));
            }
            return Array.from(new Set([...prev, ...categoryPermissionNames]));
        });
        setSelectAllPermissions(false);
    };

    const handleSelectAllToggle = () => {
        if (selectAllPermissions) {
            setSelectAllPermissions(false);
            setSelectedPermissions([]);
            return;
        }

        setSelectAllPermissions(true);
        setSelectedPermissions(allPermissions.map((permission) => permission.name));
    };

    const openPermissionsModal = (staff: StaffMember) => {
        setSelectedStaff(staff);
        setPermissionModalOpen(true);
    };

    const closePermissionsModal = () => {
        setPermissionModalOpen(false);
        setSelectedStaff(null);
        setSelectedPermissions([]);
        setSelectAllPermissions(false);
    };

    const handleSavePermissions = async () => {
        if (!selectedStaff) return;

        try {
            const selectedPermissionIds = allPermissions.filter((permission) => selectedPermissions.includes(permission.name)).map((permission) => permission.id);

            const payload = selectAllPermissions ? 'all' : selectedPermissionIds;

            await updateUserPermission({ userId: selectedStaff.id, permissionData: { permissions: payload } }).unwrap();
            refetchStaffMembers();
            showMessage(t('msg_permissions_updated'));
            closePermissionsModal();
        } catch (error: any) {
            console.error('Permission update failed:', error);
            showMessage(error?.data?.message || t('msg_failed_update_permissions'), 'error');
        }
    };

    const handlePlaceholderAction = (message: string) => {
        showMessage(message, 'info');
    };

    const selectedPermissionsCount = selectAllPermissions ? allPermissions.length : selectedPermissions.length;

    const getRoleBadge = (role: string) => {
        const roleStyles: Record<string, string> = {
            'store admin': 'bg-purple-100 text-purple-800',
            manager: 'bg-blue-100 text-blue-800',
            staff: 'bg-green-100 text-green-800',
            cashier: 'bg-yellow-100 text-yellow-800',
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
    ];

    // Define table actions
    const actions: TableAction[] = [
        {
            label: t('employee_action_edit'),
            icon: <Pencil className="h-4 w-4" />,
            className: 'text-blue-700',
            onClick: (row) => {
                showMessage(t('msg_employee_edit_coming_soon'), 'info');
            },
        },
        {
            label: t('employee_permissions'),
            icon: <ShieldCheck className="h-4 w-4" />,
            className: 'text-emerald-700',
            onClick: (row) => openPermissionsModal(row),
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
        <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
            {/* Staff Page Header */}
            <section className="mb-4 sm:mb-6 md:mb-8">
                <div className="rounded-xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-sm sm:rounded-2xl sm:p-6">
                    <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:mb-6 sm:flex-row sm:items-center">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 shadow-md sm:h-12 sm:w-12 sm:rounded-xl">
                                <Users className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">{t('employee_management_title')}</h1>
                                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{t('employee_management_subtitle')}</p>
                            </div>
                        </div>
                        <div className="flex w-full items-center space-x-3 sm:w-auto sm:space-x-4">
                            <button
                                onClick={() => router.push('/employees/create')}
                                className="group relative inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-xs font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto sm:rounded-xl sm:px-6 sm:py-3 sm:text-sm"
                            >
                                <Plus className="mr-2 h-4 w-4 transition-transform group-hover:scale-110 sm:h-5 sm:w-5" />
                                {t('employee_add')}
                                <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 transition-opacity group-hover:opacity-100 sm:rounded-xl" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            <StaffFilter key={`staff-filter-${currentStoreId}`} onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />

            <div className="mx-auto mt-4">
                {/* Stats Cards */}
                <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:gap-4 md:mb-8 md:gap-6 lg:grid-cols-4">
                    <div className="rounded-lg border bg-white p-3 shadow-sm sm:p-4 md:p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">{t('employee_stats_total')}</p>
                                <p className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">{stats.total}</p>
                            </div>
                            <Users className="h-6 w-6 text-blue-600 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-3 shadow-sm sm:p-4 md:p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">{t('employee_stats_admins')}</p>
                                <p className="text-lg font-bold text-purple-600 sm:text-xl md:text-2xl">{stats.admins}</p>
                            </div>
                            <Shield className="h-6 w-6 text-purple-600 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-3 shadow-sm sm:p-4 md:p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">{t('employee_page_title')}</p>
                                <p className="text-lg font-bold text-green-600 sm:text-xl md:text-2xl">{stats.staff}</p>
                            </div>
                            <CheckCircle className="h-6 w-6 text-green-600 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-3 shadow-sm sm:p-4 md:p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">{t('employee_stats_managers')}</p>
                                <p className="text-lg font-bold text-blue-600 sm:text-xl md:text-2xl">{stats.managers}</p>
                            </div>
                            <XCircle className="h-6 w-6 text-blue-600 sm:h-7 sm:w-7 md:h-8 md:w-8" />
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

            {/* Permission Modal */}
            {permissionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4">
                    <div className="absolute inset-0" onClick={closePermissionsModal} />
                    <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-2xl">
                        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{t('employee_edit_permissions')}{selectedStaff ? ` • ${selectedStaff.name}` : ''}</h3>
                                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{t('employee_permissions_subtitle')}</p>
                            </div>
                            <button type="button" onClick={closePermissionsModal} className="rounded-full p-1 text-gray-400 transition hover:text-gray-600">
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="max-h-[80vh] overflow-y-auto px-4 py-4 sm:max-h-[75vh] sm:px-6 sm:py-6">
                            <PermissionSelector
                                allPermissions={allPermissions}
                                isChecked={(p) => selectedPermissions.includes(p.name)}
                                onToggle={(p) => handlePermissionToggle(p.name)}
                                onCategoryToggle={handleCategoryToggle}
                                onSelectAll={handleSelectAllToggle}
                                selectAll={selectAllPermissions}
                                selectedCount={selectedPermissions.length}
                                loading={permissionFetchLoading}
                            />
                        </div>
                        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
                            <p className="text-center text-xs text-gray-500 sm:text-left sm:text-sm">
                                {selectAllPermissions ? t('msg_all_permissions_selected') : `${selectedPermissionsCount} ${selectedPermissionsCount === 1 ? t('msg_permission_selected') : t('msg_permissions_selected')}`}
                            </p>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={closePermissionsModal}
                                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 sm:flex-none sm:text-sm"
                                >
                                    {t('btn_cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSavePermissions}
                                    disabled={isUpdatingPermission || permissionFetchLoading}
                                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:text-sm"
                                >
                                    {isUpdatingPermission ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t('btn_saving')}
                                        </>
                                    ) : (
                                        t('btn_save_changes')
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
