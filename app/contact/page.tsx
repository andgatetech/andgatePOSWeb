'use client';
import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import { useCreateLeadMutation } from '@/store/features/auth/authApi';
import {
    ArrowLeft,
    Building,
    CheckCircle,
    Clock,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Send,
    User,
    Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
    const { t } = getTranslation();
    const [createLead] = useCreateLeadMutation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        business_name: '',
        business_location: '',
        store_size: '',
        package: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createLead({
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                business_name: formData.business_name,
                business_location: formData.business_location,
                store_size: formData.store_size,
                package: formData.package,
            }).unwrap();
            setIsSubmitted(true);
            setFormData({ name: '', email: '', phone: '', business_name: '', business_location: '', store_size: '', package: '' });
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const benefits = [
        { icon: <Clock className="h-5 w-5" />, text: 'Response within 24 hours' },
        { icon: <Zap className="h-5 w-5" />, text: 'Free setup consultation' },
        { icon: <MessageCircle className="h-5 w-5" />, text: 'Dedicated onboarding support' },
    ];

    return (
        <MainLayout>
            {/* ── Hero ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79] pb-20 pt-32">
                <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-white/10 blur-[100px]" />
                <div className="absolute -right-20 top-1/2 h-[400px] w-[400px] rounded-full bg-white/10 blur-[100px]" />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#046ca9]/30 bg-[#046ca9]/15 px-4 py-2 text-sm font-medium text-[#5bb8e8] backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-blue-400">
                            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-blue-400 opacity-75" />
                        </span>
                        Get in Touch
                    </div>
                    <h1 className="mb-5 text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
                        {t('contact.page_title') || "Let's Talk About"}
                        <span className="block bg-gradient-to-r from-[#5bb8e8] to-[#e8f4fb] bg-clip-text text-transparent">
                            Your Business
                        </span>
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400">
                        {t('contact.page_subtitle') || 'Tell us about your store and we\'ll get back to you with a personalised plan.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        {benefits.map((b, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                <span className="text-[#5bb8e8]">{b.icon}</span>
                                {b.text}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50 to-transparent" />
            </section>

            {/* ── Form + Info ── */}
            <div className="bg-slate-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-2">

                        {/* Contact Form */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                            <h2 className="mb-1 text-xl font-bold text-gray-900">Send us a message</h2>
                            <p className="mb-8 text-sm text-gray-500">Fill in the details below and we'll be in touch shortly.</p>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            {t('contact.form.name')}
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm transition-colors focus:border-[#046ca9] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#046ca9]"
                                                placeholder="Your full name"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            {t('contact.form.email')}
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm transition-colors focus:border-[#046ca9] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#046ca9]"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            {t('contact.form.phone')}
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm transition-colors focus:border-[#046ca9] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#046ca9]"
                                                placeholder="+880 1234 567890"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="business_name" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            {t('contact.form.business_name')}
                                        </label>
                                        <div className="relative">
                                            <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                id="business_name"
                                                name="business_name"
                                                value={formData.business_name}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm transition-colors focus:border-[#046ca9] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#046ca9]"
                                                placeholder="Your business name"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="business_location" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            {t('contact.form.business_location')}
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                id="business_location"
                                                name="business_location"
                                                value={formData.business_location}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm transition-colors focus:border-[#046ca9] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#046ca9]"
                                                placeholder="Dhaka, Bangladesh"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="store_size" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            {t('contact.form.store_size')}
                                        </label>
                                        <select
                                            id="store_size"
                                            name="store_size"
                                            value={formData.store_size}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors focus:border-[#046ca9] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#046ca9]"
                                        >
                                            <option value="">Number of stores</option>
                                            <option value="1">{t('contact.form.store_options.1')}</option>
                                            <option value="2">{t('contact.form.store_options.2')}</option>
                                            <option value="5">{t('contact.form.store_options.5')}</option>
                                            <option value="10+">{t('contact.form.store_options.10+')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="package" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                        {t('contact.form.package')}
                                    </label>
                                    <select
                                        id="package"
                                        name="package"
                                        value={formData.package}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors focus:border-[#046ca9] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#046ca9]"
                                    >
                                        <option value="">Select a plan</option>
                                        <option value="starter">{t('contact.form.package_options.starter')}</option>
                                        <option value="professional">{t('contact.form.package_options.professional')}</option>
                                        <option value="premium">{t('contact.form.package_options.premium')}</option>
                                        <option value="enterprise">{t('contact.form.package_options.enterprise')}</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#046ca9]/20 transition-all hover:scale-[1.02] hover:shadow-[#046ca9]/30 disabled:scale-100 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            {t('contact.form.submitting')}
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            {t('contact.form.submit_button')}
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-xs text-gray-400">
                                    By submitting, you agree to our{' '}
                                    <Link href="/privacy-policy" className="text-[#046ca9] hover:underline">Privacy Policy</Link>{' '}
                                    and{' '}
                                    <Link href="/terms-of-service" className="text-[#046ca9] hover:underline">Terms of Service</Link>.
                                </p>
                            </form>
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-6">
                            {/* Contact Info Card */}
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#046ca9] to-[#034d79] p-8 text-white shadow-lg shadow-[#046ca9]/20">
                                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
                                <div className="pointer-events-none absolute -bottom-10 -left-4 h-40 w-40 rounded-full bg-white/5" />
                                <h3 className="relative mb-6 text-xl font-bold">{t('contact.contact_info.title') || 'Contact Information'}</h3>
                                <div className="relative space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/15">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">{t('contact.contact_info.visit.title') || 'Address'}</p>
                                            <p className="mt-0.5 text-sm text-blue-100">{t('contact.contact_info.visit.address') || 'Dhaka, Bangladesh'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/15">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">{t('contact.contact_info.call.title') || 'Phone'}</p>
                                            <p className="mt-0.5 text-sm text-blue-100">{t('contact.contact_info.call.phone') || '+880 1234 567890'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/15">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">{t('contact.contact_info.email.title') || 'Email'}</p>
                                            <p className="mt-0.5 text-sm text-blue-100">{t('contact.contact_info.email.email') || 'hello@andgatepos.com'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Next Steps Card */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                                <h3 className="mb-6 text-lg font-bold text-gray-900">{t('contact.next_steps.title') || 'What Happens Next?'}</h3>
                                <div className="space-y-5">
                                    {[0, 1, 2].map((idx) => (
                                        <div key={idx} className="flex items-start gap-4">
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white shadow-sm shadow-[#046ca9]/30">
                                                {t(`contact.next_steps.steps.${idx}.step`) || idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{t(`contact.next_steps.steps.${idx}.title`)}</p>
                                                <p className="mt-0.5 text-sm text-gray-500">{t(`contact.next_steps.steps.${idx}.description`)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {isSubmitted && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="mb-5 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
                                <CheckCircle className="h-9 w-9 text-green-600" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h2 className="mb-2 text-xl font-bold text-gray-900">{t('contact.success_modal.title')}</h2>
                            <p className="mb-7 text-sm text-gray-500">{t('contact.success_modal.description')}</p>
                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/"
                                    onClick={() => setIsSubmitted(false)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    {t('contact.success_modal.back_home')}
                                </Link>
                                <Link
                                    href="/login"
                                    onClick={() => setIsSubmitted(false)}
                                    className="inline-flex items-center justify-center rounded-xl border border-[#046ca9]/20 px-6 py-3 text-sm font-semibold text-[#046ca9] transition-all hover:bg-[#046ca9]/5"
                                >
                                    {t('contact.success_modal.sign_in')}
                                </Link>
                                <button onClick={() => setIsSubmitted(false)} className="text-xs text-gray-400 transition-colors hover:text-gray-600">
                                    {t('contact.success_modal.continue')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
