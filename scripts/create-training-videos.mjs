import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import {
    BANGLADESHI_TTS_PROMPT,
    buildAuditReport,
    enrichLessons,
    formatScriptMarkdown,
    validateTrainingScript,
} from './training-script-engine.mjs';

const BASE_URL = process.env.VIDEO_BASE_URL || 'http://localhost:3000';
const DEMO_EMAIL = process.env.DEMO_EMAIL || 'user@demo.com';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'user123';
const LANG = process.env.VIDEO_LANG || 'bn';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const OUT_DIR = process.env.VIDEO_OUT_DIR || path.join(process.cwd(), 'videos', 'training', timestamp);
const VIEWPORT = {
    width: Number(process.env.VIDEO_WIDTH || '1280'),
    height: Number(process.env.VIDEO_HEIGHT || '720'),
};
const SCENE_SECONDS = Number(process.env.VIDEO_SCENE_SECONDS || '8');
const GOOGLE_TTS_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
const GOOGLE_TTS_LANGUAGE_CODE = process.env.GOOGLE_TTS_LANGUAGE_CODE || 'bn-IN';
const GOOGLE_TTS_VOICE_NAME = process.env.GOOGLE_TTS_VOICE_NAME || '';
const GOOGLE_TTS_SPEAKING_RATE = Number(process.env.GOOGLE_TTS_SPEAKING_RATE || '0.92');
const GOOGLE_TTS_PITCH = Number(process.env.GOOGLE_TTS_PITCH || '0');
const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
const OPENAI_TTS_VOICE = process.env.OPENAI_TTS_VOICE || 'nova';
const OPENAI_TTS_INSTRUCTIONS = process.env.OPENAI_TTS_INSTRUCTIONS || BANGLADESHI_TTS_PROMPT;
const TTS_PROVIDER = process.env.VIDEO_TTS_PROVIDER || (GOOGLE_TTS_CREDENTIALS ? 'google' : process.env.OPENAI_API_KEY ? 'openai' : '');
const VIDEO_STORAGE_STATE = process.env.VIDEO_STORAGE_STATE || '';
const BURN_SUBTITLES = ['1', 'true', 'yes', 'on'].includes(String(process.env.VIDEO_BURN_SUBTITLES || '').toLowerCase());
const SCRIPT_ONLY = ['1', 'true', 'yes', 'on'].includes(String(process.env.TRAINING_SCRIPT_ONLY || '').toLowerCase());
const AUDIT_ONLY = ['1', 'true', 'yes', 'on'].includes(String(process.env.TRAINING_AUDIT_ONLY || '').toLowerCase());
const STRICT_SCRIPT_QUALITY = ['1', 'true', 'yes', 'on'].includes(String(process.env.TRAINING_STRICT_SCRIPT_QUALITY || '').toLowerCase());
const VOICE_AUDIO_DIR = process.env.VOICE_AUDIO_DIR || '';
const FILTER = (process.env.TRAINING_LESSONS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const spoken = (...lines) => lines.join('\n\n');

const lessons = [
    {
        id: 'register-account',
        module: '01-account-access',
        title: 'Create Your AndgatePOS Account',
        path: '/register',
        narration: spoken('প্রথম lesson-এ আমরা account registration দেখবো।', 'Owner name, phone, email, password, store name আর store type ঠিকভাবে দিলে আপনার real store account তৈরি হবে।', 'Registration complete হলে system আপনাকে dashboard-এ নিয়ে যাবে, তারপর setup checklist শুরু করবেন।'),
        steps: ['Register page খুলুন', 'Owner ও store information দিন', 'Trial account তৈরি হলে dashboard check করুন'],
    },
    {
        id: 'login-own-account',
        module: '01-account-access',
        title: 'Login With Your Own Account',
        path: '/login',
        narration: spoken('এবার নিজের account দিয়ে login করা দেখি।', 'Email আর password দিয়ে sign in করুন। Trusted device হলে remember me ব্যবহার করা যায়, কিন্তু shared computer হলে এটা বন্ধ রাখাই ভালো।', 'Login successful হলে dashboard খুলবে।'),
        steps: ['Email ও password দিন', 'Remember me carefully ব্যবহার করুন', 'Login-এর পরে dashboard confirm করুন'],
    },
    {
        id: 'demo-account-login',
        module: '01-account-access',
        title: 'Practice With Demo Account',
        path: '/login',
        narration: spoken('Demo account practice করার জন্য, live business data রাখার জন্য না।', 'Demo দিয়ে POS, product, report, ecommerce flow দেখে নিতে পারেন।', 'কিন্তু real দোকানের কাজ শুরু করার সময় নিজের registered account ব্যবহার করবেন।'),
        steps: ['Demo credential দিয়ে login করুন', 'Practice data দিয়ে feature test করুন', 'Real store-এর data demo-তে রাখবেন না'],
    },
    {
        id: 'first-dashboard-checklist',
        module: '01-account-access',
        title: 'First Dashboard Checklist',
        path: '/dashboard',
        narration: spoken('প্রথমবার dashboard খুললে কিছু basic জিনিস মিলিয়ে নেওয়া দরকার।', 'Store profile, subscription status, role permission, product setup আর POS readiness আগে দেখে নিন।', 'এই checklist follow করলে live operation শুরু করা অনেক smooth হয়।'),
        steps: ['Store profile verify করুন', 'Subscription ও available feature দেখুন', 'প্রথম product, staff, POS setup শুরু করুন'],
    },
    {
        id: 'dashboard-overview',
        module: '02-getting-started',
        title: 'Dashboard Overview',
        path: '/dashboard',
        narration: spoken(
            'আসসালামু আলাইকুম।',
            'আজকে আমরা AndgatePOS-এর dashboard টা দেখবো।',
            'দোকান খুলে বসার পর, মালিক বা manager এখান থেকেই বুঝতে পারবেন আজকে কত বিক্রি হলো, কত order হলো, কোন payment method-এ টাকা আসলো, আর কোন product-এর stock কমে যাচ্ছে।',
            'চলুন, একবার দেখে নেই।'
        ),
        steps: ['আজকের বিক্রি ও অর্ডার দেখুন', 'কম স্টক ও বাকি সিগন্যাল দেখুন', 'তারিখ বা স্টোর বদলে রিপোর্ট মিলিয়ে নিন'],
    },
    {
        id: 'store-profile',
        module: '02-getting-started',
        title: 'Store Profile and Settings',
        path: '/store/setting',
        narration: spoken(
            'এই lesson-এ আমরা store profile আর settings দেখবো।',
            'দোকানের নাম, ঠিকানা, logo, invoice message, payment information এগুলো আগে ঠিক করে রাখলে পরে billing আর report দুটোই অনেক clean থাকে।',
            'বিশেষ করে নতুন দোকান setup করার সময়, এই page টা একবার ধীরে ধীরে মিলিয়ে নেওয়া ভালো।'
        ),
        steps: ['দোকানের তথ্য আপডেট করুন', 'চালান ও রসিদের তথ্য ঠিক করুন', 'পেমেন্ট ও ডিফল্ট সেটিং যাচাই করুন'],
    },
    {
        id: 'roles-permissions',
        module: '02-getting-started',
        title: 'User Roles and Permissions',
        path: '/roles',
        narration: spoken(
            'এবার দেখি role আর permission।',
            'সব staff-কে একই access দেওয়া ঠিক না। Cashier শুধু POS চালাবে, manager report আর stock দেখবে, আর owner সব control রাখবেন।',
            'এভাবে কাজ ভাগ করে দিলে ভুল কমে, আর business data-ও safe থাকে।'
        ),
        steps: ['রোল তৈরি করুন', 'মডিউল অনুযায়ী পারমিশন দিন', 'কর্মীর কাজ বদলালে অ্যাক্সেস আপডেট করুন'],
    },
    {
        id: 'business-os',
        module: '02-business-os',
        title: 'Business OS Command Center',
        path: '/business-os',
        narration: spoken(
            'এটা হচ্ছে Business OS command center।',
            'POS counter-এর কাজ আলাদা, আর owner বা manager-এর daily operation আলাদা।',
            'এই জায়গা থেকে cash closing, petty cash, attendance, service job, customer due, supplier due আর reorder signal সব একসাথে দেখা যায়।',
            'দিনের শুরুতে বা শেষে, এই page টা খুব কাজে লাগে।'
        ),
        steps: ['দৈনিক কাজের সিগন্যাল দেখুন', 'ক্যাশ, হাজিরা ও সার্ভিস জব খুলুন', 'মালিকের ফলোআপ লিস্ট তৈরি করুন'],
    },
    {
        id: 'cash-closing',
        module: '02-business-os',
        title: 'Cash and Counter Closing',
        path: '/business-os',
        narration: spoken(
            'দিনশেষে counter-এর cash মিলানো খুব important।',
            'এখানে opening cash, cash sale, expense, due collection, supplier payment, সব লিখে actual cash-এর সাথে মিলিয়ে দেখা যায়।',
            'যদি expected cash আর হাতে গোনা cash এক না হয়, difference এখানেই ধরা পড়বে।',
            'তারপর manager বা owner approval দিয়ে দিন বন্ধ করতে পারবেন।'
        ),
        steps: ['ওপেনিং ও actual cash লিখুন', 'expected cash-এর সাথে মিল দেখুন', 'ম্যানেজার approval দিয়ে দিন বন্ধ করুন'],
    },
    {
        id: 'petty-cash',
        module: '02-business-os',
        title: 'Petty Cash Requests',
        path: '/business-os',
        narration: spoken(
            'দোকানে ছোট ছোট খরচ প্রায় প্রতিদিনই হয়।',
            'চা, delivery, ছোট repair, জরুরি কেনাকাটা — এগুলো খাতায় লিখলে অনেক সময় হারিয়ে যায়।',
            'Petty cash request করলে owner approve বা reject করতে পারবেন, আর history-ও থেকে যাবে।'
        ),
        steps: ['খরচের রিকোয়েস্ট করুন', 'অ্যাপ্রুভ বা রিজেক্ট করুন', 'স্টোরভিত্তিক হিস্টোরি দেখুন'],
    },
    {
        id: 'attendance',
        module: '02-business-os',
        title: 'Staff Attendance',
        path: '/hr/attendance',
        narration: spoken(
            'এখন দেখি staff attendance।',
            'কর্মী কখন check-in করলো, কখন check-out করলো, late হলো কিনা, কোনো note আছে কিনা — সব এখানে রাখা যায়।',
            'Salary, shift planning, বা staff responsibility দেখার সময় এই record owner-এর জন্য খুব useful।'
        ),
        steps: ['কর্মীর check-in দিন', 'late বা early leave note লিখুন', 'salary decision-এর আগে history দেখুন'],
    },
    {
        id: 'products',
        module: '03-inventory',
        title: 'Add Products',
        path: '/products/create',
        narration: spoken(
            'AndgatePOS ভালোভাবে ব্যবহার করতে হলে product data ঠিক থাকা দরকার।',
            'পণ্য add করার সময় name, category, brand, unit, sale price, cost, barcode, image আর opening stock ঠিক করে দিন।',
            'শুরুতে product ঠিকভাবে দিলে POS, report, stock আর online store — সব জায়গায় data clean থাকবে।'
        ),
        steps: ['পণ্যের basic তথ্য দিন', 'দাম, কস্ট ও স্টক দিন', 'বারকোড বা ছবি যোগ করুন'],
    },
    {
        id: 'variants-labels',
        module: '03-inventory',
        title: 'Variants and Labels',
        path: '/label',
        narration: spoken(
            'অনেক product-এর আবার variant থাকে।',
            'যেমন কাপড়ের size আর color, electronics-এর serial, বা gift item-এর আলাদা barcode।',
            'Variant আর barcode label ঠিক করে রাখলে counter-এ cashier দ্রুত scan করে sale করতে পারবেন।'
        ),
        steps: ['variant অনুযায়ী পণ্য সাজান', 'barcode বা QR label তৈরি করুন', 'প্রিন্ট করে পণ্যে লাগান'],
    },
    {
        id: 'stock-control',
        module: '03-inventory',
        title: 'Stock Control',
        path: '/reports/stock',
        narration: spoken(
            'Stock control মানে শুধু কত পণ্য আছে সেটা দেখা না।',
            'কোন product কমে যাচ্ছে, কোনটা পড়ে আছে, কোনটার movement বেশি, আর কোথায় adjustment দরকার — এগুলো নিয়মিত দেখা দরকার।',
            'এইভাবে stock follow করলে sale miss হওয়ার chance কমে যায়।'
        ),
        steps: ['stock level দেখুন', 'low-stock পণ্য ধরুন', 'adjustment বা purchase plan করুন'],
    },
    {
        id: 'pos-sale',
        module: '04-pos',
        title: 'Make a POS Sale',
        path: '/pos',
        narration: spoken(
            'এবার আসি main POS sale-এ।',
            'পণ্য search করুন, barcode scan করুন, cart-এ add করুন, দরকার হলে discount দিন।',
            'তারপর cash, bKash, Nagad, Rocket, Upay, card, অথবা due payment নিয়ে bill complete করুন।',
            'শেষে customer-কে receipt দিয়ে দিন।'
        ),
        steps: ['পণ্য স্ক্যান বা সার্চ করুন', 'discount ও quantity ঠিক করুন', 'payment নিয়ে receipt দিন'],
    },
    {
        id: 'returns',
        module: '04-pos',
        title: 'Returns and Refunds',
        path: '/orders/return/list',
        narration: spoken(
            'কখনো customer পণ্য return করতে পারে।',
            'তখন order খুঁজে return reason, quantity, refund amount, আর product stock-এ ফেরত যাবে কিনা — এগুলো ঠিক করে দিন।',
            'এতে customer service ভালো থাকে, আর stock হিসাবও ঠিক থাকে।'
        ),
        steps: ['অর্ডার খুঁজুন', 'রিটার্ন কারণ ও quantity দিন', 'refund ও stock effect যাচাই করুন'],
    },
    {
        id: 'purchases',
        module: '05-purchases',
        title: 'Purchase Orders',
        path: '/purchases/create',
        narration: spoken(
            'Supplier থেকে মাল কিনলে purchase order ব্যবহার করুন।',
            'কোন supplier থেকে কী product নিচ্ছেন, কত quantity নিচ্ছেন, payment হলো কিনা — সব এক জায়গায় থাকবে।',
            'মাল receive করলে stock update হবে, আর supplier due থাকলে সেটাও হিসাব হয়ে যাবে।'
        ),
        steps: ['সাপ্লায়ার বেছে order করুন', 'মাল receive করুন', 'payment বা due record রাখুন'],
    },
    {
        id: 'supplier-360',
        module: '05-purchases',
        title: 'Supplier 360',
        path: '/suppliers/list',
        narration: spoken(
            'Supplier 360 হলো supplier-এর পুরো picture।',
            'Contact, purchase history, current due, payment terms, আর আগের behavior এক জায়গায় দেখা যায়।',
            'নতুন order দেওয়ার আগে supplier-এর এই history দেখে decision নেওয়া অনেক সহজ।'
        ),
        steps: ['supplier profile খুলুন', 'due ও purchase history দেখুন', 'payment behavior যাচাই করুন'],
    },
    {
        id: 'customers-crm',
        module: '06-crm',
        title: 'Customers and CRM',
        path: '/customers/list',
        narration: spoken(
            'Customer list শুধু নাম আর mobile number রাখার জায়গা না।',
            'এখানে purchase history, due, loyalty, birthday, note, আর follow-up action রাখা যায়।',
            'Regular customer-দের আলাদা করে service দিলে repeat sale বাড়ে।'
        ),
        steps: ['customer profile তৈরি করুন', 'due ও history দেখুন', 'follow-up plan করুন'],
    },
    {
        id: 'accounting',
        module: '07-accounting',
        title: 'Accounting and Cash Book',
        path: '/accounting/cash-book',
        narration: spoken(
            'Accounting শুনতে কঠিন লাগতে পারে, কিন্তু এখানে basic কাজগুলো সহজভাবে রাখা হয়েছে।',
            'Cash book, ledger, journal, income, expense, profit loss — এগুলো business-এর হিসাব বুঝতে সাহায্য করে।',
            'প্রতিটি sale, purchase আর expense হিসাবের সাথে linked থাকলে মাসশেষে ঝামেলা কম হয়।'
        ),
        steps: ['cash book দেখুন', 'ledger ও journal যাচাই করুন', 'profit loss report মিলান'],
    },
    {
        id: 'reports',
        module: '08-reports',
        title: 'Reports and Analytics',
        path: '/reports/business-overview',
        narration: spoken(
            'Business decision নেওয়ার আগে report দেখা দরকার।',
            'Sales, stock, purchase, customer, supplier, tax, payment summary, business overview — সব report এখান থেকে দেখা যায়।',
            'Date range বদলে, filter দিয়ে, দরকার হলে PDF বা Excel export করে নিন।'
        ),
        steps: ['date range বেছে নিন', 'report filter করুন', 'PDF বা Excel export করুন'],
    },
    {
        id: 'ecommerce-orders',
        module: '09-ecommerce',
        title: 'Ecommerce Orders and COD',
        path: '/ecommerce/orders',
        narration: spoken(
            'আপনার Hawkeri online store থেকে order এলে AndgatePOS-এ সেই order দেখা যাবে।',
            'Order confirm করা, status বদলানো, courier দেওয়া, COD collection আর unsettled amount track করা — এগুলো online sale control করতে সাহায্য করে।',
            'Online আর offline business একসাথে চালাতে এই workflow খুব useful।'
        ),
        steps: ['online order দেখুন', 'status ও courier update করুন', 'COD reconciliation মিলান'],
    },
    {
        id: 'courier-setup',
        module: '09-ecommerce',
        title: 'Courier Setup',
        path: '/ecommerce/stores',
        narration: spoken(
            'Ecommerce delivery চালাতে courier setup দরকার।',
            'Pathao, Steadfast বা RedX যেটা ব্যবহার করবেন, provider অনুযায়ী credential save করে রাখুন।',
            'এতে delivery workflow POS-এর সাথে connected থাকবে, কিন্তু counter checkout-এর কাজ আলাদা থাকবে।'
        ),
        steps: ['courier provider বেছে নিন', 'merchant credential save করুন', 'test order দিয়ে যাচাই করুন'],
    },
];

lessons.push(
    {
        id: 'payment-settings',
        module: '02-store-config',
        title: 'Payment and MFS Settings',
        path: '/store/setting',
        narration: spoken('এখন payment settings দেখি।', 'Cash, bKash, Nagad, Rocket, Upay, card আর bank transfer ঠিকভাবে setup থাকলে cashier payment নিতে গিয়ে confuse হবে না।', 'MFS number আর payment rules একবার মিলিয়ে নিন।'),
        steps: ['MFS account details ঠিক করুন', 'Payment method active কিনা দেখুন', 'একটা test sale দিয়ে payment report মিলান'],
    },
    {
        id: 'invoice-customize',
        module: '02-store-config',
        title: 'Invoice and Receipt Customization',
        path: '/store/setting',
        narration: spoken('Invoice আর receipt আপনার দোকানের identity বহন করে।', 'Logo, invoice prefix, footer message, tax label আর printer format ঠিক করে রাখুন।', 'Customer receipt professional দেখালে trust বাড়ে।'),
        steps: ['Logo ও invoice prefix দিন', 'Receipt footer message লিখুন', 'A4 বা thermal print format test করুন'],
    },
    {
        id: 'return-policies',
        module: '02-store-config',
        title: 'Return and Adjustment Policies',
        path: '/store/setting',
        narration: spoken('Return আর stock adjustment-এর reason আগে থেকে setup থাকলে পরে report clean থাকে।', 'Damage, lost, found, customer return — এগুলো reason হিসেবে ready রাখুন।', 'তাহলে cashier বা manager return করার সময় সঠিক reason select করতে পারবে।'),
        steps: ['Return reason setup করুন', 'Stock adjustment reason setup করুন', 'Report-এ reason অনুযায়ী review করুন'],
    },
    {
        id: 'cash-drawer-history',
        module: '03-operations',
        title: 'Cash Drawer History',
        path: '/cash-drawer/history',
        narration: spoken('Cash drawer history owner-এর জন্য খুব important।', 'কোন counter-এ কত opening cash ছিল, cash in বা cash out হলো কিনা, closing cash কত হলো — সব history এখানে দেখা যায়।', 'Cash variance থাকলে এখান থেকেই follow-up করুন।'),
        steps: ['Drawer session history দেখুন', 'Cash movement reason review করুন', 'Variance থাকলে manager-এর সাথে মিলান'],
    },
    {
        id: 'payroll',
        module: '04-hr',
        title: 'Payroll',
        path: '/hr/payroll',
        narration: spoken('Payroll module দিয়ে staff salary cycle manage করা যায়।', 'Attendance, overtime, absence, salary advance আর deduction মিলিয়ে salary প্রস্তুত করুন।', 'Payment status update করলে owner-এর কাছে salary history পরিষ্কার থাকবে।'),
        steps: ['Salary cycle তৈরি করুন', 'Advance ও deduction মিলান', 'Payment status update করুন'],
    },
    {
        id: 'salary-advance',
        module: '04-hr',
        title: 'Salary Advance',
        path: '/hr/salary-advance',
        narration: spoken('কর্মী অনেক সময় salary advance চাইতে পারে।', 'Advance request, approve, reject আর repayment history আলাদা রাখলে payroll করার সময় ভুল কম হয়।', 'এই page থেকে owner পুরো advance record দেখতে পারবেন।'),
        steps: ['Advance request record করুন', 'Approve বা reject করুন', 'Payroll-এর সাথে deduction মিলান'],
    },
    {
        id: 'festival-bonus',
        module: '04-hr',
        title: 'Festival Bonus',
        path: '/hr/festival-bonus',
        narration: spoken('Festival bonus বাংলাদেশি business-এর common practice।', 'কোন employee কত bonus পাবে, কোন occasion-এ পাবে, আর payment হয়েছে কিনা — সব এখানে track করুন।', 'এতে Eid বা festival সময় হিসাব গুছানো থাকে।'),
        steps: ['Bonus cycle তৈরি করুন', 'Eligible employee বাছাই করুন', 'Payment status update করুন'],
    },
    {
        id: 'leave-shifts-documents',
        module: '04-hr',
        title: 'Leave, Shift and Documents',
        path: '/hr/leave',
        narration: spoken('HR শুধু attendance না।', 'Leave request, shift planning, holiday আর employee document একসাথে রাখলে team management সহজ হয়।', 'এই workflow manager আর owner দুজনের জন্যই useful।'),
        steps: ['Leave request review করুন', 'Shift ও holiday plan করুন', 'Employee document history রাখুন'],
    },
    {
        id: 'categories',
        module: '05-inventory',
        title: 'Categories',
        path: '/category',
        narration: spoken('Product add করার আগে category ঠিক করে নেওয়া ভালো।', 'Grocery, fashion, electronics — business অনুযায়ী category tree বানান।', 'Category clean থাকলে POS search আর report দুটোই ভালো হয়।'),
        steps: ['Parent ও sub-category তৈরি করুন', 'Low stock threshold দিন', 'Online store category মিলিয়ে নিন'],
    },
    {
        id: 'brands',
        module: '05-inventory',
        title: 'Brands',
        path: '/brand',
        narration: spoken('Brand ব্যবহার করলে product filter করা সহজ হয়।', 'Brand name, logo আর description দিয়ে রাখুন।', 'POS, inventory আর online store-এ customer ও staff দ্রুত product খুঁজে পাবে।'),
        steps: ['Brand profile তৈরি করুন', 'Product-এর সাথে brand tag করুন', 'Brand-wise report review করুন'],
    },
    {
        id: 'product-variants',
        module: '05-inventory',
        title: 'Product Variants',
        path: '/products/create',
        narration: spoken('যেসব product-এর size, color বা model আছে, সেখানে variant ব্যবহার করুন।', 'একই product-এর আলাদা variant থাকলে stock আর price আলাদা করে manage করা যায়।', 'Fashion shop বা electronics shop-এর জন্য এটা খুব দরকারি।'),
        steps: ['Attribute ও variant option তৈরি করুন', 'Variant-wise price ও stock দিন', 'POS-এ variant select করে test sale করুন'],
    },
    {
        id: 'stock-adjustment',
        module: '05-inventory',
        title: 'Stock Adjustment',
        path: '/products/stock/adjustments',
        narration: spoken('Actual stock আর system stock কখনো কখনো আলাদা হতে পারে।', 'Damage, lost, found বা correction reason দিয়ে stock adjustment করুন।', 'Reason সহ adjustment করলে audit trail clean থাকে।'),
        steps: ['Product বাছাই করুন', 'Adjustment reason দিন', 'Stock report-এ effect দেখুন'],
    },
    {
        id: 'stock-count',
        module: '05-inventory',
        title: 'Stock Count',
        path: '/products/stock/counts',
        narration: spoken('Stock count দিয়ে হাতে গোনা stock আর system stock মিলিয়ে দেখা যায়।', 'Count submit করার পরে manager approve করলে stock record বেশি reliable হয়।', 'Regular stock count করলে shrinkage আর ভুল ধরা পড়ে।'),
        steps: ['Count session তৈরি করুন', 'Physical quantity লিখুন', 'Difference review করে approve করুন'],
    },
    {
        id: 'stock-transfer',
        module: '05-inventory',
        title: 'Stock Transfer',
        path: '/stock-transfers',
        narration: spoken('একাধিক store থাকলে stock transfer খুব দরকার।', 'এক branch থেকে আরেক branch-এ product পাঠালে transfer record রাখুন।', 'তাহলে দুই store-এর stock একসাথে ঠিক থাকবে।'),
        steps: ['Source ও destination store দিন', 'Product ও quantity বাছাই করুন', 'Transfer ledger report মিলান'],
    },
    {
        id: 'bulk-import',
        module: '05-inventory',
        title: 'Bulk Product Import',
        path: '/products/bulk',
        narration: spoken('অনেক product একসাথে add করতে bulk import ব্যবহার করুন।', 'Excel template download করে data fill করুন, validation error থাকলে fix করুন, তারপর import confirm করুন।', 'নতুন shop setup করতে এতে অনেক সময় বাঁচে।'),
        steps: ['Template download করুন', 'Product data fill করুন', 'Validation error ঠিক করে import করুন'],
    },
    {
        id: 'barcode-scanner',
        module: '06-pos',
        title: 'Barcode Scanner',
        path: '/pos',
        narration: spoken('Barcode scanner counter sale দ্রুত করে।', 'USB scanner লাগিয়ে বা mobile camera দিয়ে product scan করা যায়।', 'Barcode আগে product-এ setup থাকলে cashier typing ছাড়াই sale করতে পারবে।'),
        steps: ['Barcode scanner connect করুন', 'Product scan করে cart-এ add করুন', 'Unknown barcode হলে product update করুন'],
    },
    {
        id: 'payment-methods',
        module: '06-pos',
        title: 'Split Payments and Local MFS',
        path: '/pos',
        narration: spoken('Bangladesh shop-এ এক order-এ multiple payment method আসতে পারে।', 'Half cash, half bKash, বা due সহ payment নিতে হলে split payment ব্যবহার করুন।', 'Payment report-এ পরে method-wise collection দেখা যাবে।'),
        steps: ['Cash, MFS, card বা due select করুন', 'MFS number record করুন', 'Payment summary report মিলান'],
    },
    {
        id: 'discounts-coupons',
        module: '06-pos',
        title: 'Discounts and Coupons',
        path: '/coupons',
        narration: spoken('Discount আর coupon campaign ঠিকভাবে ব্যবহার করলে sale বাড়ে।', 'Flat discount, percentage discount বা coupon rule আগে setup করুন।', 'POS sale করার সময় cashier সেই discount apply করতে পারবে।'),
        steps: ['Coupon বা discount rule তৈরি করুন', 'POS sale-এ apply করুন', 'Discount report review করুন'],
    },
    {
        id: 'end-of-day',
        module: '06-pos',
        title: 'End of Day Workflow',
        path: '/cash-closing',
        narration: spoken('দিনশেষে শুধু sale বন্ধ করলেই কাজ শেষ না।', 'Cash count, return, expense, due collection আর payment summary মিলিয়ে day close করুন।', 'এই habit রাখলে owner প্রতিদিন clean হিসাব পাবেন।'),
        steps: ['Cash count করুন', 'Payment summary মিলান', 'Cash closing submit করুন'],
    },
    {
        id: 'customer-dues',
        module: '07-crm',
        title: 'Customer Dues',
        path: '/customers/due',
        narration: spoken('বাংলাদেশি দোকানে due sale খুব common।', 'Customer-wise due, partial payment আর old invoice history এক জায়গায় রাখুন।', 'Due follow-up regular করলে cash flow ভালো থাকে।'),
        steps: ['Due customer list দেখুন', 'Payment receive record করুন', 'Customer statement মিলান'],
    },
    {
        id: 'loyalty',
        module: '07-crm',
        title: 'Loyalty and Repeat Customers',
        path: '/customers/list',
        narration: spoken('Regular customer business-এর asset।', 'Purchase history, loyalty status, birthday আর note দেখে customer follow-up করুন।', 'ভালো customer service repeat sale বাড়াতে সাহায্য করে।'),
        steps: ['Top customer খুঁজুন', 'Loyalty বা note update করুন', 'Follow-up action plan করুন'],
    },
    {
        id: 'expenses',
        module: '08-accounting',
        title: 'Expenses',
        path: '/expenses/expense-list',
        narration: spoken('Daily expense ঠিকভাবে না রাখলে profit বোঝা যায় না।', 'Rent, salary, utility, transport, petty cost — category দিয়ে expense record করুন।', 'Expense report আর profit loss তখন accurate হবে।'),
        steps: ['Expense category বাছাই করুন', 'Amount ও payment account দিন', 'Expense report review করুন'],
    },
    {
        id: 'profit-loss',
        module: '08-accounting',
        title: 'Profit and Loss',
        path: '/accounting/profit-loss',
        narration: spoken('Profit and loss report owner-এর সবচেয়ে দরকারি reportগুলোর একটা।', 'Sales, cost, expense মিলিয়ে business আসলে লাভ করছে কিনা সেটা এখানে দেখা যায়।', 'Date range বদলে monthly performance compare করুন।'),
        steps: ['Date range select করুন', 'Gross ও net profit দেখুন', 'Expense impact review করুন'],
    },
    {
        id: 'ledger-journal',
        module: '08-accounting',
        title: 'Ledger and Journal',
        path: '/accounting/journals',
        narration: spoken('Ledger আর journal accounting-এর detail view।', 'যে transaction কোথা থেকে এসেছে, কোন account-এ effect করেছে, সেটা এখানে দেখা যায়।', 'Accountant বা owner audit করার সময় এই page কাজে লাগে।'),
        steps: ['Journal entry review করুন', 'Ledger account খুলুন', 'Source transaction trace করুন'],
    },
    {
        id: 'sales-reports',
        module: '09-reports',
        title: 'Sales Reports',
        path: '/reports/sales',
        narration: spoken('Sales report দিয়ে business-এর daily performance বোঝা যায়।', 'Date range, store, customer, payment method দিয়ে filter করুন।', 'Report দেখে কোন দিন বা কোন product ভালো বিক্রি হচ্ছে বুঝতে পারবেন।'),
        steps: ['Date range filter করুন', 'Payment ও customer breakdown দেখুন', 'Export করে owner review করুন'],
    },
    {
        id: 'inventory-reports',
        module: '09-reports',
        title: 'Inventory Reports',
        path: '/reports/stock',
        narration: spoken('Inventory report stock decision নিতে সাহায্য করে।', 'Stock movement, low stock, idle product, adjustment আর transfer ledger নিয়মিত দেখুন।', 'এতে overstock আর stockout দুটোই কমে।'),
        steps: ['Stock movement দেখুন', 'Low stock report খুলুন', 'Idle product review করুন'],
    },
    {
        id: 'financial-reports',
        module: '09-reports',
        title: 'Financial Reports',
        path: '/reports/profit-loss',
        narration: spoken('Financial reports owner-কে business health বুঝতে সাহায্য করে।', 'Profit loss, expense, tax, payment summary আর cash flow একসাথে review করুন।', 'Decision নেওয়ার আগে finance view দেখে নিন।'),
        steps: ['Profit loss report দেখুন', 'Expense ও tax report মিলান', 'Payment summary compare করুন'],
    },
    {
        id: 'custom-reports',
        module: '10-analytics',
        title: 'Custom Reports',
        path: '/analytics/custom-reports',
        narration: spoken('Custom report দিয়ে নিজের দরকার মতো report বানানো যায়।', 'Field, filter, date range আর schedule ঠিক করে owner-specific report তৈরি করুন।', 'যে প্রশ্নের ready report নেই, custom report দিয়ে সেটা বের করুন।'),
        steps: ['Report fields বাছাই করুন', 'Filter ও date range দিন', 'Save বা schedule করুন'],
    },
    {
        id: 'dashboard-widgets',
        module: '10-analytics',
        title: 'Dashboard Widgets',
        path: '/analytics/dashboard-widgets',
        narration: spoken('Owner dashboard সবার জন্য একরকম হওয়া দরকার নেই।', 'আপনার business অনুযায়ী sales, stock, due, cash drawer, attendance বা ecommerce widget সাজিয়ে নিন।', 'যেটা daily decision-এ দরকার, সেটাই সামনে রাখুন।'),
        steps: ['Widget list দেখুন', 'Important widgets enable করুন', 'Dashboard layout save করুন'],
    },
    {
        id: 'scheduled-reports',
        module: '10-analytics',
        title: 'Scheduled Reports',
        path: '/analytics/scheduled-reports',
        narration: spoken('Scheduled report দিলে report নিজে নিজে ready থাকে।', 'Daily, weekly বা monthly basis-এ কোন report owner বা manager দেখতে চায় সেটা setup করুন।', 'Regular review habit তৈরি করতে এটা helpful।'),
        steps: ['Report type বাছাই করুন', 'Schedule frequency দিন', 'Recipient ও delivery setting check করুন'],
    },
    {
        id: 'branch-benchmarking',
        module: '10-analytics',
        title: 'Branch Benchmarking',
        path: '/analytics/branch-benchmarking',
        narration: spoken('Multi-store business-এ branch comparison দরকার।', 'কোন branch বেশি sale করছে, কোথায় stock issue, কোথায় margin কম — benchmarking view থেকে বুঝুন।', 'এতে owner দ্রুত branch-wise decision নিতে পারেন।'),
        steps: ['Branch comparison খুলুন', 'Sales ও margin compare করুন', 'Weak branch follow-up করুন'],
    },
    {
        id: 'online-overview',
        module: '11-ecommerce',
        title: 'Online Store Overview',
        path: '/ecommerce/stores',
        narration: spoken('Hawkeri online store আপনার POS data-এর সাথে connected থাকে।', 'Store status, product sync, order flow আর courier setup এখান থেকে review করুন।', 'Online sale চালাতে এই page নিয়মিত দেখা দরকার।'),
        steps: ['Store ecommerce status দেখুন', 'Product sync check করুন', 'Order workflow verify করুন'],
    },
    {
        id: 'ecommerce-products',
        module: '11-ecommerce',
        title: 'Ecommerce Products',
        path: '/ecommerce/products',
        narration: spoken('সব POS product online store-এ দেখানো লাগবে না।', 'কোন product online visible হবে, price, image, stock আর category ঠিক আছে কিনা সেটা review করুন।', 'Online product clean রাখলে customer order দিতে সহজ পায়।'),
        steps: ['Online product list দেখুন', 'Image ও stock check করুন', 'Visibility update করুন'],
    },
    {
        id: 'cod-reconciliation',
        module: '11-ecommerce',
        title: 'COD Reconciliation',
        path: '/ecommerce/cod-reconciliation',
        narration: spoken('COD order-এ টাকা courier-এর কাছে থাকে, তাই reconciliation জরুরি।', 'Collected, paid, fee, returned আর unsettled amount মিলিয়ে দেখুন।', 'Regular COD review করলে online cash flow clear থাকে।'),
        steps: ['Courier COD rows দেখুন', 'Collected বনাম paid মিলান', 'Unsettled amount follow-up করুন'],
    },
    {
        id: 'fiscal-compliance',
        module: '12-compliance',
        title: 'Fiscal Compliance',
        path: '/fiscal-compliance',
        narration: spoken('Fiscal compliance page certification claim করার জায়গা না।', 'এটা invoice evidence, compliance reminder আর readiness record গুছিয়ে রাখার জায়গা।', 'Official certification না থাকলে wording সবসময় careful রাখুন।'),
        steps: ['Evidence record review করুন', 'Compliance task check করুন', 'Fiscal claim wording verify করুন'],
    },
    {
        id: 'bd-vat-workspace',
        module: '12-compliance',
        title: 'BD VAT Workspace',
        path: '/reports/bd-vat-workspace',
        narration: spoken('BD VAT workspace tax review-এর জন্য useful।', 'Date range অনুযায়ী VATable amount, tax rate আর tax summary দেখুন।', 'Accountant বা owner-এর review-এর জন্য export ব্যবহার করুন।'),
        steps: ['VAT date range দিন', 'Tax summary review করুন', 'PDF বা Excel export করুন'],
    },
    {
        id: 'audit-activity',
        module: '12-compliance',
        title: 'Audit Activity',
        path: '/reports/audit-activity',
        narration: spoken('Audit activity দিয়ে system-এর important action trace করা যায়।', 'কে কোন action করেছে, কখন করেছে, কোন module-এ করেছে — এগুলো owner review করতে পারবেন।', 'Sensitive business operation-এ audit trail খুব দরকারি।'),
        steps: ['Audit report খুলুন', 'User ও module filter করুন', 'Suspicious activity follow-up করুন'],
    },
    {
        id: 'subscription-status',
        module: '13-subscription-billing',
        title: 'Subscription Status',
        path: '/subscription',
        narration: spoken('Subscription page থেকে package status দেখা যায়।', 'আপনার current plan, expiry, included module আর next renewal information এখানেই থাকবে।', 'কোন feature plan-এর বাইরে হলে upgrade বা support-এর সাথে কথা বলুন।'),
        steps: ['Current package status দেখুন', 'Expiry ও access limit check করুন', 'Feature not in plan হলে package compare করুন'],
    },
    {
        id: 'renew-plan',
        module: '13-subscription-billing',
        title: 'Renew Plan',
        path: '/subscription',
        narration: spoken('Plan renew করার সময় payment method আর billing cycle ভালোভাবে মিলিয়ে নিন।', 'Manual payment দিলে transaction reference ঠিক রাখুন।', 'Payment submit করার পরে verification status follow-up করুন।'),
        steps: ['Billing cycle select করুন', 'Payment information submit করুন', 'Verification status check করুন'],
    },
    {
        id: 'upgrade-plan',
        module: '13-subscription-billing',
        title: 'Upgrade Plan',
        path: '/pricing',
        narration: spoken('Business বড় হলে current package যথেষ্ট নাও হতে পারে।', 'কোন plan-এ কোন module আছে, user limit, store limit আর support level দেখে upgrade decision নিন।', 'Upgrade করার আগে team-এর actual workflow list করে নিন।'),
        steps: ['Plan comparison দেখুন', 'Needed modules identify করুন', 'Upgrade request submit করুন'],
    },
    {
        id: 'payment-verification',
        module: '13-subscription-billing',
        title: 'Payment Verification',
        path: '/subscription',
        narration: spoken('Manual payment করলে verification step important।', 'bKash, Nagad, bank বা অন্য payment reference ঠিকভাবে দিলে approval দ্রুত হয়।', 'Pending থাকলে support team-এর সাথে reference number share করুন।'),
        steps: ['Payment reference save করুন', 'Pending বা approved status দেখুন', 'Support follow-up-এর জন্য receipt রাখুন'],
    },
    {
        id: 'store-defaults',
        module: '04-store-config',
        title: 'Store Defaults',
        path: '/store/setting',
        narration: spoken('Store default settings আগে ঠিক করে রাখলে প্রতিদিনের কাজ সহজ হয়।', 'Invoice text, default payment behavior, return policy আর দোকানের basic rule এখান থেকে review করুন।', 'একবার ঠিক করলে cashier আর manager দুজনের কাজই consistent থাকে।'),
        steps: ['Default store information দেখুন', 'Invoice ও return setting মিলান', 'Payment default verify করুন'],
    },
    {
        id: 'label-print',
        module: '05-inventory',
        title: 'Label Print',
        path: '/label',
        narration: spoken('Label print counter speed বাড়ায়।', 'Product barcode বা QR label generate করে print করুন, তারপর পণ্যে লাগিয়ে রাখুন।', 'এর ফলে cashier search না করে scan করে bill করতে পারবেন।'),
        steps: ['Product select করুন', 'Barcode label generate করুন', 'Print করে product-এ লাগান'],
    },
    {
        id: 'low-stock-alerts',
        module: '05-inventory',
        title: 'Low Stock Alerts',
        path: '/reports/low-stock',
        narration: spoken('Low stock alert মানে sale miss হওয়ার আগেই warning পাওয়া।', 'Category বা product threshold ঠিক থাকলে কোন পণ্য reorder করতে হবে সেটা report-এ দেখা যায়।', 'Owner weekly purchase plan করার সময় এই report ব্যবহার করবেন।'),
        steps: ['Threshold ঠিক করুন', 'Low stock report খুলুন', 'Purchase বা transfer plan করুন'],
    },
    {
        id: 'add-supplier',
        module: '06-purchases',
        title: 'Add Supplier',
        path: '/suppliers/create',
        narration: spoken('Purchase শুরু করার আগে supplier profile তৈরি করুন।', 'Name, phone, address, opening balance আর payment terms ঠিক করে রাখুন।', 'Supplier data clean থাকলে purchase, due আর statement সব ঠিক আসে।'),
        steps: ['Supplier form খুলুন', 'Contact ও balance দিন', 'Payment terms save করুন'],
    },
    {
        id: 'receive-goods',
        module: '06-purchases',
        title: 'Receive Goods',
        path: '/purchases/list',
        narration: spoken('Purchase order করার পর goods receive করা আলাদা step।', 'Partial বা full receive করলে stock automatically update হবে।', 'Invoice number আর note রাখলে পরে supplier statement মিলাতে সুবিধা হয়।'),
        steps: ['Purchase order খুলুন', 'Received quantity দিন', 'Stock update confirm করুন'],
    },
    {
        id: 'customer-analytics',
        module: '08-customers',
        title: 'Customer Analytics',
        path: '/customers/crm',
        narration: spoken('Customer analytics owner-এর জন্য খুব useful।', 'Top customer, due customer, repeat buyer, inactive customer — এগুলো দেখে follow-up plan করা যায়।', 'CRM dashboard থেকে customer relationship আরো organized রাখুন।'),
        steps: ['CRM dashboard খুলুন', 'Top ও due customer দেখুন', 'Follow-up action plan করুন'],
    },
    {
        id: 'bank-cash-income',
        module: '09-accounting',
        title: 'Bank Accounts, Cash Book and Income',
        path: '/accounting/cash-book',
        narration: spoken('Accounting workspace-এ bank account, cash book আর income tracking একসাথে করা যায়।', 'POS sale-এর বাইরে কোনো income বা cash movement থাকলে এখানে record রাখুন।', 'এতে financial report আরো accurate হয়।'),
        steps: ['Bank account review করুন', 'Cash book entry দেখুন', 'Extra income record করুন'],
    },
    {
        id: 'balance-trial-cashflow',
        module: '09-accounting',
        title: 'Balance Sheet, Trial Balance and Cash Flow',
        path: '/accounting/balance-sheet',
        narration: spoken('Advanced accounting report owner decision-এর জন্য।', 'Balance sheet, trial balance আর cash flow দেখে business-এর money position বুঝতে পারবেন।', 'এই report accountant review-এর সাথেও ব্যবহার করা যায়।'),
        steps: ['Balance sheet খুলুন', 'Trial balance মিলান', 'Cash flow trend দেখুন'],
    },
    {
        id: 'ai-insights',
        module: '10-reports',
        title: 'AI Insights, Forecasts and Smart Summary',
        path: '/reports/smart-summary',
        narration: spoken('AI insights daily decision সহজ করে।', 'Reorder suggestion, anomaly detection, demand forecast আর smart summary দেখে owner দ্রুত বুঝতে পারবেন কোথায় attention দরকার।', 'এগুলো final decision না, decision support হিসেবে ব্যবহার করুন।'),
        steps: ['Smart summary দেখুন', 'Anomaly ও reorder signal check করুন', 'Demand forecast দিয়ে plan করুন'],
    },
    {
        id: 'operations-reports',
        module: '10-reports',
        title: 'Operations Reports',
        path: '/reports/payment-summary',
        narration: spoken('Operations report দিয়ে counter আর staff performance দেখা যায়।', 'Payment summary, employee sales, discount, cash closing আর audit activity একসাথে review করলে owner daily control রাখতে পারেন।', 'দিনশেষে এই reportগুলো খুব কাজে লাগে।'),
        steps: ['Payment summary খুলুন', 'Employee sales ও discount report দেখুন', 'Cash closing report মিলান'],
    },
    {
        id: 'ecommerce-marketing',
        module: '12-ecommerce',
        title: 'Marketing Pixel, Carts and Wishlists',
        path: '/ecommerce/setting/marketing',
        narration: spoken('Online store চালালে marketing settings জরুরি।', 'Pixel setup, carts, wishlists আর customer interest দেখে online follow-up করা যায়।', 'এই data POS sale-এর সাথে মিলিয়ে owner campaign plan করতে পারবেন।'),
        steps: ['Marketing setting খুলুন', 'Pixel information verify করুন', 'Cart ও wishlist signal review করুন'],
    },
    {
        id: 'audit-logs-security',
        module: '14-administration',
        title: 'Audit Logs and Security Review',
        path: '/audit-logs',
        narration: spoken('Live business-এ কে কী পরিবর্তন করেছে সেটা জানা দরকার।', 'Audit logs থেকে user action, time, module আর important change review করা যায়।', 'Permission setup ঠিক আছে কিনা বুঝতেও এই page help করে।'),
        steps: ['Audit logs খুলুন', 'User ও module filter করুন', 'Important change verify করুন'],
    },
    {
        id: 'company-compliance-calendar',
        module: '14-administration',
        title: 'Company, Branches and Compliance Calendar',
        path: '/compliance-calendar',
        narration: spoken('Company, branch আর compliance task owner-level কাজ।', 'Branch information clean রাখুন, আর compliance calendar দিয়ে important reminder follow করুন।', 'এগুলো daily POS screen-এর বাইরে রাখা ভালো।'),
        steps: ['Company ও branch info review করুন', 'Compliance calendar খুলুন', 'Upcoming task follow করুন'],
    },
    {
        id: 'notifications-feedback-export',
        module: '14-administration',
        title: 'Notifications, Feedback and Data Export',
        path: '/notifications',
        narration: spoken('Notification, feedback আর data export live operation support করে।', 'Important message দেখুন, feedback submit বা review করুন, আর দরকার হলে business data export করে backup রাখুন।', 'Owner reporting-এর সময় export feature useful।'),
        steps: ['Notifications দেখুন', 'Feedback workflow ব্যবহার করুন', 'Data export backup নিন'],
    },
);

const slugify = (value) =>
    String(value || 'lesson')
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'lesson';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = (command, args, options = {}) =>
    new Promise((resolve, reject) => {
        const child = spawn(command, args, { stdio: 'inherit', ...options });
        child.on('error', reject);
        child.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`${command} exited with code ${code}`));
        });
    });

