'use client';

import { trackGTMEvent, trackPixelEvent } from '@/lib/analytics';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const firedPaths = new Set<string>();

export default function PromotionTracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (firedPaths.has(pathname)) return;
        firedPaths.add(pathname);

        const isPartner = pathname.includes('/promotion/partner');
        const contentName = isPartner ? 'Partner Promotion Page' : 'POS Promotion Page';

        trackPixelEvent('ViewContent', {
            content_name: contentName,
            content_category: 'Landing Page',
            page_path: pathname,
        });

        trackGTMEvent('promotion_page_view', {
            page_title: contentName,
            page_location: window.location.href,
            page_path: pathname,
        });
    }, [pathname]);

    return null;
}
