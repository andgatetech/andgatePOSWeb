'use client';

import SupplierLoginForm from '@/__components/supplier_login_form';
import ComponentsAuthLoginForm from '@/components/auth/components-auth-login-form';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';

const CoverLogin = () => {
    const [activeTab, setActiveTab] = useState<'login' | 'supplier'>('login');
    const loginFormRef = useRef<any>(null);

    // Function to handle demo credential filling
    const fillDemoCredentials = (email: string, password: string) => {
        if (loginFormRef.current) {
            // Use the ref method to update credentials in the child component
            loginFormRef.current.updateCredentials(email, password);
        }
    };

    return (
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
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Sign in</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">Enter your email and password to login</p>
                            </div>
                            <div className="mb-6 flex border-b border-white-light dark:border-white-dark">
                                <button
                                    className={`flex-1 py-2 text-center text-lg font-medium transition-colors ${
                                        activeTab === 'login' ? 'border-b-2 border-primary text-primary' : 'text-white-dark hover:text-primary'
                                    }`}
                                    onClick={() => setActiveTab('login')}
                                >
                                    Login
                                </button>
                            </div>

                            {activeTab === 'login' ? <ComponentsAuthLoginForm ref={loginFormRef} /> : <SupplierLoginForm />}

                            <div className="relative my-7 text-center md:mb-9">
                                <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"></span>
                                <span className="relative bg-white px-2 font-bold uppercase text-white-dark dark:bg-dark dark:text-white-light">or</span>
                            </div>

                            <div className="mb-10 md:mb-[60px]">
                                <div className="rounded-lg border border-white-light bg-white/50 p-4 dark:border-white-dark dark:bg-black/20">
                                    <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Demo Credential (Click to auto-fill)</h3>
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => fillDemoCredentials('user@demo.com', 'user123')}
                                            className="w-full rounded bg-green-50 px-3 py-2 text-left text-sm transition hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50"
                                        >
                                            <div className="font-medium text-green-700 dark:text-green-300">Demo Store Admin Credentials</div>
                                            <div className="text-xs text-green-600 dark:text-green-400">Email: user@demo.com | Password: user123</div>
                                        </button>
                                    </div>
                                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">💡 Click credential above to automatically fill the login form</div>
                                </div>
                            </div>

                            <div className="text-center dark:text-white">
                                Don&apos;t have an account ?&nbsp;
                                <Link href="register" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                    SIGN UP
                                </Link>
                            </div>
                        </div>
                        <p className="absolute bottom-6 w-full text-center dark:text-white">© {new Date().getFullYear()}.Andgate All Rights Reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoverLogin;
