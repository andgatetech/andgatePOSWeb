'use client';

import PromoButton from './promo-button';

const painPoints = [
    {
        problem: 'খাতায় হিসাব লিখতে লিখতে দিন শেষ, তবুও মাস শেষে লাভ-ক্ষতির হিসাব মেলে না।',
        solution: 'হিসাবের খাতা চিরতরে বিদায়! এক ক্লিকেই সারা দিন, মাস বা বছরের লাভ-ক্ষতির একদম নিখুঁত রিপোর্ট পেয়ে যাবেন।',
    },
    {
        problem: 'কাস্টমার ভিড় করলে হাতে বিল করতে দেরি হয়, কাস্টমার বিরক্ত হয়ে চলে যায়।',
        solution: 'আলাদা স্ক্যানার লাগবে না, মোবাইলের ক্যামেরা দিয়েই বারকোড স্ক্যান করে মূহুর্তেই নিখুঁত বিল প্রিন্ট হবে (ব্লুটুথ প্রিন্টারেও)।',
    },
    {
        problem: "কাস্টমার দামাদামি করলে বা অনেক মাল থাকলে মালের 'কেনা দাম' ভুলে যান, ফলে লসে বিক্রি করার ঝুঁকি থাকে।",
        solution: "বিক্রির সময় মোবাইলে 'কেনা দাম' দেখে নিতে পারবেন, ফলে কাস্টমারের সাথে দামাদামি করে বিক্রি করলেও আপনার কখনো লস হবে না।",
    },
    {
        problem: 'সারাদিনের ক্যাশ টাকা এবং বিকাশ/নগদের টাকা দিনশেষে কিছুতেই ড্রয়ারের হিসেবের সাথে মেলে না।',
        solution: 'ক্যাশ, বিকাশ বা নগদের টাকা আলাদা এবং নিখুঁতভাবে হিসাব রাখা যায়, দিনশেষে ড্রয়ারের টাকার সাথে হিসাব মিলে যাবে ১০০%।',
    },
    {
        problem: 'দোকানে না থাকলে কর্মচারীরা সারাদিনে কত টাকার বিক্রি করলো, বা চুরি করলো কি না, তা জানার উপায় থাকে না।',
        solution: 'আপনি ঘরে বা দূরে যেখানেই থাকুন, মোবাইল দিয়েই দোকানের বেচাকেনা ও কর্মচারীদের সব কাজের লাইভ হিসাব দেখতে পাবেন।',
    },
    {
        problem: 'স্টকে কত মাল আছে, আর কি কি নতুন মাল কিনে আনতে হবে তার সঠিক হিসেব খাতা দেখে পাওয়া কঠিন।',
        solution: 'খুব সহজেই কয়েক ক্লিকে নতুন মাল যোগ করা যায়, সফটওয়্যার নিজেই জানিয়ে দিবে কোন মাল স্টকে কত পিস আছে।',
    },
    {
        problem: 'কাস্টমার রিটার্ন বা এক্সচেঞ্জ করতে আসলে মনে থাকে না সে কবে, কত দিয়ে মাল কিনেছিল, ফলে ঝগড়া হয়।',
        solution: 'রিটার্ন নিয়ে কোনো তর্ক নয়! ডিজিটাল বিলে থাকা বারকোড স্ক্যান করলেই মূহুর্তেই মালের আসল দাম ও তারিখ বের হয়ে যাবে।',
    },
    {
        problem: "দোকানে মালের শর্টেজ বা 'স্টক আউট' হয়ে যায় অথচ কাস্টমার আসার আগে আপনি টেরই পান না।",
        solution: "কোনো মাল শেষ হওয়ার আগেই সফটওয়্যার আপনাকে নোটিফিকেশন দেবে 'এই মালটি এখনই অর্ডার করুন', কাস্টমার ফিরে যাবে না।",
    },
    {
        problem: 'ট্যাক্স ফাইল বা অডিটের সময় উকিলকে বাৎসরিক হিসাব দিতে গিয়ে রাতের ঘুম হারাম হয়ে যায়।',
        solution: 'অডিটের সময় আর টেনশন নেই! মাত্র এক ক্লিকেই পুরো বছরের বেচাকেনা, খরচ আর লাভের নিখুঁত রিপোর্ট তৈরি।',
    },
    {
        problem: 'কম্পিউটার বা পস (POS) মেশিন কেনার বিশাল খরচ এবং এগুলো চালানোর ঝামেলা বা ভয়।',
        solution: 'দামি কম্পিউটার বা মেশিন লাগবে না, আপনার পকেটের মোবাইল ফোন দিয়েই পুরো দোকান চলবে খুব সহজে!',
    },
    {
        problem: 'বাকির খাতা হারিয়ে গেলে বা ভুলে গেলে, কাস্টমারের কাছে পাওনা টাকা চাওয়ার কোনো প্রমাণ থাকে না।',
        solution: 'লুকানো আর যাবে না! বাকি বা বাকির কাস্টমারদের হিসাব নিখুঁত থাকবে, মুহূর্তেই তাদের মোবাইলে বাকি টাকার এসএমএস চলে যাবে।',
    },
    {
        problem: 'খাতা বা কম্পিউটার নষ্ট হয়ে গেলে সারা জীবনের সব হিসাব গায়েব হয়ে যাওয়ার ভয়।',
        solution: 'সব হিসাব অটোমেটিক অনলাইনে (Cloud) সেভ থাকে। তাই আপনার মোবাইল হারিয়ে গেলেও আজীবনের ব্যবসার হিসাব ১০০% নিরাপদ থাকবে。',
    },
];

