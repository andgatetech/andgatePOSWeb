'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Phone, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, KeyRound, MessageCircle, UserCheck } from 'lucide-react';
import { useLoginAffiliateMutation, useSetAffiliatePasswordMutation, setAffiliateToken, getAffiliateToken } from '@/store/features/affiliate/affiliatePortalApi';
import { getTranslation } from '@/i18n';

type Mode = 'login' | 'set-password';

const ADMIN_WHATSAPP = 'https://wa.me/8801577303608';

const getApiErrorMessage = (error: unknown, fallback: string): string => {
    const payload = (error as any)?.data;
    const message = payload?.message;

    if (typeof message === 'string' && message.trim() && !/^\d+$/.test(message.trim())) {
        return message;
    }

    if (typeof payload?.errors === 'string' && payload.errors.trim()) {
        return payload.errors;
    }

    return fallback;
};

export default function AffiliateLoginPage() {
    const { t } = getTranslation();
    const router = useRouter();
    const [mode, setMode] = useState<Mode>('login');
    const [showPass, setShowPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [setPasswordClientError, setSetPasswordClientError] = useState('');

    const [loginForm, setLoginForm] = useState({ mobile: '', password: '' });
    const [setPassForm, setSetPassForm] = useState({ mobile: '', code: '', password: '', password_confirmation: '' });

    const [loginAffiliate, { isLoading: logging, error: loginErr, isSuccess: loginOk }] = useLoginAffiliateMutation();
    const [setAffiliatePassword, { isLoading: setting, error: setErr, isSuccess: setOk, reset: resetSetPassword }] = useSetAffiliatePasswordMutation();

    useEffect(() => {
        if (getAffiliateToken()) router.replace('/affiliate/portal');
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await loginAffiliate(loginForm).unwrap();
            setAffiliateToken(res.data.token);
            router.push('/affiliate/portal');
        } catch {}
    };

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setSetPasswordClientError('');

        if (setPassForm.password !== setPassForm.password_confirmation) {
            setSetPasswordClientError(t('aff_login_password_mismatch'));
            return;
        }

        try {
            await setAffiliatePassword(setPassForm).unwrap();
        } catch {}
    };

    const switchMode = (nextMode: Mode) => {
        setMode(nextMode);
        setSetPasswordClientError('');
        if (nextMode === 'set-password') {
            setSetPassForm((current) => ({ ...current, mobile: current.mobile || loginForm.mobile }));
        }
        if (nextMode === 'login') {
            resetSetPassword();
            setLoginForm((current) => ({ ...current, mobile: current.mobile || setPassForm.mobile }));
        }
    };

    return (
        <div className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-12">
            <section className="order-2 lg:order-1">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5 flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <UserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{t('aff_login_flow_title')}</h2>
                            <p className="mt-1 text-sm text-slate-500">{t('aff_login_flow_subtitle')}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[
                            ['1', t('aff_login_flow_step_1'), t('aff_login_flow_step_1_desc')],
                            ['2', t('aff_login_flow_step_2'), t('aff_login_flow_step_2_desc')],
                            ['3', t('aff_login_flow_step_3'), t('aff_login_flow_step_3_desc')],
                        ].map(([step, title, desc]) => (
                            <div key={step} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{step}</span>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{title}</p>
                                    <p className="mt-0.5 text-xs leading-5 text-slate-500">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <p className="font-semibold">{t('aff_login_gap_title')}</p>
                        <p className="mt-1 leading-5">{t('aff_login_gap_desc')}</p>
                    </div>

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        <a
                            href={`${ADMIN_WHATSAPP}?text=${encodeURIComponent('I need help with AndgatePOS affiliate password setup.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#25d366]/40 bg-[#25d366]/10 px-4 py-2.5 text-sm font-semibold text-[#128c4e] transition hover:bg-[#25d366]/20"
                        >
                            <MessageCircle className="h-4 w-4" />
                            {t('aff_login_whatsapp_help')}
                        </a>
                        <Link
                            href="/affiliate"
                            className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            {t('aff_login_apply_partner')}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="order-1 lg:order-2">
                <div className="w-full">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                            {mode === 'login' ? <Lock className="h-7 w-7 text-primary" /> : <KeyRound className="h-7 w-7 text-primary" />}
                        </div>
                        <h1 className="text-2xl font-bold">{mode === 'login' ? t('aff_login_title_login') : t('aff_login_title_set')}</h1>
                        <p className="mt-1 text-sm text-slate-500">{mode === 'login' ? t('aff_login_subtitle_login') : t('aff_login_subtitle_set')}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md sm:p-6">
                        {/* Mode tabs */}
                        <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
                            {(['login', 'set-password'] as Mode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => switchMode(m)}
                                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === m ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {m === 'login' ? t('aff_login_tab_login') : t('aff_login_tab_set_password')}
                                </button>
                            ))}
                        </div>

                        {/* Login form */}
                        {mode === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-4">
                                {loginErr && (
                                    <div className="flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        {getApiErrorMessage(loginErr, t('aff_login_error'))}
                                    </div>
                                )}
                                <div>
                                    <label className="mb-1 block text-sm font-medium">{t('aff_login_mobile')}</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            required
                                            type="tel"
                                            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                                            placeholder="01XXXXXXXXX"
                                            value={loginForm.mobile}
                                            onChange={(e) => setLoginForm({ ...loginForm, mobile: e.target.value })}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-slate-400">{t('aff_login_mobile_note')}</p>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">{t('aff_login_password')}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            required
                                            type={showPass ? 'text' : 'password'}
                                            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-10 text-sm focus:border-primary focus:outline-none"
                                            placeholder="••••••••"
                                            value={loginForm.password}
                                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                        />
                                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" disabled={logging} className="w-full rounded-xl bg-primary py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50">
                                    {logging ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : t('aff_login_btn')}
                                </button>
                                <p className="text-center text-xs text-slate-400">
                                    {t('aff_login_first_time')}{' '}
                                    <button type="button" onClick={() => switchMode('set-password')} className="font-semibold text-primary hover:underline">
                                        {t('aff_login_set_password_link')}
                                    </button>
                                </p>
                            </form>
                        )}

                        {/* Set password form */}
                        {mode === 'set-password' && (
                            <form onSubmit={handleSetPassword} className="space-y-4">
                                {setOk ? (
                                    <div className="py-4 text-center">
                                        <CheckCircle className="mx-auto mb-3 h-12 w-12 text-success" />
                                        <p className="font-semibold">{t('aff_login_set_success_title')}</p>
                                        <p className="mt-1 text-sm text-slate-500">{t('aff_login_set_success_sub')}</p>
                                        <button type="button" onClick={() => switchMode('login')} className="mt-4 rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-white">
                                            {t('aff_login_set_success_btn')}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-sm text-slate-700">
                                            <p className="font-semibold text-slate-900">{t('aff_login_set_intro_title')}</p>
                                            <p className="mt-1 leading-5">{t('aff_login_set_intro_desc')}</p>
                                        </div>
                                        {(setErr || setPasswordClientError) && (
                                            <div className="flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
                                                <AlertCircle className="h-4 w-4 shrink-0" />
                                                {setPasswordClientError || getApiErrorMessage(setErr, t('aff_login_set_error'))}
                                            </div>
                                        )}
                                        <div>
                                            <label className="mb-1 block text-sm font-medium">{t('aff_login_mobile')}</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    required
                                                    type="tel"
                                                    className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                                                    placeholder="01XXXXXXXXX"
                                                    value={setPassForm.mobile}
                                                    onChange={(e) => setSetPassForm({ ...setPassForm, mobile: e.target.value })}
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-slate-400">{t('aff_login_mobile_note')}</p>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium">{t('aff_login_ref_code')}</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase focus:border-primary focus:outline-none"
                                                placeholder={t('aff_login_ref_code_ph')}
                                                value={setPassForm.code}
                                                onChange={(e) => setSetPassForm({ ...setPassForm, code: e.target.value.toUpperCase() })}
                                            />
                                            <p className="mt-1 text-xs text-slate-400">{t('aff_login_ref_code_note')}</p>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium">{t('aff_login_new_password')}</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    required
                                                    type={showNewPass ? 'text' : 'password'}
                                                    minLength={6}
                                                    className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-10 text-sm focus:border-primary focus:outline-none"
                                                    placeholder={t('aff_login_new_password_ph')}
                                                    value={setPassForm.password}
                                                    onChange={(e) => setSetPassForm({ ...setPassForm, password: e.target.value })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPass(!showNewPass)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium">{t('aff_login_confirm_password')}</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    required
                                                    type={showConfirmPass ? 'text' : 'password'}
                                                    minLength={6}
                                                    className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-10 text-sm focus:border-primary focus:outline-none"
                                                    placeholder={t('aff_login_confirm_password_ph')}
                                                    value={setPassForm.password_confirmation}
                                                    onChange={(e) => setSetPassForm({ ...setPassForm, password_confirmation: e.target.value })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <button type="submit" disabled={setting} className="w-full rounded-xl bg-primary py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50">
                                            {setting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : t('aff_login_set_btn')}
                                        </button>
                                    </>
                                )}
                            </form>
                        )}
                    </div>

                    <p className="mt-4 text-center text-sm text-slate-400">
                        {t('aff_login_not_partner')}{' '}
                        <Link href="/affiliate" className="font-semibold text-primary hover:underline">
                            {t('aff_login_register_link')}
                        </Link>
                    </p>
                </div>
            </section>
        </div>
    );
}
