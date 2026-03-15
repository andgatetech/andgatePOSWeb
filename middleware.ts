import { NextRequest, NextResponse } from 'next/server';
import { canAccessRoute, findMatchingRouteKey, normalizeRoutePath } from './lib/permissions';

// 🔹 Decode permissions cookie safely
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

    // 🚫 Skip static files and API routes
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // 🌍 Detect language (BD → Bangla, otherwise English)
    const country = request.geo?.country || 'US';
    const lang = country === 'BD' ? 'bn' : 'en';
    const currentLang = request.cookies.get('i18nextLng')?.value;
    const response = NextResponse.next();

    if (!currentLang || currentLang !== lang) {
        response.cookies.set('i18nextLng', lang, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
        });
    }

    // 🔑 Extract user info from cookies
    const token = request.cookies.get('token')?.value;
    const role = request.cookies.get('role')?.value || null;
    const permissions = decodePermissionsCookie(request.cookies.get('permissions')?.value);
    const normalizedPath = normalizeRoutePath(pathname);

    // 1️⃣ Redirect logged-in users away from login
    if (token && normalizedPath === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 2️⃣ Redirect guests trying to access private routes
    if (!token && normalizedPath !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (normalizedPath === '/login') {
        return response;
    }

    // 3️⃣ Enforce permission-based access
    const matchedRoute = findMatchingRouteKey(normalizedPath);
    if (!matchedRoute || !canAccessRoute(role, permissions, matchedRoute)) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // ✅ Allow access
    return response;
}

// ✅ Only apply middleware to protected areas
export const config = {
    matcher: [
        '/login',
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
