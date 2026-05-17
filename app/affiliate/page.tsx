'use client';

import { useState } from 'react';
import { useRegisterAffiliateMutation, useGetAffiliateLeaderboardQuery } from '@/store/features/affiliate/affiliateApi';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getTranslation } from '@/i18n';

const TIERS = [
    { name: 'Bronze',   labelKey: 'ব্রোঞ্জ',   color: 'bg-amber-700', first: 25, recurring: 5,  unlock: 'যেকোনো ব্যক্তি',                       customers: 10,  year1: 16000  },
    { name: 'Silver',   labelKey: 'সিলভার',   color: 'bg-slate-400', first: 30, recurring: 8,  unlock: '৫টি সক্রিয় কাস্টমার',                  customers: 20,  year1: 38400  },
    { name: 'Gold',     labelKey: 'গোল্ড',     color: 'bg-amber-400', first: 35, recurring: 10, unlock: '২০টি সক্রিয় কাস্টমার + রিভিউ',         customers: 50,  year1: 132000 },
    { name: 'Platinum', labelKey: 'প্লাটিনাম', color: 'bg-primary',   first: 40, recurring: 12, unlock: '৫০+ সক্রিয় কাস্টমার + অনুমোদন',        customers: 100, year1: 292800 },
];

const AFFILIATE_TYPES = [
    { emoji: '💻', label: 'IT ভাই',                   desc: 'কম্পিউটার সার্ভিস, হার্ডওয়্যার শপ' },
    { emoji: '📊', label: 'হিসাব ভাই',                desc: 'অ্যাকাউন্ট্যান্ট, ট্যাক্স কনসালট্যান্ট' },
    { emoji: '🖨️', label: 'হার্ডওয়্যার বিক্রেতা',    desc: 'প্রিন্টার, ব্যারকোড স্ক্যানার' },
    { emoji: '📱', label: 'কন্টেন্ট ভাই',             desc: 'Facebook/YouTube বিজনেস পেজ' },
    { emoji: '🏪', label: 'বাজার ভাই',                desc: 'সন্তুষ্ট কাস্টমার, সহ-ব্যবসায়ী' },
    { emoji: '🤝', label: 'NGO/MFI অফিসার',           desc: 'BRAC, ASA, Grameen ফিল্ড ওয়ার্কার' },
    { emoji: '🎓', label: 'ইউনিভার্সিটি অ্যাম্বাসেডর', desc: 'BBA/MBA ছাত্র' },
];

const FAQ_KEYS = [
    { qk: 'aff_faq_q1',  ak: 'aff_faq_a1'  },
    { qk: 'aff_faq_q2',  ak: 'aff_faq_a2'  },
    { qk: 'aff_faq_q3',  ak: 'aff_faq_a3'  },
    { qk: 'aff_faq_q4',  ak: 'aff_faq_a4'  },
    { qk: 'aff_faq_q5',  ak: 'aff_faq_a5'  },
    { qk: 'aff_faq_q6',  ak: 'aff_faq_a6'  },
    { qk: 'aff_faq_q7',  ak: 'aff_faq_a7'  },
    { qk: 'aff_faq_q8',  ak: 'aff_faq_a8'  },
    { qk: 'aff_faq_q9',  ak: 'aff_faq_a9'  },
    { qk: 'aff_faq_q10', ak: 'aff_faq_a10' },
    { qk: 'aff_faq_q11', ak: 'aff_faq_a11' },
];

