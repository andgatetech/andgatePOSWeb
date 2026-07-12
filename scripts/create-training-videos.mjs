import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import sharp from 'sharp';
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
const OPENAI_TTS_SPEED = process.env.OPENAI_TTS_SPEED ? Number(process.env.OPENAI_TTS_SPEED) : null;
const OPENAI_TTS_INSTRUCTIONS = process.env.OPENAI_TTS_INSTRUCTIONS || BANGLADESHI_TTS_PROMPT;
const TTS_PROVIDER = process.env.VIDEO_TTS_PROVIDER || (GOOGLE_TTS_CREDENTIALS ? 'google' : process.env.OPENAI_API_KEY ? 'openai' : '');
const VIDEO_STORAGE_STATE = process.env.VIDEO_STORAGE_STATE || '';
const BURN_SUBTITLES = ['1', 'true', 'yes', 'on'].includes(String(process.env.VIDEO_BURN_SUBTITLES || '').toLowerCase());
const STEP_OVERLAY_MODE = (process.env.VIDEO_STEP_OVERLAY || 'compact').toLowerCase();
const SCRIPT_ONLY = ['1', 'true', 'yes', 'on'].includes(String(process.env.TRAINING_SCRIPT_ONLY || '').toLowerCase());
const AUDIT_ONLY = ['1', 'true', 'yes', 'on'].includes(String(process.env.TRAINING_AUDIT_ONLY || '').toLowerCase());
const STRICT_SCRIPT_QUALITY = ['1', 'true', 'yes', 'on'].includes(String(process.env.TRAINING_STRICT_SCRIPT_QUALITY || '').toLowerCase());
const ALLOW_SUBMIT_ACTIONS = ['1', 'true', 'yes', 'on'].includes(String(process.env.TRAINING_ALLOW_SUBMIT_ACTIONS || '').toLowerCase());
const VOICE_AUDIO_DIR = process.env.VOICE_AUDIO_DIR || '';
// Screenshot-diff QA: catches scenes where the mapped action silently found
// nothing to interact with, leaving the recording visually frozen.
const STRICT_ACTION_QA = ['1', 'true', 'yes', 'on'].includes(String(process.env.TRAINING_STRICT_ACTION_QA || '').toLowerCase());
const QA_MIN_CHANGE_FRACTION = Number(process.env.TRAINING_QA_MIN_CHANGE || '0.01');
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
        auth: false,
        narration: spoken('প্রথম lesson-এ আমরা account registration দেখবো।', 'Owner name, phone, email, password, store name আর store type ঠিকভাবে দিলে আপনার real store account তৈরি হবে।', 'Registration complete হলে system আপনাকে dashboard-এ নিয়ে যাবে, তারপর setup checklist শুরু করবেন।'),
        steps: ['Register page খুলুন', 'Owner ও store information দিন', 'Trial account তৈরি হলে dashboard check করুন'],
    },
    {
        id: 'login-own-account',
        module: '01-account-access',
        title: 'Login With Your Own Account',
        path: '/login',
        auth: false,
        narration: spoken('এবার নিজের account দিয়ে login করা দেখি।', 'Email আর password দিয়ে sign in করুন। Trusted device হলে remember me ব্যবহার করা যায়, কিন্তু shared computer হলে এটা বন্ধ রাখাই ভালো।', 'Login successful হলে dashboard খুলবে।'),
        steps: ['Email ও password দিন', 'Remember me carefully ব্যবহার করুন', 'Login-এর পরে dashboard confirm করুন'],
    },
    {
        id: 'demo-account-login',
        module: '01-account-access',
        title: 'Practice With Demo Account',
        path: '/login',
        auth: false,
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
        title: 'Barcode and QR Label Print',
        path: '/label',
        navigation: 'পণ্য মেনু থেকে লেবেল প্রিন্ট পেজ খুলুন।',
        learningGoal: 'পণ্য নির্বাচন থেকে শুরু করে বারকোড বা QR লেবেল তৈরি, সাইজ ঠিক করা, PDF নেওয়া এবং প্রিন্ট করা শেখা।',
        commonMistakes: ['ভুল ভ্যারিয়েন্টের লেবেল প্রিন্ট করা', 'প্রিন্টারের paper size না মিলানো', 'প্রিন্টের পরে scan test না করা'],
        tips: ['প্রথমে একটি sample label প্রিন্ট করুন', 'Thermal printer হলে width ঠিক রাখুন', 'প্রিন্টের পরে POS-এ scan test করুন'],
        summary: 'পণ্য নির্বাচন, label type, settings, generate, PDF বা print - এই flow follow করলে label ভুল কম হবে।',
        steps: [
            'বাম পাশ থেকে পণ্য খুঁজে সিলেক্ট করুন',
            'ভ্যারিয়েন্ট থাকলে সঠিক size, color, model বা stock variant বেছে নিন',
            'Barcode অথবা QR Code label type নির্বাচন করুন',
            'Settings খুলে label preset, custom width-height, paper size এবং live preview মিলিয়ে নিন',
            'Copies, barcode type অথবা QR size এবং Info option ঠিক করুন',
            'Generate Labels চাপার আগে total labels ও selected items মিলিয়ে নিন',
            'PDF ডাউনলোড করুন অথবা Print দিয়ে printer, paper size, margin ও scale মিলিয়ে প্রিন্ট করুন',
            'প্রিন্টের পরে কয়েকটি label POS-এ scan test করুন',
        ],
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

// Human-feel interaction helpers. These drive real Playwright input/keyboard
// events from Node so the recorded video shows actual per-keystroke typing
// and real clicks, instead of a cursor drifting over highlighted boxes.
const HUMAN_TYPE_DELAY_MS = Number(process.env.VIDEO_TYPE_DELAY_MS || '70');

const SAMPLE_VALUES = {
    name: 'রহিম উদ্দিন',
    productName: 'Lux সাবান ৭৫ গ্রাম',
    storeName: 'Training Store',
    phone: '01710000000',
    email: 'training@example.com',
    price: '120',
    amount: '500',
    quantity: '5',
    note: 'ট্রেনিং ডেমো এন্ট্রি',
    address: 'হাউস ১২, রোড ৫, ধানমন্ডি, ঢাকা',
    search: 'সাবান',
    category: 'সাধারণ',
};

const highlightLocator = async (page, selector) => {
    const locator = page.locator(selector).first();
    if ((await locator.count().catch(() => 0)) === 0) return null;
    if (!(await locator.isVisible().catch(() => false))) return null;
    return locator
        .evaluate((el) => {
            document.querySelectorAll('[data-andgate-training-highlight]').forEach((node) => {
                node.style.outline = '';
                node.style.boxShadow = '';
                node.removeAttribute('data-andgate-training-highlight');
            });
            el.setAttribute('data-andgate-training-highlight', 'true');
            el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            el.style.outline = '4px solid rgba(231,146,55,.95)';
            el.style.outlineOffset = '4px';
            el.style.boxShadow = '0 0 0 10px rgba(231,146,55,.18)';
            const rect = el.getBoundingClientRect();
            return {
                x: Math.round(rect.left + Math.min(rect.width / 2, 220)),
                y: Math.round(rect.top + Math.min(rect.height / 2, 44)),
                tag: el.tagName.toLowerCase(),
            };
        })
        .catch(() => null);
};

// Finds a real, empty, visible field matching keyword hints and highlights
// it, without setting a value. The caller then types into it for real.
const discoverAndMark = async (page, hints = []) => {
    const excludeTypes = ['hidden', 'password', 'submit', 'file', 'checkbox', 'radio'];
    return page
        .evaluate(
            ({ hints, excludeTypes }) => {
                const visible = (el) => {
                    const rect = el.getBoundingClientRect();
                    const style = window.getComputedStyle(el);
                    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && !el.disabled && !el.readOnly;
                };
                const candidates = Array.from(document.querySelectorAll('input, textarea, select')).filter((el) => {
                    const type = (el.getAttribute('type') || '').toLowerCase();
                    return !excludeTypes.includes(type) && visible(el);
                });
                const lowered = hints.map((item) => String(item).toLowerCase());
                let match = null;
                if (lowered.length) {
                    match = candidates.find((el) => {
                        const hay = `${el.name || ''} ${el.id || ''} ${el.placeholder || ''} ${el.getAttribute('aria-label') || ''}`.toLowerCase();
                        return lowered.some((hint) => hay.includes(hint));
                    });
                }
                if (!match) match = candidates.find((el) => !el.value);
                if (!match) match = candidates[0];
                if (!match) return null;

                document.querySelectorAll('[data-andgate-training-highlight]').forEach((node) => {
                    node.style.outline = '';
                    node.style.boxShadow = '';
                    node.removeAttribute('data-andgate-training-highlight');
                });
                match.setAttribute('data-andgate-training-highlight', 'true');
                match.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                match.style.outline = '4px solid rgba(231,146,55,.95)';
                match.style.outlineOffset = '4px';
                match.style.boxShadow = '0 0 0 10px rgba(231,146,55,.18)';
                const rect = match.getBoundingClientRect();
                return {
                    x: Math.round(rect.left + Math.min(rect.width / 2, 220)),
                    y: Math.round(rect.top + Math.min(rect.height / 2, 44)),
                    tag: match.tagName.toLowerCase(),
                };
            },
            { hints, excludeTypes },
        )
        .catch(() => null);
};

// Finds a real, visible, clickable element by text (e.g. a tab label) and
// highlights it, without clicking. The caller does the actual real click.
// Used for things like switching a form to its "Pricing" tab before a field
// on that tab can be filled — without this, fields on inactive tabs are
// invisible and every action targeting them silently no-ops.
const discoverTextAndMark = async (page, needles = [], scope = 'button, a, [role="tab"], [role="button"]') => {
    return page
        .evaluate(
            ({ needles, scope }) => {
                const visible = (el) => {
                    const rect = el.getBoundingClientRect();
                    const style = window.getComputedStyle(el);
                    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
                };
                const lowered = needles.map((item) => String(item).toLowerCase());
                const match = Array.from(document.querySelectorAll(scope))
                    .filter(visible)
                    .find((el) => {
                        const text = (el.innerText || el.textContent || '').trim().toLowerCase();
                        return text && text.length < 60 && lowered.some((needle) => text.includes(needle));
                    });
                if (!match) return null;

                document.querySelectorAll('[data-andgate-training-highlight]').forEach((node) => {
                    node.style.outline = '';
                    node.style.boxShadow = '';
                    node.removeAttribute('data-andgate-training-highlight');
                });
                match.setAttribute('data-andgate-training-highlight', 'true');
                match.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                match.style.outline = '4px solid rgba(231,146,55,.95)';
                match.style.outlineOffset = '4px';
                match.style.boxShadow = '0 0 0 10px rgba(231,146,55,.18)';
                const rect = match.getBoundingClientRect();
                return {
                    x: Math.round(rect.left + Math.min(rect.width / 2, 220)),
                    y: Math.round(rect.top + Math.min(rect.height / 2, 44)),
                };
            },
            { needles, scope },
        )
        .catch(() => null);
};

// Real per-keystroke typing via Playwright, not an instant DOM value-set.
const humanType = async (page, selector, value) => {
    if (!value) return false;
    const locator = page.locator(selector).first();
    if ((await locator.count().catch(() => 0)) === 0) return false;
    if (!(await locator.isVisible().catch(() => false))) return false;
    await locator.scrollIntoViewIfNeeded().catch(() => undefined);
    await locator.click({ timeout: 3000 }).catch(() => undefined);
    await page.keyboard.press('ControlOrMeta+A').catch(() => undefined);
    await page.keyboard.press('Backspace').catch(() => undefined);
    await locator.pressSequentially(String(value), { delay: HUMAN_TYPE_DELAY_MS }).catch(async () => {
        await locator.fill(String(value)).catch(() => undefined);
    });
    await page.waitForTimeout(200);
    return true;
};

// Picks a real, already-present option instead of typing free text into a
// dropdown, so the recording shows an actual selection happening.
const humanSelect = async (page, selector) => {
    const locator = page.locator(selector).first();
    if ((await locator.count().catch(() => 0)) === 0) return false;
    if (!(await locator.isVisible().catch(() => false))) return false;
    await locator.scrollIntoViewIfNeeded().catch(() => undefined);
    const labels = await locator.locator('option').allTextContents().catch(() => []);
    let index = labels.findIndex((label) => label && !/select|choose|বেছে|নির্বাচন/i.test(label));
    if (index < 0) index = labels.length > 1 ? 1 : -1;
    if (index < 0) return false;
    await locator.selectOption({ index }).catch(() => undefined);
    await page.waitForTimeout(250);
    return true;
};

// Screenshot-diff QA. The injected cursor/step-caption/url-bar overlays move
// or repaint every scene regardless of whether the real action worked, so
// they're hidden before capture — otherwise a silently-failed action (target
// not visible, wrong selector, etc.) would still register as "changed" just
// from the cursor drifting, masking exactly the bug this is meant to catch.
const QA_OVERLAY_IDS = ['andgate-training-step-overlay', 'andgate-training-cursor', 'andgate-training-url-overlay'];

const captureContentScreenshot = async (page) => {
    await page
        .evaluate((ids) => {
            ids.forEach((id) => {
                const el = document.getElementById(id);
                if (el) el.style.setProperty('display', 'none', 'important');
            });
        }, QA_OVERLAY_IDS)
        .catch(() => undefined);
    const buffer = await page.screenshot({ type: 'jpeg', quality: 40 }).catch(() => null);
    await page
        .evaluate((ids) => {
            ids.forEach((id) => {
                const el = document.getElementById(id);
                if (el) el.style.removeProperty('display');
            });
        }, QA_OVERLAY_IDS)
        .catch(() => undefined);
    return buffer;
};

// Returns the fraction (0..1) of sampled pixels that changed meaningfully
// between two screenshots. Downscales first since only "did something
// happen" matters, not pixel-perfect comparison.
const diffScreenshots = async (bufferA, bufferB) => {
    if (!bufferA || !bufferB) return 1;
    try {
        const size = { width: 96, height: 54 };
        const [a, b] = await Promise.all([
            sharp(bufferA).resize(size.width, size.height).raw().toBuffer(),
            sharp(bufferB).resize(size.width, size.height).raw().toBuffer(),
        ]);
        if (a.length !== b.length || a.length === 0) return 1;
        let changed = 0;
        for (let i = 0; i < a.length; i += 1) {
            if (Math.abs(a[i] - b[i]) > 18) changed += 1;
        }
        return changed / a.length;
    } catch {
        return 1;
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

const humanTitle = (lesson) =>
    cleanSpokenBangla(
        String(lesson.title || '')
            .replace(/AndgatePOS/gi, 'AndgatePOS')
            .replace(/Dashboard Overview/i, 'ড্যাশবোর্ড')
            .replace(/Create Your AndgatePOS Account/i, 'AndgatePOS অ্যাকাউন্ট তৈরি')
            .replace(/Login With Your Own Account/i, 'নিজের অ্যাকাউন্ট দিয়ে লগইন')
            .replace(/Practice With Demo Account/i, 'ডেমো অ্যাকাউন্টে প্র্যাকটিস')
            .replace(/First Dashboard Checklist/i, 'প্রথম ড্যাশবোর্ড চেকলিস্ট')
            .replace(/Store Profile and Settings/i, 'দোকানের প্রোফাইল আর সেটিংস')
            .replace(/User Roles and Permissions/i, 'স্টাফের রোল আর পারমিশন')
            .replace(/Business OS Command Center/i, 'দৈনিক কাজের কমান্ড সেন্টার')
            .replace(/Cash and Counter Closing/i, 'দিনশেষে ক্যাশ মিলানো')
            .replace(/Staff Attendance/i, 'কর্মীর হাজিরা')
            .replace(/Add Products/i, 'নতুন পণ্য যোগ করা')
            .replace(/Make a POS Sale/i, 'পস বিক্রয়')
            .replace(/Purchase Orders/i, 'ক্রয় অর্ডার')
            .replace(/Customers and CRM/i, 'গ্রাহক আর সিআরএম')
            .replace(/Accounting and Cash Book/i, 'হিসাব আর ক্যাশ বই')
            .replace(/Reports and Analytics/i, 'রিপোর্ট আর বিশ্লেষণ')
            .replace(/Ecommerce Orders and COD/i, 'অনলাইন অর্ডার আর সিওডি')
            .replace(/COD Reconciliation/i, 'সিওডি হিসাব মিলানো')
            .replace(/Audit Logs and Security Review/i, 'অডিট লগ আর নিরাপত্তা রিভিউ')
            .replace(/Payroll/i, 'বেতন হিসাব')
            .replace(/Upgrade Plan/i, 'প্যাকেজ আপগ্রেড')
            .replace(/Profit and Loss/i, 'লাভ-লোকসান')
            .replace(/Receive Goods/i, 'মাল রিসিভ')
            .replace(/Audit Logs and Security/i, 'অডিট লগ আর নিরাপত্তা')
            .replace(/COD Reconciliation/i, 'সিওডি হিসাব মিলানো')
    );

const getTrainingPersona = (lesson) => {
    const haystack = `${lesson.id} ${lesson.module} ${lesson.title} ${lesson.path}`.toLowerCase();

    if (lesson.auth === false) {
        return {
            shop: 'নতুন দোকানের মালিক',
            scene: 'আপনি প্রথমবার অনলাইনে দোকানের অ্যাকাউন্ট খুলছেন, পাশে একজন ট্রেইনার বসে আছে',
            pressure: 'ভুল তথ্য দিলে পরে লগইন, সাপোর্ট, আর দোকানের সেটআপে ঝামেলা হবে',
            habit: 'প্রতিটি তথ্য লেখার পর একবার চোখে মিলিয়ে নেওয়া',
        };
    }
    if (haystack.includes('pos') || haystack.includes('sale') || haystack.includes('barcode') || haystack.includes('discount') || haystack.includes('end-of-day')) {
        return {
            shop: 'কাউন্টারের ক্যাশিয়ার',
            scene: 'দোকানে গ্রাহক সামনে দাঁড়িয়ে আছে, দ্রুত কিন্তু ভুল ছাড়া বিল শেষ করতে হবে',
            pressure: 'ভুল পণ্য, ভুল ডিসকাউন্ট, বা ভুল পেমেন্ট দিলে ক্যাশ আর স্টক দুইটাই গরমিল হবে',
            habit: 'পেমেন্ট নেওয়ার আগে কার্ট, মোট টাকা, আর পেমেন্ট মেথড মুখে বলে মিলিয়ে নেওয়া',
        };
    }
    if (haystack.includes('product') || haystack.includes('stock') || haystack.includes('inventory') || haystack.includes('category') || haystack.includes('brand') || haystack.includes('label')) {
        return {
            shop: 'স্টক ম্যানেজার',
            scene: 'নতুন মাল দোকানে এসেছে, এখন সিস্টেমে ঠিকভাবে সাজিয়ে রাখতে হবে',
            pressure: 'নাম, দাম, কস্ট, বা স্টক ভুল হলে পস, রিপোর্ট, আর অনলাইন স্টোর সব জায়গায় ভুল ছড়াবে',
            habit: 'সংরক্ষণের আগে পণ্যের নাম, দাম, কস্ট, স্টক, ক্যাটাগরি, আর বারকোড মিলিয়ে নেওয়া',
        };
    }
    if (haystack.includes('purchase') || haystack.includes('supplier') || haystack.includes('receive')) {
        return {
            shop: 'ক্রয় দায়িত্বে থাকা ম্যানেজার',
            scene: 'সাপ্লায়ার মাল পাঠিয়েছে, চালান আর হাতে পাওয়া পণ্য মিলিয়ে সিস্টেমে নিতে হবে',
            pressure: 'ভুল সাপ্লায়ার, ভুল পরিমাণ, বা ভুল বাকি দিলে পরে পেমেন্ট আর স্টক মিলবে না',
            habit: 'মাল রিসিভ করার আগে চালান, পরিমাণ, দাম, আর সাপ্লায়ার বাকি একসাথে মিলিয়ে নেওয়া',
        };
    }
    if (haystack.includes('customer') || haystack.includes('crm') || haystack.includes('loyalty') || haystack.includes('due')) {
        return {
            shop: 'দোকানের মালিক',
            scene: 'নিয়মিত গ্রাহক, বাকি টাকা, আর ফলোআপ এক জায়গায় গুছিয়ে রাখতে হবে',
            pressure: 'ভুল মোবাইল নম্বর বা বাকি আপডেট না দিলে পরে টাকা আদায় আর গ্রাহক সেবা কঠিন হবে',
            habit: 'প্রতিটি গ্রাহকের নাম, নম্বর, বাকি, আর শেষ কেনাকাটার ইতিহাস দেখে কথা বলা',
        };
    }
    if (haystack.includes('accounting') || haystack.includes('expense') || haystack.includes('profit') || haystack.includes('ledger') || haystack.includes('bank') || haystack.includes('cashflow')) {
        return {
            shop: 'হিসাব দেখা মালিক',
            scene: 'দিনের বিক্রি, খরচ, ক্যাশ, ব্যাংক, আর লাভ একসাথে বুঝতে হবে',
            pressure: 'ছোট খরচ বা ভুল অ্যাকাউন্ট বাদ পড়লে মাসশেষে লাভ-লোকসান ভুল দেখাবে',
            habit: 'প্রতিদিনের লেনদেন প্রতিদিন লিখে রাখা এবং রিপোর্ট দেখার আগে তারিখ মিলানো',
        };
    }
    if (haystack.includes('report') || haystack.includes('analytics') || haystack.includes('dashboard') || haystack.includes('insights') || haystack.includes('benchmarking')) {
        return {
            shop: 'সিদ্ধান্ত নেওয়া মালিক',
            scene: 'দোকানের অবস্থা দেখে আজ কী কিনবেন, কোথায় চাপ আছে, আর কোন শাখা পিছিয়ে আছে বুঝতে হবে',
            pressure: 'ভুল তারিখ বা ভুল ফিল্টার দেখলে সিদ্ধান্তও ভুল হবে',
            habit: 'রিপোর্ট দেখার আগে তারিখ, শাখা, স্টোর, আর ফিল্টার মিলিয়ে নেওয়া',
        };
    }
    if (haystack.includes('hr') || haystack.includes('attendance') || haystack.includes('payroll') || haystack.includes('salary') || haystack.includes('leave') || haystack.includes('employee')) {
        return {
            shop: 'স্টাফ ম্যানেজার',
            scene: 'কর্মীর হাজিরা, ছুটি, অগ্রিম, আর বেতন ন্যায্যভাবে হিসাব করতে হবে',
            pressure: 'হাজিরা বা অগ্রিম ভুল থাকলে বেতন নিয়ে ঝামেলা হতে পারে',
            habit: 'বেতন করার আগে হাজিরা, ছুটি, অগ্রিম, বোনাস, আর কর্তন মিলিয়ে নেওয়া',
        };
    }
    if (haystack.includes('ecommerce') || haystack.includes('online') || haystack.includes('courier') || haystack.includes('cod') || haystack.includes('marketing')) {
        return {
            shop: 'অনলাইন অর্ডার দেখা ম্যানেজার',
            scene: 'ফেসবুক বা অনলাইন স্টোর থেকে অর্ডার এসেছে, এখন কনফার্ম, কুরিয়ার, আর টাকা আদায় ট্র্যাক করতে হবে',
            pressure: 'স্ট্যাটাস বা সিওডি ভুল থাকলে গ্রাহক, কুরিয়ার, আর ক্যাশ হিসাব গুলিয়ে যাবে',
            habit: 'অর্ডার কনফার্ম করার আগে পণ্য, ঠিকানা, কুরিয়ার, আর টাকা আদায়ের অবস্থা মিলিয়ে নেওয়া',
        };
    }
    if (haystack.includes('subscription') || haystack.includes('plan') || haystack.includes('renew') || haystack.includes('upgrade') || haystack.includes('payment-verification')) {
        return {
            shop: 'সাবস্ক্রিপশন দেখা মালিক',
            scene: 'লাইভ দোকানে কাজ বন্ধ না রেখে কোন প্যাকেজে কোন ফিচার আছে সেটা বুঝতে হবে',
            pressure: 'প্ল্যান শেষ হলে বা ফিচার লক থাকলে গুরুত্বপূর্ণ কাজ মাঝপথে আটকে যেতে পারে',
            habit: 'মেয়াদ, প্যাকেজ, ফিচার, আর পেমেন্ট রেফারেন্স আগে মিলিয়ে নেওয়া',
        };
    }
    if (haystack.includes('setting') || haystack.includes('default') || haystack.includes('invoice') || haystack.includes('payment-settings') || haystack.includes('return-policies')) {
        return {
            shop: 'দোকান সেটআপ করা মালিক',
            scene: 'লাইভ বিক্রি শুরু করার আগে দোকানের নাম, রসিদ, পেমেন্ট, আর নিয়ম ঠিক করতে হবে',
            pressure: 'সেটিংস ভুল থাকলে প্রতিটি বিল, রিপোর্ট, আর গ্রাহকের রসিদে ভুল যাবে',
            habit: 'লাইভ যাওয়ার আগে সেটিংস একবার মালিকের তথ্য দিয়ে যাচাই করা',
        };
    }

    return {
        shop: 'দোকানের মালিক',
        scene: 'বাস্তব দোকানের কাজ গুছিয়ে সিস্টেমে ঠিকভাবে রাখতে হবে',
        pressure: 'ছোট ভুল পরে রিপোর্ট, স্টক, পেমেন্ট, বা গ্রাহক সেবায় প্রভাব ফেলতে পারে',
        habit: 'প্রতিটি ধাপে স্ক্রিনের তথ্য বাস্তব কাজের সাথে মিলিয়ে নেওয়া',
    };
};

const TRAINING_STORY_TEMPLATES = {
    account: {
        trainerRole: 'নতুন দোকান অনবোর্ডিং ট্রেইনার',
        learnerRole: 'নতুন দোকানের মালিক',
        scenario: 'আপনি প্রথমবার AndgatePOS চালু করছেন, তাই অ্যাকাউন্টের তথ্য এমনভাবে দিতে হবে যেন পরে লগইন, সাপোর্ট, আর দোকানের সেটআপে কোনো জট না লাগে',
        opening: ({ title }) => `ধরুন আপনি নতুন দোকানের মালিক, আজ প্রথমবার AndgatePOS চালু করবেন। আমরা ${title} ধাপে ধাপে করবো। ফর্ম পূরণ করাই লক্ষ্য না, কোন তথ্য পরে কোথায় লাগবে সেটা বুঝে নিয়ে এগোবো।`,
        screen: 'প্রথমে পুরো স্ক্রিনটা দেখে নিন। কোন ঘরে দোকানের তথ্য, কোন ঘরে মালিকের তথ্য, আর কোন অংশ দিয়ে কাজ শেষ হবে সেটা বুঝে নিলে ভুল কম হবে।',
        generic: ({ focus }) => `${focus} অংশে তথ্য দেওয়ার আগে ভাবুন, এই তথ্য পরে লগইন, সাপোর্ট, ইনভয়েস, আর দোকানের পরিচয়ে ব্যবহার হতে পারে। তাই বানান, মোবাইল নম্বর, আর ইমেইল ধীরে মিলিয়ে নিন।`,
        closing: 'শেষে একবার দোকানের নাম, মালিকের নাম, মোবাইল, ইমেইল, আর পাসওয়ার্ড মিলিয়ে নিন। এই অভ্যাস থাকলে অ্যাকাউন্ট তৈরি হওয়ার পর সেটআপ শুরু করা সহজ হবে।',
    },
    pos: {
        trainerRole: 'কাউন্টার ট্রেইনার',
        learnerRole: 'ক্যাশিয়ার',
        scenario: 'গ্রাহক সামনে দাঁড়িয়ে আছে, তাই দ্রুত কাজ করতে হবে, কিন্তু ভুল পণ্য বা ভুল পেমেন্ট নেওয়া যাবে না',
        opening: ({ title }) => `ধরুন দোকানে গ্রাহক কাউন্টারে দাঁড়িয়ে আছে। এখন ${title} কাজটা করবো, কিন্তু তাড়াহুড়া করে না; পণ্য, পরিমাণ, ডিসকাউন্ট, আর পেমেন্ট মিলিয়ে বিল শেষ করবো।`,
        screen: 'প্রথমে কাউন্টারের স্ক্রিনটা দেখে নিন। পণ্য খোঁজার জায়গা, কার্ট, ডিসকাউন্ট, পেমেন্ট, আর রসিদ কোথায় আছে সেটা বুঝলে বিক্রির সময় হাত কাঁপবে না।',
        generic: ({ focus }) => `${focus} অংশে কাজ করার সময় গ্রাহকের সামনে যা বলছেন আর স্ক্রিনে যা দেখাচ্ছে, দুইটা মিলিয়ে নিন। ভুল হলে সঙ্গে সঙ্গে বিল, স্টক, আর ক্যাশ রিপোর্টে প্রভাব পড়বে।`,
        closing: 'বিল শেষ করার আগে কার্ট, মোট টাকা, ডিসকাউন্ট, পেমেন্ট মেথড, আর রসিদ একবার মিলিয়ে নিন। কাউন্টারে এই ছোট অভ্যাসটাই বড় ভুল কমায়।',
    },
    inventory: {
        trainerRole: 'স্টক ট্রেইনার',
        learnerRole: 'স্টক ম্যানেজার',
        scenario: 'নতুন মাল দোকানে এসেছে, এখন সিস্টেমে এমনভাবে রাখতে হবে যেন কাউন্টারে বিক্রি, স্টক রিপোর্ট, আর অনলাইন স্টোর সব ঠিক থাকে',
        opening: ({ title }) => `ধরুন নতুন মাল দোকানে এসেছে। এখন ${title} কাজটা করবো। শুরুতে পণ্যের তথ্য ঠিক দিলে পরে পস, স্টক রিপোর্ট, বারকোড, আর অনলাইন স্টোর সব জায়গায় কাজ সহজ হয়।`,
        screen: 'প্রথমে পণ্যের স্ক্রিনটা দেখে নিন। নাম, ক্যাটাগরি, দাম, কস্ট, স্টক, বারকোড, আর সংরক্ষণ বাটন কোন দিকে আছে সেটা বুঝে নিন।',
        generic: ({ focus }) => `${focus} অংশে তথ্য দেওয়ার সময় হাতে থাকা পণ্যটার সাথে স্ক্রিন মিলিয়ে নিন। নাম, দাম, কস্ট, স্টক, বা বারকোড ভুল হলে ভুলটা পরে অনেক জায়গায় ছড়িয়ে যায়।`,
        closing: 'সংরক্ষণের আগে পণ্যের নাম, ক্যাটাগরি, দাম, কস্ট, স্টক, আর বারকোড আবার দেখে নিন। দোকানের স্টক পরিষ্কার রাখতে এই যাচাইটা খুব দরকার।',
    },
    purchase: {
        trainerRole: 'ক্রয় ট্রেইনার',
        learnerRole: 'ক্রয় ম্যানেজার',
        scenario: 'সাপ্লায়ার মাল পাঠিয়েছে, এখন চালান, পণ্য, পরিমাণ, দাম, পেমেন্ট, আর বাকি মিলিয়ে সিস্টেমে নিতে হবে',
        opening: ({ title }) => `ধরুন সাপ্লায়ার মাল পাঠিয়েছে। এখন ${title} কাজটা করবো। চালান, পণ্য, পরিমাণ, দাম, আর সাপ্লায়ারের বাকি মিলিয়ে নিলে পরে পেমেন্ট আর স্টক দুইটাই পরিষ্কার থাকে।`,
        screen: 'প্রথমে ক্রয়ের স্ক্রিনটা দেখুন। সাপ্লায়ার, পণ্য, পরিমাণ, রিসিভ, পেমেন্ট, আর বাকি অংশ কোথায় আছে সেটা বুঝে নিন।',
        generic: ({ focus }) => `${focus} অংশে কাজ করার সময় সাপ্লায়ারের চালান আর হাতে পাওয়া মাল মিলিয়ে নিন। ভুল পরিমাণ বা ভুল সাপ্লায়ার দিলে পরে স্টক আর বাকি দুটোই মিলবে না।`,
        closing: 'মাল রিসিভ করার আগে সাপ্লায়ার, চালান, পণ্য, পরিমাণ, দাম, পেমেন্ট, আর বাকি একবার মিলিয়ে নিন। তারপরই রেকর্ড সংরক্ষণ করবেন।',
    },
    crm: {
        trainerRole: 'গ্রাহক সম্পর্ক ট্রেইনার',
        learnerRole: 'দোকানের মালিক',
        scenario: 'নিয়মিত গ্রাহক, বাকি টাকা, রিটার্ন, আর ফলোআপ এক জায়গায় গুছিয়ে রাখতে হবে',
        opening: ({ title }) => `ধরুন আপনি নিয়মিত গ্রাহকদের ঠিকভাবে ধরে রাখতে চান। এখন ${title} দেখবো, যাতে গ্রাহকের মোবাইল, কেনাকাটার ইতিহাস, বাকি, আর ফলোআপ এক জায়গায় থাকে।`,
        screen: 'প্রথমে গ্রাহকের স্ক্রিনটা দেখুন। তালিকা, বাকি, আগের কেনাকাটা, নোট, আর ফলোআপের জায়গা কোথায় আছে সেটা বুঝে নিন।',
        generic: ({ focus }) => `${focus} অংশে দেখার সময় গ্রাহকের নামের সাথে মোবাইল আর আগের হিসাব মিলিয়ে নিন। ভুল গ্রাহকের নামে বাকি বা ফলোআপ দিলে সম্পর্ক নষ্ট হতে পারে।`,
        closing: 'গ্রাহকের কাজ শেষ করার আগে নাম, মোবাইল, বাকি, শেষ কেনাকাটা, আর পরের ফলোআপ মিলিয়ে নিন। এতে গ্রাহক সেবা আর টাকা আদায় দুটোই সহজ হয়।',
    },
    accounting: {
        trainerRole: 'হিসাব ট্রেইনার',
        learnerRole: 'হিসাব দেখা মালিক',
        scenario: 'দিনের বিক্রি, খরচ, ক্যাশ, ব্যাংক, বাকি, আর লাভ একসাথে বুঝতে হবে',
        opening: ({ title }) => `ধরুন দিনশেষে আপনি দোকানের হিসাব মিলাচ্ছেন। এখন ${title} দেখবো, যাতে টাকা কোথা থেকে এল, কোথায় গেল, আর লাভ কত হলো সেটা পরিষ্কার বোঝা যায়।`,
        screen: 'প্রথমে হিসাবের স্ক্রিনটা দেখুন। তারিখ, অ্যাকাউন্ট, ডেবিট, ক্রেডিট, ব্যালেন্স, রিপোর্ট, আর এক্সপোর্টের জায়গা আলাদা করে চিনে নিন।',
        generic: ({ focus }) => `${focus} অংশে সংখ্যা দেখার সময় শুধু মোট টাকা দেখবেন না। টাকা কোন অ্যাকাউন্টে ঢুকেছে, কোন খাতে বের হয়েছে, আর রিপোর্টে কী প্রভাব পড়ছে সেটা বুঝে নিন।`,
        closing: 'হিসাব শেষ করার আগে তারিখ, ক্যাশ, ব্যাংক, খরচ, বাকি, আর ব্যালেন্স মিলিয়ে নিন। ছোট খরচ বাদ পড়লে মাসশেষে লাভ-লোকসান ভুল দেখাবে।',
    },
    reports: {
        trainerRole: 'বিজনেস রিপোর্ট ট্রেইনার',
        learnerRole: 'সিদ্ধান্ত নেওয়া মালিক',
        scenario: 'রিপোর্ট দেখে আজ কী কিনবেন, কোন পণ্য চলছে, কোথায় খরচ বেশি, আর কোন শাখা পিছিয়ে আছে বুঝতে হবে',
        opening: ({ title }) => `ধরুন আপনি রিপোর্ট দেখে দোকানের পরের সিদ্ধান্ত নেবেন। এখন ${title} দেখবো। এখানে লক্ষ্য শুধু সংখ্যা দেখা না; কোন সংখ্যার কারণে কী সিদ্ধান্ত নিতে হবে সেটা বোঝা।`,
        screen: 'প্রথমে রিপোর্ট স্ক্রিনটা দেখুন। তারিখ, স্টোর, ফিল্টার, চার্ট, টেবিল, আর এক্সপোর্টের জায়গা চিনে নিন।',
        generic: ({ focus }) => `${focus} অংশে দেখার আগে তারিখ আর ফিল্টার মিলিয়ে নিন। ভুল সময়সীমা নিয়ে রিপোর্ট দেখলে সিদ্ধান্তও ভুল হবে।`,
        closing: 'রিপোর্ট দেখে সিদ্ধান্ত নেওয়ার আগে তারিখ, স্টোর, ফিল্টার, বিক্রি, স্টক, খরচ, আর লাভ একসাথে মিলিয়ে নিন। একটা সংখ্যা দেখে চূড়ান্ত সিদ্ধান্ত নেবেন না।',
    },
    hr: {
        trainerRole: 'এইচআর ট্রেইনার',
        learnerRole: 'স্টাফ ম্যানেজার',
        scenario: 'কর্মীর হাজিরা, শিফট, ছুটি, অগ্রিম, বোনাস, আর বেতন ন্যায্যভাবে হিসাব করতে হবে',
        opening: ({ title }) => `ধরুন মাসশেষে কর্মীর হিসাব তৈরি করতে হবে। এখন ${title} দেখবো। হাজিরা, ছুটি, অগ্রিম, বোনাস, আর কর্তন ঠিক না থাকলে বেতন নিয়ে ঝামেলা হতে পারে।`,
        screen: 'প্রথমে কর্মীর স্ক্রিনটা দেখুন। কর্মী নির্বাচন, তারিখ, শিফট, রেকর্ড, অনুমোদন, আর সংরক্ষণ বাটন কোথায় আছে সেটা বুঝে নিন।',
        generic: ({ focus }) => `${focus} অংশে কাজ করার সময় সঠিক কর্মী আর সঠিক তারিখ মিলিয়ে নিন। ভুল কর্মীর নামে হাজিরা, ছুটি, বা বেতন গেলে পরে ঠিক করা কঠিন হয়।`,
        closing: 'এইচআর কাজ শেষ করার আগে কর্মী, তারিখ, হাজিরা, ছুটি, অগ্রিম, বোনাস, আর পেমেন্ট স্ট্যাটাস মিলিয়ে নিন। এতে বেতন ন্যায্য থাকে।',
    },
    ecommerce: {
        trainerRole: 'অনলাইন অর্ডার ট্রেইনার',
        learnerRole: 'অনলাইন অর্ডার ম্যানেজার',
        scenario: 'ফেসবুক বা অনলাইন স্টোর থেকে অর্ডার এসেছে, এখন পণ্য, ঠিকানা, কুরিয়ার, সিওডি, আর স্ট্যাটাস ট্র্যাক করতে হবে',
        opening: ({ title }) => `ধরুন অনলাইন স্টোর থেকে অর্ডার এসেছে। এখন ${title} দেখবো। পণ্য, ঠিকানা, কুরিয়ার, আর টাকা আদায় ঠিক না থাকলে গ্রাহক সেবা আর ক্যাশ হিসাব দুইটাই গুলিয়ে যাবে।`,
        screen: 'প্রথমে অনলাইন অর্ডারের স্ক্রিনটা দেখুন। স্টোর স্ট্যাটাস, পণ্য, অর্ডার, কুরিয়ার, সিওডি, আর অপারেশন তালিকা কোথায় আছে সেটা বুঝে নিন।',
        generic: ({ focus }) => `${focus} অংশে দেখার সময় অর্ডারের বাস্তব অবস্থা মিলিয়ে নিন। পণ্য প্রস্তুত, কুরিয়ার বুকড, ডেলিভারি হয়েছে, আর টাকা এসেছে কিনা আলাদা করে দেখবেন।`,
        closing: 'অনলাইন অর্ডার শেষ করার আগে পণ্য, গ্রাহকের ঠিকানা, কুরিয়ার, স্ট্যাটাস, আর সিওডি টাকা মিলিয়ে নিন। এই ধাপ ঠিক থাকলে গ্রাহক সেবা পরিষ্কার থাকে।',
    },
    subscription: {
        trainerRole: 'সাবস্ক্রিপশন ট্রেইনার',
        learnerRole: 'দোকানের মালিক',
        scenario: 'লাইভ দোকানে কাজ চালু রাখতে প্যাকেজ, মেয়াদ, ফিচার, পেমেন্ট, আর ভেরিফিকেশন বুঝতে হবে',
        opening: ({ title }) => `ধরুন দোকানের কাজ লাইভ চলছে, কিন্তু কোনো ফিচার লক দেখাচ্ছে। এখন ${title} দেখবো, যেন প্যাকেজ, মেয়াদ, পেমেন্ট, আর দরকারি ফিচার পরিষ্কার বোঝা যায়।`,
        screen: 'প্রথমে সাবস্ক্রিপশন স্ক্রিনটা দেখুন। বর্তমান প্ল্যান, মেয়াদ, ফিচার, পেমেন্ট, রিনিউ, আর আপগ্রেডের জায়গা আলাদা করে চিনে নিন।',
        generic: ({ focus }) => `${focus} অংশে দেখার সময় দোকানের বাস্তব দরকারের সাথে প্যাকেজ মিলিয়ে নিন। শুধু বড় প্যাকেজ না, যে ফিচার দরকার সেটাই আগে নিশ্চিত করুন।`,
        closing: 'সাবস্ক্রিপশন নিয়ে কাজ করার আগে মেয়াদ, প্যাকেজ, দরকারি ফিচার, পেমেন্ট রেফারেন্স, আর ভেরিফিকেশন স্ট্যাটাস মিলিয়ে নিন। তাহলে লাইভ কাজ আটকে যাবে না।',
    },
    settings: {
        trainerRole: 'দোকান সেটআপ ট্রেইনার',
        learnerRole: 'দোকান সেটআপ করা মালিক',
        scenario: 'লাইভ বিক্রি শুরু করার আগে দোকানের নাম, রসিদ, পেমেন্ট, রিটার্ন নিয়ম, আর ডিফল্ট সেটিংস ঠিক করতে হবে',
        opening: ({ title }) => `ধরুন দোকান লাইভ করার আগে শেষ সেটআপ করছেন। এখন ${title} দেখবো। এখানে ভুল থাকলে প্রতিটি ইনভয়েস, পেমেন্ট, রিপোর্ট, আর গ্রাহকের রসিদে প্রভাব যাবে।`,
        screen: 'প্রথমে সেটিংস স্ক্রিনটা দেখুন। দোকানের তথ্য, ইনভয়েস, পেমেন্ট, রিটার্ন নিয়ম, আর সংরক্ষণ বাটন কোথায় আছে সেটা বুঝে নিন।',
        generic: ({ focus }) => `${focus} অংশে তথ্য দেওয়ার সময় মালিকের আসল তথ্যের সাথে মিলিয়ে নিন। সেটিংস একবার ভুল হলে সেই ভুল প্রতিটি বিল আর রিপোর্টে যাবে।`,
        closing: 'সেটিংস শেষ করার আগে দোকানের নাম, ঠিকানা, মোবাইল, ইনভয়েস, পেমেন্ট নম্বর, আর রিটার্ন নিয়ম মিলিয়ে নিন। তারপর লাইভ বিক্রি শুরু করুন।',
    },
    default: {
        trainerRole: 'দোকান অপারেশন ট্রেইনার',
        learnerRole: 'দোকানের মালিক',
        scenario: 'বাস্তব দোকানের কাজ সিস্টেমে গুছিয়ে রাখতে হবে',
        opening: ({ title }) => `ধরুন দোকানের দৈনিক কাজ গুছিয়ে সিস্টেমে রাখতে হবে। এখন ${title} দেখবো। স্ক্রিনের প্রতিটি ধাপ বাস্তব কাজের সাথে মিলিয়ে করলে পরে রিপোর্ট আর হিসাব পরিষ্কার থাকে।`,
        screen: 'প্রথমে স্ক্রিনটা শান্তভাবে দেখুন। কোন অংশে তথ্য দেখাবে, কোন অংশে কাজ করবেন, আর কোন বাটনে শেষ হবে সেটা বুঝে নিন।',
        generic: ({ focus }) => `${focus} অংশে কাজ করার আগে বাস্তব দোকানের তথ্যের সাথে স্ক্রিন মিলিয়ে নিন। ছোট ভুল পরে রিপোর্ট, স্টক, পেমেন্ট, বা গ্রাহক সেবায় প্রভাব ফেলতে পারে।`,
        closing: 'শেষে স্ক্রিনের তথ্য, কাজের উদ্দেশ্য, আর পরের ধাপ একবার মিলিয়ে নিন। এই অভ্যাস থাকলে লাইভ দোকানে ভুল কম হবে।',
    },
};

const FEATURE_STORIES = {
    'register-account': { actor: 'নতুন দোকানের মালিক', situation: 'আজ দোকানের জন্য প্রথমবার AndgatePOS অ্যাকাউন্ট খুলছেন', goal: 'দোকানের পরিচয়, মালিকের যোগাযোগ, আর লগইন তথ্য ঠিকভাবে তৈরি করা', risk: 'শুরুতেই ভুল তথ্য দিলে পরে সাপোর্ট, ইনভয়েস, আর অ্যাকাউন্টে ঢোকা কঠিন হবে', habit: 'প্রতিটি ঘর পূরণের পর বানান, মোবাইল, ইমেইল, আর পাসওয়ার্ড মিলিয়ে নেওয়া' },
    'login-own-account': { actor: 'দোকানের মালিক', situation: 'নিজের দোকানের লাইভ ড্যাশবোর্ডে ঢুকতে হবে', goal: 'নিরাপদভাবে নিজের অ্যাকাউন্টে ঢুকে দিনের কাজ শুরু করা', risk: 'ভুল অ্যাকাউন্ট বা shared কম্পিউটারে remember me দিলে দোকানের তথ্য ঝুঁকিতে পড়তে পারে', habit: 'ইমেইল-পাসওয়ার্ড মিলিয়ে trusted device ছাড়া remember me ব্যবহার না করা' },
    'demo-account-login': { actor: 'নতুন ব্যবহারকারী', situation: 'লাইভ দোকানের তথ্য না দিয়ে আগে প্র্যাকটিস করতে চান', goal: 'ডেমো ডেটা দিয়ে পস, পণ্য, রিপোর্ট, আর সেটিংস দেখে নেওয়া', risk: 'ডেমো অ্যাকাউন্টে আসল দোকানের তথ্য রাখলে পরে বিভ্রান্তি হবে', habit: 'ডেমোকে শুধু শেখার জায়গা ধরে real data নিজের অ্যাকাউন্টে রাখা' },
    'first-dashboard-checklist': { actor: 'নতুন দোকানের মালিক', situation: 'অ্যাকাউন্ট তৈরি হয়েছে, এখন লাইভ কাজ শুরু করার আগে চেকলিস্ট মিলাতে হবে', goal: 'স্টোর প্রোফাইল, প্যাকেজ, পণ্য, স্টাফ, আর পস প্রস্তুত কিনা দেখা', risk: 'চেকলিস্ট বাদ দিলে বিক্রির সময় সেটিংস বা পেমেন্টে সমস্যা ধরা পড়বে', habit: 'লাইভ যাওয়ার আগে dashboard checklist একবার complete করা' },
    'dashboard-overview': { actor: 'দোকানের মালিক', situation: 'সকালে দোকান খুলে আজকের অবস্থা দ্রুত বুঝতে চান', goal: 'বিক্রি, অর্ডার, স্টক, বাকি, আর সতর্কতা এক নজরে দেখা', risk: 'ড্যাশবোর্ড না দেখলে কম স্টক বা pending order চোখ এড়িয়ে যাবে', habit: 'দিনের শুরুতে আর দিনশেষে dashboard দেখে সিদ্ধান্ত নেওয়া' },
    'store-profile': { actor: 'দোকান সেটআপ করা মালিক', situation: 'রসিদ ও রিপোর্টে দোকানের পরিচয় ঠিক দেখাতে হবে', goal: 'দোকানের নাম, ঠিকানা, লোগো, যোগাযোগ, আর পেমেন্ট তথ্য ঠিক করা', risk: 'ভুল স্টোর তথ্য প্রতিটি ইনভয়েস আর গ্রাহকের রসিদে যাবে', habit: 'লাইভ বিক্রির আগে store profile মালিকের তথ্য দিয়ে যাচাই করা' },
    'roles-permissions': { actor: 'দোকানের মালিক', situation: 'ক্যাশিয়ার, ম্যানেজার, আর হিসাবরক্ষককে আলাদা কাজ দিতে হবে', goal: 'স্টাফ অনুযায়ী নিরাপদ access ভাগ করা', risk: 'সবাইকে full access দিলে বিক্রি, হিসাব, আর সেটিংসে অনাকাঙ্ক্ষিত পরিবর্তন হতে পারে', habit: 'স্টাফের দায়িত্ব বদলালে permission আবার review করা' },
    'business-os': { actor: 'অপারেশন ম্যানেজার', situation: 'দৈনিক দোকানের pending কাজ এক জায়গায় দেখতে হবে', goal: 'ক্যাশ, হাজিরা, petty cash, service job, due, আর reorder signal ধরতে পারা', risk: 'আলাদা আলাদা স্ক্রিন না দেখলে জরুরি কাজ বাদ পড়ে যাবে', habit: 'দিনের শুরুতে Business OS খুলে action list তৈরি করা' },
    'cash-closing': { actor: 'কাউন্টার ম্যানেজার', situation: 'দিনশেষে হাতে থাকা ক্যাশ সিস্টেমের হিসাবের সাথে মিলাতে হবে', goal: 'opening cash, sale, expense, due collection, আর closing cash মিলানো', risk: 'cash variance না ধরলে টাকা কম-বেশির কারণ পরে পাওয়া কঠিন হবে', habit: 'কাউন্টার বন্ধ করার আগে expected cash আর হাতে গোনা cash মিলানো' },
    'petty-cash': { actor: 'দোকানের ম্যানেজার', situation: 'ছোট ছোট দৈনিক খরচ খাতায় না রেখে সিস্টেমে রাখতে হবে', goal: 'চা, ডেলিভারি, ছোট repair, জরুরি কেনাকাটা approve সহ record করা', risk: 'ছোট খরচ বাদ গেলে মাসশেষে profit ভুল দেখাবে', habit: 'প্রতিটি petty cash খরচ reason সহ লিখে approval নেওয়া' },
    attendance: { actor: 'স্টাফ ম্যানেজার', situation: 'কর্মী কখন ঢুকলো, কখন বের হলো সেটা রাখতে হবে', goal: 'check-in, check-out, late, note, আর salary decision-এর data রাখা', risk: 'attendance না থাকলে salary বা responsibility নিয়ে কথা কাটাকাটি হতে পারে', habit: 'প্রতিদিন shift অনুযায়ী attendance update করা' },
    products: { actor: 'স্টক ম্যানেজার', situation: 'নতুন মাল দোকানে এসেছে এবং সিস্টেমে পণ্য তুলতে হবে', goal: 'নাম, ক্যাটাগরি, ব্র্যান্ড, দাম, কস্ট, স্টক, বারকোড ঠিক করা', risk: 'product data ভুল হলে পস, স্টক, রিপোর্ট, আর অনলাইন স্টোর সব জায়গায় ভুল যাবে', habit: 'save করার আগে পণ্য হাতে নিয়ে নাম, দাম, কস্ট, স্টক, বারকোড মিলানো' },
    'variants-labels': { actor: 'স্টক ম্যানেজার', situation: 'একই পণ্যের size, color, বা model আলাদা করে চালাতে হবে', goal: 'variant আর barcode label সাজিয়ে cashier scan-ready করা', risk: 'ভুল variant label লাগালে ভুল পণ্য বিক্রি হবে', habit: 'label print করার পর scan test করা' },
    'stock-control': { actor: 'স্টক ম্যানেজার', situation: 'কোন পণ্য শেষ হচ্ছে আর কোনটা পড়ে আছে সেটা বুঝতে হবে', goal: 'low stock, movement, adjustment, আর purchase plan তৈরি করা', risk: 'stock signal না দেখলে বিক্রি মিস বা dead stock বাড়বে', habit: 'সপ্তাহে অন্তত একবার stock report দেখে purchase plan করা' },
    'pos-sale': { actor: 'ক্যাশিয়ার', situation: 'গ্রাহক কাউন্টারে দাঁড়িয়ে আছে এবং দ্রুত বিল করতে হবে', goal: 'পণ্য scan, cart, discount, payment, আর receipt শেষ করা', risk: 'ভুল পণ্য বা পেমেন্ট দিলে cash, stock, আর customer trust নষ্ট হবে', habit: 'payment নেওয়ার আগে cart total মুখে বলে মিলানো' },
    returns: { actor: 'কাউন্টার ম্যানেজার', situation: 'গ্রাহক পণ্য ফেরত দিতে এসেছে', goal: 'order খুঁজে reason, quantity, refund, আর stock effect ঠিক করা', risk: 'return reason বা stock effect ভুল হলে report আর inventory ভুল হবে', habit: 'refund দেওয়ার আগে receipt আর returned product মিলানো' },
    purchases: { actor: 'ক্রয় ম্যানেজার', situation: 'supplier থেকে মাল আসছে এবং purchase order করতে হবে', goal: 'supplier, পণ্য, quantity, receive, payment বা due record রাখা', risk: 'ভুল purchase দিলে stock আর supplier due মিলবে না', habit: 'receive করার আগে supplier invoice আর হাতে পাওয়া মাল মিলানো' },
    'supplier-360': { actor: 'ক্রয় ম্যানেজার', situation: 'নতুন order দেওয়ার আগে supplier-এর আগের হিসাব দেখতে হবে', goal: 'contact, due, purchase history, আর payment behavior বোঝা', risk: 'supplier history না দেখলে ভুল credit decision হতে পারে', habit: 'নতুন order-এর আগে supplier profile খুলে due দেখা' },
    'customers-crm': { actor: 'দোকানের মালিক', situation: 'নিয়মিত গ্রাহক ধরে রাখতে history আর due দেখতে হবে', goal: 'customer profile, purchase history, due, loyalty, follow-up রাখা', risk: 'ভুল customer data দিলে due collection আর repeat sale কমে যাবে', habit: 'গ্রাহকের সাথে কথা বলার আগে profile দেখে নেওয়া' },
    accounting: { actor: 'হিসাব দেখা মালিক', situation: 'দৈনিক sale, purchase, expense একসাথে হিসাব করতে হবে', goal: 'cash book, ledger, journal, income, expense, profit loss বোঝা', risk: 'transaction link না থাকলে মাসশেষে হিসাব মিলবে না', habit: 'প্রতিদিনের transaction প্রতিদিন হিসাব বইয়ে দেখা' },
    reports: { actor: 'সিদ্ধান্ত নেওয়া মালিক', situation: 'ব্যবসার সিদ্ধান্ত নেওয়ার আগে data দেখতে হবে', goal: 'sales, stock, purchase, customer, supplier, tax, payment summary দেখা', risk: 'wrong date range দিয়ে report দেখলে decision ভুল হবে', habit: 'report খোলার আগে date range আর filter মিলানো' },
    'ecommerce-orders': { actor: 'অনলাইন অর্ডার ম্যানেজার', situation: 'Hawkeri store থেকে নতুন order এসেছে', goal: 'order confirm, status, courier, COD, unsettled amount track করা', risk: 'status ভুল থাকলে customer ও courier দুজনই confused হবে', habit: 'order dispatch-এর আগে product, address, courier, COD মিলানো' },
    'courier-setup': { actor: 'ইকমার্স অপারেটর', situation: 'online delivery চালু করতে courier credential বসাতে হবে', goal: 'Pathao, Steadfast বা RedX provider setup করা', risk: 'credential ভুল হলে order courier-এ যাবে না', habit: 'courier save করার পর test order দিয়ে যাচাই করা' },
    'payment-settings': { actor: 'দোকানের মালিক', situation: 'cashier যেন ঠিক payment method নিতে পারে', goal: 'Cash, bKash, Nagad, Rocket, Upay, card, bank transfer setup করা', risk: 'MFS number ভুল হলে টাকা ভুল জায়গায় যেতে পারে', habit: 'payment number owner দিয়ে confirm করা' },
    'invoice-customize': { actor: 'দোকান সেটআপকারী', situation: 'customer receipt professional করতে হবে', goal: 'logo, invoice prefix, footer, tax label, printer format ঠিক করা', risk: 'invoice ভুল হলে customer trust আর accounting দুইটাই দুর্বল হবে', habit: 'live billing-এর আগে test print করা' },
    'return-policies': { actor: 'দোকানের ম্যানেজার', situation: 'return বা stock adjustment-এর কারণ আগে থেকে সাজাতে হবে', goal: 'damage, lost, found, customer return reason ready রাখা', risk: 'reason ছাড়া return করলে report clean থাকবে না', habit: 'প্রতিটি return বা adjustment reason দিয়ে করা' },
    'cash-drawer-history': { actor: 'দোকানের মালিক', situation: 'কোন counter-এ কত cash ছিল সেটা trace করতে হবে', goal: 'opening cash, cash in/out, closing cash, variance history দেখা', risk: 'cash movement reason না থাকলে variance ধরতে কষ্ট হবে', habit: 'cash drawer history দিয়ে manager follow-up করা' },
    payroll: { actor: 'স্টাফ ম্যানেজার', situation: 'মাসশেষে salary prepare করতে হবে', goal: 'attendance, overtime, absence, advance, deduction মিলিয়ে salary করা', risk: 'attendance বা advance ভুল থাকলে salary dispute হবে', habit: 'salary তৈরি করার আগে attendance আর advance মিলানো' },
    'salary-advance': { actor: 'দোকানের মালিক', situation: 'কর্মী salary advance চেয়েছে', goal: 'advance request, approve/reject, repayment history রাখা', risk: 'advance record না থাকলে payroll deduction ভুল হবে', habit: 'advance approve করার আগে আগের balance দেখা' },
    'festival-bonus': { actor: 'স্টাফ ম্যানেজার', situation: 'Eid বা festival bonus দিতে হবে', goal: 'eligible employee, occasion, amount, payment status track করা', risk: 'bonus history না থাকলে কারা পেয়েছে সেটা নিয়ে confusion হবে', habit: 'bonus cycle শেষে payment status update করা' },
    'leave-shifts-documents': { actor: 'এইচআর ম্যানেজার', situation: 'ছুটি, shift, holiday, document একসাথে manage করতে হবে', goal: 'leave request, shift plan, holiday, employee document history রাখা', risk: 'shift বা leave ভুল হলে counter coverage কমে যাবে', habit: 'আগে shift দেখে leave approve করা' },
    categories: { actor: 'স্টক ম্যানেজার', situation: 'পণ্যগুলো group করে সাজাতে হবে', goal: 'parent/sub-category, low stock threshold, online category ঠিক করা', risk: 'category এলোমেলো হলে POS search আর report দুর্বল হবে', habit: 'product add করার আগে category structure simple রাখা' },
    brands: { actor: 'স্টক ম্যানেজার', situation: 'brand wise product খুঁজতে হবে', goal: 'brand name, logo, description consistent রাখা', risk: 'একই brand দুইভাবে লিখলে filter আর report ভেঙে যাবে', habit: 'brand spelling একভাবে রাখা' },
    'product-variants': { actor: 'fashion/electronics দোকানের মালিক', situation: 'একই পণ্যের size, color, model আলাদা stock লাগবে', goal: 'variant-wise price, stock, option তৈরি করা', risk: 'variant ভুল হলে customer wrong item পাবে', habit: 'POS-এ variant select করে test sale করা' },
    'stock-adjustment': { actor: 'স্টক ম্যানেজার', situation: 'actual stock আর system stock মিলছে না', goal: 'damage, lost, found, correction reason দিয়ে stock ঠিক করা', risk: 'reason ছাড়া stock বদলালে audit trail থাকবে না', habit: 'প্রতিটি adjustment reason সহ করা' },
    'stock-count': { actor: 'স্টক গণনা টিম', situation: 'হাতে গোনা stock আর system stock মিলাতে হবে', goal: 'count session, physical quantity, difference review করা', risk: 'count approve না করলে stock reliable হবে না', habit: 'count শেষে difference manager দিয়ে review করা' },
    'stock-transfer': { actor: 'মাল্টি-branch ম্যানেজার', situation: 'এক branch থেকে আরেক branch-এ মাল পাঠাতে হবে', goal: 'source, destination, product, quantity, transfer ledger রাখা', risk: 'transfer record না থাকলে দুই branch-এর stock ভুল হবে', habit: 'মাল ছাড়ার ও পাওয়ার সময় দুই দিক থেকে transfer মিলানো' },
    'bulk-import': { actor: 'নতুন দোকান সেটআপকারী', situation: 'অনেক product একসাথে system-এ তুলতে হবে', goal: 'Excel template fill, validation fix, import confirm করা', risk: 'ভুল import করলে অনেক product একসাথে ভুল হবে', habit: 'import-এর আগে sample row আর validation error ঠিক করা' },
    'barcode-scanner': { actor: 'ক্যাশিয়ার', situation: 'counter sale দ্রুত করতে scanner ব্যবহার করতে হবে', goal: 'USB scanner বা mobile camera দিয়ে product scan করা', risk: 'wrong barcode label হলে ভুল product cart-এ যাবে', habit: 'নতুন label লাগানোর পর scan test করা' },
    'payment-methods': { actor: 'ক্যাশিয়ার', situation: 'এক order-এ cash ও MFS split payment নিতে হবে', goal: 'cash, bKash, Nagad, card, due আলাদা record করা', risk: 'method ভুল হলে collection report মিলবে না', habit: 'bill close করার আগে payment split পড়ে শোনানো' },
    'discounts-coupons': { actor: 'sales manager', situation: 'campaign discount বা coupon চালাতে হবে', goal: 'flat, percentage, coupon rule তৈরি ও POS-এ apply করা', risk: 'wrong discount rule দিলে profit কমে যাবে', habit: 'campaign live করার আগে test bill করা' },
    'end-of-day': { actor: 'কাউন্টার ম্যানেজার', situation: 'দিনশেষে sale, return, expense, due collection মিলাতে হবে', goal: 'cash count, payment summary, cash closing submit করা', risk: 'day close না করলে next day opening cash ভুল হবে', habit: 'দোকান বন্ধের আগে end-of-day checklist করা' },
    'customer-dues': { actor: 'দোকানের মালিক', situation: 'গ্রাহকের বাকি টাকা follow-up করতে হবে', goal: 'customer-wise due, partial payment, invoice history দেখা', risk: 'due update না করলে cash flow খারাপ হবে', habit: 'প্রতিদিন due customer list দেখে follow-up করা' },
    loyalty: { actor: 'দোকানের মালিক', situation: 'regular customer ধরে রাখতে হবে', goal: 'top customer, loyalty, birthday, note, follow-up ব্যবহার করা', risk: 'ভালো customer চিনতে না পারলে repeat sale কমে যাবে', habit: 'top customer list দেখে service plan করা' },
    expenses: { actor: 'হিসাবরক্ষক', situation: 'daily expense লিখতে হবে', goal: 'rent, salary, utility, transport, petty cost category wise record করা', risk: 'expense বাদ গেলে profit বেশি দেখাবে', habit: 'প্রতিদিনের খরচ প্রতিদিন entry করা' },
    'profit-loss': { actor: 'দোকানের মালিক', situation: 'ব্যবসা আসলে লাভ করছে কিনা বুঝতে হবে', goal: 'sales, cost, expense মিলিয়ে gross/net profit দেখা', risk: 'cost বা expense বাদ গেলে profit ভুল হবে', habit: 'profit দেখার আগে sale, cost, expense date মিলানো' },
    'ledger-journal': { actor: 'accountant', situation: 'transaction কোথা থেকে এসেছে trace করতে হবে', goal: 'journal entry, ledger account, source transaction দেখা', risk: 'source trace না করলে audit প্রশ্নের উত্তর পাওয়া কঠিন', habit: 'বড় transaction হলে ledger থেকে source check করা' },
    'sales-reports': { actor: 'দোকানের মালিক', situation: 'daily sales performance বুঝতে হবে', goal: 'date, store, customer, payment method দিয়ে sales breakdown দেখা', risk: 'sales report না দেখলে best day/product বোঝা যাবে না', habit: 'প্রতিদিন sales report দেখে cash summary মিলানো' },
    'inventory-reports': { actor: 'স্টক ম্যানেজার', situation: 'stock movement ও idle product ধরতে হবে', goal: 'stock level, low stock, idle item, movement দেখা', risk: 'idle stock আটকে থাকলে cash stuck থাকবে', habit: 'weekly inventory report review করা' },
    'financial-reports': { actor: 'হিসাব দেখা মালিক', situation: 'cash, bank, income, expense, profit একসাথে দেখতে হবে', goal: 'financial health বুঝে decision নেওয়া', risk: 'financial report না দেখলে টাকা কোথায় যাচ্ছে বোঝা যাবে না', habit: 'মাসশেষে financial reports একসাথে মিলানো' },
    'custom-reports': { actor: 'ম্যানেজার', situation: 'regular report ছাড়াও নিজের দরকারি view বানাতে হবে', goal: 'custom filter, saved view, export ব্যবহার করা', risk: 'ভুল custom filter দিলে ভুল list share হবে', habit: 'saved report ব্যবহার করার আগে filter name দেখে নেওয়া' },
    'dashboard-widgets': { actor: 'দোকানের মালিক', situation: 'dashboard-এ নিজের দরকারি signal সামনে রাখতে হবে', goal: 'widget arrange করে sales, stock, cash, order signal দেখা', risk: 'জরুরি widget না থাকলে warning চোখ এড়িয়ে যাবে', habit: 'business priority বদলালে widget layout update করা' },
    'scheduled-reports': { actor: 'দোকানের মালিক', situation: 'নিয়মিত report নিজে নিজে পেতে চান', goal: 'report schedule, recipient, frequency ঠিক করা', risk: 'ভুল recipient বা date দিলে sensitive report ভুল জায়গায় যাবে', habit: 'scheduled report active করার আগে test email/report দেখা' },
    'branch-benchmarking': { actor: 'multi-branch owner', situation: 'কোন branch ভালো আর কোনটা পিছিয়ে বুঝতে হবে', goal: 'branch-wise sales, stock, profit compare করা', risk: 'branch compare না করলে weak branch ধরা পড়বে না', habit: 'একই date range দিয়ে সব branch compare করা' },
    'online-overview': { actor: 'online store manager', situation: 'online store live কিনা দেখতে হবে', goal: 'store status, product sync, order flow verify করা', risk: 'store offline থাকলে customer order করতে পারবে না', habit: 'campaign দেওয়ার আগে online overview check করা' },
    'ecommerce-products': { actor: 'online merchandiser', situation: 'কোন product online দেখা যাবে সেটা ঠিক করতে হবে', goal: 'image, stock, visibility, sync status manage করা', risk: 'ভুল visibility দিলে unavailable product customer দেখবে', habit: 'online publish করার আগে image, price, stock দেখা' },
    'cod-reconciliation': { actor: 'online order manager', situation: 'courier থেকে COD টাকা মিলাতে হবে', goal: 'collected, paid, unsettled amount reconcile করা', risk: 'COD mismatch থাকলে sale হয়েছে কিন্তু cash আসেনি বোঝা যাবে না', habit: 'courier statement-এর সাথে COD list মিলানো' },
    'fiscal-compliance': { actor: 'compliance-aware owner', situation: 'tax/fiscal claim করার আগে wording ও record মিলাতে হবে', goal: 'fiscal report, claim wording, supporting data verify করা', risk: 'ভুল claim wording legal/accounting ঝুঁকি তৈরি করতে পারে', habit: 'compliance report accountant দিয়ে review করা' },
    'bd-vat-workspace': { actor: 'VAT দায়িত্বে থাকা accountant', situation: 'বাংলাদেশি VAT হিসাব প্রস্তুত করতে হবে', goal: 'VAT data, date range, PDF/Excel export করা', risk: 'VAT data ভুল হলে জমা দেওয়ার সময় সমস্যা হবে', habit: 'VAT export করার আগে sale ও tax data মিলানো' },
    'audit-activity': { actor: 'দোকানের মালিক', situation: 'কে কখন কী পরিবর্তন করেছে জানতে হবে', goal: 'activity log দেখে sensitive action trace করা', risk: 'audit activity না দেখলে ভুল বা unauthorized change ধরা পড়বে না', habit: 'সপ্তাহে একবার important activity review করা' },
    'subscription-status': { actor: 'দোকানের মালিক', situation: 'plan active কিনা আর feature access আছে কিনা দেখতে হবে', goal: 'current package, expiry, feature availability বোঝা', risk: 'plan expire হলে live operation আটকে যেতে পারে', habit: 'renewal date আগেই calendar-এ রাখা' },
    'renew-plan': { actor: 'দোকানের মালিক', situation: 'current package renew করতে হবে', goal: 'expiry, payment, verification status মিলিয়ে renew করা', risk: 'renew দেরি হলে feature বন্ধ হতে পারে', habit: 'expiry-এর আগে renewal payment প্রস্তুত রাখা' },
    'upgrade-plan': { actor: 'growth-focused owner', situation: 'দোকানে নতুন feature দরকার, তাই package upgrade ভাবছেন', goal: 'feature need, package, price, payment মিলিয়ে upgrade request করা', risk: 'দরকার না বুঝে upgrade করলে খরচ বাড়বে কিন্তু কাজের লাভ কম হবে', habit: 'upgrade-এর আগে locked feature আর business need লিখে নেওয়া' },
    'payment-verification': { actor: 'subscription support user', situation: 'payment করা হয়েছে, এখন verify করতে হবে', goal: 'payment reference, amount, method, status check করা', risk: 'ভুল reference দিলে activation দেরি হবে', habit: 'payment screenshot/reference safe রাখা' },
    'store-defaults': { actor: 'দোকান সেটআপকারী', situation: 'দোকানের default rules আগে থেকেই ঠিক করতে হবে', goal: 'default tax, payment, invoice, stock, sale behavior set করা', risk: 'default ভুল হলে প্রতিটি নতুন sale/product-এ ভুল যাবে', habit: 'default change করার পর test sale করা' },
    'label-print': { actor: 'স্টক সহকারী', situation: 'পণ্যে barcode label লাগাতে হবে', goal: 'label format, barcode, print quality, product mapping ঠিক করা', risk: 'ভুল label লাগালে cashier ভুল product scan করবে', habit: 'print করার পর কয়েকটা label scan test করা' },
    'low-stock-alerts': { actor: 'ক্রয় ম্যানেজার', situation: 'পণ্য শেষ হওয়ার আগে alert পেতে হবে', goal: 'threshold, reorder signal, purchase plan করা', risk: 'alert না থাকলে fast-moving product শেষ হয়ে sale miss হবে', habit: 'weekly low-stock list থেকে purchase order করা' },
    'add-supplier': { actor: 'ক্রয় ম্যানেজার', situation: 'নতুন supplier থেকে মাল নেওয়া শুরু হচ্ছে', goal: 'supplier name, contact, opening balance, terms রাখা', risk: 'contact বা balance ভুল হলে future payment mismatch হবে', habit: 'supplier add করার সময় phone ও opening balance confirm করা' },
    'receive-goods': { actor: 'গুদাম/স্টক ইনচার্জ', situation: 'supplier-এর মাল দোকানে পৌঁছেছে', goal: 'received quantity, stock update, supplier due মিলানো', risk: 'receive quantity ভুল হলে stock আর supplier bill মিলবে না', habit: 'চালান দেখে product count করে receive করা' },
    'customer-analytics': { actor: 'দোকানের মালিক', situation: 'কোন customer বেশি কিনছে আর কার follow-up দরকার জানতে হবে', goal: 'top customer, repeat sale, due, engagement signal দেখা', risk: 'customer analytics না দেখলে repeat sale opportunity মিস হবে', habit: 'মাসে একবার top customer follow-up করা' },
    'bank-cash-income': { actor: 'হিসাবরক্ষক', situation: 'cash, bank, আর extra income record করতে হবে', goal: 'bank/cash movement, extra income, account balance রাখা', risk: 'income account ভুল হলে cashflow report ভুল হবে', habit: 'প্রতিটি income entry-তে source account মিলানো' },
    'balance-trial-cashflow': { actor: 'accountant', situation: 'trial balance আর cashflow মিলাতে হবে', goal: 'balance, trial, cash movement দেখে financial consistency বোঝা', risk: 'trial balance mismatch থাকলে accounting error থেকে যাবে', habit: 'মাসশেষে cashflow আর trial balance একসাথে review করা' },
    'ai-insights': { actor: 'দোকানের মালিক', situation: 'data দেখে system কী signal দিচ্ছে বুঝতে চান', goal: 'AI insights দিয়ে trend, risk, opportunity identify করা', risk: 'insight না বুঝে action নিলে ভুল decision হতে পারে', habit: 'AI suggestion-এর সাথে actual report মিলিয়ে action নেওয়া' },
    'operations-reports': { actor: 'অপারেশন ম্যানেজার', situation: 'daily operation কোথায় আটকে আছে দেখতে হবে', goal: 'cash closing, attendance, service, due, stock signal report করা', risk: 'operation report না দেখলে pending কাজ জমে যাবে', habit: 'দিনশেষে operation report দেখে next-day task লেখা' },
    'ecommerce-marketing': { actor: 'online marketing manager', situation: 'campaign, pixel, product visibility চালাতে হবে', goal: 'marketing setup, pixel information, campaign readiness verify করা', risk: 'pixel বা campaign data ভুল হলে ad performance বোঝা যাবে না', habit: 'campaign চালুর আগে tracking test করা' },
    'audit-logs-security': { actor: 'দোকানের মালিক', situation: 'security review করতে হবে', goal: 'important changes, login/activity, suspicious action দেখা', risk: 'security log না দেখলে unauthorized change ধরা পড়বে না', habit: 'weekly audit log review করা' },
    'company-compliance-calendar': { actor: 'owner/admin', situation: 'license, tax, renewal, compliance task miss করা যাবে না', goal: 'upcoming task, due date, responsibility track করা', risk: 'compliance date miss হলে জরিমানা বা operation risk হতে পারে', habit: 'calendar task আগে থেকেই reminder দিয়ে রাখা' },
    'notifications-feedback-export': { actor: 'admin user', situation: 'notification, feedback, আর backup একসাথে দেখতে হবে', goal: 'system message, user feedback, data export backup নেওয়া', risk: 'backup না থাকলে জরুরি সময়ে business data হারানোর ঝুঁকি থাকবে', habit: 'regular data export backup রাখা' },
};

const getFeatureStory = (lesson) => FEATURE_STORIES[lesson.id] || null;

const makeFeatureTemplate = (story) => ({
    trainerRole: `${story.actor} ট্রেইনার`,
    learnerRole: story.actor,
    scenario: story.situation,
    opening: ({ title }) => `আচ্ছা, এখন আপনার দোকানের ${title} কাজটা একসাথে করি। ${story.situation}। মানে, এখানে আমরা ${story.goal}। আমি একেকটা জায়গা দেখাচ্ছি, আপনি স্ক্রিনের সাথে নিজের দোকানের বাস্তব তথ্য মিলিয়ে যাবেন।`,
    screen: `প্রথমে স্ক্রিনটা একটু দেখে নিই। এই জায়গা দিয়ে ${story.goal}। কোথায় তথ্য দেখবেন, কোথায় লিখবেন, আর কোন জায়গায় কাজ শেষ হবে, সেটা আগে বুঝে নিলে পরে আর অস্থির লাগবে না।`,
    generic: ({ focus }) => `এই ${focus} জায়গায় একটু ধীরে কাজ করবেন। আপনার দোকানের বাস্তব তথ্যের সাথে স্ক্রিন মিলিয়ে নিন, কারণ ${story.risk}। ঠিকভাবে করলে ${story.goal} সহজ হয়ে যাবে।`,
    closing: `এই কাজটার শেষে আপনার সবচেয়ে দরকারি অভ্যাস হলো ${story.habit}। মনে রাখবেন, ${story.risk}। তাই লাইভ দোকানে করার আগে এই একই ধাপ একবার প্র্যাকটিস করে নিলেই আপনি আত্মবিশ্বাস নিয়ে কাজ করতে পারবেন।`,
});

const getTrainingTemplateKey = (lesson) => {
    const haystack = `${lesson.id} ${lesson.module} ${lesson.title} ${lesson.path}`.toLowerCase();
    if (lesson.auth === false) return 'account';
    if (haystack.includes('pos') || haystack.includes('sale') || haystack.includes('barcode') || haystack.includes('discount') || haystack.includes('end-of-day')) return 'pos';
    if (haystack.includes('product') || haystack.includes('stock') || haystack.includes('inventory') || haystack.includes('category') || haystack.includes('brand') || haystack.includes('label')) return 'inventory';
    if (haystack.includes('purchase') || haystack.includes('supplier') || haystack.includes('receive')) return 'purchase';
    if (haystack.includes('customer') || haystack.includes('crm') || haystack.includes('loyalty') || haystack.includes('due')) return 'crm';
    if (haystack.includes('accounting') || haystack.includes('expense') || haystack.includes('profit') || haystack.includes('ledger') || haystack.includes('bank') || haystack.includes('cashflow')) return 'accounting';
    if (haystack.includes('report') || haystack.includes('analytics') || haystack.includes('dashboard') || haystack.includes('insights') || haystack.includes('benchmarking')) return 'reports';
    if (haystack.includes('hr') || haystack.includes('attendance') || haystack.includes('payroll') || haystack.includes('salary') || haystack.includes('leave') || haystack.includes('employee')) return 'hr';
    if (haystack.includes('ecommerce') || haystack.includes('online') || haystack.includes('courier') || haystack.includes('cod') || haystack.includes('marketing')) return 'ecommerce';
    if (haystack.includes('subscription') || haystack.includes('plan') || haystack.includes('renew') || haystack.includes('upgrade') || haystack.includes('payment-verification')) return 'subscription';
    if (haystack.includes('setting') || haystack.includes('default') || haystack.includes('invoice') || haystack.includes('payment-settings') || haystack.includes('return-policies')) return 'settings';
    return 'default';
};

const getTrainingTemplate = (lesson) => {
    const story = getFeatureStory(lesson);
    if (story) return makeFeatureTemplate(story);
    return TRAINING_STORY_TEMPLATES[getTrainingTemplateKey(lesson)] || TRAINING_STORY_TEMPLATES.default;
};

const makeTrainerLine = (lesson, focus, action = 'দেখুন') => {
    const template = getTrainingTemplate(lesson);
    return `এখন ${focus} ${action}। ${template.generic({ focus })}`;
};

const toBanglaStoryboardNote = (note = '', lesson = {}) => {
    const text = String(note || '').toLowerCase();
    if (text.includes('registration form')) return 'এখানে রেজিস্ট্রেশন ফর্মটা দেখুন। নতুন দোকান চালু করার শুরু এখান থেকেই, তাই শুরুতেই তথ্যগুলো পরিষ্কারভাবে দিলে পরে দোকানের প্রোফাইল, বিল, আর রিপোর্টে কম ভুল হবে।';
    if (text.includes('store name')) return 'প্রথমে দোকানের নাম লিখুন। ধরুন দোকানের সাইনবোর্ডে যে নাম আছে, সেই নামটাই এখানে দিন, কারণ এই নাম ইনভয়েস, রিপোর্ট, ড্যাশবোর্ড আর অনলাইন স্টোরে দেখা যাবে।';
    if (text.includes('owner name')) return 'এবার মালিকের নাম লিখুন। পরে সাপোর্ট নেওয়া, অ্যাকাউন্ট যাচাই করা, অথবা দোকানের দায়িত্বশীল ব্যক্তি চেনার সময় এই নামটাই ব্যবহার হবে।';
    if (text.includes('phone')) return 'এরপর মোবাইল নম্বর দিন। দোকানের মালিকের নিয়মিত ব্যবহার করা নম্বর দিলে ভালো, কারণ প্রয়োজন হলে এই নম্বর দিয়েই যোগাযোগ বা যাচাই করা সহজ হবে।';
    if (text.includes('email')) return 'এখানে ইমেইল ঠিকানা দিন। পরেরবার লগইন করার সময় এই ইমেইল লাগবে, তাই এমন ইমেইল ব্যবহার করুন যেটা মালিক বা ম্যানেজার নিয়মিত দেখতে পারেন।';
    if (text.includes('password')) return 'এখন পাসওয়ার্ড দুই জায়গায় একইভাবে দিন। খুব সহজ পাসওয়ার্ড না দিয়ে অক্ষর আর সংখ্যার মিশ্রণ রাখুন, কারণ এই অ্যাকাউন্ট থেকেই দোকানের বিক্রি, স্টক, আর হিসাব নিয়ন্ত্রণ হবে।';
    if (text.includes('create account')) return 'সব তথ্য একবার চোখ বুলিয়ে নিন। এরপর এই বাটন দিয়ে অ্যাকাউন্ট তৈরি হবে। ট্রেনিং ভিডিওতে লাইভ সাইটে আমরা জমা দিচ্ছি না, কিন্তু আপনারা নিজের দোকানের তথ্য ঠিক থাকলে এখান থেকেই শুরু করবেন।';
    if (text.includes('login form')) return 'এটাই লগইন ফর্ম। নিজের দোকানের ড্যাশবোর্ডে ঢুকতে ইমেইল আর পাসওয়ার্ড লাগবে, তাই এখানে ভুল হলে সিস্টেম আপনাকে ভেতরে নিতে পারবে না।';
    if (text.includes('login button')) return 'ইমেইল আর পাসওয়ার্ড ঠিক থাকলে এই বাটন দিয়ে লগইন করবেন। যদি না ঢোকে, আগে বানান, বড় হাতের অক্ষর, আর পাসওয়ার্ড আবার মিলিয়ে নিন।';
    if (text.includes('remember')) return 'নিজের ল্যাপটপ বা নিরাপদ ডিভাইস হলে remember me রাখা যায়। কিন্তু দোকানের শেয়ারড কম্পিউটার হলে এটা বন্ধ রাখাই ভালো, যাতে অন্য কেউ আপনার অ্যাকাউন্টে ঢুকতে না পারে।';
    if (text.includes('more dashboard widgets')) return 'ড্যাশবোর্ডের নিচের অংশেও দরকারি সিগন্যাল থাকে। শুধু উপরকার বিক্রি না, স্টক, অর্ডার, বাকি, আর সাম্প্রতিক কাজও দেখে নিন।';
    if (text.includes('dashboard overview area')) return 'শেষে পুরো ড্যাশবোর্ড একবার মিলিয়ে নিন। কোন সংখ্যা আজকের কাজের জন্য জরুরি, আর কোনটা শুধু পর্যবেক্ষণের জন্য, সেটা আলাদা করে বুঝুন।';
    if (text.includes('dashboard header')) return 'ড্যাশবোর্ডের শুরুতেই দোকানের আজকের সারাংশ দেখা যায়। মালিক হিসেবে এখান থেকে বুঝবেন দিনটা স্বাভাবিক চলছে, নাকি কোথাও দ্রুত নজর দিতে হবে।';
    if (text.includes('dashboard')) return 'এই ড্যাশবোর্ডটাই দোকানের দৈনিক অবস্থা দেখার জায়গা। সকালবেলা দোকান খোলার পরে অথবা রাতে হিসাব মেলানোর আগে মালিক বা ম্যানেজার প্রথমে এই স্ক্রিনটা দেখবেন।';
    if (text.includes('today sales')) return 'আজকের বিক্রির হিসাব এখানে দেখা যায়। বিক্রি ভালো চলছে, নাকি কাউন্টারে গতি কম, সেটা দ্রুত বুঝে সঙ্গে সঙ্গে সিদ্ধান্ত নিতে পারবেন।';
    if (text.includes('orders or products')) return 'এই অংশে অনলাইন অর্ডার বা অনলাইন পণ্য দেখবেন। পণ্য ঠিকমতো sync না হলে অর্ডার আসবে না, আর অর্ডার আটকে থাকলে গ্রাহক অপেক্ষা করবে।';
    if (text.includes('orders')) return 'অর্ডারের সংখ্যা আর অবস্থা এখানে মিলিয়ে নিন। পেন্ডিং অর্ডার থাকলে আগে সেগুলো ধরবেন, আর ডেলিভারি বা অনলাইন অর্ডার থাকলে দিনের কাজ সাজানো সহজ হবে।';
    if (text.includes('stock and barcode')) return 'এখানে স্টক আর বারকোড মিলিয়ে নিন। বারকোড থাকলে কাউন্টারে স্ক্যান করে দ্রুত বিক্রি করা যাবে, আর স্টক ঠিক থাকলে বিক্রির পর রিপোর্টও ঠিক থাকবে।';
    if (text.includes('stock quantity')) return 'স্টকের পরিমাণ অংশে হাতে থাকা পণ্য আর সিস্টেমের সংখ্যা মিলান। দোকানের তাকের সংখ্যা আর সিস্টেমের সংখ্যা আলাদা হলে আগে কারণ খুঁজুন।';
    if (text.includes('stock action')) return 'স্টক অ্যাকশন করার সময় কারণটা পরিষ্কার রাখুন। অ্যাডজাস্টমেন্ট, কাউন্ট, ট্রান্সফার, বা threshold বদলালে রিপোর্টে তার প্রভাব যাবে।';
    if (text.includes('stock records')) return makeTrainerLine(lesson, 'স্টকের রেকর্ড', 'হাতে থাকা পণ্যের সাথে মিলিয়ে দেখুন');
    if (text.includes('stock')) return 'স্টক কমে গেলে এই অংশে সিগন্যাল পাবেন। কোন পণ্য শেষ হওয়ার পথে আছে সেটা আগে ধরতে পারলে বিক্রি মিস হবে না, আর সময়মতো নতুন মাল আনা যাবে।';
    if (text.includes('store settings')) return 'এখান থেকে দোকানের সেটিংস ঠিক করবেন। দোকানের নাম, ঠিকানা, নম্বর, আর পেমেন্ট তথ্য ঠিক না থাকলে ইনভয়েস, রিপোর্ট, আর গ্রাহকের রসিদে ভুল দেখা যাবে।';
    if (text.includes('invoice')) return 'ইনভয়েস বা রসিদের তথ্য এখানে মিলিয়ে নিন। গ্রাহক হাতে যে বিল পাবেন সেটা পরিষ্কার, পেশাদার, আর দোকানের তথ্যসহ হলে বিশ্বাস বাড়ে।';
    if (text.includes('payment action')) return 'পেমেন্ট বা রিনিউ করার অংশে আসলে রেফারেন্স, পরিমাণ, আর প্যাকেজ ভালোভাবে মিলিয়ে নিন। ভুল পেমেন্ট তথ্য দিলে ভেরিফিকেশন দেরি হতে পারে।';
    if (text.includes('payment area')) return 'এখন পেমেন্ট অংশে আসুন। গ্রাহক ক্যাশ দিচ্ছে, বিকাশ দিচ্ছে, নাকি বাকি রাখছে, সেটা ঠিক না দিলে দিনের শেষে ক্যাশ মিলবে না।';
    if (text.includes('payment information')) return 'দোকানের পেমেন্ট তথ্য এখানে মিলিয়ে নিন। বিকাশ, নগদ, রকেট, উপায় বা ব্যাংক নম্বর ভুল থাকলে গ্রাহক ভুল জায়গায় টাকা পাঠাতে পারে।';
    if (text.includes('payment')) return 'পেমেন্টের তথ্য এখানে ভালোভাবে যাচাই করুন। ক্যাশ, বিকাশ, নগদ, রকেট, উপায় বা কার্ড যেভাবেই টাকা আসুক, রিপোর্টে যেন ঠিকভাবে আলাদা হয়ে থাকে।';
    if (text.includes('search') && text.includes('barcode')) return 'এখানে সার্চ বা বারকোড দিয়ে পণ্য খুঁজবেন। কাউন্টারে গ্রাহক দাঁড়িয়ে থাকলে এই জায়গাটাই সবচেয়ে বেশি কাজে লাগে, তাই পণ্যের নাম আর বারকোড আগে ঠিক রাখা জরুরি।';
    if (text.includes('search')) return 'এখানে সার্চ ব্যবহার করে দরকারি রেকর্ড দ্রুত খুঁজে নিন। তালিকা বড় হলে নাম, নম্বর, অর্ডার আইডি, বা স্ট্যাটাস দিয়ে খুঁজলে সময় অনেক কম লাগে।';
    if (text.includes('product list')) return 'পণ্যের তালিকা থেকে সঠিক পণ্য নির্বাচন করবেন। কাছাকাছি নামের পণ্য থাকলে একটু মিলিয়ে নিন, কারণ ভুল পণ্য নিলে বিল, স্টক, আর লাভের হিসাব তিন জায়গাতেই সমস্যা হবে।';
    if (text.includes('cart')) return 'কার্টে পরিমাণ আর মোট টাকা মিলিয়ে নিন। পেমেন্ট নেওয়ার আগে গ্রাহককে মোট বলে দিলে ভুল বোঝাবুঝি কমে, আর কাউন্টারের কাজও পরিষ্কার থাকে।';
    if (text.includes('discount')) return 'ডিসকাউন্ট থাকলে এই অংশে সেট করুন। ফ্ল্যাট ডিসকাউন্ট মানে সরাসরি টাকা কমানো, আর পার্সেন্টেজ ডিসকাউন্ট মানে মোট দামের উপর শতাংশ কমানো, তাই নিয়ম বুঝে ব্যবহার করবেন।';
    if (text.includes('receipt')) return 'বিক্রয় শেষ হলে গ্রাহককে রসিদ দিন। পরে রিটার্ন, বাকি, বা কোনো অভিযোগ এলে এই রসিদটাই অর্ডার খুঁজে বের করার সবচেয়ে সহজ প্রমাণ।';
    if (text.includes('product create page')) return 'এটা পণ্য যোগ করার মূল স্ক্রিন। এখানে পণ্যের নাম, ক্যাটাগরি, দাম, স্টক, বারকোড, ছবি সব এক জায়গায় সাজাবেন, তাই শুরু করার আগে স্ক্রিনটা একটু দেখে নিন।';
    if (text.includes('product name')) return 'পণ্যের নাম পরিষ্কারভাবে লিখুন। দোকানে যেভাবে সবাই পণ্যটাকে চেনে সেই ভাষায় নাম দিলে ক্যাশিয়ার সার্চ করলে দ্রুত খুঁজে পাবে।';
    if (text.includes('category')) return 'পণ্যের ক্যাটাগরি ঠিক করে দিন। ক্যাটাগরি ঠিক থাকলে স্টক রিপোর্ট পরিষ্কার হয়, অনলাইন স্টোর সাজানো থাকে, আর পরে পণ্য খুঁজতেও সময় কম লাগে।';
    if (text.includes('brand')) return 'ব্র্যান্ড থাকলে এখান থেকে নির্বাচন করুন। একই ধরনের অনেক পণ্য থাকলে ব্র্যান্ড দিয়ে ফিল্টার করা সহজ হয়, বিশেষ করে ইলেকট্রনিক্স, কসমেটিকস, বা ফ্যাশন দোকানে।';
    if (text.includes('open pricing tab')) return 'এবার মূল্য নির্ধারণ ট্যাবে যান, দাম এই অংশেই লিখতে হবে।';
    if (text.includes('price')) return 'দাম আর কস্ট ভালোভাবে মিলিয়ে লিখুন। বিক্রয় মূল্য ভুল হলে গ্রাহকের বিল ভুল হবে, আর কস্ট ভুল হলে লাভ-লোকসানের রিপোর্ট ঠিক আসবে না।';
    if (text.includes('stock and barcode')) return 'এখানে স্টক আর বারকোড মিলিয়ে নিন। বারকোড থাকলে কাউন্টারে স্ক্যান করে দ্রুত বিক্রি করা যাবে, আর স্টক ঠিক থাকলে বিক্রির পর রিপোর্টও ঠিক থাকবে।';
    if (text.includes('supplier selector')) return 'প্রথমে সঠিক সাপ্লায়ার বেছে নিন। একই সাপ্লায়ারের আগের বাকি বা পেমেন্ট থাকলে নতুন ক্রয়ের আগে সেটাও চোখে দেখে নেওয়া ভালো।';
    if (text.includes('supplier dues')) return 'সাপ্লায়ারের বাকি অংশে কত টাকা এখন দেওয়া হচ্ছে আর কত বাকি থাকছে সেটা মিলিয়ে নিন। এই হিসাব ঠিক থাকলে পরে সাপ্লায়ার স্টেটমেন্ট মিলানো সহজ হয়।';
    if (text.includes('supplier')) return 'সাপ্লায়ার নির্বাচন না করলে ক্রয়ের হিসাব ঠিকভাবে ট্র্যাক হবে না। কোন সাপ্লায়ার থেকে পণ্য আসছে সেটা আগে ঠিক করুন, তাহলে বাকি, পেমেন্ট, আর আগের ক্রয় ইতিহাস পরিষ্কার থাকবে।';
    if (text.includes('quantity')) return 'পরিমাণ দেওয়ার আগে পণ্যটা মিলিয়ে নিন। ক্রয়, বিক্রয়, বা স্টক অ্যাডজাস্টমেন্টে ভুল পরিমাণ দিলে সিস্টেমের স্টক সঙ্গে সঙ্গে ভুল হয়ে যাবে।';
    if (text.includes('report filters')) return 'রিপোর্ট দেখার আগে তারিখ আর ফিল্টার ঠিক করুন। ভুল তারিখ নিলে মালিক ভুল সিদ্ধান্ত নিতে পারেন, তাই আজ, এই মাস, বা নিজের দরকারি সময়সীমা আগে বেছে নিন।';
    if (text.includes('date and filters')) return 'রিপোর্ট বা তালিকা দেখার আগে তারিখ আর ফিল্টার মিলিয়ে নিন। আজকের হিসাব, এই মাসের হিসাব, আর আগের মাসের হিসাব এক না, তাই সময়সীমা ভুল হলে সিদ্ধান্তও ভুল হবে।';
    if (text.includes('filter controls')) return 'এখানে স্টোর, ক্যাটাগরি, স্ট্যাটাস বা অ্যাকাউন্ট দিয়ে ফলাফল ছোট করবেন। বড় তালিকায় সরাসরি খোঁজার চেয়ে ফিল্টার দিয়ে কাজ করলে সময় বাঁচে।';
    if (text.includes('report result')) return 'এখন ফলাফলের অংশটা দেখুন। শুধু সংখ্যা দেখবেন না, কোন জায়গায় বিক্রি কম, খরচ বেশি, বা স্টক আটকে আছে সেটা বোঝার চেষ্টা করুন।';
    if (text.includes('financial metric')) return 'লাভ, খরচ, বিক্রি, আর বাকি একসাথে দেখলে ব্যবসার আসল অবস্থা বোঝা যায়। কোনো সংখ্যা অস্বাভাবিক লাগলে তার উৎসে গিয়ে মিলিয়ে নিন।';
    if (text.includes('export')) return 'প্রয়োজনে এখান থেকে রিপোর্ট এক্সপোর্ট করতে পারবেন। মালিক, ম্যানেজার, বা অ্যাকাউন্ট্যান্টকে পাঠানোর জন্য পিডিএফ বা এক্সেল ফাইল খুব কাজে লাগে।';
    if (text.includes('current plan')) return 'এখানে আপনার বর্তমান প্যাকেজ দেখা যায়। দোকানে এখন কোন সুবিধা চালু আছে আর কোনটা সীমিত, সেটা আগে এখান থেকে বুঝে নিন।';
    if (text.includes('plan area')) return 'প্ল্যান অংশে মেয়াদ, প্যাকেজের নাম, আর ব্যবহারযোগ্য ফিচার মিলিয়ে নিন। লাইভ দোকানে কাজ আটকে যাওয়ার আগেই এই জায়গা দেখা ভালো।';
    if (text.includes('plan')) return 'এখানে বর্তমান প্যাকেজ বা প্ল্যান দেখা যায়। কোন মডিউল ব্যবহার করতে পারবেন, কতদিন মেয়াদ আছে, আর কোন ফিচার লক আছে সেটা এই জায়গা থেকেই বুঝবেন।';
    if (text.includes('expiry')) return 'মেয়াদ শেষ হওয়ার তারিখ এখানে খেয়াল করুন। সময়মতো রিনিউ না করলে কিছু ফিচার বন্ধ হয়ে যেতে পারে, তাই লাইভ দোকানে কাজ শুরু করার আগে এটা দেখে নেওয়া ভালো।';
    if (text.includes('feature')) return 'কোন ফিচার প্যাকেজে আছে সেটা এখানেই বুঝবেন। কোনো ফিচার লক দেখালে আগে প্যাকেজ মিলিয়ে নিন, তারপর দরকার হলে আপগ্রেড বা সাপোর্টে কথা বলুন।';
    if (text.includes('payment action')) return 'পেমেন্ট বা রিনিউ করার অংশে আসলে রেফারেন্স, পরিমাণ, আর প্যাকেজ ভালোভাবে মিলিয়ে নিন। ভুল পেমেন্ট তথ্য দিলে ভেরিফিকেশন দেরি হতে পারে।';
    if (text.includes('renew or upgrade')) return 'রিনিউ বা আপগ্রেড করার আগে ভাবুন আপনার দোকানে কোন ফিচার সত্যি দরকার। শুধু বড় প্যাকেজ না, কাজের সাথে মিলিয়ে প্যাকেজ নিলে খরচও নিয়ন্ত্রণে থাকে।';
    if (text.includes('next action')) return 'এখান থেকে পরের কাজ শুরু হবে। ট্রেনিংয়ে আমরা জমা দিচ্ছি না, কিন্তু বাস্তবে এই জায়গায় ক্লিক করার আগে তথ্যগুলো শেষবার দেখে নেবেন।';
    if (text.includes('online store status')) return 'অনলাইন স্টোরের স্ট্যাটাস আগে দেখুন। দোকান অনলাইনে খোলা আছে কিনা, পণ্য দেখা যাচ্ছে কিনা, আর অর্ডার নেওয়ার মতো প্রস্তুত কিনা এখান থেকেই বুঝবেন।';
    if (text.includes('courier or cod')) return 'কুরিয়ার আর সিওডি অংশে খুব সতর্ক থাকবেন। পণ্য গেছে কিনা, ডেলিভারি হয়েছে কিনা, আর টাকা এসেছে কিনা, এই তিনটা আলাদা করে মিলাতে হয়।';
    if (text.includes('customer signals')) return 'এখানে গ্রাহকের সিগন্যাল দেখুন। কে নিয়মিত কিনছে, কার বাকি আছে, আর কাকে ফলোআপ করলে আবার বিক্রি হতে পারে সেটা এখান থেকে বোঝা যায়।';
    if (text.includes('due customers')) return 'বাকি গ্রাহকের তালিকা দেখার সময় শুধু টাকার অঙ্ক দেখবেন না। শেষ কবে কথা হয়েছে, কতদিনের বাকি, আর আংশিক পেমেন্ট হয়েছে কিনা সেটাও মিলিয়ে নিন।';
    if (text.includes('customer list')) return 'গ্রাহকের তালিকা থেকে নির্দিষ্ট গ্রাহক খুলে বিস্তারিত দেখবেন। মোবাইল নম্বর, বাকি, আগের কেনাকাটা, আর নোট ঠিক থাকলে সেবা দেওয়া সহজ হয়।';
    if (text.includes('employee selector')) return 'এখানে সঠিক কর্মী বেছে নিন। একই নামে একাধিক কর্মী থাকলে পদবি বা মোবাইল দেখে মিলিয়ে নেবেন, কারণ হাজিরা বা বেতন ভুল ব্যক্তির নামে গেলে সমস্যা হবে।';
    if (text.includes('date or shift')) return 'তারিখ, শিফট, হাজিরা বা ছুটির অংশে আগে সময় মিলিয়ে নিন। আজকের হাজিরা আর আগের দিনের হাজিরা মিশে গেলে বেতন হিসাব নষ্ট হবে।';
    if (text.includes('account area')) return 'এখানে কোন অ্যাকাউন্টে টাকা ঢুকছে বা বের হচ্ছে সেটা বেছে নিন। ক্যাশ, ব্যাংক, মোবাইল ব্যাংকিং আলাদা না রাখলে পরে ব্যালেন্স মিলবে না।';
    if (text.includes('amount columns')) return 'ডেবিট, ক্রেডিট, পরিমাণ, আর ব্যালেন্স কলাম দেখে হিসাবের দিকটা বুঝুন। টাকা কোন দিকে গেল সেটা না বুঝলে শুধু মোট দেখে লাভ নেই।';
    if (text.includes('stock quantity')) return 'স্টকের পরিমাণ অংশে হাতে থাকা পণ্য আর সিস্টেমের সংখ্যা মিলান। দোকানের তাকের সংখ্যা আর সিস্টেমের সংখ্যা আলাদা হলে আগে কারণ খুঁজুন।';
    if (text.includes('stock action')) return 'স্টক অ্যাকশন করার সময় কারণটা পরিষ্কার রাখুন। অ্যাডজাস্টমেন্ট, কাউন্ট, ট্রান্সফার, বা threshold বদলালে রিপোর্টে তার প্রভাব যাবে।';
    if (text.includes('screen')) return getTrainingTemplate(lesson).screen;
    if (text.includes('first input')) return 'প্রথম ঘরটায় মূল নাম বা পরিচয় লিখবেন। দোকানে পরে সার্চ করলে যেন সহজে পাওয়া যায়, তাই সংক্ষিপ্ত কিন্তু পরিষ্কার নাম ব্যবহার করুন।';
    if (text.includes('dropdown') || text.includes('selector')) return 'এখানে তালিকা থেকে সঠিক অপশন বেছে নিন। ভুল ক্যাটাগরি, স্ট্যাটাস, কর্মী, বা অ্যাকাউন্ট বেছে নিলে পরে রিপোর্ট আর হিসাব ভুল জায়গায় চলে যাবে।';
    if (text.includes('amount') || text.includes('number field')) return 'এই ঘরে সংখ্যা বা টাকার পরিমাণ বসবে। সংখ্যার ক্ষেত্রে এক ডিজিট ভুল হলেও হিসাব পাল্টে যায়, তাই লেখার পর একবার পড়ে নিন।';
    if (text.includes('notes') || text.includes('description')) return 'নোট বা বর্ণনার জায়গায় ছোট করে কারণ লিখে রাখুন। পরে কেউ রেকর্ড খুললে যেন বুঝতে পারে এই কাজটা কেন করা হয়েছিল।';
    if (text.includes('save button')) return 'সব ঘর পূরণ হলে সংরক্ষণের আগে একবার উপরের তথ্যগুলো মিলিয়ে নিন। ট্রেনিংয়ে আমরা লাইভ ডেটা জমা দিচ্ছি না, কিন্তু বাস্তবে এই বাটন চাপলেই রেকর্ড তৈরি হবে।';
    if (text.includes('filter')) return makeTrainerLine(lesson, 'ফিল্টার', 'ঠিক করে নিন');
    if (text.includes('data list')) return makeTrainerLine(lesson, 'তালিকার রেকর্ডগুলো', 'খুঁজে দেখুন');
    if (text.includes('row actions')) return 'প্রতিটি রেকর্ডের পাশে সাধারণত দেখা, সম্পাদনা, বা বিস্তারিত কাজ থাকে। ভুল রেকর্ডে ক্লিক না করতে নাম, তারিখ, আর পরিমাণ মিলিয়ে নিন।';
    if (text.includes('more records')) return 'তালিকায় আরও রেকর্ড থাকলে নিচে নেমে দেখুন। শুধু প্রথম কয়েকটা দেখে সিদ্ধান্ত নিলে পুরনো বা পেন্ডিং কাজ চোখ এড়িয়ে যেতে পারে।';
    if (text.includes('summary cards')) return makeTrainerLine(lesson, 'সামারি কার্ডগুলো', 'একবার মিলিয়ে নিন');
    if (text.includes('more dashboard widgets')) return 'ড্যাশবোর্ডের নিচের অংশেও দরকারি সিগন্যাল থাকে। শুধু উপরকার বিক্রি না, স্টক, অর্ডার, বাকি, আর সাম্প্রতিক কাজও দেখে নিন।';
    if (text.includes('dashboard overview area')) return 'শেষে পুরো ড্যাশবোর্ড একবার মিলিয়ে নিন। কোন সংখ্যা আজকের কাজের জন্য জরুরি, আর কোনটা শুধু পর্যবেক্ষণের জন্য, সেটা আলাদা করে বুঝুন।';
    if (text.includes('more insights')) return 'আরও insight দেখতে নিচে নামুন। অনেক সময় মূল সমস্যাটা প্রথম কার্ডে না, নিচের trend বা detail অংশে ধরা পড়ে।';
    if (text.includes('chart') || text.includes('trend')) return makeTrainerLine(lesson, 'চার্ট আর ট্রেন্ড', 'ধীরে দেখে বুঝুন');
    if (text.includes('detail area')) return makeTrainerLine(lesson, 'বিস্তারিত অংশ', 'নিচে নেমে দেখুন');
    if (text.includes('operational list')) return makeTrainerLine(lesson, 'অপারেশন তালিকা', 'রেকর্ড ধরে ধরে দেখুন');
    if (text.includes('hr records')) return makeTrainerLine(lesson, 'কর্মীর রেকর্ড', 'মিলিয়ে দেখুন');
    if (text.includes('accounting records')) return makeTrainerLine(lesson, 'হিসাবের রেকর্ড', 'লাইন ধরে দেখুন');
    if (text.includes('stock records')) return makeTrainerLine(lesson, 'স্টকের রেকর্ড', 'হাতে থাকা পণ্যের সাথে মিলিয়ে দেখুন');
    if (text.includes('action button')) return makeTrainerLine(lesson, 'শেষ বাটন', 'চাপার আগে যাচাই করুন');
    return '';
};

const cleanSpokenBangla = (line = '') =>
    String(line || '')
        .replace(/\bbasic\b/gi, 'প্রাথমিক')
        .replace(/\bcategory\b/gi, 'ক্যাটাগরি')
        .replace(/\bbrand\b/gi, 'ব্র্যান্ড')
        .replace(/\bcost\b/gi, 'কস্ট')
        .replace(/\bprice\b/gi, 'দাম')
        .replace(/\bstock\b/gi, 'স্টক')
        .replace(/\bproduct save\b/gi, 'পণ্য সংরক্ষণ')
        .replace(/\bproduct\b/gi, 'পণ্য')
        .replace(/\bsave\b/gi, 'সংরক্ষণ')
        .replace(/\bbarcode\b/gi, 'বারকোড')
        .replace(/\binvoice\b/gi, 'ইনভয়েস')
        .replace(/\breport\b/gi, 'রিপোর্ট')
        .replace(/\bdashboard\b/gi, 'ড্যাশবোর্ড')
        .replace(/\bsupport\b/gi, 'সাপোর্ট')
        .replace(/\baccount verification\b/gi, 'অ্যাকাউন্ট যাচাই')
        .replace(/\baccount\b/gi, 'অ্যাকাউন্ট')
        .replace(/\bowner contact\b/gi, 'মালিকের যোগাযোগ নম্বর')
        .replace(/\bowner\b/gi, 'মালিক')
        .replace(/\blogin\b/gi, 'লগইন')
        .replace(/\bstrong\b/gi, 'শক্ত')
        .replace(/\bsubmit\b/gi, 'জমা')
        .replace(/\blive site\b/gi, 'লাইভ সাইট')
        .replace(/\bcashier\b/gi, 'ক্যাশিয়ার')
        .replace(/\bsearch\b/gi, 'সার্চ')
        .replace(/\bonline store\b/gi, 'অনলাইন স্টোর')
        .replace(/\bfilter\b/gi, 'ফিল্টার')
        .replace(/\bprofit\b/gi, 'লাভ')
        .replace(/\bsignal\b/gi, 'সিগন্যাল')
        .replace(/\bsale miss\b/gi, 'বিক্রি মিস')
        .replace(/\bpurchase plan\b/gi, 'ক্রয়ের পরিকল্পনা')
        .replace(/\bcounter\b/gi, 'কাউন্টার')
        .replace(/\bbill\b/gi, 'বিল')
        .replace(/\bitem\b/gi, 'পণ্য')
        .replace(/\bcart\b/gi, 'কার্ট')
        .replace(/\bquantity\b/gi, 'পরিমাণ')
        .replace(/\btotal\b/gi, 'মোট')
        .replace(/\bpayment\b/gi, 'পেমেন্ট')
        .replace(/\bcustomer\b/gi, 'গ্রাহক')
        .replace(/\bdiscount\b/gi, 'ডিসকাউন্ট')
        .replace(/\bflat discount\b/gi, 'ফ্ল্যাট ডিসকাউন্ট')
        .replace(/\bpercentage discount\b/gi, 'পার্সেন্টেজ ডিসকাউন্ট')
        .replace(/\bflat\b/gi, 'ফ্ল্যাট')
        .replace(/\bpercentage\b/gi, 'পার্সেন্টেজ')
        .replace(/\breceipt\b/gi, 'রসিদ')
        .replace(/\breturn\b/gi, 'রিটার্ন')
        .replace(/\bdue\b/gi, 'বাকি')
        .replace(/\bcash\b/gi, 'ক্যাশ')
        .replace(/\baccount access\b/gi, 'অ্যাকাউন্টে ঢোকার')
        .replace(/\bflow\b/gi, 'কাজের ধাপ')
        .replace(/\bpractice\b/gi, 'প্র্যাকটিস')
        .replace(/\blive screen\b/gi, 'স্ক্রিন')
        .replace(/\bupgrade request\b/gi, 'আপগ্রেড রিকোয়েস্ট')
        .replace(/\bupgrade\b/gi, 'আপগ্রেড')
        .replace(/\brenew\b/gi, 'রিনিউ')
        .replace(/\bcod reconciliation\b/gi, 'সিওডি হিসাব মিলানো')
        .replace(/\bcod\b/gi, 'সিওডি')
        .replace(/\bcollected\b/gi, 'আদায় হওয়া টাকা')
        .replace(/\bpaid\b/gi, 'পরিশোধ হওয়া টাকা')
        .replace(/\bunsettled amount\b/gi, 'বাকি থাকা টাকা')
        .replace(/\bunsettled\b/gi, 'বাকি থাকা')
        .replace(/\bfollow-up\b/gi, 'ফলোআপ')
        .replace(/\bfollow up\b/gi, 'ফলোআপ')
        .replace(/\bimportant change\b/gi, 'গুরুত্বপূর্ণ পরিবর্তন')
        .replace(/\bsource transaction\b/gi, 'মূল লেনদেন')
        .replace(/\btransaction\b/gi, 'লেনদেন')
        .replace(/\bgross\b/gi, 'গ্রস')
        .replace(/\bnet\b/gi, 'নেট')
        .replace(/\bexpense impact\b/gi, 'খরচের প্রভাব')
        .replace(/\bexpense\b/gi, 'খরচ')
        .replace(/\bimpact\b/gi, 'প্রভাব')
        .replace(/\breview\b/gi, 'রিভিউ')
        .replace(/\bverify\b/gi, 'যাচাই')
        .replace(/\bcheck\b/gi, 'চেক')
        .replace(/\bconfirm\b/gi, 'কনফার্ম')
        .replace(/\bdata export backup\b/gi, 'ডেটা এক্সপোর্ট ব্যাকআপ')
        .replace(/\bbackup\b/gi, 'ব্যাকআপ')
        .replace(/\brow action\b/gi, 'রো অ্যাকশন')
        .replace(/\bgrowth-focused\b/gi, 'বাড়তে থাকা দোকানের')
        .replace(/\bfeature need\b/gi, 'দরকারি ফিচার')
        .replace(/\bbusiness need\b/gi, 'দোকানের দরকার')
        .replace(/\blocked feature\b/gi, 'লক থাকা ফিচার')
        .replace(/\bpackage\b/gi, 'প্যাকেজ')
        .replace(/\bfeature\b/gi, 'ফিচার')
        .replace(/\bsupplier\b/gi, 'সাপ্লায়ার')
        .replace(/\breceived quantity\b/gi, 'রিসিভ করা পরিমাণ')
        .replace(/\breceived\b/gi, 'রিসিভ করা')
        .replace(/\breceive quantity\b/gi, 'রিসিভ পরিমাণ')
        .replace(/\breceive\b/gi, 'রিসিভ')
        .replace(/\bupdate\b/gi, 'আপডেট')
        .replace(/\bcount\b/gi, 'গণনা')
        .replace(/\bdata\b/gi, 'ডেটা')
        .replace(/\bsync\b/gi, 'সিঙ্ক')
        .replace(/\bstatus\b/gi, 'স্ট্যাটাস')
        .replace(/\blive\b/gi, 'লাইভ')
        .replace(/\bscan\b/gi, 'স্ক্যান')
        .replace(/\btrust\b/gi, 'বিশ্বাস')
        .replace(/\bmethod\b/gi, 'মেথড')
        .replace(/\breference\b/gi, 'রেফারেন্স')
        .replace(/সাপ্লায়ার-এর/g, 'সাপ্লায়ারের')
        .replace(/আপগ্রেড-এর/g, 'আপগ্রেডের')
        .replace(/প্যাকেজ আপগ্রেড ভাবছেন/g, 'প্যাকেজ আপগ্রেড করার কথা ভাবছেন')
        .replace(/\s+/g, ' ')
        .trim();

const naturalLessonOpening = (lesson) => {
    const title = humanTitle(lesson);
    return getTrainingTemplate(lesson).opening({ title, lesson });
};

const naturalLessonClosing = (lesson) => {
    return getTrainingTemplate(lesson).closing;
};

const expandTrainingStep = (lesson, stepLine = '') => {
    const raw = String(stepLine || '').replace(/[।.]+$/, '').trim();
    const text = raw.toLowerCase();
    const spokenStep = cleanSpokenBangla(raw);
    const template = getTrainingTemplate(lesson);
    const prefix = spokenStep ? `${spokenStep}। ` : '';

    if (text.includes('collected') || text.includes('paid') || text.includes('unsettled') || text.includes('cod')) {
        return `${prefix}ধরুন আজ কয়েকটা অনলাইন অর্ডার ডেলিভারি হয়েছে। কুরিয়ার থেকে কত টাকা আদায় হয়েছে, কত টাকা হাতে এসেছে, আর কত বাকি আছে সেটা মিলিয়ে নিন। এই হিসাব পরিষ্কার না থাকলে বিক্রি হয়েছে ঠিকই, কিন্তু টাকা কোথায় আটকে আছে বোঝা যাবে না।`;
    }
    if (text.includes('export') || text.includes('pdf') || text.includes('excel')) {
        return `${prefix}মাসশেষে মালিক বা অ্যাকাউন্ট্যান্ট সাধারণত কাগজে বা ফাইলে রিপোর্ট চান। তাই এক্সপোর্ট করার আগে ফিল্টার ঠিক আছে কিনা দেখে নিন, তারপর পিডিএফ বা এক্সেল নিলে শেয়ার করার সময় ভুল কম হবে।`;
    }
    if (text.includes('verify') || text.includes('check') || text.includes('confirm')) {
        return `${prefix}এই জায়গায় একটু থামুন। স্ক্রিনে যা দেখাচ্ছে সেটা বাস্তব দোকানের কাজের সাথে মিলে কিনা দেখুন। ${template.generic({ focus: spokenStep || 'যাচাই' })}`;
    }
    if (text.includes('review')) {
        return `${prefix}শুধু সংখ্যা দেখে চলে যাবেন না। কোনটা স্বাভাবিক, কোনটা অস্বাভাবিক, আর কোথায় ফলোআপ দরকার সেটা ভাবুন। একজন দোকানদার হিসেবে এই জায়গা থেকেই পরের কাজের সিদ্ধান্ত তৈরি হয়।`;
    }
    if (text.includes('follow')) {
        return `${prefix}যে কাজটা এখনো বাকি আছে সেটা আলাদা করে ধরুন। কাকে ফোন দিতে হবে, কোন টাকা তুলতে হবে, কোন অর্ডার আটকে আছে, এগুলো মনে রাখার উপর না রেখে সিস্টেমে দেখে ফলোআপ করুন।`;
    }
    if (text.includes('approve') || text.includes('reject')) {
        return `${prefix}অনুমোদন দেওয়ার আগে কারণ, পরিমাণ, আর সংশ্লিষ্ট ব্যক্তি মিলিয়ে নিন। দোকানে একবার approve হয়ে গেলে সবাই ধরে নেয় কাজটা ঠিক, তাই না বুঝে approve বা reject করবেন না।`;
    }
    if (text.includes('update')) {
        return `${prefix}আপডেট করার আগে পুরনো তথ্য আর নতুন তথ্য তুলনা করুন। এই পরিবর্তন স্টক, পেমেন্ট, রিপোর্ট, অনলাইন স্টোর, অথবা কর্মীর হিসাব কোথায় প্রভাব ফেলবে সেটা মাথায় রাখুন।`;
    }
    if (text.includes('filter') || text.includes('date') || text.includes('range')) {
        return `${prefix}রিপোর্ট বা তালিকা দেখার আগে তারিখটাই সবচেয়ে আগে মিলাবেন। গতকালের রিপোর্ট দেখে আজকের সিদ্ধান্ত নিলে ভুল হবে, তাই সময়সীমা, স্টোর, আর দরকারি ক্যাটাগরি আগে ঠিক করুন।`;
    }
    if (text.includes('record')) {
        return `${prefix}রেকর্ড করার সময় ছোট তথ্য বাদ দেবেন না। আজ হয়তো মনে থাকবে, কিন্তু এক সপ্তাহ পরে রিপোর্ট, হিসাব, বা অডিটে ফিরে দেখলে এই নোট, তারিখ, আর পরিমাণটাই কাজে লাগবে।`;
    }
    if (text.includes('payment') || text.includes('balance') || text.includes('due')) {
        return `${prefix}টাকা-পয়সার অংশে সবসময় একটু ধীরে কাজ করবেন। ক্যাশ, মোবাইল ব্যাংকিং, কার্ড, বাকি, আর ব্যালেন্স মিলিয়ে নিলে দিনের শেষে ক্যাশ ক্লোজিং করতে ভয় লাগে না।`;
    }
    if (text.includes('stock') || text.includes('quantity')) {
        return `${prefix}স্টক বা পরিমাণ বদলানো মানে দোকানের বাস্তব মালও বদলানো। হাতে কত আছে আর সিস্টেমে কত দেখাচ্ছে সেটা একসাথে মিলিয়ে নিন, না হলে কাউন্টারে বিক্রির সময় সমস্যা হবে।`;
    }
    if (text.includes('customer')) {
        return `${prefix}গ্রাহকের সাথে সম্পর্ক দোকানের সম্পদ। নাম, মোবাইল, বাকি, আগের কেনাকাটা, আর ফলোআপ ঠিক থাকলে গ্রাহককে আবার ফিরিয়ে আনা সহজ হয়।`;
    }
    if (text.includes('supplier')) {
        return `${prefix}সাপ্লায়ারের সাথে হিসাব পরিষ্কার রাখা দরকার। নতুন মাল নেওয়ার আগে আগের বাকি, আগের পেমেন্ট, আর কোন পণ্য কোথা থেকে এসেছে সেটা দেখে নিন।`;
    }
    if (text.includes('employee') || text.includes('staff') || text.includes('shift') || text.includes('salary')) {
        return `${prefix}কর্মীর হিসাব সবসময় সংবেদনশীল। হাজিরা, শিফট, অগ্রিম, ছুটি, আর বেতন একে অপরের সাথে যুক্ত, তাই এখানে ভুল হলে মাসশেষে কথা কাটাকাটি হতে পারে।`;
    }
    if (text.includes('order') || text.includes('courier') || text.includes('cod')) {
        return `${prefix}অর্ডারের স্ট্যাটাস দেখে বুঝুন কাজটা কোথায় আটকে আছে। পণ্য রেডি, কুরিয়ার বুকড, ডেলিভারি হয়েছে, নাকি টাকা এখনো আসেনি, এই ধাপ ঠিক থাকলে গ্রাহক সেবা আর হিসাব দুটোই পরিষ্কার থাকে।`;
    }
    if (text.includes('request') || text.includes('upgrade') || text.includes('renew')) {
        return `${prefix}রিকোয়েস্ট পাঠানোর আগে দোকানের দরকারটা পরিষ্কার করুন। কোন ফিচার লাগছে, প্যাকেজের মেয়াদ কতদিন আছে, পেমেন্ট রেফারেন্স কী, এগুলো মিলিয়ে দিলে সাপোর্ট টিম দ্রুত সাহায্য করতে পারবে।`;
    }
    if (text.includes('data') || text.includes('backup')) {
        return `${prefix}দোকানের ডেটা মানে বিক্রি, গ্রাহক, স্টক, আর হিসাবের স্মৃতি। নিয়মিত ব্যাকআপ বা এক্সপোর্ট রাখলে জরুরি সময়ে ঝুঁকি কমে, আর দরকার হলে পুরনো তথ্য হাতে পাওয়া যায়।`;
    }
    if (text.includes('security') || text.includes('audit')) {
        return `${prefix}নিরাপত্তা বা অডিটের জায়গায় মনোযোগ দিন। কে কখন কী বদলেছে সেটা দেখা গেলে ভুল, অননুমোদিত কাজ, বা সন্দেহজনক পরিবর্তন দ্রুত ধরা যায়।`;
    }

    return `${prefix}${template.generic({ focus: spokenStep || 'এই ধাপ' })}`;
};

const buildStoryboardNarration = (lesson, storyboardStep, index, total) => {
    if (storyboardStep?.narration) return cleanSpokenBangla(storyboardStep.narration);
    if (index === 0) return cleanSpokenBangla(naturalLessonOpening(lesson));
    if (index === total - 1 && !storyboardStep) return cleanSpokenBangla(naturalLessonClosing(lesson));
    const noteLine = toBanglaStoryboardNote(storyboardStep?.note, lesson);
    if (noteLine) return cleanSpokenBangla(noteLine);
    const stepLine = lesson.steps?.[Math.min(index - 1, Math.max(0, lesson.steps.length - 1))];
    if (stepLine) return cleanSpokenBangla(expandTrainingStep(lesson, stepLine));
    return cleanSpokenBangla('এই অংশটা ভালোভাবে দেখে নিন।');
};

const secondsForNarration = (line, fallback = SCENE_SECONDS) => {
    const words = String(line || '').split(/\s+/).filter(Boolean).length;
    return Math.max(7, Math.min(16, Math.ceil(words / 2.2) + 3, fallback + 5));
};

const buildScenes = (lesson) => {
    if (lesson.trainingScript?.screenSync?.length) {
        const storyboard = getLessonStoryboard(lesson);
        const pathForScene = (scene) => scene.path || lesson.path;
        const sceneCount = storyboard.length + 2;
        return Array.from({ length: sceneCount }, (_, index) => {
            const scene = lesson.trainingScript.screenSync[index] || lesson.trainingScript.screenSync[lesson.trainingScript.screenSync.length - 1];
            const storyboardIndex = index - 1;
            const storyboardStep = storyboardIndex >= 0 && storyboardIndex < storyboard.length ? storyboard[storyboardIndex] : null;
            const narration = buildStoryboardNarration(lesson, storyboardStep, index, sceneCount);
            return {
            title: `${lesson.title} - step ${index + 1}`,
            path: pathForScene(scene),
                seconds: secondsForNarration(narration, scene.seconds || SCENE_SECONDS),
                narration,
                screenAction: storyboardStep?.note || scene.screenAction,
            stepNumber: index + 1,
                storyboardActionIndex: storyboardStep ? storyboardIndex : -1,
            };
        });
    }

    return [
        {
            title: lesson.title,
            path: lesson.path,
            seconds: SCENE_SECONDS,
            narration: lesson.narration,
            screenAction: 'Show lesson target screen',
            stepNumber: 1,
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
            screenAction: 'Recap key steps',
            stepNumber: 2,
        },
    ];
};

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
    await fs.writeFile(path.join(lessonDir, 'storyboard.json'), JSON.stringify(getLessonStoryboard(lesson), null, 2));
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

const injectUrlOverlay = async (page) => {
    await page.evaluate(() => {
        const overlayId = 'andgate-training-url-overlay';
        document.getElementById(overlayId)?.remove();

        const wrapper = document.createElement('div');
        wrapper.id = overlayId;
        wrapper.style.position = 'fixed';
        wrapper.style.left = '0';
        wrapper.style.right = '0';
        wrapper.style.top = '0';
        wrapper.style.zIndex = '2147483647';
        wrapper.style.height = '38px';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '10px';
        wrapper.style.padding = '6px 14px';
        wrapper.style.background = 'rgba(15, 23, 42, 0.94)';
        wrapper.style.color = '#e5edf6';
        wrapper.style.fontFamily = 'Inter, Arial, sans-serif';
        wrapper.style.fontSize = '13px';
        wrapper.style.boxShadow = '0 2px 10px rgba(0,0,0,0.18)';
        wrapper.style.pointerEvents = 'none';
        wrapper.style.transition = 'background 220ms ease, box-shadow 220ms ease';

        const dots = document.createElement('div');
        dots.style.display = 'flex';
        dots.style.gap = '5px';
        for (const color of ['#ef4444', '#f59e0b', '#22c55e']) {
            const dot = document.createElement('span');
            dot.style.width = '9px';
            dot.style.height = '9px';
            dot.style.borderRadius = '999px';
            dot.style.background = color;
            dots.appendChild(dot);
        }

        const bar = document.createElement('div');
        bar.style.flex = '1';
        bar.style.minWidth = '0';
        bar.style.overflow = 'hidden';
        bar.style.whiteSpace = 'nowrap';
        bar.style.textOverflow = 'ellipsis';
        bar.style.border = '1px solid rgba(148, 163, 184, 0.35)';
        bar.style.borderRadius = '8px';
        bar.style.background = 'rgba(255,255,255,0.08)';
        bar.style.padding = '4px 10px';
        bar.textContent = window.location.href;

        wrapper.appendChild(dots);
        wrapper.appendChild(bar);
        document.body.appendChild(wrapper);
        document.documentElement.style.scrollPaddingTop = '48px';
        document.body.style.paddingTop = '38px';

        requestAnimationFrame(() => {
            wrapper.style.background = 'rgba(4, 108, 169, 0.96)';
            wrapper.style.boxShadow = '0 3px 18px rgba(4,108,169,0.35)';
            setTimeout(() => {
                wrapper.style.background = 'rgba(15, 23, 42, 0.94)';
                wrapper.style.boxShadow = '0 2px 10px rgba(0,0,0,0.18)';
            }, 900);
        });
    });
};

const injectStepOverlay = async (page, scene, focusPoint = null) => {
    if (['0', 'false', 'off', 'none', 'hide'].includes(STEP_OVERLAY_MODE)) {
        await page.evaluate(() => document.getElementById('andgate-training-step-overlay')?.remove()).catch(() => undefined);
        return;
    }

    await page.evaluate(({ stepNumber, narration, screenAction, focusPoint }) => {
        const overlayId = 'andgate-training-step-overlay';
        document.getElementById(overlayId)?.remove();

        const viewportWidth = window.innerWidth || 1280;
        const viewportHeight = window.innerHeight || 720;
        const compactNarration = String(narration || '').replace(/\s+/g, ' ').trim();
        const shortNarration = compactNarration.length > 150 ? `${compactNarration.slice(0, 147)}...` : compactNarration;
        const shortAction = String(screenAction || 'এই ধাপটি দেখুন').replace(/\s+/g, ' ').trim();
        const shouldUseTop = focusPoint && focusPoint.y > viewportHeight * 0.58;
        const shouldUseRight = focusPoint && focusPoint.x < viewportWidth * 0.52;

        const card = document.createElement('div');
        card.id = overlayId;
        card.style.position = 'fixed';
        card.style.left = shouldUseRight ? 'auto' : '16px';
        card.style.right = shouldUseRight ? '16px' : 'auto';
        card.style.top = shouldUseTop ? '52px' : 'auto';
        card.style.bottom = shouldUseTop ? 'auto' : '16px';
        card.style.zIndex = '2147483645';
        card.style.width = 'min(460px, calc(100vw - 32px))';
        card.style.borderRadius = '8px';
        card.style.background = 'rgba(15, 23, 42, 0.88)';
        card.style.border = '1px solid rgba(255, 255, 255, 0.18)';
        card.style.boxShadow = '0 10px 28px rgba(15, 23, 42, 0.26)';
        card.style.padding = '9px 11px';
        card.style.fontFamily = 'Inter, Arial, sans-serif';
        card.style.color = '#f8fafc';
        card.style.pointerEvents = 'none';
        card.style.backdropFilter = 'blur(8px)';
        card.style.opacity = '0.94';

        const label = document.createElement('div');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.justifyContent = 'space-between';
        label.style.gap = '10px';
        label.style.fontSize = '12px';
        label.style.fontWeight = '800';
        label.style.letterSpacing = '0';

        const step = document.createElement('span');
        step.style.display = 'inline-flex';
        step.style.alignItems = 'center';
        step.style.borderRadius = '999px';
        step.style.background = '#046ca9';
        step.style.color = '#fff';
        step.style.padding = '2px 8px';
        step.textContent = `Step ${stepNumber}`;

        const hint = document.createElement('span');
        hint.style.color = '#bae6fd';
        hint.style.overflow = 'hidden';
        hint.style.textOverflow = 'ellipsis';
        hint.style.whiteSpace = 'nowrap';
        hint.textContent = shouldUseTop ? 'Trainer note - top' : 'Trainer note';
        label.appendChild(step);
        label.appendChild(hint);

        const action = document.createElement('div');
        action.style.marginTop = '7px';
        action.style.fontSize = '12px';
        action.style.fontWeight = '800';
        action.style.color = '#7dd3fc';
        action.style.whiteSpace = 'nowrap';
        action.style.overflow = 'hidden';
        action.style.textOverflow = 'ellipsis';
        action.textContent = shortAction;

        const line = document.createElement('div');
        line.style.marginTop = '4px';
        line.style.fontSize = '13px';
        line.style.fontWeight = '600';
        line.style.lineHeight = '1.35';
        line.style.display = '-webkit-box';
        line.style.WebkitLineClamp = '2';
        line.style.WebkitBoxOrient = 'vertical';
        line.style.overflow = 'hidden';
        line.textContent = shortNarration;

        card.appendChild(label);
        card.appendChild(action);
        card.appendChild(line);
        document.body.appendChild(card);
    }, {
        stepNumber: scene.stepNumber || 1,
        narration: scene.narration,
        screenAction: scene.screenAction,
        focusPoint,
    });
};

const moveTrainingCursor = async (page, point, label = '', step = '') => {
    if (!point?.x || !point?.y) return;
    await page.evaluate(({ x, y, label, step }) => {
        const cursorId = 'andgate-training-cursor';
        let cursor = document.getElementById(cursorId);
        if (!cursor) {
            cursor = document.createElement('div');
            cursor.id = cursorId;
            cursor.style.position = 'fixed';
            cursor.style.left = '0';
            cursor.style.top = '0';
            cursor.style.zIndex = '2147483646';
            cursor.style.width = '34px';
            cursor.style.height = '34px';
            cursor.style.pointerEvents = 'none';
            cursor.style.transform = 'translate(120px, 120px)';
            cursor.style.transition = 'transform 620ms cubic-bezier(.2,.8,.2,1)';
            cursor.innerHTML = `
                <div style="
                    position:absolute;left:0;top:0;width:0;height:0;
                    border-left:20px solid #046ca9;
                    border-top:13px solid transparent;
                    border-bottom:13px solid transparent;
                    filter:drop-shadow(0 3px 4px rgba(0,0,0,.38));
                    transform:rotate(-30deg);
                "></div>
                <div id="andgate-training-cursor-ring" style="
                    position:absolute;left:12px;top:10px;width:26px;height:26px;
                    border:3px solid rgba(231,146,55,.95);
                    border-radius:999px;background:rgba(231,146,55,.14);
                    transform:scale(.72);opacity:.8;
                    transition:transform 260ms ease, opacity 260ms ease;
                "></div>
                <div id="andgate-training-cursor-label" style="
                    position:absolute;left:28px;top:20px;max-width:230px;
                    border-radius:999px;background:rgba(15,23,42,.94);color:#fff;
                    font:800 11px Inter,Arial,sans-serif;padding:3px 8px;
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                    box-shadow:0 4px 12px rgba(0,0,0,.25);
                "></div>
            `;
            document.body.appendChild(cursor);
        }

        cursor.style.transform = `translate(${Math.max(6, x)}px, ${Math.max(46, y)}px)`;
        const labelEl = document.getElementById('andgate-training-cursor-label');
        if (labelEl) {
            labelEl.textContent = label || (step ? `Step ${step}` : 'এখানে দেখুন');
        }
        const ring = document.getElementById('andgate-training-cursor-ring');
        if (ring) {
            ring.style.transform = 'scale(1.45)';
            ring.style.opacity = '1';
            setTimeout(() => {
                ring.style.transform = 'scale(.72)';
                ring.style.opacity = '.72';
            }, 360);
        }
    }, { x: point.x, y: point.y, label, step });
    await page.mouse.move(point.x, point.y, { steps: 18 }).catch(() => undefined);
};

const pulseTrainingCursor = async (page, point = null) => {
    await page.evaluate((point) => {
        const cursor = document.getElementById('andgate-training-cursor');
        const rect = cursor?.getBoundingClientRect?.();
        const x = point?.x || (rect ? rect.left + 14 : window.innerWidth / 2);
        const y = point?.y || (rect ? rect.top + 14 : window.innerHeight / 2);
        const pulse = document.createElement('div');
        pulse.style.position = 'fixed';
        pulse.style.left = `${x - 18}px`;
        pulse.style.top = `${y - 18}px`;
        pulse.style.zIndex = '2147483644';
        pulse.style.width = '36px';
        pulse.style.height = '36px';
        pulse.style.borderRadius = '999px';
        pulse.style.border = '4px solid rgba(231,146,55,.95)';
        pulse.style.background = 'rgba(231,146,55,.18)';
        pulse.style.pointerEvents = 'none';
        pulse.style.animation = 'andgateTrainingPulse 700ms ease-out forwards';
        if (!document.getElementById('andgate-training-pulse-style')) {
            const style = document.createElement('style');
            style.id = 'andgate-training-pulse-style';
            style.textContent = '@keyframes andgateTrainingPulse{0%{transform:scale(.55);opacity:1}100%{transform:scale(2.4);opacity:0}}';
            document.head.appendChild(style);
        }
        document.body.appendChild(pulse);
        setTimeout(() => pulse.remove(), 760);
    }, point).catch(() => undefined);
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
    await moveTrainingCursor(page, { x, y }, `Step ${step}`, step);
    await page.waitForTimeout(700);
};

const CRITICAL_LESSON_ACTIONS = {
    'register-account': [
        { kind: 'fill', selector: 'input[name*="store" i], input[id*="store" i]', value: 'Training Store' },
        { kind: 'fill', selector: 'input[name="name"], input[id*="Name" i], input[name*="owner" i]', value: 'রহিম উদ্দিন' },
        { kind: 'fill', selector: 'input[type="email"], input[name*="email" i]', value: 'training@example.com' },
        { kind: 'fill', selector: 'input[name*="phone" i], input[type="tel"]', value: '01710000000' },
        { kind: 'fill', selector: 'input[type="password"]', value: 'Demo12345' },
        { kind: 'highlight', selector: 'form button[type="submit"], form button' },
    ],
    'login-own-account': [
        { kind: 'fill', selector: '#Email, input[type="email"], input[name*="email" i]', value: DEMO_EMAIL },
        { kind: 'fill', selector: '#Password, input[type="password"], input[name*="password" i]', value: DEMO_PASSWORD },
        { kind: 'highlight', selector: 'input[type="checkbox"], [role="checkbox"]' },
        { kind: 'highlight', selector: 'form button[type="submit"], form button' },
    ],
    'demo-account-login': [
        { kind: 'fill', selector: '#Email, input[type="email"], input[name*="email" i]', value: DEMO_EMAIL },
        { kind: 'fill', selector: '#Password, input[type="password"], input[name*="password" i]', value: DEMO_PASSWORD },
        { kind: 'highlightText', text: ['demo', 'ডেমো', 'login', 'লগইন'] },
        { kind: 'highlight', selector: 'form button[type="submit"], form button' },
    ],
    'dashboard-overview': [
        { kind: 'highlightText', text: ['today', 'আজ', 'sales', 'বিক্রয়', 'revenue'] },
        { kind: 'highlightText', text: ['order', 'অর্ডার'] },
        { kind: 'highlightText', text: ['stock', 'স্টক', 'low'] },
        { kind: 'scroll', y: 420 },
        { kind: 'highlight', selector: 'main section, main [class*="grid"], main' },
    ],
    'store-profile': [
        { kind: 'fill', selector: 'input[name*="name" i], input[id*="name" i]', value: SAMPLE_VALUES.storeName },
        { kind: 'fill', selector: 'input[name*="phone" i], input[type="tel"]', value: SAMPLE_VALUES.phone },
        { kind: 'fill', selector: 'textarea, input[name*="address" i]', value: SAMPLE_VALUES.address },
        { kind: 'highlightText', text: ['payment', 'পেমেন্ট', 'bkash', 'bKash', 'nagad'] },
        { kind: 'highlight', selector: 'button:not([type="submit"]), input, textarea' },
    ],
    'pos-sale': [
        { kind: 'fill', selector: 'input[type="search"], input[placeholder*="Search" i], input[placeholder*="barcode" i], input', value: SAMPLE_VALUES.search },
        { kind: 'highlightText', text: ['cart', 'কার্ট', 'quantity', 'পরিমাণ'] },
        { kind: 'highlightText', text: ['discount', 'ডিসকাউন্ট'] },
        { kind: 'highlightText', text: ['cash', 'ক্যাশ', 'bkash', 'Nagad', 'পেমেন্ট'] },
        { kind: 'highlightText', text: ['receipt', 'invoice', 'ইনভয়েস'] },
    ],
    products: [
        { kind: 'fill', selector: 'input[name*="name" i], input[id*="name" i], input[placeholder*="name" i]', value: SAMPLE_VALUES.productName },
        { kind: 'highlightText', text: ['category', 'ক্যাটাগরি'] },
        { kind: 'highlightText', text: ['brand', 'ব্র্যান্ড'] },
        { kind: 'clickText', text: ['মূল্য নির্ধারণ', 'দাম', 'pricing', 'price'] },
        { kind: 'fill', selector: 'input[name*="price" i], input[placeholder*="price" i], input[type="number"]', value: SAMPLE_VALUES.price },
        { kind: 'highlightText', text: ['barcode', 'বারকোড', 'stock', 'স্টক'] },
    ],
    purchases: [
        { kind: 'highlightText', text: ['supplier', 'সরবরাহকারী'] },
        { kind: 'highlightText', text: ['product', 'পণ্য'] },
        { kind: 'highlightText', text: ['quantity', 'পরিমাণ'] },
        { kind: 'highlightText', text: ['receive', 'রিসিভ'] },
        { kind: 'highlightText', text: ['due', 'বাকি', 'payment', 'পেমেন্ট'] },
    ],
    'customers-crm': [
        { kind: 'highlightText', text: ['customer', 'গ্রাহক'] },
        { kind: 'highlightText', text: ['due', 'বাকি'] },
        { kind: 'highlightText', text: ['top', 'loyalty', 'follow'] },
        { kind: 'highlight', selector: 'table, [role="table"], main section, main' },
    ],
    reports: [
        { kind: 'highlightText', text: ['date', 'তারিখ', 'filter', 'ফিল্টার'] },
        { kind: 'highlightText', text: ['sales', 'বিক্রয়'] },
        { kind: 'highlightText', text: ['profit', 'লাভ', 'expense', 'খরচ'] },
        { kind: 'highlightText', text: ['export', 'এক্সপোর্ট', 'pdf', 'excel'] },
    ],
    'subscription-status': [
        { kind: 'highlightText', text: ['plan', 'package', 'প্যাকেজ'] },
        { kind: 'highlightText', text: ['expiry', 'expire', 'মেয়াদ'] },
        { kind: 'highlightText', text: ['feature', 'ফিচার'] },
        { kind: 'highlightText', text: ['upgrade', 'renew', 'payment', 'পেমেন্ট'] },
    ],
};

const LESSON_STORYBOARDS = {
    'register-account': [
        { kind: 'highlight', selector: 'form', note: 'Registration form' },
        { kind: 'fill', selector: 'input[name*="store" i], input[id*="store" i]', value: 'Training Store', note: 'Store name' },
        { kind: 'fill', selector: 'input[name="name"], input[id*="Name" i], input[name*="owner" i]', value: 'রহিম উদ্দিন', note: 'Owner name' },
        { kind: 'fill', selector: 'input[name*="phone" i], input[type="tel"]', value: '01710000000', note: 'Phone number' },
        { kind: 'fill', selector: 'input[type="email"], input[name*="email" i]', value: 'training@example.com', note: 'Email' },
        { kind: 'fillAllPasswords', value: 'Demo12345', note: 'Password fields' },
        { kind: 'highlight', selector: 'form button[type="submit"], form button', note: 'Create account button' },
    ],
    'login-own-account': [
        { kind: 'highlight', selector: 'form', note: 'Login form' },
        { kind: 'fill', selector: '#Email, input[type="email"], input[name*="email" i]', value: DEMO_EMAIL, note: 'Email' },
        { kind: 'fill', selector: '#Password, input[type="password"], input[name*="password" i]', value: DEMO_PASSWORD, note: 'Password' },
        { kind: 'highlight', selector: 'input[type="checkbox"], [role="checkbox"]', note: 'Remember me' },
        { kind: 'highlight', selector: 'form button[type="submit"], form button', note: 'Login button' },
    ],
    'demo-account-login': [
        { kind: 'highlight', selector: 'form', note: 'Demo login form' },
        { kind: 'fill', selector: '#Email, input[type="email"], input[name*="email" i]', value: DEMO_EMAIL, note: 'Demo email' },
        { kind: 'fill', selector: '#Password, input[type="password"], input[name*="password" i]', value: DEMO_PASSWORD, note: 'Demo password' },
        { kind: 'highlight', selector: 'form button[type="submit"], form button', note: 'Demo login button' },
    ],
    'dashboard-overview': [
        { kind: 'highlightText', text: ['dashboard', 'ড্যাশবোর্ড'], note: 'Dashboard header' },
        { kind: 'highlightText', text: ['sales', 'বিক্রয়', 'revenue', 'আজ'], note: 'Today sales' },
        { kind: 'highlightText', text: ['order', 'অর্ডার'], note: 'Orders widget' },
        { kind: 'highlightText', text: ['stock', 'স্টক', 'low'], note: 'Stock signal' },
        { kind: 'scroll', y: 420, note: 'More dashboard widgets' },
        { kind: 'highlight', selector: 'main [class*="grid"], main section, main', note: 'Dashboard overview area' },
    ],
    'store-profile': [
        { kind: 'highlightText', text: ['Store', 'দোকান', 'Settings', 'সেটিংস'], note: 'Store settings page' },
        { kind: 'fill', selector: 'input[name*="name" i], input[id*="name" i]', value: SAMPLE_VALUES.storeName, note: 'Store name' },
        { kind: 'fill', selector: 'textarea, input[name*="address" i]', value: SAMPLE_VALUES.address, note: 'Store address' },
        { kind: 'highlightText', text: ['invoice', 'ইনভয়েস', 'receipt'], note: 'Invoice settings' },
        { kind: 'highlightText', text: ['payment', 'পেমেন্ট', 'bkash', 'Nagad'], note: 'Payment information' },
    ],
    'pos-sale': [
        { kind: 'fill', selector: 'input[type="search"], input[placeholder*="Search" i], input[placeholder*="barcode" i], input', value: SAMPLE_VALUES.search, note: 'Search or barcode field' },
        { kind: 'highlightText', text: ['product', 'পণ্য', 'item'], note: 'Product list' },
        { kind: 'highlightText', text: ['cart', 'কার্ট', 'quantity', 'পরিমাণ'], note: 'Cart area' },
        { kind: 'highlightText', text: ['discount', 'ডিসকাউন্ট'], note: 'Discount area' },
        { kind: 'highlightText', text: ['cash', 'ক্যাশ', 'bkash', 'পেমেন্ট'], note: 'Payment area' },
        { kind: 'highlightText', text: ['receipt', 'invoice', 'ইনভয়েস'], note: 'Receipt area' },
    ],
    products: [
        { kind: 'highlight', selector: 'form, main', note: 'Product create page' },
        { kind: 'fill', selector: 'input[name*="name" i], input[id*="name" i], input[placeholder*="name" i]', value: SAMPLE_VALUES.productName, note: 'Product name' },
        { kind: 'highlightText', text: ['category', 'ক্যাটাগরি'], note: 'Category' },
        { kind: 'highlightText', text: ['brand', 'ব্র্যান্ড'], note: 'Brand' },
        { kind: 'clickText', text: ['মূল্য নির্ধারণ', 'দাম', 'pricing', 'price'], note: 'Open pricing tab' },
        { kind: 'fill', selector: 'input[name*="price" i], input[placeholder*="price" i], input[type="number"]', value: SAMPLE_VALUES.price, note: 'Price fields' },
        { kind: 'highlightText', text: ['stock', 'স্টক', 'barcode', 'বারকোড'], note: 'Stock and barcode' },
        { kind: 'submit', selector: 'button[type="submit"], button' },
    ],
    'label-print': [
        {
            kind: 'highlightText',
            text: ['লেবেল প্রিন্ট', 'পণ্য সিলেক্ট করুন', 'Label'],
            note: 'Label module overview',
            narration: 'আসসালামু আলাইকুম। আজকে আমরা AndgatePOS-এর লেবেল প্রিন্ট মডিউল দেখবো। এই জায়গা থেকে পণ্যের জন্য বারকোড বা QR কোড লেবেল তৈরি করে প্রিন্ট করা যায়। দোকানে label ঠিক থাকলে cashier স্ক্যান করে দ্রুত বিল করতে পারে, আর ভুল পণ্য বিক্রির ঝুঁকিও কমে।',
        },
        {
            kind: 'labelSearchProduct',
            note: 'Barcode scan and product search',
            narration: 'প্রথমে বাম পাশের পণ্য তালিকা দেখুন। এখানে পণ্যের নাম, দাম, stock, category, brand দেখা যায়। উপরের barcode scan box দিয়ে scanner থেকে code পড়ে পণ্য খুঁজে নেওয়া যায়। চাইলে category বা brand ধরে product shortlist করাও যায়।',
        },
        {
            kind: 'highlightText',
            text: ['ক্যাটাগরি', 'ব্র্যান্ড', 'পৃষ্ঠা', 'পূর্ববর্তী', 'পরবর্তী'],
            note: 'Filters and pagination',
            narration: 'পণ্য বেশি হলে filter আর pagination ব্যবহার করবেন। ধরুন electronics দোকানে power bank, fan, mobile accessory সব একসাথে আছে। তখন category বা brand দিয়ে পণ্য খুঁজলে label বানানোর সময় ভুল কম হবে।',
        },
        {
            kind: 'labelSelectFirstProduct',
            note: 'Select a product',
            narration: 'এখন একটি পণ্য নির্বাচন করি। পণ্যে যদি variant থাকে, যেমন size, color, RAM, ROM বা model, তাহলে সঠিক variant বেছে নিতে হবে। ভুল variant-এর label লাগালে POS-এ scan করলে ভুল product আসতে পারে।',
        },
        {
            kind: 'labelChooseVariant',
            note: 'Variant and quantity modal',
            narration: 'ভ্যারিয়েন্ট মডালে stock, দাম, warranty আর quantity দেখে নিন। এখানে plus-minus দিয়ে কয়টি label দরকার সেটা ঠিক করা যায়। যেটা হাতে আছে, সেটার সাথেই screen-এর variant মিলিয়ে নেবেন।',
        },
        {
            kind: 'labelAddSelectedVariant',
            note: 'Add selected product to label queue',
            narration: 'এখন selected variant যোগ করি। যোগ করার পর ডান পাশে Label Generator খুলবে। এখানে মোট কত পণ্য আছে, মোট কত label হবে, আর পরের action button কোথায় আছে সব দেখা যাবে।',
        },
        {
            kind: 'labelToggleQrBarcode',
            note: 'Barcode or QR selection',
            narration: 'Label type হিসেবে barcode আর QR code দুইটা ভাববেন। Barcode সাধারণ counter sale-এর জন্য best, কারণ cashier scanner দিয়ে দ্রুত bill করতে পারে। QR code দরকার হয় যখন product information বা আলাদা code square format-এ রাখতে চান।',
        },
        {
            kind: 'labelOpenSettings',
            note: 'Settings and size presets',
            narration: 'Settings খুললে label size preset পাওয়া যায়। এক দশমিক পাঁচ inch by এক inch, Tiny, Small, Medium, Large - আপনার sticker roll বা sheet-এর size অনুযায়ী preset বেছে নেবেন। মাপ না মিললে print কেটে যাবে বা ফাঁকা জায়গা বেশি থাকবে।',
        },
        {
            kind: 'labelPickCustomSize',
            note: 'Custom label size',
            narration: 'কাস্টম label size দরকার হলে width আর height millimeter-এ দেবেন। যেমন ছোট price sticker হলে ছোট মাপ, আর বড় product label হলে একটু বড় মাপ। এখানে দোকানের real sticker-এর মাপ ruler দিয়ে মেপে দেওয়া ভালো।',
        },
        {
            kind: 'labelChangePaper',
            note: 'Paper and printer layout',
            narration: 'Paper size অংশটা খুব গুরুত্বপূর্ণ। Thermal 40mm, 50mm, 80mm roll ছোট label printer-এর জন্য। A4 বা Letter হলে এক পেজে grid আকারে অনেক label print হবে। Custom paper দিলে নিজের printer বা sticker sheet অনুযায়ী page width-height দেওয়া যায়।',
        },
        {
            kind: 'labelShowLivePreview',
            note: 'Live preview',
            narration: 'Live preview দেখে আগে বুঝে নিন label কত বড় দেখাবে। প্রস্থ আর উচ্চতা millimeter হিসেবে দেখায়। Generate বা print করার আগে এই preview মিলিয়ে নিলে কাগজ নষ্ট হওয়ার chance কমে।',
        },
        {
            kind: 'labelAdjustContentSettings',
            note: 'Content settings',
            narration: 'Content settings-এ copies মানে প্রতি পণ্যের কয়টি label হবে। Barcode হলে type থেকে Code 128, Code 39, EAN-13, EAN-8, UPC-A, UPC-E বেছে নেওয়া যায়। সাধারণ দোকানের জন্য Code 128 সবচেয়ে flexible। QR code হলে Small, Medium, Large size এবং Info option দেখা যায়।',
        },
        {
            kind: 'labelGenerateLabels',
            note: 'Generate labels',
            narration: 'সব ঠিক হলে total labels আর selected items একবার মিলিয়ে নিন। তারপর Generate Labels চাপবেন। System তখন selected product আর quantity অনুযায়ী barcode বা QR image তৈরি করবে।',
        },
        {
            kind: 'highlightText',
            text: ['PDF', 'Print', 'প্রিন্ট'],
            note: 'PDF and print actions',
            narration: 'Label generate হলে PDF আর Print option আসে। PDF নিলে file হিসেবে রাখা যাবে। Print দিলে browser print window খুলবে। সেখানে printer, paper size, margin, scale একশ percent, আর orientation ভালোভাবে মিলিয়ে তারপর print দেবেন।',
        },
        {
            kind: 'highlightText',
            text: ['সব মুছুন', 'Clear', 'Trash'],
            note: 'Remove or clear labels',
            narration: 'ভুল product যোগ হলে delete icon দিয়ে সরাবেন। অনেক product একসাথে remove করতে হলে Clear all ব্যবহার করবেন। Single label print করতে একটি product আর one copy রাখুন। Bulk print করতে একাধিক product যোগ করুন, অথবা copies বাড়ান।',
        },
        {
            kind: 'highlight',
            selector: 'main, section, body',
            note: 'Retail and wholesale best practices',
            narration: 'Retail দোকানে label লাগালে counter sale দ্রুত হয়। Wholesale business-এ carton, model, batch, variant, বা warehouse stock আলাদা করতে label কাজে লাগে। Best practice হলো প্রথমে sample print, তারপর scan test, তারপর bulk print। ভুল label product-এ লাগাবেন না।',
        },
        {
            kind: 'highlightText',
            text: ['লেবেল প্রিন্ট', 'পণ্য', 'বারকোড'],
            note: 'Complete workflow recap',
            narration: 'শেষে পুরো flow recap করি। Label page খুলবেন, product select করবেন, variant থাকলে সঠিক variant নেবেন, barcode বা QR code বেছে নেবেন, settings থেকে label size আর paper size মিলাবেন, copies আর type ঠিক করবেন, Generate Labels চাপবেন, তারপর PDF বা Print করবেন। Print করার পর কয়েকটা label POS-এ scan test করবেন।',
        },
    ],
    purchases: [
        { kind: 'highlight', selector: 'form, main', note: 'Purchase order page' },
        { kind: 'highlightText', text: ['supplier', 'সরবরাহকারী'], note: 'Supplier selector' },
        { kind: 'highlightText', text: ['product', 'পণ্য'], note: 'Product selector' },
        { kind: 'highlightText', text: ['quantity', 'পরিমাণ'], note: 'Quantity' },
        { kind: 'highlightText', text: ['receive', 'রিসিভ'], note: 'Receive goods' },
        { kind: 'highlightText', text: ['due', 'বাকি', 'payment', 'পেমেন্ট'], note: 'Supplier dues' },
    ],
    'customers-crm': [
        { kind: 'highlightText', text: ['CRM', 'customer', 'গ্রাহক'], note: 'CRM dashboard' },
        { kind: 'highlightText', text: ['due', 'বাকি'], note: 'Due customers' },
        { kind: 'highlightText', text: ['top', 'loyalty', 'follow'], note: 'Customer signals' },
        { kind: 'highlight', selector: 'table, [role="table"], main section, main', note: 'Customer list or summary' },
    ],
    reports: [
        { kind: 'highlightText', text: ['date', 'তারিখ', 'filter', 'ফিল্টার'], note: 'Report filters' },
        { kind: 'highlightText', text: ['sales', 'বিক্রয়'], note: 'Sales report metric' },
        { kind: 'highlightText', text: ['profit', 'লাভ', 'expense', 'খরচ'], note: 'Financial metric' },
        { kind: 'highlightText', text: ['export', 'এক্সপোর্ট', 'pdf', 'excel'], note: 'Export options' },
    ],
    'subscription-status': [
        { kind: 'highlightText', text: ['plan', 'package', 'প্যাকেজ'], note: 'Current plan' },
        { kind: 'highlightText', text: ['expiry', 'expire', 'মেয়াদ'], note: 'Expiry' },
        { kind: 'highlightText', text: ['feature', 'ফিচার'], note: 'Included features' },
        { kind: 'highlightText', text: ['upgrade', 'renew', 'payment', 'পেমেন্ট'], note: 'Renew or upgrade' },
    ],
    'first-dashboard-checklist': [
        { kind: 'highlightText', text: ['ব্যবসার স্বাস্থ্য স্কোর'], note: 'Business health score' },
        { kind: 'highlightText', text: ['প্যাকেজ ও ম্যানুয়াল পেমেন্ট'], note: 'Subscription package status' },
        { kind: 'highlightText', text: ['কম স্টক সতর্কতা'], note: 'Low stock alert widget' },
        { kind: 'highlightText', text: ['যাদের বাকি বেশি'], note: 'Top due customers and suppliers' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Recent sales table' },
        { kind: 'scroll', y: 500, note: 'More dashboard sections' },
    ],
    'roles-permissions': [
        { kind: 'highlightText', text: ['পদ ও পারমিশন ব্যবস্থাপনা'], note: 'Roles and permissions page' },
        { kind: 'highlight', selector: 'main table, [role="table"]', note: 'Existing roles table' },
        { kind: 'highlightText', text: ['অনুমতি', 'ইউজার', 'অ্যাকশন'], note: 'Permission and user columns' },
        { kind: 'highlight', selector: 'button:has-text("পদ তৈরি করুন")', note: 'Create role button' },
    ],
    'business-os': [
        { kind: 'highlightText', text: ['বিজনেস ওএস'], note: 'Business OS command center header' },
        { kind: 'highlightText', text: ['ক্যাশ ক্লোজিং', 'পেটি ক্যাশ'], note: 'Cash closing and petty cash cards' },
        { kind: 'highlightText', text: ['HR হাজিরা', 'সার্ভিস জব'], note: 'Attendance and service job cards' },
        { kind: 'highlightText', text: ['সাম্প্রতিক ক্লোজিং'], note: 'Recent closing history' },
        { kind: 'highlightText', text: ['ওপেন টাস্ক', 'কুইক লিংক'], note: 'Open tasks and quick links' },
    ],
    'cash-closing': [
        { kind: 'highlightText', text: ['বিজনেস ওএস'], note: 'Business OS command center' },
        { kind: 'highlight', selector: 'a:has-text("ক্যাশ ক্লোজিং"), [class*="card"]:has-text("ক্যাশ ক্লোজিং")', note: 'Cash closing card' },
        { kind: 'highlightText', text: ['ক্যাশিয়ারের জমা দেওয়া ক্যাশ ক্লোজিং অনুমোদন করুন'], note: 'Owner approval note' },
    ],
    'petty-cash': [
        { kind: 'highlightText', text: ['বিজনেস ওএস'], note: 'Business OS command center' },
        { kind: 'highlight', selector: 'a:has-text("পেটি ক্যাশ"), [class*="card"]:has-text("পেটি ক্যাশ")', note: 'Petty cash card' },
        { kind: 'highlightText', text: ['স্টাফের ছোট ক্যাশ রিকওয়েস্ট দেখুন ও অনুমোদন করুন'], note: 'Petty cash approval note' },
    ],
    attendance: [
        { kind: 'highlightText', text: ['হাজিরা'], note: 'Attendance page header' },
        { kind: 'fill', selector: 'input[placeholder="নাম দিয়ে স্টাফ খুঁজুন..."]', value: SAMPLE_VALUES.name, note: 'Search staff by name' },
        { kind: 'highlightText', text: ['চেক ইন', 'চেক আউট'], note: 'Check-in and check-out actions' },
        { kind: 'highlightText', text: ['হাজিরা লগ', 'দৈনিক সারসংক্ষেপ'], note: 'Attendance log and daily summary' },
        { kind: 'fill', selector: 'input[placeholder*="নোট যোগ করুন"]', value: SAMPLE_VALUES.note, note: 'Optional attendance note' },
    ],
    'variants-labels': [
        { kind: 'highlightText', text: ['পণ্য সিলেক্ট করুন'], note: 'Product list for labeling' },
        { kind: 'highlight', selector: 'input[placeholder*="বারকোড স্ক্যান করুন"]', note: 'Barcode scan search box' },
        { kind: 'highlightText', text: ['ক্যাটাগরি', 'ব্র্যান্ড'], note: 'Category and brand filters' },
        { kind: 'highlightText', text: ['লেবেলের ধরন বেছে নিন'], note: 'Choose barcode or QR label type' },
        { kind: 'highlightText', text: ['কনফিগার ও তৈরি করুন'], note: 'Configure size and generate labels' },
    ],
    'stock-control': [
        { kind: 'highlightText', text: ['স্টক রিপোর্ট'], note: 'Stock report header' },
        { kind: 'fill', selector: 'input[placeholder*="পণ্য, SKU অনুসন্ধান করুন"]', value: SAMPLE_VALUES.search, note: 'Search product or SKU' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Stock, margin and status columns' },
        { kind: 'highlightText', text: ['স্টক শেষ', 'স্টকে ফেরত'], note: 'Out-of-stock and returned-to-stock signals' },
        { kind: 'clickText', text: ['ফিল্টার'], note: 'Open stock filters' },
    ],
    'inventory-reports': [
        { kind: 'highlightText', text: ['স্টক রিপোর্ট'], note: 'Inventory report header' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'SKU, category, brand and stock value columns' },
        { kind: 'highlightText', text: ['খুচরা মূল্য', 'মার্জিন %'], note: 'Retail price and margin columns' },
        { kind: 'clickText', text: ['পিডিএফ', 'এক্সেল'], note: 'Export the inventory report' },
    ],
    categories: [
        { kind: 'highlightText', text: ['ক্যাটাগরি ব্যবস্থাপনা'], note: 'Category management header' },
        { kind: 'fill', selector: 'input[placeholder="ক্যাটাগরি খুঁজুন..."]', value: SAMPLE_VALUES.category, note: 'Search categories' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Category list with image and description' },
        { kind: 'highlight', selector: 'button:has-text("ক্যাটাগরি যোগ করুন")', note: 'Add category button' },
    ],
    brands: [
        { kind: 'highlightText', text: ['ব্র্যান্ড ব্যবস্থাপনা'], note: 'Brand management header' },
        { kind: 'fill', selector: 'input[placeholder="ব্র্যান্ড খুঁজুন..."]', value: SAMPLE_VALUES.search, note: 'Search brands' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Brand list' },
        { kind: 'highlight', selector: 'button:has-text("ব্র্যান্ড যোগ করুন")', note: 'Add brand button' },
    ],
    'product-variants': [
        { kind: 'highlightText', text: ['নতুন পণ্য তৈরি করুন'], note: 'Add product page' },
        { kind: 'fill', selector: 'input[name="product_name"]', value: SAMPLE_VALUES.productName, note: 'Product name' },
        { kind: 'highlightText', text: ['সাধারণ পণ্য', 'সাইজ / রং / মডেল পণ্য'], note: 'Simple vs variant product type' },
        { kind: 'highlightText', text: ['ওয়ারেন্টি আছে', 'সিরিয়াল নম্বর'], note: 'Warranty and serial tracking toggles' },
        { kind: 'highlightText', text: ['ব্যাচ/লট ট্র্যাক করুন', 'মেয়াদ শেষের তারিখ ট্র্যাক করুন'], note: 'Batch and expiry tracking toggles' },
    ],
    'stock-adjustment': [
        { kind: 'highlightText', text: ['পণ্য সিলেক্ট করুন'], note: 'Select products to adjust' },
        { kind: 'highlight', selector: 'input[placeholder*="বারকোড স্ক্যান করুন"]', note: 'Barcode or product search' },
        { kind: 'highlightText', text: ['Enter Difference'], note: 'Enter quantity difference' },
        { kind: 'highlightText', text: ['Keep Reason'], note: 'Select adjustment reason' },
    ],
    'stock-count': [
        { kind: 'highlightText', text: ['স্টক কাউন্ট'], note: 'Stock count page' },
        { kind: 'fill', selector: 'input[placeholder*="কাউন্ট টাইটল বা নোট"]', value: SAMPLE_VALUES.note, note: 'Count session title' },
        { kind: 'highlight', selector: 'button:has-text("কাউন্ট সেশন তৈরি")', note: 'Create count session' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'System qty vs counted qty and variance' },
        { kind: 'highlightText', text: ['সাম্প্রতিক কাউন্ট সেশন'], note: 'Recent count sessions' },
    ],
    'stock-transfer': [
        { kind: 'highlightText', text: ['স্টক ট্রান্সফার'], note: 'Stock transfer page' },
        { kind: 'highlightText', text: ['যে দোকান থেকে যাবে', 'যে দোকানে যাবে'], note: 'Source and destination store' },
        { kind: 'fill', selector: 'input[placeholder*="নাম বা এসকেই দিয়ে পণ্য খুঁজুন"]', value: SAMPLE_VALUES.search, note: 'Search product to transfer' },
        { kind: 'highlight', selector: 'button:has-text("ট্রান্সফার তৈরি করুন")', note: 'Create transfer button' },
        { kind: 'highlightText', text: ['ইতিহাস'], note: 'Transfer history tab' },
    ],
    'bulk-import': [
        { kind: 'highlightText', text: ['বাল্ক আমদানি'], note: 'Bulk import page' },
        { kind: 'highlight', selector: 'button:has-text("সর্বশেষ টেমপ্লেট ডাউনলোড করুন")', note: 'Download latest Excel template' },
        { kind: 'highlightText', text: ['ইমপোর্টের নিয়ম'], note: 'Import rules and column guide' },
        { kind: 'highlightText', text: ['Excel ফাইল এখানে ছেড়ে দিন'], note: 'Upload completed Excel file' },
    ],
    payroll: [
        { kind: 'highlightText', text: ['বেতন'], note: 'Payroll page header' },
        { kind: 'highlightText', text: ['সাইকেলসমূহ'], note: 'Payroll cycles list' },
        { kind: 'highlight', selector: 'button:has-text("নতুন সাইকেল")', note: 'Create new payroll cycle' },
        { kind: 'highlightText', text: ['বিস্তারিত দেখতে একটি সাইকেল সিলেক্ট করুন'], note: 'Select a cycle for details' },
    ],
    'salary-advance': [
        { kind: 'highlightText', text: ['বেতন অগ্রিম'], note: 'Salary advance page' },
        { kind: 'highlight', selector: 'button:has-text("নতুন অনুরোধ")', note: 'New advance request' },
        { kind: 'highlightText', text: ['pending', 'approved', 'settled', 'rejected'], note: 'Advance status filters' },
    ],
    'festival-bonus': [
        { kind: 'highlightText', text: ['উৎসব বোনাস'], note: 'Festival bonus page' },
        { kind: 'highlightText', text: ['রানসমূহ'], note: 'Bonus runs list' },
        { kind: 'highlight', selector: 'button:has-text("নতুন রান")', note: 'Create new bonus run' },
    ],
    'leave-shifts-documents': [
        { kind: 'highlightText', text: ['ছুটি ব্যবস্থাপনা'], note: 'Leave management page' },
        { kind: 'highlightText', text: ['অনুরোধসমূহ', 'ছুটির তালিকা'], note: 'Leave requests and holiday list tabs' },
        { kind: 'highlightText', text: ['pending', 'approved', 'rejected'], note: 'Leave status filters' },
        { kind: 'highlight', selector: 'button:has-text("নতুন অনুরোধ")', note: 'New leave request' },
    ],
    'low-stock-alerts': [
        { kind: 'highlightText', text: ['কম স্টক রিপোর্ট'], note: 'Low stock report header' },
        { kind: 'fill', selector: 'input[placeholder*="Search product name, SKU"]', value: SAMPLE_VALUES.search, note: 'Search product or SKU' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Stock status, urgency and estimated cost' },
        { kind: 'highlight', selector: 'button:has-text("Reorder")', note: 'Reorder action' },
    ],
    'barcode-scanner': [
        { kind: 'highlightText', text: ['পণ্য সিলেক্ট করুন'], note: 'POS product list' },
        { kind: 'highlight', selector: 'input[placeholder*="বারকোড স্ক্যান করুন"]', note: 'Barcode scan box' },
        { kind: 'highlightText', text: ['ক্যাটাগরি', 'ব্র্যান্ড'], note: 'Category and brand quick filters' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Cart with item, quantity, rate and tax' },
    ],
    'payment-methods': [
        { kind: 'highlightText', text: ['বিল প্রদানকারী'], note: 'Billing customer section' },
        { kind: 'highlightText', text: ['ক্যাশ', 'bKash', 'Nagad', 'Rocket', 'Upay'], note: 'Cash and MFS payment options' },
        { kind: 'highlightText', text: ['ব্যাংক ট্রান্সফার', 'Split', 'Due'], note: 'Bank transfer, split and due payment' },
        { kind: 'highlight', selector: 'button:has-text("অর্ডার নিশ্চিত করুন"), button:has-text("অর্ডার নিশ্চিত করে রসিদ প্রিন্ট")', note: 'Confirm order and print receipt' },
    ],
    'discounts-coupons': [
        { kind: 'highlightText', text: ['কুপন'], note: 'Coupon list page' },
        { kind: 'highlight', selector: 'button:has-text("কুপন যোগ করুন")', note: 'Add coupon button' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Coupon code, discount value, usage and expiry' },
    ],
    'end-of-day': [
        { kind: 'highlightText', text: ['ক্যাশ ও কাউন্টার ক্লোজিং'], note: 'Cash and counter closing page' },
        { kind: 'highlightText', text: ['শুরুর ক্যাশ', 'ক্যাশ বিক্রি', 'বাকি আদায়'], note: 'Opening cash, cash sales and due collection' },
        { kind: 'highlightText', text: ['ক্যাশ খরচ', 'সাপ্লায়ার পেমেন্ট'], note: 'Cash expense and supplier payment' },
        { kind: 'fill', selector: 'input[type="number"]', value: SAMPLE_VALUES.amount, note: 'Enter counted cash amount' },
        { kind: 'highlight', selector: 'button:has-text("ক্লোজিং সাবমিট")', note: 'Submit closing button' },
    ],
    'customer-dues': [
        { kind: 'highlightText', text: ['কাস্টমারের বাকি রিপোর্ট'], note: 'Customer dues report' },
        { kind: 'fill', selector: 'input[placeholder*="কাস্টমারের নাম বা ফোন দিয়ে খুঁজুন"]', value: SAMPLE_VALUES.name, note: 'Search customer by name or phone' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Total due, paid, days overdue and status' },
        { kind: 'highlightText', text: ['প্রতিশ্রুতি / ফলোআপ'], note: 'Promise and follow-up column' },
    ],
    loyalty: [
        { kind: 'highlightText', text: ['কাস্টমার'], note: 'Customer list page' },
        { kind: 'fill', selector: 'input[placeholder*="নাম, ইমেইল, ফোন দিয়ে কাস্টমার খুঁজুন"]', value: SAMPLE_VALUES.name, note: 'Search customer' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Membership, loyalty points and balance columns' },
        { kind: 'highlight', selector: 'button:has-text("কাস্টমার যোগ করুন")', note: 'Add customer button' },
    ],
    returns: [
        { kind: 'highlightText', text: ['অর্ডার রিটার্ন রিপোর্ট'], note: 'Order returns report' },
        { kind: 'fill', selector: 'input[placeholder*="রিটার্ন নং, ইনভয়েস, কাস্টমার খুঁজুন"]', value: SAMPLE_VALUES.search, note: 'Search return by invoice or customer' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Return type, quantity, refund total and status' },
    ],
    'supplier-360': [
        { kind: 'highlightText', text: ['সাপ্লায়ার'], note: 'Supplier list page' },
        { kind: 'fill', selector: 'input[placeholder*="নাম, ইমেইল, ফোন দিয়ে সাপ্লায়ার খুঁজুন"]', value: SAMPLE_VALUES.name, note: 'Search supplier' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Supplier type, phone, address and status' },
        { kind: 'highlight', selector: 'button:has-text("সাপ্লায়ার যোগ করুন")', note: 'Add supplier button' },
    ],
    'add-supplier': [
        { kind: 'highlightText', text: ['নতুন সাপ্লায়ার যোগ করুন'], note: 'Add supplier page' },
        { kind: 'fill', selector: 'input[name="name"]', value: SAMPLE_VALUES.name, note: 'Supplier name' },
        { kind: 'fill', selector: 'input[name="phone"]', value: SAMPLE_VALUES.phone, note: 'Supplier phone' },
        { kind: 'fill', selector: 'textarea[name="address"], input[name="address"]', value: SAMPLE_VALUES.address, note: 'Supplier address' },
        { kind: 'highlightText', text: ['পেমেন্ট তথ্য', 'ব্যবসায়িক তথ্য'], note: 'Payment terms and business info sections' },
    ],
    'receive-goods': [
        { kind: 'highlightText', text: ['ক্রয়'], note: 'Purchases page' },
        { kind: 'highlightText', text: ['ড্রাফট', 'ক্রয় আদেশ', 'গৃহীত', 'পেমেন্ট বাকি'], note: 'Draft, ordered, received and due tabs' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Supplier, product, total and payment status' },
    ],
    'customer-analytics': [
        { kind: 'highlightText', text: ['সিআরএম ড্যাশবোর্ড'], note: 'CRM dashboard' },
        { kind: 'highlightText', text: ['সব কাস্টমার', 'বাকি কাস্টমার'], note: 'All customers and due customers cards' },
        { kind: 'highlightText', text: ['ভিআইপি / লয়্যাল', 'জন্মদিন'], note: 'VIP loyal and birthday segments' },
        { kind: 'highlightText', text: ['ওপেন ফলো-আপ'], note: 'Open follow-up list' },
    ],
    expenses: [
        { kind: 'highlightText', text: ['খরচ'], note: 'Expenses page' },
        { kind: 'fill', selector: 'input[placeholder*="ব্যয় খুঁজুন"]', value: SAMPLE_VALUES.search, note: 'Search expenses' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Title, category, amount and payment method' },
        { kind: 'highlight', selector: 'button:has-text("খরচ যোগ করুন")', note: 'Add expense button' },
    ],
    'profit-loss': [
        { kind: 'highlightText', text: ['আয়-ব্যয় বিবরণী'], note: 'Profit and loss statement' },
        { kind: 'highlightText', text: ['আয়ের বিবরণ'], note: 'Income breakdown' },
        { kind: 'highlightText', text: ['ব্যয়ের বিবরণ'], note: 'Expense breakdown' },
        { kind: 'clickText', text: ['প্রয়োগ করুন'], note: 'Apply date range' },
    ],
    'ledger-journal': [
        { kind: 'highlightText', text: ['জার্নাল লেজার'], note: 'Journal ledger page' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Date, description, debit and credit columns' },
        { kind: 'clickText', text: ['পিডিএফ'], note: 'Export journal' },
    ],
    accounting: [
        { kind: 'highlightText', text: ['ক্যাশ বই'], note: 'Cash book page' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Date, description, cash-in and cash-out columns' },
        { kind: 'highlight', selector: 'button:has-text("রিফ্রেশ")', note: 'Refresh cash book' },
    ],
    'bank-cash-income': [
        { kind: 'highlightText', text: ['ক্যাশ বই'], note: 'Cash book and bank workspace' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Cash income and cash expense entries' },
        { kind: 'clickText', text: ['প্রিন্ট', 'পিডিএফ'], note: 'Print or export cash book' },
    ],
    'balance-trial-cashflow': [
        { kind: 'highlightText', text: ['ব্যালেন্স শিট'], note: 'Balance sheet page' },
        { kind: 'highlight', selector: 'input[type="date"]', note: 'As-of date filter' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Assets, liabilities and capital rows' },
        { kind: 'clickText', text: ['প্রয়োগ করুন'], note: 'Apply date filter' },
    ],
    'cash-drawer-history': [
        { kind: 'highlightText', text: ['ক্যাশ ড্রয়ার হিস্ট্রি'], note: 'Cash drawer history page' },
        { kind: 'highlightText', text: ['ড্রয়ার ব্যালেন্স'], note: 'Drawer balance per session' },
        { kind: 'highlightText', text: ['শুরুর নগদ', 'ড্রয়ার বন্ধ করুন'], note: 'Opening and closing timestamps' },
        { kind: 'highlightText', text: ['গণনা করা নগদ পরিমাণ'], note: 'Counted cash amount and variance' },
    ],
    'sales-reports': [
        { kind: 'highlightText', text: ['বিক্রয় রিপোর্ট'], note: 'Sales report page' },
        { kind: 'fill', selector: 'input[placeholder*="ইনভয়েস, কাস্টমার খুঁজুন"]', value: SAMPLE_VALUES.search, note: 'Search invoice or customer' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Subtotal, tax, discount, total and status' },
        { kind: 'clickText', text: ['ফিল্টার'], note: 'Open sales report filters' },
    ],
    'financial-reports': [
        { kind: 'highlightText', text: ['লাভ ও ক্ষতি'], note: 'Financial reports page' },
        { kind: 'highlightText', text: ['আয়ের বিস্তারিত'], note: 'Income detail section' },
        { kind: 'highlightText', text: ['খরচ ও ব্যয়'], note: 'Expense and cost section' },
        { kind: 'clickText', text: ['এই মাস'], note: 'Change reporting period' },
    ],
    'custom-reports': [
        { kind: 'highlightText', text: ['কাস্টম রিপোর্ট'], note: 'Custom reports page' },
        { kind: 'highlight', selector: 'button:has-text("কাস্টম রিপোর্ট যোগ করুন")', note: 'Add custom report button' },
    ],
    'dashboard-widgets': [
        { kind: 'highlightText', text: ['ড্যাশবোর্ড উইজেট'], note: 'Dashboard widgets page' },
        { kind: 'highlightText', text: ['উইজেট পুনর্বিন্যাস করতে টানুন'], note: 'Drag to reorder widgets' },
        { kind: 'highlight', selector: 'button:has-text("লেআউট সংরক্ষণ করুন")', note: 'Save layout button' },
    ],
    'scheduled-reports': [
        { kind: 'highlightText', text: ['শিডিউল্ড রিপোর্ট'], note: 'Scheduled reports page' },
        { kind: 'highlight', selector: 'button:has-text("শিডিউল্ড রিপোর্ট যোগ করুন")', note: 'Add scheduled report button' },
    ],
    'branch-benchmarking': [
        { kind: 'highlightText', text: ['ব্রাঞ্চ বেঞ্চমার্কিং'], note: 'Branch benchmarking page' },
        { kind: 'highlightText', text: ['শুরুর তারিখ', 'শেষ তারিখ'], note: 'Start and end date filters' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Branch, sales, orders and rank columns' },
        { kind: 'clickText', text: ['প্রয়োগ করুন'], note: 'Apply date range' },
    ],
    'ai-insights': [
        { kind: 'highlightText', text: ['স্মার্ট সারসংক্ষেপ'], note: 'AI smart summary page' },
        { kind: 'highlightText', text: ['দৈনিক', 'সাপ্তাহিক'], note: 'Daily and weekly toggle' },
        { kind: 'highlightText', text: ['রাজস্ব', 'মোট অর্ডার', 'নতুন কাস্টমার'], note: 'Revenue, orders and new customers' },
    ],
    'operations-reports': [
        { kind: 'highlightText', text: ['পেমেন্ট মোড সামারি রিপোর্ট'], note: 'Payment mode summary report' },
        { kind: 'fill', selector: 'input[placeholder="অনুসন্ধান"]', value: SAMPLE_VALUES.search, note: 'Search payment records' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Store, source, payment mode and amount' },
    ],
    'ecommerce-orders': [
        { kind: 'highlightText', text: ['ইকমার্স অর্ডার'], note: 'Ecommerce orders page' },
        { kind: 'fill', selector: 'input[placeholder*="অর্ডার নম্বর, আইডি, কাস্টমার"]', value: SAMPLE_VALUES.search, note: 'Search order' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Order number, status, source and payment status' },
        { kind: 'highlight', selector: 'button:has-text("অনলাইন অর্ডার তৈরি করুন")', note: 'Create online order button' },
    ],
    'courier-setup': [
        { kind: 'highlightText', text: ['স্টোর ইকমার্স স্ট্যাটাস'], note: 'Store ecommerce status' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Store, ecommerce order and product columns' },
        { kind: 'highlightText', text: ['স্টোর স্ট্যাটাস'], note: 'Store status column' },
    ],
    'online-overview': [
        { kind: 'highlightText', text: ['স্টোর ইকমার্স স্ট্যাটাস'], note: 'Online store overview' },
        { kind: 'highlightText', text: ['ইকমার্স কার্ট', 'ইকমার্স উইশলিস্ট'], note: 'Ecommerce cart and wishlist records' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Ecommerce product and visible product counts' },
    ],
    'ecommerce-products': [
        { kind: 'highlightText', text: ['ইকমার্স পণ্য'], note: 'Ecommerce products page' },
        { kind: 'fill', selector: 'input[placeholder*="ইকমার্স পণ্য খুঁজুন"]', value: SAMPLE_VALUES.search, note: 'Search ecommerce products' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Visibility and online readiness columns' },
        { kind: 'highlightText', text: ['দৃশ্যমান করুন', 'লুকান'], note: 'Show or hide product online' },
    ],
    'cod-reconciliation': [
        { kind: 'highlightText', text: ['COD রিকনসিলিয়েশন'], note: 'COD reconciliation page' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Delivered, paid, unsettled and return COD columns' },
        { kind: 'highlight', selector: 'button:has-text("রিফ্রেশ")', note: 'Refresh COD data' },
    ],
    'ecommerce-marketing': [
        { kind: 'highlightText', text: ['মার্কেটিং ও পিক্সেল'], note: 'Marketing and pixel settings' },
        { kind: 'fill', selector: 'input[placeholder*="numeric Pixel ID"], input[name*="pixel" i]', value: '000000000000000', note: 'Meta Pixel ID' },
        { kind: 'highlightText', text: ['স্টোর পেজ শেয়ার প্রিভিউ'], note: 'Store page share preview' },
        { kind: 'highlight', selector: 'button:has-text("মার্কেটিং সেটিংস সেভ করুন")', note: 'Save marketing settings' },
    ],
    'fiscal-compliance': [
        { kind: 'highlightText', text: ['ফিসকাল কমপ্লায়েন্স'], note: 'Fiscal compliance center' },
        { kind: 'highlightText', text: ['হ্যাশ চেইন যাচাই'], note: 'Hash chain verification' },
        { kind: 'highlightText', text: ['ফিসকাল ডিভাইস নিবন্ধন'], note: 'Fiscal device registration' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'VAT period, VAT amount and status' },
    ],
    'bd-vat-workspace': [
        { kind: 'highlight', selector: 'main, section, body', note: 'BD VAT workspace (route currently returns 404 on production - verify path before recording)' },
    ],
    'audit-activity': [
        { kind: 'highlightText', text: ['ভয়েড / বাতিল / মুছে ফেলা অডিট রিপোর্ট'], note: 'Void/cancel/delete audit report' },
        { kind: 'fill', selector: 'input[placeholder="অনুসন্ধান"]', value: SAMPLE_VALUES.search, note: 'Search audit entries' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'User, action, entity and IP address' },
    ],
    'audit-logs-security': [
        { kind: 'highlightText', text: ['অডিট লগ'], note: 'Audit logs page' },
        { kind: 'fill', selector: 'input[placeholder*="এনটিটি ধরন দিয়ে ফিল্টার"]', value: SAMPLE_VALUES.search, note: 'Filter by entity type' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Action, entity, actor, before and after values' },
    ],
    'company-compliance-calendar': [
        { kind: 'highlightText', text: ['কমপ্লায়েন্স ক্যালেন্ডার'], note: 'Compliance calendar page' },
        { kind: 'highlightText', text: ['আসন্ন কাজ'], note: 'Upcoming compliance tasks' },
        { kind: 'highlight', selector: 'button:has-text("রিমাইন্ডার যোগ করুন")', note: 'Add reminder button' },
    ],
    'notifications-feedback-export': [
        { kind: 'highlightText', text: ['বিজ্ঞপ্তি'], note: 'Notifications page' },
        { kind: 'highlightText', text: ['ঘোষণা পাঠান'], note: 'Send announcement' },
        { kind: 'highlightText', text: ['অপঠিত', 'পঠিত', 'Mark All Read'], note: 'Unread, read and mark-all-read filters' },
    ],
    'renew-plan': [
        { kind: 'highlightText', text: ['বর্তমান প্যাকেজ'], note: 'Current package status' },
        { kind: 'highlight', selector: 'select[name*="package" i], [name*="billing" i]', note: 'Select package and billing cycle' },
        { kind: 'highlightText', text: ['ভেরিফিকেশনের জন্য পেমেন্ট জমা দিন'], note: 'Submit payment for verification' },
        { kind: 'fill', selector: 'input[name*="transaction" i]', value: 'TRX-TRAINING-0001', note: 'Transaction ID' },
    ],
    'payment-verification': [
        { kind: 'highlightText', text: ['ভেরিফিকেশনের জন্য পেমেন্ট জমা দিন'], note: 'Payment verification form' },
        { kind: 'fill', selector: 'input[name*="sender" i], input[name*="account" i]', value: SAMPLE_VALUES.phone, note: 'Sender or account number' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Transaction history and admin note' },
        { kind: 'highlightText', text: ['ট্রানজেকশন ইতিহাস'], note: 'Transaction history section' },
    ],
    'upgrade-plan': [
        { kind: 'highlightText', text: ['সহজ, স্বচ্ছ মূল্য নির্ধারণ'], note: 'Pricing page' },
        { kind: 'highlightText', text: ['মাসিক', 'বার্ষিক'], note: 'Monthly vs yearly billing toggle' },
        { kind: 'highlight', selector: 'table, [role="table"]', note: 'Plan comparison table' },
        { kind: 'highlight', selector: 'button:has-text("প্ল্যান বেছে নিন")', note: 'Choose plan button' },
    ],
    'payment-settings': [
        { kind: 'highlightText', text: ['চেকআউট সেটআপ'], note: 'Checkout setup section' },
        { kind: 'highlightText', text: ['পেমেন্ট পদ্ধতি'], note: 'Payment method options' },
        { kind: 'highlightText', text: ['MFS অ্যাকাউন্ট'], note: 'bKash/Nagad/Rocket/Upay numbers' },
        { kind: 'highlightText', text: ['মুদ্রা', 'পেমেন্ট অবস্থা'], note: 'Currency and payment status settings' },
        { kind: 'highlight', selector: 'button:has-text("সেটিংস সেভ করুন")', note: 'Save settings button' },
    ],
    'invoice-customize': [
        { kind: 'highlightText', text: ['ট্যাক্স ও ইনভয়েস সেটিংস'], note: 'Tax and invoice settings section' },
        { kind: 'fill', selector: 'input[name="receipt_header"]', value: SAMPLE_VALUES.storeName, note: 'Receipt header text' },
        { kind: 'fill', selector: 'input[name="invoice_prefix"]', value: 'INV', note: 'Invoice prefix' },
        { kind: 'fill', selector: 'textarea[name="invoice_footer"], input[name="invoice_footer"]', value: 'ধন্যবাদ, আবার আসবেন', note: 'Invoice footer message' },
    ],
    'return-policies': [
        { kind: 'highlightText', text: ['বিক্রয়ের পর'], note: 'Post-sale settings section' },
        { kind: 'highlightText', text: ['ওয়ারেন্টি প্রকার'], note: 'Warranty type options' },
        { kind: 'highlightText', text: ['ফেরতের কারণ'], note: 'Return reason options' },
        { kind: 'highlight', selector: 'button:has-text("সেটিংস সেভ করুন")', note: 'Save settings button' },
    ],
    'store-defaults': [
        { kind: 'highlightText', text: ['স্টোরের তথ্য'], note: 'Store information section' },
        { kind: 'fill', selector: 'input[name="store_name"]', value: SAMPLE_VALUES.storeName, note: 'Store name' },
        { kind: 'fill', selector: 'input[name="store_contact"]', value: SAMPLE_VALUES.phone, note: 'Store contact number' },
        { kind: 'fill', selector: 'textarea[name="store_address"]', value: SAMPLE_VALUES.address, note: 'Full store address' },
        { kind: 'highlightText', text: ['যোগাযোগের বিবরণ', 'অনলাইন উপস্থিতি'], note: 'Contact details and online presence' },
    ],
};

function getLessonStoryboard(lesson) {
    if (LESSON_STORYBOARDS[lesson.id]) return LESSON_STORYBOARDS[lesson.id];

    const pathName = lesson.path || '';
    const haystack = `${lesson.id} ${lesson.module} ${lesson.title} ${pathName}`.toLowerCase();
    const title = lesson.title;
    const opening = [{ kind: 'highlight', selector: 'main, form, section, body', note: `${title} screen` }];
    const tableFlow = [
        ...opening,
        { kind: 'smartFill', hints: ['search', 'filter', 'query'], sampleType: 'search', note: 'Search or filter area' },
        { kind: 'highlight', selector: 'table, [role="table"], [class*="table"], main', note: 'Data list' },
        { kind: 'highlightText', text: ['view', 'details', 'edit', 'দেখুন', 'সম্পাদনা'], note: 'Row actions' },
        { kind: 'scroll', y: 360, note: 'More records' },
    ];
    const formFlow = [
        ...opening,
        { kind: 'smartFill', hints: ['name', 'title'], sampleType: 'name', note: 'First input field' },
        { kind: 'smartFill', hints: ['category', 'type', 'status'], sampleType: 'category', note: 'Dropdown or selector' },
        { kind: 'smartFill', hints: ['amount', 'price', 'quantity'], sampleType: 'amount', note: 'Amount or number field' },
        { kind: 'smartFill', hints: ['note', 'description', 'remark'], sampleType: 'note', note: 'Notes or description' },
        { kind: 'submit', selector: 'button[type="submit"], button', note: 'Save the new product' },
    ];
    const reportFlow = [
        ...opening,
        { kind: 'highlightText', text: ['date', 'তারিখ', 'filter', 'ফিল্টার'], note: 'Date and filters' },
        { kind: 'smartFill', hints: ['branch', 'category', 'status'], sampleType: 'category', note: 'Filter controls' },
        { kind: 'highlight', selector: 'table, [role="table"], [class*="chart"], canvas, svg, main', note: 'Report result' },
        { kind: 'highlightText', text: ['export', 'pdf', 'excel', 'download', 'এক্সপোর্ট'], note: 'Export options' },
    ];
    const dashboardFlow = [
        ...opening,
        { kind: 'highlight', selector: '[class*="grid"], section, main', note: 'Summary cards' },
        { kind: 'highlight', selector: 'canvas, svg, [class*="chart"], section, main', note: 'Chart or trend' },
        { kind: 'scroll', y: 420, note: 'More insights' },
        { kind: 'highlight', selector: 'table, [role="table"], section, main', note: 'Detail area' },
    ];
    const ecommerceFlow = [
        ...opening,
        { kind: 'highlightText', text: ['store', 'status', 'ecommerce', 'online'], note: 'Online store status' },
        { kind: 'smartFill', hints: ['search', 'order', 'product'], sampleType: 'search', note: 'Orders or products' },
        { kind: 'highlightText', text: ['courier', 'কুরিয়ার', 'cod'], note: 'Courier or COD area' },
        { kind: 'highlight', selector: 'table, [role="table"], form, main', note: 'Operational list' },
    ];
    const hrFlow = [
        ...opening,
        { kind: 'smartFill', hints: ['employee', 'staff'], sampleType: 'category', note: 'Employee selector' },
        { kind: 'highlightText', text: ['date', 'shift', 'attendance', 'leave', 'তারিখ'], note: 'Date or shift area' },
        { kind: 'highlight', selector: 'table, [role="table"], form, main', note: 'HR records' },
        { kind: 'highlight', selector: 'button[type="submit"], button', note: 'Action button, not clicked' },
    ];
    const accountingFlow = [
        ...opening,
        { kind: 'smartFill', hints: ['account', 'bank', 'ledger'], sampleType: 'category', note: 'Account area' },
        { kind: 'highlightText', text: ['debit', 'credit', 'amount', 'balance', 'টাকা'], note: 'Amount columns' },
        { kind: 'highlight', selector: 'table, [role="table"], form, main', note: 'Accounting records' },
        { kind: 'highlightText', text: ['export', 'report', 'রিপোর্ট'], note: 'Report or export' },
    ];
    const stockFlow = [
        ...opening,
        { kind: 'smartFill', hints: ['quantity', 'qty'], sampleType: 'quantity', note: 'Stock quantity' },
        { kind: 'highlightText', text: ['adjustment', 'count', 'transfer', 'threshold'], note: 'Stock action' },
        { kind: 'highlight', selector: 'table, [role="table"], form, main', note: 'Stock records' },
        { kind: 'highlight', selector: 'button[type="submit"], button', note: 'Action button, not clicked' },
    ];
    const subscriptionFlow = [
        ...opening,
        { kind: 'highlightText', text: ['plan', 'package', 'প্যাকেজ'], note: 'Plan area' },
        { kind: 'highlightText', text: ['feature', 'ফিচার', 'included'], note: 'Included features' },
        { kind: 'highlightText', text: ['payment', 'renew', 'upgrade', 'পেমেন্ট'], note: 'Payment action' },
        { kind: 'highlight', selector: 'button, a[href], main', note: 'Next action, not submitted' },
    ];

    if (pathName.includes('/reports') || haystack.includes('report') || haystack.includes('analytics')) return reportFlow;
    if (pathName.includes('/analytics')) return dashboardFlow;
    if (pathName.includes('/ecommerce')) return ecommerceFlow;
    if (pathName.includes('/hr') || pathName.includes('/employees') || haystack.includes('payroll') || haystack.includes('attendance')) return hrFlow;
    if (pathName.includes('/accounting') || pathName.includes('/account/')) return accountingFlow;
    if (pathName.includes('/stock') || haystack.includes('stock') || haystack.includes('barcode') || haystack.includes('label')) return stockFlow;
    if (pathName.includes('/subscription') || pathName.includes('/pricing') || haystack.includes('renew') || haystack.includes('upgrade')) return subscriptionFlow;
    if (pathName.includes('/create') || pathName.includes('/edit') || haystack.includes('add') || haystack.includes('settings')) return formFlow;
    if (haystack.includes('dashboard') || pathName.includes('/business-os')) return dashboardFlow;
    return tableFlow;
}

const runMappedAction = async (page, action, stepNumber) => {
    if (!action) return null;

    if (String(action.kind || '').startsWith('label')) {
        const pointForLocator = async (locator, label) => {
            const box = await locator.boundingBox().catch(() => null);
            if (!box) return null;
            return {
                x: Math.round(box.x + Math.min(box.width / 2, 220)),
                y: Math.round(box.y + Math.min(box.height / 2, 44)),
                label,
            };
        };

        if (action.kind === 'labelChooseVariant') {
            const buttons = page.locator('[role="dialog"] button');
            const count = await buttons.count().catch(() => 0);
            for (let i = 0; i < count; i += 1) {
                const button = buttons.nth(i);
                if (!(await button.isVisible().catch(() => false))) continue;
                const text = await button.innerText().catch(() => '');
                if (!/স্টক|stock|ram|rom|color|৳/i.test(text) || /বাতিল|cancel|যোগ|add/i.test(text)) continue;
                const point = await pointForLocator(button, action.note || 'Select variant');
                if (point) await moveTrainingCursor(page, point, point.label, stepNumber);
                await button.click({ timeout: 5000 }).catch(() => null);
                await page.waitForTimeout(650);
                const plus = page.locator('[role="dialog"] button').filter({ hasText: /^\+$/ }).first();
                if (await plus.isVisible().catch(() => false)) {
                    const plusPoint = await pointForLocator(plus, 'Increase quantity');
                    if (plusPoint) await moveTrainingCursor(page, plusPoint, plusPoint.label, stepNumber);
                    await plus.click({ timeout: 3000 }).catch(() => null);
                    await page.waitForTimeout(450);
                }
                if (point) await pulseTrainingCursor(page, point);
                return point;
            }
        }

        if (action.kind === 'labelAddSelectedVariant') {
            let addButton = page.locator('[role="dialog"] button.bg-primary').last();
            if (!(await addButton.isVisible().catch(() => false))) {
                addButton = page.locator('[role="dialog"] button').filter({ hasText: /৳|Add|যোগ/i }).last();
            }
            if (await addButton.isVisible().catch(() => false)) {
                const point = await pointForLocator(addButton, action.note || 'Add product');
                if (point) await moveTrainingCursor(page, point, point.label, stepNumber);
                await addButton.click({ timeout: 5000 }).catch(() => null);
                if (point) await pulseTrainingCursor(page, point);
                await page.waitForTimeout(1800);
                await page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => null);
                return point;
            }
        }

        const point = await page.evaluate(async ({ kind, note }) => {
            const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
            const visible = (el) => {
                if (!el) return false;
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden' && style.display !== 'none';
            };
            const textOf = (el) => `${el?.innerText || el?.textContent || el?.getAttribute?.('placeholder') || el?.getAttribute?.('aria-label') || ''}`.replace(/\s+/g, ' ').trim();
            const all = (selector) => Array.from(document.querySelectorAll(selector)).filter(visible);
            const byText = (needles, selector = 'button,a,[role="button"],h1,h2,h3,h4,p,span,div,label,select,input') => {
                const terms = needles.map((item) => String(item).toLowerCase());
                return all(selector).find((el) => {
                    const text = textOf(el).toLowerCase();
                    return text && terms.some((term) => text.includes(term));
                });
            };
            const clearMarks = () => {
                document.querySelectorAll('[data-andgate-training-highlight]').forEach((node) => {
                    node.style.outline = '';
                    node.style.boxShadow = '';
                    node.removeAttribute('data-andgate-training-highlight');
                });
            };
            const mark = (el, label = note || 'Label step') => {
                if (!el || !visible(el)) return null;
                clearMarks();
                el.setAttribute('data-andgate-training-highlight', 'true');
                el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                el.style.outline = '4px solid rgba(231,146,55,.95)';
                el.style.outlineOffset = '4px';
                el.style.boxShadow = '0 0 0 10px rgba(231,146,55,.18)';
                const rect = el.getBoundingClientRect();
                return {
                    x: Math.round(rect.left + Math.min(rect.width / 2, 220)),
                    y: Math.round(rect.top + Math.min(rect.height / 2, 44)),
                    label,
                };
            };
            const click = async (el, delay = 850) => {
                const point = mark(el);
                el?.click?.();
                await sleep(delay);
                return point;
            };
            const setValue = (el, value) => {
                if (!el) return;
                el.focus();
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            };

            if (kind === 'labelSearchProduct') {
                const input = all('input').find((el) => /বারকোড|barcode|search|scan/i.test(textOf(el))) || all('input[type="text"]').at(0);
                const point = mark(input, 'Search or scan product');
                if (input) {
                    setValue(input, 'smart');
                    await sleep(1200);
                }
                return point;
            }

            if (kind === 'labelSelectFirstProduct') {
                const cards = all('[data-testid="pos-product-card"]').filter((el) => {
                    const rect = el.getBoundingClientRect();
                    return rect.width > 80 && rect.height > 80;
                });
                const namedCard = cards.find((el) => /smart|power|phone|cotton|tv/i.test(textOf(el)));
                const product = namedCard || cards[0] || byText(['smart tv', 'power bank', 'smartphone', 'premium cotton'], 'button,div,a,[role="button"]');
                const point = mark(product, 'Select product');
                product?.scrollIntoView?.({ block: 'center', inline: 'center' });
                await sleep(250);
                product?.click?.();
                await sleep(1600);
                return point;
            }

            if (kind === 'labelChooseVariant') {
                const modal = all('[role="dialog"], .fixed.inset-0').find((el) => /variant|ভ্যারিয়েন্ট|ভ্যারিয়েন্ট|স্টক|stock|৳/i.test(textOf(el)));
                const variant =
                    (modal ? Array.from(modal.querySelectorAll('button')).find((el) => /স্টক|stock|ram|rom|color|৳/i.test(textOf(el)) && !/বাতিল|cancel|add|যোগ|×/i.test(textOf(el))) : null) ||
                    byText(['ram:', 'rom:', 'color:', 'স্টক:', 'stock:', 'ওয়ারেন্টি', 'ওয়ারেন্টি'], 'button,div,[role="button"]');
                if (variant) {
                    const point = await click(variant, 750);
                    const plus = (modal ? Array.from(modal.querySelectorAll('button')).find((el) => textOf(el).trim() === '+') : null) || byText(['+'], 'button');
                    if (plus) {
                        mark(plus, 'Increase label quantity');
                        plus.click();
                        await sleep(500);
                    }
                    return point;
                }
                return mark(byText(['ভ্যারিয়েন্ট', 'variant'], 'h1,h2,h3,p,div'), 'Variant modal');
            }

            if (kind === 'labelAddSelectedVariant') {
                let add = null;
                for (let attempt = 0; attempt < 8; attempt += 1) {
                    const modal = all('[role="dialog"], .fixed.inset-0').find((el) => /variant|ভ্যারিয়েন্ট|ভ্যারিয়েন্ট|stock|স্টক|৳/i.test(textOf(el)));
                    const scope = modal || document;
                    const buttons = Array.from(scope.querySelectorAll('button')).filter((el) => !el.disabled && !/বাতিল|cancel|ডিলিট|delete|মুছুন|×/i.test(textOf(el)));
                    add =
                        buttons.find((el) => /যোগ করুন|add/i.test(textOf(el))) ||
                        buttons.find((el) => /৳|tk|price/i.test(textOf(el))) ||
                        null;
                    if (add) break;
                    await sleep(300);
                }
                const point = await click(add, 1800);
                const queue = all('main h3, main [class*="truncate"], main [class*="font-bold"]').find((el) => /smart|power|phone|cotton|tv|৳|sku/i.test(textOf(el)));
                return point || mark(queue || document.querySelector('main'), 'Label generator');
            }

            if (kind === 'labelToggleQrBarcode') {
                const qr = byText(['QR কোড', 'qr code'], 'button');
                if (qr) {
                    const point = await click(qr, 700);
                    const barcode = byText(['বারকোড', 'barcode'], 'button');
                    if (barcode) {
                        mark(barcode, 'Back to barcode');
                        await sleep(350);
                    }
                    return point;
                }
                return mark(byText(['বারকোড', 'QR'], 'button,div'), 'Barcode or QR type');
            }

            if (kind === 'labelOpenSettings') {
                const settings = byText(['সেটিংস', 'settings', 'দেখান'], 'button');
                return click(settings, 1000);
            }

            if (kind === 'labelPickCustomSize') {
                const custom = byText(['কাস্টম', 'custom'], 'button');
                const point = await click(custom, 700);
                const numericInputs = all('input[type="number"]');
                if (numericInputs[0]) setValue(numericInputs[0], '40');
                if (numericInputs[1]) setValue(numericInputs[1], '25');
                await sleep(500);
                return point || mark(numericInputs[0], 'Custom width and height');
            }

            if (kind === 'labelChangePaper') {
                const select = all('select').find((el) => textOf(el).toLowerCase().includes('thermal') || Array.from(el.options || []).some((o) => /a4|thermal|letter/i.test(o.textContent || '')));
                const point = mark(select, 'Paper size');
                if (select) {
                    select.value = Array.from(select.options).find((o) => /a4/i.test(o.textContent || ''))?.value || select.value;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    await sleep(700);
                }
                return point;
            }

            if (kind === 'labelShowLivePreview') {
                const preview =
                    all('main div').find((el) => /mm/i.test(textOf(el)) && el.querySelector('[style*="width"]')) ||
                    all('main div').find((el) => /mm/i.test(textOf(el)) && /border|shadow/.test(el.className || '')) ||
                    byText(['mm'], 'main div, main span');
                return mark(preview, 'Live preview');
            }

            if (kind === 'labelAdjustContentSettings') {
                const inputs = all('input[type="number"]');
                const copies = inputs.find((el) => {
                    const rect = el.getBoundingClientRect();
                    return Number(el.value || 0) >= 1 && rect.top > window.innerHeight * 0.35;
                }) || inputs.find((el) => Number(el.value || 0) >= 1) || inputs.at(0);
                const point = mark(copies, 'Copies per product');
                if (copies) setValue(copies, '3');
                const typeSelect = all('select').find((el) => Array.from(el.options || []).some((o) => /Code 128|EAN|UPC|Small|Medium|Large/i.test(o.textContent || '')));
                if (typeSelect) {
                    await sleep(350);
                    mark(typeSelect, 'Barcode or QR type');
                    const option = Array.from(typeSelect.options).find((o) => /EAN-13|Medium|Code 128/i.test(o.textContent || ''));
                    if (option) {
                        typeSelect.value = option.value;
                        typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
                const info = all('input[type="checkbox"]').at(0);
                if (info && !info.checked) info.click();
                await sleep(1000);
                return point || mark(typeSelect, 'Content settings');
            }

            if (kind === 'labelGenerateLabels') {
                const btn = byText(['লেবেল তৈরি করুন', 'generate labels'], 'button');
                const point = mark(btn, 'Generate labels');
                btn?.click?.();
                await sleep(4500);
                return point || mark(byText(['PDF', 'Print', 'প্রিন্ট'], 'button'), 'Generated labels');
            }

            return null;
        }, { kind: action.kind, note: action.note }).catch(() => null);

        if (point?.x && point?.y) {
            await moveTrainingCursor(page, point, action.note || point.label || `Step ${stepNumber}`, stepNumber);
            await pulseTrainingCursor(page, point);
            await page.waitForTimeout(450);
        }
        return point;
    }

    // Real per-keystroke typing and real dropdown selection happen on the
    // Node side via Playwright, so the recording shows an actual human-style
    // interaction instead of a value snapping into place.
    if (action.kind === 'fill') {
        const point = await highlightLocator(page, action.selector);
        if (!point) return null;
        await moveTrainingCursor(page, point, action.note || 'Type here', stepNumber);
        await pulseTrainingCursor(page, point);
        await humanType(page, action.selector, action.value || '');
        return point;
    }

    if (action.kind === 'fillAllPasswords') {
        const locator = page.locator('input[type="password"]');
        const count = await locator.count().catch(() => 0);
        let point = null;
        for (let i = 0; i < count; i += 1) {
            const single = locator.nth(i);
            if (!(await single.isVisible().catch(() => false))) continue;
            const box = await single
                .evaluate((el) => {
                    document.querySelectorAll('[data-andgate-training-highlight]').forEach((node) => {
                        node.style.outline = '';
                        node.style.boxShadow = '';
                        node.removeAttribute('data-andgate-training-highlight');
                    });
                    el.setAttribute('data-andgate-training-highlight', 'true');
                    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                    el.style.outline = '4px solid rgba(231,146,55,.95)';
                    el.style.outlineOffset = '4px';
                    el.style.boxShadow = '0 0 0 10px rgba(231,146,55,.18)';
                    const rect = el.getBoundingClientRect();
                    return { x: Math.round(rect.left + Math.min(rect.width / 2, 220)), y: Math.round(rect.top + Math.min(rect.height / 2, 44)) };
                })
                .catch(() => null);
            if (!box) continue;
            await moveTrainingCursor(page, box, action.note || 'Password field', stepNumber);
            await pulseTrainingCursor(page, box);
            await single.click({ timeout: 2000 }).catch(() => undefined);
            await single.pressSequentially(action.value || 'Demo12345', { delay: HUMAN_TYPE_DELAY_MS }).catch(async () => {
                await single.fill(action.value || 'Demo12345').catch(() => undefined);
            });
            point = box;
            await page.waitForTimeout(150);
        }
        return point;
    }

    if (action.kind === 'selectOption') {
        const point = await highlightLocator(page, action.selector);
        if (!point) return null;
        await moveTrainingCursor(page, point, action.note || 'Select option', stepNumber);
        await pulseTrainingCursor(page, point);
        await humanSelect(page, action.selector);
        return point;
    }

    // Real click on a tab/button found by text, e.g. switching a form to its
    // "Pricing" tab before the next step fills a field that lives there.
    if (action.kind === 'clickText') {
        const point = await discoverTextAndMark(page, action.text || [], action.scope);
        if (!point) return null;
        await moveTrainingCursor(page, point, action.note || 'Click here', stepNumber);
        await pulseTrainingCursor(page, point);
        await page
            .locator('[data-andgate-training-highlight="true"]')
            .first()
            .click({ timeout: 2000 })
            .catch(() => undefined);
        await page.waitForTimeout(400);
        return point;
    }

    // Generic form flows don't know exact selectors ahead of time, so they
    // discover the best matching field by keyword hints, then type into it
    // for real (or pick a real dropdown option if it turns out to be a select).
    if (action.kind === 'smartFill') {
        const point = await discoverAndMark(page, action.hints || []);
        if (!point) return null;
        await moveTrainingCursor(page, point, action.note || 'Fill this field', stepNumber);
        await pulseTrainingCursor(page, point);
        const marker = '[data-andgate-training-highlight="true"]';
        if (point.tag === 'select') {
            await humanSelect(page, marker);
        } else {
            await humanType(page, marker, SAMPLE_VALUES[action.sampleType] || action.value || SAMPLE_VALUES.category);
        }
        return point;
    }

    const result = await page.evaluate(async ({ action, stepNumber, allowSubmitActions }) => {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const visible = (el) => {
            if (!el) return false;
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        };
        const mark = (el, label = 'Target') => {
            if (!el || !visible(el)) return null;
            if (el === window.__andgateLastMarkedEl) {
                // Same element as the previous scene (both fell back to a
                // broad container like "main"). Force a visible nudge so the
                // recording still shows real motion instead of an identical,
                // frozen-looking frame.
                window.scrollBy({ top: 180, behavior: 'smooth' });
            }
            window.__andgateLastMarkedEl = el;
            document.querySelectorAll('[data-andgate-training-highlight]').forEach((node) => {
                node.style.outline = '';
                node.style.boxShadow = '';
                node.removeAttribute('data-andgate-training-highlight');
            });
            el.setAttribute('data-andgate-training-highlight', 'true');
            el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            el.style.outline = '4px solid rgba(231,146,55,.95)';
            el.style.outlineOffset = '4px';
            el.style.boxShadow = '0 0 0 10px rgba(231,146,55,.18)';
            const rect = el.getBoundingClientRect();
            return {
                x: Math.round(rect.left + Math.min(rect.width / 2, 220)),
                y: Math.round(rect.top + Math.min(rect.height / 2, 44)),
                label,
            };
        };
        const findText = (needles) => {
            const terms = needles.map((item) => String(item).toLowerCase());
            const selector = 'a,button,[role="button"],label,th,td,h1,h2,h3,h4,p,span,div,input,textarea,select';
            return Array.from(document.querySelectorAll(selector))
                .filter(visible)
                .find((el) => {
                    const text = `${el.innerText || el.textContent || el.getAttribute('placeholder') || el.getAttribute('aria-label') || ''}`.trim().toLowerCase();
                    return text && terms.some((term) => text.includes(term.toLowerCase()));
                });
        };

        // Prefer a real, visible, in-flow match over the first DOM hit —
        // otherwise a broad selector like "button" can land on an unrelated
        // fixed-position utility button (e.g. a floating scroll-to-top arrow)
        // instead of the actual in-form target.
        const el = (() => {
            const all = Array.from(document.querySelectorAll(action.selector));
            const inFlow = all.find((node) => {
                if (!visible(node)) return false;
                const position = window.getComputedStyle(node).position;
                return position !== 'fixed' && position !== 'sticky';
            });
            return inFlow || all.find(visible) || all[0] || null;
        })();
        if (action.kind === 'scroll') {
            window.scrollBy({ top: action.y || 360, behavior: 'smooth' });
            await sleep(350);
            return mark(document.querySelector('main, section, body'), `Scroll ${stepNumber}`);
        }
        if (action.kind === 'highlightText') {
            return mark(findText(action.text || []), action.note || `Step ${stepNumber}`);
        }
        if (action.kind === 'submit' && allowSubmitActions) {
            mark(el, action.note || `Submit ${stepNumber}`);
            el?.click?.();
            await sleep(1200);
            return mark(document.querySelector('main, form, body'), action.note || `Submit ${stepNumber}`);
        }
        if (action.kind === 'clickSafe') {
            const label = `${el?.innerText || el?.textContent || ''}`.toLowerCase();
            const type = `${el?.getAttribute?.('type') || ''}`.toLowerCase();
            if (el && type !== 'submit' && !/delete|remove|submit|save|confirm|approve|reject|pay|payment|login|register|সংরক্ষণ|জমা|ডিলিট|মুছুন/.test(label)) {
                el.click();
                await sleep(350);
            }
            return mark(el, action.note || `Click ${stepNumber}`);
        }
        return mark(el, action.note || `Step ${stepNumber}`);
    }, { action, stepNumber, allowSubmitActions: ALLOW_SUBMIT_ACTIONS }).catch(() => null);
    if (result?.x && result?.y) {
        await moveTrainingCursor(page, result, action.note || result.label || `Step ${stepNumber}`, stepNumber);
        if (['clickSafe', 'submit', 'highlightText'].includes(action.kind)) {
            await pulseTrainingCursor(page, result);
        }
    }
    return result;
};

const performSceneAction = async (page, lesson, scene, index) => {
    const actionIndex = Number.isInteger(scene.storyboardActionIndex) ? scene.storyboardActionIndex : index;
    const mapped = actionIndex >= 0 ? getLessonStoryboard(lesson)[actionIndex] || CRITICAL_LESSON_ACTIONS[lesson.id]?.[actionIndex] : null;
    const mappedAction = await runMappedAction(page, mapped, index + 1);
    if (mappedAction?.x && mappedAction?.y) {
        await moveTrainingCursor(page, mappedAction, mapped?.note || mappedAction.label || scene.screenAction || `Step ${index + 1}`, index + 1);
        await page.waitForTimeout(650);
        return mappedAction;
    }

    const text = `${lesson.id} ${lesson.title} ${scene.narration || ''} ${scene.screenAction || ''}`.toLowerCase();

    const action = await page.evaluate(async ({ text, index, demoEmail, demoPassword }) => {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const visible = (el) => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        };
        const mark = (el, label = 'Focus here') => {
            if (!el || !visible(el)) return false;
            if (el === window.__andgateLastMarkedEl) {
                window.scrollBy({ top: 180, behavior: 'smooth' });
            }
            window.__andgateLastMarkedEl = el;
            document.querySelectorAll('[data-andgate-training-highlight]').forEach((node) => {
                node.style.outline = '';
                node.style.boxShadow = '';
                node.removeAttribute('data-andgate-training-highlight');
            });
            el.setAttribute('data-andgate-training-highlight', 'true');
            el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            el.style.outline = '4px solid rgba(231,146,55,.95)';
            el.style.outlineOffset = '4px';
            el.style.boxShadow = '0 0 0 10px rgba(231,146,55,.18)';
            const rect = el.getBoundingClientRect();
            return {
                x: Math.round(rect.left + Math.min(rect.width / 2, 220)),
                y: Math.round(rect.top + Math.min(rect.height / 2, 40)),
                label,
            };
        };
        const setValue = (el, value) => {
            el.focus();
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        };
        const bySelector = (selector) => Array.from(document.querySelectorAll(selector)).filter(visible);
        const byText = (needles, selector = 'a,button,[role="button"],label,th,td,h1,h2,h3,h4,p,span,div') => {
            const lowered = needles.map((item) => item.toLowerCase());
            return Array.from(document.querySelectorAll(selector))
                .filter(visible)
                .find((el) => {
                    const value = (el.innerText || el.textContent || '').trim().toLowerCase();
                    return value && lowered.some((needle) => value.includes(needle));
                });
        };
        const safeClick = async (el) => {
            if (!el || !visible(el)) return false;
            const label = `${el.innerText || el.textContent || el.getAttribute('aria-label') || ''}`.toLowerCase();
            const type = `${el.getAttribute('type') || ''}`.toLowerCase();
            if (type === 'submit') return false;
            if (/delete|remove|submit|save|confirm|approve|reject|pay|payment|place order|complete|login|register|sign in|sign up|সংরক্ষণ|জমা|ডিলিট|মুছুন|অনুমোদন|রিজেক্ট/.test(label)) return false;
            mark(el, 'Click target');
            el.click();
            await sleep(450);
            return true;
        };

        if (location.pathname.startsWith('/register')) {
            const inputs = bySelector('input, textarea');
            const sample = {
                name: 'রহিম উদ্দিন',
                email: 'training@example.com',
                phone: '01710000000',
                password: 'Demo12345',
                store: 'Training Store',
            };
            for (const input of inputs) {
                const name = `${input.name || ''} ${input.id || ''} ${input.placeholder || ''}`.toLowerCase();
                if (/store/.test(name)) setValue(input, sample.store);
                else if (/name/.test(name)) setValue(input, sample.name);
                else if (/phone|mobile/.test(name)) setValue(input, sample.phone);
                else if (/email/.test(name)) setValue(input, sample.email);
                else if (/password_confirmation|confirm/.test(name)) setValue(input, sample.password);
                else if (/password/.test(name)) setValue(input, sample.password);
            }
            return mark(inputs[Math.min(index, Math.max(0, inputs.length - 1))] || document.querySelector('form') || document.body, 'Register form');
        }

        if (location.pathname.startsWith('/login')) {
            const email = document.querySelector('#Email, input[type="email"], input[name*="email" i]');
            const password = document.querySelector('#Password, input[type="password"], input[name*="password" i]');
            if (email) setValue(email, demoEmail);
            if (password) setValue(password, demoPassword);
            if (/remember|রিমেম্বার/.test(text)) {
                const remember = bySelector('input[type="checkbox"], [role="checkbox"]').at(0);
                return mark(remember || password || email || document.body, 'Remember login option');
            }
            return mark(index % 2 === 0 ? email : password || email || document.body, 'Login form');
        }

        const keywordGroups = [
            ['dashboard', 'ড্যাশবোর্ড', 'today', 'আজ', 'বিক্রয়'],
            ['store', 'দোকান', 'setting', 'সেটিংস'],
            ['product', 'পণ্য', 'stock', 'স্টক', 'barcode', 'বারকোড'],
            ['customer', 'গ্রাহক', 'due', 'বাকি'],
            ['supplier', 'সরবরাহকারী', 'purchase', 'ক্রয়'],
            ['report', 'রিপোর্ট', 'sales', 'বিক্রয়'],
            ['payment', 'পেমেন্ট', 'cash', 'ক্যাশ'],
            ['employee', 'কর্মী', 'attendance', 'হাজিরা'],
            ['subscription', 'package', 'plan'],
            ['ecommerce', 'courier', 'cod'],
        ];
        const needles = keywordGroups.find((group) => group.some((word) => text.includes(word))) || [];
        const candidate =
            byText(needles) ||
            bySelector('input:not([type="hidden"]), select, textarea').at(index % Math.max(1, bySelector('input:not([type="hidden"]), select, textarea').length)) ||
            bySelector('button:not([type="submit"]), a[href], [role="button"]').at(index % Math.max(1, bySelector('button:not([type="submit"]), a[href], [role="button"]').length)) ||
            document.querySelector('main, table, form, section, body');

        if (candidate?.matches?.('button:not([type="submit"]), a[href], [role="button"]')) {
            await safeClick(candidate);
        }
        return mark(candidate || document.body, needles[0] || 'Relevant area');
    }, { text, index, demoEmail: DEMO_EMAIL, demoPassword: DEMO_PASSWORD }).catch(() => null);

    if (action?.x && action?.y) {
        await moveTrainingCursor(page, action, action.label || scene.screenAction || `Step ${index + 1}`, index + 1);
        await page.waitForTimeout(650);
        return action;
    }
    await page.waitForTimeout(650);
    return null;
};

const recordLesson = async (browser, storageStatePath, lessonDir, lesson, scenes) => {
    const rawDir = path.join(lessonDir, 'raw');
    await fs.mkdir(rawDir, { recursive: true });
    const useAuthState = lesson.auth !== false;

    const context = await browser.newContext({
        viewport: VIEWPORT,
        ...(useAuthState ? { storageState: storageStatePath } : {}),
        recordVideo: { dir: rawDir, size: VIEWPORT },
    });
    const page = await context.newPage();
    let currentPath = '';
    const qaFindings = [];

    for (const [index, scene] of scenes.entries()) {
        if (scene.path !== currentPath) {
            await page.goto(`${BASE_URL}${scene.path}`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
            await waitForAppReady(page);
            await injectUrlOverlay(page);
            currentPath = scene.path;
        }

        const before = await captureContentScreenshot(page);
        const focusPoint = await performSceneAction(page, lesson, scene, index);
        if (!focusPoint) {
            await movePointer(page, index + 1);
        }
        await injectStepOverlay(page, scene, focusPoint);
        await sleep(scene.seconds * 1000);
        const after = await captureContentScreenshot(page);

        const changedFraction = await diffScreenshots(before, after);
        if (changedFraction < QA_MIN_CHANGE_FRACTION) {
            qaFindings.push({
                step: index + 1,
                screenAction: scene.screenAction || null,
                narration: (scene.narration || '').slice(0, 80),
                changedFraction: Number(changedFraction.toFixed(4)),
            });
        }
    }

    await context.close();

    if (qaFindings.length) {
        console.warn(`  QA: ${qaFindings.length} scene(s) in "${lesson.id}" showed no visible change (target likely not found/visible):`);
        qaFindings.forEach((finding) => console.warn(`    step ${finding.step} (${finding.screenAction || 'no note'}): ${(finding.changedFraction * 100).toFixed(2)}% changed`));
        if (STRICT_ACTION_QA) {
            throw new Error(`Lesson "${lesson.id}" has ${qaFindings.length} frozen scene(s); see action-qa.json. Set TRAINING_STRICT_ACTION_QA=false to allow.`);
        }
    }
    await fs.writeFile(path.join(lessonDir, 'action-qa.json'), JSON.stringify({ lessonId: lesson.id, findings: qaFindings }, null, 2));

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
    const body = {
        model: OPENAI_TTS_MODEL,
        voice: OPENAI_TTS_VOICE,
        input: text,
        instructions: OPENAI_TTS_INSTRUCTIONS,
        response_format: 'mp3',
    };
    if (OPENAI_TTS_SPEED !== null && Number.isFinite(OPENAI_TTS_SPEED)) {
        body.speed = OPENAI_TTS_SPEED;
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
            '-stream_loop',
            '-1',
            '-i',
            videoOnly,
            '-i',
            audioPath,
            '-map',
            '0:v:0',
            '-map',
            '1:a:0',
        ];
        if (BURN_SUBTITLES) args.push('-vf', vf);
        // EBU R128 loudness normalization so raw TTS output doesn't sound flat
        // or clip; -16 LUFS / -1.5dBTP is a standard target for narration.
        args.push('-af', 'loudnorm=I=-16:TP=-1.5:LRA=11');
        args.push(
            '-c:v',
            'libx264',
            '-c:a',
            'aac',
            '-shortest',
            '-pix_fmt',
            'yuv420p',
            finalPath,
        );
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
                storyboard: path.join(lessonDir, 'storyboard.json'),
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
            storyboard: path.join(lessonDir, 'storyboard.json'),
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
