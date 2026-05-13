import MainLayout from '@/components/layouts/MainLayout';
import { highIntentPages } from '@/lib/high-intent-pages';
import { landingPages } from '@/lib/landing-pages';
import { getAppUrl } from '@/lib/seo-config';
import { ArrowRight, ClipboardList, SearchCheck } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

const baseUrl = getAppUrl();

export const metadata: Metadata = {
    title: 'SEO Page Index | AndgatePOS',
    description: 'Internal index of AndgatePOS SEO landing, comparison and buyer-intent pages.',
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: `${baseUrl}/seo`,
    },
};

const pageGroups = [
    {
        title: 'Landing Pages',
        description: 'Keyword-specific pages under /landing for POS software searches in Bangladesh. / বাংলাদেশে POS সফটওয়্যার সার্চের জন্য তৈরি ল্যান্ডিং পেজ।',
        pages: landingPages.map((page) => ({
            title: page.title,
            href: `/landing/${page.slug}`,
            keyword: page.primaryKeyword,
            description: page.metaDescription,
        })),
    },
    {
        title: 'Comparison and Buyer-Intent Pages',
        description: 'High-conversion pages for comparison, best, and free POS software searches. / তুলনা, সেরা POS এবং ফ্রি POS সার্চের জন্য তৈরি পেজ।',
        pages: highIntentPages.map((page) => ({
            title: page.title,
            href: page.path,
            keyword: page.primaryKeyword,
            description: page.metaDescription,
        })),
    },
];

export default function SeoIndexPage() {
    return (
        <MainLayout>
            <section className="bg-[#f7fbff] px-4 pb-20 pt-28 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="max-w-3xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#046ca9]/15 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#034d79] shadow-sm">
                            <SearchCheck className="h-4 w-4 text-[#046ca9]" />
                            SEO Review Index / SEO রিভিউ ইনডেক্স
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">All SEO pages / সব SEO পেজ</h1>
                        <p className="mt-5 text-base leading-8 text-gray-600">
                            Use this page to quickly open every new SEO landing, comparison and buyer-intent page created for AndgatePOS.
                            <br />
                            AndgatePOS-এর জন্য তৈরি সব নতুন SEO পেজ দ্রুত খুলতে এই পেজটি ব্যবহার করুন।
                        </p>
                    </div>

                    <div className="mt-12 space-y-12">
                        {pageGroups.map((group) => (
                            <div key={group.title}>
                                <div className="mb-6 flex items-start gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#046ca9]/10 text-[#046ca9]">
                                        <ClipboardList className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-950">{group.title}</h2>
                                        <p className="mt-1 text-sm leading-6 text-gray-600">{group.description}</p>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {group.pages.map((page) => (
                                        <Link
                                            key={page.href}
                                            href={page.href}
                                            className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#046ca9]/20 hover:shadow-md"
                                        >
                                            <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{page.keyword}</p>
                                            <h3 className="mt-3 text-lg font-black text-gray-950">{page.title}</h3>
                                            <p className="mt-3 text-sm leading-7 text-gray-600">{page.description}</p>
                                            <div className="mt-5 flex items-center justify-between gap-3">
                                                <code className="truncate rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">{page.href}</code>
                                                <ArrowRight className="h-4 w-4 shrink-0 text-[#046ca9] transition group-hover:translate-x-1" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
