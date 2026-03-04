'use client';
import IconDollarSignCircle from '@/components/icon/icon-dollar-sign-circle';
import IconHome from '@/components/icon/icon-home';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconPhone from '@/components/icon/icon-phone';
import IconUser from '@/components/icon/icon-user';
import { showErrorDialog, showMessage, showSuccessDialog } from '@/lib/toast';
import { useChangePasswordMutation, useUpdateUserMutation } from '@/store/features/auth/authApi';
import { updateUserProfile } from '@/store/features/auth/authSlice';
import { AppDispatch, RootState } from '@/store/index';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const ComponentsUsersAccountSettingsTabs = () => {
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
                showSuccessDialog('Success!', result.message || 'Profile updated successfully!', 'OK');
            }
        } catch (error: any) {
            showErrorDialog('Error!', error?.data?.message || 'Failed to update profile');
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
            showMessage('New passwords do not match', 'error');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            showMessage('New password must be at least 8 characters long', 'error');
            return;
        }

        try {
            await changePassword({
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword,
                new_password_confirmation: passwordData.newPasswordConfirmation,
            }).unwrap();

            showMessage('Password changed successfully!', 'success');
            setPasswordData({ currentPassword: '', newPassword: '', newPasswordConfirmation: '' });
        } catch (error: any) {
            showErrorDialog('Error!', error?.data?.message || 'Failed to change password');
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="pt-5">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">Settings</h5>
            </div>
            <div>
                <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('home')}
                            className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'home' ? '!border-primary text-primary' : ''}`}
                        >
                            <IconHome />
                            Home
                        </button>
                    </li>
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('security')}
                            className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'security' ? '!border-primary text-primary' : ''}`}
                        >
                            <IconLockDots />
                            Security
                        </button>
                    </li>
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('payment-details')}
                            className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'payment-details' ? '!border-primary text-primary' : ''}`}
                        >
                            <IconDollarSignCircle />
                            Payment Details
                        </button>
                    </li>

                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('danger-zone')}
                            className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'danger-zone' ? '!border-primary text-primary' : ''}`}
                        >
                            <IconPhone />
                            Danger Zone
                        </button>
                    </li>
                </ul>
            </div>
            {tabs === 'home' ? (
                <div>
                    <form className="mb-5 rounded-md border border-[#ebedf2] bg-white p-4 dark:border-[#191e3a] dark:bg-black" onSubmit={handleSubmit}>
                        <h6 className="mb-5 text-lg font-bold">General Information</h6>
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
                                    <label htmlFor="name">Full Name</label>
                                    <input id="name" name="name" type="text" placeholder="Enter your full name" className="form-input" value={formData.name} onChange={handleInputChange} />
                                </div>

                                <div>
                                    <label htmlFor="email">Email</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Email address"
                                        className="form-input cursor-not-allowed bg-gray-100"
                                        value={formData.email}
                                        readOnly
                                        disabled
                                    />
                                    <small className="mt-1 text-xs text-gray-500">Email cannot be changed</small>
                                </div>

                                <div>
                                    <label htmlFor="phone">Phone</label>
                                    <input id="phone" name="phone" type="text" placeholder="+1 (530) 555-12121" className="form-input" value={formData.phone} onChange={handleInputChange} />
                                </div>

                                <div>
                                    <label htmlFor="address">Address</label>
                                    <input id="address" name="address" type="text" placeholder="Enter your address" className="form-input" value={formData.address} onChange={handleInputChange} />
                                </div>

                                <div className="mt-3 sm:col-span-2">
                                    <button type="submit" className={`btn btn-primary ${isUpdating ? 'cursor-not-allowed opacity-50' : ''}`} disabled={isUpdating}>
                                        {isUpdating ? 'Saving...' : 'Save Changes'}
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
                        <h6 className="mb-5 text-lg font-bold">Change Password</h6>
                        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">Ensure your account is using a strong password to stay secure.</p>
                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label htmlFor="currentPassword">Current Password</label>
                                <div className="relative">
                                    <input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        placeholder="Enter current password"
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
                                <label htmlFor="newPassword">New Password</label>
                                <div className="relative">
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder="Enter new password"
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
                                <small className="mt-1 text-xs text-gray-500">Must be at least 8 characters</small>
                            </div>

                            <div>
                                <label htmlFor="newPasswordConfirmation">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        id="newPasswordConfirmation"
                                        name="newPasswordConfirmation"
                                        type={showNewPasswordConfirmation ? 'text' : 'password'}
                                        placeholder="Confirm new password"
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
                                    {isChangingPassword ? 'Changing Password...' : 'Change Password'}
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
                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Password Security Tips</h3>
                                <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                                    <ul className="list-disc space-y-1 pl-5">
                                        <li>Use at least 8 characters</li>
                                        <li>Include uppercase and lowercase letters</li>
                                        <li>Add numbers and special characters</li>
                                        <li>Avoid common words or patterns</li>
                                        <li>Don't reuse passwords from other accounts</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                ''
            )}
            {tabs === 'payment-details' ? (
                <div className="relative">
                    {/* Coming Soon Overlay */}
                    <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/80 dark:bg-black/80">
                        <div className="text-center">
                            <h3 className="mb-2 text-3xl font-bold text-gray-700 dark:text-gray-300">Coming Soon</h3>
                            <p className="text-gray-600 dark:text-gray-400">Payment Details section will be available soon</p>
                        </div>
                    </div>
                    {/* Original content with reduced opacity */}
                    <div className="pointer-events-none opacity-30">
                        <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <div className="panel">
                                <div className="mb-5">
                                    <h5 className="mb-4 text-lg font-semibold">Billing Address</h5>
                                    <p>
                                        Changes to your <span className="text-primary">Billing</span> information will take effect starting with scheduled payment and will be refelected on your next
                                        invoice.
                                    </p>
                                </div>
                                <div className="mb-5">
                                    <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                                        <div className="flex items-start justify-between py-3">
                                            <h6 className="text-[15px] font-bold text-[#515365] dark:text-white-dark">
                                                Address #1
                                                <span className="mt-1 block text-xs font-normal text-white-dark dark:text-white-light">2249 Caynor Circle, New Brunswick, New Jersey</span>
                                            </h6>
                                            <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                                                <button className="btn btn-dark">Edit</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                                        <div className="flex items-start justify-between py-3">
                                            <h6 className="text-[15px] font-bold text-[#515365] dark:text-white-dark">
                                                Address #2
                                                <span className="mt-1 block text-xs font-normal text-white-dark dark:text-white-light">4262 Leverton Cove Road, Springfield, Massachusetts</span>
                                            </h6>
                                            <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                                                <button className="btn btn-dark">Edit</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-start justify-between py-3">
                                            <h6 className="text-[15px] font-bold text-[#515365] dark:text-white-dark">
                                                Address #3
                                                <span className="mt-1 block text-xs font-normal text-white-dark dark:text-white-light">2692 Berkshire Circle, Knoxville, Tennessee</span>
                                            </h6>
                                            <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                                                <button className="btn btn-dark">Edit</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-primary">Add Address</button>
                            </div>
                            <div className="panel">
                                <div className="mb-5">
                                    <h5 className="mb-4 text-lg font-semibold">Payment History</h5>
                                    <p>
                                        Changes to your <span className="text-primary">Payment Method</span> information will take effect starting with scheduled payment and will be refelected on your
                                        next invoice.
                                    </p>
                                </div>
                                <div className="mb-5">
                                    <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                                        <div className="flex items-start justify-between py-3">
                                            <div className="flex-none ltr:mr-4 rtl:ml-4">
                                                <Image src="/assets/images/card-americanexpress.svg" alt="American Express" width={40} height={25} />
                                            </div>
                                            <h6 className="text-[15px] font-bold text-[#515365] dark:text-white-dark">
                                                Mastercard
                                                <span className="mt-1 block text-xs font-normal text-white-dark dark:text-white-light">XXXX XXXX XXXX 9704</span>
                                            </h6>
                                            <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                                                <button className="btn btn-dark">Edit</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                                        <div className="flex items-start justify-between py-3">
                                            <div className="flex-none ltr:mr-4 rtl:ml-4">
                                                <Image src="/assets/images/card-mastercard.svg" alt="Mastercard" width={40} height={25} />
                                            </div>
                                            <h6 className="text-[15px] font-bold text-[#515365] dark:text-white-dark">
                                                American Express
                                                <span className="mt-1 block text-xs font-normal text-white-dark dark:text-white-light">XXXX XXXX XXXX 310</span>
                                            </h6>
                                            <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                                                <button className="btn btn-dark">Edit</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-start justify-between py-3">
                                            <div className="flex-none ltr:mr-4 rtl:ml-4">
                                                <Image src="/assets/images/card-visa.svg" alt="Visa" width={40} height={25} />
                                            </div>
                                            <h6 className="text-[15px] font-bold text-[#515365] dark:text-white-dark">
                                                Visa
                                                <span className="mt-1 block text-xs font-normal text-white-dark dark:text-white-light">XXXX XXXX XXXX 5264</span>
                                            </h6>
                                            <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                                                <button className="btn btn-dark">Edit</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-primary">Add Payment Method</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <div className="panel">
                                <div className="mb-5">
                                    <h5 className="mb-4 text-lg font-semibold">Add Billing Address</h5>
                                    <p>
                                        Changes your New <span className="text-primary">Billing</span> Information.
                                    </p>
                                </div>
                                <div className="mb-5">
                                    <form>
                                        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="billingName">Name</label>
                                                <input id="billingName" type="text" placeholder="Enter Name" className="form-input" />
                                            </div>
                                            <div>
                                                <label htmlFor="billingEmail">Email</label>
                                                <input id="billingEmail" type="email" placeholder="Enter Email" className="form-input" />
                                            </div>
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="billingAddress">Address</label>
                                            <input id="billingAddress" type="text" placeholder="Enter Address" className="form-input" />
                                        </div>
                                        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                            <div className="md:col-span-2">
                                                <label htmlFor="billingCity">City</label>
                                                <input id="billingCity" type="text" placeholder="Enter City" className="form-input" />
                                            </div>
                                            <div>
                                                <label htmlFor="billingState">State</label>
                                                <select id="billingState" className="form-select text-white-dark">
                                                    <option>Choose...</option>
                                                    <option>...</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="billingZip">Zip</label>
                                                <input id="billingZip" type="text" placeholder="Enter Zip" className="form-input" />
                                            </div>
                                        </div>
                                        <button type="button" className="btn btn-primary">
                                            Add
                                        </button>
                                    </form>
                                </div>
                            </div>
                            <div className="panel">
                                <div className="mb-5">
                                    <h5 className="mb-4 text-lg font-semibold">Add Payment Method</h5>
                                    <p>
                                        Changes your New <span className="text-primary">Payment Method </span>
                                        Information.
                                    </p>
                                </div>
                                <div className="mb-5">
                                    <form>
                                        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="payBrand">Card Brand</label>
                                                <select id="payBrand" className="form-select text-white-dark">
                                                    <option value="Mastercard">Mastercard</option>
                                                    <option value="American Express">American Express</option>
                                                    <option value="Visa">Visa</option>
                                                    <option value="Discover">Discover</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="payNumber">Card Number</label>
                                                <input id="payNumber" type="text" placeholder="Card Number" className="form-input" />
                                            </div>
                                        </div>
                                        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="payHolder">Holder Name</label>
                                                <input id="payHolder" type="text" placeholder="Holder Name" className="form-input" />
                                            </div>
                                            <div>
                                                <label htmlFor="payCvv">CVV/CVV2</label>
                                                <input id="payCvv" type="text" placeholder="CVV" className="form-input" />
                                            </div>
                                        </div>
                                        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="payExp">Card Expiry</label>
                                                <input id="payExp" type="text" placeholder="Card Expiry" className="form-input" />
                                            </div>
                                        </div>
                                        <button type="button" className="btn btn-primary">
                                            Add
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                ''
            )}

            {tabs === 'danger-zone' ? (
                <div className="relative">
                    {/* Coming Soon Overlay */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-black/80">
                        <div className="text-center">
                            <h3 className="mb-2 text-3xl font-bold text-gray-700 dark:text-gray-300">Coming Soon</h3>
                            <p className="text-gray-600 dark:text-gray-400">Danger Zone section will be available soon</p>
                        </div>
                    </div>
                    {/* Original content with reduced opacity */}
                    <div className="pointer-events-none opacity-30">
                        <div className="switch">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                <div className="panel space-y-5">
                                    <h5 className="mb-4 text-lg font-semibold">Purge Cache</h5>
                                    <p>Remove the active resource from the cache without waiting for the predetermined cache expiry time.</p>
                                    <button className="btn btn-secondary">Clear</button>
                                </div>
                                <div className="panel space-y-5">
                                    <h5 className="mb-4 text-lg font-semibold">Deactivate Account</h5>
                                    <p>You will not be able to receive messages, notifications for up to 24 hours.</p>
                                    <label className="relative h-6 w-12">
                                        <input type="checkbox" className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0" id="custom_switch_checkbox7" />
                                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                    </label>
                                </div>
                                <div className="panel space-y-5">
                                    <h5 className="mb-4 text-lg font-semibold">Delete Account</h5>
                                    <p>Once you delete the account, there is no going back. Please be certain.</p>
                                    <button className="btn btn-danger btn-delete-account">Delete my account</button>
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