const exists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
};

const formatSrtTime = (seconds) => {
    const ms = Math.round((seconds % 1) * 1000);
    const total = Math.floor(seconds);
    const s = total % 60;
    const m = Math.floor(total / 60) % 60;
    const h = Math.floor(total / 3600);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
};

const buildScenes = (lesson) => [
    {
        title: lesson.title,
        path: lesson.path,
        seconds: SCENE_SECONDS,
        narration: lesson.narration,
    },
    {
        title: `${lesson.title} - key steps`,
        path: lesson.path,
        seconds: Math.max(6, Math.round(SCENE_SECONDS * 0.75)),
        narration: spoken(
            'শেষে ছোট করে recap করি।',
            lesson.steps.map((step, index) => `${index + 1}. ${step}।`).join('\n'),
            'এই flow টা practice করলে কাজটা অনেক দ্রুত হয়ে যাবে।'
        ),
    },
];

const writeLessonText = async (lessonDir, lesson, scenes) => {
    let cursor = 0;
    const srt = [];
    const script = [`${lesson.title}`, '', lesson.narration, '', 'Key steps:', ...lesson.steps.map((step) => `- ${step}`), ''];

    scenes.forEach((scene, index) => {
        const start = cursor;
        const end = cursor + scene.seconds;
        srt.push(`${index + 1}\n${formatSrtTime(start)} --> ${formatSrtTime(end)}\n${scene.narration}\n`);
        cursor = end;
    });

    await fs.writeFile(path.join(lessonDir, 'script.bn.txt'), script.join('\n'));
    await fs.writeFile(path.join(lessonDir, 'narration.bn.txt'), scenes.map((scene) => scene.narration).join('\n\n'));
    await fs.writeFile(path.join(lessonDir, 'subtitles.bn.srt'), srt.join('\n'));
    if (lesson.trainingScript) {
        await fs.writeFile(path.join(lessonDir, 'script-standard.bn.md'), formatScriptMarkdown(lesson));
        await fs.writeFile(path.join(lessonDir, 'script-standard.json'), JSON.stringify(lesson.trainingScript, null, 2));
        await fs.writeFile(path.join(lessonDir, 'quality-report.json'), JSON.stringify(validateTrainingScript(lesson), null, 2));
    }
};

