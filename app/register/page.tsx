'use client';

import { convertNumberByLanguage } from '@/components/custom/convertNumberByLanguage';
import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import { BarChart3, Package, Shield, Store, Zap } from 'lucide-react';
import Link from 'next/link';
import ComponentsAuthRegisterForm from './components-auth-register-form';

const RegisterPage = () => {
    const { t } = getTranslation();

    const perks = [
        { icon: <Store className="h-4 w-4" />, title: t('register_perk_1_title'), desc: t('register_perk_1_desc') },
        { icon: <Package className="h-4 w-4" />, title: t('register_perk_2_title'), desc: t('register_perk_2_desc') },
        { icon: <BarChart3 className="h-4 w-4" />, title: t('register_perk_3_title'), desc: t('register_perk_3_desc') },
        { icon: <Shield className="h-4 w-4" />, title: t('register_perk_4_title'), desc: t('register_perk_4_desc') },
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
                        {/* Badge */}
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
                            <Zap className="h-3.5 w-3.5 text-yellow-300" />
                            {t('register_panel_badge')}
                        </div>

                        {/* Centre copy */}
                        <div>
                            <h2 className="mb-4 text-3xl font-black leading-tight text-white xl:text-4xl">
                                {t('register_panel_headline')}
                            </h2>
                            <p className="mb-10 text-sm leading-relaxed text-white/70">
                                {t('register_panel_sub')}
                            </p>

                            {/* Perk cards */}
                            <div className="grid grid-cols-2 gap-3">
                                {perks.map((p, i) => (
                                    <div key={i} className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-all duration-200 hover:bg-white/15">
                                        <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white">
                                            {p.icon}
                                        </span>
                                        <p className="text-xs font-bold text-white">{p.title}</p>
                                        <p className="mt-0.5 text-xs leading-relaxed text-white/60">{p.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social proof */}
                        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                            <div className="flex -space-x-2">
                                {['from-[#046ca9] to-[#034d79]', 'from-[#035887] to-[#046ca9]', 'from-[#034d79] to-[#035887]'].map((g, i) => (
                                    <div key={i} className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${g} ring-2 ring-white/30 text-[11px] font-black text-white`}>
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-white/70">
                                <span className="font-bold text-white">{convertNumberByLanguage('100')}+</span>{' '}{t('register_social_proof')}
                            </p>
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
                            <h1 className="text-2xl font-black text-gray-900">{t('register-page.title')}</h1>
                            <p className="mt-1.5 text-sm text-gray-500">{t('register-page.subtitle')}</p>
                        </div>

                        {/* Form card */}
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/70">
                            <div className="h-1 w-full bg-gradient-to-r from-[#046ca9] to-[#034d79]" />
                            <div className="p-7">
                                <ComponentsAuthRegisterForm />
                            </div>
                        </div>

                        <p className="mt-6 text-center text-sm text-gray-500">
                            {t('register-page.already_have_account')}{' '}
                            <Link href="/login" className="font-semibold text-[#046ca9] hover:text-[#034d79]">
                                {t('register-page.sign_in')}
                            </Link>
                        </p>

                        <p className="mt-6 text-center text-xs text-gray-400">
                            © {new Date().getFullYear()}{' '}
                            <a href="https://andgatetech.net" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gray-500">
                                Andgate Technologies
                            </a>. {t('login-page.copyright').split('.').pop()?.trim() || 'All rights reserved.'}
                        </p>
                    </div>
                </div>

            </div>
        </MainLayout>
    );
};

export default RegisterPage;
