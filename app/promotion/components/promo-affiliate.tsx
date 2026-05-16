'use client';

import Link from 'next/link';

const tiers = [
    { name: 'Bronze', color: 'text-amber-700 bg-amber-100 border-amber-300', firstMonth: '25%', recurring: '5%' },
    { name: 'Silver', color: 'text-slate-600 bg-slate-100 border-slate-300', firstMonth: '30%', recurring: '8%' },
    { name: 'Gold', color: 'text-yellow-700 bg-yellow-100 border-yellow-300', firstMonth: '35%', recurring: '10%' },
    { name: 'Platinum', color: 'text-purple-700 bg-purple-100 border-purple-300', firstMonth: '40%', recurring: '12%' },
];

const steps = [
    { num: '১', title: 'রেজিস্ট্রেশন করুন', desc: 'ফর্ম পূরণ করুন, অনুমোদন পান' },
    { num: '২', title: 'লিংক শেয়ার করুন', desc: 'আপনার unique ref লিংক দিয়ে বন্ধু-ব্যবসায়ীদের পাঠান' },
    { num: '৩', title: 'কমিশন আয় করুন', desc: 'প্রতি সাবস্ক্রিপশনে সরাসরি bKash/Nagad-এ পেমেন্ট' },
];

export default function PromoAffiliate() {
    return (
        <section id="affiliate-section" className="bg-gradient-to-br from-[#034d79] to-[#046ca9] py-16 sm:py-20">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
                {/* Header */}
                <div className="mb-10 text-center">
                    <span className="mb-3 inline-block rounded-full border border-[#e79237]/50 bg-[#e79237]/20 px-4 py-1 text-sm font-semibold text-[#e79237]">
                        💰 Affiliate Program
                    </span>
                    <h2 className="text-3xl font-bold text-white sm:text-4xl">
                        আয় করুন — প্রতি মাসে, বারবার
                    </h2>
                    <p className="mt-3 text-lg text-blue-100">
                        একজন ব্যবসায়ীকে andgatePOS-এ আনুন। সে সাবস্ক্রাইব করলে আপনি পান প্রথম মাসে বড় কমিশন + প্রতি মাসে recurring আয়।
                    </p>
                </div>

                {/* Tier cards */}
                <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {tiers.map((tier) => (
                        <div key={tier.name} className="rounded-xl border bg-white/10 p-4 text-center backdrop-blur-sm">
                            <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-bold ${tier.color}`}>
                                {tier.name}
                            </span>
                            <div className="mt-3">
                                <div className="text-2xl font-bold text-white">{tier.firstMonth}</div>
                                <div className="text-xs text-blue-200">প্রথম মাস</div>
                            </div>
                            <div className="mt-1">
                                <div className="text-lg font-semibold text-[#e79237]">{tier.recurring}</div>
                                <div className="text-xs text-blue-200">প্রতি মাস</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* How it works */}
                <div className="mb-10 grid gap-4 sm:grid-cols-3">
                    {steps.map((step) => (
                        <div key={step.num} className="flex items-start gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e79237] text-base font-bold text-white">
                                {step.num}
                            </div>
                            <div>
                                <div className="font-semibold text-white">{step.title}</div>
                                <div className="mt-0.5 text-sm text-blue-100">{step.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Highlights */}
                <div className="mb-10 flex flex-wrap justify-center gap-4 text-sm">
                    {[
                        '✅ কোনো বিনিয়োগ নেই',
                        '✅ bKash / Nagad পেমেন্ট',
                        '✅ ৳৫০০ থেকে উত্তোলন',
                        '✅ Tier upgrade হলে বেশি কমিশন',
                        '✅ Demo booking-এ ৳২০০ বোনাস',
                    ].map((item) => (
                        <span key={item} className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-white">
                            {item}
                        </span>
                    ))}
                </div>

                {/* CTA */}
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href="/affiliate"
                        className="rounded-xl bg-[#e79237] px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:bg-[#c47920] hover:shadow-xl"
                    >
                        এখনই Affiliate হন →
                    </Link>
                    <Link
                        href="/affiliate/calculator"
                        className="rounded-xl border border-white/30 bg-white/10 px-8 py-3 text-base font-semibold text-white transition-all hover:bg-white/20"
                    >
                        কমিশন Calculator দেখুন
                    </Link>
                </div>
            </div>
        </section>
    );
}
