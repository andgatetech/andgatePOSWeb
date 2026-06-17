'use client';

import PromoButton from './promo-button';

const pairs = [
    {
        problem: 'রাত ১১টায় খাতা নিয়ে বসেন, তবুও হিসাব মেলে না — মাস শেষে আসলে লাভ হলো নাকি লস, সেটাই পরিষ্কার না।',
        solution: 'এক ক্লিকেই দিন, মাস বা বছরের লাভ-ক্ষতির রিপোর্ট। খাতার ঝামেলা অনেকটাই কমে যায়।',
    },
    {
        problem: 'ভিড়ের সময় হাতে বিল করতে গিয়ে সময় লেগে যায়। কাস্টমার বিরক্ত হয়ে চলে গেছে — এই দৃশ্য আপনার পরিচিত?',
        solution: 'মোবাইলের ক্যামেরা দিয়ে বারকোড স্ক্যান করে দ্রুত বিল করুন। কাউন্টারের চাপ কমে যায়।',
    },
    {
        problem: "দোকান থেকে বের হলেই মনে সন্দেহ — 'সব বিক্রির টাকা ঠিকমতো জমা হচ্ছে তো?' কিন্তু দেখার সহজ উপায় নেই।",
        solution: 'আপনি যেখানেই থাকুন, মোবাইলে দেখুন কে কখন কত টাকার বিক্রি করেছে। প্রতিটি লেনদেনের হিসাব থাকে।',
    },
    {
        problem: 'বিকাশ, নগদ, ক্যাশ — দিনশেষে সব মিলিয়ে হিসাব করতে বসলে মাথা গরম হয়ে যায়। কোথায় যাচ্ছে টাকা, বোঝাই যায় না।',
        solution: 'প্রতিটি পেমেন্ট পদ্ধতির হিসাব আলাদা। দিনশেষে ক্যাশ, bKash/Nagad ও কার্ডের রিপোর্ট পরিষ্কার দেখা যায়।',
    },
    {
        problem: 'কাস্টমার এসে পণ্য চাইলো, কিন্তু স্টকে নেই — বাধ্য হয়ে "নেই" বলতে হলো। তারপর সে পাশের দোকানে চলে গেল।',
        solution: 'স্টক শেষ হওয়ার আগেই অ্যালার্ট পাবেন। সময়মতো অর্ডার দিন, বিক্রি মিস হওয়ার ঝুঁকি কমে যাবে।',
    },
    {
        problem: 'POS মেশিনের দাম শুনলে মাথা ঘুরে যায়। এত টাকা খরচ করার পর না চললে তো বড় ঝুঁকি।',
        solution: 'আলাদা কোনো মেশিন লাগবে না। আপনার পকেটের মোবাইল দিয়েই পুরো দোকান চলবে। সেটআপ ফিও নেই।',
    },
    {
        problem: 'বাকি দিলেন, কিন্তু কবে দিলেন মনে নেই — কাস্টমারের সামনে টাকা চাইতে গিয়ে লজ্জায় পড়তে হয়।',
        solution: 'বাকির পুরো হিসাব সফটওয়্যারে থাকে। দরকার হলে কাস্টমারের মোবাইলে রিমাইন্ডার পাঠাতে পারবেন।',
    },
    {
        problem: 'ফোন হারানো, বন্যা বা আগুন — বছরের পর বছরের হিসাব এক মুহূর্তেই শেষ হয়ে যাওয়ার ভয়টা কি আপনারও আছে?',
        solution: 'সব ডেটা Cloud-এ সুরক্ষিত থাকে। ফোন হারালেও নতুন ফোনে লগইন করলেই হিসাব ফিরে পাবেন।',
    },
];

export default function PromoProblemSolution() {
    return (
        <section id="demo-section" className="bg-gradient-to-b from-gray-50 to-white py-20">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="mb-14 text-center">
                    <span className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-blue-600">আমরা বুঝি</span>
                    <h2 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 md:text-4xl">এই কথাগুলো কি আপনার মনের কথা?</h2>
                    <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600">বাংলাদেশের অনেক দোকানদারের একই ধরনের সমস্যা। এর মধ্যে আপনার দোকানের সমস্যাও থাকলে, সমাধানটা এখানেই।</p>
                </div>

                <div className="space-y-3">
                    {pairs.map((pair, i) => (
                        <div key={i} className="grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-100 shadow-sm sm:grid-cols-2">
                            <div className="flex items-start gap-4 border-b border-red-100 bg-red-50 p-5 sm:border-b-0 sm:border-r">
                                <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-black text-red-500">✖</span>
                                <p className="text-sm font-medium leading-relaxed text-gray-800">{pair.problem}</p>
                            </div>
                            <div className="flex items-start gap-4 bg-emerald-50 p-5">
                                <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-600">✔</span>
                                <p className="text-sm font-medium leading-relaxed text-gray-800">{pair.solution}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col items-center gap-3">
                    <PromoButton href="#register-section" className="px-10 py-4 text-base">
                        হ্যাঁ, আমার দোকানেও এটা দরকার →
                    </PromoButton>
                    <p className="text-xs text-gray-400">ফ্রিতে শুরু করা যায় · কোনো কার্ড লাগবে না · দরকার হলে পরে আপগ্রেড করুন</p>
                </div>
            </div>
        </section>
    );
}
