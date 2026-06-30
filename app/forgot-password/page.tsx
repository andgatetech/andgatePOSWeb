'use client';

import { useForgotPasswordMutation } from '@/store/features/auth/authApi';
import { showMessage } from '@/lib/toast';
import { getTranslation } from '@/i18n';
import { ArrowLeft, Lock, Mail, Shield, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

const AndGate = '/images/andgatePOS.jpeg';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
    const { t } = getTranslation();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await forgotPassword({ email }).unwrap();
            setShowSuccess(true);
        } catch (_) {
            showMessage(t('forgot_password_error_send'), 'error');
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Left panel */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0a0f1e] p-12 lg:flex lg:w-5/12 xl:w-2/5">
                <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
                <div className="absolute -bottom-32 -right-16 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                <div className="relative">
                    <Link href="/">
                        <Image src={AndGate} alt="AndgatePOS" width={160} height={53} className="brightness-0 invert" />
                    </Link>
                </div>

                <div className="relative">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
                        <Zap className="h-3 w-3" />
                        {t('forgot_password_left_tag')}
                    </div>
                    <h2 className="mb-4 text-3xl font-black leading-tight text-white xl:text-4xl">
                        {t('forgot_password_left_title')}
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">{t('forgot_password_left_title_gradient')}</span>
                    </h2>
                    <p className="mb-8 text-sm leading-relaxed text-slate-400">{t('forgot_password_left_desc')}</p>
                    <div className="space-y-4">
                        {[
                            { icon: <Shield className="h-4 w-4" />, title: t('forgot_password_feature_1_title'), desc: t('forgot_password_feature_1_desc') },
                            { icon: <Mail className="h-4 w-4" />, title: t('forgot_password_feature_2_title'), desc: t('forgot_password_feature_2_desc') },
                            { icon: <Lock className="h-4 w-4" />, title: t('forgot_password_feature_3_title'), desc: t('forgot_password_feature_3_desc') },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-400">{item.icon}</span>
                                <div>
                                    <p className="text-xs font-bold text-white">{item.title}</p>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative text-xs text-slate-500">
                    © {new Date().getFullYear()}{' '}
                    <a href="https://andgatetech.net" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-slate-400">
                        Andgate Technologies
                    </a>
                    . {t('footer_all_rights_reserved')}
                </div>
            </div>

            {/* Right panel */}
            <div className="flex flex-1 flex-col justify-center bg-slate-50 px-6 py-12 sm:px-10 lg:px-16">
                <div className="mb-8 flex justify-center lg:hidden">
                    <Link href="/">
                        <Image src={AndGate} alt="AndgatePOS" width={140} height={47} />
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-sm">
                    {!showSuccess ? (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-black text-gray-900">{t('forgot_password_title')}</h1>
                                <p className="mt-1.5 text-sm text-gray-500">{t('forgot_password_subtitle')}</p>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                                            {t('forgot_password_email_label')}
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder={t('forgot_password_email_placeholder')}
                                                required
                                                autoComplete="email"
                                                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:opacity-90 disabled:opacity-60"
                                    >
                                        {isLoading ? t('forgot_password_submit_sending') : t('forgot_password_submit')}
                                    </button>
                                </form>
                            </div>

                            <p className="mt-6 text-center text-sm text-gray-500">
                                {t('forgot_password_remember')}{' '}
                                <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                                    {t('forgot_password_back_to_login')}
                                </Link>
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-black text-gray-900">{t('forgot_password_success_title')}</h1>
                                <p className="mt-1.5 text-sm text-gray-500">{t('forgot_password_success_subtitle')}</p>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900">{t('forgot_password_email_sent_title')}</h3>
                                <p className="text-sm text-gray-500">{t('forgot_password_email_sent_desc')}</p>
                                <Link
                                    href="/login"
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    {t('forgot_password_back_to_login_2')}
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                <p className="mt-auto pt-12 text-center text-xs text-gray-400">
                    © {new Date().getFullYear()}{' '}
                    <a href="https://andgatetech.net" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gray-500">
                        Andgate Technologies
                    </a>
                    . {t('footer_all_rights_reserved')}
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
