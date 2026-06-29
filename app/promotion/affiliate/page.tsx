'use client';

import WhatsAppFloat from '@/components/whatsapp-float';
import { trackEvent } from '@/lib/analytics';
import { buildAttribution } from '@/lib/attribution';
import { useRegisterAffiliateMutation } from '@/store/features/affiliate/affiliateApi';
import { ArrowRight, BadgeCheck, Banknote, BarChart3, CheckCircle2, ClipboardCheck, MessageCircle, ShieldCheck, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Navbar from '../components/navbar';
import PromoFooter from '../components/promo-footer';
import PromotionTracker from '../components/promotion-tracker';

const tiers = [
    { name: 'ব্রোঞ্জ', first: '৫০%', recurring: '১০%', unlock: 'যেকোনো আগ্রহী ব্যক্তি শুরু করতে পারবেন' },
    { name: 'সিলভার', first: '৬০%', recurring: '১২%', unlock: '৫টি সক্রিয় কাস্টমার হলে' },
    { name: 'গোল্ড', first: '৭০%', recurring: '১৫%', unlock: '২০টি সক্রিয় কাস্টমার ও রিভিউ হলে' },
    { name: 'প্লাটিনাম', first: '৮০%', recurring: '১৮%', unlock: '৫০+ সক্রিয় কাস্টমার ও অনুমোদন হলে' },
];

const affiliateTypes = [
    { title: 'আইটি সার্ভিস প্রোভাইডার', desc: 'দোকানের কম্পিউটার, প্রিন্টার বা সফটওয়্যার সমস্যা বুঝেন।' },
    { title: 'কম্পিউটার ও হার্ডওয়্যার শপ', desc: 'প্রিন্টার, বারকোড স্ক্যানার বা কম্পিউটার কিনতে আসা দোকানদারদের ডেমো দেখাতে পারবেন।' },
    { title: 'হিসাবরক্ষক বা ব্যবসা পরামর্শদাতা', desc: 'হিসাব, স্টক ও রিপোর্টিং সমস্যার ভাষা সহজে বুঝিয়ে বলতে পারবেন।' },
    { title: 'ফেসবুক/ইউটিউব কনটেন্ট ক্রিয়েটর', desc: 'স্থানীয় ব্যবসায়ী দর্শক থাকলে শিক্ষামূলক কনটেন্ট থেকে আগ্রহী দোকানদার আনতে পারবেন।' },
    { title: 'AndgatePOS ব্যবহার করে সন্তুষ্ট কাস্টমার', desc: 'নিজের অভিজ্ঞতা দিয়ে অন্য দোকানদারকে বাস্তবভাবে বোঝাতে পারবেন।' },
    { title: 'বিশ্ববিদ্যালয় বা ব্যবসায়ী কমিউনিটি', desc: 'নিজের এলাকার দোকান বা ছোট ব্যবসায়ীদের নেটওয়ার্কে নিয়মিত পরিচিতি আছে।' },
];

const steps = [
    { icon: Users, title: 'অ্যাফিলিয়েট হিসেবে রেজিস্টার করুন', desc: 'আপনার নাম, মোবাইল নম্বর, এলাকা এবং কোন ধরনের দোকানদারের সাথে কাজ করতে পারবেন সেটি জানান।' },
    { icon: Sparkles, title: 'AndgatePOS ট্রেনিং নিন', desc: 'বিলিং, স্টক, রিপোর্ট, পেমেন্ট এবং সাবস্ক্রিপশন প্ল্যান কীভাবে বোঝাতে হবে, সেগুলো হাতে-কলমে শিখে নিন।' },
    { icon: BadgeCheck, title: 'দোকানদারের সাথে সরাসরি কথা বলে ডেমো দেখান', desc: 'দোকানের বর্তমান হিসাব, স্টক বা বিলিং সমস্যার সাথে AndgatePOS-এর ব্যবহার মিলিয়ে সহজ ভাষায় লাইভ ডেমো দেখান।' },
    { icon: Banknote, title: 'পেইড সাবস্ক্রিপশন করিয়ে কমিশন পান', desc: 'দোকান মালিক পেইড সাবস্ক্রিপশন নিলে এবং পেমেন্ট যাচাই শেষ হলে আপনার কমিশন যোগ হবে।' },
    {
        icon: ShieldCheck,
        title: 'সাবস্ক্রিপশন চালু রাখতে কাস্টমারের পাশে থাকুন',
        desc: 'সেটআপ, ব্যবহার শেখানো, প্রশ্নের উত্তর এবং নিয়মিত ফলোআপ দিয়ে কাস্টমারকে দীর্ঘমেয়াদে সাবস্ক্রিপশন চালিয়ে যেতে সাহায্য করুন।',
    },
];

const trustPoints = [
    'ট্রেনিং, ডেমো ও সাবস্ক্রিপশন করানোর পরিষ্কার প্রক্রিয়া',
    'শুধু সফল পেইড সাবস্ক্রিপশন পেমেন্টের পর কমিশন',
    '৩০ দিনের যাচাইয়ের সময় শেষে উত্তোলনের সুযোগ',
    'নিজের নামে বা ভুয়া কাস্টমার দেখিয়ে কমিশন নেওয়া যাবে না',
    'অ্যাফিলিয়েট ড্যাশবোর্ডে কাজের অগ্রগতি দেখা যাবে',
];

const heroProof = [
    { value: '৳০', label: 'রেজিস্ট্রেশন ফি' },
    { value: 'লাইভ', label: 'ট্রেনিং ও ডেমো গাইড' },
    { value: '৫০%-৮০%', label: 'প্রথম পেমেন্ট কমিশন' },
];

const afterSubmitSteps = [
    'ফর্ম জমা দেওয়ার পর AndgatePOS টিম আপনার তথ্য যাচাই করবে।',
    '২৪-৪৮ ঘণ্টার মধ্যে WhatsApp বা ফোনে যোগাযোগ করা হবে।',
    'অ্যাপ্রুভ হলে ট্রেনিং, ডেমো গাইড ও অ্যাফিলিয়েট কোড পাবেন।',
    'তারপর দোকানদারকে সরাসরি ডেমো দেখিয়ে পেইড সাবস্ক্রিপশন নিতে সাহায্য করবেন।',
];

const faqs = [
    {
        q: 'রেজিস্ট্রেশন কি ফ্রি?',
        a: 'হ্যাঁ, অ্যাফিলিয়েট হিসেবে রেজিস্ট্রেশন ফ্রি। কোনো যোগদান ফি নেই।',
    },
    {
        q: 'কমিশন কখন পাব?',
        a: 'দোকানদার পেইড সাবস্ক্রিপশন নিলে, পেমেন্ট যাচাই ও নির্ধারিত যাচাই সময় শেষ হলে কমিশন যোগ হবে।',
    },
    {
        q: 'ট্রেনিং কীভাবে হবে?',
        a: 'অ্যাপ্রুভালের পর AndgatePOS টিম আপনাকে POS ডেমো, দোকানদারকে বোঝানোর স্ক্রিপ্ট এবং সাবস্ক্রিপশন প্রসেস দেখাবে।',
    },
    {
        q: 'নিজের দোকান বা ভুয়া সাইনআপে কমিশন পাব?',
        a: 'না। কমিশন শুধুমাত্র বাস্তব দোকানদারের সফল পেইড সাবস্ক্রিপশনের জন্য প্রযোজ্য।',
    },
];

const affiliateProgramSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AndgatePOS Affiliate Program',
    url: 'https://andgatepos.com/promotion/affiliate',
    description: 'Affiliate program for Bangladesh where approved affiliates get training, show AndgatePOS demos to shop owners, and earn commission from verified paid subscriptions.',
    provider: {
        '@type': 'Organization',
        name: 'Andgate Technologies',
        url: 'https://andgatepos.com',
    },
    areaServed: {
        '@type': 'Country',
        name: 'Bangladesh',
    },
    audience: {
        '@type': 'Audience',
        audienceType: 'IT service providers, accountants, hardware sellers, content creators, satisfied customers, and local business community members',
    },
};

const affiliateFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
        },
    })),
};

export default function AffiliatePromotionPage() {
    const searchParams = useSearchParams();
    const attribution = buildAttribution(searchParams, {
        source: searchParams.get('source') || 'promotion_affiliate',
        campaign: 'affiliate_landing',
    });
    const [formData, setFormData] = useState({ name: '', mobile: '', email: '', type: 'other', bkash_number: '', network_description: '', parent_code: '' });
    const [success, setSuccess] = useState<any>(null);
    const [registerAffiliate, { isLoading, error }] = useRegisterAffiliateMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            trackEvent('affiliate_register_submit', 'Lead', {
                content_name: 'Affiliate Registration',
                source: 'promotion_affiliate',
                user_data: {
                    email: formData.email,
                    phone: formData.mobile,
                },
            });
            const res = await registerAffiliate({ ...formData, ...attribution }).unwrap();
            setSuccess(res.data);
            trackEvent('affiliate_register_success', 'AffiliateRegistration', {
                content_name: 'Affiliate Registration',
                status: true,
                user_data: {
                    email: formData.email,
                    phone: formData.mobile,
                },
            });
        } catch {}
    };

    return (
        <div className="flex min-h-screen flex-col bg-white text-slate-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(affiliateProgramSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(affiliateFaqSchema) }} />
            <PromotionTracker />
            <div className="hidden sm:block">
                <WhatsAppFloat />
            </div>
            <Navbar />

            <main className="flex flex-1 flex-col pt-16">
                <section className="relative overflow-hidden bg-[#022d45] px-4 py-16 text-white sm:px-6 sm:py-24">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(135deg, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                    <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                        <div>
                            <span className="inline-flex rounded-full border border-[#e79237]/50 bg-[#e79237]/15 px-4 py-1.5 text-sm font-bold text-[#ffd29f]">AndgatePOS Affiliate Program</span>
                            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">দোকানদারকে ডেমো দেখান, পেইড সাবস্ক্রিপশন থেকে কমিশন পান</h1>
                            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                                বাংলাদেশের দোকানগুলো এখন খাতার হিসাব ছেড়ে ডিজিটাল বিলিং, স্টক কন্ট্রোল ও পরিষ্কার রিপোর্টের দিকে যাচ্ছে। আপনি ট্রেনিং নিয়ে দোকানদারের সাথে সরাসরি কথা বলবেন, ডেমো
                                দেখাবেন, পেইড সাবস্ক্রিপশন নিতে সাহায্য করবেন এবং ব্যবহার চালু রাখতে পাশে থাকবেন।
                            </p>
                            <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
                                {heroProof.map((item) => (
                                    <div key={item.label} className="rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                                        <p className="text-xl font-black text-white">{item.value}</p>
                                        <p className="mt-1 text-xs font-semibold text-slate-300">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 grid max-w-2xl gap-3 text-sm sm:grid-cols-2">
                                {trustPoints.map((point) => (
                                    <div key={point} className="flex items-start gap-2 rounded-lg bg-white/10 px-3 py-2 text-slate-100">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#e79237]" />
                                        <span>{point}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href="#register-section"
                                    onClick={() => trackEvent('affiliate_hero_register_click', 'Lead', { section: 'hero', content_name: 'Affiliate Registration CTA' })}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e79237] px-6 py-3 font-bold text-white shadow-lg transition hover:bg-[#d17b24]"
                                >
                                    ফ্রিতে অ্যাফিলিয়েট হিসেবে রেজিস্টার করুন
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                                <Link
                                    href="/affiliate/calculator"
                                    onClick={() => trackEvent('affiliate_calculator_click', 'ViewContent', { section: 'hero', content_name: 'Affiliate Calculator' })}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/15"
                                >
                                    কমিশন হিসাব করুন
                                    <BarChart3 className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="border-white/12 bg-white/8 rounded-2xl border p-5 shadow-2xl backdrop-blur">
                            <div className="rounded-xl bg-white p-5 text-slate-900">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#046ca9]/10 text-[#046ca9]">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">প্রথম পেমেন্টে কমিশন</p>
                                        <p className="text-3xl font-black text-[#046ca9]">৫০%-৮০%</p>
                                    </div>
                                </div>
                                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <p className="font-bold">৳০</p>
                                        <p className="text-slate-500">যোগদান ফি</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <p className="font-bold">৩০ দিন</p>
                                        <p className="text-slate-500">যাচাই সময়</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <p className="font-bold">৳৫০০</p>
                                        <p className="text-slate-500">ন্যূনতম উত্তোলন</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <p className="font-bold">bKash</p>
                                        <p className="text-slate-500">পেমেন্ট মাধ্যম</p>
                                    </div>
                                </div>
                                <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                                    কমিশন শুধুমাত্র বাস্তব দোকানদারের সফল পেইড সাবস্ক্রিপশন, পেমেন্ট যাচাই এবং নীতিমালা পূরণের পর প্রযোজ্য। নির্দিষ্ট আয়ের নিশ্চয়তা নেই।
                                </p>
                                <a
                                    href="#register-section"
                                    onClick={() => trackEvent('affiliate_card_register_click', 'Lead', { section: 'hero_card', content_name: 'Affiliate Registration CTA' })}
                                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#046ca9] px-5 py-3 font-bold text-white transition hover:bg-[#035887]"
                                >
                                    এখনই ফ্রি রেজিস্ট্রেশন
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white px-4 py-14 sm:px-6">
                    <div className="mx-auto max-w-6xl">
                        <div className="max-w-2xl">
                            <p className="text-sm font-bold uppercase tracking-wider text-[#046ca9]">কারা যোগ দিতে পারবেন</p>
                            <h2 className="mt-2 text-3xl font-black text-slate-950">যাদের জন্য AndgatePOS অ্যাফিলিয়েট প্রোগ্রাম ভালো</h2>
                            <p className="mt-3 text-slate-600">
                                অপরিচিত মানুষকে ফোন করার দরকার নেই। আপনার পরিচিত ব্যবসায়ীদের হিসাব, স্টক বা বিলিংয়ের সমস্যা বুঝে তাদের জন্য AndgatePOS সমাধান হিসেবে পরিচয় করিয়ে দিন।
                            </p>
                        </div>
                        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {affiliateTypes.map((type) => (
                                <div key={type.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                                        <span className="font-bold text-slate-950">{type.title}</span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">{type.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-slate-50 px-4 py-14 sm:px-6">
                    <div className="mx-auto max-w-6xl">
                        <div className="text-center">
                            <p className="text-sm font-bold uppercase tracking-wider text-[#046ca9]">কমিশন টিয়ার</p>
                            <h2 className="mt-2 text-3xl font-black text-slate-950">সহজ নিয়ম, পরিষ্কার কমিশন, কোনো মিথ্যা প্রতিশ্রুতি নয়</h2>
                            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                                আপনার আনা ও ধরে রাখা সক্রিয় কাস্টমার বাড়লে কমিশন রেটও বাড়বে। বার্ষিক প্যাকেজের ক্ষেত্রে ব্যবসাকে টেকসই রাখতে নির্দিষ্ট কমিশন সীমা প্রযোজ্য।
                            </p>
                        </div>
                        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {tiers.map((tier) => (
                                <div key={tier.name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <h3 className="text-xl font-black text-slate-950">{tier.name}</h3>
                                    <p className="mt-1 min-h-10 text-sm text-slate-500">{tier.unlock}</p>
                                    <div className="mt-5 space-y-3">
                                        <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
                                            <span className="text-sm text-emerald-800">প্রথম পেমেন্ট</span>
                                            <span className="font-black text-emerald-700">{tier.first}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg bg-[#046ca9]/10 px-3 py-2">
                                            <span className="text-sm text-[#035887]">রিনিউ হলে কমিশন</span>
                                            <span className="font-black text-[#046ca9]">{tier.recurring}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mx-auto mt-5 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold leading-6 text-amber-900">
                            কমিশন কোনো বেতন বা নিশ্চিত আয় নয়। কমিশন যোগ হবে শুধু যাচাইকৃত পেইড সাবস্ক্রিপশন থেকে।
                        </p>
                    </div>
                </section>

                <section className="bg-white px-4 py-14 sm:px-6">
                    <div className="mx-auto max-w-5xl">
                        <div className="text-center">
                            <p className="text-sm font-bold uppercase tracking-wider text-[#046ca9]">কীভাবে কাজ করে</p>
                            <h2 className="mt-2 text-3xl font-black text-slate-950">ট্রেনিং থেকে কাস্টমার ফলোআপ পর্যন্ত কাজের ধাপ</h2>
                        </div>
                        <div className="mt-10 grid gap-5 md:grid-cols-2">
                            {steps.map(({ icon: Icon, title, desc }, index) => (
                                <div key={title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#046ca9] text-white">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-[#e79237]">ধাপ {index + 1}</p>
                                        <h3 className="mt-1 text-lg font-black">{title}</h3>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-slate-50 px-4 py-14 sm:px-6">
                    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wider text-[#046ca9]">দোকানদারকে কী বলবেন</p>
                            <h2 className="mt-2 text-3xl font-black text-slate-950">সহজ ভাষায় সমস্যা ধরুন, তারপর সমাধান দেখান</h2>
                            <p className="mt-3 leading-7 text-slate-600">
                                “আপনার দোকানে কি এখনো খাতায় হিসাব রাখেন? AndgatePOS দিয়ে মোবাইলে বিলিং, স্টক অ্যালার্ট, লাভের রিপোর্ট আর কর্মচারীর বিক্রির হিসাব একসাথে দেখতে পারবেন।”
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {['রিটেইল দোকান', 'ফার্মেসি', 'ফ্যাশন শপ', 'মুদি দোকান', 'ইলেকট্রনিক্স দোকান', 'পাইকারি ব্যবসা'].map((segment) => (
                                <div key={segment} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <p className="font-black text-slate-950">{segment}</p>
                                    <p className="mt-1 text-sm text-slate-500">বিলিং, স্টক, বাকি টাকা ও লাভের রিপোর্টের সমস্যা নিয়ে কথা শুরু করুন।</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="register" className="scroll-mt-20 bg-white px-4 py-14 sm:px-6">
                    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1fr] lg:items-start">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wider text-[#046ca9]">অ্যাফিলিয়েট রেজিস্ট্রেশন</p>
                            <h2 className="mt-2 text-3xl font-black text-slate-950">ফ্রিতে অ্যাফিলিয়েট হিসেবে রেজিস্টার করুন</h2>
                            <p className="mt-3 max-w-xl text-slate-600">বিনামূল্যে রেজিস্ট্রেশন করুন, ট্রেনিং নিন এবং দোকানদারদের ডিজিটাল বিলিংয়ে সাহায্য করে কমিশন আয় করুন।</p>

                            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#046ca9]/10 text-[#046ca9]">
                                        <ClipboardCheck className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-950">ফর্ম জমা দেওয়ার পর কী হবে?</h3>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {afterSubmitSteps.map((step, index) => (
                                        <div key={step} className="flex gap-3">
                                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">{index + 1}</span>
                                            <p className="text-sm leading-6 text-slate-600">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 rounded-xl border border-[#25d366]/30 bg-[#25d366]/10 p-4">
                                <div className="flex gap-3">
                                    <MessageCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#128c4e]" />
                                    <div>
                                        <p className="font-bold text-slate-950">তথ্য সঠিক দিন</p>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">ভুল মোবাইল নম্বর, ভুয়া কাস্টমার বা নিজের নামে কাস্টমার তৈরি করলে অ্যাকাউন্ট বাতিল হতে পারে।</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="register-section" className="mt-8 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
                            {success ? (
                                <div className="py-6 text-center">
                                    <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
                                    <h3 className="text-xl font-black text-slate-950">রেজিস্ট্রেশন সফল হয়েছে!</h3>
                                    <p className="mt-2 text-slate-500">আপনার অ্যাফিলিয়েট কোড</p>
                                    <div className="mx-auto mt-3 w-fit rounded-xl bg-[#046ca9]/10 px-8 py-3 text-2xl font-black tracking-widest text-[#046ca9]">{success.code}</div>
                                    {success.promo_code && (
                                        <p className="mt-3 text-sm text-slate-500">
                                            প্রমো কোড: <strong className="text-slate-800">{success.promo_code}</strong>
                                        </p>
                                    )}
                                    {success.ref_link && <div className="mt-3 break-all rounded-lg bg-slate-50 px-4 py-2 text-xs text-slate-600">রেফারেল লিংক: {success.ref_link}</div>}
                                    <Link href="/affiliate/portal" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#046ca9] px-6 py-2.5 font-bold text-white transition hover:opacity-90">
                                        অ্যাফিলিয়েট পোর্টালে যান <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (
                                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                                            {(error as any)?.data?.message || 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।'}
                                        </div>
                                    )}

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                                                পুরো নাম <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                required
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#046ca9] focus:ring-1 focus:ring-[#046ca9]"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="আপনার পুরো নাম লিখুন"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                                                মোবাইল নম্বর <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                required
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#046ca9] focus:ring-1 focus:ring-[#046ca9]"
                                                value={formData.mobile}
                                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                                placeholder="01XXXXXXXXX"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">bKash নম্বর</label>
                                            <input
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#046ca9] focus:ring-1 focus:ring-[#046ca9]"
                                                value={formData.bkash_number}
                                                onChange={(e) => setFormData({ ...formData, bkash_number: e.target.value })}
                                                placeholder="01XXXXXXXXX"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">ইমেইল</label>
                                            <input
                                                type="email"
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#046ca9] focus:ring-1 focus:ring-[#046ca9]"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="email@example.com"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">আপনি কোন ধরনের অ্যাফিলিয়েট?</label>
                                            <select
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#046ca9] focus:ring-1 focus:ring-[#046ca9]"
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                <option value="it_bhai">IT ভাই (কম্পিউটার সার্ভিস)</option>
                                                <option value="accountant">হিসাব ভাই (অ্যাকাউন্ট্যান্ট)</option>
                                                <option value="hardware_seller">হার্ডওয়্যার বিক্রেতা</option>
                                                <option value="content_creator">কন্টেন্ট ক্রিয়েটর</option>
                                                <option value="happy_customer">সন্তুষ্ট কাস্টমার</option>
                                                <option value="ngo_officer">NGO/MFI অফিসার</option>
                                                <option value="university_ambassador">ইউনিভার্সিটি স্টুডেন্ট</option>
                                                <option value="other">অন্যান্য</option>
                                            </select>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">আপনার নেটওয়ার্ক সম্পর্কে বলুন</label>
                                            <textarea
                                                rows={2}
                                                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#046ca9] focus:ring-1 focus:ring-[#046ca9]"
                                                value={formData.network_description}
                                                onChange={(e) => setFormData({ ...formData, network_description: e.target.value })}
                                                placeholder="যেমন: আমি মিরপুরে ৫০টি দোকানে IT সেবা দিই"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">রেফারেল কোড</label>
                                            <input
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-[#046ca9] focus:ring-1 focus:ring-[#046ca9]"
                                                value={formData.parent_code}
                                                onChange={(e) => setFormData({ ...formData, parent_code: e.target.value.toUpperCase() })}
                                                placeholder="ALAM2024 (যদি কেউ রেফার করে থাকে)"
                                            />
                                            <p className="mt-1 text-xs text-slate-400">রেফারেল কোড না থাকলে খালি রাখুন</p>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-[#046ca9] py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-60">
                                        {isLoading ? 'অপেক্ষা করুন...' : 'ফ্রিতে অ্যাফিলিয়েট হিসেবে রেজিস্টার করুন'}
                                    </button>
                                    <p className="text-center text-xs font-semibold text-slate-500">রেজিস্ট্রেশনের পর সাধারণত ২৪-৪৮ ঘণ্টার মধ্যে যোগাযোগ করা হবে।</p>
                                    <p className="text-center text-xs text-slate-400">
                                        রেজিস্টার করলে আপনি AndgatePOS-এর{' '}
                                        <Link href="/affiliate/policies" className="text-[#046ca9] underline">
                                            অ্যাফিলিয়েট নীতিমালা
                                        </Link>
                                        -তে সম্মত হচ্ছেন।
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </section>

                <section className="bg-slate-50 px-4 py-14 sm:px-6">
                    <div className="mx-auto max-w-5xl">
                        <div className="text-center">
                            <p className="text-sm font-bold uppercase tracking-wider text-[#046ca9]">প্রশ্নোত্তর</p>
                            <h2 className="mt-2 text-3xl font-black text-slate-950">অ্যাফিলিয়েট হওয়ার আগে সাধারণ প্রশ্ন</h2>
                        </div>
                        <div className="mt-8 grid gap-4 md:grid-cols-2">
                            {faqs.map((faq) => (
                                <div key={faq.q} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <h3 className="font-black text-slate-950">{faq.q}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-[#046ca9] px-4 py-14 text-center text-white sm:px-6">
                    <h2 className="text-3xl font-black">আজই AndgatePOS অ্যাফিলিয়েট প্রোগ্রাম শুরু করুন</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-white/80">বাস্তব দোকানদারের সাথে সরাসরি কাজ, পরিষ্কার কমিশন ট্র্যাকিং এবং বাংলাদেশের জন্য সহজ পেমেন্ট প্রক্রিয়া।</p>
                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                        <a
                            href="#register-section"
                            onClick={() => trackEvent('affiliate_bottom_register_click', 'Lead', { section: 'bottom_cta', content_name: 'Affiliate Registration CTA' })}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 font-bold text-[#046ca9] transition hover:bg-slate-100"
                        >
                            ফ্রিতে অ্যাফিলিয়েট হিসেবে রেজিস্টার করুন
                            <ArrowRight className="h-4 w-4" />
                        </a>
                        <Link
                            href="/affiliate/policies"
                            onClick={() => trackEvent('affiliate_policy_click', 'ViewContent', { section: 'bottom_cta', content_name: 'Affiliate Policies' })}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-7 py-3 font-bold text-white transition hover:bg-white/10"
                        >
                            নীতিমালা দেখুন
                            <ShieldCheck className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            </main>

            <div className="fixed inset-x-0 bottom-0 z-[60] grid grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur sm:hidden">
                <a
                    href="#register-section"
                    onClick={() => trackEvent('affiliate_mobile_sticky_register_click', 'Lead', { section: 'mobile_sticky', content_name: 'Affiliate Registration CTA' })}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#e79237] px-4 py-3 text-sm font-black text-white"
                >
                    রেজিস্টার
                    <ArrowRight className="h-4 w-4" />
                </a>
                <a
                    href="https://wa.me/8801577303608?text=%E0%A6%86%E0%A6%AE%E0%A6%BF%20AndgatePOS%20%E0%A6%85%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%AB%E0%A6%BF%E0%A6%B2%E0%A6%BF%E0%A6%AF%E0%A6%BC%E0%A7%87%E0%A6%9F%20%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A7%8B%E0%A6%97%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%AE%20%E0%A6%B8%E0%A6%AE%E0%A7%8D%E0%A6%AA%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A7%87%20%E0%A6%9C%E0%A6%BE%E0%A6%A8%E0%A6%A4%E0%A7%87%20%E0%A6%9A%E0%A6%BE%E0%A6%87"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('affiliate_mobile_sticky_whatsapp_click', 'Contact', { section: 'mobile_sticky' })}
                    className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-black text-green-700"
                    aria-label="WhatsApp support"
                >
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp
                </a>
            </div>

            <PromoFooter />
        </div>
    );
}
