// 'use client';
// import MainLayout from '@/components/layout/MainLayout';
// import { useCreateLeadMutation } from '@/store/features/auth/authApi';
// import { ArrowLeft, CheckCircle, Mail, MapPin, Phone, Send, User, Building, MapIcon } from 'lucide-react';
// import Link from 'next/link';
// import { useState } from 'react';

// export default function ContactPage() {
//     const [createLead] = useCreateLeadMutation();
//     const [formData, setFormData] = useState({
//         name: '',
//         email: '',
//         phone: '',
//         business_name: '',
//         business_location: '',
//         store_size: '',
//         package: '',
//     });
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [isSubmitted, setIsSubmitted] = useState(false);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value,
//         });
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsSubmitting(true);

//         try {
//             // Call the actual API with the correct data structure
//             const response = await createLead({
//                 name: formData.name,
//                 phone: formData.phone,
//                 email: formData.email,
//                 business_name: formData.business_name,
//                 business_location: formData.business_location,
//                 store_size: formData.store_size,
//                 package: formData.package,
//             }).unwrap();

//             setIsSubmitted(true);
//             // Reset form after successful submission
//             setFormData({
//                 name: '',
//                 email: '',
//                 phone: '',
//                 business_name: '',
//                 business_location: '',
//                 store_size: '',
//                 package: '',
//             });
//         } catch (error) {
//             console.error('Error submitting form:', error);
//             // Handle error appropriately
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <MainLayout>
//             <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
//                 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//                     {/* Header */}
//                     <div className="mb-16 text-center">
//                         <h1 className="mb-6 text-5xl font-bold text-gray-900">
//                             Get Started with
//                             <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">AndgatePOS</span>
//                         </h1>
//                         <p className="mx-auto max-w-3xl text-xl text-gray-600">
//                             Ready to transform your business? Fill out the form below and our team will contact you to set up your personalized POS solution.
//                         </p>
//                     </div>

//                     <div className="grid gap-12 lg:grid-cols-2">
//                         {/* Contact Form */}
//                         <div className="rounded-2xl bg-white p-8 shadow-xl">
//                             <form onSubmit={handleSubmit} className="space-y-6">
//                                 <div className="grid gap-6 md:grid-cols-2">
//                                     <div>
//                                         <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
//                                             Full Name *
//                                         </label>
//                                         <div className="relative">
//                                             <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
//                                             <input
//                                                 type="text"
//                                                 id="name"
//                                                 name="name"
//                                                 value={formData.name}
//                                                 onChange={handleChange}
//                                                 required
//                                                 className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
//                                                 placeholder="Enter your name"
//                                             />
//                                         </div>
//                                     </div>
//                                     <div>
//                                         <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
//                                             Email Address *
//                                         </label>
//                                         <div className="relative">
//                                             <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
//                                             <input
//                                                 type="email"
//                                                 id="email"
//                                                 name="email"
//                                                 value={formData.email}
//                                                 onChange={handleChange}
//                                                 required
//                                                 className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
//                                                 placeholder="your@email.com"
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="grid gap-6 md:grid-cols-2">
//                                     <div>
//                                         <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-gray-700">
//                                             Phone Number *
//                                         </label>
//                                         <div className="relative">
//                                             <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
//                                             <input
//                                                 type="tel"
//                                                 id="phone"
//                                                 name="phone"
//                                                 value={formData.phone}
//                                                 onChange={handleChange}
//                                                 required
//                                                 className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
//                                                 placeholder="+880 1234 567890"
//                                             />
//                                         </div>
//                                     </div>
//                                     <div>
//                                         <label htmlFor="business_name" className="mb-2 block text-sm font-semibold text-gray-700">
//                                             Business Name *
//                                         </label>
//                                         <div className="relative">
//                                             <Building className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
//                                             <input
//                                                 type="text"
//                                                 id="business_name"
//                                                 name="business_name"
//                                                 value={formData.business_name}
//                                                 onChange={handleChange}
//                                                 required
//                                                 className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
//                                                 placeholder="Your Business Name"
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="grid gap-6 md:grid-cols-2">
//                                     <div>
//                                         <label htmlFor="business_location" className="mb-2 block text-sm font-semibold text-gray-700">
//                                             Business Location *
//                                         </label>
//                                         <div className="relative">
//                                             <MapIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
//                                             <input
//                                                 type="text"
//                                                 id="business_location"
//                                                 name="business_location"
//                                                 value={formData.business_location}
//                                                 onChange={handleChange}
//                                                 required
//                                                 className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
//                                                 placeholder="Dhaka, Bangladesh"
//                                             />
//                                         </div>
//                                     </div>
//                                     <div>
//                                         <label htmlFor="store_size" className="mb-2 block text-sm font-semibold text-gray-700">
//                                             Number of Stores *
//                                         </label>
//                                         <select
//                                             id="store_size"
//                                             name="store_size"
//                                             value={formData.store_size}
//                                             onChange={handleChange}
//                                             required
//                                             className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
//                                         >
//                                             <option value="">Select number of stores</option>
//                                             <option value="1">1 Store</option>
//                                             <option value="2">2 Stores</option>
//                                             <option value="5">5 Stores</option>
//                                             <option value="10+">10+ Stores</option>
//                                         </select>
//                                     </div>
//                                 </div>

