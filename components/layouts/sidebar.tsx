'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import AnimateHeight from 'react-animate-height';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';

import { getTranslation } from '@/i18n';
import { buildMenuFromPermissions } from '@/lib/menu-builder';
import { RootState } from '@/store';
import { setCurrentStore } from '@/store/features/auth/authSlice';
import { toggleSidebar } from '@/store/themeConfigSlice';

import { Crown, Store } from 'lucide-react';
import Image from 'next/image';
import IconCaretDown from '../icon/icon-caret-down';
import IconCaretsDown from '../icon/icon-carets-down';

// Helper: read cookie
function getCookieValue(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

const Sidebar = () => {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const router = useRouter();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);

    const themeConfig = useSelector((state: RootState) => state.themeConfig);
    const semidark = useSelector((state: RootState) => state.themeConfig.semidark);

    // Get user, permissions, and stores from Redux
    const user = useSelector((state: RootState) => state.auth.user);
    const currentStore = useSelector((state: RootState) => state.auth.currentStore);
    const currentStoreId = useSelector((state: RootState) => state.auth.currentStoreId);
    const userStores = user?.stores || [];

    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => (oldValue === value ? '' : value));
    };

    const handleStoreChange = (store: any) => {
        dispatch(setCurrentStore(store));
        setIsStoreDropdownOpen(false);

        // Check if user is on an order return page (detail or with query params) and redirect to list
        const returnDetailMatch = pathname?.match(/^\/orders\/return\/(\d+)$/);
        const returnWithQueryMatch = pathname === '/orders/return';

        if (returnDetailMatch || returnWithQueryMatch) {
            router.push('/orders/return/list');
        }

        // Check if user is on a product edit page and redirect to products list
        const productEditMatch = pathname?.match(/^\/products\/edit\/(\d+)$/);
        if (productEditMatch) {
            router.push('/products');
        }

        // Check if user is on a purchase receive page and redirect to purchases list
        const purchaseReceiveMatch = pathname?.match(/^\/purchases\/receive\/(\d+)$/);
        if (purchaseReceiveMatch) {
            router.push('/purchases/receive');
        }
    };

    // Highlight active route
    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const setActiveRoute = () => {
        document.querySelectorAll('.sidebar ul a.active').forEach((el) => el.classList.remove('active'));
        const selector = document.querySelector(`.sidebar ul a[href="${window.location.pathname}"]`);
        selector?.classList.add('active');
    };

    // 🚀 Build menu dynamically based on user permissions
    const menuRoutes = useMemo(() => {
        const userPermissions = user?.permissions || [];
        const userRole = user?.role;

        return buildMenuFromPermissions(userPermissions, userRole);
    }, [user]);

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="flex h-full flex-col bg-white dark:bg-black">
                    {/* Logo */}
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/dashboard" className="main-logo flex shrink-0 items-center space-x-2">
                            <Image src="/images/andgatePOS.jpeg" alt="AndGate POS logo" width={0} height={0} sizes="100vw" className="h-10 w-auto object-contain" priority />
                            {/* You can add site name text here if needed */}
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 dark:text-white-light dark:hover:bg-dark-light/10 rtl:rotate-180"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>

                    {/* Store Selector Dropdown */}
                    {userStores.length > 0 && (
                        <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                            <div className="relative">
                                <button
                                    onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
                                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                                >
                                    <div className="flex items-center gap-2">
                                        <Store className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                        <span className="font-medium text-gray-700 dark:text-gray-200">{currentStore ? currentStore.store_name : 'Select Store'}</span>
                                    </div>
                                    <IconCaretDown className={`h-4 w-4 text-gray-500 transition-transform ${isStoreDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                <AnimateHeight duration={200} height={isStoreDropdownOpen ? 'auto' : 0}>
                                    <div className="mt-2 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
                                        <div className="border-b border-gray-100 px-3 py-2 text-xs font-semibold uppercase text-gray-500 dark:border-gray-700 dark:text-gray-400">Select Store</div>
                                        <div className="py-1">
                                            {userStores.map((store) => (
                                                <button
                                                    key={store.id}
                                                    onClick={() => handleStoreChange(store)}
                                                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                                        currentStore?.id === store.id ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-gray-700 dark:text-gray-200'
                                                    }`}
                                                >
                                                    <Store className="h-4 w-4" />
                                                    <span className="truncate font-medium">{store.store_name}</span>
                                                    {currentStore?.id === store.id && <span className="ml-auto text-xs text-primary">✓</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </AnimateHeight>
                            </div>
                        </div>
                    )}

                    {/* Sidebar Menu */}
                    <PerfectScrollbar className="flex-1 overflow-y-auto">
                        <ul className="relative space-y-0.5 p-4 pb-4 font-semibold">
                            {menuRoutes.map((route) => (
                                <li key={route.label} className="menu nav-item">
                                    {route.subMenu ? (
                                        // Route with submenu
                                        <>
                                            <button
                                                type="button"
                                                className={`${currentMenu === route.label ? 'active' : ''} nav-link group flex w-full items-center justify-between`}
                                                onClick={() => toggleMenu(route.label)}
                                            >
                                                <div className="flex items-center">
                                                    {route.icon}
                                                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t(route.label)}</span>
                                                </div>
                                                <IconCaretDown className={`${currentMenu === route.label ? 'rotate-180' : ''}`} />
                                            </button>

                                            <AnimateHeight duration={300} height={currentMenu === route.label ? 'auto' : 0}>
                                                <ul className="sub-menu text-gray-500">
                                                    {route.subMenu.map((sub) => (
                                                        <li key={sub.label} className="py-1">
                                                            {sub.href ? (
                                                                <Link href={sub.href} className="flex items-center">
                                                                    {sub.icon && sub.icon}
                                                                    <span className="ltr:pl-2 rtl:pr-2">{t(sub.label)}</span>
                                                                </Link>
                                                            ) : sub.subMenu ? (
                                                                // Handle nested submenu (like Stock Reports)
                                                                <div>
                                                                    <span className="block px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{t(sub.label)}</span>
                                                                    <ul className="ml-4 space-y-1">
                                                                        {sub.subMenu.map((nested) => (
                                                                            <li key={nested.label}>
                                                                                {nested.href && (
                                                                                    <Link
                                                                                        href={nested.href}
                                                                                        className="block px-3 py-1 text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                                                                                    >
                                                                                        {t(nested.label)}
                                                                                    </Link>
                                                                                )}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            ) : (
                                                                <span className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{t(sub.label)}</span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </AnimateHeight>
                                        </>
                                    ) : (
                                        // Direct link (like Dashboard)
                                        <Link href={route.href!} className="nav-link group flex w-full items-center py-2 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                                            <div className="flex items-center">
                                                {route.icon}
                                                <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t(route.label)}</span>
                                            </div>
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </PerfectScrollbar>

                    {/* Subscription Status Card - Simple Version */}
                    {user?.subscription_user && (
                        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <Crown className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-500" />
                                        <p className="truncate text-sm font-bold text-gray-800 dark:text-gray-200">{user.subscription_user.subscription?.name || 'Basic'}</p>
                                    </div>

                                    {user.subscription_user.expire_date && (
                                        <p className="mt-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                            <span className={`capitalize text-${user.subscription_user.status === 'active' ? 'green' : 'orange'}-600 mr-1`}>{user.subscription_user.status}</span>•{' '}
                                            {Math.ceil((new Date(user.subscription_user.expire_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                                        </p>
                                    )}
                                </div>

                                <Link
                                    href="/pricing"
                                    className="flex-shrink-0 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                >
                                    Upgrade
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
