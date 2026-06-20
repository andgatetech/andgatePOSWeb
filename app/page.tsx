import HomePageClient from './HomePageClient';
import { BD_KEYWORDS } from '@/lib/seo-config';
import { Metadata } from 'next';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'POS Software in Bangladesh | AndgatePOS Retail Billing & Inventory',
    description:
        'AndgatePOS is POS software in Bangladesh for retail shops, grocery stores, pharmacies, restaurants and fashion stores. Manage billing, inventory, bKash/Nagad payments, purchase orders, 20+ reports and a free online store.',
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
            'Complete POS solution for Bangladesh businesses. Inventory, billing, purchase orders, 20+ reports & a free Hawkeri online store. 100+ shop owners trust AndgatePOS.',
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
            'AndgatePOS is cloud POS software for Bangladeshi retail shops, grocery stores, pharmacies, restaurants and fashion businesses with billing, inventory, payments, reports and ecommerce.',
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
            'Sales reports',
            'Profit and loss reports',
            'Offline POS mode',
            'Free Hawkeri online store',
        ],
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'Is AndgatePOS suitable for small shops in Bangladesh?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. AndgatePOS is built for Bangladeshi retail shops, grocery stores, pharmacies, restaurants, fashion shops and multi-branch businesses.',
                },
            },
            {
                '@type': 'Question',
                name: 'Does AndgatePOS support offline selling?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. The POS workflow can keep selling during internet interruptions, queue orders locally, and sync them when the connection returns.',
                },
            },
            {
                '@type': 'Question',
                name: 'Which payment methods does AndgatePOS support?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'AndgatePOS supports cash, bKash, Nagad, Rocket, Upay, card, bank transfer, partial payment and customer due tracking.',
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
