'use client';

import PermissionSelector, { Permission } from '@/app/(application)/(protected)/employees/employees/PermissionSelector';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import { useGetAllPermissionsQuery, useGetRoleQuery, useUpdateRoleMutation } from '@/store/features/roles/rolesApi';
import { ArrowLeft, Shield, Store } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const RoleEditPage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const params = useParams();
    const { currentStore, currentStoreId } = useCurrentStore();

    const roleId = Number(params.id);

    const { data: roleData, isLoading: isLoadingRole } = useGetRoleQuery(roleId, { skip: !roleId });
    const { data: permissionsData, isLoading: permissionsLoading } = useGetAllPermissionsQuery(undefined, { refetchOnMountOrArgChange: 60 });
    const [updateRole, { isLoading: isSubmitting }] = useUpdateRoleMutation();

    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formPermIds, setFormPermIds] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [nameError, setNameError] = useState('');

    const role = useMemo(() => {
        const d = roleData as any;
        return d?.data ?? d ?? null;
    }, [roleData]);

    const allPermissions = useMemo(() => {
        const d = permissionsData as any;
        if (Array.isArray(d?.data?.permissions)) return d.data.permissions as Permission[];
        if (Array.isArray(d?.data?.data)) return d.data.data as Permission[];
        if (Array.isArray(d?.data)) return d.data as Permission[];
        return [] as Permission[];
    }, [permissionsData]);

    useEffect(() => {
        if (!role) return;
        setFormName(role.name || '');
        setFormDescription(role.description || '');
        setFormPermIds((role.permissions || []).map((p: any) => p.id));
    }, [role]);

    const handleToggle = (perm: Permission) => {
        setFormPermIds((prev) => prev.includes(perm.id) ? prev.filter((x) => x !== perm.id) : [...prev, perm.id]);
        setSelectAll(false);
    };

    const handleCategoryToggle = (_category: string, perms: Permission[]) => {
        const ids = perms.map((p) => p.id);
        const allSelected = ids.every((id) => formPermIds.includes(id));
        setFormPermIds((prev) => allSelected ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
        setSelectAll(false);
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectAll(false);
            setFormPermIds([]);
        } else {
            setSelectAll(true);
            setFormPermIds(allPermissions.map((p) => p.id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) { setNameError(t('roles_name_required_desc')); return; }
        setNameError('');
        try {
            await updateRole({
                id: roleId,
                name: formName.trim(),
                description: formDescription.trim() || undefined,
                permission_ids: selectAll ? allPermissions.map((p) => p.id) : formPermIds,
                store_id: currentStoreId,
            }).unwrap();
            showMessage(t('roles_updated_title'));
            router.push('/roles');
        } catch (error: any) {
            showMessage(error?.data?.message || t('roles_save_failed_desc'), 'error');
        }
    };

    if (isLoadingRole) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-2 text-gray-600">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#046ca9] border-t-transparent" />
                        {t('roles_loading')}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{t('roles_edit')}</h1>
                                <p className="text-sm text-gray-500">{role?.name}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.push('/roles')}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t('btn_back')}
                        </button>
                    </div>

                    {(currentStore || currentStoreId) && (
                        <div className="rounded-xl border border-[#046ca9]/15 bg-[#046ca9]/5 p-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#046ca9]/10">
                                    <Store className="h-4 w-4 text-[#034d79]" />
                                </div>
                                <p className="text-sm font-medium text-[#034d79]">
                                    {t('lbl_current_store')}: {currentStore?.store_name || `Store #${currentStoreId}`}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Card */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                    <form onSubmit={handleSubmit}>
                        <div className="p-8 space-y-8">
                            {/* Basic Info */}
                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('lbl_role_information')}</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            {t('lbl_name')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formName}
                                            onChange={(e) => { setFormName(e.target.value); if (nameError) setNameError(''); }}
                                            placeholder={t('roles_name_placeholder')}
                                            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#046ca9] ${nameError ? 'border-red-300' : 'border-gray-300'}`}
                                        />
                                        {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_description')}</label>
                                        <textarea
                                            value={formDescription}
                                            onChange={(e) => setFormDescription(e.target.value)}
                                            rows={2}
                                            placeholder={t('roles_description_placeholder')}
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#046ca9]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="mb-4 flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-[#046ca9]" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{t('roles_permissions')}</h3>
                                        <p className="text-xs text-gray-500">{t('roles_permissions_selected_desc') ?? 'Select which permissions this role should have'}</p>
                                    </div>
                                </div>

                                <PermissionSelector
                                    allPermissions={allPermissions}
                                    isChecked={(p) => formPermIds.includes(p.id)}
                                    onToggle={handleToggle}
                                    onCategoryToggle={handleCategoryToggle}
                                    onSelectAll={handleSelectAll}
                                    selectAll={selectAll}
                                    selectedCount={formPermIds.length}
                                    loading={permissionsLoading}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-8 py-6">
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/roles')}
                                    className="w-full rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
                                >
                                    {t('btn_cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#046ca9] to-[#034d79] px-8 py-3 font-medium text-white transition-all hover:brightness-105 focus:ring-4 focus:ring-[#046ca9]/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[160px]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            {t('btn_updating')}
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="h-4 w-4" />
                                            {t('btn_save_changes')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RoleEditPage;
