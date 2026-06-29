'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { hasAnyPermission } from '@/lib/permissions';
import { showMessage } from '@/lib/toast';
import { RootState } from '@/store';
import { useAssignRoleMutation, useGetRolesQuery, useUnassignRoleMutation } from '@/store/features/roles/rolesApi';
import { useGetStaffMemberQuery, useStaffUpdateMutation } from '@/store/features/store/storeApi';
import { ArrowLeft, Eye, EyeOff, Store, Users, Wallet } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

const EmployeeEditPage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const params = useParams();
    const { currentStore, currentStoreId } = useCurrentStore();
    const user = useSelector((state: RootState) => state.auth.user);
    const canManageCompensation = hasAnyPermission(user, ['hr.payroll.manage']);

    const employeeId = Number(params.id);

    const [activeTab, setActiveTab] = useState<'profile' | 'compensation'>('profile');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        password: '',
        password_confirmation: '',
    });

    const [compensationData, setCompensationData] = useState({
        pay_type: '' as '' | 'monthly' | 'hourly',
        monthly_salary: '',
        hourly_rate: '',
        payment_mode: '',
        bank_account_name: '',
        bank_account_number: '',
        bank_name: '',
        bank_branch: '',
        joining_date: '',
    });



    const storeId = currentStoreId;

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [isAssigningRole, setIsAssigningRole] = useState(false);

    const [staffUpdate, { isLoading: isSubmitting }] = useStaffUpdateMutation();

    const { data: rolesResponse } = useGetRolesQuery({ store_id: storeId }, { skip: !storeId });
    const { data: staffResponse, isLoading: isLoadingStaff } = useGetStaffMemberQuery({ store_id: storeId }, { skip: !storeId });
    const staffMember = useMemo(() => {
        const data = (staffResponse as any)?.data;
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

        return items.find((member: any) => Number(member.id) === employeeId) || null;
    }, [employeeId, staffResponse]);
    const isBusinessAdmin = staffMember?.role_in_store === 'business_admin';
    const availableRoles = useMemo(() => {
        const d = rolesResponse as any;
        if (Array.isArray(d?.data?.roles)) return d.data.roles as { id: number; name: string }[];
        if (Array.isArray(d?.data?.data)) return d.data.data as { id: number; name: string }[];
        if (Array.isArray(d?.data)) return d.data as { id: number; name: string }[];
        return [] as { id: number; name: string }[];
    }, [rolesResponse]);

    const [assignRole] = useAssignRoleMutation();
    const [unassignRole] = useUnassignRoleMutation();

    useEffect(() => {
        if (!staffMember) return;

        setFormData((prev) => ({
            ...prev,
            name: staffMember.name || '',
            phone: staffMember.phone || '',
            address: staffMember.address || '',
        }));

        setCompensationData({
            pay_type: staffMember.pay_type || '',
            monthly_salary: staffMember.monthly_salary != null ? String(staffMember.monthly_salary) : '',
            hourly_rate: staffMember.hourly_rate != null ? String(staffMember.hourly_rate) : '',
            payment_mode: staffMember.payment_mode || '',
            bank_account_name: staffMember.bank_account_name || '',
            bank_account_number: staffMember.bank_account_number || '',
            bank_name: staffMember.bank_name || '',
            bank_branch: staffMember.bank_branch || '',
            joining_date: staffMember.joining_date || '',
        });

        const loadedRoleId = staffMember.role_id ?? staffMember.role?.id ?? null;
        setSelectedRoleId(loadedRoleId ? Number(loadedRoleId) : null);
    }, [staffMember]);

    const handleCompensationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCompensationData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'payment_mode' && value !== 'bank'
                ? {
                      bank_account_name: '',
                      bank_account_number: '',
                      bank_name: '',
                      bank_branch: '',
                  }
                : {}),
        }));
        if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleRoleAssign = async (newRoleId: string) => {
        const next = newRoleId === '' ? null : Number(newRoleId);
        setIsAssigningRole(true);
        try {
            if (next === null) {
                if (selectedRoleId) {
                    await unassignRole({ roleId: selectedRoleId, user_id: employeeId }).unwrap();
                    showMessage(t('msg_role_unassigned'));
                }
            } else {
                await assignRole({ roleId: next, user_id: employeeId }).unwrap();
                showMessage(t('msg_role_assigned'));
            }
            setSelectedRoleId(next);
        } catch (error: any) {
            showMessage(error?.data?.message || t('msg_failed_assign_role'), 'error');
        } finally {
            setIsAssigningRole(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) errors.name = t('msg_name_required');
        if (formData.password && formData.password.length < 6) errors.password = t('msg_password_min_6');
        if (formData.password && formData.password !== formData.password_confirmation) errors.password_confirmation = t('msg_passwords_not_match');
        if (canManageCompensation) {
            if (!compensationData.payment_mode) errors.payment_mode = t('msg_payment_mode_required');
            if (compensationData.payment_mode === 'bank') {
                if (!compensationData.bank_account_name.trim()) errors.bank_account_name = t('msg_bank_account_name_required');
                if (!compensationData.bank_account_number.trim()) errors.bank_account_number = t('msg_bank_account_number_required');
                if (!compensationData.bank_name.trim()) errors.bank_name = t('msg_bank_name_required');
                if (!compensationData.bank_branch.trim()) errors.bank_branch = t('msg_bank_branch_required');
            }
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const payload: any = {
                userId: employeeId,
                store_id: storeId,
                name: formData.name.trim(),
                phone: formData.phone,
                address: formData.address,
            };
            if (formData.password) {
                payload.password = formData.password;
                payload.password_confirmation = formData.password_confirmation;
            }

            if (canManageCompensation) {
                payload.pay_type = compensationData.pay_type || null;
                payload.monthly_salary = compensationData.monthly_salary !== '' ? Number(compensationData.monthly_salary) : null;
                payload.hourly_rate = compensationData.hourly_rate !== '' ? Number(compensationData.hourly_rate) : null;
                payload.payment_mode = compensationData.payment_mode;
                payload.bank_account_name = compensationData.payment_mode === 'bank' ? compensationData.bank_account_name.trim() : null;
                payload.bank_account_number = compensationData.payment_mode === 'bank' ? compensationData.bank_account_number.trim() : null;
                payload.bank_name = compensationData.payment_mode === 'bank' ? compensationData.bank_name.trim() : null;
                payload.bank_branch = compensationData.payment_mode === 'bank' ? compensationData.bank_branch.trim() : null;
                payload.joining_date = compensationData.joining_date || null;
            }

            await staffUpdate(payload).unwrap();
            showMessage(t('msg_employee_updated'));
            router.push('/employees');
        } catch (error: any) {
            showMessage(error?.data?.message || t('msg_failed_update_employee'), 'error');
        }
    };

    if (isLoadingStaff && !formData.name) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4f9fc] via-white to-[#fff7ed]">
                <div className="flex items-center gap-2 text-gray-600">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#046ca9] border-t-transparent" />
                    {t('lbl_loading')}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f9fc] via-white to-[#fff7ed] p-2 sm:p-4 md:p-6">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-4 rounded-xl bg-white p-4 shadow-sm sm:mb-6 sm:rounded-2xl sm:p-6 md:mb-8">
                    <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:mb-6 sm:flex-row sm:items-center">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#046ca9] to-[#034d79] shadow-md sm:h-12 sm:w-12 sm:rounded-xl">
                                <Users className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">{t('employee_action_edit')}</h1>
                                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{formData.name}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.push('/employees')}
                            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 sm:w-auto sm:rounded-xl sm:px-4 sm:text-sm"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>{t('btn_back')}</span>
                        </button>
                    </div>

                    {(currentStore || storeId) && (
                        <div className="rounded-lg bg-[#046ca9]/5 p-3 sm:p-4">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#046ca9]/10 sm:h-8 sm:w-8">
                                    <Store className="h-3.5 w-3.5 text-[#046ca9] sm:h-4 sm:w-4" />
                                </div>
                                <p className="text-xs font-medium text-[#034d79] sm:text-sm">
                                    {t('lbl_current_store')}: {currentStore?.store_name || `Store #${storeId}`}
                                </p>
                            </div>
                        </div>
                    )}

                    {canManageCompensation && (
                        <div className="mt-4 flex gap-2 border-b border-gray-200 sm:mt-6">
                            <button
                                type="button"
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'border-[#046ca9] text-[#046ca9]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <Users className="h-4 w-4" />
                                {t('tab_profile')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('compensation')}
                                className={`flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'compensation' ? 'border-[#046ca9] text-[#046ca9]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <Wallet className="h-4 w-4" />
                                {t('tab_compensation')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit}>
                    <div className="overflow-hidden rounded-xl bg-white shadow-xl sm:rounded-2xl">
                        <div className={`p-4 sm:p-6 md:p-8 ${activeTab === 'compensation' ? 'hidden' : ''}`}>
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:mb-6 sm:text-xl">{t('lbl_employee_information')}</h2>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Left column */}
                                <div className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            {t('lbl_full_name')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${formErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#046ca9] focus:ring-[#046ca9]'}`}
                                            placeholder={t('placeholder_full_name')}
                                        />
                                        {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_new_password')}</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 ${formErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#046ca9] focus:ring-[#046ca9]'}`}
                                                placeholder={t('employee_edit_password_placeholder')}
                                            />
                                            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {formErrors.password && <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>}
                                        <p className="mt-1 text-xs text-gray-400">{t('employee_edit_password_hint')}</p>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_confirm_password')}</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="password_confirmation"
                                                value={formData.password_confirmation}
                                                onChange={handleInputChange}
                                                className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 ${formErrors.password_confirmation ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#046ca9] focus:ring-[#046ca9]'}`}
                                                placeholder={t('placeholder_confirm_password')}
                                            />
                                            <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {formErrors.password_confirmation && <p className="mt-1 text-xs text-red-500">{formErrors.password_confirmation}</p>}
                                    </div>
                                </div>

                                {/* Right column */}
                                <div className="space-y-6">
                                    {/* Phone */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_phone_number')}</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                            placeholder={t('placeholder_phone')}
                                        />
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_address')}</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                            placeholder={t('placeholder_address')}
                                        />
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_role')}</label>
                                        {isBusinessAdmin ? (
                                            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                                <span className="inline-flex items-center rounded-full bg-[#034d79]/10 px-2.5 py-0.5 text-xs font-medium text-[#034d79]">
                                                    {t('role_store_owner')}
                                                </span>
                                                <span className="text-xs text-gray-400">{t('employee_business_admin_role_locked')}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <select
                                                    value={selectedRoleId ?? ''}
                                                    onChange={(e) => handleRoleAssign(e.target.value)}
                                                    disabled={isAssigningRole}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9] disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    <option value="">{t('lbl_no_role')}</option>
                                                    {availableRoles.map((role) => (
                                                        <option key={role.id} value={role.id}>
                                                            {role.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {isAssigningRole && <p className="mt-1 text-xs text-[#046ca9]">{t('lbl_saving')}…</p>}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {canManageCompensation && activeTab === 'compensation' && (
                            <div className="p-4 sm:p-6 md:p-8">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:mb-6 sm:text-xl">{t('lbl_compensation_information')}</h2>
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div className="space-y-6">
                                        {/* Pay type */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_pay_type')}</label>
                                            <select
                                                name="pay_type"
                                                value={compensationData.pay_type}
                                                onChange={handleCompensationChange}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                            >
                                                <option value="">{t('lbl_not_set')}</option>
                                                <option value="monthly">{t('lbl_pay_type_monthly')}</option>
                                                <option value="hourly">{t('lbl_pay_type_hourly')}</option>
                                            </select>
                                        </div>

                                        {compensationData.pay_type === 'monthly' && (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_monthly_salary')}</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    name="monthly_salary"
                                                    value={compensationData.monthly_salary}
                                                    onChange={handleCompensationChange}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                                    placeholder={t('placeholder_monthly_salary')}
                                                />
                                            </div>
                                        )}

                                        {compensationData.pay_type === 'hourly' && (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_hourly_rate')}</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    name="hourly_rate"
                                                    value={compensationData.hourly_rate}
                                                    onChange={handleCompensationChange}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                                    placeholder={t('placeholder_hourly_rate')}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                {t('lbl_payment_mode')} <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="payment_mode"
                                                value={compensationData.payment_mode}
                                                onChange={handleCompensationChange}
                                                className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${formErrors.payment_mode ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#046ca9] focus:ring-[#046ca9]'}`}
                                            >
                                                <option value="">{t('lbl_select_payment_mode')}</option>
                                                <option value="cash">{t('lbl_payment_mode_cash')}</option>
                                                <option value="bank">{t('lbl_payment_mode_bank')}</option>
                                                <option value="mobile">{t('lbl_payment_mode_mobile')}</option>
                                            </select>
                                            {formErrors.payment_mode && <p className="mt-1 text-xs text-red-500">{formErrors.payment_mode}</p>}
                                        </div>

                                        {compensationData.payment_mode === 'bank' && (
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                                        {t('lbl_bank_account_name')} <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="bank_account_name"
                                                        value={compensationData.bank_account_name}
                                                        onChange={handleCompensationChange}
                                                        className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${formErrors.bank_account_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#046ca9] focus:ring-[#046ca9]'}`}
                                                        placeholder={t('placeholder_bank_account_name')}
                                                    />
                                                    {formErrors.bank_account_name && <p className="mt-1 text-xs text-red-500">{formErrors.bank_account_name}</p>}
                                                </div>

                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                                        {t('lbl_bank_account_number')} <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="bank_account_number"
                                                        value={compensationData.bank_account_number}
                                                        onChange={handleCompensationChange}
                                                        className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${formErrors.bank_account_number ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#046ca9] focus:ring-[#046ca9]'}`}
                                                        placeholder={t('placeholder_bank_account_number')}
                                                    />
                                                    {formErrors.bank_account_number && <p className="mt-1 text-xs text-red-500">{formErrors.bank_account_number}</p>}
                                                </div>

                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                                        {t('lbl_bank_name')} <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="bank_name"
                                                        value={compensationData.bank_name}
                                                        onChange={handleCompensationChange}
                                                        className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${formErrors.bank_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#046ca9] focus:ring-[#046ca9]'}`}
                                                        placeholder={t('placeholder_bank_name')}
                                                    />
                                                    {formErrors.bank_name && <p className="mt-1 text-xs text-red-500">{formErrors.bank_name}</p>}
                                                </div>

                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                                        {t('lbl_bank_branch')} <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="bank_branch"
                                                        value={compensationData.bank_branch}
                                                        onChange={handleCompensationChange}
                                                        className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${formErrors.bank_branch ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#046ca9] focus:ring-[#046ca9]'}`}
                                                        placeholder={t('placeholder_bank_branch')}
                                                    />
                                                    {formErrors.bank_branch && <p className="mt-1 text-xs text-red-500">{formErrors.bank_branch}</p>}
                                                </div>
                                            </div>
                                        )}

                                        {/* Joining date */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_joining_date')}</label>
                                            <input
                                                type="date"
                                                name="joining_date"
                                                value={compensationData.joining_date}
                                                onChange={handleCompensationChange}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="border-t bg-gray-50 px-4 py-4 sm:px-6 sm:py-6 md:px-8">
                            <div className="flex flex-col items-center justify-end space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                                <button
                                    type="button"
                                    onClick={() => router.push('/employees')}
                                    disabled={isSubmitting}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                >
                                    {t('btn_cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#046ca9] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            {t('lbl_saving')}
                                        </>
                                    ) : (
                                        <>
                                            <Users className="mr-2 h-5 w-5" />
                                            {t('btn_save_changes')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeEditPage;
