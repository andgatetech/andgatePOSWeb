import { BD_KEYWORDS, getAppUrl } from '@/lib/seo-config';
import type { Metadata } from 'next';

const BASE_URL = getAppUrl();

export const metadata: Metadata = {
    title: 'Inventory Management Features Bangladesh | AndgatePOS',
    description:
        'Manage stock, purchase orders, low-stock alerts, suppliers, barcode labels and multi-store inventory with AndgatePOS inventory software for Bangladesh.',
    keywords: ['inventory management software Bangladesh', 'stock management software Bangladesh', 'purchase order software Bangladesh', 'barcode inventory Bangladesh', ...BD_KEYWORDS],
    alternates: {
        canonical: `${BASE_URL}/features/inventory`,
    },
    openGraph: {
        title: 'Inventory Management Features | AndgatePOS Bangladesh',
        description: 'Real-time stock, purchase orders, supplier due, low-stock alerts and multi-store inventory control.',
        url: `${BASE_URL}/features/inventory`,
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'AndgatePOS inventory management features' }],
    },
};

export default function InventoryFeatureLayout({ children }: { children: React.ReactNode }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AndgatePOS Inventory Management',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Inventory Management Software',
        operatingSystem: 'Web Browser',
        url: `${BASE_URL}/features/inventory`,
        areaServed: { '@type': 'Country', name: 'Bangladesh' },
        description: metadata.description,
        featureList: ['Real-time stock', 'Purchase orders', 'Low-stock alerts', 'Supplier management', 'Barcode labels', 'Multi-store inventory'],
        publisher: { '@type': 'Organization', name: 'Andgate Technologies', url: 'https://andgatetech.net/' },
    };

    const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Inventory Features', item: `${BASE_URL}/features/inventory` },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
            <h1 className="sr-only">Inventory Management Features for Bangladesh Businesses</h1>
            {children}
        </>
    );
}
