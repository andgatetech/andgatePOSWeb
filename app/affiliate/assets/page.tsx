'use client';

import { useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Copy, FileText, Image, MessageSquare, Phone, Share2, ShieldCheck, XCircle } from 'lucide-react';
import { getTranslation } from '@/i18n';

const WHATSAPP_NUMBER = '8801577303608';

const WHATSAPP_SCRIPTS = [
    {
        title: 'গ্রোসারি / মুদি দোকান',
        audience: 'স্টক, বাকি ও দৈনিক বিক্রি',
        bg: 'bg-blue-50 border-blue-200',
        tag: 'bg-blue-100 text-blue-700',
        text: 'ভাই, আপনার দোকানে কোন পণ্য কত স্টক আছে, কার কাছে কত বাকি আছে, আর আজ কত বিক্রি হলো — সব একসাথে দেখা গেলে হিসাব রাখা সহজ হয়। AndgatePOS দিয়ে বিলিং, স্টক, বাকি, পেমেন্ট ও রিপোর্ট একসাথে ম্যানেজ করা যায়।\n\nআমি AndgatePOS অ্যাফিলিয়েট হিসেবে রেফার করছি। চাইলে ১৪ দিনের ফ্রি ট্রায়াল দেখাতে পারি।',
    },
    {
        title: 'ফার্মেসি',
        audience: 'মেয়াদ, স্টক ও দ্রুত বিল',
        bg: 'bg-green-50 border-green-200',
        tag: 'bg-green-100 text-green-700',
        text: 'ভাই, ফার্মেসিতে স্টক, সেলস রিপোর্ট আর দ্রুত বিলিং ঠিক না থাকলে লাভ-লোকসান বোঝা কঠিন হয়। AndgatePOS দিয়ে পণ্য, স্টক, বিক্রি, কাস্টমার বাকি ও রিপোর্ট একসাথে রাখা যায়।\n\nআমি AndgatePOS অ্যাফিলিয়েট হিসেবে রেফার করছি। চাইলে আপনার দোকানের ধরন অনুযায়ী ডেমো দেখাতে পারি।',
    },
    {
        title: 'কাপড় / ফ্যাশন শপ',
        audience: 'ভ্যারিয়েন্ট, বাকি ও রিপোর্ট',
        bg: 'bg-amber-50 border-amber-200',
        tag: 'bg-amber-100 text-amber-700',
        text: 'ভাই, কাপড়ের দোকানে সাইজ, কালার, স্টক আর বাকি হিসাব আলাদা খাতায় রাখলে ভুল হওয়ার সুযোগ থাকে। AndgatePOS দিয়ে বিক্রি, স্টক, পেমেন্ট, বাকি ও রিপোর্ট একসাথে দেখা যায়।\n\nআমি AndgatePOS অ্যাফিলিয়েট হিসেবে রেফার করছি। আপনার দোকানে কাজে লাগবে কিনা, আগে ফ্রি ট্রায়ালে দেখে নিতে পারেন।',
    },
    {
        title: 'ইলেকট্রনিক্স / হার্ডওয়্যার',
        audience: 'দাম, স্টক ও কাস্টমার হিসাব',
        bg: 'bg-purple-50 border-purple-200',
        tag: 'bg-purple-100 text-purple-700',
        text: 'ভাই, ইলেকট্রনিক্স/হার্ডওয়্যার দোকানে পণ্যের দাম, স্টক, কাস্টমারের বাকি ও পেমেন্ট ট্র্যাক রাখা খুব জরুরি। AndgatePOS দিয়ে বিলিং, স্টক, রিপোর্ট ও কাস্টমার হিসাব এক জায়গায় রাখা যায়।\n\nআমি AndgatePOS অ্যাফিলিয়েট হিসেবে রেফার করছি। চাইলে ডেমো বুক করে দিতে পারি।',
    },
    {
        title: 'রেস্টুরেন্ট / ফাস্টফুড',
        audience: 'অর্ডার, ক্যাশ ও রিপোর্ট',
        bg: 'bg-teal-50 border-teal-200',
        tag: 'bg-teal-100 text-teal-700',
        text: 'ভাই, রেস্টুরেন্টে অর্ডার, ক্যাশ, দৈনিক বিক্রি আর রিপোর্ট ঠিকমতো না থাকলে ম্যানেজ করা কঠিন হয়। AndgatePOS দিয়ে বিক্রি, পেমেন্ট, রিপোর্ট এবং অনলাইন অর্ডার একসাথে দেখা যায়।\n\nআমি AndgatePOS অ্যাফিলিয়েট হিসেবে রেফার করছি। চাইলে ১৪ দিনের ফ্রি ট্রায়াল দিয়ে শুরু করা যায়।',
    },
    {
        title: 'আইটি / অ্যাকাউন্টিং সার্ভিস',
        audience: 'ক্লায়েন্ট সাপোর্ট',
        bg: 'bg-rose-50 border-rose-200',
        tag: 'bg-rose-100 text-rose-700',
        text: 'আপনার যেসব দোকানদার ক্লায়েন্ট হিসাব, স্টক বা বিলিং নিয়ে সমস্যায় আছেন, তাদের AndgatePOS দেখাতে পারেন। তারা সফটওয়্যার ব্যবহার করলে আপনার হিসাব/সাপোর্ট কাজও সহজ হবে।\n\nআমি AndgatePOS অ্যাফিলিয়েট হিসেবে রেফার করছি। সফল পেইড সাবস্ক্রিপশন হলে নীতিমালা অনুযায়ী কমিশন প্রযোজ্য।',
    },
];

