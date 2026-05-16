'use client';

import { useState, useEffect } from 'react';
import { useGetAffiliateCalculatorQuery } from '@/store/features/affiliate/affiliateApi';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

const TIERS = [
    { value: 'bronze',   label: 'ব্রোঞ্জ (২৫% + ৫%)' },
    { value: 'silver',   label: 'সিলভার (৩০% + ৮%)' },
    { value: 'gold',     label: 'গোল্ড (৩৫% + ১০%)' },
    { value: 'platinum', label: 'প্লাটিনাম (৪০% + ১২%)' },
];

const PLANS = [
    { label: 'স্টার্টার দুকান (৳৯৯৯)', value: 999 },
    { label: 'গ্রোয়িং বিজনেস (৳২,৪৯৯)', value: 2499 },
    { label: 'এন্টারপ্রাইজ (৳৪,৯৯৯)', value: 4999 },
    { label: 'কাস্টম', value: 0 },
];

export default function AffiliateCalculatorPage() {
    const [tier, setTier] = useState('bronze');
    const [planValue, setPlanValue] = useState(2000);
    const [customFee, setCustomFee] = useState('');
    const [customers, setCustomers] = useState(10);
    const [isCustomPlan, setIsCustomPlan] = useState(false);

    const monthlyFee = isCustomPlan ? Number(customFee) || 0 : planValue;

    const { data, isFetching } = useGetAffiliateCalculatorQuery(
        { tier, monthly_fee: monthlyFee, customers },
        { skip: monthlyFee <= 0 || customers <= 0 }
    );

    const result = data?.data;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">কমিশন ক্যালকুলেটর</h1>
                    <p className="text-slate-500">আপনি কত আয় করতে পারেন দেখুন</p>
                </div>

                <div className="rounded-2xl bg-white shadow-md border border-slate-200 p-6 mb-6 space-y-5">
                    {/* Tier */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">টায়ার</label>
                        <div className="grid grid-cols-2 gap-2">
                            {TIERS.map(({ value, label }) => (
                                <button key={value} onClick={() => setTier(value)}
                                    className={`rounded-xl py-2 px-3 text-sm font-medium border-2 transition ${tier === value ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-600 hover:border-primary/40'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Plan */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">সাবস্ক্রিপশন প্ল্যান</label>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            {PLANS.map(({ label, value }) => (
                                <button key={label} onClick={() => { if (value === 0) { setIsCustomPlan(true); } else { setIsCustomPlan(false); setPlanValue(value); } }}
                                    className={`rounded-xl py-2 px-3 text-sm font-medium border-2 transition text-left ${(!isCustomPlan && planValue === value) || (isCustomPlan && value === 0) ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-600 hover:border-primary/40'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                        {isCustomPlan && (
                            <input type="number" min="100" placeholder="মাসিক ফি লিখুন (৳)"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                value={customFee} onChange={(e) => setCustomFee(e.target.value)} />
                        )}
                    </div>

                    {/* Customers */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            কতজন কাস্টমার রেফার করবেন? <span className="text-primary font-bold">{customers} জন</span>
                        </label>
                        <input type="range" min={1} max={200} value={customers}
                            onChange={(e) => setCustomers(Number(e.target.value))}
                            className="w-full accent-primary" />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>১ জন</span><span>৫০ জন</span><span>১০০ জন</span><span>২০০ জন</span>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {result && !isFetching && monthlyFee > 0 && (
                    <div className="rounded-2xl bg-gradient-to-br from-primary to-[#034d79] text-white p-6 shadow-xl">
                        <h2 className="text-lg font-bold mb-4 text-white/90">আপনার আনুমানিক আয়</h2>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {[
                                { label: 'প্রথম মাস', value: `৳${Number(result.first_month).toLocaleString()}`, sub: 'এককালীন' },
                                { label: 'প্রতি মাস', value: `৳${Number(result.monthly_recurring).toLocaleString()}`, sub: 'রিকারিং' },
                                { label: 'প্রথম বছর', value: `৳${Number(result.total_year_1).toLocaleString()}`, sub: 'মোট' },
                            ].map(({ label, value, sub }) => (
                                <div key={label} className="text-center">
                                    <div className="text-xl sm:text-2xl font-bold text-yellow-300">{value}</div>
                                    <div className="text-xs text-white/70 mt-0.5">{label}</div>
                                    <div className="text-xs text-white/50">{sub}</div>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-xl bg-white/10 px-4 py-3 text-sm text-center">
                            {customers} জন কাস্টমার × ৳{monthlyFee}/মাস × <strong>{tier}</strong> টায়ার
                        </div>
                        <div className="mt-4 text-center">
                            <a href="/affiliate" className="inline-block rounded-xl bg-yellow-400 text-slate-900 font-bold px-8 py-2.5 hover:bg-yellow-300 transition">
                                এখনই শুরু করুন →
                            </a>
                        </div>
                    </div>
                )}

                {monthlyFee <= 0 && (
                    <div className="rounded-2xl bg-slate-100 p-6 text-center text-slate-400">
                        মাসিক ফি লিখুন
                    </div>
                )}
            </div>
        </div>
    );
}
