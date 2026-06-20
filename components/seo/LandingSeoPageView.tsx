'use client';

import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import { landingPages, type LandingPage } from '@/lib/landing-pages';
import { ArrowRight, BadgeCheck, BarChart3, CheckCircle2, ClipboardList, HelpCircle, PackageCheck, Receipt, SearchCheck, Store, WalletCards } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type LocalizedLandingCopy = {
    title: string;
    h1: string;
    eyebrow: string;
    intro: string;
    audience: string;
    highlights: string[];
    modules: Array<{ title: string; description: string }>;
    useCases: string[];
    faq: Array<{ question: string; answer: string }>;
};

const commonModulesBn = [
    {
        title: 'দ্রুত POS বিলিং',
        description: 'বারকোড বা ক্যামেরা স্ক্যান, ডিসকাউন্ট, একাধিক পেমেন্ট মেথড এবং রসিদ প্রিন্ট এক checkout screen থেকেই করা যায়।',
    },
    {
        title: 'স্টক ও ইনভেন্টরি কন্ট্রোল',
        description: 'স্টক লাইভ দেখুন, কম স্টকের অ্যালার্ট পান, ভ্যারিয়েন্ট, সিরিয়াল, ইউনিট এবং purchase order সহজে ম্যানেজ করুন।',
    },
    {
        title: 'রিপোর্ট ও হিসাব',
        description: 'বিক্রি, লাভ-ক্ষতি, VAT/tax, supplier due, customer activity, stock value এবং daily expense পরিষ্কারভাবে দেখুন।',
    },
    {
        title: 'বাংলাদেশি পেমেন্টের জন্য প্রস্তুত',
        description: 'Cash, bKash, Nagad, Rocket, Upay, card, bank transfer, partial payment এবং customer due ঠিকভাবে রেকর্ড করুন।',
    },
];

