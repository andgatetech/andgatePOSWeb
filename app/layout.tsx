import ProviderComponent from '@/components/layouts/provider-component';
import { BD_KEYWORDS, getAppUrl } from '@/lib/seo-config';
import { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import Script from 'next/script';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/tailwind.css';
import './globals.css';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    metadataBase: new URL(getAppUrl()),
    title: {
        template: '%s | AndgatePOS',
        default: 'AndgatePOS — #1 POS Software in Bangladesh | বাংলাদেশের সেরা POS সফটওয়্যার',
    },
    description:
        'AndgatePOS is Bangladesh\'s leading POS software for retail shops, grocery stores, pharmacies, and fashion stores. Manage inventory, billing, purchase orders, 20+ reports, and get a free Hawkeri online store. Start free today!',
    keywords: BD_KEYWORDS,
    authors: [{ name: 'Andgate Technologies', url: BASE_URL }],
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
        locale: 'en_BD',
        alternateLocale: ['bn_BD'],
        url: BASE_URL,
        siteName: 'AndgatePOS',
        title: 'AndgatePOS — #1 POS Software in Bangladesh',
        description:
            'Complete POS solution for Bangladesh businesses. Inventory management, billing, purchase orders, 20+ reports, and a free online store powered by Hawkeri. Used by 100+ shop owners across Bangladesh.',
        images: [
            {
                url: '/images/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'AndgatePOS — POS Software Bangladesh',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AndgatePOS — #1 POS Software in Bangladesh',
        description:
            'Complete POS solution for Bangladesh businesses. Inventory, billing, reports, and a free online store. Start free today!',
        images: ['/images/og-image.jpg'],
        creator: '@andgatetech',
    },
    verification: {
        google: 'your-google-site-verification-code',
    },
    alternates: {
        canonical: BASE_URL,
        languages: {
            'en-BD': BASE_URL,
            'bn-BD': `${BASE_URL}/?lang=bn`,
            'x-default': BASE_URL,
        },
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
    const softwareJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AndgatePOS',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Point of Sale System',
        operatingSystem: 'Web Browser',
        description:
            'AndgatePOS is Bangladesh\'s leading cloud POS software for retail shops, grocery stores, pharmacies, and fashion stores. Features inventory management, billing, purchase orders, 20+ business reports, staff management, and a free integrated online store powered by Hawkeri.',
        url: BASE_URL,
        inLanguage: ['en', 'bn'],
        author: {
            '@type': 'Organization',
            name: 'Andgate Technologies',
            url: BASE_URL,
            address: {
                '@type': 'PostalAddress',
                addressCountry: 'BD',
                addressLocality: 'Dhaka',
            },
        },
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'BDT',
            description: 'Free plan available. Paid plans starting from BDT 0/month.',
        },
        featureList: [
            'POS Terminal with barcode & camera scanning',
            'Inventory & stock management',
            'Purchase order lifecycle management',
            'Customer loyalty & CRM',
            'Supplier management & dues tracking',
            'Double-entry accounting & bookkeeping',
            'Expense tracking',
            '20+ business reports (sales, P&L, tax, stock, supplier dues)',
            'Multi-store management',
            'Staff roles & permissions',
            'Barcode label printing',
            'Free integrated online store (Hawkeri)',
            'Real-time notifications',
        ],
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            ratingCount: '100',
            bestRating: '5',
        },
    };

    const organizationJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Andgate Technologies',
        url: BASE_URL,
        logo: `${BASE_URL}/favicon-32x32.png`,
        description: 'Andgate Technologies builds POS and ecommerce software for businesses in Bangladesh.',
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'BD',
            addressLocality: 'Dhaka',
            addressRegion: 'Dhaka Division',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            availableLanguage: ['English', 'Bengali'],
        },
        sameAs: ['https://facebook.com/andgatetech'],
        areaServed: {
            '@type': 'Country',
            name: 'Bangladesh',
        },
    };

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#046ca9" />
                {/* Geo targeting — Bangladesh */}
                <meta name="geo.region" content="BD" />
                <meta name="geo.placename" content="Dhaka, Bangladesh" />
                <meta name="geo.position" content="23.8103;90.4125" />
                <meta name="ICBM" content="23.8103, 90.4125" />
                <meta name="language" content="English, Bengali" />
                <meta name="target" content="all" />
                <meta name="audience" content="all" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/favicon-32x32.png" />
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
                {/* GTM noscript fallback — required by Google, goes right after <body> */}
                {process.env.NEXT_PUBLIC_GTM_ID && (
                    <noscript>
                        <iframe
                            src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
                            height="0"
                            width="0"
                            style={{ display: 'none', visibility: 'hidden' }}
                        />
                    </noscript>
                )}
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

                {/* Google Tag Manager — must be inside <body> */}
                {process.env.NEXT_PUBLIC_GTM_ID && (
                    <Script id="gtm" strategy="afterInteractive">
                        {`
                            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                            })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
                        `}
                    </Script>
                )}

                {/* Facebook Pixel — must be inside <body> */}
                {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
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
                )}
            </body>
        </html>
    );
}
