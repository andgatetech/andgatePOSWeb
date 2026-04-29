'use client';
import { getTranslation } from '@/i18n';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import LanguageDropdown from '../language-dropdown';
import AndGate from '/public/images/andgatePOS.jpeg';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { t } = getTranslation();

    const menuItems = [
        { label: t('layout.nav.home'), href: '/' },
        { label: t('layout.nav.features'), href: '/#features' },
        { label: t('layout.nav.overview'), href: '/#overview' },
        { label: t('layout.nav.pricing'), href: '/pricing' },
        { label: t('layout.nav.training'), href: '/training' },
        { label: t('layout.nav.contact'), href: '/contact' },
    ];

    return (
        <div className="min-h-screen bg-white">
            <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0">
                            <Image src={AndGate} alt="AndgatePOS" width={150} height={30} priority />
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden items-center gap-0.5 md:flex">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden items-center gap-3 md:flex">
                            <LanguageDropdown />
                            <Link
                                href="/login"
                                className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                            >
                                {t('layout.nav.login')}
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-full bg-gradient-to-r from-[#046ca9] to-[#034d79] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#046ca9]/25 transition-all hover:scale-105 hover:shadow-[#046ca9]/40"
                            >
                                {t('layout.nav.get_started')}
                            </Link>
                        </div>

                        {/* Mobile controls */}
                        <div className="flex items-center gap-2 md:hidden">
                            <LanguageDropdown />
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
                            >
                                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="border-t border-gray-100 bg-white shadow-lg md:hidden">
                        <div className="space-y-0.5 px-3 pb-4 pt-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-[#046ca9]/5 hover:text-[#046ca9]"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <div className="my-2 border-t border-gray-100" />
                            <Link
                                href="/login"
                                className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('layout.nav.login')}
                            </Link>
                            <Link
                                href="/register"
                                className="block rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-4 py-2.5 text-center text-sm font-semibold text-white"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('layout.nav.get_started')}
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            <main>{children}</main>
        </div>
    );
}
