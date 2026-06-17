'use client';
import IconHome from '@/components/icon/icon-home';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconUser from '@/components/icon/icon-user';
import { showErrorDialog, showMessage, showSuccessDialog } from '@/lib/toast';
import { getTranslation } from '@/i18n';
import { useChangePasswordMutation, useUpdateUserMutation } from '@/store/features/auth/authApi';
import { updateUserProfile } from '@/store/features/auth/authSlice';
import { AppDispatch, RootState } from '@/store/index';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const ComponentsUsersAccountSettingsTabs = () => {
    const { t } = getTranslation();
    const [tabs, setTabs] = useState<string>('home');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        email: '',
    });

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        newPasswordConfirmation: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showNewPasswordConfirmation, setShowNewPasswordConfirmation] = useState(false);

    const toggleTabs = (name: string) => {
        setTabs(name);
    };

    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
    const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

    // Populate form from Redux store
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updateData = {
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                // Excluding email as it shouldn't be changed
            };

            const result = await updateUser(updateData).unwrap();

            if (result.success) {
                // Update only the user profile fields in Redux store, preserving subscription data
                dispatch(
                    updateUserProfile({
                        name: formData.name,
                        phone: formData.phone,
                        address: formData.address,
                    })
                );

                // Show success notification
                showSuccessDialog(t('msg_success'), result.message || t('msg_updated_success'), 'OK');
            }
        } catch (error: any) {
            showErrorDialog(t('msg_error'), error?.data?.message || 'Failed to update profile');
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.newPasswordConfirmation) {
            showMessage(t('msg_passwords_no_match'), 'error');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            showMessage(t('msg_password_min_length'), 'error');
            return;
        }

        try {
            await changePassword({
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword,
                new_password_confirmation: passwordData.newPasswordConfirmation,
            }).unwrap();

            showMessage(t('msg_password_changed'), 'success');
            setPasswordData({ currentPassword: '', newPassword: '', newPasswordConfirmation: '' });
        } catch (error: any) {
            showErrorDialog(t('msg_error'), error?.data?.message || 'Failed to change password');
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="pt-5">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">{t('store_settings_title')}</h5>
            </div>
            <div>
                <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('home')}
                            className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'home' ? '!border-primary text-primary' : ''}`}
                        >
                            <IconHome />
                            {t('lbl_home')}
                        </button>
                    </li>
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('security')}
                            className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'security' ? '!border-primary text-primary' : ''}`}
                        >
                            <IconLockDots />
                            {t('lbl_security')}
                        </button>
                    </li>
                </ul>
            </div>
            {tabs === 'home' ? (
                <div>
                    <form className="mb-5 rounded-md border border-[#ebedf2] bg-white p-4 dark:border-[#191e3a] dark:bg-black" onSubmit={handleSubmit}>
                        <h6 className="mb-5 text-lg font-bold">{t('user_general_info')}</h6>
                        <div className="flex flex-col sm:flex-row">
                            <div className="mb-5 w-full sm:w-2/12 ltr:sm:mr-4 rtl:sm:ml-4">
                                {(user as any)?.profile_image ? (
                                    <Image
                                        src={
                                            (user as any).profile_image.startsWith('http') || (user as any).profile_image.startsWith('/')
                                                ? (user as any).profile_image
                                                : `/${(user as any).profile_image}`
                                        }
                                        alt="Profile"
                                        width={128}
                                        height={128}
                                        className="mx-auto h-20 w-20 rounded-full object-cover md:h-32 md:w-32"
                                    />
                                ) : (
                                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg md:h-32 md:w-32">
                                        <IconUser className="h-8 w-8 md:h-16 md:w-16" fill={true} />
                                    </div>
                                )}
                            </div>
                            <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name">{t('lbl_full_name')}</label>
                                    <input id="name" name="name" type="text" placeholder={t('placeholder_full_name')} className="form-input" value={formData.name} onChange={handleInputChange} />
                                </div>

                                <div>
                                    <label htmlFor="email">{t('lbl_email')}</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder={t('placeholder_email')}
                                        className="form-input cursor-not-allowed bg-gray-100"
                                        value={formData.email}
                                        readOnly
                                        disabled
                                    />
                                    <small className="mt-1 text-xs text-gray-500">{t('msg_email_readonly')}</small>
                                </div>

                                <div>
                                    <label htmlFor="phone">{t('lbl_phone')}</label>
                                    <input id="phone" name="phone" type="text" placeholder={t('placeholder_phone')} className="form-input" value={formData.phone} onChange={handleInputChange} />
                                </div>

                                <div>
                                    <label htmlFor="address">{t('lbl_address')}</label>
                                    <input id="address" name="address" type="text" placeholder={t('placeholder_address')} className="form-input" value={formData.address} onChange={handleInputChange} />
                                </div>

                                <div className="mt-3 sm:col-span-2">
                                    <button type="submit" className={`btn btn-primary ${isUpdating ? 'cursor-not-allowed opacity-50' : ''}`} disabled={isUpdating}>
                                        {isUpdating ? t('btn_saving') : t('btn_save_changes')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                ''
            )}
            {tabs === 'security' ? (
                <div>
                    <form className="mb-5 rounded-md border border-[#ebedf2] bg-white p-4 dark:border-[#191e3a] dark:bg-black" onSubmit={handlePasswordSubmit}>
                        <h6 className="mb-5 text-lg font-bold">{t('user_change_password')}</h6>
                        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">{t('user_password_tip')}</p>
                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label htmlFor="currentPassword">{t('user_current_password')}</label>
                                <div className="relative">
                                    <input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        placeholder={t('placeholder_current_password')}
                                        className="form-input pe-10"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowCurrentPassword(!showCurrentPassword);
                                        }}
                                        className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors duration-200 hover:text-primary focus:outline-none"
                                        aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="newPassword">{t('user_new_password')}</label>
                                <div className="relative">
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder={t('placeholder_new_password')}
                                        className="form-input pe-10"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength={8}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowNewPassword(!showNewPassword);
                                        }}
                                        className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors duration-200 hover:text-primary focus:outline-none"
                                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <small className="mt-1 text-xs text-gray-500">{t('user_password_min')}</small>
                            </div>

                            <div>
                                <label htmlFor="newPasswordConfirmation">{t('user_confirm_password')}</label>
                                <div className="relative">
                                    <input
                                        id="newPasswordConfirmation"
                                        name="newPasswordConfirmation"
                                        type={showNewPasswordConfirmation ? 'text' : 'password'}
                                        placeholder={t('placeholder_confirm_password')}
                                        className="form-input pe-10"
                                        value={passwordData.newPasswordConfirmation}
                                        onChange={handlePasswordChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowNewPasswordConfirmation(!showNewPasswordConfirmation);
                                        }}
                                        className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors duration-200 hover:text-primary focus:outline-none"
                                        aria-label={showNewPasswordConfirmation ? 'Hide password' : 'Show password'}
                                    >
                                        {showNewPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3">
                                <button type="submit" className={`btn btn-primary ${isChangingPassword ? 'cursor-not-allowed opacity-50' : ''}`} disabled={isChangingPassword}>
                                    {isChangingPassword ? t('btn_loading') : t('user_change_password')}
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">{t('user_security_tips')}</h3>
                                <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                                    <ul className="list-disc space-y-1 pl-5">
                                        <li>{t('tip_password_8chars')}</li>
                                        <li>{t('tip_password_case')}</li>
                                        <li>{t('tip_password_chars')}</li>
                                        <li>{t('tip_password_avoid')}</li>
                                        <li>{t('tip_password_reuse')}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                ''
            )}
        </div>
    );
};

export default ComponentsUsersAccountSettingsTabs;
