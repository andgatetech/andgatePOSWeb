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
};

module.exports = nextConfig;
