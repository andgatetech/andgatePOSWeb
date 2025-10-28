import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

// The locales you support in your app
const supportedLocales = ['en', 'bn'];
// The default locale
const defaultLocale = 'en';

export function middleware(req: NextRequest) {
  // Skip middleware for static files and Next.js internals
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE.test(req.nextUrl.pathname)
  ) {
    return;
  }

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = supportedLocales.some(
    (locale) => req.nextUrl.pathname.startsWith(`/${locale}/`) || req.nextUrl.pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Get country from Vercel's edge network header
  const country = req.geo?.country || 'US';

  // If the user is from Bangladesh (BD), redirect to the 'bn' locale
  if (country === 'BD') {
    const url = req.nextUrl.clone();
    url.pathname = `/bn${url.pathname}`;
    return NextResponse.redirect(url);
  }

  // For all other users, you can redirect to the default locale or handle as needed
  // This part is optional and depends on your desired behavior for other users.
  // For example, to redirect to English:
  // const url = req.nextUrl.clone();
  // url.pathname = `/${defaultLocale}${url.pathname}`;
  // return NextResponse.redirect(url);
}
