'use client';

import { trackEvent } from '@/lib/analytics';
import { useEffect, useRef } from 'react';

const SCROLL_THRESHOLDS = [25, 50, 75, 100];
const TIME_THRESHOLDS_SECONDS = [10, 30, 60, 120, 300];

// Fires scroll depth, engaged time-on-page, and section-visibility events
// as full Pixel + backend CAPI events (see lib/analytics.ts trackEvent).
export default function PromoEngagementTracker() {
    const scrollFired = useRef<Set<number>>(new Set());
    const timeFired = useRef<Set<number>>(new Set());
    const sectionFired = useRef<Set<string>>(new Set());
    const engagedSeconds = useRef(0);

    useEffect(() => {
        const pagePath = window.location.pathname;

        let scrollTicking = false;
        const onScroll = () => {
            if (scrollTicking) return;
            scrollTicking = true;
            requestAnimationFrame(() => {
                const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
                const percent = scrollableHeight > 0 ? Math.min(100, Math.round((window.scrollY / scrollableHeight) * 100)) : 100;

                SCROLL_THRESHOLDS.forEach((threshold) => {
                    if (percent >= threshold && !scrollFired.current.has(threshold)) {
                        scrollFired.current.add(threshold);
                        trackEvent(`scroll_depth_${threshold}`, `ScrollDepth${threshold}`, {
                            depth_percent: threshold,
                            page_path: pagePath,
                        });
                    }
                });

                scrollTicking = false;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        const timeInterval = setInterval(() => {
            if (document.visibilityState !== 'visible') return;
            engagedSeconds.current += 1;

            TIME_THRESHOLDS_SECONDS.forEach((threshold) => {
                if (engagedSeconds.current >= threshold && !timeFired.current.has(threshold)) {
                    timeFired.current.add(threshold);
                    trackEvent(`time_on_page_${threshold}s`, `TimeOnPage${threshold}s`, {
                        seconds: threshold,
                        page_path: pagePath,
                    });
                }
            });
        }, 1000);

        const sectionEls = document.querySelectorAll<HTMLElement>('[data-section-track]');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const name = entry.target.getAttribute('data-section-track');
                    if (!name || !entry.isIntersecting || sectionFired.current.has(name)) return;
                    sectionFired.current.add(name);
                    trackEvent(`section_view_${name}`, `SectionView_${name}`, {
                        section: name,
                        page_path: pagePath,
                    });
                });
            },
            { threshold: 0.5 },
        );
        sectionEls.forEach((el) => observer.observe(el));

        return () => {
            window.removeEventListener('scroll', onScroll);
            clearInterval(timeInterval);
            observer.disconnect();
        };
    }, []);

    return null;
}
