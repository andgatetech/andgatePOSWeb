import type { Metadata } from 'next';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'Watch AndgateBOS Demo | POS ও SME Business OS Bangladesh',
    description:
        'AndgateBOS demo দেখে বুঝুন কীভাবে POS billing, inventory, CRM, purchase, reports, ecommerce, cash closing এবং daily operations এক জায়গা থেকে চালানো যায়।',
    keywords: [
        'AndgateBOS demo',
        'POS software demo Bangladesh',
        'business software demo Bangladesh',
        'পিওএস সফটওয়্যার ডেমো',
        'retail software demo',
    ],
    alternates: {
        canonical: `${BASE_URL}/demo`,
    },
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: 'Watch AndgateBOS Demo',
        description:
            'See how Bangladesh SMEs can run POS, inventory, CRM, reports, ecommerce and operations from one Business OS.',
        url: `${BASE_URL}/demo`,
        type: 'website',
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'AndgateBOS Demo' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Watch AndgateBOS Demo',
        description: 'See AndgateBOS POS and SME Business OS workflow in action.',
        images: ['/images/og-image.jpg'],
    },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
