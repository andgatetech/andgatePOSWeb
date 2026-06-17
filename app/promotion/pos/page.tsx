'use client';

import Navbar from '../components/navbar';
import PromoFAQ from '../components/promo-faq';
import PromoFooter from '../components/promo-footer';
import PromoHero from '../components/promo-hero';
import PromoLossHook from '../components/promo-loss-hook';
import PromoPricing from '../components/promo-pricing';
import PromoProblemSolution from '../components/promo-problem-solution';
import PromoRegisterForm from '../components/promo-register-form';
import PromoStats from '../components/promo-stats';
import PromoTestimonials from '../components/promo-testimonials';
import PromotionTracker from '../components/promotion-tracker';
import WhatsAppFloat from '@/components/whatsapp-float';
import { ArrowRight } from 'lucide-react';

export default function PromotionPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white pb-20 sm:pb-0">
            <PromotionTracker />
            <WhatsAppFloat />
            <Navbar />

            <main className="flex flex-1 flex-col pt-16">
                {/* 1. Hero — hook + video + urgency badge */}
                <PromoHero />

                {/* 2. Trust stats bar */}
                <PromoStats />

                {/* 3. Loss-aversion + Before/After transformation */}
                <PromoLossHook />

                {/* 4. Pain point pairs — emotionally charged */}
                <PromoProblemSolution />

                {/* 5. Registration form — primary conversion for store-owner ad traffic */}
                <PromoRegisterForm />

                {/* 6. Pricing plans — after signup intent is captured */}
                <PromoPricing />

                {/* 7. Testimonials marquee */}
                <PromoTestimonials />

                {/* 8. FAQ — objection handling */}
                <PromoFAQ />
            </main>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur sm:hidden">
                <a href="#register-section" className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white">
                    ফ্রিতে POS অ্যাকাউন্ট খুলুন
                    <ArrowRight className="h-4 w-4" />
                </a>
            </div>

            <PromoFooter />
        </div>
    );
}
