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
    description = 'AndgateBOS - SME Business Operating System for managing POS billing, products, orders, customers, inventory, reports and business operations efficiently.',
    keywords = [],
    path,
    image = '/images/default-og-image.jpg',
    noIndex = false,
    canonicalUrl,
}: SeoMetaProps): Metadata {
    const baseUrl = getAppUrl();
    const fullUrl = `${baseUrl}${path}`;
    const canonical = canonicalUrl || fullUrl;
    const privateAppPrefixes = [
        '/account',
        '/accounting',
        '/analytics',
        '/audit-logs',
        '/brand',
        '/business-os',
        '/cash-closing',
        '/cash-drawer',
        '/category',
        '/company',
        '/compliance-calendar',
        '/coupons',
        '/customers',
        '/dashboard',
        '/data-export',
        '/ecommerce',
        '/employees',
        '/expenses',
        '/feedbacks',
        '/fiscal-compliance',
        '/font-icons',
        '/hr',
        '/label',
        '/manual-payments',
        '/notifications',
        '/orders',
        '/petty-cash',
        '/pos',
        '/products',
        '/purchases',
        '/reports',
        '/roles',
        '/service-jobs',
        '/stock-transfers',
        '/store',
        '/subscription',
        '/suppliers',
        '/users',
    ];
    const shouldNoIndex = noIndex || privateAppPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`/protected${prefix}`));

    const defaultKeywords = ['AndgateBOS', 'SME Business OS', 'business operating system', 'POS system', 'point of sale', 'inventory management', 'sales tracking', 'business management', 'retail software', 'cloud POS'];

    return {
        metadataBase: new URL(baseUrl),
        title: `${title} | AndgateBOS System`,
        description,
        keywords: [...defaultKeywords, ...keywords],
        authors: [{ name: 'Andgate Technologies' }],
        creator: 'Andgate Technologies',
        publisher: 'Andgate Technologies',
        robots: {
            index: !shouldNoIndex,
            follow: !shouldNoIndex,
            googleBot: {
                index: !shouldNoIndex,
                follow: !shouldNoIndex,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        openGraph: {
            type: 'website',
            locale: 'en_US',
            url: fullUrl,
            siteName: 'AndgateBOS System',
            title: `${title} | AndgateBOS System`,
            description,
            images: [
                {
                    url: `${baseUrl}${image}`,
                    width: 1200,
                    height: 630,
                    alt: `${title} - AndgateBOS`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | AndgateBOS System`,
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
        description: 'Monitor your business performance with comprehensive analytics, sales reports, and real-time insights on your AndgateBOS dashboard.',
        keywords: ['dashboard', 'analytics', 'business insights', 'sales reports', 'performance metrics'],
        path: '/dashboard',
    },
    products: {
        title: 'Product Management',
        description: 'Manage your inventory, add new products, track stock levels, and organize your catalog with AndgateBOS product management system.',
        keywords: ['product management', 'inventory', 'stock tracking', 'catalog management', 'product catalog'],
        path: '/protected/products',
    },
    orders: {
        title: 'Order Management',
        description: 'View, process, and manage all customer orders efficiently with comprehensive order tracking and management tools.',
        keywords: ['order management', 'order tracking', 'customer orders', 'order processing', 'sales orders'],
        path: '/protected/orders',
    },
    customers: {
        title: 'Customer Management',
        description: 'Manage customer relationships, track purchase history, loyalty programs, and customer analytics with AndgateBOS.',
        keywords: ['customer management', 'customer database', 'loyalty programs', 'customer analytics', 'CRM'],
        path: '/protected/customers',
    },
    reports: {
        title: 'Reports & Analytics',
        description: 'Generate detailed business reports, analyze sales trends, and make data-driven decisions with comprehensive analytics.',
        keywords: ['business reports', 'sales analytics', 'financial reports', 'business intelligence', 'data analysis'],
        path: '/protected/reports',
    },
    pos: {
        title: 'Point of Sale Terminal',
        description: 'Process sales transactions quickly and efficiently with our intuitive POS terminal interface designed for speed and accuracy.',
        keywords: ['POS terminal', 'sales processing', 'checkout system', 'transaction processing', 'retail terminal'],
        path: '/pos',
    },
};
