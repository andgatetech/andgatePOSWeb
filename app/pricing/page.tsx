
'use client';
import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import { ArrowRight, Building2, Check, Clock, HelpCircle, Rocket, Shield, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import Footer from '../terms-of-service/Footer';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

const colorClasses = {
    slate: {
        ring: 'ring-slate-200',
        text: 'text-slate-600',
        button: 'bg-slate-50 text-slate-700 hover:bg-slate-100 ring-1 ring-inset ring-slate-300',
        icon: 'text-slate-400',
        badge: 'bg-slate-100 text-slate-700',
    },
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

export default function PricingPage() {
    const { t } = getTranslation();
    const [frequency, setFrequency] = useState({ value: 'monthly', label: '', priceSuffix: '' });
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    // Get frequencies from translation
    const frequencies = [
        {
            value: 'monthly',
            label: t('pricing_page.frequency.monthly'),
            priceSuffix: t('pricing_page.frequency.per_month'),
            setupFree: 'setupFee',
        },
        {
            value: 'annually',
            label: t('pricing_page.frequency.annually'),
            priceSuffix: t('pricing_page.frequency.per_year'),
            discount: t('pricing_page.frequency.save'),
            setupFree: 'setupFee',
        },
    ];

    // Set initial frequency with translation
    if (!frequency.label) {
        setFrequency(frequencies[0]);
    }

    // Tier configuration (prices remain in component)
    // const tierKeys = ['free', 'starter', 'sme', 'professional', 'enterprise'];
    const tierKeys = ['starter', 'sme', 'professional', 'enterprise'];
    const tierPrices: Record<string, any> = {
        // free: { monthly: '৳0', annually: '৳0', originalAnnually: '৳3600' },
        starter: { monthly: '৳499', annually: '৳5988', originalAnnually: '৳5390', setupFee: '৳2000' },
        sme: { monthly: '৳999', annually: '৳11988', originalAnnually: '৳9591', setupFee: '৳5000' },
        professional: { monthly: '৳1999', annually: '৳23988', originalAnnually: '৳19191', setupFee: '৳20000' },
        enterprise: { monthly: '৳4999', annually: '৳59988', originalAnnually: '৳47991', setupFee: '৳50000' },
    };

    const tierIcons: Record<string, any> = {
        // free: Building2,
        starter: Rocket,
        sme: Star,
        professional: TrendingUp,
        enterprise: Zap,
    };

    const tierColors: Record<string, keyof typeof colorClasses> = {
        // free: 'slate',
        starter: 'green',
        sme: 'blue',
        professional: 'purple',
        enterprise: 'orange',
    };

    // Build tiers from translations
    const tiers = tierKeys.map((key) => {
        const features = [];
        let i = 0;
        while (i < 20) {
            const feature = t(`pricing_page.tiers.${key}.features.${i}`);
            if (feature.startsWith('pricing_page.tiers')) break;
            features.push(feature);
            i++;
        }

        return {
            id: `tier-${key}`,
            key: key,
            name: t(`pricing_page.tiers.${key}.name`),
            description: t(`pricing_page.tiers.${key}.description`),
            badge: t(`pricing_page.tiers.${key}.badge`),
            cta: t(`pricing_page.tiers.${key}.cta`),
            features,
            setupFee: tierPrices[key].setupFee,
            price: tierPrices[key],
            icon: tierIcons[key],
            color: tierColors[key],
            mostPopular: key === 'sme',
            href: key === 'free' ? '/register' : '/contact',
        };
    });

    // Get FAQ from translations
    const faqs = [];
    let faqIndex = 0;
    while (faqIndex < 10) {
        const question = t(`pricing_page.faq.questions.${faqIndex}.q`);
        if (question.startsWith('pricing_page.faq')) break;
        faqs.push({
            question,
            answer: t(`pricing_page.faq.questions.${faqIndex}.a`),
        });
        faqIndex++;
    }

    const handleGetStarted = (href: string) => {
        window.location.href = href;
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-white">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pb-20 pt-16">
                    <div className="bg-grid-slate-100 absolute inset-0 -z-10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="mb-6 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                                <Shield className="mr-2 h-4 w-4" />
                                {t('pricing_page.hero.badge_text')}
                            </div>
                            <h1 className="mb-6 text-4xl font-black leading-tight text-gray-900 sm:text-5xl md:text-6xl">{t('pricing_page.hero.title')}</h1>
                            <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-gray-600 sm:text-xl">{t('pricing_page.hero.subtitle')}</p>
                            <div className="flex flex-col items-center justify-center space-y-3 text-sm text-gray-600 sm:flex-row sm:space-x-6 sm:space-y-0">
                                <div className="flex items-center">
                                    <Check className="mr-2 h-4 w-4 text-green-500" />
                                    {t('pricing_page.hero.benefits.no_setup')}
                                </div>
                                <div className="flex items-center">
                                    <Check className="mr-2 h-4 w-4 text-blue-500" />
                                    {t('pricing_page.hero.benefits.cancel_anytime')}
                                </div>
                                <div className="flex items-center">
                                    <Check className="mr-2 h-4 w-4 text-purple-500" />
                                    {t('pricing_page.hero.benefits.support')}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                                        {option.discount && (
                                            <span className="absolute -right-2 -top-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{option.discount}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pricing Cards */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
                            {tiers.map((tier) => {
                                const IconComponent = tier.icon;
                                const colors = colorClasses[tier.color];

                                return (
                                    <div
                                        key={tier.id}
                                        className={classNames(
                                            'relative flex flex-col rounded-2xl border-2 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl',
                                            tier.mostPopular ? `${colors.ring} shadow-lg` : 'border-gray-200 hover:border-gray-300'
                                        )}
                                    >
                                        {tier.mostPopular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                                                <div className="rounded-full bg-blue-600 px-4 py-1 text-sm font-medium text-white shadow-lg">{tier.badge}</div>
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
                                                            {t('pricing_page.save_percent')}{' '}
                                                            {Math.round(
                                                                ((parseInt(tier.price.originalAnnually.slice(1)) - parseInt(tier.price.annually.slice(1))) /
                                                                    parseInt(tier.price.originalAnnually.slice(1))) *
                                                                    100
                                                            )}
                                                            %
                                                        </span>
                                                    </p>
                                                )}
                                                {/* Setup Cost Section */}
                                                <p className="mt-2 text-sm font-medium text-gray-700">
                                                    Setup Fee: <span className="font-semibold text-gray-900">{tier.price[frequency.setupFee]}</span>
                                                </p>
                                            </div>

                                            {/* CTA Button */}
                                            <button
                                                onClick={() => handleGetStarted(tier.href)}
                                                className={classNames('mb-6 w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-all duration-200', colors.button)}
                                            >
                                                {tier.cta}
                                            </button>

                                            {/* Features */}
                                            <div className="flex-1">
                                                <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-500">{t('pricing_page.features_included')}</p>
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
                    </div>
                </section>

                {/* Comparison Table */}
                <section className="bg-white py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">{t('pricing_page.comparison.title')}</h2>
                            <p className="text-base text-gray-600 sm:text-lg">{t('pricing_page.comparison.subtitle')}</p>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="w-full min-w-[640px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 sm:px-6">{t('pricing_page.comparison.features')}</th>
                                        {tiers.map((tier) => (
                                            <th key={tier.id} className="px-3 py-4 text-center text-sm font-semibold text-gray-900 sm:px-6">
                                                {tier.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    <tr>
                                        <td className="px-4 py-4 text-sm text-gray-600 sm:px-6">{t('pricing_page.comparison.stores')}</td>
                                        <td className="px-3 py-4 text-center text-sm text-gray-900 sm:px-6">1</td>
                                        <td className="px-3 py-4 text-center text-sm text-gray-900 sm:px-6">1</td>
                                        <td className="px-3 py-4 text-center text-sm text-gray-900 sm:px-6">1</td>
                                        <td className="px-3 py-4 text-center text-sm text-gray-900 sm:px-6">{t('pricing_page.comparison.up_to')} 3</td>
                                        <td className="px-3 py-4 text-center text-sm text-gray-900 sm:px-6">{t('pricing_page.comparison.unlimited')}</td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="px-4 py-4 text-sm text-gray-600 sm:px-6">{t('pricing_page.comparison.products')}</td>
                                        <td className="px-3 py-4 text-center text-sm text-gray-900 sm:px-6">50</td>
                                        <td className="px-3 py-4 text-center text-sm text-gray-900 sm:px-6">100</td>
                                        <td className="px-3 py-4 text-center text-sm text-gray-900 sm:px-6">200</td>
                                        <td className="px-3 py-4 text-center text-sm text-gray-900 sm:px-6">500</td>
                                        <td className="px-3 py-4 text-center text-sm text-gray-900 sm:px-6">{t('pricing_page.comparison.unlimited')}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-4 text-sm text-gray-600 sm:px-6">{t('pricing_page.comparison.priority_support')}</td>
                                        <td className="px-3 py-4 text-center sm:px-6">
                                            <span className="text-gray-400">—</span>
                                        </td>
                                        <td className="px-3 py-4 text-center sm:px-6">
                                            <span className="text-gray-400">—</span>
                                        </td>
                                        <td className="px-3 py-4 text-center sm:px-6">
                                            <Check className="mx-auto h-5 w-5 text-green-500" />
                                        </td>
                                        <td className="px-3 py-4 text-center sm:px-6">
                                            <Check className="mx-auto h-5 w-5 text-green-500" />
                                        </td>
                                        <td className="px-3 py-4 text-center sm:px-6">
                                            <Check className="mx-auto h-5 w-5 text-green-500" />
                                        </td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="px-4 py-4 text-sm text-gray-600 sm:px-6">{t('pricing_page.comparison.api_access')}</td>
                                        <td className="px-3 py-4 text-center sm:px-6">
                                            <span className="text-gray-400">—</span>
                                        </td>
                                        <td className="px-3 py-4 text-center sm:px-6">
                                            <span className="text-gray-400">—</span>
                                        </td>
                                        <td className="px-3 py-4 text-center sm:px-6">
                                            <span className="text-gray-400">—</span>
                                        </td>
                                        <td className="px-3 py-4 text-center sm:px-6">
                                            <span className="text-gray-400">—</span>
                                        </td>
                                        <td className="px-3 py-4 text-center sm:px-6">
                                            <Check className="mx-auto h-5 w-5 text-green-500" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="bg-gradient-to-b from-slate-50 to-white py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">{t('pricing_page.faq.title')}</h2>
                            <p className="text-base text-gray-600 sm:text-lg">{t('pricing_page.faq.subtitle')}</p>
                        </div>
                        <div className="mx-auto max-w-3xl space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="rounded-xl border border-gray-200 bg-white">
                                    <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between px-4 py-4 text-left sm:px-6">
                                        <span className="font-semibold text-gray-900">{faq.question}</span>
                                        <HelpCircle className={classNames('h-5 w-5 flex-shrink-0 text-gray-400 transition-transform', openFaq === index && 'rotate-180')} />
                                    </button>
                                    {openFaq === index && (
                                        <div className="border-t border-gray-100 px-4 py-4 sm:px-6">
                                            <p className="text-gray-600">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trust Indicators */}
                <section className="bg-white py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                    <Shield className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">{t('pricing_page.trust.secure_title')}</h3>
                                <p className="text-gray-600">{t('pricing_page.trust.secure_subtitle')}</p>
                            </div>
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                    <Clock className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">{t('pricing_page.trust.support_title')}</h3>
                                <p className="text-gray-600">{t('pricing_page.trust.support_subtitle')}</p>
                            </div>
                            <div className="text-center sm:col-span-2 lg:col-span-1">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                                    <Users className="h-8 w-8 text-purple-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">{t('pricing_page.trust.trusted_title')}</h3>
                                <p className="text-gray-600">{t('pricing_page.trust.trusted_subtitle')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 py-16 sm:py-20">
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                        <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">{t('pricing_page.cta.title')}</h2>
                        <p className="mb-8 text-lg text-blue-100 sm:text-xl">{t('pricing_page.cta.subtitle')}</p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <button
                                onClick={() => handleGetStarted('/register')}
                                className="group flex w-full transform items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl transition-all hover:scale-105 hover:bg-gray-100 sm:w-auto"
                            >
                                {t('pricing_page.cta.start_trial')}
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </button>
                            <button
                                onClick={() => handleGetStarted('/contact')}
                                className="w-full rounded-full border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white hover:text-blue-600 sm:w-auto"
                            >
                                {t('pricing_page.cta.contact_sales')}
                            </button>
                        </div>
                        <div className="mt-6 text-sm text-blue-100">{t('pricing_page.cta.guarantee')}</div>
                    </div>
                </section>
            </div>
            <Footer />
        </MainLayout>
    );
}
