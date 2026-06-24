'use client';
import { convertNumberByLanguage } from '@/components/custom/convertNumberByLanguage';
import { getTranslation } from '@/i18n';
import { comparePages } from '@/lib/high-intent-pages';
import {
    ArrowRight,
    Facebook,
    Mail,
    MapPin,
    Phone,
    Truck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const AndGate = '/images/andgatePOS.jpeg';
const FACEBOOK_URL = 'https://www.facebook.com/andgatepos';
const courierPartners = [
    { name: 'Pathao', logo: '/images/delivery/pathao.svg', width: 92, height: 32 },
    { name: 'REDX', logo: '/images/delivery/redx.svg', width: 88, height: 34 },
    { name: 'Steadfast', logo: '/images/delivery/steadfast.svg', width: 126, height: 28 },
];

const Footer = () => {
    const { t, data } = getTranslation();

    const productLinks = [
        { label: t('footer.nav.features'), href: '/#features' },
        { label: t('footer.nav.pricing'), href: '/pricing' },
        { label: t('footer.nav.overview'), href: '/#overview' },
        { label: t('footer.nav.training'), href: '/training' },
        { label: t('footer.nav.promotion') || 'বিশেষ অফার', href: '/promotion/pos' },
    ];

    const companyLinks = [
        { label: t('footer.nav.about_us'), href: '/about' },
        { label: t('footer.nav.contact_us'), href: '/contact' },
        { label: t('footer.nav.privacy_policy'), href: '/privacy-policy' },
        { label: t('footer.nav.terms_of_service'), href: '/terms-of-service' },
        { label: t('footer.nav.cookie_policy'), href: '/cookie-policy' },
    ];

    const compareLinks = [
        { label: t('footer.nav.compare'), href: '/compare' },
        ...comparePages.map((page) => ({ label: page.title, href: page.path })),
    ];

    const affiliateLinks = [
        { label: 'Partner প্রমোশন', href: '/promotion/partner' },
        { label: 'Partner হোম', href: '/affiliate' },
        { label: 'কমিশন ক্যালকুলেটর', href: '/affiliate/calculator' },
        { label: 'লিডারবোর্ড', href: '/affiliate/leaderboard' },
        { label: 'আমার ড্যাশবোর্ড', href: '/affiliate/portal' },
    ];

    const socialLinks = [
        { icon: <Facebook className="h-4 w-4" />, href: FACEBOOK_URL, label: 'Facebook' },
    ];

    const contactItems = [
        { icon: <MapPin className="h-4 w-4 flex-shrink-0 text-[#046ca9]" />, text: t('contact.contact_info.visit.address') || 'House: 34, Road: 3, Block: B, Aftabnagar, Badda, Dhaka, Bangladesh' },
        { icon: <Phone className="h-4 w-4 flex-shrink-0 text-[#046ca9]" />, text: t('contact.contact_info.call.phone') || '+880 1577303608' },
        { icon: <Mail className="h-4 w-4 flex-shrink-0 text-[#046ca9]" />, text: t('contact.contact_info.email.email') || 'support@andgatetech.net' },
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
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">

                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="mb-5 inline-block">
                            <div className="overflow-hidden rounded-xl bg-white px-4 py-2 shadow-sm">
                                <Image
                                    src={AndGate}
                                    alt="AndgatePOS"
                                    width={150}
                                    height={50}
                                    className="block h-8 w-auto object-contain"
                                    style={{ width: 'auto' }}
                                />
                            </div>
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

                    {/* Compare Links */}
                    <div>
                        <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-500">{t('footer.nav.compare')}</h4>
                        <ul className="space-y-3">
                            {compareLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Partner Program Links */}
                    <div>
                        <h4 className="mb-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#e79237]">
                            Partner Program
                        </h4>
                        <ul className="space-y-3">
                            {affiliateLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-[#e79237]">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/affiliate"
                            className="mt-4 inline-block rounded-lg border border-[#e79237]/40 bg-[#e79237]/10 px-3 py-1.5 text-xs font-semibold text-[#e79237] transition hover:bg-[#e79237]/20"
                        >
                            Partner হন →
                        </Link>
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
                <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 md:flex-row">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Truck className="h-4 w-4 text-[#4db8f2]" aria-hidden="true" />
                            <span>We support courier delivery with</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2.5">
                            {courierPartners.map((partner) => (
                                <div
                                    key={partner.name}
                                    className="inline-flex h-11 items-center justify-center rounded-md border border-white/10 bg-white px-3 shadow-sm transition-colors hover:border-[#4db8f2]/40"
                                >
                                    <Image src={partner.logo} alt={`${partner.name} courier logo`} width={partner.width} height={partner.height} className="max-h-7 w-auto object-contain" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
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
            </div>
        </footer>
    );
};

export default Footer;
