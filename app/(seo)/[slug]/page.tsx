import HighIntentSeoPageView from '@/components/seo/HighIntentSeoPage';
import LandingSeoPageView from '@/components/seo/LandingSeoPageView';
import { getHighIntentPage, highIntentPages } from '@/lib/high-intent-pages';
import { getLandingPage, landingPages } from '@/lib/landing-pages';
import { BD_KEYWORDS, getAppUrl } from '@/lib/seo-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type SeoSlugPageProps = {
    params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
    const landingSlugs = landingPages.map((page) => ({ slug: page.slug }));
    const highIntentSlugs = highIntentPages
        .filter((page) => !page.path.startsWith('/compare/') && !['/best-pos-software-bangladesh', '/free-pos-software-bangladesh'].includes(page.path))
        .map((page) => ({ slug: page.path.replace('/', '') }));

    return [...landingSlugs, ...highIntentSlugs];
}

export async function generateMetadata({ params }: SeoSlugPageProps): Promise<Metadata> {
    const { slug } = await params;
    const baseUrl = getAppUrl();
    const highIntentPage = getHighIntentPage(`/${slug}`);
    const landingPage = getLandingPage(slug);
    const page = highIntentPage ?? landingPage;

    if (!page) return {};

    const url = `${baseUrl}/${slug}`;
    const bnUrl = `${baseUrl}/bn/${slug}`;

    return {
        title: page.metaTitle,
        description: page.metaDescription,
        keywords: [page.primaryKeyword, ...page.secondaryKeywords, ...BD_KEYWORDS],
        alternates: {
            canonical: url,
            languages: {
                'en-BD': url,
                'bn-BD': bnUrl,
                'x-default': url,
            },
        },
        openGraph: {
            type: 'website',
            locale: 'en_BD',
            alternateLocale: ['bn_BD'],
            url,
            siteName: 'AndgatePOS',
            title: page.metaTitle,
            description: page.metaDescription,
            images: [{ url: page.image, width: 1200, height: 630, alt: page.title }],
        },
        twitter: {
            card: 'summary_large_image',
            title: page.metaTitle,
            description: page.metaDescription,
            images: [page.image],
        },
    };
}

export default async function SeoSlugPage({ params }: SeoSlugPageProps) {
    const { slug } = await params;
    const highIntentPage = getHighIntentPage(`/${slug}`);

    if (highIntentPage) {
        return <HighIntentSeoPageView page={highIntentPage} locale="en" />;
    }

    const landingPage = getLandingPage(slug);
    if (landingPage) {
        const baseUrl = getAppUrl();
        const pageUrl = `${baseUrl}/${landingPage.slug}`;

        const softwareSchema = {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'AndgatePOS',
            applicationCategory: 'BusinessApplication',
            applicationSubCategory: 'Point of Sale Software',
            operatingSystem: 'Web Browser',
            url: pageUrl,
            inLanguage: ['en-BD', 'bn-BD'],
            areaServed: {
                '@type': 'Country',
                name: 'Bangladesh',
            },
            description: landingPage.metaDescription,
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'BDT',
                availability: 'https://schema.org/InStock',
                description: 'Free plan available. Paid monthly plans are available for growing Bangladeshi shops.',
            },
            provider: {
                '@type': 'Organization',
                name: 'Andgate Technologies',
                url: baseUrl,
            },
            featureList: landingPage.highlights.concat(landingPage.modules.map((module) => module.title)),
        };

        const serviceSchema = {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: landingPage.title,
            serviceType: landingPage.primaryKeyword,
            provider: {
                '@type': 'Organization',
                name: 'Andgate Technologies',
                url: baseUrl,
            },
            areaServed: {
                '@type': 'Country',
                name: 'Bangladesh',
            },
            description: landingPage.intro,
            url: pageUrl,
        };

        const faqSchema = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: landingPage.faq.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.answer,
                },
            })),
        };

        const breadcrumbSchema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
                { '@type': 'ListItem', position: 2, name: landingPage.title, item: pageUrl },
            ],
        };

        return (
            <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
                <LandingSeoPageView page={landingPage} locale="en" />
            </>
        );
    }

    notFound();
}