export const landingCopyBn: Record<string, LocalizedLandingCopy> = {
    'pos-software-bangladesh': {
        title: 'বাংলাদেশে POS সফটওয়্যার',
        h1: 'বাংলাদেশের দোকানের জন্য POS সফটওয়্যার, বিলিং ও ইনভেন্টরি',
        eyebrow: 'বাংলাদেশ POS সলিউশন',
        intro: 'AndgatePOS দিয়ে দোকানের বিক্রি, স্টক, বিল, হিসাব, পেমেন্ট আর কাস্টমার ম্যানেজমেন্ট এক জায়গা থেকে সহজে চালানো যায়।',
        audience: 'রিটেইল দোকান, মুদি দোকান, ফার্মেসি, ফ্যাশন শপ, রেস্টুরেন্ট, ইলেকট্রনিক্স দোকান এবং multi-branch ব্যবসা।',
        highlights: ['কাউন্টারে internet সমস্যা হলেও কাজ চালানো যায়', 'bKash, Nagad, Rocket ও cash payment tracking', 'Free Hawkeri online store', '২০টির বেশি business report'],
        modules: commonModulesBn,
        useCases: [
            'হাতে লেখা cash memo বাদ দিয়ে digital invoice তৈরি করুন',
            'কোন পণ্য বিক্রি হচ্ছে আর কোনটা স্টকে পড়ে আছে তা বুঝুন',
            'এক dashboard থেকে একাধিক branch ম্যানেজ করুন',
            'Supplier due, customer due এবং daily expense track করুন',
        ],
        faq: [
            {
                question: 'বাংলাদেশের ছোট দোকানের জন্য কোন POS সফটওয়্যার ভালো?',
                answer: 'ছোট দোকানের জন্য POS software সহজ হওয়া দরকার, local payment support থাকা দরকার, stock tracking, receipt print এবং daily profit report থাকা দরকার। AndgatePOS এই workflow মাথায় রেখেই তৈরি।',
            },
            {
                question: 'AndgatePOS কি bKash ও Nagad support করে?',
                answer: 'হ্যাঁ। POS checkout থেকে cash, bKash, Nagad, Rocket, Upay, card, bank transfer এবং partial payment রেকর্ড করা যায়।',
            },
            {
                question: 'Internet না থাকলে কি AndgatePOS ব্যবহার করা যাবে?',
                answer: 'Counter sales workflow এমনভাবে করা হয়েছে যেন internet interruption থাকলেও বিক্রি চালানো যায় এবং connection ফিরে এলে sync হয়।',
            },
            {
                question: 'Free POS plan আছে?',
                answer: 'হ্যাঁ। AndgatePOS-এ free starting option আছে, যাতে upgrade করার আগে business core workflow try করতে পারে।',
            },
        ],
    },
    'retail-pos-software-bangladesh': {
        title: 'রিটেইল POS সফটওয়্যার বাংলাদেশ',
        h1: 'বাংলাদেশি রিটেইল দোকানের জন্য POS সফটওয়্যার',
        eyebrow: 'রিটেইল দোকান ম্যানেজমেন্ট',
        intro: 'Counter sales, customer due, stock alert, product variant, staff permission এবং daily report এক জায়গায় রাখুন, notebook আর spreadsheet কমান।',
        audience: 'কাপড়ের দোকান, electronics shop, cosmetics shop, superstore, footwear shop এবং lifestyle retail business।',
        highlights: ['Variant-wise stock', 'Barcode label', 'Customer loyalty ও due', 'Branch-wise report'],
        modules: commonModulesBn,
        useCases: ['Size, color ও variant track করুন', 'Product barcode label print করুন', 'Cashier ও manager access control করুন', 'Daily ও monthly sales trend দেখুন'],
        faq: [
            { question: 'রিটেইল দোকানে product variant ম্যানেজ করা যাবে?', answer: 'হ্যাঁ। Size, color, model এবং দরকার হলে serial based variant AndgatePOS-এ support করে।' },
            { question: 'Barcode label print করা যাবে?', answer: 'হ্যাঁ। Product workflow থেকেই barcode বা QR label generate এবং print করা যায়।' },
            { question: 'Staff access control করা যাবে?', answer: 'হ্যাঁ। Role ও permission দিয়ে কে sell, refund, stock edit বা report দেখতে পারবে তা নিয়ন্ত্রণ করা যায়।' },
        ],
    },
    'restaurant-pos-software-bangladesh': {
        title: 'রেস্টুরেন্ট POS সফটওয়্যার বাংলাদেশ',
        h1: 'বাংলাদেশের রেস্টুরেন্টে দ্রুত বিলিংয়ের জন্য POS সফটওয়্যার',
        eyebrow: 'Food Business POS',
        intro: 'Customer দ্রুত serve করুন, daily sales track করুন, expense ম্যানেজ করুন এবং food-item inventory এক dashboard থেকে দেখুন।',
        audience: 'রেস্টুরেন্ট, cafe, bakery, fast food shop, juice bar এবং ছোট food counter।',
        highlights: ['Fast checkout', 'Daily cash ও expense tracking', 'Sales report', 'Multiple payment method'],
        modules: commonModulesBn,
        useCases: ['Rush hour-এ দ্রুত bill করুন', 'Cash, mobile payment ও card payment track করুন', 'Daily kitchen বা shop expense রেকর্ড করুন', 'Best-selling food item দেখুন'],
        faq: [
            { question: 'Restaurant কি daily sales track করতে পারবে?', answer: 'হ্যাঁ। AndgatePOS daily sales, payment method breakdown, expense এবং profit-related report দেখায়।' },
            { question: 'Bakery ও cafe-তে ব্যবহার করা যাবে?', answer: 'হ্যাঁ। Cafe, bakery, food counter এবং ছোট restaurant-এর workflow-এর সঙ্গে এটি মানানসই।' },
            { question: 'Receipt print করা যাবে?', answer: 'হ্যাঁ। Checkout শেষে receipt ও invoice print করা যায়।' },
        ],
    },
    'pharmacy-pos-software-bangladesh': {
        title: 'ফার্মেসি POS সফটওয়্যার বাংলাদেশ',
        h1: 'বাংলাদেশের ফার্মেসির stock ও billing-এর জন্য POS সফটওয়্যার',
        eyebrow: 'Pharmacy Management',
        intro: 'Medicine stock পরিষ্কার রাখুন, billing mistake কমান, supplier purchase track করুন এবং গুরুত্বপূর্ণ product কমে গেলে আগে থেকেই জানুন।',
        audience: 'ফার্মেসি, medicine shop, healthcare retail counter এবং multi-branch pharmacy business।',
        highlights: ['Low-stock alert', 'Supplier purchase tracking', 'Customer history', 'Inventory report'],
        modules: commonModulesBn,
        useCases: ['কোন medicine reorder দরকার তা জানুন', 'Supplier bill ও due track করুন', 'Product-wise daily sales দেখুন', 'Manual billing mistake কমান'],
        faq: [
            { question: 'ফার্মেসিতে low-stock track করা যাবে?', answer: 'হ্যাঁ। Low-stock threshold set করে গুরুত্বপূর্ণ item শেষ হওয়ার আগেই alert দেখা যায়।' },
            { question: 'Supplier manage করা যাবে?', answer: 'হ্যাঁ। Supplier profile, purchase order, payment এবং due support আছে।' },
            { question: 'Pharmacy sales report দেখা যাবে?', answer: 'হ্যাঁ। Sales, stock, purchase এবং profit-related report পাওয়া যায়।' },
        ],
    },
    'grocery-pos-software-bangladesh': {
        title: 'মুদি দোকান POS সফটওয়্যার বাংলাদেশ',
        h1: 'Barcode billing ও stock management-এর জন্য grocery POS software',
        eyebrow: 'Grocery ও Superstore POS',
        intro: 'মুদি দোকান বা super shop-এ checkout দ্রুত করুন, stock count update রাখুন, supplier purchase ম্যানেজ করুন এবং manual খাতা কমান।',
        audience: 'মুদি দোকান, mini mart, super shop এবং neighborhood retail counter।',
        highlights: ['Barcode checkout', 'Bulk product import', 'Supplier due', 'Low-stock reorder alert'],
        modules: commonModulesBn,
        useCases: ['Checkout-এ product দ্রুত scan করুন', 'Excel থেকে product list import করুন', 'Category-wise stock track করুন', 'Supplier payment ও purchase order manage করুন'],
        faq: [
            { question: 'Barcode scanning ব্যবহার করা যাবে?', answer: 'হ্যাঁ। Faster grocery checkout-এর জন্য barcode ও camera scanning support আছে।' },
            { question: 'অনেক grocery product একসাথে upload করা যাবে?', answer: 'হ্যাঁ। Bulk Excel import দিয়ে দ্রুত product upload করা যায়।' },
            { question: 'Supplier due track করা যাবে?', answer: 'হ্যাঁ। Purchase workflow থেকে supplier due এবং payment track করা যায়।' },
        ],
    },
    'inventory-management-software-bangladesh': {
        title: 'ইনভেন্টরি ম্যানেজমেন্ট সফটওয়্যার বাংলাদেশ',
        h1: 'বাংলাদেশি ব্যবসার জন্য inventory management software',
        eyebrow: 'Stock Control',
        intro: 'কোন stock আছে, কোনটা বিক্রি হচ্ছে, কোনটা reorder দরকার এবং branch-wise stock value কোথায় আছে তা পরিষ্কারভাবে জানুন।',
        audience: 'Retailer, wholesaler, multi-branch store, electronics shop, pharmacy এবং product-heavy business।',
        highlights: ['Real-time stock', 'Purchase order', 'Barcode label', 'Stock valuation report'],
        modules: commonModulesBn,
        useCases: ['Reorder threshold set করুন', 'Product movement track করুন', 'Reason সহ stock adjustment manage করুন', 'Idle product ও stock value দেখুন'],
        faq: [
            { question: 'Low-stock alert set করা যাবে?', answer: 'হ্যাঁ। Threshold set করে report ও dashboard-এ low-stock product দেখা যায়।' },
            { question: 'Multiple store manage করা যাবে?', answer: 'হ্যাঁ। একাধিক store location-এর stock দেখা ও manage করা যায়।' },
            { question: 'Product label print করা যাবে?', answer: 'হ্যাঁ। Barcode ও QR label generate এবং print করা যায়।' },
        ],
    },
    'billing-software-bangladesh': {
        title: 'বিলিং সফটওয়্যার বাংলাদেশ',
        h1: 'দোকান ও retail counter-এর জন্য billing software',
        eyebrow: 'Digital Billing',
        intro: 'দ্রুত bill তৈরি করুন, discount apply করুন, payment record করুন, receipt print করুন এবং ভবিষ্যৎ report-এর জন্য sale searchable রাখুন।',
        audience: 'Retail counter, service shop, pharmacy, grocery store, fashion store এবং electronics shop।',
        highlights: ['Instant invoice', 'Receipt printing', 'Payment status tracking', 'VAT ও tax report'],
        modules: commonModulesBn,
        useCases: ['হাতে লেখা cash memo বাদ দিন', 'Paid, partial ও due payment track করুন', 'Customer invoice print করুন', 'যেকোনো সময় invoice history দেখুন'],
        faq: [
            { question: 'Customer invoice print করা যাবে?', answer: 'হ্যাঁ। Checkout ও order history থেকে receipt এবং invoice print করা যায়।' },
            { question: 'Due payment track করা যাবে?', answer: 'হ্যাঁ। Paid, unpaid এবং partial payment status support করে।' },
            { question: 'VAT বা tax report support আছে?', answer: 'হ্যাঁ। Tax-related report এবং invoice record পাওয়া যায়।' },
        ],
    },
};

