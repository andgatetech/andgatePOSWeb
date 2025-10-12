'use client';
import StaffFilter from '@/components/filters/StaffFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetAllPermissionsQuery, useGetUserPermissionsQuery, useUpdateUserPermissionMutation } from '@/store/features/auth/authApi';
import { useGetStaffMemberQuery } from '@/store/features/store/storeApi';
import { CheckCircle, ChevronDown, ChevronUp, Loader2, Mail, MoreVertical, Pencil, Plus, Shield, ShieldCheck, Trash2, User, Users, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
    const router = useRouter();
    const { currentStoreId, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [openActionId, setOpenActionId] = useState<number | null>(null);
    const [permissionModalOpen, setPermissionModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [selectAllPermissions, setSelectAllPermissions] = useState(false);
    const actionMenuRef = useRef<HTMLDivElement | null>(null);
    const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down');

    // Build query parameters based on filter state
    let queryParams: Record<string, any> = {};

    if (Object.keys(apiParams).length > 0) {
        // Filter is active - build parameters from filter

        // Handle store filtering
        if (apiParams.storeId === 'all' || apiParams.store_ids === 'all') {
            // "All Stores" selected - send all user's store IDs as comma-separated string
            const allStoreIds = userStores.map((store: any) => store.id);
            queryParams.store_ids = allStoreIds.join(',');
        } else if (apiParams.store_id) {
            // Specific store ID from filter
            queryParams.store_id = apiParams.store_id;
        } else if (apiParams.storeId && apiParams.storeId !== 'all') {
            // Specific store selected in filter dropdown
            queryParams.store_id = apiParams.storeId;
        } else {
            // No specific store in filter - use current store from sidebar
            if (currentStoreId) {
                queryParams.store_id = currentStoreId;
            }
        }

        // Handle other filters
        if (apiParams.search) queryParams.search = apiParams.search;
        if (apiParams.role) queryParams.role = apiParams.role;
        if (apiParams.dateRange?.startDate) queryParams.start_date = apiParams.dateRange.startDate;
        if (apiParams.dateRange?.endDate) queryParams.end_date = apiParams.dateRange.endDate;
    } else {
        // No filter active - use current store from sidebar (default behavior)
        if (currentStoreId) {
            queryParams.store_id = currentStoreId;
        }
    }

    const { data: staffResponse, isLoading, refetch: refetchStaffMembers } = useGetStaffMemberQuery(queryParams);
    const staffMembers = useMemo(() => (staffResponse?.data || []) as StaffMember[], [staffResponse?.data]);

    // State management
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Reset filter when current store changes from sidebar
    useEffect(() => {
        console.log('Staff - Current store changed, resetting filters');
        setApiParams({});
    }, [currentStoreId]);

    // Handle filter changes from UniversalFilter - RTK Query will auto-refetch when queryParams change
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

    const { data: permissionsResponse, isLoading: permissionsLoading } = useGetAllPermissionsQuery({});
    const allPermissions = useMemo<Permission[]>(() => permissionsResponse?.data?.permissions || [], [permissionsResponse]);
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

    const {
        data: userPermissionsResponse,
        isFetching: userPermissionsLoading,
        refetch: refetchUserPermissions,
    } = useGetUserPermissionsQuery(selectedStaff?.id ?? 0, {
        skip: !selectedStaff?.id,
    });

    const permissionFetchLoading = permissionsLoading || (permissionModalOpen && userPermissionsLoading);
    const [updateUserPermission, { isLoading: isUpdatingPermission }] = useUpdateUserPermissionMutation();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setOpenActionId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (openActionId === null) {
            setDropdownDirection('down');
            return;
        }

        const measureDropdown = () => {
            if (!actionMenuRef.current) return;

            const triggerRect = actionMenuRef.current.getBoundingClientRect();
            const menu = actionMenuRef.current.querySelector('[data-role="action-menu"]') as HTMLDivElement | null;
            const menuHeight = menu?.getBoundingClientRect().height ?? 0;

            const spaceBelow = window.innerHeight - triggerRect.bottom;
            const shouldOpenUp = spaceBelow < Math.max(menuHeight, 160);

            setDropdownDirection(shouldOpenUp ? 'up' : 'down');
        };

        const frame = requestAnimationFrame(measureDropdown);
        window.addEventListener('resize', measureDropdown);
        window.addEventListener('scroll', measureDropdown, true);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', measureDropdown);
            window.removeEventListener('scroll', measureDropdown, true);
        };
    }, [openActionId]);

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

    const handleCategoryToggle = (category: string) => {
        const categoryPermissions = groupedPermissions[category]?.map((permission) => permission.name) || [];
        if (categoryPermissions.length === 0) return;

        const allSelected = categoryPermissions.every((name) => selectedPermissions.includes(name));
        setSelectedPermissions((prev) => {
            if (allSelected) {
                return prev.filter((name) => !categoryPermissions.includes(name));
            }
            return Array.from(new Set([...prev, ...categoryPermissions]));
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
        setOpenActionId(null);
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
            showToast('Permissions updated successfully');
            closePermissionsModal();
        } catch (error: any) {
            console.error('Permission update failed:', error);
            showToast(error?.data?.message || 'Failed to update permissions', 'error');
        }
    };

    const handlePlaceholderAction = (message: string) => {
        showToast(message, 'info');
    };

    const selectedPermissionsCount = selectAllPermissions ? allPermissions.length : selectedPermissions.length;

    // Toast notification
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-0 ${
            type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    };

    // Get role badge styling
    const getRoleBadge = (role: string) => {
        const roleStyles: Record<string, string> = {
            'store admin': 'bg-purple-100 text-purple-800',
            manager: 'bg-blue-100 text-blue-800',
            staff: 'bg-green-100 text-green-800',
            cashier: 'bg-yellow-100 text-yellow-800',
        };

        return roleStyles[role] || 'bg-gray-100 text-gray-800';
    };

    // Get status badge styling
    const getStatusBadge = (status: string) => {
        return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    // Sort staff members (filtering is now done by backend)
    const filteredAndSortedStaff = useMemo(() => {
        if (!staffMembers || staffMembers.length === 0) return [];

        // Sort staff (no filtering needed since backend handles it)
        let sorted = [...staffMembers].sort((a: StaffMember, b: StaffMember) => {
            let aValue = (a as any)[sortField] || '';
            let bValue = (b as any)[sortField] || '';

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return sorted;
    }, [staffMembers, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedStaff.length / itemsPerPage);
    const currentStaff = filteredAndSortedStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Handle sorting
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

    // Get stats
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
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading staff members...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Staff Page Header */}
            <section className="mb-8">
                <div className="rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Employees Management</h1>
                                <p className="text-sm text-gray-500">Manage your team members and their roles</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/employees/create')}
                                className="group relative inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <Plus className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                                Add Employee
                                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            <StaffFilter key={`staff-filter-${currentStoreId}`} onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />

            <div className="mx-auto mt-4">
                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Administrators</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                            </div>
                            <Shield className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Employees</p>
                                <p className="text-2xl font-bold text-green-600">{stats.staff}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Managers</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.managers}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-visible rounded-lg border bg-white shadow-sm">
                    <div className="relative overflow-x-auto overflow-y-visible">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="cursor-pointer px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100" onClick={() => handleSort('name')}>
                                        <div className="flex items-center gap-2">
                                            Name
                                            {sortField === 'name' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th className="cursor-pointer px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100" onClick={() => handleSort('email')}>
                                        <div className="flex items-center gap-2">
                                            Email
                                            {sortField === 'email' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                                        onClick={() => handleSort('role_in_store')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Role
                                            {sortField === 'role_in_store' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Phone</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Address</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {currentStaff.map((staff: StaffMember, index: number) => (
                                    <tr key={staff.id || index} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                                                        <User className="h-6 w-6 text-gray-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900">{staff.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail className="mr-2 h-4 w-4" />
                                                {staff.email}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getRoleBadge(staff.role_in_store)}`}>{staff.role_in_store}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{staff.phone || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="max-w-xs truncate" title={staff.address}>
                                                {staff.address || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium" style={{ overflow: 'visible' }}>
                                            <div className="relative inline-block text-left" ref={openActionId === staff.id ? actionMenuRef : undefined}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOpenActionId((prev) => {
                                                            const next = prev === staff.id ? null : staff.id;
                                                            if (next !== null && next !== prev) {
                                                                setDropdownDirection('down');
                                                            }
                                                            return next;
                                                        })
                                                    }
                                                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>

                                                {openActionId === staff.id && (
                                                    <div
                                                        data-role="action-menu"
                                                        className={`absolute right-0 z-20 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ${
                                                            dropdownDirection === 'down' ? 'top-full mt-2 origin-top-right' : 'bottom-full mb-2 origin-bottom-right'
                                                        }`}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setOpenActionId(null);
                                                                handlePlaceholderAction('Employee editing is coming soon.');
                                                            }}
                                                            className="flex w-full items-center gap-3 rounded-t-xl px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                                                        >
                                                            <Pencil className="h-4 w-4 text-blue-600" />
                                                            <span>Edit Employee</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openPermissionsModal(staff)}
                                                            className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                                                        >
                                                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                                            <span>Edit Permissions</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setOpenActionId(null);
                                                                handlePlaceholderAction('Employee deletion is coming soon.');
                                                            }}
                                                            className="flex w-full items-center gap-3 rounded-b-xl px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="border-t border-gray-200 bg-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedStaff.length)} of {filteredAndSortedStaff.length} staff
                                    members
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`rounded-md px-3 py-1 text-sm font-medium ${
                                                    currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {currentStaff.length === 0 && (
                        <div className="py-12 text-center">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {Object.keys(apiParams).length > 0 ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first staff member.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {permissionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="absolute inset-0" onClick={closePermissionsModal} />
                    <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Edit Permissions{selectedStaff ? ` • ${selectedStaff.name}` : ''}</h3>
                                <p className="text-sm text-gray-500">Adjust access controls for this employee in real time.</p>
                            </div>
                            <button type="button" onClick={closePermissionsModal} className="rounded-full p-1 text-gray-400 transition hover:text-gray-600">
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto px-6 py-6">
                            {permissionFetchLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6 flex flex-col gap-4 rounded-xl bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                                                <Shield className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-blue-900">Permission Groups</p>
                                                <p className="text-xs text-blue-700">Toggle entire modules or drill down to individual operations.</p>
                                            </div>
                                        </div>
                                        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-blue-900">
                                            <input
                                                type="checkbox"
                                                checked={selectAllPermissions}
                                                onChange={handleSelectAllToggle}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            Select All
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {Object.entries(groupedPermissions).map(([category, permissions]) => {
                                            const categoryNames = permissions.map((permission) => permission.name);
                                            const allSelected = categoryNames.every((name) => selectAllPermissions || selectedPermissions.includes(name));
                                            const someSelected = categoryNames.some((name) => selectedPermissions.includes(name)) && !allSelected;

                                            return (
                                                <div key={category} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <h4 className="text-sm font-semibold uppercase text-gray-700">{category}</h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCategoryToggle(category)}
                                                            className={`text-xs font-medium ${allSelected ? 'text-red-600 hover:text-red-700' : 'text-blue-600 hover:text-blue-700'}`}
                                                        >
                                                            {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {permissions.map((permission) => {
                                                            const isChecked = selectAllPermissions || selectedPermissions.includes(permission.name);
                                                            const [, action] = permission.name.split('.');
                                                            return (
                                                                <label key={permission.id} className="flex items-center gap-2 text-sm text-gray-700">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={() => handlePermissionToggle(permission.name)}
                                                                        disabled={selectAllPermissions}
                                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                                                    />
                                                                    <span className="flex-1 capitalize">{action?.replace(/[_-]/g, ' ') || permission.name}</span>
                                                                    {isChecked && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex flex-col gap-4 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-gray-500">
                                {selectAllPermissions ? 'All permissions selected' : `${selectedPermissionsCount} permission${selectedPermissionsCount === 1 ? '' : 's'} selected`}
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={closePermissionsModal}
                                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSavePermissions}
                                    disabled={isUpdatingPermission || permissionFetchLoading}
                                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isUpdatingPermission ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
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
