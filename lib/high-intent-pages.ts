export type HighIntentSeoPage = {
    path: string;
    title: string;
    metaTitle: string;
    metaDescription: string;
    h1: string;
    eyebrow: string;
    intro: string;
    banglaIntro: string;
    primaryKeyword: string;
    secondaryKeywords: string[];
    image: string;
    verdict: string;
    comparison: Array<{ label: string; oldWay: string; andgate: string }>;
    reasons: Array<{ title: string; description: string }>;
    faq: Array<{ question: string; answer: string }>;
    bn: {
        title: string;
        h1: string;
        eyebrow: string;
        intro: string;
        verdict: string;
        comparison: Array<{ label: string; oldWay: string; andgate: string }>;
        reasons: Array<{ title: string; description: string }>;
        faq: Array<{ question: string; answer: string }>;
    };
};

export const highIntentPages: HighIntentSeoPage[] = [
    {
        path: '/compare/andgatepos-vs-manual-register',
        title: 'AndgatePOS vs Manual Register',
        metaTitle: 'AndgatePOS vs Manual Register | Digital POS for Bangladesh Shops',
        metaDescription:
            'Compare AndgatePOS with manual register books for Bangladeshi shops. See how digital POS improves billing, inventory, reports, customer dues and daily business control.',
        h1: 'AndgatePOS vs Manual Register for Bangladesh Shops',
        eyebrow: 'Comparison',
        intro:
            'Manual register books work when a shop is tiny, but they make it hard to track stock, profit, dues and sales history as the business grows.',
        banglaIntro:
            'খাতায় হিসাব রাখা ছোট দোকানে শুরুতে চলে, কিন্তু দোকান বড় হলে স্টক, বাকি, লাভ আর দৈনিক বিক্রির হিসাব মেলানো কঠিন হয়ে যায়।',
        primaryKeyword: 'AndgatePOS vs manual register',
        secondaryKeywords: ['digital POS vs manual register Bangladesh', 'shop register alternative Bangladesh', 'POS software for shop accounting', 'manual khata alternative Bangladesh'],
        image: '/assets/LandingImage/updated/pos.webp',
        verdict:
            'Choose AndgatePOS if you want searchable sales records, stock alerts, payment tracking and reports without depending on handwritten khata.',
        comparison: [
            { label: 'Billing speed', oldWay: 'Write items and calculate totals manually.', andgate: 'Scan products, apply discounts and print receipts quickly.' },
            { label: 'Stock tracking', oldWay: 'Stock count depends on memory or manual checking.', andgate: 'Stock updates automatically after sales and purchases.' },
            { label: 'Customer dues', oldWay: 'Dues are scattered across notebooks.', andgate: 'Customer due, partial payment and balance stay in one profile.' },
            { label: 'Reports', oldWay: 'Daily and monthly reports take manual calculation.', andgate: 'Sales, profit, stock and payment reports are ready anytime.' },
        ],
        reasons: [
            { title: 'Less calculation mistakes', description: 'Digital billing reduces manual addition errors at the counter.' },
            { title: 'Better stock visibility', description: 'Know which items are available, low, idle or need reorder.' },
            { title: 'Cleaner business records', description: 'Every sale, payment, return and purchase stays searchable.' },
        ],
        faq: [
            { question: 'Is manual register enough for a small shop?', answer: 'It can work at the beginning, but stock, dues and reports become difficult as product count and sales volume grow.' },
            { question: 'Can AndgatePOS replace daily cash memo books?', answer: 'Yes. AndgatePOS can create digital bills, print receipts and keep sales history.' },
            { question: 'Will my staff need accounting knowledge?', answer: 'No. The POS workflow is designed for regular shop staff and business owners.' },
        ],
        bn: {
            title: 'AndgatePOS বনাম খাতার হিসাব',
            h1: 'বাংলাদেশি দোকানের জন্য AndgatePOS বনাম খাতার হিসাব',
            eyebrow: 'তুলনা',
            intro: 'খাতায় হিসাব রাখা ছোট দোকানে শুরুতে চলে, কিন্তু দোকান বড় হলে স্টক, বাকি, লাভ আর দৈনিক বিক্রির হিসাব মেলানো কঠিন হয়ে যায়।',
            verdict: 'যদি হাতে লেখা খাতার বদলে বিক্রির রেকর্ড, স্টক অ্যালার্ট, পেমেন্ট ট্র্যাকিং আর রিপোর্ট এক জায়গায় চান, AndgatePOS ভালো পছন্দ।',
            comparison: [
                { label: 'বিল করার গতি', oldWay: 'পণ্য লিখে হাতে হাতে মোট হিসাব করতে হয়।', andgate: 'পণ্য স্ক্যান, ডিসকাউন্ট আর রসিদ প্রিন্ট দ্রুত করা যায়।' },
                { label: 'স্টক ট্র্যাকিং', oldWay: 'স্টক জানতে স্মৃতি বা হাতে গোনা হিসাবের উপর নির্ভর করতে হয়।', andgate: 'বিক্রি ও ক্রয়ের সাথে সাথে স্টক আপডেট হয়।' },
                { label: 'কাস্টমারের বাকি', oldWay: 'বাকির হিসাব বিভিন্ন খাতায় ছড়িয়ে থাকে।', andgate: 'কাস্টমারের বাকি, আংশিক পেমেন্ট আর ব্যালেন্স এক প্রোফাইলে থাকে।' },
                { label: 'রিপোর্ট', oldWay: 'দৈনিক বা মাসিক রিপোর্ট বানাতে হাতে হিসাব করতে হয়।', andgate: 'বিক্রি, লাভ, স্টক আর পেমেন্ট রিপোর্ট যেকোনো সময় দেখা যায়।' },
            ],
            reasons: [
                { title: 'হিসাবের ভুল কমে', description: 'ডিজিটাল বিলিং কাউন্টারে যোগ-বিয়োগের ভুল কমাতে সাহায্য করে।' },
                { title: 'স্টক পরিষ্কার দেখা যায়', description: 'কোন পণ্য আছে, কম আছে, পড়ে আছে বা রি-অর্ডার দরকার তা বোঝা যায়।' },
                { title: 'রেকর্ড গুছানো থাকে', description: 'প্রতিটি বিক্রি, পেমেন্ট, রিটার্ন আর ক্রয় পরে খুঁজে পাওয়া যায়।' },
            ],
            faq: [
                { question: 'ছোট দোকানের জন্য খাতার হিসাব কি যথেষ্ট?', answer: 'শুরুতে চলতে পারে, কিন্তু পণ্য ও বিক্রি বাড়লে স্টক, বাকি আর রিপোর্ট সামলানো কঠিন হয়ে যায়।' },
                { question: 'AndgatePOS কি ক্যাশ মেমো খাতা রিপ্লেস করতে পারে?', answer: 'হ্যাঁ। AndgatePOS ডিজিটাল বিল তৈরি, রসিদ প্রিন্ট আর বিক্রির ইতিহাস সংরক্ষণ করতে পারে।' },
                { question: 'কর্মচারীদের কি অ্যাকাউন্টিং জানতে হবে?', answer: 'না। POS ফ্লো সাধারণ দোকান কর্মী ও ব্যবসার মালিকদের জন্য সহজভাবে বানানো।' },
            ],
        },
    },
    {
        path: '/compare/pos-vs-excel',
        title: 'POS vs Excel',
        metaTitle: 'POS vs Excel for Shop Management | Bangladesh Business Guide',
        metaDescription:
            'Compare POS software and Excel for Bangladeshi shops. Learn when Excel is enough and when a POS system is better for billing, inventory, dues and reports.',
        h1: 'POS Software vs Excel for Shop Management',
        eyebrow: 'Comparison',
        intro:
            'Excel is useful for simple lists, but POS software is built for live checkout, stock updates, receipts, staff access and daily reports.',
        banglaIntro:
            'Excel পণ্যের তালিকা রাখার জন্য ভালো, কিন্তু লাইভ বিল, স্টক আপডেট, রসিদ, কর্মচারী অ্যাক্সেস আর রিপোর্টের জন্য POS সফটওয়্যার বেশি কার্যকর।',
        primaryKeyword: 'POS vs Excel',
        secondaryKeywords: ['POS software vs Excel Bangladesh', 'Excel inventory alternative Bangladesh', 'shop management software vs spreadsheet', 'Excel stock management alternative Bangladesh'],
        image: '/assets/LandingImage/updated/bulk-upload.webp',
        verdict:
            'Use Excel for planning. Use AndgatePOS when billing, inventory, payments and reports need to happen during real business operations.',
        comparison: [
            { label: 'Checkout', oldWay: 'Excel is not built for fast billing or receipt printing.', andgate: 'POS checkout handles billing, discounts, payments and receipts.' },
            { label: 'Inventory updates', oldWay: 'Staff must update sheets manually.', andgate: 'Stock updates from sales, purchases and adjustments.' },
            { label: 'Data control', oldWay: 'Files can be copied, overwritten or changed accidentally.', andgate: 'Role permissions control what each staff member can do.' },
            { label: 'Reporting', oldWay: 'Reports depend on formulas and manual cleanup.', andgate: 'Built-in reports are ready without spreadsheet formulas.' },
        ],
        reasons: [
            { title: 'Real-time workflow', description: 'POS software updates business records while sales happen.' },
            { title: 'Fewer spreadsheet risks', description: 'No broken formulas, duplicate files or overwritten rows.' },
            { title: 'Better for teams', description: 'Multiple staff can work with clear roles and permissions.' },
        ],
        faq: [
            { question: 'Can I manage inventory in Excel?', answer: 'Yes for very small lists, but it becomes error-prone when sales, purchases and multiple staff are involved.' },
            { question: 'Why is POS better than Excel for billing?', answer: 'POS software is built for checkout, payment tracking, receipt printing and automatic stock updates.' },
            { question: 'Can I import products from Excel to AndgatePOS?', answer: 'Yes. AndgatePOS supports bulk product import workflows.' },
        ],
        bn: {
            title: 'POS বনাম Excel',
            h1: 'দোকান ম্যানেজমেন্টে POS সফটওয়্যার বনাম Excel',
            eyebrow: 'তুলনা',
            intro: 'Excel পণ্যের তালিকা রাখার জন্য ভালো, কিন্তু লাইভ বিল, স্টক আপডেট, রসিদ, কর্মচারী অ্যাক্সেস আর রিপোর্টের জন্য POS সফটওয়্যার বেশি কার্যকর।',
            verdict: 'পরিকল্পনা বা সাধারণ তালিকার জন্য Excel ব্যবহার করুন। বাস্তব বিক্রি, স্টক, পেমেন্ট আর রিপোর্ট চালানোর জন্য AndgatePOS ব্যবহার করুন।',
            comparison: [
                { label: 'চেকআউট', oldWay: 'Excel দ্রুত বিল বা রসিদ প্রিন্টের জন্য বানানো নয়।', andgate: 'POS চেকআউটে বিল, ডিসকাউন্ট, পেমেন্ট আর রসিদ একসাথে হয়।' },
                { label: 'স্টক আপডেট', oldWay: 'কর্মচারীদের হাতে শিট আপডেট করতে হয়।', andgate: 'বিক্রি, ক্রয় আর অ্যাডজাস্টমেন্ট থেকে স্টক আপডেট হয়।' },
                { label: 'ডেটা কন্ট্রোল', oldWay: 'ফাইল কপি, ওভাররাইট বা ভুলভাবে বদলে যেতে পারে।', andgate: 'রোল পারমিশন দিয়ে কে কী করতে পারবে নিয়ন্ত্রণ করা যায়।' },
                { label: 'রিপোর্টিং', oldWay: 'রিপোর্ট ফর্মুলা আর ম্যানুয়াল ক্লিনআপের উপর নির্ভর করে।', andgate: 'বিল্ট-ইন রিপোর্ট ফর্মুলা ছাড়াই দেখা যায়।' },
            ],
            reasons: [
                { title: 'রিয়েল-টাইম কাজ', description: 'বিক্রির সময়ই POS ব্যবসার রেকর্ড আপডেট করে।' },
                { title: 'স্প্রেডশিটের ঝুঁকি কম', description: 'ভাঙা ফর্মুলা, ডুপ্লিকেট ফাইল বা ভুলে মুছে ফেলার ঝামেলা কমে।' },
                { title: 'টিমের জন্য ভালো', description: 'একাধিক কর্মচারী রোল ও পারমিশন মেনে কাজ করতে পারে।' },
            ],
            faq: [
                { question: 'Excel দিয়ে কি ইনভেন্টরি ম্যানেজ করা যায়?', answer: 'খুব ছোট তালিকার জন্য যায়, কিন্তু বিক্রি, ক্রয় আর একাধিক কর্মচারী থাকলে ভুলের ঝুঁকি বাড়ে।' },
                { question: 'বিলিংয়ের জন্য POS কেন Excel-এর চেয়ে ভালো?', answer: 'POS চেকআউট, পেমেন্ট ট্র্যাকিং, রসিদ প্রিন্ট আর অটোমেটিক স্টক আপডেটের জন্য বানানো।' },
                { question: 'Excel থেকে পণ্য ইমপোর্ট করা যাবে?', answer: 'হ্যাঁ। AndgatePOS বাল্ক প্রোডাক্ট ইমপোর্ট সাপোর্ট করে।' },
            ],
        },
    },
    {
        path: '/best-pos-software-bangladesh',
        title: 'Best POS Software Bangladesh',
        metaTitle: 'Best POS Software in Bangladesh | What to Look For | AndgatePOS',
        metaDescription:
            'Looking for the best POS software in Bangladesh? Compare must-have features like billing, inventory, bKash/Nagad payments, reports, offline mode and online store support.',
        h1: 'Best POS Software in Bangladesh: What Your Shop Should Look For',
        eyebrow: 'Buyer Guide',
        intro:
            'The best POS software for Bangladesh should match local shop workflows: fast billing, inventory, local payment tracking, reports, staff control and simple onboarding.',
        banglaIntro:
            'বাংলাদেশে ভালো POS সফটওয়্যার হতে হলে দোকানের বাস্তব কাজের সাথে মিল থাকতে হবে — দ্রুত বিল, স্টক, পেমেন্ট, রিপোর্ট আর সহজ ব্যবহার।',
        primaryKeyword: 'best POS software in Bangladesh',
        secondaryKeywords: ['top POS software Bangladesh', 'best retail POS Bangladesh', 'best shop management software Bangladesh', 'POS software price in Bangladesh', 'POS software for small business Bangladesh'],
        image: '/assets/LandingImage/updated/dashboard.webp',
        verdict:
            'AndgatePOS is built for Bangladeshi retailers that need POS, inventory, accounting, payments, reports and a free online store in one system.',
        comparison: [
            { label: 'Local payments', oldWay: 'Many generic systems do not fit bKash/Nagad/Rocket workflows.', andgate: 'Cash, bKash, Nagad, Rocket, Upay, card and bank transfer can be recorded.' },
            { label: 'Inventory', oldWay: 'Basic billing tools often ignore stock depth.', andgate: 'Variants, serials, stock alerts, purchase orders and labels are supported.' },
            { label: 'Reporting', oldWay: 'Some tools only show sales totals.', andgate: '20+ reports cover sales, tax, stock, profit, customers and supplier dues.' },
            { label: 'Growth', oldWay: 'Single-counter tools become limiting.', andgate: 'Multi-store, staff roles and online store support help the business grow.' },
        ],
        reasons: [
            { title: 'Built for Bangladesh', description: 'Local payment methods, Bangla-friendly content and Bangladesh business workflows are considered.' },
            { title: 'Full shop operations', description: 'POS, inventory, supplier, customer, accounting and reporting modules work together.' },
            { title: 'Start small, grow later', description: 'A business can begin simply and add more modules as operations grow.' },
        ],
        faq: [
            { question: 'What is the best POS software in Bangladesh?', answer: 'The best option depends on your business type, but it should include billing, inventory, local payments, reports and support. AndgatePOS covers these needs for many retail workflows.' },
            { question: 'Does the best POS need inventory management?', answer: 'Yes. For product-based shops, POS without inventory creates blind spots in stock and profit.' },
            { question: 'Should POS software support Bangladeshi payment methods?', answer: 'Yes. Cash, bKash, Nagad, Rocket, Upay, card and bank transfer tracking are important for local operations.' },
        ],
        bn: {
            title: 'বাংলাদেশের সেরা POS সফটওয়্যার',
            h1: 'বাংলাদেশে সেরা POS সফটওয়্যার বাছাই করার সময় যা দেখবেন',
            eyebrow: 'বায়ার গাইড',
            intro: 'বাংলাদেশে ভালো POS সফটওয়্যার হতে হলে দোকানের বাস্তব কাজের সাথে মিল থাকতে হবে — দ্রুত বিল, স্টক, পেমেন্ট, রিপোর্ট আর সহজ ব্যবহার।',
            verdict: 'AndgatePOS বাংলাদেশি রিটেইল ব্যবসার জন্য POS, ইনভেন্টরি, হিসাব, পেমেন্ট, রিপোর্ট আর ফ্রি অনলাইন স্টোর এক সিস্টেমে দেয়।',
            comparison: [
                { label: 'লোকাল পেমেন্ট', oldWay: 'অনেক জেনেরিক সিস্টেম বিকাশ/নগদ/রকেটের কাজের ধরনে মানায় না।', andgate: 'ক্যাশ, বিকাশ, নগদ, রকেট, উপায়, কার্ড ও ব্যাংক ট্রান্সফার রেকর্ড করা যায়।' },
                { label: 'ইনভেন্টরি', oldWay: 'বেসিক বিলিং টুলে স্টকের গভীরতা থাকে না।', andgate: 'ভ্যারিয়েন্ট, সিরিয়াল, স্টক অ্যালার্ট, ক্রয় অর্ডার ও লেবেল সাপোর্ট করে।' },
                { label: 'রিপোর্টিং', oldWay: 'কিছু টুল শুধু বিক্রির মোট দেখায়।', andgate: '২০+ রিপোর্টে বিক্রি, ট্যাক্স, স্টক, লাভ, কাস্টমার ও সাপ্লায়ার বাকি দেখা যায়।' },
                { label: 'গ্রোথ', oldWay: 'এক কাউন্টারের টুল বড় হলে সীমাবদ্ধ হয়ে যায়।', andgate: 'মাল্টি-স্টোর, স্টাফ রোল আর অনলাইন স্টোর ব্যবসা বড় করতে সাহায্য করে।' },
            ],
            reasons: [
                { title: 'বাংলাদেশের জন্য তৈরি', description: 'লোকাল পেমেন্ট, বাংলা-ফ্রেন্ডলি কনটেন্ট আর বাংলাদেশের দোকানের কাজের ধরন মাথায় রাখা হয়েছে।' },
                { title: 'দোকানের পূর্ণ অপারেশন', description: 'POS, ইনভেন্টরি, সাপ্লায়ার, কাস্টমার, অ্যাকাউন্টিং আর রিপোর্ট একসাথে কাজ করে।' },
                { title: 'ছোট থেকে শুরু, পরে বড়', description: 'ব্যবসা ছোট অবস্থায় শুরু করে পরে প্রয়োজন অনুযায়ী মডিউল বাড়ানো যায়।' },
            ],
            faq: [
                { question: 'বাংলাদেশে সেরা POS সফটওয়্যার কোনটি?', answer: 'ব্যবসার ধরন অনুযায়ী পছন্দ বদলায়, তবে বিলিং, ইনভেন্টরি, লোকাল পেমেন্ট, রিপোর্ট ও সাপোর্ট থাকা জরুরি। AndgatePOS এসব চাহিদা কভার করে।' },
                { question: 'ভালো POS-এ কি ইনভেন্টরি থাকা দরকার?', answer: 'হ্যাঁ। পণ্যভিত্তিক দোকানে ইনভেন্টরি ছাড়া POS হলে স্টক আর লাভের হিসাব পরিষ্কার থাকে না।' },
                { question: 'বাংলাদেশি পেমেন্ট পদ্ধতি সাপোর্ট করা দরকার?', answer: 'হ্যাঁ। ক্যাশ, বিকাশ, নগদ, রকেট, উপায়, কার্ড ও ব্যাংক ট্রান্সফার ট্র্যাকিং লোকাল অপারেশনের জন্য গুরুত্বপূর্ণ।' },
            ],
        },
    },
    {
        path: '/free-pos-software-bangladesh',
        title: 'Free POS Software Bangladesh',
        metaTitle: 'Free POS Software Bangladesh | Start Free with AndgatePOS',
        metaDescription:
            'Start with free POS software in Bangladesh. AndgatePOS helps shops try billing, inventory, payment tracking and reports before upgrading as the business grows.',
        h1: 'Free POS Software in Bangladesh for Starting Shops',
        eyebrow: 'Free POS Plan',
        intro:
            'A free POS plan helps a shop test digital billing, product setup, inventory and daily sales reports before committing to a paid package.',
        banglaIntro:
            'ফ্রি POS প্ল্যান দিয়ে দোকানদাররা আগে ডিজিটাল বিল, পণ্য সেটআপ, স্টক আর দৈনিক রিপোর্ট ব্যবহার করে দেখতে পারেন।',
        primaryKeyword: 'free POS software Bangladesh',
        secondaryKeywords: ['free POS software in Bangladesh', 'free billing software Bangladesh', 'free shop management software Bangladesh', 'free inventory software Bangladesh'],
        image: '/assets/LandingImage/updated/mobile-pos.webp',
        verdict:
            'Start free with AndgatePOS if you want to try digital POS first, then upgrade when you need more scale, users or advanced controls.',
        comparison: [
            { label: 'Starting cost', oldWay: 'Paid-only software can feel risky before testing.', andgate: 'Start with a free plan and upgrade when ready.' },
            { label: 'Learning curve', oldWay: 'Complex tools slow down staff adoption.', andgate: 'Simple POS workflow helps staff learn faster.' },
            { label: 'Core operations', oldWay: 'Free tools may only do basic billing.', andgate: 'AndgatePOS is designed around billing, stock, payments and reports.' },
            { label: 'Upgrade path', oldWay: 'Many free tools do not scale well.', andgate: 'Move to advanced features as your shop grows.' },
        ],
        reasons: [
            { title: 'Try before paying', description: 'Test the core POS workflow with real products and sales.' },
            { title: 'Reduce setup risk', description: 'Start digital operations without a large upfront commitment.' },
            { title: 'Upgrade only when needed', description: 'Move to paid features as sales volume, users or branches increase.' },
        ],
        faq: [
            { question: 'Is there free POS software in Bangladesh?', answer: 'Yes. AndgatePOS provides a free starting option so businesses can try the workflow.' },
            { question: 'Is free POS enough for every shop?', answer: 'Free POS is good for starting and testing. Growing shops may need more users, reports, controls or multi-store features.' },
            { question: 'Can I upgrade later?', answer: 'Yes. You can start small and upgrade when the business needs more capability.' },
        ],
        bn: {
            title: 'বাংলাদেশে ফ্রি POS সফটওয়্যার',
            h1: 'শুরু করা দোকানের জন্য বাংলাদেশে ফ্রি POS সফটওয়্যার',
            eyebrow: 'ফ্রি POS প্ল্যান',
            intro: 'ফ্রি POS প্ল্যান দিয়ে দোকানদাররা আগে ডিজিটাল বিল, পণ্য সেটআপ, স্টক আর দৈনিক রিপোর্ট ব্যবহার করে দেখতে পারেন।',
            verdict: 'আগে ডিজিটাল POS ব্যবহার করে দেখতে চাইলে AndgatePOS ফ্রি দিয়ে শুরু করুন, পরে ব্যবসা বড় হলে আপগ্রেড করুন।',
            comparison: [
                { label: 'শুরুর খরচ', oldWay: 'টেস্ট করার আগেই পেইড সফটওয়্যার ঝুঁকিপূর্ণ মনে হতে পারে।', andgate: 'ফ্রি প্ল্যান দিয়ে শুরু করে প্রস্তুত হলে আপগ্রেড করা যায়।' },
                { label: 'শেখার সময়', oldWay: 'জটিল টুল কর্মচারীদের শেখা ধীর করে।', andgate: 'সহজ POS ফ্লো কর্মচারীদের দ্রুত শিখতে সাহায্য করে।' },
                { label: 'মূল অপারেশন', oldWay: 'অনেক ফ্রি টুল শুধু বেসিক বিল করে।', andgate: 'AndgatePOS বিলিং, স্টক, পেমেন্ট ও রিপোর্ট মাথায় রেখে বানানো।' },
                { label: 'আপগ্রেড পথ', oldWay: 'অনেক ফ্রি টুল পরে বড় করা কঠিন।', andgate: 'দোকান বড় হলে উন্নত ফিচারে যেতে পারবেন।' },
            ],
            reasons: [
                { title: 'আগে ব্যবহার করে দেখুন', description: 'নিজের পণ্য ও বিক্রি দিয়ে মূল POS ফ্লো টেস্ট করুন।' },
                { title: 'সেটআপ ঝুঁকি কম', description: 'বড় অগ্রিম খরচ ছাড়াই ডিজিটাল অপারেশন শুরু করুন।' },
                { title: 'প্রয়োজনে আপগ্রেড', description: 'বিক্রি, ইউজার বা শাখা বাড়লে পেইড ফিচারে যান।' },
            ],
            faq: [
                { question: 'বাংলাদেশে কি ফ্রি POS সফটওয়্যার আছে?', answer: 'হ্যাঁ। AndgatePOS ফ্রি স্টার্টিং অপশন দেয় যাতে ব্যবসা আগে ফ্লো ব্যবহার করে দেখতে পারে।' },
                { question: 'ফ্রি POS কি সব দোকানের জন্য যথেষ্ট?', answer: 'শুরু ও টেস্ট করার জন্য ভালো। বড় দোকানে বেশি ইউজার, রিপোর্ট, কন্ট্রোল বা মাল্টি-স্টোর ফিচার লাগতে পারে।' },
                { question: 'পরে কি আপগ্রেড করা যাবে?', answer: 'হ্যাঁ। ছোট করে শুরু করে ব্যবসার প্রয়োজন অনুযায়ী আপগ্রেড করতে পারবেন।' },
            ],
        },
    },
];

export const comparePages = highIntentPages.filter((page) => page.path.startsWith('/compare/'));

export function getHighIntentPage(path: string) {
    return highIntentPages.find((page) => page.path === path);
}

export function getComparePage(slug: string) {
    return getHighIntentPage(`/compare/${slug}`);
}
