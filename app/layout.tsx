import ProviderComponent from '@/components/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import WhatsAppButton from '@/__components/WhatsAppButton';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Script from "next/script";

export const metadata: Metadata = {
    title: {
        template: '%s | AndgatePOS System',
        default: 'AndgatePOS - Complete Point of Sale System for Modern Businesses',
    },
    description: 'AndgatePOS is a comprehensive point of sale system designed for modern businesses. Manage inventory, process transactions, track sales, and grow your business with our powerful POS solution.',
    keywords: [
        'POS system',
        'point of sale',
        'retail software',
        'inventory management',
        'business management',
        'sales tracking',
        'AndgatePOS',
        'restaurant POS',
        'retail POS',
        'cloud POS'
    ],
    authors: [{ name: 'Andgate Technologies' }],
    creator: 'Andgate Technologies',
    publisher: 'Andgate Technologies',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://andgatepos.com',
        siteName: 'AndgatePOS System',
        title: 'AndgatePOS - Complete Point of Sale System for Modern Businesses',
        description: 'Transform your business with AndgatePOS - a powerful, user-friendly point of sale system designed to streamline operations and boost productivity.',
        images: [
            {
                url: '/images/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'AndgatePOS - Point of Sale System',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AndgatePOS - Complete Point of Sale System',
        description: 'Transform your business with AndgatePOS - a powerful, user-friendly point of sale system designed to streamline operations and boost productivity.',
        images: ['/images/twitter-image.jpg'],
        creator: '@andgatetech',
    },
    verification: {
        google: 'your-google-site-verification-code',
        yandex: 'your-yandex-verification-code',
        yahoo: 'your-yahoo-site-verification-code',
    },
    alternates: {
        canonical: 'https://andgatepos.com',
    },
    category: 'technology',
};

const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AndgatePOS',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Point of Sale System',
        operatingSystem: 'Web Browser',
        description: 'A comprehensive point of sale system designed for modern businesses to manage inventory, process transactions, and track sales.',
        url: 'https://andgatepos.com',
        author: {
            '@type': 'Organization',
            name: 'Andgate Technologies',
        },
        offers: {
            '@type': 'Offer',
            category: 'SaaS',
            businessFunction: 'Sell',
        },
        featureList: [
            'Inventory Management',
            'Sales Tracking',
            'Customer Management',
            'Report Generation',
            'Multi-store Support',
            'Real-time Analytics'
        ]
    };

    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#1f2937" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/site.webmanifest" />
            </head>
            <body className={nunito.variable}>
                {/* <Script id="tawk-to-script" strategy="lazyOnload">
                {`
                    var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                    (function(){
                    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                    s1.async=true;
                    s1.src='https://embed.tawk.to/68cfdce564b9ae19220bde8f/1j5lvdo9a';
                    s1.charset='UTF-8';
                    s1.setAttribute('crossorigin','*');
                    s0.parentNode.insertBefore(s1,s0);
                    })();
                `}
            </Script> */}
                <ProviderComponent>
                    {children}
                    <WhatsAppButton />
                </ProviderComponent>
                 <ToastContainer position="top-right" autoClose={3000} />
            </body>
        </html>
    );
}
