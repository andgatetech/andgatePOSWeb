'use client';

import { trackGTMEvent, trackPixelEvent } from '@/lib/analytics';
import { buildAttribution } from '@/lib/attribution';
import { getExperimentVariant, getSessionId, getVisitorId } from '@/lib/visitor';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const firedPaths = new Set<string>();

export default function PromotionTracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (firedPaths.has(pathname)) return;
        firedPaths.add(pathname);

        const isAffiliate = pathname.includes('/promotion/affiliate');
        const contentName = isAffiliate ? 'Affiliate Promotion Page' : 'POS Promotion Page';
        const searchParams = new URLSearchParams(window.location.search);
        const attribution = buildAttribution(searchParams, {
            source: searchParams.get('source') || (isAffiliate ? 'promotion_affiliate' : 'promotion_pos'),
            campaign: isAffiliate ? 'affiliate_landing' : 'pos_landing',
        });
        const eventContext = {
            ...attribution,
            visitor_id: getVisitorId(),
            session_id: getSessionId(),
            experiment_key: isAffiliate ? 'promotion_affiliate_v1' : 'promotion_pos_hero_v1',
            experiment_variant: getExperimentVariant(isAffiliate ? 'promotion_affiliate_v1' : 'promotion_pos_hero_v1'),
        };

        trackPixelEvent('PageView', {
            content_name: contentName,
            content_category: 'Landing Page',
            page_path: pathname,
            ...eventContext,
        });

        trackPixelEvent('ViewContent', {
            content_name: contentName,
            content_category: 'Landing Page',
            page_path: pathname,
            ...eventContext,
        });

        trackGTMEvent('promotion_page_view', {
            page_title: contentName,
            page_location: window.location.href,
            page_path: pathname,
        });
    }, [pathname]);

    return null;
}
