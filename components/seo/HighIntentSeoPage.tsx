'use client';

import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import { highIntentPages, type HighIntentSeoPage } from '@/lib/high-intent-pages';
import { getAppUrl } from '@/lib/seo-config';
import { ArrowRight, CheckCircle2, HelpCircle, Layers, Scale, SearchCheck, Star, Store } from 'lucide-react';
import Link from 'next/link';

type Props = {
    page: HighIntentSeoPage;
};

export default function HighIntentSeoPageView({ page }: Props) {
    const { i18n } = getTranslation();
    const isBn = i18n.language === 'bn';
    const content = isBn ? page.bn : page;
    const baseUrl = getAppUrl();
    const pageUrl = `${baseUrl}${page.path}`;
    const relatedPages = highIntentPages.filter((item) => item.path !== page.path).slice(0, 4);

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: content.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };

    const serviceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: page.title,
        serviceType: page.primaryKeyword,
        provider: {
            '@type': 'Organization',
            name: 'Andgate Technologies',
            url: baseUrl,
        },
        areaServed: {
            '@type': 'Country',
            name: 'Bangladesh',
        },
        description: isBn ? content.intro : page.metaDescription,
        url: pageUrl,
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
            { '@type': 'ListItem', position: 2, name: page.title, item: pageUrl },
        ],
    };

    return (
        <MainLayout>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

            <section className="relative overflow-hidden bg-[#f7fbff] pt-24">
                <div className="absolute inset-x-0 top-16 h-[3px] bg-gradient-to-r from-[#046ca9] via-[#0586cb] to-[#e79237]" />
                <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
                    <div className="max-w-4xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#046ca9]/15 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#034d79] shadow-sm">
                            <SearchCheck className="h-4 w-4 text-[#046ca9]" />
                            {content.eyebrow}
                        </div>
                        <h1 className="text-4xl font-black leading-tight tracking-tight text-gray-950 sm:text-5xl">{content.h1}</h1>
                        <p className="mt-5 text-lg font-semibold leading-8 text-[#034d79]">{content.intro}</p>
                        {!isBn && <p lang="bn" className="mt-4 text-base leading-8 text-gray-600">{page.banglaIntro}</p>}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#046ca9]/20 transition hover:brightness-105">
                                {isBn ? 'ফ্রিতে শুরু করুন' : 'Start Free'}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href="/landing/pos-software-bangladesh" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition hover:border-[#046ca9]/30 hover:text-[#046ca9]">
                                {isBn ? 'POS ফিচার দেখুন' : 'See POS Features'}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
                    <div className="rounded-2xl border border-[#046ca9]/10 bg-[#046ca9]/5 p-6">
                        <Scale className="mb-5 h-8 w-8 text-[#046ca9]" />
                        <h2 className="text-2xl font-black text-gray-950">{isBn ? 'সংক্ষেপে সিদ্ধান্ত' : 'Quick verdict'}</h2>
                        <p className="mt-4 text-sm leading-7 text-gray-700">{content.verdict}</p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="grid grid-cols-[0.8fr_1fr_1fr] border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-500">
                            <span>{isBn ? 'বিষয়' : 'Area'}</span>
                            <span>{isBn ? 'পুরনো পদ্ধতি' : 'Old way'}</span>
                            <span>AndgatePOS</span>
                        </div>
                        {content.comparison.map((row) => (
                            <div key={row.label} className="grid grid-cols-[0.8fr_1fr_1fr] gap-3 border-b border-gray-100 px-4 py-4 text-sm last:border-b-0">
                                <strong className="text-gray-950">{row.label}</strong>
                                <span className="leading-6 text-gray-500">{row.oldWay}</span>
                                <span className="leading-6 text-gray-700">{row.andgate}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-gray-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 max-w-3xl">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{isBn ? 'কেন কাজ করে' : 'Why it converts'}</p>
                        <h2 className="mt-3 text-3xl font-black text-gray-950">{isBn ? 'বাংলাদেশি দোকান কেন AndgatePOS বেছে নেয়' : 'Why Bangladeshi shops move to AndgatePOS'}</h2>
                    </div>
                    <div className="grid gap-5 md:grid-cols-3">
                        {content.reasons.map((reason) => (
                            <div key={reason.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <Star className="mb-5 h-6 w-6 text-[#e79237]" />
                                <h3 className="text-lg font-black text-gray-950">{reason.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-gray-600">{reason.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white py-20">
                <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
                    <div>
                        <Layers className="mb-5 h-8 w-8 text-[#046ca9]" />
                        <h2 className="text-3xl font-black text-gray-950">{isBn ? 'এই পেজের সার্চ টার্ম' : 'Search terms this page targets'}</h2>
                        <p className="mt-4 text-base leading-7 text-gray-600">
                            {isBn ? 'প্রধান কীওয়ার্ড' : 'Primary keyword'}: <strong>{page.primaryKeyword}</strong>
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
                    <Store className="mb-5 h-8 w-8 text-[#046ca9]" />
                    <h2 className="text-3xl font-black text-gray-950">{isBn ? 'সম্পর্কিত SEO পেজ' : 'Related buyer-intent pages'}</h2>
                    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {relatedPages.map((item) => (
                            <Link key={item.path} href={item.path} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{isBn ? item.bn.eyebrow : item.eyebrow}</p>
                                <h3 className="mt-3 text-base font-black text-gray-950">{isBn ? item.bn.title : item.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-gray-600">{item.primaryKeyword}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
