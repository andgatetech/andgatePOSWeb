import { NextRequest, NextResponse } from 'next/server';
import { AUTH_TOKEN_EXPIRES_AT_COOKIE, decodeAuthCookieValue, isTokenExpired } from './lib/auth-session';
import { canAccessRoute, findMatchingRouteKey, normalizeRoutePath } from './lib/permissions';

const LANGUAGE_COOKIE = 'i18nextLng';
const LANGUAGE_MAX_AGE = 60 * 60 * 24 * 365;

const decodePermissionsCookie = (value?: string): string[] => {
    if (!value) return [];
    try {
        const decoded = JSON.parse(atob(decodeAuthCookieValue(value) ?? value));
        return Array.isArray(decoded) ? decoded : [];
    } catch {
        return [];
    }
};

const clearAuthCookies = (response: NextResponse) => {
    ['token', 'role', 'permissions', AUTH_TOKEN_EXPIRES_AT_COOKIE].forEach((name) => {
        response.cookies.delete(name);
    });

    return response;
};

// Public pages that do not require authentication
const PUBLIC_PATHS = [
    '/', '/login', '/register', '/forgot-password',
    '/pricing', '/training', '/contact',
    '/privacy-policy', '/terms-of-service', '/cookie-policy',
];
const isPublicPath = (path: string) =>
    PUBLIC_PATHS.some(p => path === p || (p !== '/' && path.startsWith(p + '/')));

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // ── Language detection ──────────────────────────────────────────────────
    // Priority: existing cookie > geo detection > default 'bn'
    // Never override the user's saved preference.
    const currentLang = request.cookies.get(LANGUAGE_COOKIE)?.value;
    let resolvedLang: string;
    if (currentLang) {
        resolvedLang = currentLang;
    } else {
        // request.geo is only populated on Vercel; undefined locally → default 'bn'
        const country = (request as NextRequest & { geo?: { country?: string } }).geo?.country;
        resolvedLang = country === 'BD' ? 'bn' : country ? 'en' : 'bn';
    }

    // Forward resolved language as a request header so Next.js server-side
    // rendering and client hydration both use the same value.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-lang', resolvedLang);

    const response = NextResponse.next({ request: { headers: requestHeaders } });

    // Persist in cookie only on first visit
    if (!currentLang) {
        response.cookies.set(LANGUAGE_COOKIE, resolvedLang, {
            path: '/',
            maxAge: LANGUAGE_MAX_AGE,
            sameSite: 'lax',
        });
    }

    // ── Auth enforcement ────────────────────────────────────────────────────
    const token = request.cookies.get('token')?.value;
    const tokenExpiresAt = decodeAuthCookieValue(request.cookies.get(AUTH_TOKEN_EXPIRES_AT_COOKIE)?.value);
    const hasValidToken = Boolean(token) && !isTokenExpired(tokenExpiresAt);
    const normalizedPath = normalizeRoutePath(pathname);

    if (token && !hasValidToken) {
        if (isPublicPath(normalizedPath)) {
            return clearAuthCookies(response);
        }

        return clearAuthCookies(NextResponse.redirect(new URL('/login', request.url)));
    }

    // Logged-in users don't need the login page
    if (hasValidToken && normalizedPath === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Unauthenticated users can only access public paths
    if (!hasValidToken && !isPublicPath(normalizedPath)) {
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
        '/ecommerce/:path*',
        '/account/:path*',
        '/expenses/:path*',
        '/reports/:path*',
        '/staff/:path*',
        '/category/:path*',
        '/brand/:path*',
        '/suppliers/:path*',
        '/pos/:path*',
        '/settings/:path*',
        '/create-adjustment/:path*',
    ],
};
