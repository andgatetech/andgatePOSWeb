'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import {
    useDeleteRoleMutation,
    useGetRolesQuery,
} from '@/store/features/roles/rolesApi';
import { Pencil, Plus, Shield, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const RolesPage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const { currentStoreId } = useCurrentStore();

    const queryParams = useMemo(() => {
        const p: Record<string, any> = {};
        if (currentStoreId) p.store_id = currentStoreId;
        return p;
    }, [currentStoreId]);

    const { data, isLoading } = useGetRolesQuery(queryParams, { refetchOnMountOrArgChange: 30 });
    const [deleteRole] = useDeleteRoleMutation();

    const roles = useMemo(() => {
        const d = data as any;
        if (!d) return [];
        if (Array.isArray(d?.data?.roles)) return d.data.roles;
        if (Array.isArray(d?.data?.data)) return d.data.data;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d)) return d;
        return [];
    }, [data]);

    const handleDelete = useCallback(async (role: any) => {
        const confirmed = await showConfirmDialog(t('roles_delete_confirm_title'), t('roles_delete_confirm_desc').replace('{name}', role.name), t('btn_delete'), t('btn_cancel'), false);
        if (!confirmed) return;
        try {
            await deleteRole(role.id).unwrap();
            showSuccessDialog(t('roles_deleted_title'), t('roles_deleted_desc'));
        } catch {
            showErrorDialog(t('roles_delete_failed_title'), t('roles_delete_failed_desc'));
        }
    }, [deleteRole, t]);

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'name',
                label: t('lbl_name'),
                render: (value) => <span className="font-semibold text-gray-900">{value}</span>,
            },
            {
                key: 'description',
                label: t('lbl_description'),
                render: (value) => <span className="text-sm text-gray-600">{value || '-'}</span>,
            },
            {
                key: 'permissions',
                label: t('roles_permissions'),
                render: (value) => {
                    const perms = Array.isArray(value) ? value : [];
                    return (
                        <div className="flex flex-wrap gap-1">
                            {perms.length === 0 ? (
                                <span className="text-xs text-gray-400">{t('roles_no_permissions')}</span>
                            ) : (
                                perms.slice(0, 4).map((p: any) => (
                                    <span key={p.id} className="rounded bg-[#046ca9]/10 px-1.5 py-0.5 text-xs text-[#034d79]">
                                        {p.name}
                                    </span>
                                ))
                            )}
                            {perms.length > 4 && <span className="text-xs text-gray-500">+{perms.length - 4}</span>}
                        </div>
                    );
                },
            },
            {
                key: 'assigned_users_count',
                label: t('roles_users_count'),
                render: (value) => <span className="text-sm text-gray-700">{value ?? 0}</span>,
            },
        ],
        [t]
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: t('btn_edit'),
                icon: <Pencil className="h-4 w-4" />,
                className: 'text-gray-700',
                onClick: (role: any) => router.push(`/roles/edit/${role.id}`),
            },
            {
                label: t('btn_delete'),
                icon: <Trash2 className="h-4 w-4" />,
                className: 'text-danger',
                onClick: handleDelete,
            },
        ],
        [router, handleDelete, t]
    );

    if (isLoading) return <Loader message={t('roles_loading')} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('roles_title')}</h1>
                        <p className="text-sm text-gray-500">{t('roles_desc')}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => router.push('/roles/create')}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    {t('roles_create')}
                </button>
            </div>

            <ReusableTable
                data={roles}
                columns={columns}
                actions={actions}
                emptyState={{
                    icon: <Shield className="mx-auto h-16 w-16" />,
                    title: t('roles_empty_title'),
                    description: t('roles_empty_desc'),
                }}
            />
        </div>
    );
};

export default RolesPage;
