import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'AndgatePOS',
        short_name: 'AndgatePOS',
        description: 'Complete point of sale system for modern businesses',
        start_url: '/dashboard',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#046ca9',
        icons: [
            {
                src: '/assets/images/favicon_io/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable',
            },
            {
                src: '/assets/images/favicon_io/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
            },
            {
                src: '/assets/images/favicon_io/favicon-16x16.png',
                sizes: '16x16',
                type: 'image/png',
            },
        ],
        shortcuts: [
            {
                name: 'Open POS',
                short_name: 'POS',
                description: 'Open the sales counter',
                url: '/pos',
                icons: [{ src: '/assets/images/favicon_io/android-chrome-192x192.png', sizes: '192x192' }],
            },
            {
                name: 'Dashboard',
                short_name: 'Dashboard',
                description: 'Open business dashboard',
                url: '/dashboard',
                icons: [{ src: '/assets/images/favicon_io/android-chrome-192x192.png', sizes: '192x192' }],
            },
        ],
    };
}
