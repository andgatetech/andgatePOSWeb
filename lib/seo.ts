// lib/seo.ts
import { Metadata } from 'next';
import { getAppUrl } from './seo-config';

interface SeoMetaProps {
    title: string;
    description?: string;
    keywords?: string[];
    path: string;
    image?: string;
    noIndex?: boolean;
    canonicalUrl?: string;
}

export function generateMetadata({
    title,
    description = 'AndgatePOS - Complete point of sale system for managing products, orders, customers, and business operations efficiently.',
    keywords = [],
    path,
    image = '/images/default-og-image.jpg',
    noIndex = false,
    canonicalUrl,
}: SeoMetaProps): Metadata {
    const baseUrl = getAppUrl();
    const fullUrl = `${baseUrl}${path}`;
    const canonical = canonicalUrl || fullUrl;

    const defaultKeywords = ['AndgatePOS', 'POS system', 'point of sale', 'inventory management', 'sales tracking', 'business management', 'retail software', 'restaurant POS', 'cloud POS'];

    return {
        metadataBase: new URL(baseUrl),
        title: `${title} | AndgatePOS System`,
        description,
        keywords: [...defaultKeywords, ...keywords],
        authors: [{ name: 'Andgate Technologies' }],
        creator: 'Andgate Technologies',
        publisher: 'Andgate Technologies',
        robots: {
            index: !noIndex,
            follow: !noIndex,
            googleBot: {
                index: !noIndex,
                follow: !noIndex,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        openGraph: {
            type: 'website',
            locale: 'en_US',
            url: fullUrl,
            siteName: 'AndgatePOS System',
            title: `${title} | AndgatePOS System`,
            description,
            images: [
                {
                    url: `${baseUrl}${image}`,
                    width: 1200,
                    height: 630,
                    alt: `${title} - AndgatePOS`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | AndgatePOS System`,
            description,
            images: [`${baseUrl}${image}`],
            creator: '@andgatetech',
        },
        alternates: {
            canonical: canonical,
        },
        verification: {
            google: process.env.GOOGLE_SITE_VERIFICATION,
        },
    };
}

// Predefined metadata for common pages
export const commonMetadata = {
    dashboard: {
        title: 'Dashboard',
        description: 'Monitor your business performance with comprehensive analytics, sales reports, and real-time insights on your AndgatePOS dashboard.',
        keywords: ['dashboard', 'analytics', 'business insights', 'sales reports', 'performance metrics'],
        path: '/dashboard',
    },
    products: {
        title: 'Product Management',
        description: 'Manage your inventory, add new products, track stock levels, and organize your catalog with AndgatePOS product management system.',
        keywords: ['product management', 'inventory', 'stock tracking', 'catalog management', 'product catalog'],
        path: '/apps/products',
    },
    orders: {
        title: 'Order Management',
        description: 'View, process, and manage all customer orders efficiently with comprehensive order tracking and management tools.',
        keywords: ['order management', 'order tracking', 'customer orders', 'order processing', 'sales orders'],
        path: '/apps/orders',
    },
    customers: {
        title: 'Customer Management',
        description: 'Manage customer relationships, track purchase history, loyalty programs, and customer analytics with AndgatePOS.',
        keywords: ['customer management', 'customer database', 'loyalty programs', 'customer analytics', 'CRM'],
        path: '/apps/customers',
    },
    reports: {
        title: 'Reports & Analytics',
        description: 'Generate detailed business reports, analyze sales trends, and make data-driven decisions with comprehensive analytics.',
        keywords: ['business reports', 'sales analytics', 'financial reports', 'business intelligence', 'data analysis'],
        path: '/apps/reports',
    },
    pos: {
        title: 'Point of Sale Terminal',
        description: 'Process sales transactions quickly and efficiently with our intuitive POS terminal interface designed for speed and accuracy.',
        keywords: ['POS terminal', 'sales processing', 'checkout system', 'transaction processing', 'retail terminal'],
        path: '/apps/pos',
    },
};
