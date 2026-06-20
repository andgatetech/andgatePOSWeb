import { BD_KEYWORDS, getAppUrl } from '@/lib/seo-config';
import type { Metadata } from 'next';

const BASE_URL = getAppUrl();

export const metadata: Metadata = {
    title: 'POS Reports & Accounting Features Bangladesh | AndgatePOS',
    description:
        'See AndgatePOS reporting features for Bangladesh businesses: sales reports, profit and loss, stock reports, tax reports, supplier due and customer analytics.',
    keywords: ['POS reports Bangladesh', 'sales report software Bangladesh', 'profit loss report POS', 'inventory report software Bangladesh', ...BD_KEYWORDS],
    alternates: {
        canonical: `${BASE_URL}/features/reports`,
    },
    openGraph: {
        title: 'POS Reports & Accounting Features | AndgatePOS Bangladesh',
        description: '20+ sales, stock, purchase, tax, customer, supplier and profit reports for Bangladeshi shops.',
        url: `${BASE_URL}/features/reports`,
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'AndgatePOS reports and analytics features' }],
    },
};

export default function ReportsFeatureLayout({ children }: { children: React.ReactNode }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AndgatePOS Reports and Accounting',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Business Reporting Software',
        operatingSystem: 'Web Browser',
        url: `${BASE_URL}/features/reports`,
        areaServed: { '@type': 'Country', name: 'Bangladesh' },
        description: metadata.description,
        featureList: ['Sales reports', 'Profit and loss', 'Stock reports', 'Tax reports', 'Supplier due reports', 'Customer analytics'],
        publisher: { '@type': 'Organization', name: 'Andgate Technologies', url: 'https://andgatetech.net/' },
    };

    const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Reports Features', item: `${BASE_URL}/features/reports` },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
            <h1 className="sr-only">POS Reports and Accounting Features for Bangladesh Businesses</h1>
            {children}
        </>
    );
}
