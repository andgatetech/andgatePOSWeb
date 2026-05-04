'use client';

import SubscriptionError from '@/components/common/SubscriptionError';
import { convertNumberByLanguage } from '@/components/custom/convertNumberByLanguage';

import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { RootState } from '@/store';
import { useCreateLeadMutation } from '@/store/features/auth/authApi';
import { applyDiscount, calcYearlySavings, filterActivePlans, formatPrice, getPlanColor, useGetPlansQuery, type Plan } from '@/store/features/plans/plansApi';
import { Building, Check, CheckCircle2, ChevronLeft, ChevronRight, Crown, Loader2, Mail, MapPin, Phone, Rocket, Send, Shield, Star, TrendingUp, User, Zap } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// ── Colour palette (mirroring PriceSection) ──────────────────────────────────
const colorClasses = {
    green: {
        ring: 'ring-2 ring-[#046ca9]',
        button: 'bg-gradient-to-r from-[#046ca9] to-[#034d79] text-white hover:opacity-90',
        badge: 'bg-[#046ca9]/10 text-[#034d79]',
        icon: 'text-[#046ca9]',
        selected: 'border-[#046ca9] bg-[#046ca9]/5',
    },
    blue: { ring: 'ring-2 ring-[#046ca9]', button: 'bg-gradient-to-r from-[#046ca9] to-[#034d79] text-white hover:opacity-90', badge: 'bg-[#046ca9]/10 text-[#034d79]', icon: 'text-[#046ca9]', selected: 'border-[#046ca9] bg-[#046ca9]/5' },
    purple: {
        ring: 'ring-2 ring-[#046ca9]',
        button: 'bg-gradient-to-r from-[#046ca9] to-[#034d79] text-white hover:opacity-90',
        badge: 'bg-[#046ca9]/10 text-[#034d79]',
        icon: 'text-[#046ca9]',
        selected: 'border-[#046ca9] bg-[#046ca9]/5',
    },
    orange: {
        ring: 'ring-2 ring-[#e79237]',
        button: 'bg-gradient-to-r from-[#e79237] to-[#c47920] text-white hover:opacity-90',
        badge: 'bg-[#e79237]/10 text-[#9b5a18]',
        icon: 'text-[#e79237]',
        selected: 'border-[#e79237] bg-[#e79237]/5',
    },
    slate: {
        ring: 'ring-2 ring-[#034d79]',
        button: 'bg-gradient-to-r from-[#046ca9] to-[#034d79] text-white hover:opacity-90',
        badge: 'bg-[#034d79]/10 text-[#034d79]',
        icon: 'text-[#034d79]',
        selected: 'border-[#034d79] bg-[#034d79]/5',
    },
};
const PLAN_ICONS = [Rocket, Star, TrendingUp, Zap, Shield];

