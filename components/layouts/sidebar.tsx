'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import AnimateHeight from 'react-animate-height';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';

import { getTranslation } from '@/i18n';
import { buildMenuFromPermissions, type MenuItem } from '@/lib/menu-builder';
import { RootState } from '@/store';
import { setCurrentStore } from '@/store/features/auth/authSlice';
import { toggleSidebar } from '@/store/themeConfigSlice';
import { useGetUnreadCountQuery } from '@/store/features/notification/notificationApi';

import { AlertTriangle, Ban, ChevronDown, Crown } from 'lucide-react';
import Image from 'next/image';
import IconCaretsDown from '../icon/icon-carets-down';

const Sidebar = () => {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const router = useRouter();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
    const [storeWarning, setStoreWarning] = useState<string | null>(null);
    const [isSwitchingStore, setIsSwitchingStore] = useState(false);

    const themeConfig = useSelector((state: RootState) => state.themeConfig);
    const user = useSelector((state: RootState) => state.auth.user);
    const currentStore = useSelector((state: RootState) => state.auth.currentStore);
    const userStores = user?.stores || [];

    const { data: unreadData } = useGetUnreadCountQuery(undefined, {
        pollingInterval: 300000, // 5 minutes
    });
    const unreadCount = unreadData?.count || 0;

    const isStoreInactive = (store: any) => store.is_active === 0 || store.is_active === false;
    const isStoreDisabled = (store: any) => store.store_disabled === 1 || store.store_disabled === true;

    // ── Active route detection (pathname-based, no DOM manipulation) ──────
    const isActiveRoute = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname === href || pathname.startsWith(href + '/');
    };

    const isParentActive = (route: MenuItem): boolean => {
        if (!route.subMenu) return false;
        return route.subMenu.some((sub) => {
            if (sub.href) return isActiveRoute(sub.href);
            if (sub.subMenu) return sub.subMenu.some((n) => !!n.href && isActiveRoute(n.href));
            return false;
        });
    };

    const menuRoutes = useMemo(() => buildMenuFromPermissions(user?.permissions || []), [user]);

    // Auto-open parent that contains the active route on navigation
    useEffect(() => {
        const activeParent = menuRoutes.find((r) => r.subMenu && isParentActive(r));
        if (activeParent) setCurrentMenu(activeParent.label);
        setIsSwitchingStore(false);
        if (window.innerWidth < 1024 && themeConfig.sidebar) dispatch(toggleSidebar());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, menuRoutes]);

    // Fallback: clear switching state after 1.5s when no navigation occurs
    useEffect(() => {
        if (!isSwitchingStore) return;
        const timer = setTimeout(() => setIsSwitchingStore(false), 1500);
        return () => clearTimeout(timer);
    }, [isSwitchingStore]);

    const toggleMenu = (label: string) => setCurrentMenu((prev) => (prev === label ? '' : label));

    const handleStoreChange = (store: any) => {
        if (currentStore?.id === store.id) { setIsStoreDropdownOpen(false); return; }
        setStoreWarning(null);
        setIsSwitchingStore(true);
        setIsStoreDropdownOpen(false);
        if (isStoreInactive(store)) setStoreWarning(`"${store.store_name}" is currently inactive.`);
        else if (isStoreDisabled(store)) setStoreWarning(`"${store.store_name}" has been disabled.`);
        dispatch(setCurrentStore(store));
        if (pathname?.match(/^\/orders\/return\/(\d+)$/) || pathname === '/orders/return') router.push('/orders/return/list');
        if (pathname?.match(/^\/products\/edit\/(\d+)$/)) router.push('/products');
        if (pathname?.match(/^\/purchases\/receive\/(\d+)$/)) router.push('/purchases/receive');
    };

    const storeInitial = currentStore?.store_name?.[0]?.toUpperCase() || 'S';

    return (
        <nav className="sidebar fixed bottom-0 top-0 z-50 flex h-full min-h-screen w-[260px] flex-col bg-[#1a2d50] border-r border-white/[0.07] transition-all duration-300">

            {/* ── Logo ─────────────────────────────────────────────────── */}
            <div className="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <div className="overflow-hidden rounded-lg">
                        <Image src="/images/andgatePOS.jpeg" alt="AndGate POS" width={110} height={28} className="h-7 w-auto object-contain" priority />
                    </div>
                </Link>
                <button
                    type="button"
                    onClick={() => dispatch(toggleSidebar())}
                    aria-label="Collapse sidebar"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/10 hover:text-white/85"
                >
                    <IconCaretsDown className="rotate-90 scale-90" />
                </button>
            </div>

            {/* ── Store Selector ───────────────────────────────────────── */}
            {userStores.length > 0 && (
                <div className="flex-shrink-0 border-b border-white/[0.06] px-3 pb-3 pt-2.5">
                    <button
                        onClick={() => userStores.length > 1 && !isSwitchingStore && setIsStoreDropdownOpen(!isStoreDropdownOpen)}
                        disabled={isSwitchingStore}
                        className={`group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors ${
                            userStores.length > 1 && !isSwitchingStore ? 'cursor-pointer hover:bg-white/[0.05]' : 'cursor-default'
                        } ${isSwitchingStore ? 'opacity-60' : ''}`}
                    >
                        {/* Store avatar */}
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-lg ${
                            currentStore && (isStoreInactive(currentStore) || isStoreDisabled(currentStore))
                                ? 'bg-red-500/70' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                        }`}>
                            {isSwitchingStore ? (
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : storeInitial}
                        </div>

                        <div className="min-w-0 flex-1 text-left">
                            <p className="truncate text-[13px] font-semibold leading-tight text-white/90">
                                {isSwitchingStore ? 'Switching...' : currentStore?.store_name || 'Select Store'}
                            </p>
                            <p className="text-[10px] leading-tight text-white/55">
                                {currentStore && isStoreInactive(currentStore) ? 'Inactive store' :
                                 currentStore && isStoreDisabled(currentStore) ? 'Store disabled' : 'Current store'}
                            </p>
                        </div>

                        {userStores.length > 1 && (
                            <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 text-white/45 transition-transform duration-200 ${isStoreDropdownOpen ? 'rotate-180' : ''}`} />
                        )}
                    </button>

                    {/* Store warning */}
                    {storeWarning && (
                        <div className="mt-2 flex items-start gap-2 rounded-lg border border-orange-500/20 bg-orange-500/[0.08] px-3 py-2">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-orange-400" />
                            <p className="flex-1 text-[11px] leading-relaxed text-orange-300">{storeWarning}</p>
                            <button onClick={() => setStoreWarning(null)} className="text-orange-400/50 transition-colors hover:text-orange-400">
                                <span className="text-xs leading-none">✕</span>
                            </button>
                        </div>
                    )}

                    {/* Store list dropdown */}
                    <AnimateHeight duration={200} height={isStoreDropdownOpen ? 'auto' : 0}>
                        <div className="mt-2 overflow-hidden rounded-xl border border-white/[0.09] bg-[#111e3a]">
                            <p className="px-3 py-2 text-[9px] font-semibold uppercase tracking-widest text-white/45">Switch Store</p>
                            <div className="pb-1.5">
                                {userStores.map((store) => (
                                    <button
                                        key={store.id}
                                        onClick={() => handleStoreChange(store)}
                                        className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-white/[0.05] ${
                                            currentStore?.id === store.id ? 'text-primary' : 'text-white/75'
                                        }`}
                                    >
                                        <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[9px] font-bold text-white ${
                                            isStoreInactive(store) ? 'bg-orange-500/60' :
                                            isStoreDisabled(store) ? 'bg-red-500/60' :
                                            currentStore?.id === store.id ? 'bg-primary' : 'bg-white/20'
                                        }`}>
                                            {store.store_name[0]?.toUpperCase()}
                                        </div>
                                        <span className="flex-1 truncate text-[12px] font-medium">{store.store_name}</span>
                                        {currentStore?.id === store.id && !isStoreInactive(store) && !isStoreDisabled(store) && (
                                            <span className="text-xs text-primary">✓</span>
                                        )}
                                        {isStoreInactive(store) && (
                                            <span className="flex items-center gap-1 rounded bg-orange-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-orange-400">
                                                <AlertTriangle className="h-2.5 w-2.5" /> Inactive
                                            </span>
                                        )}
                                        {isStoreDisabled(store) && (
                                            <span className="flex items-center gap-1 rounded bg-red-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-red-400">
                                                <Ban className="h-2.5 w-2.5" /> Disabled
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </AnimateHeight>
                </div>
            )}

            {/* ── Navigation Menu ──────────────────────────────────────── */}
            <PerfectScrollbar className="flex-1">
                <div className="px-2.5 py-3">
                    {menuRoutes.map((route) => {
                        const parentActive = route.subMenu ? isParentActive(route) : false;
                        const isOpen = currentMenu === route.label;
                        const directActive = !route.subMenu && !!route.href && isActiveRoute(route.href);

                        return (
                            <div key={route.label} className="mb-0.5">
                                {route.subMenu ? (
                                    <>
                                        {/* Parent with submenu */}
                                        <button
                                            type="button"
                                            onClick={() => toggleMenu(route.label)}
                                            className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                                                parentActive
                                                    ? 'bg-primary/[0.15] text-white'
                                                    : 'text-white/70 hover:bg-white/[0.07] hover:text-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`flex-shrink-0 transition-colors [&>svg]:h-4 [&>svg]:w-4 ${
                                                    parentActive ? 'text-primary' : 'text-white/55 group-hover:text-white/85'
                                                }`}>
                                                    {route.icon}
                                                </span>
                                                <span>{t(route.label)}</span>
                                            </div>
                                            <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200 ${
                                                isOpen ? 'rotate-180' : ''
                                            } ${parentActive ? 'text-primary/70' : 'text-white/40'}`} />
                                        </button>

                                        {/* Submenu */}
                                        <AnimateHeight duration={220} height={isOpen ? 'auto' : 0}>
                                            <div className="ml-[13px] mt-1 border-l border-white/[0.1] pl-3.5 pb-1">
                                                {route.subMenu.map((sub) => {
                                                    if (sub.href) {
                                                        const active = isActiveRoute(sub.href);
                                                        return (
                                                            <Link
                                                                key={sub.label}
                                                                href={sub.href}
                                                                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px] transition-all duration-150 ${
                                                                    active
                                                                        ? 'bg-primary/[0.13] font-semibold text-primary'
                                                                        : 'text-white/65 hover:bg-white/[0.07] hover:text-white'
                                                                }`}
                                                            >
                                                                {active && <span className="h-1 w-1 flex-shrink-0 rounded-full bg-primary" />}
                                                                {t(sub.label)}
                                                            </Link>
                                                        );
                                                    }

                                                    // Nested group (Reports sections)
                                                    if (sub.subMenu) {
                                                        return (
                                                            <div key={sub.label} className="mt-4 first:mt-1">
                                                                <div className="mb-1.5 flex items-center gap-2 px-2">
                                                                    <p className="text-[9px] font-semibold uppercase tracking-widest text-white/55">
                                                                        {t(sub.label)}
                                                                    </p>
                                                                    <div className="h-px flex-1 bg-white/10" />
                                                                </div>
                                                                {sub.subMenu.map((nested) => {
                                                                    if (!nested.href) return null;
                                                                    const active = isActiveRoute(nested.href);
                                                                    return (
                                                                        <Link
                                                                            key={nested.label}
                                                                            href={nested.href}
                                                                            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] transition-all duration-150 ${
                                                                                active
                                                                                    ? 'bg-primary/[0.13] font-semibold text-primary'
                                                                                    : 'text-white/65 hover:bg-white/[0.07] hover:text-white'
                                                                            }`}
                                                                        >
                                                                            {active && <span className="h-1 w-1 flex-shrink-0 rounded-full bg-primary" />}
                                                                            {t(nested.label)}
                                                                        </Link>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    }

                                                    return null;
                                                })}
                                            </div>
                                        </AnimateHeight>
                                    </>
                                ) : (
                                    /* Direct link */
                                    <Link
                                        href={route.href!}
                                        className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                                            directActive
                                                ? 'bg-primary/[0.15] text-white'
                                                : 'text-white/70 hover:bg-white/[0.07] hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`flex-shrink-0 transition-colors [&>svg]:h-4 [&>svg]:w-4 ${
                                                directActive ? 'text-primary' : 'text-white/55 group-hover:text-white/85'
                                            }`}>
                                                {route.icon}
                                            </span>
                                            <span>{t(route.label)}</span>
                                        </div>

                                        {/* Notification badge */}
                                        {route.label === 'Notifications' && unreadCount > 0 && (
                                            <span className="relative flex items-center">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/40" />
                                                <span className="relative flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                                                    {unreadCount > 99 ? '99+' : unreadCount}
                                                </span>
                                            </span>
                                        )}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            </PerfectScrollbar>

            {/* ── Subscription Footer ───────────────────────────────────── */}
            {user?.subscription_user && (() => {
                const exp = new Date(user.subscription_user.expire_date);
                const daysLeft = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isExpired = daysLeft <= 0;
                const isExpiring = daysLeft <= 7 && !isExpired;

                return (
                    <div className="flex-shrink-0 border-t border-white/[0.06] p-3">
                        <div className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 ${
                            isExpired ? 'bg-red-500/[0.08]' : isExpiring ? 'bg-orange-500/[0.08]' : 'bg-white/[0.04]'
                        }`}>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <Crown className={`h-3 w-3 flex-shrink-0 ${
                                        isExpired ? 'text-red-400' : isExpiring ? 'text-orange-400' : 'text-yellow-400'
                                    }`} />
                                    <p className="truncate text-[12px] font-semibold text-white/75">
                                        {user.subscription_user.plan_name_en}
                                    </p>
                                </div>
                                <p className={`mt-0.5 text-[10px] ${
                                    isExpired ? 'text-red-400' : isExpiring ? 'text-orange-400' : 'text-white/50'
                                }`}>
                                    {isExpired ? 'Subscription expired' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining`}
                                </p>
                            </div>
                            <Link
                                href="/subscription"
                                className={`flex-shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                                    isExpired ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                                    isExpiring ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' :
                                    'bg-white/[0.08] text-white/65 hover:bg-white/[0.14] hover:text-white/90'
                                }`}
                            >
                                Upgrade
                            </Link>
                        </div>
                    </div>
                );
            })()}
        </nav>
    );
};

export default Sidebar;