type Props = {
    page: LandingPage;
    locale?: 'en' | 'bn';
};

export default function LandingSeoPageView({ page, locale }: Props) {
    const { i18n } = getTranslation();
    const isBn = locale ? locale === 'bn' : i18n.language === 'bn';
    const bnCopy = landingCopyBn[page.slug];
    const content = isBn && bnCopy ? bnCopy : page;
    const relatedPages = landingPages.filter((item) => item.slug !== page.slug).slice(0, 4);

    return (
        <MainLayout>
            <section className="relative overflow-hidden bg-[#f7fbff] pt-24">
                <div className="absolute inset-x-0 top-16 h-[3px] bg-gradient-to-r from-[#046ca9] via-[#0586cb] to-[#e79237]" />
                <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
                    <div>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#046ca9]/15 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#034d79] shadow-sm">
                            <SearchCheck className="h-4 w-4 text-[#046ca9]" />
                            {content.eyebrow}
                        </div>
                        <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-gray-950 sm:text-5xl">{content.h1}</h1>
                        <p className="mt-5 max-w-2xl text-lg font-semibold leading-relaxed text-[#034d79]">{content.intro}</p>
                        {!isBn && <p lang="bn" className="mt-4 max-w-2xl text-base leading-8 text-gray-600">{page.banglaIntro}</p>}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#046ca9]/20 transition hover:brightness-105">
                                {isBn ? 'ফ্রিতে শুরু করুন' : 'Start Free'}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href="/pricing" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition hover:border-[#046ca9]/30 hover:text-[#046ca9]">
                                {isBn ? 'মূল্য দেখুন' : 'See Pricing'}
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#046ca9]/10 bg-white p-3 shadow-2xl shadow-[#034d79]/10">
                        <div className="relative aspect-[16/10] overflow-hidden rounded-[1.15rem] bg-slate-100">
                            <Image src={page.image} alt={`${content.title} screenshot`} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover object-top" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white py-14">
                <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
                    {content.highlights.map((highlight) => (
                        <div key={highlight} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                            <BadgeCheck className="mb-4 h-6 w-6 text-[#046ca9]" />
                            <p className="text-sm font-bold leading-6 text-gray-800">{highlight}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-gray-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 max-w-3xl">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{isBn ? 'যা যা পাবেন' : 'What You Get'}</p>
                        <h2 className="mt-3 text-3xl font-black text-gray-950">{isBn ? 'বাংলাদেশি ব্যবসার জন্য দরকারি POS ফিচার' : 'Everything a Bangladesh business needs from POS software'}</h2>
                        <p className="mt-4 text-base leading-7 text-gray-600">{isBn ? 'যাদের জন্য তৈরি: ' : 'Built for: '}{content.audience}</p>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                        {content.modules.map((module, index) => {
                            const icons = [Receipt, PackageCheck, BarChart3, WalletCards];
                            const Icon = icons[index % icons.length];
                            return (
                                <div key={module.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <Icon className="mb-5 h-7 w-7 text-[#046ca9]" />
                                    <h3 className="text-lg font-black text-gray-950">{module.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-gray-600">{module.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="bg-white py-20">
                <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#e79237]">{isBn ? 'লোকাল সার্চ টার্ম' : 'Local Search Terms'}</p>
                        <h2 className="mt-3 text-3xl font-black text-gray-950">{isBn ? 'বাংলাদেশে মানুষ যেভাবে খোঁজে, সেইভাবেই পেজ তৈরি' : 'Built around how people search in Bangladesh'}</h2>
                        <p className="mt-4 text-base leading-7 text-gray-600">
                            {isBn ? 'এই পেজের প্রধান keyword ' : 'This page targets '}<strong>{page.primaryKeyword}</strong>{isBn ? ' এবং related buyer search English ও Bangla দুইভাবেই cover করে।' : ' and related buyer searches in both English and Bangla.'}
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {[page.primaryKeyword, ...page.secondaryKeywords].map((keyword) => (
                            <div key={keyword} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#046ca9]" />
                                {keyword}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#034d79] py-20 text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 max-w-3xl">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/60">{isBn ? 'ব্যবহারের জায়গা' : 'Use Cases'}</p>
                        <h2 className="mt-3 text-3xl font-black">{isBn ? 'প্রতিদিনের কাজে AndgatePOS যেখানে সাহায্য করে' : 'Where AndgatePOS helps day to day'}</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {content.useCases.map((useCase) => (
                            <div key={useCase} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                                <ClipboardList className="mb-4 h-6 w-6 text-[#e79237]" />
                                <p className="text-sm font-semibold leading-7 text-white/90">{useCase}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white py-20">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center">
                        <HelpCircle className="mx-auto mb-4 h-9 w-9 text-[#046ca9]" />
                        <h2 className="text-3xl font-black text-gray-950">{isBn ? 'সচরাচর জিজ্ঞাসা' : 'Frequently asked questions'}</h2>
                    </div>
                    <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm">
                        {content.faq.map((item) => (
                            <details key={item.question} className="group p-6">
                                <summary className="cursor-pointer list-none text-base font-black text-gray-950">{item.question}</summary>
                                <p className="mt-3 text-sm leading-7 text-gray-600">{item.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-gray-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-end justify-between gap-6">
                        <div>
                            <Store className="mb-4 h-8 w-8 text-[#046ca9]" />
                            <h2 className="text-3xl font-black text-gray-950">{isBn ? 'বাংলাদেশের জন্য আরও POS পেজ' : 'More POS pages for Bangladesh'}</h2>
                        </div>
                        <Link href="/contact" className="hidden rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:text-[#046ca9] sm:inline-flex">
                            {isBn ? 'Sales টিমের সাথে কথা বলুন' : 'Talk to Sales'}
                        </Link>
                        <Link href="/blog" className="hidden rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:text-[#046ca9] sm:inline-flex">
                            {isBn ? 'SEO guide পড়ুন' : 'Read Guides'}
                        </Link>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {relatedPages.map((item) => {
                            const relatedCopy = isBn ? landingCopyBn[item.slug] : null;
                            return (
                                <Link key={item.slug} href={`/${item.slug}`} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{relatedCopy?.eyebrow ?? item.eyebrow}</p>
                                    <h3 className="mt-3 text-base font-black text-gray-950">{relatedCopy?.title ?? item.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-gray-600">{item.primaryKeyword}</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
