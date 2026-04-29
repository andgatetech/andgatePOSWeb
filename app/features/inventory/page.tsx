'use client';
import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import {
    AlertTriangle,
    Archive,
    ArrowRight,
    BarChart2,
    ChevronRight,
    ClipboardList,
    FileSpreadsheet,
    GitMerge,
    PackageCheck,
    PackageMinus,
    QrCode,
    RefreshCw,
    Store,
    Truck,
    Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function InventoryFeaturePage() {
    const { i18n } = getTranslation();
    const isBn = i18n.language === 'bn';

    const hero = {
        badge: isBn ? 'স্টক ও ক্রয়' : 'Stock & Inventory',
        title: isBn ? 'স্টক শেষ হওয়ার আগেই জানুন' : 'Know Before You Run Out',
        subtitle: isBn
            ? 'রিয়েল-টাইম স্টক লেভেল, স্বয়ংক্রিয় কম-স্টক অ্যালার্ট আর সম্পূর্ণ ক্রয় অর্ডার ব্যবস্থাপনা — এখন আর স্টক ফুরিয়ে গিয়ে বিক্রি মিস করতে হবে না।'
            : 'Real-time stock levels, automatic low-stock alerts, and complete purchase order management — never miss a sale because a shelf is empty again.',
    };

    const stats = [
        { value: isBn ? 'রিয়েল-টাইম' : 'Real-time', label: isBn ? 'স্টক আপডেট' : 'Stock Updates' },
        { value: isBn ? '৫ ধাপ' : '5 Stages', label: isBn ? 'ক্রয় অর্ডার ওয়ার্কফ্লো' : 'Purchase Order Workflow' },
        { value: isBn ? 'এক্সেল' : 'Excel', label: isBn ? 'বাল্ক ইম্পোর্ট' : 'Bulk Import' },
        { value: isBn ? 'সব শাখা' : 'All Stores', label: isBn ? 'সিঙ্ক হয়' : 'Stay in Sync' },
    ];

    const features = [
        {
            icon: <BarChart2 className="h-6 w-6" />,
            title: isBn ? 'রিয়েল-টাইম স্টক লেভেল' : 'Real-time Stock Levels',
            desc: isBn
                ? 'প্রতিটি বিক্রি বা ক্রয়ের সাথে সাথে স্টক আপডেট হয়। যেকোনো সময় যেকোনো পণ্যের বর্তমান পরিমাণ দেখুন।'
                : 'Stock updates instantly with every sale or purchase. See current quantity of any product at any time.',
        },
        {
            icon: <AlertTriangle className="h-6 w-6" />,
            title: isBn ? 'কম-স্টক অ্যালার্ট' : 'Low-Stock Alerts',
            desc: isBn
                ? 'প্রতিটি পণ্যের জন্য রিঅর্ডার পয়েন্ট সেট করুন। স্টক সেই সীমার নিচে গেলে নোটিফিকেশন পাবেন।'
                : 'Set a reorder point per product. Get notified the moment stock falls below that threshold.',
        },
        {
            icon: <ClipboardList className="h-6 w-6" />,
            title: isBn ? 'ক্রয় অর্ডার ওয়ার্কফ্লো' : 'Purchase Order Workflow',
            desc: isBn
                ? 'ড্রাফট তৈরি → অনুমোদন → সরবরাহকারীকে পাঠান → পণ্য গ্রহণ করুন → স্টক স্বয়ংক্রিয়ভাবে বাড়বে।'
                : 'Draft → Approve → Send to supplier → Receive goods → Stock auto-increases. Full audit trail at every step.',
        },
        {
            icon: <Truck className="h-6 w-6" />,
            title: isBn ? 'সরবরাহকারী ব্যবস্থাপনা' : 'Supplier Management',
            desc: isBn
                ? 'সরবরাহকারীর প্রোফাইল, বকেয়া পেমেন্ট, পেমেন্ট শর্ত ও পারফরম্যান্স রিপোর্ট এক জায়গায় রাখুন।'
                : 'Keep supplier profiles, outstanding payments, payment terms, and performance reports all in one place.',
        },
        {
            icon: <FileSpreadsheet className="h-6 w-6" />,
            title: isBn ? 'Excel বাল্ক ইম্পোর্ট' : 'Bulk Excel Import',
            desc: isBn
                ? 'হাজারো পণ্য Excel ফাইল থেকে একবারে আমদানি করুন। টেমপ্লেট ডাউনলোড করুন, পূরণ করুন, আপলোড করুন — হয়ে গেল।'
                : 'Import thousands of products from an Excel file at once. Download the template, fill it, upload — done.',
        },
        {
            icon: <PackageMinus className="h-6 w-6" />,
            title: isBn ? 'স্টক অ্যাডজাস্টমেন্ট' : 'Stock Adjustments',
            desc: isBn
                ? 'ভুল, ক্ষতি বা নষ্ট পণ্যের জন্য স্টক ম্যানুয়ালি ঠিক করুন — কারণসহ লগ রাখুন যাতে অডিটে সমস্যা না হয়।'
                : 'Manually correct stock for damage, spoilage, or errors — with a reason logged for full audit compliance.',
        },
        {
            icon: <Store className="h-6 w-6" />,
            title: isBn ? 'মাল্টি-স্টোর স্টক সিঙ্ক' : 'Multi-Store Stock Sync',
            desc: isBn
                ? 'একাধিক শাখার স্টক আলাদাভাবে দেখুন এবং এক শাখা থেকে অন্য শাখায় স্টক ট্রান্সফার করুন।'
                : 'View stock per branch separately and transfer inventory between stores with a full transfer log.',
        },
        {
            icon: <QrCode className="h-6 w-6" />,
            title: isBn ? 'বারকোড ও QR লেবেল' : 'Barcode & QR Labels',
            desc: isBn
                ? 'যেকোনো পণ্যের জন্য বারকোড বা QR কোড লেবেল তৈরি করুন এবং বাল্কে প্রিন্ট করুন — সরাসরি ড্যাশবোর্ড থেকে।'
                : 'Generate barcode or QR label for any product and bulk-print directly from the dashboard.',
        },
    ];

    const steps = [
        {
            step: '১',
            icon: <PackageCheck className="h-5 w-5 text-[#046ca9]" />,
            title: isBn ? 'পণ্য যোগ করুন ও রিঅর্ডার পয়েন্ট সেট করুন' : 'Add Products & Set Reorder Points',
            desc: isBn
                ? 'প্রতিটি পণ্যের জন্য সর্বনিম্ন স্টক সংখ্যা ঠিক করুন। এটাই আপনার অ্যালার্ট ট্রিগার।'
                : 'Set a minimum stock level per product — this becomes your alert trigger.',
        },
        {
            step: '২',
            icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
            title: isBn ? 'অ্যালার্ট পান' : 'Receive Alert',
            desc: isBn
                ? 'স্টক সেই সীমায় পৌঁছালে ড্যাশবোর্ডে নোটিফিকেশন দেখাবে — আগে থেকে ব্যবস্থা নিন।'
                : 'When stock hits that level, a dashboard notification fires — act before it runs out.',
        },
        {
            step: '৩',
            icon: <ClipboardList className="h-5 w-5 text-[#046ca9]" />,
            title: isBn ? 'ক্রয় অর্ডার তৈরি করুন' : 'Create Purchase Order',
            desc: isBn
                ? 'সরবরাহকারী বেছে নিন, পরিমাণ লিখুন, অনুমোদন করুন — পিডিএফ বা ইমেইলে পাঠান।'
                : 'Pick supplier, enter quantities, approve — send as PDF or email.',
        },
        {
            step: '৪',
            icon: <RefreshCw className="h-5 w-5 text-emerald-600" />,
            title: isBn ? 'পণ্য গ্রহণ করুন — স্টক আপডেট' : 'Receive Goods — Stock Auto-Updates',
            desc: isBn
                ? 'পণ্য আসার পর "গ্রহণ" চিহ্নিত করুন — স্টক সাথে সাথে বেড়ে যাবে, কোনো ম্যানুয়াল এন্ট্রি ছাড়াই।'
                : 'Mark items as received — stock increases instantly, no manual entry needed.',
        },
    ];

    const reportTypes = [
        { label: isBn ? 'স্টক ভ্যালুয়েশন রিপোর্ট' : 'Stock Valuation Report', icon: '📦' },
        { label: isBn ? 'কম স্টক রিপোর্ট' : 'Low Stock Report', icon: '⚠️' },
        { label: isBn ? 'স্টক মুভমেন্ট লগ' : 'Stock Movement Log', icon: '🔄' },
        { label: isBn ? 'ক্রয় অর্ডার ইতিহাস' : 'Purchase Order History', icon: '📋' },
        { label: isBn ? 'সরবরাহকারী বকেয়া রিপোর্ট' : 'Supplier Due Report', icon: '🧾' },
        { label: isBn ? 'স্টক অ্যাডজাস্টমেন্ট লগ' : 'Adjustment Log', icon: '✏️' },
    ];

    return (
        <MainLayout>
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79] pb-24 pt-32">
                <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-white/10 blur-[100px]" />
                <div className="absolute -right-20 top-1/3 h-[400px] w-[400px] rounded-full bg-white/10 blur-[100px]" />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
                />
                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-sm">
                        <Archive className="h-4 w-4" />
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

            {/* Features Grid */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-14 text-center">
                        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
                            {isBn ? 'স্টক নিয়ন্ত্রণের সব সুবিধা' : 'Full Inventory Control Features'}
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-base text-gray-500">
                            {isBn
                                ? 'স্টক ম্যানেজমেন্টের প্রতিটি দিক কভার করা — ক্রয় থেকে বিক্রি পর্যন্ত।'
                                : 'Every aspect of inventory covered — from purchasing to selling.'}
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

            {/* Workflow Steps */}
            <section className="bg-gray-50 py-20">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
                            {isBn ? 'স্টক ম্যানেজমেন্ট কীভাবে কাজ করে' : 'How Stock Management Works'}
                        </h2>
                        <p className="mt-3 text-base text-gray-500">
                            {isBn
                                ? 'অর্ডার দেওয়া থেকে পণ্য তাকে রাখা পর্যন্ত — সম্পূর্ণ প্রক্রিয়া।'
                                : 'From placing an order to stocking the shelf — the complete cycle.'}
                        </p>
                    </div>
                    <div className="space-y-5">
                        {steps.map((s, i) => (
                            <div key={i} className="flex items-start gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-base font-black text-white shadow-md">
                                    {s.step}
                                </div>
                                <div className="flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                        {s.icon}
                                        <h3 className="text-base font-bold text-gray-900">{s.title}</h3>
                                    </div>
                                    <p className="text-sm leading-relaxed text-gray-500">{s.desc}</p>
                                </div>
                                <ChevronRight className="mt-1 h-5 w-5 flex-shrink-0 text-gray-300" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Related Reports */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center">
                        <h2 className="text-2xl font-black text-gray-900">
                            {isBn ? 'স্টক-সংক্রান্ত রিপোর্ট' : 'Inventory-Related Reports'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            {isBn ? 'সব রিপোর্ট ফিল্টার করুন এবং Excel/PDF-এ এক্সপোর্ট করুন।' : 'Filter all reports and export to Excel or PDF.'}
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {reportTypes.map((r, i) => (
                            <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5 text-sm font-medium text-gray-700">
                                <span className="text-lg">{r.icon}</span>
                                {r.label}
                                <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79] py-20">
                <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                    <Zap className="mx-auto mb-4 h-10 w-10 text-white/60" />
                    <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">
                        {isBn ? 'স্টক নিয়ে আর চিন্তা নয়' : 'Stop Worrying About Stock'}
                    </h2>
                    <p className="mb-8 text-base leading-relaxed text-white/70">
                        {isBn
                            ? 'আজই শুরু করুন — ফ্রি প্ল্যানে সীমাহীন পণ্য যোগ করুন।'
                            : 'Start today — add unlimited products on the free plan.'}
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
                            href="/features/reports"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
                        >
                            {isBn ? 'রিপোর্ট ফিচার দেখুন' : 'See Reports Features'}
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