//                                 <div>
//                                     <label htmlFor="package" className="mb-2 block text-sm font-semibold text-gray-700">
//                                         Interest Package *
//                                     </label>
//                                     <select
//                                         id="package"
//                                         name="package"
//                                         value={formData.package}
//                                         onChange={handleChange}
//                                         required
//                                         className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
//                                     >
//                                         <option value="">Select a package</option>
//                                         <option value="starter">Starter Package - ৳2,500/month</option>
//                                         <option value="professional">Professional Package - ৳5,000/month</option>
//                                         <option value="premium">Premium Package - ৳8,000/month</option>
//                                         <option value="enterprise">Enterprise Package - Custom Pricing</option>
//                                     </select>
//                                 </div>

//                                 <button
//                                     type="submit"
//                                     disabled={isSubmitting}
//                                     className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-4 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg disabled:scale-100 disabled:opacity-50"
//                                 >
//                                     {isSubmitting ? (
//                                         <>
//                                             <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
//                                             Sending...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Send className="mr-2 h-5 w-5" />
//                                             Send Message
//                                         </>
//                                     )}
//                                 </button>

//                                 <p className="text-center text-sm text-gray-500">
//                                     By submitting this form, you agree to our{' '}
//                                     <Link href="/privacy-policy" className="text-blue-600 hover:underline">
//                                         Privacy Policy
//                                     </Link>{' '}
//                                     and{' '}
//                                     <Link href="/terms-of-service" className="text-blue-600 hover:underline">
//                                         Terms of Service
//                                     </Link>
//                                 </p>
//                             </form>
//                         </div>

//                         {/* Contact Info */}
//                         <div className="space-y-8">
//                             <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white">
//                                 <h3 className="mb-6 text-2xl font-bold">Get in Touch</h3>
//                                 <div className="space-y-6">
//                                     <div className="flex items-start">
//                                         <MapPin className="mr-4 mt-1 h-6 w-6 flex-shrink-0" />
//                                         <div>
//                                             <h4 className="font-semibold">Visit Us</h4>
//                                             <p className="text-blue-100">House: 34, Road: 3, Block: B, Aftabnagar, Badda, Dhaka, Bangladesh</p>
//                                         </div>
//                                     </div>
//                                     <div className="flex items-start">
//                                         <Phone className="mr-4 mt-1 h-6 w-6 flex-shrink-0" />
//                                         <div>
//                                             <h4 className="font-semibold">Call Us</h4>
//                                             <p className="text-blue-100">+880 1838680434</p>
//                                         </div>
//                                     </div>
//                                     <div className="flex items-start">
//                                         <Mail className="mr-4 mt-1 h-6 w-6 flex-shrink-0" />
//                                         <div>
//                                             <h4 className="font-semibold">Email Us</h4>
//                                             <p className="text-blue-100">support@andgatetech.net</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="rounded-2xl bg-white p-8 shadow-xl">
//                                 <h3 className="mb-4 text-xl font-bold text-gray-900">What Happens Next?</h3>
//                                 <div className="space-y-4">
//                                     <div className="flex items-start">
//                                         <div className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</div>
//                                         <div>
//                                             <h4 className="font-semibold text-gray-900">We Review Your Request</h4>
//                                             <p className="text-gray-600">Our team reviews your requirements within 2 hours</p>
//                                         </div>
//                                     </div>
//                                     <div className="flex items-start">
//                                         <div className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">2</div>
//                                         <div>
//                                             <h4 className="font-semibold text-gray-900">Schedule a Demo</h4>
//                                             <p className="text-gray-600">We schedule a personalized demo at your convenience</p>
//                                         </div>
//                                     </div>
//                                     <div className="flex items-start">
//                                         <div className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">3</div>
//                                         <div>
//                                             <h4 className="font-semibold text-gray-900">Start Your Trial</h4>
//                                             <p className="text-gray-600">Begin your 30-day free trial with full support</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Success Modal */}
//                     {isSubmitted && (
//                         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
//                             <div className="relative mx-4 w-full max-w-md transform rounded-2xl bg-white p-8 shadow-2xl transition-all">
//                                 {/* Close Button */}
//                                 <button onClick={() => setIsSubmitted(false)} className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600">
//                                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                     </svg>
//                                 </button>

