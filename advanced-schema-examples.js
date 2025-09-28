// Enhanced Schema for AndgatePOS
// Add this to specific pages for even better SEO

// For Products Page
const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AndgatePOS Inventory Management", 
    "applicationSubCategory": "Inventory Management System",
    "offers": {
        "@type": "Offer",
        "price": "29.99",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "150"
    }
};

// For Business/Organization
const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Andgate Technologies",
    "url": "https://andgatepos.com",
    "logo": "https://andgatepos.com/logo.png",
    "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-555-123-4567",
        "contactType": "customer service"
    },
    "sameAs": [
        "https://facebook.com/andgatetech",
        "https://twitter.com/andgatetech",
        "https://linkedin.com/company/andgatetech"
    ]
};

// For Service Pages  
const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Point of Sale System Implementation",
    "provider": {
        "@type": "Organization", 
        "name": "Andgate Technologies"
    },
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "POS System Plans",
        "itemListElement": [
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Basic POS Plan"
                }
            }
        ]
    }
};