'use client';

import MainLayout from '@/components/layouts/MainLayout';
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Download, Languages, Search, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'bn';

type GuideSection = {
    id: string;
    title: string;
    intro: string;
    image?: string;
    imageAlt?: string;
    gallery?: { title: string; image: string; imageAlt: string }[];
    steps: string[];
    checks?: string[];
};

const screenshots = {
    audit: '/assets/user-guide/current/desktop/audit-logs/audit-logs__audit-logs.png',
    businessOS: '/assets/user-guide/current/desktop/business-os/business-os__business-os.png',
    cashClosing: '/assets/user-guide/current/desktop/cash-closing/cash-closing__cash-closing.png',
    customerDue: '/assets/user-guide/current/desktop/customer/customers-due__customers__due.png',
    customerCrm: '/assets/user-guide/current/desktop/customer/customers-crm__customers__crm.png',
    dashboard: '/assets/user-guide/current/desktop/dashboard/dashboard__dashboard.png',
    ecommerce: '/assets/user-guide/current/desktop/ecommerce/ecommerce-orders__ecommerce__orders.png',
    hrAttendance: '/assets/user-guide/current/desktop/hr/hr-attendance__hr__attendance.png',
    label: '/assets/user-guide/current/desktop/label/label__label.png',
    pettyCash: '/assets/user-guide/current/desktop/petty-cash/petty-cash__petty-cash.png',
    pos: '/assets/user-guide/current/desktop/pos/pos__pos.png',
    products: '/assets/user-guide/current/desktop/product/products__products.png',
    productCreate: '/assets/user-guide/current/desktop/product/products-create__products__create.png',
    stockThresholds: '/assets/user-guide/current/desktop/product/products-thresholds__products__thresholds.png',
    purchase: '/assets/user-guide/current/desktop/purchase/purchases-create__purchases__create.png',
    supplierDue: '/assets/user-guide/current/desktop/supplier/suppliers-due__suppliers__due.png',
    supplierList: '/assets/user-guide/current/desktop/supplier/suppliers-list__suppliers__list.png',
    profitLoss: '/assets/user-guide/current/desktop/reports-profit-loss/reports-profit-loss__reports__profit-loss.png',
    serviceJobs: '/assets/user-guide/current/desktop/service-jobs/service-jobs__service-jobs.png',
    mobile: '/assets/user-guide/current/mobile/dashboard/dashboard__dashboard.png',
};

const copy: Record<
    Lang,
    {
        name: string;
        badge: string;
        title: string;
        subtitle: string;
        print: string;
        printHelp: string;
        toc: string;
        quickStart: string;
        learningPath: string;
        rolePath: string;
        screenshotNote: string;
        dailyRoutine: string;
        troubleshooting: string;
        sections: GuideSection[];
        learning: string[];
        roles: { title: string; items: string[] }[];
        routines: { title: string; items: string[] }[];
        problems: { title: string; fix: string }[];
    }
