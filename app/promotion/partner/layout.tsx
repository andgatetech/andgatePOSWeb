import { Metadata } from 'next';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'AndgatePOS Partner Program Bangladesh | POS Software Commission',
    description: 'Join the AndgatePOS Partner Program in Bangladesh. Get training, show POS demos to shop owners, convert paid subscriptions, and earn verified commission.',
    keywords: [
        'AndgatePOS partner program',
        'POS software affiliate Bangladesh',
        'POS software reseller Bangladesh',
        'software commission program Bangladesh',
        'AndgatePOS affiliate',
        'POS partner Bangladesh',
        'সফটওয়্যার পার্টনার প্রোগ্রাম বাংলাদেশ',
    ],
    alternates: {
        canonical: `${BASE_URL}/promotion/partner`,
    },
    openGraph: {
        title: 'AndgatePOS Partner Program Bangladesh',
        description: 'Register free, take training, show demos to shop owners, and earn commission from successful paid subscriptions.',
        url: `${BASE_URL}/promotion/partner`,
        images: [{ url: '/images/ads/andgatepos-partner-facebook-ad-real-logo.png', width: 1200, height: 630, alt: 'AndgatePOS Partner Program Bangladesh' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AndgatePOS Partner Program Bangladesh',
        description: 'Earn commission by helping Bangladeshi shop owners adopt AndgatePOS.',
        images: ['/images/ads/andgatepos-partner-facebook-ad-real-logo.png'],
    },
};

export default function PromotionPartnerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
