import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'AndgatePOS vs Competitors — Best POS Software in Bangladesh 2026',
    description: 'Compare AndgatePOS with PridePOS, Media Soft, Odoo POS, PinPOS, and other top POS software in Bangladesh. Features, pricing, pharmacy support, AI insights comparison.',
    keywords: 'POS software Bangladesh, compare POS, best POS Bangladesh, AndgatePOS vs PridePOS, pharmacy POS Bangladesh, retail POS comparison',
    openGraph: {
        title: 'AndgatePOS vs Competitors — Best POS Software in Bangladesh',
        description: 'Compare AndgatePOS with top 10 POS systems in Bangladesh. AI-powered insights, pharmacy-ready, Bangla-first.',
    },
};

const competitors = [
    {
        name: 'AndgatePOS',
        tag: 'আমাদের',
        price: 'Free trial available',
        pharmacy: '✅ Batch, Expiry, FEFO, Generic Name',
        ai: '✅ Anomaly, Forecast, Reorder, Summary',
        accounting: '✅ Double-entry, P&L, Balance Sheet',
        ecommerce: '✅ Built-in store + Courier (Pathao, RedX)',
        vat: '⚙️ In progress',
        bangla: '✅ Full Bangla (4,400+ keys)',
        mobile: '✅ PWA (installable)',
        cloud: '✅ SaaS Cloud',
        highlight: true,
    },
    {
        name: 'PridePOS',
        tag: 'Pridesys IT',
        price: 'BDT 50,000+',
        pharmacy: '✅ Mentioned support',
        ai: '❌ None',
        accounting: '✅ ERP integration',
        ecommerce: '✅ E-commerce integration',
        vat: '✅ VAT support',
        bangla: '⚠️ Partial',
        mobile: '✅ Mobile dashboard',
        cloud: '✅ Cloud',
        highlight: false,
    },
    {
        name: 'Media Soft POS',
        tag: 'Mediasoft (25 yrs)',
        price: 'Custom quote',
        pharmacy: '✅ Supported',
        ai: '❌ None',
        accounting: '✅ Full accounting',
        ecommerce: '⚠️ Limited',
        vat: '✅ VAT support',
        bangla: '⚠️ Partial',
        mobile: '⚠️ Desktop-focused',
        cloud: '⚠️ Hybrid',
        highlight: false,
    },
    {
        name: 'Odoo POS',
        tag: 'International',
        price: 'Free (Community) / Paid',
        pharmacy: '⚠️ Via custom modules',
        ai: '❌ None',
        accounting: '✅ Full ERP accounting',
        ecommerce: '✅ Full eCommerce',
        vat: '✅ Multi-country VAT',
        bangla: '❌ No Bangla',
        mobile: '✅ Mobile app',
        cloud: '✅ Cloud',
        highlight: false,
    },
    {
        name: 'PinPOS',
        tag: 'PinTech',
        price: 'Affordable (SME)',
        pharmacy: '❌ Not mentioned',
        ai: '❌ None',
        accounting: '⚠️ Basic',
        ecommerce: '❌ None',
        vat: '⚠️ Limited',
        bangla: '✅ Local language',
        mobile: '✅ Mobile app',
        cloud: '✅ Cloud',
        highlight: false,
    },
    {
        name: 'Troyee POS',
        tag: 'Modern UI',
        price: 'Premium pricing',
        pharmacy: '❌ Not mentioned',
        ai: '❌ None',
        accounting: '⚠️ Basic',
        ecommerce: '❌ None',
        vat: '⚠️ Limited',
        bangla: '⚠️ Partial',
        mobile: '✅ Mobile-friendly',
        cloud: '✅ Cloud',
        highlight: false,
    },
];

