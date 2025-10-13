import { NextRequest, NextResponse } from 'next/server';

import { canAccessRoute, findMatchingRouteKey, normalizeRoutePath } from './lib/permissions';

// Public pages that can be accessed without token
const PUBLIC_ROUTES = new Set(['/', '/features', '/pos-overview', '/pricing', '/training', '/contact', '/login'].map((route) => normalizeRoutePath(route)));

const decodePermissionsCookie = (value?: string): string[] => {
    if (!value) {
        return [];
    }

    try {
        const decoded = JSON.parse(atob(value));
        return Array.isArray(decoded) ? decoded : [];
    } catch (error) {
        
        return [];
    }
};

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const role = request.cookies.get('role')?.value || null;
    const permissions = decodePermissionsCookie(request.cookies.get('permissions')?.value);
    const { pathname } = request.nextUrl;
    const normalizedPath = normalizeRoutePath(pathname);

    // 1️⃣ Logged-in users trying to access /login → redirect to /dashboard
    if (token && normalizedPath === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 2️⃣ Not logged-in users trying to access private pages → redirect to /login
    if (!token && !PUBLIC_ROUTES.has(normalizedPath)) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3️⃣ Enforce permission-based access for authenticated users
    if (token) {
        const matchedRoute = findMatchingRouteKey(normalizedPath);

        if (!matchedRoute) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        if (!canAccessRoute(role, permissions, matchedRoute)) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // 4️⃣ All other cases → allow access
    return NextResponse.next();
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
