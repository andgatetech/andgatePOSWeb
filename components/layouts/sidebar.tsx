'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import PerfectScrollbar from 'react-perfect-scrollbar';
import AnimateHeight from 'react-animate-height';

import { IRootState } from '@/store';
import { toggleSidebar } from '@/store/themeConfigSlice';
import { getTranslation } from '@/i18n';

// Icons
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconMinus from '@/components/icon/icon-minus';
import IconMenuContacts from '@/components/icon/menu/icon-menu-contacts';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';

// 🔑 Helper: read cookie without any package
function getCookieValue(name: string): string | null {
    if (typeof document === 'undefined') return null; // avoid SSR crash
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

// Configs
const baseAdminRoutes = [
    { href: '/apps/store', label: 'Store' },
    { href: '/apps/category', label: 'Category' },
    { href: '/apps/products', label: 'Products List' },
    { href: '/apps/createProduct', label: 'Create Product' },
    { href: '/apps/Purchase', label: 'Purchase List' },
    { href: '/apps/createPurchase', label: 'Create Purchase' },
    { href: '/apps/OrderView', label: 'Order List' },
    { href: '/apps/ActivityLog', label: 'Activity Log' }
];

const supplierRoutes = [
    { href: '/apps/supplier', label: 'Dashboard' },
    { href: '/apps/supplier/purchase', label: 'Purchase' },
];

const Sidebar = () => {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [role, setRole] = useState<string | null>(null);

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);

    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => (oldValue === value ? '' : value));
    };

    // Load role from cookies
    useEffect(() => {
        const userRole = getCookieValue('role'); // e.g., "store_admin", "staff", "supplier"
        setRole(userRole);
    }, []);

    // Highlight active route
    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [pathname]);

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        allLinks.forEach((el) => el.classList.remove('active'));

        const selector = document.querySelector(`.sidebar ul a[href="${window.location.pathname}"]`);
        selector?.classList.add('active');
    };

    // Build routes based on role
    let menuRoutes: { href: string; label: string }[] = [];

    if (role === 'store_admin') {
        menuRoutes = baseAdminRoutes; // show all
    } else if (role === 'staff') {
        // staff cannot see Store, Category, Create Product, Staff Management
        menuRoutes = baseAdminRoutes.filter((r) => !['/apps/store', '/apps/category', '/apps/createProduct', '/apps/Staff', '/apps/ActivityLog'].includes(r.href));
    } else if (role === 'supplier') {
        menuRoutes = supplierRoutes;
    }

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black">
                    {/* Logo */}
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/dashboard" className="main-logo flex shrink-0 items-center">
                            <img className="ml-[5px] w-14 flex-none" src="/assets/images/Logo-PNG.png" alt="logo" />
                            <span className="align-middle text-2xl font-semibold dark:text-white-light lg:inline ltr:ml-1.5 rtl:mr-1.5">AndGate POS</span>
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 dark:text-white-light dark:hover:bg-dark-light/10 rtl:rotate-180"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>

                    {/* Sidebar Menu */}
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                            {/* Dashboard (admin only) */}
                            {role === 'store_admin' && (
                                <li className="menu nav-item">
                                    <button type="button" className={`${currentMenu === 'dashboard' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('dashboard')}>
                                        <div className="flex items-center">
                                            <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                                            <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('dashboard')}</span>
                                        </div>
                                        <div className={currentMenu !== 'dashboard' ? '-rotate-90 rtl:rotate-90' : ''}>
                                            <IconCaretDown />
                                        </div>
                                    </button>
                                    <AnimateHeight duration={300} height={currentMenu === 'dashboard' ? 'auto' : 0}>
                                        <ul className="sub-menu text-gray-500">
                                            <li>
                                                <Link href="/dashboard">{t('sales')}</Link>
                                            </li>
                                            <li>
                                                <Link href="/apps/pos">{t('POS')}</Link>
                                            </li>
                                        </ul>
                                    </AnimateHeight>
                                </li>
                            )}

                            {/* Role-based routes */}
                            {role && (
                                <>
                                    <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                        <IconMinus className="hidden h-5 w-4 flex-none" />
                                        <span>{role === 'store_admin' ? t('admins') : role === 'supplier' ? t('supplier') : t('staff')}</span>
                                    </h2>
                                    <ul>
                                        {menuRoutes.map((route) => (
                                            <li key={route.href} className="nav-item">
                                                <Link href={route.href} className="group">
                                                    <div className="flex items-center">
                                                        <IconMenuContacts className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t(route.label)}</span>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
