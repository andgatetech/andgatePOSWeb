'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AnimateHeight from 'react-animate-height';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';

import { getTranslation } from '@/i18n';
import { IRootState } from '@/store';
import { toggleSidebar } from '@/store/themeConfigSlice';

// Icons
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import { BarChart, FileText, Home, Layers, Package, ShoppingBag, ShoppingCart, Users } from 'lucide-react';

// Helper: read cookie
function getCookieValue(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

// Sidebar routes
const adminRoutes = [
    {
        label: 'Dashboard',
        icon: <Home />,
        subMenu: [{ label: 'Sales', href: '/dashboard' }],
    },
    {
        label: 'Store',
        icon: <ShoppingBag />,
        subMenu: [
            { label: 'Store', href: '/apps/store' },
            { label: 'Staff Management', href: '/apps/Staff' },
        ],
    },
    {
        label: 'Category',
        icon: <Layers />,
        subMenu: [{ label: 'Category List', href: '/apps/category' }],
    },
    {
        label: 'Product',
        icon: <Package />,
        subMenu: [
            { label: 'Create Product', href: '/apps/createProduct' },
            { label: 'Product List', href: '/apps/products' },
            { label: 'Generate Product QrCode', href: '/apps/qr-code' },
        ],
    },
    {
        label: 'POS',
        icon: <ShoppingCart />,
        subMenu: [{ label: 'POS Interface', href: '/apps/pos' }],
    },
    {
        label: 'Order',
        icon: <FileText />,
        subMenu: [{ label: 'Order List', href: '/apps/OrderView' }],
    },
    {
        label: 'Purchase',
        icon: <Package />,
        subMenu: [
            { label: 'Create Purchase', href: '/apps/createPurchase' },
            { label: 'Purchase List', href: '/apps/Purchase' },
        ],
    },
    {
        label: 'Seller',
        icon: <Users />,
        subMenu: [{ label: 'Seller Management', href: '/apps/Seller' }],
    },
    {
        label: 'Account',
        icon: <Users />,
        subMenu: [
            { label: 'Ledger List', href: '/apps/account/ledger-list' },
            { label: 'Create Ledger', href: '/apps/account/create-ledger' },
        ],
    },
    {
        label: 'Expenses',
        icon: <Users />,
        subMenu: [
            { label: 'Expenses List', href: '/apps/expenses/expense-list' },
            { label: 'Create Expense', href: '/apps/expenses/create-expense' },
        ],
    },
    {
        label: 'Report',
        icon: <BarChart />,
        subMenu: [
            { label: 'Activity log', href: '/apps/ActivityLog' },
            { label: 'Sales Report', href: '/apps/SalesReport' },
            { label: 'Customer-Behavior Report', href: '/apps/CustomerReport' },
            { label: 'Idle Inventory Report', href: '/apps/IdleInventoryReport' },
            { label: 'Stock Report', href: '/apps/stock-report' },
        ],
    },
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
        const userRole = getCookieValue('role'); // "store_admin", "staff", "supplier"
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
        document.querySelectorAll('.sidebar ul a.active').forEach((el) => el.classList.remove('active'));
        const selector = document.querySelector(`.sidebar ul a[href="${window.location.pathname}"]`);
        selector?.classList.add('active');
    };

    const menuRoutes = role === 'store_admin' ? adminRoutes : [];

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black">
                    {/* Logo */}
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/dashboard" className="main-logo flex shrink-0 items-center space-x-2">
                            {/* Icon from public/images */}
                            <img src="/images/andgatePOS.jpeg" alt="logo icon" className=" w-40 object-contain" />

                            {/* Main site name */}
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
                            {menuRoutes.map((route) => (
                                <li key={route.label} className="menu nav-item">
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
                                                <li key={sub.href}>
                                                    <Link href={sub.href}>{t(sub.label)}</Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </AnimateHeight>
                                </li>
                            ))}
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
