'use client';

import ComponentsAuthRegisterForm from '@/app/register/components-auth-register-form';
import { CheckCircle2 } from 'lucide-react';

export default function PromoRegisterForm() {
    return (
        <section className="w-full bg-gradient-to-br from-primary/5 via-white to-primary/10 py-16 dark:from-[#0e1726] dark:via-[#0e1726] dark:to-primary/10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
                    {/* Left Column: Promotion Setup / Sales Pitch */}
                    <div className="flex flex-col justify-center text-center lg:text-left">
                        <div className="mx-auto mb-6 inline-block w-max rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary lg:mx-0">বিশেষ অফার চলছে!</div>
                        <h2 className="mb-6 text-4xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-5xl">
                            আপনার ব্যবসাকে দিন <br className="hidden lg:block" />
                            <span className="text-primary">নতুন গতি</span>
                        </h2>
                        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400 lg:mx-0">
                            AndgatePOS এর সাথে আপনার ব্যবসার ইনভেন্টরি, হিসাব-নিকাশ এবং বেচাকেনা ম্যানেজ করুন সহজে। আজই যুক্ত হোন এবং আপনার ব্যবসাকে নিয়ে যান অনন্য উচ্চতায়।
                        </p>

                        <ul className="mx-auto flex w-full max-w-md flex-col space-y-5 text-left lg:mx-0">
                            <li className="flex items-center gap-4">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </span>
                                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">সহজ ও দ্রুত সেটআপ</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </span>
                                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">স্মার্ট ইনভেন্টরি ও স্টক ম্যানেজমেন্ট</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </span>
                                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">ল্যাপটপ বা মোবাইল থেকে এক্সেস</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </span>
                                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">২৪/৭ সার্বক্ষণিক কাস্টমার সাপোর্ট</span>
                            </li>
                        </ul>
                    </div>

                    {/* Right Column: Registration Form Card */}
                    <div id="register-section" className="relative mx-auto w-full max-w-lg scroll-mt-24">
                        {/* Beautiful background shadow glow */}
                        <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-primary to-blue-400 opacity-30 blur-2xl"></div>

                        <div className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-2xl dark:border-gray-800 dark:bg-[#1a2941]">
                            <div className="mb-8 text-center">
                                <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">একাউন্ট তৈরি করুন</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">নিচের তথ্যগুলো দিয়ে আপনার ব্যবসার একাউন্ট খুলুন</p>
                            </div>

                            {/* Render the exact component with no extra markup needed! */}
                            <ComponentsAuthRegisterForm />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
