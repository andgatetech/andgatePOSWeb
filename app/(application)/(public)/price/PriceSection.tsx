'use client';

import { getTranslation } from '@/i18n';
import { applyDiscount, calcYearlySavings, filterActivePlans, formatPrice, getPlanColor, useGetPlansQuery } from '@/store/features/plans/plansApi';
import { Check, Loader2, Rocket, Shield, Star, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

const colorClasses = {
    slate: { ring: 'ring-slate-200', button: 'bg-slate-50 text-slate-700 hover:bg-slate-100 ring-1 ring-inset ring-slate-300', icon: 'text-slate-400' },
    green: { ring: 'ring-green-600', button: 'bg-green-600 text-white hover:bg-green-700', icon: 'text-green-500' },
    blue: { ring: 'ring-blue-600', button: 'bg-blue-600 text-white hover:bg-blue-700', icon: 'text-blue-500' },
    purple: { ring: 'ring-purple-600', button: 'bg-purple-600 text-white hover:bg-purple-700', icon: 'text-purple-500' },
    orange: { ring: 'ring-orange-600', button: 'bg-orange-600 text-white hover:bg-orange-700', icon: 'text-orange-500' },
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
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pb-20 pt-16">
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="mb-6 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                            <Shield className="mr-2 h-4 w-4" />
                            {t('pricing_page.hero.badge_text') || 'Flexible Pricing Plans'}
                        </div>
                        <h1 className="mb-6 text-4xl font-black leading-tight text-gray-900 sm:text-5xl md:text-6xl">{t('pricing_page.hero.title') || 'Simple, Transparent Pricing'}</h1>
                        <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-gray-600 sm:text-xl">{t('pricing_page.hero.subtitle') || 'Choose the plan that fits your business.'}</p>
                        <div className="flex flex-col items-center justify-center space-y-3 text-sm text-gray-600 sm:flex-row sm:space-x-6 sm:space-y-0">
                            <div className="flex items-center">
                                <Check className="mr-2 h-4 w-4 text-green-500" />
                                {t('pricing_page.hero.benefits.no_setup') || 'No Setup Fee'}
                            </div>
                            <div className="flex items-center">
                                <Check className="mr-2 h-4 w-4 text-blue-500" />
                                {t('pricing_page.hero.benefits.cancel_anytime') || 'Cancel Anytime'}
                            </div>
                            <div className="flex items-center">
                                <Check className="mr-2 h-4 w-4 text-purple-500" />
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
                                            Save {topSavings}%
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Plan cards */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
                                                <div className="rounded-full bg-blue-600 px-4 py-1 text-sm font-medium text-white shadow-lg">Most Popular</div>
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
                                                {hasDiscount && <span className="mb-2 inline-block rounded-full bg-red-100 px-3 py-0.5 text-xs font-semibold text-red-600">{discountPct}% OFF</span>}
                                                <div className="flex flex-wrap items-baseline gap-2">
                                                    {hasDiscount && <span className="text-lg text-gray-400 line-through">{originalPrice}</span>}
                                                    <span className="text-3xl font-bold text-gray-900 sm:text-4xl">{finalPrice}</span>
                                                    <span className="text-sm font-medium text-gray-500">{suffix}</span>
                                                </div>
                                                {billingCycle === 'annually' && planSavings > 0 && <p className="mt-1 text-sm font-medium text-green-600">Save {planSavings}% vs monthly</p>}
                                                {hasSetupFee && (
                                                    <p className="mt-2 text-sm font-medium text-gray-700">
                                                        Setup Fee: <span className="font-semibold text-gray-900">{formatPrice(plan.setup_fee)}</span>
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => (window.location.href = '/register')}
                                                className={classNames('mb-6 w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-all duration-200', colors.button)}
                                            >
                                                Get Started
                                            </button>

                                            {plan.items.length > 0 && (
                                                <div className="flex-1">
                                                    <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-500">What&apos;s Included</p>
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
        </div>
    );
}
