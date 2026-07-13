import type { Metadata } from 'next';
import UserGuideClient from './UserGuideClient';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'AndgateBOS User Guide | Complete Business OS Training',
    description: 'Step-by-step AndgateBOS Business OS guide for Bangladeshi SME business owners, managers, cashiers, inventory teams, HR teams, ecommerce operators, and accountants.',
    keywords: [
        'AndgateBOS user guide',
        'POS software guide Bangladesh',
        'business software user guide',
        'SME Business OS guide',
        'পিওএস সফটওয়্যার গাইড',
    ],
    alternates: {
        canonical: `${BASE_URL}/user-guide`,
    },
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: 'AndgateBOS User Guide',
        description:
            'Complete step-by-step Business OS guide for Bangladesh SME owners, managers, cashiers, inventory teams, ecommerce operators and accountants.',
        url: `${BASE_URL}/user-guide`,
        type: 'article',
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'AndgateBOS User Guide' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AndgateBOS User Guide',
        description: 'Step-by-step AndgateBOS guide for Bangladesh SME business operations.',
        images: ['/images/og-image.jpg'],
    },
};

export default function UserGuidePage() {
    return <UserGuideClient />;
}
