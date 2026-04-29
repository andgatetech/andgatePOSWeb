import { Metadata } from 'next';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'Contact Us — AndgatePOS Bangladesh | যোগাযোগ করুন',
    description:
        'Get in touch with AndgatePOS. Talk to our team about POS software for your shop in Bangladesh — grocery, pharmacy, fashion, or any retail business. Free consultation. Response within 24 hours.',
    keywords: [
        'AndgatePOS contact Bangladesh',
        'POS software demo Bangladesh',
        'buy POS software Bangladesh',
        'POS software consultation Dhaka',
        'retail software support Bangladesh',
        'বিলিং সফটওয়্যার যোগাযোগ বাংলাদেশ',
    ],
    alternates: {
        canonical: `${BASE_URL}/contact`,
    },
    openGraph: {
        title: 'Contact AndgatePOS — POS Software Bangladesh',
        description:
            'Talk to the AndgatePOS team about the right POS plan for your business. Free setup consultation. Response within 24 hours.',
        url: `${BASE_URL}/contact`,
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Contact AndgatePOS Bangladesh' }],
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
