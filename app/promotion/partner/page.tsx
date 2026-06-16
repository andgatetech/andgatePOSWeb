'use client';

import WhatsAppFloat from '@/components/whatsapp-float';
import { ArrowRight, BadgeCheck, Banknote, BarChart3, CheckCircle2, ShieldCheck, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../components/navbar';
import PromoFooter from '../components/promo-footer';
import PromotionTracker from '../components/promotion-tracker';

const tiers = [
    { name: 'Bronze', first: '50%', recurring: '10%', unlock: 'যেকোনো ব্যক্তি শুরু করতে পারবেন' },
    { name: 'Silver', first: '60%', recurring: '12%', unlock: '৫টি সক্রিয় কাস্টমার' },
    { name: 'Gold', first: '70%', recurring: '15%', unlock: '২০টি সক্রিয় কাস্টমার + রিভিউ' },
    { name: 'Platinum', first: '80%', recurring: '18%', unlock: '৫০+ সক্রিয় কাস্টমার + অনুমোদন' },
];

const partnerTypes = [
    'IT সার্ভিস প্রোভাইডার',
    'কম্পিউটার ও হার্ডওয়্যার শপ',
    'অ্যাকাউন্ট্যান্ট বা কনসালট্যান্ট',
    'Facebook/YouTube বিজনেস কন্টেন্ট ক্রিয়েটর',
    'সন্তুষ্ট AndgatePOS কাস্টমার',
    'ইউনিভার্সিটি বা লোকাল বিজনেস কমিউনিটি',
];

const steps = [
    { icon: Users, title: 'Partner হিসেবে রেজিস্টার করুন', desc: 'আপনার নাম, মোবাইল, bKash নম্বর এবং নেটওয়ার্ক সম্পর্কে ছোট তথ্য দিন।' },
    { icon: Sparkles, title: 'Referral link বা promo code শেয়ার করুন', desc: 'যেসব দোকান POS দরকার, তাদের কাছে AndgatePOS পরিচয় করিয়ে দিন।' },
    { icon: BadgeCheck, title: 'কাস্টমার সাবস্ক্রিপশন নিলে কমিশন', desc: 'সফল পেমেন্ট ও lock period শেষ হলে eligible কমিশন তৈরি হবে।' },
    { icon: Banknote, title: 'bKash/Nagad/Bank payout', desc: 'মিনিমাম payout পূরণ হলে verified partner payment পেতে পারবেন।' },
];

const trustPoints = [
    'Commission only after successful subscription payment',
    '৩০ দিনের lock period শেষে eligible payout',
    'Self-referral ও fake signup গ্রহণযোগ্য নয়',
    'Partner dashboard থেকে performance tracking',
];

export default function PartnerPromotionPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white text-slate-900">
            <PromotionTracker />
            <WhatsAppFloat />
            <Navbar />

            <main className="flex flex-1 flex-col pt-16">
                <section className="relative overflow-hidden bg-[#022d45] px-4 py-16 text-white sm:px-6 sm:py-24">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(135deg, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                    <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                        <div>
                            <span className="inline-flex rounded-full border border-[#e79237]/50 bg-[#e79237]/15 px-4 py-1.5 text-sm font-bold text-[#ffd29f]">
                                Bangladesh Partner Campaign
                            </span>
                            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                                আপনার পরিচিত দোকানদারকে POS দিন, successful sale থেকে কমিশন পান
                            </h1>
                            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                                Bangladesh-এর retail market এখন digital billing, stock control আর real-time report চায়। আপনি যদি ব্যবসায়ীদের সাথে কাজ করেন, AndgatePOS partner program আপনার trust network-কে revenue channel বানাতে সাহায্য করবে।
                            </p>
                            <div className="mt-6 grid max-w-2xl gap-3 text-sm sm:grid-cols-2">
                                {trustPoints.map((point) => (
                                    <div key={point} className="flex items-start gap-2 rounded-lg bg-white/10 px-3 py-2 text-slate-100">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#e79237]" />
                                        <span>{point}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link href="/affiliate" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e79237] px-6 py-3 font-bold text-white shadow-lg transition hover:bg-[#d17b24]">
                                    Partner হিসেবে যোগ দিন
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link href="/affiliate/calculator" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/15">
                                    কমিশন হিসাব করুন
                                    <BarChart3 className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/12 bg-white/8 p-5 shadow-2xl backdrop-blur">
                            <div className="rounded-xl bg-white p-5 text-slate-900">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#046ca9]/10 text-[#046ca9]">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">First payment commission</p>
                                        <p className="text-3xl font-black text-[#046ca9]">50%-80%</p>
                                    </div>
                                </div>
                                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <p className="font-bold">৳০</p>
                                        <p className="text-slate-500">Joining fee</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <p className="font-bold">৩০ দিন</p>
                                        <p className="text-slate-500">Lock period</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <p className="font-bold">৳৫০০</p>
                                        <p className="text-slate-500">Min payout</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <p className="font-bold">bKash</p>
                                        <p className="text-slate-500">Payment option</p>
                                    </div>
                                </div>
                                <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                                    Income depends on actual successful customer subscriptions. AndgatePOS does not guarantee fixed income.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white px-4 py-14 sm:px-6">
                    <div className="mx-auto max-w-6xl">
                        <div className="max-w-2xl">
                            <p className="text-sm font-bold uppercase tracking-wider text-[#046ca9]">Who can join</p>
                            <h2 className="mt-2 text-3xl font-black text-slate-950">যাদের কাছে already দোকানদারের trust আছে, তাদের জন্য</h2>
                            <p className="mt-3 text-slate-600">
                                Cold calling না করে আপনার existing relationship থেকে শুরু করুন। দোকানদারকে software চাপিয়ে নয়, তার হিসাবের সমস্যা বুঝে solution দিন।
                            </p>
                        </div>
                        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {partnerTypes.map((type) => (
                                <div key={type} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                                    <span className="font-semibold">{type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-slate-50 px-4 py-14 sm:px-6">
                    <div className="mx-auto max-w-6xl">
                        <div className="text-center">
                            <p className="text-sm font-bold uppercase tracking-wider text-[#046ca9]">Commission tiers</p>
                            <h2 className="mt-2 text-3xl font-black text-slate-950">Simple tier, clear commission, no fake promise</h2>
                            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                                Commission rate partner performance অনুযায়ী বাড়ে। Annual plans-এর ক্ষেত্রে business sustainability রাখার জন্য backend cap প্রযোজ্য।
                            </p>
                        </div>
                        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {tiers.map((tier) => (
                                <div key={tier.name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <h3 className="text-xl font-black text-slate-950">{tier.name}</h3>
                                    <p className="mt-1 min-h-10 text-sm text-slate-500">{tier.unlock}</p>
                                    <div className="mt-5 space-y-3">
                                        <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
                                            <span className="text-sm text-emerald-800">First payment</span>
                                            <span className="font-black text-emerald-700">{tier.first}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg bg-[#046ca9]/10 px-3 py-2">
                                            <span className="text-sm text-[#035887]">Recurring</span>
                                            <span className="font-black text-[#046ca9]">{tier.recurring}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-white px-4 py-14 sm:px-6">
                    <div className="mx-auto max-w-5xl">
                        <div className="text-center">
                            <p className="text-sm font-bold uppercase tracking-wider text-[#046ca9]">How it works</p>
                            <h2 className="mt-2 text-3xl font-black text-slate-950">চার ধাপে referral থেকে payout</h2>
                        </div>
                        <div className="mt-10 grid gap-5 md:grid-cols-2">
                            {steps.map(({ icon: Icon, title, desc }, index) => (
                                <div key={title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#046ca9] text-white">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-[#e79237]">Step {index + 1}</p>
                                        <h3 className="mt-1 text-lg font-black">{title}</h3>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-slate-50 px-4 py-14 sm:px-6">
                    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wider text-[#046ca9]">Ad-ready message</p>
                            <h2 className="mt-2 text-3xl font-black text-slate-950">যে কথাটি market-এ বলবেন</h2>
                            <p className="mt-3 leading-7 text-slate-600">
                                “আপনার দোকানে কি এখনো খাতায় হিসাব? AndgatePOS দিয়ে mobile billing, stock alert, profit report আর employee tracking একসাথে পাবেন।”
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {[
                                'Retail shop',
                                'Pharmacy',
                                'Fashion store',
                                'Grocery',
                                'Electronics',
                                'Wholesale',
                            ].map((segment) => (
                                <div key={segment} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <p className="font-black text-slate-950">{segment}</p>
                                    <p className="mt-1 text-sm text-slate-500">Billing, stock, due and profit report pain point নিয়ে approach করুন।</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-[#046ca9] px-4 py-14 text-center text-white sm:px-6">
                    <h2 className="text-3xl font-black">আজই AndgatePOS Partner Program শুরু করুন</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-white/80">
                        Real customer referral, transparent commission tracking, and Bangladesh-friendly payout process.
                    </p>
                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link href="/affiliate" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 font-bold text-[#046ca9] transition hover:bg-slate-100">
                            Register as Partner
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/affiliate/policies" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-7 py-3 font-bold text-white transition hover:bg-white/10">
                            Policy দেখুন
                            <ShieldCheck className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            </main>

            <PromoFooter />
        </div>
    );
}
