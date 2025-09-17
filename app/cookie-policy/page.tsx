'use client';

import MainLayout from '@/components/layout/MainLayout';
import { BarChart3, CheckCircle, Clock, Cookie, Eye, RefreshCw, Settings, Shield,  ToggleLeft,  X } from 'lucide-react';

export default function CookiePolicyPage() {
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
                                Transparent Cookie Usage
                            </div>
                            <h1 className="mb-8 text-4xl font-black leading-tight text-gray-900 md:text-5xl">Cookie Policy</h1>
                            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
                                This Cookie Policy explains how Andgate Technologies uses cookies and similar technologies to enhance your experience on our website and platform.
                            </p>
                            <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
                                <Clock className="mr-2 h-4 w-4" />
                                Last updated: September 17, 2025
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
                                Cookie Usage Overview
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-blue-100 p-2">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Essential Cookies</h3>
                                        <p className="text-sm text-gray-600">Required for basic website functionality and security.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-green-100 p-2">
                                        <BarChart3 className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Analytics Cookies</h3>
                                        <p className="text-sm text-gray-600">Help us understand how users interact with our platform.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-purple-100 p-2">
                                        <Eye className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Functional Cookies</h3>
                                        <p className="text-sm text-gray-600">Remember your preferences and personalize experience.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-orange-100 p-2">
                                        <Settings className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Your Control</h3>
                                        <p className="text-sm text-gray-600">Manage cookie preferences through your browser settings.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Sections */}
                        <div className="prose prose-lg max-w-none">
                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">What Are Cookies?</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-4 text-gray-700">
                                        Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your
                                        preferences and understanding how you use our platform.
                                    </p>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-lg bg-blue-50 p-4">
                                            <h3 className="mb-2 font-semibold text-blue-900">First-Party Cookies</h3>
                                            <p className="text-sm text-blue-800">Set directly by AndgatePOS to enhance functionality and user experience.</p>
                                        </div>
                                        <div className="rounded-lg bg-green-50 p-4">
                                            <h3 className="mb-2 font-semibold text-green-900">Third-Party Cookies</h3>
                                            <p className="text-sm text-green-800">Set by our trusted partners for analytics, security, and service improvements.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">Types of Cookies We Use</h2>

                                {/* Essential Cookies */}
                                <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-center">
                                        <div className="mr-3 rounded-full bg-red-100 p-2">
                                            <Shield className="h-5 w-5 text-red-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900">Essential Cookies (Always Active)</h3>
                                    </div>
                                    <p className="mb-4 text-gray-700">
                                        These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you.
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Cookie Name</th>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Purpose</th>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">session_id</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">Maintains user session</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">Session</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">csrf_token</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">Security protection</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">Session</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">auth_token</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">User authentication</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">30 days</td>
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
                                        <h3 className="text-xl font-semibold text-gray-900">Functional Cookies</h3>
                                        <div className="ml-auto">
                                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <p className="mb-4 text-gray-700">These cookies enable enhanced functionality and personalization. They may be set by us or third parties.</p>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Cookie Name</th>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Purpose</th>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">user_preferences</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">Remember dashboard layout</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">1 year</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">theme_settings</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">Remember theme preferences</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">1 year</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">language_pref</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">Remember language selection</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">1 year</td>
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
                                        <h3 className="text-xl font-semibold text-gray-900">Analytics Cookies</h3>
                                        <div className="ml-auto">
                                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <p className="mb-4 text-gray-700">These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Service</th>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Purpose</th>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">Google Analytics</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">Website usage analytics</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">2 years</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">Hotjar</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">User behavior analysis</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">1 year</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 text-sm text-gray-700">Internal Analytics</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">Performance monitoring</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">90 days</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">Managing Your Cookie Preferences</h2>
                                <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                                    <div className="mb-6">
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Cookie Consent Management</h3>
                                        <p className="mb-4 text-gray-700">When you first visit our website, you&apos;ll see a cookie consent banner. You can:</p>
                                        <ul className="list-inside list-disc space-y-2 text-gray-700">
                                            <li>Accept all cookies for the full website experience</li>
                                            <li>Customize your preferences by cookie category</li>
                                            <li>Reject optional cookies (essential cookies will still be used)</li>
                                            <li>Change your preferences anytime through the cookie settings</li>
                                        </ul>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-lg bg-white p-4">
                                            <h4 className="mb-2 font-semibold text-gray-900">Browser Settings</h4>
                                            <p className="mb-2 text-sm text-gray-700">You can control cookies through your browser settings:</p>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                                                <li>Block all cookies</li>
                                                <li>Block third-party cookies only</li>
                                                <li>Delete existing cookies</li>
                                                <li>Set up automatic cookie deletion</li>
                                            </ul>
                                        </div>
                                        <div className="rounded-lg bg-white p-4">
                                            <h4 className="mb-2 font-semibold text-gray-900">Opt-Out Links</h4>
                                            <p className="mb-2 text-sm text-gray-700">Direct opt-out for analytics services:</p>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                                                <li>Google Analytics Opt-out</li>
                                                <li>Hotjar Opt-out</li>
                                                <li>Marketing cookies opt-out</li>
                                                <li>All optional cookies opt-out</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">Impact of Disabling Cookies</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-6 text-gray-700">While we respect your choice to disable cookies, please note that some functionality may be affected:</p>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                            <div className="mb-3 flex items-center">
                                                <X className="mr-2 h-5 w-5 text-red-600" />
                                                <h4 className="font-semibold text-red-800">Without Essential Cookies</h4>
                                            </div>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
                                                <li>Cannot maintain login sessions</li>
                                                <li>Security features may not work</li>
                                                <li>Shopping cart functionality disabled</li>
                                                <li>Account settings cannot be saved</li>
                                            </ul>
                                        </div>

                                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                            <div className="mb-3 flex items-center">
                                                <RefreshCw className="mr-2 h-5 w-5 text-yellow-600" />
                                                <h4 className="font-semibold text-yellow-800">Without Optional Cookies</h4>
                                            </div>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700">
                                                <li>Preferences reset each visit</li>
                                                <li>Limited personalization</li>
                                                <li>Cannot improve user experience</li>
                                                <li>Less relevant content</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">Third-Party Cookies</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-4 text-gray-700">We work with trusted third-party services that may set their own cookies. These partners help us provide better service:</p>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                                <BarChart3 className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <h4 className="mb-2 font-semibold text-gray-900">Analytics Partners</h4>
                                            <p className="text-sm text-gray-600">Help us understand usage patterns and improve our service.</p>
                                        </div>

                                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                                <Shield className="h-6 w-6 text-green-600" />
                                            </div>
                                            <h4 className="mb-2 font-semibold text-gray-900">Security Services</h4>
                                            <p className="text-sm text-gray-600">Protect against fraud and malicious activities.</p>
                                        </div>

                                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                                                <Settings className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <h4 className="mb-2 font-semibold text-gray-900">Support Tools</h4>
                                            <p className="text-sm text-gray-600">Enable customer support features and live chat.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">Updates to Cookie Policy</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-4 text-gray-700">
                                        We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
                                    </p>
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <h4 className="mb-2 font-semibold text-blue-800">How We Notify You</h4>
                                        <ul className="list-inside list-disc space-y-1 text-sm text-blue-700">
                                            <li>Website banner notification for significant changes</li>
                                            <li>Email notification to registered users</li>
                                            <li>Updated &quot;Last Modified&quot; date on this page</li>
                                            <li>In-app notifications for active users</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Contact Section */}
                        <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                            <div className="text-center">
                                <h2 className="mb-4 text-2xl font-bold">Questions About Cookies?</h2>
                                <p className="mb-6 text-blue-100">Contact our privacy team for questions about cookies or to request changes to your cookie preferences.</p>
                                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <a href="mailto:support@andgatetech.net" className="rounded-full bg-white px-6 py-3 font-semibold text-blue-600 transition-all hover:bg-gray-100">
                                        support@andgatetech.net
                                    </a>
                                    <a href="/contact" className="rounded-full border-2 border-white px-6 py-3 font-semibold text-white transition-all hover:bg-white hover:text-blue-600">
                                        Contact Support
                                    </a>
                                </div>
                                <div className="mt-4 text-sm text-blue-100">✓ GDPR Compliant ✓ CCPA Compliant ✓ Regular Privacy Audits</div>
                            </div>
                        </section>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
