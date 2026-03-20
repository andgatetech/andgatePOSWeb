import { PlayCircle } from 'lucide-react';
import PromoButton from './promo-button';

export default function PromoHero() {
    return (
        <section className="relative overflow-hidden bg-white pb-10 pt-16 sm:pb-16 sm:pt-24 lg:pb-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
                    {/* RIght Column (Video) - Moved to top on mobile using order-first / lg:order-last */}
                    <div className="relative order-first mx-auto mb-4 w-full max-w-xl lg:order-last lg:mb-0 lg:max-w-none">
                        {/* Soft glow behind the video */}
                        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/30 to-blue-500/30 opacity-50 blur-2xl"></div>

                        <div className="relative rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                            <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                                {/* 
                                    YOUTUBE IFRAME (Shorts)
                                    We use an iframe since YouTube Shorts do not expose raw .mp4 files.
                                */}
                                <iframe
                                    className="mx-auto h-[600px] w-full max-w-[340px] rounded-xl object-cover"
                                    src="https://www.youtube.com/embed/gELTWs7hFtc?autoplay=1&mute=1&loop=1&playlist=gELTWs7hFtc&controls=0&modestbranding=1"
                                    title="AndgatePOS Demo Shorts"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>

                                {/* Overlay gradient to make it look premium */}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent"></div>
                            </div>
                        </div>
                    </div>

                    {/* Left Column: Hero Text - Order second on mobile, first on large screens */}
                    <div className="order-last mx-auto mt-4 max-w-2xl text-center lg:order-first lg:mx-0 lg:mt-0 lg:text-left">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
                            <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                            <span className="text-sm font-medium text-primary">নতুন আপডেট: আপনার ব্যবসার আধুনিক সমাধান</span>
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:leading-[1.1]">
                            ব্যবসা পরিচালনার <br className="hidden lg:block" />
                            <span className="text-primary">সবচেয়ে সহজ সফটওয়্যার</span>
                        </h1>

                        <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
                            সেলস, ইনভেন্টরি, এবং কাস্টমার ম্যানেজমেন্ট এখন আপনার হাতের মুঠোয়। এই সফটওয়্যারটি দিয়ে খুব সহজেই আপনার ব্যবসার সম্পূর্ণ হিসাব-নিকাশ স্বয়ংক্রিয়ভাবে নিয়ন্ত্রণ করুন।
                        </p>

                        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                            <PromoButton href="#register-section" className="px-8 py-4 text-lg">
                                এখনই যুক্ত হোন
                            </PromoButton>

                            <a
                                href="#video-demo"
                                className="group flex items-center justify-center gap-2 rounded-lg bg-gray-50 px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                <PlayCircle className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
                                ডেমো দেখুন
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
