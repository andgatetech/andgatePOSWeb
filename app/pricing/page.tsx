'use client';
import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import { applyDiscount, calcYearlySavings, filterActivePlans, formatPrice, getPlanColor, useGetPlansQuery } from '@/store/features/plans/plansApi';
import { ArrowRight, Check, ChevronDown, Clock, HelpCircle, Loader2, Rocket, Shield, Star, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Footer from '../terms-of-service/Footer';

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

const colorClasses = {
    slate: {
        ring: 'ring-2 ring-[#046ca9]',
        button: 'bg-gradient-to-r from-[#046ca9] to-[#034d79] text-white hover:opacity-90',
        badge: 'bg-[#046ca9]/10 text-[#046ca9]',
        icon: 'bg-[#046ca9]/10 text-[#046ca9]',
    },
    green: {
        ring: 'ring-2 ring-[#046ca9]',
        button: 'bg-gradient-to-r from-[#046ca9] to-[#034d79] text-white hover:opacity-90',
        badge: 'bg-[#046ca9]/10 text-[#046ca9]',
        icon: 'bg-[#046ca9]/10 text-[#046ca9]',
    },
    blue: {
        ring: 'ring-2 ring-[#046ca9]',
        button: 'bg-gradient-to-r from-[#046ca9] to-[#034d79] text-white hover:opacity-90',
        badge: 'bg-[#046ca9]/10 text-[#046ca9]',
        icon: 'bg-[#046ca9]/10 text-[#046ca9]',
    },
    purple: {
        ring: 'ring-2 ring-[#046ca9]',
        button: 'bg-gradient-to-r from-[#046ca9] to-[#034d79] text-white hover:opacity-90',
        badge: 'bg-[#046ca9]/10 text-[#046ca9]',
        icon: 'bg-[#046ca9]/10 text-[#046ca9]',
    },
    orange: {
        ring: 'ring-2 ring-[#e79237]',
        button: 'bg-gradient-to-r from-[#e79237] to-[#c47920] text-white hover:opacity-90',
        badge: 'bg-[#e79237]/10 text-[#e79237]',
        icon: 'bg-[#e79237]/10 text-[#e79237]',
    },
};

const PLAN_ICONS = [Rocket, Star, TrendingUp, Zap, Shield];

export default function PricingPage() {
    const { t, i18n } = getTranslation();
    const lang = i18n.language as 'en' | 'bn';
    const { data, isLoading, isError } = useGetPlansQuery();
    const plans = filterActivePlans(data?.data ?? []);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const frequencies = [
        { value: 'monthly' as const, label: t('pricing_page.frequency.monthly') || 'Monthly', priceSuffix: t('pricing_page.frequency.per_month') || '/month' },
        { value: 'annually' as const, label: t('pricing_page.frequency.annually') || 'Annually', priceSuffix: t('pricing_page.frequency.per_year') || '/year' },
    ];

    const faqs: { question: string; answer: string }[] = [];
    let faqIndex = 0;
    while (faqIndex < 10) {
        const question = t(`pricing_page.faq.questions.${faqIndex}.q`);
        if (question.startsWith('pricing_page.faq')) break;
        faqs.push({ question, answer: t(`pricing_page.faq.questions.${faqIndex}.a`) });
        faqIndex++;
    }

    const allFeatureItems = plans
        .flatMap((p) => p.items)
        .reduce((acc, item) => {
            if (!acc.find((i) => i.title_en === item.title_en)) acc.push(item);
            return acc;
        }, [] as (typeof plans)[0]['items']);
    const allFeatureTitles = allFeatureItems.map((i) => i.title_en);

    const topSavings = plans.length > 0 ? calcYearlySavings(plans[0].monthly_price, plans[0].yearly_price) : 0;

    return (
        <MainLayout>
            <div className="min-h-screen bg-white">
                {/* Hero */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79] pb-24 pt-32">
                    <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                    <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#046ca9]/30 bg-[#046ca9]/15 px-3 py-1.5 text-xs font-medium text-[#5bb8e8]">
                            <Shield className="h-3 w-3" />
                            {t('pricing_page.hero.badge_text') || 'Flexible Pricing Plans'}
                        </div>
                        <h1 className="mb-5 text-4xl font-black leading-tight text-white sm:text-5xl xl:text-6xl">
                            {t('pricing_page.hero.title') || 'Simple, Transparent'}<br />
                            <span className="bg-gradient-to-r from-[#5bb8e8] to-[#e8f4fb] bg-clip-text text-transparent">Pricing</span>
                        </h1>
                        <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
                            {t('pricing_page.hero.subtitle') || 'Choose the plan that best fits your business needs.'}
                        </p>
                        <div className="flex flex-col items-center justify-center gap-3 text-sm sm:flex-row sm:gap-6">
                            {[
                                { label: t('pricing_page.hero.benefits.no_setup') || 'No Setup Fee' },
                                { label: t('pricing_page.hero.benefits.cancel_anytime') || 'Cancel Anytime' },
                                { label: t('pricing_page.hero.benefits.support') || '24/7 Support' },
                            ].map((b, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-white/80">
                                    <Check className="h-4 w-4 text-white/90" />
                                    {b.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Billing toggle + cards */}
                <section className="bg-slate-50 py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Toggle */}
                        <div className="mb-12 flex justify-center">
                            <div className="relative flex rounded-full bg-white p-1.5 shadow-sm ring-1 ring-gray-200">
                                <div
                                    className={cn(
                                        'absolute bottom-1.5 top-1.5 w-[calc(50%-0.375rem)] rounded-full bg-gradient-to-r from-[#046ca9] to-[#034d79] shadow transition-transform duration-300 ease-in-out',
                                        billingCycle === 'monthly' ? 'translate-x-0' : 'translate-x-full'
                                    )}
                                />
                                {frequencies.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setBillingCycle(option.value)}
                                        className={cn(
                                            'relative z-10 flex w-36 items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold transition-colors duration-200',
                                            billingCycle === option.value ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                                        )}
                                    >
                                        {option.label}
                                        {option.value === 'annually' && topSavings > 0 && (
                                            <span className={cn(
                                                'absolute -right-6 -top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-sm',
                                                billingCycle === 'annually' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'
                                            )}>
                                                -{topSavings}%
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isLoading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-[#046ca9]" />
                                <span className="ml-3 text-lg text-gray-500">Loading plans…</span>
                            </div>
                        )}

                        {isError && !isLoading && (
                            <div className="py-10 text-center text-red-500">Failed to load pricing plans. Please try again later.</div>
                        )}

                        {!isLoading && !isError && (
                            <div className={cn(
                                'grid grid-cols-1 gap-6 xl:gap-8',
                                plans.length <= 2
                                    ? 'mx-auto max-w-3xl sm:grid-cols-2'
                                    : plans.length === 3
                                    ? 'sm:grid-cols-3'
                                    : 'sm:grid-cols-2 lg:grid-cols-4'
                            )}>
                                {plans.map((plan, index) => {
                                    const colorKey = getPlanColor(index);
                                    const colors = colorClasses[colorKey];
                                    const IconComponent = PLAN_ICONS[index % PLAN_ICONS.length];
                                    const isMostPopular = index === 1;
                                    const rawPrice = billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price;
                                    const suffix = billingCycle === 'monthly'
                                        ? (t('pricing_page.frequency.per_month') || '/month')
                                        : (t('pricing_page.frequency.per_year') || '/year');
                                    const planSavings = calcYearlySavings(plan.monthly_price, plan.yearly_price);
                                    const hasSetupFee = parseFloat(plan.setup_fee) > 0;
                                    const { originalPrice, finalPrice, hasDiscount, discountPct } = applyDiscount(rawPrice, plan.discount);

                                    return (
                                        <div
                                            key={plan.id}
                                            className={cn(
                                                'relative flex flex-col rounded-2xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl',
                                                isMostPopular ? colors.ring : 'ring-1 ring-gray-100 hover:ring-gray-200'
                                            )}
                                        >
                                            {isMostPopular && (
                                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                                    <div className="rounded-full bg-gradient-to-r from-[#046ca9] to-[#034d79] px-4 py-1 text-xs font-bold text-white shadow-lg shadow-[#046ca9]/30">
                                                        {t('pricing_page.most_popular') || 'Most Popular'}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex flex-1 flex-col p-6 sm:p-8">
                                                <div className="mb-5 flex items-center gap-3">
                                                    <div className={cn('rounded-xl p-2.5', colors.icon)}>
                                                        <IconComponent className="h-5 w-5" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900">{lang === 'bn' ? plan.name_bn : plan.name_en}</h3>
                                                </div>

                                                <div className="mb-6">
                                                    {hasDiscount && (
                                                        <span className="mb-2 inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">{discountPct}% OFF</span>
                                                    )}
                                                    <div className="flex flex-wrap items-baseline gap-2">
                                                        {hasDiscount && <span className="text-base text-gray-400 line-through">{originalPrice}</span>}
                                                        <span className="text-4xl font-black text-gray-900">{finalPrice}</span>
                                                        <span className="text-sm font-medium text-gray-400">{suffix}</span>
                                                    </div>
                                                    {billingCycle === 'annually' && planSavings > 0 && (
                                                        <p className="mt-1 text-xs font-semibold text-emerald-600">
                                                            {t('pricing_page.save_percent')} {planSavings}%
                                                        </p>
                                                    )}
                                                    <p className="mt-2 text-xs text-gray-500">
                                                        {t('pricing_page.setup_fee')}:{' '}
                                                        <span className="font-semibold text-gray-700">{hasSetupFee ? formatPrice(plan.setup_fee) : (t('pricing_page.setup_fee_free') || 'Free')}</span>
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => (window.location.href = '/register')}
                                                    className={cn('mb-6 w-full rounded-xl px-4 py-3 text-center text-sm font-bold shadow-sm transition-all duration-200', colors.button)}
                                                >
                                                    {t('pricing_page.get_started') || 'Get Started'}
                                                </button>

                                                {plan.items.length > 0 && (
                                                    <div className="flex-1">
                                                        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                                            {t('pricing_page.features_included') || "What's Included"}
                                                        </p>
                                                        <ul className="space-y-2.5">
                                                            {plan.items.map((item) => (
                                                                <li key={item.id} className="flex items-start gap-2.5">
                                                                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                                                                    <span className="text-sm text-gray-600">{lang === 'bn' ? item.title_bn : item.title_en}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* Comparison Table */}
                {!isLoading && !isError && plans.length > 0 && allFeatureTitles.length > 0 && (
                    <section className="bg-white py-16">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-12 text-center">
                                <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">
                                    {t('pricing_page.comparison.title') || 'Compare Features'}
                                </h2>
                                <p className="text-base text-gray-500">
                                    {t('pricing_page.comparison.subtitle') || 'Find the right plan for your business.'}
                                </p>
                            </div>
                            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                                <table className="w-full min-w-[640px]">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                                                {t('pricing_page.comparison.features') || 'Features'}
                                            </th>
                                            {plans.map((plan) => (
                                                <th key={plan.id} className="px-4 py-4 text-center text-sm font-bold text-gray-700 sm:px-6">
                                                    {lang === 'bn' ? plan.name_bn : plan.name_en}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 bg-white">
                                        {allFeatureTitles
                                            .filter((ft) => plans.some((p) => p.items.find((i) => i.title_en === ft)?.value))
                                            .map((featureTitle, rowIndex) => {
                                                const featureItem = allFeatureItems.find((i) => i.title_en === featureTitle);
                                                const displayTitle = lang === 'bn' && featureItem ? featureItem.title_bn : featureTitle;
                                                return (
                                                    <tr key={featureTitle} className={rowIndex % 2 === 1 ? 'bg-slate-50/50' : ''}>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{displayTitle}</td>
                                                        {plans.map((plan) => {
                                                            const item = plan.items.find((i) => i.title_en === featureTitle);
                                                            return (
                                                                <td key={plan.id} className="px-4 py-4 text-center text-sm text-gray-900 sm:px-6">
                                                                    {item ? (
                                                                        item.value ? (
                                                                            <span className="font-semibold">{item.value === 'unlimited' ? '∞' : item.value}</span>
                                                                        ) : (
                                                                            <Check className="mx-auto h-5 w-5 text-emerald-500" />
                                                                        )
                                                                    ) : (
                                                                        <span className="text-gray-300">—</span>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}

                {/* FAQ */}
                {faqs.length > 0 && (
                    <section className="bg-slate-50 py-16">
                        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-12 text-center">
                                <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('pricing_page.faq.title')}</h2>
                                <p className="text-base text-gray-500">{t('pricing_page.faq.subtitle')}</p>
                            </div>
                            <div className="space-y-3">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                                        <button
                                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                            className="flex w-full items-center justify-between px-6 py-5 text-left"
                                        >
                                            <span className="font-semibold text-gray-900">{faq.question}</span>
                                            <ChevronDown className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`} />
                                        </button>
                                        {openFaq === index && (
                                            <div className="border-t border-gray-50 px-6 py-5">
                                                <p className="text-sm leading-relaxed text-gray-600">{faq.answer}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Trust */}
                <section className="bg-white py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { icon: <Shield className="h-7 w-7 text-[#046ca9]" />, bg: 'bg-[#046ca9]/8', title: t('pricing_page.trust.secure_title'), desc: t('pricing_page.trust.secure_subtitle') },
                                { icon: <Clock className="h-7 w-7 text-[#046ca9]" />, bg: 'bg-[#046ca9]/8', title: t('pricing_page.trust.support_title'), desc: t('pricing_page.trust.support_subtitle') },
                                { icon: <Users className="h-7 w-7 text-[#046ca9]" />, bg: 'bg-[#046ca9]/8', title: t('pricing_page.trust.trusted_title'), desc: t('pricing_page.trust.trusted_subtitle') },
                            ].map((item, i) => (
                                <div key={i} className={cn('text-center sm:col-span-1', i === 2 ? 'sm:col-span-2 lg:col-span-1' : '')}>
                                    <div className={cn('mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl', item.bg)}>
                                        {item.icon}
                                    </div>
                                    <h3 className="mb-2 font-bold text-gray-900">{item.title}</h3>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79] py-20">
                    <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    />
                    <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                        <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">{t('pricing_page.cta.title')}</h2>
                        <p className="mb-8 text-base text-white/70">{t('pricing_page.cta.subtitle')}</p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href="/register"
                                className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#046ca9] to-[#034d79] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#046ca9]/30 transition-all hover:scale-105 sm:w-auto"
                            >
                                {t('pricing_page.cta.start_trial')}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="/contact"
                                className="w-full rounded-full border border-white/20 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 sm:w-auto"
                            >
                                {t('pricing_page.cta.contact_sales')}
                            </Link>
                        </div>
                        <p className="mt-6 text-xs text-white/50">{t('pricing_page.cta.guarantee')}</p>
                    </div>
                </section>
            </div>
            <Footer />
        </MainLayout>
    );
}
