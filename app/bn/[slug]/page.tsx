import HighIntentSeoPageView from '@/components/seo/HighIntentSeoPage';
import LandingSeoPageView from '@/components/seo/LandingSeoPageView';
import { getHighIntentPage, highIntentPages } from '@/lib/high-intent-pages';
import { getLandingPage, landingPages } from '@/lib/landing-pages';
import { BD_KEYWORDS, getAppUrl } from '@/lib/seo-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type BengaliSeoPageProps = {
    params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
    const landingSlugs = landingPages.map((page) => ({ slug: page.slug }));
    const highIntentSlugs = highIntentPages
        .filter((page) => !page.path.startsWith('/compare/'))
        .map((page) => ({ slug: page.path.replace('/', '') }));

    return [...landingSlugs, ...highIntentSlugs];
}

export async function generateMetadata({ params }: BengaliSeoPageProps): Promise<Metadata> {
    const { slug } = await params;
    const baseUrl = getAppUrl();
    const highIntentPage = getHighIntentPage(`/${slug}`);
    const landingPage = getLandingPage(slug);
    const page = highIntentPage ?? landingPage;

    if (!page) return {};

    const bnContent = 'bn' in page ? page.bn : null;
    const url = `${baseUrl}/bn/${slug}`;
    const enUrl = `${baseUrl}/${slug}`;

    return {
        title: bnContent?.title ? `${bnContent.title} | AndgatePOS` : page.metaTitle,
        description: page.banglaIntro,
        keywords: [page.primaryKeyword, ...page.secondaryKeywords, ...BD_KEYWORDS],
        alternates: {
            canonical: url,
            languages: {
                'en-BD': enUrl,
                'bn-BD': url,
                'x-default': enUrl,
            },
        },
        openGraph: {
            type: 'website',
            locale: 'bn_BD',
            alternateLocale: ['en_BD'],
            url,
            siteName: 'AndgatePOS',
            title: bnContent?.title ?? page.title,
            description: page.banglaIntro,
            images: [{ url: page.image, width: 1200, height: 630, alt: bnContent?.title ?? page.title }],
        },
        twitter: {
            card: 'summary_large_image',
            title: bnContent?.title ?? page.title,
            description: page.banglaIntro,
            images: [page.image],
        },
    };
}

export default async function BengaliSeoPage({ params }: BengaliSeoPageProps) {
    const { slug } = await params;
    const highIntentPage = getHighIntentPage(`/${slug}`);

    if (highIntentPage) {
        return <HighIntentSeoPageView page={highIntentPage} locale="bn" />;
    }

    const landingPage = getLandingPage(slug);
    if (landingPage) {
        return <LandingSeoPageView page={landingPage} locale="bn" />;
    }

    notFound();
}
