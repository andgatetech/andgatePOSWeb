// import { NextRequest, NextResponse } from 'next/server';

// import { canAccessRoute, findMatchingRouteKey, normalizeRoutePath } from './lib/permissions';

// // Public pages that can be accessed without token
// const PUBLIC_ROUTES = new Set(['/', '/features', '/pos-overview', '/pricing', '/training', '/contact', '/login'].map((route) => normalizeRoutePath(route)));

// const decodePermissionsCookie = (value?: string): string[] => {
//     if (!value) {
//         return [];
//     }

//     try {
//         const decoded = JSON.parse(atob(value));
//         return Array.isArray(decoded) ? decoded : [];
//     } catch (error) {
//         return [];
//     }
// };

// export function middleware(request: NextRequest) {
//     const { geo } = request;
//     const country = geo?.country || 'BD';
//     const response = NextResponse.next();
//     // 🔹 Language auto detect and set cookie
//     const lang = country === 'BD' ? 'bn' : 'en';
//     const currentLang = request.cookies.get('i18nextLng')?.value;

//     // যদি ইউজারের কুকিতে ভাষা আগে থেকে সেট না থাকে, তাহলে নতুন করে সেট করো
//     if (!currentLang || currentLang !== lang) {
//         response.cookies.set('i18nextLng', lang, {
//             path: '/',
//             maxAge: 60 * 60 * 24 * 365, // ১ বছর
//         });
//     }
//     const token = request.cookies.get('token')?.value;
//     const role = request.cookies.get('role')?.value || null;
//     const permissions = decodePermissionsCookie(request.cookies.get('permissions')?.value);
//     const { pathname } = request.nextUrl;
//     const normalizedPath = normalizeRoutePath(pathname);

//     if (!pathname.startsWith('/bn') && !pathname.startsWith('/en') && PUBLIC_ROUTES.has(normalizeRoutePath(pathname))) {
//         const localizedUrl = request.nextUrl.clone();
//         localizedUrl.pathname = `/${lang}${pathname}`;
//         return NextResponse.redirect(localizedUrl);
//     }

//     // 1️⃣ Logged-in users trying to access /login → redirect to /dashboard
//     if (token && normalizedPath === '/login') {
//         return NextResponse.redirect(new URL('/dashboard', request.url));
//     }

//     // 2️⃣ Not logged-in users trying to access private pages → redirect to /login
//     if (!token && !PUBLIC_ROUTES.has(normalizedPath)) {
//         return NextResponse.redirect(new URL('/login', request.url));
//     }

//     // 3️⃣ Enforce permission-based access for authenticated users
//     if (token) {
//         const matchedRoute = findMatchingRouteKey(normalizedPath);

//         if (!matchedRoute) {
//             return NextResponse.redirect(new URL('/login', request.url));
//         }

//         if (!canAccessRoute(role, permissions, matchedRoute)) {
//             return NextResponse.redirect(new URL('/login', request.url));
//         }
//     }

//     // 4️⃣ All other cases → allow access
//     return response;
// }

import { NextRequest, NextResponse } from 'next/server';
import { canAccessRoute, findMatchingRouteKey, normalizeRoutePath } from './lib/permissions';

const PUBLIC_ROUTES = new Set(['/', '/features', '/pos-overview', '/pricing', '/training', '/contact', '/login'].map((route) => normalizeRoutePath(route)));

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
    const country = request.geo?.country;
    const lang = country === 'BD' ? 'bn' : 'en';
    const currentLang = request.cookies.get('i18nextLng')?.value;

    const response = NextResponse.next();

    // 🔹 Only set if cookie missing or different
    if (!currentLang || currentLang !== lang) {
        response.cookies.set('i18nextLng', lang, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
        });
    }

    const token = request.cookies.get('token')?.value;
    const role = request.cookies.get('role')?.value || null;
    const permissions = decodePermissionsCookie(request.cookies.get('permissions')?.value);
    const { pathname } = request.nextUrl;
    const normalizedPath = normalizeRoutePath(pathname);

    // ✅ Auto redirect to localized path (only for public pages)
    if (!pathname.startsWith('/bn') && !pathname.startsWith('/en') && PUBLIC_ROUTES.has(normalizedPath)) {
        const localizedUrl = request.nextUrl.clone();
        localizedUrl.pathname = `/${lang}${pathname}`;
        return NextResponse.redirect(localizedUrl);
    }

    // 1️⃣ Redirect logged-in user from /login → /dashboard
    if (token && normalizedPath === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 2️⃣ Guest accessing private route → redirect to /login
    if (!token && !PUBLIC_ROUTES.has(normalizedPath)) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3️⃣ Permission-based access check
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
