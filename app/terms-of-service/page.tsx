'use client';
import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import { AlertTriangle, Ban, CheckCircle, Clock, CreditCard, FileText, RefreshCw, Scale, Shield, Users } from 'lucide-react';

export default function TermsOfServicePage() {
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
                            <Scale className="h-3 w-3" />
                            {t('terms-service.hero.badge')}
                        </div>
                        <h1 className="mb-5 text-4xl font-black leading-tight text-white md:text-5xl">
                            {t('terms-service.hero.title')}
                        </h1>
                        <p className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-slate-400">
                            {t('terms-service.hero.description')}
                        </p>
                        <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
                            <Clock className="h-4 w-4" />
                            {t('terms-service.meta.lastUpdated')}
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="bg-slate-50 py-16">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        {/* Summary overview */}
                        <div className="mb-12 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                            <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-gray-900">
                                <CheckCircle className="h-5 w-5 text-[#046ca9]" />
                                {t('terms-service.summary.title')}
                            </h2>
                            <div className="grid gap-5 md:grid-cols-2">
                                {[
                                    { icon: <FileText className="h-4 w-4 text-blue-600" />, bg: 'bg-blue-100', title: t('terms-service.summary.items.serviceAgreement.title'), desc: t('terms-service.summary.items.serviceAgreement.description') },
                                    { icon: <CreditCard className="h-4 w-4 text-emerald-600" />, bg: 'bg-emerald-100', title: t('terms-service.summary.items.paymentTerms.title'), desc: t('terms-service.summary.items.paymentTerms.description') },
                                    { icon: <Shield className="h-4 w-4 text-violet-600" />, bg: 'bg-violet-100', title: t('terms-service.summary.items.dataProtection.title'), desc: t('terms-service.summary.items.dataProtection.description') },
                                    { icon: <Users className="h-4 w-4 text-orange-600" />, bg: 'bg-orange-100', title: t('terms-service.summary.items.userResponsibilities.title'), desc: t('terms-service.summary.items.userResponsibilities.description') },
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
                            {/* Acceptance */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-5 text-xl font-black text-gray-900">{t('terms-service.sections.acceptance.title')}</h2>
                                <p className="mb-4 text-sm text-gray-600">{t('terms-service.sections.acceptance.paragraph1')}</p>
                                <p className="mb-5 text-sm text-gray-600">{t('terms-service.sections.acceptance.paragraph2')}</p>
                                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                                    <div className="flex gap-3">
                                        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                                        <div>
                                            <h4 className="mb-1 text-sm font-bold text-yellow-800">{t('terms-service.sections.acceptance.notice.title')}</h4>
                                            <p className="text-sm text-yellow-700">{t('terms-service.sections.acceptance.notice.text')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Service Description */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-5 text-xl font-black text-gray-900">{t('terms-service.sections.description.title')}</h2>
                                <p className="mb-5 text-sm text-gray-600">{t('terms-service.sections.description.intro')}</p>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h3 className="mb-3 font-bold text-gray-800">{t('terms-service.sections.description.coreFeatures.title')}</h3>
                                        <ul className="space-y-1.5">
                                            {(t('terms-service.sections.description.coreFeatures.items') as any).map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />{item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="mb-3 font-bold text-gray-800">{t('terms-service.sections.description.additionalServices.title')}</h3>
                                        <ul className="space-y-1.5">
                                            {(t('terms-service.sections.description.additionalServices.items') as any).map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />{item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Account Registration */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-5 text-xl font-black text-gray-900">{t('terms-service.sections.registration.title')}</h2>
                                <h3 className="mb-3 font-bold text-gray-800">{t('terms-service.sections.registration.requirements.title')}</h3>
                                <p className="mb-4 text-sm text-gray-600">{t('terms-service.sections.registration.requirements.intro')}</p>
                                <ul className="mb-6 space-y-1.5">
                                    {(t('terms-service.sections.registration.requirements.items') as any).map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />{item}
                                        </li>
                                    ))}
                                </ul>
                                <h3 className="mb-2 font-bold text-gray-800">{t('terms-service.sections.registration.suspension.title')}</h3>
                                <p className="text-sm text-gray-600">{t('terms-service.sections.registration.suspension.text')}</p>
                            </div>

                            {/* Payment Terms */}
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-8">
                                <div className="mb-4 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-emerald-600" />
                                    <h2 className="text-xl font-black text-gray-900">{t('terms-service.sections.payment.title')}</h2>
                                </div>
                                <h3 className="mb-4 font-bold text-gray-800">{t('terms-service.sections.payment.subtitle')}</h3>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h4 className="mb-2 text-sm font-bold text-gray-800">{t('terms-service.sections.payment.subscriptionPlans.title')}</h4>
                                        <ul className="space-y-1.5">
                                            {(t('terms-service.sections.payment.subscriptionPlans.items') as any).map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />{item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 text-sm font-bold text-gray-800">{t('terms-service.sections.payment.transactionFees.title')}</h4>
                                        <ul className="space-y-1.5">
                                            {(t('terms-service.sections.payment.transactionFees.items') as any).map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />{item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-6 rounded-xl border border-gray-100 bg-white p-4">
                                    <h4 className="mb-2 text-sm font-bold text-gray-900">{t('terms-service.sections.payment.refundPolicy.title')}</h4>
                                    <p className="text-sm text-gray-600">{t('terms-service.sections.payment.refundPolicy.text')}</p>
                                </div>
                            </div>

                            {/* Acceptable Use */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-5 text-xl font-black text-gray-900">{t('terms-service.sections.acceptableUse.title')}</h2>
                                <h3 className="mb-3 font-bold text-gray-800">{t('terms-service.sections.acceptableUse.permitted.title')}</h3>
                                <p className="mb-4 text-sm text-gray-600">{t('terms-service.sections.acceptableUse.permitted.intro')}</p>
                                <ul className="mb-6 space-y-1.5">
                                    {(t('terms-service.sections.acceptableUse.permitted.items') as any).map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />{item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                    <div className="flex gap-3">
                                        <Ban className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                                        <div>
                                            <h4 className="mb-2 text-sm font-bold text-red-800">{t('terms-service.sections.acceptableUse.prohibited.title')}</h4>
                                            <ul className="space-y-1.5">
                                                {(t('terms-service.sections.acceptableUse.prohibited.items') as any).map((item: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                                                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />{item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Data & Privacy */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-5 text-xl font-black text-gray-900">{t('terms-service.sections.dataPrivacy.title')}</h2>
                                <h3 className="mb-3 font-bold text-gray-800">{t('terms-service.sections.dataPrivacy.yourData.title')}</h3>
                                <p className="mb-4 text-sm text-gray-600">{t('terms-service.sections.dataPrivacy.yourData.intro')}</p>
                                <ul className="mb-5 space-y-1.5">
                                    {(t('terms-service.sections.dataPrivacy.yourData.items') as any).map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />{item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                    <h4 className="mb-1 text-sm font-bold text-blue-800">{t('terms-service.sections.dataPrivacy.security.title')}</h4>
                                    <p className="text-sm text-blue-700">{t('terms-service.sections.dataPrivacy.security.text')}</p>
                                </div>
                            </div>

                            {/* Service Availability */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-5 text-xl font-black text-gray-900">{t('terms-service.sections.availability.title')}</h2>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h3 className="mb-3 font-bold text-gray-800">{t('terms-service.sections.availability.uptime.title')}</h3>
                                        <ul className="space-y-1.5">
                                            {(t('terms-service.sections.availability.uptime.items') as any).map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />{item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="mb-3 font-bold text-gray-800">{t('terms-service.sections.availability.updates.title')}</h3>
                                        <ul className="space-y-1.5">
                                            {(t('terms-service.sections.availability.updates.items') as any).map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />{item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Termination */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-5 text-xl font-black text-gray-900">{t('terms-service.sections.termination.title')}</h2>
                                <h3 className="mb-3 font-bold text-gray-800">{t('terms-service.sections.termination.byYou.title')}</h3>
                                <p className="mb-4 text-sm text-gray-600">{t('terms-service.sections.termination.byYou.intro')}</p>
                                <ul className="mb-5 space-y-1.5">
                                    {(t('terms-service.sections.termination.byYou.items') as any).map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />{item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                                    <div className="flex gap-3">
                                        <RefreshCw className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
                                        <div>
                                            <h4 className="mb-1 text-sm font-bold text-orange-800">{t('terms-service.sections.termination.byUs.title')}</h4>
                                            <p className="text-sm text-orange-700">{t('terms-service.sections.termination.byUs.text')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Liability */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-5 text-xl font-black text-gray-900">{t('terms-service.sections.liability.title')}</h2>
                                <p className="mb-4 text-sm text-gray-600">{t('terms-service.sections.liability.paragraph1')}</p>
                                <p className="mb-5 text-sm text-gray-600">{t('terms-service.sections.liability.paragraph2')}</p>
                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                    <h4 className="mb-1 text-sm font-bold text-blue-800">{t('terms-service.sections.liability.serviceLevel.title')}</h4>
                                    <p className="text-sm text-blue-700">{t('terms-service.sections.liability.serviceLevel.text')}</p>
                                </div>
                            </div>

                            {/* Changes to Terms */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-5 text-xl font-black text-gray-900">{t('terms-service.sections.changes.title')}</h2>
                                <p className="mb-4 text-sm text-gray-600">{t('terms-service.sections.changes.paragraph1')}</p>
                                <p className="mb-5 text-sm text-gray-600">{t('terms-service.sections.changes.paragraph2')}</p>
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                    <h4 className="mb-2 text-sm font-bold text-emerald-800">{t('terms-service.sections.changes.notification.title')}</h4>
                                    <ul className="space-y-1.5">
                                        {(t('terms-service.sections.changes.notification.items') as any).map((item: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />{item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Contact CTA */}
                        <div className="mt-12 overflow-hidden rounded-2xl bg-[#011524] p-8 text-center">
                            <div className="relative">
                                <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-[#046ca9]/15 blur-3xl" />
                                <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-[#046ca9]/10 blur-3xl" />
                                <div className="relative">
                                    <h2 className="mb-3 text-2xl font-black text-white">{t('terms-service.contact.title')}</h2>
                                    <p className="mb-6 text-sm text-slate-400">{t('terms-service.contact.description')}</p>
                                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                                        <a
                                            href={`mailto:${t('terms-service.contact.email')}`}
                                            className="rounded-full bg-gradient-to-r from-[#046ca9] to-[#034d79] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#046ca9]/25 transition hover:from-[#034d79] hover:to-[#02395b]"
                                        >
                                            {t('terms-service.contact.email')}
                                        </a>
                                        <a
                                            href="/contact"
                                            className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                                        >
                                            {t('terms-service.contact.contactButton')}
                                        </a>
                                    </div>
                                    <p className="mt-4 text-xs text-slate-500">{t('terms-service.contact.availability')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
