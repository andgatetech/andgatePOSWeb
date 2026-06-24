import { Metadata } from 'next';
import Link from 'next/link';
import MainLayout from '@/components/layouts/MainLayout';

export const metadata: Metadata = {
    title: 'AndgatePOS Comparison — POS & Business OS Bangladesh',
    description: 'Compare AndgatePOS with other POS software options in Bangladesh. See POS, inventory, CRM, supplier 360, cash closing, ecommerce, reports and Bangla support.',
    keywords: 'POS software Bangladesh, compare POS, best POS Bangladesh, AndgatePOS comparison, retail POS comparison Bangladesh',
    openGraph: {
        title: 'AndgatePOS Comparison — POS & Business OS Bangladesh',
        description: 'Compare AndgatePOS with common POS choices for Bangladesh SMEs.',
    },
};

const competitors = [
    {
        name: 'AndgatePOS',
        tag: 'POS + Business OS',
        price: 'Free trial available',
        operations: 'Business OS, cash closing, petty cash, HR attendance, service jobs',
        crm: 'Customer CRM, dues, segments, loyalty, follow-ups',
        supplier: 'Supplier 360, purchase history, dues, ageing',
        accounting: 'Accounting, cash book, P&L, reports',
        ecommerce: 'Online store + courier setup',
        bangla: 'Bangla + English',
        mobile: 'Responsive web/PWA',
        cloud: 'Cloud SaaS',
        highlight: true,
    },
    {
        name: 'PridePOS',
        tag: 'Pridesys IT',
        price: 'BDT 50,000+',
        operations: 'Traditional POS/ERP workflow',
        crm: 'Depends on package',
        supplier: 'ERP/purchase workflow',
        accounting: '✅ ERP integration',
        ecommerce: '✅ E-commerce integration',
        bangla: '⚠️ Partial',
        mobile: '✅ Mobile dashboard',
        cloud: '✅ Cloud',
        highlight: false,
    },
    {
        name: 'Media Soft POS',
        tag: 'Mediasoft (25 yrs)',
        price: 'Custom quote',
        operations: 'Desktop/hybrid POS workflow',
        crm: 'Customer records',
        supplier: 'Purchase/supplier support',
        accounting: '✅ Full accounting',
        ecommerce: '⚠️ Limited',
        bangla: '⚠️ Partial',
        mobile: '⚠️ Desktop-focused',
        cloud: '⚠️ Hybrid',
        highlight: false,
    },
    {
        name: 'Odoo POS',
        tag: 'International',
        price: 'Free (Community) / Paid',
        operations: 'Requires configuration/modules',
        crm: 'CRM available in Odoo ecosystem',
        supplier: 'Purchase app available',
        accounting: '✅ Full ERP accounting',
        ecommerce: '✅ Full eCommerce',
        bangla: '❌ No Bangla',
        mobile: '✅ Mobile app',
        cloud: '✅ Cloud',
        highlight: false,
    },
    {
        name: 'PinPOS',
        tag: 'PinTech',
        price: 'Affordable (SME)',
        operations: 'POS-focused',
        crm: 'Basic/local workflow',
        supplier: 'Basic/varies',
        accounting: '⚠️ Basic',
        ecommerce: '❌ None',
        bangla: '✅ Local language',
        mobile: '✅ Mobile app',
        cloud: '✅ Cloud',
        highlight: false,
    },
    {
        name: 'Troyee POS',
        tag: 'Modern UI',
        price: 'Premium pricing',
        operations: 'POS-focused',
        crm: 'Basic/varies',
        supplier: 'Basic/varies',
        accounting: '⚠️ Basic',
        ecommerce: '❌ None',
        bangla: '⚠️ Partial',
        mobile: '✅ Mobile-friendly',
        cloud: '✅ Cloud',
        highlight: false,
    },
];

