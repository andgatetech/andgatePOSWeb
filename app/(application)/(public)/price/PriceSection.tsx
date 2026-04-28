'use client';

import PricingPlansGrid from '@/components/pricing/PricingPlansGrid';
import { getTranslation } from '@/i18n';
import { Check, Shield } from 'lucide-react';

interface PriceSectionProps {
    id?: string;
}

export default function PriceSection({ id }: PriceSectionProps) {
    const { t } = getTranslation();

    return (
        <div id={id} className="bg-white">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79] pb-20 pt-16">
                <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
                        <Shield className="h-3 w-3" />
                        {t('pricing_page.hero.badge_text') || 'Flexible Pricing Plans'}
                    </div>
                    <h2 className="mb-5 text-4xl font-black leading-tight text-white sm:text-5xl">
                        {t('pricing_page.hero.title') || 'Simple, Transparent Pricing'}
                    </h2>
                    <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
                        {t('pricing_page.hero.subtitle') || 'Choose the plan that best fits your business needs.'}
                    </p>
                    <div className="flex flex-col items-center justify-center gap-3 text-sm sm:flex-row sm:gap-6">
                        {[
                            t('pricing_page.hero.benefits.no_setup') || 'No Setup Fee',
                            t('pricing_page.hero.benefits.cancel_anytime') || 'Cancel Anytime',
                            t('pricing_page.hero.benefits.support') || '24/7 Support',
                        ].map((label, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-white/80">
                                <Check className="h-4 w-4 text-white/90" />
                                {label}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Plans */}
            <section className="bg-slate-50 py-14 sm:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <PricingPlansGrid showComparison={true} />
                </div>
            </section>
        </div>
    );
}
