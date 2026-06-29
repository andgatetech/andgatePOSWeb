import { MetadataRoute } from 'next';
import { landingPages } from '@/lib/landing-pages';
import { highIntentPages } from '@/lib/high-intent-pages';
import { getAppUrl } from '@/lib/seo-config';
import { seoArticles } from '@/lib/seo-articles';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = getAppUrl();
    const now = new Date();

    // Public-facing pages only — authenticated/dashboard routes are excluded
    return [
        // Homepage — highest priority
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        // High-conversion public pages
        {
            url: `${baseUrl}/pricing`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.75,
        },
        {
            url: `${baseUrl}/landing`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.85,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.82,
        },
        ...seoArticles.map((article) => ({
            url: `${baseUrl}/blog/${article.slug}`,
            lastModified: new Date(article.updatedAt),
            changeFrequency: 'monthly' as const,
            priority: 0.78,
        })),
        ...landingPages.map((page) => ({
            url: `${baseUrl}/${page.slug}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: page.slug === 'pos-software-bangladesh' ? 0.95 : 0.86,
        })),
        ...landingPages.map((page) => ({
            url: `${baseUrl}/bn/${page.slug}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: page.slug === 'pos-software-bangladesh' ? 0.9 : 0.82,
        })),
        ...landingPages.map((page) => ({
            url: `${baseUrl}/landing/${page.slug}`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.45,
        })),
        ...highIntentPages.map((page) => ({
            url: `${baseUrl}${page.path}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: page.path === '/best-pos-software-bangladesh' || page.path === '/free-pos-software-bangladesh' ? 0.92 : 0.88,
        })),
        ...highIntentPages
            .filter((page) => !page.path.startsWith('/compare/'))
            .map((page) => ({
                url: `${baseUrl}/bn${page.path}`,
                lastModified: now,
                changeFrequency: 'weekly' as const,
                priority: page.path === '/best-pos-software-bangladesh' || page.path === '/free-pos-software-bangladesh' ? 0.88 : 0.84,
            })),
        // Informational public pages
        {
            url: `${baseUrl}/training`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/features/pos`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.86,
        },
        {
            url: `${baseUrl}/features/inventory`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.84,
        },
        {
            url: `${baseUrl}/features/reports`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.84,
        },
        {
            url: `${baseUrl}/promotion/pos`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.82,
        },
        {
            url: `${baseUrl}/promotion/affiliate`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.72,
        },
        {
            url: `${baseUrl}/affiliate`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.66,
        },
        {
            url: `${baseUrl}/affiliate/calculator`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.58,
        },
        {
            url: `${baseUrl}/affiliate/policies`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.52,
        },
        // Legal
        {
            url: `${baseUrl}/privacy-policy`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/terms-of-service`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/cookie-policy`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];
}
