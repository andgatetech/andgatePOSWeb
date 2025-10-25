// 'use client';
// import MainLayout from '@/components/layout/MainLayout';
// import { ArrowRight, Building2, Check, Clock, HelpCircle, Rocket, Shield, Star, TrendingUp, Users, Zap } from 'lucide-react';
// import { useState } from 'react';
// import Footer from '../terms-of-service/Footer';
// const frequencies = [
//     { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
//     { value: 'annually', label: 'Annually', priceSuffix: '/year', discount: 'Save 20%' },
// ];

// const tiers = [
//     {
//         name: 'Free',
//         id: 'tier-free',
//         href: '#',
//         price: { monthly: '৳0', annually: '৳0' },
//         originalPrice: { annually: '৳3600' },
//         description: 'Perfect for small businesses and startups getting started with POS.',
//         features: ['Up to 1 Store', '50 products', 'Basic Inventory Management', 'Basic Accounting', 'Basic Reporting', 'Email Support', 'Mobile Access', 'Sales Tracking'],
//         mostPopular: false,
//         icon: Building2,
//         color: 'slate',
//         badge: 'Get Started',
//     },
//     {
//         name: 'Starter',
//         id: 'tier-starter',
//         href: '#',
//         price: { monthly: '৳99', annually: '৳950' },
//         originalPrice: { annually: '৳1188' },
//         description: 'Ideal for small shops looking to scale with essential tools.',
//         features: [
//             'Up to 1 Store',
//             '100 products',
//             'Standard Inventory Management',
//             'Standard Accounting',
//             'Sales Analytics',
//             'Customer Database',
//             'Email & Chat Support',
//             'Barcode Scanning',
//             'Receipt Printing',
//         ],
//         mostPopular: false,
//         icon: Rocket,
//         color: 'green',
//         badge: 'Best Value',
//     },
//     {
//         name: 'SME',
//         id: 'tier-sme',
//         href: '#',
//         price: { monthly: '৳299', annually: '৳4800' },
//         originalPrice: { annually: '৳6000' },
//         description: 'Advanced features for growing businesses that need more control.',
//         features: [
//             'Up to 1 Store',
//             '200 products',
//             'Advanced Inventory Management',
//             'Advanced Accounting',
//             'Priority Support',
//             'Advanced Analytics',
//             'Customer Management',
//             'Staff Management',
//             'Expense Tracking',
//             'Purchase Orders',
//             'Multi-Payment Options',
//         ],
//         mostPopular: true,
//         icon: Star,
//         color: 'blue',
//         badge: 'Most Popular',
//     },
//     {
//         name: 'Professional',
//         id: 'tier-professional',
//         href: '#',
//         price: { monthly: '৳499', annually: '৳14390' },
//         originalPrice: { annually: '৳17988' },
//         description: 'For established businesses needing powerful features and insights.',
//         features: [
//             'Up to 3 Stores',
//             '500 products',
//             'Multi-Store Management',
//             'Advanced Analytics & Reports',
//             'Complete Accounting Suite',
//             'Staff Management with Permissions',
//             'Customer Loyalty Program',
//             'Supplier Management',
//             'Low Stock Alerts',
//             'Custom Reports',
//             'Dedicated Account Manager',
//             'Priority Phone Support',
//         ],
//         mostPopular: false,
//         icon: TrendingUp,
//         color: 'purple',
//         badge: 'Professional',
//     },
//     {
//         name: 'Enterprise',
//         id: 'tier-enterprise',
//         href: '#',
//         price: { monthly: '1999', annually: '৳19200' },
//         originalPrice: { annually: '৳24000' },
//         description: 'Complete solution for large businesses with multiple locations.',
//         features: [
//             'Unlimited Stores',
//             'Unlimited Products',
//             'Multi-Location Support',
//             'Advanced Inventory Management',
//             'Complete Accounting System',
//             'Advanced Analytics & BI',
//             'Custom Reporting',
//             'Custom Integrations',
//             '24/7 Phone Support',
//             'API Access',
//             'White Label Options',
//             'Training & Onboarding',
//             'Data Migration Assistance',
//             'SLA Guarantee',
//         ],
//         mostPopular: false,
//         icon: Zap,
//         color: 'orange',
//         badge: 'Enterprise',
//     },
// ];

