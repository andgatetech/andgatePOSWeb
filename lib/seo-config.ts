/**
 * Environment Variables Configuration for SEO
 *
 * This file helps ensure proper metadataBase resolution
 */

// Get the app URL with fallback
export const getAppUrl = () => {
    // In production, use the environment variable
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    // In development, use localhost
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:3000';
    }

    // Default fallback
    return 'https://andgatepos.com';
};

// Validate URL format
export const validateMetadataBaseUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Generate absolute URL for images
export const getAbsoluteUrl = (path: string): string => {
    const baseUrl = getAppUrl();
    if (path.startsWith('http')) {
        return path;
    }
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

// Environment validation
export const validateSeoEnvironment = () => {
    const issues: string[] = [];

    if (!process.env.NEXT_PUBLIC_APP_URL) {
        issues.push('NEXT_PUBLIC_APP_URL is not set - using fallback URL');
    }

    const appUrl = getAppUrl();
    if (!validateMetadataBaseUrl(appUrl)) {
        issues.push(`Invalid metadataBase URL: ${appUrl}`);
    }

    return {
        isValid: issues.length === 0,
        issues,
        appUrl,
    };
};
