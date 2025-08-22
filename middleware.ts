import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const role = request.cookies.get('role')?.value; // must be set as a cookie at login
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

    // ✅ Admin can access everything
    if (role === 'store_admin') {
        return NextResponse.next();
    }

    // ✅ Supplier allowed areas
    if (role === 'supplier') {
        const supplierAllowed =
            pathname.startsWith('/supplier') || pathname.startsWith('/apps/supplier') || pathname.startsWith('/apps/supplier/purchase') || pathname.startsWith('/apps/supplierProducts');

        if (supplierAllowed) {
            return NextResponse.next();
        }

        return NextResponse.redirect(new URL('/apps/supplier', request.url));
    }

    // ✅ Staff allowed areas
    if (role === 'staff') {
        const staffAllowed = pathname.startsWith('/apps/products') || pathname.startsWith('/apps/Purchase') || pathname.startsWith('/apps/createPurchase') || pathname.startsWith('/apps/pos') || pathname.startsWith('/apps/OrderView'); // optional: allow staff to create purchase

        if (staffAllowed) {
            return NextResponse.next();
        }

        return NextResponse.redirect(new URL('/apps/products', request.url));
    }

    // ❌ Default: deny everything else
    return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/profile/:path*',
        '/admin/:path*',
        '/components/:path*',
        '/apps/:path*',
        '/supplier/:path*', // <-- supplier dashboard
    ],
};