const waitForAppReady = async (page) => {
    await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    await page.waitForTimeout(900);
};

const loginAndSaveState = async (browser, storageStatePath, outDir) => {
    if (await exists(storageStatePath)) return;
    if (VIDEO_STORAGE_STATE) {
        if (!(await exists(VIDEO_STORAGE_STATE))) {
            throw new Error(`VIDEO_STORAGE_STATE file does not exist: ${VIDEO_STORAGE_STATE}`);
        }
        await fs.copyFile(VIDEO_STORAGE_STATE, storageStatePath);
        return;
    }

    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });

    if (LANG) {
        await page.context().addCookies([{ name: 'i18nextLng', value: LANG, url: BASE_URL }]);
        await page.reload({ waitUntil: 'domcontentloaded' });
    }

    await page.fill('#Email', DEMO_EMAIL);
    await page.fill('#Password', DEMO_PASSWORD);
    await Promise.all([
        page.waitForURL(/\/dashboard|\/subscription|\/store/, { timeout: 45_000 }).catch(() => undefined),
        page.locator('form button[type="submit"]').click(),
    ]);
    await waitForAppReady(page);

    if (page.url().includes('/login')) {
        const debugDir = path.join(outDir, 'debug');
        await fs.mkdir(debugDir, { recursive: true });
        const screenshotPath = path.join(debugDir, 'login-failed.png');
        const htmlPath = path.join(debugDir, 'login-failed.html');
        await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
        await fs.writeFile(htmlPath, await page.content()).catch(() => undefined);
        throw new Error(
            `Login failed at ${page.url()} using DEMO_EMAIL=${DEMO_EMAIL}. ` +
            `Check backend/API URL, credentials, demo account status, and subscription redirects. ` +
            `Debug saved: ${screenshotPath}`
        );
    }

    await context.storageState({ path: storageStatePath });
    await context.close();
};

