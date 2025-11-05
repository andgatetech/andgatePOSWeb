import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'AndgatePOS - Point of Sale System',
        short_name: 'AndgatePOS',
        description: 'Complete point of sale system for modern businesses',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4f46e5',
        icons: [
            {
                src: '/assets/images/favicon_io/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/assets/images/favicon_io/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/assets/images/favicon_io/favicon-16x16.png',
                sizes: '16x16',
                type: 'image/png',
            },
        ],
    };
}
