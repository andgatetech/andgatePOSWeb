'use client';

import { trackGTMEvent, trackPixelEvent } from '@/lib/analytics';
import { useEffect } from 'react';

// Module-level flag — lives OUTSIDE the component.
// Unlike useRef, this survives React StrictMode's unmount→remount cycle,
// so the events fire exactly once per page session no matter what.
let promotionEventFired = false;

export default function PromotionTracker() {
    useEffect(() => {
        if (promotionEventFired) return;
        promotionEventFired = true;

        trackPixelEvent('ViewContent', {
            content_name: 'Promotion Page',
            content_category: 'Landing Page',
        });

        trackGTMEvent('promotion_page_view', {
            page_title: 'AndgatePOS Promotion',
            page_location: window.location.href,
        });
    }, []);

    return null;
}

