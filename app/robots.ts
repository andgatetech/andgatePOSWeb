import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://andgatepos.com';
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
