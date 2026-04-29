'use client';

import PromoButton from './promo-button';

const pairs = [
    {
        problem: 'রাত ১১টায় খাতা নিয়ে বসেন, তবুও হিসাব মিলছে না — মাস শেষে আসলে লাভ হলো নাকি লস, সেটাই জানেন না।',
        solution: 'এক ক্লিকেই দিন, মাস বা বছরের লাভ-ক্ষতির নিখুঁত রিপোর্ট। হিসাবের খাতা চিরতরে বিদায়।',
    },
    {
        problem: 'ভিড়ের সময় হাতে বিল করতে গিয়ে ৫ মিনিট লেগে যায়। কাস্টমার বিরক্ত হয়ে চলে গেছে — এই দৃশ্য আপনার পরিচিত?',
        solution: 'মোবাইলের ক্যামেরা দিয়ে বারকোড স্ক্যান — ৩ সেকেন্ডে বিল প্রিন্ট। কাউন্টারে আর লাইন জমবে না।',
    },
    {
        problem: "দোকান থেকে বের হলেই মনে সন্দেহ — 'কর্মচারী কি সব টাকা জমা দিচ্ছে?' কিন্তু প্রমাণ করার কোনো উপায় নেই।",
        solution: 'আপনি যেখানেই থাকুন, মোবাইলে দেখুন কে কখন কত টাকার বিক্রি করলো। প্রতিটি লেনদেনের লগ থাকে।',
    },
    {
        problem: 'বিকাশ, নগদ, ক্যাশ — দিনশেষে সব মিলিয়ে হিসাব করতে বসলে মাথা গরম হয়ে যায়। কোথায় যাচ্ছে টাকা, বোঝাই যায় না।',
        solution: 'প্রতিটি পেমেন্ট পদ্ধতির হিসাব আলাদা। দিনশেষে ড্রয়ারের সাথে মিলিয়ে দেখুন — ১০০% মিলে যাবে।',
    },
    {
        problem: 'কাস্টমার এসে জিনিস চাইলো, কিন্তু স্টকে নেই — মুখের উপর "নেই" বলতে হলো। সে চলে গেল প্রতিযোগীর দোকানে।',
        solution: 'স্টক শেষ হওয়ার আগেই নোটিফিকেশন পাবেন। সময়মতো অর্ডার দিন — কাস্টমার আর ফিরে যাবে না।',
    },
    {
        problem: 'POS মেশিনের দাম শুনলে মাথা ঘুরে যায়। ৩০-৫০ হাজার টাকা খরচ করার পর না চললে তো সর্বনাশ।',
        solution: 'আলাদা কোনো মেশিন লাগবে না। আপনার পকেটের মোবাইল দিয়েই পুরো দোকান চলবে। সেটআপ ফিও নেই।',
    },
    {
        problem: 'বাকি দিলেন, কিন্তু কবে দিলেন মনে নেই — কাস্টমারের সামনে টাকা চাইতে গিয়ে লজ্জায় পড়তে হয়।',
        solution: 'বাকির পুরো ইতিহাস সফটওয়্যারে। মুহূর্তেই কাস্টমারের মোবাইলে রিমাইন্ডার পাঠান — বিনা ঝগড়ায়।',
    },
    {
        problem: 'ফোন হারানো, বন্যা বা আগুন — বছরের পর বছরের হিসাব এক মুহূর্তেই শেষ হয়ে যাওয়ার ভয়টা কি আপনারও আছে?',
        solution: 'সব ডেটা Cloud-এ সুরক্ষিত। ফোন হারালেও নতুন ফোনে লগইন করলেই সব ফিরে পাবেন।',
    },
];

export default function PromoProblemSolution() {
    return (
        <section id="demo-section" className="bg-gradient-to-b from-gray-50 to-white py-20">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

                <div className="mb-14 text-center">
                    <span className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-blue-600">
                        আমরা বুঝি
                    </span>
                    <h2 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 md:text-4xl">
                        এই কথাগুলো কি আপনার মনের কথা?
                    </h2>
                    <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600">
                        বাংলাদেশের হাজারো দোকানদারের সাথে কথা বলে এই সমস্যাগুলো জানা গেছে। আপনিও যদি এর মধ্যে নিজেকে দেখতে পান — তাহলে সমাধান ঠিক পাশেই আছে।
                    </p>
                </div>

                <div className="space-y-3">
                    {pairs.map((pair, i) => (
                        <div key={i} className="grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-100 shadow-sm sm:grid-cols-2">
                            <div className="flex items-start gap-4 border-b border-red-100 bg-red-50 p-5 sm:border-b-0 sm:border-r">
                                <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-black text-red-500">
                                    ✖
                                </span>
                                <p className="text-sm font-medium leading-relaxed text-gray-800">{pair.problem}</p>
                            </div>
                            <div className="flex items-start gap-4 bg-emerald-50 p-5">
                                <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-600">
                                    ✔
                                </span>
                                <p className="text-sm font-medium leading-relaxed text-gray-800">{pair.solution}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col items-center gap-3">
                    <PromoButton href="#register-section" className="px-10 py-4 text-base">
                        হ্যাঁ, এটাই আমার দরকার — এখনই শুরু করি →
                    </PromoButton>
                    <p className="text-xs text-gray-400">ফ্রিতে শুরু করুন · কোনো ক্রেডিট কার্ড লাগবে না · যখন খুশি বাতিল</p>
                </div>
            </div>
        </section>
    );
}
