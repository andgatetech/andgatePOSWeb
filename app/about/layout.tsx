import { Metadata } from 'next';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'About AndgatePOS — POS Software Company in Bangladesh',
    description:
        'AndgatePOS is built by Andgate Technologies in Dhaka, Bangladesh. Learn about our mission to help Bangladeshi retail shops, grocery stores, pharmacies and restaurants run billing, inventory and payments from one cloud platform.',
    keywords: [
        'about AndgatePOS',
        'Andgate Technologies',
        'POS software company Bangladesh',
        'AndgatePOS Dhaka',
        'AndgatePOS সম্পর্কে',
    ],
    alternates: {
        canonical: `${BASE_URL}/about`,
    },
    openGraph: {
        title: 'About AndgatePOS — POS Software Company in Bangladesh',
        description: 'Built in Dhaka by Andgate Technologies. Meet the team behind AndgatePOS and our mission for Bangladeshi retail businesses.',
        url: `${BASE_URL}/about`,
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'About AndgatePOS' }],
    },
};

const aboutPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About AndgatePOS',
    url: `${BASE_URL}/about`,
    mainEntity: {
        '@type': 'Organization',
        name: 'Andgate Technologies',
        url: BASE_URL,
        logo: `${BASE_URL}/favicon-32x32.png`,
        description: 'Andgate Technologies builds POS and ecommerce software for businesses in Bangladesh.',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'House 34, Road 3, Block B, Aftabnagar, Badda',
            addressCountry: 'BD',
            addressLocality: 'Dhaka',
            addressRegion: 'Dhaka Division',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+8801577303608',
            email: 'support@andgatetech.net',
            contactType: 'customer support',
            availableLanguage: ['English', 'Bengali'],
        },
        sameAs: ['https://www.facebook.com/andgatepos'],
        areaServed: {
            '@type': 'Country',
            name: 'Bangladesh',
        },
    },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }} />
            {children}
        </>
    );
}
