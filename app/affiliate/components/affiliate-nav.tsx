'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAffiliateToken } from '@/store/features/affiliate/affiliatePortalApi';

const ADMIN_WHATSAPP = 'https://wa.me/8801577303608';

const LINKS = [
    {
        href: '/affiliate',
        label: 'Affiliate হোম',
        labelEn: 'Home',
        icon: '🏠',
        desc: 'রেজিস্ট্রেশন, টায়ার তথ্য ও FAQ',
        public: true,
    },
    {
        href: '/affiliate/calculator',
        label: 'কমিশন ক্যালকুলেটর',
        labelEn: 'Calculator',
        icon: '🧮',
        desc: 'রিয়েল প্ল্যান দিয়ে আয় হিসাব করুন',
        public: true,
    },
    {
        href: '/affiliate/leaderboard',
        label: 'লিডারবোর্ড',
        labelEn: 'Leaderboard',
        icon: '🏆',
        desc: 'সেরা Affiliate-দের তালিকা',
        public: true,
    },
    {
        href: '/affiliate/assets',
        label: 'মার্কেটিং অ্যাসেট',
        labelEn: 'Assets',
        icon: '📦',
        desc: 'ব্রোশার, সোশ্যাল ছবি ও পিচ স্ক্রিপ্ট',
        public: true,
    },
    {
        href: '/affiliate/portal',
        label: 'আমার ড্যাশবোর্ড',
        labelEn: 'My Dashboard',
        icon: '📊',
        desc: 'ব্যালেন্স, কমিশন ও পেআউট (লগইন লাগবে)',
        public: false,
    },
    {
        href: '/affiliate/admin',
        label: 'অ্যাডমিন প্যানেল',
        labelEn: 'Admin',
        icon: '⚙️',
        desc: 'সদস্য অনুমোদন ও পেআউট ম্যানেজ (অ্যাডমিন)',
        public: false,
    },
];

export default function AffiliateNav() {
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!getAffiliateToken());
    }, [pathname]);

    return (
        <nav className="w-full bg-white border-b border-slate-200 shadow-sm">
            <div className="mx-auto max-w-5xl px-4">
                {/* Top brand row */}
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <Link href="/affiliate" className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">andgatePOS</span>
                        <span className="rounded-full bg-[#e79237]/15 px-2 py-0.5 text-xs font-semibold text-[#c47920]">
                            Affiliate
                        </span>
                    </Link>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end text-xs text-slate-500">
                        <a
                            href={`${ADMIN_WHATSAPP}?text=${encodeURIComponent('আমি andgatePOS Affiliate পার্টনার। আমার একটু সাহায্য দরকার।')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="WhatsApp-এ সাহায্য নিন"
                            className="flex items-center gap-1 rounded-lg border border-[#25d366]/40 bg-[#25d366]/10 px-2.5 py-1.5 font-semibold text-[#128c4e] hover:bg-[#25d366]/20 transition"
                        >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            <span className="hidden xs:inline sm:inline">সাহায্য</span>
                        </a>
                        <Link
                            href={isLoggedIn ? '/affiliate/portal' : '/affiliate/login'}
                            className="rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5 font-semibold text-primary hover:bg-primary/10 transition whitespace-nowrap"
                        >
                            {isLoggedIn ? 'ড্যাশবোর্ড' : 'লগইন'}
                        </Link>
                        <Link href="/" className="hidden sm:block rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-600 hover:bg-slate-50 transition whitespace-nowrap">
                            মূল সাইট
                        </Link>
                    </div>
                </div>

                {/* Link tabs */}
                <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
                    {LINKS.map(({ href, label, icon, desc, public: isPublic }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                title={desc}
                                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition whitespace-nowrap ${
                                    isActive
                                        ? 'bg-primary text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <span>{icon}</span>
                                <span>{label}</span>
                                {!isPublic && (
                                    <span className={`rounded text-[10px] px-1 py-0.5 font-semibold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        🔒
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
