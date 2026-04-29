import { Metadata } from 'next';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'Pricing Plans — AndgatePOS Bangladesh | মূল্য পরিকল্পনা',
    description:
        'AndgatePOS pricing plans for Bangladesh businesses. Free plan available. Paid plans with unlimited products, multi-store, advanced reports, and free Hawkeri online store. No setup fee. Cancel anytime.',
    keywords: [
        'AndgatePOS pricing Bangladesh',
        'POS software price Bangladesh',
        'বিলিং সফটওয়্যার মূল্য বাংলাদেশ',
        'cheap POS software Bangladesh',
        'affordable POS system Bangladesh',
        'free POS software Bangladesh',
        'POS software subscription Bangladesh',
        'POS monthly plan Bangladesh',
    ],
    alternates: {
        canonical: `${BASE_URL}/pricing`,
    },
    openGraph: {
        title: 'Pricing Plans — AndgatePOS Bangladesh',
        description:
            'Simple, transparent pricing for Bangladesh shop owners. Free plan available. No setup fee. Cancel anytime. Includes free Hawkeri online store.',
        url: `${BASE_URL}/pricing`,
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'AndgatePOS Pricing Bangladesh' }],
    },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
