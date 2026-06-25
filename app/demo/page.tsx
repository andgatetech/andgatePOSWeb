'use client';

import { Metadata } from 'next';
import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import { Play, Clock, Shield, Zap, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const highlights = (t: any) => [
    { icon: Zap, title: t('demo_pos_title'), desc: t('demo_pos_desc') },
    { icon: Shield, title: t('demo_inventory_title'), desc: t('demo_inventory_desc') },
    { icon: Clock, title: t('demo_accounting_title'), desc: t('demo_accounting_desc') },
    { icon: Users, title: t('demo_ecommerce_title'), desc: t('demo_ecommerce_desc') },
];

export default function DemoPage() {
    const { t } = getTranslation();
    const H = highlights(t);
    const moreItems = t('demo_more_items').split(',');

    return (
        <MainLayout>
            <section className="bg-gradient-to-b from-[#023a5c] to-[#046ca9] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-200">
                        {t('demo_badge')}
                    </span>
                    <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl lg:text-5xl">{t('demo_hero_title')}</h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">{t('demo_hero_subtitle')}</p>
                </div>
            </section>

            <section className="-mt-8 px-4 pb-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="overflow-hidden rounded-2xl shadow-2xl">
                        <div className="relative bg-black" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                                className="absolute inset-0 h-full w-full"
                                src="https://www.youtube.com/embed/EwQRFTYUXn0?rel=0&modestbranding=1"
                                title="AndgatePOS Demo"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                    <p className="mt-3 text-center text-sm text-gray-400">{t('demo_video_hint')}</p>
                </div>
            </section>

            <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{t('demo_features_eyebrow')}</p>
                    <h2 className="mt-3 text-2xl font-black text-gray-900 sm:text-3xl">{t('demo_features_title')}</h2>
                </div>
                <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
                    {H.map((h) => (
                        <div key={h.title} className="flex gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#046ca9]/10">
                                <h.icon className="h-5 w-5 text-[#046ca9]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{h.title}</h3>
                                <p className="mt-1 text-sm text-gray-500">{h.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mx-auto mt-10 max-w-4xl">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900">{t('demo_more_title')}</h3>
                        <div className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                            {moreItems.map((item) => (
                                <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-r from-[#046ca9] to-[#023a5c] px-4 py-16 text-white sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
                    <Play className="h-10 w-10" />
                    <h2 className="text-2xl font-black sm:text-3xl">{t('demo_cta_title')}</h2>
                    <p className="max-w-xl text-blue-100">{t('demo_cta_subtitle')}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#046ca9] shadow-xl transition-all hover:scale-105">
                            {t('demo_cta_start')} <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/contact" className="rounded-full border-2 border-white/40 px-7 py-3 text-sm font-semibold text-white transition-all hover:border-white hover:bg-white/10">
                            {t('demo_cta_talk')}
                        </Link>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
