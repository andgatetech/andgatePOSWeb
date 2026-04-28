'use client';

import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import { BarChart3, CheckCircle, ShoppingCart, Store, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import ComponentsAuthLoginForm from './components-auth-login-form';

const LoginPage = () => {
    const loginFormRef = useRef<any>(null);
    const { t } = getTranslation();

    const fillDemoCredentials = (email: string, password: string) => {
        if (loginFormRef.current) {
            loginFormRef.current.updateCredentials(email, password);
        }
    };

    const benefits = [
        { icon: <TrendingUp className="h-4 w-4" />, text: t('login_benefit_1') },
        { icon: <Store className="h-4 w-4" />, text: t('login_benefit_2') },
        { icon: <ShoppingCart className="h-4 w-4" />, text: t('login_benefit_3') },
        { icon: <BarChart3 className="h-4 w-4" />, text: t('login_benefit_4') },
    ];

    return (
        <MainLayout>
            <div className="mt-16 flex min-h-[calc(100vh-64px)]">

                {/* ── Left panel ── */}
                <div className="relative hidden overflow-hidden lg:flex lg:w-5/12 xl:w-[45%]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79]" />
                    <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
                        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
                    <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-24 -right-12 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />

                    <div className="relative flex w-full flex-col justify-between p-12">
                        {/* Top badge */}
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
                            <Zap className="h-3.5 w-3.5 text-yellow-300" />
                            {t('login_panel_badge')}
                        </div>

                        {/* Centre copy */}
                        <div>
                            <h2 className="mb-4 text-3xl font-black leading-tight text-white xl:text-4xl">
                                {t('login_panel_headline')}
                            </h2>
                            <p className="mb-10 text-sm leading-relaxed text-white/70">
                                {t('login_panel_sub')}
                            </p>
                            <ul className="space-y-4">
                                {benefits.map((b, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-white/90">
                                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                                            {b.icon}
                                        </span>
                                        {b.text}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Testimonial */}
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                            <div className="mb-1 flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <svg key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="mb-4 text-sm leading-relaxed text-white/80 italic">
                                &ldquo;{t('login_panel_quote')}&rdquo;
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#046ca9] to-[#034d79] text-xs font-black text-white shadow-md">
                                    {t('login_panel_quote_name').charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{t('login_panel_quote_name')}</p>
                                    <p className="text-xs text-white/60">{t('login_panel_quote_biz')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right panel ── */}
                <div className="relative flex flex-1 flex-col justify-center overflow-hidden bg-gradient-to-br from-white via-slate-50 to-[#eaf3fb] px-6 py-10 sm:px-10 lg:px-14">
                    {/* Subtle bg blobs */}
                    <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[#046ca9]/5 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#046ca9]/5 blur-3xl" />

                    <div className="relative mx-auto w-full max-w-[400px]">
                        {/* Brand mark */}
                        <div className="mb-8 flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] shadow-md shadow-[#046ca9]/20">
                                <Zap className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg font-black text-gray-900">AndgatePOS</span>
                        </div>

                        <div className="mb-7">
                            <h1 className="text-2xl font-black text-gray-900">{t('login-page.title')}</h1>
                            <p className="mt-1.5 text-sm text-gray-500">{t('login-page.subtitle')}</p>
                        </div>

                        {/* Form card */}
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/70">
                            <div className="h-1 w-full bg-gradient-to-r from-[#046ca9] to-[#034d79]" />
                            <div className="p-7">
                                <ComponentsAuthLoginForm ref={loginFormRef} />

                                <div className="relative my-5">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-100" />
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-gray-400">
                                            {t('login-page.or')}
                                        </span>
                                    </div>
                                </div>

                                {/* Demo credentials */}
                                <button
                                    type="button"
                                    onClick={() => fillDemoCredentials('user@demo.com', 'user123')}
                                    className="w-full rounded-xl border border-[#046ca9]/15 bg-[#046ca9]/5 px-4 py-3 text-left transition-colors hover:bg-[#046ca9]/10"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-[#046ca9]">{t('login-page.demo_credentials.store_admin')}</p>
                                            <p className="mt-0.5 text-xs text-[#046ca9]/70">{t('login-page.demo_credentials.email_password')}</p>
                                        </div>
                                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-[#046ca9]" />
                                    </div>
                                </button>
                                <p className="mt-2 text-center text-[11px] text-gray-400">
                                    {t('login-page.demo_credentials.hint')}
                                </p>
                            </div>
                        </div>

                        <p className="mt-6 text-center text-sm text-gray-500">
                            {t('login-page.dont_have_account')}{' '}
                            <Link href="/register" className="font-semibold text-[#046ca9] hover:text-[#034d79]">
                                {t('login-page.sign_up')}
                            </Link>
                        </p>

                        <p className="mt-6 text-center text-xs text-gray-400">
                            {t('login-page.copyright').replace('{year}', new Date().getFullYear().toString())}
                        </p>
                    </div>
                </div>

            </div>
        </MainLayout>
    );
};

export default LoginPage;
