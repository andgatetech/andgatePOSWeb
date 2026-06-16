import { MetadataRoute } from 'next';
import { landingPages } from '@/lib/landing-pages';
import { highIntentPages } from '@/lib/high-intent-pages';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://andgatepos.com';
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
            url: `${baseUrl}/register`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/landing`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.85,
        },
        ...landingPages.map((page) => ({
            url: `${baseUrl}/landing/${page.slug}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: page.slug === 'pos-software-bangladesh' ? 0.95 : 0.86,
        })),
        ...highIntentPages.map((page) => ({
            url: `${baseUrl}${page.path}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: page.path === '/best-pos-software-bangladesh' || page.path === '/free-pos-software-bangladesh' ? 0.92 : 0.88,
        })),
        {
            url: `${baseUrl}/login`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        // Informational public pages
        {
            url: `${baseUrl}/training`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/promotion/pos`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/promotion/partner`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.72,
        },
        {
            url: `${baseUrl}/forgot-password`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
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