// const colorClasses = {
//     slate: {
//         ring: 'ring-slate-200',
//         text: 'text-slate-600',
//         button: 'bg-slate-50 text-slate-700 hover:bg-slate-100 ring-1 ring-inset ring-slate-300',
//         icon: 'text-slate-400',
//         badge: 'bg-slate-100 text-slate-700',
//     },
//     green: {
//         ring: 'ring-green-600',
//         text: 'text-green-600',
//         button: 'bg-green-600 text-white hover:bg-green-700',
//         icon: 'text-green-500',
//         badge: 'bg-green-100 text-green-700',
//     },
//     blue: {
//         ring: 'ring-blue-600',
//         text: 'text-blue-600',
//         button: 'bg-blue-600 text-white hover:bg-blue-700',
//         icon: 'text-blue-500',
//         badge: 'bg-blue-100 text-blue-700',
//     },
//     purple: {
//         ring: 'ring-purple-600',
//         text: 'text-purple-600',
//         button: 'bg-purple-600 text-white hover:bg-purple-700',
//         icon: 'text-purple-500',
//         badge: 'bg-purple-100 text-purple-700',
//     },
//     orange: {
//         ring: 'ring-orange-600',
//         text: 'text-orange-600',
//         button: 'bg-orange-600 text-white hover:bg-orange-700',
//         icon: 'text-orange-500',
//         badge: 'bg-orange-100 text-orange-700',
//     },
// };

// const faqs = [
//     {
//         question: 'Can I switch plans anytime?',
//         answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
//     },
//     {
//         question: 'What payment methods do you accept?',
//         answer: 'We accept bKash, Nagad, credit/debit cards, and bank transfers for annual subscriptions.',
//     },
//     {
//         question: 'Is there a setup fee?',
//         answer: 'No setup fees! All plans come with free onboarding and setup assistance.',
//     },
//     {
//         question: 'Can I cancel my subscription?',
//         answer: 'Yes, you can cancel anytime. No questions asked, no hidden fees.',
//     },
//     {
//         question: 'Do you offer refunds?',
//         answer: 'We offer a 14-day money-back guarantee on all paid plans if you are not satisfied.',
//     },
//     {
//         question: 'Is my data secure?',
//         answer: 'Absolutely! We use bank-level encryption and regular backups to keep your data safe and secure.',
//     },
// ];

// function classNames(...classes) {
//     return classes.filter(Boolean).join(' ');
// }

// export default function PricingPage() {
//     const [frequency, setFrequency] = useState(frequencies[0]);
//     const [openFaq, setOpenFaq] = useState(null);

//     return (
//         <MainLayout>
//             <div className="min-h-screen bg-white">
//                 {/* Hero Section */}
//                 <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pb-20 pt-16">
//                     <div className="bg-grid-slate-100 absolute inset-0 -z-10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
//                     <div className="relative mx-auto  px-4 sm:px-6 lg:px-8">
//                         <div className="text-center">
//                             <div className="mb-6 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
//                                 <Shield className="mr-2 h-4 w-4" />
//                                 Transparent Pricing • No Hidden Fees
//                             </div>
//                             <h1 className="mb-6 text-5xl font-black leading-tight text-gray-900 md:text-6xl">Simple, Transparent Pricing</h1>
//                             <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600">
//                                 Choose the perfect plan for your business. Start free and upgrade as you grow. All plans include 14-day money-back guarantee.
//                             </p>
//                             <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
//                                 <div className="flex items-center">
//                                     <Check className="mr-2 h-4 w-4 text-green-500" />
//                                     No setup fees
//                                 </div>
//                                 <div className="flex items-center">
//                                     <Check className="mr-2 h-4 w-4 text-blue-500" />
//                                     Cancel anytime
//                                 </div>
//                                 <div className="flex items-center">
//                                     <Check className="mr-2 h-4 w-4 text-purple-500" />
//                                     24/7 Support
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Pricing Section */}
//                 <section className="bg-gradient-to-b from-slate-50 to-white py-16">
//                     <div className="mx-auto  px-6 lg:px-8">
//                         {/* Frequency Toggle */}
//                         <div className="mb-12 flex justify-center">
//                             <div className="relative rounded-xl bg-gray-100 p-1">
//                                 {frequencies.map((option) => (
//                                     <button
//                                         key={option.value}
//                                         onClick={() => setFrequency(option)}
//                                         className={classNames(
//                                             'relative rounded-lg px-6 py-2 text-sm font-medium transition-all duration-200',
//                                             frequency.value === option.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
//                                         )}
//                                     >
//                                         {option.label}
//                                         {option.discount && (
//                                             <span className="absolute -right-2 -top-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{option.discount}</span>
//                                         )}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Pricing Cards */}
//                         <div className="grid grid-cols-1 place-items-center justify-center gap-8 md:grid-cols-2 lg:grid-cols-3">
//                             {tiers.map((tier) => {
//                                 const IconComponent = tier.icon;
//                                 const colors = colorClasses[tier.color];

