import { NextRequest, NextResponse } from 'next/server';
import { AUTH_TOKEN_EXPIRES_AT_COOKIE, decodeAuthCookieValue, isTokenExpired } from './lib/auth-session';
import { canAccessRoute, findMatchingRouteKey, normalizeRoutePath } from './lib/permissions';
import { landingPages } from './lib/landing-pages';
import { highIntentPages } from './lib/high-intent-pages';

const LANGUAGE_COOKIE = 'i18nextLng';
const LANGUAGE_SOURCE_COOKIE = 'i18nextLngSource';
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
    '/pricing', '/price', '/subscription', '/training', '/user-guide', '/contact', '/promotion',
    '/affiliate', '/hawkeri', '/features', '/landing', '/blog', '/seo', '/pos-overview',
    '/training', '/demo', '/about', '/privacy-policy', '/terms-of-service', '/cookie-policy',
    // SEO route groups whose URL has no path prefix to match against (Next.js
    // route groups like `(seo)` are stripped from the URL), plus their
    // localized/comparison variants — these must stay crawlable or every
    // landing page listed in sitemap.xml 404s into a login redirect for bots.
    '/bn', '/compare',
];

// Bare top-level SEO landing slugs from app/(seo)/[slug] — derived directly
// from the same data used to build the sitemap, so this can't drift out of
// sync when a new landing/high-intent page is added.
const SEO_SLUG_PATHS = new Set([
    ...landingPages.map((page) => `/${page.slug}`),
    ...highIntentPages.filter((page) => !page.path.startsWith('/compare/')).map((page) => page.path),
]);

const isPublicPath = (path: string) =>
    SEO_SLUG_PATHS.has(path) ||
    PUBLIC_PATHS.some(p => path === p || (p !== '/' && path.startsWith(p + '/')));

const getOriginalPath = (request: NextRequest) => `${request.nextUrl.pathname}${request.nextUrl.search}`;

const getLoginRedirectUrl = (request: NextRequest) => {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', getOriginalPath(request));
    return loginUrl;
};

const getSafePostLoginPath = (request: NextRequest) => {
    const redirect = request.nextUrl.searchParams.get('redirect');
    if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
        return '/dashboard';
    }

    const redirectUrl = new URL(redirect, request.url);
    if (redirectUrl.origin !== request.nextUrl.origin) {
        return '/dashboard';
    }

    const normalizedRedirectPath = normalizeRoutePath(redirectUrl.pathname);
    if (isPublicPath(normalizedRedirectPath)) {
        return '/dashboard';
    }

    return `${redirectUrl.pathname}${redirectUrl.search}`;
};

const getRequestCountry = (request: NextRequest) => {
    return (
        request.headers.get('x-vercel-ip-country') ||
        request.headers.get('cf-ipcountry') ||
        request.headers.get('cloudfront-viewer-country') ||
        (request as NextRequest & { geo?: { country?: string } }).geo?.country ||
        ''
    ).toUpperCase();
};

const setLanguageCookie = (response: NextResponse, lang: string, source: 'auto' | 'manual') => {
    response.cookies.set(LANGUAGE_COOKIE, lang, {
        path: '/',
        maxAge: LANGUAGE_MAX_AGE,
        sameSite: 'lax',
    });
    response.cookies.set(LANGUAGE_SOURCE_COOKIE, source, {
        path: '/',
        maxAge: LANGUAGE_MAX_AGE,
        sameSite: 'lax',
    });
};

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // ── Language detection ──────────────────────────────────────────────────
    // Priority: ?lang= manual choice > saved manual choice > Bangladesh auto > default.
    const currentLang = request.cookies.get(LANGUAGE_COOKIE)?.value;
    const currentLangSource = request.cookies.get(LANGUAGE_SOURCE_COOKIE)?.value;
    const requestedLang = request.nextUrl.searchParams.get('lang');
    const validRequestedLang = requestedLang === 'bn' || requestedLang === 'en' ? requestedLang : null;
    const country = getRequestCountry(request);
    let resolvedLang = 'bn';
    let resolvedSource: 'auto' | 'manual' = 'auto';

    if (validRequestedLang) {
        resolvedLang = validRequestedLang;
        resolvedSource = 'manual';
    } else if (currentLangSource === 'manual' && (currentLang === 'bn' || currentLang === 'en')) {
        resolvedLang = currentLang;
        resolvedSource = 'manual';
    } else if (country === 'BD') {
        resolvedLang = 'bn';
    } else {
        resolvedLang = currentLang === 'en' || currentLang === 'bn'
            ? currentLang
            : (country ? 'en' : 'bn');
    }

    // Forward resolved language as a request header so Next.js server-side
    // rendering and client hydration both use the same value.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-lang', resolvedLang);

    const response = NextResponse.next({ request: { headers: requestHeaders } });

    if (validRequestedLang || currentLang !== resolvedLang || currentLangSource !== resolvedSource) {
        setLanguageCookie(response, resolvedLang, resolvedSource);
    }

    // ── Auth enforcement ────────────────────────────────────────────────────
    const token = request.cookies.get('token')?.value;
    const tokenExpiresAt = decodeAuthCookieValue(request.cookies.get(AUTH_TOKEN_EXPIRES_AT_COOKIE)?.value);
    const hasValidToken = Boolean(token) && !isTokenExpired(tokenExpiresAt);
    const normalizedPath = normalizeRoutePath(pathname);

    // Home/marketing page must stay public even if the browser has stale auth cookies.
    if (normalizedPath === '/') {
        return token && !hasValidToken ? clearAuthCookies(response) : response;
    }

    if (token && !hasValidToken) {
        if (isPublicPath(normalizedPath)) {
            return clearAuthCookies(response);
        }

        return clearAuthCookies(NextResponse.redirect(getLoginRedirectUrl(request)));
    }

    // Logged-in users don't need the login page
    if (hasValidToken && normalizedPath === '/login') {
        return NextResponse.redirect(new URL(getSafePostLoginPath(request), request.url));
    }

    // Unauthenticated users can only access public paths
    if (!hasValidToken && !isPublicPath(normalizedPath)) {
        return NextResponse.redirect(getLoginRedirectUrl(request));
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
        '/((?!_next|api|user-guide|.*\\..*).*)',
    ],
};
