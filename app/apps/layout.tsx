import { Metadata } from 'next';

const BASE_URL = 'https://andgatebos.com';

export const metadata: Metadata = {
    title: 'Download & Install App — AndgateBOS POS for Windows, Mac, Android & iOS | অ্যাপ ডাউনলোড ও ইনস্টল',
    description:
        'Download and install the AndgateBOS App on your PC, Mac, Android tablet, or iPhone. 1-click desktop installation, lightning-fast offline billing, thermal printer support, and seamless cloud sync.',
    keywords: [
        'AndgateBOS apps',
        'Andgate POS app download',
        'POS app download Bangladesh',
        'পিওএস অ্যাপ ইনস্টল',
        'desktop POS app Windows',
        'Andgate POS Chrome app',
        'offline billing app Bangladesh',
        'retail POS app Android iOS',
    ],
    alternates: {
        canonical: `${BASE_URL}/apps`,
    },
    openGraph: {
        title: 'AndgateBOS App — Fast, Offline POS for Desktop & Mobile',
        description:
            'Install the AndgateBOS App directly on your PC, tablet, or phone with 1 click. Full offline mode, fast cashier billing, thermal receipt printing.',
        url: `${BASE_URL}/apps`,
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'AndgateBOS POS App' }],
    },
};

export default function AppsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