export default function PromoProblemSolution() {
    return (
        <section className="bg-gradient-to-b from-gray-50 to-white py-24">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="mb-20 text-center">
                    <span className="mb-4 block inline-block rounded-full bg-blue-100/50 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-blue-600">কেন ব্যবহার করবেন?</span>
                    <h2 className="mb-6 text-3xl font-extrabold leading-tight text-gray-900 md:text-5xl">
                        আমরা শুধু সফটওয়্যার দিচ্ছি না,
                        <br /> <span className="text-blue-600">আপনার প্রতিদিনের কষ্টের সমাধান দিচ্ছি</span>
                    </h2>
                    <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
                        একজন ব্যবসায়ী হিসেবে প্রতি মুহূর্তে আপনি যে টেনশনগুলো করেন, সেই টেনশনকে জিরো করতে আমরা তৈরি করেছি এই স্মার্ট ও সহজ সল্যুশন।
                    </p>
                </div>

                <div className="grid items-start gap-12 md:grid-cols-2">
                    {/* Problems */}
                    <div className="relative overflow-hidden rounded-3xl border border-red-100 bg-red-50 p-8 shadow-sm md:p-10">
                        <div className="absolute right-0 top-0 p-4 opacity-5">
                            <svg className="h-32 w-32 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h3 className="mb-8 flex items-center gap-3 text-3xl font-bold text-red-700">
                            <span>আপনার বর্তমান কষ্টসমূহ</span>
                        </h3>
                        <ul className="space-y-5 text-lg font-medium text-gray-800">
                            {painPoints.map((item, index) => (
                                <li
                                    key={`problem-${index}`}
                                    className="flex items-start gap-4 rounded-xl border-2 border-dashed border-red-200 bg-white/50 p-4 backdrop-blur-sm transition-all hover:border-red-300 hover:bg-white"
                                >
                                    <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-500">✖</span>
                                    <span>{item.problem}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Solutions */}
                    <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50 p-8 shadow-sm md:p-10">
                        <div className="absolute right-0 top-0 p-4 opacity-5">
                            <svg className="h-32 w-32 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="mb-8 flex items-center gap-3 text-3xl font-bold text-emerald-700">
                            <span>আমাদের সমাধান (POS)</span>
                        </h3>
                        <ul className="space-y-5 text-lg font-medium text-gray-800">
                            {painPoints.map((item, index) => (
                                <li
                                    key={`solution-${index}`}
                                    className="flex items-start gap-4 rounded-xl border-2 border-dashed border-emerald-200 bg-white/50 p-4 backdrop-blur-sm transition-all hover:border-emerald-300 hover:bg-white"
                                >
                                    <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600">✔</span>
                                    <span>{item.solution}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-16 flex justify-center">
                    <PromoButton href="#register-section" />
                </div>
            </div>
        </section>
    );
}
