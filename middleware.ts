// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const role = request.cookies.get('role')?.value; // set this at login from localStorage
    const { pathname } = request.nextUrl;

    const publicRoutes = ['/', '/login', '/register'];

    // Allow public routes
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Require login for protected routes
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Admin can access everything in matcher
    if (role === 'admin') {
        return NextResponse.next();
    }

    // Supplier can ONLY access /apps/supplier
    if (role === 'supplier') {
        if (pathname.startsWith('/apps/supplier')) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // For all other roles, deny access
    return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
    matcher: ['/dashboard/:path*', '/profile/:path*', '/admin/:path*', '/components/:path*', '/dashboard', '/apps/:path*', '/apps'],
};