//                                 {/* Success Animation */}
//                                 <div className="mb-6 flex justify-center">
//                                     <div className="animate-pulse rounded-full bg-green-100 p-4">
//                                         <CheckCircle className="h-16 w-16 animate-bounce text-green-600" />
//                                     </div>
//                                 </div>

//                                 {/* Modal Content */}
//                                 <div className="text-center">
//                                     <h2 className="mb-3 text-2xl font-bold text-gray-900">Thank You!</h2>
//                                     <p className="mb-6 text-gray-600">Your request has been submitted successfully. Our team will contact you within 2 hours to discuss your POS solution.</p>

//                                     {/* Action Buttons */}
//                                     <div className="flex flex-col gap-3">
//                                         <Link
//                                             href="/"
//                                             className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
//                                             onClick={() => setIsSubmitted(false)}
//                                         >
//                                             <ArrowLeft className="mr-2 h-4 w-4" />
//                                             Back to Home
//                                         </Link>
//                                         <Link
//                                             href="/login"
//                                             className="inline-flex items-center justify-center rounded-xl border-2 border-blue-600 px-6 py-3 font-semibold text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
//                                             onClick={() => setIsSubmitted(false)}
//                                         >
//                                             Sign In to Dashboard
//                                         </Link>
//                                         <button onClick={() => setIsSubmitted(false)} className="mt-2 text-sm text-gray-500 transition-colors hover:text-gray-700">
//                                             Continue browsing
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </MainLayout>
//     );
// }
'use client';
import MainLayout from '@/components/layout/MainLayout';
import { getTranslation } from '@/i18n';
import { useCreateLeadMutation } from '@/store/features/auth/authApi';
import { ArrowLeft, Building, CheckCircle, Mail, MapIcon, MapPin, Phone, Send, User } from 'lucide-react';
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
                business_name: formData.business_name,
                business_location: formData.business_location,
                store_size: formData.store_size,
                package: formData.package,
            }).unwrap();

            setIsSubmitted(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                business_name: '',
                business_location: '',
                store_size: '',
                package: '',
            });
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-16 text-center">
                        <h1 className="mb-6 text-5xl font-bold text-gray-900">
                            {t('contact.page_title')}
                            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">AndgatePOS</span>
                        </h1>
                        <p className="mx-auto max-w-3xl text-xl text-gray-600">{t('contact.page_subtitle')}</p>
                    </div>

                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Contact Form */}
                        <div className="rounded-2xl bg-white p-8 shadow-xl">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
                                            {t('contact.form.name')}
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
                                                placeholder={t('contact.form.name').replace(' *', '')}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                                            {t('contact.form.email')}
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
                                            {t('contact.form.phone')}
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
                                        <label htmlFor="business_name" className="mb-2 block text-sm font-semibold text-gray-700">
                                            {t('contact.form.business_name')}
                                        </label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                id="business_name"
                                                name="business_name"
                                                value={formData.business_name}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                                                placeholder={t('contact.form.business_name').replace(' *', '')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="business_location" className="mb-2 block text-sm font-semibold text-gray-700">
                                            {t('contact.form.business_location')}
                                        </label>
                                        <div className="relative">
                                            <MapIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                id="business_location"
                                                name="business_location"
                                                value={formData.business_location}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                                                placeholder="Dhaka, Bangladesh"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="store_size" className="mb-2 block text-sm font-semibold text-gray-700">
                                            {t('contact.form.store_size')}
                                        </label>
                                        <select
                                            id="store_size"
                                            name="store_size"
                                            value={formData.store_size}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                                        >
                                            <option value="">{t('contact.form.store_size').replace(' *', '')}</option>
                                            <option value="1">{t('contact.form.store_options.1')}</option>
                                            <option value="2">{t('contact.form.store_options.2')}</option>
                                            <option value="5">{t('contact.form.store_options.5')}</option>
                                            <option value="10+">{t('contact.form.store_options.10+')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="package" className="mb-2 block text-sm font-semibold text-gray-700">
                                        {t('contact.form.package')}
                                    </label>
                                    <select
                                        id="package"
                                        name="package"
                                        value={formData.package}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                                    >
                                        <option value="">{t('contact.form.package').replace(' *', '')}</option>
                                        <option value="starter">{t('contact.form.package_options.starter')}</option>
                                        <option value="professional">{t('contact.form.package_options.professional')}</option>
                                        <option value="premium">{t('contact.form.package_options.premium')}</option>
                                        <option value="enterprise">{t('contact.form.package_options.enterprise')}</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-4 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg disabled:scale-100 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            {t('contact.form.submitting')}
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-5 w-5" />
                                            {t('contact.form.submit_button')}
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-sm text-gray-500">
                                    By submitting this form, you agree to our{' '}
                                    <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                                        {t('contact.form.privacy_policy')}
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/terms-of-service" className="text-blue-600 hover:underline">
                                        {t('contact.form.terms_of_service')}
                                    </Link>
                                </p>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white">
                                <h3 className="mb-6 text-2xl font-bold">{t('contact.contact_info.title')}</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <MapPin className="mr-4 mt-1 h-6 w-6 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold">{t('contact.contact_info.visit.title')}</h4>
                                            <p className="text-blue-100">{t('contact.contact_info.visit.address')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Phone className="mr-4 mt-1 h-6 w-6 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold">{t('contact.contact_info.call.title')}</h4>
                                            <p className="text-blue-100">{t('contact.contact_info.call.phone')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Mail className="mr-4 mt-1 h-6 w-6 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold">{t('contact.contact_info.email.title')}</h4>
                                            <p className="text-blue-100">{t('contact.contact_info.email.email')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white p-8 shadow-xl">
                                <h3 className="mb-4 text-xl font-bold text-gray-900">{t('contact.next_steps.title')}</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                                            {t('contact.next_steps.steps.0.step')}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{t('contact.next_steps.steps.0.title')}</h4>
                                            <p className="text-gray-600">{t('contact.next_steps.steps.0.description')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                                            {t('contact.next_steps.steps.1.step')}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{t('contact.next_steps.steps.1.title')}</h4>
                                            <p className="text-gray-600">{t('contact.next_steps.steps.1.description')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                                            {t('contact.next_steps.steps.2.step')}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{t('contact.next_steps.steps.2.title')}</h4>
                                            <p className="text-gray-600">{t('contact.next_steps.steps.2.description')}</p>
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
                                    <div className="animate-pulse rounded-full bg-green-100 p-4">
                                        <CheckCircle className="h-16 w-16 animate-bounce text-green-600" />
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h2 className="mb-3 text-2xl font-bold text-gray-900">{t('contact.success_modal.title')}</h2>
                                    <p className="mb-6 text-gray-600">{t('contact.success_modal.description')}</p>

                                    <div className="flex flex-col gap-3">
                                        <Link
                                            href="/"
                                            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
                                            onClick={() => setIsSubmitted(false)}
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            {t('contact.success_modal.back_home')}
                                        </Link>
                                        <Link
                                            href="/login"
                                            className="inline-flex items-center justify-center rounded-xl border-2 border-blue-600 px-6 py-3 font-semibold text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
                                            onClick={() => setIsSubmitted(false)}
                                        >
                                            {t('contact.success_modal.sign_in')}
                                        </Link>
                                        <button onClick={() => setIsSubmitted(false)} className="mt-2 text-sm text-gray-500 transition-colors hover:text-gray-700">
                                            {t('contact.success_modal.continue')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
