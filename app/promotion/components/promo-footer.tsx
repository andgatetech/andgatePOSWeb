import Link from 'next/link';
import Image from 'next/image';

const AndGate = '/images/andgatePOS.jpeg';

const LINKS = {
    product: [
        { label: 'ফিচারসমূহ', href: '#register-section' },
        { label: 'মূল্য তালিকা', href: '#pricing' },
        { label: 'FAQ', href: '#faq' },
        { label: 'ডেমো বুক করুন', href: 'https://wa.me/8801577303608' },
    ],
    affiliate: [
        { label: 'Affiliate হোম', href: '/affiliate' },
        { label: 'কমিশন ক্যালকুলেটর', href: '/affiliate/calculator' },
        { label: 'লিডারবোর্ড', href: '/affiliate/leaderboard' },
        { label: 'আমার ড্যাশবোর্ড', href: '/affiliate/portal' },
    ],
    account: [
        { label: 'লগইন', href: '/login' },
        { label: 'রেজিস্ট্রেশন', href: '#register-section' },
        { label: 'সাবস্ক্রিপশন', href: '/subscription' },
    ],
    contact: [
        { label: '+880 1577-303608', href: 'https://wa.me/8801577303608' },
        { label: 'support@andgatetech.net', href: 'mailto:support@andgatetech.net' },
        { label: 'Facebook', href: 'https://facebook.com/andgatetech' },
    ],
};

export default function PromoFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-[#022d45] text-white">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Image src={AndGate} alt="AndgatePOS" width={140} height={46} className="mb-4 rounded brightness-[2] invert" />
                        <p className="text-sm leading-relaxed text-slate-300 max-w-xs">
                            বাংলাদেশের দোকানদারদের জন্য সবচেয়ে সহজ POS সফটওয়্যার। ইনভেন্টরি, বিলিং, পার্চেজ অর্ডার, ২০+ রিপোর্ট — একটি অ্যাপে।
                        </p>
                        <div className="mt-5 flex gap-3">
                            <a href="https://facebook.com/andgatetech" target="_blank" rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm hover:bg-white/20 transition">
                                f
                            </a>
                            <a href="https://wa.me/8801577303608" target="_blank" rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm hover:bg-white/20 transition">
                                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.852L0 24l6.336-1.496A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.847 0-3.575-.49-5.075-1.348L2.5 21.5l.876-4.278A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">প্রোডাক্ট</h4>
                        <ul className="space-y-2.5">
                            {LINKS.product.map(({ label, href }) => (
                                <li key={label}>
                                    <Link href={href} className="text-sm text-slate-300 hover:text-white transition">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Affiliate — highlighted */}
                    <div>
                        <h4 className="mb-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#e79237]">
                            <span>💰</span> Affiliate
                        </h4>
                        <ul className="space-y-2.5">
                            {LINKS.affiliate.map(({ label, href }) => (
                                <li key={label}>
                                    <Link href={href} className="text-sm text-slate-300 hover:text-[#e79237] transition">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4">
                            <Link
                                href="/affiliate"
                                className="inline-block rounded-lg bg-[#e79237]/20 border border-[#e79237]/40 px-3 py-1.5 text-xs font-semibold text-[#e79237] hover:bg-[#e79237]/30 transition"
                            >
                                Affiliate হন →
                            </Link>
                        </div>
                    </div>

                    {/* Account & Contact */}
                    <div className="space-y-8">
                        <div>
                            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">অ্যাকাউন্ট</h4>
                            <ul className="space-y-2.5">
                                {LINKS.account.map(({ label, href }) => (
                                    <li key={label}>
                                        <Link href={href} className="text-sm text-slate-300 hover:text-white transition">
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">যোগাযোগ</h4>
                            <ul className="space-y-2.5">
                                {LINKS.contact.map(({ label, href }) => (
                                    <li key={label}>
                                        <a href={href} target="_blank" rel="noopener noreferrer"
                                            className="text-sm text-slate-300 hover:text-white transition">
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
                    <p className="text-xs text-slate-500">
                        © {year} Andgate Technologies. সর্বস্বত্ব সংরক্ষিত।
                    </p>
                    <div className="flex gap-4 text-xs text-slate-500">
                        <Link href="/privacy" className="hover:text-slate-300 transition">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-slate-300 transition">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
