'use client';

import { trackEvent, trackPixelEvent } from '@/lib/analytics';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

type ContentRoute = {
    name: string;
    category: string;
};

const PUBLIC_CONTENT_ROUTES: Array<{ match: (pathname: string) => boolean; route: ContentRoute }> = [
    { match: (pathname) => pathname === '/', route: { name: 'AndgateBOS Home', category: 'Website' } },
    { match: (pathname) => pathname === '/pricing', route: { name: 'AndgateBOS Pricing', category: 'Pricing' } },
    { match: (pathname) => pathname === '/demo', route: { name: 'AndgateBOS Demo', category: 'Lead' } },
    { match: (pathname) => pathname === '/contact', route: { name: 'AndgateBOS Contact', category: 'Lead' } },
    { match: (pathname) => pathname === '/about', route: { name: 'About AndgateBOS', category: 'Company' } },
    { match: (pathname) => pathname.startsWith('/features/'), route: { name: 'AndgateBOS Feature', category: 'Feature' } },
    { match: (pathname) => pathname === '/landing' || pathname.startsWith('/landing/'), route: { name: 'AndgateBOS Landing Page', category: 'Landing' } },
    { match: (pathname) => pathname.startsWith('/bn/'), route: { name: 'AndgateBOS Bangla Page', category: 'Website' } },
    { match: (pathname) => pathname === '/best-pos-software-bangladesh', route: { name: 'Best POS Software Bangladesh', category: 'SEO Landing' } },
    { match: (pathname) => pathname === '/free-pos-software-bangladesh', route: { name: 'Free POS Software Bangladesh', category: 'SEO Landing' } },
    { match: (pathname) => pathname === '/blog' || pathname.startsWith('/blog/'), route: { name: 'AndgateBOS Blog', category: 'Content' } },
    { match: (pathname) => pathname === '/compare' || pathname.startsWith('/compare/'), route: { name: 'AndgateBOS Compare', category: 'Comparison' } },
    { match: (pathname) => pathname === '/hawkeri', route: { name: 'Hawkeri Online Store', category: 'Product' } },
    { match: (pathname) => pathname === '/training', route: { name: 'AndgateBOS Training', category: 'Support' } },
    { match: (pathname) => pathname === '/user-guide', route: { name: 'AndgateBOS User Guide', category: 'Support' } },
];

function getPublicContentRoute(pathname: string) {
    if (pathname.startsWith('/promotion')) return null;
    return PUBLIC_CONTENT_ROUTES.find(({ match }) => match(pathname))?.route || null;
}

function getElementLabel(element: HTMLElement, href: string) {
    return element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 80) || href || 'CTA';
}

export default function MarketingPixelTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const trackedContent = useRef(new Set<string>());

    useEffect(() => {
        const contentRoute = getPublicContentRoute(pathname);
        if (!contentRoute) return;

        const query = searchParams.toString();
        const pagePath = query ? `${pathname}?${query}` : pathname;
        const key = `${contentRoute.category}:${pagePath}`;

        if (trackedContent.current.has(key)) return;
        trackedContent.current.add(key);

        trackPixelEvent('ViewContent', {
            content_name: contentRoute.name,
            content_category: contentRoute.category,
            page_path: pagePath,
            page_location: window.location.href,
        });
    }, [pathname, searchParams]);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            const target = event.target instanceof Element ? event.target : null;
            const element = target?.closest('a, button') as HTMLElement | null;
            if (!element) return;

            const anchor = element instanceof HTMLAnchorElement ? element : element.closest('a');
            const rawHref = anchor?.href || element.getAttribute('data-href') || '';
            const href = rawHref.toLowerCase();

            let analyticsEvent = '';
            let pixelEvent = '';
            let category = '';

            if (href.includes('wa.me') || href.includes('whatsapp') || href.startsWith('tel:') || href.startsWith('mailto:')) {
                analyticsEvent = 'public_contact_click';
                pixelEvent = 'Contact';
                category = 'Contact CTA';
            } else if (href.includes('/contact') || href.includes('/demo')) {
                analyticsEvent = 'public_lead_click';
                pixelEvent = 'Lead';
                category = 'Lead CTA';
            } else if (href.includes('/register')) {
                analyticsEvent = 'public_register_cta_click';
                pixelEvent = 'Lead';
                category = 'Registration CTA';
            } else {
                return;
            }

            trackEvent(analyticsEvent, pixelEvent, {
                content_name: getElementLabel(element, rawHref),
                content_category: category,
                cta_href: rawHref,
                page_path: window.location.pathname,
                page_location: window.location.href,
            });
        };

        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    }, []);

    return null;
}
