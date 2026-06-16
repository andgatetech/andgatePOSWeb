export default function PromoStats() {
    const stats = [
        { value: 'মোবাইল', label: 'দিয়েই বিলিং', emoji: '📱' },
        { value: 'Cloud', label: 'ডেটা নিরাপদ', emoji: '☁️' },
        { value: '১৪ দিন', label: 'মানি-ব্যাক গ্যারান্টি', emoji: '🛡️' },
        { value: 'বাংলা', label: 'সাপোর্ট ও ট্রেনিং', emoji: '💬' },
    ];

    return (
        <section className="border-y border-gray-100 bg-gray-50 py-6">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {stats.map((s, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 text-center">
                            <span className="text-2xl">{s.emoji}</span>
                            <p className="text-2xl font-black text-primary">{s.value}</p>
                            <p className="text-xs font-medium text-gray-500">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
