'use client';
import { trackEvent } from '@/lib/analytics';
import { applyDiscount, calcYearlySavings, filterActivePlans, formatPrice, getPlanColor, useGetPlansQuery } from '@/store/features/plans/plansApi';
import { Check, Loader2, Rocket, Shield, Star, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';
import PromoButton from './promo-button';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

const colorClasses: Record<string, { ring: string; button: string; icon: string }> = {
    slate: {
        ring: 'ring-slate-200',
        button: 'bg-slate-50 text-slate-700 hover:bg-slate-100 ring-1 ring-inset ring-slate-300',
        icon: 'text-slate-400',
    },
    green: {
        ring: 'ring-green-600',
        button: 'bg-green-600 text-white hover:bg-green-700',
        icon: 'text-green-500',
    },
    blue: {
        ring: 'ring-blue-600',
        button: 'bg-blue-600 text-white hover:bg-blue-700',
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
};

const PLAN_ICONS = [Rocket, Star, TrendingUp, Zap, Shield];

export default function PromoPricing() {
    const lang = 'bn'; // Always show Bengali (bn) in promo page
    const { data, isLoading, isError } = useGetPlansQuery();
    const plans = filterActivePlans(data?.data ?? []);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

    const frequencies = [
        { value: 'monthly' as const, label: 'মাসিক', priceSuffix: '/মাস' },
        { value: 'annually' as const, label: 'বার্ষিক', priceSuffix: '/বছর' },
    ];

    const topSavings = plans.length > 0 ? calcYearlySavings(plans[0].monthly_price, plans[0].yearly_price) : 0;

    return (
        <section className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">সহজ, স্বচ্ছ প্রাইসিং প্ল্যান</h2>
                    <p className="text-base text-gray-600 sm:text-lg">
                        আপনার ব্যবসার জন্য সঠিক প্ল্যান বেছে নিন। ফ্রিতে শুরু করুন এবং ব্যাবসা বড় হওয়ার সাথে আপগ্রেড করুন। সব প্ল্যানেই ১৪ দিনের মানি-ব্যাক গ্যারান্টি থাকছে!
                    </p>
                </div>

                {/* Frequency Toggle */}
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
                                        সাশ্রয় {topSavings}%
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                        <span className="ml-3 text-lg text-gray-600">প্ল্যান লোড হচ্ছে...</span>
                    </div>
                )}

                {isError && !isLoading && <div className="py-10 text-center text-red-600">প্রাইসিং প্ল্যান লোড করা যাচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।</div>}

                {!isLoading && !isError && (
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
                            const suffix = billingCycle === 'monthly' ? '/মাস' : '/বছর';
                            const planSavings = calcYearlySavings(plan.monthly_price, plan.yearly_price);
                            const hasSetupFee = parseFloat(plan.setup_fee) > 0;
                            const { originalPrice, finalPrice, hasDiscount, discountPct } = applyDiscount(rawPrice, plan.discount);

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
                                            <div className="rounded-full bg-blue-600 px-4 py-1 text-sm font-medium text-white shadow-lg">জনপ্রিয়</div>
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
                                            {/* Discount badge */}
                                            {hasDiscount && <span className="mb-2 inline-block rounded-full bg-red-100 px-3 py-0.5 text-xs font-semibold text-red-600">{discountPct}% ছাড়</span>}
                                            {/* Price row: original crossed-out + final */}
                                            <div className="flex flex-wrap items-baseline gap-2">
                                                {hasDiscount && <span className="text-lg text-gray-400 line-through">{originalPrice}</span>}
                                                <span className="text-3xl font-bold text-gray-900 sm:text-4xl">{finalPrice}</span>
                                                <span className="text-sm font-medium text-gray-500">{suffix}</span>
                                            </div>
                                            {billingCycle === 'annually' && planSavings > 0 && <p className="mt-1 text-sm font-medium text-green-600">সাশ্রয় {planSavings}%</p>}
                                            <p className="mt-2 text-sm font-medium text-gray-700">
                                                সেটআপ ফি: <span className="font-semibold text-gray-900">{hasSetupFee ? formatPrice(plan.setup_fee) : 'ফ্রি'}</span>
                                            </p>
                                        </div>

                                        <PromoButton
                                            className={classNames('mb-6 w-full text-center', isMostPopular ? '' : 'bg-transparent text-primary ring-1 ring-inset ring-primary hover:bg-primary/5')}
                                            onClick={() => {
                                                // Track button click BEFORE scrolling
                                                trackEvent(
                                                    'pricing_plan_click',
                                                    'InitiateCheckout',
                                                    {
                                                        plan_name: lang === 'bn' ? plan.name_bn : plan.name_en,
                                                        billing_cycle: billingCycle,
                                                        price: finalPrice,
                                                        is_popular: isMostPopular,
                                                    }
                                                );
                                                const el = document.getElementById('register-section');
                                                if (el) {
                                                    el.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }}
                                        >
                                            শুরু করুন
                                        </PromoButton>

                                        {plan.items.length > 0 && (
                                            <div className="flex-1">
                                                <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-500">যা যা থাকছে</p>
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
    );
}
