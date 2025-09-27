/**
 * Advanced SEO Schema Examples for AndgatePOS
 * 
 * This file contains additional structured data schemas that can be added
 * to specific pages for enhanced SEO and rich snippets.
 */

// 🏢 Organization Schema (for About/Company pages)
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Andgate Technologies",
  "description": "Leading provider of point of sale solutions for modern businesses",
  "url": "https://andgatepos.com",
  "logo": "https://andgatepos.com/assets/images/logo.png",
  "founder": {
    "@type": "Person",
    "name": "Andgate Team"
  },
  "foundingDate": "2020",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "BD",
    "addressLocality": "Dhaka"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+880-XXX-XXXX",
    "contactType": "Customer Service",
    "availableLanguage": ["English", "Bengali"]
  },
  "sameAs": [
    "https://facebook.com/andgatepos",
    "https://twitter.com/andgatepos",
    "https://linkedin.com/company/andgate"
  ]
};

// 💰 Product Schema (for POS System pages)
export const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "AndgatePOS System",
  "description": "Complete point of sale system with inventory management, reporting, and multi-store support",
  "brand": {
    "@type": "Brand",
    "name": "Andgate Technologies"
  },
  "category": "Business Software",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "2025-12-31",
    "description": "Free trial available"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "156",
    "bestRating": "5",
    "worstRating": "1"
  },
  "features": [
    "Inventory Management",
    "Sales Analytics",
    "Multi-store Support",
    "Real-time Reporting",
    "Customer Management"
  ]
};

// ❓ FAQ Schema (for Support/Help pages)
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is AndgatePOS?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AndgatePOS is a comprehensive point of sale system designed for modern businesses, featuring inventory management, sales tracking, and multi-store support."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a free trial available?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we offer a free trial so you can explore all features before making a commitment."
      }
    },
    {
      "@type": "Question",
      "name": "Does AndgatePOS support multiple stores?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! AndgatePOS is built with multi-store functionality, allowing you to manage multiple locations from a single dashboard."
      }
    }
  ]
};

// 📱 Mobile App Schema (if you have a mobile app)
export const mobileAppSchema = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  "name": "AndgatePOS Mobile",
  "description": "Mobile app for AndgatePOS system",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": ["Android", "iOS"],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "89"
  }
};

// 📊 Service Schema (for business services)
export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "POS System Implementation",
  "description": "Professional point of sale system setup and training services",
  "provider": {
    "@type": "Organization",
    "name": "Andgate Technologies"
  },
  "serviceType": "Business Software Implementation",
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock"
  }
};

// 🎓 Course/Training Schema (if you offer training)
export const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "AndgatePOS Training Program",
  "description": "Comprehensive training on using AndgatePOS system effectively",
  "provider": {
    "@type": "Organization",
    "name": "Andgate Technologies"
  },
  "courseMode": ["online", "in-person"],
  "educationalCredentialAwarded": "Certificate of Completion"
};

// 📰 Article/Blog Schema (for blog posts)
export const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Choose the Right POS System for Your Business",
  "description": "Complete guide to selecting the perfect point of sale system",
  "author": {
    "@type": "Person",
    "name": "Andgate Team"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Andgate Technologies",
    "logo": {
      "@type": "ImageObject",
      "url": "https://andgatepos.com/assets/images/logo.png"
    }
  },
  "datePublished": "2024-01-01",
  "dateModified": "2024-01-01"
};

// 🎯 Local Business Schema (if you have physical locations)
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Andgate Technologies Office",
  "description": "POS system provider and business solutions",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Your Street Address",
    "addressLocality": "Dhaka",
    "addressCountry": "BD"
  },
  "telephone": "+880-XXX-XXXX",
  "openingHours": "Mo-Fr 09:00-18:00",
  "priceRange": "$$"
};