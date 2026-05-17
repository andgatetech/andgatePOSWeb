'use client';

import { useState } from 'react';
import { FileText, Image, MessageSquare, Share2, Copy, Check, Phone } from 'lucide-react';
import { getTranslation } from '@/i18n';

const WHATSAPP_NUMBER = '8801577303608';

const WHATSAPP_SCRIPTS = [
    {
        title: 'IT ভাই পিচ',
        audience: 'কম্পিউটার সার্ভিস প্রভাইডার',
        bg: 'bg-blue-50 border-blue-200',
        tag: 'bg-blue-100 text-blue-700',
        text: 'ভাই, আপনি যেসব দোকানে কম্পিউটার সেটআপ করেন, সেখানে AndgatePOS সফটওয়্যার দেখাতে পারেন। কাস্টমার সফলভাবে সাবস্ক্রাইব করলে পার্টনার সেলস কমিশন পাওয়া যায়। ১৪ দিন ফ্রি ট্রায়াল আছে।\n\nআগ্রহী হলে জানান।',
    },
    {
        title: 'হিসাব ভাই পিচ',
        audience: 'অ্যাকাউন্ট্যান্ট / ট্যাক্স কনসালট্যান্ট',
        bg: 'bg-green-50 border-green-200',
        tag: 'bg-green-100 text-green-700',
        text: 'ভাই, আপনার ক্লায়েন্টরা যদি AndgatePOS ব্যবহার করে, আপনার হিসাবের কাজ অনেক কমবে। VAT রিপোর্ট সরাসরি সফটওয়্যার থেকে নিতে পারবেন। সফল সাবস্ক্রিপশন হলে পার্টনার কমিশন প্রযোজ্য।',
    },
    {
        title: 'বাজার ভাই পিচ',
        audience: 'সন্তুষ্ট কাস্টমার রেফারেল',
        bg: 'bg-amber-50 border-amber-200',
        tag: 'bg-amber-100 text-amber-700',
        text: 'ভাই, আমি AndgatePOS ব্যবহার করি — দোকানের পুরো হিসাব এখন একটা সফটওয়্যারে। স্টক, বিক্রয়, রিপোর্ট সব পাই। ১৪ দিন ফ্রি ট্রায়াল আছে। চাইলে দেখাতে পারি।',
    },
    {
        title: 'হার্ডওয়্যার বান্ডেল পিচ',
        audience: 'POS হার্ডওয়্যার বিক্রেতা',
        bg: 'bg-purple-50 border-purple-200',
        tag: 'bg-purple-100 text-purple-700',
        text: 'প্রিন্টার কিনুন, সাথে AndgatePOS সফটওয়্যার ১ মাস ফ্রি পান। কমপ্লিট POS সলিউশন — হার্ডওয়্যার + সফটওয়্যার একসাথে। কাস্টমারকে সম্পূর্ণ সমাধান দিন।',
    },
    {
        title: 'NGO/MFI ফিল্ড পিচ',
        audience: 'NGO / MFI ফিল্ড অফিসার',
        bg: 'bg-teal-50 border-teal-200',
        tag: 'bg-teal-100 text-teal-700',
        text: 'আপনার উদ্যোক্তা ক্লায়েন্টদের জন্য AndgatePOS — সহজে স্টক ও বিক্রয় ট্র্যাক করুন। মাসিক ৳৯৯৯ থেকে শুরু। সফল সাবস্ক্রিপশন হলে অনুমোদিত পার্টনার কমিশন প্রযোজ্য।',
    },
    {
        title: 'ইউনিভার্সিটি অ্যাম্বাসেডর পিচ',
        audience: 'BBA/MBA ছাত্র',
        bg: 'bg-rose-50 border-rose-200',
        tag: 'bg-rose-100 text-rose-700',
        text: 'আপনার ক্যাম্পাসের ছোট ব্যবসা — ক্যান্টিন, ফটোকপি, স্টেশনারি — সবার জন্য AndgatePOS। রেফারেল করুন, CV-তে Sales Experience যোগ করুন; সফল subscription হলে কমিশন প্রযোজ্য।',
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

export default function AffiliateAssetsPage() {
    const { t } = getTranslation();
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard?.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const waRequestUrl = (item: string) =>
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`আমি AndgatePOS পার্টনার। অনুগ্রহ করে এই মেটেরিয়ালটি পাঠান: ${item}`)}`;

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

                {/* Commission framing tip */}
                <div className="rounded-2xl bg-gradient-to-br from-primary to-[#034d79] text-white p-6 text-center">
                    <div className="text-lg font-bold mb-2">{t('aff_assets_framing_title')}</div>
                    <div className="text-white/80 text-sm mb-4">{t('aff_assets_framing_subtitle')}</div>
                    <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto mb-4">
                        {[
                            ['৳৩৩/দিন', 'চায়ের দামে'],
                            ['৳৯৯৯/মাস', 'Starter Dukan'],
                            ['২ মাস ফ্রি', 'বার্ষিক প্ল্যানে'],
                        ].map(([v, l]) => (
                            <div key={l} className="rounded-xl bg-white/15 p-3">
                                <div className="font-bold text-sm">{v}</div>
                                <div className="text-xs text-white/70 mt-0.5">{l}</div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => handleCopy('ভাই, এই সফটওয়্যার মাত্র ৳৩৩ টাকা/দিন — চায়ের দামে পুরো দোকানের হিসাব ডিজিটাল। ১৪ দিন ফ্রি ট্রায়াল আছে।', 'framing')}
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