//                                 return (
//                                     <div
//                                         key={tier.id}
//                                         className={classNames(
//                                             'relative flex flex-col rounded-2xl border-2 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl',
//                                             tier.mostPopular ? `${colors.ring} shadow-lg` : 'border-gray-200 hover:border-gray-300'
//                                         )}
//                                     >
//                                         {tier.mostPopular && (
//                                             <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
//                                                 <div className="rounded-full bg-blue-600 px-4 py-1 text-sm font-medium text-white shadow-lg">{tier.badge}</div>
//                                             </div>
//                                         )}

//                                         <div className="flex flex-1 flex-col p-8">
//                                             {/* Icon and Title */}
//                                             <div className="mb-4 flex items-center gap-3">
//                                                 <div className={classNames('rounded-lg bg-gray-50 p-2', colors.icon)}>
//                                                     <IconComponent className="h-6 w-6" />
//                                                 </div>
//                                                 <h3 className="text-xl font-semibold text-gray-900">{tier.name}</h3>
//                                             </div>

//                                             {/* Description */}
//                                             <p className="mb-6 text-sm text-gray-600">{tier.description}</p>

//                                             {/* Price */}
//                                             <div className="mb-6">
//                                                 <div className="flex items-baseline gap-2">
//                                                     <span className="text-4xl font-bold text-gray-900">{tier.price[frequency.value]}</span>
//                                                     <span className="text-sm font-medium text-gray-500">{frequency.priceSuffix}</span>
//                                                 </div>
//                                                 {frequency.value === 'annually' && tier.originalPrice && (
//                                                     <p className="mt-1 text-sm text-gray-500">
//                                                         <span className="line-through">{tier.originalPrice.annually}</span>
//                                                         <span className="ml-2 font-medium text-green-600">
//                                                             Save{' '}
//                                                             {Math.round(
//                                                                 ((parseInt(tier.originalPrice.annually.slice(1)) - parseInt(tier.price.annually.slice(1))) /
//                                                                     parseInt(tier.originalPrice.annually.slice(1))) *
//                                                                     100
//                                                             )}
//                                                             %
//                                                         </span>
//                                                     </p>
//                                                 )}
//                                             </div>

//                                             {/* CTA Button */}
//                                             <button className={classNames('mb-6 w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-all duration-200', colors.button)}>
//                                                 {tier.name === 'Free' ? 'Start Free' : 'Get Started'}
//                                             </button>

//                                             {/* Features */}
//                                             <div className="flex-1">
//                                                 <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-500">What&apos;s included:</p>
//                                                 <ul className="space-y-3">
//                                                     {tier.features.map((feature, index) => (
//                                                         <li key={index} className="flex items-start gap-3">
//                                                             <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
//                                                             <span className="text-sm text-gray-600">{feature}</span>
//                                                         </li>
//                                                     ))}
//                                                 </ul>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     </div>
//                 </section>

