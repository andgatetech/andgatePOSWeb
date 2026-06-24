import HomePageClient from './HomePageClient';
import { BD_KEYWORDS } from '@/lib/seo-config';
import { Metadata } from 'next';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'POS Software in Bangladesh | AndgatePOS Retail Billing & Inventory',
    description:
        'AndgatePOS is POS and Business OS software in Bangladesh for retail shops, grocery stores, pharmacies, restaurants and fashion stores. Manage billing, inventory, CRM, supplier dues, cash closing, petty cash, bKash/Nagad payments, reports and online store.',
    keywords: BD_KEYWORDS,
    alternates: {
        canonical: BASE_URL,
        languages: {
            'en-BD': BASE_URL,
            'bn-BD': `${BASE_URL}/bn/pos-software-bangladesh`,
            'x-default': BASE_URL,
        },
    },
    openGraph: {
        title: 'POS Software in Bangladesh | AndgatePOS',
        description:
            'Complete POS and Business OS for Bangladesh businesses. Inventory, billing, CRM, supplier dues, cash closing, petty cash, reports and Hawkeri online store. 100+ shop owners trust AndgatePOS.',
        url: BASE_URL,
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'AndgatePOS — POS Software Bangladesh' }],
    },
};

export default function HomePage() {
    const softwareSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AndgatePOS',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Point of Sale Software',
        operatingSystem: 'Web Browser',
        url: BASE_URL,
        inLanguage: ['en-BD', 'bn-BD'],
        areaServed: {
            '@type': 'Country',
            name: 'Bangladesh',
        },
        description:
            'AndgatePOS is cloud POS and business operating software for Bangladeshi retail shops, grocery stores, pharmacies, restaurants and fashion businesses with billing, inventory, payments, CRM, supplier 360, cash closing, petty cash, HR attendance, service jobs, reports and ecommerce.',
        offers: {
            '@type': 'Offer',
            priceCurrency: 'BDT',
            price: '0',
            availability: 'https://schema.org/InStock',
            url: `${BASE_URL}/pricing`,
            description: 'Free plan available. Paid monthly plans are available for growing businesses.',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Andgate Technologies',
            url: 'https://andgatetech.net/',
        },
        featureList: [
            'POS billing',
            'Inventory management',
            'Barcode scanning',
            'bKash, Nagad, Rocket and cash payment tracking',
            'Purchase orders',
            'Customer CRM',
            'Supplier 360',
            'Business OS command center',
            'Cash and counter closing',
            'Petty cash management',
            'Staff attendance',
            'Service and repair jobs',
            'Sales reports',
            'Profit and loss reports',
            'Offline POS mode',
            'Hawkeri online store and courier setup',
        ],
    };

    // Kept in sync with the visible FAQ accordion (faq_q1..faq_q8 / faq_a1..faq_a8 in
    // public/locales/en.json) — mismatched JSON-LD vs visible content is a known AI/Google red flag.
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'Does AndgatePOS work without internet?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. The POS terminal works fully offline — sell, accept payments, and print receipts with no connection. Orders save locally and sync to the cloud automatically when your internet returns.',
                },
            },
            {
                '@type': 'Question',
                name: 'Does it support bKash, Nagad, and Rocket?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. bKash, Nagad, Rocket, Upay, Bank Transfer, Cash, and Card are all built in. No third-party integration or extra fees required.',
                },
            },
            {
                '@type': 'Question',
                name: 'Can I manage multiple shops?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. Add unlimited stores to one account. Switch between branches instantly, compare sales across locations, and run unified reports.',
                },
            },
            {
                '@type': 'Question',
                name: 'Do I need accounting knowledge?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'No. The system handles double-entry bookkeeping automatically. Every sale, purchase, and expense posts to the right ledger — no accounting degree needed.',
                },
            },
            {
                '@type': 'Question',
                name: 'Is there a free plan?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. The Starter plan is completely free — no credit card required, no time limit. Upgrade only when your business grows.',
                },
            },
            {
                '@type': 'Question',
                name: 'Do I get an online store too?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. Every plan includes a free Hawkeri-powered online store. Products you add in your POS dashboard appear in your online store instantly.',
                },
            },
            {
                '@type': 'Question',
                name: 'Is my data safe?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. Your data is stored securely in the cloud with 99.9% uptime. Automatic backups ensure nothing is ever lost.',
                },
            },
            {
                '@type': 'Question',
                name: 'Can I try before upgrading?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. Start with the free plan — no credit card, no commitment. Explore every feature before deciding to upgrade.',
                },
            },
        ],
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: BASE_URL,
            },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <h1 className="sr-only">POS Software in Bangladesh for Retail Billing and Inventory</h1>
            <HomePageClient />
        </>
    );
}
