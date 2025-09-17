'use client';
import MainLayout from '@/components/layout/MainLayout';
import { AlertTriangle, Ban, CheckCircle, Clock, CreditCard, FileText, RefreshCw, Scale, Shield, Users } from 'lucide-react';

export default function TermsOfServicePage() {
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
                                Legal Terms & Conditions
                            </div>
                            <h1 className="mb-8 text-4xl font-black leading-tight text-gray-900 md:text-5xl">Terms of Service</h1>
                            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
                                These Terms of Service govern your use of AndgatePOS services. By using our platform, you agree to these terms and conditions.
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
                                Key Terms Summary
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-blue-100 p-2">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Service Agreement</h3>
                                        <p className="text-sm text-gray-600">Your rights and responsibilities when using AndgatePOS.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-green-100 p-2">
                                        <CreditCard className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Payment Terms</h3>
                                        <p className="text-sm text-gray-600">Billing, subscriptions, and payment processing details.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-purple-100 p-2">
                                        <Shield className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Data Protection</h3>
                                        <p className="text-sm text-gray-600">How we handle and protect your business data.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 rounded-full bg-orange-100 p-2">
                                        <Users className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">User Responsibilities</h3>
                                        <p className="text-sm text-gray-600">Acceptable use policies and account obligations.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Sections */}
                        <div className="prose prose-lg max-w-none">
                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">1. Acceptance of Terms</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-4 text-gray-700">
                                        By accessing or using AndgatePOS (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of
                                        these terms, you may not access the Service.
                                    </p>
                                    <p className="mb-4 text-gray-700">
                                        These Terms apply to all visitors, users, and others who access or use the Service, including businesses, merchants, and individual users (&quot;Users&quot; or
                                        &quot;you&quot;).
                                    </p>
                                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                        <div className="flex">
                                            <AlertTriangle className="mr-3 mt-0.5 h-5 w-5 text-yellow-600" />
                                            <div>
                                                <h4 className="font-semibold text-yellow-800">Important Notice</h4>
                                                <p className="text-sm text-yellow-700">
                                                    By using our Service, you represent that you are at least 18 years old and have the legal capacity to enter into these Terms.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">2. Service Description</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-4 text-gray-700">AndgatePOS provides cloud-based point-of-sale software and related services including:</p>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <h3 className="mb-3 text-lg font-semibold text-gray-900">Core Features</h3>
                                            <ul className="list-inside list-disc space-y-1 text-gray-700">
                                                <li>Transaction processing and payment acceptance</li>
                                                <li>Inventory management and tracking</li>
                                                <li>Sales reporting and analytics</li>
                                                <li>Customer relationship management</li>
                                                <li>Multi-location support</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="mb-3 text-lg font-semibold text-gray-900">Additional Services</h3>
                                            <ul className="list-inside list-disc space-y-1 text-gray-700">
                                                <li>24/7 customer support</li>
                                                <li>Regular software updates</li>
                                                <li>Data backup and security</li>
                                                <li>Integration with third-party services</li>
                                                <li>Training and onboarding</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">3. Account Registration</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Account Requirements</h3>
                                    <p className="mb-4 text-gray-700">To access certain features of the Service, you must register for an account. You agree to:</p>
                                    <ul className="mb-6 list-inside list-disc space-y-2 text-gray-700">
                                        <li>Provide accurate, current, and complete information during registration</li>
                                        <li>Maintain and promptly update your account information</li>
                                        <li>Maintain the security of your password and account</li>
                                        <li>Accept responsibility for all activities under your account</li>
                                        <li>Notify us immediately of any unauthorized access or security breach</li>
                                    </ul>

                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Account Suspension</h3>
                                    <p className="text-gray-700">
                                        We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activities, or pose a risk to other users or our Service.
                                    </p>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">4. Payment Terms</h2>
                                <div className="rounded-xl border border-green-100 bg-gradient-to-r from-green-50 to-blue-50 p-6">
                                    <div className="mb-4 flex items-center">
                                        <CreditCard className="mr-3 h-6 w-6 text-green-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Billing and Subscriptions</h3>
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <h4 className="mb-2 font-semibold text-gray-900">Subscription Plans</h4>
                                            <ul className="space-y-1 text-sm text-gray-700">
                                                <li>• Monthly and annual billing cycles available</li>
                                                <li>• Prices subject to change with 30 days notice</li>
                                                <li>• Auto-renewal unless cancelled</li>
                                                <li>• Pro-rated billing for plan changes</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="mb-2 font-semibold text-gray-900">Transaction Fees</h4>
                                            <ul className="space-y-1 text-sm text-gray-700">
                                                <li>• Processing fees apply to card transactions</li>
                                                <li>• Rates vary by payment method and volume</li>
                                                <li>• No hidden fees or setup costs</li>
                                                <li>• Transparent fee structure provided</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
                                        <h4 className="mb-2 font-semibold text-gray-900">Refund Policy</h4>
                                        <p className="text-sm text-gray-700">
                                            Subscription fees are non-refundable except as required by law. Transaction processing fees are non-refundable. You may cancel your subscription at any
                                            time.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">5. Acceptable Use Policy</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="mb-6">
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Permitted Uses</h3>
                                        <p className="mb-4 text-gray-700">You may use our Service for lawful business purposes including:</p>
                                        <ul className="list-inside list-disc space-y-1 text-gray-700">
                                            <li>Processing legitimate sales transactions</li>
                                            <li>Managing inventory and customer data</li>
                                            <li>Generating business reports and analytics</li>
                                            <li>Integrating with compatible third-party services</li>
                                        </ul>
                                    </div>

                                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                        <div className="flex">
                                            <Ban className="mr-3 mt-0.5 h-5 w-5 text-red-600" />
                                            <div>
                                                <h4 className="mb-2 font-semibold text-red-800">Prohibited Activities</h4>
                                                <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
                                                    <li>Processing fraudulent or unauthorized transactions</li>
                                                    <li>Violating applicable laws or regulations</li>
                                                    <li>Attempting to hack, disrupt, or damage our systems</li>
                                                    <li>Sharing account credentials with unauthorized parties</li>
                                                    <li>Using the Service for illegal activities</li>
                                                    <li>Reverse engineering or copying our software</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">6. Data and Privacy</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="mb-6">
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Your Data</h3>
                                        <p className="mb-4 text-gray-700">
                                            You retain ownership of all data you input into our Service. We serve as a data processor and will handle your data according to our Privacy Policy and
                                            applicable data protection laws.
                                        </p>
                                        <ul className="list-inside list-disc space-y-2 text-gray-700">
                                            <li>You are responsible for the accuracy and legality of your data</li>
                                            <li>We will not access your data except as necessary to provide the Service</li>
                                            <li>You can export your data at any time</li>
                                            <li>Data deletion requests will be processed promptly</li>
                                        </ul>
                                    </div>

                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <h4 className="mb-2 font-semibold text-blue-800">Data Security Commitment</h4>
                                        <p className="text-sm text-blue-700">
                                            We implement industry-standard security measures to protect your data, including encryption, access controls, and regular security audits. See our Privacy
                                            Policy for detailed information.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">7. Service Availability</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <h3 className="mb-3 font-semibold text-gray-900">Uptime Commitment</h3>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                                                <li>99.9% uptime service level agreement</li>
                                                <li>24/7 system monitoring and support</li>
                                                <li>Scheduled maintenance with advance notice</li>
                                                <li>Redundant systems and data backups</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="mb-3 font-semibold text-gray-900">Service Updates</h3>
                                            <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                                                <li>Regular feature updates and improvements</li>
                                                <li>Security patches applied automatically</li>
                                                <li>Advance notice for major changes</li>
                                                <li>Optional beta testing programs</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">8. Termination</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="mb-6">
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Termination by You</h3>
                                        <p className="mb-4 text-gray-700">
                                            You may terminate your account at any time by cancelling your subscription through your account settings or by contacting our support team.
                                        </p>
                                        <ul className="list-inside list-disc space-y-2 text-gray-700">
                                            <li>Cancellation takes effect at the end of your current billing period</li>
                                            <li>You can export your data before termination</li>
                                            <li>No refunds for unused subscription time</li>
                                            <li>Account reactivation available within 30 days</li>
                                        </ul>
                                    </div>

                                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                                        <div className="flex">
                                            <RefreshCw className="mr-3 mt-0.5 h-5 w-5 text-orange-600" />
                                            <div>
                                                <h4 className="mb-2 font-semibold text-orange-800">Termination by Us</h4>
                                                <p className="text-sm text-orange-700">
                                                    We may suspend or terminate your account for violations of these Terms, non-payment, or other legitimate business reasons with appropriate notice.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">9. Limitation of Liability</h2>
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                                    <p className="mb-4 text-gray-700">
                                        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ANDGATE TECHNOLOGIES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                                        DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                                    </p>
                                    <p className="mb-4 text-gray-700">
                                        OUR TOTAL LIABILITY TO YOU FOR ANY DAMAGES ARISING FROM OR RELATED TO THESE TERMS OR YOUR USE OF THE SERVICE SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO US IN
                                        THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
                                    </p>
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <h4 className="mb-2 font-semibold text-blue-800">Service Level Remedies</h4>
                                        <p className="text-sm text-blue-700">
                                            For service level failures, our liability is limited to service credits as outlined in our SLA, which constitutes your sole and exclusive remedy for such
                                            failures.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-12">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">10. Changes to Terms</h2>
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <p className="mb-4 text-gray-700">
                                        We reserve the right to modify these Terms at any time. We will notify you of material changes by email or through our Service at least 30 days before the
                                        changes take effect.
                                    </p>
                                    <p className="mb-4 text-gray-700">
                                        Your continued use of the Service after the changes take effect constitutes acceptance of the new Terms. If you do not agree to the new Terms, you must stop
                                        using the Service.
                                    </p>
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                        <h4 className="mb-2 font-semibold text-green-800">Notification Methods</h4>
                                        <ul className="list-inside list-disc space-y-1 text-sm text-green-700">
                                            <li>Email notifications to registered account email</li>
                                            <li>In-app notifications and announcements</li>
                                            <li>Updates posted on our website</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Contact Section */}
                        <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                            <div className="text-center">
                                <h2 className="mb-4 text-2xl font-bold">Questions About Our Terms?</h2>
                                <p className="mb-6 text-blue-100">Our legal team is available to clarify any questions about these Terms of Service.</p>
                                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <a href="mailto:support@andgatetech.net" className="rounded-full bg-white px-6 py-3 font-semibold text-blue-600 transition-all hover:bg-gray-100">
                                        support@andgatetech.net
                                    </a>
                                    <a href="/contact" className="rounded-full border-2 border-white px-6 py-3 font-semibold text-white transition-all hover:bg-white hover:text-blue-600">
                                        Contact Legal Team
                                    </a>
                                </div>
                                <div className="mt-4 text-sm text-blue-100">Available Monday-Friday, 9:00 AM - 6:00 PM</div>
                            </div>
                        </section>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
