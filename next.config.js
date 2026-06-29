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
            { url: '/login', revision: null },
            { url: '/dashboard', revision: null },
            { url: '/pos', revision: null },
            { url: '/offline', revision: null },
        ],
        runtimeCaching: [
            {
                // App shell pages — lets installed PWA refresh/reopen visited pages while offline.
                // POS data still comes from the existing IndexedDB cache; this only caches HTML navigation.
                urlPattern: ({ request, url }) =>
                    request.mode === 'navigate' && url.origin === self.location.origin,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'app-pages',
                    networkTimeoutSeconds: 8,
                    expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
                },
            },
            {
                // Never cache API responses — they contain user data and depend on auth headers.
                urlPattern: /^https?:\/\/.*\/api\/.*/i,
                handler: 'NetworkOnly',
            },
            {
                // Cache-first for static assets
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?)$/i,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'static-assets',
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
        // Disable image optimization for local dev — backend runs on 127.0.0.1 which
        // Next.js blocks server-side (private IP restriction). In production, images
        // come from a real public domain so optimization works fine there.
        unoptimized: process.env.NODE_ENV === 'development',
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
        return [
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
        ];
    },
};

module.exports = withPWA(nextConfig);