export default function AffiliateLandingPage() {
    const { t } = getTranslation();
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
                    <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-semibold mb-4">{t('aff_hero_badge')}</span>
                    <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
                        {t('aff_hero_title_1')}<br />{t('aff_hero_title_2')}
                    </h1>
                    <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                        Earn commission by referring real businesses to AndgatePOS. Commission is paid after successful subscription payment and lock period.
                    </p>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
                        <button onClick={() => setShowForm(true)} className="rounded-xl bg-yellow-400 text-slate-900 font-bold px-6 py-3 text-base sm:text-lg hover:bg-yellow-300 transition">
                            {t('aff_hero_cta')}
                        </button>
                        <a href="#tiers" className="rounded-xl border-2 border-white/60 px-6 py-3 text-base sm:text-lg font-semibold hover:bg-white/10 transition text-center">
                            {t('aff_hero_commission_btn')}
                        </a>
                    </div>
                    <div className="mt-8 flex flex-wrap justify-center gap-5 sm:gap-8 text-center">
                        {[
                            ['৳০',   t('aff_hero_stat_no_fee_label')],
                            ['৩০ দিন', t('aff_hero_stat_lock_label')],
                            ['bKash', t('aff_hero_stat_payment_label')],
                            ['৳৫০০', t('aff_hero_stat_min_withdraw_label')],
                        ].map(([v, l]) => (
                            <div key={l}><div className="text-2xl font-bold text-yellow-300">{v}</div><div className="text-sm text-white/70">{l}</div></div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Affiliate types */}
            <section className="py-14 px-4 bg-white">
                <div className="mx-auto max-w-4xl">
                    <h2 className="text-2xl font-bold text-center mb-2">{t('aff_types_title')}</h2>
                    <p className="text-center text-slate-500 mb-8">{t('aff_types_subtitle')}</p>
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
                    <h2 className="text-2xl font-bold text-center mb-2">{t('aff_tiers_title')}</h2>
                    <p className="text-center text-slate-500 mb-8">{t('aff_tiers_subtitle')}</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {TIERS.map((tier) => (
                            <div key={tier.name} className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                                <div className={`${tier.color} text-white px-4 py-3`}>
                                    <div className="font-bold text-lg">{tier.labelKey}</div>
                                    <div className="text-xs text-white/80">{tier.unlock}</div>
                                </div>
                                <div className="p-4 space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-slate-500">{t('aff_tiers_first_month')}</span><span className="font-bold text-success">{tier.first}%</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">{t('aff_tiers_retention')}</span><span className="font-bold text-primary">{tier.recurring}%</span></div>
                                    <hr />
                                    <div className="flex justify-between text-xs"><span className="text-slate-400">({tier.customers} কাস্টমার)</span></div>
                                    <div className="text-center font-bold text-lg text-slate-800">৳{tier.year1.toLocaleString('bn-BD')}</div>
                                    <div className="text-center text-xs text-slate-400">{t('aff_tiers_example_note')}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm text-center text-primary font-medium">
                        Income depends on actual successful customer subscriptions. AndgatePOS does not guarantee any fixed income.
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-14 px-4 bg-white">
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-2xl font-bold text-center mb-8">{t('aff_how_title')}</h2>
                    <div className="space-y-4">
                        {[
                            ['১', t('aff_how_step1_title'), t('aff_how_step1_desc')],
                            ['২', t('aff_how_step2_title'), t('aff_how_step2_desc')],
                            ['৩', t('aff_how_step3_title'), t('aff_how_step3_desc')],
                            ['৪', t('aff_how_step4_title'), t('aff_how_step4_desc')],
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
                        <h2 className="text-2xl font-bold text-center mb-2">{t('aff_leaders_preview_title')}</h2>
                        <p className="text-center text-slate-500 mb-6 text-sm">{t('aff_leaders_preview_subtitle')}</p>
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
                    <h2 className="text-2xl font-bold text-center mb-8">{t('aff_faq_title')}</h2>
                    <div className="space-y-3">
                        {FAQ_KEYS.map(({ qk, ak }, i) => (
                            <div key={qk} className="rounded-xl border border-slate-200">
                                <button
                                    className="w-full flex items-center justify-between px-5 py-4 text-left font-medium"
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                >
                                    <span>{t(qk)}</span>
                                    {openFaq === i ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                                </button>
                                {openFaq === i && <div className="px-5 pb-4 text-sm text-slate-600">{t(ak)}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 bg-gradient-to-br from-primary to-[#034d79] text-white text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t('aff_cta_title')}</h2>
                <p className="text-white/80 mb-6">{t('aff_cta_subtitle')}</p>
                <button onClick={() => setShowForm(true)} className="rounded-xl bg-yellow-400 text-slate-900 font-bold px-10 py-3 text-lg hover:bg-yellow-300 transition">
                    {t('aff_cta_btn')}
                </button>
            </section>

            {/* Registration Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-y-auto max-h-[95vh] sm:max-h-[90vh]">
                        {success ? (
                            <div className="p-8 text-center">
                                <CheckCircle className="mx-auto mb-4 h-14 w-14 text-success" />
                                <h3 className="text-xl font-bold mb-2">{t('aff_reg_success_title')}</h3>
                                <p className="text-slate-500 mb-4">{t('aff_reg_success_code_label')}</p>
                                <div className="bg-primary/10 rounded-xl px-6 py-3 text-2xl font-bold text-primary tracking-widest mb-2">{success.code}</div>
                                <p className="text-sm text-slate-500 mb-4">{t('aff_reg_success_promo_label')} <strong>{success.promo_code}</strong></p>
                                <div className="bg-slate-50 rounded-lg px-4 py-2 text-xs text-slate-600 break-all mb-6">
                                    {t('aff_reg_success_ref_link_label')} {success.ref_link}
                                </div>
                                <button onClick={() => { setShowForm(false); setSuccess(null); }} className="btn bg-primary text-white rounded-xl px-8 py-2 font-semibold hover:opacity-90">
                                    {t('aff_reg_success_ok_btn')}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold">{t('aff_reg_title')}</h3>
                                    <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
                                </div>

                                {error && (
                                    <div className="rounded-lg bg-danger/10 border border-danger/20 px-4 py-2 text-sm text-danger">
                                        {(error as any)?.data?.message || t('aff_reg_error_default')}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium mb-1">{t('aff_reg_field_name')}</label>
                                        <input required className="input w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t('aff_reg_field_name_ph')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('aff_reg_field_mobile')}</label>
                                        <input required className="input w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} placeholder="01XXXXXXXXX" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('aff_reg_field_bkash')}</label>
                                        <input className="input w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={formData.bkash_number}
                                            onChange={(e) => setFormData({ ...formData, bkash_number: e.target.value })} placeholder="01XXXXXXXXX" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium mb-1">{t('aff_reg_field_email')}</label>
                                        <input type="email" className="input w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium mb-1">{t('aff_reg_field_type')}</label>
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
                                        <label className="block text-sm font-medium mb-1">{t('aff_reg_field_network')}</label>
                                        <textarea rows={2} className="input w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" value={formData.network_description}
                                            onChange={(e) => setFormData({ ...formData, network_description: e.target.value })} placeholder="যেমন: আমি মিরপুরে ৫০টি দোকানে IT সেবা দিই" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium mb-1">{t('aff_reg_field_parent_code')}</label>
                                        <input className="input w-full border border-slate-200 rounded-lg px-3 py-2 text-sm uppercase" value={formData.parent_code}
                                            onChange={(e) => setFormData({ ...formData, parent_code: e.target.value.toUpperCase() })} placeholder="ALAM2024 (যদি কেউ রেফার করে থাকে)" />
                                        <p className="text-xs text-slate-400 mt-0.5">{t('aff_reg_parent_code_note')}</p>
                                    </div>
                                </div>

                                <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-primary text-white font-bold py-3 hover:opacity-90 transition disabled:opacity-60">
                                    {isLoading ? t('aff_reg_processing') : t('aff_reg_submit')}
                                </button>
                                <p className="text-xs text-slate-400 text-center">{t('aff_reg_terms_note')}</p>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
