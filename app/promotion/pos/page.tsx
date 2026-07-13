'use client';

import Navbar from '../components/navbar';
import PromoEngagementTracker from '../components/promo-engagement-tracker';
import PromoFAQ from '../components/promo-faq';
import PromoFeatureProof from '../components/promo-feature-proof';
import PromoFooter from '../components/promo-footer';
import PromoHero from '../components/promo-hero';
import PromoLossHook from '../components/promo-loss-hook';
import PromoPricing from '../components/promo-pricing';
import PromoRegisterForm from '../components/promo-register-form';
import PromoStats from '../components/promo-stats';
import PromoTestimonials from '../components/promo-testimonials';
import PromotionTracker from '../components/promotion-tracker';
import WhatsAppFloat from '@/components/whatsapp-float';
import { trackEvent } from '@/lib/analytics';
import { ArrowRight, Phone } from 'lucide-react';

const posPromotionSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AndgateBOS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Android, iOS',
    url: 'https://andgatepos.com/promotion/pos',
    description: 'Cloud SME Business OS for Bangladeshi shops with POS billing, inventory, payment tracking, reports, and online store features.',
    brand: {
        '@type': 'Brand',
        name: 'AndgateBOS',
    },
    provider: {
        '@type': 'Organization',
        name: 'Andgate Technologies',
        url: 'https://andgatepos.com',
    },
    areaServed: {
        '@type': 'Country',
        name: 'Bangladesh',
    },
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BDT',
        availability: 'https://schema.org/InStock',
        url: 'https://andgatepos.com/promotion/pos',
    },
};

const posFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'Can I start AndgateBOS for free?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. Bangladeshi shop owners can open a free AndgateBOS account and start using POS billing, inventory and Business OS features.',
            },
        },
        {
            '@type': 'Question',
            name: 'Does AndgateBOS work for small shops in Bangladesh?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. AndgateBOS is built for retail shops, grocery stores, pharmacies, fashion shops, electronics shops, hardware shops, and other SME businesses in Bangladesh.',
            },
        },
    ],
};

export default function PromotionPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white pb-20 sm:pb-0">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(posPromotionSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(posFaqSchema) }} />
            <PromotionTracker />
            <PromoEngagementTracker />
            <div className="hidden sm:block">
                <WhatsAppFloat />
            </div>
            <Navbar />

            <main className="flex flex-1 flex-col pt-16">
                {/* 1. Hero — hook + video + urgency badge */}
                <div data-section-track="hero">
                    <PromoHero />
                </div>

                {/* 2. Trust stats bar */}
                <div data-section-track="stats">
                    <PromoStats />
                </div>

                {/* 3. Updated product proof for ad traffic */}
                <div data-section-track="feature_proof">
                    <PromoFeatureProof />
                </div>

                {/* 4. Registration form — primary conversion, moved earlier for mobile ad traffic */}
                <div data-section-track="register_form">
                    <PromoRegisterForm />
                </div>

                {/* 5. Loss-aversion warning + consolidated problem/solution pairs */}
                <div data-section-track="loss_hook">
                    <PromoLossHook />
                </div>

                {/* 6. Pricing plans — answers the cost objection after the quick-start CTA */}
                <div data-section-track="pricing">
                    <PromoPricing />
                </div>

                {/* 7. Testimonials marquee */}
                <div data-section-track="testimonials">
                    <PromoTestimonials />
                </div>

                {/* 8. FAQ — objection handling */}
                <div data-section-track="faq">
                    <PromoFAQ />
                </div>
            </main>

            <div className="fixed inset-x-0 bottom-0 z-[60] grid grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur sm:hidden">
                <a
                    href="#register-section"
                    onClick={() => trackEvent('mobile_sticky_trial_click', 'Lead', { section: 'mobile_sticky' })}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white"
                >
                    ফ্রি ট্রায়াল
                    <ArrowRight className="h-4 w-4" />
                </a>
                <a
                    href="https://wa.me/8801577303608?text=%E0%A6%86%E0%A6%AE%E0%A6%BF%20AndgateBOS%20%E0%A6%AB%E0%A7%8D%E0%A6%B0%E0%A6%BF%20%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%AF%E0%A6%BC%E0%A6%BE%E0%A6%B2%20%E0%A6%B6%E0%A7%81%E0%A6%B0%E0%A7%81%20%E0%A6%95%E0%A6%B0%E0%A6%A4%E0%A7%87%20%E0%A6%9A%E0%A6%BE%E0%A6%87"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('mobile_sticky_whatsapp_click', 'Contact', { section: 'mobile_sticky' })}
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
