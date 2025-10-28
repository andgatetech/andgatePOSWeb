'use client';

import MainLayout from '@/components/layout/MainLayout';
import { getTranslation } from '@/i18n';
import { BarChart3, CheckCircle, Clock, Cookie, Eye, RefreshCw, Settings, Shield, ToggleLeft, X } from 'lucide-react';

export default function CookiePolicyPage() {
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
                                <Cookie className="mr-2 h-4 w-4" />
                                {t('cookie-policy.badge')}
                            </div>
                            <h1 className="mb-8 text-4xl font-black leading-tight text-gray-900 md:text-5xl">{t('cookie-policy.title')}</h1>
                            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">{t('cookie-policy.description')}</p>
                            <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
                                <Clock className="mr-2 h-4 w-4" />
                                {t('cookie-policy.last_updated')}
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
                                {t('cookie-policy.overview.title')}
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-blue-100 p-2">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('cookie-policy.overview.essential.title')}</h3>
                                        <p className="text-sm text-gray-600">{t('cookie-policy.overview.essential.description')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-green-100 p-2">
                                        <BarChart3 className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('cookie-policy.overview.analytics.title')}</h3>
                                        <p className="text-sm text-gray-600">{t('cookie-policy.overview.analytics.description')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-purple-100 p-2">
                                        <Eye className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('cookie-policy.overview.functional.title')}</h3>
                                        <p className="text-sm text-gray-600">{t('cookie-policy.overview.functional.description')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-orange-100 p-2">
                                        <Settings className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('cookie-policy.overview.control.title')}</h3>
                                        <p className="text-sm text-gray-600">{t('cookie-policy.overview.control.description')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Sections */}
                        <div className="prose prose-lg max-w-none">
                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('cookie-policy.what_are_cookies.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-4 text-gray-700">{t('cookie-policy.what_are_cookies.description')}</p>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-lg bg-blue-50 p-4">
                                            <h3 className="mb-2 font-semibold text-blue-900">{t('cookie-policy.what_are_cookies.first_party.title')}</h3>
                                            <p className="text-sm text-blue-800">{t('cookie-policy.what_are_cookies.first_party.description')}</p>
                                        </div>
                                        <div className="rounded-lg bg-green-50 p-4">
                                            <h3 className="mb-2 font-semibold text-green-900">{t('cookie-policy.what_are_cookies.third_party.title')}</h3>
                                            <p className="text-sm text-green-800">{t('cookie-policy.what_are_cookies.third_party.description')}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('cookie-policy.types.title')}</h2>

                                {/* Essential Cookies */}
                                <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-center">
                                        <div className="mr-3 rounded-full bg-red-100 p-2">
                                            <Shield className="h-5 w-5 text-red-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900">{t('cookie-policy.types.essential.title')}</h3>
                                    </div>
                                    <p className="mb-4 text-gray-700">{t('cookie-policy.types.essential.description')}</p>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">{t('cookie-policy.types.essential.table.cookie_name')}</th>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">{t('cookie-policy.types.essential.table.purpose')}</th>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">{t('cookie-policy.types.essential.table.duration')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.essential.table.session_id.name')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.essential.table.session_id.purpose')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.essential.table.session_id.duration')}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.essential.table.csrf_token.name')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.essential.table.csrf_token.purpose')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.essential.table.csrf_token.duration')}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.essential.table.auth_token.name')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.essential.table.auth_token.purpose')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.essential.table.auth_token.duration')}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Functional Cookies */}
                                <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-center">
                                        <div className="mr-3 rounded-full bg-purple-100 p-2">
                                            <Settings className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900">{t('cookie-policy.types.functional.title')}</h3>
                                        <div className="ml-auto">
                                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <p className="mb-4 text-gray-700">{t('cookie-policy.types.functional.description')}</p>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">{t('cookie-policy.types.essential.table.cookie_name')}</th>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">{t('cookie-policy.types.essential.table.purpose')}</th>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">{t('cookie-policy.types.essential.table.duration')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.functional.table.user_preferences.name')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.functional.table.user_preferences.purpose')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.functional.table.user_preferences.duration')}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.functional.table.theme_settings.name')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.functional.table.theme_settings.purpose')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.functional.table.theme_settings.duration')}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.functional.table.language_pref.name')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.functional.table.language_pref.purpose')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.functional.table.language_pref.duration')}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Analytics Cookies */}
                                <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-center">
                                        <div className="mr-3 rounded-full bg-green-100 p-2">
                                            <BarChart3 className="h-5 w-5 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900">{t('cookie-policy.types.analytics.title')}</h3>
                                        <div className="ml-auto">
                                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <p className="mb-4 text-gray-700">{t('cookie-policy.types.analytics.description')}</p>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">{t('cookie-policy.types.analytics.table.service')}</th>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">{t('cookie-policy.types.essential.table.purpose')}</th>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">{t('cookie-policy.types.essential.table.duration')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.analytics.table.google_analytics.name')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.analytics.table.google_analytics.purpose')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.analytics.table.google_analytics.duration')}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.analytics.table.hotjar.name')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.analytics.table.hotjar.purpose')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.analytics.table.hotjar.duration')}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.analytics.table.internal.name')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.analytics.table.internal.purpose')}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{t('cookie-policy.types.analytics.table.internal.duration')}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('cookie-policy.managing.title')}</h2>
                                <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                                    <div className="mb-6">
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('cookie-policy.managing.consent.title')}</h3>
                                        <p className="mb-4 text-gray-700">{t('cookie-policy.managing.consent.description')}</p>
                                        <ul className="list-inside list-disc space-y-2 text-gray-700">
                                            {[0, 1, 2, 3].map((i) => (
                                                <li key={i}>{t(`cookie-policy.managing.consent.options.${i}`)}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-lg bg-white p-4">
                                            <h4 className="mb-2 font-semibold text-gray-900">{t('cookie-policy.managing.browser.title')}</h4>
                                            <p className="mb-2 text-sm text-gray-700">{t('cookie-policy.managing.browser.description')}</p>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                                                {[0, 1, 2, 3].map((i) => (
                                                    <li key={i}>{t(`cookie-policy.managing.browser.options.${i}`)}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="rounded-lg bg-white p-4">
                                            <h4 className="mb-2 font-semibold text-gray-900">{t('cookie-policy.managing.opt_out.title')}</h4>
                                            <p className="mb-2 text-sm text-gray-700">{t('cookie-policy.managing.opt_out.description')}</p>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                                                {[0, 1, 2, 3].map((i) => (
                                                    <li key={i}>{t(`cookie-policy.managing.opt_out.options.${i}`)}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('cookie-policy.impact.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-6 text-gray-700">{t('cookie-policy.impact.description')}</p>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                            <div className="mb-3 flex items-center">
                                                <X className="mr-2 h-5 w-5 text-red-600" />
                                                <h4 className="font-semibold text-red-800">{t('cookie-policy.impact.without_essential.title')}</h4>
                                            </div>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
                                                {[0, 1, 2, 3].map((i) => (
                                                    <li key={i}>{t(`cookie-policy.impact.without_essential.items.${i}`)}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                            <div className="mb-3 flex items-center">
                                                <RefreshCw className="mr-2 h-5 w-5 text-yellow-600" />
                                                <h4 className="font-semibold text-yellow-800">{t('cookie-policy.impact.without_optional.title')}</h4>
                                            </div>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700">
                                                {[0, 1, 2, 3].map((i) => (
                                                    <li key={i}>{t(`cookie-policy.impact.without_optional.items.${i}`)}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('cookie-policy.third_party.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-4 text-gray-700">{t('cookie-policy.third_party.description')}</p>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                                <BarChart3 className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <h4 className="mb-2 font-semibold text-gray-900">{t('cookie-policy.third_party.analytics_partners.title')}</h4>
                                            <p className="text-sm text-gray-600">{t('cookie-policy.third_party.analytics_partners.description')}</p>
                                        </div>

                                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                                <Shield className="h-6 w-6 text-green-600" />
                                            </div>
                                            <h4 className="mb-2 font-semibold text-gray-900">{t('cookie-policy.third_party.security_services.title')}</h4>
                                            <p className="text-sm text-gray-600">{t('cookie-policy.third_party.security_services.description')}</p>
                                        </div>

                                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                                                <Settings className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <h4 className="mb-2 font-semibold text-gray-900">{t('cookie-policy.third_party.support_tools.title')}</h4>
                                            <p className="text-sm text-gray-600">{t('cookie-policy.third_party.support_tools.description')}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('cookie-policy.updates.title')}</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-4 text-gray-700">{t('cookie-policy.updates.description')}</p>
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <h4 className="mb-2 font-semibold text-blue-800">{t('cookie-policy.updates.notification.title')}</h4>
                                        <ul className="list-inside list-disc space-y-1 text-sm text-blue-700">
                                            {[0, 1, 2, 3].map((i) => (
                                                <li key={i}>{t(`cookie-policy.updates.notification.methods.${i}`)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Contact Section */}
                        <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                            <div className="text-center">
                                <h2 className="mb-4 text-2xl font-bold">{t('cookie-policy.contact.title')}</h2>
                                <p className="mb-6 text-blue-100">{t('cookie-policy.contact.description')}</p>
                                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <a href={`mailto:${t('cookie-policy.contact.email')}`} className="rounded-full bg-white px-6 py-3 font-semibold text-blue-600 transition-all hover:bg-gray-100">
                                        {t('cookie-policy.contact.button_primary')}
                                    </a>
                                    <a href="/contact" className="rounded-full border-2 border-white px-6 py-3 font-semibold text-white transition-all hover:bg-white hover:text-blue-600">
                                        {t('cookie-policy.contact.button_secondary')}
                                    </a>
                                </div>
                                <div className="mt-4 text-sm text-blue-100">{t('cookie-policy.contact.compliance')}</div>
                            </div>
                        </section>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
