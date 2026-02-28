'use client';

import SubscriptionError from '@/components/common/SubscriptionError';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { RootState } from '@/store';
import { useCreateLeadMutation } from '@/store/features/auth/authApi';
import { applyDiscount, filterActivePlans, formatPrice, getPlanColor, useGetPlansQuery, type Plan } from '@/store/features/plans/plansApi';
import { Building, Check, CheckCircle2, Crown, Loader2, Mail, MapPin, Phone, Rocket, Send, Shield, Star, TrendingUp, User, Zap } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// ── Colour palette (mirroring PriceSection) ──────────────────────────────────
const colorClasses = {
    green: {
        ring: 'ring-2 ring-green-500',
        button: 'bg-green-600 hover:bg-green-700 text-white',
        badge: 'bg-green-100 text-green-700',
        icon: 'text-green-500',
        selected: 'border-green-500 bg-green-50',
    },
    blue: { ring: 'ring-2 ring-blue-500', button: 'bg-blue-600 hover:bg-blue-700 text-white', badge: 'bg-blue-100 text-blue-700', icon: 'text-blue-500', selected: 'border-blue-500 bg-blue-50' },
    purple: {
        ring: 'ring-2 ring-purple-500',
        button: 'bg-purple-600 hover:bg-purple-700 text-white',
        badge: 'bg-purple-100 text-purple-700',
        icon: 'text-purple-500',
        selected: 'border-purple-500 bg-purple-50',
    },
    orange: {
        ring: 'ring-2 ring-orange-500',
        button: 'bg-orange-600 hover:bg-orange-700 text-white',
        badge: 'bg-orange-100 text-orange-700',
        icon: 'text-orange-500',
        selected: 'border-orange-500 bg-orange-50',
    },
    slate: {
        ring: 'ring-2 ring-slate-400',
        button: 'bg-slate-700 hover:bg-slate-800 text-white',
        badge: 'bg-slate-100 text-slate-700',
        icon: 'text-slate-500',
        selected: 'border-slate-400 bg-slate-50',
    },
};
const PLAN_ICONS = [Rocket, Star, TrendingUp, Zap, Shield];

