'use client';
import MainLayout from '@/components/layout/MainLayout';

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
    Play,
    Receipt,
    Settings,
    Shield,
    ShoppingCart,
    Store,
    Target,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import Link from 'next/link';

import { convertNumberByLanguage } from '@/__components/convertNumberByLanguage';
import { getTranslation } from '@/i18n';
import OverViewSection from './(defaults)/components/pos-overview/OverViewSection';
import PriceSection from './(defaults)/components/price/PriceSection';
import TestimonialsSection from './(defaults)/components/testimonial/TestimonialsSection';
import Footer from './terms-of-service/Footer';

export default function HomePage() {
    const { t } = getTranslation();

    const quickStartSteps = [
        {
            step: 1,
            title: t('quick_step_1'),
            description: t('quick_step_1_desc'),
            icon: <Target className="h-6 w-6" />,
            color: 'text-blue-600',
        },
        {
            step: 2,
            title: t('quick_step_2'),
            description: t('quick_step_2_desc'),
            icon: <Settings className="h-6 w-6" />,
            color: 'text-green-600',
        },
        {
            step: 3,
            title: t('quick_step_3'),
            description: t('quick_step_3_desc'),
            icon: <Package className="h-6 w-6" />,
            color: 'text-purple-600',
        },
        {
            step: 4,
            title: t('quick_step_4'),
            description: t('quick_step_4_desc'),
            icon: <ShoppingCart className="h-6 w-6" />,
            color: 'text-orange-600',
        },
    ];

    const stats = [
        { number: '100+', label: t('stats_businesses'), icon: <Users className="h-8 w-8" /> },
        { number: '৳1M+', label: t('stats_order'), icon: <TrendingUp className="h-8 w-8" /> },
        { number: '99.9%', label: t('stats_uptime'), icon: <Shield className="h-8 w-8" /> },
        { number: '24/7', label: t('stats_support'), icon: <Clock className="h-8 w-8" /> },
    ];

    const features = [
        {
            icon: <LayoutDashboard className="h-12 w-12" />,
            title: t('feature_dashboard'),
            description: t('feature_dashboard_desc'),
            color: 'from-blue-500 to-blue-600',
        },
        {
            icon: <ShoppingCart className="h-12 w-12" />,
            title: t('feature_checkout'),
            description: t('feature_checkout_desc'),
            color: 'from-blue-500 to-blue-600',
        },
        {
            icon: <BarChart3 className="h-12 w-12" />,
            title: t('feature_reporting'),
            description: t('feature_reporting_desc'),
            color: 'from-green-500 to-green-600',
        },
        {
            icon: <Users className="h-12 w-12" />,
            title: t('feature_supplier'),
            description: t('feature_supplier_desc'),
            color: 'from-purple-500 to-purple-600',
        },
        {
            icon: <Package className="h-12 w-12" />,
            title: t('feature_product'),
            description: t('feature_product_desc'),
            color: 'from-orange-500 to-orange-600',
        },
        {
            icon: <Receipt className="h-12 w-12" />,
            title: t('feature_order'),
            description: t('feature_order_desc'),
            color: 'from-yellow-500 to-yellow-600',
        },
        {
            icon: <BanknoteArrowDown className="h-12 w-12" />,
            title: t('feature_expense'),
            description: t('feature_expense_desc'),
            color: 'from-red-500 to-red-600',
        },
        {
            icon: <Banknote className="h-12 w-12" />,
            title: t('feature_accounts'),
            description: t('feature_accounts_desc'),
            color: 'from-teal-500 to-teal-600',
        },
        {
            icon: <Users className="h-12 w-12" />,
            title: t('feature_customer'),
            description: t('feature_customer_desc'),
            color: 'from-pink-500 to-pink-600',
        },
        {
            icon: <Archive className="h-12 w-12" />,
            title: t('feature_inventory'),
            description: t('feature_inventory_desc'),
            color: 'from-indigo-500 to-indigo-600',
        },
        {
            icon: <Store className="h-12 w-12" />,
            title: t('feature_multistore'),
            description: t('feature_multistore_desc'),
            color: 'from-pink-500 to-pink-600',
        },
        {
            icon: <Barcode className="h-12 w-12" />,
            title: t('feature_barcode'),
            description: t('feature_barcode_desc'),
            color: 'from-yellow-500 to-yellow-600',
        },
    ];

    return (
        <MainLayout>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pb-32 pt-20">
                <div className="bg-grid-slate-100 absolute inset-0 -z-10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="mb-8 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                            <Zap className="mr-2 h-4 w-4" />
                            {t('upcoming_feature')}
                        </div>
                        <h1 className="mb-8 text-5xl font-black leading-[1.2] text-gray-900 md:text-7xl">
                            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                                {t('hero_title')}
                            </span>
                        </h1>
                        <h1 className="mb-8 text-2xl font-black leading-tight text-gray-900 md:text-3xl">{t('hero_subtitle')}</h1>
                        <p className="mx-auto mb-12 max-w-4xl text-xl leading-relaxed text-gray-600 md:text-2xl">{t('hero_description')}</p>
                        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                            <Link
                                href="/register"
                                className="group flex transform items-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-2xl"
                            >
                                {t('get_started')}
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                        <div className="mt-12 flex items-center justify-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                {t('no_payment')}
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                                {t('free_package')}
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-red-500" />
                                {t('cancel_anytime')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute left-10 top-1/4 h-20 w-20 animate-pulse rounded-full bg-blue-200 opacity-20"></div>
                <div className="absolute right-10 top-1/3 h-16 w-16 animate-pulse rounded-full bg-purple-200 opacity-20 delay-75"></div>
                <div className="absolute bottom-1/4 left-1/4 h-12 w-12 animate-pulse rounded-full bg-indigo-200 opacity-20 delay-150"></div>
            </section>

            {/* Stats Section */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 text-center md:grid-cols-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="group">
                                <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-8 transition-all hover:shadow-lg group-hover:scale-105">
                                    <div className="mb-4 flex justify-center text-blue-600 transition-transform group-hover:scale-110">{stat.icon}</div>
                                    <div className="mb-2 text-3xl font-bold text-gray-900">{convertNumberByLanguage(stat.number)}</div>
                                    <div className="font-medium text-gray-600">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="bg-gradient-to-b from-slate-50 to-white py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-20 text-center">
                        <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
                            {t('features_heading').split(' ').slice(0, -1).join(' ')}
                            <span className="block text-blue-600">{t('features_heading').split(' ').slice(-1)}</span>
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl text-gray-600">{t('features_description')}</p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <div key={index} className="group flex">
                                <div className="flex flex-1 flex-col rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl group-hover:scale-105">
                                    <div
                                        className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} mb-6 text-white transition-transform group-hover:scale-110`}
                                    >
                                        {feature.icon}
                                    </div>
                                    <h3 className="mb-4 text-xl font-bold text-gray-900">{feature.title}</h3>
                                    <p className="mt-auto leading-relaxed text-gray-600">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* POS Overview Section */}
            <OverViewSection id="overview"></OverViewSection>

            {/* Price Section */}
            <PriceSection id="pricing"></PriceSection>

            {/* Quick Start Section */}
            <section id="quick-start" className="bg-gradient-to-b from-white to-gray-50 py-11">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">{t('quick_start_title')}</h2>
                        <p className="mx-auto max-w-3xl text-xl text-gray-600">{t('quick_start_desc')}</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {quickStartSteps.map((step, index) => (
                            <div key={index} className="group relative">
                                <div className="rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl group-hover:scale-105">
                                    <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 ${step.color}`}>{step.icon}</div>
                                    <div className="mb-2 text-2xl font-bold text-gray-400">0{step.step}</div>
                                    <h3 className="mb-4 text-xl font-bold text-gray-900">{step.title}</h3>
                                    <p className="text-gray-600">{step.description}</p>
                                </div>
                                {index < quickStartSteps.length - 1 && (
                                    <div className="absolute -right-4 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-blue-100 lg:flex">
                                        <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <Link
                            href="/training"
                            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
                        >
                            <Play className="h-5 w-5" />
                            {t('watch_video')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <TestimonialsSection></TestimonialsSection>

            {/* CTA Section */}
            <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 py-24">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mb-8 text-4xl font-bold text-white md:text-5xl">{t('cta_title')}</h2>
                    <p className="mb-12 text-xl leading-relaxed text-blue-100">{t('cta_desc')}</p>
                    <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                        <Link
                            href="/register"
                            className="group flex transform items-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl transition-all hover:scale-105 hover:bg-gray-100"
                        >
                            {t('cta_start')}
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link href="/login" className="rounded-full border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white hover:text-blue-600">
                            {t('cta_signin')}
                        </Link>
                    </div>
                    <div className="mt-8 text-sm text-blue-100">{t('cta_benefits')}</div>
                </div>

                {/* Decorative elements */}
                <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-white opacity-10"></div>
                <div className="absolute bottom-10 right-10 h-24 w-24 rounded-full bg-white opacity-10"></div>
            </section>

            {/* Footer */}
            <Footer />
        </MainLayout>
    );
}
