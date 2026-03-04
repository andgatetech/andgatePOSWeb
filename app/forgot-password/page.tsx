'use client';

import IconMail from '@/components/icon/icon-mail';
import MainLayout from '@/components/layouts/MainLayout';
import { useForgotPasswordMutation } from '@/store/features/auth/authApi';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await forgotPassword({ email }).unwrap();
        } catch (_) {
            // Intentionally swallowed — never reveal if email exists
        } finally {
            // Always show generic success for security
            setShowSuccess(true);
        }
    };

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
                                    <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Forgot Password?</h1>
                                    <p className="text-base font-bold leading-normal text-white-dark">
                                        {showSuccess ? 'Check your email for reset instructions' : 'Enter your email to receive password reset instructions'}
                                    </p>
                                </div>

                                {showSuccess ? (
                                    <div className="mb-6 rounded-lg border border-green-500 bg-green-50/50 p-6 dark:border-green-600 dark:bg-green-900/20">
                                        <div className="mb-4 flex justify-center">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white">
                                                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <h3 className="mb-2 text-center text-lg font-bold text-green-700 dark:text-green-300">Email Sent!</h3>
                                        <p className="text-center text-sm text-green-700 dark:text-green-300">
                                            If an account exists with this email, you will receive password reset instructions shortly. Please check your inbox and spam folder.
                                        </p>
                                        <div className="mt-6 text-center">
                                            <Link href="/login" className="text-sm text-primary underline transition hover:text-black dark:hover:text-white">
                                                Back to Login
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <form className="space-y-5 dark:text-white" onSubmit={handleSubmit}>
                                        <div>
                                            <label htmlFor="Email">Email Address</label>
                                            <div className="relative text-white-dark">
                                                <input
                                                    id="Email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    className="form-input ps-10 placeholder:text-white-dark"
                                                    required
                                                    autoComplete="email"
                                                />
                                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                    <IconMail fill={true} />
                                                </span>
                                            </div>
                                        </div>

                                        <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]" disabled={isLoading}>
                                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                                        </button>
                                    </form>
                                )}

                                {!showSuccess && (
                                    <div className="mt-6 text-center dark:text-white">
                                        Remember your password?&nbsp;
                                        <Link href="/login" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                            Back to Login
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <p className="absolute bottom-6 w-full text-center dark:text-white">© {new Date().getFullYear()}. All Rights Reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ForgotPasswordPage;
