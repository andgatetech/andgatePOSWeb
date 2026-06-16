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
    return <HomePageClient />;
}
