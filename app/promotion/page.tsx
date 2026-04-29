'use client';

import Navbar from './components/navbar';
import PromoFAQ from './components/promo-faq';
import PromoHero from './components/promo-hero';
import PromoLossHook from './components/promo-loss-hook';
import PromoPricing from './components/promo-pricing';
import PromoProblemSolution from './components/promo-problem-solution';
import PromoRegisterForm from './components/promo-register-form';
import PromoStats from './components/promo-stats';
import PromoTestimonials from './components/promo-testimonials';
import PromotionTracker from './components/promotion-tracker';
import WhatsAppFloat from '@/components/whatsapp-float';

export default function PromotionPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white">
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

                {/* 5. Testimonials marquee */}
                <PromoTestimonials />

                {/* 6. Pricing plans */}
                <PromoPricing />

                {/* 7. FAQ — objection handling */}
                <PromoFAQ />

                {/* 8. Registration form — final CTA */}
                <PromoRegisterForm />
            </main>
        </div>
    );
}
