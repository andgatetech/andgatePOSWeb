'use client';
import PricingPlansGrid from '@/components/pricing/PricingPlansGrid';
import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import { ArrowRight, Check, ChevronDown, Clock, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Footer from '../terms-of-service/Footer';

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function PricingPage() {
    const { t } = getTranslation();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs: { question: string; answer: string }[] = [];
    let faqIndex = 0;
    while (faqIndex < 10) {
        const question = t(`pricing_page.faq.questions.${faqIndex}.q`);
        if (question.startsWith('pricing_page.faq')) break;
        faqs.push({ question, answer: t(`pricing_page.faq.questions.${faqIndex}.a`) });
        faqIndex++;
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-white">

                {/* Hero */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79] pb-24 pt-32">
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
                        <h1 className="mb-5 text-4xl font-black leading-tight text-white sm:text-5xl xl:text-6xl">
                            {t('pricing_page.hero.title') || 'Simple, Transparent'}<br />
                            <span className="bg-gradient-to-r from-[#5bb8e8] to-[#e8f4fb] bg-clip-text text-transparent">Pricing</span>
                        </h1>
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

                {/* Plans + comparison — shared with homepage */}
                <section className="bg-slate-50 py-14 sm:py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <PricingPlansGrid showComparison={true} />
                    </div>
                </section>

                {/* FAQ */}
                {faqs.length > 0 && (
                    <section className="bg-white py-16">
                        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-12 text-center">
                                <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('pricing_page.faq.title')}</h2>
                                <p className="text-base text-gray-500">{t('pricing_page.faq.subtitle')}</p>
                            </div>
                            <div className="space-y-3">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                                        <button
                                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                            className="flex w-full items-center justify-between px-6 py-5 text-left"
                                        >
                                            <span className="font-semibold text-gray-900">{faq.question}</span>
                                            <ChevronDown className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`} />
                                        </button>
                                        {openFaq === index && (
                                            <div className="border-t border-gray-50 px-6 py-5">
                                                <p className="text-sm leading-relaxed text-gray-600">{faq.answer}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Trust */}
                <section className="bg-slate-50 py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-8 sm:grid-cols-3">
                            {[
                                { icon: <Shield className="h-7 w-7 text-[#046ca9]" />, title: t('pricing_page.trust.secure_title'), desc: t('pricing_page.trust.secure_subtitle') },
                                { icon: <Clock className="h-7 w-7 text-[#046ca9]" />, title: t('pricing_page.trust.support_title'), desc: t('pricing_page.trust.support_subtitle') },
                                { icon: <Users className="h-7 w-7 text-[#046ca9]" />, title: t('pricing_page.trust.trusted_title'), desc: t('pricing_page.trust.trusted_subtitle') },
                            ].map((item, i) => (
                                <div key={i} className="text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#046ca9]/8">
                                        {item.icon}
                                    </div>
                                    <h3 className="mb-2 font-bold text-gray-900">{item.title}</h3>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79] py-20">
                    <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    />
                    <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                        <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">{t('pricing_page.cta.title')}</h2>
                        <p className="mb-8 text-base text-white/70">{t('pricing_page.cta.subtitle')}</p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href="/register"
                                className="group flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-[#046ca9] shadow-lg transition-all hover:scale-105 sm:w-auto"
                            >
                                {t('pricing_page.cta.start_trial')}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="/contact"
                                className="w-full rounded-full border border-white/20 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 sm:w-auto"
                            >
                                {t('pricing_page.cta.contact_sales')}
                            </Link>
                        </div>
                        <p className="mt-6 text-xs text-white/50">{t('pricing_page.cta.guarantee')}</p>
                    </div>
                </section>

            </div>
            <Footer />
        </MainLayout>
    );
}
