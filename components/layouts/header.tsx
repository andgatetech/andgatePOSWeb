'use client';
import NotificationDropdown from '@/app/(application)/(protected)/notifications/components/NotificationDropdown';
import CalculatorButton from '@/components/custom/CalculatorButton';
import Dropdown from '@/components/dropdown';
import LanguageDropdown from '@/components/language-dropdown';
import IconLogout from '@/components/icon/icon-logout';
import IconUser from '@/components/icon/icon-user';
import { MessagesSquare, ClipboardList } from 'lucide-react';

import { RootState, persistor } from '@/store';
import { useLogoutMutation } from '@/store/features/auth/authApi';
import { logout as logoutAction } from '@/store/features/auth/authSlice';
import { resetToggleSidebar, toggleSidebar } from '@/store/themeConfigSlice';
import { Maximize, Menu, Minimize, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslation } from '@/i18n';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Header = () => {
    const { t } = getTranslation();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const router = useRouter();
    const [logout] = useLogoutMutation();
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout(null).unwrap();
        } catch (err) {
            console.error('Logout API failed:', err);
        }

        dispatch(logoutAction());
        dispatch(resetToggleSidebar());

        persistor.pause();
        await persistor.purge();
        await persistor.flush();

        localStorage.clear();
        sessionStorage.clear();

        const clearCookie = (name: string) => {
            const hostname = window.location.hostname;
            const expire = 'expires=Thu, 01 Jan 1970 00:00:00 UTC';

            document.cookie = `${name}=; ${expire}; path=/; Max-Age=0; SameSite=Lax`;
            document.cookie = `${name}=; ${expire}; path=/; domain=${hostname}; Max-Age=0; SameSite=Lax`;

            if (hostname.includes('.')) {
                const rootDomain = hostname.split('.').slice(-2).join('.');
                document.cookie = `${name}=; ${expire}; path=/; domain=.${rootDomain}; Max-Age=0; SameSite=Lax`;
            }
        };

        ['token', 'role', 'permissions'].forEach(clearCookie);

        document.cookie.split(';').forEach((cookie) => {
            const name = cookie.split('=')[0].trim();
            clearCookie(name);
        });

        router.replace('/');
        router.refresh();
        window.location.replace('/');
    };

    // Fullscreen toggle function
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }

            let allLinks = document.querySelectorAll('ul.horizontal-menu a.active');
            for (let i = 0; i < allLinks.length; i++) {
                const element = allLinks[i];
                element?.classList.remove('active');
            }
            selector?.classList.add('active');

            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }, [pathname]);

    const isRtl = useSelector((state: RootState) => state.themeConfig.rtlClass) === 'rtl';
    const userPerms = useSelector((state: RootState) => state.auth.user?.permissions ?? []);
    const canGiveFeedback = userPerms.includes('feedbacks.create');
    const canViewFeedback = userPerms.includes('feedbacks.index');

    return (
        <header className="sticky top-0 z-50">
            <div className="border-b border-white/[0.07] bg-[#034d79] shadow-md">
                <div className="relative flex w-full items-center bg-[#034d79] px-3 py-2.5 sm:px-5">
                    {/* Logo Section — mobile only (sidebar hides on desktop) */}
                    <div className="horizontal-logo mr-2 flex items-center justify-between lg:hidden">
                        <Link href="/dashboard" className="main-logo flex shrink-0 items-center">
                            <Image
                                src="/images/andgatePOS.jpeg"
                                alt="logo icon"
                                width={120}
                                height={40}
                                className="h-6 w-auto object-contain sm:h-8 sm:w-auto md:h-10"
                                style={{ width: 'auto' }}
                                unoptimized
                            />
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon ml-2 flex flex-none rounded-md bg-white/[0.08] p-2 text-white transition-colors hover:bg-white/[0.15] lg:hidden"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <Menu size={20} color="currentColor" />
                        </button>
                    </div>

                    {/* Left Action Buttons — POS (primary) and Calculator (secondary) */}
                    <div className="flex items-center gap-1.5 sm:gap-2 ltr:mr-2 rtl:ml-2">
                        <Link
                            href="/pos"
                            className="ml-3 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#046ca9] to-[#034d79] px-3 py-2 text-base font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-[#0580c5] hover:to-[#046ca9] hover:shadow-lg sm:gap-2 sm:px-4"
                        >
                            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">{t('POS')}</span>
                        </Link>

                        <CalculatorButton />
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-1 sm:flex-1 sm:space-x-1.5 ltr:ml-auto ltr:sm:ml-0 rtl:mr-auto rtl:space-x-reverse sm:rtl:mr-0">
                        <div className="sm:ltr:mr-auto sm:rtl:ml-auto"></div>

                        {/* Fullscreen Toggle */}
                        <div className="shrink-0">
                            <button
                                type="button"
                                className="flex items-center rounded-md bg-white/[0.08] p-2 text-white transition-colors hover:bg-white/[0.15]"
                                onClick={toggleFullscreen}
                                title={isFullscreen ? t('lbl_exit_fullscreen') : t('lbl_enter_fullscreen')}
                            >
                                {isFullscreen ? <Minimize className="h-[18px] w-[18px]" /> : <Maximize className="h-[18px] w-[18px]" />}
                            </button>
                        </div>

                        {/* Language Switcher */}
                        <LanguageDropdown variant="dark" />

                        {/* Notifications Dropdown */}
                        <NotificationDropdown />

                        {/* User Profile Dropdown */}
                        <div className="dropdown flex shrink-0">
                            <Dropdown
                                offset={[0, 8]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="relative group flex items-center rounded-md bg-white/[0.08] p-2 text-white transition-colors hover:bg-white/[0.15]"
                                button={<IconUser className="h-[18px] w-[18px]" />}
                            >
                                <ul className="w-[220px] !py-0 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                                    <li>
                                        <Link href="/users/profile" className="dark:hover:text-white">
                                            <IconUser className="h-4 w-4 shrink-0 ltr:mr-2 rtl:ml-2" />
                                            {t('lbl_profile')}
                                        </Link>
                                    </li>
                                    {(canGiveFeedback || canViewFeedback) && (
                                        <>
                                            <li className="border-t border-white-light dark:border-white-light/10">
                                                <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white-dark/60 dark:text-white-dark/40">
                                                    {t('lbl_feedback')}
                                                </p>
                                            </li>
                                            {canGiveFeedback && (
                                                <li>
                                                    <Link href="/feedbacks/create-feedback" className="dark:hover:text-white">
                                                        <MessagesSquare className="h-4 w-4 shrink-0 ltr:mr-2 rtl:ml-2" />
                                                        {t('Give Feedback')}
                                                    </Link>
                                                </li>
                                            )}
                                            {canViewFeedback && (
                                                <li>
                                                    <Link href="/feedbacks" className="dark:hover:text-white">
                                                        <ClipboardList className="h-4 w-4 shrink-0 ltr:mr-2 rtl:ml-2" />
                                                        {t('View Feedback')}
                                                    </Link>
                                                </li>
                                            )}
                                        </>
                                    )}
                                    <li className="border-t border-white-light dark:border-white-light/10">
                                        <button onClick={handleLogout} className="flex w-full items-center !py-3 text-danger">
                                            <IconLogout className="h-4 w-4 shrink-0 rotate-90 ltr:mr-2 rtl:ml-2" />
                                            {t('btn_sign_out')}
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
