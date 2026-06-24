'use client';

import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import { useGetPublicStatsQuery } from '@/store/features/publicStats/publicStatsApi';
import { Mail, MapPin, Phone, Store } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    const { t } = getTranslation();
    const { data: publicStatsData } = useGetPublicStatsQuery();
    const activeStores = publicStatsData?.data?.active_stores;

    return (
        <MainLayout>
            <section className="bg-gradient-to-b from-[#046ca9]/5 to-white px-4 pb-16 pt-32 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{t('about.eyebrow')}</p>
                    <h1 className="mt-3 text-3xl font-black text-gray-900 sm:text-5xl">{t('about.hero_title')}</h1>
                    <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">{t('about.hero_subtitle')}</p>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{t('about.mission_title')}</h2>
                        <p className="mt-4 leading-relaxed text-gray-600">{t('about.mission_text')}</p>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{t('about.what_we_do_title')}</h2>
                        <p className="mt-4 leading-relaxed text-gray-600">{t('about.what_we_do_text')}</p>
                    </div>
                </div>
            </section>

            {!!activeStores && (
                <section className="bg-[#046ca9]/5 px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-3 text-center">
                        <Store className="h-8 w-8 text-[#046ca9]" />
                        <p className="text-4xl font-black text-gray-900">{activeStores}+</p>
                        <p className="text-sm font-medium text-gray-600">{t('about.stats_stores_label')}</p>
                    </div>
                </section>
            )}

            <section className="px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
                    <h2 className="text-2xl font-bold text-gray-900">{t('about.contact_title')}</h2>
                    <div className="mt-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#046ca9]" />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('about.address_label')}</p>
                                <p className="text-sm text-gray-700">House 34, Road 3, Block B, Aftabnagar, Badda, Dhaka, Bangladesh</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#046ca9]" />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('about.phone_label')}</p>
                                <a href="tel:+8801577303608" className="text-sm text-gray-700 hover:text-[#046ca9]">+880 1577303608</a>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#046ca9]" />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('about.email_label')}</p>
                                <a href="mailto:support@andgatetech.net" className="text-sm text-gray-700 hover:text-[#046ca9]">support@andgatetech.net</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-r from-[#046ca9] to-[#034d79] px-4 py-14 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
                    <h2 className="text-2xl font-black text-white sm:text-3xl">{t('about.cta_title')}</h2>
                    <p className="text-white/80">{t('about.cta_subtitle')}</p>
                    <Link
                        href="/register"
                        className="rounded-full bg-white px-7 py-3 text-sm font-bold text-[#046ca9] shadow-xl transition-all hover:scale-105"
                    >
                        {t('about.cta_button')}
                    </Link>
                </div>
            </section>
        </MainLayout>
    );
}
