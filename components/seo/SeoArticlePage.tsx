'use client';

import MainLayout from '@/components/layouts/MainLayout';
import { type SeoArticle, seoArticles } from '@/lib/seo-articles';
import { ArrowRight, BookOpen, CheckCircle2, HelpCircle, SearchCheck } from 'lucide-react';
import Link from 'next/link';

type Props = {
    article: SeoArticle;
};

export default function SeoArticlePage({ article }: Props) {
    const relatedArticles = seoArticles.filter((item) => item.slug !== article.slug).slice(0, 3);

    return (
        <MainLayout>
            <article>
                <section className="bg-[#f7fbff] pt-24">
                    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#046ca9]/15 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#034d79] shadow-sm">
                            <SearchCheck className="h-4 w-4 text-[#046ca9]" />
                            SEO Guide
                        </div>
                        <h1 className="text-4xl font-black leading-tight text-gray-950 sm:text-5xl">{article.h1}</h1>
                        <p className="mt-5 text-lg font-semibold leading-8 text-[#034d79]">{article.excerpt}</p>
                        <p className="mt-4 text-sm font-semibold text-gray-500">Updated: {article.updatedAt}</p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link href={article.relatedPage} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#046ca9] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#046ca9]/20 transition hover:brightness-105">
                                See related solution
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href="/andgatepos-demo" className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:border-[#046ca9]/30 hover:text-[#046ca9]">
                                Request demo
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="bg-white py-16">
                    <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
                        <aside className="h-fit rounded-2xl border border-gray-100 bg-gray-50 p-6">
                            <BookOpen className="mb-4 h-7 w-7 text-[#046ca9]" />
                            <h2 className="text-xl font-black text-gray-950">Search intent</h2>
                            <p className="mt-3 text-sm leading-7 text-gray-600">{article.audience}</p>
                            <div className="mt-6 space-y-3">
                                {[article.primaryKeyword, ...article.secondaryKeywords].map((keyword) => (
                                    <div key={keyword} className="flex gap-3 text-sm font-semibold text-gray-700">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#046ca9]" />
                                        <span>{keyword}</span>
                                    </div>
                                ))}
                            </div>
                        </aside>

                        <div className="space-y-10">
                            {article.sections.map((section) => (
                                <section key={section.title}>
                                    <h2 className="text-2xl font-black text-gray-950">{section.title}</h2>
                                    <p className="mt-4 text-base leading-8 text-gray-600">{section.body}</p>
                                    {section.bullets?.length ? (
                                        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                                            {section.bullets.map((bullet) => (
                                                <li key={bullet} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm font-semibold leading-6 text-gray-700">
                                                    <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-[#046ca9]" />
                                                    <span>{bullet}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </section>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-gray-50 py-16">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 text-center">
                            <HelpCircle className="mx-auto mb-4 h-8 w-8 text-[#046ca9]" />
                            <h2 className="text-3xl font-black text-gray-950">Frequently asked questions</h2>
                        </div>
                        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm">
                            {article.faq.map((item) => (
                                <details key={item.question} className="group p-6">
                                    <summary className="cursor-pointer list-none text-base font-black text-gray-950">{item.question}</summary>
                                    <p className="mt-3 text-sm leading-7 text-gray-600">{item.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-white py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-black text-gray-950">Related SEO guides</h2>
                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            {relatedArticles.map((item) => (
                                <Link key={item.slug} href={`/blog/${item.slug}`} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{item.primaryKeyword}</p>
                                    <h3 className="mt-3 text-lg font-black text-gray-950">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-gray-600">{item.excerpt}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </article>
        </MainLayout>
    );
}
