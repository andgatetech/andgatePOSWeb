'use client';
import { Check, Crown, Rocket, Shield, Star, TrendingUp, Zap } from 'lucide-react';
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
        text: 'text-green-600',
        button: 'bg-green-600 text-white hover:bg-green-700',
        icon: 'text-green-500',
        badge: 'bg-green-100 text-green-700',
    },
    blue: {
        ring: 'ring-blue-600',
        text: 'text-blue-600',
        button: 'bg-blue-600 text-white hover:bg-blue-700',
        icon: 'text-blue-500',
        badge: 'bg-blue-100 text-blue-700',
    },
    purple: {
        ring: 'ring-purple-600',
        text: 'text-purple-600',
        button: 'bg-purple-600 text-white hover:bg-purple-700',
        icon: 'text-purple-500',
        badge: 'bg-purple-100 text-purple-700',
    },
    orange: {
        ring: 'ring-orange-600',
        text: 'text-orange-600',
        button: 'bg-orange-600 text-white hover:bg-orange-700',
        icon: 'text-orange-500',
        badge: 'bg-orange-100 text-orange-700',
    },
};

const UpgradePlans: React.FC<UpgradePlansProps> = ({ showHeader = true, currentPlan }) => {
    const [frequency, setFrequency] = useState<{ value: string; label: string; priceSuffix: string; discount?: string }>({
        value: 'monthly',
        label: 'Monthly',
        priceSuffix: '/month',
    });

    const frequencies = [
        { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
        { value: 'annually', label: 'Annually', priceSuffix: '/year', discount: 'Save 10%' },
    ];

    // Tier configuration
    const tierKeys = ['starter', 'sme', 'professional', 'enterprise'];
    const tierPrices: Record<string, any> = {
        starter: { monthly: '৳ 499', annually: '৳ 5988', originalAnnually: '৳ 5390', setupFee: '৳ 2000' },
        sme: { monthly: '৳ 999', annually: '৳ 11988', originalAnnually: '৳ 9591', setupFee: '৳ 5000' },
        professional: { monthly: '৳ 1999', annually: '৳ 23988', originalAnnually: '৳ 19191', setupFee: '৳ 20000' },
        enterprise: { monthly: '৳ 4999', annually: '৳ 59988', originalAnnually: '৳ 47991', setupFee: '৳ 50000' },
    };

    const tierIcons: Record<string, any> = {
        starter: Rocket,
        sme: Star,
        professional: TrendingUp,
        enterprise: Zap,
    };

    const tierColors: Record<string, keyof typeof colorClasses> = {
        starter: 'green',
        sme: 'blue',
        professional: 'purple',
        enterprise: 'orange',
    };

    const tierData: Record<string, any> = {
        starter: {
            name: 'Starter',
            description: 'Perfect for small businesses just getting started with POS.',
            badge: 'Best Value',
            features: ['1 Store Location', 'Up to 100 Products', 'Basic Inventory Management', 'Sales & Purchase Tracking', 'Basic Reporting', 'Email Support', 'Mobile App Access'],
        },
        sme: {
            name: 'SME',
            description: 'Advanced features for growing businesses that need more control.',
            badge: 'Most Popular',
            features: [
                '3 Store Locations',
                'Up to 500 Products',
                'Advanced Inventory Management',
                'Multi-currency Support',
                'Advanced Reporting & Analytics',
                'Priority Email Support',
                'Staff Management (5 users)',
                'Customer Management',
                'Barcode Printing',
            ],
        },
        professional: {
            name: 'Professional',
            description: 'Comprehensive solution for established businesses with complex needs.',
            badge: 'Pro Choice',
            features: [
                '10 Store Locations',
                'Unlimited Products',
                'Advanced Inventory with Serials',
                'Multi-currency & Tax Management',
                'Custom Reports & Dashboards',
                'Priority Phone & Email Support',
                'Staff Management (20 users)',
                'Advanced Customer Loyalty',
                'API Access',
                'Custom Integrations',
            ],
        },
        enterprise: {
            name: 'Enterprise',
            description: 'Complete solution for large businesses with multiple locations.',
            badge: 'Ultimate',
            features: [
                'Unlimited Store Locations',
                'Unlimited Products',
                'Enterprise Inventory Management',
                'Multi-currency, Tax & Compliance',
                'Advanced Analytics & BI Tools',
                '24/7 Dedicated Support',
                'Unlimited Staff Users',
                'Advanced CRM & Loyalty Programs',
                'Full API Access',
                'Custom Development',
                'Training & Onboarding',
                'Dedicated Account Manager',
            ],
        },
    };

    // Build tiers
    const tiers = tierKeys.map((key) => {
        return {
            id: `tier-${key}`,
            key: key,
            name: tierData[key].name,
            description: tierData[key].description,
            badge: tierData[key].badge,
            features: tierData[key].features,
            price: tierPrices[key],
            icon: tierIcons[key],
            color: tierColors[key],
            mostPopular: key === 'sme',
            href: '/contact',
        };
    });

    return (
        <div className="w-full">
            {showHeader && (
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                        <Shield className="mr-2 h-4 w-4" />
                        Flexible Pricing Plans
                    </div>
                    <h2 className="mb-4 text-3xl font-black text-gray-900 sm:text-4xl">Choose Your Perfect Plan</h2>
                    <p className="mx-auto max-w-2xl text-lg text-gray-600">Select the plan that best fits your business needs. All plans include core features with no hidden fees.</p>
                    <div className="mt-4 flex flex-col items-center justify-center space-y-2 text-sm text-gray-600 sm:flex-row sm:space-x-6 sm:space-y-0">
                        <div className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            No Setup Fee
                        </div>
                        <div className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-blue-500" />
                            Cancel Anytime
                        </div>
                        <div className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-purple-500" />
                            24/7 Support
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
                            onClick={() => setFrequency(option)}
                            className={classNames(
                                'relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 sm:px-6',
                                frequency.value === option.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            )}
                        >
                            {option.label}
                            {option.discount && <span className="absolute -right-2 -top-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{option.discount}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-8">
                {tiers.map((tier) => {
                    const IconComponent = tier.icon;
                    const colors = colorClasses[tier.color];
                    const isCurrentPlan = currentPlan?.toLowerCase() === tier.name.toLowerCase();

                    return (
                        <div
                            key={tier.id}
                            className={classNames(
                                'relative flex flex-col rounded-2xl border-2 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl',
                                tier.mostPopular && !isCurrentPlan ? `${colors.ring} shadow-lg` : 'border-gray-200 hover:border-gray-300',
                                isCurrentPlan && 'border-green-500 shadow-lg'
                            )}
                        >
                            {tier.mostPopular && !isCurrentPlan && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                                    <div className="rounded-full bg-blue-600 px-4 py-1 text-sm font-medium text-white shadow-lg">{tier.badge}</div>
                                </div>
                            )}

                            {isCurrentPlan && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                                    <div className="rounded-full bg-green-600 px-4 py-1 text-sm font-medium text-white shadow-lg">✓ Current Plan</div>
                                </div>
                            )}

                            <div className="flex flex-1 flex-col p-6 sm:p-8">
                                {/* Icon and Title */}
                                <div className="mb-4 flex items-center gap-3">
                                    <div className={classNames('rounded-lg bg-gray-50 p-2', colors.icon)}>
                                        <IconComponent className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">{tier.name}</h3>
                                </div>

                                {/* Description */}
                                <p className="mb-6 text-sm text-gray-600">{tier.description}</p>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-gray-900 sm:text-4xl">{tier.price[frequency.value]}</span>
                                        <span className="text-sm font-medium text-gray-500">{frequency.priceSuffix}</span>
                                    </div>
                                    {frequency.value === 'annually' && tier.price.originalAnnually && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            <span className="line-through">{tier.price.originalAnnually}</span>
                                            <span className="ml-2 font-medium text-green-600">
                                                Save{' '}
                                                {Math.round(
                                                    ((parseInt(tier.price.originalAnnually.replace(/[^\d]/g, '')) - parseInt(tier.price.annually.replace(/[^\d]/g, ''))) /
                                                        parseInt(tier.price.originalAnnually.replace(/[^\d]/g, ''))) *
                                                        100
                                                )}
                                                %
                                            </span>
                                        </p>
                                    )}
                                    {/* Setup Fee */}
                                    <p className="mt-2 text-sm font-medium text-gray-700">
                                        Setup Fee: <span className="font-semibold text-gray-900">{tier.price.setupFee}</span>
                                    </p>
                                </div>

                                {/* CTA Button */}
                                {isCurrentPlan ? (
                                    <button
                                        disabled
                                        className="mb-6 w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-center text-sm font-semibold text-gray-500 transition-all duration-200"
                                    >
                                        ✓ Your Current Plan
                                    </button>
                                ) : (
                                    <Link
                                        href={`/subscription?package=${tier.name}`}
                                        className={classNames('mb-6 block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-all duration-200', colors.button)}
                                    >
                                        <Crown className="mr-2 inline-block h-4 w-4" />
                                        Upgrade to {tier.name}
                                    </Link>
                                )}

                                {/* Features */}
                                <div className="flex-1">
                                    <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-500">Features Included</p>
                                    <ul className="space-y-3">
                                        {tier.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                                                <span className="text-sm text-gray-600">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 to-blue-50 p-8 text-center shadow-sm">
                <h3 className="mb-2 text-xl font-bold text-gray-900">Need a Custom Solution?</h3>
                <p className="mb-6 text-gray-700">We offer tailored plans for large enterprises with specific requirements.</p>
                <Link href="/contact" className="inline-flex items-center rounded-xl bg-gray-900 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md">
                    <Shield className="mr-2 h-4 w-4" />
                    Contact Sales Team
                </Link>
            </div>
        </div>
    );
};

export default UpgradePlans;
