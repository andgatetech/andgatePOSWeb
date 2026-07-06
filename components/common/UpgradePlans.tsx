'use client';
import { applyDiscount, calcYearlySavings, filterActivePlans, formatPrice, getPlanColor, isMostPopularPlan, isEnterprisePlan, useGetPlansQuery } from '@/store/features/plans/plansApi';
import { useTranslation } from '@/components/i18n/TranslationProvider';
import { Check, Crown, Loader2, Rocket, Shield, Star, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface UpgradePlansProps {
    showHeader?: boolean;
    currentPlan?: string;
}

function classNames(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

const colorClasses = {
    green: {
        ring: 'ring-green-600',
        button: 'bg-green-600 text-white hover:bg-green-700',
        icon: 'text-green-500',
    },
    blue: {
        ring: 'ring-blue-600',
        button: 'bg-primary text-white hover:bg-primary/90',
        icon: 'text-blue-500',
    },
    purple: {
        ring: 'ring-purple-600',
        button: 'bg-purple-600 text-white hover:bg-purple-700',
        icon: 'text-purple-500',
    },
    orange: {
        ring: 'ring-orange-600',
        button: 'bg-orange-600 text-white hover:bg-orange-700',
        icon: 'text-orange-500',
    },
    slate: {
        ring: 'ring-slate-200',
        button: 'bg-slate-50 text-slate-700 hover:bg-slate-100 ring-1 ring-inset ring-slate-300',
        icon: 'text-slate-400',
    },
};

const PLAN_ICONS = [Rocket, Star, TrendingUp, Zap, Shield];

const UpgradePlans: React.FC<UpgradePlansProps> = ({ showHeader = true, currentPlan }) => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language as 'en' | 'bn';
    const { data, isLoading, isError } = useGetPlansQuery();
    const plans = filterActivePlans(data?.data ?? []);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

    const frequencies = [
        { value: 'monthly' as const, label: t('pricing_page.frequency.monthly'), priceSuffix: t('pricing_page.frequency.per_month') },
        { value: 'annually' as const, label: t('pricing_page.frequency.annually'), priceSuffix: t('pricing_page.frequency.per_year'), discount: t('pricing_page.save_percent') },
    ];

    const topSavings = plans.length > 0 ? calcYearlySavings(plans[0].monthly_price, plans[0].yearly_price) : 0;

    return (
        <div className="w-full">
            {showHeader && (
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                        <Shield className="mr-2 h-4 w-4" />
                        {t('lbl_flexible_pricing')}
                    </div>
                    <h2 className="mb-4 text-3xl font-black text-gray-900 sm:text-4xl">{t('lbl_choose_plan')}</h2>
                    <p className="mx-auto max-w-2xl text-lg text-gray-600">{t('lbl_select_plan_desc')}</p>
                    <div className="mt-4 flex flex-col items-center justify-center space-y-2 text-sm text-gray-600 sm:flex-row sm:space-x-6 sm:space-y-0">
                        <div className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-blue-500" />
                            {t('pricing_page.trust_cancel')}
                        </div>
                        <div className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-purple-500" />
                            {t('label_24_7_support')}
                        </div>
                    </div>
                </div>
            )}

            {/* Frequency Toggle */}
            <div className="mb-12 flex justify-center">
                <div className="relative rounded-xl bg-gray-100 p-1">
                    {frequencies.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setBillingCycle(option.value)}
                            className={classNames(
                                'relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 sm:px-6',
                                billingCycle === option.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            )}
                        >
                            {option.label}
                            {option.discount && topSavings > 0 && (
                                <span className="absolute -right-2 -top-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                    {option.discount} {topSavings}%
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-600">{t('lbl_loading')}</span>
                </div>
            )}

            {/* Error */}
            {isError && !isLoading && <div className="py-10 text-center text-red-600">{t('msg_failed_load_plans')}</div>}

            {/* Pricing Cards */}
            {!isLoading && !isError && (
                <div
                    className={classNames(
                        'grid grid-cols-1 gap-6 xl:gap-8',
                        plans.length <= 2 ? 'mx-auto max-w-3xl sm:grid-cols-2' : plans.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'
                    )}
                >
                    {plans.map((plan, index) => {
                        const colorKey = getPlanColor(index);
                        const colors = colorClasses[colorKey];
                        const IconComponent = PLAN_ICONS[index % PLAN_ICONS.length];
                        const isMostPopular = isMostPopularPlan(plan);
                        const isEnterprise = isEnterprisePlan(plan);
                        const isCurrentPlan = currentPlan?.toLowerCase() === plan.name_en.toLowerCase();
                        const rawPrice = billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price;
                        const suffix = billingCycle === 'monthly' ? t('pricing_page.frequency.per_month') : t('pricing_page.frequency.per_year');
                        const planSavings = calcYearlySavings(plan.monthly_price, plan.yearly_price);
                        const hasSetupFee = parseFloat(plan.setup_fee) > 0;
                        const { originalPrice, finalPrice, hasDiscount, discountPct } = applyDiscount(rawPrice, plan.discount);
                        const planName = lang === 'bn' ? (plan.name_bn || plan.name_en) : plan.name_en;
                        const ctaLabel = lang === 'bn' ? (plan.cta_label_bn || plan.cta_label_en) : (plan.cta_label_en || (isEnterprise ? t('pricing_page.cta.contact_sales') : t('pricing_page.get_started')));

                        return (
                            <div
                                key={plan.id}
                                className={classNames(
                                    'relative flex flex-col rounded-2xl border-2 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl',
                                    isMostPopular && !isCurrentPlan ? `${colors.ring} shadow-lg` : 'border-gray-200 hover:border-gray-300',
                                    isCurrentPlan && 'border-green-500 shadow-lg'
                                )}
                            >
                                {isMostPopular && !isCurrentPlan && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                                        <div className="rounded-full bg-primary px-4 py-1 text-sm font-medium text-white shadow-lg">{t('pricing_page.most_popular')}</div>
                                    </div>
                                )}
                                {isCurrentPlan && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                                        <div className="rounded-full bg-green-600 px-4 py-1 text-sm font-medium text-white shadow-lg">{t('lbl_current_plan')}</div>
                                    </div>
                                )}

                                <div className="flex flex-1 flex-col p-6 sm:p-8">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className={classNames('rounded-lg bg-gray-50 p-2', colors.icon)}>
                                            <IconComponent className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900">{planName}</h3>
                                    </div>

                                    <div className="mb-6">
                                        {hasDiscount && !isEnterprise && <span className="mb-2 inline-block rounded-full bg-red-100 px-3 py-0.5 text-xs font-semibold text-red-600">{discountPct}% {lang === 'bn' ? 'ছাড়' : 'OFF'}</span>}
                                        <div className="flex flex-wrap items-baseline gap-2">
                                            {hasDiscount && !isEnterprise && <span className="text-lg text-gray-400 line-through">{originalPrice}</span>}
                                            <span className={`${isEnterprise ? 'text-2xl' : 'text-3xl sm:text-4xl'} font-bold text-gray-900`}>
                                                {isEnterprise ? (lang === 'bn' ? 'চাহিদা অনুযায়ী' : 'Custom Pricing') : finalPrice}
                                            </span>
                                            {!isEnterprise && <span className="text-sm font-medium text-gray-500">{suffix}</span>}
                                        </div>
                                        {billingCycle === 'annually' && planSavings > 0 && !isEnterprise && <p className="mt-1 text-sm font-medium text-green-600">{t('pricing_page.save_percent')} {planSavings}%</p>}
                                        {hasSetupFee && (
                                            <p className="mt-2 text-sm font-medium text-gray-700">
                                                {t('pricing_page.setup_fee')}: <span className="font-semibold text-gray-900">{formatPrice(plan.setup_fee)}</span>
                                            </p>
                                        )}
                                    </div>

                                    {isCurrentPlan ? (
                                        <button
                                            disabled
                                            className="mb-6 w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-center text-sm font-semibold text-gray-500"
                                        >
                                            ✓ {t('lbl_current_plan')}
                                        </button>
                                    ) : (
                                        <Link
                                            href={isEnterprise ? '/contact' : `/subscription?plan_id=${plan.id}`}
                                            className={classNames('mb-6 block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-all duration-200', colors.button)}
                                        >
                                            <Crown className="mr-2 inline-block h-4 w-4" />
                                            {ctaLabel}
                                        </Link>
                                    )}

                                    {plan.items.length > 0 && (
                                        <div className="flex-1">
                                            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-500">{t('pricing_page.features_included')}</p>
                                            <ul className="space-y-3">
                                                {plan.items.map((item) => (
                                                    <li key={item.id} className="flex items-start gap-3">
                                                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                                                        <span className="text-sm text-gray-600">{lang === 'bn' ? (item.title_bn || item.title_en) : item.title_en}</span>
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
    );
};

export default UpgradePlans;
