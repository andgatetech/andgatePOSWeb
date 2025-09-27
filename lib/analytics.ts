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
      items: items
    });
  }
};

// Lead generation tracking
export const trackLead = (leadType: string) => {
  trackEvent('generate_lead', {
    lead_type: leadType
  });
};

// Feature usage tracking
export const trackFeatureUse = (feature: string) => {
  trackEvent('feature_use', {
    feature_name: feature
  });
};