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

const makePage = (
    slug: string,
    title: string,
    primaryKeyword: string,
    h1: string,
    intro: string,
    audience: string,
    highlights: string[],
    useCases: string[],
    faq: Array<{ question: string; answer: string }>,
    secondaryKeywords: string[] = [],
    image = '/assets/LandingImage/updated/pos.webp'
): LandingPage => ({
    slug,
    title,
    metaTitle: `${title} | AndgatePOS`,
    metaDescription: `${intro} Built for Bangladeshi SMEs with billing, stock, reports, local payments, training and demo support.`,
    h1,
    eyebrow: 'Bangladesh SME POS',
    intro,
    banglaIntro: 'বাংলাদেশি SME ব্যবসার জন্য AndgatePOS বিলিং, স্টক, রিপোর্ট, লোকাল পেমেন্ট, ট্রেনিং ও ডেমো সাপোর্ট এক জায়গায় দেয়।',
    primaryKeyword,
    secondaryKeywords,
    audience,
    image,
    highlights,
    modules: commonModules,
    useCases,
    faq,
});

const seoExpansionPages: LandingPage[] = [
    makePage(
        'fashion-shop-pos-software',
        'Fashion Shop POS Software',
        'fashion shop POS software',
        'Fashion Shop POS Software for Clothing Stores in Bangladesh',
        'AndgatePOS helps fashion and clothing shops manage size, color, style, barcode billing, customer dues, stock movement and daily sales reports.',
        'Fashion houses, boutiques, clothing stores, footwear shops and lifestyle retailers.',
        ['Size and color variants', 'Barcode labels for clothing items', 'Customer due tracking', 'Branch-wise sales reports'],
        ['Track size and color stock clearly', 'Print labels for new collections', 'See best-selling styles', 'Manage staff access at the counter'],
        [
            { question: 'Can AndgatePOS manage size and color variants?', answer: 'Yes. Fashion shops can manage variants such as size, color, design and model so stock stays easier to understand.' },
            { question: 'Can I print barcode labels for clothing items?', answer: 'Yes. Barcode and QR labels can be generated for products and used during checkout.' },
            { question: 'Is AndgatePOS useful for boutiques?', answer: 'Yes. It fits boutiques and clothing stores that need billing, stock visibility, dues and reports.' },
        ],
        ['clothing store POS Bangladesh', 'boutique POS software Bangladesh', 'fashion inventory software Bangladesh'],
        '/assets/LandingImage/updated/products.webp'
    ),
    makePage(
        'electronics-shop-pos-software',
        'Electronics Shop POS Software',
        'electronics shop POS software',
        'Electronics Shop POS Software for Serial, Warranty and Stock',
        'AndgatePOS helps electronics shops track serial products, warranty-aware sales, supplier purchases, customer history, stock value and profit reports.',
        'Mobile shops, electronics stores, gadget shops, computer accessories retailers and appliance sellers.',
        ['Serial product tracking', 'Warranty-aware sales workflow', 'Supplier purchase records', 'Profit and stock reports'],
        ['Track serial numbers where needed', 'Keep customer purchase history', 'Monitor high-value stock', 'Record cash, card and mobile payments'],
        [
            { question: 'Can electronics shops track serial products?', answer: 'Yes. AndgatePOS supports serial-based product workflows for items that need individual tracking.' },
            { question: 'Can I manage warranty information?', answer: 'Warranty-related product details can be carried through the product and sales workflow where configured.' },
            { question: 'Does it support supplier purchases?', answer: 'Yes. Purchase orders, supplier dues and stock updates are part of the inventory workflow.' },
        ],
        ['mobile shop software Bangladesh', 'electronics inventory software Bangladesh', 'serial stock POS Bangladesh'],
        '/assets/LandingImage/updated/stock-report.webp'
    ),
    makePage(
        'cloud-pos-software-bangladesh',
        'Cloud POS Software Bangladesh',
        'cloud POS software Bangladesh',
        'Cloud POS Software in Bangladesh for Shops and Multi-Branch SMEs',
        'AndgatePOS is cloud POS software for Bangladeshi retailers that need browser access, centralized inventory, branch control, online orders and business reports.',
        'Single-shop retailers, growing SMEs, multi-branch businesses and owners who want remote access.',
        ['Access from browser', 'Centralized store data', 'Multi-branch ready', 'Online store connection'],
        ['Check sales from outside the shop', 'Manage branches in one account', 'Keep POS and online stock connected', 'Avoid desktop-only software limits'],
        [
            { question: 'What is cloud POS software?', answer: 'Cloud POS software runs through the internet and stores business data securely online so owners can access sales, stock and reports from supported devices.' },
            { question: 'Is cloud POS suitable for Bangladesh?', answer: 'Yes, especially for businesses that want remote access, multi-branch visibility and easier software updates.' },
            { question: 'Does AndgatePOS also support offline counter selling?', answer: 'The POS workflow is designed to continue counter sales during internet interruptions and sync when the connection returns.' },
        ],
        ['web based POS Bangladesh', 'online POS software Bangladesh', 'cloud retail software Bangladesh'],
        '/assets/LandingImage/updated/dashboard.webp'
    ),
    makePage(
        'offline-pos-software-bangladesh',
        'Offline POS Software Bangladesh',
        'offline POS software Bangladesh',
        'Offline POS Software in Bangladesh for Internet-Unstable Shops',
        'AndgatePOS is built for shops that cannot stop selling when internet drops, with PWA-based counter workflows, local order queueing and later sync.',
        'Retail counters, grocery shops, pharmacies and rural or semi-urban stores with unstable internet.',
        ['Offline counter selling', 'Queued order sync', 'PWA install support', 'Local-first checkout resilience'],
        ['Keep selling during internet outages', 'Queue orders locally', 'Sync when internet returns', 'Reduce downtime at busy counters'],
        [
            { question: 'Can AndgatePOS work offline?', answer: 'The POS counter workflow is designed to keep selling during internet interruption and sync queued work when connection returns.' },
            { question: 'Why does offline POS matter in Bangladesh?', answer: 'Many shops face unstable broadband or mobile data. Offline POS helps the counter continue serving customers instead of stopping sales.' },
            { question: 'Is offline mode a replacement for internet?', answer: 'No. Internet is still needed for sync, setup and cloud access, but offline mode reduces interruption during checkout.' },
        ],
        ['PWA POS Bangladesh', 'offline billing software Bangladesh', 'POS without internet Bangladesh'],
        '/assets/LandingImage/updated/mobile-pos.webp'
    ),
    makePage(
        'pos-system-for-small-business',
        'POS System for Small Business',
        'POS system for small business',
        'POS System for Small Businesses in Bangladesh',
        'AndgatePOS gives small Bangladeshi shops a practical way to move from khata or Excel to digital billing, stock, dues, reports and online selling.',
        'Small retail shops, new entrepreneurs, family businesses and SMEs starting digital operations.',
        ['Free starting option', 'Simple checkout workflow', 'Customer and supplier dues', 'Training and demo support'],
        ['Start digital billing without a large upfront cost', 'Train staff gradually', 'Understand daily sales and profit', 'Upgrade as the shop grows'],
        [
            { question: 'Is AndgatePOS good for small businesses?', answer: 'Yes. It is designed so small shops can start with core POS and inventory, then add more controls as they grow.' },
            { question: 'Do I need accounting knowledge?', answer: 'No. The POS workflow is built for shop owners and staff, with reports that are easier to read than manual spreadsheets.' },
            { question: 'Can I start free?', answer: 'Yes. AndgatePOS has a free starting option for businesses that want to try the workflow first.' },
        ],
        ['small business POS Bangladesh', 'shop management software Bangladesh', 'SME POS Bangladesh'],
        '/assets/LandingImage/updated/dashboard.webp'
    ),
    makePage(
        'barcode-pos-software-bangladesh',
        'Barcode POS Software Bangladesh',
        'barcode POS software Bangladesh',
        'Barcode POS Software in Bangladesh for Faster Checkout',
        'AndgatePOS supports barcode and camera scanning, product labels, fast checkout, stock updates and invoice printing for Bangladeshi retail shops.',
        'Grocery stores, super shops, pharmacies, fashion shops, electronics stores and product-heavy retailers.',
        ['Barcode and camera scanning', 'Product label printing', 'Faster checkout', 'Automatic stock updates'],
        ['Reduce typing at checkout', 'Improve billing accuracy', 'Print labels for shelves or products', 'Update stock after every sale'],
        [
            { question: 'Does AndgatePOS support barcode scanning?', answer: 'Yes. Barcode scanning and camera-based scanning can be used to speed up checkout where products are configured with codes.' },
            { question: 'Can I print barcode labels?', answer: 'Yes. Product label workflows support barcode or QR labels.' },
            { question: 'Which shops need barcode POS?', answer: 'Grocery stores, super shops, pharmacies, fashion stores and electronics shops benefit most from barcode checkout.' },
        ],
        ['barcode billing software Bangladesh', 'barcode inventory software Bangladesh', 'POS scanner software Bangladesh'],
        '/assets/LandingImage/updated/bulk-upload.webp'
    ),
    makePage(
        'sales-management-software-bangladesh',
        'Sales Management Software Bangladesh',
        'sales management software Bangladesh',
        'Sales Management Software for Bangladeshi Retail Businesses',
        'AndgatePOS helps business owners track sales, returns, payment methods, customer dues, expenses, profit and branch performance from one dashboard.',
        'Retailers, wholesalers, multi-branch SMEs, shop owners and managers who need clearer sales control.',
        ['Sales reports', 'Payment breakdown', 'Customer dues', 'Profit and loss visibility'],
        ['Track daily and monthly sales', 'See cash vs bKash/Nagad/card collections', 'Review customer due balances', 'Understand which products drive revenue'],
        [
            { question: 'Can AndgatePOS track daily sales?', answer: 'Yes. Daily sales, order history, payment method breakdown and profit-related reports are available.' },
            { question: 'Can I see customer dues?', answer: 'Yes. Customer due and partial payment tracking help owners follow up clearly.' },
            { question: 'Does it support branch-wise sales?', answer: 'Yes. Multi-store businesses can review sales and stock by store when configured.' },
        ],
        ['retail sales software Bangladesh', 'shop sales report software Bangladesh', 'business reporting software Bangladesh'],
        '/assets/LandingImage/updated/sales-report.webp'
    ),
    makePage(
        'multi-branch-pos-software',
        'Multi-Branch POS Software',
        'multi-branch POS software',
        'Multi-Branch POS Software for Growing Bangladeshi SMEs',
        'AndgatePOS helps owners manage multiple shops with centralized products, branch-wise inventory, staff permissions, sales reports and cloud access.',
        'Growing retailers, chain shops, pharmacies, fashion brands, grocery groups and SMEs expanding to new locations.',
        ['Branch-wise stock', 'Centralized reporting', 'Staff roles', 'Cloud access for owners'],
        ['Compare store performance', 'Control staff permissions by role', 'See inventory by branch', 'Open new branches without changing software'],
        [
            { question: 'Can AndgatePOS manage multiple branches?', answer: 'Yes. AndgatePOS is designed for businesses that need multiple stores, staff roles and branch-wise reporting.' },
            { question: 'Can I see each branch separately?', answer: 'Yes. Store-level workflows help separate branch sales and inventory while keeping owner visibility centralized.' },
            { question: 'Is multi-branch required?', answer: 'No. A business can start with one store and add more later.' },
        ],
        ['multi store POS Bangladesh', 'branch management software Bangladesh', 'retail chain POS Bangladesh'],
        '/assets/LandingImage/updated/dashboard.webp'
    ),
    makePage(
        'andgatepos-vs-traditional-pos',
        'AndgatePOS vs Traditional POS',
        'AndgatePOS vs traditional POS',
        'AndgatePOS vs Traditional POS Software in Bangladesh',
        'Compare AndgatePOS with traditional desktop POS: cloud access, PWA offline workflows, online store connection, courier support, subscriptions and easier updates.',
        'Shop owners comparing cloud SaaS POS with desktop or license-based POS software.',
        ['Cloud access', 'PWA offline workflow', 'Hawkeri online store connection', 'Automatic updates'],
        ['Avoid desktop-only limitations', 'Manage online and counter sales together', 'Start with subscription pricing', 'Use branch and staff controls as you grow'],
        [
            { question: 'How is AndgatePOS different from traditional POS?', answer: 'Traditional POS is often desktop or license based. AndgatePOS is cloud-first with POS, inventory, reports, online store connection and offline counter resilience.' },
            { question: 'Is traditional POS bad?', answer: 'No. It can work for simple offline billing. AndgatePOS is stronger when a business needs remote access, ecommerce and growth workflows.' },
            { question: 'Can I migrate gradually?', answer: 'Yes. Businesses can add products, test checkout and train staff before fully moving operations.' },
        ],
        ['cloud POS vs traditional POS Bangladesh', 'desktop POS alternative Bangladesh', 'SaaS POS Bangladesh'],
        '/assets/LandingImage/updated/pos.webp'
    ),
    makePage(
        'andgatepos-features',
        'AndgatePOS Features',
        'AndgatePOS features',
        'AndgatePOS Features for POS, Inventory, Reports and eCommerce',
        'Explore AndgatePOS features for billing, inventory, barcode scanning, local payments, purchase orders, reports, multi-branch control and Hawkeri online stores.',
        'Bangladeshi SMEs evaluating the full AndgatePOS feature set before starting a demo or subscription.',
        ['POS billing', 'Inventory and purchase orders', '20+ reports', 'Hawkeri ecommerce connection'],
        ['Understand the full product scope', 'Match features to your shop type', 'Plan staff training', 'Choose the right subscription stage'],
        [
            { question: 'What features does AndgatePOS include?', answer: 'Core features include POS billing, inventory, product labels, purchases, local payment tracking, reports, staff permissions, customer/supplier records and online store connection.' },
            { question: 'Does it include reporting?', answer: 'Yes. Sales, stock, payment, tax and profit-related reports are available.' },
            { question: 'Does AndgatePOS connect with ecommerce?', answer: 'Yes. AndgatePOS connects with Hawkeri online store workflows for businesses selling online.' },
        ],
        ['POS software features Bangladesh', 'AndgatePOS inventory features', 'AndgatePOS reports'],
        '/assets/LandingImage/updated/dashboard.webp'
    ),
    makePage(
        'andgatepos-pricing',
        'AndgatePOS Pricing',
        'AndgatePOS pricing',
        'AndgatePOS Pricing for Bangladeshi Shops and SMEs',
        'Understand AndgatePOS pricing, free starting option, monthly SaaS upgrade path, demo support, training and what to consider before choosing a plan.',
        'Shop owners, SMEs and growing retailers comparing POS subscription cost and business value.',
        ['Free starting option', 'Monthly SaaS model', 'Upgrade as you grow', 'Demo and training support'],
        ['Estimate your POS budget', 'Start free before upgrading', 'Choose based on users and branches', 'Avoid paying for features before you need them'],
        [
            { question: 'Does AndgatePOS have a free plan?', answer: 'Yes. A free starting option is available so businesses can test core workflows before upgrading.' },
            { question: 'What affects pricing?', answer: 'Pricing depends on business needs such as users, branches, reporting, controls, ecommerce and support requirements.' },
            { question: 'Where can I see pricing plans?', answer: 'The main pricing page is available at /pricing, and businesses can request a demo for plan guidance.' },
        ],
        ['POS subscription Bangladesh', 'AndgatePOS price', 'POS software monthly price Bangladesh'],
        '/assets/LandingImage/updated/subscription.webp'
    ),
    makePage(
        'andgatepos-demo',
        'AndgatePOS Demo',
        'AndgatePOS demo',
        'AndgatePOS Demo for Bangladeshi Retail Shops',
        'Request or start an AndgatePOS demo to see POS billing, stock, reports, barcode workflows, local payments, offline mode and online store connection.',
        'Business owners and teams that want to test AndgatePOS before adopting it in a live shop.',
        ['Product walkthrough', 'Shop workflow setup', 'Training guidance', 'Subscription consultation'],
        ['See how checkout works', 'Review inventory and reports', 'Ask setup questions', 'Plan staff onboarding'],
        [
            { question: 'Can I get an AndgatePOS demo?', answer: 'Yes. Businesses can use the public signup/contact flow to request help, training or a product walkthrough.' },
            { question: 'What should I prepare before a demo?', answer: 'Prepare your shop type, product count, branch count, payment methods and current pain points.' },
            { question: 'Can staff join the demo?', answer: 'Yes. Including counter staff or managers helps evaluate real workflow fit.' },
        ],
        ['POS software demo Bangladesh', 'AndgatePOS training', 'POS onboarding Bangladesh'],
        '/assets/LandingImage/updated/pos.webp'
    ),
    makePage(
        'faq',
        'AndgatePOS FAQ',
        'AndgatePOS FAQ',
        'AndgatePOS FAQ for Bangladesh POS Software Buyers',
        'Answers to common AndgatePOS questions about POS billing, inventory, offline mode, pricing, training, barcode support, reports and ecommerce connection.',
        'Shop owners, SMEs, managers and staff evaluating AndgatePOS before signup or demo.',
        ['Buyer questions answered', 'Offline and pricing clarity', 'Feature explanations', 'Demo and training guidance'],
        ['Understand if AndgatePOS fits your shop', 'Compare with manual or traditional POS', 'Plan setup and training', 'Know what to ask before subscribing'],
        [
            { question: 'What is AndgatePOS?', answer: 'AndgatePOS is Bangladesh-focused POS software for billing, inventory, reports, payments, customer/supplier records and ecommerce-connected shop operations.' },
            { question: 'Who should use AndgatePOS?', answer: 'Retail shops, grocery stores, pharmacies, fashion shops, electronics shops, restaurants and multi-branch SMEs can use AndgatePOS.' },
            { question: 'Why choose AndgatePOS for Bangladesh?', answer: 'It supports local workflows such as bKash/Nagad payment tracking, customer dues, offline counter resilience, Bangla-friendly support and affordable SaaS adoption.' },
            { question: 'Does AndgatePOS support barcode and printing?', answer: 'Yes. Barcode scanning, product labels and receipt/invoice printing are supported where configured.' },
            { question: 'Does AndgatePOS support multi-branch businesses?', answer: 'Yes. Businesses can start with one store and expand into multi-store workflows with staff roles and branch-wise reporting.' },
        ],
        ['AndgatePOS questions', 'POS software FAQ Bangladesh', 'AndgatePOS support'],
        '/assets/LandingImage/updated/dashboard.webp'
    ),
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
    ...seoExpansionPages,
];

export const landingPageSlugs = landingPages.map((page) => page.slug);

export function getLandingPage(slug: string) {
    return landingPages.find((page) => page.slug === slug);
}