const PHYSICAL_ASSETS = [
    {
        title: 'প্রিন্টযোগ্য ব্রোশার',
        icon: FileText,
        color: 'text-primary',
        bg: 'bg-primary/10',
        note: 'A4 ও A5 সাইজে বাংলা ব্রোশার — ফার্মেসি, গার্মেন্টস, গ্রোসারি, সাধারণ সংস্করণ',
    },
    {
        title: 'Facebook / WhatsApp ব্যানার',
        icon: Image,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        note: 'পোস্ট ব্যানার, WhatsApp স্ট্যাটাস (৯:১৬), কমিশন ইনফোগ্রাফিক',
    },
    {
        title: 'কেস স্টাডি কার্ড',
        icon: Share2,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        note: 'QR কোড সহ রিয়েল কাস্টমারের সাফল্যের গল্প — A5 প্রিন্টযোগ্য',
    },
];

const COMPLIANCE_RULES = [
    {
        icon: CheckCircle2,
        title: 'বলতে পারবেন',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50 border-emerald-200',
        items: [
            'বাস্তব দোকানদারকে AndgatePOS রেফার করলে কমিশন প্রযোজ্য।',
            'কমিশন শুধু সফল পেইড সাবস্ক্রিপশন ও যাচাই শেষে হয়।',
            'আমি AndgatePOS অ্যাফিলিয়েট হিসেবে রেফার করছি।',
        ],
    },
    {
        icon: XCircle,
        title: 'বলতে পারবেন না',
        color: 'text-red-700',
        bg: 'bg-red-50 border-red-200',
        items: [
            'গ্যারান্টিযুক্ত মাসিক আয় / চাকরি / ইনভেস্টমেন্ট।',
            'মানুষ রিক্রুট করলেই টাকা বা প্যাসিভ ইনকাম।',
            'ভুয়া কাস্টমার, ভুয়া স্ক্রিনশট বা অতিরঞ্জিত আয়ের দাবি।',
        ],
    },
];

const POST_TEMPLATES = [
    {
        title: 'Facebook পোস্ট',
        text: 'দোকানের বিক্রি, স্টক, বাকি, পেমেন্ট ও রিপোর্ট একসাথে দেখতে চান? AndgatePOS দিয়ে ১৪ দিনের ফ্রি ট্রায়াল শুরু করা যায়।\n\nআমি AndgatePOS অ্যাফিলিয়েট হিসেবে রেফার করছি। ডেমো দেখতে চাইলে ইনবক্স/WhatsApp করুন।',
    },
    {
        title: 'WhatsApp স্ট্যাটাস',
        text: 'দোকানের স্টক, বাকি আর দৈনিক বিক্রির হিসাব একসাথে রাখতে AndgatePOS ব্যবহার করে দেখতে পারেন। ১৪ দিনের ফ্রি ট্রায়াল আছে।\n\nআমি AndgatePOS অ্যাফিলিয়েট হিসেবে রেফার করছি।',
    },
    {
        title: 'ডেমো ফলোআপ',
        text: 'ভাই, আজকের ডেমোতে আমরা বিলিং, স্টক, বাকি, পেমেন্ট ও রিপোর্ট দেখেছি। আপনি চাইলে ১৪ দিনের ফ্রি ট্রায়াল দিয়ে নিজের দোকানের কাজ মিলিয়ে দেখতে পারেন।',
    },
];

