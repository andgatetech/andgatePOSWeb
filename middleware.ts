import { NextRequest, NextResponse } from 'next/server';
import { canAccessRoute, findMatchingRouteKey, normalizeRoutePath } from './lib/permissions';

const decodePermissionsCookie = (value?: string): string[] => {
    if (!value) return [];
    try {
        const decoded = JSON.parse(atob(value));
        return Array.isArray(decoded) ? decoded : [];
    } catch {
        return [];
    }
};

// Public pages that do not require authentication
const PUBLIC_PATHS = [
    '/', '/login', '/register', '/forgot-password',
    '/pricing', '/training', '/contact',
    '/privacy-policy', '/terms-of-service', '/cookie-policy',
];
const isPublicPath = (path: string) =>
    PUBLIC_PATHS.some(p => path === p || (p !== '/' && path.startsWith(p + '/')));

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // ── Language detection ──────────────────────────────────────────────────
    // Priority: existing cookie > geo detection > default 'bn'
    // Never override the user's saved preference.
    const currentLang = request.cookies.get('i18nextLng')?.value;
    let resolvedLang: string;
    if (currentLang) {
        resolvedLang = currentLang;
    } else {
        // request.geo is only populated on Vercel; undefined locally → default 'bn'
        const country = request.geo?.country;
        resolvedLang = country === 'BD' ? 'bn' : country ? 'en' : 'bn';
    }

    // Forward resolved language as a request header so Next.js server-side
    // rendering and client hydration both use the same value.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-lang', resolvedLang);

    const response = NextResponse.next({ request: { headers: requestHeaders } });

    // Persist in cookie only on first visit
    if (!currentLang) {
        response.cookies.set('i18nextLng', resolvedLang, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365,
        });
    }

    // ── Auth enforcement ────────────────────────────────────────────────────
    const token = request.cookies.get('token')?.value;
    const normalizedPath = normalizeRoutePath(pathname);

    // Logged-in users don't need the login page
    if (token && normalizedPath === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Unauthenticated users can only access public paths
    if (!token && !isPublicPath(normalizedPath)) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Allow all public paths
    if (isPublicPath(normalizedPath)) {
        return response;
    }

    // Permission check for protected routes
    const role = request.cookies.get('role')?.value || null;
    const permissions = decodePermissionsCookie(request.cookies.get('permissions')?.value);
    const matchedRoute = findMatchingRouteKey(normalizedPath);
    if (!matchedRoute || !canAccessRoute(role, permissions, matchedRoute)) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        // Public pages — included so language detection runs on every page
        '/',
        '/login',
        '/register',
        '/forgot-password',
        '/pricing',
        '/training',
        '/contact',
        '/privacy-policy',
        '/terms-of-service',
        '/cookie-policy',
        // Protected areas
        '/dashboard/:path*',
        '/profile/:path*',
        '/store/:path*',
        '/products/:path*',
        '/purchase/:path*',
        '/orders/:path*',
        '/account/:path*',
        '/expenses/:path*',
        '/reports/:path*',
        '/staff/:path*',
        '/category/:path*',
        '/brands/:path*',
        '/suppliers/:path*',
        '/pos/:path*',
        '/settings/:path*',
        '/create-adjustment/:path*',
    ],
};
