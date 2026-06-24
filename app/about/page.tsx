import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import { Store, Briefcase, Cpu, Cloud, Shield, Zap, Globe, Layers, Users, ArrowRight, CheckCircle2, Building2, ShoppingBag, Truck, BarChart3, Bot, Wrench, Network, Database, Lock, Award, HeartHandshake, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const technologies = (t: any) => [
    { icon: Cloud, label: t('about_tech_cloud_label'), desc: t('about_tech_cloud_desc') },
    { icon: Shield, label: t('about_tech_security_label'), desc: t('about_tech_security_desc') },
    { icon: Zap, label: t('about_tech_offline_label'), desc: t('about_tech_offline_desc') },
    { icon: Layers, label: t('about_tech_api_label'), desc: t('about_tech_api_desc') },
    { icon: Database, label: t('about_tech_db_label'), desc: t('about_tech_db_desc') },
    { icon: Globe, label: t('about_tech_multi_label'), desc: t('about_tech_multi_desc') },
];

const industries = [
    { icon: ShoppingBag, name: 'Retail Stores', nameBn: 'খুচরা দোকান' },
    { icon: Building2, name: 'Fashion & Clothing', nameBn: 'ফ্যাশন ও পোশাক' },
    { icon: Store, name: 'Pharmacies', nameBn: 'ফার্মেসি' },
    { icon: ShoppingBag, name: 'Electronics', nameBn: 'ইলেক্ট্রনিক্স' },
    { icon: Building2, name: 'Supermarkets', nameBn: 'সুপার মার্কেট' },
    { icon: Briefcase, name: 'Wholesale', nameBn: 'পাইকারি' },
    { icon: Store, name: 'Hardware', nameBn: 'হার্ডওয়্যার' },
    { icon: ShoppingBag, name: 'Stationery', nameBn: 'স্টেশনারি' },
    { icon: Building2, name: 'Cosmetics', nameBn: 'কসমেটিকস' },
    { icon: Store, name: 'Bakeries', nameBn: 'বেকারি' },
    { icon: ShoppingBag, name: 'Restaurants', nameBn: 'রেস্টুরেন্ট' },
    { icon: Building2, name: 'Jewelry', nameBn: 'জুয়েলারি' },
];

const expertise = (t: any) => [
    { icon: Cpu, title: t('about_expertise_saas_title'), desc: t('about_expertise_saas_desc') },
    { icon: Bot, title: t('about_expertise_ai_title'), desc: t('about_expertise_ai_desc') },
    { icon: Wrench, title: t('about_expertise_iot_title'), desc: t('about_expertise_iot_desc') },
    { icon: Cloud, title: t('about_expertise_cloud_title'), desc: t('about_expertise_cloud_desc') },
    { icon: Shield, title: t('about_expertise_qa_title'), desc: t('about_expertise_qa_desc') },
    { icon: Network, title: t('about_expertise_dx_title'), desc: t('about_expertise_dx_desc') },
];

const modules = (t: any) => [
    { icon: Store, label: t('about_morepos_modules').split(',')[0], done: true },
    { icon: Layers, label: t('about_morepos_modules').split(',')[1], done: true },
    { icon: BarChart3, label: t('about_morepos_modules').split(',')[2], done: true },
    { icon: Users, label: t('about_morepos_modules').split(',')[3], done: true },
    { icon: Truck, label: t('about_morepos_modules').split(',')[4], done: true },
    { icon: Globe, label: t('about_morepos_modules').split(',')[5], done: true },
    { icon: TrendingUp, label: t('about_morepos_modules').split(',')[6], done: true },
    { icon: Shield, label: t('about_morepos_modules').split(',')[7], done: true },
    { icon: Briefcase, label: t('about_morepos_modules').split(',')[8], done: false },
    { icon: HeartHandshake, label: t('about_morepos_modules').split(',')[9], done: false },
    { icon: Users, label: t('about_morepos_modules').split(',')[10], done: false },
    { icon: Bot, label: t('about_morepos_modules').split(',')[11], done: false },
    { icon: BarChart3, label: t('about_morepos_modules').split(',')[12], done: false },
    { icon: Globe, label: t('about_morepos_modules').split(',')[13], done: false },
    { icon: Layers, label: t('about_morepos_modules').split(',')[14], done: false },
    { icon: Zap, label: t('about_morepos_modules').split(',')[15], done: false },
];

export default function AboutPage() {
    const { t } = getTranslation();
    const T = technologies(t);
    const E = expertise(t);
    const M = modules(t);

    return (
        <MainLayout>
            {/* ── 1. HERO ───────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-b from-[#023a5c] via-[#034d79] to-[#046ca9] px-4 pb-24 pt-32 sm:px-6 lg:px-8">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white blur-3xl" />
                    <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white blur-3xl" />
                </div>
                <div className="relative mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-200">{t('about_hero_eyebrow')}</p>
                    <h1 className="mt-6 text-3xl font-black text-white sm:text-5xl lg:text-6xl">{t('about_hero_title')}</h1>
                    <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-blue-100 sm:text-lg">{t('about_hero_subtitle')}</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link href="/register" className="rounded-full bg-white px-7 py-3 text-sm font-bold text-[#046ca9] shadow-xl transition-all hover:scale-105">{t('about_hero_cta_start')}</Link>
                        <Link href="#more-than-pos" className="rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10">{t('about_hero_cta_learn')} ↓</Link>
                    </div>
                </div>
            </section>

            {/* ── 2. WHY WE EXIST ──────────────────────────────────── */}
            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{t('about_why_eyebrow')}</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('about_why_title')}</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                    <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">{t('about_why_p1')}</p>
                    <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">{t('about_why_p2')}</p>
                </div>
            </section>

            {/* ── 3. VISION ─────────────────────────────────────────── */}
            <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{t('about_vision_eyebrow')}</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('about_vision_title')}</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                    <p className="mx-auto mt-6 max-w-3xl text-xl font-semibold leading-relaxed text-gray-800">{t('about_vision_text')}</p>
                </div>
            </section>

            {/* ── 4. MISSION ────────────────────────────────────────── */}
            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{t('about_mission_eyebrow')}</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('about_mission_title')}</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                    <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">{t('about_mission_text')}</p>
                </div>
            </section>

            {/* ── 5. MORE THAN A POS ────────────────────────────────── */}
            <section id="more-than-pos" className="bg-[#023a5c] px-4 py-20 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-300">{t('about_morepos_eyebrow')}</p>
                    <h2 className="mt-3 text-3xl font-black sm:text-4xl">{t('about_morepos_title')}</h2>
                    <p className="mx-auto mt-6 max-w-3xl text-blue-100">{t('about_morepos_subtitle')}</p>
                </div>
                <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {M.map((m) => (
                        <div key={m.label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${m.done ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/10 bg-white/5'}`}>
                            <m.icon className={`h-5 w-5 ${m.done ? 'text-emerald-400' : 'text-white/30'}`} />
                            <span className={m.done ? 'text-sm text-white' : 'text-sm text-white/40'}>{m.label}</span>
                            {m.done && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" />}
                        </div>
                    ))}
                </div>
                <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-blue-200">
                    ✅ = {t('about_morepos_available')} &nbsp;&nbsp; ○ = {t('about_morepos_roadmap')}
                </p>
            </section>

            {/* ── 6. FUTURE OS ──────────────────────────────────────── */}
            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{t('about_future_eyebrow')}</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('about_future_title')}</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                    <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">{t('about_future_subtitle')}</p>
                </div>
                <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-3">
                    {[
                        { phase: t('about_future_phase1'), items: ['POS & Billing', 'Inventory', 'Purchase Orders', 'Customers', 'Multi-Store', 'Offline Mode'] },
                        { phase: t('about_future_phase2'), items: ['Accounting', 'AI Insights', 'eCommerce', 'Courier', 'Audit Logs', 'Store Types'] },
                        { phase: t('about_future_phase3'), items: ['CRM & Loyalty', 'HR & Payroll', 'Supplier Portal', 'AI Assistant', 'API Platform', 'Omnichannel'] },
                    ].map((p) => (
                        <div key={p.phase} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-[#046ca9]">{p.phase}</h3>
                            <ul className="mt-4 space-y-2">
                                {p.items.map((item) => (
                                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                                        <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#046ca9]" />{item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 7. HAWKERI ────────────────────────────────────────── */}
            <section className="bg-gradient-to-r from-[#046ca9] to-[#034d79] px-4 py-20 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-200">{t('about_hawkeri_eyebrow')}</p>
                    <h2 className="mt-3 text-3xl font-black sm:text-4xl">{t('about_hawkeri_title')}</h2>
                    <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-blue-100">{t('about_hawkeri_desc')}</p>
                    <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
                        {[
                            { title: t('about_hawkeri_physical'), desc: t('about_hawkeri_physical_desc') },
                            { title: t('about_hawkeri_online'), desc: t('about_hawkeri_online_desc') },
                            { title: t('about_hawkeri_unified'), desc: t('about_hawkeri_unified_desc') },
                        ].map((c) => (
                            <div key={c.title} className="rounded-xl border border-white/20 bg-white/10 p-5 text-left backdrop-blur-sm">
                                <h3 className="font-bold">{c.title}</h3>
                                <p className="mt-2 text-sm text-blue-100">{c.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 8. POWERED BY ANDGATE TECHNOLOGIES ─────────────────── */}
            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{t('about_powered_eyebrow')}</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('about_powered_title')}</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                    <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">{t('about_powered_desc')}</p>
                </div>
                <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
                    {E.map((e) => (
                        <div key={e.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#046ca9]/10"><e.icon className="h-5 w-5 text-[#046ca9]" /></div>
                            <h3 className="mt-4 font-bold text-gray-900">{e.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-gray-500">{e.desc}</p>
                        </div>
                    ))}
                </div>
                <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-gray-400">{t('about_trust_text')}</p>
            </section>

            {/* ── 9. TECH ────────────────────────────────────────────── */}
            <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{t('about_tech_eyebrow')}</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('about_tech_title')}</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                </div>
                <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
                    {T.map((t2) => (
                        <div key={t2.label} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#046ca9]/10"><t2.icon className="h-5 w-5 text-[#046ca9]" /></div>
                            <h3 className="mt-4 font-bold text-gray-900">{t2.label}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-gray-500">{t2.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 10. INDUSTRIES ─────────────────────────────────────── */}
            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{t('about_industries_eyebrow')}</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('about_industries_title')}</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                </div>
                <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {industries.map((ind) => (
                        <div key={ind.name} className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-all hover:border-[#046ca9]/30 hover:shadow-md">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#046ca9]/10"><ind.icon className="h-5 w-5 text-[#046ca9]" /></div>
                            <span className="text-xs font-medium text-gray-700">{ind.nameBn}</span>
                        </div>
                    ))}
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-gray-400">{t('about_industries_footer')}</p>
            </section>

            {/* ── 11. PHILOSOPHY ─────────────────────────────────────── */}
            <section className="bg-[#023a5c] px-4 py-20 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-300">{t('about_philosophy_eyebrow')}</p>
                    <h2 className="mt-3 text-3xl font-black sm:text-4xl">{t('about_philosophy_title')}</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-blue-400" />
                </div>
                <div className="mx-auto mt-12 grid max-w-3xl gap-6">
                    {[
                        { title: t('about_philosophy_reliability_title'), desc: t('about_philosophy_reliability_desc') },
                        { title: t('about_philosophy_bangla_title'), desc: t('about_philosophy_bangla_desc') },
                        { title: t('about_philosophy_offline_title'), desc: t('about_philosophy_offline_desc') },
                        { title: t('about_philosophy_security_title'), desc: t('about_philosophy_security_desc') },
                        { title: t('about_philosophy_api_title'), desc: t('about_philosophy_api_desc') },
                    ].map((p) => (
                        <div key={p.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
                            <h3 className="font-bold text-white">{p.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-blue-100">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 12. COMMITMENT ──────────────────────────────────────── */}
            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{t('about_commitment_eyebrow')}</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('about_commitment_title')}</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                </div>
                <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
                    {[
                        { icon: Award, title: t('about_commitment_improve_title'), desc: t('about_commitment_improve_desc') },
                        { icon: HeartHandshake, title: t('about_commitment_support_title'), desc: t('about_commitment_support_desc') },
                        { icon: TrendingUp, title: t('about_commitment_scale_title'), desc: t('about_commitment_scale_desc') },
                        { icon: Lock, title: t('about_commitment_privacy_title'), desc: t('about_commitment_privacy_desc') },
                    ].map((c) => (
                        <div key={c.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#046ca9]/10"><c.icon className="h-5 w-5 text-[#046ca9]" /></div>
                            <div>
                                <h3 className="font-bold text-gray-900">{c.title}</h3>
                                <p className="mt-1 text-sm leading-relaxed text-gray-500">{c.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 13. LOOKING AHEAD ──────────────────────────────────── */}
            <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">{t('about_looking_eyebrow')}</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('about_looking_title')}</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                    <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">{t('about_looking_p1')}</p>
                    <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">{t('about_looking_p2')}</p>
                </div>
            </section>

            {/* ── 14. CTA ────────────────────────────────────────────── */}
            <section className="bg-gradient-to-r from-[#046ca9] to-[#023a5c] px-4 py-20 text-white sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
                    <h2 className="text-3xl font-black sm:text-4xl">{t('about_cta_title')}</h2>
                    <p className="max-w-xl text-lg text-blue-100">{t('about_cta_subtitle')}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/register" className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#046ca9] shadow-xl transition-all hover:scale-105">{t('about_cta_start')}</Link>
                        <Link href="/contact" className="rounded-full border-2 border-white/40 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:border-white hover:bg-white/10">{t('about_cta_talk')}</Link>
                    </div>
                    <p className="text-sm text-blue-200">{t('about_cta_email')} <a href="mailto:support@andgatetech.net" className="font-semibold text-white underline underline-offset-4">support@andgatetech.net</a></p>
                </div>
            </section>
        </MainLayout>
    );
}
