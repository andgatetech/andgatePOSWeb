'use client';

import { trackEvent } from '@/lib/analytics';
import { ArrowRight, ShieldCheck, Star } from 'lucide-react';
import PromoButton from './promo-button';

export default function PromoHero() {
    return (
        <section className="relative overflow-hidden bg-white pb-12 pt-24 sm:pb-16 sm:pt-28">
            {/* Subtle background glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-blue-50/60 to-transparent" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">

                    {/* Video — top on mobile */}
                    <div className="relative order-first mx-auto w-full max-w-sm lg:order-last lg:max-w-none">
                        <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-blue-400/30 to-primary/30 opacity-60 blur-2xl" />
                        <div className="relative rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">
                            <div className="overflow-hidden rounded-xl bg-gray-100">
                                <iframe
                                    className="mx-auto block h-[520px] w-full max-w-[300px] rounded-xl"
                                    src="https://www.youtube.com/embed/gELTWs7hFtc?autoplay=1&mute=1&loop=1&playlist=gELTWs7hFtc&controls=0&modestbranding=1"
                                    title="AndgatePOS Demo"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>

                        {/* Floating social proof chip */}
                        <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 shadow-xl">
                            <div className="flex -space-x-1.5">
                                {['র', 'স', 'আ'].map((l, i) => (
                                    <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-bold text-white">
                                        {l}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                                </div>
                                <p className="text-xs font-semibold text-gray-700">১০০+ ব্যবসা ব্যবহার করছে</p>
                            </div>
                        </div>
                    </div>

                    {/* Copy — second on mobile, first on desktop */}
                    <div className="order-last text-center lg:order-first lg:text-left">

                        {/* Urgency badge */}
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5">
                            <span className="flex h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                            <span className="text-sm font-bold text-orange-600">🔥 বিশেষ অফার — সেটআপ ফি সম্পূর্ণ মাফ!</span>
                        </div>

                        {/* Headline */}
                        <h1 className="mb-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl lg:text-[3.2rem]">
                            দোকান চালান <span className="text-primary">স্মার্টভাবে।</span>
                            <br className="hidden sm:block" /> আয় বাড়ান <span className="text-primary">নিশ্চিতভাবে।</span>
                        </h1>

                        <p className="mb-6 text-lg leading-relaxed text-gray-600">
                            বিক্রি, স্টক, হিসাব — সব এখন মোবাইলে। খাতার ঝামেলা শেষ, মাস শেষে লাভের হিসাব এখন পরিষ্কার।
                        </p>

                        {/* Trust points */}
                        <div className="mb-8 flex flex-col gap-2.5 text-sm font-medium text-gray-700 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
                            {[
                                '✅ ফ্রি প্ল্যানে শুরু করুন',
                                '✅ কোনো কম্পিউটার লাগবে না',
                                '✅ ১৪ দিন মানি-ব্যাক গ্যারান্টি',
                            ].map((t, i) => (
                                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-green-800">
                                    {t}
                                </span>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col items-center gap-3 sm:flex-row lg:items-start lg:justify-start">
                            <PromoButton
                                href="#register-section"
                                className="w-full px-8 py-4 text-base sm:w-auto"
                                onClick={() => trackEvent('hero_cta_click', 'Lead', { button_label: 'ফ্রিতে শুরু করুন', section: 'hero' })}
                            >
                                <span className="flex items-center gap-2">
                                    ফ্রিতে শুরু করুন
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            </PromoButton>
                            <a
                                href="#demo-section"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:bg-gray-50 sm:w-auto"
                                onClick={() => trackEvent('hero_demo_click', 'ViewContent', { button_label: 'সমস্যাগুলো দেখুন', section: 'hero' })}
                            >
                                আপনার সমস্যার সমাধান দেখুন ↓
                            </a>
                        </div>

                        {/* Security note */}
                        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-400 lg:justify-start">
                            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                            SSL সুরক্ষিত · ব্যাংক-মানের নিরাপত্তা · তথ্য সম্পূর্ণ গোপনীয়
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
