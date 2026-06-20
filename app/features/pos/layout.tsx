import { BD_KEYWORDS, getAppUrl } from '@/lib/seo-config';
import type { Metadata } from 'next';

const BASE_URL = getAppUrl();

export const metadata: Metadata = {
    title: 'POS Terminal Features | Fast Billing Software Bangladesh | AndgatePOS',
    description:
        'Explore AndgatePOS terminal features for Bangladeshi shops: barcode billing, split payments, receipt printing, returns, discounts and offline POS selling.',
    keywords: ['POS terminal Bangladesh', 'barcode billing software Bangladesh', 'offline POS Bangladesh', 'retail checkout software', ...BD_KEYWORDS],
    alternates: {
        canonical: `${BASE_URL}/features/pos`,
    },
    openGraph: {
        title: 'POS Terminal Features | AndgatePOS Bangladesh',
        description: 'Fast checkout, barcode scan, payments, receipts, returns and offline selling for Bangladesh retail counters.',
        url: `${BASE_URL}/features/pos`,
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'AndgatePOS POS terminal features' }],
    },
};

export default function PosFeatureLayout({ children }: { children: React.ReactNode }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AndgatePOS POS Terminal',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Point of Sale Software',
        operatingSystem: 'Web Browser',
        url: `${BASE_URL}/features/pos`,
        areaServed: { '@type': 'Country', name: 'Bangladesh' },
        description: metadata.description,
        featureList: ['Barcode billing', 'Split payments', 'Receipt printing', 'Returns and refunds', 'Offline POS selling'],
        publisher: { '@type': 'Organization', name: 'Andgate Technologies', url: 'https://andgatetech.net/' },
    };

    const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'POS Features', item: `${BASE_URL}/features/pos` },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
            <h1 className="sr-only">POS Terminal Features for Fast Billing in Bangladesh</h1>
            {children}
        </>
    );
}
