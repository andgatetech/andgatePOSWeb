'use client';

import { getTranslation } from '@/i18n';
import { AUTH_TOKEN_EXPIRES_AT_COOKIE, AUTH_TOKEN_EXPIRES_AT_KEY, getCookieMaxAgeFromExpiry, getLoginTokenExpiresAt, isTokenExpired, setAuthCookie } from '@/lib/auth-session';
import { RootState } from '@/store';
import { useRegisterMutation } from '@/store/features/auth/authApi';
import { login } from '@/store/features/auth/authSlice';
import { Building as IconBuilding, Eye as IconEye, EyeOff as IconEyeOff, Lock as IconLockDots, Mail as IconMail, Phone as IconPhone, User as IconUser } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const ComponentsAuthRegisterForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [runTour, setRunTour] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [registerApi, { isLoading }] = useRegisterMutation();

    const refCode = searchParams.get('ref') ?? '';

    const [credentials, setCredentials] = useState({
        store_name: '',
        name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        ref_code: refCode,
    });

    useEffect(() => {
        if (refCode) setCredentials((prev) => ({ ...prev, ref_code: refCode }));
    }, [refCode]);

    // Start tour on component mount (optional - you can trigger this differently)
    useEffect(() => {
        // Check if user hasn't seen the tour before
        const hasSeenTour = localStorage.getItem('register-tour-completed');
        if (!hasSeenTour) {
            setTimeout(() => setRunTour(true), 1000); // Start tour after 1 second
        }
    }, []);

    const submitForm = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const result = await registerApi(credentials).unwrap();
            const { user, token, permissions } = result.data; // user already has store & subscription_user
            const tokenExpiresAt = getLoginTokenExpiresAt(result.data);

            if (isTokenExpired(tokenExpiresAt)) {
                toast.error('Registration token expired. Please login again.');
                return;
            }
            const validTokenExpiresAt = tokenExpiresAt as string;

            const maxAge = getCookieMaxAgeFromExpiry(validTokenExpiresAt);
            const encodedPermissions = (() => {
                try {
                    return btoa(JSON.stringify(permissions ?? []));
                } catch (err) {
                    console.error('Failed to encode permissions cookie', err);
                    return btoa('[]');
                }
            })();

            // Save token + role in cookies
            setAuthCookie('token', token, maxAge);
            setAuthCookie('role', user.role, maxAge);
            setAuthCookie('permissions', encodedPermissions, maxAge);
            setAuthCookie(AUTH_TOKEN_EXPIRES_AT_COOKIE, validTokenExpiresAt, maxAge);

            localStorage.setItem(AUTH_TOKEN_EXPIRES_AT_KEY, validTokenExpiresAt);

            // Save full user data + permissions in Redux
            dispatch(login({ user, token, tokenExpiresAt: validTokenExpiresAt, permissions }));

            toast.success('Registration successful! Redirecting to dashboard...');
            setTimeout(() => router.push('/dashboard'), 800);
        } catch (error: any) {
            console.error('Registration failed:', error);

            // Handle all RTK Query error shapes
            const message =
                error?.data?.message ||
                error?.data?.errors?.email?.[0] ||
                error?.data?.errors?.phone?.[0] ||
                error?.data?.errors?.password?.[0] ||
                (error?.status === 'FETCH_ERROR' ? 'Cannot connect to server. Please check your connection.' : null) ||
                'Registration failed. Please try again.';
            toast.error(message);
        }
    };

    return (
        <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
            {refCode && (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-3 py-2 text-sm text-success font-medium">
                    <span>🤝</span>
                    <span>রেফারেল কোড: <strong lang="en" dir="ltr">{refCode.toUpperCase()}</strong> — কমিশন ট্র্যাক হবে</span>
                </div>
            )}
            <div>
                <label htmlFor="Name">{t('register-page.form.name_label')}</label>
                <div className="relative text-white-dark">
                    <input
                        id="Name"
                        required
                        onChange={(e) => setCredentials({ ...credentials, name: e.target.value })}
                        type="text"
                        placeholder={t('register-page.form.name_placeholder')}
                        className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconUser size={18} />
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="Email">{t('register-page.form.email_label')}</label>
                <div className="relative text-white-dark">
                    <input
                        id="Email"
                        required
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        type="email"
                        placeholder={t('register-page.form.email_placeholder')}
                        className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconMail size={18} />
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="Phone">{t('register-page.form.phone_label')}</label>
                <div className="relative text-white-dark">
                    <input
                        id="Phone"
                        onChange={(e) => setCredentials({ ...credentials, phone: e.target.value })}
                        type="tel"
                        placeholder={t('register-page.form.phone_placeholder')}
                        className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconPhone size={18} />
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="StoreName">{t('register-page.form.store_name_label')}</label>
                <div className="relative text-white-dark">
                    <input
                        id="StoreName"
                        required
                        onChange={(e) => setCredentials({ ...credentials, store_name: e.target.value })}
                        type="text"
                        placeholder={t('register-page.form.store_name_placeholder')}
                        className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconBuilding size={18} />
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="Password">{t('register-page.form.password_label')}</label>
                <div className="relative text-white-dark">
                    <input
                        id="Password"
                        required
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('register-page.form.password_placeholder')}
                        className="form-input pe-12 ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconLockDots size={18} />
                    </span>
                    <span
                        className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="PasswordConfirm">{t('register-page.form.repeat_password_label')}</label>
                <div className="relative text-white-dark">
                    <input
                        id="PasswordConfirm"
                        required
                        onChange={(e) => setCredentials({ ...credentials, password_confirmation: e.target.value })}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder={t('register-page.form.repeat_password_placeholder')}
                        className="form-input pe-12 ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconLockDots size={18} />
                    </span>
                    <span
                        className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </span>
                </div>
            </div>

            <button type="submit" disabled={isLoading} className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] py-3 text-sm font-semibold uppercase text-white shadow-[0_10px_20px_-10px_rgba(4,108,169,0.44)] transition-all hover:from-[#034d79] hover:to-[#02395b] disabled:opacity-50">
                {isLoading ? t('register-page.form.signing_up') : t('register-page.form.sign_up_button')}
            </button>
        </form>
    );
};

export default ComponentsAuthRegisterForm;
