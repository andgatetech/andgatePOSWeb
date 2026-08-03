import { Metadata } from 'next';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    title: 'Install App — AndgateBOS POS for Windows, Mac, Android & iOS | অ্যাপ ইনস্টল করুন',
    description:
        'Install the AndgateBOS App on your PC, Mac, Android tablet, or iPhone. 1-click desktop installation, lightning-fast offline billing, thermal printer support, and seamless cloud sync.',
    keywords: [
        'AndgateBOS app install',
        'POS app download Bangladesh',
        'পিওএস অ্যাপ ইনস্টল',
        'desktop POS app Windows',
        'Andgate POS Chrome app',
        'offline billing app Bangladesh',
        'POS software download',
        'retail POS app Android iOS',
    ],
    alternates: {
        canonical: `${BASE_URL}/install`,
    },
    openGraph: {
        title: 'Install AndgateBOS App — Fast, Offline POS for Desktop & Mobile',
        description:
            'Install the AndgateBOS App directly on your PC, tablet, or phone with 1 click. Full offline mode, fast cashier billing, thermal receipt printing.',
        url: `${BASE_URL}/install`,
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Install AndgateBOS POS App' }],
    },
};

export default function InstallLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
