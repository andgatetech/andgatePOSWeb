'use client';

import Marquee from 'react-fast-marquee';
import PromoButton from './promo-button';

const testimonials = [
    {
        name: 'জনাব মো: রোকন মন্ডল',
        store: 'মন্ডল এন্টারপ্রাইজ, ঢাকা',
        text: 'আগে খাতার হিসাব মেলাতে মেলাতে রাত ১২টা বেজে যেত। এখন শুধু মোবাইল বের করলেই দেখতে পাই সারাদিন কত বেচাকেনা হলো। আমার অনেক বড় একটা টেনশন কমে গেছে।',
    },
    {
        name: 'সাদিয়া ইসলাম',
        store: 'নিউ ফ্যাশন হাউজ, সিলেট',
        text: 'বড় দোকানে স্টক মেলানো সবচেয়ে কঠিন কাজ ছিল। এই POS নেয়ার পর থেকে স্টক আর হিসাব নিয়ে আমাকে কোনো চিন্তাই করতে হয় না। এত সহজ হবে আমি ভাবতেই পারিনি।',
    },
    {
        name: 'আরিফ হোসেন',
        store: 'আরিফ মেটালিক্স ও হার্ডওয়্যার, কুমিল্লা',
        text: 'দোকানে কম্পিউটার বসানোর জায়গা বা টাকা কোনোটাই ছিল না। এখন আমার নিজের স্মার্টফোন দিয়েই সব হিসাব রাখি, বারকোড স্ক্যান করি। সবকিছু পানির মতো সহজ মনে হয়।',
    },
    {
        name: 'আব্দুল করিম',
        store: 'ভাই ভাই সুপার শপ, খুলনা',
        text: 'আমার দুইটা দোকান, আমি এক জায়গায় থেকে অন্য দোকানের হিসাব দেখতে পারি। কর্মচারীরা কত টাকা জমা দিলো, হিসাব একদম নিখুঁত।',
    },
];

export default function PromoTestimonials() {
    return (
        <section className="overflow-hidden bg-white py-20">
            <div className="container mx-auto mb-12 max-w-6xl px-4">
                <div className="text-center">
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-5xl">
                        যাঁরা আমাদের উপর <span className="text-blue-600">আস্থা রেখেছেন</span>
                    </h2>
                    <p className="text-xl text-gray-600">সারা দেশের হাজারো ব্যবসায়ী প্রতিদিন এই সফটওয়্যারটি ব্যবহার করে তাদের ব্যবসার হিসাব রাখছেন নিশ্চিন্তে।</p>
                </div>
            </div>

            {/* Marquee Container */}
            <div className="py-8">
                <Marquee pauseOnHover={true} speed={40} gradient={false} className="py-4">
                    {testimonials.map((testimonial, idx) => (
                        <div
                            key={idx}
                            className="mx-4 flex h-full min-h-[260px] w-[320px] flex-shrink-0 flex-col justify-between whitespace-normal rounded-2xl border border-gray-100 bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:w-[400px]"
                        >
                            <div>
                                <div className="mb-4 flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg key={star} className="h-5 w-5 fill-current text-yellow-400" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="mb-6 italic leading-relaxed text-gray-700">&quot;{testimonial.text}&quot;</p>
                            </div>
                            <div className="mt-auto border-t border-gray-100 pt-4">
                                <h4 className="text-lg font-bold text-gray-900">{testimonial.name}</h4>
                                <p className="mt-1 text-sm font-medium text-blue-600">{testimonial.store}</p>
                            </div>
                        </div>
                    ))}
                </Marquee>
            </div>

            <div className="mt-12 flex justify-center pb-8">
                <PromoButton href="#register-section" />
            </div>
        </section>
    );
}
