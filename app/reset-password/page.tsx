'use client';

import IconLockDots from '@/components/icon/icon-lock-dots';
import MainLayout from '@/components/layouts/MainLayout';
import { showErrorDialog, showMessage } from '@/lib/toast';
import { useResetPasswordMutation } from '@/store/features/auth/authApi';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useState } from 'react';

const ResetPasswordForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        const emailParam = searchParams.get('email');

        if (!tokenParam || !emailParam) {
            showErrorDialog('Invalid Link', 'This password reset link is invalid or has expired.');
            router.push('/forgot-password');
            return;
        }

        setToken(tokenParam);
        setEmail(emailParam);
    }, [searchParams, router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (password !== passwordConfirmation) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        if (password.length < 8) {
            showMessage('Password must be at least 8 characters long', 'error');
            return;
        }

        try {
            await resetPassword({
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            }).unwrap();

            showMessage('Password reset successful! Please login with your new password.', 'success');
            router.push('/login');
        } catch (error: any) {
            const message = error?.data?.message || 'Failed to reset password. The link may be expired.';
            showErrorDialog('Reset Failed', message);
        }
    };

    const togglePasswordVisibility = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowPassword(!showPassword);
    };

    const togglePasswordConfirmationVisibility = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowPasswordConfirmation(!showPasswordConfirmation);
    };

    if (!token || !email) {
        return null;
    }

    return (
        <MainLayout>
            <div>
                <div className="absolute inset-0">
                    <Image src="/assets/images/auth/bg-gradient.png" width={1920} height={1080} alt="image" objectFit="cover" />
                </div>
                <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                    <Image src="/assets/images/auth/coming-soon-object1.png" width={893} height={893} alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                    <Image src="/assets/images/auth/coming-soon-object2.png" width={160} height={160} alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                    <Image src="/assets/images/auth/coming-soon-object3.png" width={300} height={300} alt="image" className="absolute right-0 top-0 h-[300px]" />
                    <Image src="/assets/images/auth/polygon-object.svg" width={100} height={100} alt="image" className="absolute bottom-0 end-[28%]" />
                    <div className="relative flex w-full max-w-[1502px] flex-col justify-between overflow-hidden rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 lg:min-h-[758px] lg:flex-row lg:gap-10 xl:gap-0">
                        <div className="relative hidden w-full items-center justify-center bg-[linear-gradient(225deg,rgba(239,18,98,1)_0%,rgba(67,97,238,1)_100%)] p-5 lg:inline-flex lg:max-w-[835px] xl:-ms-28 ltr:xl:skew-x-[14deg] rtl:xl:skew-x-[-14deg]">
                            <div className="absolute inset-y-0 w-8 from-primary/10 via-transparent to-transparent xl:w-16 ltr:-right-10 ltr:bg-gradient-to-r ltr:xl:-right-20 rtl:-left-10 rtl:bg-gradient-to-l rtl:xl:-left-20"></div>
                            <div className="ltr:xl:-skew-x-[14deg] rtl:xl:skew-x-[14deg]">
                                <div className="mt-24 hidden w-full max-w-[430px] lg:block">
                                    <Image src="/assets/images/auth/login.svg" alt="Cover Image" className="w-full" width={430} height={430} />
                                </div>
                            </div>
                        </div>
                        <div className="relative flex w-full flex-col items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6 lg:max-w-[667px]">
                            <div className="w-full max-w-[440px] lg:mt-16">
                                <div className="mb-10">
                                    <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Reset Password</h1>
                                    <p className="text-base font-bold leading-normal text-white-dark">Enter your new password</p>
                                </div>

                                <form className="space-y-5 dark:text-white" onSubmit={handleSubmit}>
                                    <div>
                                        <label htmlFor="email">Email Address</label>
                                        <div className="relative text-white-dark">
                                            <input
                                                id="email"
                                                value={email}
                                                type="email"
                                                className="form-input cursor-not-allowed bg-gray-100 ps-10 placeholder:text-white-dark dark:bg-gray-800"
                                                readOnly
                                                disabled
                                            />
                                            <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                <IconLockDots fill={true} />
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="password">New Password</label>
                                        <div className="relative text-white-dark">
                                            <input
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter new password"
                                                className="form-input pe-10 ps-10 placeholder:text-white-dark"
                                                required
                                                minLength={8}
                                                autoComplete="new-password"
                                            />
                                            <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                <IconLockDots fill={true} />
                                            </span>
                                            <button
                                                type="button"
                                                onClick={togglePasswordVisibility}
                                                className="absolute end-4 top-1/2 -translate-y-1/2 text-white-dark transition-colors duration-200 hover:text-primary focus:outline-none"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        <small className="text-xs text-white-dark">Must be at least 8 characters</small>
                                    </div>

                                    <div>
                                        <label htmlFor="password_confirmation">Confirm New Password</label>
                                        <div className="relative text-white-dark">
                                            <input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                value={passwordConfirmation}
                                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                                type={showPasswordConfirmation ? 'text' : 'password'}
                                                placeholder="Confirm new password"
                                                className="form-input pe-10 ps-10 placeholder:text-white-dark"
                                                required
                                                autoComplete="new-password"
                                            />
                                            <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                <IconLockDots fill={true} />
                                            </span>
                                            <button
                                                type="button"
                                                onClick={togglePasswordConfirmationVisibility}
                                                className="absolute end-4 top-1/2 -translate-y-1/2 text-white-dark transition-colors duration-200 hover:text-primary focus:outline-none"
                                                aria-label={showPasswordConfirmation ? 'Hide password' : 'Show password'}
                                            >
                                                {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Resetting Password...' : 'Reset Password'}
                                    </button>
                                </form>

                                <div className="mt-6 text-center dark:text-white">
                                    Remember your password?&nbsp;
                                    <Link href="/login" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                            <p className="absolute bottom-6 w-full text-center dark:text-white">© {new Date().getFullYear()} Andgate Technologies. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

const ResetPasswordPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
};

export default ResetPasswordPage;
