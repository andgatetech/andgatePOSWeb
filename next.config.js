/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'localhost',
            '127.0.0.1',
            'images.unsplash.com',
            'pos.api.andgatetech.net',
            'img.youtube.com', // for youtube thumbnails
            'pos.api.andgatetech.net', // ✅ Added API domain
        ],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '8000',
                pathname: '/storage/**',
            },
            {
                protocol: 'https',
                hostname: 'pos.api.andgatetech.net',
                pathname: '/storage/**', // ✅ Allow Laravel storage images
            },
        ],
    },
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // SEO and Performance optimizations
    poweredByHeader: false,
    compress: true,
    generateEtags: true,
    // Security headers for better SEO
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    }
                ]
            }
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
                source: '/pos',
                destination: '/apps/pos',
                permanent: true,
            },
        ];
    },
};

module.exports = nextConfig;
