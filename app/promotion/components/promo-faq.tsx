'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
    {
        q: 'শুরু করতে কত টাকা লাগবে?',
        a: 'ফ্রি প্ল্যানে শুরু করতে পারবেন। পণ্য যোগ করা, POS দিয়ে বিক্রি করা এবং বেসিক হিসাব দেখা যায়। ব্যবসা বড় হলে পরে আপগ্রেড করতে পারবেন।',
    },
    {
        q: 'কম্পিউটার বা বিশেষ যন্ত্রপাতি লাগবে কি?',
        a: 'না। Android বা iPhone মোবাইল, ট্যাবলেট বা ল্যাপটপ থেকেই ব্যবহার করা যাবে। ব্লুটুথ প্রিন্টার থাকলে রসিদ প্রিন্ট করতে পারবেন, তবে শুরু করার জন্য বাধ্যতামূলক নয়।',
    },
    {
        q: 'ইন্টারনেট না থাকলে কি ব্যবহার করা যাবে?',
        a: 'AndgatePOS ক্লাউড সফটওয়্যার, তাই ভালো ইন্টারনেট থাকলে সবচেয়ে ভালো কাজ করে। কিছু ডিভাইসে আগে লোড হওয়া স্ক্রিন দেখা যেতে পারে, কিন্তু নিয়মিত বিলিং ও ডেটা সেভের জন্য ইন্টারনেট রাখা ভালো।',
    },
    {
        q: 'আমার পণ্যের ডেটা কি নিরাপদ?',
        a: 'হ্যাঁ, ডেটা SSL এনক্রিপশনসহ নিরাপদভাবে রাখা হয়। কোনো কারণে মোবাইল হারিয়ে গেলেও নতুন ডিভাইসে লগইন করলে হিসাব ফিরে পাবেন।',
    },
    {
        q: 'একাধিক দোকানের হিসাব কি রাখা যাবে?',
        a: 'হ্যাঁ। SME ও Professional প্ল্যানে একাধিক শাখা পরিচালনা করা যায়। প্রতিটি শাখার স্টক, বিক্রয় ও কর্মচারীর তথ্য আলাদাভাবে দেখা যায়।',
    },
    {
        q: 'পছন্দ না হলে কি টাকা ফেরত পাব?',
        a: 'অবশ্যই। সব পেইড প্ল্যানে ১৪ দিনের মানি-ব্যাক গ্যারান্টি আছে। কোনো প্রশ্ন ছাড়াই পুরো টাকা ফেরত দেওয়া হবে।',
    },
];

export default function PromoFAQ() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <section className="bg-gray-50 py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <span className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-blue-600">সাধারণ প্রশ্ন</span>
                    <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">মনে প্রশ্ন আছে?</h2>
                    <p className="mt-3 text-base text-gray-600">সবচেয়ে বেশি জিজ্ঞেস করা প্রশ্নের উত্তর এখানে আছে।</p>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <button className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left" onClick={() => setOpen(open === i ? null : i)}>
                                <span className="text-base font-semibold text-gray-900">{faq.q}</span>
                                <ChevronDown className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
                            </button>
                            {open === i && (
                                <div className="border-t border-gray-100 px-6 py-4">
                                    <p className="text-sm leading-relaxed text-gray-600">{faq.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
