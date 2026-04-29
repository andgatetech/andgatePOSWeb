export default function PromoLossHook() {
    const losses = [
        { icon: '📒', label: 'হিসাবের ভুলে', amount: '৳৫০০–১,০০০', note: 'প্রতিমাসে' },
        { icon: '📦', label: 'স্টক শেষে হারানো বিক্রি', amount: '৳২,০০০–৫,০০০', note: 'প্রতিমাসে' },
        { icon: '👤', label: 'কর্মচারীর অসততায়', amount: 'অজানা', note: 'ধরাই পড়ে না' },
        { icon: '🤝', label: 'বাকির টাকা ফেরত না পেয়ে', amount: '৳১,০০০+', note: 'প্রতিমাসে' },
    ];

    const before = [
        'রাত ১১টায় খাতা নিয়ে বসেন — তবুও হিসাব মেলে না',
        'স্টক শেষ হলে তখন টের পান, কাস্টমার আগেই চলে গেছে',
        'দোকানের বাইরে থাকলে মনে সন্দেহ — ভেতরে কী হচ্ছে?',
        'মাসে লাভ হলো নাকি লস — আন্দাজে বলতে হয়',
        'বিকাশ, নগদ, ক্যাশ মেলাতে মাথা গরম হয়ে যায়',
    ];

    const after = [
        'সকালে চা খেতে খেতে গতকালের পুরো বিক্রির রিপোর্ট দেখুন',
        'আগেই নোটিফিকেশন — স্টক শেষ হওয়ার আগেই অর্ডার দিন',
        'যেকোনো জায়গা থেকে দোকানের লাইভ হিসাব দেখুন',
        'এক ক্লিকে সঠিক লাভের সংখ্যা — কোনো অনুমান নেই',
        'সব পেমেন্ট আলাদা, দিনশেষে হিসাব ১০০% মিলে যায়',
    ];

    return (
        <section className="bg-white py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

                {/* Loss aversion hook */}
                <div className="mb-14 rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 to-orange-50 p-8 text-center sm:p-10">
                    <p className="mb-2 text-sm font-bold uppercase tracking-widest text-red-500">সতর্কতা</p>
                    <h2 className="mb-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                        প্রতিমাসে আপনি কত টাকা হারাচ্ছেন — জানেন কি?
                    </h2>
                    <p className="mx-auto mb-8 max-w-xl text-base text-gray-600">
                        খাতার হিসাব, স্টকের অব্যবস্থা, আর নজরদারির অভাব — এই তিনটি কারণে বাংলাদেশের বেশিরভাগ দোকান প্রতিমাসে চুপচাপ লোকসান দিচ্ছে।
                    </p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {losses.map((l, i) => (
                            <div key={i} className="rounded-2xl border border-red-100 bg-white px-4 py-5 shadow-sm">
                                <div className="mb-2 text-2xl">{l.icon}</div>
                                <p className="mb-1 text-xs font-semibold text-gray-500">{l.label}</p>
                                <p className="text-xl font-black text-red-600">{l.amount}</p>
                                <p className="mt-0.5 text-xs text-gray-400">{l.note}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-sm font-semibold text-red-600">
                        👆 এগুলো বন্ধ করতেই AndgatePOS তৈরি হয়েছে।
                    </p>
                </div>

                {/* Before / After */}
                <div className="mb-4 text-center">
                    <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                        আগে যা ছিল — এখন যা আছে
                    </h2>
                    <p className="mt-2 text-base text-gray-500">একটি সফটওয়্যার, দুটি ভিন্ন দুনিয়া।</p>
                </div>

                <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-100 shadow-sm sm:grid-cols-2">
                    {/* Before */}
                    <div className="border-b border-gray-100 bg-slate-50 p-6 sm:border-b-0 sm:border-r">
                        <div className="mb-5 flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-sm font-black text-gray-500">✖</span>
                            <h3 className="text-base font-bold text-gray-500">AndgatePOS ছাড়া</h3>
                        </div>
                        <ul className="space-y-3">
                            {before.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                    <span className="mt-0.5 flex-shrink-0 text-red-400">✖</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* After */}
                    <div className="bg-emerald-50 p-6">
                        <div className="mb-5 flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-200 text-sm font-black text-emerald-700">✔</span>
                            <h3 className="text-base font-bold text-emerald-700">AndgatePOS দিয়ে</h3>
                        </div>
                        <ul className="space-y-3">
                            {after.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                                    <span className="mt-0.5 flex-shrink-0 text-emerald-500">✔</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </section>
    );
}
