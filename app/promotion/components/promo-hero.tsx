'use client';

import { trackEvent } from '@/lib/analytics';
import { ArrowRight, Maximize2, Minimize2, ShieldCheck, Star, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import PromoButton from './promo-button';

export default function PromoHero() {
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const handleFullscreen = useCallback(() => {
        const el = videoContainerRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }, []);

    const handleMute = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        const fn = isMuted ? 'unMute' : 'mute';
        iframe.contentWindow?.postMessage(`{"event":"command","func":"${fn}","args":""}`, '*');
        setIsMuted((prev) => !prev);
    }, [isMuted]);

    useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    return (
        <section className="relative overflow-hidden bg-white pb-12 pt-24 sm:pb-16 sm:pt-28">
            {/* Subtle background glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-blue-50/60 to-transparent" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
                    {/* Video */}
                    <div id="demo-section" className="relative order-last mx-auto w-full max-w-sm scroll-mt-20 lg:max-w-[500px]">
                        <div className="relative rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">
                            <div ref={videoContainerRef} className="overflow-hidden rounded-xl bg-black">
                                <iframe
                                    ref={iframeRef}
                                    className="block h-[360px] w-full rounded-xl sm:h-[640px]"
                                    src="https://www.youtube.com/embed/gELTWs7hFtc?autoplay=1&mute=1&loop=1&playlist=gELTWs7hFtc&controls=0&modestbranding=1&enablejsapi=1"
                                    title="AndgatePOS Demo"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            {/* Control bar — below iframe in normal flow, never covered */}
                            <div className="mt-2 flex items-center justify-center gap-3 pb-1">
                                <button
                                    onClick={handleMute}
                                    className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:bg-gray-700 active:scale-95"
                                >
                                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                    {isMuted ? 'সাউন্ড চালু' : 'সাউন্ড বন্ধ'}
                                </button>
                                <button
                                    onClick={handleFullscreen}
                                    className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:bg-primary/80 active:scale-95"
                                >
                                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                    {isFullscreen ? 'বন্ধ করুন' : 'বড় করে দেখুন'}
                                </button>
                            </div>
                        </div>

                        {/* Floating social proof chip */}
                        <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 shadow-xl">
                            <div className="flex -space-x-1.5">
                                {['র', 'স', 'আ'].map((l, i) => (
                                    <div
                                        key={i}
                                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-bold text-white"
                                    >
                                        {l}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-xs font-semibold text-gray-700">বাংলাদেশি দোকানের জন্য তৈরি</p>
                            </div>
                        </div>
                    </div>

                    {/* Copy — second on mobile, first on desktop */}
                    <div className="order-first text-center lg:text-left">
                        {/* Urgency badge */}
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5">
                            <span className="flex h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                            <span className="text-sm font-bold text-orange-600">এখনই শুরু করলে সেটআপ ফি লাগবে না</span>
                        </div>

                        {/* Headline */}
                        <h1 className="mb-4 text-3xl font-extrabold leading-[1.12] tracking-tight text-gray-900 sm:text-5xl lg:text-[3.2rem]">
                            দোকানের টাকা, স্টক আর হিসাব
                            <br className="hidden sm:block" /> এখন থাকবে <span className="text-primary">আপনার নিয়ন্ত্রণে।</span>
                        </h1>

                        <p className="mb-6 text-base leading-relaxed text-gray-600 sm:text-lg">১ মিনিটে ফ্রি POS ট্রায়াল শুরু করুন। ফর্ম পূরণ করলেই অ্যাকাউন্ট তৈরি হবে, তারপর সরাসরি ড্যাশবোর্ডে ঢুকে সফটওয়্যার দেখে নিতে পারবেন।</p>

                        {/* Trust points */}
                        <div className="mb-8 flex flex-col gap-2.5 text-sm font-medium text-gray-700 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
                            {['কোনো কার্ড লাগবে না', 'মোবাইল দিয়েই বিল করা যায়', 'বাংলায় সেটআপ সাপোর্ট', 'স্টক ও লাভ-লস রিপোর্ট'].map((t, i) => (
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
                                    ১ মিনিটে ফ্রি ট্রায়াল শুরু করুন
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            </PromoButton>
                            <a
                                href="#demo-section"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:bg-gray-50 sm:w-auto"
                                onClick={() => trackEvent('hero_demo_click', 'ViewContent', { button_label: 'সমস্যাগুলো দেখুন', section: 'hero' })}
                            >
                                ডেমো ভিডিও দেখুন ↓
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
