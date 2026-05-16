'use client';

import { useState } from 'react';
import { useRegisterAffiliateMutation, useGetAffiliateLeaderboardQuery } from '@/store/features/affiliate/affiliateApi';
import { Award, TrendingUp, Users, Zap, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const TIERS = [
    { name: 'Bronze', label: 'ব্রোঞ্জ', color: 'bg-amber-700', first: 25, recurring: 5, unlock: 'যেকোনো ব্যক্তি', customers: 10, year1: 16000 },
    { name: 'Silver', label: 'সিলভার', color: 'bg-slate-400', first: 30, recurring: 8, unlock: '৫টি সক্রিয় রেফারেল', customers: 20, year1: 38400 },
    { name: 'Gold',   label: 'গোল্ড',   color: 'bg-amber-400', first: 35, recurring: 10, unlock: '২০টি রেফারেল', customers: 50, year1: 132000 },
    { name: 'Platinum', label: 'প্লাটিনাম', color: 'bg-primary', first: 40, recurring: 12, unlock: '৫০+ রেফারেল', customers: 100, year1: 292800 },
];

const AFFILIATE_TYPES = [
    { emoji: '💻', label: 'IT ভাই', desc: 'কম্পিউটার সার্ভিস, হার্ডওয়্যার শপ' },
    { emoji: '📊', label: 'হিসাব ভাই', desc: 'অ্যাকাউন্ট্যান্ট, ট্যাক্স কনসালট্যান্ট' },
    { emoji: '🖨️', label: 'হার্ডওয়্যার বিক্রেতা', desc: 'প্রিন্টার, ব্যারকোড স্ক্যানার' },
    { emoji: '📱', label: 'কন্টেন্ট ভাই', desc: 'Facebook/YouTube বিজনেস পেজ' },
    { emoji: '🏪', label: 'বাজার ভাই', desc: 'সন্তুষ্ট কাস্টমার, সহ-ব্যবসায়ী' },
    { emoji: '🤝', label: 'NGO/MFI অফিসার', desc: 'BRAC, ASA, Grameen ফিল্ড ওয়ার্কার' },
    { emoji: '🎓', label: 'ইউনিভার্সিটি অ্যাম্বাসেডর', desc: 'BBA/MBA ছাত্র' },
];

const FAQS = [
    { q: 'কিভাবে পেমেন্ট পাব?', a: 'bKash / Nagad এ সরাসরি পেমেন্ট। প্রতি মাসে ৳৫০০+ ব্যালেন্স হলে উইথড্র করুন।' },
    { q: 'কমিশন কতদিন পাব?', a: 'প্রথম মাসে বড় কমিশন, তারপর ১২ মাস পর্যন্ত রিকারিং কমিশন। মানে এক বছর নিষ্ক্রিয় থেকেও আয় আসবে।' },
    { q: 'কিভাবে প্রোডাক্ট দেখাব?', a: 'রেজিস্ট্রেশনের পর একটি ফুল ডেমো একাউন্ট পাবেন — রিয়েল ডেটাসহ। যেকোনো দোকানে ফোনেই দেখাতে পারবেন।' },
    { q: 'নিজে কি রেফার করতে পারব?', a: 'না। নিজেকে বা পরিবারকে রেফার করা যাবে না। ৩০ দিন সাবস্ক্রিপশন চালু থাকলে কমিশন নিশ্চিত হয়।' },
];

export default function AffiliateLandingPage() {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', mobile: '', email: '', type: 'other', bkash_number: '', network_description: '', parent_code: '' });
    const [success, setSuccess] = useState<any>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const [registerAffiliate, { isLoading, error }] = useRegisterAffiliateMutation();
    const { data: leaderboardData } = useGetAffiliateLeaderboardQuery();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await registerAffiliate(formData).unwrap();
            setSuccess(res.data);
        } catch {}
    };

    return (
        <main className="text-slate-800">

            {/* Hero */}
            <section className="bg-gradient-to-br from-primary to-[#034d79] text-white py-12 sm:py-20 px-4">
                <div className="mx-auto max-w-4xl text-center">
                    <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-semibold mb-4">andgatePOS পার্টনার প্রোগ্রাম</span>
                    <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
                        প্রতি মাসে <span className="text-yellow-300">৳১০,০০০+</span> আয় করুন<br />শুধু রেফার করে
                    </h1>
                    <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                        আপনার পরিচিত দোকানদারদের andgatePOS ব্যবহার করান। প্রথম মাসে বড় কমিশন + ১২ মাস রিকারিং। bKash/Nagad এ পেমেন্ট।
                    </p>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
                        <button onClick={() => setShowForm(true)} className="rounded-xl bg-yellow-400 text-slate-900 font-bold px-6 py-3 text-base sm:text-lg hover:bg-yellow-300 transition">
                            এখনই রেজিস্ট্রেশন করুন — বিনামূল্যে
                        </button>
                        <a href="#tiers" className="rounded-xl border-2 border-white/60 px-6 py-3 text-base sm:text-lg font-semibold hover:bg-white/10 transition text-center">
                            কমিশন দেখুন ↓
                        </a>
                    </div>
                    <div className="mt-8 flex flex-wrap justify-center gap-5 sm:gap-8 text-center">
                        {[['৳০', 'যোগদান ফি নেই'], ['৩০ দিন', 'কমিশন লক পিরিয়ড'], ['bKash', 'প্রাইমারি পেমেন্ট'], ['৳৫০০', 'মিনিমাম উইথড্র']].map(([v, l]) => (
                            <div key={l}><div className="text-2xl font-bold text-yellow-300">{v}</div><div className="text-sm text-white/70">{l}</div></div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Affiliate types */}
            <section className="py-14 px-4 bg-white">
                <div className="mx-auto max-w-4xl">
                    <h2 className="text-2xl font-bold text-center mb-2">কারা পার্টনার হতে পারবেন?</h2>
                    <p className="text-center text-slate-500 mb-8">আপনার নেটওয়ার্ক আছে মানেই আপনি যোগ্য</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {AFFILIATE_TYPES.map(({ emoji, label, desc }) => (
                            <div key={label} className="rounded-xl border border-slate-200 p-4 text-center hover:shadow-md transition">
                                <div className="text-3xl mb-2">{emoji}</div>
                                <div className="font-semibold">{label}</div>
                                <div className="text-xs text-slate-500 mt-1">{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tier table */}
            <section id="tiers" className="py-14 px-4 bg-slate-50">
                <div className="mx-auto max-w-4xl">
                    <h2 className="text-2xl font-bold text-center mb-2">৪ টায়ার কমিশন স্ট্রাকচার</h2>
                    <p className="text-center text-slate-500 mb-8">বেশি রেফারেল = বেশি কমিশন</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {TIERS.map((t) => (
                            <div key={t.name} className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                                <div className={`${t.color} text-white px-4 py-3`}>
                                    <div className="font-bold text-lg">{t.label}</div>
                                    <div className="text-xs text-white/80">{t.unlock}</div>
                                </div>
                                <div className="p-4 space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-slate-500">প্রথম মাস</span><span className="font-bold text-success">{t.first}%</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">রিকারিং (১২মাস)</span><span className="font-bold text-primary">{t.recurring}%</span></div>
                                    <hr />
                                    <div className="flex justify-between text-xs"><span className="text-slate-400">উদাহরণ ({t.customers} কাস্টমার)</span></div>
                                    <div className="text-center font-bold text-lg text-slate-800">৳{t.year1.toLocaleString('bn-BD')}</div>
                                    <div className="text-center text-xs text-slate-400">প্রথম বছরে (৳২,০০০/মাস সাবস্ক্রিপশন)</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm text-center text-primary font-medium">
                        প্লাটিনাম পার্টনাররা সাব-অ্যাফিলিয়েটের বিক্রিতেও <strong>+৫%</strong> ওভাররাইড পান
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-14 px-4 bg-white">
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-2xl font-bold text-center mb-8">কিভাবে কাজ করে?</h2>
                    <div className="space-y-4">
                        {[
                            ['১', 'রেজিস্ট্রেশন করুন', 'বিনামূল্যে সাইন আপ করুন। সাথে সাথে রেফারেল লিংক ও প্রোমো কোড পাবেন।'],
                            ['২', 'শেয়ার করুন', 'লিংক শেয়ার করুন বা পরিচিত দোকানদারকে সরাসরি দেখান।'],
                            ['৩', 'কাস্টমার সাইন আপ করলে', '১৪ দিন ফ্রি ট্রায়াল। পেইড সাবস্ক্রিপশনে কনভার্ট হলে কমিশন জমা হয়।'],
                            ['৪', 'bKash/Nagad এ নিন', '৩০ দিন পর কমিশন লক হয়। ৳৫০০+ হলে উইথড্র করুন।'],
                        ].map(([step, title, desc]) => (
                            <div key={step} className="flex gap-4 items-start">
                                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">{step}</div>
                                <div>
                                    <div className="font-semibold">{title}</div>
                                    <div className="text-sm text-slate-500 mt-0.5">{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Leaderboard preview */}
            {leaderboardData?.data && leaderboardData.data.length > 0 && (
                <section className="py-14 px-4 bg-slate-50">
                    <div className="mx-auto max-w-2xl">
                        <h2 className="text-2xl font-bold text-center mb-2">এই মাসের সেরা পার্টনার</h2>
                        <p className="text-center text-slate-500 mb-6 text-sm">তারা আয় করছেন — আপনিও পারবেন</p>
                        <div className="space-y-2">
                            {leaderboardData.data.slice(0, 5).map((m: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                                    <span className="font-bold text-primary w-6 text-center">{i + 1}</span>
                                    <span className="flex-1 font-medium">{m.name}</span>
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{m.tier}</span>
                                    <span className="text-sm font-bold text-success">৳{Number(m.total_earned).toLocaleString('bn-BD')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FAQ */}
            <section className="py-14 px-4 bg-white">
                <div className="mx-auto max-w-2xl">
                    <h2 className="text-2xl font-bold text-center mb-8">প্রশ্ন ও উত্তর</h2>
                    <div className="space-y-3">
                        {FAQS.map(({ q, a }, i) => (
                            <div key={i} className="rounded-xl border border-slate-200">
                                <button
                                    className="w-full flex items-center justify-between px-5 py-4 text-left font-medium"
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                >
                                    <span>{q}</span>
                                    {openFaq === i ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                                </button>
                                {openFaq === i && <div className="px-5 pb-4 text-sm text-slate-600">{a}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 bg-gradient-to-br from-primary to-[#034d79] text-white text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">আজই শুরু করুন</h2>
                <p className="text-white/80 mb-6">বিনামূল্যে রেজিস্ট্রেশন করুন। প্রথম রেফারেলেই ৳৫০০+ আয়।</p>
                <button onClick={() => setShowForm(true)} className="rounded-xl bg-yellow-400 text-slate-900 font-bold px-10 py-3 text-lg hover:bg-yellow-300 transition">
                    পার্টনার হিসেবে রেজিস্ট্রেশন করুন
                </button>
            </section>

            {/* Registration Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-y-auto max-h-[95vh] sm:max-h-[90vh]">
                        {success ? (
                            <div className="p-8 text-center">
                                <CheckCircle className="mx-auto mb-4 h-14 w-14 text-success" />
                                <h3 className="text-xl font-bold mb-2">রেজিস্ট্রেশন সম্পন্ন!</h3>
                                <p className="text-slate-500 mb-4">আপনার রেফারেল কোড:</p>
                                <div className="bg-primary/10 rounded-xl px-6 py-3 text-2xl font-bold text-primary tracking-widest mb-2">{success.code}</div>
                                <p className="text-sm text-slate-500 mb-4">প্রোমো কোড: <strong>{success.promo_code}</strong></p>
                                <div className="bg-slate-50 rounded-lg px-4 py-2 text-xs text-slate-600 break-all mb-6">
                                    রেফারেল লিংক: {success.ref_link}
                                </div>
                                <button onClick={() => { setShowForm(false); setSuccess(null); }} className="btn bg-primary text-white rounded-xl px-8 py-2 font-semibold hover:opacity-90">
                                    ঠিক আছে
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold">পার্টনার রেজিস্ট্রেশন</h3>
                                    <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
                                </div>

                                {error && (
                                    <div className="rounded-lg bg-danger/10 border border-danger/20 px-4 py-2 text-sm text-danger">
                                        {(error as any)?.data?.message || 'রেজিস্ট্রেশন ব্যর্থ। আবার চেষ্টা করুন।'}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium mb-1">পুরো নাম *</label>
                                        <input required className="input w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="আপনার নাম লিখুন" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">মোবাইল নম্বর *</label>
                                        <input required className="input w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} placeholder="01XXXXXXXXX" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">bKash নম্বর</label>
                                        <input className="input w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={formData.bkash_number}
                                            onChange={(e) => setFormData({ ...formData, bkash_number: e.target.value })} placeholder="01XXXXXXXXX" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium mb-1">ইমেইল (ঐচ্ছিক)</label>
                                        <input type="email" className="input w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium mb-1">আপনি কে?</label>
                                        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                            <option value="it_bhai">IT ভাই (কম্পিউটার সার্ভিস)</option>
                                            <option value="accountant">হিসাব ভাই (অ্যাকাউন্ট্যান্ট)</option>
                                            <option value="hardware_seller">হার্ডওয়্যার বিক্রেতা</option>
                                            <option value="content_creator">কন্টেন্ট ক্রিয়েটর</option>
                                            <option value="happy_customer">সন্তুষ্ট কাস্টমার</option>
                                            <option value="ngo_officer">NGO/MFI অফিসার</option>
                                            <option value="university_ambassador">ইউনিভার্সিটি স্টুডেন্ট</option>
                                            <option value="other">অন্যান্য</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium mb-1">আপনার নেটওয়ার্ক সম্পর্কে বলুন (ঐচ্ছিক)</label>
                                        <textarea rows={2} className="input w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" value={formData.network_description}
                                            onChange={(e) => setFormData({ ...formData, network_description: e.target.value })} placeholder="যেমন: আমি মিরপুরে ৫০টি দোকানে IT সেবা দিই" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium mb-1">রেফারকারীর কোড (ঐচ্ছিক)</label>
                                        <input className="input w-full border border-slate-200 rounded-lg px-3 py-2 text-sm uppercase" value={formData.parent_code}
                                            onChange={(e) => setFormData({ ...formData, parent_code: e.target.value.toUpperCase() })} placeholder="ALAM2024 (যদি কেউ রেফার করে থাকে)" />
                                        <p className="text-xs text-slate-400 mt-0.5">যদি কোনো পার্টনার আপনাকে রেফার করে থাকেন, তার কোড দিন</p>
                                    </div>
                                </div>

                                <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-primary text-white font-bold py-3 hover:opacity-90 transition disabled:opacity-60">
                                    {isLoading ? 'প্রসেস হচ্ছে...' : 'রেজিস্ট্রেশন করুন'}
                                </button>
                                <p className="text-xs text-slate-400 text-center">রেজিস্ট্রেশন করলে আমাদের পার্টনার শর্তাবলি মেনে নেওয়া হবে।</p>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
