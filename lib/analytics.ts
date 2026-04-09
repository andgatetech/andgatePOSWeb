/**
 * Analytics utility for Facebook Pixel and Google Tag Manager
 * Usage: import { trackEvent, trackPixelEvent } from '@/lib/analytics'
 */

// ─── Types ────────────────────────────────────────────────────────────────────

declare global {
    interface Window {
        fbq?: (...args: unknown[]) => void;
        dataLayer?: Record<string, unknown>[];
    }
}

// ─── Google Tag Manager / dataLayer ──────────────────────────────────────────

/**
 * Push a custom event to GTM dataLayer.
 * GTM then routes it to GA4, Ads, Pixel, etc. based on your GTM triggers.
 *
 * @param eventName - e.g. 'cta_click', 'plan_selected', 'form_submit'
 * @param params    - any extra data you want GTM to see
 */
export function trackGTMEvent(eventName: string, params: Record<string, unknown> = {}) {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: eventName,
        ...params,
    });
}

// ─── Facebook Pixel ───────────────────────────────────────────────────────────

/**
 * Fire a Facebook Pixel standard or custom event.
 *
 * Standard events: 'ViewContent', 'Lead', 'InitiateCheckout', 'CompleteRegistration', 'Contact'
 * Custom events:   any string you define
 *
 * @param eventName - Facebook standard or custom event name
 * @param data      - optional event parameters
 */
export function trackPixelEvent(eventName: string, data: Record<string, unknown> = {}) {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
    window.fbq('track', eventName, data);
}

// ─── Combined helper ──────────────────────────────────────────────────────────

/**
 * Fire BOTH a GTM dataLayer event AND a Facebook Pixel event at once.
 * This is the recommended approach for button clicks on the promotion page.
 *
 * @param eventName - descriptive event name (snake_case recommended)
 * @param pixelEvent - FB Pixel standard event name (defaults to 'Lead')
 * @param data       - extra data sent to both
 */
export function trackEvent(
    eventName: string,
    pixelEvent: string = 'Lead',
    data: Record<string, unknown> = {}
) {
    trackGTMEvent(eventName, data);
    trackPixelEvent(pixelEvent, data);
}