export default function AffiliateAssetsPage() {
    const { t } = getTranslation();
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard?.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const waRequestUrl = (item: string) =>
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`আমি AndgatePOS অ্যাফিলিয়েট। অনুগ্রহ করে এই মেটেরিয়ালটি পাঠান: ${item}`)}`;

    return (
        <div className="py-10 px-4">
            <div className="mx-auto max-w-4xl">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold mb-2">{t('aff_assets_title')}</h1>
                    <p className="text-slate-500 text-sm max-w-xl mx-auto">
                        {t('aff_assets_subtitle')}
                    </p>
                </div>

                <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                        <div>
                            <h2 className="text-sm font-bold text-amber-900">{t('aff_assets_disclosure_title')}</h2>
                            <p className="mt-1 text-sm leading-6 text-amber-800">{t('aff_assets_disclosure_desc')}</p>
                        </div>
                    </div>
                </div>

                {/* WhatsApp broadcast scripts */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="rounded-lg p-1.5 bg-emerald-50">
                            <MessageSquare className="h-4 w-4 text-emerald-600" />
                        </div>
                        <h2 className="text-lg font-bold">{t('aff_assets_scripts_title')}</h2>
                        <span className="ml-auto text-xs text-slate-400">{t('aff_assets_scripts_hint')}</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {WHATSAPP_SCRIPTS.map(({ title, audience, bg, tag, text }) => (
                            <div key={title} className={`rounded-xl border p-4 ${bg}`}>
                                <div className="flex items-start justify-between mb-2 gap-2">
                                    <div>
                                        <div className="font-semibold text-sm">{title}</div>
                                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium mt-0.5 ${tag}`}>{audience}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-3">{text}</p>
                                <button
                                    onClick={() => handleCopy(text, title)}
                                    className="flex items-center gap-1.5 rounded-lg bg-white/70 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white transition"
                                >
                                    {copied === title
                                        ? <><Check className="h-3.5 w-3.5 text-success" /> {t('aff_assets_copied')}</>
                                        : <><Copy className="h-3.5 w-3.5" /> {t('aff_assets_copy_btn')}</>
                                    }
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="rounded-lg p-1.5 bg-blue-50">
                            <Share2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold">{t('aff_assets_posts_title')}</h2>
                    </div>
                    <div className="grid gap-3">
                        {POST_TEMPLATES.map(({ title, text }) => (
                            <div key={title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-2 text-sm font-semibold">{title}</div>
                                <p className="mb-3 whitespace-pre-line text-sm leading-6 text-slate-600">{text}</p>
                                <button
                                    onClick={() => handleCopy(text, title)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white"
                                >
                                    {copied === title ? <><Check className="h-3.5 w-3.5 text-success" /> {t('aff_assets_copied')}</> : <><Copy className="h-3.5 w-3.5" /> {t('aff_assets_copy_btn')}</>}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Physical assets */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="rounded-lg p-1.5 bg-primary/10">
                            <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <h2 className="text-lg font-bold">{t('aff_assets_physical_title')}</h2>
                        <span className="ml-auto text-xs text-slate-400">{t('aff_assets_physical_hint')}</span>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-sm overflow-hidden">
                        {PHYSICAL_ASSETS.map(({ title, icon: Icon, color, bg, note }) => (
                            <div key={title} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4 hover:bg-slate-50 transition">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`shrink-0 rounded-lg p-2 ${bg}`}>
                                        <Icon className={`h-5 w-5 ${color}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold">{title}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">{note}</div>
                                    </div>
                                </div>
                                <a
                                    href={waRequestUrl(title)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-100 transition"
                                >
                                    <Phone className="h-3.5 w-3.5" />
                                    {t('aff_assets_wa_request_btn')}
                                </a>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-center">
                        {t('aff_assets_wa_note')}
                    </p>
                </div>

                <div className="mb-10 grid gap-3 sm:grid-cols-2">
                    {COMPLIANCE_RULES.map(({ icon: Icon, title, color, bg, items }) => (
                        <div key={title} className={`rounded-2xl border p-4 ${bg}`}>
                            <div className={`mb-3 flex items-center gap-2 text-sm font-bold ${color}`}>
                                <Icon className="h-4 w-4" />
                                {title}
                            </div>
                            <ul className="space-y-2 text-sm leading-6 text-slate-700">
                                {items.map((item) => (
                                    <li key={item} className="flex gap-2">
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Pain framing tip */}
                <div className="rounded-2xl bg-gradient-to-br from-primary to-[#034d79] text-white p-6 text-center">
                    <div className="text-lg font-bold mb-2">{t('aff_assets_framing_title')}</div>
                    <div className="text-white/80 text-sm mb-4">{t('aff_assets_framing_subtitle')}</div>
                    <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto mb-4">
                        {[
                            ['স্টক', 'কত আছে জানুন'],
                            ['বাকি', 'কার কাছে কত'],
                            ['রিপোর্ট', 'লাভ-লোকসান'],
                        ].map(([v, l]) => (
                            <div key={l} className="rounded-xl bg-white/15 p-3">
                                <div className="font-bold text-sm">{v}</div>
                                <div className="text-xs text-white/70 mt-0.5">{l}</div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => handleCopy('ভাই, AndgatePOS দিয়ে দোকানের বিক্রি, স্টক, বাকি, পেমেন্ট ও রিপোর্ট একসাথে দেখা যায়। আগে ১৪ দিনের ফ্রি ট্রায়ালে নিজের দোকানের কাজ মিলিয়ে দেখতে পারেন।', 'framing')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-2 text-sm font-semibold transition"
                    >
                        {copied === 'framing'
                            ? <><Check className="h-4 w-4" /> {t('aff_assets_copied')}</>
                            : <><Copy className="h-4 w-4" /> {t('aff_assets_copy_pitch')}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