function classNames(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

// ── Plan card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, index, isSelected, isCurrentPlan, onSelect }: { plan: Plan; index: number; isSelected: boolean; isCurrentPlan: boolean; onSelect: (plan: Plan) => void }) {
    const colorKey = getPlanColor(index);
    const colors = colorClasses[colorKey];
    const IconComponent = PLAN_ICONS[index % PLAN_ICONS.length];
    const isMostPopular = index === 1;
    const { finalPrice, originalPrice, hasDiscount, discountPct } = applyDiscount(plan.monthly_price, plan.discount);

    return (
        <div
            onClick={() => !isCurrentPlan && onSelect(plan)}
            className={classNames(
                'relative flex cursor-pointer flex-col rounded-2xl border-2 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
                isCurrentPlan ? 'cursor-not-allowed border-green-400 bg-green-50 opacity-80' : isSelected ? `${colors.selected} ${colors.ring} shadow-md` : 'border-gray-200 hover:border-gray-300'
            )}
        >
            {/* Badges */}
            {isCurrentPlan && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white shadow">
                        <Check className="h-3 w-3" /> Current Plan
                    </div>
                </div>
            )}
            {isMostPopular && !isCurrentPlan && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">Most Popular</div>
                </div>
            )}
            {isSelected && !isCurrentPlan && (
                <div className="absolute -top-3.5 right-4">
                    <div className="flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow">
                        <CheckCircle2 className="h-3 w-3" /> Selected
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
                        <h3 className="text-base font-bold text-gray-900">{plan.name_en}</h3>
                        {hasDiscount && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">{discountPct}% OFF</span>}
                    </div>
                </div>

                {/* Price */}
                <div className="mb-4 flex items-baseline gap-1.5">
                    {hasDiscount && <span className="text-sm text-gray-400 line-through">{originalPrice}</span>}
                    <span className="text-2xl font-black text-gray-900">{finalPrice}</span>
                    <span className="text-xs text-gray-500">/mo</span>
                </div>

                {/* Top features (max 4) */}
                {plan.items.length > 0 && (
                    <ul className="mb-4 space-y-1.5">
                        {plan.items.slice(0, 4).map((item) => (
                            <li key={item.id} className="flex items-start gap-2">
                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                                <span className="text-xs text-gray-600">{item.title_en}</span>
                            </li>
                        ))}
                        {plan.items.length > 4 && <li className="text-xs text-gray-400">+{plan.items.length - 4} more features</li>}
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
                        isCurrentPlan ? 'cursor-not-allowed bg-green-100 text-green-700' : isSelected ? `${colors.button} shadow-sm` : `${colors.badge} hover:opacity-90`
                    )}
                >
                    {isCurrentPlan ? '✓ Current Plan' : isSelected ? '✓ Selected' : `Choose ${plan.name_en}`}
                </button>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
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

    const [createLead] = useCreateLeadMutation();
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
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

    const handleSelectPlan = (plan: Plan) => {
        setSelectedPlan(plan);
        setFormData((prev) => ({ ...prev, package: plan.name_en }));
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* ── Optional Auto-Redirected Error Banner ── */}
                {urlErrorType && <SubscriptionError errorType={urlErrorType as any} message={urlMessage || 'Your subscription plan requires an update to access this feature.'} details={urlDetails} />}

                {/* ── Page Header ── */}
                <div className="mb-8 text-center">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
                        <Crown className="h-4 w-4" />
                        Upgrade Subscription
                    </div>
                    <h1 className="mb-2 text-3xl font-black text-gray-900 md:text-4xl">Choose Your Plan</h1>
                    <p className="text-gray-500">Select a plan below, then fill out the form — our team will activate it for you.</p>
                </div>

                {/* ── Plan Cards ── */}
                <div className="mb-10">
                    {plansLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-gray-500">Loading plans...</span>
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
                                                'rounded-lg px-5 py-2 text-sm font-semibold capitalize transition-all duration-200',
                                                billingCycle === cycle ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                            )}
                                        >
                                            {cycle}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div
                                className={classNames(
                                    'grid gap-5 pt-5',
                                    plans.length <= 2 ? 'mx-auto max-w-2xl sm:grid-cols-2' : plans.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'
                                )}
                            >
                                {plans.map((plan, index) => (
                                    <PlanCard
                                        key={plan.id}
                                        plan={plan}
                                        index={index}
                                        isSelected={selectedPlan?.id === plan.id}
                                        isCurrentPlan={currentPlanName?.toLowerCase() === plan.name_en.toLowerCase()}
                                        onSelect={handleSelectPlan}
                                    />
                                ))}
                            </div>

                            {/* Step arrow */}
                            {selectedPlan && (
                                <div className="mt-6 flex flex-col items-center gap-1 text-sm text-gray-400">
                                    <div className="h-6 w-px bg-gray-300" />
                                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600">Step 2 — Fill the form below</span>
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
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                                    <Send className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Submit Upgrade Request</h2>
                                    <p className="text-xs text-gray-500">
                                        {selectedPlan ? (
                                            <span>
                                                Selected: <strong className="text-blue-700">{selectedPlan.name_en}</strong> —{' '}
                                                {formatPrice(billingCycle === 'monthly' ? selectedPlan.monthly_price : selectedPlan.yearly_price)}/{billingCycle === 'monthly' ? 'mo' : 'yr'}
                                            </span>
                                        ) : (
                                            'Select a plan above first'
                                        )}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            Full Name *
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
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                                                placeholder="Your name"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            Email *
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
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            Phone *
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
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                                                placeholder="+880 1234 567890"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="store_name" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            Store
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
                                                placeholder="Auto-filled"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Selected package (read + editable fallback) */}
                                <div>
                                    <label htmlFor="package" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                        Selected Package *
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
                                                    ? 'cursor-not-allowed border-blue-200 bg-blue-50 font-semibold text-blue-700'
                                                    : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white'
                                            )}
                                            placeholder="Select a plan above"
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
                                            Clear selection
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.package}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" /> Submit Upgrade Request
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
                            <h3 className="mb-4 text-base font-bold text-gray-900">Get in Touch</h3>
                            <div className="space-y-3">
                                {[
                                    { icon: MapPin, label: 'Visit Us', value: 'House 34, Road 3, Block B, Aftabnagar, Dhaka' },
                                    { icon: Phone, label: 'Call Us', value: '+880 1577303608' },
                                    { icon: Mail, label: 'Email Us', value: 'support@andgatetech.net' },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                                            <Icon className="h-4 w-4 text-blue-600" />
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
                            <h3 className="mb-4 text-base font-bold text-gray-900">What Happens Next?</h3>
                            <div className="space-y-3">
                                {[
                                    { n: 1, title: 'We Review Your Request', desc: 'Our team reviews within 2 hours' },
                                    { n: 2, title: 'Payment Setup', desc: 'We guide you through payment' },
                                    { n: 3, title: 'Instant Activation', desc: 'Your new plan activates immediately' },
                                ].map(({ n, title, desc }) => (
                                    <div key={n} className="flex items-start gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">{n}</div>
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
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="mb-2 text-2xl font-bold text-gray-900">Request Submitted!</h3>
                            <p className="mb-6 text-gray-500">Thank you! Our team will contact you shortly to complete your upgrade.</p>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white hover:from-blue-700 hover:to-indigo-700"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
