'use client';
import MainLayout from '@/components/layout/MainLayout';
import { CheckCircle, Clock, CreditCard, Database, Eye, Lock, Mail, Shield, Users } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
                                Your Privacy Matters
                            </div>
                            <h1 className="mb-8 text-4xl font-black leading-tight text-gray-900 md:text-5xl">Privacy Policy</h1>
                            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
                                At Andgate Technologies, we are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use,
                                and safeguard your data.
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
                                Our Privacy Commitments
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-blue-100 p-2">
                                        <Lock className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Secure Data Storage</h3>
                                        <p className="text-sm text-gray-600">Your data is encrypted and stored securely with bank-level protection.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-green-100 p-2">
                                        <Eye className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Transparent Practices</h3>
                                        <p className="text-sm text-gray-600">We clearly explain what data we collect and how we use it.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-purple-100 p-2">
                                        <Users className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Your Control</h3>
                                        <p className="text-sm text-gray-600">You can access, modify, or delete your personal data at any time.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-orange-100 p-2">
                                        <Database className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Minimal Data Collection</h3>
                                        <p className="text-sm text-gray-600">We only collect data necessary to provide our services.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Sections */}
                        <div className="prose prose-lg max-w-none">
                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">Information We Collect</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Personal Information</h3>
                                    <ul className="mb-6 list-inside list-disc space-y-2 text-gray-700">
                                        <li>Name, email address, and contact information</li>
                                        <li>Business information (company name, address, tax ID)</li>
                                        <li>Payment information (processed securely by our payment partners)</li>
                                        <li>Account preferences and settings</li>
                                    </ul>

                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Usage Information</h3>
                                    <ul className="mb-6 list-inside list-disc space-y-2 text-gray-700">
                                        <li>Transaction data and sales analytics</li>
                                        <li>System usage patterns and feature interactions</li>
                                        <li>Device information and IP addresses</li>
                                        <li>Log files and error reports</li>
                                    </ul>

                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Customer Data</h3>
                                    <ul className="list-inside list-disc space-y-2 text-gray-700">
                                        <li>Customer information you input into the system</li>
                                        <li>Purchase history and preferences</li>
                                        <li>Loyalty program data</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">How We Use Your Information</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <h3 className="mb-3 text-lg font-semibold text-gray-900">Service Delivery</h3>
                                            <ul className="list-inside list-disc space-y-1 text-gray-700">
                                                <li>Process transactions and payments</li>
                                                <li>Provide customer support</li>
                                                <li>Maintain and improve our services</li>
                                                <li>Generate analytics and reports</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="mb-3 text-lg font-semibold text-gray-900">Communication</h3>
                                            <ul className="list-inside list-disc space-y-1 text-gray-700">
                                                <li>Send service updates and notifications</li>
                                                <li>Provide technical support</li>
                                                <li>Share important account information</li>
                                                <li>Marketing communications (with consent)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">Data Security</h2>
                                <div className="rounded-xl border border-green-100 bg-gradient-to-r from-green-50 to-blue-50 p-6">
                                    <div className="mb-4 flex items-center">
                                        <Shield className="mr-3 h-6 w-6 text-green-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Our Security Measures</h3>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <ul className="space-y-2 text-gray-700">
                                                <li>• 256-bit SSL encryption for all data transmission</li>
                                                <li>• PCI DSS compliance for payment processing</li>
                                                <li>• Regular security audits and penetration testing</li>
                                                <li>• Multi-factor authentication</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <ul className="space-y-2 text-gray-700">
                                                <li>• Secure cloud infrastructure with redundancy</li>
                                                <li>• Employee security training and background checks</li>
                                                <li>• 24/7 security monitoring</li>
                                                <li>• Regular data backups</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">Your Rights and Choices</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <h3 className="mb-3 font-semibold text-gray-900">Access and Control</h3>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                                                <li>View and download your personal data</li>
                                                <li>Update or correct your information</li>
                                                <li>Delete your account and data</li>
                                                <li>Opt-out of marketing communications</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="mb-3 font-semibold text-gray-900">Data Portability</h3>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                                                <li>Export your data in standard formats</li>
                                                <li>Transfer data to other services</li>
                                                <li>Restrict certain data processing</li>
                                                <li>File complaints with supervisory authorities</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">Data Retention</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-4 text-gray-700">We retain your personal information only for as long as necessary to provide our services and comply with legal obligations:</p>
                                    <ul className="list-inside list-disc space-y-2 text-gray-700">
                                        <li>
                                            <strong>Account Information:</strong> Retained while your account is active and for 7 years after closure for legal compliance
                                        </li>
                                        <li>
                                            <strong>Transaction Records:</strong> Retained for 7 years as required by financial regulations
                                        </li>
                                        <li>
                                            <strong>Usage Data:</strong> Aggregated and anonymized data may be retained indefinitely for analytics
                                        </li>
                                        <li>
                                            <strong>Marketing Data:</strong> Deleted immediately upon opt-out request
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">Third-Party Services</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-4 text-gray-700">We work with trusted third-party service providers to deliver our services:</p>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="text-center">
                                            <div className="mx-auto mb-2 w-fit rounded-full bg-blue-100 p-3">
                                                <CreditCard className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <h4 className="font-semibold text-gray-900">Payment Processors</h4>
                                            <p className="text-sm text-gray-600">Secure payment processing partners</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="mx-auto mb-2 w-fit rounded-full bg-green-100 p-3">
                                                <Database className="h-6 w-6 text-green-600" />
                                            </div>
                                            <h4 className="font-semibold text-gray-900">Cloud Storage</h4>
                                            <p className="text-sm text-gray-600">Secure data hosting providers</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="mx-auto mb-2 w-fit rounded-full bg-purple-100 p-3">
                                                <Mail className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <h4 className="font-semibold text-gray-900">Communication</h4>
                                            <p className="text-sm text-gray-600">Email and messaging services</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Contact Section */}
                        <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                            <div className="text-center">
                                <h2 className="mb-4 text-2xl font-bold">Questions About Privacy?</h2>
                                <p className="mb-6 text-blue-100">We&apos;re here to help. Contact our privacy team for any questions or concerns about your data.</p>
                                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <a href="mailto:support@andgatetech.net" className="rounded-full bg-white px-6 py-3 font-semibold text-blue-600 transition-all hover:bg-gray-100">
                                        support@andgatetech.net
                                    </a>
                                    <a href="/contact" className="rounded-full border-2 border-white px-6 py-3 font-semibold text-white transition-all hover:bg-white hover:text-blue-600">
                                        Contact Us
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