export default function ComparisonPage() {
    const rows = [
        { label: 'Price / entry point', key: 'price' as const },
        { label: 'Daily operations', key: 'operations' as const },
        { label: 'Customer CRM', key: 'crm' as const },
        { label: 'Supplier management', key: 'supplier' as const },
        { label: 'Accounting & reports', key: 'accounting' as const },
        { label: 'Ecommerce', key: 'ecommerce' as const },
        { label: 'Bangla support', key: 'bangla' as const },
        { label: 'Mobile use', key: 'mobile' as const },
        { label: 'Cloud access', key: 'cloud' as const },
    ];

    const whyAndgate = [
        {
            title: 'Business OS for SME owners',
            desc: 'Cash closing, petty cash, staff attendance and service jobs stay separate from POS checkout.',
        },
        {
            title: 'CRM + Supplier 360',
            desc: 'Customer follow-ups, dues, top buyers, supplier dues and purchase history are visible in one system.',
        },
        {
            title: 'Bangladesh-first workflow',
            desc: 'Cash, bKash, Nagad, Rocket, Upay, card, customer due and supplier due fit local shop operations.',
        },
        {
            title: 'Counter + online sales',
            desc: 'POS, inventory, ecommerce products, online orders and courier setup can run together.',
        },
    ];

    return (
        <MainLayout>
            <main className="pt-16">
                <section className="relative overflow-hidden bg-[#f6f9fc]">
                    <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#046ca9] via-[#0586cb] to-[#e79237]" />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-white" />

                    <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                        <div className="mx-auto max-w-4xl text-center">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#046ca9]/15 bg-white px-3 py-1.5 text-xs font-bold text-[#034d79] shadow-sm">
                                POS comparison for Bangladesh SMEs
                            </div>
                            <h1 className="text-4xl font-black leading-tight text-gray-950 sm:text-5xl lg:text-[3.35rem]">
                                Compare AndgatePOS with other POS options
                            </h1>
                            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-gray-600 sm:text-lg">
                                AndgatePOS is not only counter billing. It combines POS, inventory, CRM, Supplier 360,
                                cash closing, petty cash, HR attendance, service jobs, reports and ecommerce for Bangladesh SME operations.
                            </p>
                            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                <Link href="/register" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#046ca9]/20 transition hover:brightness-105">
                                    Start Free
                                </Link>
                                <Link href="/promotion/pos" className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition hover:border-[#046ca9]/30 hover:text-[#046ca9]">
                                    See Promotion Page
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white py-14 sm:py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 max-w-3xl">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">Side-by-side view</p>
                            <h2 className="mt-3 text-3xl font-black text-gray-950">Feature comparison</h2>
                            <p className="mt-3 text-sm leading-7 text-gray-600">
                                Competitor feature availability can vary by package, setup and customization. Always confirm final details before buying.
                            </p>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[980px] text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-black uppercase tracking-widest text-gray-500">
                                            <th className="sticky left-0 z-10 bg-gray-50 px-5 py-4">Area</th>
                                            {competitors.map((c) => (
                                                <th key={c.name} className={`px-4 py-4 ${c.highlight ? 'bg-[#046ca9]/8' : ''}`}>
                                                    <div className={`text-sm font-black normal-case tracking-normal ${c.highlight ? 'text-[#046ca9]' : 'text-gray-950'}`}>{c.name}</div>
                                                    <div className="mt-1 text-xs font-medium normal-case tracking-normal text-gray-400">{c.tag}</div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {rows.map((row) => (
                                            <tr key={row.label} className="align-top">
                                                <td className="sticky left-0 z-10 bg-white px-5 py-4 font-bold text-gray-800">{row.label}</td>
                                                {competitors.map((c) => (
                                                    <td key={c.name} className={`px-4 py-4 text-xs leading-6 text-gray-600 ${c.highlight ? 'bg-[#046ca9]/5 font-semibold text-gray-800' : ''}`}>
                                                        {c[row.key]}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-gray-50 py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 text-center">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#e79237]">Why AndgatePOS</p>
                            <h2 className="mt-3 text-3xl font-black text-gray-950">Built for how Bangladesh SMEs actually run</h2>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {whyAndgate.map((card) => (
                                <article key={card.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="mb-4 h-1.5 w-12 rounded-full bg-gradient-to-r from-[#046ca9] to-[#e79237]" />
                                    <h3 className="text-lg font-black text-gray-950">{card.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-gray-600">{card.desc}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-[#022d45] py-16 text-white">
                    <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
                        <h2 className="text-3xl font-black">Start with AndgatePOS free</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                            Test POS billing, stock, CRM, supplier dues and daily business controls before moving your full shop workflow.
                        </p>
                        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link href="/register" className="rounded-xl bg-white px-7 py-3 text-sm font-black text-[#046ca9] transition hover:bg-slate-100">
                                Create Free Account
                            </Link>
                            <Link href="/contact" className="rounded-xl border border-white/20 px-7 py-3 text-sm font-black text-white transition hover:bg-white/10">
                                Talk to Sales
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </MainLayout>
    );
}