const movePointer = async (page, step) => {
    const x = 190 + ((step * 211) % 850);
    const y = 130 + ((step * 97) % 430);
    await page.mouse.move(x, y, { steps: 20 });
};

const recordLesson = async (browser, storageStatePath, lessonDir, lesson, scenes) => {
    const rawDir = path.join(lessonDir, 'raw');
    await fs.mkdir(rawDir, { recursive: true });

    const context = await browser.newContext({
        viewport: VIEWPORT,
        storageState: storageStatePath,
        recordVideo: { dir: rawDir, size: VIEWPORT },
    });
    const page = await context.newPage();

    for (const [index, scene] of scenes.entries()) {
        await page.goto(`${BASE_URL}${scene.path}`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
        await waitForAppReady(page);
        await movePointer(page, index + 1);
        await page.mouse.wheel(0, 300).catch(() => undefined);
        await sleep(scene.seconds * 500);
        await page.mouse.wheel(0, -160).catch(() => undefined);
        await sleep(scene.seconds * 500);
    }

    await context.close();

    const files = await fs.readdir(rawDir);
    const webm = files.find((file) => file.endsWith('.webm'));
    if (!webm) throw new Error(`Playwright did not create video for ${lesson.id}`);

    const videoOnly = path.join(lessonDir, `${lesson.id}.video-only.mp4`);
    await run('ffmpeg', ['-y', '-i', path.join(rawDir, webm), '-vf', `scale=${VIEWPORT.width}:${VIEWPORT.height},fps=30`, '-pix_fmt', 'yuv420p', videoOnly]);
    return videoOnly;
};

const generateGoogleVoice = async (lessonDir) => {
    if (!GOOGLE_TTS_CREDENTIALS) return '';

    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const accessToken = typeof accessTokenResponse === 'string' ? accessTokenResponse : accessTokenResponse?.token;

    if (!accessToken) {
        throw new Error('Failed to obtain Google Cloud access token for TTS.');
    }

    const text = await fs.readFile(path.join(lessonDir, 'narration.bn.txt'), 'utf8');
    const voice = { languageCode: GOOGLE_TTS_LANGUAGE_CODE };
    if (GOOGLE_TTS_VOICE_NAME) voice.name = GOOGLE_TTS_VOICE_NAME;

    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
            input: { text },
            voice,
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: GOOGLE_TTS_SPEAKING_RATE,
                pitch: GOOGLE_TTS_PITCH,
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`Google Cloud TTS failed: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    if (!data.audioContent) throw new Error('Google Cloud TTS response did not include audioContent.');

    const audioPath = path.join(lessonDir, 'voice.bn.mp3');
    await fs.writeFile(audioPath, Buffer.from(data.audioContent, 'base64'));
    return audioPath;
};

const generateOpenAiVoice = async (lessonDir) => {
    if (!process.env.OPENAI_API_KEY) return '';

    const text = await fs.readFile(path.join(lessonDir, 'narration.bn.txt'), 'utf8');
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: OPENAI_TTS_MODEL,
            voice: OPENAI_TTS_VOICE,
            input: text,
            instructions: OPENAI_TTS_INSTRUCTIONS,
            response_format: 'mp3',
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI TTS failed: ${response.status} ${await response.text()}`);
    }

    const audioPath = path.join(lessonDir, 'voice.bn.mp3');
    await fs.writeFile(audioPath, Buffer.from(await response.arrayBuffer()));
    return audioPath;
};

