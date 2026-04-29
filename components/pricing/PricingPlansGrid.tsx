'use client';

import { convertNumberByLanguage } from '@/components/custom/convertNumberByLanguage';
import { getTranslation } from '@/i18n';
import {
    applyDiscount,
    calcYearlySavings,
    filterActivePlans,
    formatPrice,
    getPlanColor,
    useGetPlansQuery,
} from '@/store/features/plans/plansApi';
import { Check, Loader2, Minus, Rocket, Shield, ShieldCheck, Star, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

const colorClasses = {
    slate:  { button: 'bg-gradient-to-r from-[#046ca9] to-[#034d79] text-white hover:opacity-90', icon: 'bg-[#046ca9]/10 text-[#046ca9]', accent: 'bg-gradient-to-r from-[#046ca9] to-[#034d79]' },
    green:  { button: 'bg-gradient-to-r from-[#046ca9] to-[#034d79] text-white hover:opacity-90', icon: 'bg-[#046ca9]/10 text-[#046ca9]', accent: 'bg-gradient-to-r from-[#046ca9] to-[#034d79]' },
    blue:   { button: 'bg-gradient-to-r from-[#046ca9] to-[#034d79] text-white hover:opacity-90', icon: 'bg-[#046ca9]/10 text-[#046ca9]', accent: 'bg-gradient-to-r from-[#046ca9] to-[#034d79]' },
    purple: { button: 'bg-gradient-to-r from-[#046ca9] to-[#034d79] text-white hover:opacity-90', icon: 'bg-[#046ca9]/10 text-[#046ca9]', accent: 'bg-gradient-to-r from-[#046ca9] to-[#034d79]' },
    orange: { button: 'bg-gradient-to-r from-[#e79237] to-[#c47920] text-white hover:opacity-90', icon: 'bg-[#e79237]/10 text-[#e79237]', accent: 'bg-gradient-to-r from-[#e79237] to-[#c47920]' },
};

const PLAN_ICONS = [Rocket, Star, TrendingUp, Zap, Shield];

interface PricingPlansGridProps {
    showComparison?: boolean;
}

export default function PricingPlansGrid({ showComparison = true }: PricingPlansGridProps) {
    const { t, i18n } = getTranslation();
    const lang = i18n.language as 'en' | 'bn';
    const { data, isLoading, isError } = useGetPlansQuery();
    const plans = filterActivePlans(data?.data ?? []);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

    const topSavings = plans.length > 0 ? calcYearlySavings(plans[0].monthly_price, plans[0].yearly_price) : 0;

    const gridCols =
        plans.length <= 2 ? 'mx-auto max-w-3xl sm:grid-cols-2'
        : plans.length === 3 ? 'sm:grid-cols-3'
        : plans.length === 4 ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';

    return (
        <>
            {/* ── Billing toggle ── */}
            <div className="mb-10 flex justify-center">
                <div className="relative flex rounded-full bg-white p-1.5 shadow-sm ring-1 ring-gray-200">
                    <div
                        className={cn(
                            'absolute bottom-1.5 top-1.5 w-[calc(50%-0.375rem)] rounded-full bg-gradient-to-r from-[#046ca9] to-[#034d79] shadow transition-transform duration-300 ease-in-out',
                            billingCycle === 'monthly' ? 'translate-x-0' : 'translate-x-full'
                        )}
                    />
                    {(['monthly', 'annually'] as const).map((cycle) => (
                        <button
                            key={cycle}
                            onClick={() => setBillingCycle(cycle)}
                            className={cn(
                                'relative z-10 flex w-36 items-center justify-center gap-1.5 rounded-full px-6 py-2.5 text-sm font-bold transition-colors duration-200',
                                billingCycle === cycle ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            {cycle === 'monthly'
                                ? (t('pricing_page.frequency.monthly') || 'Monthly')
                                : (t('pricing_page.frequency.annually') || 'Annually')}
                            {cycle === 'annually' && topSavings > 0 && (
                                <span className={cn(
                                    'rounded-full px-2 py-0.5 text-[10px] font-bold',
                                    billingCycle === 'annually'
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-emerald-100 text-emerald-700'
                                )}>
                                    -{convertNumberByLanguage(topSavings.toString())}%
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Loading / error states ── */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-[#046ca9]" />
                    <span className="ml-3 text-lg text-gray-500">Loading plans…</span>
                </div>
            )}
            {isError && !isLoading && (
                <p className="py-10 text-center text-red-500">Failed to load pricing plans. Please try again later.</p>
            )}

            {/* ── Plan cards ── */}
            {!isLoading && !isError && plans.length > 0 && (
                <div className={cn('grid grid-cols-1 items-start gap-5', gridCols)}>
                    {plans.map((plan, index) => {
                        const colorKey = getPlanColor(index);
                        const colors = colorClasses[colorKey];
                        const IconComponent = PLAN_ICONS[index % PLAN_ICONS.length];
                        const isMostPopular = index === 1;
                        const rawPrice = billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price;
                        const suffix = billingCycle === 'monthly'
                            ? (t('pricing_page.frequency.per_month') || '/mo')
                            : (t('pricing_page.frequency.per_year') || '/yr');
                        const planSavings = calcYearlySavings(plan.monthly_price, plan.yearly_price);
                        const hasSetupFee = parseFloat(plan.setup_fee) > 0;
                        const { originalPrice, finalPrice, hasDiscount, discountPct } = applyDiscount(rawPrice, plan.discount);
                        const planDesc = t(`pricing_page.plan_descriptions.${index}`);
                        const descIsKey = planDesc.startsWith('pricing_page.');

                        return (
                            <div
                                key={plan.id}
                                className={cn(
                                    'relative flex flex-col overflow-hidden rounded-2xl transition-all duration-200',
                                    isMostPopular
                                        ? 'z-10 scale-[1.02] shadow-2xl shadow-[#046ca9]/20 ring-2 ring-[#046ca9]'
                                        : 'bg-white shadow-sm ring-1 ring-gray-100 hover:-translate-y-1 hover:shadow-lg hover:ring-gray-200'
                                )}
                            >
                                {/* ── Popular: blue gradient header ── */}
                                {isMostPopular ? (
                                    <div className="relative overflow-hidden bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79] px-5 pb-6 pt-5">
                                        {/* Subtle dot pattern */}
                                        <div
                                            className="pointer-events-none absolute inset-0 opacity-[0.07]"
                                            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                                        />
                                        {/* Badge */}
                                        <div className="relative mb-4 flex justify-center">
                                            <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                                                <Star className="h-3 w-3 fill-white" />
                                                {t('pricing_page.most_popular') || 'Most Popular'}
                                            </span>
                                        </div>
                                        {/* Icon + name + description */}
                                        <div className="relative mb-4 flex items-start gap-3">
                                            <div className="mt-0.5 flex-shrink-0 rounded-xl bg-white/15 p-2.5">
                                                <IconComponent className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-white">
                                                    {lang === 'bn' ? plan.name_bn : plan.name_en}
                                                </h3>
                                                {!descIsKey && (
                                                    <p className="mt-0.5 text-[12px] leading-snug text-white/70">{planDesc}</p>
                                                )}
                                            </div>
                                        </div>
                                        {/* Price */}
                                        <div className="relative">
                                            {hasDiscount && (
                                                <span className="mb-1 inline-block rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-200">
                                                    {convertNumberByLanguage(discountPct.toString())}% {lang === 'bn' ? 'ছাড়' : 'OFF'}
                                                </span>
                                            )}
                                            <div className="flex flex-wrap items-baseline gap-1.5">
                                                {hasDiscount && (
                                                    <span className="text-sm text-white/40 line-through">{originalPrice}</span>
                                                )}
                                                <span className="text-4xl font-black tracking-tight text-white">{finalPrice}</span>
                                                <span className="text-sm text-white/60">{suffix}</span>
                                            </div>
                                            {billingCycle === 'annually' && planSavings > 0 && (
                                                <p className="mt-1 text-[12px] font-semibold text-emerald-300">
                                                    ↓ {t('pricing_page.save_percent')} {convertNumberByLanguage(planSavings.toString())}%
                                                </p>
                                            )}
                                            <p className="mt-1.5 text-[11px] text-white/50">
                                                {t('pricing_page.setup_fee')}:{' '}
                                                <span className="font-bold text-white/80">
                                                    {hasSetupFee ? formatPrice(plan.setup_fee) : (t('pricing_page.setup_fee_free') || 'Free')}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    /* ── Regular plan header ── */
                                    <div>
                                        <div className={cn('h-1.5 w-full', colors.accent)} />
                                        <div className="px-5 pb-4 pt-5">
                                            <div className="mb-4 flex items-start gap-2.5">
                                                <div className={cn('mt-0.5 flex-shrink-0 rounded-lg p-2', colors.icon)}>
                                                    <IconComponent className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-gray-900">
                                                        {lang === 'bn' ? plan.name_bn : plan.name_en}
                                                    </h3>
                                                    {!descIsKey && (
                                                        <p className="mt-0.5 text-[11px] leading-snug text-gray-400">{planDesc}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="border-b border-gray-50 pb-4">
                                                {hasDiscount && (
                                                    <span className="mb-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500">
                                                        {convertNumberByLanguage(discountPct.toString())}% {lang === 'bn' ? 'ছাড়' : 'OFF'}
                                                    </span>
                                                )}
                                                <div className="flex flex-wrap items-baseline gap-1.5">
                                                    {hasDiscount && (
                                                        <span className="text-sm text-gray-300 line-through">{originalPrice}</span>
                                                    )}
                                                    <span className="text-3xl font-black text-gray-900">{finalPrice}</span>
                                                    <span className="text-xs text-gray-400">{suffix}</span>
                                                </div>
                                                {billingCycle === 'annually' && planSavings > 0 && (
                                                    <p className="mt-0.5 text-[11px] font-semibold text-emerald-600">
                                                        {t('pricing_page.save_percent')} {convertNumberByLanguage(planSavings.toString())}%
                                                    </p>
                                                )}
                                                <p className="mt-1 text-[11px] text-gray-400">
                                                    {t('pricing_page.setup_fee')}:{' '}
                                                    <span className="font-semibold text-gray-600">
                                                        {hasSetupFee ? formatPrice(plan.setup_fee) : (t('pricing_page.setup_fee_free') || 'Free')}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Card body (same for all) ── */}
                                <div className={cn('flex flex-1 flex-col p-5', isMostPopular && 'bg-white')}>
                                    {/* CTA */}
                                    <button
                                        onClick={() => (window.location.href = '/register')}
                                        className={cn(
                                            'mb-2 w-full rounded-xl px-3 py-2.5 text-center text-sm font-bold shadow-sm transition-all duration-200 hover:scale-[1.02]',
                                            isMostPopular
                                                ? 'bg-gradient-to-r from-[#046ca9] to-[#034d79] text-white shadow-[#046ca9]/25 hover:shadow-[#046ca9]/40'
                                                : colors.button
                                        )}
                                    >
                                        {t('pricing_page.get_started') || 'Get Started'}
                                    </button>
                                    {/* Guarantee micro-text */}
                                    <p className="mb-5 flex items-center justify-center gap-1 text-center text-[10px] text-gray-400">
                                        <ShieldCheck className="h-3 w-3 flex-shrink-0 text-emerald-500" />
                                        {t('pricing_page.guarantee_short') || '14-day money-back guarantee'}
                                    </p>

                                    {/* Feature list */}
                                    {plan.items.length > 0 && (
                                        <div className="flex-1 border-t border-gray-50 pt-4">
                                            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                {t('pricing_page.features_included') || 'Includes'}
                                            </p>
                                            <ul className="space-y-2.5">
                                                {plan.items.map((item) => (
                                                    <li key={item.id} className="flex items-start gap-2">
                                                        <Check className={cn(
                                                            'mt-0.5 h-3.5 w-3.5 flex-shrink-0',
                                                            isMostPopular ? 'text-[#046ca9]' : 'text-emerald-500'
                                                        )} />
                                                        <span className="text-xs leading-snug text-gray-600">
                                                            {lang === 'bn' ? item.title_bn : item.title_en}
                                                        </span>
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

            {/* ── Comparison table ── */}
            {showComparison && !isLoading && !isError && plans.length > 0 && (
                <div className="mt-20">

                    {/* Section header */}
                    <div className="mb-10 text-center">
                        <span className="mb-3 inline-block rounded-full border border-[#046ca9]/20 bg-[#046ca9]/5 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-[#046ca9]">
                            {t('pricing_page.comparison.title') || 'Compare Plans'}
                        </span>
                        <h2 className="mt-3 text-2xl font-black text-gray-900 sm:text-3xl">
                            {t('pricing_page.table_heading') || 'Which Plan Is Right for Your Shop?'}
                        </h2>
                        <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-500">
                            {t('pricing_page.table_subheading') || 'Every plan includes all 15 modules. The difference is scale — stores, products, and support level.'}
                        </p>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                        <table className="w-full min-w-[640px] border-collapse">

                            {/* ── Column headers ── */}
                            <thead>
                                <tr className="border-b-2 border-gray-100">
                                    <th className="sticky left-0 z-20 min-w-[180px] bg-[#f8fafc] px-6 py-5 text-left">
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                            {t('pricing_page.comparison.features') || 'Features'}
                                        </span>
                                    </th>
                                    {plans.map((plan, index) => {
                                        const isMostPopular = index === 1;
                                        const rawPrice = billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price;
                                        const { finalPrice } = applyDiscount(rawPrice, plan.discount);
                                        const suffix = billingCycle === 'monthly'
                                            ? t('pricing_page.frequency.per_month')
                                            : t('pricing_page.frequency.per_year');
                                        const recText = t(`pricing_page.recommended_for.${index}`);
                                        const recIsKey = recText.startsWith('pricing_page.');
                                        return (
                                            <th
                                                key={plan.id}
                                                className={cn(
                                                    'relative px-4 py-5 text-center align-top',
                                                    isMostPopular ? 'bg-[#046ca9]' : 'bg-[#f8fafc]'
                                                )}
                                            >
                                                {isMostPopular && (
                                                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#5bb8e8] to-[#046ca9]" />
                                                )}
                                                <div className="flex flex-col items-center gap-1.5">
                                                    {isMostPopular && (
                                                        <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                                                            <Star className="h-2.5 w-2.5 fill-white" />
                                                            {t('pricing_page.most_popular')}
                                                        </span>
                                                    )}
                                                    <p className={cn('text-sm font-black', isMostPopular ? 'text-white' : 'text-gray-800')}>
                                                        {lang === 'bn' ? plan.name_bn : plan.name_en}
                                                    </p>
                                                    {!recIsKey && (
                                                        <p className={cn('text-[10px]', isMostPopular ? 'text-white/60' : 'text-gray-400')}>
                                                            {t('pricing_page.recommended_label') || 'Best for:'} {recText}
                                                        </p>
                                                    )}
                                                    <div className="mt-1 flex items-baseline gap-0.5">
                                                        <span className={cn('text-xl font-black', isMostPopular ? 'text-white' : 'text-gray-900')}>
                                                            {finalPrice}
                                                        </span>
                                                        <span className={cn('text-[11px]', isMostPopular ? 'text-white/60' : 'text-gray-400')}>
                                                            {suffix}
                                                        </span>
                                                    </div>
                                                    <a
                                                        href="/register"
                                                        className={cn(
                                                            'mt-1.5 rounded-lg px-4 py-1.5 text-[11px] font-bold transition-all hover:scale-105',
                                                            isMostPopular
                                                                ? 'bg-white text-[#046ca9] hover:bg-white/90'
                                                                : 'bg-[#046ca9] text-white hover:bg-[#035887]'
                                                        )}
                                                    >
                                                        {t('pricing_page.get_started')}
                                                    </a>
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>

                            {/* ── Body rows ── */}
                            <tbody className="divide-y divide-gray-100">

                                {/* Setup fee row */}
                                <tr>
                                    <td className="sticky left-0 z-10 bg-slate-50 px-6 py-3.5 text-sm font-semibold text-gray-700">
                                        {t('pricing_page.setup_fee')}
                                    </td>
                                    {plans.map((plan, index) => {
                                        const isMostPopular = index === 1;
                                        const hasSetupFee = parseFloat(plan.setup_fee) > 0;
                                        return (
                                            <td
                                                key={plan.id}
                                                className={cn('px-4 py-3.5 text-center text-sm', isMostPopular ? 'bg-[#eef6fd]' : 'bg-slate-50')}
                                            >
                                                {hasSetupFee
                                                    ? <span className="text-gray-700">{formatPrice(plan.setup_fee)}</span>
                                                    : <span className="font-semibold text-emerald-600">{t('pricing_page.setup_fee_free')}</span>
                                                }
                                            </td>
                                        );
                                    })}
                                </tr>

                                {/* Feature rows */}
                                {plans[0]?.items.map((_, itemIndex) => {
                                    const featureLabel = lang === 'bn'
                                        ? plans[0].items[itemIndex]?.title_bn
                                        : plans[0].items[itemIndex]?.title_en;
                                    const isEven = itemIndex % 2 === 0;
                                    return (
                                        <tr key={itemIndex}>
                                            <td
                                                className="sticky left-0 z-10 px-6 py-3.5 text-sm text-gray-600"
                                                style={{ backgroundColor: isEven ? 'white' : 'rgb(248 250 252)' }}
                                            >
                                                {featureLabel}
                                            </td>
                                            {plans.map((plan, planIndex) => {
                                                const isMostPopular = planIndex === 1;
                                                const item = plan.items[itemIndex];
                                                const cellBg = isMostPopular ? '#eef6fd' : isEven ? 'white' : 'rgb(248 250 252)';
                                                return (
                                                    <td
                                                        key={plan.id}
                                                        className="px-4 py-3.5 text-center"
                                                        style={{ backgroundColor: cellBg }}
                                                    >
                                                        {item ? (
                                                            item.value ? (
                                                                <span className={cn('text-sm font-semibold', isMostPopular ? 'text-[#046ca9]' : 'text-gray-900')}>
                                                                    {item.value === 'unlimited'
                                                                        ? (t('pricing_page.comparison.unlimited') || '∞')
                                                                        : convertNumberByLanguage(item.value)}
                                                                </span>
                                                            ) : (
                                                                <Check className={cn('mx-auto h-4 w-4', isMostPopular ? 'text-[#046ca9]' : 'text-emerald-500')} />
                                                            )
                                                        ) : (
                                                            <Minus className="mx-auto h-4 w-4 text-gray-200" />
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>

                            {/* ── Footer CTA row ── */}
                            <tfoot>
                                <tr className="border-t-2 border-gray-100">
                                    <td className="sticky left-0 z-10 bg-white px-6 py-5" />
                                    {plans.map((plan, index) => {
                                        const isMostPopular = index === 1;
                                        return (
                                            <td
                                                key={plan.id}
                                                className={cn('px-4 py-5 text-center', isMostPopular ? 'bg-[#eef6fd]' : 'bg-white')}
                                            >
                                                <a
                                                    href="/register"
                                                    className={cn(
                                                        'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-xs font-bold shadow-sm transition-all hover:scale-105',
                                                        isMostPopular
                                                            ? 'bg-[#046ca9] text-white shadow-[#046ca9]/20 hover:bg-[#035887]'
                                                            : 'border border-gray-200 text-gray-600 hover:border-[#046ca9]/30 hover:text-[#046ca9]'
                                                    )}
                                                >
                                                    {t('pricing_page.get_started')}
                                                </a>
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tfoot>

                        </table>
                    </div>

                    {/* ── Trust bar after table ── */}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-gray-100 bg-gray-50 py-4 px-6">
                        {[
                            { icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />, label: t('pricing_page.trust_no_setup') || 'No setup fee' },
                            { icon: <Check className="h-4 w-4 text-[#046ca9]" />, label: t('pricing_page.trust_cancel') || 'Cancel anytime' },
                            { icon: <Star className="h-4 w-4 fill-amber-400 text-amber-400" />, label: t('pricing_page.trust_refund') || '14-day refund' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                {item.icon}
                                {item.label}
                            </div>
                        ))}
                    </div>

                </div>
            )}
        </>
    );
}