//                 {/* Comparison Table */}
//                 <section className="bg-white py-16">
//                     <div className="mx-auto  px-6 lg:px-8">
//                         <div className="mb-12 text-center">
//                             <h2 className="mb-4 text-3xl font-bold text-gray-900">Compare All Features</h2>
//                             <p className="text-lg text-gray-600">See what's included in each plan</p>
//                         </div>
//                         <div className="overflow-x-auto rounded-xl border border-gray-200">
//                             <table className="w-full">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
//                                         {tiers.map((tier) => (
//                                             <th key={tier.id} className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
//                                                 {tier.name}
//                                             </th>
//                                         ))}
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-200 bg-white">
//                                     <tr>
//                                         <td className="px-6 py-4 text-sm text-gray-600">Number of Stores</td>
//                                         <td className="px-6 py-4 text-center text-sm text-gray-900">1</td>
//                                         <td className="px-6 py-4 text-center text-sm text-gray-900">1</td>
//                                         <td className="px-6 py-4 text-center text-sm text-gray-900">1</td>
//                                         <td className="px-6 py-4 text-center text-sm text-gray-900">Up to 3</td>
//                                         <td className="px-6 py-4 text-center text-sm text-gray-900">Unlimited</td>
//                                     </tr>
//                                     <tr className="bg-gray-50">
//                                         <td className="px-6 py-4 text-sm text-gray-600">Products Limit</td>
//                                         <td className="px-6 py-4 text-center text-sm text-gray-900">50</td>
//                                         <td className="px-6 py-4 text-center text-sm text-gray-900">100</td>
//                                         <td className="px-6 py-4 text-center text-sm text-gray-900">200</td>
//                                         <td className="px-6 py-4 text-center text-sm text-gray-900">500</td>
//                                         <td className="px-6 py-4 text-center text-sm text-gray-900">Unlimited</td>
//                                     </tr>
//                                     <tr>
//                                         <td className="px-6 py-4 text-sm text-gray-600">Priority Support</td>
//                                         <td className="px-6 py-4 text-center">
//                                             <span className="text-gray-400">—</span>
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                             <span className="text-gray-400">—</span>
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                             <Check className="mx-auto h-5 w-5 text-green-500" />
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                             <Check className="mx-auto h-5 w-5 text-green-500" />
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                             <Check className="mx-auto h-5 w-5 text-green-500" />
//                                         </td>
//                                     </tr>
//                                     <tr className="bg-gray-50">
//                                         <td className="px-6 py-4 text-sm text-gray-600">API Access</td>
//                                         <td className="px-6 py-4 text-center">
//                                             <span className="text-gray-400">—</span>
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                             <span className="text-gray-400">—</span>
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                             <span className="text-gray-400">—</span>
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                             <span className="text-gray-400">—</span>
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                             <Check className="mx-auto h-5 w-5 text-green-500" />
//                                         </td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </section>

//                 {/* FAQ Section */}
//                 <section className="bg-gradient-to-b from-slate-50 to-white py-16">
//                     <div className="mx-auto  px-6 lg:px-8">
//                         <div className="mb-12 text-center">
//                             <h2 className="mb-4 text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
//                             <p className="text-lg text-gray-600">Everything you need to know about our pricing</p>
//                         </div>
//                         <div className="space-y-4">
//                             {faqs.map((faq, index) => (
//                                 <div key={index} className="rounded-xl border border-gray-200 bg-white">
//                                     <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between px-6 py-4 text-left">
//                                         <span className="font-semibold text-gray-900">{faq.question}</span>
//                                         <HelpCircle className={classNames('h-5 w-5 text-gray-400 transition-transform', openFaq === index && 'rotate-180')} />
//                                     </button>
//                                     {openFaq === index && (
//                                         <div className="border-t border-gray-100 px-6 py-4">
//                                             <p className="text-gray-600">{faq.answer}</p>
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </section>

