'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import {
    Archive,
    ArrowRight,
    Banknote,
    BanknoteArrowDown,
    BarChart3,
    Barcode,
    Bell,
    CheckCircle,
    ChevronDown,
    ClipboardList,
    Clock,
    ExternalLink,
    FileText,
    Gift,
    Globe,
    Heart,
    Layers,
    LayoutDashboard,
    Maximize2,
    Minimize2,
    Package,
    Pause,
    Play,
    Receipt,
    RefreshCw,
    RotateCcw,
    Settings,
    Shield,
    ShoppingCart,
    Signal,
    Star,
    Store,
    Tag,
    Target,
    TrendingUp,
    Truck,
    Users,
    Volume2,
    VolumeX,
    Wifi,
    WifiOff,
    Zap,
} from 'lucide-react';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

import { convertNumberByLanguage } from '@/components/custom/convertNumberByLanguage';
import InstallAppButton from '@/components/custom/InstallAppButton';
import { useTranslation } from '@/components/i18n/TranslationProvider';
import { highIntentPages } from '@/lib/high-intent-pages';
import { landingPages } from '@/lib/landing-pages';
import { landingCopyBn } from '@/components/seo/LandingSeoPageView';
import { useGetPublicStatsQuery } from '@/store/features/publicStats/publicStatsApi';

// Heavy sections loaded lazily — keeps initial JS bundle small
const OverViewSection = dynamic(
    () => import('./(application)/(public)/pos-overview/OverViewSection'),
    {
        ssr: false,
        loading: () => (
            <div className="mx-auto my-12 max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-[#046ca9]/10 bg-white p-6 shadow-sm">
                    <div className="h-5 w-40 animate-pulse rounded bg-[#046ca9]/10" />
                    <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
                        <div className="space-y-3">
                            <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                            <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                            <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                        </div>
                    </div>
                </div>
            </div>
        ),
    }
);

const TestimonialsSection = dynamic(
    () => import('./(application)/(public)/testimonial/TestimonialsSection')
);

const PriceSection = dynamic(
    () => import('./(application)/(public)/price/PriceSection'),
    {
        loading: () => (
            <div className="bg-gray-50 py-16">
                <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 xl:grid-cols-5 lg:px-8">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-80 animate-pulse rounded-2xl border border-gray-100 bg-white shadow-sm" />
                    ))}
                </div>
            </div>
        ),
    }
);

const BangladeshMap = dynamic(
    () => import('@/components/map/BangladeshMap'),
    { ssr: false, loading: () => <div className="h-[560px] animate-pulse rounded-2xl border border-[#046ca9]/10 bg-[#046ca9]/5" /> }
);

