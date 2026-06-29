'use client';

import SearchableStoreType from '@/components/common/SearchableStoreType';
import { trackEvent } from '@/lib/analytics';
import { AUTH_TOKEN_EXPIRES_AT_COOKIE, AUTH_TOKEN_EXPIRES_AT_KEY, getCookieMaxAgeFromExpiry, getLoginTokenExpiresAt, isTokenExpired, setAuthCookie } from '@/lib/auth-session';
import { buildAttribution } from '@/lib/attribution';
import { RootState } from '@/store';
import { useRegisterMutation } from '@/store/features/auth/authApi';
import { login } from '@/store/features/auth/authSlice';
import { CheckCircle2, ClipboardCheck, Loader2, Phone, ShieldCheck, Star } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const benefits = [
    { text: 'ফ্রি প্ল্যানে শুরু করা যায় — কোনো কার্ড লাগবে না' },
    { text: 'দোকানের পণ্য, স্টক ও বিক্রির হিসাব এক জায়গায়' },
    { text: 'ফর্ম পূরণ করলেই ড্যাশবোর্ডে ঢুকে সফটওয়্যার দেখতে পারবেন' },
    { text: 'bKash/Nagad/Cash, বাকি ও লাভ-লস রিপোর্ট পরিষ্কার দেখা যায়' },
    { text: 'মোবাইল দিয়েই বিলিং ও রিপোর্ট দেখা যাবে' },
    { text: '১৪ দিন পছন্দ না হলে পুরো টাকা ফেরত' },
    { text: 'বাংলায় সাপোর্ট পাবেন' },
];

const nextSteps = ['ফর্ম পূরণ করলেই আপনার POS অ্যাকাউন্ট তৈরি হবে', 'আপনি সরাসরি ড্যাশবোর্ডে ঢুকে মেনু, রিপোর্ট ও POS দেখে নিতে পারবেন', 'মোবাইল বা ল্যাপটপ থেকে পণ্য যোগ করে বিল করা শুরু করতে পারবেন', 'প্রয়োজন হলে AndgatePOS টিম সেটআপে সাহায্য করবে'];

