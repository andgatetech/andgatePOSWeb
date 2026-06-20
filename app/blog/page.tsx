import MainLayout from '@/components/layouts/MainLayout';
import { seoArticles } from '@/lib/seo-articles';
import { getAppUrl } from '@/lib/seo-config';
import { ArrowRight } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = getAppUrl();

export const metadata: Metadata = {
    title: 'POS Software Guides Bangladesh | AndgatePOS Blog',
    description: 'SEO guides for Bangladeshi shop owners about POS software, billing, inventory, barcode checkout, offline POS, pricing and shop management.',
    alternates: {
        canonical: `${BASE_URL}/blog`,
    },
    openGraph: {
        type: 'website',
        locale: 'en_BD',
        url: `${BASE_URL}/blog`,
        siteName: 'AndgatePOS',
        title: 'POS Software Guides Bangladesh | AndgatePOS Blog',
        description: 'Practical POS, billing, inventory and shop management guides for Bangladeshi SMEs.',
    },
};

export default function BlogIndexPage() {
    const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'AndgatePOS Blog',
        url: `${BASE_URL}/blog`,
        about: 'POS software, inventory, billing and shop management for Bangladesh SMEs',
        hasPart: seoArticles.map((article) => ({
            '@type': 'Article',
            headline: article.h1,
            url: `${BASE_URL}/blog/${article.slug}`,
        })),
    };

    return (
        <MainLayout>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
            <section className="bg-[#f7fbff] pt-24">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                    <p className="text-sm font-bold uppercase tracking-widest text-[#046ca9]">AndgatePOS Guides</p>
                    <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-gray-950 sm:text-5xl">
                        POS software guides for Bangladeshi shops
                    </h1>
                    <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600">
                        Practical content for shop owners comparing POS software, inventory, billing, barcode checkout, offline mode, pricing and shop management workflows.
                    </p>
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
                    {seoArticles.map((article) => (
                        <Link key={article.slug} href={`/blog/${article.slug}`} className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{article.primaryKeyword}</p>
                            <h2 className="mt-3 text-xl font-black text-gray-950">{article.title}</h2>
                            <p className="mt-3 text-sm leading-7 text-gray-600">{article.excerpt}</p>
                            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#046ca9]">
                                Read guide
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </MainLayout>
    );
}
