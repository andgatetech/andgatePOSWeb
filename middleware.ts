import { NextRequest, NextResponse } from 'next/server';

// Public pages that can be accessed without token
const PUBLIC_ROUTES = ['/', '/features', '/pos-overview', '/pricing', '/training', '/contact', '/login'];

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // 1️⃣ Logged-in users trying to access /login → redirect to /dashboard
    if (token && pathname.toLowerCase() === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 2️⃣ Not logged-in users trying to access private pages → redirect to /login
    if (!token && !PUBLIC_ROUTES.includes(pathname.toLowerCase())) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3️⃣ All other cases → allow access
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
