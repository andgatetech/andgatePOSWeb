/**
 * SEO Analytics and Tracking Setup
 *
 * Add these to your environment variables:
 * NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
 * NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
 * NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789
 */

// Google Analytics 4 Setup
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Google Tag Manager
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

// Facebook Pixel
export const FACEBOOK_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

// Declare fbq function type
declare global {
    interface Window {
        fbq?: (...args: any[]) => void;
        gtag?: (...args: any[]) => void;
    }
}

// Facebook Pixel Events
export const trackFBEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', eventName, parameters);
    }
};

export const trackFBCustomEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('trackCustom', eventName, parameters);
    }
};

// Facebook Pixel Standard Events
export const trackFBPageView = () => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'PageView');
    }
};

export const trackFBAddToCart = (content: { id: string; name: string; value: number; currency?: string }) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'AddToCart', {
            content_ids: [content.id],
            content_name: content.name,
            content_type: 'product',
            value: content.value,
            currency: content.currency || 'BDT',
        });
    }
};

export const trackFBPurchase = (purchase: { value: number; currency?: string; transactionId?: string; numItems?: number }) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Purchase', {
            value: purchase.value,
            currency: purchase.currency || 'BDT',
            transaction_id: purchase.transactionId,
            num_items: purchase.numItems,
        });
    }
};

export const trackFBLead = (leadInfo?: { value?: number; currency?: string; contentName?: string }) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Lead', {
            value: leadInfo?.value,
            currency: leadInfo?.currency || 'BDT',
            content_name: leadInfo?.contentName,
        });
    }
};

export const trackFBCompleteRegistration = (method?: string) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'CompleteRegistration', {
            status: 'completed',
            registration_method: method,
        });
    }
};

export const trackFBInitiateCheckout = (checkout: { value: number; currency?: string; numItems?: number }) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'InitiateCheckout', {
            value: checkout.value,
            currency: checkout.currency || 'BDT',
            num_items: checkout.numItems,
        });
    }
};

export const trackFBSearch = (searchString: string) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Search', {
            search_string: searchString,
        });
    }
};

export const trackFBViewContent = (content: { id: string; name: string; value?: number; currency?: string }) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'ViewContent', {
            content_ids: [content.id],
            content_name: content.name,
            content_type: 'product',
            value: content.value,
            currency: content.currency || 'BDT',
        });
    }
};

export const trackFBContact = () => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Contact');
    }
};

// Custom Events for POS System
export const trackFBOrderPlaced = (order: { orderId: string; value: number; items: number; paymentMethod: string }) => {
    trackFBCustomEvent('OrderPlaced', {
        order_id: order.orderId,
        value: order.value,
        currency: 'BDT',
        num_items: order.items,
        payment_method: order.paymentMethod,
    });
};

export const trackFBInventoryUpdate = (productId: string, action: 'add' | 'update' | 'delete') => {
    trackFBCustomEvent('InventoryUpdate', {
        product_id: productId,
        action: action,
    });
};

export const trackFBStoreCreated = (storeName: string) => {
    trackFBCustomEvent('StoreCreated', {
        store_name: storeName,
    });
};

// Google Analytics Events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, parameters);
    }
};

// Page view tracking
export const trackPageView = (url: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', GA_TRACKING_ID, {
            page_path: url,
        });
    }
};

// E-commerce tracking for POS transactions
export const trackPurchase = (transactionId: string, value: number, items: any[]) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'purchase', {
            transaction_id: transactionId,
            value: value,
            currency: 'USD',
            items: items,
        });
    }
};

// Lead generation tracking
export const trackLead = (leadType: string) => {
    trackEvent('generate_lead', {
        lead_type: leadType,
    });
};

// Feature usage tracking
export const trackFeatureUse = (feature: string) => {
    trackEvent('feature_use', {
        feature_name: feature,
    });
};