//                 {/* Trust Indicators */}
//                 <section className="bg-white py-16">
//                     <div className="mx-auto  px-6 lg:px-8">
//                         <div className="grid gap-8 md:grid-cols-3">
//                             <div className="text-center">
//                                 <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
//                                     <Shield className="h-8 w-8 text-blue-600" />
//                                 </div>
//                                 <h3 className="mb-2 text-lg font-semibold text-gray-900">Secure & Reliable</h3>
//                                 <p className="text-gray-600">Bank-level security with 99.9% uptime guarantee</p>
//                             </div>
//                             <div className="text-center">
//                                 <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
//                                     <Clock className="h-8 w-8 text-green-600" />
//                                 </div>
//                                 <h3 className="mb-2 text-lg font-semibold text-gray-900">24/7 Support</h3>
//                                 <p className="text-gray-600">Round-the-clock assistance whenever you need help</p>
//                             </div>
//                             <div className="text-center">
//                                 <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
//                                     <Users className="h-8 w-8 text-purple-600" />
//                                 </div>
//                                 <h3 className="mb-2 text-lg font-semibold text-gray-900">Trusted by 100+</h3>
//                                 <p className="text-gray-600">Join hundreds of businesses across Bangladesh</p>
//                             </div>
//                         </div>
//                     </div>
//                 </section>

