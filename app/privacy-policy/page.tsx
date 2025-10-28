'use client';
import MainLayout from '@/components/layout/MainLayout';
import { getTranslation } from '@/i18n';
import { CheckCircle, Clock, CreditCard, Database, Eye, Lock, Mail, Shield, Users } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
                                <Shield className="mr-2 h-4 w-4" />
                                {t('privacy_policy.hero.badge')}
                            </div>
                            <h1 className="mb-8 text-4xl font-black leading-tight text-gray-900 md:text-5xl">{t('privacy_policy.hero.title')}</h1>
                            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">{t('privacy_policy.hero.description')}</p>
                            <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
                                <Clock className="mr-2 h-4 w-4" />
                                {t('privacy_policy.hero.last_updated')}
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
                                {t('privacy_policy.commitments.title')}
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-blue-100 p-2">
                                        <Lock className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('privacy_policy.commitments.secure_storage.title')}</h3>
                                        <p className="text-sm text-gray-600">{t('privacy_policy.commitments.secure_storage.description')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-green-100 p-2">
                                        <Eye className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('privacy_policy.commitments.transparent.title')}</h3>
                                        <p className="text-sm text-gray-600">{t('privacy_policy.commitments.transparent.description')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-purple-100 p-2">
                                        <Users className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('privacy_policy.commitments.your_control.title')}</h3>
                                        <p className="text-sm text-gray-600">{t('privacy_policy.commitments.your_control.description')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-orange-100 p-2">
                                        <Database className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('privacy_policy.commitments.minimal_data.title')}</h3>
                                        <p className="text-sm text-gray-600">{t('privacy_policy.commitments.minimal_data.description')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Sections */}
                        <div className="prose prose-lg max-w-none">
                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('privacy_policy.information_collect.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('privacy_policy.information_collect.personal_info.title')}</h3>
                                    <ul className="mb-6 list-inside list-disc space-y-2 text-gray-700">
                                        {(t('privacy_policy.information_collect.personal_info.items') as string[]).map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>

                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('privacy_policy.information_collect.usage_info.title')}</h3>
                                    <ul className="mb-6 list-inside list-disc space-y-2 text-gray-700">
                                        {(t('privacy_policy.information_collect.usage_info.items') as string[]).map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>

                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('privacy_policy.information_collect.customer_data.title')}</h3>
                                    <ul className="list-inside list-disc space-y-2 text-gray-700">
                                        {(t('privacy_policy.information_collect.customer_data.items') as string[]).map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('privacy_policy.how_we_use.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <h3 className="mb-3 text-lg font-semibold text-gray-900">{t('privacy_policy.how_we_use.service_delivery.title')}</h3>
                                            <ul className="list-inside list-disc space-y-1 text-gray-700">
                                                {(t('privacy_policy.how_we_use.service_delivery.items') as string[]).map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="mb-3 text-lg font-semibold text-gray-900">{t('privacy_policy.how_we_use.communication.title')}</h3>
                                            <ul className="list-inside list-disc space-y-1 text-gray-700">
                                                {(t('privacy_policy.how_we_use.communication.items') as string[]).map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('privacy_policy.data_security.title')}</h2>
                                <div className="rounded-xl border border-green-100 bg-gradient-to-r from-green-50 to-blue-50 p-6">
                                    <div className="mb-4 flex items-center">
                                        <Shield className="mr-3 h-6 w-6 text-green-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">{t('privacy_policy.data_security.subtitle')}</h3>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <ul className="space-y-2 text-gray-700">
                                                {(t('privacy_policy.data_security.measures') as string[]).slice(0, 4).map((item, index) => (
                                                    <li key={index}>• {item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <ul className="space-y-2 text-gray-700">
                                                {(t('privacy_policy.data_security.measures') as string[]).slice(4).map((item, index) => (
                                                    <li key={index}>• {item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('privacy_policy.your_rights.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <h3 className="mb-3 font-semibold text-gray-900">{t('privacy_policy.your_rights.access_control.title')}</h3>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                                                {(t('privacy_policy.your_rights.access_control.items') as string[]).map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="mb-3 font-semibold text-gray-900">{t('privacy_policy.your_rights.data_portability.title')}</h3>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                                                {(t('privacy_policy.your_rights.data_portability.items') as string[]).map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('privacy_policy.data_retention.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-4 text-gray-700">{t('privacy_policy.data_retention.description')}</p>
                                    <ul className="list-inside list-disc space-y-2 text-gray-700">
                                        {(t('privacy_policy.data_retention.items') as any[]).map((item, index) => (
                                            <li key={index}>
                                                <strong>{item.label}</strong> {item.text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('privacy_policy.third_party.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-4 text-gray-700">{t('privacy_policy.third_party.description')}</p>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="text-center">
                                            <div className="mx-auto mb-2 w-fit rounded-full bg-blue-100 p-3">
                                                <CreditCard className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <h4 className="font-semibold text-gray-900">{t('privacy_policy.third_party.payment.title')}</h4>
                                            <p className="text-sm text-gray-600">{t('privacy_policy.third_party.payment.description')}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="mx-auto mb-2 w-fit rounded-full bg-green-100 p-3">
                                                <Database className="h-6 w-6 text-green-600" />
                                            </div>
                                            <h4 className="font-semibold text-gray-900">{t('privacy_policy.third_party.cloud.title')}</h4>
                                            <p className="text-sm text-gray-600">{t('privacy_policy.third_party.cloud.description')}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="mx-auto mb-2 w-fit rounded-full bg-purple-100 p-3">
                                                <Mail className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <h4 className="font-semibold text-gray-900">{t('privacy_policy.third_party.communication.title')}</h4>
                                            <p className="text-sm text-gray-600">{t('privacy_policy.third_party.communication.description')}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Contact Section */}
                        <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                            <div className="text-center">
                                <h2 className="mb-4 text-2xl font-bold">{t('privacy_policy.contact.title')}</h2>
                                <p className="mb-6 text-blue-100">{t('privacy_policy.contact.description')}</p>
                                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <a href={`mailto:${t('privacy_policy.contact.email')}`} className="rounded-full bg-white px-6 py-3 font-semibold text-blue-600 transition-all hover:bg-gray-100">
                                        {t('privacy_policy.contact.email')}
                                    </a>
                                    <a href="/contact" className="rounded-full border-2 border-white px-6 py-3 font-semibold text-white transition-all hover:bg-white hover:text-blue-600">
                                        {t('privacy_policy.contact.contact_us')}
                                    </a>
                                </div>
                            </div>
                        </section>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
