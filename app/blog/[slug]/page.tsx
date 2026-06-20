import SeoArticlePage from '@/components/seo/SeoArticlePage';
import { getSeoArticle, seoArticles } from '@/lib/seo-articles';
import { BD_KEYWORDS, getAppUrl } from '@/lib/seo-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type BlogArticlePageProps = {
    params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
    return seoArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
    const { slug } = await params;
    const article = getSeoArticle(slug);

    if (!article) return {};

    const baseUrl = getAppUrl();
    const url = `${baseUrl}/blog/${article.slug}`;

    return {
        title: article.metaTitle,
        description: article.metaDescription,
        keywords: [article.primaryKeyword, ...article.secondaryKeywords, ...BD_KEYWORDS],
        alternates: {
            canonical: url,
        },
        openGraph: {
            type: 'article',
            locale: 'en_BD',
            url,
            siteName: 'AndgatePOS',
            title: article.metaTitle,
            description: article.metaDescription,
            publishedTime: article.updatedAt,
            modifiedTime: article.updatedAt,
        },
        twitter: {
            card: 'summary_large_image',
            title: article.metaTitle,
            description: article.metaDescription,
        },
    };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
    const { slug } = await params;
    const article = getSeoArticle(slug);

    if (!article) notFound();

    const baseUrl = getAppUrl();
    const pageUrl = `${baseUrl}/blog/${article.slug}`;

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.h1,
        description: article.metaDescription,
        datePublished: article.updatedAt,
        dateModified: article.updatedAt,
        inLanguage: article.primaryKeyword.includes('সফটওয়্যার') ? 'bn-BD' : 'en-BD',
        mainEntityOfPage: pageUrl,
        author: {
            '@type': 'Organization',
            name: 'Andgate Technologies',
            url: baseUrl,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Andgate Technologies',
            url: baseUrl,
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/favicon-32x32.png`,
            },
        },
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faq.map((item) => ({
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
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
            { '@type': 'ListItem', position: 3, name: article.title, item: pageUrl },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <SeoArticlePage article={article} />
        </>
    );
}
