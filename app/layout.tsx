import ProviderComponent from '@/components/layouts/provider-component';
import { getAppUrl } from '@/lib/seo-config';
import { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import Script from 'next/script';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/tailwind.css';
import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL(getAppUrl()),
    title: {
        template: '%s | AndgatePOS System',
        default: 'AndgatePOS - Complete Point of Sale System for Modern Businesses',
    },
    description:
        'AndgatePOS is a comprehensive point of sale system designed for modern businesses. Manage inventory, process transactions, track sales, and grow your business with our powerful POS solution.',
    keywords: ['POS system', 'point of sale', 'retail software', 'inventory management', 'business management', 'sales tracking', 'AndgatePOS', 'restaurant POS', 'retail POS', 'cloud POS'],
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
        featureList: ['Inventory Management', 'Sales Tracking', 'Customer Management', 'Report Generation', 'Multi-store Support', 'Real-time Analytics'],
    };

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#1f2937" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                {/* <Script
                id="facebook-pixel"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '1803836553585330');
                    fbq('track', 'PageView');
                    `,
                }}
                />

                <noscript>
                <img
                    height="1"
                    width="1"
                    style={{ display: 'none' }}
                    src="https://www.facebook.com/tr?id=1803836553585330&ev=PageView&noscript=1"
                    alt="facebook pixel"
                />
                </noscript> */}
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
                    {/* <WhatsAppButton /> */}
                </ProviderComponent>
                <ToastContainer position="top-right" autoClose={3000} />
            </body>

            {/* Google Analytics */}
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `}
            </Script>

            {/* Google Tag Manager */}
            <Script id="gtm" strategy="afterInteractive">
                {`
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
                `}
            </Script>

            {/* Facebook Pixel */}
            {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
                <>
                    <Script id="facebook-pixel-script" strategy="afterInteractive">
                        {`
                            !function(f,b,e,v,n,t,s)
                            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                            n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t,s)}(window, document,'script',
                            'https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
                            fbq('track', 'PageView');
                        `}
                    </Script>
                    <noscript>
                        
                        <img
                            height="1"
                            width="1"
                            style={{ display: 'none' }}
                            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`}
                            alt="facebook pixel"
                        />
                    </noscript>
                </>
            )}
        </html>
    );
}
