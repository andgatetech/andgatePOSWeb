import { MetadataRoute } from 'next';
import { getAppUrl } from '@/lib/seo-config';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = getAppUrl();
    const disallow = ['/api/', '/admin/', '/private/', '/dashboard/', '/protected/', '/platform/', '/affiliate/portal', '/login', '/forgot-password', '/reset-password'];

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow,
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow,
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow,
            },
            {
                userAgent: 'GPTBot',
                allow: '/',
                disallow,
            },
            {
                userAgent: 'ChatGPT-User',
                allow: '/',
                disallow,
            },
            {
                userAgent: 'PerplexityBot',
                allow: '/',
                disallow,
            },
            {
                userAgent: 'ClaudeBot',
                allow: '/',
                disallow,
            },
            {
                userAgent: 'anthropic-ai',
                allow: '/',
                disallow,
            },
            {
                userAgent: 'CCBot',
                allow: '/',
                disallow,
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
