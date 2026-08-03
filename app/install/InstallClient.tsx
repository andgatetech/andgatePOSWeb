'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Download,
    Monitor,
    Smartphone,
    Laptop,
    WifiOff,
    Printer,
    Zap,
    ShieldCheck,
    Layers,
    RefreshCw,
    Share2,
    PlusSquare,
    Check,
    Copy,
    ChevronDown,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    HelpCircle,
    Info,
    AppWindow,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { getTranslation } from '@/i18n';

export default function InstallClient() {
    const { t } = getTranslation();
    const {
        isReady,
        isInstalled,
        isIOS,
        isAndroid,
        isWindows,
        isMac,
        isChrome,
        isEdge,
        platformName,
        browserName,
        hasNativePrompt,
        install,
    } = usePWAInstall();

    const [installing, setInstalling] = useState(false);
    const [installSuccess, setInstallSuccess] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [activeGuideTab, setActiveGuideTab] = useState<'chrome' | 'edge' | 'ios'>('chrome');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [currentUrl, setCurrentUrl] = useState('https://andgatepos.com/install');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(window.location.href);
        }
        if (isIOS) {
            setActiveGuideTab('ios');
        } else if (isEdge) {
            setActiveGuideTab('edge');
        } else {
            setActiveGuideTab('chrome');
        }
    }, [isIOS, isEdge]);

    const handleInstallClick = async () => {
        if (installing) return;
        setInstalling(true);
        try {
            const accepted = await install();
            if (accepted) {
                setInstallSuccess(true);
            }
        } finally {
            setInstalling(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2500);
        } catch {
            // fallback
        }
    };

    const toggleFaq = (idx: number) => {
        setOpenFaq(openFaq === idx ? null : idx);
    };

    const features = [
        {
            icon: <WifiOff className="h-6 w-6 text-[#046ca9]" />,
            title: t('install_feature_offline_title'),
            desc: t('install_feature_offline_desc'),
            badge: 'Offline 2.0',
        },
        {
            icon: <Zap className="h-6 w-6 text-amber-500" />,
            title: t('install_feature_speed_title'),
            desc: t('install_feature_speed_desc'),
            badge: '< 1s Launch',
        },
        {
            icon: <AppWindow className="h-6 w-6 text-emerald-500" />,
            title: t('install_feature_fullscreen_title'),
            desc: t('install_feature_fullscreen_desc'),
            badge: 'Dedicated Window',
        },
        {
            icon: <Printer className="h-6 w-6 text-indigo-500" />,
            title: t('install_feature_printer_title'),
            desc: t('install_feature_printer_desc'),
            badge: 'USB / Bluetooth / LAN',
        },
        {
            icon: <Layers className="h-6 w-6 text-cyan-500" />,
            title: t('install_feature_storage_title'),
            desc: t('install_feature_storage_desc'),
            badge: '< 10 MB Size',
        },
        {
            icon: <RefreshCw className="h-6 w-6 text-teal-500" />,
            title: t('install_feature_sync_title'),
            desc: t('install_feature_sync_desc'),
            badge: 'Auto Sync',
        },
    ];

    const faqs = [
        {
            q: t('install_faq_q1'),
            a: t('install_faq_a1'),
        },
        {
            q: t('install_faq_q2'),
            a: t('install_faq_a2'),
        },
        {
            q: t('install_faq_q3'),
            a: t('install_faq_a3'),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            {/* ── Top Hero Section ────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#023859] pb-24 pt-32 text-white">
                {/* Decorative background lights */}
                <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />

                <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {/* Badge */}
                    <div className="mb-6 flex justify-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-200 backdrop-blur-md">
                            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                            {t('install_page_badge')}
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                            {t('install_page_hero_title')}
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-blue-100 sm:text-lg">
                            {t('install_page_hero_subtitle')}
                        </p>
                    </div>

                    {/* ── Main Action Card Container ────────────────────────────── */}
                    <div className="mx-auto mt-10 max-w-3xl">
                        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-10 text-slate-900">
                            {/* Device & Browser pill */}
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#046ca9]">
                                        {isAndroid || isIOS ? (
                                            <Smartphone className="h-5 w-5" />
                                        ) : isMac ? (
                                            <Laptop className="h-5 w-5" />
                                        ) : (
                                            <Monitor className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500">
                                            {t('install_page_detected_device')}
                                        </p>
                                        <p className="text-sm font-bold text-slate-800">
                                            {platformName} • {browserName}
                                        </p>
                                    </div>
                                </div>

                                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    {isInstalled ? t('install_page_installed_badge') : 'Ready to Install'}
                                </div>
                            </div>

                            {/* ── State 1: App is already installed ────────────────── */}
                            {isInstalled || installSuccess ? (
                                <div className="text-center py-6">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
                                        <CheckCircle2 className="h-9 w-9" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {t('install_page_installed_badge')}
                                    </h2>
                                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                                        {t('install_page_installed_desc')}
                                    </p>
                                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                        <Link
                                            href="/pos"
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#046ca9] px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#034d79] active:scale-[0.98] sm:w-auto"
                                        >
                                            <Zap className="h-5 w-5" />
                                            {t('install_page_btn_open_pos')}
                                        </Link>
                                        <Link
                                            href="/dashboard"
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 sm:w-auto"
                                        >
                                            {t('install_page_btn_open_dashboard')}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            ) : isIOS ? (
                                /* ── State 2: iOS Safari Guided Install ────────────── */
                                <div className="space-y-6">
                                    <div className="rounded-2xl bg-blue-50/70 p-4 border border-blue-100/80">
                                        <h3 className="flex items-center gap-2 text-base font-bold text-[#034d79]">
                                            <Share2 className="h-5 w-5 text-[#046ca9]" />
                                            {t('install_guide_ios_title')}
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-600">
                                            Apple iOS requires 2 quick taps to add the app directly to your home screen.
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#046ca9] font-bold">
                                                1
                                            </div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {t('pwa_tap_share_button')}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {t('pwa_safari_share_hint')}
                                            </p>
                                            <Share2 className="mx-auto mt-2 h-5 w-5 text-[#046ca9]" />
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#046ca9] font-bold">
                                                2
                                            </div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {t('pwa_scroll_down_tap')}
                                            </p>
                                            <p className="mt-1 text-xs font-bold text-[#046ca9]">
                                                {t('pwa_add_to_home_screen')}
                                            </p>
                                            <PlusSquare className="mx-auto mt-2 h-5 w-5 text-[#046ca9]" />
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#046ca9] font-bold">
                                                3
                                            </div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {t('pwa_confirm_install')}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {t('pwa_icon_home_screen')}
                                            </p>
                                            <Check className="mx-auto mt-2 h-5 w-5 text-emerald-600" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* ── State 3: 1-Click Native Chrome / Edge Install ──── */
                                <div className="text-center py-4">
                                    <button
                                        type="button"
                                        onClick={handleInstallClick}
                                        disabled={installing}
                                        className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#046ca9] px-8 py-5 text-lg font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:bg-[#034d79] active:scale-[0.98] disabled:opacity-75 sm:w-auto sm:min-w-[320px]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-white/20 to-cyan-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
                                        <Download className="h-6 w-6 transition-transform group-hover:-translate-y-0.5 group-active:translate-y-0.5" />
                                        <span>
                                            {installing
                                                ? t('install_page_btn_installing')
                                                : t('install_page_btn_install_now')}
                                        </span>
                                    </button>

                                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                        <span>100% Free • Safe & Official • No APK/EXE needed</span>
                                    </div>

                                    {!hasNativePrompt && (
                                        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-left">
                                            <div className="flex items-start gap-3">
                                                <Info className="h-5 w-5 flex-shrink-0 text-amber-700 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-bold text-amber-900">
                                                        Looking for the install icon?
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-amber-800">
                                                        You can also click the <strong>Install icon (🖥️ or ➕)</strong> on the right side of your Chrome or Edge address bar.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── QR Code Section (Scan on Mobile) ────────────────────────────── */}
            <section className="py-16 bg-white border-b border-slate-200">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-8 md:grid-cols-12">
                        <div className="md:col-span-7">
                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-[#046ca9]">
                                <Smartphone className="h-4 w-4" />
                                Mobile & Cashier Tablet Ready
                            </div>
                            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                {t('install_page_qr_title')}
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                                {t('install_page_qr_subtitle')}
                            </p>

                            {/* Share / Copy link bar */}
                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <div className="flex flex-1 min-w-[240px] items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
                                    <span className="truncate">{currentUrl}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                >
                                    {copiedLink ? (
                                        <>
                                            <Check className="h-4 w-4 text-emerald-600" />
                                            <span className="text-emerald-600">Link Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 text-slate-500" />
                                            <span>Copy Link</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* QR Code Container */}
                        <div className="flex justify-center md:col-span-5">
                            <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 text-center shadow-lg">
                                <div className="mx-auto inline-block rounded-2xl bg-white p-3 shadow-inner border border-slate-100">
                                    <QRCodeSVG
                                        value={currentUrl}
                                        size={180}
                                        level="M"
                                        includeMargin={false}
                                    />
                                </div>
                                <p className="mt-3 text-xs font-semibold text-slate-500">
                                    Scan with iPhone or Android Camera
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Key Features / Why Install ──────────────────────────────────── */}
            <section className="py-20 bg-slate-50">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            {t('install_page_features_title')}
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">
                            {t('install_page_features_subtitle')}
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((item, idx) => (
                            <div
                                key={idx}
                                className="group relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-[#046ca9]/40 hover:shadow-md"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 shadow-inner group-hover:scale-105 transition-transform">
                                        {item.icon}
                                    </div>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                                        {item.badge}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Browser Specific Guides Tabs ────────────────────────────────── */}
            <section className="py-20 bg-white border-t border-slate-200">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            {t('install_guide_title')}
                        </h2>
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-center gap-2 border-b border-slate-200 pb-4">
                        {[
                            { id: 'chrome', label: 'Google Chrome', icon: <Monitor className="h-4 w-4" /> },
                            { id: 'edge', label: 'Microsoft Edge', icon: <Laptop className="h-4 w-4" /> },
                            { id: 'ios', label: 'iPhone / iPad', icon: <Smartphone className="h-4 w-4" /> },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveGuideTab(tab.id as any)}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                    activeGuideTab === tab.id
                                        ? 'bg-[#046ca9] text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="mt-8">
                        {activeGuideTab === 'chrome' && (
                            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                <h3 className="text-base font-bold text-slate-900">
                                    {t('install_guide_chrome_title')}
                                </h3>
                                <ol className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">
                                            1
                                        </span>
                                        <p className="text-sm text-slate-700">
                                            {t('install_guide_chrome_step1')}
                                        </p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">
                                            2
                                        </span>
                                        <p className="text-sm text-slate-700">
                                            {t('install_guide_chrome_step2')}
                                        </p>
                                    </li>
                                </ol>
                            </div>
                        )}

                        {activeGuideTab === 'edge' && (
                            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                <h3 className="text-base font-bold text-slate-900">
                                    {t('install_guide_edge_title')}
                                </h3>
                                <ol className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">
                                            1
                                        </span>
                                        <p className="text-sm text-slate-700">
                                            {t('install_guide_edge_step1')}
                                        </p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">
                                            2
                                        </span>
                                        <p className="text-sm text-slate-700">
                                            {t('install_guide_edge_step2')}
                                        </p>
                                    </li>
                                </ol>
                            </div>
                        )}

                        {activeGuideTab === 'ios' && (
                            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                <h3 className="text-base font-bold text-slate-900">
                                    {t('install_guide_ios_title')}
                                </h3>
                                <ol className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">
                                            1
                                        </span>
                                        <p className="text-sm text-slate-700">
                                            {t('install_guide_ios_step1')}
                                        </p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">
                                            2
                                        </span>
                                        <p className="text-sm text-slate-700">
                                            {t('install_guide_ios_step2')}
                                        </p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">
                                            3
                                        </span>
                                        <p className="text-sm text-slate-700">
                                            {t('install_guide_ios_step3')}
                                        </p>
                                    </li>
                                </ol>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── FAQs ────────────────────────────────────────────────────────── */}
            <section className="py-20 bg-slate-50 border-t border-slate-200">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#046ca9]">
                            <HelpCircle className="h-4 w-4" />
                            Help & Questions
                        </div>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            {t('install_faq_title')}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleFaq(idx)}
                                    className="flex w-full items-center justify-between px-6 py-4 text-left text-base font-bold text-slate-800 hover:text-[#046ca9]"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown
                                        className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                                            openFaq === idx ? 'rotate-180 text-[#046ca9]' : ''
                                        }`}
                                    />
                                </button>
                                {openFaq === idx && (
                                    <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 text-sm leading-relaxed text-slate-600">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Bottom Help banner */}
                    <div className="mt-12 text-center">
                        <p className="text-xs text-slate-500">
                            Need help installing or configuring your POS hardware?{' '}
                            <Link href="/contact" className="font-bold text-[#046ca9] hover:underline">
                                Contact our 24/7 Support Team
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
