/**
 * Analytics utility for Facebook Pixel and Google Tag Manager
 * Usage: import { trackEvent, trackPixelEvent } from '@/lib/analytics'
 */
import { apiBaseUrl } from './api-url';

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
    if (typeof window === 'undefined') return;
    const standardEvents = new Set(['ViewContent', 'Lead', 'InitiateCheckout', 'CompleteRegistration', 'Contact', 'PageView']);
    const eventId = typeof data.event_id === 'string' ? data.event_id : createEventId(eventName);
    const payload = { ...data, event_id: eventId };

    if (typeof window.fbq === 'function') {
        window.fbq(standardEvents.has(eventName) ? 'track' : 'trackCustom', eventName, payload, { eventID: eventId });
    }

    sendConversionsApiEvent(eventName, payload, eventId);
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

function createEventId(eventName: string) {
    const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    return `${eventName}-${random}`;
}

function readCookie(name: string) {
    if (typeof document === 'undefined') return '';
    return document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${name}=`))
        ?.split('=')
        .slice(1)
        .join('=') || '';
}

function sendConversionsApiEvent(eventName: string, data: Record<string, unknown>, eventId: string) {
    if (typeof window === 'undefined') return;

    const userData = data.user_data && typeof data.user_data === 'object' ? data.user_data as Record<string, unknown> : {};
    const customData = Object.fromEntries(
        Object.entries(data).filter(([key]) => !['user_data', 'event_id'].includes(key))
    );

    fetch(`${apiBaseUrl()}/marketing/meta/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            event_name: eventName,
            event_id: eventId,
            event_source_url: window.location.href,
            source: 'browser_pixel',
            user_data: {
                ...userData,
                fbp: userData.fbp || decodeURIComponent(readCookie('_fbp')),
                fbc: userData.fbc || decodeURIComponent(readCookie('_fbc')),
            },
            custom_data: customData,
        }),
        keepalive: true,
    }).catch(() => {});
}
