import { MetadataRoute } from 'next'
 
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
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/assets/images/logo-dark.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
    ],
  }
}