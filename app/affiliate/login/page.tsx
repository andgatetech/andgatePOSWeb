'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Phone, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import {
    useLoginAffiliateMutation,
    useSetAffiliatePasswordMutation,
    setAffiliateToken,
    getAffiliateToken,
} from '@/store/features/affiliate/affiliatePortalApi';

type Mode = 'login' | 'set-password';

export default function AffiliateLoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>('login');
    const [showPass, setShowPass] = useState(false);

    const [loginForm, setLoginForm] = useState({ mobile: '', password: '' });
    const [setPassForm, setSetPassForm] = useState({ mobile: '', code: '', password: '', password_confirmation: '' });

    const [loginAffiliate, { isLoading: logging, error: loginErr, isSuccess: loginOk }] = useLoginAffiliateMutation();
    const [setAffiliatePassword, { isLoading: setting, error: setErr, isSuccess: setOk }] = useSetAffiliatePasswordMutation();

    // Redirect if already authenticated
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
        try {
            await setAffiliatePassword(setPassForm).unwrap();
        } catch {}
    };

    return (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-4">
                        <Lock className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">
                        {mode === 'login' ? 'পার্টনার পোর্টাল লগইন' : 'পাসওয়ার্ড সেট করুন'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {mode === 'login'
                            ? 'আপনার অ্যাফিলিয়েট একাউন্টে লগইন করুন'
                            : 'প্রথমবার লগইনের আগে পাসওয়ার্ড সেট করুন'}
                    </p>
                </div>

                <div className="rounded-2xl bg-white shadow-md border border-slate-200 p-6">

                    {/* Mode tabs */}
                    <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
                        {(['login', 'set-password'] as Mode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                                    mode === m ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {m === 'login' ? 'লগইন' : 'পাসওয়ার্ড সেট করুন'}
                            </button>
                        ))}
                    </div>

                    {/* Login form */}
                    {mode === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            {loginErr && (
                                <div className="flex items-center gap-2 rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-sm text-danger">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {(loginErr as any)?.data?.message || 'লগইন ব্যর্থ।'}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-1">মোবাইল নম্বর</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        required type="tel"
                                        className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary"
                                        placeholder="01XXXXXXXXX"
                                        value={loginForm.mobile}
                                        onChange={(e) => setLoginForm({ ...loginForm, mobile: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">পাসওয়ার্ড</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        required type={showPass ? 'text' : 'password'}
                                        className="w-full border border-slate-200 rounded-lg pl-9 pr-10 py-2 text-sm focus:outline-none focus:border-primary"
                                        placeholder="••••••••"
                                        value={loginForm.password}
                                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit" disabled={logging}
                                className="w-full rounded-xl bg-primary text-white font-bold py-3 hover:opacity-90 transition disabled:opacity-50"
                            >
                                {logging ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'লগইন করুন'}
                            </button>
                            <p className="text-center text-xs text-slate-400">
                                প্রথমবার? <button type="button" onClick={() => setMode('set-password')} className="text-primary font-semibold hover:underline">পাসওয়ার্ড সেট করুন</button>
                            </p>
                        </form>
                    )}

                    {/* Set password form */}
                    {mode === 'set-password' && (
                        <form onSubmit={handleSetPassword} className="space-y-4">
                            {setOk ? (
                                <div className="text-center py-4">
                                    <CheckCircle className="mx-auto mb-3 h-12 w-12 text-success" />
                                    <p className="font-semibold">পাসওয়ার্ড সেট সফল!</p>
                                    <p className="text-sm text-slate-500 mt-1">এখন লগইন করুন</p>
                                    <button onClick={() => setMode('login')} className="mt-4 rounded-xl bg-primary text-white px-6 py-2 font-semibold text-sm">লগইনে যান</button>
                                </div>
                            ) : (
                                <>
                                    {setErr && (
                                        <div className="flex items-center gap-2 rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-sm text-danger">
                                            <AlertCircle className="h-4 w-4 shrink-0" />
                                            {(setErr as any)?.data?.message || 'পাসওয়ার্ড সেট ব্যর্থ।'}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">মোবাইল নম্বর</label>
                                        <input required type="tel" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                            placeholder="01XXXXXXXXX" value={setPassForm.mobile}
                                            onChange={(e) => setSetPassForm({ ...setPassForm, mobile: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">আপনার রেফারেল কোড</label>
                                        <input required type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm uppercase"
                                            placeholder="ALAM2024" value={setPassForm.code}
                                            onChange={(e) => setSetPassForm({ ...setPassForm, code: e.target.value.toUpperCase() })} />
                                        <p className="text-xs text-slate-400 mt-1">রেজিস্ট্রেশনের পর পাওয়া কোড</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">নতুন পাসওয়ার্ড</label>
                                        <input required type="password" minLength={6} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                            placeholder="কমপক্ষে ৬ অক্ষর" value={setPassForm.password}
                                            onChange={(e) => setSetPassForm({ ...setPassForm, password: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">পাসওয়ার্ড নিশ্চিত করুন</label>
                                        <input required type="password" minLength={6} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                            placeholder="আবার লিখুন" value={setPassForm.password_confirmation}
                                            onChange={(e) => setSetPassForm({ ...setPassForm, password_confirmation: e.target.value })} />
                                    </div>
                                    <button type="submit" disabled={setting}
                                        className="w-full rounded-xl bg-primary text-white font-bold py-3 hover:opacity-90 transition disabled:opacity-50">
                                        {setting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'পাসওয়ার্ড সেট করুন'}
                                    </button>
                                </>
                            )}
                        </form>
                    )}
                </div>

                <p className="text-center text-sm text-slate-400 mt-4">
                    এখনো পার্টনার না?{' '}
                    <a href="/affiliate" className="text-primary font-semibold hover:underline">রেজিস্ট্রেশন করুন</a>
                </p>
            </div>
        </div>
    );
}
