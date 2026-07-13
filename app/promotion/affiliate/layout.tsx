import { Metadata } from 'next';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'AndgateBOS Affiliate Program Bangladesh | Business Software Commission',
    description: 'Join the AndgateBOS Affiliate Program in Bangladesh. Get training, show Business OS and POS demos to SME owners, convert paid subscriptions, and earn verified commission.',
    keywords: [
        'AndgateBOS affiliate program',
        'business software affiliate Bangladesh',
        'POS software affiliate Bangladesh',
        'SME software reseller Bangladesh',
        'software commission program Bangladesh',
        'AndgateBOS affiliate',
        'POS affiliate Bangladesh',
        'সফটওয়্যার অ্যাফিলিয়েট প্রোগ্রাম বাংলাদেশ',
    ],
    alternates: {
        canonical: `${BASE_URL}/promotion/affiliate`,
    },
    openGraph: {
        title: 'AndgateBOS Affiliate Program Bangladesh',
        description: 'Register free, take training, show Business OS demos to SME owners, and earn commission from successful paid subscriptions.',
        url: `${BASE_URL}/promotion/affiliate`,
        images: [{ url: '/images/ads/andgatepos-affiliate-facebook-ad-real-logo.png', width: 1200, height: 630, alt: 'AndgateBOS Affiliate Program Bangladesh' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AndgateBOS Affiliate Program Bangladesh',
        description: 'Earn commission by helping Bangladeshi SME owners adopt AndgateBOS.',
        images: ['/images/ads/andgatepos-affiliate-facebook-ad-real-logo.png'],
    },
};

export default function PromotionAffiliateLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
