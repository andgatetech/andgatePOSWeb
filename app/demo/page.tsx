'use client';

import Navbar from '../promotion/components/navbar';
import DemoHero from '../promotion/components/demo-hero';
import PromoEngagementTracker from '../promotion/components/promo-engagement-tracker';
import PromoFAQ from '../promotion/components/promo-faq';
import PromoFeatureProof from '../promotion/components/promo-feature-proof';
import PromoFooter from '../promotion/components/promo-footer';
import PromoPricing from '../promotion/components/promo-pricing';
import PromoRegisterForm from '../promotion/components/promo-register-form';
import PromoTestimonials from '../promotion/components/promo-testimonials';
import { trackEvent } from '@/lib/analytics';
import { ArrowRight, Phone } from 'lucide-react';

export default function DemoPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white pb-20 sm:pb-0">
            <Navbar />

            <main className="flex flex-1 flex-col pt-16">
                {/* 1. Video first — this is exactly why the lead is here */}
                <div data-section-track="demo_hero">
                    <DemoHero />
                </div>

                {/* 2. Concrete proof of what they just watched */}
                <div data-section-track="feature_proof">
                    <PromoFeatureProof />
                </div>

                {/* 3. Pricing — a demo-request lead's next question is usually cost */}
                <div data-section-track="pricing">
                    <PromoPricing />
                </div>

                {/* 4. Registration form — primary conversion */}
                <div data-section-track="register_form">
                    <PromoRegisterForm defaultSource="demo_page" defaultCampaign="demo_follow_up" />
                </div>

                {/* 5. Testimonials */}
                <div data-section-track="testimonials">
                    <PromoTestimonials />
                </div>

                {/* 6. FAQ — objection handling */}
                <div data-section-track="faq">
                    <PromoFAQ />
                </div>
            </main>

            <PromoEngagementTracker />

            <div className="fixed inset-x-0 bottom-0 z-[60] grid grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur sm:hidden">
                <a href="#register-section" className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white">
                    ফ্রি ট্রায়াল
                    <ArrowRight className="h-4 w-4" />
                </a>
                <a
                    href="https://wa.me/8801577303608?text=%E0%A6%86%E0%A6%AE%E0%A6%BF%20AndgatePOS%20%E0%A6%A1%E0%A7%87%E0%A6%AE%E0%A7%8B%20%E0%A6%A6%E0%A7%87%E0%A6%96%E0%A7%87%20%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%B6%E0%A7%8D%E0%A6%A8%20%E0%A6%95%E0%A6%B0%E0%A6%A4%E0%A7%87%20%E0%A6%9A%E0%A6%BE%E0%A6%87"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('mobile_sticky_whatsapp_click', 'Contact', { section: 'mobile_sticky', page: 'demo' })}
                    className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-black text-green-700"
                    aria-label="WhatsApp support"
                >
                    <Phone className="h-5 w-5" />
                    WhatsApp
                </a>
            </div>

            <PromoFooter variant="pos" />
        </div>
    );
}
