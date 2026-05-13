import MainLayout from '@/components/layouts/MainLayout';
import { landingPages } from '@/lib/landing-pages';
import { getAppUrl } from '@/lib/seo-config';
import { ArrowRight, SearchCheck } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

const baseUrl = getAppUrl();

export const metadata: Metadata = {
    title: 'POS Software Bangladesh Landing Pages | AndgatePOS',
    description: 'Explore AndgatePOS landing pages for POS software, retail POS, restaurant POS, pharmacy POS, grocery POS, inventory and billing software in Bangladesh.',
    alternates: {
        canonical: `${baseUrl}/landing`,
    },
};

export default function LandingIndexPage() {
    return (
        <MainLayout>
            <section className="bg-[#f7fbff] px-4 pb-20 pt-28 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="max-w-3xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#046ca9]/15 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#034d79] shadow-sm">
                            <SearchCheck className="h-4 w-4 text-[#046ca9]" />
                            SEO Landing Pages
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">POS software pages for Bangladesh businesses</h1>
                        <p className="mt-5 text-base leading-8 text-gray-600">
                            Find the right AndgatePOS page for retail billing, inventory, restaurant, pharmacy, grocery and shop management searches in Bangladesh.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {landingPages.map((page) => (
                            <Link key={page.slug} href={`/landing/${page.slug}`} className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{page.eyebrow}</p>
                                <h2 className="mt-3 text-xl font-black text-gray-950">{page.title}</h2>
                                <p className="mt-3 text-sm leading-7 text-gray-600">{page.metaDescription}</p>
                                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#046ca9]">
                                    Open page
                                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
