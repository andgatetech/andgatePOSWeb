import HomePageClient from './HomePageClient';
import { BD_KEYWORDS } from '@/lib/seo-config';
import { Metadata } from 'next';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'AndgatePOS — #1 POS Software in Bangladesh | বাংলাদেশের সেরা POS সফটওয়্যার',
    description:
        'AndgatePOS — Bangladesh\'s best POS software for retail shops, grocery stores, pharmacies & fashion stores. Inventory management, billing, purchase orders, 20+ reports & free online store. শুরু করুন বিনামূল্যে!',
    keywords: BD_KEYWORDS,
    alternates: {
        canonical: BASE_URL,
        languages: {
            'en-BD': BASE_URL,
            'bn-BD': `${BASE_URL}/?lang=bn`,
            'x-default': BASE_URL,
        },
    },
    openGraph: {
        title: 'AndgatePOS — #1 POS Software in Bangladesh | বাংলাদেশের সেরা POS সফটওয়্যার',
        description:
            'Complete POS solution for Bangladesh businesses. Inventory, billing, purchase orders, 20+ reports & a free Hawkeri online store. 100+ shop owners trust AndgatePOS.',
        url: BASE_URL,
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'AndgatePOS — POS Software Bangladesh' }],
    },
};

export default function HomePage() {
    return <HomePageClient />;
}
