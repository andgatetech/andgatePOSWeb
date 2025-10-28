import { NextRequest, NextResponse } from 'next/server';
import { canAccessRoute, findMatchingRouteKey, normalizeRoutePath } from './lib/permissions';

const PUBLIC_ROUTES = new Set([
  '/',
  '/features',
  '/pos-overview',
  '/pricing',
  '/training',
  '/contact',
  '/login'
].map((route) => normalizeRoutePath(route)));

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
  const { pathname } = request.nextUrl;

  // Skip static files and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // 🌍 Detect visitor country (Vercel Geo)
  const country = request.geo?.country || 'EN';
  const lang = country === 'BD' ? 'bn' : 'en';

  const currentLang = request.cookies.get('i18nextLng')?.value;

  // 🗣️ Set cookie & force reload if language differs
  if (!currentLang || currentLang !== lang) {
    const response = NextResponse.redirect(request.url); // redirect reloads page
    response.cookies.set('i18nextLng', lang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    return response;
  }

  // 🔒 Auth logic
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value || null;
  const permissions = decodePermissionsCookie(request.cookies.get('permissions')?.value);
  const normalizedPath = normalizeRoutePath(pathname);

  // 1️⃣ Redirect logged-in user from /login → /dashboard
  if (token && normalizedPath === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2️⃣ Guest accessing private route → redirect to /login
  if (!token && !PUBLIC_ROUTES.has(normalizedPath)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3️⃣ Check permission for authenticated user
  if (token) {
    const matchedRoute = findMatchingRouteKey(normalizedPath);
    if (!matchedRoute || !canAccessRoute(role, permissions, matchedRoute)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
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
