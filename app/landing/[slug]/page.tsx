import LandingSeoPageView from '@/components/seo/LandingSeoPageView';
import { getLandingPage, landingPages } from '@/lib/landing-pages';
import { BD_KEYWORDS, getAppUrl } from '@/lib/seo-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type LandingPageProps = {
    params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
    return landingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = getLandingPage(slug);

    if (!page) return {};

    const baseUrl = getAppUrl();
    const url = `${baseUrl}/${page.slug}`;

    return {
        title: page.metaTitle,
        description: page.metaDescription,
        keywords: [page.primaryKeyword, ...page.secondaryKeywords, ...BD_KEYWORDS],
        alternates: {
            canonical: url,
            languages: {
                'en-BD': url,
                'bn-BD': `${baseUrl}/bn/${page.slug}`,
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
            images: [
                {
                    url: page.image,
                    width: 1200,
                    height: 630,
                    alt: `${page.title} - AndgatePOS`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: page.metaTitle,
            description: page.metaDescription,
            images: [page.image],
        },
    };
}

export default async function LandingPage({ params }: LandingPageProps) {
    const { slug } = await params;
    const page = getLandingPage(slug);

    if (!page) notFound();

    const baseUrl = getAppUrl();
    const pageUrl = `${baseUrl}/${page.slug}`;
    const breadcrumbs = [
        { name: 'Home', url: baseUrl },
        { name: 'Landing', url: `${baseUrl}/landing` },
        { name: page.title, url: pageUrl },
    ];

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
        description: page.metaDescription,
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'BDT',
            availability: 'https://schema.org/InStock',
            description: 'Free plan available for Bangladeshi businesses.',
        },
        provider: {
            '@type': 'Organization',
            name: 'Andgate Technologies',
            url: baseUrl,
        },
        featureList: page.highlights.concat(page.modules.map((module) => module.title)),
    };

    const serviceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: page.title,
        serviceType: page.primaryKeyword,
        provider: {
            '@type': 'Organization',
            name: 'Andgate Technologies',
            url: baseUrl,
        },
        areaServed: {
            '@type': 'Country',
            name: 'Bangladesh',
        },
        description: page.intro,
        url: pageUrl,
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: page.faq.map((item) => ({
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
        itemListElement: breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <LandingSeoPageView page={page} />
        </>
    );
}
