'use client';
import { convertNumberByLanguage } from '@/components/custom/convertNumberByLanguage';
import { getTranslation } from '@/i18n';
import {
    ArrowRight,
    Facebook,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Phone,
    Twitter,
    Youtube,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import AndGate from '/public/images/andgatePOS.jpeg';

const Footer = () => {
    const { t, data } = getTranslation();

    const productLinks = [
        { label: t('footer.nav.features'), href: '/#features' },
        { label: t('footer.nav.pricing'), href: '/pricing' },
        { label: t('footer.nav.overview'), href: '/#overview' },
        { label: t('footer.nav.training'), href: '/training' },
    ];

    const companyLinks = [
        { label: t('footer.nav.contact_us'), href: '/contact' },
        { label: t('footer.nav.privacy_policy'), href: '/privacy-policy' },
        { label: t('footer.nav.terms_of_service'), href: '/terms-of-service' },
        { label: t('footer.nav.cookie_policy'), href: '/cookie-policy' },
    ];

    const socialLinks = [
        { icon: <Facebook className="h-4 w-4" />, href: '#', label: 'Facebook' },
        { icon: <Twitter className="h-4 w-4" />, href: '#', label: 'Twitter' },
        { icon: <Linkedin className="h-4 w-4" />, href: '#', label: 'LinkedIn' },
        { icon: <Youtube className="h-4 w-4" />, href: '#', label: 'YouTube' },
        { icon: <Instagram className="h-4 w-4" />, href: '#', label: 'Instagram' },
    ];

    const contactItems = [
        { icon: <MapPin className="h-4 w-4 flex-shrink-0 text-[#046ca9]" />, text: t('contact.contact_info.visit.address') || 'Dhaka, Bangladesh' },
        { icon: <Phone className="h-4 w-4 flex-shrink-0 text-[#046ca9]" />, text: t('contact.contact_info.call.phone') || '+880 1234 567890' },
        { icon: <Mail className="h-4 w-4 flex-shrink-0 text-[#046ca9]" />, text: t('contact.contact_info.email.email') || 'hello@andgatepos.com' },
    ];

    return (
        <footer className="bg-[#02263c]">
            {/* CTA Band */}
            <div className="relative overflow-hidden border-b border-white/5 bg-gradient-to-r from-[#046ca9] via-[#035887] to-[#034d79]">
                <div className="pointer-events-none absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{t('footer.cta.badge')}</p>
                            <h3 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                                {t('footer.cta.heading')}
                            </h3>
                        </div>
                        <Link
                            href="/register"
                            className="group flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-7 py-3 text-sm font-bold text-[#046ca9] shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-white/25"
                        >
                            {t('footer.cta.button')}
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Footer Body */}
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="mb-5 inline-block">
                            <Image
                                src={AndGate}
                                alt="AndgatePOS"
                                width={160}
                                height={32}
                                className="block brightness-0 invert"
                            />
                        </Link>
                        <p className="mb-6 text-sm leading-relaxed text-slate-400">
                            {t('footer.brand.description') || 'Empowering businesses across Bangladesh with cutting-edge point-of-sale technology. Streamline operations, grow revenue, stay in control.'}
                        </p>
                        <div className="flex gap-2">
                            {socialLinks.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all duration-200 hover:border-[#046ca9]/50 hover:bg-[#046ca9]/10 hover:text-[#046ca9]"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-500">{t('footer.nav.product')}</h4>
                        <ul className="space-y-3">
                            {productLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-500">{t('footer.nav.company')}</h4>
                        <ul className="space-y-3">
                            {companyLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-500">{t('footer.nav.contact')}</h4>
                        <ul className="space-y-4">
                            {contactItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="mt-0.5">{item.icon}</span>
                                    <span className="text-sm leading-snug text-slate-400">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
                    <p className="text-xs text-slate-500">
                        © {convertNumberByLanguage(new Date().getFullYear().toString())}{' '}
                        <a href="https://andgatetech.net" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-slate-300">
                            Andgate Technologies
                        </a>. {t('footer.footerNote')}
                    </p>
                    <div className="flex gap-5">
                        {data?.footer?.policies?.map((policy: { href: string; label: string }, idx: number) => (
                            <Link key={idx} href={policy.href} className="text-xs text-slate-500 transition-colors hover:text-slate-300">
                                {policy.label}
                            </Link>
                        )) ?? (
                            <>
                                <Link href="/privacy-policy" className="text-xs text-slate-500 transition-colors hover:text-slate-300">{t('footer.nav.privacy_policy')}</Link>
                                <Link href="/terms-of-service" className="text-xs text-slate-500 transition-colors hover:text-slate-300">{t('footer.nav.terms_of_service')}</Link>
                                <Link href="/cookie-policy" className="text-xs text-slate-500 transition-colors hover:text-slate-300">{t('footer.nav.cookie_policy')}</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
