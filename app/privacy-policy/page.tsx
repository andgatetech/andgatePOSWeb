'use client';
import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import { CheckCircle, Clock, CreditCard, Database, Eye, Lock, Mail, Shield, Users } from 'lucide-react';

export default function PrivacyPolicyPage() {
    const { t } = getTranslation();

    return (
        <MainLayout>
            <div className="min-h-screen bg-white">
                {/* Dark hero */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79] pb-20 pt-32">
                    <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                    <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#046ca9]/30 bg-[#046ca9]/15 px-3 py-1.5 text-xs font-medium text-[#5bb8e8]">
                            <Shield className="h-3 w-3" />
                            {t('privacy_policy.hero.badge')}
                        </div>
                        <h1 className="mb-5 text-4xl font-black leading-tight text-white md:text-5xl">
                            {t('privacy_policy.hero.title')}
                        </h1>
                        <p className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-slate-400">
                            {t('privacy_policy.hero.description')}
                        </p>
                        <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
                            <Clock className="h-4 w-4" />
                            {t('privacy_policy.hero.last_updated')}
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="bg-slate-50 py-16">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        {/* Commitments overview */}
                        <div className="mb-12 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                            <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-gray-900">
                                <CheckCircle className="h-5 w-5 text-[#046ca9]" />
                                {t('privacy_policy.commitments.title')}
                            </h2>
                            <div className="grid gap-5 md:grid-cols-2">
                                {[
                                    { icon: <Lock className="h-4 w-4 text-blue-600" />, bg: 'bg-blue-100', title: t('privacy_policy.commitments.secure_storage.title'), desc: t('privacy_policy.commitments.secure_storage.description') },
                                    { icon: <Eye className="h-4 w-4 text-emerald-600" />, bg: 'bg-emerald-100', title: t('privacy_policy.commitments.transparent.title'), desc: t('privacy_policy.commitments.transparent.description') },
                                    { icon: <Users className="h-4 w-4 text-violet-600" />, bg: 'bg-violet-100', title: t('privacy_policy.commitments.your_control.title'), desc: t('privacy_policy.commitments.your_control.description') },
                                    { icon: <Database className="h-4 w-4 text-orange-600" />, bg: 'bg-orange-100', title: t('privacy_policy.commitments.minimal_data.title'), desc: t('privacy_policy.commitments.minimal_data.description') },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`mt-0.5 rounded-full p-2 ${item.bg} flex-shrink-0`}>{item.icon}</div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                                            <p className="mt-0.5 text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Detailed sections */}
                        <div className="space-y-8">
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-5 text-xl font-black text-gray-900">{t('privacy_policy.information_collect.title')}</h2>
                                <h3 className="mb-3 font-bold text-gray-800">{t('privacy_policy.information_collect.personal_info.title')}</h3>
                                <ul className="mb-6 space-y-1.5">
                                    {(t('privacy_policy.information_collect.personal_info.items') as string[]).map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <h3 className="mb-3 font-bold text-gray-800">{t('privacy_policy.information_collect.usage_info.title')}</h3>
                                <ul className="mb-6 space-y-1.5">
                                    {(t('privacy_policy.information_collect.usage_info.items') as string[]).map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <h3 className="mb-3 font-bold text-gray-800">{t('privacy_policy.information_collect.customer_data.title')}</h3>
                                <ul className="space-y-1.5">
                                    {(t('privacy_policy.information_collect.customer_data.items') as string[]).map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-5 text-xl font-black text-gray-900">{t('privacy_policy.how_we_use.title')}</h2>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h3 className="mb-3 font-bold text-gray-800">{t('privacy_policy.how_we_use.service_delivery.title')}</h3>
                                        <ul className="space-y-1.5">
                                            {(t('privacy_policy.how_we_use.service_delivery.items') as string[]).map((item, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="mb-3 font-bold text-gray-800">{t('privacy_policy.how_we_use.communication.title')}</h3>
                                        <ul className="space-y-1.5">
                                            {(t('privacy_policy.how_we_use.communication.items') as string[]).map((item, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-8">
                                <div className="mb-4 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-emerald-600" />
                                    <h2 className="text-xl font-black text-gray-900">{t('privacy_policy.data_security.title')}</h2>
                                </div>
                                <h3 className="mb-4 font-bold text-gray-800">{t('privacy_policy.data_security.subtitle')}</h3>
                                <div className="grid gap-2 md:grid-cols-2">
                                    {(t('privacy_policy.data_security.measures', { returnObjects: true }) as string[]).map((item, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-5 text-xl font-black text-gray-900">{t('privacy_policy.your_rights.title')}</h2>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h3 className="mb-3 font-bold text-gray-800">{t('privacy_policy.your_rights.access_control.title')}</h3>
                                        <ul className="space-y-1.5">
                                            {(t('privacy_policy.your_rights.access_control.items', { returnObjects: true }) as string[]).map((item, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="mb-3 font-bold text-gray-800">{t('privacy_policy.your_rights.data_portability.title')}</h3>
                                        <ul className="space-y-1.5">
                                            {(t('privacy_policy.your_rights.data_portability.items', { returnObjects: true }) as string[]).map((item, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-4 text-xl font-black text-gray-900">{t('privacy_policy.data_retention.title')}</h2>
                                <p className="mb-4 text-sm text-gray-600">{t('privacy_policy.data_retention.description')}</p>
                                <ul className="space-y-2">
                                    {(t('privacy_policy.data_retention.items', { returnObjects: true }) as any[]).map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />
                                            <span><strong className="text-gray-800">{item.label}</strong> {item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-4 text-xl font-black text-gray-900">{t('privacy_policy.third_party.title')}</h2>
                                <p className="mb-6 text-sm text-gray-600">{t('privacy_policy.third_party.description')}</p>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {[
                                        { icon: <CreditCard className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50', title: t('privacy_policy.third_party.payment.title'), desc: t('privacy_policy.third_party.payment.description') },
                                        { icon: <Database className="h-5 w-5 text-emerald-600" />, bg: 'bg-emerald-50', title: t('privacy_policy.third_party.cloud.title'), desc: t('privacy_policy.third_party.cloud.description') },
                                        { icon: <Mail className="h-5 w-5 text-violet-600" />, bg: 'bg-violet-50', title: t('privacy_policy.third_party.communication.title'), desc: t('privacy_policy.third_party.communication.description') },
                                    ].map((item, i) => (
                                        <div key={i} className="rounded-xl bg-slate-50 p-4 text-center">
                                            <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}>{item.icon}</div>
                                            <h4 className="mb-1 text-sm font-bold text-gray-900">{item.title}</h4>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Contact CTA */}
                        <div className="mt-12 overflow-hidden rounded-2xl bg-[#011524] p-8 text-center">
                            <div className="relative">
                                <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-[#046ca9]/15 blur-3xl" />
                                <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-[#046ca9]/10 blur-3xl" />
                                <div className="relative">
                                    <h2 className="mb-3 text-2xl font-black text-white">{t('privacy_policy.contact.title')}</h2>
                                    <p className="mb-6 text-sm text-slate-400">{t('privacy_policy.contact.description')}</p>
                                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                                        <a
                                            href={`mailto:${t('privacy_policy.contact.email')}`}
                                            className="rounded-full bg-gradient-to-r from-[#046ca9] to-[#034d79] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#046ca9]/25 transition hover:from-[#034d79] hover:to-[#02395b]"
                                        >
                                            {t('privacy_policy.contact.email')}
                                        </a>
                                        <a
                                            href="/contact"
                                            className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                                        >
                                            {t('privacy_policy.contact.contact_us')}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
