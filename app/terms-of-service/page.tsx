'use client';
import MainLayout from '@/components/layout/MainLayout';
import { getTranslation } from '@/i18n';
import { AlertTriangle, Ban, CheckCircle, Clock, CreditCard, FileText, RefreshCw, Scale, Shield, Users } from 'lucide-react';

export default function TermsOfServicePage() {
    const { t } = getTranslation();

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pb-16 pt-20">
                    <div className="bg-grid-slate-100 absolute inset-0 -z-10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                    <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="mb-6 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                                <Scale className="mr-2 h-4 w-4" />
                                {t('terms-service.hero.badge')}
                            </div>
                            <h1 className="mb-8 text-4xl font-black leading-tight text-gray-900 md:text-5xl">{t('terms-service.hero.title')}</h1>
                            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">{t('terms-service.hero.description')}</p>
                            <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
                                <Clock className="mr-2 h-4 w-4" />
                                {t('terms-service.meta.lastUpdated')}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="py-16">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        {/* Quick Overview */}
                        <div className="mb-16 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-8">
                            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900">
                                <CheckCircle className="mr-3 h-6 w-6 text-blue-600" />
                                {t('terms-service.summary.title')}
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-blue-100 p-2">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('terms-service.summary.items.serviceAgreement.title')}</h3>
                                        <p className="text-sm text-gray-600">{t('terms-service.summary.items.serviceAgreement.description')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-green-100 p-2">
                                        <CreditCard className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('terms-service.summary.items.paymentTerms.title')}</h3>
                                        <p className="text-sm text-gray-600">{t('terms-service.summary.items.paymentTerms.description')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-purple-100 p-2">
                                        <Shield className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('terms-service.summary.items.dataProtection.title')}</h3>
                                        <p className="text-sm text-gray-600">{t('terms-service.summary.items.dataProtection.description')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-orange-100 p-2">
                                        <Users className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('terms-service.summary.items.userResponsibilities.title')}</h3>
                                        <p className="text-sm text-gray-600">{t('terms-service.summary.items.userResponsibilities.description')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Sections */}
                        <div className="prose prose-lg max-w-none">
                            {/* Section 1: Acceptance of Terms */}
                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('terms-service.sections.acceptance.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-4 text-gray-700">{t('terms-service.sections.acceptance.paragraph1')}</p>
                                    <p className="mb-4 text-gray-700">{t('terms-service.sections.acceptance.paragraph2')}</p>
                                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                        <div className="flex">
                                            <AlertTriangle className="mr-3 mt-0.5 h-5 w-5 text-yellow-600" />
                                            <div>
                                                <h4 className="font-semibold text-yellow-800">{t('terms-service.sections.acceptance.notice.title')}</h4>
                                                <p className="text-sm text-yellow-700">{t('terms-service.sections.acceptance.notice.text')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Service Description */}
                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('terms-service.sections.description.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-4 text-gray-700">{t('terms-service.sections.description.intro')}</p>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <h3 className="mb-3 text-lg font-semibold text-gray-900">{t('terms-service.sections.description.coreFeatures.title')}</h3>
                                            <ul className="list-inside list-disc space-y-1 text-gray-700">
                                                {(t('terms-service.sections.description.coreFeatures.items') as any).map((item: string, index: number) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="mb-3 text-lg font-semibold text-gray-900">{t('terms-service.sections.description.additionalServices.title')}</h3>
                                            <ul className="list-inside list-disc space-y-1 text-gray-700">
                                                {(t('terms-service.sections.description.additionalServices.items') as any).map((item: string, index: number) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3: Account Registration */}
                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('terms-service.sections.registration.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('terms-service.sections.registration.requirements.title')}</h3>
                                    <p className="mb-4 text-gray-700">{t('terms-service.sections.registration.requirements.intro')}</p>
                                    <ul className="mb-6 list-inside list-disc space-y-2 text-gray-700">
                                        {(t('terms-service.sections.registration.requirements.items') as any).map((item: string, index: number) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>

                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('terms-service.sections.registration.suspension.title')}</h3>
                                    <p className="text-gray-700">{t('terms-service.sections.registration.suspension.text')}</p>
                                </div>
                            </section>

                            {/* Section 4: Payment Terms */}
                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('terms-service.sections.payment.title')}</h2>
                                <div className="rounded-xl border border-green-100 bg-gradient-to-r from-green-50 to-blue-50 p-6">
                                    <div className="mb-4 flex items-center">
                                        <CreditCard className="mr-3 h-6 w-6 text-green-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">{t('terms-service.sections.payment.subtitle')}</h3>
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <h4 className="mb-2 font-semibold text-gray-900">{t('terms-service.sections.payment.subscriptionPlans.title')}</h4>
                                            <ul className="space-y-1 text-sm text-gray-700">
                                                {(t('terms-service.sections.payment.subscriptionPlans.items') as any).map((item: string, index: number) => (
                                                    <li key={index}>• {item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="mb-2 font-semibold text-gray-900">{t('terms-service.sections.payment.transactionFees.title')}</h4>
                                            <ul className="space-y-1 text-sm text-gray-700">
                                                {(t('terms-service.sections.payment.transactionFees.items') as any).map((item: string, index: number) => (
                                                    <li key={index}>• {item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
                                        <h4 className="mb-2 font-semibold text-gray-900">{t('terms-service.sections.payment.refundPolicy.title')}</h4>
                                        <p className="text-sm text-gray-700">{t('terms-service.sections.payment.refundPolicy.text')}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 5: Acceptable Use Policy */}
                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('terms-service.sections.acceptableUse.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="mb-6">
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('terms-service.sections.acceptableUse.permitted.title')}</h3>
                                        <p className="mb-4 text-gray-700">{t('terms-service.sections.acceptableUse.permitted.intro')}</p>
                                        <ul className="list-inside list-disc space-y-1 text-gray-700">
                                            {(t('terms-service.sections.acceptableUse.permitted.items') as any).map((item: string, index: number) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                        <div className="flex">
                                            <Ban className="mr-3 mt-0.5 h-5 w-5 text-red-600" />
                                            <div>
                                                <h4 className="mb-2 font-semibold text-red-800">{t('terms-service.sections.acceptableUse.prohibited.title')}</h4>
                                                <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
                                                    {(t('terms-service.sections.acceptableUse.prohibited.items') as any).map((item: string, index: number) => (
                                                        <li key={index}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 6: Data and Privacy */}
                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('terms-service.sections.dataPrivacy.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="mb-6">
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('terms-service.sections.dataPrivacy.yourData.title')}</h3>
                                        <p className="mb-4 text-gray-700">{t('terms-service.sections.dataPrivacy.yourData.intro')}</p>
                                        <ul className="list-inside list-disc space-y-2 text-gray-700">
                                            {(t('terms-service.sections.dataPrivacy.yourData.items') as any).map((item: string, index: number) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <h4 className="mb-2 font-semibold text-blue-800">{t('terms-service.sections.dataPrivacy.security.title')}</h4>
                                        <p className="text-sm text-blue-700">{t('terms-service.sections.dataPrivacy.security.text')}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 7: Service Availability */}
                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('terms-service.sections.availability.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <h3 className="mb-3 font-semibold text-gray-900">{t('terms-service.sections.availability.uptime.title')}</h3>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                                                {(t('terms-service.sections.availability.uptime.items') as any).map((item: string, index: number) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="mb-3 font-semibold text-gray-900">{t('terms-service.sections.availability.updates.title')}</h3>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                                                {(t('terms-service.sections.availability.updates.items') as any).map((item: string, index: number) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 8: Termination */}
                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('terms-service.sections.termination.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="mb-6">
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('terms-service.sections.termination.byYou.title')}</h3>
                                        <p className="mb-4 text-gray-700">{t('terms-service.sections.termination.byYou.intro')}</p>
                                        <ul className="list-inside list-disc space-y-2 text-gray-700">
                                            {(t('terms-service.sections.termination.byYou.items') as any).map((item: string, index: number) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                                        <div className="flex">
                                            <RefreshCw className="mr-3 mt-0.5 h-5 w-5 text-orange-600" />
                                            <div>
                                                <h4 className="mb-2 font-semibold text-orange-800">{t('terms-service.sections.termination.byUs.title')}</h4>
                                                <p className="text-sm text-orange-700">{t('terms-service.sections.termination.byUs.text')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 9: Limitation of Liability */}
                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('terms-service.sections.liability.title')}</h2>
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                                    <p className="mb-4 text-gray-700">{t('terms-service.sections.liability.paragraph1')}</p>
                                    <p className="mb-4 text-gray-700">{t('terms-service.sections.liability.paragraph2')}</p>
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <h4 className="mb-2 font-semibold text-blue-800">{t('terms-service.sections.liability.serviceLevel.title')}</h4>
                                        <p className="text-sm text-blue-700">{t('terms-service.sections.liability.serviceLevel.text')}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 10: Changes to Terms */}
                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('terms-service.sections.changes.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-4 text-gray-700">{t('terms-service.sections.changes.paragraph1')}</p>
                                    <p className="mb-4 text-gray-700">{t('terms-service.sections.changes.paragraph2')}</p>
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                        <h4 className="mb-2 font-semibold text-green-800">{t('terms-service.sections.changes.notification.title')}</h4>
                                        <ul className="list-inside list-disc space-y-1 text-sm text-green-700">
                                            {(t('terms-service.sections.changes.notification.items') as any).map((item: string, index: number) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Contact Section */}
                        <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                            <div className="text-center">
                                <h2 className="mb-4 text-2xl font-bold">{t('terms-service.contact.title')}</h2>
                                <p className="mb-6 text-blue-100">{t('terms-service.contact.description')}</p>
                                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <a href={`mailto:${t('terms-service.contact.email')}`} className="rounded-full bg-white px-6 py-3 font-semibold text-blue-600 transition-all hover:bg-gray-100">
                                        {t('terms-service.contact.email')}
                                    </a>
                                    <a href="/contact" className="rounded-full border-2 border-white px-6 py-3 font-semibold text-white transition-all hover:bg-white hover:text-blue-600">
                                        {t('terms-service.contact.contactButton')}
                                    </a>
                                </div>
                                <div className="mt-4 text-sm text-blue-100">{t('terms-service.contact.availability')}</div>
                            </div>
                        </section>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