function classNames(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

// ── Plan card ─────────────────────────────────────────────────────────────────
function PlanCard({
    plan,
    index,
    isSelected,
    isCurrentPlan,
    billingCycle,
    onSelect,
}: {
    plan: Plan;
    index: number;
    isSelected: boolean;
    isCurrentPlan: boolean;
    billingCycle: 'monthly' | 'annually';
    onSelect: (plan: Plan) => void;
}) {
    const { t, i18n } = getTranslation();
    const lang = i18n.language as 'en' | 'bn';
    const colorKey = getPlanColor(index);
    const colors = colorClasses[colorKey];
    const IconComponent = PLAN_ICONS[index % PLAN_ICONS.length];
    const isMostPopular = index === 1;
    const isAnnually = billingCycle === 'annually';

    const activePrice = isAnnually ? plan.yearly_price : plan.monthly_price;
    const { finalPrice, originalPrice, hasDiscount, discountPct } = applyDiscount(activePrice, plan.discount);
    const yearlySavings = calcYearlySavings(plan.monthly_price, plan.yearly_price);
    const displayNumber = (value: string | number) => convertNumberByLanguage(value, lang);
    const displayPlanName = lang === 'bn' ? plan.name_bn : plan.name_en;

    return (
        <div
            onClick={() => !isCurrentPlan && onSelect(plan)}
            className={classNames(
                'relative flex cursor-pointer flex-col rounded-2xl border-2 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
                isCurrentPlan ? 'cursor-not-allowed border-[#046ca9]/30 bg-[#046ca9]/5 opacity-80' : isSelected ? `${colors.selected} ${colors.ring} shadow-md` : 'border-gray-200 hover:border-gray-300'
            )}
        >
            {/* Badges */}
            {isCurrentPlan && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 rounded-full bg-[#034d79] px-3 py-1 text-xs font-semibold text-white shadow">
                        <Check className="h-3 w-3" /> {t('lbl_current_plan')}
                    </div>
                </div>
            )}
            {isMostPopular && !isCurrentPlan && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="rounded-full bg-[#034d79] px-3 py-1 text-xs font-semibold text-white shadow">{t('lbl_most_popular')}</div>
                </div>
            )}
            {isSelected && !isCurrentPlan && (
                <div className="absolute -top-3.5 right-4">
                    <div className="flex items-center gap-1 rounded-full bg-[#046ca9] px-3 py-1 text-xs font-semibold text-white shadow">
                        <CheckCircle2 className="h-3 w-3" /> {t('lbl_selected')}
                    </div>
                </div>
            )}

            <div className="flex flex-1 flex-col p-5">
                {/* Name + icon */}
                <div className="mb-3 flex items-center gap-2.5">
                    <div className={classNames('rounded-lg bg-gray-50 p-1.5', colors.icon)}>
                        <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900">{displayPlanName}</h3>
                        {hasDiscount && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">{displayNumber(discountPct)}% {lang === 'bn' ? 'ছাড়' : 'OFF'}</span>}
                    </div>
                </div>

                {/* Price */}
                <div className="mb-1 flex items-baseline gap-1.5">
                    {hasDiscount && <span className="text-sm text-gray-400 line-through">{displayNumber(originalPrice)}</span>}
                    <span className="text-2xl font-black text-gray-900">{displayNumber(finalPrice)}</span>
                    <span className="text-xs text-gray-500">/{isAnnually ? t('lbl_yr') : t('lbl_mo')}</span>
                </div>
                {isAnnually && yearlySavings > 0 && (
                    <div className="mb-3">
                        <span className="rounded-full bg-[#046ca9]/10 px-2 py-0.5 text-[10px] font-bold text-[#034d79]">
                            {t('lbl_save')} {displayNumber(yearlySavings)}% {t('lbl_vs_monthly')}
                        </span>
                    </div>
                )}
                {!isAnnually && <div className="mb-3" />}

                {/* Top features (max 4) */}
                {plan.items.length > 0 && (
                    <ul className="mb-4 space-y-1.5">
                        {plan.items.slice(0, 4).map((item) => (
                            <li key={item.id} className="flex items-start gap-2">
                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#046ca9]" />
                                <span className="text-xs text-gray-600">{lang === 'bn' ? item.title_bn : item.title_en}</span>
                            </li>
                        ))}
                        {plan.items.length > 4 && <li className="text-xs text-gray-400">+{displayNumber(plan.items.length - 4)} {t('lbl_more_features')}</li>}
                    </ul>
                )}

                {/* Select button */}
                <button
                    type="button"
                    disabled={isCurrentPlan}
                    onClick={(e) => {
                        e.stopPropagation();
                        !isCurrentPlan && onSelect(plan);
                    }}
                    className={classNames(
                        'mt-auto w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-200',
                        isCurrentPlan ? 'cursor-not-allowed bg-[#046ca9]/10 text-[#034d79]' : isSelected ? `${colors.button} shadow-sm` : `${colors.badge} hover:opacity-90`
                    )}
                >
                    {isCurrentPlan ? `✓ ${t('lbl_current_plan')}` : isSelected ? `✓ ${t('lbl_selected')}` : `${t('btn_choose')} ${displayPlanName}`}
                </button>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
    const { t, i18n } = getTranslation();
    const lang = i18n.language as 'en' | 'bn';
    const displayNumber = (value: string | number) => convertNumberByLanguage(value, lang);
    const displayPrice = (value: string | number) => displayNumber(formatPrice(value));
    const displayPlanName = (plan: Plan) => lang === 'bn' ? plan.name_bn : plan.name_en;
    const searchParams = useSearchParams();
    const router = useRouter();

    const parseErrorDetails = () => {
        try {
            const str = searchParams.get('details');
            if (!str) return undefined;
            return JSON.parse(str);
        } catch {
            return undefined;
        }
    };

    const urlErrorType = searchParams.get('error_type');
    const urlMessage = searchParams.get('message');
    const urlDetails = parseErrorDetails();

    const user = useSelector((state: RootState) => state.auth.user);
    const { currentStore, currentStoreId } = useCurrentStore();
    const currentPlanName = user?.subscription_user?.plan_name_en;

    const { data: plansData, isLoading: plansLoading } = useGetPlansQuery();
    const plans = filterActivePlans(plansData?.data ?? []);
    const isCurrentPlan = (plan: Plan) => currentPlanName?.toLowerCase() === plan.name_en.toLowerCase();
    const currentPlan = plans.find(isCurrentPlan);
    const availablePlans = plans.filter((plan) => !isCurrentPlan(plan));
    const visiblePlanCount = 4;
    const maxPlanSlide = Math.max(availablePlans.length - visiblePlanCount, 0);

    const [createLead] = useCreateLeadMutation();
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
    const [planSlideIndex, setPlanSlideIndex] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        store_id: '',
        store_name: '',
        package: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Pre-fill user data
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({ ...prev, name: user.name || '', email: user.email || '', phone: user.phone || '' }));
        }
        if (currentStore && currentStoreId) {
            setFormData((prev) => ({ ...prev, store_id: currentStoreId.toString(), store_name: currentStore.store_name || '' }));
        }
    }, [user, currentStore, currentStoreId]);

    // Pre-select plan from URL ?plan_id=X
    useEffect(() => {
        if (plans.length === 0) return;
        const planId = searchParams.get('plan_id');
        if (planId) {
            const found = plans.find((p) => p.id === parseInt(planId));
            if (found) handleSelectPlan(found);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [plans, searchParams]);

    useEffect(() => {
        setPlanSlideIndex((current) => Math.min(current, maxPlanSlide));
    }, [maxPlanSlide]);

    const handleSelectPlan = (plan: Plan) => {
        setSelectedPlan(plan);
        setFormData((prev) => ({ ...prev, package: displayPlanName(plan) }));
        // Scroll to form smoothly
        setTimeout(() => document.getElementById('upgrade-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createLead({
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                store_id: formData.store_id || null, // in case it's empty
                company_name: formData.store_name || null,
                source: 'Subscription Upgrade Request',
                notes: `Requested Plan Update: ${formData.package} (${billingCycle})`,
            }).unwrap();
            setIsSubmitted(true);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactItems = [
        { icon: MapPin, label: t('lbl_visit_us'), value: displayNumber('House 34, Road 3, Block B, Aftabnagar, Dhaka') },
        { icon: Phone, label: t('lbl_call_us'), value: displayNumber('+880 1577303608') },
        { icon: Mail, label: t('lbl_email_us'), value: 'support@andgatetech.net' },
    ];

    const nextSteps = [
        { n: 1, title: t('subscription_step1_title'), desc: t('subscription_step1_desc') },
        { n: 2, title: t('subscription_step2_title'), desc: t('subscription_step2_desc') },
        { n: 3, title: t('subscription_step3_title'), desc: t('subscription_step3_desc') },
    ];
    const visibleAvailablePlans = availablePlans.slice(planSlideIndex, planSlideIndex + visiblePlanCount);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* ── Optional Auto-Redirected Error Banner ── */}
                {urlErrorType && <SubscriptionError errorType={urlErrorType as any} message={urlMessage || 'Your subscription plan requires an update to access this feature.'} details={urlDetails} />}

                {/* ── Page Header ── */}
                <div className="mb-8 text-center">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#046ca9]/10 px-4 py-1.5 text-sm font-semibold text-[#034d79]">
                        <Crown className="h-4 w-4" />
                        {t('lbl_upgrade_subscription')}
                    </div>
                    <h1 className="mb-2 text-3xl font-black text-gray-900 md:text-4xl">{t('subscription_page_title')}</h1>
                    <p className="text-gray-500">{t('subscription_page_subtitle')}</p>
                </div>

                {/* ── Plan Cards ── */}
                <div className="mb-10">
                    {plansLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-[#046ca9]" />
                            <span className="ml-3 text-gray-500">{t('msg_loading_plans')}</span>
                        </div>
                    ) : (
                        <>
                            {/* Billing toggle */}
                            <div className="mb-6 flex justify-center">
                                <div className="flex rounded-xl bg-gray-100 p-1">
                                    {(['monthly', 'annually'] as const).map((cycle) => (
                                        <button
                                            key={cycle}
                                            onClick={() => setBillingCycle(cycle)}
                                            className={classNames(
                                                'rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200',
                                                billingCycle === cycle ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                            )}
                                        >
                                            {cycle === 'monthly' ? t('lbl_monthly') : t('lbl_annually')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {currentPlan && (
                                <div className="mb-5 rounded-2xl border border-[#046ca9]/20 bg-[#046ca9]/5 p-4 shadow-sm sm:p-5">
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#034d79] px-3 py-1 text-xs font-semibold text-white">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                {t('lbl_current_plan')}
                                            </span>
                                            <h2 className="mt-2 text-lg font-black text-gray-900">{displayPlanName(currentPlan)}</h2>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-[#034d79]">
                                                {displayPrice(billingCycle === 'monthly' ? currentPlan.monthly_price : currentPlan.yearly_price)}
                                            </p>
                                            <p className="text-xs font-semibold text-[#034d79]">/{billingCycle === 'monthly' ? t('lbl_mo') : t('lbl_yr')}</p>
                                        </div>
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                        {currentPlan.items.slice(0, 4).map((item) => (
                                            <div key={item.id} className="flex items-start gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-gray-700">
                                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#046ca9]" />
                                                <span>{lang === 'bn' ? item.title_bn : item.title_en}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {availablePlans.length > 0 && (
                                <div className="mb-1 flex items-center justify-between gap-3">
                                    <h2 className="text-lg font-black text-gray-900">{t('lbl_upgrade_subscription')}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-500">
                                            {displayNumber(Math.min(planSlideIndex + 1, availablePlans.length))}-{displayNumber(Math.min(planSlideIndex + visiblePlanCount, availablePlans.length))} / {displayNumber(availablePlans.length)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setPlanSlideIndex((current) => Math.max(current - 1, 0))}
                                            disabled={planSlideIndex === 0}
                                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:border-[#046ca9]/40 hover:text-[#046ca9] disabled:cursor-not-allowed disabled:opacity-40"
                                            aria-label="Previous plans"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPlanSlideIndex((current) => Math.min(current + 1, maxPlanSlide))}
                                            disabled={planSlideIndex >= maxPlanSlide}
                                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:border-[#046ca9]/40 hover:text-[#046ca9] disabled:cursor-not-allowed disabled:opacity-40"
                                            aria-label="Next plans"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {availablePlans.length > 0 && (
                                <div className="grid gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-4">
                                    {visibleAvailablePlans.map((plan, index) => (
                                        <PlanCard
                                            key={plan.id}
                                            plan={plan}
                                            index={planSlideIndex + index}
                                            isSelected={selectedPlan?.id === plan.id}
                                            isCurrentPlan={false}
                                            billingCycle={billingCycle}
                                            onSelect={handleSelectPlan}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Step arrow */}
                            {selectedPlan && (
                                <div className="mt-6 flex flex-col items-center gap-1 text-sm text-gray-400">
                                    <div className="h-6 w-px bg-gray-300" />
                                    <span className="rounded-full bg-[#046ca9]/10 px-3 py-1 text-xs font-semibold text-[#034d79]">{t('subscription_step2_label')}</span>
                                    <div className="h-6 w-px bg-gray-300" />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Form + Info ── */}
                <div id="upgrade-form" className="grid gap-8 lg:grid-cols-5">
                    {/* Contact Form */}
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#046ca9]/10">
                                    <Send className="h-4 w-4 text-[#046ca9]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{t('subscription_form_title')}</h2>
                                    <p className="text-xs text-gray-500">
                                        {selectedPlan ? (
                                            <span>
                                                {t('subscription_form_selected')} <strong className="text-[#034d79]">{displayPlanName(selectedPlan)}</strong> —{' '}
                                                {displayPrice(billingCycle === 'monthly' ? selectedPlan.monthly_price : selectedPlan.yearly_price)}/{billingCycle === 'monthly' ? t('lbl_mo') : t('lbl_yr')}
                                            </span>
                                        ) : (
                                            t('subscription_select_plan_first')
                                        )}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            {t('lbl_full_name')} *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-[#046ca9] focus:bg-white focus:outline-none"
                                                placeholder={t('placeholder_your_name')}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            {t('lbl_email')} *
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-[#046ca9] focus:bg-white focus:outline-none"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            {t('lbl_phone')} *
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-[#046ca9] focus:bg-white focus:outline-none"
                                                placeholder={displayNumber('+880 1234 567890')}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="store_name" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            {t('lbl_store')}
                                        </label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                id="store_name"
                                                name="store_name"
                                                value={formData.store_name}
                                                readOnly
                                                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 py-2.5 pl-10 pr-4 text-sm text-gray-600"
                                                placeholder={t('placeholder_auto_filled')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Selected package (read + editable fallback) */}
                                <div>
                                    <label htmlFor="package" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                        {t('lbl_selected_package')} *
                                    </label>
                                    <div className="relative">
                                        <Crown className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            id="package"
                                            name="package"
                                            value={formData.package}
                                            onChange={handleChange}
                                            required
                                            readOnly={!!selectedPlan}
                                            className={classNames(
                                                'w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none',
                                                selectedPlan
                                                    ? 'cursor-not-allowed border-[#046ca9]/20 bg-[#046ca9]/5 font-semibold text-[#034d79]'
                                                    : 'border-gray-200 bg-gray-50 focus:border-[#046ca9] focus:bg-white'
                                            )}
                                            placeholder={t('placeholder_select_plan_above')}
                                        />
                                    </div>
                                    {selectedPlan && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedPlan(null);
                                                setFormData((p) => ({ ...p, package: '' }));
                                            }}
                                            className="mt-1 text-xs text-gray-400 underline hover:text-gray-600"
                                        >
                                            {t('btn_clear_selection')}
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.package}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] py-3 font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> {t('btn_sending')}
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" /> {t('subscription_form_title')}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="space-y-5 lg:col-span-2">
                        {/* Contact info */}
                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <h3 className="mb-4 text-base font-bold text-gray-900">{t('subscription_get_in_touch')}</h3>
                            <div className="space-y-3">
                                {contactItems.map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#046ca9]/10">
                                            <Icon className="h-4 w-4 text-[#046ca9]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-700">{label}</p>
                                            <p className="text-xs text-gray-500">{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* What happens next */}
                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <h3 className="mb-4 text-base font-bold text-gray-900">{t('subscription_what_happens_next')}</h3>
                            <div className="space-y-3">
                                {nextSteps.map(({ n, title, desc }) => (
                                    <div key={n} className="flex items-start gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#046ca9]/10 text-xs font-bold text-[#034d79]">{displayNumber(n)}</div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{title}</p>
                                            <p className="text-xs text-gray-500">{desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Success Modal ── */}
            {isSubmitted && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
                        <button onClick={() => setIsSubmitted(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                            ✕
                        </button>
                        <div className="mb-5 flex justify-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#046ca9]/10">
                                <CheckCircle2 className="h-10 w-10 text-[#046ca9]" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="mb-2 text-2xl font-bold text-gray-900">{t('subscription_request_submitted')}</h3>
                            <p className="mb-6 text-gray-500">{t('subscription_thank_you')}</p>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="w-full rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-6 py-3 font-semibold text-white hover:opacity-90"
                            >
                                {t('btn_back_to_dashboard')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