> = {
    en: {
        name: 'English',
        badge: 'Complete page and PDF-ready guide',
        title: 'AndgatePOS User Guide',
        subtitle:
            'A step-by-step operating guide for Bangladeshi SME business owners, shop managers, cashiers, inventory teams, accountants, ecommerce teams, and service staff.',
        print: 'Download PDF Guide',
        printHelp: 'Download the real PDF guide with selectable text and screenshots.',
        toc: 'Guide Menu',
        quickStart: 'First Sale in 15 Minutes',
        learningPath: 'Recommended Learning Path',
        rolePath: 'Learn by Staff Role',
        screenshotNote: 'Screenshots are included where a user needs visual confirmation before clicking.',
        dailyRoutine: 'Daily Business Routine',
        troubleshooting: 'Common Problems and Fixes',
        learning: [
            'Day 1: Login, language, store profile, staff roles, and dashboard.',
            'Day 2: Add products, variants, barcodes, stock, and supplier opening dues.',
            'Day 3: Practice POS sale, discount, coupon, return, due sale, and cash closing.',
            'Day 4: Learn purchases, Supplier 360, customer CRM, expenses, and reports.',
            'Day 5: Train staff on HR attendance, petty cash, ecommerce orders, courier, and audit logs.',
        ],
        roles: [
            { title: 'Owner or Manager', items: ['Dashboard', 'Business OS', 'Cash closing', 'Petty cash', 'Reports', 'Staff permissions'] },
            { title: 'Cashier', items: ['POS', 'Order details', 'Coupon', 'Payment split', 'Return', 'Receipt print'] },
            { title: 'Inventory Staff', items: ['Products', 'Variants', 'Barcode label', 'Stock movement', 'Purchases', 'Supplier 360'] },
            { title: 'Accounts Staff', items: ['Expense', 'Cash book', 'Supplier due', 'Customer due', 'Profit and loss', 'Tax reports'] },
            { title: 'Ecommerce or Delivery Team', items: ['Online orders', 'Courier setup', 'Pathao/Steadfast rules', 'Delivery status', 'Customer follow-up'] },
            { title: 'Service Team', items: ['Service jobs', 'Technician assignment', 'Repair status', 'Delivery and payment collection'] },
        ],
        routines: [
            { title: 'Before opening shop', items: ['Check low stock alerts.', 'Confirm opening cash.', 'Mark staff attendance.', 'Review pending orders and service jobs.'] },
            { title: 'During selling hour', items: ['Use POS for every sale.', 'Collect correct payment method.', 'Record due sales with customer name.', 'Use petty cash for small expenses only.'] },
            { title: 'Before closing shop', items: ['Complete cash and counter closing.', 'Match cash, bKash/Nagad, card, and due totals.', 'Review today sales and expenses.', 'Save or print closing report.'] },
            { title: 'Every week or month', items: ['Review profit and loss.', 'Pay supplier dues.', 'Follow customer dues.', 'Check dead stock and best sellers.', 'Export reports if needed.'] },
        ],
        problems: [
            { title: 'Login page keeps loading', fix: 'Reload once, then clear old browser cache if needed. Use latest app version after deployment.' },
            { title: 'Product not found in POS', fix: 'Check product status, stock, barcode, and selected store/warehouse.' },
            { title: 'Wrong stock quantity', fix: 'Review purchase receive, sale, return, transfer, and stock adjustment history.' },
            { title: 'Cash does not match', fix: 'Compare POS payments, petty cash, refunds, and manual cash book entries before final closing.' },
            { title: 'Bangla text not showing', fix: 'Change language from the top menu and refresh the page once.' },
        ],
        sections: [
            {
                id: 'login',
                title: '1. Login, Language, and Store Access',
                intro: 'Start here before training staff. Correct store access prevents wrong sales, wrong stock, and wrong reports.',
                image: screenshots.dashboard,
                imageAlt: 'AndgatePOS dashboard after login',
                gallery: [{ title: 'Mobile view', image: screenshots.mobile, imageAlt: 'AndgatePOS mobile dashboard' }],
                steps: [
                    'Open AndgatePOS in Chrome or your preferred browser.',
                    'Enter mobile/email and password, then sign in.',
                    'Select Bangla or English from the top language menu.',
                    'Confirm you are inside the correct store or branch.',
                    'If a staff member cannot see a menu, ask the owner/admin to update their role permission.',
                ],
                checks: ['Dashboard opens without reload loop.', 'Correct store name is visible.', 'Staff sees only allowed modules.'],
            },
            {
                id: 'setup',
                title: '2. Store Setup and Staff Permission',
                intro: 'Set shop identity, payment methods, invoice style, return rules, and staff access before live selling.',
                image: screenshots.dashboard,
                imageAlt: 'AndgatePOS dashboard overview',
                steps: [
                    'Go to Store Settings and enter business name, phone, address, VAT/BIN if applicable, and invoice footer.',
                    'Add payment methods such as cash, bKash, Nagad, Rocket, card, and bank.',
                    'Create staff users for cashier, inventory, accounts, ecommerce, and service roles.',
                    'Give only the permissions each staff needs. Cashier should not usually edit purchase price or accounting reports.',
                    'Create opening cash and opening stock before using the shop live.',
                ],
                checks: ['Invoice has correct shop information.', 'Payment methods appear in POS.', 'Staff login works from their own account.'],
            },
            {
                id: 'business-os',
                title: '3. Business OS, Cash Closing, Petty Cash, HR, and Service Jobs',
                intro: 'This is the daily operating area for Bangladeshi SME businesses. Owners get control, employees get clear tasks.',
                image: screenshots.dashboard,
                imageAlt: 'Business OS dashboard for daily operations',
                gallery: [
                    { title: 'Cash closing', image: screenshots.cashClosing, imageAlt: 'Cash closing screen' },
                    { title: 'Petty cash', image: screenshots.pettyCash, imageAlt: 'Petty cash screen' },
                    { title: 'HR attendance', image: screenshots.hrAttendance, imageAlt: 'HR attendance screen' },
                    { title: 'Service jobs', image: screenshots.serviceJobs, imageAlt: 'Service jobs screen' },
                ],
                steps: [
                    'Use Business OS to review daily tasks, counter status, cash movement, stock warnings, supplier/customer dues, and staff activity.',
                    'Use Cash and Counter Closing at the end of each shift. Employee can submit closing, owner/manager can review.',
                    'Use Petty Cash for small shop expenses like tea, transport, packaging, or small repairs.',
                    'Use HR Attendance for staff check-in, check-out, late, absent, leave, and overtime tracking.',
                    'Use Service Jobs for repair/service businesses. Create job, assign technician, update status, collect payment, then deliver.',
                ],
                checks: ['Every cash counter has a closing record.', 'Petty cash has reason and amount.', 'Attendance is not mixed with Business OS page if HR permission is separate.'],
            },
            {
                id: 'pos',
                title: '4. POS Sale, Discount, Coupon, Return, and Due Sale',
                intro: 'POS is the main cashier screen. Every sale should be recorded here so stock, cash, customer due, and reports stay correct.',
                image: screenshots.pos,
                imageAlt: 'AndgatePOS POS sales screen',
                steps: [
                    'Search product by name, SKU, or barcode.',
                    'Select variant such as size/color if the product has variants.',
                    'Enter quantity and confirm unit price.',
                    'Apply discount or coupon only when allowed by shop policy.',
                    'Select payment method: cash, bKash, Nagad, card, split payment, or due.',
                    'For due sale, select or create customer first, then save the sale.',
                    'Print or share invoice after payment.',
                    'For returns, find the original order, select returned item quantity, and confirm refund/payment adjustment.',
                ],
                checks: ['Subtotal, discount, and grand total match invoice.', 'Stock reduces after sale.', 'Customer due updates when sale is unpaid.'],
            },
            {
                id: 'products',
                title: '5. Products, Variants, Barcode Label, and Stock Alerts',
                intro: 'Clean product data makes POS faster and reports more reliable.',
                image: screenshots.productCreate,
                imageAlt: 'AndgatePOS product list',
                gallery: [
                    { title: 'Product list', image: screenshots.products, imageAlt: 'Product list screen' },
                    { title: 'Stock alert', image: screenshots.stockThresholds, imageAlt: 'Stock thresholds screen' },
                    { title: 'Barcode label', image: screenshots.label, imageAlt: 'Barcode label screen' },
                ],
                steps: [
                    'Create categories and brands first.',
                    'Add product name, SKU/barcode, purchase price, retail price, unit, tax, and opening stock.',
                    'For size/color products, add variants and keep separate stock for each variant.',
                    'Print barcode labels from the label module when barcode scanning is used.',
                    'Set reorder quantity so stock alert can warn before items run out.',
                    'Use stock adjustment only for damage, correction, or owner-approved changes.',
                ],
                checks: ['Product appears in POS.', 'Barcode scan finds correct item.', 'Low stock list is understandable for shop staff.'],
            },
            {
                id: 'purchase',
                title: '6. Purchase, Receive Stock, and Supplier 360',
                intro: 'Purchase flow controls supplier due, landed stock cost, and inventory quantity.',
                image: screenshots.purchase,
                imageAlt: 'AndgatePOS purchase creation screen',
                gallery: [
                    { title: 'Supplier list', image: screenshots.supplierList, imageAlt: 'Supplier list screen' },
                    { title: 'Supplier due', image: screenshots.supplierDue, imageAlt: 'Supplier due screen' },
                ],
                steps: [
                    'Create supplier with name, mobile, address, opening balance if any, and payment terms.',
                    'Create purchase with supplier, invoice number, date, product, quantity, purchase price, discount, tax, and transport cost if needed.',
                    'Receive stock after checking physical goods.',
                    'Record supplier payment when money is paid.',
                    'Open Supplier 360 to see supplier purchases, payments, dues, returns, and communication history in one place.',
                ],
                checks: ['Purchase receive increases stock.', 'Supplier due matches unpaid purchase.', 'Supplier ledger is ready before payment discussion.'],
            },
            {
                id: 'crm',
                title: '7. Customers, CRM, Loyalty, and Due Follow-up',
                intro: 'CRM helps owners keep regular customers, follow dues, and run local promotions.',
                image: screenshots.customerCrm,
                imageAlt: 'Customer CRM dashboard',
                steps: [
                    'Create customer with name, mobile, address, opening due if any, and customer type.',
                    'Use customer in POS for due sales, loyalty, warranty, service jobs, and repeat purchase tracking.',
                    'Use CRM dashboard to see active customers, inactive customers, due customers, and campaign targets.',
                    'Follow customer dues by amount and due date.',
                    'Use customer notes for preferences, promised payment date, or service history.',
                ],
                checks: ['Due customer list is current.', 'Customer purchase history is visible.', 'Promotions target the right customer group.'],
            },
            {
                id: 'accounts',
                title: '8. Expenses, Accounting, and Reports',
                intro: 'Daily sales alone do not show profit. Expenses, purchase cost, returns, tax, and dues must be reviewed together.',
                image: screenshots.profitLoss,
                imageAlt: 'Profit and loss report',
                steps: [
                    'Enter shop expenses such as rent, salary, electricity, internet, packaging, delivery cost, and maintenance.',
                    'Use cash book or journal entries only when needed by accounts staff.',
                    'Review sales report daily and profit/loss weekly or monthly.',
                    'Check tax report if VAT/tax is configured.',
                    'Export reports when owner, accountant, or auditor needs a copy.',
                ],
                checks: ['Expenses are categorized.', 'Profit/loss includes cost and expense.', 'Reports can be filtered by date and branch.'],
            },
            {
                id: 'ecommerce',
                title: '9. Ecommerce Orders and Courier',
                intro: 'For Facebook/website orders, keep order, customer, stock, delivery, and payment status together.',
                image: screenshots.ecommerce,
                imageAlt: 'Ecommerce orders screen',
                steps: [
                    'Create or import ecommerce order with customer name, mobile, address, product, delivery charge, and payment status.',
                    'Confirm stock before accepting delivery order.',
                    'Configure courier account details such as Pathao or other supported courier.',
                    'Update order status: pending, confirmed, packed, sent to courier, delivered, returned, or cancelled.',
                    'Review returned parcels and adjust stock/payment correctly.',
                ],
                checks: ['Customer mobile and address are complete.', 'Courier status is updated.', 'Returned order does not stay as completed sale.'],
            },
            {
                id: 'control',
                title: '10. Multi-store, Notifications, Audit, Backup, and Security',
                intro: 'These controls protect the business when more staff, counters, and branches use the system.',
                image: screenshots.audit,
                imageAlt: 'Audit logs for branch control',
                steps: [
                    'Use separate branches/stores when stock and cash are handled separately.',
                    'Give role-based permissions and review them monthly.',
                    'Check audit logs when price, stock, payment, or order changes need investigation.',
                    'Use notifications for low stock, due follow-up, pending purchase, and operational reminders.',
                    'Export important reports regularly for owner/accountant backup.',
                    'Change password immediately when staff leaves the business.',
                ],
                checks: ['Branch-wise reports are correct.', 'Sensitive modules are owner/admin only.', 'Audit history is available for important changes.'],
            },
        ],
    },
    bn: {
        name: 'বাংলা',
        badge: 'পূর্ণ পেইজ এবং PDF করার উপযোগী গাইড',
        title: 'AndgatePOS ব্যবহার নির্দেশিকা',
        subtitle:
            'বাংলাদেশি SME ব্যবসার মালিক, ম্যানেজার, ক্যাশিয়ার, ইনভেন্টরি টিম, হিসাব টিম, ই-কমার্স টিম এবং সার্ভিস স্টাফদের জন্য ধাপে ধাপে শেখার গাইড।',
        print: 'PDF গাইড ডাউনলোড করুন',
        printHelp: 'Selectable text ও screenshot সহ আসল PDF গাইড ডাউনলোড করুন।',
        toc: 'গাইড মেনু',
        quickStart: '১৫ মিনিটে প্রথম বিক্রয়',
        learningPath: 'শেখার সঠিক ক্রম',
        rolePath: 'স্টাফের কাজ অনুযায়ী শেখা',
        screenshotNote: 'যেখানে ক্লিক করার আগে স্ক্রিন দেখে নিশ্চিত হওয়া দরকার, সেখানে স্ক্রিনশট দেওয়া হয়েছে।',
        dailyRoutine: 'দৈনিক ব্যবসার রুটিন',
        troubleshooting: 'সাধারণ সমস্যা ও সমাধান',
        learning: [
            'দিন ১: লগইন, ভাষা, দোকানের প্রোফাইল, স্টাফ রোল এবং ড্যাশবোর্ড।',
            'দিন ২: পণ্য, ভ্যারিয়েন্ট, বারকোড, স্টক এবং সাপ্লায়ারের শুরুর বকেয়া।',
            'দিন ৩: POS বিক্রয়, ছাড়, কুপন, রিটার্ন, বাকিতে বিক্রয় এবং ক্যাশ ক্লোজিং।',
            'দিন ৪: পারচেজ, Supplier 360, কাস্টমার CRM, খরচ এবং রিপোর্ট।',
            'দিন ৫: HR হাজিরা, petty cash, ই-কমার্স অর্ডার, কুরিয়ার এবং audit log শেখানো।',
        ],
        roles: [
            { title: 'মালিক বা ম্যানেজার', items: ['ড্যাশবোর্ড', 'Business OS', 'ক্যাশ ক্লোজিং', 'Petty cash', 'রিপোর্ট', 'স্টাফ পারমিশন'] },
            { title: 'ক্যাশিয়ার', items: ['POS', 'অর্ডার বিবরণ', 'কুপন', 'পেমেন্ট ভাগ', 'রিটার্ন', 'রসিদ প্রিন্ট'] },
            { title: 'ইনভেন্টরি স্টাফ', items: ['পণ্য', 'ভ্যারিয়েন্ট', 'বারকোড লেবেল', 'স্টক মুভমেন্ট', 'পারচেজ', 'Supplier 360'] },
            { title: 'হিসাব স্টাফ', items: ['খরচ', 'ক্যাশ বুক', 'সাপ্লায়ার বকেয়া', 'কাস্টমার বকেয়া', 'লাভ-ক্ষতি', 'ট্যাক্স রিপোর্ট'] },
            { title: 'ই-কমার্স বা ডেলিভারি টিম', items: ['অনলাইন অর্ডার', 'কুরিয়ার সেটআপ', 'Pathao/Steadfast নিয়ম', 'ডেলিভারি স্ট্যাটাস', 'কাস্টমার ফলোআপ'] },
            { title: 'সার্ভিস টিম', items: ['সার্ভিস জব', 'টেকনিশিয়ান অ্যাসাইন', 'রিপেয়ার স্ট্যাটাস', 'ডেলিভারি ও টাকা কালেকশন'] },
        ],
        routines: [
            { title: 'দোকান খোলার আগে', items: ['কম স্টকের সতর্কতা দেখুন।', 'ওপেনিং ক্যাশ নিশ্চিত করুন।', 'স্টাফ হাজিরা দিন।', 'পেন্ডিং অর্ডার ও সার্ভিস জব দেখুন।'] },
            { title: 'বিক্রয়ের সময়', items: ['প্রতিটি বিক্রয় POS দিয়ে করুন।', 'সঠিক পেমেন্ট পদ্ধতি নির্বাচন করুন।', 'বাকিতে বিক্রয় হলে কাস্টমার নির্বাচন করুন।', 'ছোট খরচ petty cash দিয়ে লিখুন।'] },
            { title: 'দোকান বন্ধের আগে', items: ['ক্যাশ ও কাউন্টার ক্লোজিং করুন।', 'ক্যাশ, bKash/Nagad, কার্ড এবং বাকি মিলিয়ে দেখুন।', 'আজকের বিক্রয় ও খরচ দেখুন।', 'ক্লোজিং রিপোর্ট সেভ বা প্রিন্ট করুন।'] },
            { title: 'প্রতি সপ্তাহ বা মাসে', items: ['লাভ-ক্ষতি রিপোর্ট দেখুন।', 'সাপ্লায়ার বকেয়া পরিশোধ করুন।', 'কাস্টমার বকেয়া ফলোআপ করুন।', 'কম চলা ও বেশি চলা পণ্য দেখুন।', 'প্রয়োজনে রিপোর্ট এক্সপোর্ট করুন।'] },
        ],
        problems: [
            { title: 'লগইন পেইজ লোড হতে থাকে', fix: 'একবার রিলোড করুন। পুরোনো ক্যাশ থাকলে ব্রাউজার ক্যাশ পরিষ্কার করুন এবং নতুন ডেপ্লয়মেন্টের ভার্সন ব্যবহার করুন।' },
            { title: 'POS-এ পণ্য পাওয়া যাচ্ছে না', fix: 'পণ্য active আছে কিনা, স্টক, বারকোড এবং সঠিক দোকান/ওয়্যারহাউস নির্বাচন করা আছে কিনা দেখুন।' },
            { title: 'স্টক সংখ্যা ভুল', fix: 'পারচেজ receive, sale, return, transfer এবং stock adjustment history দেখুন।' },
            { title: 'ক্যাশ মিলছে না', fix: 'চূড়ান্ত closing করার আগে POS payment, petty cash, refund এবং manual cash book entry মিলিয়ে দেখুন।' },
            { title: 'বাংলা লেখা দেখা যাচ্ছে না', fix: 'উপরের মেনু থেকে ভাষা বাংলা করুন এবং পেইজ একবার refresh করুন।' },
        ],
        sections: [
            {
                id: 'login',
                title: '১. লগইন, ভাষা এবং দোকানের অ্যাক্সেস',
                intro: 'স্টাফ ট্রেনিংয়ের আগে এখান থেকে শুরু করুন। সঠিক দোকান অ্যাক্সেস না হলে বিক্রয়, স্টক এবং রিপোর্ট ভুল হতে পারে।',
                image: screenshots.dashboard,
                imageAlt: 'লগইনের পর AndgatePOS ড্যাশবোর্ড',
                gallery: [{ title: 'মোবাইল ভিউ', image: screenshots.mobile, imageAlt: 'AndgatePOS মোবাইল ড্যাশবোর্ড' }],
                steps: [
                    'Chrome বা পছন্দের ব্রাউজারে AndgatePOS খুলুন।',
                    'মোবাইল/ইমেইল ও পাসওয়ার্ড দিয়ে সাইন ইন করুন।',
                    'উপরের ভাষা মেনু থেকে বাংলা বা English নির্বাচন করুন।',
                    'আপনি সঠিক দোকান বা ব্রাঞ্চে আছেন কিনা নিশ্চিত করুন।',
                    'কোনো স্টাফ মেনু না দেখলে owner/admin থেকে role permission আপডেট করান।',
                ],
                checks: ['Dashboard reload loop ছাড়া খুলছে।', 'সঠিক দোকানের নাম দেখা যাচ্ছে।', 'স্টাফ শুধু অনুমোদিত module দেখছে।'],
            },
            {
                id: 'setup',
                title: '২. দোকান সেটআপ এবং স্টাফ পারমিশন',
                intro: 'লাইভ বিক্রির আগে দোকানের তথ্য, payment method, invoice style, return rule এবং staff access ঠিক করুন।',
                image: screenshots.businessOS,
                imageAlt: 'AndgatePOS ড্যাশবোর্ড',
                steps: [
                    'Store Settings-এ business name, phone, address, VAT/BIN থাকলে সেটি, এবং invoice footer দিন।',
                    'Cash, bKash, Nagad, Rocket, card এবং bank payment method যোগ করুন।',
                    'Cashier, inventory, accounts, ecommerce এবং service role অনুযায়ী staff user তৈরি করুন।',
                    'প্রতিটি staff-কে শুধু দরকারি permission দিন। Cashier সাধারণত purchase price বা accounting report edit করবে না।',
                    'লাইভ ব্যবহারের আগে opening cash এবং opening stock দিন।',
                ],
                checks: ['Invoice-এ সঠিক দোকানের তথ্য আছে।', 'POS-এ payment method দেখা যাচ্ছে।', 'Staff নিজের account দিয়ে login করতে পারছে।'],
            },
            {
                id: 'business-os',
                title: '৩. Business OS, ক্যাশ ক্লোজিং, Petty Cash, HR এবং Service Job',
                intro: 'এটি বাংলাদেশি SME ব্যবসার দৈনিক অপারেশন জায়গা। মালিক নিয়ন্ত্রণ পায়, কর্মচারী কাজ পরিষ্কার বুঝতে পারে।',
                image: screenshots.businessOS,
                imageAlt: 'দৈনিক অপারেশনের Business OS ড্যাশবোর্ড',
                gallery: [
                    { title: 'ক্যাশ ক্লোজিং', image: screenshots.cashClosing, imageAlt: 'Cash closing screen' },
                    { title: 'Petty cash', image: screenshots.pettyCash, imageAlt: 'Petty cash screen' },
                    { title: 'HR হাজিরা', image: screenshots.hrAttendance, imageAlt: 'HR attendance screen' },
                    { title: 'Service jobs', image: screenshots.serviceJobs, imageAlt: 'Service jobs screen' },
                ],
                steps: [
                    'Business OS থেকে daily task, counter status, cash movement, stock warning, supplier/customer due এবং staff activity দেখুন।',
                    'প্রতিটি shift শেষে Cash and Counter Closing করুন। Employee submit করবে, owner/manager review করতে পারবে।',
                    'চা, যাতায়াত, packaging বা ছোট repair-এর মতো ছোট দোকান খরচ Petty Cash-এ লিখুন।',
                    'HR Attendance দিয়ে check-in, check-out, late, absent, leave এবং overtime track করুন।',
                    'Repair/service ব্যবসার জন্য Service Jobs ব্যবহার করুন। Job তৈরি, technician assign, status update, payment collect এবং delivery করুন।',
                ],
                checks: ['প্রতিটি cash counter closing record আছে।', 'Petty cash-এ কারণ ও amount আছে।', 'HR permission আলাদা হলে attendance Business OS-এ মিশে নেই।'],
            },
            {
                id: 'pos',
                title: '৪. POS বিক্রয়, ছাড়, কুপন, রিটার্ন এবং বাকিতে বিক্রয়',
                intro: 'POS হলো cashier screen। প্রতিটি sale এখানে করলে stock, cash, customer due এবং report ঠিক থাকে।',
                image: screenshots.pos,
                imageAlt: 'AndgatePOS POS sales screen',
                steps: [
                    'নাম, SKU বা barcode দিয়ে product খুঁজুন।',
                    'Size/color variant থাকলে সঠিক variant নির্বাচন করুন।',
                    'Quantity দিন এবং unit price নিশ্চিত করুন।',
                    'Shop policy অনুযায়ী discount বা coupon দিন।',
                    'Payment method নির্বাচন করুন: cash, bKash, Nagad, card, split payment অথবা due.',
                    'বাকিতে বিক্রয় হলে আগে customer select/create করুন, তারপর sale save করুন।',
                    'Payment শেষে invoice print/share করুন।',
                    'Return হলে original order খুঁজুন, return quantity দিন, refund/payment adjustment confirm করুন।',
                ],
                checks: ['Subtotal, discount এবং grand total invoice-এর সাথে মিলে।', 'Sale-এর পর stock কমেছে।', 'Unpaid sale হলে customer due update হয়েছে।'],
            },
            {
                id: 'products',
                title: '৫. পণ্য, ভ্যারিয়েন্ট, বারকোড লেবেল এবং স্টক সতর্কতা',
                intro: 'পরিষ্কার product data থাকলে POS দ্রুত চলে এবং report বেশি নির্ভরযোগ্য হয়।',
                image: screenshots.productCreate,
                imageAlt: 'AndgatePOS product list',
                gallery: [
                    { title: 'Product list', image: screenshots.products, imageAlt: 'Product list screen' },
                    { title: 'Stock alert', image: screenshots.stockThresholds, imageAlt: 'Stock thresholds screen' },
                    { title: 'Barcode label', image: screenshots.label, imageAlt: 'Barcode label screen' },
                ],
                steps: [
                    'আগে category এবং brand তৈরি করুন।',
                    'Product name, SKU/barcode, purchase price, retail price, unit, tax এবং opening stock দিন।',
                    'Size/color product হলে variant তৈরি করুন এবং প্রতিটি variant-এর stock আলাদা রাখুন।',
                    'Barcode scan ব্যবহার করলে label module থেকে barcode label print করুন।',
                    'Reorder quantity set করুন যাতে stock শেষ হওয়ার আগে alert পাওয়া যায়।',
                    'Damage, correction বা owner-approved পরিবর্তনের জন্য stock adjustment ব্যবহার করুন।',
                ],
                checks: ['Product POS-এ দেখা যাচ্ছে।', 'Barcode scan করলে সঠিক item আসে।', 'Low stock list দোকানের staff সহজে বুঝতে পারে।'],
            },
            {
                id: 'purchase',
                title: '৬. পারচেজ, স্টক Receive এবং Supplier 360',
                intro: 'Purchase flow supplier due, stock cost এবং inventory quantity নিয়ন্ত্রণ করে।',
                image: screenshots.purchase,
                imageAlt: 'AndgatePOS purchase creation screen',
                gallery: [
                    { title: 'Supplier list', image: screenshots.supplierList, imageAlt: 'Supplier list screen' },
                    { title: 'Supplier due', image: screenshots.supplierDue, imageAlt: 'Supplier due screen' },
                ],
                steps: [
                    'Supplier name, mobile, address, opening balance থাকলে সেটি, এবং payment terms দিয়ে supplier তৈরি করুন।',
                    'Supplier, invoice number, date, product, quantity, purchase price, discount, tax এবং transport cost দিয়ে purchase তৈরি করুন।',
                    'Physical goods মিলিয়ে stock receive করুন।',
                    'Supplier-কে টাকা দিলে supplier payment record করুন।',
                    'Supplier 360 থেকে supplier purchases, payments, dues, returns এবং communication history এক জায়গায় দেখুন।',
                ],
                checks: ['Purchase receive করলে stock বাড়ছে।', 'Unpaid purchase supplier due-তে যাচ্ছে।', 'Payment discussion-এর আগে supplier ledger প্রস্তুত।'],
            },
            {
                id: 'crm',
                title: '৭. Customer, CRM, Loyalty এবং Due Follow-up',
                intro: 'CRM নিয়মিত customer ধরে রাখতে, due follow-up করতে এবং local promotion চালাতে সাহায্য করে।',
                image: screenshots.customerCrm,
                imageAlt: 'Customer CRM dashboard',
                steps: [
                    'Customer name, mobile, address, opening due থাকলে সেটি এবং customer type দিয়ে customer তৈরি করুন।',
                    'Due sale, loyalty, warranty, service job এবং repeat purchase tracking-এর জন্য POS-এ customer ব্যবহার করুন।',
                    'CRM dashboard থেকে active customer, inactive customer, due customer এবং campaign target দেখুন।',
                    'Amount এবং due date অনুযায়ী customer due follow-up করুন।',
                    'Customer preference, promised payment date বা service history note-এ লিখুন।',
                ],
                checks: ['Due customer list current আছে।', 'Customer purchase history দেখা যায়।', 'Promotion সঠিক customer group-এ যাচ্ছে।'],
            },
            {
                id: 'accounts',
                title: '৮. খরচ, হিসাব এবং রিপোর্ট',
                intro: 'শুধু daily sales দেখলে profit বোঝা যায় না। Expense, purchase cost, return, tax এবং due একসাথে দেখতে হয়।',
                image: screenshots.profitLoss,
                imageAlt: 'Profit and loss report',
                steps: [
                    'Rent, salary, electricity, internet, packaging, delivery cost এবং maintenance-এর মতো shop expenses লিখুন।',
                    'Cash book বা journal entry শুধু accounts staff দরকার হলে ব্যবহার করবে।',
                    'Daily sales report এবং weekly/monthly profit/loss report দেখুন।',
                    'VAT/tax configure করা থাকলে tax report দেখুন।',
                    'Owner, accountant বা auditor দরকার হলে report export করুন।',
                ],
                checks: ['Expense category ঠিক আছে।', 'Profit/loss-এ cost ও expense যুক্ত হয়েছে।', 'Date ও branch দিয়ে report filter করা যায়।'],
            },
            {
                id: 'ecommerce',
                title: '৯. ই-কমার্স অর্ডার এবং কুরিয়ার',
                intro: 'Facebook/website order-এর জন্য order, customer, stock, delivery এবং payment status একসাথে রাখুন।',
                image: screenshots.ecommerce,
                imageAlt: 'Ecommerce orders screen',
                steps: [
                    'Customer name, mobile, address, product, delivery charge এবং payment status দিয়ে ecommerce order create/import করুন।',
                    'Delivery order accept করার আগে stock confirm করুন।',
                    'Pathao বা supported courier account details configure করুন।',
                    'Order status update করুন: pending, confirmed, packed, sent to courier, delivered, returned অথবা cancelled.',
                    'Returned parcel review করে stock/payment ঠিক করুন।',
                ],
                checks: ['Customer mobile ও address complete।', 'Courier status update হয়েছে।', 'Returned order completed sale হিসেবে পড়ে নেই।'],
            },
            {
                id: 'control',
                title: '১০. Multi-store, Notification, Audit, Backup এবং Security',
                intro: 'বেশি staff, counter বা branch হলে এই control ব্যবসা নিরাপদ রাখে।',
                image: screenshots.audit,
                imageAlt: 'Audit logs for branch control',
                steps: [
                    'Stock ও cash আলাদা হলে separate branch/store ব্যবহার করুন।',
                    'Role-based permission দিন এবং মাসে একবার review করুন।',
                    'Price, stock, payment বা order change investigate করতে audit log দেখুন।',
                    'Low stock, due follow-up, pending purchase এবং operational reminder-এর জন্য notification ব্যবহার করুন।',
                    'Owner/accountant backup-এর জন্য দরকারি report নিয়মিত export করুন।',
                    'Staff চাকরি ছাড়লে password/access সঙ্গে সঙ্গে change বা remove করুন।',
                ],
                checks: ['Branch-wise report ঠিক আছে।', 'Sensitive module owner/admin only।', 'Important change-এর audit history পাওয়া যায়।'],
            },
        ],
    },
};

