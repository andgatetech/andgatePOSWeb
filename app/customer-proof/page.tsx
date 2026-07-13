import { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3, CheckCircle2, Clock3, MapPinned, PackageCheck, ShieldCheck } from 'lucide-react';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'Customer Proof & Operating Trust | AndgateBOS',
    description: 'How AndgateBOS proves operating readiness for Bangladeshi shops: onboarding, reports, permissions, offline safeguards, COD reconciliation and fiscal-readiness controls.',
    keywords: [
        'AndgateBOS customer proof',
        'POS software trust Bangladesh',
        'business software proof Bangladesh',
        'retail software controls',
        'SME Business OS readiness',
    ],
    alternates: {
        canonical: `${BASE_URL}/customer-proof`,
    },
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: 'Customer Proof & Operating Trust | AndgateBOS',
        description:
            'Operating readiness for Bangladeshi shops: onboarding, reports, permissions, offline safeguards, COD reconciliation and fiscal-readiness controls.',
        url: `${BASE_URL}/customer-proof`,
        type: 'website',
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'AndgateBOS Customer Proof' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Customer Proof & Operating Trust | AndgateBOS',
        description: 'See how AndgateBOS supports reliable daily operations for Bangladeshi shops.',
        images: ['/images/og-image.jpg'],
    },
};

const proofItems = [
    { icon: CheckCircle2, title: 'First-sale readiness', body: 'Guided setup connects store profile, products, opening stock, payment methods and first receipt.' },
    { icon: BarChart3, title: 'Owner reporting', body: 'Business overview, sales, stock, profit, payment, COD and branch reports support store-by-store or overall decisions.' },
    { icon: ShieldCheck, title: 'Controls and auditability', body: 'Role permissions, stock-count variance approval, activity logs, package audits and fiscal-readiness records reduce uncontrolled changes.' },
    { icon: MapPinned, title: 'Bangladesh operations', body: 'MFS payment tracking, customer due, compliance reminders, courier/COD reconciliation and Bangla UI support local workflows.' },
    { icon: PackageCheck, title: 'Inventory proof', body: 'Stock count sessions help owners compare system quantity with physical count before approving inventory corrections.' },
];

const readiness = [
    'POS and order totals are calculated by backend services.',
    'Offline orders are restricted to paid cash sales with idempotency keys until advanced conflict resolution is enabled.',
    'Stock count approval posts auditable stock adjustments instead of silent inventory edits.',
    'Business overview reporting can be reviewed store by store or across the whole business.',
    'COD reconciliation connects ecommerce delivery status with unsettled courier collections.',
    'Fiscal tooling is presented as readiness infrastructure unless official certification is enabled.',
];

export default function CustomerProofPage() {
    return (
        <main className="bg-white text-slate-950">
            <section className="mx-auto grid min-h-[72vh] max-w-6xl content-center gap-8 px-5 py-16 lg:grid-cols-[1fr_420px] lg:items-center">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Operating proof</p>
                    <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">Trust is built from daily business controls, not only feature lists.</h1>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                        AndgateBOS is being hardened as a Bangladesh-focused business operating system with checkout reliability, stock-count audit trails, store-by-store owner reports, courier/COD reconciliation, compliance reminders and controlled fiscal-readiness messaging.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link href="/pricing" className="rounded-lg bg-sky-700 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-800">View Packages</Link>
                        <Link href="/contact" className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">Request Proof Call</Link>
                    </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                        <Clock3 className="h-6 w-6 text-emerald-600" />
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Activation target</p>
                            <p className="text-2xl font-bold">First sale in 15 minutes</p>
                        </div>
                    </div>
                    <div className="mt-5 space-y-3">
                        {readiness.map((item) => (
                            <div key={item} className="flex gap-3 rounded-md bg-white p-3 text-sm leading-6 text-slate-700">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-y border-slate-200 bg-slate-50 py-12">
                <div className="mx-auto grid max-w-6xl gap-4 px-5 md:grid-cols-2 lg:grid-cols-5">
                    {proofItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-5">
                                <Icon className="h-6 w-6 text-sky-700" />
                                <h2 className="mt-4 text-base font-bold">{item.title}</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                            </article>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
