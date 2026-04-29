'use client';

import Marquee from 'react-fast-marquee';
import PromoButton from './promo-button';

const testimonials = [
    {
        name: 'মো: রোকন মন্ডল',
        store: 'মন্ডল এন্টারপ্রাইজ, ঢাকা',
        text: 'আগে খাতার হিসাব মেলাতে মেলাতে রাত ১২টা বেজে যেত। এখন শুধু মোবাইল বের করলেই দেখি সারাদিন কত বিক্রি হলো। অনেক বড় একটা টেনশন কমে গেছে।',
        initials: 'রম',
        rating: 5,
    },
    {
        name: 'সাদিয়া ইসলাম',
        store: 'নিউ ফ্যাশন হাউজ, সিলেট',
        text: 'বড় দোকানে স্টক মেলানো সবচেয়ে কঠিন কাজ ছিল। এই POS নেয়ার পর থেকে স্টক আর হিসাব নিয়ে কোনো চিন্তা করতে হয় না। এত সহজ হবে ভাবতেই পারিনি।',
        initials: 'সই',
        rating: 5,
    },
    {
        name: 'আরিফ হোসেন',
        store: 'আরিফ মেটালিক্স ও হার্ডওয়্যার, কুমিল্লা',
        text: 'দোকানে কম্পিউটার বসানোর জায়গা বা টাকা কোনোটাই ছিল না। এখন নিজের স্মার্টফোন দিয়েই সব হিসাব রাখি। পানির মতো সহজ।',
        initials: 'আহ',
        rating: 5,
    },
    {
        name: 'আব্দুল করিম',
        store: 'ভাই ভাই সুপার শপ, খুলনা',
        text: 'আমার দুইটা দোকান। এক জায়গায় থেকে দুই দোকানের হিসাব দেখতে পাই। কর্মচারীরা কত টাকা জমা দিলো — হিসাব একদম নিখুঁত।',
        initials: 'আক',
        rating: 5,
    },
    {
        name: 'নাজমা বেগম',
        store: 'নাজমা ফার্মেসি, চট্টগ্রাম',
        text: 'ফার্মেসিতে এত পণ্যের মেয়াদ আর স্টক মনে রাখা কঠিন ছিল। এখন সফটওয়্যার নিজেই মনে করিয়ে দেয় কোন ওষুধ শেষ হয়ে আসছে।',
        initials: 'নব',
        rating: 5,
    },
    {
        name: 'তানভীর আহমেদ',
        store: 'টেক গ্যাজেট শপ, রাজশাহী',
        text: 'মোবাইলের IMEI ট্র্যাক করা আর সিরিয়াল নম্বর রাখা এখন একদম সহজ। আগে খাতায় লিখতাম, এখন সব ডিজিটাল।',
        initials: 'তআ',
        rating: 5,
    },
];

export default function PromoTestimonials() {
    return (
        <section className="overflow-hidden bg-white py-20">
            <div className="mx-auto mb-12 max-w-3xl px-4 text-center">
                <span className="mb-3 inline-block rounded-full bg-yellow-100 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-yellow-700">
                    ১০০+ ব্যবসার মতামত
                </span>
                <h2 className="mb-3 text-3xl font-extrabold text-gray-900 md:text-4xl">
                    তারাই বলছেন, শুনুন
                </h2>
                <p className="text-base text-gray-600">
                    সারা বাংলাদেশের ব্যবসায়ীরা প্রতিদিন এই সফটওয়্যার দিয়ে দোকান চালাচ্ছেন নিশ্চিন্তে।
                </p>
            </div>

            <div className="py-4">
                <Marquee pauseOnHover speed={38} gradient={false}>
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="mx-4 flex w-[320px] flex-shrink-0 flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl md:w-[380px]"
                        >
                            {/* Stars */}
                            <div className="mb-3 flex gap-0.5">
                                {[...Array(t.rating)].map((_, j) => (
                                    <svg key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>

                            <p className="mb-5 flex-1 text-sm italic leading-relaxed text-gray-700">&quot;{t.text}&quot;</p>

                            <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-700 text-sm font-bold text-white">
                                    {t.initials}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                                    <p className="text-xs font-medium text-primary">{t.store}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </Marquee>
            </div>

            <div className="mt-10 flex justify-center">
                <PromoButton href="#register-section" className="px-10 py-4 text-base">
                    আমিও শুরু করতে চাই →
                </PromoButton>
            </div>
        </section>
    );
}
