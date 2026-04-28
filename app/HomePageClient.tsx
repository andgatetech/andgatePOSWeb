'use client';
import { useCallback, useRef, useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import {
    Archive,
    ArrowRight,
    Banknote,
    BanknoteArrowDown,
    BarChart3,
    Barcode,
    CheckCircle,
    Clock,
    LayoutDashboard,
    Package,
    Pause,
    Play,
    Receipt,
    Settings,
    Shield,
    ShoppingCart,
    Star,
    Store,
    Target,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';

import Link from 'next/link';

import { convertNumberByLanguage } from '@/components/custom/convertNumberByLanguage';
import BangladeshMap from '@/components/map/BangladeshMap';
import { getTranslation } from '@/i18n';
import OverViewSection from './(application)/(public)/pos-overview/OverViewSection';
import PriceSection from './(application)/(public)/price/PriceSection';
import TestimonialsSection from './(application)/(public)/testimonial/TestimonialsSection';
import Footer from './terms-of-service/Footer';

export default function HomePageClient() {
    const { t, data } = getTranslation();

    const videoRef = useRef<HTMLIFrameElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [flashIcon, setFlashIcon] = useState(false);

    const toggleVideo = useCallback(() => {
        const iframe = videoRef.current;
        if (!iframe) return;
        const cmd = isPlaying ? 'pauseVideo' : 'playVideo';
        iframe.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: cmd, args: [] }),
            '*'
        );
        setIsPlaying((p) => !p);
        setFlashIcon(true);
        setTimeout(() => setFlashIcon(false), 700);
    }, [isPlaying]);

    const stats = [
        { number: '100+', label: t('stats_businesses'), icon: <Users className="h-5 w-5" /> },
        { number: '৳1M+', label: t('stats_order'), icon: <TrendingUp className="h-5 w-5" /> },
        { number: '99.9%', label: t('stats_uptime'), icon: <Shield className="h-5 w-5" /> },
        { number: '24/7', label: t('stats_support'), icon: <Clock className="h-5 w-5" /> },
    ];

    const coreModules = [
        {
            icon: <ShoppingCart className="h-7 w-7 text-white" />,
            label: t('core_pos_label'),
            title: t('core_pos_title'),
            description: t('core_pos_desc'),
            highlights: [t('core_pos_h1'), t('core_pos_h2'), t('core_pos_h3'), t('core_pos_h4')],
            gradient: 'from-[#046ca9] to-[#034d79]',
            shadow: 'shadow-[#046ca9]/20',
        },
        {
            icon: <Archive className="h-7 w-7 text-white" />,
            label: t('core_inventory_label'),
            title: t('core_inventory_title'),
            description: t('core_inventory_desc'),
            highlights: [t('core_inventory_h1'), t('core_inventory_h2'), t('core_inventory_h3'), t('core_inventory_h4')],
            gradient: 'from-[#046ca9] to-[#0586cb]',
            shadow: 'shadow-[#046ca9]/20',
        },
        {
            icon: <BarChart3 className="h-7 w-7 text-white" />,
            label: t('core_analytics_label'),
            title: t('core_analytics_title'),
            description: t('core_analytics_desc'),
            highlights: [t('core_analytics_h1'), t('core_analytics_h2'), t('core_analytics_h3'), t('core_analytics_h4')],
            gradient: 'from-[#035887] to-[#046ca9]',
            shadow: 'shadow-[#046ca9]/20',
        },
    ];

    const features = [
        { icon: <LayoutDashboard className="h-5 w-5" />, title: t('feature_dashboard'), description: t('feature_dashboard_desc'), color: 'bg-[#046ca9]/10 text-[#046ca9]' },
        { icon: <ShoppingCart className="h-5 w-5" />, title: t('feature_checkout'), description: t('feature_checkout_desc'), color: 'bg-[#046ca9]/10 text-[#046ca9]' },
        { icon: <BarChart3 className="h-5 w-5" />, title: t('feature_reporting'), description: t('feature_reporting_desc'), color: 'bg-emerald-100 text-emerald-700' },
        { icon: <Users className="h-5 w-5" />, title: t('feature_supplier'), description: t('feature_supplier_desc'), color: 'bg-[#e79237]/10 text-[#e79237]' },
        { icon: <Package className="h-5 w-5" />, title: t('feature_product'), description: t('feature_product_desc'), color: 'bg-pink-100 text-pink-700' },
        { icon: <Receipt className="h-5 w-5" />, title: t('feature_order'), description: t('feature_order_desc'), color: 'bg-[#e79237]/10 text-[#e79237]' },
        { icon: <BanknoteArrowDown className="h-5 w-5" />, title: t('feature_expense'), description: t('feature_expense_desc'), color: 'bg-rose-100 text-rose-700' },
        { icon: <Banknote className="h-5 w-5" />, title: t('feature_accounts'), description: t('feature_accounts_desc'), color: 'bg-teal-100 text-teal-700' },
        { icon: <Users className="h-5 w-5" />, title: t('feature_customer'), description: t('feature_customer_desc'), color: 'bg-[#046ca9]/10 text-[#046ca9]' },
        { icon: <Archive className="h-5 w-5" />, title: t('feature_inventory'), description: t('feature_inventory_desc'), color: 'bg-[#046ca9]/10 text-[#046ca9]' },
        { icon: <Store className="h-5 w-5" />, title: t('feature_multistore'), description: t('feature_multistore_desc'), color: 'bg-[#046ca9]/10 text-[#046ca9]' },
        { icon: <Barcode className="h-5 w-5" />, title: t('feature_barcode'), description: t('feature_barcode_desc'), color: 'bg-yellow-100 text-yellow-700' },
    ];

    const quickStartSteps = [
        { step: '01', title: t('quick_step_1'), description: t('quick_step_1_desc'), icon: <Target className="h-6 w-6 text-white" />, gradient: 'from-[#046ca9] to-[#034d79]' },
        { step: '02', title: t('quick_step_2'), description: t('quick_step_2_desc'), icon: <Settings className="h-6 w-6 text-white" />, gradient: 'from-[#046ca9] to-[#0586cb]' },
        { step: '03', title: t('quick_step_3'), description: t('quick_step_3_desc'), icon: <Package className="h-6 w-6 text-white" />, gradient: 'from-[#035887] to-[#046ca9]' },
        { step: '04', title: t('quick_step_4'), description: t('quick_step_4_desc'), icon: <ShoppingCart className="h-6 w-6 text-white" />, gradient: 'from-[#e79237] to-[#c47920]' },
    ];

    const businessTypes = [
        { emoji: '👗', title: t('business_type_fashion_title'), desc: t('business_type_fashion_desc') },
        { emoji: '🛒', title: t('business_type_grocery_title'), desc: t('business_type_grocery_desc') },
        { emoji: '💻', title: t('business_type_electronics_title'), desc: t('business_type_electronics_desc') },
        { emoji: '💄', title: t('business_type_beauty_title'), desc: t('business_type_beauty_desc') },
        { emoji: '💊', title: t('business_type_pharmacy_title'), desc: t('business_type_pharmacy_desc') },
    ];

    return (
        <MainLayout>

            {/* ── Hero ── */}
            <section className="relative overflow-hidden bg-white pt-16">
                {/* Soft radial glows */}
                <div className="absolute -right-64 -top-64 h-[700px] w-[700px] rounded-full bg-[#046ca9]/10 blur-[120px]" />
                <div className="absolute -left-32 bottom-0 h-[500px] w-[500px] rounded-full bg-[#046ca9]/6 blur-[100px]" />

                <div className="relative mx-auto max-w-7xl px-4 pb-0 pt-16 sm:px-6 sm:pt-20 lg:grid lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-12 lg:px-8 lg:pt-24">
                    {/* Left: Text */}
                    <div className="mx-auto max-w-xl pb-12 lg:mx-0 lg:pb-20">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#046ca9]/20 bg-[#046ca9]/5 px-3.5 py-1.5 text-xs font-semibold text-[#046ca9]">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-[#046ca9]" />
                            🇧🇩 {t('upcoming_feature')}
                        </div>

                        <h1 className="mb-5 text-5xl font-black leading-[1.08] tracking-tight text-gray-900 xl:text-6xl">
                            {t('hero_title')}<br />
                            <span className="bg-gradient-to-r from-[#046ca9] to-[#034d79] text-3xl bg-clip-text text-transparent">
                                {t('hero_subtitle')}
                            </span>
                        </h1>

                        <p className="mb-8 text-sm leading-relaxed text-gray-500">
                            {t('hero_description')}
                        </p>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Link
                                href="/register"
                                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#046ca9] to-[#034d79] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#046ca9]/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#046ca9]/40"
                            >
                                {t('get_started')}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="/training"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                            >
                                <Play className="h-4 w-4 text-[#046ca9]" />
                                {t('watch_demo')}
                            </Link>
                        </div>

                        <div className="mt-7 flex flex-wrap gap-5">
                            {[t('no_payment'), t('free_package'), t('cancel_anytime')].map((text, i) => (
                                <span key={i} className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    {text}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right: Video */}
                    <div className="relative pb-8 lg:pb-16">
                        {/* Floating stat cards */}
                        <div className="absolute -left-6 top-6 z-10 hidden rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl sm:block">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-gray-400">{t('hero_floating_sales_label')}</p>
                                    <p className="text-sm font-black text-gray-900">৳{convertNumberByLanguage('48,250')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-4 bottom-24 z-10 hidden rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl sm:block">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#046ca9]/10">
                                    <ShoppingCart className="h-4 w-4 text-[#046ca9]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-gray-400">{t('hero_floating_orders_label')}</p>
                                    <p className="text-sm font-black text-gray-900">{t('hero_floating_orders_count')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Video frame — clean marketing player */}
                        <div className="group relative overflow-hidden rounded-2xl shadow-2xl shadow-[#046ca9]/20 ring-1 ring-[#046ca9]/15">
                            <div className="relative aspect-video w-full bg-black">
                                <iframe
                                    ref={videoRef}
                                    src="https://www.youtube.com/embed/EwQRFTYUXn0?autoplay=1&mute=1&start=163&loop=1&playlist=EwQRFTYUXn0&controls=0&rel=0&modestbranding=1&enablejsapi=1"
                                    title="AndgatePOS"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    className="absolute inset-0 h-full w-full"
                                />
                                {/* Click overlay — intercepts clicks so YouTube doesn't navigate away */}
                                <div
                                    className="absolute inset-0 cursor-pointer"
                                    onClick={toggleVideo}
                                />
                                {/* Brief play/pause flash */}
                                {flashIcon && (
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                                            {isPlaying
                                                ? <Play className="h-7 w-7 fill-white text-white" />
                                                : <Pause className="h-7 w-7 fill-white text-white" />
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats bar ── */}
            <section className="bg-gradient-to-r from-[#046ca9] to-[#034d79] py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-4 sm:text-left">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                                    {stat.icon}
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-white">{convertNumberByLanguage(stat.number)}</div>
                                    <div className="text-sm text-white/70">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Core Modules ── */}
            <section className="bg-white py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16">
                        <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('features_heading')}</h2>
                        <p className="max-w-2xl text-base text-gray-500">{t('features_description')}</p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {coreModules.map((mod, i) => (
                            <div key={i} className={`group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:${mod.shadow}`}>
                                <div className={`bg-gradient-to-br ${mod.gradient} p-8`}>
                                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                                        {mod.icon}
                                    </div>
                                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-white/50">{mod.label}</p>
                                    <h3 className="text-2xl font-black text-white">{mod.title}</h3>
                                </div>
                                <div className="p-8">
                                    <p className="mb-6 text-sm leading-relaxed text-gray-500">{mod.description}</p>
                                    <ul className="space-y-2.5">
                                        {mod.highlights.map((h, j) => (
                                            <li key={j} className="flex items-center gap-2.5">
                                                <div className={`h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r ${mod.gradient}`} />
                                                <span className="text-sm font-medium text-gray-700">{h}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <span className={`mt-6 inline-flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r ${mod.gradient} bg-clip-text text-transparent`}>
                                        {t('core_learn_more')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── All Features ── */}
            <section id="features" className="bg-gray-50 py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">
                            {t('all_features_heading')}
                        </h2>
                        <p className="mx-auto max-w-2xl text-base text-gray-500">{t('all_features_desc')}</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#046ca9]/20 hover:shadow-lg"
                            >
                                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.color}`}>
                                    {feature.icon}
                                </div>
                                <h3 className="mb-1.5 font-bold text-gray-900">{feature.title}</h3>
                                <p className="text-sm leading-relaxed text-gray-500">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Overview ── */}
            <OverViewSection id="overview" />

            {/* ── How It Works ── */}
            <section id="quick-start" className="bg-white py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('quick_start_title')}</h2>
                        <p className="mx-auto max-w-2xl text-base text-gray-500">{t('quick_start_desc')}</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {quickStartSteps.map((step, i) => (
                            <div key={i} className="relative">
                                {i < quickStartSteps.length - 1 && (
                                    <div className="absolute left-full top-7 hidden w-full items-center justify-center lg:flex">
                                        <div className="h-px w-[calc(100%-1rem)] bg-gradient-to-r from-gray-200 to-gray-100" />
                                        <ArrowRight className="absolute right-2 h-4 w-4 text-gray-300" />
                                    </div>
                                )}
                                <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} shadow-lg`}>
                                    {step.icon}
                                </div>
                                <div className="mb-2 text-5xl font-black text-gray-100 leading-none">{step.step}</div>
                                <h3 className="mb-2 text-base font-bold text-gray-900">{step.title}</h3>
                                <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-14 text-center">
                        <Link
                            href="/training"
                            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-[#046ca9]/20 hover:text-[#046ca9] hover:shadow-md"
                        >
                            <Play className="h-4 w-4 text-[#046ca9]" />
                            {t('watch_video')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Business Types ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79] py-24">
                <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
                <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
                            {t('business_types_badge')}
                        </span>
                        <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">{t('business_types_heading')}</h2>
                        <p className="mx-auto max-w-2xl text-base text-white/60">
                            {t('business_types_subtitle')}
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                        {businessTypes.map((bt, i) => (
                            <div
                                key={i}
                                className="group cursor-default rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white/20"
                            >
                                <div className="mb-4 text-4xl">{bt.emoji}</div>
                                <h3 className="mb-2 font-bold text-white">{bt.title}</h3>
                                <p className="text-sm leading-relaxed text-white/60">{bt.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                        >
                            {t('business_types_cta')}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <TestimonialsSection />

            {/* ── Bangladesh Map ── */}
            <section id="store-map" className="bg-gray-50 py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">
                            🇧🇩 {t('map_heading')}
                        </h2>
                        <p className="mx-auto max-w-2xl text-base text-gray-500">
                            {t('map_subtitle')}
                        </p>
                    </div>
                    <BangladeshMap />
                    <div className="mt-8 flex flex-wrap justify-center gap-2">
                        {(data.map_divisions as string[] || []).map((div: string) => (
                            <span key={div} className="rounded-full border border-[#046ca9]/20 bg-[#046ca9]/5 px-4 py-1.5 text-sm font-semibold text-[#046ca9]">
                                {div}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Pricing ── */}
            <PriceSection id="pricing" />

            {/* ── Final CTA ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79] py-28">
                <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-white/10 blur-[120px]" />
                <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-white/10 blur-[100px]" />

                <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                    </div>
                    <h2 className="mb-5 text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
                        {t('cta_title')}
                    </h2>
                    <p className="mb-10 text-lg leading-relaxed text-white/75">{t('cta_desc')}</p>
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href="/register"
                            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#046ca9] to-[#034d79] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#046ca9]/30 transition-all hover:scale-105 hover:shadow-xl"
                        >
                            {t('cta_start')}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
                        >
                            {t('cta_signin')}
                        </Link>
                    </div>
                    <p className="mt-8 text-sm text-white/60">{t('cta_benefits')}</p>
                </div>
            </section>

            <Footer />
        </MainLayout>
    );
}
