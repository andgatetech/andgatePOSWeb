'use client';

import Image from 'next/image';
import PromoButton from './promo-button';

const features = [
    { title: 'দ্রুত POS বিলিং', desc: 'মোবাইল বা ল্যাপটপ থেকে পণ্য খুঁজে বিল করুন, ডিসকাউন্ট দিন, রসিদ তৈরি করুন।', image: '/assets/LandingImage/updated/pos.webp' },
    { title: 'স্টক ও লো-স্টক অ্যালার্ট', desc: 'কোন পণ্য কমে যাচ্ছে, কোন পণ্য বেশি বিক্রি হচ্ছে — রিপোর্টে পরিষ্কার দেখুন।', image: '/assets/LandingImage/updated/stock-report.webp' },
    { title: 'লাভ-লস ও বিক্রির রিপোর্ট', desc: 'দিন, মাস বা বছর ধরে বিক্রি, খরচ, লাভ-লস ও ক্যাশ বুক দেখুন।', image: '/assets/LandingImage/updated/profit-loss.webp' },
    { title: 'বাকি ও কাস্টমার হিসাব', desc: 'কোন কাস্টমারের কাছে কত টাকা বাকি আছে, কবে দিয়েছে — সব হিসাব এক জায়গায় রাখুন।', image: '/assets/LandingImage/updated/customer-due.webp' },
];

const quickWins = ['Barcode/SKU', 'bKash/Nagad/Cash', 'Customer due', 'Supplier due', 'Employee access', 'Multi-store', 'Expense tracking', 'Barcode label'];

const shopTypes = ['মুদি দোকান', 'ফার্মেসি', 'ফ্যাশন শপ', 'হার্ডওয়্যার', 'ইলেকট্রনিক্স', 'সুপার শপ', 'কসমেটিকস', 'পাইকারি/ডিলার'];

export default function PromoFeatureProof() {
    return (
        <section className="bg-white py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-10 max-w-3xl text-center">
                    <span className="mb-3 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold text-emerald-700">আপনি আসলে কী পাবেন</span>
                    <h2 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">শুধু বিলিং না — পুরো দোকানের হিসাব এক জায়গায়</h2>
                    <p className="mt-3 text-base leading-relaxed text-gray-600">
                        আজ কত বিক্রি হলো, কত টাকা বাকিতে গেল, কোন পণ্য শেষ হচ্ছে আর মাস শেষে লাভ হলো নাকি লস — সব উত্তর মোবাইলেই পরিষ্কার দেখুন।
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => (
                        <article key={feature.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="relative aspect-[4/3] bg-slate-100">
                                <Image src={feature.image} alt={feature.title} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover object-top" />
                            </div>
                            <div className="p-5">
                                <h3 className="text-base font-extrabold text-gray-900">{feature.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-gray-600">{feature.desc}</p>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-10 grid gap-8 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 sm:p-7 lg:grid-cols-[1.15fr_0.85fr]">
                    <div>
                        <h3 className="text-lg font-extrabold text-gray-900">দোকানের দৈনন্দিন কাজের জন্য দরকারি ফিচার</h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {quickWins.map((item) => (
                                <span key={item} className="rounded-full border border-white bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-extrabold text-gray-900">যেসব ব্যবসার জন্য ভালো ফিট</h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {shopTypes.map((item) => (
                                <span key={item} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center gap-3">
                    <PromoButton href="#register-section" className="px-10 py-4 text-base">
                        ফর্ম পূরণ করে ড্যাশবোর্ড দেখুন →
                    </PromoButton>
                    <p className="text-center text-xs text-gray-400">ফর্ম সাবমিট করলেই অ্যাকাউন্ট তৈরি হবে · তারপর সরাসরি ড্যাশবোর্ডে যেতে পারবেন</p>
                </div>
            </div>
        </section>
    );
}
