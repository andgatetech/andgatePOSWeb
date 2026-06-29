import { Metadata } from 'next';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'AndgatePOS Affiliate Program Bangladesh | POS Software Commission',
    description: 'Join the AndgatePOS Affiliate Program in Bangladesh. Get training, show POS demos to shop owners, convert paid subscriptions, and earn verified commission.',
    keywords: [
        'AndgatePOS affiliate program',
        'POS software affiliate Bangladesh',
        'POS software reseller Bangladesh',
        'software commission program Bangladesh',
        'AndgatePOS affiliate',
        'POS affiliate Bangladesh',
        'সফটওয়্যার অ্যাফিলিয়েট প্রোগ্রাম বাংলাদেশ',
    ],
    alternates: {
        canonical: `${BASE_URL}/promotion/affiliate`,
    },
    openGraph: {
        title: 'AndgatePOS Affiliate Program Bangladesh',
        description: 'Register free, take training, show demos to shop owners, and earn commission from successful paid subscriptions.',
        url: `${BASE_URL}/promotion/affiliate`,
        images: [{ url: '/images/ads/andgatepos-affiliate-facebook-ad-real-logo.png', width: 1200, height: 630, alt: 'AndgatePOS Affiliate Program Bangladesh' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AndgatePOS Affiliate Program Bangladesh',
        description: 'Earn commission by helping Bangladeshi shop owners adopt AndgatePOS.',
        images: ['/images/ads/andgatepos-affiliate-facebook-ad-real-logo.png'],
    },
};

export default function PromotionAffiliateLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
