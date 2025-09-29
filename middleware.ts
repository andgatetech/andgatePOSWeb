import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Public pages
const PUBLIC_ROUTES = ['/', '/features', '/pos-overview', '/pricing', '/training', '/contact', '/login'];

// Role-based allowed routes
const ROLE_ROUTES: Record<string, string[]> = {
    store_admin: ['*'], // full access
    supplier: ['/supplier', '/supplier/purchase', '/supplierproducts'],
    staff: ['/products', '/purchase', '/createpurchase', '/pos', '/orders'], // add /orders
};

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const role = request.cookies.get('role')?.value;
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (PUBLIC_ROUTES.includes(pathname.toLowerCase())) {
        return NextResponse.next();
    }

    // Require login for everything else
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based access
    if (role && ROLE_ROUTES[role]) {
        const allowedRoutes = ROLE_ROUTES[role];

        if (allowedRoutes.includes('*')) return NextResponse.next();

        const hasAccess = allowedRoutes.some((r) => pathname.toLowerCase().startsWith(r.toLowerCase()));

        if (hasAccess) return NextResponse.next();

        // Redirect based on role
        switch (role) {
            case 'supplier':
                return NextResponse.redirect(new URL('/supplier', request.url));
            case 'staff':
                return NextResponse.redirect(new URL('/products', request.url));
            default:
                return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Default redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
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
