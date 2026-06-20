// Bangladesh-focused keyword list for AndgatePOS
export const BD_KEYWORDS = [
    // Primary — high commercial intent (English)
    'POS software Bangladesh',
    'best POS software in Bangladesh',
    'point of sale software Bangladesh',
    'billing software Bangladesh',
    'POS software price in Bangladesh',
    'POS software for small business Bangladesh',
    'retail billing software Bangladesh',
    'inventory and billing software Bangladesh',
    'shop management software Bangladesh',
    'inventory management software Bangladesh',
    'retail software Bangladesh',
    'cloud POS Bangladesh',
    'free POS software Bangladesh',
    'barcode POS software Bangladesh',
    'stock management software Bangladesh',
    'purchase order software Bangladesh',
    'accounting software small business Bangladesh',
    'ecommerce POS Bangladesh',
    'online store Bangladesh free',
    'SaaS POS Bangladesh',
    // Vertical-specific
    'grocery store POS Bangladesh',
    'pharmacy software Bangladesh',
    'pharmacy billing software Bangladesh',
    'clothing store POS Bangladesh',
    'restaurant billing software Bangladesh',
    'supermarket software Bangladesh',
    'fashion store POS Bangladesh',
    'mini mart POS software Bangladesh',
    // Geo-specific
    'POS software Dhaka',
    'POS software Chittagong',
    'POS software Sylhet',
    'retail management software Bangladesh',
    'shop software Dhaka Bangladesh',
    // Bengali script (indexed by Google for Bengali searches)
    'দোকান ব্যবস্থাপনা সফটওয়্যার',
    'দোকানের পস সফটওয়্যার',
    'পয়েন্ট অফ সেল সফটওয়্যার',
    'বিলিং সফটওয়্যার বাংলাদেশ',
    'বারকোড বিলিং সফটওয়্যার',
    'দোকানের হিসাব সফটওয়্যার',
    'ইনভেন্টরি ম্যানেজমেন্ট সফটওয়্যার',
    'স্টক ম্যানেজমেন্ট সফটওয়্যার বাংলাদেশ',
    'ফার্মেসি সফটওয়্যার বাংলাদেশ',
    'মুদি দোকানের সফটওয়্যার',
    'রিটেইল পস সফটওয়্যার',
    'POS সফটওয়্যারের দাম বাংলাদেশ',
    'ছোট ব্যবসার সফটওয়্যার বাংলাদেশ',
    'পিওএস সফটওয়্যার বাংলাদেশ',
    'বিনামূল্যে অনলাইন স্টোর বাংলাদেশ',
    // Brand
    'AndgatePOS',
    'Andgate Technologies',
    'Hawkeri online store',
];

// Get the app URL with fallback
export const getAppUrl = () => {
    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;

    // Public SEO output must never ship localhost canonicals from a production build.
    if (process.env.NODE_ENV === 'production' && configuredUrl?.includes('localhost')) {
        return 'https://andgatepos.com';
    }

    if (configuredUrl) {
        return configuredUrl;
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