//                 {/* CTA Section */}
//                 <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 py-20">
//                     <div className="absolute inset-0 bg-black opacity-10"></div>
//                     <div className="relative mx-auto  px-4 text-center sm:px-6 lg:px-8">
//                         <h2 className="mb-6 text-4xl font-bold text-white">Ready to Get Started?</h2>
//                         <p className="mb-8 text-xl text-blue-100">Start your free trial today. No credit card required. Upgrade anytime.</p>
//                         <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
//                             <button className="group flex transform items-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl transition-all hover:scale-105 hover:bg-gray-100">
//                                 Start Free Trial
//                                 <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
//                             </button>
//                             <button className="rounded-full border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white hover:text-blue-600">Contact Sales</button>
//                         </div>
//                         <div className="mt-6 text-sm text-blue-100">✓ 14-day money-back guarantee ✓ No setup fees ✓ Cancel anytime</div>
//                     </div>
//                 </section>
//             </div>
//             <Footer />
//         </MainLayout>
//     );
// }
'use client';
import MainLayout from '@/components/layout/MainLayout';
import { getTranslation } from '@/i18n';
import { ArrowRight, Building2, Check, Clock, HelpCircle, Rocket, Shield, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import Footer from '../terms-of-service/Footer';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function PricingPage() {
    const { t, data } = getTranslation();
    const [frequency, setFrequency] = useState<'monthly' | 'annually'>('monthly');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    // Get frequencies from translation
    const frequencies = data.pricing?.frequencies || [
        { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
        { value: 'annually', label: 'Annually', priceSuffix: '/year', discount: 'Save 20%' },
    ];

    // Define tiers with translations
    const tiers = [
        {
            name: t('pricing.plan_free'),
            id: 'tier-free',
            href: '#',
            price: { monthly: t('pricing.plan_free_price'), annually: t('pricing.plan_free_price') },
            originalPrice: { annually: '৳3600' },
            description: t('pricing.plan_free_desc'),
            features: [
                t('pricing.feature_sales'),
                t('pricing.feature_inventory'),
                t('pricing.feature_customer'),
                t('pricing.feature_expense'),
                t('pricing.feature_reports'),
                'Email Support',
                'Mobile Access',
                'Sales Tracking',
            ],
            mostPopular: false,
            icon: Building2,
            color: 'slate' as const,
            badge: 'Get Started',
        },
        {
            name: t('pricing.plan_starter'),
            id: 'tier-starter',
            href: '#',
            price: { monthly: t('pricing.plan_starter_price'), annually: '৳950' },
            originalPrice: { annually: '৳1188' },
            description: t('pricing.plan_starter_desc'),
            features: [
                'Up to 1 Store',
                '100 products',
                t('pricing.feature_inventory'),
                t('pricing.feature_expense'),
                'Sales Analytics',
                'Customer Database',
                'Email & Chat Support',
                t('pricing.feature_barcode'),
                'Receipt Printing',
            ],
            mostPopular: false,
            icon: Rocket,
            color: 'green' as const,
            badge: 'Best Value',
        },
        {
            name: t('pricing.plan_business'),
            id: 'tier-sme',
            href: '#',
            price: { monthly: t('pricing.plan_business_price'), annually: '৳4800' },
            originalPrice: { annually: '৳6000' },
            description: t('pricing.plan_business_desc'),
            features: [
                'Up to 1 Store',
                '200 products',
                t('pricing.feature_inventory'),
                t('pricing.feature_expense'),
                t('pricing.feature_support'),
                'Advanced Analytics',
                t('pricing.feature_customer'),
                t('pricing.feature_user_roles'),
                t('pricing.feature_expense'),
                'Purchase Orders',
                'Multi-Payment Options',
            ],
            mostPopular: true,
            icon: Star,
            color: 'blue' as const,
            badge: 'Most Popular',
        },
        {
            name: 'Professional',
            id: 'tier-professional',
            href: '#',
            price: { monthly: '৳499', annually: '৳14390' },
            originalPrice: { annually: '৳17988' },
            description: 'For established businesses needing powerful features and insights.',
            features: [
                'Up to 3 Stores',
                '500 products',
                t('pricing.feature_multistore'),
                'Advanced Analytics & Reports',
                'Complete Accounting Suite',
                t('pricing.feature_user_roles'),
                'Customer Loyalty Program',
                t('pricing.feature_supplier'),
                'Low Stock Alerts',
                'Custom Reports',
                'Dedicated Account Manager',
                t('pricing.feature_support'),
            ],
            mostPopular: false,
            icon: TrendingUp,
            color: 'purple' as const,
            badge: 'Professional',
        },
        {
            name: t('pricing.plan_enterprise'),
            id: 'tier-enterprise',
            href: '#',
            price: { monthly: t('pricing.plan_enterprise_price'), annually: '৳19200' },
            originalPrice: { annually: '৳24000' },
            description: t('pricing.plan_enterprise_desc'),
            features: [
                'Unlimited Stores',
                'Unlimited Products',
                'Multi-Location Support',
                t('pricing.feature_inventory'),
                'Complete Accounting System',
                'Advanced Analytics & BI',
                'Custom Reporting',
                'Custom Integrations',
                '24/7 Phone Support',
                'API Access',
                'White Label Options',
                'Training & Onboarding',
                'Data Migration Assistance',
                'SLA Guarantee',
            ],
            mostPopular: false,
            icon: Zap,
            color: 'orange' as const,
            badge: 'Enterprise',
        },
    ];

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

    const faqs = [
        {
            question: t('pricing.faq_2_q'),
            answer: t('pricing.faq_2_a'),
        },
        {
            question: t('pricing.faq_1_q'),
            answer: t('pricing.faq_1_a'),
        },
        {
            question: t('pricing.faq_3_q'),
            answer: t('pricing.faq_3_a'),
        },
        {
            question: t('pricing.faq_4_q'),
            answer: t('pricing.faq_4_a'),
        },
        {
            question: t('pricing.faq_5_q'),
            answer: t('pricing.faq_5_a'),
        },
    ];

    return (
        <MainLayout>
            <div className="min-h-screen bg-white">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pb-20 pt-16">
                    <div className="bg-grid-slate-100 absolute inset-0 -z-10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                    <div className="relative mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="mb-6 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                                <Shield className="mr-2 h-4 w-4" />
                                {t('pricing.guarantee_title')}
                            </div>
                            <h1 className="mb-6 text-5xl font-black leading-tight text-gray-900 md:text-6xl">{t('pricing.pricing_title')}</h1>
                            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600">{t('pricing.pricing_subtitle')}</p>
                            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Check className="mr-2 h-4 w-4 text-green-500" />
                                    No setup fees
                                </div>
                                <div className="flex items-center">
                                    <Check className="mr-2 h-4 w-4 text-blue-500" />
                                    Cancel anytime
                                </div>
                                <div className="flex items-center">
                                    <Check className="mr-2 h-4 w-4 text-purple-500" />
                                    24/7 Support
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="bg-gradient-to-b from-slate-50 to-white py-16">
                    <div className="mx-auto px-6 lg:px-8">
                        {/* Frequency Toggle */}
                        <div className="mb-12 flex justify-center">
                            <div className="relative rounded-xl bg-gray-100 p-1">
                                {frequencies.map((option: any) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setFrequency(option.value)}
                                        className={classNames(
                                            'relative rounded-lg px-6 py-2 text-sm font-medium transition-all duration-200',
                                            frequency === option.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
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
                        <div className="grid grid-cols-1 place-items-center justify-center gap-8 md:grid-cols-2 lg:grid-cols-3">
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

                                        <div className="flex flex-1 flex-col p-8">
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
                                                    <span className="text-4xl font-bold text-gray-900">{tier.price[frequency]}</span>
                                                    <span className="text-sm font-medium text-gray-500">{frequencies.find((f: any) => f.value === frequency)?.priceSuffix}</span>
                                                </div>
                                                {frequency === 'annually' && tier.originalPrice && (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        <span className="line-through">{tier.originalPrice.annually}</span>
                                                        <span className="ml-2 font-medium text-green-600">
                                                            Save{' '}
                                                            {Math.round(
                                                                ((parseInt(tier.originalPrice.annually.slice(1)) - parseInt(tier.price.annually.slice(1))) /
                                                                    parseInt(tier.originalPrice.annually.slice(1))) *
                                                                    100
                                                            )}
                                                            %
                                                        </span>
                                                    </p>
                                                )}
                                            </div>

                                            {/* CTA Button */}
                                            <button className={classNames('mb-6 w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-all duration-200', colors.button)}>
                                                {tier.name === t('pricing.plan_free') ? t('pricing.button_get_started') : t('pricing.button_upgrade')}
                                            </button>

                                            {/* Features */}
                                            <div className="flex-1">
                                                <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-500">What&apos;s included:</p>
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

                {/* FAQ Section */}
                <section className="bg-gradient-to-b from-slate-50 to-white py-16">
                    <div className="mx-auto px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">{t('pricing.faq_title')}</h2>
                            <p className="text-lg text-gray-600">Everything you need to know about our pricing</p>
                        </div>
                        <div className="mx-auto max-w-3xl space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="rounded-xl border border-gray-200 bg-white">
                                    <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between px-6 py-4 text-left">
                                        <span className="font-semibold text-gray-900">{faq.question}</span>
                                        <HelpCircle className={classNames('h-5 w-5 text-gray-400 transition-transform', openFaq === index && 'rotate-180')} />
                                    </button>
                                    {openFaq === index && (
                                        <div className="border-t border-gray-100 px-6 py-4">
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
                    <div className="mx-auto px-6 lg:px-8">
                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                    <Shield className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">Secure & Reliable</h3>
                                <p className="text-gray-600">Bank-level security with 99.9% uptime guarantee</p>
                            </div>
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                    <Clock className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">24/7 Support</h3>
                                <p className="text-gray-600">Round-the-clock assistance whenever you need help</p>
                            </div>
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                                    <Users className="h-8 w-8 text-purple-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">Trusted by 100+</h3>
                                <p className="text-gray-600">Join hundreds of businesses across Bangladesh</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 py-20">
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="relative mx-auto px-4 text-center sm:px-6 lg:px-8">
                        <h2 className="mb-6 text-4xl font-bold text-white">{t('pricing.cta_title')}</h2>
                        <p className="mb-8 text-xl text-blue-100">{t('pricing.cta_desc')}</p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <button className="group flex transform items-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl transition-all hover:scale-105 hover:bg-gray-100">
                                {t('pricing.cta_button')}
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </button>
                            <button className="rounded-full border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white hover:text-blue-600">
                                {t('pricing.button_contact')}
                            </button>
                        </div>
                        <div className="mt-6 text-sm text-blue-100">{t('pricing.guarantee_list')}</div>
                    </div>
                </section>
            </div>
            <Footer />
        </MainLayout>
    );
}
