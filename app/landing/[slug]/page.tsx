import MainLayout from '@/components/layouts/MainLayout';
import { getLandingPage, landingPages } from '@/lib/landing-pages';
import { BD_KEYWORDS, getAppUrl } from '@/lib/seo-config';
import { ArrowRight, BadgeCheck, BarChart3, CheckCircle2, ClipboardList, HelpCircle, PackageCheck, Receipt, SearchCheck, Store, WalletCards } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type LandingPageProps = {
    params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
    return landingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = getLandingPage(slug);

    if (!page) return {};

    const baseUrl = getAppUrl();
    const url = `${baseUrl}/landing/${page.slug}`;

    return {
        title: page.metaTitle,
        description: page.metaDescription,
        keywords: [page.primaryKeyword, ...page.secondaryKeywords, ...BD_KEYWORDS],
        alternates: {
            canonical: url,
            languages: {
                'en-BD': url,
                'bn-BD': `${url}?lang=bn`,
                'x-default': url,
            },
        },
        openGraph: {
            type: 'website',
            locale: 'en_BD',
            alternateLocale: ['bn_BD'],
            url,
            siteName: 'AndgatePOS',
            title: page.metaTitle,
            description: page.metaDescription,
            images: [
                {
                    url: page.image,
                    width: 1200,
                    height: 630,
                    alt: `${page.title} - AndgatePOS`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: page.metaTitle,
            description: page.metaDescription,
            images: [page.image],
        },
    };
}

export default async function LandingPage({ params }: LandingPageProps) {
    const { slug } = await params;
    const page = getLandingPage(slug);

    if (!page) notFound();

    const baseUrl = getAppUrl();
    const pageUrl = `${baseUrl}/landing/${page.slug}`;
    const breadcrumbs = [
        { name: 'Home', url: baseUrl },
        { name: 'Landing', url: `${baseUrl}/landing` },
        { name: page.title, url: pageUrl },
    ];

    const softwareSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AndgatePOS',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Point of Sale Software',
        operatingSystem: 'Web Browser',
        url: pageUrl,
        inLanguage: ['en-BD', 'bn-BD'],
        areaServed: {
            '@type': 'Country',
            name: 'Bangladesh',
        },
        description: page.metaDescription,
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'BDT',
            availability: 'https://schema.org/InStock',
            description: 'Free plan available for Bangladeshi businesses.',
        },
        provider: {
            '@type': 'Organization',
            name: 'Andgate Technologies',
            url: baseUrl,
        },
        featureList: page.highlights.concat(page.modules.map((module) => module.title)),
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
        description: page.intro,
        url: pageUrl,
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: page.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    const relatedPages = landingPages.filter((item) => item.slug !== page.slug).slice(0, 4);

    return (
        <MainLayout>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

            <section className="relative overflow-hidden bg-[#f7fbff] pt-24">
                <div className="absolute inset-x-0 top-16 h-[3px] bg-gradient-to-r from-[#046ca9] via-[#0586cb] to-[#e79237]" />
                <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
                    <div>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#046ca9]/15 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#034d79] shadow-sm">
                            <SearchCheck className="h-4 w-4 text-[#046ca9]" />
                            {page.eyebrow}
                        </div>
                        <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-gray-950 sm:text-5xl">{page.h1}</h1>
                        <p className="mt-5 max-w-2xl text-lg font-semibold leading-relaxed text-[#034d79]">{page.intro}</p>
                        <p lang="bn" className="mt-4 max-w-2xl text-base leading-8 text-gray-600">{page.banglaIntro}</p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#046ca9]/20 transition hover:brightness-105">
                                Start Free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href="/pricing" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition hover:border-[#046ca9]/30 hover:text-[#046ca9]">
                                See Pricing
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#046ca9]/10 bg-white p-3 shadow-2xl shadow-[#034d79]/10">
                        <div className="relative aspect-[16/10] overflow-hidden rounded-[1.15rem] bg-slate-100">
                            <Image src={page.image} alt={`${page.title} screenshot`} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover object-top" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white py-14">
                <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
                    {page.highlights.map((highlight) => (
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
                        <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">What You Get</p>
                        <h2 className="mt-3 text-3xl font-black text-gray-950">Everything a Bangladesh business needs from POS software</h2>
                        <p className="mt-4 text-base leading-7 text-gray-600">Built for: {page.audience}</p>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                        {page.modules.map((module, index) => {
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
                        <p className="text-xs font-bold uppercase tracking-widest text-[#e79237]">Local Search Terms</p>
                        <h2 className="mt-3 text-3xl font-black text-gray-950">Built around how people search in Bangladesh</h2>
                        <p className="mt-4 text-base leading-7 text-gray-600">
                            This page targets <strong>{page.primaryKeyword}</strong> and related buyer searches in both English and Bangla.
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
                        <p className="text-xs font-bold uppercase tracking-widest text-white/60">Use Cases</p>
                        <h2 className="mt-3 text-3xl font-black">Where AndgatePOS helps day to day</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {page.useCases.map((useCase) => (
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
                        <h2 className="text-3xl font-black text-gray-950">Frequently asked questions</h2>
                    </div>
                    <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm">
                        {page.faq.map((item) => (
                            <details key={item.question} className="group p-6">
                                <summary className="cursor-pointer list-none text-base font-black text-gray-950">
                                    {item.question}
                                </summary>
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
                            <h2 className="text-3xl font-black text-gray-950">More POS pages for Bangladesh</h2>
                        </div>
                        <Link href="/contact" className="hidden rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:text-[#046ca9] sm:inline-flex">
                            Talk to Sales
                        </Link>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {relatedPages.map((item) => (
                            <Link key={item.slug} href={`/landing/${item.slug}`} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{item.eyebrow}</p>
                                <h3 className="mt-3 text-base font-black text-gray-950">{item.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-gray-600">{item.primaryKeyword}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
