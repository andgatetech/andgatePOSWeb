import ProviderComponent from '@/components/layouts/provider-component';
import OrientationLock from '@/components/layouts/OrientationLock';
import PwaStandaloneGate from '@/components/layouts/PwaStandaloneGate';
import PwaUpdateRecovery from '@/components/layouts/PwaUpdateRecovery';
import { BD_KEYWORDS, getAppUrl } from '@/lib/seo-config';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import { ToastContainer } from 'react-toastify';
import 'react-perfect-scrollbar/dist/css/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/tailwind.css';
import './globals.css';

const BASE_URL = 'https://andgatepos.com';

export const metadata: Metadata = {
    metadataBase: new URL(getAppUrl()),
    title: {
        template: '%s | AndgatePOS',
        default: 'AndgatePOS — POS Software in Bangladesh | Business OS for SMEs',
    },
    description:
        'AndgatePOS is Bangladesh-focused POS and business operating software for retail SMEs. Manage billing, inventory, CRM, supplier dues, cash closing, petty cash, staff attendance, reports, and a Hawkeri online store. Start free today!',
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
        title: 'AndgatePOS — POS Software in Bangladesh',
        description:
            'Complete POS and Business OS for Bangladesh SMEs. Billing, inventory, CRM, supplier dues, cash closing, petty cash, HR attendance, reports, and a Hawkeri online store.',
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
        title: 'AndgatePOS — POS Software in Bangladesh',
        description:
            'Complete POS and Business OS for Bangladesh businesses. Billing, stock, CRM, supplier dues, cash closing, reports, and online store. Start free today!',
        images: ['/images/og-image.jpg'],
        creator: '@andgatetech',
    },
    verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    alternates: {
        canonical: BASE_URL,
        languages: {
            'en-BD': BASE_URL,
            'bn-BD': `${BASE_URL}/bn/pos-software-bangladesh`,
            'x-default': BASE_URL,
        },
    },
    category: 'technology',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'AndgatePOS',
    },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const headerStore = await headers();
    const pathname = headerStore.get('x-pathname') || '';
    const htmlLang = pathname.startsWith('/bn') ? 'bn-BD' : 'en-BD';

    const organizationJsonLd = {
        '@context': 'https://schema.org',
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
    };

    const websiteJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'AndgatePOS',
        url: BASE_URL,
        inLanguage: ['en-BD', 'bn-BD'],
        publisher: {
            '@type': 'Organization',
            name: 'Andgate Technologies',
            url: BASE_URL,
        },
    };

    const professionalServiceJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: 'AndgatePOS',
        url: BASE_URL,
        image: `${BASE_URL}/images/og-image.jpg`,
        telephone: '+8801577303608',
        email: 'support@andgatetech.net',
        priceRange: 'Free and paid SaaS plans',
        areaServed: {
            '@type': 'Country',
            name: 'Bangladesh',
        },
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'House 34, Road 3, Block B, Aftabnagar, Badda',
            addressCountry: 'BD',
            addressLocality: 'Dhaka',
            addressRegion: 'Dhaka Division',
        },
        description: 'POS software setup, training and subscription support for Bangladeshi SMEs.',
    };

    return (
        <html lang={htmlLang} data-scroll-behavior="smooth" suppressHydrationWarning>
            <head>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceJsonLd) }} />
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no" />
                <meta name="theme-color" content="#046ca9" />
                {/* Geo targeting — Bangladesh */}
                <meta name="geo.region" content="BD" />
                <meta name="geo.placename" content="Dhaka, Bangladesh" />
                <meta name="geo.position" content="23.8103;90.4125" />
                <meta name="ICBM" content="23.8103, 90.4125" />
                <meta name="language" content="English, Bengali" />
                <meta name="target" content="all" />
                <meta name="audience" content="all" />
                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
                <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                {process.env.NODE_ENV === 'development' && (
                    <Script id="dev-service-worker-cleanup" strategy="beforeInteractive">
                        {`
                            (function () {
                                if (!('serviceWorker' in navigator)) return;

                                window.addEventListener('load', function () {
                                    Promise.all([
                                        navigator.serviceWorker.getRegistrations()
                                            .then(function (registrations) {
                                                return Promise.all(registrations.map(function (registration) {
                                                    return registration.unregister();
                                                }));
                                            }),
                                        'caches' in window
                                            ? caches.keys().then(function (keys) {
                                                return Promise.all(keys.map(function (key) {
                                                    return caches.delete(key);
                                                }));
                                            })
                                            : Promise.resolve()
                                    ]).then(function () {
                                        if (navigator.serviceWorker.controller) {
                                            window.location.reload();
                                        }
                                    }).catch(function () {});
                                });
                            })();
                        `}
                    </Script>
                )}
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
            <body suppressHydrationWarning>
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
                    <PwaStandaloneGate />
                    <PwaUpdateRecovery />
                    {children}
                    {/* <WhatsAppButton /> */}
                </ProviderComponent>
                {process.env.NODE_ENV !== 'development' && <OrientationLock />}
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
