'use client';

import { convertNumberByLanguage } from '@/components/custom/convertNumberByLanguage';
import { getTranslation } from '@/i18n';
import { applyDiscount, calcYearlySavings, filterActivePlans, formatPrice, getPlanColor, useGetPlansQuery } from '@/store/features/plans/plansApi';
import { Check, Loader2, Rocket, Shield, Star, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

const colorClasses = {
    slate: { ring: 'ring-[#046ca9]', button: 'bg-[#046ca9] text-white hover:bg-[#034d79]', icon: 'text-[#046ca9]' },
    green: { ring: 'ring-[#046ca9]', button: 'bg-[#046ca9] text-white hover:bg-[#034d79]', icon: 'text-[#046ca9]' },
    blue: { ring: 'ring-[#046ca9]', button: 'bg-[#046ca9] text-white hover:bg-[#034d79]', icon: 'text-[#046ca9]' },
    purple: { ring: 'ring-[#046ca9]', button: 'bg-[#046ca9] text-white hover:bg-[#034d79]', icon: 'text-[#046ca9]' },
    orange: { ring: 'ring-[#e79237]', button: 'bg-[#e79237] text-white hover:bg-[#c47920]', icon: 'text-[#e79237]' },
};

const PLAN_ICONS = [Rocket, Star, TrendingUp, Zap, Shield];

interface PriceSectionProps {
    id?: string;
}

export default function PriceSection({ id }: PriceSectionProps) {
    const { t, i18n } = getTranslation();
    const lang = i18n.language as 'en' | 'bn';
    const { data, isLoading, isError } = useGetPlansQuery();
    const plans = filterActivePlans(data?.data ?? []);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

    const frequencies = [
        { value: 'monthly' as const, label: t('pricing_page.frequency.monthly') || 'Monthly', priceSuffix: t('pricing_page.frequency.per_month') || '/month' },
        { value: 'annually' as const, label: t('pricing_page.frequency.annually') || 'Annually', priceSuffix: t('pricing_page.frequency.per_year') || '/year' },
    ];

    const topSavings = plans.length > 0 ? calcYearlySavings(plans[0].monthly_price, plans[0].yearly_price) : 0;

    return (
        <div id={id} className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-[#e8f4fb] to-[#fdf3e7] pb-20 pt-16">
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="mb-6 inline-flex items-center rounded-full bg-[#046ca9]/10 px-4 py-2 text-sm font-medium text-[#046ca9]">
                            <Shield className="mr-2 h-4 w-4" />
                            {t('pricing_page.hero.badge_text') || 'Flexible Pricing Plans'}
                        </div>
                        <h1 className="mb-6 text-4xl font-black leading-tight text-gray-900 sm:text-5xl md:text-6xl">{t('pricing_page.hero.title') || 'Simple, Transparent Pricing'}</h1>
                        <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-gray-600 sm:text-xl">{t('pricing_page.hero.subtitle') || 'Choose the plan that fits your business.'}</p>
                        <div className="flex flex-col items-center justify-center space-y-3 text-sm text-gray-600 sm:flex-row sm:space-x-6 sm:space-y-0">
                            <div className="flex items-center">
                                <Check className="mr-2 h-4 w-4 text-[#046ca9]" />
                                {t('pricing_page.hero.benefits.no_setup') || 'No Setup Fee'}
                            </div>
                            <div className="flex items-center">
                                <Check className="mr-2 h-4 w-4 text-[#046ca9]" />
                                {t('pricing_page.hero.benefits.cancel_anytime') || 'Cancel Anytime'}
                            </div>
                            <div className="flex items-center">
                                <Check className="mr-2 h-4 w-4 text-[#046ca9]" />
                                {t('pricing_page.hero.benefits.support') || '24/7 Support'}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Billing Toggle */}
                    <div className="mb-12 flex justify-center">
                        <div className="relative flex rounded-full bg-slate-100 p-1.5 shadow-inner">
                            <div
                                className={classNames(
                                    'absolute bottom-1.5 top-1.5 w-[calc(50%-0.375rem)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out',
                                    billingCycle === 'monthly' ? 'translate-x-0' : 'translate-x-full'
                                )}
                            ></div>
                            {frequencies.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setBillingCycle(option.value)}
                                    className={classNames(
                                        'relative z-10 flex w-36 items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold transition-colors duration-200',
                                        billingCycle === option.value ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                    )}
                                >
                                    {option.label}
                                    {option.value === 'annually' && topSavings > 0 && (
                                        <span
                                            className={classNames(
                                                'absolute -right-6 -top-3 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-sm transition-all duration-300',
                                                billingCycle === 'annually' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'
                                            )}
                                        >
                                            Save {convertNumberByLanguage(topSavings.toString())}%
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Plan cards */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-[#046ca9]" />
                            <span className="ml-3 text-gray-600">Loading plans...</span>
                        </div>
                    )}
                    {isError && !isLoading && <div className="py-10 text-center text-red-600">Failed to load pricing plans. Please try again later.</div>}
                    {!isLoading && !isError && plans.length > 0 && (
                        <div
                            className={classNames(
                                'grid grid-cols-1 gap-6 xl:gap-8',
                                plans.length <= 2 ? 'mx-auto max-w-3xl sm:grid-cols-2' : plans.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'
                            )}
                        >
                            {plans.map((plan, index) => {
                                const colorKey = getPlanColor(index);
                                const colors = colorClasses[colorKey];
                                const IconComponent = PLAN_ICONS[index % PLAN_ICONS.length];
                                const isMostPopular = index === 1;
                                const rawPrice = billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price;
                                const suffix = billingCycle === 'monthly' ? '/month' : '/year';
                                const { originalPrice, finalPrice, hasDiscount, discountPct } = applyDiscount(rawPrice, plan.discount);
                                const hasSetupFee = parseFloat(plan.setup_fee) > 0;
                                const planSavings = calcYearlySavings(plan.monthly_price, plan.yearly_price);

                                return (
                                    <div
                                        key={plan.id}
                                        className={classNames(
                                            'relative flex flex-col rounded-2xl border-2 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl',
                                            isMostPopular ? `${colors.ring} shadow-lg` : 'border-gray-200 hover:border-gray-300'
                                        )}
                                    >
                                        {isMostPopular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                                                <div className="rounded-full bg-[#046ca9] px-4 py-1 text-sm font-medium text-white shadow-lg">{t('pricing_page.most_popular')}</div>
                                            </div>
                                        )}

                                        <div className="flex flex-1 flex-col p-6 sm:p-8">
                                            <div className="mb-4 flex items-center gap-3">
                                                <div className={classNames('rounded-lg bg-gray-50 p-2', colors.icon)}>
                                                    <IconComponent className="h-6 w-6" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900">{lang === 'bn' ? plan.name_bn : plan.name_en}</h3>
                                            </div>

                                            <div className="mb-6">
                                                {hasDiscount && <span className="mb-2 inline-block rounded-full bg-red-100 px-3 py-0.5 text-xs font-semibold text-red-600">{convertNumberByLanguage(discountPct.toString())}% OFF</span>}
                                                <div className="flex flex-wrap items-baseline gap-2">
                                                    {hasDiscount && <span className="text-lg text-gray-400 line-through">{originalPrice}</span>}
                                                    <span className="text-3xl font-bold text-gray-900 sm:text-4xl">{finalPrice}</span>
                                                    <span className="text-sm font-medium text-gray-500">{suffix}</span>
                                                </div>
                                                {billingCycle === 'annually' && planSavings > 0 && (
                                                    <p className="mt-1 text-sm font-medium text-green-600">
                                                        {t('pricing_page.save_percent')} {convertNumberByLanguage(planSavings.toString())}%
                                                    </p>
                                                )}
                                                <p className="mt-2 text-sm font-medium text-gray-700">
                                                    {t('pricing_page.setup_fee')}:{' '}
                                                    <span className="font-semibold text-gray-900">{hasSetupFee ? formatPrice(plan.setup_fee) : t('pricing_page.setup_fee_free')}</span>
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => (window.location.href = '/register')}
                                                className={classNames('mb-6 w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-all duration-200', colors.button)}
                                            >
                                                {t('pricing_page.get_started')}
                                            </button>

                                            {plan.items.length > 0 && (
                                                <div className="flex-1">
                                                    <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-500">{t('pricing_page.features_included')}</p>
                                                    <ul className="space-y-3">
                                                        {plan.items.map((item) => (
                                                            <li key={item.id} className="flex items-start gap-3">
                                                                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
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

            {/* Compare Features Section */}
            {!isLoading && !isError && plans.length > 0 && (
                <section className="bg-white py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-black text-gray-900 sm:text-4xl">{t('pricing_page.comparison.title') || 'Compare All Features'}</h2>
                            <p className="mx-auto mb-2 max-w-2xl text-xl font-semibold text-gray-900">{t('pricing_page.comparison.subtitle') || 'Find the right plan for your business'}</p>
                            <p className="mx-auto max-w-2xl text-lg text-gray-600">{t('pricing_page.comparison.subtitle_detail') || "See what's included in each plan"}</p>
                        </div>

                        {/* Comparison Table */}
                        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-slate-50 to-[#e8f4fb]">
                                    <tr>
                                        <th className="sticky left-0 z-10 bg-gradient-to-r from-slate-50 to-[#e8f4fb] px-6 py-4 text-left text-sm font-bold text-gray-900">
                                            {t('pricing_page.comparison.features') || 'Features'}
                                        </th>
                                        {plans.map((plan, index) => {
                                            const isMostPopular = index === 1;
                                            return (
                                                <th key={plan.id} className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-lg font-bold text-gray-900">{lang === 'bn' ? plan.name_bn : plan.name_en}</span>
                                                        {isMostPopular && (
                                                            <span className="mt-1 inline-block rounded-full bg-[#046ca9]/10 px-3 py-0.5 text-xs font-semibold text-[#046ca9]">
                                                                {t('pricing_page.most_popular') || 'Most Popular'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {/* Price Row */}
                                    <tr className="bg-white hover:bg-gray-50">
                                        <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                                            {t('pricing_page.frequency.monthly') || 'Monthly'} {t('pricing_page.comparison.price') || 'Price'}
                                        </td>
                                        {plans.map((plan) => {
                                            const { finalPrice } = applyDiscount(plan.monthly_price, plan.discount);
                                            return (
                                                <td key={plan.id} className="px-6 py-4 text-center">
                                                    <span className="text-lg font-bold text-gray-900">{finalPrice}</span>
                                                    <span className="text-sm text-gray-500">/mo</span>
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Setup Fee Row */}
                                    <tr className="bg-gray-50 hover:bg-gray-100">
                                        <td className="sticky left-0 z-10 bg-gray-50 px-6 py-4 font-medium text-gray-900">{t('pricing_page.setup_fee') || 'Setup Fee'}</td>
                                        {plans.map((plan) => {
                                            const hasSetupFee = parseFloat(plan.setup_fee) > 0;
                                            return (
                                                <td key={plan.id} className="px-6 py-4 text-center">
                                                    {hasSetupFee ? (
                                                        <span className="text-sm text-gray-700">{formatPrice(plan.setup_fee)}</span>
                                                    ) : (
                                                        <span className="text-sm font-semibold text-green-600">{t('pricing_page.setup_fee_free') || 'Free'}</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Feature Rows */}
                                    {plans[0]?.items.map((_, itemIndex) => {
                                        return (
                                            <tr key={itemIndex} className={itemIndex % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                                                <td
                                                    className="sticky left-0 z-10 px-6 py-4 font-medium text-gray-900"
                                                    style={{ backgroundColor: itemIndex % 2 === 0 ? 'white' : 'rgb(249, 250, 251)' }}
                                                >
                                                    {lang === 'bn' ? plans[0].items[itemIndex]?.title_bn : plans[0].items[itemIndex]?.title_en}
                                                </td>
                                                {plans.map((plan) => {
                                                    const item = plan.items[itemIndex];
                                                    return (
                                                        <td key={plan.id} className="px-6 py-4 text-center">
                                                            {item ? <Check className="mx-auto h-5 w-5 text-green-500" /> : <span className="text-gray-400">—</span>}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* CTA Below Table */}
                        <div className="mt-12 text-center">
                            <button
                                onClick={() => (window.location.href = '/register')}
                                className="inline-flex items-center rounded-lg bg-[#046ca9] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#034d79] hover:shadow-xl"
                            >
                                {t('pricing_page.get_started') || 'Get Started'}
                                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