export default function PromoRegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [registerApi, { isLoading }] = useRegisterMutation();
    const attribution = useMemo(
        () =>
            buildAttribution(searchParams, {
                source: searchParams.get('source') || 'promotion_pos',
                campaign: 'pos_landing',
            }),
        [searchParams]
    );
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        store_name: '',
        store_type: 'retail',
    });

    const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

    const generatedPassword = () => {
        const phoneDigits = form.phone.replace(/\D/g, '').slice(-6) || '123456';
        return `Ag${phoneDigits}!`;
    };

    const submitForm = async (e: FormEvent) => {
        e.preventDefault();

        if (isAuthenticated) {
            router.push('/dashboard');
            return;
        }

        try {
            trackEvent('promo_register_submit', 'Lead', {
                content_name: 'POS Trial Registration',
                source: 'promotion_pos',
                user_data: {
                    email: form.email,
                    phone: form.phone,
                },
            });

            const password = generatedPassword();
            const result = await registerApi({
                ...form,
                ...attribution,
                password,
                password_confirmation: password,
            }).unwrap();
            const { user, token, permissions } = result.data;
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
                } catch {
                    return btoa('[]');
                }
            })();

            setAuthCookie('token', token, maxAge);
            setAuthCookie('role', user.role, maxAge);
            setAuthCookie('permissions', encodedPermissions, maxAge);
            setAuthCookie(AUTH_TOKEN_EXPIRES_AT_COOKIE, validTokenExpiresAt, maxAge);
            localStorage.setItem(AUTH_TOKEN_EXPIRES_AT_KEY, validTokenExpiresAt);
            dispatch(login({ user, token, tokenExpiresAt: validTokenExpiresAt, permissions }));

            trackEvent('promo_register_success', 'CompleteRegistration', {
                content_name: 'POS Trial Registration',
                status: true,
                user_data: {
                    email: form.email,
                    phone: form.phone,
                },
            });
            toast.success('ফ্রি POS অ্যাকাউন্ট তৈরি হয়েছে। ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...');
            setTimeout(() => router.push('/dashboard'), 700);
        } catch (error: any) {
            const message =
                error?.data?.message ||
                error?.data?.errors?.email?.[0] ||
                error?.data?.errors?.phone?.[0] ||
                error?.data?.errors?.store_name?.[0] ||
                'Registration failed. Please try again.';
            toast.error(message);
        }
    };

    return (
        <section id="register" className="scroll-mt-16 bg-gradient-to-br from-primary/5 via-white to-blue-50/40 py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:items-center">
                    {/* Left — sales pitch */}
                    <div className="flex flex-col justify-center text-center lg:text-left">
                        {/* Urgency badge */}
                        <div className="mx-auto mb-5 inline-flex w-max items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 lg:mx-0">
                            <span className="flex h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                            <span className="text-sm font-bold text-orange-600">এখন সেটআপ ফি লাগবে না</span>
                        </div>

                        <h2 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                            খাতা ছেড়ে ডিজিটাল হিসাব শুরু করুন —
                            <br />
                            <span className="text-primary">দোকানের হিসাব পরিষ্কার করুন</span>
                        </h2>

                        <p className="mb-8 text-base leading-relaxed text-gray-600">নিচে তথ্য দিন। ফ্রি অ্যাকাউন্ট খুলে সঙ্গে সঙ্গে ড্যাশবোর্ডে ঢুকে বিলিং, স্টক আর রিপোর্ট দেখে নিন।</p>

                        <ul className="mx-auto space-y-3 lg:mx-0">
                            {benefits.map((b, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                                    <span className="text-sm font-medium text-gray-700">{b.text}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-left">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <ClipboardCheck className="h-5 w-5" />
                                </div>
                                <h3 className="text-base font-extrabold text-gray-900">ফর্ম দেওয়ার পর কী হবে?</h3>
                            </div>
                            <div className="space-y-3">
                                {nextSteps.map((step, index) => (
                                    <div key={step} className="flex gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{index + 1}</span>
                                        <p className="text-sm leading-6 text-gray-700">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mini testimonial */}
                        <div className="mt-10 flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-700 text-sm font-bold text-white">রম</div>
                            <div>
                                <div className="mb-1 flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-sm italic text-gray-600">&quot;শুরু করার পর থেকে প্রতিদিনের হিসাব নিয়ে আর কোনো চিন্তা নেই।&quot;</p>
                                <p className="mt-1 text-xs font-bold text-gray-800">
                                    রোকন মন্ডল <span className="font-normal text-gray-400">· মন্ডল এন্টারপ্রাইজ, ঢাকা</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right — form */}
                    <div id="register-section" className="relative mx-auto w-full max-w-md scroll-mt-24">
                        <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-r from-primary to-blue-400 opacity-25 blur-2xl" />
                        <div className="relative rounded-2xl border border-gray-100 bg-white p-7 shadow-2xl">
                            <div className="mb-6 text-center">
                                <h3 className="mb-1 text-xl font-extrabold text-gray-900">ফ্রি POS অ্যাকাউন্ট খুলুন</h3>
                                <p className="text-sm text-gray-500">নিচের তথ্যগুলো দিয়ে এখনই শুরু করুন</p>
                            </div>

                            <form className="space-y-4" onSubmit={submitForm}>
                                <div>
                                    <label className="mb-1 block text-sm font-bold text-gray-700">আপনার নাম</label>
                                    <input required value={form.name} onChange={(e) => update('name', e.target.value)} className="form-input" placeholder="যেমন: রহিম উদ্দিন" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-bold text-gray-700">মোবাইল নম্বর</label>
                                    <input required value={form.phone} onChange={(e) => update('phone', e.target.value)} type="tel" className="form-input" placeholder="01XXXXXXXXX" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-bold text-gray-700">ইমেইল</label>
                                    <input required value={form.email} onChange={(e) => update('email', e.target.value)} type="email" className="form-input" placeholder="আপনার ইমেইল" />
                                    <p className="mt-1 text-xs text-gray-400">লগইন ও অ্যাকাউন্ট রিকভারি জন্য লাগবে।</p>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-bold text-gray-700">দোকানের নাম</label>
                                    <input required value={form.store_name} onChange={(e) => update('store_name', e.target.value)} className="form-input" placeholder="যেমন: মদিনা স্টোর" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-bold text-gray-700">দোকানের ধরন</label>
                                    <SearchableStoreType value={form.store_type} onChange={(value) => update('store_type', value)} />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] py-3 text-sm font-black text-white shadow-[0_10px_20px_-10px_rgba(4,108,169,0.44)] transition-all hover:from-[#034d79] hover:to-[#02395b] disabled:opacity-60"
                                >
                                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    ১ মিনিটে ফ্রি ট্রায়াল শুরু করুন
                                </button>
                                <a
                                    href="https://wa.me/8801577303608?text=%E0%A6%86%E0%A6%AE%E0%A6%BF%20AndgatePOS%20%E0%A6%AB%E0%A7%8D%E0%A6%B0%E0%A6%BF%20%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%AF%E0%A6%BC%E0%A6%BE%E0%A6%B2%20%E0%A6%B6%E0%A7%81%E0%A6%B0%E0%A7%81%20%E0%A6%95%E0%A6%B0%E0%A6%A4%E0%A7%87%20%E0%A6%9A%E0%A6%BE%E0%A6%87"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackEvent('promo_whatsapp_click', 'Contact', { section: 'register_form' })}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 py-3 text-sm font-bold text-green-700"
                                >
                                    <Phone className="h-4 w-4" />
                                    WhatsApp-এ সেটআপ সহায়তা নিন
                                </a>
                            </form>

                            {/* Trust strip */}
                            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                                SSL সুরক্ষিত · ব্যাংক-মানের নিরাপত্তা · তথ্য গোপনীয়
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
