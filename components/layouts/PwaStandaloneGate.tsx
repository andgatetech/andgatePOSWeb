'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AUTH_TOKEN_EXPIRES_AT_COOKIE, decodeAuthCookieValue, isTokenExpired } from '@/lib/auth-session';
import { landingPages } from '@/lib/landing-pages';
import { highIntentPages } from '@/lib/high-intent-pages';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

// Marketing/SEO pages that `proxy.ts` deliberately keeps public for browser
// visitors and crawlers. When the app is launched as an installed PWA
// (display-mode: standalone), these should redirect to the app shell instead
// — an installed app has no SEO audience, so there's nothing to crawl.
// Auth pages stay reachable in the installed app; other public pages should
// hand off to the app shell instead.
const MARKETING_PATHS = [
    '/', '/pricing', '/price', '/subscription', '/training', '/contact', '/promotion',
    '/affiliate', '/features', '/landing', '/seo', '/pos-overview',
    '/privacy-policy', '/terms-of-service', '/cookie-policy',
    '/bn', '/compare',
];

const SEO_SLUG_PATHS = new Set([
    ...landingPages.map((page) => `/${page.slug}`),
    ...highIntentPages.filter((page) => !page.path.startsWith('/compare/')).map((page) => page.path),
]);

const isMarketingPath = (pathname: string) =>
    SEO_SLUG_PATHS.has(pathname) ||
    MARKETING_PATHS.some((p) => pathname === p || (p !== '/' && pathname.startsWith(`${p}/`)));

function readCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

export default function PwaStandaloneGate() {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, token, tokenExpiresAt } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

        if (!isStandalone || !isMarketingPath(pathname)) return;

        const hasToken = !!readCookie('token');
        const expiresAt = decodeAuthCookieValue(readCookie(AUTH_TOKEN_EXPIRES_AT_COOKIE));
        const hasCookieSession = hasToken && !isTokenExpired(expiresAt);
        const hasPersistedSession = isAuthenticated && !!token && !isTokenExpired(tokenExpiresAt);
        const isLoggedIn = hasCookieSession || hasPersistedSession;

        router.replace(isLoggedIn ? '/dashboard' : '/login');
    }, [isAuthenticated, pathname, router, token, tokenExpiresAt]);

    return null;
}
