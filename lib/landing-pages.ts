export type LandingPage = {
    slug: string;
    title: string;
    metaTitle: string;
    metaDescription: string;
    h1: string;
    eyebrow: string;
    intro: string;
    banglaIntro: string;
    primaryKeyword: string;
    secondaryKeywords: string[];
    audience: string;
    image: string;
    highlights: string[];
    modules: Array<{ title: string; description: string }>;
    useCases: string[];
    faq: Array<{ question: string; answer: string }>;
};

const commonModules = [
    {
        title: 'Fast POS billing',
        description: 'Barcode and camera scanning, discounts, multiple payment methods, and instant receipt printing from one checkout screen.',
    },
    {
        title: 'Inventory and stock control',
        description: 'Track stock in real time, get low-stock alerts, manage variants, serials, units, and purchase orders.',
    },
    {
        title: 'Reports and accounting',
        description: 'See sales, profit and loss, VAT/tax, supplier dues, customer activity, stock value, and daily expenses.',
    },
    {
        title: 'Bangladesh-ready payments',
        description: 'Record cash, bKash, Nagad, Rocket, Upay, card, bank transfer, partial payments, and customer dues.',
    },
];

export const landingPages: LandingPage[] = [
    {
        slug: 'pos-software-bangladesh',
        title: 'POS Software in Bangladesh',
        metaTitle: 'POS Software in Bangladesh | Retail, Inventory & Billing | AndgatePOS',
        metaDescription:
            'AndgatePOS is POS software in Bangladesh for retail shops, grocery stores, pharmacies, restaurants and fashion businesses. Manage billing, inventory, bKash/Nagad payments, reports and a free online store.',
        h1: 'POS Software in Bangladesh for Retail, Billing and Inventory',
        eyebrow: 'Bangladesh POS Solution',
        intro:
            'AndgatePOS helps Bangladeshi shop owners run sales, stock, billing, accounting and customer management from one simple web-based POS system.',
        banglaIntro:
            'বাংলাদেশের দোকানদারদের জন্য AndgatePOS একটি সহজ POS সফটওয়্যার। বিক্রি, স্টক, হিসাব, পেমেন্ট আর রিপোর্ট এক জায়গা থেকেই চালাতে পারবেন।',
        primaryKeyword: 'POS software in Bangladesh',
        secondaryKeywords: [
            'best POS software in Bangladesh',
            'point of sale software Bangladesh',
            'billing software Bangladesh',
            'POS software price in Bangladesh',
            'POS software for small business Bangladesh',
            'shop management software Bangladesh',
            'পিওএস সফটওয়্যার বাংলাদেশ',
            'দোকানের পস সফটওয়্যার',
        ],
        audience: 'Retail shops, grocery stores, pharmacies, fashion shops, restaurants, electronics stores and multi-branch businesses.',
        image: '/assets/LandingImage/updated/pos.webp',
        highlights: ['Works offline at the counter', 'bKash, Nagad, Rocket and cash payment tracking', 'Free Hawkeri online store', '20+ business reports'],
        modules: commonModules,
        useCases: [
            'Replace manual cash memo books with digital invoices',
            'Know which products are selling and which are stuck in stock',
            'Manage multiple branches from one dashboard',
            'Track supplier dues, customer dues and daily expenses',
        ],
        faq: [
            {
                question: 'Which POS software is best for small shops in Bangladesh?',
                answer:
                    'For small shops in Bangladesh, a good POS should be easy to use, support local payments, track inventory, print receipts and show daily profit reports. AndgatePOS is built around these local workflows.',
            },
            {
                question: 'Does AndgatePOS support bKash and Nagad?',
                answer:
                    'Yes. You can record cash, bKash, Nagad, Rocket, Upay, card, bank transfer and partial payments from the POS checkout.',
            },
            {
                question: 'Can I use AndgatePOS without internet?',
                answer:
                    'The POS counter workflow is designed to keep selling during internet interruptions and sync when the connection comes back.',
            },
            {
                question: 'Is there a free POS plan?',
                answer:
                    'Yes. AndgatePOS has a free starting option so a business can try the core workflow before upgrading.',
            },
        ],
    },
    {
        slug: 'retail-pos-software-bangladesh',
        title: 'Retail POS Software Bangladesh',
        metaTitle: 'Retail POS Software Bangladesh | Shop Billing & Stock | AndgatePOS',
        metaDescription:
            'Retail POS software in Bangladesh for clothing, electronics, grocery, cosmetics and daily shop operations. Manage checkout, inventory, staff, reports and online selling.',
        h1: 'Retail POS Software for Bangladeshi Shops',
        eyebrow: 'Retail Shop Management',
        intro:
            'Run counter sales, customer dues, stock alerts, product variants, staff permissions and daily reports without juggling notebooks and spreadsheets.',
        banglaIntro:
            'রিটেইল দোকানের বিল, স্টক, কর্মচারী, কাস্টমার বাকি আর রিপোর্ট সহজভাবে ম্যানেজ করার জন্য AndgatePOS তৈরি।',
        primaryKeyword: 'retail POS software Bangladesh',
        secondaryKeywords: ['retail software Bangladesh', 'retail billing software Bangladesh', 'shop billing software Bangladesh', 'shop management software Bangladesh', 'clothing store POS Bangladesh'],
        audience: 'Clothing stores, electronics shops, cosmetics shops, superstores, footwear shops and lifestyle retailers.',
        image: '/assets/LandingImage/updated/products.webp',
        highlights: ['Variant-wise stock', 'Barcode labels', 'Customer loyalty and dues', 'Branch-wise reports'],
        modules: commonModules,
        useCases: ['Track sizes, colors and variants', 'Print barcode labels for products', 'Control cashier and manager access', 'View daily and monthly sales trends'],
        faq: [
            { question: 'Can retail shops manage product variants?', answer: 'Yes. AndgatePOS supports variants such as size, color, model and serial where needed.' },
            { question: 'Can I print barcode labels?', answer: 'Yes. You can generate and print barcode or QR labels directly from the product workflow.' },
            { question: 'Can I manage staff access?', answer: 'Yes. Staff roles and permissions help control who can sell, refund, edit stock or view reports.' },
        ],
    },
    {
        slug: 'restaurant-pos-software-bangladesh',
        title: 'Restaurant POS Software Bangladesh',
        metaTitle: 'Restaurant POS Software Bangladesh | Fast Billing & Reports | AndgatePOS',
        metaDescription:
            'Restaurant POS software in Bangladesh for fast billing, payment tracking, expenses, inventory and daily sales reports. Built for cafes, bakeries and food shops.',
        h1: 'Restaurant POS Software for Fast Billing in Bangladesh',
        eyebrow: 'Food Business POS',
        intro:
            'Serve customers faster, track daily sales, manage expenses and keep food-item inventory visible from one POS dashboard.',
        banglaIntro:
            'ক্যাফে, বেকারি বা খাবারের দোকানে দ্রুত বিল, পেমেন্ট, খরচ আর দৈনিক বিক্রির রিপোর্ট দেখতে AndgatePOS ব্যবহার করতে পারেন।',
        primaryKeyword: 'restaurant POS software Bangladesh',
        secondaryKeywords: ['restaurant billing software Bangladesh', 'restaurant POS system Bangladesh', 'cafe POS Bangladesh', 'food shop POS Bangladesh', 'restaurant management software Bangladesh'],
        audience: 'Restaurants, cafes, bakeries, fast food shops, juice bars and small food counters.',
        image: '/assets/LandingImage/updated/orders.webp',
        highlights: ['Fast checkout', 'Daily cash and expense tracking', 'Sales reports', 'Multiple payment methods'],
        modules: commonModules,
        useCases: ['Bill customers quickly during rush hour', 'Track cash, mobile payments and card payments', 'Record daily kitchen or shop expenses', 'Review best-selling food items'],
        faq: [
            { question: 'Can restaurants track daily sales?', answer: 'Yes. AndgatePOS shows daily sales, payment method breakdown, expenses and profit-related reports.' },
            { question: 'Does it work for bakeries and cafes?', answer: 'Yes. The workflow fits cafes, bakeries, food counters and small restaurants.' },
            { question: 'Can I print receipts?', answer: 'Yes. You can print receipts and invoices after checkout.' },
        ],
    },
    {
        slug: 'pharmacy-pos-software-bangladesh',
        title: 'Pharmacy POS Software Bangladesh',
        metaTitle: 'Pharmacy POS Software Bangladesh | Stock, Billing & Reports | AndgatePOS',
        metaDescription:
            'Pharmacy POS software in Bangladesh for medicine billing, stock alerts, supplier purchases, reports and customer history. Manage pharmacy sales more clearly.',
        h1: 'Pharmacy POS Software for Stock and Billing in Bangladesh',
        eyebrow: 'Pharmacy Management',
        intro:
            'Keep medicine stock visible, reduce billing mistakes, track supplier purchases and know when important products are running low.',
        banglaIntro:
            'ফার্মেসির ওষুধের স্টক, বিল, সরবরাহকারী ক্রয় আর কম স্টকের অ্যালার্ট সহজভাবে সামলাতে AndgatePOS সাহায্য করে।',
        primaryKeyword: 'pharmacy POS software Bangladesh',
        secondaryKeywords: ['pharmacy software Bangladesh', 'medicine shop software Bangladesh', 'pharmacy billing software Bangladesh', 'medicine inventory software Bangladesh'],
        audience: 'Pharmacies, medicine shops, healthcare retail counters and multi-branch pharmacy businesses.',
        image: '/assets/LandingImage/updated/stock-report.webp',
        highlights: ['Low-stock alerts', 'Supplier purchase tracking', 'Customer history', 'Inventory reports'],
        modules: commonModules,
        useCases: ['Know which medicines need reorder', 'Track supplier bills and dues', 'See daily sales by product', 'Reduce manual billing mistakes'],
        faq: [
            { question: 'Can a pharmacy track low stock?', answer: 'Yes. You can set low-stock thresholds and see alerts before important items run out.' },
            { question: 'Can I manage suppliers?', answer: 'Yes. Supplier profiles, purchase orders, payments and dues are supported.' },
            { question: 'Can I see pharmacy sales reports?', answer: 'Yes. Sales, stock, purchase and profit-related reports are available.' },
        ],
    },
    {
        slug: 'grocery-pos-software-bangladesh',
        title: 'Grocery POS Software Bangladesh',
        metaTitle: 'Grocery POS Software Bangladesh | Barcode Billing & Stock | AndgatePOS',
        metaDescription:
            'Grocery POS software in Bangladesh for barcode billing, stock management, supplier purchases, customer dues and daily sales reports.',
        h1: 'Grocery POS Software for Barcode Billing and Stock',
        eyebrow: 'Grocery and Superstore POS',
        intro:
            'Speed up grocery checkout, keep stock counts updated, manage supplier purchases and see daily sales without manual khata work.',
        banglaIntro:
            'মুদি দোকান বা সুপারশপে দ্রুত বারকোড বিল, স্টক আপডেট, সাপ্লায়ার হিসাব আর দৈনিক বিক্রির রিপোর্ট একসাথে পাবেন।',
        primaryKeyword: 'grocery POS software Bangladesh',
        secondaryKeywords: ['supermarket software Bangladesh', 'grocery billing software Bangladesh', 'barcode POS software Bangladesh', 'mini mart POS software Bangladesh', 'barcode billing software Bangladesh'],
        audience: 'Grocery stores, mini marts, super shops and neighborhood retail counters.',
        image: '/assets/LandingImage/updated/bulk-upload.webp',
        highlights: ['Barcode checkout', 'Bulk product import', 'Supplier dues', 'Low-stock reorder alerts'],
        modules: commonModules,
        useCases: ['Scan products quickly at checkout', 'Import product lists from Excel', 'Track stock by category', 'Manage supplier payments and purchase orders'],
        faq: [
            { question: 'Can I use barcode scanning?', answer: 'Yes. AndgatePOS supports barcode and camera scanning for faster grocery checkout.' },
            { question: 'Can I import many grocery products at once?', answer: 'Yes. Bulk Excel import helps upload products faster.' },
            { question: 'Can I track supplier dues?', answer: 'Yes. Supplier dues and payments can be tracked from purchase workflows.' },
        ],
    },
    {
        slug: 'inventory-management-software-bangladesh',
        title: 'Inventory Management Software Bangladesh',
        metaTitle: 'Inventory Management Software Bangladesh | Stock Control | AndgatePOS',
        metaDescription:
            'Inventory management software in Bangladesh for stock alerts, product variants, serials, purchase orders, barcode labels and inventory reports.',
        h1: 'Inventory Management Software for Bangladeshi Businesses',
        eyebrow: 'Stock Control',
        intro:
            'Know what is available, what is selling, what needs reorder and where your stock value is sitting across stores.',
        banglaIntro:
            'কোন পণ্য আছে, কোনটা শেষ হচ্ছে, কোনটা বেশি বিক্রি হচ্ছে আর কোন শাখায় কত স্টক আছে — সব পরিষ্কারভাবে দেখুন।',
        primaryKeyword: 'inventory management software Bangladesh',
        secondaryKeywords: ['stock management software Bangladesh', 'inventory software Bangladesh', 'warehouse stock software Bangladesh', 'inventory and billing software Bangladesh'],
        audience: 'Retailers, wholesalers, multi-branch stores, electronics shops, pharmacies and product-heavy businesses.',
        image: '/assets/LandingImage/updated/product-create.webp',
        highlights: ['Real-time stock', 'Purchase orders', 'Barcode labels', 'Stock valuation reports'],
        modules: commonModules,
        useCases: ['Set reorder thresholds', 'Track product movement', 'Manage stock adjustments with reasons', 'See idle products and stock value'],
        faq: [
            { question: 'Can I set low-stock alerts?', answer: 'Yes. You can set thresholds and see low-stock products in reports and dashboards.' },
            { question: 'Can I manage multiple stores?', answer: 'Yes. Stock can be viewed and managed across multiple store locations.' },
            { question: 'Can I print product labels?', answer: 'Yes. Barcode and QR labels can be generated and printed.' },
        ],
    },
    {
        slug: 'billing-software-bangladesh',
        title: 'Billing Software Bangladesh',
        metaTitle: 'Billing Software Bangladesh | POS Invoice & Receipt | AndgatePOS',
        metaDescription:
            'Billing software in Bangladesh for POS invoices, receipts, discounts, VAT/tax, bKash/Nagad payment tracking and customer dues.',
        h1: 'Billing Software in Bangladesh for Shops and Retail Counters',
        eyebrow: 'Digital Billing',
        intro:
            'Create bills quickly, apply discounts, record payments, print receipts and keep every sale searchable for future reporting.',
        banglaIntro:
            'দোকানের বিল দ্রুত তৈরি করুন, ডিসকাউন্ট দিন, পেমেন্ট রেকর্ড করুন, রসিদ প্রিন্ট করুন আর সব বিক্রির হিসাব সংরক্ষণ করুন।',
        primaryKeyword: 'billing software Bangladesh',
        secondaryKeywords: ['shop billing software Bangladesh', 'invoice software Bangladesh', 'POS billing software Bangladesh', 'retail billing software Bangladesh', 'barcode billing software Bangladesh'],
        audience: 'Retail counters, service shops, pharmacies, grocery stores, fashion stores and electronics shops.',
        image: '/assets/LandingImage/updated/sales-report.webp',
        highlights: ['Instant invoices', 'Receipt printing', 'Payment status tracking', 'VAT and tax reports'],
        modules: commonModules,
        useCases: ['Replace handwritten cash memos', 'Track paid, partial and due payments', 'Print invoices for customers', 'Review invoice history anytime'],
        faq: [
            { question: 'Can I print customer invoices?', answer: 'Yes. AndgatePOS can print receipts and invoices from checkout and order history.' },
            { question: 'Can I track due payments?', answer: 'Yes. Paid, unpaid and partial payment statuses are supported.' },
            { question: 'Does it support VAT or tax reports?', answer: 'Yes. Tax-related reports and invoice records are available.' },
        ],
    },
];

export const landingPageSlugs = landingPages.map((page) => page.slug);

export function getLandingPage(slug: string) {
    return landingPages.find((page) => page.slug === slug);
}
