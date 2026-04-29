'use client';
import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import {
    ArrowRight,
    BarChart3,
    ChevronRight,
    DollarSign,
    Download,
    FileBarChart,
    FileText,
    Filter,
    LineChart,
    Package,
    PiggyBank,
    Receipt,
    ShoppingBag,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function ReportsFeaturePage() {
    const { i18n } = getTranslation();
    const isBn = i18n.language === 'bn';

    const hero = {
        badge: isBn ? 'রিপোর্ট ও ফিন্যান্স' : 'Reports & Finance',
        title: isBn ? 'মাস শেষে হিসাব মেলানোর দিন শেষ' : 'No More End-of-Month Headaches',
        subtitle: isBn
            ? '২০টিরও বেশি বিল্ট-ইন রিপোর্ট — বিক্রয়, লাভ-ক্ষতি, স্টক, ট্যাক্স, সরবরাহকারী বকেয়া। যেকোনো সময়, যেকোনো ডিভাইস থেকে দেখুন ও এক্সপোর্ট করুন।'
            : '20+ built-in reports — sales, profit & loss, stock, tax, supplier dues. View and export anytime from any device.',
    };

    const stats = [
        { value: isBn ? '২০+' : '20+', label: isBn ? 'বিল্ট-ইন রিপোর্ট' : 'Built-in Reports' },
        { value: isBn ? 'Excel/PDF' : 'Excel/PDF', label: isBn ? 'এক্সপোর্ট ফরম্যাট' : 'Export Formats' },
        { value: isBn ? 'তারিখ/দোকান' : 'Date/Store', label: isBn ? 'ফিল্টার অপশন' : 'Filter Options' },
        { value: isBn ? 'এক ক্লিক' : 'One Click', label: isBn ? 'যেকোনো রিপোর্ট' : 'Any Report' },
    ];

    const reportCategories = [
        {
            icon: <TrendingUp className="h-6 w-6" />,
            color: 'bg-blue-50 text-blue-600',
            title: isBn ? 'বিক্রয় ও রাজস্ব' : 'Sales & Revenue',
            reports: [
                isBn ? 'দৈনিক / সাপ্তাহিক / মাসিক বিক্রয়' : 'Daily / Weekly / Monthly Sales',
                isBn ? 'পণ্যভিত্তিক বিক্রয় বিশ্লেষণ' : 'Product-wise Sales Analysis',
                isBn ? 'ক্যাটাগরিভিত্তিক বিক্রয়' : 'Category-wise Sales',
                isBn ? 'ক্যাশিয়ারভিত্তিক বিক্রয়' : 'Sales by Cashier',
            ],
        },
        {
            icon: <PiggyBank className="h-6 w-6" />,
            color: 'bg-emerald-50 text-emerald-600',
            title: isBn ? 'লাভ-ক্ষতি ও অ্যাকাউন্টিং' : 'Profit, Loss & Accounting',
            reports: [
                isBn ? 'লাভ-ক্ষতির বিবরণী (P&L)' : 'Profit & Loss Statement (P&L)',
                isBn ? 'ডাবল-এন্ট্রি লেজার' : 'Double-Entry Ledger',
                isBn ? 'জার্নাল এন্ট্রি লগ' : 'Journal Entry Log',
                isBn ? 'খরচ বিশ্লেষণ রিপোর্ট' : 'Expense Analysis Report',
            ],
        },
        {
            icon: <Package className="h-6 w-6" />,
            color: 'bg-amber-50 text-amber-600',
            title: isBn ? 'স্টক ও ইনভেন্টরি' : 'Stock & Inventory',
            reports: [
                isBn ? 'স্টক ভ্যালুয়েশন রিপোর্ট' : 'Stock Valuation Report',
                isBn ? 'কম স্টক পণ্যের তালিকা' : 'Low-Stock Products List',
                isBn ? 'স্টক মুভমেন্ট লগ' : 'Stock Movement Log',
                isBn ? 'ডেড স্টক বিশ্লেষণ' : 'Dead Stock Analysis',
            ],
        },
        {
            icon: <Receipt className="h-6 w-6" />,
            color: 'bg-purple-50 text-purple-600',
            title: isBn ? 'ট্যাক্স ও ইনভয়েস' : 'Tax & Invoicing',
            reports: [
                isBn ? 'ট্যাক্স সংগ্রহ রিপোর্ট' : 'Tax Collection Report',
                isBn ? 'ভ্যাট সারাংশ' : 'VAT Summary',
                isBn ? 'ইনভয়েস তালিকা ও ইতিহাস' : 'Invoice List & History',
                isBn ? 'পেমেন্ট পদ্ধতি বিশ্লেষণ' : 'Payment Method Breakdown',
            ],
        },
        {
            icon: <ShoppingBag className="h-6 w-6" />,
            color: 'bg-rose-50 text-rose-600',
            title: isBn ? 'ক্রয় ও সরবরাহকারী' : 'Purchase & Suppliers',
            reports: [
                isBn ? 'ক্রয় অর্ডার ইতিহাস' : 'Purchase Order History',
                isBn ? 'সরবরাহকারী বকেয়া রিপোর্ট' : 'Supplier Due Report',
                isBn ? 'ক্রয়ভিত্তিক খরচ বিশ্লেষণ' : 'Purchase Cost Analysis',
                isBn ? 'সরবরাহকারী পারফরম্যান্স' : 'Supplier Performance',
            ],
        },
        {
            icon: <Users className="h-6 w-6" />,
            color: 'bg-teal-50 text-teal-600',
            title: isBn ? 'গ্রাহক বিশ্লেষণ' : 'Customer Analytics',
            reports: [
                isBn ? 'শীর্ষ গ্রাহক রিপোর্ট' : 'Top Customers Report',
                isBn ? 'গ্রাহক ক্রয় ইতিহাস' : 'Customer Purchase History',
                isBn ? 'লয়ালটি টায়ার বিশ্লেষণ' : 'Loyalty Tier Analysis',
                isBn ? 'গ্রাহক বকেয়া রিপোর্ট' : 'Customer Due Report',
            ],
        },
    ];

    const features = [
        {
            icon: <Filter className="h-6 w-6" />,
            title: isBn ? 'স্মার্ট ফিল্টার' : 'Smart Filters',
            desc: isBn
                ? 'তারিখের রেঞ্জ, দোকান, পণ্য, ক্যাটাগরি বা কর্মচারী — যেকোনো মাপকাঠিতে ফিল্টার করুন।'
                : 'Filter by date range, store, product, category, or employee — slice the data any way you need.',
        },
        {
            icon: <Download className="h-6 w-6" />,
            title: isBn ? 'Excel ও PDF এক্সপোর্ট' : 'Excel & PDF Export',
            desc: isBn
                ? 'যেকোনো রিপোর্ট এক ক্লিকে Excel বা PDF-এ এক্সপোর্ট করুন — অ্যাকাউন্ট্যান্টের কাছে পাঠান বা নিজে রাখুন।'
                : 'Export any report to Excel or PDF in one click — send to your accountant or keep for your records.',
        },
        {
            icon: <LineChart className="h-6 w-6" />,
            title: isBn ? 'ড্যাশবোর্ড চার্ট' : 'Dashboard Charts',
            desc: isBn
                ? 'বিক্রয় ট্রেন্ড, শীর্ষ পণ্য ও দৈনিক রাজস্ব — ভিজ্যুয়াল চার্টে দেখুন যাতে দ্রুত সিদ্ধান্ত নিতে পারেন।'
                : 'Sales trends, top products, and daily revenue — visual charts so you can make fast decisions.',
        },
        {
            icon: <FileBarChart className="h-6 w-6" />,
            title: isBn ? 'তুলনামূলক বিশ্লেষণ' : 'Comparative Analysis',
            desc: isBn
                ? 'এই মাস বনাম গত মাস, এই বছর বনাম গত বছর — পারফরম্যান্স তুলনা করুন।'
                : 'This month vs last month, this year vs last year — compare performance periods side by side.',
        },
        {
            icon: <DollarSign className="h-6 w-6" />,
            title: isBn ? 'সম্পূর্ণ অ্যাকাউন্টিং সিস্টেম' : 'Full Accounting System',
            desc: isBn
                ? 'ডাবল-এন্ট্রি বুককিপিং, লেজার অ্যাকাউন্ট, জার্নাল এন্ট্রি — আলাদা অ্যাকাউন্টিং সফটওয়্যার লাগবে না।'
                : 'Double-entry bookkeeping, ledger accounts, journal entries — no separate accounting software needed.',
        },
        {
            icon: <FileText className="h-6 w-6" />,
            title: isBn ? 'মাল্টি-স্টোর রিপোর্ট' : 'Multi-Store Reports',
            desc: isBn
                ? 'সব শাখার ডেটা একসাথে দেখুন বা যেকোনো একটি শাখার রিপোর্ট আলাদাভাবে দেখুন।'
                : 'View combined data across all branches or drill down into any single store.',
        },
    ];

    const steps = [
        {
            step: '১',
            title: isBn ? 'রিপোর্ট বাছুন' : 'Choose a Report',
            desc: isBn ? 'বিক্রয়, স্টক, লাভ-ক্ষতি — যে রিপোর্ট দরকার সেটা বাছুন।' : 'Sales, stock, P&L — pick the report you need from the sidebar.',
        },
        {
            step: '২',
            title: isBn ? 'ফিল্টার লাগান' : 'Apply Filters',
            desc: isBn ? 'তারিখ বা দোকান সেট করুন — প্রয়োজনে আরও ফিল্টার যোগ করুন।' : 'Set date range or store — add more filters if needed.',
        },
        {
            step: '৩',
            title: isBn ? 'তথ্য দেখুন' : 'View Insights',
            desc: isBn ? 'চার্ট ও টেবিলে ডেটা দেখুন — সংখ্যাগুলো একনজরে বোঝা যাবে।' : 'Data shown in charts and tables — numbers at a glance.',
        },
        {
            step: '৪',
            title: isBn ? 'এক্সপোর্ট করুন' : 'Export',
            desc: isBn ? 'Excel বা PDF-এ এক্সপোর্ট করুন — অ্যাকাউন্ট্যান্টকে পাঠান বা আর্কাইভ করুন।' : 'Export to Excel or PDF — send to your accountant or archive it.',
        },
    ];

    return (
        <MainLayout>
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#035887] via-[#046ca9] to-[#034d79] pb-24 pt-32">
                <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-white/10 blur-[100px]" />
                <div className="absolute -right-20 top-1/3 h-[400px] w-[400px] rounded-full bg-white/10 blur-[100px]" />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
                />
                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-sm">
                        <BarChart3 className="h-4 w-4" />
                        {hero.badge}
                    </div>
                    <h1 className="mb-5 text-4xl font-black leading-tight text-white sm:text-5xl md:text-[3.25rem]">
                        {hero.title}
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
                        {hero.subtitle}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#046ca9] shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                        >
                            {isBn ? 'ফ্রিতে শুরু করুন' : 'Start Free'}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                        >
                            {isBn ? 'মূল্য তালিকা দেখুন' : 'See Pricing'}
                        </Link>
                    </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
            </section>

            {/* Stats */}
            <section className="bg-gray-50 py-12">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {stats.map((s, i) => (
                            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                                <p className="text-2xl font-black text-[#046ca9]">{s.value}</p>
                                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Report Categories Grid */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-14 text-center">
                        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
                            {isBn ? '৬ ক্যাটাগরিতে ২০+ রিপোর্ট' : '20+ Reports Across 6 Categories'}
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-base text-gray-500">
                            {isBn
                                ? 'ব্যবসার প্রতিটি দিকের জন্য আলাদা রিপোর্ট — সব এক ড্যাশবোর্ডে।'
                                : 'A dedicated report for every aspect of your business — all in one dashboard.'}
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {reportCategories.map((cat, i) => (
                            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${cat.color}`}>
                                    {cat.icon}
                                </div>
                                <h3 className="mb-4 text-base font-bold text-gray-900">{cat.title}</h3>
                                <ul className="space-y-2">
                                    {cat.reports.map((r, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]/40" />
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Highlights */}
            <section className="bg-gray-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
                            {isBn ? 'রিপোর্টিং সিস্টেমের সুবিধাসমূহ' : 'What Makes Our Reporting Powerful'}
                        </h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((f, i) => (
                            <div key={i} className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#046ca9]/20 hover:shadow-md">
                                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#046ca9]/8 text-[#046ca9] group-hover:bg-[#046ca9] group-hover:text-white transition-colors duration-200">
                                    {f.icon}
                                </div>
                                <h3 className="mb-2 text-base font-bold text-gray-900">{f.title}</h3>
                                <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
                            {isBn ? 'রিপোর্ট দেখবেন কীভাবে?' : 'How to Get a Report'}
                        </h2>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((s, i) => (
                            <div key={i} className="relative rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
                                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-base font-black text-white shadow-md">
                                    {s.step}
                                </div>
                                <h3 className="mb-2 text-sm font-bold text-gray-900">{s.title}</h3>
                                <p className="text-xs leading-relaxed text-gray-500">{s.desc}</p>
                                {i < steps.length - 1 && (
                                    <ChevronRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-gray-300 lg:block" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-br from-[#035887] via-[#046ca9] to-[#034d79] py-20">
                <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                    <Zap className="mx-auto mb-4 h-10 w-10 text-white/60" />
                    <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">
                        {isBn ? 'আপনার ব্যবসার সংখ্যা জানুন' : 'Know Your Business Numbers'}
                    </h2>
                    <p className="mb-8 text-base leading-relaxed text-white/70">
                        {isBn
                            ? 'ফ্রি প্ল্যানে সব রিপোর্ট এক্সেস করুন — আজই শুরু করুন।'
                            : 'Access all reports on the free plan — start today.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#046ca9] shadow-lg transition-all hover:scale-105"
                        >
                            {isBn ? 'ফ্রিতে শুরু করুন' : 'Get Started Free'}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/features/pos"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
                        >
                            {isBn ? 'POS ফিচার দেখুন' : 'See POS Features'}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
                        {[
                            isBn ? '✓ ফ্রি প্ল্যান আছে' : '✓ Free plan available',
                            isBn ? '✓ কোনো ক্রেডিট কার্ড নয়' : '✓ No credit card',
                            isBn ? '✓ যখন খুশি বাতিল' : '✓ Cancel anytime',
                        ].map((t, i) => <span key={i}>{t}</span>)}
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
