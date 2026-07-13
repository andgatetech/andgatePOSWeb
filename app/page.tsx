import HomePageClient from './HomePageClient';
import { BD_KEYWORDS } from '@/lib/seo-config';
import { Metadata } from 'next';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'SME Business Operating System Bangladesh | AndgateBOS',
    description:
        'AndgateBOS helps Bangladesh SMEs manage POS billing, inventory, CRM, supplier dues, cash closing, reports, COD and online store operations.',
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
        title: 'AndgateBOS — SME Business Operating System Bangladesh',
        description:
            'More than POS: a complete Business OS for Bangladesh SMEs covering billing, inventory, purchase, CRM, supplier dues, cash closing, HR, reports, COD reconciliation and online store.',
        url: BASE_URL,
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'AndgateBOS — SME Business Operating System Bangladesh' }],
    },
};

export default function HomePage() {
    const softwareSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AndgateBOS',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'SME Business Operating System',
        operatingSystem: 'Web Browser',
        url: BASE_URL,
        inLanguage: ['en-BD', 'bn-BD'],
        areaServed: {
            '@type': 'Country',
            name: 'Bangladesh',
        },
        description:
            'AndgateBOS is cloud business operating software for Bangladeshi retail shops, grocery stores, pharmacies, restaurants and fashion businesses with POS billing, inventory, payments, CRM, supplier 360, cash closing, stock count approvals, COD reconciliation, fiscal readiness, reports and ecommerce.',
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
            'Business overview reports',
            'Store-by-store reporting',
            'Stock count approval',
            'COD reconciliation',
            'Fiscal readiness center',
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
                name: 'Does AndgateBOS work without internet?',
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
                    text: "Yes. Try every feature free for 14 days on our Trial plan — no credit card required. Upgrade to a paid plan only when you're ready.",
                },
            },
            {
                '@type': 'Question',
                name: 'Do I get an online store too?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes — from SME Growth and above, you get a free Hawkeri-powered online store. Products you add in your POS dashboard appear in your online store instantly.',
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
            <HomePageClient />
        </>
    );
}
