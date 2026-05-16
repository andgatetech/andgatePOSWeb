'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import {
    useLoginAffiliateAdminMutation,
    setAffiliateAdminToken,
    getAffiliateAdminToken,
} from '@/store/features/affiliate/affiliateAdminApi';

export default function AffiliateAdminLoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);

    const [loginAdmin, { isLoading, error }] = useLoginAffiliateAdminMutation();

    useEffect(() => {
        if (getAffiliateAdminToken()) router.replace('/affiliate/admin');
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await loginAdmin(form).unwrap();
            setAffiliateAdminToken(res.data.token);
            router.push('/affiliate/admin');
        } catch {}
    };

    return (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-4">
                        <ShieldCheck className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">অ্যাফিলিয়েট অ্যাডমিন লগইন</h1>
                    <p className="text-slate-500 text-sm mt-1">অ্যাডমিন প্যানেলে প্রবেশ করুন</p>
                </div>

                <div className="rounded-2xl bg-white shadow-md border border-slate-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-sm text-danger">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {(error as any)?.data?.message || 'ইমেইল বা পাসওয়ার্ড ভুল।'}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">ইমেইল</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    required type="email"
                                    className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary"
                                    placeholder="admin@example.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit" disabled={isLoading}
                            className="w-full rounded-xl bg-primary text-white font-bold py-3 hover:opacity-90 transition disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'লগইন করুন'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-slate-400 mt-4">
                    <a href="/affiliate" className="text-primary font-semibold hover:underline">← অ্যাফিলিয়েট হোম</a>
                </p>
            </div>
        </div>
    );
}
