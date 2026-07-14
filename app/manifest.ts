import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: '/',
        name: 'AndgateBOS',
        short_name: 'AndgateBOS',
        description: 'SME Business Operating System with POS, inventory, reports and daily operations',
        start_url: '/dashboard',
        scope: '/',
        lang: 'en',
        dir: 'ltr',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#046ca9',
        categories: ['business', 'productivity', 'shopping'],
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icon-maskable-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icon-maskable-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/favicon-16x16.png',
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
                icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
            },
            {
                name: 'Dashboard',
                short_name: 'Dashboard',
                description: 'Open business dashboard',
                url: '/dashboard',
                icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
            },
        ],
        screenshots: [
            {
                src: '/images/pos.png',
                sizes: '1920x1007',
                type: 'image/png',
                form_factor: 'wide',
                label: 'POS counter',
            },
            {
                src: '/images/dashboard.png',
                sizes: '1920x2137',
                type: 'image/png',
                form_factor: 'narrow',
                label: 'Business dashboard',
            },
        ],
    } as MetadataRoute.Manifest;
}
