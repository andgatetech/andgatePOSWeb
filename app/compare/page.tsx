import MainLayout from '@/components/layouts/MainLayout';
import { comparePages } from '@/lib/high-intent-pages';
import { getAppUrl } from '@/lib/seo-config';
import { ArrowRight } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'AndgatePOS Comparisons | POS Software vs Manual, Excel & Other Platforms',
    description:
        'Compare AndgatePOS with manual registers, Excel sheets, Mediasoft and other POS software used by Bangladeshi shops — pricing, ecommerce, multi-store and support.',
    alternates: {
        canonical: `${getAppUrl()}/compare`,
    },
};

export default function ComparePage() {
    return (
        <MainLayout>
            <div className="mx-auto max-w-5xl px-4 py-28 sm:px-6 lg:px-8">
                <p className="text-sm font-semibold uppercase tracking-widest text-[#046ca9]">Comparisons</p>
                <h1 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl">
                    See how AndgatePOS compares
                </h1>
                <p className="mt-4 max-w-2xl text-gray-600">
                    Pick a comparison below to see how AndgatePOS stacks up against manual registers, spreadsheets, and other POS software used by shops in Bangladesh.
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    {comparePages.map((page) => (
                        <Link
                            key={page.path}
                            href={page.path}
                            className="group flex flex-col justify-between rounded-xl border border-gray-200 p-6 transition-all hover:border-[#046ca9]/40 hover:shadow-md"
                        >
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#046ca9]">{page.eyebrow}</p>
                                <h2 className="mt-2 text-lg font-bold text-gray-900">{page.title}</h2>
                            </div>
                            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#046ca9]">
                                Read comparison
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}
