import type { Metadata } from 'next';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'AndgateBOS Training Center | POS ও Business Software শেখার ভিডিও',
    description:
        'AndgateBOS Training Center থেকে POS billing, inventory, purchase, stock count, reports, ecommerce, COD reconciliation, HR, cash closing এবং Business OS workflow step by step শিখুন।',
    keywords: [
        'AndgateBOS training',
        'POS software training Bangladesh',
        'Business OS tutorial Bangladesh',
        'পিওএস সফটওয়্যার ট্রেনিং',
        'বিজনেস সফটওয়্যার শেখার ভিডিও',
        'inventory training Bangladesh',
    ],
    alternates: {
        canonical: `${BASE_URL}/training`,
    },
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: 'AndgateBOS Training Center',
        description:
            'Bangladesh SME shop owners and staff can learn AndgateBOS step by step: POS, inventory, purchase, reports, ecommerce, HR and daily operations.',
        url: `${BASE_URL}/training`,
        type: 'website',
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'AndgateBOS Training Center' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AndgateBOS Training Center',
        description: 'Step-by-step AndgateBOS video training for Bangladesh SME owners, managers and shop staff.',
        images: ['/images/og-image.jpg'],
    },
};

const trainingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: 'AndgateBOS Training Center',
    url: `${BASE_URL}/training`,
    inLanguage: ['bn-BD', 'en-BD'],
    learningResourceType: 'Tutorial',
    teaches: [
        'POS billing',
        'Inventory management',
        'Stock count',
        'Purchase and supplier management',
        'Business reports',
        'Ecommerce and COD reconciliation',
        'Cash closing',
        'SME business operations',
    ],
    audience: {
        '@type': 'Audience',
        audienceType: 'Bangladesh SME business owners, managers, cashiers and shop staff',
    },
    provider: {
        '@type': 'Organization',
        name: 'Andgate Technologies',
        url: BASE_URL,
    },
};

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(trainingJsonLd) }} />
            {children}
        </>
    );
}