const muxFinalVideo = async (lessonDir, lesson, videoOnly, audioPath) => {
    const srtPath = path.join(lessonDir, 'subtitles.bn.srt');
    const finalPath = path.join(lessonDir, `${lesson.id}.mp4`);
    const vf = `subtitles=${srtPath}:force_style='FontName=Noto Sans Bengali,FontSize=18,PrimaryColour=&H00FFFFFF,OutlineColour=&H7A000000,BorderStyle=1,Outline=1,Shadow=0'`;

    if (audioPath && await exists(audioPath)) {
        const args = [
            '-y',
            '-i',
            videoOnly,
            '-i',
            audioPath,
            '-map',
            '0:v:0',
            '-map',
            '1:a:0',
            '-c:v',
            'libx264',
            '-c:a',
            'aac',
            '-shortest',
            '-pix_fmt',
            'yuv420p',
            finalPath,
        ];
        if (BURN_SUBTITLES) args.splice(6, 0, '-vf', vf);
        await run('ffmpeg', args);
    } else {
        const args = ['-y', '-i', videoOnly, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', finalPath];
        if (BURN_SUBTITLES) args.splice(3, 0, '-vf', vf);
        await run('ffmpeg', args);
    }

    return finalPath;
};

const findHumanVoiceFile = async (lesson) => {
    if (!VOICE_AUDIO_DIR) return '';

    const candidates = [
        `${lesson.id}.mp3`,
        `${lesson.id}.wav`,
        `${lesson.id}.m4a`,
        `${lesson.module}/${lesson.id}.mp3`,
        `${lesson.module}/${lesson.id}.wav`,
        `${lesson.module}/${lesson.id}.m4a`,
    ].map((file) => path.join(VOICE_AUDIO_DIR, file));

    for (const candidate of candidates) {
        if (await exists(candidate)) return candidate;
    }

    return '';
};

const main = async () => {
    let chromium;
    try {
        ({ chromium } = await import('playwright'));
    } catch {
        throw new Error('Playwright missing. Run: npm i -D playwright && npx playwright install chromium');
    }

    const selectedBase = FILTER.length ? lessons.filter((lesson) => FILTER.includes(lesson.id) || FILTER.includes(lesson.module)) : lessons;
    const selected = enrichLessons(selectedBase);
    if (!selected.length) {
        throw new Error(`No training lessons matched TRAINING_LESSONS=${FILTER.join(',')}`);
    }

    await fs.mkdir(OUT_DIR, { recursive: true });
    const auditReport = buildAuditReport(selectedBase);
    await fs.writeFile(path.join(OUT_DIR, 'training-script-audit.json'), JSON.stringify(auditReport, null, 2));
    await fs.writeFile(
        path.join(OUT_DIR, 'openai-tts-system-prompt.txt'),
        OPENAI_TTS_INSTRUCTIONS
    );

    const failedQuality = selected.map(validateTrainingScript).filter((result) => !result.ok);
    if (STRICT_SCRIPT_QUALITY && failedQuality.length) {
        throw new Error(`Training script quality failed for ${failedQuality.length} lesson(s). See ${path.join(OUT_DIR, 'training-script-audit.json')}`);
    }

    const storageStatePath = path.join(OUT_DIR, 'auth-storage-state.json');
    const manifest = {
        generatedAt: new Date().toISOString(),
        baseUrl: BASE_URL,
        lang: LANG,
        ttsProvider: TTS_PROVIDER || 'none',
        scriptStandard: 'bd-training-v1',
        ttsPrompt: path.join(OUT_DIR, 'openai-tts-system-prompt.txt'),
        qualityAudit: path.join(OUT_DIR, 'training-script-audit.json'),
        outDir: OUT_DIR,
        lessons: [],
    };

    if (AUDIT_ONLY) {
        console.log('\nTraining script audit exported.');
        console.log(`Output directory: ${OUT_DIR}`);
        console.log(`Audit: ${path.join(OUT_DIR, 'training-script-audit.json')}`);
        console.log(`OpenAI TTS prompt: ${path.join(OUT_DIR, 'openai-tts-system-prompt.txt')}`);
        console.log(`Lessons: ${auditReport.lessonCount}, errors: ${auditReport.errorCount}, warnings: ${auditReport.warningCount}`);
        return;
    }

    if (SCRIPT_ONLY) {
        for (const [index, lesson] of selected.entries()) {
            const lessonDir = path.join(OUT_DIR, lesson.module, `${String(index + 1).padStart(2, '0')}-${slugify(lesson.id)}`);
            const scenes = buildScenes(lesson);
            await fs.mkdir(lessonDir, { recursive: true });
            await writeLessonText(lessonDir, lesson, scenes);
            manifest.lessons.push({
                id: lesson.id,
                module: lesson.module,
                title: lesson.title,
                route: lesson.path,
                script: path.join(lessonDir, 'script.bn.txt'),
                scriptStandard: path.join(lessonDir, 'script-standard.json'),
                qualityReport: path.join(lessonDir, 'quality-report.json'),
                narration: path.join(lessonDir, 'narration.bn.txt'),
                expectedAudioFile: path.join(VOICE_AUDIO_DIR || 'VOICE_AUDIO_DIR', `${lesson.id}.mp3`),
                youtubeId: '',
            });
        }
        await fs.writeFile(path.join(OUT_DIR, 'training-video-manifest.json'), JSON.stringify(manifest, null, 2));
        console.log('\nScripts exported.');
        console.log(`Output directory: ${OUT_DIR}`);
        console.log(`Manifest: ${path.join(OUT_DIR, 'training-video-manifest.json')}`);
        console.log('Record human voice files as <lesson-id>.mp3 and run again with VOICE_AUDIO_DIR=/path/to/audio.');
        return;
    }

    const browser = await chromium.launch({ headless: true });
    await loginAndSaveState(browser, storageStatePath, OUT_DIR);

    for (const [index, lesson] of selected.entries()) {
        const lessonDir = path.join(OUT_DIR, lesson.module, `${String(index + 1).padStart(2, '0')}-${slugify(lesson.id)}`);
        const scenes = buildScenes(lesson);
        await fs.mkdir(lessonDir, { recursive: true });
        await writeLessonText(lessonDir, lesson, scenes);

        console.log(`\nTraining video ${index + 1}/${selected.length}: ${lesson.title}`);
        const videoOnly = await recordLesson(browser, storageStatePath, lessonDir, lesson, scenes);
        let audioPath = await findHumanVoiceFile(lesson);

        if (!audioPath && TTS_PROVIDER === 'google') audioPath = await generateGoogleVoice(lessonDir);
        if (!audioPath && TTS_PROVIDER === 'openai') audioPath = await generateOpenAiVoice(lessonDir);

        const finalPath = await muxFinalVideo(lessonDir, lesson, videoOnly, audioPath);
        manifest.lessons.push({
            id: lesson.id,
            module: lesson.module,
            title: lesson.title,
            route: lesson.path,
            video: finalPath,
            voice: audioPath || '',
            script: path.join(lessonDir, 'script.bn.txt'),
            scriptStandard: path.join(lessonDir, 'script-standard.json'),
            qualityReport: path.join(lessonDir, 'quality-report.json'),
            subtitles: path.join(lessonDir, 'subtitles.bn.srt'),
            youtubeId: '',
        });
    }

    await browser.close();
    await fs.writeFile(path.join(OUT_DIR, 'training-video-manifest.json'), JSON.stringify(manifest, null, 2));

    console.log('\nDone.');
    console.log(`Output directory: ${OUT_DIR}`);
    console.log(`Manifest: ${path.join(OUT_DIR, 'training-video-manifest.json')}`);
    if (!TTS_PROVIDER) {
        console.log('Voice note: no TTS provider configured, so videos have Bangla subtitles but no voice.');
        console.log('Google voice: GOOGLE_APPLICATION_CREDENTIALS=/path/key.json VIDEO_TTS_PROVIDER=google npm run video:training');
        console.log('OpenAI voice: OPENAI_API_KEY=... VIDEO_TTS_PROVIDER=openai npm run video:training');
    }
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
