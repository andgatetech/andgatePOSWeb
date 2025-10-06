'use client';
import { Building2, Check, Crown, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface UpgradePlansProps {
    showHeader?: boolean;
    currentPlan?: string;
}

const frequencies = [
    { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
    { value: 'annually', label: 'Annually', priceSuffix: '/year', discount: 'Save 20%' },
];

const tiers = [
    {
        name: 'Basic',
        id: 'tier-Basic',
        price: { monthly: '৳200', annually: '৳2,000' },
        originalPrice: { annually: '৳2,400' },
        description: 'Perfect for small businesses and startups getting started with POS.',
        features: ['1 Store', '50 Products', 'Basic Inventory Management', 'Basic Accounting', 'Basic Reporting', 'Basic Support'],
        mostPopular: false,
        icon: Building2,
        color: 'slate',
    },
    {
        name: 'SME',
        id: 'tier-SME',
        price: { monthly: '৳500', annually: '৳4,800' },
        originalPrice: { annually: '৳6,000' },
        description: 'Advanced features for growing businesses that need more control.',
        features: ['1 Store', '200 Products', 'Advanced Inventory Management', 'Advanced Accounting', 'Priority Support', 'Advanced Analytics', 'Customer Management', 'Staff Management'],
        mostPopular: true,
        icon: Star,
        color: 'blue',
    },
    {
        name: 'Enterprise',
        id: 'tier-enterprise',
        price: { monthly: '৳2,000', annually: '৳19,200' },
        originalPrice: { annually: '৳24,000' },
        description: 'Complete solution for large businesses with multiple locations.',
        features: [
            'Unlimited Stores',
            'Unlimited Products',
            'Multi-location Support',
            'Advanced Inventory Management',
            'Advanced Accounting',
            'Advanced Analytics',
            'Custom Reporting',
            'Custom Integrations',
            '24/7 Phone Support',
            'API Access',
            'Priority Support',
            'Training & Onboarding',
        ],
        mostPopular: false,
        icon: Zap,
        color: 'purple',
    },
];

const colorClasses = {
    slate: {
        ring: 'ring-slate-200',
        text: 'text-slate-600',
        button: 'bg-slate-100 text-slate-700 hover:bg-slate-200 ring-1 ring-inset ring-slate-300',
        currentButton: 'bg-slate-300 text-slate-800 cursor-not-allowed',
        icon: 'text-slate-400',
    },
    blue: {
        ring: 'ring-blue-600',
        text: 'text-blue-600',
        button: 'bg-blue-600 text-white hover:bg-blue-700',
        currentButton: 'bg-blue-300 text-blue-800 cursor-not-allowed',
        icon: 'text-blue-500',
    },
    purple: {
        ring: 'ring-purple-200',
        text: 'text-purple-600',
        button: 'bg-purple-600 text-white hover:bg-purple-700',
        currentButton: 'bg-purple-300 text-purple-800 cursor-not-allowed',
        icon: 'text-purple-400',
    },
};

function classNames(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

const UpgradePlans: React.FC<UpgradePlansProps> = ({ showHeader = true, currentPlan }) => {
    const [frequency, setFrequency] = useState(frequencies[0]);

    return (
        <div className="w-full">
            {showHeader && (
                <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                                <Crown className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
                                <p className="text-sm text-gray-500">Select the perfect plan for your business needs</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Frequency Toggle */}
            <div className="mb-6 flex justify-center">
                <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
                    {frequencies.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setFrequency(option)}
                            className={classNames(
                                'relative rounded-md px-6 py-2 text-sm font-medium transition-all duration-200',
                                frequency.value === option.value ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
                            )}
                        >
                            {option.label}
                            {option.discount && frequency.value === option.value && (
                                <span className="absolute -right-1 -top-1 rounded-full bg-green-500 px-1.5 py-0.5 text-xs font-medium text-white">{option.discount}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
                {tiers.map((tier) => {
                    const IconComponent = tier.icon;
                    const colors = colorClasses[tier.color as keyof typeof colorClasses];
                    const isCurrentPlan = currentPlan?.toLowerCase() === tier.name.toLowerCase();

                    return (
                        <div
                            key={tier.id}
                            className={classNames(
                                'relative rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md',
                                tier.mostPopular && !isCurrentPlan ? 'border-2 border-blue-600' : 'border border-gray-200',
                                isCurrentPlan && 'border-2 border-green-500'
                            )}
                        >
                            {tier.mostPopular && !isCurrentPlan && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">Most Popular</span>
                                </div>
                            )}

                            {isCurrentPlan && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">✓ Current Plan</span>
                                </div>
                            )}

                            {/* Icon and Title */}
                            <div className="mb-4 flex items-center gap-3">
                                <div className={classNames('rounded-lg p-2', colors.icon, 'bg-gray-50')}>
                                    <IconComponent className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                            </div>

                            {/* Description */}
                            <p className="mb-4 text-sm text-gray-600">{tier.description}</p>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-gray-900">{tier.price[frequency.value as keyof typeof tier.price]}</span>
                                    <span className="text-gray-500">{frequency.priceSuffix}</span>
                                </div>
                                {frequency.value === 'annually' && tier.originalPrice && (
                                    <p className="mt-1 text-sm text-gray-600">
                                        <span className="line-through">{tier.originalPrice.annually}</span>
                                        <span className="ml-2 font-medium text-green-600">
                                            Save{' '}
                                            {Math.round(
                                                ((parseInt(tier.originalPrice.annually.replace(/[^\d]/g, '')) - parseInt(tier.price.annually.replace(/[^\d]/g, ''))) /
                                                    parseInt(tier.originalPrice.annually.replace(/[^\d]/g, ''))) *
                                                    100
                                            )}
                                            %
                                        </span>
                                    </p>
                                )}
                            </div>

                            {/* CTA Button */}
                            {isCurrentPlan ? (
                                <button
                                    disabled
                                    className="mb-6 block w-full cursor-not-allowed rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-center text-sm font-semibold text-gray-500"
                                >
                                    ✓ Your Current Plan
                                </button>
                            ) : (
                                <Link
                                    href={`/subscription?package=${tier.name}`}
                                    className={classNames(
                                        'mb-6 block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold shadow-sm transition-all hover:shadow-md',
                                        tier.mostPopular
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    )}
                                >
                                    <Crown className="mr-2 inline-block h-4 w-4" />
                                    {`Upgrade to ${tier.name}`}
                                </Link>
                            )}

                            {/* Features */}
                            <div>
                                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">What&apos;s included:</p>
                                <ul className="space-y-2">
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                <p className="mb-4 text-gray-700">Need a custom solution? We offer tailored plans for large enterprises.</p>
                <Link href="/contact" className="inline-flex items-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md">
                    Contact Sales Team
                </Link>
            </div>
        </div>
    );
};

export default UpgradePlans;
