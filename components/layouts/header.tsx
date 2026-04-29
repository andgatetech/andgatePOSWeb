'use client';
import NotificationDropdown from '@/app/(application)/(protected)/notifications/components/NotificationDropdown';
import CalculatorButton from '@/components/custom/CalculatorButton';
import Dropdown from '@/components/dropdown';
import LanguageDropdown from '@/components/language-dropdown';
import IconLogout from '@/components/icon/icon-logout';
import IconMenu from '@/components/icon/icon-menu';
import IconUser from '@/components/icon/icon-user';

import { RootState, persistor } from '@/store';
import { useLogoutMutation } from '@/store/features/auth/authApi';
import { logout as logoutAction } from '@/store/features/auth/authSlice';
import { resetToggleSidebar, toggleSidebar } from '@/store/themeConfigSlice';
import { Maximize, Minimize, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Header = () => {
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

    return (
        <header>
            <div className="border-b border-white/[0.07] bg-[#1a2d50]">
                <div className="relative flex w-full items-center bg-[#1a2d50] px-3 py-2.5 sm:px-5">
                    {/* Logo Section — mobile only (sidebar hides on desktop) */}
                    <div className="horizontal-logo mr-2 flex items-center justify-between lg:hidden">
                        <Link href="/dashboard" className="main-logo flex shrink-0 items-center">
                            <Image src="/images/andgatePOS.jpeg" alt="logo icon" width={120} height={32} className="h-6 w-auto object-contain sm:h-8 sm:w-auto md:h-10" />
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon ml-2 flex flex-none rounded-md bg-white/[0.08] p-2 text-white/75 transition-colors hover:bg-white/[0.15] hover:text-white lg:hidden"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconMenu className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Left Action Buttons — POS (primary) and Calculator (secondary) */}
                    <div className="flex items-center gap-1.5 sm:gap-2 ltr:mr-2 rtl:ml-2">
                        <Link
                            href="/pos"
                            className="ml-3 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#046ca9] to-[#034d79] px-3 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-[#0580c5] hover:to-[#046ca9] hover:shadow-lg sm:gap-2 sm:px-4"
                        >
                            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">POS</span>
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
                                className="flex items-center rounded-md bg-white/[0.08] p-2 text-white/75 transition-colors hover:bg-white/[0.15] hover:text-white"
                                onClick={toggleFullscreen}
                                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
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
                                btnClassName="relative group flex items-center rounded-md bg-white/[0.08] p-2 text-white/75 transition-colors hover:bg-white/[0.15] hover:text-white"
                                button={<IconUser className="h-[18px] w-[18px]" />}
                            >
                                <ul className="w-[220px] !py-0 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                                    <li>
                                        <Link href="/users/profile" className="dark:hover:text-white">
                                            <IconUser className="h-4 w-4 shrink-0 ltr:mr-2 rtl:ml-2" />
                                            Profile
                                        </Link>
                                    </li>
                                    <li className="border-t border-white-light dark:border-white-light/10">
                                        <button onClick={handleLogout} className="flex w-full items-center !py-3 text-danger">
                                            <IconLogout className="h-4 w-4 shrink-0 rotate-90 ltr:mr-2 rtl:ml-2" />
                                            Sign Out
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
