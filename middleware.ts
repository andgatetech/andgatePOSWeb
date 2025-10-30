import { NextRequest, NextResponse } from 'next/server';
import {
  canAccessRoute,
  findMatchingRouteKey,
  normalizeRoutePath,
} from './lib/permissions';
import { getTranslation } from '@/i18n';

const PUBLIC_ROUTES = new Set(
  [
    '/',
    '/features',
    '/pos-overview',
    '/pricing',
    '/training',
    '/contact',
    '/login',
  ].map((route) => normalizeRoutePath(route))
);

const decodePermissionsCookie = (value?: string): string[] => {
  if (!value) return [];
  try {
    const decoded = JSON.parse(atob(value));
    return Array.isArray(decoded) ? decoded : [];
  } catch {
    return [];
  }
};

export function middleware(request: NextRequest) {
  const { i18n } = getTranslation();
  const { pathname } = request.nextUrl;

  // 🚫 Skip static and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 🌍 Detect language based on Geo-IP
  const country = request.geo?.country || 'US';
  const lang = country === 'BD' ? 'bn' : 'en';
  const currentLang = request.cookies.get('i18nextLng')?.value;

  console.log(`Middleware detected country: ${country}, setting language to: ${lang}`);

  const response = NextResponse.next();

  // 🌐 Set language cookie if not set or different
  if (!currentLang || currentLang !== lang) {
    // ⚠️ Middleware runs in Edge Runtime (no i18n context here)
    // So calling i18n.changeLanguage() will fail.
    // You should only set the cookie and handle i18n client-side or via server component.
    response.cookies.set('i18nextLng', lang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value || null;
  const permissions = decodePermissionsCookie(
    request.cookies.get('permissions')?.value
  );
  const normalizedPath = normalizeRoutePath(pathname);

  // 🔒 Redirect logged-in user away from login page
  if (token && normalizedPath === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 🔐 Guest accessing private route → redirect to login
  if (!token && !PUBLIC_ROUTES.has(normalizedPath)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 🧩 Permission-based access check for authenticated users
  if (token) {
    const matchedRoute = findMatchingRouteKey(normalizedPath);
    if (!matchedRoute || !canAccessRoute(role, permissions, matchedRoute)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/supplier/:path*',
    '/products/:path*',
    '/purchase/:path*',
    '/createpurchase/:path*',
    '/pos/:path*',
    '/orders/:path*',
    '/account/:path*',
    '/store/:path*',
    '/settings/:path*',
    '/staff/:path*',
    '/create-adjustment/:path*',
    '/category/:path*',
    '/brands/:path*',
    '/suppliers/:path*',
    '/expenses/:path*',
    '/reports/:path*',
  ],
};
