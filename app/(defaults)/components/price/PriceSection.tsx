import { useState } from 'react';
import { Check, Star, Zap, Building2 } from 'lucide-react';

const frequencies = [
    { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
    { value: 'annually', label: 'Annually', priceSuffix: '/year', discount: 'Save 20%' },
];

const tiers = [
    {
        name: 'Free',
        id: 'tier-free',
        href: '#',
        price: { monthly: '৳29', annually: '৳279' },
        originalPrice: { annually: '৳348' },
        description: 'Perfect for small businesses and startups getting started with POS.',
        features: ['Up to 2 registers', '1,000 products', 'Basic inventory management', 'Payment processing', 'Email support', 'Basic reporting'],
        mostPopular: false,
        icon: Building2,
        color: 'slate',
    },
    {
        name: 'SME',
        id: 'tier-sme',
        href: '#',
        price: { monthly: '৳59', annually: '৳567' },
        originalPrice: { annually: '৳708' },
        description: 'Advanced features for growing businesses that need more control.',
        features: [
            'Up to 5 registers',
            'Unlimited products',
            'Advanced inventory management',
            'Multi-payment processing',
            'Priority support',
            'Advanced analytics',
            'Customer management',
            'Staff management',
        ],
        mostPopular: true,
        icon: Star,
        color: 'blue',
    },
    {
        name: 'Enterprise',
        id: 'tier-enterprise',
        href: '#',
        price: { monthly: '৳99', annually: '৳949' },
        originalPrice: { annually: '৳1188' },
        description: 'Complete solution for large businesses with multiple locations.',
        features: [
            'Unlimited registers',
            'Unlimited products',
            'Multi-location support',
            'Custom integrations',
            '24/7 phone support',
            'Custom reporting',
            'API access',
            'Dedicated account manager',
            'Training & onboarding',
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
        button: 'bg-slate-50 text-slate-700 hover:bg-slate-100 ring-1 ring-inset ring-slate-300',
        icon: 'text-slate-400',
    },
    blue: {
        ring: 'ring-blue-600',
        text: 'text-blue-600',
        button: 'bg-blue-600 text-white hover:bg-blue-700',
        icon: 'text-blue-500',
    },
    purple: {
        ring: 'ring-purple-200',
        text: 'text-purple-600',
        button: 'bg-purple-50 text-purple-700 hover:bg-purple-100 ring-1 ring-inset ring-purple-300',
        icon: 'text-purple-400',
    },
};

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function PriceSection({ id }) {
    const [frequency, setFrequency] = useState(frequencies[0]);

    return (
        <div id={id} className="bg-gradient-to-b from-slate-50 to-white py-24 sm:py-14">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-4xl text-center">
                    <p className="mb-2 text-sm font-medium text-blue-600">PRICING PLANS</p>
                    <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Choose the right plan for your business</h2>
                    <p className="text-xl leading-8 text-gray-600">Start with our free trial. Upgrade anytime as your business grows.</p>
                </div>

                {/* Frequency Toggle */}
                <div className="mt-12 flex justify-center">
                    <div className="relative rounded-xl bg-gray-100 p-1">
                        {frequencies.map((option, index) => (
                            <button
                                key={option.value}
                                onClick={() => setFrequency(option)}
                                className={classNames(
                                    'relative rounded-lg px-6 py-2 text-sm font-medium transition-all duration-200',
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
                <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
                    {tiers.map((tier) => {
                        const IconComponent = tier.icon;
                        const colors = colorClasses[tier.color];

                        return (
                            <div
                                key={tier.id}
                                className={classNames(
                                    'relative rounded-2xl border-2 bg-white shadow-sm transition-all duration-200 hover:shadow-lg',
                                    tier.mostPopular ? colors.ring : 'border-gray-200 hover:border-gray-300'
                                )}
                            >
                                {tier.mostPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                                        <div className="rounded-full bg-blue-600 px-4 py-1 text-sm font-medium text-white">Most Popular</div>
                                    </div>
                                )}

                                <div className="p-8">
                                    {/* Icon and Title */}
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className={classNames('rounded-lg bg-gray-50 p-2', colors.icon)}>
                                            <IconComponent className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900">{tier.name}</h3>
                                    </div>

                                    {/* Description */}
                                    <p className="mb-6 text-gray-600">{tier.description}</p>

                                    {/* Price */}
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-gray-900">{tier.price[frequency.value]}</span>
                                            <span className="font-medium text-gray-500">{frequency.priceSuffix}</span>
                                        </div>
                                        {frequency.value === 'annually' && tier.originalPrice && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                <span className="line-through">{tier.originalPrice.annually}</span>
                                                <span className="ml-2 font-medium text-green-600">
                                                    Save{' '}
                                                    {Math.round(
                                                        ((parseInt(tier.originalPrice.annually.slice(1)) - parseInt(tier.price.annually.slice(1))) / parseInt(tier.originalPrice.annually.slice(1))) *
                                                            100
                                                    )}
                                                    %
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    {/* CTA Button */}
                                    <button className={classNames('w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200', colors.button)}>Get Started</button>

                                    {/* Features */}
                                    <div className="mt-8">
                                        <p className="mb-4 text-sm font-medium text-gray-900">What's included:</p>
                                        <ul className="space-y-3">
                                            {tier.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
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
                <div className="mt-16 text-center">
                    <p className="mb-6 text-gray-600">Need a custom solution? We offer tailored plans for large enterprises.</p>
                    <button className="inline-flex items-center rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800">Contact Sales</button>
                </div>
            </div>
        </div>
    );
}