export default function HomePageClient() {
    const { t, data, i18n } = useTranslation();
    const isBn = i18n.language === 'bn';
    const localizeNumber = useCallback((value: string | number) => convertNumberByLanguage(value, i18n.language), [i18n.language]);

    const videoRef = useRef<HTMLIFrameElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const { data: publicStatsData } = useGetPublicStatsQuery();
    const activeStores = publicStatsData?.data?.active_stores;
    const businessCount = activeStores ? Math.max(10, Math.floor(activeStores / 10) * 10) : 100;

    const toggleVideo = useCallback(() => {
        const iframe = videoRef.current;
        if (!iframe) return;
        const cmd = isPlaying ? 'pauseVideo' : 'playVideo';
        iframe.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: cmd, args: [] }),
            '*'
        );
        setIsPlaying((p) => !p);
    }, [isPlaying]);

    const toggleMute = useCallback(() => {
        const iframe = videoRef.current;
        if (!iframe) return;
        const cmd = isMuted ? 'unMute' : 'mute';
        iframe.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: cmd, args: [] }),
            '*'
        );
        setIsMuted((m) => !m);
    }, [isMuted]);

    const toggleFullscreen = useCallback(() => {
        const el = videoContainerRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }, []);

    useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    const stats = [
        { number: `${localizeNumber(String(businessCount))}+`, label: t('stats_businesses'), icon: <Users className="h-5 w-5" /> },
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
            href: '/features/pos',
        },
        {
            icon: <Archive className="h-7 w-7 text-white" />,
            label: t('core_inventory_label'),
            title: t('core_inventory_title'),
            description: t('core_inventory_desc'),
            highlights: [t('core_inventory_h1'), t('core_inventory_h2'), t('core_inventory_h3'), t('core_inventory_h4')],
            gradient: 'from-[#046ca9] to-[#0586cb]',
            shadow: 'shadow-[#046ca9]/20',
            href: '/features/inventory',
        },
        {
            icon: <BarChart3 className="h-7 w-7 text-white" />,
            label: t('core_analytics_label'),
            title: t('core_analytics_title'),
            description: t('core_analytics_desc'),
            highlights: [t('core_analytics_h1'), t('core_analytics_h2'), t('core_analytics_h3'), t('core_analytics_h4')],
            gradient: 'from-[#035887] to-[#046ca9]',
            shadow: 'shadow-[#046ca9]/20',
            href: '/features/reports',
        },
    ];

    const features = [
        { icon: <LayoutDashboard className="h-5 w-5" />, title: t('feature_dashboard'),      description: t('feature_dashboard_desc'),      color: 'bg-[#046ca9]/10 text-[#046ca9]' },
        { icon: <Store          className="h-5 w-5" />, title: t('feature_business_os'),     description: t('feature_business_os_desc'),     color: 'bg-[#046ca9]/10 text-[#046ca9]' },
        { icon: <ShoppingCart   className="h-5 w-5" />, title: t('feature_pos'),             description: t('feature_pos_desc'),            color: 'bg-[#046ca9]/10 text-[#046ca9]' },
        { icon: <Clock          className="h-5 w-5" />, title: t('feature_cash_closing'),    description: t('feature_cash_closing_desc'),   color: 'bg-amber-100 text-amber-700' },
        { icon: <Banknote       className="h-5 w-5" />, title: t('feature_cash_drawer'),     description: t('feature_cash_drawer_desc'),    color: 'bg-lime-100 text-lime-700' },
        { icon: <Banknote       className="h-5 w-5" />, title: t('feature_petty_cash'),      description: t('feature_petty_cash_desc'),     color: 'bg-emerald-100 text-emerald-700' },
        { icon: <ClipboardList  className="h-5 w-5" />, title: t('feature_purchase'),        description: t('feature_purchase_desc'),        color: 'bg-emerald-100 text-emerald-700' },
        { icon: <Archive        className="h-5 w-5" />, title: t('feature_inventory'),       description: t('feature_inventory_desc'),       color: 'bg-[#046ca9]/10 text-[#046ca9]' },
        { icon: <Package        className="h-5 w-5" />, title: t('feature_product'),         description: t('feature_product_desc'),         color: 'bg-pink-100 text-pink-700' },
        { icon: <Receipt        className="h-5 w-5" />, title: t('feature_order'),           description: t('feature_order_desc'),           color: 'bg-[#e79237]/10 text-[#e79237]' },
        { icon: <Truck          className="h-5 w-5" />, title: t('feature_supplier'),        description: t('feature_supplier_desc'),        color: 'bg-[#e79237]/10 text-[#e79237]' },
        { icon: <Users          className="h-5 w-5" />, title: t('feature_customer'),        description: t('feature_customer_desc'),        color: 'bg-[#046ca9]/10 text-[#046ca9]' },
        { icon: <Gift           className="h-5 w-5" />, title: t('feature_crm'),             description: t('feature_crm_desc'),            color: 'bg-pink-100 text-pink-700' },
        { icon: <Layers         className="h-5 w-5" />, title: t('feature_catbrand'),        description: t('feature_catbrand_desc'),        color: 'bg-purple-100 text-purple-700' },
        { icon: <BanknoteArrowDown className="h-5 w-5" />, title: t('feature_expense'),      description: t('feature_expense_desc'),         color: 'bg-rose-100 text-rose-700' },
        { icon: <Banknote       className="h-5 w-5" />, title: t('feature_accounts'),        description: t('feature_accounts_desc'),        color: 'bg-teal-100 text-teal-700' },
        { icon: <BarChart3      className="h-5 w-5" />, title: t('feature_reporting'),       description: t('feature_reporting_desc'),       color: 'bg-emerald-100 text-emerald-700' },
        { icon: <Shield         className="h-5 w-5" />, title: t('feature_staff'),           description: t('feature_staff_desc'),           color: 'bg-purple-100 text-purple-700' },
        { icon: <Users          className="h-5 w-5" />, title: t('feature_attendance'),      description: t('feature_attendance_desc'),     color: 'bg-sky-100 text-sky-700' },
        { icon: <Users          className="h-5 w-5" />, title: t('feature_payroll'),         description: t('feature_payroll_desc'),        color: 'bg-indigo-100 text-indigo-700' },
        { icon: <Clock          className="h-5 w-5" />, title: t('feature_leave_shift'),     description: t('feature_leave_shift_desc'),    color: 'bg-cyan-100 text-cyan-700' },
        { icon: <Settings       className="h-5 w-5" />, title: t('feature_service_jobs'),    description: t('feature_service_jobs_desc'),   color: 'bg-slate-100 text-slate-700' },
        { icon: <Barcode        className="h-5 w-5" />, title: t('feature_barcode'),         description: t('feature_barcode_desc'),         color: 'bg-yellow-100 text-yellow-700' },
        { icon: <Store          className="h-5 w-5" />, title: t('feature_multistore'),      description: t('feature_multistore_desc'),      color: 'bg-[#046ca9]/10 text-[#046ca9]' },
        { icon: <Globe          className="h-5 w-5" />, title: t('feature_ecommerce'),       description: t('feature_ecommerce_desc'),      color: 'bg-emerald-100 text-emerald-700' },
        { icon: <Truck          className="h-5 w-5" />, title: t('feature_courier_fraud'),   description: t('feature_courier_fraud_desc'),  color: 'bg-orange-100 text-orange-700' },
        { icon: <Bell           className="h-5 w-5" />, title: t('feature_notifications'),   description: t('feature_notifications_desc'),   color: 'bg-amber-100 text-amber-700' },
        { icon: <RotateCcw      className="h-5 w-5" />, title: t('feature_returns'),          description: t('feature_returns_desc'),         color: 'bg-rose-100 text-rose-700' },
        { icon: <Heart          className="h-5 w-5" />, title: t('feature_loyalty'),          description: t('feature_loyalty_desc'),         color: 'bg-pink-100 text-pink-700' },
        { icon: <WifiOff        className="h-5 w-5" />, title: t('feature_offline'),          description: t('feature_offline_desc'),         color: 'bg-slate-100 text-slate-700' },
        { icon: <FileText       className="h-5 w-5" />, title: t('feature_vat'),              description: t('feature_vat_desc'),             color: 'bg-teal-100 text-teal-700' },
    ];

    const whyUs = [
        { icon: <WifiOff  className="h-6 w-6" />, title: t('why_us_1_title'), desc: t('why_us_1_desc'), color: 'bg-slate-100 text-slate-700',   border: 'border-slate-200' },
        { icon: <Signal   className="h-6 w-6" />, title: t('why_us_2_title'), desc: t('why_us_2_desc'), color: 'bg-[#046ca9]/10 text-[#046ca9]', border: 'border-[#046ca9]/20' },
        { icon: <Globe    className="h-6 w-6" />, title: t('why_us_3_title'), desc: t('why_us_3_desc'), color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' },
        { icon: <BarChart3 className="h-6 w-6" />, title: t('why_us_4_title'), desc: t('why_us_4_desc'), color: 'bg-amber-100 text-amber-700',  border: 'border-amber-200' },
        { icon: <Store    className="h-6 w-6" />, title: t('why_us_5_title'), desc: t('why_us_5_desc'), color: 'bg-purple-100 text-purple-700',  border: 'border-purple-200' },
    ];

    const bdPayments = [
        { label: t('bd_payments_cash'),  emoji: '💵', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
        { label: 'bKash',                emoji: '📱', color: 'bg-pink-50 border-pink-200 text-pink-800' },
        { label: 'Nagad',                emoji: '📲', color: 'bg-orange-50 border-orange-200 text-orange-800' },
        { label: 'Rocket',               emoji: '🚀', color: 'bg-purple-50 border-purple-200 text-purple-800' },
        { label: 'Upay',                 emoji: '💳', color: 'bg-blue-50 border-blue-200 text-blue-800' },
        { label: t('bd_payments_card'),  emoji: '💳', color: 'bg-[#046ca9]/5 border-[#046ca9]/20 text-[#046ca9]' },
        { label: t('bd_payments_bank'),  emoji: '🏦', color: 'bg-gray-50 border-gray-200 text-gray-700' },
    ];

    const reportTypes = [
        t('report_type_sales'), t('report_type_purchase'), t('report_type_inventory'),
        t('report_type_lowstock'), t('report_type_expense'), t('report_type_pl'),
        t('report_type_vat'), t('report_type_supplier'), t('report_type_customer'),
        t('report_type_invoice'), t('report_type_returns'), t('report_type_threshold'),
        t('report_type_business_overview'), t('report_type_cod'), t('report_type_fiscal'),
    ];

    const productScreenshots = [
        {
            image: '/assets/product-screenshots/current/desktop/dashboard/dashboard__dashboard.png',
            title: isBn ? 'মালিকের লাইভ ড্যাশবোর্ড' : 'Owner Live Dashboard',
            desc: isBn ? 'বিক্রি, অর্ডার, পেমেন্ট, স্টক অ্যালার্ট ও দৈনিক অপারেশন এক স্ক্রিনে।' : 'Sales, orders, payment mix, stock alerts, and daily operating signals in one screen.',
            href: '/demo',
        },
        {
            image: '/assets/product-screenshots/current/desktop/business-os/business-os__business-os.png',
            title: isBn ? 'Business OS কমান্ড সেন্টার' : 'Business OS Command Center',
            desc: isBn ? 'Cash closing, petty cash, due, service jobs, stock exceptions এবং owner tasks এক জায়গায়।' : 'Cash closing, petty cash, dues, service jobs, stock exceptions, and owner tasks in one operating view.',
            href: '/features/reports',
        },
        {
            image: '/assets/product-screenshots/current/desktop/reports-business-overview/reports-business-overview__reports__business-overview.png',
            title: isBn ? 'স্টোরভিত্তিক ও সামগ্রিক রিপোর্ট' : 'Store-by-Store and Overall Reports',
            desc: isBn ? 'একাধিক দোকান থাকলে branch-wise এবং total business performance আলাদা করে দেখুন।' : 'For multi-store owners, review each branch and the total business performance from the same reporting surface.',
            href: '/features/reports',
        },
        {
            image: '/assets/product-screenshots/current/desktop/analytics/analytics-branch-benchmarking__analytics__branch-benchmarking.png',
            title: isBn ? 'Analytics ও BI' : 'Analytics and BI',
            desc: isBn ? 'Branch benchmarking, cash-flow forecast, custom reports এবং scheduled reporting দিয়ে সিদ্ধান্ত নিন।' : 'Branch benchmarking, cash-flow forecasting, custom reports, and scheduled reporting for owner decisions.',
            href: '/features/reports',
        },
        {
            image: '/assets/product-screenshots/current/desktop/ecommerce/ecommerce-cod-reconciliation__ecommerce__cod-reconciliation.png',
            title: isBn ? 'Courier COD reconciliation' : 'Courier COD Reconciliation',
            desc: isBn ? 'Pathao, Steadfast বা RedX order-এর COD collected, paid, fee ও unsettled amount মিলিয়ে দেখুন।' : 'Track collected, paid, fee, returned, and unsettled COD across courier-connected online orders.',
            href: '/features/reports',
        },
        {
            image: '/assets/product-screenshots/current/desktop/fiscal-compliance/fiscal-compliance__fiscal-compliance.png',
            title: isBn ? 'Fiscal readiness ও compliance' : 'Fiscal Readiness and Compliance',
            desc: isBn ? 'Invoice evidence, compliance calendar ও controlled claim messaging রাখুন; certified দাবি শুধু official হলে।' : 'Keep invoice evidence, compliance calendar tasks, and controlled claim messaging without overstating certification.',
            href: '/features/reports',
        },
    ];

    const faqs = [
        { q: t('faq_q1'), a: t('faq_a1') },
        { q: t('faq_q2'), a: t('faq_a2') },
        { q: t('faq_q3'), a: t('faq_a3') },
        { q: t('faq_q4'), a: t('faq_a4') },
        { q: t('faq_q5'), a: t('faq_a5') },
        { q: t('faq_q6'), a: t('faq_a6') },
        { q: t('faq_q7'), a: t('faq_a7') },
        { q: t('faq_q8'), a: t('faq_a8') },
    ];

    const quickStartSteps = [
        { step: localizeNumber(1).padStart(2, isBn ? '০' : '0'), title: t('quick_step_1'), description: t('quick_step_1_desc'), icon: <Target className="h-6 w-6 text-white" />, gradient: 'from-[#046ca9] to-[#034d79]' },
        { step: localizeNumber(2).padStart(2, isBn ? '০' : '0'), title: t('quick_step_2'), description: t('quick_step_2_desc'), icon: <Settings className="h-6 w-6 text-white" />, gradient: 'from-[#046ca9] to-[#0586cb]' },
        { step: localizeNumber(3).padStart(2, isBn ? '০' : '0'), title: t('quick_step_3'), description: t('quick_step_3_desc'), icon: <Package className="h-6 w-6 text-white" />, gradient: 'from-[#035887] to-[#046ca9]' },
        { step: localizeNumber(4).padStart(2, isBn ? '০' : '0'), title: t('quick_step_4'), description: t('quick_step_4_desc'), icon: <ShoppingCart className="h-6 w-6 text-white" />, gradient: 'from-[#e79237] to-[#c47920]' },
    ];

    const businessTypes = [
        { emoji: '👗', title: t('business_type_fashion_title'),    desc: t('business_type_fashion_desc') },
        { emoji: '🛒', title: t('business_type_grocery_title'),    desc: t('business_type_grocery_desc') },
        { emoji: '💻', title: t('business_type_electronics_title'), desc: t('business_type_electronics_desc') },
        { emoji: '💄', title: t('business_type_beauty_title'),     desc: t('business_type_beauty_desc') },
        { emoji: '💊', title: t('business_type_pharmacy_title'),   desc: t('business_type_pharmacy_desc') },
        { emoji: '📱', title: t('business_type_mobile_title'),     desc: t('business_type_mobile_desc') },
        { emoji: '👟', title: t('business_type_footwear_title'),   desc: t('business_type_footwear_desc') },
        { emoji: '🔨', title: t('business_type_hardware_title'),   desc: t('business_type_hardware_desc') },
        { emoji: '📚', title: t('business_type_stationery_title'), desc: t('business_type_stationery_desc') },
        { emoji: '🎂', title: t('business_type_bakery_title'),     desc: t('business_type_bakery_desc') },
    ];

    return (
        <MainLayout>

            {/* ── Hero ── */}
            <section className="relative overflow-hidden bg-[#f6f9fc] pt-16">
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#046ca9] via-[#0586cb] to-[#e79237]" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-white" />

                <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:grid lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-16 lg:pt-16">
                    <div className="mx-auto max-w-2xl pb-10 lg:mx-0 lg:pb-0">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#046ca9]/15 bg-white px-3 py-1.5 text-xs font-bold text-[#034d79] shadow-sm">
                            <span className="flex h-2 w-2 rounded-full bg-[#e79237]" />
                            {t('upcoming_feature')}
                        </div>

                        <h1 className="mb-4 text-4xl font-black leading-tight text-gray-950 sm:text-5xl lg:text-[3.35rem]">
                            {t('hero_title')}
                        </h1>

                        <p className="mb-3 text-lg font-bold text-[#034d79] sm:text-xl">
                            {t('hero_subtitle')}
                        </p>
                        <p className="mb-8 max-w-xl text-base leading-relaxed text-gray-600">
                            {t('hero_description')}
                        </p>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Link
                                href="/register"
                                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#046ca9]/25 transition-all hover:brightness-105 active:scale-[0.98]"
                            >
                                {t('get_started')}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="/pricing"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-[#046ca9]/30 hover:text-[#046ca9]"
                            >
                                {t('free_package')}
                            </Link>
                            <InstallAppButton variant="hero" />
                        </div>

                        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {[t('no_payment'), t('free_package'), t('cancel_anytime'), t('hero_offline_badge')].map((text, i) => (
                                <div key={i} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm">
                                    {i === 3
                                        ? <WifiOff className="h-4 w-4 flex-shrink-0 text-slate-500" />
                                        : <CheckCircle className="h-4 w-4 flex-shrink-0 text-[#046ca9]" />
                                    }
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-[#046ca9]/10 bg-white p-3 shadow-2xl shadow-[#034d79]/10 sm:p-4">
                        <div className="overflow-hidden rounded-[1.35rem] border border-gray-100 bg-[#f7fafc]">
                            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-5">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#046ca9] text-white shadow-lg shadow-[#046ca9]/20">
                                        <Receipt className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wide text-[#046ca9]">{t('feature_pos')}</p>
                                        <h2 className="truncate text-lg font-black text-gray-950">AndgatePOS</h2>
                                    </div>
                                </div>
                                <div className="hidden flex-shrink-0 items-center gap-1.5 text-[11px] font-bold text-gray-400 sm:flex">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                    {isBn ? 'লাইভ প্রিভিউ' : 'Live preview'}
                                </div>
                            </div>

                            {/* Trust strip — the two questions a Bangladeshi shop owner asks first */}
                            <div className="grid grid-cols-1 gap-2 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-[#eef6fd] px-4 py-3 sm:grid-cols-2 sm:px-5">
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                        <Wifi className="h-3.5 w-3.5 text-emerald-700" />
                                    </span>
                                    {t('hero_offline_badge')}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-[#034d79]">
                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9]/10">
                                        <Banknote className="h-3.5 w-3.5 text-[#046ca9]" />
                                    </span>
                                    {t('hero_trust_payments')}
                                </div>
                            </div>

                            <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.12fr_0.88fr]">
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{t('dashboard_today_sales')}</p>
                                                <p className="mt-1 text-3xl font-black text-gray-950">৳{localizeNumber('48,250')}</p>
                                            </div>
                                            <div className="rounded-xl bg-[#046ca9]/10 px-3 py-2 text-right">
                                                <p className="text-xs font-bold text-[#046ca9]">{t('hero_floating_orders_label')}</p>
                                                <p className="text-lg font-black text-[#034d79]">{localizeNumber('128')}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { label: isBn ? 'ক্যাশ' : 'Cash', value: '18,900' },
                                                { label: 'bKash', value: '14,350' },
                                                { label: 'Nagad', value: '8,600' },
                                            ].map((item) => (
                                                <div key={item.label} className="rounded-xl bg-gray-50 px-3 py-2">
                                                    <p className="text-[11px] font-bold text-gray-400">{item.label}</p>
                                                    <p className="text-sm font-black text-gray-900">৳{localizeNumber(item.value)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                        <div className="mb-3 flex items-center justify-between">
                                            <p className="text-sm font-black text-gray-950">{t('quick_step_4')}</p>
                                            <span className="rounded-full bg-[#e79237]/10 px-2.5 py-1 text-xs font-bold text-[#c47920]">
                                                {localizeNumber('3')} {isBn ? 'টি পণ্য' : 'items'}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                { name: isBn ? 'প্রিমিয়াম চাল ৫ কেজি' : 'Premium Rice 5kg', qty: '2', price: '1,560' },
                                                { name: isBn ? 'শার্ট - নীল M' : 'Shirt - Blue M', qty: '1', price: '850' },
                                                { name: isBn ? 'ফোন চার্জার' : 'Phone Charger', qty: '1', price: '420' },
                                            ].map((item) => (
                                                <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-bold text-gray-900">{item.name}</p>
                                                        <p className="text-xs text-gray-500">{isBn ? 'পরিমাণ' : 'Qty'} {localizeNumber(item.qty)}</p>
                                                    </div>
                                                    <p className="flex-shrink-0 text-sm font-black text-gray-950">৳{localizeNumber(item.price)}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 flex items-center justify-between rounded-xl bg-[#034d79] px-4 py-3 text-white">
                                            <span className="text-sm font-bold">{t('lbl_total')}</span>
                                            <span className="text-xl font-black">৳{localizeNumber('2,830')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                        <div className="mb-3 flex items-center justify-between">
                                            <p className="text-sm font-black text-gray-950">
                                                {isBn ? 'গত ৭ দিনের বিক্রয়' : 'Last 7 days sales'}
                                            </p>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                                <TrendingUp className="h-3 w-3" />
                                                {localizeNumber('18')}%
                                            </span>
                                        </div>
                                        <div className="flex h-16 items-end justify-between gap-1.5">
                                            {[
                                                { day: isBn ? 'শনি' : 'Sat', h: 45 },
                                                { day: isBn ? 'রবি' : 'Sun', h: 60 },
                                                { day: isBn ? 'সোম' : 'Mon', h: 38 },
                                                { day: isBn ? 'মঙ্গল' : 'Tue', h: 72 },
                                                { day: isBn ? 'বুধ' : 'Wed', h: 55 },
                                                { day: isBn ? 'বৃহঃ' : 'Thu', h: 80 },
                                                { day: isBn ? 'শুক্র' : 'Fri', h: 100 },
                                            ].map((d, i) => (
                                                <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                                                    <div
                                                        className={`w-full rounded-t-md ${i === 6 ? 'bg-[#046ca9]' : 'bg-[#046ca9]/25'}`}
                                                        style={{ height: `${d.h}%` }}
                                                    />
                                                    <span className="text-[9px] font-semibold text-gray-400">{d.day}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                                            <Users className="mb-2 h-4 w-4 text-emerald-700" />
                                            <p className="text-xs font-bold text-emerald-800">{t('lbl_customer')}</p>
                                            <p className="text-xl font-black text-emerald-900">{localizeNumber('342')}</p>
                                        </div>
                                        <div className="rounded-2xl border border-red-100 bg-red-50 p-3">
                                            <Archive className="mb-2 h-4 w-4 text-red-600" />
                                            <p className="text-xs font-bold text-red-700">{t('dashboard_low_stock')}</p>
                                            <p className="text-xl font-black text-red-900">{localizeNumber('12')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Live Demo (its own section — a real promo video deserves full width,
                   not a corner of the product-mockup card) ── */}
            <section className="bg-white py-16 sm:py-20">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#046ca9]">
                        {isBn ? 'লাইভ ডেমো' : 'Live Demo'}
                    </p>
                    <h2 className="mt-2 text-2xl font-black leading-tight text-gray-950 sm:text-3xl">
                        {isBn
                            ? 'আপনার দোকান ডিজিটাল হলে কেমন হবে?'
                            : 'See your shop—fully digital, in 2 minutes'}
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
                        {isBn
                            ? 'বিলিং থেকে স্টক — সব এক জায়গায়। ভুল কম, সময় বাঁচে, হিসেব মেলে। যে কেউ চালাতে পারে।'
                            : 'Billing, stock, reports — all in one place. Fewer mistakes, saved time, accurate accounts. Anyone can run it.'}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle className="h-3 w-3" />
                            {isBn ? '২ মিনিটের ভিডিও' : '2-min video'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                            <CheckCircle className="h-3 w-3" />
                            {isBn ? 'সহজ বাংলায়' : 'Simple Bangla guide'}
                        </span>
                    </div>
                    <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/demo"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#046ca9] px-6 py-3 text-sm font-bold text-[#046ca9] transition hover:bg-[#046ca9]/5 sm:w-auto"
                        >
                            {isBn ? 'সম্পূর্ণ ডেমো দেখুন →' : 'Watch full demo →'}
                        </Link>
                    </div>

                    <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">
                        <div
                            ref={videoContainerRef}
                            className="relative overflow-hidden rounded-xl bg-black"
                            style={{ paddingBottom: '56.25%' }}
                        >
                            <iframe
                                ref={videoRef}
                                src="https://www.youtube.com/embed/gELTWs7hFtc?autoplay=1&mute=1&start=163&loop=1&playlist=gELTWs7hFtc&controls=0&rel=0&modestbranding=1&enablejsapi=1&playsinline=1"
                                title="AndgatePOS"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 h-full w-full"
                            />
                        </div>
                        {/* Control bar — same style as /demo */}
                        <div className="mt-2 flex items-center justify-center gap-3 pb-1">
                            <button
                                type="button"
                                onClick={toggleVideo}
                                className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:bg-gray-700 active:scale-95"
                            >
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                {isPlaying ? (isBn ? 'থামান' : 'Pause') : (isBn ? 'চালু করুন' : 'Play')}
                            </button>
                            <button
                                type="button"
                                onClick={toggleMute}
                                className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:bg-gray-700 active:scale-95"
                            >
                                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                {isMuted ? (isBn ? 'সাউন্ড চালু' : 'Unmute') : (isBn ? 'সাউন্ড বন্ধ' : 'Mute')}
                            </button>
                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="flex items-center gap-2 rounded-full bg-[#046ca9] px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:bg-[#034d79] active:scale-95"
                            >
                                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                {isFullscreen ? (isBn ? 'বন্ধ করুন' : 'Exit') : (isBn ? 'বড় করে দেখুন' : 'Fullscreen')}
                            </button>
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
                                    <div className="text-2xl font-black text-white">{localizeNumber(stat.number)}</div>
                                    <div className="text-sm text-white/70">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Fresh Product Proof ── */}
            <section className="bg-white py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
                        <div>
                            <span className="mb-4 inline-block rounded-full border border-[#046ca9]/20 bg-[#046ca9]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#046ca9]">
                                {isBn ? 'লাইভ প্রোডাক্ট স্ক্রিন' : 'Live Product Screens'}
                            </span>
                            <h2 className="text-3xl font-black leading-tight text-gray-900 sm:text-4xl">
                                {isBn ? 'শুধু POS না — পুরো ব্যবসা চালানোর অপারেটিং সিস্টেম' : 'Not only POS — the operating system for the whole business'}
                            </h2>
                        </div>
                        <p className="text-base leading-8 text-gray-500">
                            {isBn
                                ? 'আজকের live AndgatePOS থেকে নেওয়া স্ক্রিনশট: checkout, owner dashboard, multi-store reports, Analytics/BI, COD reconciliation, stock transfer এবং fiscal readiness একসাথে দেখা যাচ্ছে।'
                                : 'Fresh screenshots from the live AndgatePOS app show checkout, owner dashboard, multi-store reports, Analytics/BI, COD reconciliation, stock transfer, and fiscal-readiness workflows working together.'}
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {productScreenshots.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-[#046ca9]/20 hover:shadow-xl"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                        className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                                    />
                                </div>
                                <div className="p-5">
                                    <h3 className="text-base font-black text-gray-900">{item.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-gray-500">{item.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Why Us ── */}
            <section className="bg-white py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-14 text-center">
                        <span className="mb-4 inline-block rounded-full border border-[#046ca9]/20 bg-[#046ca9]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#046ca9]">
                            {t('why_us_badge')}
                        </span>
                        <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('why_us_heading').replace('{count}', localizeNumber(String(businessCount)))}</h2>
                        <p className="mx-auto max-w-2xl text-base text-gray-500">{t('why_us_subtitle')}</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                        {whyUs.map((item, i) => (
                            <div key={i} className={`rounded-2xl border ${item.border} bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md`}>
                                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
                                    {item.icon}
                                </div>
                                <h3 className="mb-2 font-bold text-gray-900">{item.title}</h3>
                                <p className="text-sm leading-relaxed text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Business Types — "Is this for my shop?" ── */}
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

                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                        {businessTypes.map((bt, i) => (
                            <div
                                key={i}
                                className="group cursor-default rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm transition-all duration-200 hover:scale-[1.04] hover:bg-white/20 hover:shadow-lg"
                            >
                                <div className="mb-3 text-3xl">{bt.emoji}</div>
                                <h3 className="mb-1.5 font-bold text-white">{bt.title}</h3>
                                <p className="text-xs leading-relaxed text-white/60">{bt.desc}</p>
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

            {/* ── Core Modules — "Here's what it does for you" ── */}
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
                                    <Link
                                        href={mod.href}
                                        className={`mt-6 inline-flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r ${mod.gradient} bg-clip-text text-transparent transition-opacity hover:opacity-75`}
                                    >
                                        {t('core_learn_more')}
                                        <ArrowRight className="h-3.5 w-3.5 text-[#046ca9] transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BD Payments ── */}
            <section className="bg-gray-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center">
                        <span className="mb-4 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-700">
                            {t('bd_payments_badge')}
                        </span>
                        <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('bd_payments_heading')}</h2>
                        <p className="mx-auto max-w-2xl text-base text-gray-500">{t('bd_payments_subtitle')}</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        {bdPayments.map((pm, i) => (
                            <div key={i} className={`flex items-center gap-3 rounded-2xl border px-6 py-4 text-sm font-bold shadow-sm ${pm.color}`}>
                                <span className="text-2xl">{pm.emoji}</span>
                                <span>{pm.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Reports Deep-Dive ── */}
            <section className="bg-white py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16">
                        <div className="mb-12 lg:mb-0">
                            <span className="mb-4 inline-block rounded-full border border-[#e79237]/30 bg-[#e79237]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#c47920]">
                                {t('reports_badge')}
                            </span>
                            <h2 className="mb-4 text-3xl font-black leading-tight text-gray-900 sm:text-4xl">{t('reports_heading')}</h2>
                            <p className="mb-8 text-base leading-relaxed text-gray-500">{t('reports_subtitle')}</p>
                            <Link
                                href="/features/reports"
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-[#046ca9]/20 transition-all hover:brightness-105"
                            >
                                {t('reports_cta')}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {reportTypes.map((name, i) => (
                                <div key={i} className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 shadow-sm">
                                    <div className="h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-br from-[#046ca9] to-[#e79237]" />
                                    <span className="text-sm font-semibold text-gray-700">{name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Ecommerce Integration — "Bonus: free online store too!" ── */}
            <section className="relative overflow-hidden bg-white py-24">
                <div className="absolute inset-y-0 right-0 hidden w-[48%] bg-gradient-to-bl from-[#eef6fd] to-[#f0f9ff] lg:block" />
                <div className="absolute inset-x-0 top-0 h-px bg-gray-100" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-16">

                        {/* Left copy */}
                        <div className="mb-14 lg:mb-0">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {t('ecommerce_badge')}
                            </div>

                            <div className="mb-4 flex items-center gap-2.5">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('ecommerce_powered_by')}</span>
                                <span className="rounded-md bg-[#046ca9] px-2.5 py-0.5 text-sm font-black tracking-tight text-white">Hawkeri</span>
                                <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    </span>
                                    {t('ecommerce_live_badge')}
                                </span>
                            </div>

                            <h2 className="mb-4 text-3xl font-black leading-[1.1] tracking-tight text-gray-900 sm:text-[2.5rem]">
                                {t('ecommerce_heading')}
                            </h2>

                            <p className="mb-2 text-base font-semibold text-gray-700">
                                {t('ecommerce_subheading')}
                            </p>

                            <p className="mb-9 text-sm leading-relaxed text-gray-500">
                                {t('ecommerce_desc')}
                            </p>

                            <div className="mb-10 grid gap-5 sm:grid-cols-2">
                                {[
                                    { icon: <Zap className="h-4 w-4" />, title: t('ecommerce_f1_title'), desc: t('ecommerce_f1_desc'), color: 'bg-[#046ca9]/10 text-[#046ca9]' },
                                    { icon: <Tag className="h-4 w-4" />, title: t('ecommerce_f2_title'), desc: t('ecommerce_f2_desc'), color: 'bg-emerald-100 text-emerald-700' },
                                    { icon: <Globe className="h-4 w-4" />, title: t('ecommerce_f3_title'), desc: t('ecommerce_f3_desc'), color: 'bg-amber-100 text-amber-700' },
                                    { icon: <CheckCircle className="h-4 w-4" />, title: t('ecommerce_f4_title'), desc: t('ecommerce_f4_desc'), color: 'bg-[#e79237]/10 text-[#e79237]' },
                                ].map((f, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${f.color}`}>
                                            {f.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{f.title}</p>
                                            <p className="text-xs leading-relaxed text-gray-500">{f.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <a
                                    href="https://www.hawkeri.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#046ca9] px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-[#046ca9]/20 transition-all duration-200 hover:bg-[#035887] hover:shadow-lg"
                                >
                                    <Globe className="h-4 w-4" />
                                    {t('ecommerce_cta_primary')}
                                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                                </a>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-[#046ca9]/30 hover:bg-[#eef6fd] hover:text-[#046ca9]"
                                >
                                    {t('ecommerce_cta_secondary')}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Right: Browser mockup */}
                        <div>
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/80 ring-1 ring-gray-100">
                                {/* Browser chrome */}
                                <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/80 px-4 py-3">
                                    <div className="flex gap-1.5">
                                        <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                                        <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                                    </div>
                                    <div className="flex flex-1 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1 text-[11px] text-gray-400">
                                        <Globe className="h-3 w-3 flex-shrink-0" />
                                        hawkeri.com/your-store
                                    </div>
                                </div>

                                {/* Store UI */}
                                <div className="bg-white p-4">
                                    <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                                        <span className="text-sm font-black text-gray-900">{t('ecommerce_mockup_store_name')}</span>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span>Home</span>
                                            <span>Products</span>
                                            <div className="relative">
                                                <ShoppingCart className="h-4 w-4" />
                                                <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#046ca9] text-[9px] font-bold text-white">3</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2.5">
                                        {[
                                            { emoji: '👕', name: t('ecommerce_mockup_p1'), price: '৳850', cat: t('ecommerce_mockup_cat1'), bg: 'bg-blue-50' },
                                            { emoji: '👟', name: t('ecommerce_mockup_p2'), price: '৳2,450', cat: t('ecommerce_mockup_cat2'), bg: 'bg-amber-50' },
                                            { emoji: '🎒', name: t('ecommerce_mockup_p3'), price: '৳1,350', cat: t('ecommerce_mockup_cat3'), bg: 'bg-emerald-50' },
                                            { emoji: '⌚', name: t('ecommerce_mockup_p4'), price: '৳3,990', cat: t('ecommerce_mockup_cat4'), bg: 'bg-purple-50' },
                                            { emoji: '🕶️', name: t('ecommerce_mockup_p5'), price: '৳1,250', cat: t('ecommerce_mockup_cat4'), bg: 'bg-pink-50' },
                                            { emoji: '🧢', name: t('ecommerce_mockup_p6'), price: '৳650', cat: t('ecommerce_mockup_cat1'), bg: 'bg-orange-50' },
                                        ].map((p, i) => (
                                            <div key={i} className="cursor-pointer rounded-xl border border-gray-100 bg-gray-50/50 p-2 transition-all hover:border-[#046ca9]/20 hover:shadow-sm">
                                                <div className={`mb-2 flex h-16 items-center justify-center rounded-lg text-2xl ${p.bg}`}>
                                                    {p.emoji}
                                                </div>
                                                <p className="truncate text-[10px] font-bold text-gray-800">{p.name}</p>
                                                <p className="text-[10px] font-semibold text-[#046ca9]">{p.price}</p>
                                                <p className="truncate text-[9px] text-gray-400">{p.cat}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 py-2 text-[11px] font-semibold text-emerald-700">
                                        <RefreshCw className="h-3 w-3" />
                                        {t('ecommerce_auto_sync')}
                                    </div>
                                </div>
                            </div>

                            {/* Connection bridge */}
                            <div className="mt-5 flex items-center justify-center gap-3">
                                <span className="rounded-lg border border-[#046ca9]/20 bg-[#046ca9]/5 px-3 py-1.5 text-xs font-bold text-[#046ca9]">AndgatePOS</span>
                                <div className="flex items-center gap-1">
                                    <div className="h-px w-8 bg-gradient-to-r from-[#046ca9]/30 to-[#e79237]/30" />
                                    <Zap className="h-3.5 w-3.5 text-[#e79237]" />
                                    <div className="h-px w-8 bg-gradient-to-r from-[#e79237]/30 to-emerald-400/30" />
                                </div>
                                <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">Hawkeri Store</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── How It Works — "4 steps to get started" ── */}
            <section id="quick-start" className="bg-gray-50 py-24">
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
                                <div className="mb-2 text-5xl font-black leading-none text-gray-100">{step.step}</div>
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

            {/* ── Overview — "See it in action" ── */}
            <OverViewSection id="overview" />

            {/* ── All Features — "Everything it can do" ── */}
            <section id="features" className="bg-white py-24">
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

            {/* ── SEO Solution Links ── */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 max-w-3xl">
                        <span className="mb-4 inline-block rounded-full border border-[#046ca9]/20 bg-[#046ca9]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#046ca9]">
                            {isBn ? 'POS সফটওয়্যার বাংলাদেশ' : 'POS Software Bangladesh'}
                        </span>
                        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
                            {isBn ? 'আপনার ব্যবসার জন্য ঠিক POS সলিউশন খুঁজুন' : 'Find the right POS solution for your business'}
                        </h2>
                        <p className="mt-4 text-base leading-7 text-gray-500">
                            {isBn
                                ? 'Retail POS, restaurant POS, pharmacy POS, grocery billing, inventory এবং shop management software খুঁজছেন এমন বাংলাদেশি ব্যবসার জন্য আলাদা পেজ।'
                                : 'Dedicated pages for Bangladesh businesses looking for retail POS, restaurant POS, pharmacy POS, grocery billing, inventory and shop management software.'}
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[...landingPages.slice(0, 4), ...highIntentPages].map((page) => {
                            const isLandingPage = 'slug' in page;
                            const landingBn = isBn && isLandingPage ? landingCopyBn[page.slug] : null;
                            const highIntentBn = isBn && !isLandingPage ? page.bn : null;
                            const href = isLandingPage ? `/${page.slug}` : page.path;
                            const eyebrow = landingBn?.eyebrow ?? highIntentBn?.eyebrow ?? page.eyebrow;
                            const title = landingBn?.title ?? highIntentBn?.title ?? page.title;
                            const description = landingBn?.intro ?? highIntentBn?.intro ?? page.intro;

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className="rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#046ca9]/20 hover:bg-white hover:shadow-md"
                                >
                                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{eyebrow}</p>
                                    <h3 className="mt-3 text-base font-black text-gray-900">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="bg-white py-24">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-14 text-center">
                        <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('faq_heading')}</h2>
                        <p className="text-base text-gray-500">{t('faq_subtitle')}</p>
                    </div>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                                >
                                    <span className="font-bold text-gray-900">{faq.q}</span>
                                    <ChevronDown className={`h-5 w-5 flex-shrink-0 text-[#046ca9] transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                                </button>
                                {openFaq === i && (
                                    <div className="border-t border-gray-100 px-6 pb-5 pt-4">
                                        <p className="text-sm leading-relaxed text-gray-600">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

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
                        {t('cta_title').replace('{count}', localizeNumber(String(businessCount)))}
                    </h2>
                    <p className="mb-10 text-lg leading-relaxed text-white/75">{t('cta_desc').replace('{count}', localizeNumber(String(businessCount)))}</p>
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

        </MainLayout>
    );
}
