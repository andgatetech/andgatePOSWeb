import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import { Store, Briefcase, Cpu, Cloud, Shield, Zap, Globe, Layers, Users, ArrowRight, CheckCircle2, Building2, ShoppingBag, Truck, BarChart3, Bot, Wrench, Network, Database, Lock, Award, HeartHandshake, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const technologies = [
    { icon: Cloud, label: 'Cloud-Native', desc: 'AWS-powered infrastructure with auto-scaling, 99.9% uptime, and global CDN for fast access anywhere in Bangladesh.' },
    { icon: Shield, label: 'Enterprise Security', desc: 'End-to-end encryption, role-based access control, audit logging, and regular penetration testing.' },
    { icon: Zap, label: 'Offline-First', desc: 'Continue selling even when the internet goes down. POS keeps working offline and syncs when back online.' },
    { icon: Layers, label: 'API-First Architecture', desc: 'Every feature exposed via REST APIs. Integrate with payment gateways, ERP systems, and custom workflows.' },
    { icon: Database, label: 'Scalable Database', desc: 'MySQL with optimized indexes, connection pooling, and automated backups — built to handle millions of transactions.' },
    { icon: Globe, label: 'Multi-Branch Ready', desc: 'Centralized management for multiple store locations with real-time inventory sync across branches.' },
];

const industries = [
    { icon: ShoppingBag, name: 'Retail Stores' },
    { icon: Building2, name: 'Fashion & Clothing' },
    { icon: Store, name: 'Pharmacies' },
    { icon: ShoppingBag, name: 'Electronics' },
    { icon: Building2, name: 'Supermarkets' },
    { icon: Briefcase, name: 'Wholesale' },
    { icon: Store, name: 'Hardware' },
    { icon: ShoppingBag, name: 'Stationery' },
    { icon: Building2, name: 'Cosmetics' },
    { icon: Store, name: 'Bakeries' },
    { icon: ShoppingBag, name: 'Restaurants' },
    { icon: Building2, name: 'Jewelry' },
];

const expertise = [
    { icon: Cpu, title: 'SaaS Product Engineering', desc: 'We design and build cloud-native SaaS platforms from architecture to deployment with React, Next.js, Laravel, and AWS.' },
    { icon: Bot, title: 'Artificial Intelligence & ML', desc: 'AI agents, anomaly detection, demand forecasting, and smart reorder systems are built into our products — not bolted on.' },
    { icon: Wrench, title: 'IoT & Connected Devices', desc: 'MQTT platforms, sensor integration, and real-time device communication — experience from industrial IoT deployments.' },
    { icon: Cloud, title: 'AWS Cloud & DevOps', desc: 'Infrastructure as code, CI/CD pipelines, Docker containerization, auto-scaling, and zero-downtime deployments.' },
    { icon: Shield, title: 'QA & Cybersecurity', desc: 'Automated test suites, penetration testing, vulnerability scanning, OWASP compliance, and secure SDLC practices.' },
    { icon: Network, title: 'Digital Transformation', desc: 'Helping businesses move from paper ledgers and Excel sheets to integrated digital operations.' },
];

export default function AboutPage() {
    const { t } = getTranslation();

    return (
        <MainLayout>
            {/* ── 1. HERO ───────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-b from-[#023a5c] via-[#034d79] to-[#046ca9] px-4 pb-24 pt-32 sm:px-6 lg:px-8">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white blur-3xl" />
                    <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white blur-3xl" />
                </div>
                <div className="relative mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-200">
                        About AndgatePOS
                    </p>
                    <h1 className="mt-6 text-3xl font-black text-white sm:text-5xl lg:text-6xl">
                        Bangladesh&apos;s Emerging{' '}
                        <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                            SME Business Operating System
                        </span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-blue-100 sm:text-lg">
                        AndgatePOS is not just another billing counter. It is a complete business operating system designed and engineered by Andgate Technologies — a Product Engineering company with deep expertise in SaaS, AI, IoT, Cloud, and Digital Transformation.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link href="/register" className="rounded-full bg-white px-7 py-3 text-sm font-bold text-[#046ca9] shadow-xl transition-all hover:scale-105">
                            Start Free Today
                        </Link>
                        <Link href="#more-than-pos" className="rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10">
                            Learn More ↓
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── 2. WHY WE EXIST ──────────────────────────────────── */}
            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">Our Purpose</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">Why AndgatePOS Exists</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                    <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
                        Bangladesh has over 7.8 million SMEs. Most still run on paper ledgers, Excel spreadsheets, or outdated desktop software that crashes, loses data, and cannot scale. We asked a simple question: <em>what if a Dhaka-based retail shop could run on the same quality of software that powers Shopify stores in New York?</em>
                    </p>
                    <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
                        That question led to AndgatePOS. Not a clone of international software. Not a stripped-down budget tool. A platform purpose-built for Bangladeshi businesses — with the engineering quality, reliability, and vision of world-class SaaS.
                    </p>
                </div>
            </section>

            {/* ── 3. VISION ─────────────────────────────────────────── */}
            <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">Where We&apos;re Going</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">Our Vision</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                    <p className="mx-auto mt-6 max-w-3xl text-xl font-semibold leading-relaxed text-gray-800">
                        To become the operating system for every SME in Bangladesh — a single platform where business owners manage sales, inventory, accounting, customers, employees, suppliers, and online commerce without needing any other software.
                    </p>
                </div>
            </section>

            {/* ── 4. MISSION ────────────────────────────────────────── */}
            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">What We Do Every Day</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">Our Mission</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                    <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
                        To equip Bangladeshi SME owners with an affordable, reliable, cloud-based business management platform that automates operations, delivers real-time insights, and grows with their business — from a single retail counter to a multi-branch, omnichannel enterprise.
                    </p>
                </div>
            </section>

            {/* ── 5. MORE THAN A POS ────────────────────────────────── */}
            <section id="more-than-pos" className="bg-[#023a5c] px-4 py-20 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Beyond Billing</p>
                    <h2 className="mt-3 text-3xl font-black sm:text-4xl">More Than a POS. A Business Operating System.</h2>
                    <p className="mx-auto mt-6 max-w-3xl text-blue-100">
                        POS is just one module. The platform already includes a comprehensive suite — and the roadmap is even more ambitious.
                    </p>
                </div>

                <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { icon: Store, label: 'POS & Billing', done: true },
                        { icon: Layers, label: 'Inventory', done: true },
                        { icon: BarChart3, label: 'Accounting', done: true },
                        { icon: Users, label: 'Customer Mgmt', done: true },
                        { icon: Truck, label: 'Purchase Orders', done: true },
                        { icon: Globe, label: 'eCommerce', done: true },
                        { icon: TrendingUp, label: 'AI Insights', done: true },
                        { icon: Shield, label: 'Audit & Security', done: true },
                        { icon: Briefcase, label: 'Supplier Mgmt', done: false },
                        { icon: HeartHandshake, label: 'CRM', done: false },
                        { icon: Users, label: 'HR & Payroll', done: false },
                        { icon: Bot, label: 'AI Assistant', done: false },
                        { icon: BarChart3, label: 'Business Analytics', done: false },
                        { icon: Globe, label: 'Omnichannel', done: false },
                        { icon: Layers, label: 'API Platform', done: false },
                        { icon: Zap, label: 'Marketing Automation', done: false },
                    ].map((m) => (
                        <div key={m.label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${m.done ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/10 bg-white/5'}`}>
                            <m.icon className={`h-5 w-5 ${m.done ? 'text-emerald-400' : 'text-white/30'}`} />
                            <span className={m.done ? 'text-sm text-white' : 'text-sm text-white/40'}>{m.label}</span>
                            {m.done && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" />}
                        </div>
                    ))}
                </div>
                <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-blue-200">
                    ✅ = Available today &nbsp;&nbsp; ○ = On the roadmap
                </p>
            </section>

            {/* ── 6. FUTURE OS ──────────────────────────────────────── */}
            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">The Roadmap</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">
                        The Future SME Business Operating System
                    </h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                    <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
                        Our multi-year product roadmap transforms AndgatePOS from a retail management platform into a complete SME operating system. Every module is being designed to work together seamlessly — one login, one dashboard, one source of truth.
                    </p>
                </div>

                <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-3">
                    {[
                        { phase: 'Phase 1 — Now', items: ['POS & Billing', 'Inventory Management', 'Purchase Orders', 'Customer Database', 'Multi-Store Support', 'Offline Mode'] },
                        { phase: 'Phase 2 — 2026', items: ['Double-Entry Accounting', 'AI-Powered Insights', 'eCommerce Integration', 'Courier & Logistics', 'Audit Logs & Security', 'Store Type Intelligence'] },
                        { phase: 'Phase 3 — Beyond', items: ['CRM & Loyalty', 'HR & Payroll', 'Supplier Portal', 'AI Business Assistant', 'Open API Platform', 'Omnichannel Commerce'] },
                    ].map((p) => (
                        <div key={p.phase} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-[#046ca9]">{p.phase}</h3>
                            <ul className="mt-4 space-y-2">
                                {p.items.map((item) => (
                                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                                        <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#046ca9]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 7. HAWKERI INTEGRATION ────────────────────────────── */}
            <section className="bg-gradient-to-r from-[#046ca9] to-[#034d79] px-4 py-20 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-200">Unified Commerce</p>
                    <h2 className="mt-3 text-3xl font-black sm:text-4xl">Integrated Commerce with Hawkeri</h2>
                    <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-blue-100">
                        AndgatePOS is deeply integrated with{' '}
                        <a href="https://www.hawkeri.com" target="_blank" rel="noopener noreferrer" className="font-bold text-white underline decoration-blue-300 underline-offset-4 hover:decoration-white">
                            Hawkeri
                        </a>
                        {' '}— Bangladesh&apos;s modern ecommerce marketplace. Business owners can manage their physical store, online store, inventory, and orders from one unified platform.
                    </p>

                    <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
                        {[
                            { title: 'Physical Store', desc: 'POS billing, inventory tracking, customer walk-ins, barcode scanning.' },
                            { title: 'Online Store', desc: 'Your own Hawkeri storefront — products, categories, brand pages, SEO.' },
                            { title: 'Unified Management', desc: 'One dashboard for both channels. Inventory syncs in real-time across physical and online.' },
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
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">Who Built This</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">Powered by Andgate Technologies</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                    <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
                        AndgatePOS is engineered by{' '}
                        <a href="https://andgatetech.net" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#046ca9] underline decoration-[#046ca9]/30 underline-offset-4 hover:decoration-[#046ca9]">
                            Andgate Technologies
                        </a>
                        {' '}— a Product Engineering and Digital Transformation company that designs, develops, and scales enterprise-grade digital products. We are not a generic dev shop. We are product engineers who have built SaaS platforms, AI systems, IoT solutions, and enterprise software from the ground up.
                    </p>
                </div>

                <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
                    {expertise.map((e) => (
                        <div key={e.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#046ca9]/10">
                                <e.icon className="h-5 w-5 text-[#046ca9]" />
                            </div>
                            <h3 className="mt-4 font-bold text-gray-900">{e.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-gray-500">{e.desc}</p>
                        </div>
                    ))}
                </div>

                <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-gray-400">
                    This expertise means AndgatePOS is not reskinned open-source software. It is built by the same engineers who design enterprise systems for manufacturing, logistics, and healthcare — now focused on empowering Bangladeshi SMEs.
                </p>
            </section>

            {/* ── 9. BUILT WITH MODERN TECH ─────────────────────────── */}
            <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">Engineering</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">Built With Modern Technology</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                </div>

                <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
                    {technologies.map((t) => (
                        <div key={t.label} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#046ca9]/10">
                                <t.icon className="h-5 w-5 text-[#046ca9]" />
                            </div>
                            <h3 className="mt-4 font-bold text-gray-900">{t.label}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-gray-500">{t.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 10. INDUSTRIES ─────────────────────────────────────── */}
            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">Who Uses AndgatePOS</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">Industries We Serve</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                </div>

                <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {industries.map((ind) => (
                        <div key={ind.name} className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-all hover:border-[#046ca9]/30 hover:shadow-md">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#046ca9]/10">
                                <ind.icon className="h-5 w-5 text-[#046ca9]" />
                            </div>
                            <span className="text-xs font-medium text-gray-700">{ind.name}</span>
                        </div>
                    ))}
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-gray-400">
                    And 39 more business types supported through our intelligent store-type system — each with tailored features, fields, and workflows.
                </p>
            </section>

            {/* ── 11. ENGINEERING PHILOSOPHY ──────────────────────────── */}
            <section className="bg-[#023a5c] px-4 py-20 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-300">How We Build</p>
                    <h2 className="mt-3 text-3xl font-black sm:text-4xl">Our Engineering Philosophy</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-blue-400" />
                </div>

                <div className="mx-auto mt-12 grid max-w-3xl gap-6">
                    {[
                        { title: 'Reliability Over Features', desc: 'A feature that works 99% of the time is a bug. We prioritize stability, automated testing, and graceful error recovery over shipping half-baked functionality.' },
                        { title: 'Bangla-First, Not Bangla-Second', desc: 'We do not build in English and translate later. Our platform has 4,500+ Bangla translations designed for shop owners — not Google Translate output.' },
                        { title: 'Offline Is Not Optional', desc: 'Internet in Bangladesh is not always reliable. Every critical function works offline and syncs when connectivity returns. Your shop should never stop because of a network issue.' },
                        { title: 'Security by Design', desc: 'Role-based access control, audit logging for every action, encrypted data transmission, and regular security testing are built into the architecture — not added as an afterthought.' },
                        { title: 'API-First, Integration-Ready', desc: 'Every feature is accessible via REST APIs. Whether you want to connect a payment gateway, ERP system, or custom reporting tool — the platform is ready.' },
                    ].map((p) => (
                        <div key={p.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
                            <h3 className="font-bold text-white">{p.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-blue-100">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 12. OUR COMMITMENT ─────────────────────────────────── */}
            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">Our Promise</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">Our Commitment</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                </div>

                <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
                    {[
                        { icon: Award, title: 'Continuous Improvement', desc: 'We ship updates regularly — not once a year. Every month brings performance improvements, new features, and security patches.' },
                        { icon: HeartHandshake, title: 'Local Support, Global Standards', desc: 'Our support team is based in Dhaka and speaks Bangla. Our engineering standards match global SaaS benchmarks for uptime, security, and performance.' },
                        { icon: TrendingUp, title: 'Grows With You', desc: 'Start with a single retail counter. Scale to 50 branches with ecommerce, accounting, and AI insights. The platform scales without requiring migration.' },
                        { icon: Lock, title: 'Your Data, Your Control', desc: 'We never sell your data. We never use your data to train AI models. Your business data belongs to you — always.' },
                    ].map((c) => (
                        <div key={c.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#046ca9]/10">
                                <c.icon className="h-5 w-5 text-[#046ca9]" />
                            </div>
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
                    <p className="text-xs font-bold uppercase tracking-widest text-[#046ca9]">The Future</p>
                    <h2 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">Looking Ahead</h2>
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#046ca9]" />
                    <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
                        We are building for the next decade of Bangladeshi commerce. As internet penetration grows, as digital payments become mainstream, and as SMEs demand better tools — AndgatePOS will be ready. Not as a billing counter that added features over time, but as a platform designed from day one to be a complete business operating system.
                    </p>
                    <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
                        This is not a small ambition. It requires sustained engineering excellence, deep understanding of local business needs, and a commitment to world-class software quality. That is exactly what Andgate Technologies brings to the table.
                    </p>
                </div>
            </section>

            {/* ── 14. CTA ────────────────────────────────────────────── */}
            <section className="bg-gradient-to-r from-[#046ca9] to-[#023a5c] px-4 py-20 text-white sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
                    <h2 className="text-3xl font-black sm:text-4xl">Ready to Transform Your Business?</h2>
                    <p className="max-w-xl text-lg text-blue-100">
                        Join the growing community of Bangladeshi SMEs running on AndgatePOS. Start with a free account — no credit card required.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/register"
                            className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#046ca9] shadow-xl transition-all hover:scale-105"
                        >
                            Start Free Today
                        </Link>
                        <Link
                            href="/contact"
                            className="rounded-full border-2 border-white/40 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:border-white hover:bg-white/10"
                        >
                            Talk to Sales
                        </Link>
                    </div>
                    <p className="text-sm text-blue-200">
                        Questions? Email us at{' '}
                        <a href="mailto:support@andgatetech.net" className="font-semibold text-white underline underline-offset-4">
                            support@andgatetech.net
                        </a>
                    </p>
                </div>
            </section>
        </MainLayout>
    );
}
