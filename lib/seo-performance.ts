/**
 * SEO Performance Optimization Utilities
 */

// Image optimization for SEO
export const optimizeImageForSEO = (imagePath: string, alt: string, width?: number, height?: number) => {
    return {
        src: imagePath,
        alt: alt,
        width: width || 800,
        height: height || 600,
        loading: 'lazy' as const,
        decoding: 'async' as const,
    };
};

// Generate breadcrumb schema
export const generateBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.url,
        })),
    };
};

// Generate review schema for testimonials
export const generateReviewSchema = (
    reviews: Array<{
        author: string;
        rating: number;
        reviewBody: string;
        datePublished: string;
    }>
) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'AndgatePOS System',
        review: reviews.map((review) => ({
            '@type': 'Review',
            author: {
                '@type': 'Person',
                name: review.author,
            },
            reviewRating: {
                '@type': 'Rating',
                ratingValue: review.rating,
                bestRating: '5',
            },
            reviewBody: review.reviewBody,
            datePublished: review.datePublished,
        })),
    };
};

// Speed optimization utilities
export const preloadCriticalAssets = () => {
    if (typeof document !== 'undefined') {
        // Preload critical fonts
        const fontLink = document.createElement('link');
        fontLink.rel = 'preload';
        fontLink.href = '/assets/fonts/nunito.woff2';
        fontLink.as = 'font';
        fontLink.type = 'font/woff2';
        fontLink.crossOrigin = 'anonymous';
        document.head.appendChild(fontLink);

        // Preload critical CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'preload';
        cssLink.href = '/styles/tailwind.css';
        cssLink.as = 'style';
        document.head.appendChild(cssLink);
    }
};

// Generate FAQ schema for help pages
export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
};

// Generate how-to schema for tutorial pages
export const generateHowToSchema = (title: string, steps: Array<{ name: string; text: string }>) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: title,
        step: steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text,
        })),
    };
};
