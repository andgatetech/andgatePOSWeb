import HighIntentSeoPageView from '@/components/seo/HighIntentSeoPage';
import { comparePages, getComparePage } from '@/lib/high-intent-pages';
import { BD_KEYWORDS, getAppUrl } from '@/lib/seo-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type ComparePageProps = {
    params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
    return comparePages.map((page) => ({ slug: page.path.replace('/compare/', '') }));
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = getComparePage(slug);

    if (!page) return {};

    const baseUrl = getAppUrl();
    const url = `${baseUrl}${page.path}`;

    return {
        title: page.metaTitle,
        description: page.metaDescription,
        keywords: [page.primaryKeyword, ...page.secondaryKeywords, ...BD_KEYWORDS],
        alternates: {
            canonical: url,
        },
        openGraph: {
            type: 'website',
            locale: 'en_BD',
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

export default async function ComparePage({ params }: ComparePageProps) {
    const { slug } = await params;
    const page = getComparePage(slug);

    if (!page) notFound();

    return <HighIntentSeoPageView page={page} />;
}
