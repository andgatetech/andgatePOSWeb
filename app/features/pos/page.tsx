'use client';
import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import {
    ArrowRight,
    Banknote,
    Barcode,
    CheckCircle,
    ChevronRight,
    Clock,
    CreditCard,
    Monitor,
    Pause,
    Printer,
    ReceiptText,
    RotateCcw,
    Scan,
    ShoppingCart,
    SplitSquareHorizontal,
    Tag,
    Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function POSFeaturePage() {
    const { i18n } = getTranslation();
    const isBn = i18n.language === 'bn';

    const hero = {
        badge: isBn ? 'বিক্রয় কাউন্টার' : 'POS Terminal',
        title: isBn ? 'সেকেন্ডে বিল, মিনিটে বেশি বিক্রি' : 'Bill in Seconds, Sell More Every Minute',
        subtitle: isBn
            ? 'কাউন্টারে লাইন জমার দিন শেষ। AndgatePOS-এর দ্রুত POS টার্মিনাল দিয়ে বারকোড স্ক্যান থেকে রসিদ প্রিন্ট — সব হয় কয়েক সেকেন্ডে।'
            : 'No more long queues at the counter. With AndgatePOS fast POS terminal, from barcode scan to printed receipt — everything happens in seconds.',
    };

    const stats = [
        { value: isBn ? '৩ সেকেন্ড' : '3 Seconds', label: isBn ? 'গড় চেকআউট সময়' : 'Average Checkout Time' },
        { value: isBn ? '৫+' : '5+', label: isBn ? 'পেমেন্ট পদ্ধতি' : 'Payment Methods' },
        { value: isBn ? '১০০%' : '100%', label: isBn ? 'অফলাইনেও কাজ করে' : 'Works Offline Too' },
        { value: isBn ? '০ ভুল' : '0 Errors', label: isBn ? 'স্বয়ংক্রিয় হিসাব' : 'Auto Calculation' },
    ];

    const features = [
        {
            icon: <Scan className="h-6 w-6" />,
            title: isBn ? 'বারকোড ও ক্যামেরা স্ক্যান' : 'Barcode & Camera Scan',
            desc: isBn
                ? 'ব্লুটুথ বারকোড স্ক্যানার বা মোবাইলের ক্যামেরা — যেটা দিয়ে সুবিধা, সেটা দিয়ে স্ক্যান করুন। ১D ও 2D কোড সাপোর্ট।'
                : 'Use a Bluetooth barcode scanner or your mobile camera — whichever is handy. Supports 1D and 2D codes.',
        },
        {
            icon: <CreditCard className="h-6 w-6" />,
            title: isBn ? 'একাধিক পেমেন্ট পদ্ধতি' : 'Multiple Payment Methods',
            desc: isBn
                ? 'নগদ, বিকাশ, নগদ, রকেট, কার্ড বা ক্রেডিট — একসাথে একাধিক পদ্ধতিতে পেমেন্ট নিন এবং বাকি স্বয়ংক্রিয়ভাবে হিসাব হবে।'
                : 'Cash, bKash, Nagad, Rocket, card, or credit — accept split payments across multiple methods with auto change calculation.',
        },
        {
            icon: <Tag className="h-6 w-6" />,
            title: isBn ? 'ভ্যারিয়েন্ট ও সিরিয়াল নির্বাচন' : 'Variant & Serial Selection',
            desc: isBn
                ? 'রং, সাইজ বা যেকোনো কাস্টম ভ্যারিয়েন্ট বেছে নিন। সিরিয়াল-ট্র্যাকড পণ্যের জন্য সিরিয়াল নম্বর স্বয়ংক্রিয়ভাবে ডিডাক্ট হবে।'
                : 'Pick color, size, or any custom variant. Serial-tracked products auto-deduct the correct serial number from stock.',
        },
        {
            icon: <Printer className="h-6 w-6" />,
            title: isBn ? 'তাৎক্ষণিক রসিদ প্রিন্ট' : 'Instant Receipt Printing',
            desc: isBn
                ? 'থার্মাল প্রিন্টারে রসিদ প্রিন্ট করুন, WhatsApp/SMS-এ পাঠান বা ইমেইলে শেয়ার করুন। রসিদে লোগো, ঠিকানা ও ধন্যবাদ বার্তা যোগ করুন।'
                : 'Print on thermal printers, send via WhatsApp/SMS, or share by email. Add your logo, address, and a thank-you message.',
        },
        {
            icon: <SplitSquareHorizontal className="h-6 w-6" />,
            title: isBn ? 'স্প্লিট পেমেন্ট' : 'Split Payment',
            desc: isBn
                ? 'একটি বিলের পেমেন্ট ভাগ করুন — যেমন আধা নগদে, আধা বিকাশে। দলগত কেনাকাটায় খুবই কাজের।'
                : 'Split one bill across payment types — half cash, half bKash. Great for group purchases or partial payments.',
        },
        {
            icon: <RotateCcw className="h-6 w-6" />,
            title: isBn ? 'রিটার্ন ও রিফান্ড' : 'Returns & Refunds',
            desc: isBn
                ? 'যেকোনো পুরনো বিক্রয় খুঁজে বের করুন, পণ্য রিটার্ন প্রসেস করুন এবং স্টক স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে।'
                : 'Look up any past sale, process a return, and stock is automatically updated — no manual adjustment needed.',
        },
        {
            icon: <Pause className="h-6 w-6" />,
            title: isBn ? 'অর্ডার হোল্ড করুন' : 'Hold Orders',
            desc: isBn
                ? 'চলমান বিক্রি পজ করুন, অন্য গ্রাহক সামলান, তারপর ফিরে এসে হোল্ড অর্ডার চালু করুন — কোনো কিছু হারাবে না।'
                : 'Pause an ongoing sale, serve another customer, then resume the held order — nothing is lost.',
        },
        {
            icon: <Banknote className="h-6 w-6" />,
            title: isBn ? 'ডিসকাউন্ট ও প্রমো' : 'Discounts & Promotions',
            desc: isBn
                ? 'পণ্য বা পুরো বিলে শতাংশ বা নির্দিষ্ট পরিমাণ ছাড় দিন। অনুমোদিত ব্যবহারকারীই শুধু ডিসকাউন্ট দিতে পারবেন।'
                : 'Apply % or flat discounts per item or on the whole bill. Only authorized users can apply discounts.',
        },
    ];

    const steps = [
        {
            step: '১',
            title: isBn ? 'পণ্য বাছুন' : 'Select Items',
            desc: isBn ? 'বারকোড স্ক্যান করুন বা নাম দিয়ে খুঁজুন — পণ্য কার্টে যোগ হবে।' : 'Scan the barcode or search by name — the product is added to cart.',
        },
        {
            step: '২',
            title: isBn ? 'ডিসকাউন্ট / পরিমাণ ঠিক করুন' : 'Adjust Qty / Discount',
            desc: isBn ? 'পরিমাণ বাড়ান-কমান বা ছাড় লাগান।' : 'Increase quantity or apply a discount if needed.',
        },
        {
            step: '৩',
            title: isBn ? 'পেমেন্ট নিন' : 'Collect Payment',
            desc: isBn ? 'পেমেন্ট পদ্ধতি বাছুন, পরিমাণ দিন — বাকি পয়সা স্বয়ংক্রিয় হিসাব।' : 'Choose payment method, enter amount — change is auto-calculated.',
        },
        {
            step: '৪',
            title: isBn ? 'রসিদ দিন' : 'Print / Send Receipt',
            desc: isBn ? 'প্রিন্ট করুন, হোয়াটসঅ্যাপে পাঠান বা শুধু সেভ করুন।' : 'Print, send via WhatsApp, or just save digitally.',
        },
    ];

    const useCases = [
        { emoji: '🛒', title: isBn ? 'মুদিখানা' : 'Grocery' },
        { emoji: '👗', title: isBn ? 'পোশাকের দোকান' : 'Clothing Store' },
        { emoji: '💊', title: isBn ? 'ফার্মেসি' : 'Pharmacy' },
        { emoji: '📱', title: isBn ? 'মোবাইল শপ' : 'Mobile Shop' },
        { emoji: '🥐', title: isBn ? 'বেকারি' : 'Bakery' },
        { emoji: '👟', title: isBn ? 'জুতার দোকান' : 'Footwear' },
        { emoji: '⚡', title: isBn ? 'ইলেকট্রনিক্স' : 'Electronics' },
        { emoji: '📚', title: isBn ? 'স্টেশনারি' : 'Stationery' },
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
                        <ShoppingCart className="h-4 w-4" />
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
                                <p className="text-3xl font-black text-[#046ca9]">{s.value}</p>
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
                            {isBn ? 'POS টার্মিনালের সব সুবিধা' : 'Everything the POS Terminal Offers'}
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-base text-gray-500">
                            {isBn
                                ? 'প্রতিটি ফিচার বাংলাদেশের দোকানদারদের দৈনন্দিন কাজকে মাথায় রেখে তৈরি।'
                                : 'Every feature built around the daily reality of Bangladeshi shop owners.'}
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

            {/* How It Works */}
            <section className="bg-gray-50 py-20">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
                            {isBn ? 'একটি বিক্রি কীভাবে হয়?' : 'How a Sale Works'}
                        </h2>
                        <p className="mt-3 text-base text-gray-500">
                            {isBn ? 'শুরু থেকে শেষ — মাত্র ৪টি ধাপ।' : 'From start to finish — just 4 steps.'}
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute left-8 top-8 hidden h-[calc(100%-4rem)] w-px border-l-2 border-dashed border-[#046ca9]/20 lg:block" />
                        <div className="space-y-6">
                            {steps.map((s, i) => (
                                <div key={i} className="relative flex items-start gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-base font-black text-white shadow-md">
                                        {s.step}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">{s.title}</h3>
                                        <p className="mt-1 text-sm leading-relaxed text-gray-500">{s.desc}</p>
                                    </div>
                                    <ChevronRight className="ml-auto h-5 w-5 flex-shrink-0 text-gray-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Works for these businesses */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mb-3 text-2xl font-black text-gray-900">
                        {isBn ? 'যেকোনো ব্যবসায় কাজ করে' : 'Works for Every Type of Shop'}
                    </h2>
                    <p className="mb-10 text-sm text-gray-500">
                        {isBn ? 'ছোট দোকান থেকে বড় চেইন শপ — সবার জন্য।' : 'From a corner shop to a chain of outlets.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {useCases.map((u, i) => (
                            <div key={i} className="flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                                <span>{u.emoji}</span>
                                {u.title}
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
                        {isBn ? 'আজই POS কাউন্টার চালু করুন' : 'Launch Your POS Counter Today'}
                    </h2>
                    <p className="mb-8 text-base leading-relaxed text-white/70">
                        {isBn
                            ? 'ফ্রি প্ল্যানে শুরু করুন — কোনো ক্রেডিট কার্ড লাগবে না, মিনিটের মধ্যে প্রস্তুত।'
                            : 'Start on the free plan — no credit card needed, ready in minutes.'}
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
                            href="/features/inventory"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
                        >
                            {isBn ? 'ইনভেন্টরি ফিচার দেখুন' : 'See Inventory Features'}
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
