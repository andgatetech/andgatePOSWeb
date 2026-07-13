import { Metadata } from 'next';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'Free Business OS & POS Software Bangladesh | AndgatePOS Promotion',
    description: 'Start AndgatePOS free for your shop in Bangladesh. Manage POS billing, inventory, bKash/Nagad payments, reports, and online store from mobile or laptop.',
    keywords: [
        'free POS software Bangladesh',
        'POS software promotion Bangladesh',
        'shop billing software Bangladesh',
        'retail POS software Bangladesh',
        'AndgatePOS free account',
        'দোকানের POS সফটওয়্যার',
        'ফ্রি বিলিং সফটওয়্যার বাংলাদেশ',
    ],
    alternates: {
        canonical: `${BASE_URL}/promotion/pos`,
    },
    openGraph: {
        title: 'Free Business OS & POS Software Bangladesh | AndgatePOS',
        description: 'Open a free AndgatePOS account and start POS billing, stock tracking, payment tracking, reports and daily business operations for your shop.',
        url: `${BASE_URL}/promotion/pos`,
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'AndgatePOS free Business OS and POS software Bangladesh' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Business OS & POS Software Bangladesh | AndgatePOS',
        description: 'Start POS billing, stock, payments, reports and operations with a free AndgatePOS account.',
        images: ['/images/og-image.jpg'],
    },
};

export default function PromotionPosLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
