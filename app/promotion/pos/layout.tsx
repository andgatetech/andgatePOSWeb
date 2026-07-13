import { Metadata } from 'next';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'Free Business OS & POS Software Bangladesh | AndgateBOS Promotion',
    description: 'Start AndgateBOS free for your shop in Bangladesh. Manage POS billing, inventory, bKash/Nagad payments, reports, and online store from mobile or laptop.',
    keywords: [
        'free POS software Bangladesh',
        'POS software promotion Bangladesh',
        'shop billing software Bangladesh',
        'retail POS software Bangladesh',
        'AndgateBOS free account',
        'দোকানের POS সফটওয়্যার',
        'ফ্রি বিলিং সফটওয়্যার বাংলাদেশ',
    ],
    alternates: {
        canonical: `${BASE_URL}/promotion/pos`,
    },
    openGraph: {
        title: 'Free Business OS & POS Software Bangladesh | AndgateBOS',
        description: 'Open a free AndgateBOS account and start POS billing, stock tracking, payment tracking, reports and daily business operations for your shop.',
        url: `${BASE_URL}/promotion/pos`,
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'AndgateBOS free Business OS and POS software Bangladesh' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Business OS & POS Software Bangladesh | AndgateBOS',
        description: 'Start POS billing, stock, payments, reports and operations with a free AndgateBOS account.',
        images: ['/images/og-image.jpg'],
    },
};

export default function PromotionPosLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