export default function UserGuideClient() {
    const [lang, setLang] = useState<Lang>('en');
    const [zoomImage, setZoomImage] = useState<{ src: string; alt: string; title?: string } | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const initialLang = params.get('lang') === 'bn' ? 'bn' : 'en';
        setLang(initialLang);
    }, []);

    const guide = copy[lang];
    const pdfHref = `/resources/andgatepos-user-guide-${lang}.pdf`;
    const quickSale = useMemo(
        () =>
            lang === 'bn'
                ? ['POS খুলুন।', 'পণ্য search/scan করুন।', 'Quantity ঠিক করুন।', 'Customer দরকার হলে select করুন।', 'Discount/coupon থাকলে apply করুন।', 'Payment method দিন।', 'Invoice print/share করুন।']
                : ['Open POS.', 'Search or scan product.', 'Confirm quantity.', 'Select customer if needed.', 'Apply discount/coupon if allowed.', 'Choose payment method.', 'Print or share invoice.'],
        [lang]
    );

    const switchLang = (nextLang: Lang) => {
        setLang(nextLang);
        const url = new URL(window.location.href);
        url.searchParams.set('lang', nextLang);
        window.history.replaceState({}, '', url.toString());
    };

    return (
        <MainLayout>
            <style jsx global>{`
                @media print {
                    nav,
                    footer,
                    .no-print,
                    .whatsapp-float {
                        display: none !important;
                    }
                    body {
                        background: #ffffff !important;
                    }
                    .print-page {
                        padding-top: 0 !important;
                    }
                    .print-break {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                    .print-shadow {
                        box-shadow: none !important;
                    }
                }
            `}</style>

            <div className="print-page bg-slate-50 pt-16 text-slate-900">
                <section className="relative overflow-hidden bg-gradient-to-br from-[#034d79] via-[#046ca9] to-[#0f86c8] text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_32%)]" />
                    <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold backdrop-blur">
                                <BookOpen className="h-4 w-4" />
                                {guide.badge}
                            </div>
                            <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{guide.title}</h1>
                            <p className="mt-5 max-w-3xl text-lg leading-8 text-sky-50">{guide.subtitle}</p>
                            <div className="no-print mt-8 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => switchLang('en')}
                                    className={`rounded-full px-5 py-3 text-sm font-bold transition ${lang === 'en' ? 'bg-white text-[#046ca9]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                >
                                    English
                                </button>
                                <button
                                    type="button"
                                    onClick={() => switchLang('bn')}
                                    className={`rounded-full px-5 py-3 text-sm font-bold transition ${lang === 'bn' ? 'bg-white text-[#046ca9]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                >
                                    বাংলা
                                </button>
                                <a
                                    href={pdfHref}
                                    download
                                    className="inline-flex items-center gap-2 rounded-full bg-[#e79237] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-[#d07d25]"
                                >
                                    <Download className="h-4 w-4" />
                                    {guide.print}
                                </a>
                            </div>
                            <p className="no-print mt-3 text-sm text-sky-100">{guide.printHelp}</p>
                        </div>
                        <div className="print-shadow overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur">
                            <ZoomableImage
                                src={screenshots.pos}
                                alt="AndgatePOS POS screenshot"
                                width={980}
                                height={620}
                                className="rounded-xl bg-white object-cover"
                                priority
                                zoomText={lang === 'bn' ? 'বড় করে দেখুন' : 'Zoom'}
                                onZoom={(image) => setZoomImage(image)}
                            />
                        </div>
                    </div>
                </section>

                <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
                    <aside className="no-print lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900">
                                <Search className="h-5 w-5 text-[#046ca9]" />
                                {guide.toc}
                            </h2>
                            <div className="space-y-1">
                                <a href="#quick" className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#046ca9]">
                                    {guide.quickStart}
                                </a>
                                {guide.sections.map((section) => (
                                    <a key={section.id} href={`#${section.id}`} className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#046ca9]">
                                        {section.title}
                                    </a>
                                ))}
                                <a href="#routine" className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#046ca9]">
                                    {guide.dailyRoutine}
                                </a>
                                <a href="#help" className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#046ca9]">
                                    {guide.troubleshooting}
                                </a>
                            </div>
                        </div>
                    </aside>

                    <main className="space-y-8">
                        <div className="grid gap-4 md:grid-cols-3">
                            <InfoCard icon={<CalendarDays className="h-6 w-6" />} title={guide.learningPath} items={guide.learning} />
                            <InfoCard icon={<Languages className="h-6 w-6" />} title={lang === 'bn' ? 'ভাষা ও PDF' : 'Language and PDF'} items={[guide.screenshotNote, guide.printHelp]} />
                            <InfoCard icon={<ShieldCheck className="h-6 w-6" />} title={lang === 'bn' ? 'নিরাপদ ব্যবহার' : 'Safe Operation'} items={lang === 'bn' ? ['প্রতিটি staff-এর আলাদা login দিন।', 'Sensitive module owner/admin রাখুন।', 'Daily closing ছাড়া দোকান বন্ধ করবেন না।'] : ['Give each staff their own login.', 'Keep sensitive modules owner/admin only.', 'Do not close shop without daily closing.']} />
                        </div>

                        <section id="quick" className="print-break print-shadow rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-wider text-[#e79237]">{lang === 'bn' ? 'দ্রুত শুরু' : 'Quick start'}</p>
                                    <h2 className="text-2xl font-black text-slate-900">{guide.quickStart}</h2>
                                </div>
                                <ArrowRight className="h-7 w-7 text-[#046ca9]" />
                            </div>
                            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                                <ol className="grid gap-3 sm:grid-cols-2">
                                    {quickSale.map((step, index) => (
                                        <li key={step} className="flex gap-3 rounded-xl bg-slate-50 p-4">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-sm font-black text-white">{index + 1}</span>
                                            <span className="font-semibold text-slate-800">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                                <ZoomableImage
                                    src={screenshots.pos}
                                    alt="POS quick sale screenshot"
                                    width={720}
                                    height={460}
                                    className="rounded-xl border border-slate-200 bg-white object-cover"
                                    zoomText={lang === 'bn' ? 'বড় করে দেখুন' : 'Zoom'}
                                    onZoom={(image) => setZoomImage(image)}
                                />
                            </div>
                        </section>

                        <section className="print-break print-shadow rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-5 text-2xl font-black text-slate-900">{guide.rolePath}</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {guide.roles.map((role) => (
                                    <div key={role.title} className="rounded-xl border border-slate-200 p-4">
                                        <h3 className="mb-3 font-black text-slate-900">{role.title}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {role.items.map((item) => (
                                                <span key={item} className="rounded-full bg-sky-50 px-3 py-1 text-sm font-bold text-[#046ca9]">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {guide.sections.map((section) => (
                            <section key={section.id} id={section.id} className="print-break print-shadow rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-black text-slate-900">{section.title}</h2>
                                    <p className="mt-2 leading-7 text-slate-600">{section.intro}</p>
                                </div>
                                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                                    <div>
                                        <h3 className="mb-3 font-black text-slate-900">{lang === 'bn' ? 'ধাপে ধাপে কাজ' : 'Step by step'}</h3>
                                        <ol className="space-y-3">
                                            {section.steps.map((step, index) => (
                                                <li key={step} className="flex gap-3">
                                                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#046ca9]/10 text-sm font-black text-[#046ca9]">{index + 1}</span>
                                                    <span className="leading-7 text-slate-700">{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                        {section.checks && (
                                            <div className="mt-5 rounded-xl bg-emerald-50 p-4">
                                                <h3 className="mb-3 font-black text-emerald-900">{lang === 'bn' ? 'শেষে মিলিয়ে দেখুন' : 'Final check'}</h3>
                                                <div className="space-y-2">
                                                    {section.checks.map((check) => (
                                                        <div key={check} className="flex gap-2 text-sm font-semibold text-emerald-800">
                                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                                            <span>{check}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {section.image && (
                                        <ZoomableImage
                                            src={section.image}
                                            alt={section.imageAlt ?? section.title}
                                            title={section.title}
                                            width={720}
                                            height={460}
                                            className="rounded-xl border border-slate-200 bg-white object-cover object-top"
                                            zoomText={lang === 'bn' ? 'বড় করে দেখুন' : 'Zoom'}
                                            onZoom={(image) => setZoomImage(image)}
                                        />
                                    )}
                                </div>
                                {section.gallery && (
                                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                        {section.gallery.map((shot) => (
                                            <figure key={shot.image} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                                                <ZoomableImage
                                                    src={shot.image}
                                                    alt={shot.imageAlt}
                                                    title={shot.title}
                                                    width={720}
                                                    height={460}
                                                    className="h-44 w-full object-cover object-top"
                                                    zoomText={lang === 'bn' ? 'বড় করে দেখুন' : 'Zoom'}
                                                    onZoom={(image) => setZoomImage(image)}
                                                />
                                                <figcaption className="border-t border-slate-200 px-3 py-2 text-sm font-bold text-slate-700">{shot.title}</figcaption>
                                            </figure>
                                        ))}
                                    </div>
                                )}
                            </section>
                        ))}

                        <section id="routine" className="print-break print-shadow rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-5 text-2xl font-black text-slate-900">{guide.dailyRoutine}</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {guide.routines.map((routine) => (
                                    <div key={routine.title} className="rounded-xl bg-slate-50 p-5">
                                        <h3 className="mb-3 font-black text-slate-900">{routine.title}</h3>
                                        <ul className="space-y-2">
                                            {routine.items.map((item) => (
                                                <li key={item} className="flex gap-2 text-slate-700">
                                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#046ca9]" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section id="help" className="print-break print-shadow rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-5 text-2xl font-black text-slate-900">{guide.troubleshooting}</h2>
                            <div className="space-y-3">
                                {guide.problems.map((problem) => (
                                    <div key={problem.title} className="rounded-xl border border-slate-200 p-4">
                                        <h3 className="font-black text-slate-900">{problem.title}</h3>
                                        <p className="mt-2 leading-7 text-slate-600">{problem.fix}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="no-print flex justify-center pb-10">
                            <a
                                href={pdfHref}
                                download
                                className="inline-flex items-center gap-2 rounded-full bg-[#046ca9] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#046ca9]/20 transition hover:bg-[#034d79]"
                            >
                                <Download className="h-4 w-4" />
                                {guide.print}
                            </a>
                        </div>
                    </main>
                </section>
                {zoomImage && (
                    <div
                        className="no-print fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-sm"
                        role="dialog"
                        aria-modal="true"
                        aria-label={zoomImage.title ?? zoomImage.alt}
                        onClick={() => setZoomImage(null)}
                    >
                        <div className="max-h-[94vh] w-full max-w-7xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
                            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                                <div>
                                    {zoomImage.title && <h3 className="font-black text-slate-900">{zoomImage.title}</h3>}
                                    <p className="text-sm text-slate-500">{zoomImage.alt}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setZoomImage(null)}
                                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                                >
                                    {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
                                </button>
                            </div>
                            <div className="max-h-[82vh] overflow-auto bg-slate-100 p-3">
                                <Image src={zoomImage.src} alt={zoomImage.alt} width={1440} height={1100} className="mx-auto h-auto w-full max-w-none rounded-lg bg-white object-contain" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

function ZoomableImage({
    src,
    alt,
    title,
    width,
    height,
    className,
    priority,
    zoomText,
    onZoom,
}: {
    src: string;
    alt: string;
    title?: string;
    width: number;
    height: number;
    className?: string;
    priority?: boolean;
    zoomText: string;
    onZoom: (image: { src: string; alt: string; title?: string }) => void;
}) {
    return (
        <button
            type="button"
            className="group relative block w-full overflow-hidden rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-[#046ca9] focus:ring-offset-2"
            onClick={() => onZoom({ src, alt, title })}
            aria-label={`Open larger screenshot: ${title ?? alt}`}
        >
            <Image src={src} alt={alt} width={width} height={height} className={className} priority={priority} />
            <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-black text-white opacity-90 shadow-lg transition group-hover:bg-[#046ca9]">
                {zoomText}
            </span>
        </button>
    );
}

function InfoCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
    return (
        <div className="print-break print-shadow rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#046ca9]/10 text-[#046ca9]">{icon}</div>
            <h2 className="mb-3 text-lg font-black text-slate-900">{title}</h2>
            <ul className="space-y-2">
                {items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#e79237]" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
