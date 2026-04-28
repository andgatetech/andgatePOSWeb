'use client';

import { getTranslation } from '@/i18n';
import { Quote, Star } from 'lucide-react';

export default function TestimonialsSection() {
    const { t, data } = getTranslation();

    const testimonials: {
        name: string;
        business: string;
        image: string;
        rating: number;
        review: string;
    }[] = data.testimonials?.testimonials || [];

    const header = data.testimonials?.header || {};

    const avatarColors = [
        'from-[#046ca9] to-[#034d79]',
        'from-[#035887] to-[#046ca9]',
        'from-emerald-500 to-green-600',
        'from-[#e79237] to-[#c47920]',
        'from-rose-500 to-pink-600',
        'from-teal-500 to-cyan-600',
    ];

    if (!testimonials.length) return null;

    return (
        <section className="relative overflow-hidden bg-slate-50 py-24">
            {/* Subtle background pattern */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: 'radial-gradient(circle, #046ca9 1px, transparent 1px)', backgroundSize: '36px 36px' }}
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-16 text-center">
                    <span className="mb-4 inline-block rounded-full bg-[#046ca9]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#046ca9]">
                        {t('testimonials.header.badge') || 'Testimonials'}
                    </span>
                    <h2 className="mb-4 text-3xl font-black text-gray-900 sm:text-4xl">
                        {header.title || t('testimonials.header.title') || 'Loved by Businesses'}
                    </h2>
                    <p className="mx-auto max-w-2xl text-base text-gray-500">
                        {header.subtitle || t('testimonials.header.subtitle') || 'See what our customers say about AndgatePOS.'}
                    </p>
                </div>

                {/* Testimonial Cards Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial, index) => {
                        const initials = testimonial.name
                            ? testimonial.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
                            : '?';
                        const colorGradient = avatarColors[index % avatarColors.length];

                        return (
                            <div
                                key={index}
                                className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#046ca9]/15 hover:shadow-xl hover:shadow-[#046ca9]/5"
                            >
                                {/* Quote icon decoration */}
                                <div className="absolute right-7 top-7 opacity-5 transition-opacity duration-300 group-hover:opacity-10">
                                    <Quote className="h-16 w-16 fill-[#046ca9] text-[#046ca9]" />
                                </div>

                                {/* Stars */}
                                <div className="mb-5 flex gap-0.5">
                                    {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>

                                {/* Review text */}
                                <blockquote className="mb-6 flex-1 text-sm leading-relaxed text-gray-600">
                                    &ldquo;{testimonial.review}&rdquo;
                                </blockquote>

                                {/* Author */}
                                <div className="flex items-center gap-3">
                                    {testimonial.image ? (
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.business}
                                            className="h-11 w-11 rounded-xl bg-gray-100 object-contain p-1.5 ring-1 ring-gray-100"
                                        />
                                    ) : (
                                        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colorGradient} text-xs font-bold text-white shadow-md`}>
                                            {initials}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                                        <p className="text-xs font-medium text-[#046ca9]">{testimonial.business}</p>
                                    </div>
                                </div>

                                {/* Bottom accent bar on hover */}
                                <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-2xl bg-gradient-to-r from-[#046ca9] to-[#034d79] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            </div>
                        );
                    })}
                </div>

                {/* Trust bar */}
                <div className="mt-16 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="flex -space-x-2">
                            {['from-[#046ca9] to-[#034d79]', 'from-[#035887] to-[#046ca9]', 'from-emerald-500 to-green-600'].map((c, i) => (
                                <div key={i} className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${c} ring-2 ring-white text-[10px] font-bold text-white`}>
                                    {String.fromCharCode(65 + i)}
                                </div>
                            ))}
                        </div>
                        <span>Join <span className="font-semibold text-gray-900">100+</span> businesses</span>
                    </div>
                    <div className="hidden h-4 w-px bg-gray-200 sm:block" />
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                        <span><span className="font-semibold text-gray-900">4.9/5</span> average rating</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
