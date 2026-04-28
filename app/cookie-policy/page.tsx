'use client';

import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import { BarChart3, CheckCircle, Clock, Cookie, Eye, RefreshCw, Settings, Shield, X } from 'lucide-react';

export default function CookiePolicyPage() {
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
                            <Cookie className="h-3 w-3" />
                            {t('cookie-policy.badge')}
                        </div>
                        <h1 className="mb-5 text-4xl font-black leading-tight text-white md:text-5xl">
                            {t('cookie-policy.title')}
                        </h1>
                        <p className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-slate-400">
                            {t('cookie-policy.description')}
                        </p>
                        <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
                            <Clock className="h-4 w-4" />
                            {t('cookie-policy.last_updated')}
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="bg-slate-50 py-16">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        {/* Overview */}
                        <div className="mb-12 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                            <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-gray-900">
                                <CheckCircle className="h-5 w-5 text-[#046ca9]" />
                                {t('cookie-policy.overview.title')}
                            </h2>
                            <div className="grid gap-5 md:grid-cols-2">
                                {[
                                    { icon: <Shield className="h-4 w-4 text-blue-600" />, bg: 'bg-blue-100', title: t('cookie-policy.overview.essential.title'), desc: t('cookie-policy.overview.essential.description') },
                                    { icon: <BarChart3 className="h-4 w-4 text-emerald-600" />, bg: 'bg-emerald-100', title: t('cookie-policy.overview.analytics.title'), desc: t('cookie-policy.overview.analytics.description') },
                                    { icon: <Eye className="h-4 w-4 text-violet-600" />, bg: 'bg-violet-100', title: t('cookie-policy.overview.functional.title'), desc: t('cookie-policy.overview.functional.description') },
                                    { icon: <Settings className="h-4 w-4 text-orange-600" />, bg: 'bg-orange-100', title: t('cookie-policy.overview.control.title'), desc: t('cookie-policy.overview.control.description') },
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

                        <div className="space-y-8">
                            {/* What are cookies */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-4 text-xl font-black text-gray-900">{t('cookie-policy.what_are_cookies.title')}</h2>
                                <p className="mb-5 text-sm text-gray-600">{t('cookie-policy.what_are_cookies.description')}</p>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-xl bg-blue-50 p-4">
                                        <h3 className="mb-2 text-sm font-bold text-blue-900">{t('cookie-policy.what_are_cookies.first_party.title')}</h3>
                                        <p className="text-sm text-blue-800">{t('cookie-policy.what_are_cookies.first_party.description')}</p>
                                    </div>
                                    <div className="rounded-xl bg-emerald-50 p-4">
                                        <h3 className="mb-2 text-sm font-bold text-emerald-900">{t('cookie-policy.what_are_cookies.third_party.title')}</h3>
                                        <p className="text-sm text-emerald-800">{t('cookie-policy.what_are_cookies.third_party.description')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Cookie types */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-6 text-xl font-black text-gray-900">{t('cookie-policy.types.title')}</h2>

                                {/* Essential */}
                                <div className="mb-6">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-xl bg-red-100 p-2">
                                            <Shield className="h-4 w-4 text-red-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">{t('cookie-policy.types.essential.title')}</h3>
                                        <span className="ml-auto rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">Required</span>
                                    </div>
                                    <p className="mb-4 text-sm text-gray-600">{t('cookie-policy.types.essential.description')}</p>
                                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                                        <table className="min-w-full">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">{t('cookie-policy.types.essential.table.cookie_name')}</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">{t('cookie-policy.types.essential.table.purpose')}</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">{t('cookie-policy.types.essential.table.duration')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {['session_id', 'csrf_token', 'auth_token'].map((key) => (
                                                    <tr key={key}>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-700">{t(`cookie-policy.types.essential.table.${key}.name`)}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{t(`cookie-policy.types.essential.table.${key}.purpose`)}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{t(`cookie-policy.types.essential.table.${key}.duration`)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Functional */}
                                <div className="mb-6">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-xl bg-violet-100 p-2">
                                            <Settings className="h-4 w-4 text-violet-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">{t('cookie-policy.types.functional.title')}</h3>
                                        <span className="ml-auto rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-600">Optional</span>
                                    </div>
                                    <p className="mb-4 text-sm text-gray-600">{t('cookie-policy.types.functional.description')}</p>
                                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                                        <table className="min-w-full">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">{t('cookie-policy.types.essential.table.cookie_name')}</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">{t('cookie-policy.types.essential.table.purpose')}</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">{t('cookie-policy.types.essential.table.duration')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {['user_preferences', 'theme_settings', 'language_pref'].map((key) => (
                                                    <tr key={key}>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-700">{t(`cookie-policy.types.functional.table.${key}.name`)}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{t(`cookie-policy.types.functional.table.${key}.purpose`)}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{t(`cookie-policy.types.functional.table.${key}.duration`)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Analytics */}
                                <div>
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-xl bg-emerald-100 p-2">
                                            <BarChart3 className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">{t('cookie-policy.types.analytics.title')}</h3>
                                        <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-600">Optional</span>
                                    </div>
                                    <p className="mb-4 text-sm text-gray-600">{t('cookie-policy.types.analytics.description')}</p>
                                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                                        <table className="min-w-full">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">{t('cookie-policy.types.analytics.table.service')}</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">{t('cookie-policy.types.essential.table.purpose')}</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">{t('cookie-policy.types.essential.table.duration')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {['google_analytics', 'hotjar', 'internal'].map((key) => (
                                                    <tr key={key}>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-700">{t(`cookie-policy.types.analytics.table.${key}.name`)}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{t(`cookie-policy.types.analytics.table.${key}.purpose`)}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{t(`cookie-policy.types.analytics.table.${key}.duration`)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Managing cookies */}
                            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-8">
                                <h2 className="mb-5 text-xl font-black text-gray-900">{t('cookie-policy.managing.title')}</h2>
                                <h3 className="mb-3 font-bold text-gray-800">{t('cookie-policy.managing.consent.title')}</h3>
                                <p className="mb-4 text-sm text-gray-600">{t('cookie-policy.managing.consent.description')}</p>
                                <ul className="mb-6 space-y-1.5">
                                    {[0, 1, 2, 3].map((i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                                            {t(`cookie-policy.managing.consent.options.${i}`)}
                                        </li>
                                    ))}
                                </ul>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-xl bg-white p-4">
                                        <h4 className="mb-2 text-sm font-bold text-gray-900">{t('cookie-policy.managing.browser.title')}</h4>
                                        <p className="mb-3 text-sm text-gray-600">{t('cookie-policy.managing.browser.description')}</p>
                                        <ul className="space-y-1.5">
                                            {[0, 1, 2, 3].map((i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />
                                                    {t(`cookie-policy.managing.browser.options.${i}`)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="rounded-xl bg-white p-4">
                                        <h4 className="mb-2 text-sm font-bold text-gray-900">{t('cookie-policy.managing.opt_out.title')}</h4>
                                        <p className="mb-3 text-sm text-gray-600">{t('cookie-policy.managing.opt_out.description')}</p>
                                        <ul className="space-y-1.5">
                                            {[0, 1, 2, 3].map((i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />
                                                    {t(`cookie-policy.managing.opt_out.options.${i}`)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Impact */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-4 text-xl font-black text-gray-900">{t('cookie-policy.impact.title')}</h2>
                                <p className="mb-5 text-sm text-gray-600">{t('cookie-policy.impact.description')}</p>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                        <div className="mb-3 flex items-center gap-2">
                                            <X className="h-4 w-4 text-red-600" />
                                            <h4 className="text-sm font-bold text-red-800">{t('cookie-policy.impact.without_essential.title')}</h4>
                                        </div>
                                        <ul className="space-y-1.5">
                                            {[0, 1, 2, 3].map((i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                                                    {t(`cookie-policy.impact.without_essential.items.${i}`)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                                        <div className="mb-3 flex items-center gap-2">
                                            <RefreshCw className="h-4 w-4 text-yellow-600" />
                                            <h4 className="text-sm font-bold text-yellow-800">{t('cookie-policy.impact.without_optional.title')}</h4>
                                        </div>
                                        <ul className="space-y-1.5">
                                            {[0, 1, 2, 3].map((i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-yellow-700">
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-400" />
                                                    {t(`cookie-policy.impact.without_optional.items.${i}`)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Third party */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-4 text-xl font-black text-gray-900">{t('cookie-policy.third_party.title')}</h2>
                                <p className="mb-5 text-sm text-gray-600">{t('cookie-policy.third_party.description')}</p>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {[
                                        { icon: <BarChart3 className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50', title: t('cookie-policy.third_party.analytics_partners.title'), desc: t('cookie-policy.third_party.analytics_partners.description') },
                                        { icon: <Shield className="h-5 w-5 text-emerald-600" />, bg: 'bg-emerald-50', title: t('cookie-policy.third_party.security_services.title'), desc: t('cookie-policy.third_party.security_services.description') },
                                        { icon: <Settings className="h-5 w-5 text-violet-600" />, bg: 'bg-violet-50', title: t('cookie-policy.third_party.support_tools.title'), desc: t('cookie-policy.third_party.support_tools.description') },
                                    ].map((item, i) => (
                                        <div key={i} className="rounded-xl bg-slate-50 p-4 text-center">
                                            <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}>{item.icon}</div>
                                            <h4 className="mb-1 text-sm font-bold text-gray-900">{item.title}</h4>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Updates */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="mb-4 text-xl font-black text-gray-900">{t('cookie-policy.updates.title')}</h2>
                                <p className="mb-5 text-sm text-gray-600">{t('cookie-policy.updates.description')}</p>
                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                    <h4 className="mb-2 text-sm font-bold text-blue-800">{t('cookie-policy.updates.notification.title')}</h4>
                                    <ul className="space-y-1.5">
                                        {[0, 1, 2, 3].map((i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#046ca9]" />
                                                {t(`cookie-policy.updates.notification.methods.${i}`)}
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
                                    <h2 className="mb-3 text-2xl font-black text-white">{t('cookie-policy.contact.title')}</h2>
                                    <p className="mb-6 text-sm text-slate-400">{t('cookie-policy.contact.description')}</p>
                                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                                        <a
                                            href={`mailto:${t('cookie-policy.contact.email')}`}
                                            className="rounded-full bg-gradient-to-r from-[#046ca9] to-[#034d79] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#046ca9]/25 transition hover:from-[#034d79] hover:to-[#02395b]"
                                        >
                                            {t('cookie-policy.contact.button_primary')}
                                        </a>
                                        <a
                                            href="/contact"
                                            className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                                        >
                                            {t('cookie-policy.contact.button_secondary')}
                                        </a>
                                    </div>
                                    <p className="mt-4 text-xs text-slate-500">{t('cookie-policy.contact.compliance')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
