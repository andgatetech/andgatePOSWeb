const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: false,
    reloadOnOnline: false,
    publicExcludes: [
        '!assets/**/*',
        '!demo-prepare.html',
    ],
    fallbacks: {
        document: '/offline',
    },
    workboxOptions: {
        disableDevLogs: true,
        additionalManifestEntries: [
            { url: '/dashboard', revision: null },
            { url: '/pos', revision: null },
            { url: '/offline', revision: null },
        ],
        runtimeCaching: [
            {
                // Auth pages must always come from the network. Serving an old
                // HTML shell with newer/older chunks can leave login blank.
                urlPattern: ({ request, url }) =>
                    request.mode === 'navigate' &&
                    url.origin === self.location.origin &&
                    ['/login', '/forgot-password', '/reset-password', '/register'].includes(url.pathname),
                handler: 'NetworkOnly',
            },
            {
                // App shell pages — lets installed PWA refresh/reopen visited pages while offline.
                // POS data still comes from the existing IndexedDB cache; this only caches HTML navigation.
                urlPattern: ({ request, url }) =>
                    request.mode === 'navigate' && url.origin === self.location.origin,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'app-pages',
                    networkTimeoutSeconds: 8,
                    cacheableResponse: { statuses: [200] },
                    expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
                },
            },
            {
                // Never cache API responses — they contain user data and depend on auth headers.
                urlPattern: /^https?:\/\/.*\/api\/.*/i,
                handler: 'NetworkOnly',
            },
            {
                // Cache public static assets only. Do not cache API/storage
                // media here because product/customer files can be tenant data.
                urlPattern: ({ request, url }) =>
                    ['image', 'font'].includes(request.destination) &&
                    url.origin === self.location.origin &&
                    !url.pathname.startsWith('/storage/'),
                handler: 'CacheFirst',
                options: {
                    cacheName: 'static-assets',
                    cacheableResponse: { statuses: [200] },
                    expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
                },
            },
        ],
    },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingRoot: __dirname,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production'
    },
    turbopack: {
        root: __dirname,
    },
    images: {
        // Serve modern formats (WebP/AVIF) automatically
        formats: ['image/avif', 'image/webp'],
        // Disable image optimization globally to prevent hitting Vercel's Image Optimization limits.
        // With 7000+ products, Vercel will quickly return OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED
        // if this is enabled in production.
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'pos.api.andgatetech.net',
            },
            {
                protocol: 'https',
                hostname: 'img.youtube.com',
            },
            {
                protocol: 'https',
                hostname: 'api.andgatepos.com',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '8000',
                pathname: '/storage/**',
            },
            {
                protocol: 'https',
                hostname: 'api.andgatepos.com',
                pathname: '/storage/**',
            },
        ],
    },
    reactStrictMode: true,
    typescript: {
        ignoreBuildErrors: true,
    },
    // SEO and Performance optimizations
    poweredByHeader: false,
    compress: true,
    generateEtags: true,
    async headers() {
        const noIndexHeaders = [
            { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ];
        const privateRouteSources = [
            '/account/:path*',
            '/accounting/:path*',
            '/analytics/:path*',
            '/audit-logs',
            '/brand/:path*',
            '/business-os/:path*',
            '/cash-closing',
            '/cash-drawer/:path*',
            '/category/:path*',
            '/company/:path*',
            '/compliance-calendar',
            '/coupons/:path*',
            '/customers/:path*',
            '/dashboard/:path*',
            '/data-export',
            '/ecommerce/:path*',
            '/employees/:path*',
            '/expenses/:path*',
            '/feedbacks/:path*',
            '/fiscal-compliance',
            '/font-icons',
            '/hr/:path*',
            '/label',
            '/manual-payments',
            '/notifications/:path*',
            '/orders/:path*',
            '/pay/:path*',
            '/petty-cash',
            '/pos',
            '/products/:path*',
            '/purchases/:path*',
            '/reports/:path*',
            '/roles/:path*',
            '/service-jobs',
            '/stock-transfers',
            '/store/:path*',
            '/subscription',
            '/suppliers/:path*',
            '/unauthorized',
            '/users/:path*',
            '/login',
            '/register',
            '/forgot-password',
            '/reset-password',
            '/offline',
            '/affiliate/portal',
            '/affiliate/admin',
        ];

        return [
            ...privateRouteSources.map((source) => ({
                source,
                headers: noIndexHeaders,
            })),
            // Service workers must always revalidate. A stale SW can serve old
            // Turbopack chunks and trigger "module factory is not available".
            {
                source: '/sw.js',
                headers: [
                    { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' },
                ],
            },
            {
                source: '/workbox-:hash.js',
                headers: [
                    { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' },
                ],
            },
            {
                source: '/swe-worker-:hash.js',
                headers: [
                    { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' },
                ],
            },
            // Security headers — all pages
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(self)' },
                ],
            },
            // Long cache for public static assets (fonts, SVGs, JS/CSS under /assets)
            {
                source: '/assets/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            // Medium cache for images (1 day, revalidate after 1 hour)
            {
                source: '/images/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' },
                ],
            },
        ];
    },
    // Redirects for SEO
    async redirects() {
        return [
            {
                source: '/admin',
                destination: '/dashboard',
                permanent: true,
            },
            {
                // Dashboard Widgets moved from Analytics & BI to Store settings (2026-07-16) —
                // it's a layout preference, not an analytics/report view.
                source: '/analytics/dashboard-widgets',
                destination: '/store/dashboard-widgets',
                permanent: true,
            },
        ];
    },
};

module.exports = withPWA(nextConfig);
