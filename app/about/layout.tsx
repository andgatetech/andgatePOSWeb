import { Metadata } from 'next';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'About AndgatePOS — SME Business Operating System | Bangladesh',
    description:
        'AndgatePOS is Bangladesh\'s emerging SME Business Operating System. Built by Andgate Technologies — a Product Engineering company with expertise in SaaS, AI, IoT, Cloud, and Digital Transformation. More than POS. A complete business platform.',
    keywords: [
        'about AndgatePOS',
        'Andgate Technologies',
        'SME Business Operating System',
        'business management software Bangladesh',
        'POS software company Bangladesh',
        'retail management platform',
        'AndgatePOS Dhaka',
        'business automation Bangladesh',
        'cloud POS Bangladesh',
        'digital transformation Bangladesh',
        'AndgatePOS সম্পর্কে',
    ],
    alternates: {
        canonical: `${BASE_URL}/about`,
    },
    openGraph: {
        title: 'About AndgatePOS — SME Business Operating System | Bangladesh',
        description: 'Built in Dhaka by Andgate Technologies. More than POS — a complete business operating system for Bangladeshi SMEs with AI, ecommerce, accounting, and enterprise-grade engineering.',
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
        description: 'Andgate Technologies is a Product Engineering and Digital Transformation company that builds SaaS platforms, AI systems, IoT solutions, and enterprise software. Creator of AndgatePOS and Hawkeri.',
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
        sameAs: [
            'https://www.facebook.com/andgatepos',
            'https://andgatetech.net',
            'https://www.hawkeri.com',
        ],
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
