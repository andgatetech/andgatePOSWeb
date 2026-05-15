'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { toggleSidebar } from '@/store/themeConfigSlice';

const MobileBottomNav = () => {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const sidebarOpen = useSelector((state: RootState) => state.themeConfig.sidebar);

    const [visible, setVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const onScroll = () => {
            const current = window.scrollY;
            if (current < 10) {
                setVisible(true);
            } else if (current > lastScrollY.current + 4) {
                setVisible(false);
            } else if (current < lastScrollY.current - 4) {
                setVisible(true);
            }
            lastScrollY.current = current;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const isActive = (href: string) =>
        href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

    type Tab = { label: string; href: string | null; isPrimary?: boolean; icon: (active: boolean) => React.ReactNode };
    const tabs: Tab[] = [
        {
            label: 'Home',
            href: '/dashboard',
            icon: (active: boolean) => (
                <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            label: 'Orders',
            href: '/orders',
            icon: (active: boolean) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    {active && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h4" />}
                </svg>
            ),
        },
        {
            label: 'POS',
            href: '/pos',
            isPrimary: true,
            icon: (_active: boolean) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            label: 'Products',
            href: '/products',
            icon: (active: boolean) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    {active && <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v4" />}
                </svg>
            ),
        },
        {
            label: 'Menu',
            href: null,
            icon: (active: boolean) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    {active ? (
                        // X icon when sidebar is open
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        // Hamburger icon
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            ),
        },
    ];

    return (
        <nav className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
            {/* Safe area background extends under home indicator on iOS */}
            <div className="bg-[#034d79] border-t border-white/[0.1] shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
                <div className="flex items-center h-14" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                    {tabs.map((tab) => {
                        const active = tab.href ? isActive(tab.href) : sidebarOpen;

                        if (tab.isPrimary) {
                            return (
                                <Link
                                    key={tab.label}
                                    href={tab.href!}
                                    className="flex flex-1 flex-col items-center justify-center h-full relative"
                                >
                                    <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#046ca9] shadow-lg -mt-5 border-2 border-[#034d79]">
                                        <span className="text-white">{tab.icon(active)}</span>
                                    </div>
                                    <span className="text-[9px] font-semibold text-white/70 mt-0.5 leading-none">{tab.label}</span>
                                </Link>
                            );
                        }

                        if (tab.href === null) {
                            return (
                                <button
                                    key={tab.label}
                                    type="button"
                                    onClick={() => dispatch(toggleSidebar())}
                                    className="flex flex-1 flex-col items-center justify-center h-full gap-0.5 active:bg-white/[0.06] transition-colors"
                                >
                                    <span className={active ? 'text-white' : 'text-white/55'}>
                                        {tab.icon(active)}
                                    </span>
                                    <span className={`text-[9px] font-semibold leading-none ${active ? 'text-white' : 'text-white/55'}`}>
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={tab.label}
                                href={tab.href}
                                className="flex flex-1 flex-col items-center justify-center h-full gap-0.5 active:bg-white/[0.06] transition-colors"
                            >
                                <span className={active ? 'text-white' : 'text-white/55'}>
                                    {tab.icon(active)}
                                </span>
                                <span className={`text-[9px] font-semibold leading-none ${active ? 'text-white' : 'text-white/55'}`}>
                                    {tab.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default MobileBottomNav;
