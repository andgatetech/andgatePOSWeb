'use client';

import { trackEvent } from '@/lib/analytics';
import PromoButton from './promo-button';

const pairs = [
    {
        problem: 'রাত ১১টায় খাতা নিয়ে বসেন, তবুও হিসাব মেলে না — লাভ হলো নাকি লস, বলা মুশকিল।',
        solution: 'সকালে চা খেতে খেতে গতকালের পুরো রিপোর্ট দেখুন। এক ক্লিকেই সঠিক লাভের সংখ্যা।',
    },
    {
        problem: 'স্টকে পণ্য নেই দেখে কাস্টমার পাশের দোকানে চলে গেল।',
        solution: 'স্টক শেষ হওয়ার আগেই অ্যালার্ট পাবেন। সময়মতো অর্ডার দিন, বিক্রি মিস হবে না।',
    },
    {
        problem: 'বিকাশ, নগদ, ক্যাশ — দিনশেষে সব মেলাতে মাথা গরম হয়ে যায়।',
        solution: 'প্রতিটি পেমেন্ট আলাদা হিসাবে জমা হয়। দিনশেষে ১ ক্লিকে সব মিলিয়ে দেখুন।',
    },
    {
        problem: 'POS মেশিনের দাম শুনলে মাথা ঘুরে যায় — এত টাকা খরচ করে না চললে বড় ঝুঁকি।',
        solution: 'আলাদা মেশিন লাগবে না। পকেটের মোবাইল দিয়েই পুরো দোকান চলবে। সেটআপ ফি নেই।',
    },
];

export default function PromoLossHook() {
    return (
        <section className="bg-gradient-to-b from-gray-50 to-white py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                {/* Loss aversion hook */}
                <div className="mb-12 rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 to-orange-50 p-8 text-center sm:p-10">
                    <p className="mb-2 text-sm font-bold uppercase tracking-widest text-red-500">সতর্কতা</p>
                    <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">ছোট ছোট ভুলেই প্রতিমাসে লাভ কমে যাচ্ছে — টের পাচ্ছেন তো?</h2>
                </div>

                <div className="mb-10 text-center">
                    <span className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-blue-600">আমরা বুঝি</span>
                    <h2 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 md:text-4xl">এই কথাগুলো কি আপনার মনের কথা?</h2>
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

                <div className="mt-4 text-center">
                    <p className="text-sm font-semibold text-red-600">এগুলো কমাতেই AndgatePOS তৈরি হয়েছে।</p>
                </div>

                <div className="mt-8 flex flex-col items-center gap-3">
                    <PromoButton
                        href="#register-section"
                        className="px-10 py-4 text-base"
                        onClick={() => trackEvent('loss_hook_cta_click', 'Lead', { section: 'loss_hook' })}
                    >
                        হ্যাঁ, আমার দোকানেও এটা দরকার →
                    </PromoButton>
                    <p className="text-xs text-gray-400">ফ্রিতে শুরু করা যায় · কোনো কার্ড লাগবে না · দরকার হলে পরে আপগ্রেড করুন</p>
                </div>
            </div>
        </section>
    );
}
