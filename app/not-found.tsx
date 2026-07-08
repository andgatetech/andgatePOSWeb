import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslation } from '@/i18n';
import MainLayout from '@/components/layouts/MainLayout';
import { CreditCard, GitCompare, Home, Mail, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Error 404',
};

const NotFound = () => {
    const { t } = getTranslation();

    const popularLinks = [
        { label: t('layout.nav.home'), href: '/', icon: Home },
        { label: t('layout.nav.pricing'), href: '/pricing', icon: CreditCard },
        { label: t('layout.nav.compare'), href: '/compare', icon: GitCompare },
        { label: t('layout.nav.contact'), href: '/contact', icon: Mail },
    ];

    return (
        <MainLayout>
            <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-[#f6f9fc] pt-16">
                <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[#046ca9]/10 blur-3xl" />
                <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-[#e79237]/10 blur-3xl" />

                <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
                    <p className="bg-gradient-to-r from-[#046ca9] to-[#e79237] bg-clip-text text-7xl font-black leading-none text-transparent sm:text-8xl">
                        404
                    </p>
                    <h1 className="mt-5 text-2xl font-black leading-tight text-gray-950 sm:text-3xl">
                        {t('error_404_title') || 'Page not found'}
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500 sm:text-base">
                        {t('error_404_subtitle') || "The page may have been moved, renamed, or the link may be outdated. Let's get you back on track."}
                    </p>

                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#046ca9] to-[#034d79] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#046ca9]/25 transition-all hover:brightness-105 sm:w-auto"
                        >
                            <Home className="h-4 w-4" />
                            {t('btn_go_home') || 'Go to Homepage'}
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-[#046ca9]/30 hover:text-[#046ca9] sm:w-auto"
                        >
                            <MessageCircle className="h-4 w-4" />
                            {t('btn_contact_support') || 'Contact Support'}
                        </Link>
                    </div>

                    <div className="mt-12">
                        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                            {t('error_404_popular_links') || 'You might be looking for'}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {popularLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-[#046ca9]/30 hover:text-[#046ca9]"
                                    >
                                        <Icon className="h-4 w-4 text-[#046ca9]" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};

export default NotFound;
