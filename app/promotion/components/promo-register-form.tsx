'use client';

import ComponentsAuthRegisterForm from '@/app/register/components-auth-register-form';
import { CheckCircle2, ShieldCheck, Star } from 'lucide-react';

const benefits = [
    { text: 'ফ্রি প্ল্যানে শুরু করুন — কোনো ক্রেডিট কার্ড লাগবে না' },
    { text: 'মিনিটের মধ্যে সেটআপ শেষ, কোনো প্রযুক্তিগত জ্ঞান লাগবে না' },
    { text: 'মোবাইল দিয়েই পুরো দোকান চালানো যাবে' },
    { text: '১৪ দিন পছন্দ না হলে পুরো টাকা ফেরত' },
    { text: '২৪/৭ বাংলায় সহায়তা সবসময় পাশে আছে' },
];

export default function PromoRegisterForm() {
    return (
        <section id="register-section" className="scroll-mt-16 bg-gradient-to-br from-primary/5 via-white to-blue-50/40 py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:items-center">

                    {/* Left — sales pitch */}
                    <div className="flex flex-col justify-center text-center lg:text-left">
                        {/* Urgency badge */}
                        <div className="mx-auto mb-5 inline-flex w-max items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 lg:mx-0">
                            <span className="flex h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                            <span className="text-sm font-bold text-orange-600">🔥 এখন সেটআপ ফি সম্পূর্ণ মাফ!</span>
                        </div>

                        <h2 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                            আজই শুরু করুন —
                            <br />
                            <span className="text-primary">আপনার দোকান অপেক্ষা করছে</span>
                        </h2>

                        <p className="mb-8 text-base leading-relaxed text-gray-600">
                            নিচে তথ্য দিন এবং মিনিটের মধ্যে আপনার ফ্রি অ্যাকাউন্ট চালু হয়ে যাবে। কোনো ঝামেলা নেই।
                        </p>

                        <ul className="mx-auto space-y-3 lg:mx-0">
                            {benefits.map((b, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                                    <span className="text-sm font-medium text-gray-700">{b.text}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Mini testimonial */}
                        <div className="mt-10 flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-700 text-sm font-bold text-white">
                                রম
                            </div>
                            <div>
                                <div className="mb-1 flex gap-0.5">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}
                                </div>
                                <p className="text-sm italic text-gray-600">&quot;শুরু করার পর থেকে প্রতিদিনের হিসাব নিয়ে আর কোনো চিন্তা নেই।&quot;</p>
                                <p className="mt-1 text-xs font-bold text-gray-800">রোকন মন্ডল <span className="font-normal text-gray-400">· মন্ডল এন্টারপ্রাইজ, ঢাকা</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Right — form */}
                    <div className="relative mx-auto w-full max-w-md">
                        <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-r from-primary to-blue-400 opacity-25 blur-2xl" />
                        <div className="relative rounded-2xl border border-gray-100 bg-white p-7 shadow-2xl">
                            <div className="mb-6 text-center">
                                <h3 className="mb-1 text-xl font-extrabold text-gray-900">ফ্রি অ্যাকাউন্ট খুলুন</h3>
                                <p className="text-sm text-gray-500">নিচের তথ্যগুলো দিয়ে এখনই শুরু করুন</p>
                            </div>

                            <ComponentsAuthRegisterForm />

                            {/* Trust strip */}
                            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                                SSL সুরক্ষিত · ব্যাংক-মানের নিরাপত্তা · তথ্য গোপনীয়
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
