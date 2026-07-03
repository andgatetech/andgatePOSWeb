'use client';

import { trackPixelEvent } from '@/lib/analytics';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function PixelRouteTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const firstRun = useRef(true);

    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }

        const query = searchParams.toString();
        const pagePath = query ? `${pathname}?${query}` : pathname;

        trackPixelEvent('PageView', {
            page_path: pagePath,
            page_location: window.location.href,
        });
    }, [pathname, searchParams]);

    return null;
}