export default function ComparisonPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero */}
            <div className="bg-gradient-to-r from-[#046ca9] to-[#034d79] py-16 text-white">
                <div className="mx-auto max-w-6xl px-4 text-center">
                    <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                        POS Software Comparison Bangladesh ২০২৬
                    </h1>
                    <p className="mx-auto mt-4 max-w-3xl text-lg text-blue-100">
                        Compare the top Point of Sale systems in Bangladesh side-by-side. See why AndgatePOS is the smartest choice for retail shops, pharmacies, and growing businesses.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link href="/login" className="rounded-xl bg-white px-6 py-3 font-semibold text-[#046ca9] shadow-lg transition hover:bg-gray-100">
                            Try Free Now
                        </Link>
                        <Link href="/promotion/pos" className="rounded-xl border-2 border-white px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                            See All Features
                        </Link>
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="mx-auto max-w-6xl px-4 py-12">
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                                <th className="px-6 py-4">Feature</th>
                                {competitors.map((c) => (
                                    <th key={c.name} className={`px-4 py-4 ${c.highlight ? 'bg-[#046ca9]/5 text-[#046ca9]' : ''}`}>
                                        <div className="font-bold text-sm text-gray-900">{c.name}</div>
                                        <div className="text-xs font-normal text-gray-400">{c.tag}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[
                                { label: 'Pricing', key: 'price' as const },
                                { label: 'Pharmacy Ready', key: 'pharmacy' as const },
                                { label: 'AI Insights', key: 'ai' as const },
                                { label: 'Accounting Module', key: 'accounting' as const },
                                { label: 'E-commerce Integration', key: 'ecommerce' as const },
                                { label: 'VAT Management', key: 'vat' as const },
                                { label: 'Bangla Language', key: 'bangla' as const },
                                { label: 'Mobile / PWA', key: 'mobile' as const },
                                { label: 'Cloud SaaS', key: 'cloud' as const },
                            ].map((row) => (
                                <tr key={row.label}>
                                    <td className="px-6 py-4 font-medium text-gray-700">{row.label}</td>
                                    {competitors.map((c) => (
                                        <td key={c.name} className={`px-4 py-4 text-xs ${c.highlight ? 'bg-[#046ca9]/5 font-semibold' : ''}`}>
                                            {c[row.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Why AndGate */}
            <div className="mx-auto max-w-6xl px-4 pb-16">
                <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
                    কেন AndgatePOS সেরা?
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { title: 'এআই ইনসাইট', desc: 'অ্যানোমালি ডিটেকশন, ডিমান্ড ফোরকাস্ট, রি-অর্ডার সাজেশন — কোনো প্রতিযোগীর নেই।', color: 'from-purple-500 to-indigo-600' },
                        { title: 'ঈ-কমার্স বিল্ট-ইন', desc: 'নিজস্ব অনলাইন স্টোর + পাঠাও, রেডএক্স কুরিয়ার ইন্টিগ্রেশন।', color: 'from-emerald-500 to-teal-600' },
                        { title: 'সম্পূর্ণ বাংলা', desc: '৪,৪০০+ অনুবাদ — দোকানদারের ভাষায়। কোনো প্রতিযোগী এতটা বাংলা সাপোর্ট করে না।', color: 'from-orange-500 to-red-600' },
                        { title: 'ফার্মেসি রেডি', desc: 'ব্যাচ, এক্সপায়ারি, FEFO, জেনেরিক নাম — ফার্মেসির জন্য তৈরি।', color: 'from-blue-500 to-cyan-600' },
                    ].map((card) => (
                        <div key={card.title} className={`rounded-2xl bg-gradient-to-br ${card.color} p-6 text-white shadow-lg`}>
                            <h3 className="text-lg font-bold">{card.title}</h3>
                            <p className="mt-2 text-sm opacity-90">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gray-900 py-12 text-center text-white">
                <h2 className="text-2xl font-bold">আজই শুরু করুন — বিনামূল্যে ট্রায়াল</h2>
                <p className="mt-2 text-gray-400">কোনো ক্রেডিট কার্ড লাগবে না। ১৪ দিনের ফ্রি ট্রায়াল।</p>
                <Link href="/login" className="mt-6 inline-block rounded-xl bg-[#046ca9] px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-[#035b8e]">
                    বিনামূল্যে শুরু করুন
                </Link>
            </div>
        </div>
    );
}
