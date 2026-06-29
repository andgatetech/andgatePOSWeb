'use client';

import Navbar from '../components/navbar';
import PromoFAQ from '../components/promo-faq';
import PromoFeatureProof from '../components/promo-feature-proof';
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
import { trackEvent } from '@/lib/analytics';
import { ArrowRight, Phone } from 'lucide-react';

const posPromotionSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AndgatePOS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Android, iOS',
    url: 'https://andgatepos.com/promotion/pos',
    description: 'Cloud POS software for Bangladeshi shops with billing, inventory, payment tracking, reports, and online store features.',
    brand: {
        '@type': 'Brand',
        name: 'AndgatePOS',
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
            name: 'Can I start AndgatePOS for free?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. Bangladeshi shop owners can open a free AndgatePOS account and start using POS billing and inventory features.',
            },
        },
        {
            '@type': 'Question',
            name: 'Does AndgatePOS work for small shops in Bangladesh?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. AndgatePOS is built for retail shops, grocery stores, pharmacies, fashion shops, electronics shops, hardware shops, and other SME businesses in Bangladesh.',
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
            <div className="hidden sm:block">
                <WhatsAppFloat />
            </div>
            <Navbar />

            <main className="flex flex-1 flex-col pt-16">
                {/* 1. Hero — hook + video + urgency badge */}
                <PromoHero />

                {/* 2. Trust stats bar */}
                <PromoStats />

                {/* 3. Updated product proof for ad traffic */}
                <PromoFeatureProof />

                {/* 4. Loss-aversion + Before/After transformation */}
                <PromoLossHook />

                {/* 5. Pain point pairs — emotionally charged */}
                <PromoProblemSolution />

                {/* 6. Registration form — primary conversion for store-owner ad traffic */}
                <PromoRegisterForm />

                {/* 7. Pricing plans — after signup intent is captured */}
                <PromoPricing />

                {/* 8. Testimonials marquee */}
                <PromoTestimonials />

                {/* 9. FAQ — objection handling */}
                <PromoFAQ />
            </main>

            <div className="fixed inset-x-0 bottom-0 z-[60] grid grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur sm:hidden">
                <a href="#register-section" className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white">
                    ফ্রি ট্রায়াল
                    <ArrowRight className="h-4 w-4" />
                </a>
                <a
                    href="https://wa.me/8801577303608?text=%E0%A6%86%E0%A6%AE%E0%A6%BF%20AndgatePOS%20%E0%A6%AB%E0%A7%8D%E0%A6%B0%E0%A6%BF%20%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%AF%E0%A6%BC%E0%A6%BE%E0%A6%B2%20%E0%A6%B6%E0%A7%81%E0%A6%B0%E0%A7%81%20%E0%A6%95%E0%A6%B0%E0%A6%A4%E0%A7%87%20%E0%A6%9A%E0%A6%BE%E0%A6%87"
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

            <PromoFooter />
        </div>
    );
}
