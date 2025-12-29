'use client';


import { useCurrentStore } from '@/hooks/useCurrentStore';
import { RootState } from '@/store';
import { useCreateLeadMutation } from '@/store/features/auth/authApi';

import { Building, Mail, MapPin, Phone, Send, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function SubscriptionPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
    const { currentStore, currentStoreId } = useCurrentStore();

    const [createLead] = useCreateLeadMutation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        store_id: '',
        store_name: '',
        package: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Pre-fill form data from user and URL params
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            }));
        }

        // Pre-fill store data
        if (currentStore && currentStoreId) {
            setFormData((prev) => ({
                ...prev,
                store_id: currentStoreId.toString(),
                store_name: currentStore.store_name || '',
            }));
        }

        // Get package from URL params
        const packageParam = searchParams.get('package');
        if (packageParam) {
            setFormData((prev) => ({
                ...prev,
                package: packageParam.toLowerCase(),
            }));
        }
    }, [user, currentStore, currentStoreId, searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await createLead({
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                store_id: formData.store_id,
                store_name: formData.store_name,
                package: formData.package,
            }).unwrap();

            setIsSubmitted(true);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
                    <div className="text-center">
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">Upgrade Your Subscription</h1>
                        <p className="text-gray-600">Fill out the form below and our team will contact you to complete your upgrade.</p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Contact Form */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-gray-700">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                                            placeholder="+880 1234 567890"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="store_name" className="mb-2 block text-sm font-semibold text-gray-700">
                                        Store Name *
                                    </label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            id="store_name"
                                            name="store_name"
                                            value={formData.store_name}
                                            readOnly
                                            className="w-full cursor-not-allowed rounded-xl border border-gray-300 bg-gray-100 py-3 pl-11 pr-4 text-gray-700"
                                            placeholder="Your Store Name"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="package" className="mb-2 block text-sm font-semibold text-gray-700">
                                    Selected Package *
                                </label>
                                <select
                                    id="package"
                                    name="package"
                                    value={formData.package}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                                >
                                    <option value="">Select a package</option>
                                    <option value="basic">Basic Package - ৳200/month</option>
                                    <option value="sme">SME Package - ৳500/month</option>
                                    <option value="enterprise">Enterprise Package - ৳2,000/month</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-5 w-5" />
                                        Submit Request
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-xl font-bold text-gray-900">Get in Touch</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Visit Us</h4>
                                        <p className="text-sm text-gray-600">House: 34, Road: 3, Block: B, Aftabnagar, Badda, Dhaka, Bangladesh</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                        <Phone className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Call Us</h4>
                                        <p className="text-sm text-gray-600">+880 1577303608</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Email Us</h4>
                                        <p className="text-sm text-gray-600">support@andgatetech.net</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-xl font-bold text-gray-900">What Happens Next?</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">We Review Your Request</h4>
                                        <p className="text-sm text-gray-600">Our team reviews your upgrade request within 2 hours</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">2</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Payment Setup</h4>
                                        <p className="text-sm text-gray-600">We guide you through the payment process</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">3</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Instant Activation</h4>
                                        <p className="text-sm text-gray-600">Your new plan is activated immediately</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Modal */}
                {isSubmitted && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                        <div className="relative mx-4 w-full max-w-md transform rounded-2xl bg-white p-8 shadow-2xl transition-all">
                            <button onClick={() => setIsSubmitted(false)} className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="mb-6 flex justify-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                                    <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>

                            <div className="text-center">
                                <h3 className="mb-2 text-2xl font-bold text-gray-900">Request Submitted!</h3>
                                <p className="mb-6 text-gray-600">Thank you for your upgrade request. Our team will contact you shortly to complete the process.</p>
                                <button
                                    onClick={() => router.push('/store')}
                                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white transition-all hover:from-blue-700 hover:to-blue-800"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
