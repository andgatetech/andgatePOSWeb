'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AnimateHeight from 'react-animate-height';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';

import { getTranslation } from '@/i18n';
import { RootState } from '@/store';
import { setCurrentStore } from '@/store/features/auth/authSlice';
import { toggleSidebar } from '@/store/themeConfigSlice';

// Icons
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import { BarChart, FileText, Home, Layers, MessagesSquare, Package, Receipt, ShoppingBag, ShoppingCart, Store, Tag, Truck, Users, Wallet } from 'lucide-react';

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
            { label: 'Settings', href: '/apps/store/setting' },
            { label: 'Staff Management', href: '/apps/staff' },
            { label: 'Adjustment Type', href: '/apps/create-adjustment' },
        ],
    },
    {
        label: 'Category',
        icon: <Layers />,
        subMenu: [{ label: 'All Category ', href: '/apps/category' }],
    },

    {
        label: 'Brand',
        icon: <Tag />,
        subMenu: [{ label: 'Brand List', href: '/apps/brand' }],
    },
    {
        label: 'Product',
        icon: <Package />,
        subMenu: [
            { label: 'Add Product', href: '/apps/createProduct' },
            { label: 'All Products', href: '/apps/products' },
            { label: 'Stock Adjustment', href: '/apps/stock/create-stock-adjustment' },
            { label: 'Product QrCode', href: '/apps/qr-code' },
        ],
    },
    {
        label: 'POS',
        icon: <ShoppingCart />,
        subMenu: [{ label: 'POS Interface', href: '/apps/pos' }],
    },
    {
        label: 'Orders',
        icon: <FileText />,
        subMenu: [{ label: 'All Orders', href: '/apps/orders' }],
    },
    {
        label: 'Supplier',
        icon: <Truck />,
        subMenu: [
            { label: 'Add Supplier', href: '/apps/suppliers/create-supplier' },
            { label: 'All Supplier', href: '/apps/suppliers' },
        ],
    },
    {
        label: 'Account',
        icon: <Wallet />,
        subMenu: [
            { label: 'All Ledger', href: '/apps/account/ledger-list' },
            { label: 'All Journal', href: '/apps/account/journal-list' },
        ],
    },
    {
        label: 'Expenses',
        icon: <Receipt />,
        subMenu: [{ label: 'All Expenses ', href: '/apps/expenses/expense-list' }],
    },
    {
        label: 'Customer',
        icon: <Users />,
        subMenu: [{ label: 'All Customer ', href: '/apps/customer' }],
    },
    {
        label: 'Report',
        icon: <BarChart />,
        subMenu: [
            { label: 'Activity log', href: '/apps/ActivityLog' },
            { label: 'Sales Report', href: '/apps/SalesReport' },
            { label: 'Customer-Behavior Report', href: '/apps/CustomerReport' },
            { label: 'Idle Inventory Report', href: '/apps/IdleInventoryReport' },
            // { label: 'Stock Report ', href: '/apps/stock-report/stock' },
            // { label: 'Stock Report', href: '/apps/stock-report/stock' },
            { label: 'Tax Report', href: '/apps/TaxReport' },
            { label: 'All Stock Adjustment', href: '/apps/stock/stock-adjustment-list' },
            { label: 'All Stock Report', href: '/apps/stock/stock-report' },
        ],
    },
    {
        label: 'Feedback',
        icon: <MessagesSquare />,
        subMenu: [
            { label: 'Give Feedback', href: '/apps/feedbacks/create-feedback' },
            { label: 'View Feedback', href: '/apps/feedbacks' },
        ],
    },
];

const Sidebar = () => {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [role, setRole] = useState<string | null>(null);
    const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);

    const themeConfig = useSelector((state: RootState) => state.themeConfig);
    const semidark = useSelector((state: RootState) => state.themeConfig.semidark);

    // Get user stores and current store from Redux
    const user = useSelector((state: RootState) => state.auth.user);
    const currentStore = useSelector((state: RootState) => state.auth.currentStore);
    const currentStoreId = useSelector((state: RootState) => state.auth.currentStoreId);
    const userStores = user?.stores || [];

    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => (oldValue === value ? '' : value));
    };

    const handleStoreChange = (store: any) => {
        console.log('🏪 BEFORE Store Change:');
        console.log('  - Previous Store:', currentStore?.store_name, 'ID:', currentStoreId);
        console.log('  - Selecting Store:', store.store_name, 'ID:', store.id);

        dispatch(setCurrentStore(store));
        setIsStoreDropdownOpen(false);

        // Log after dispatch (this will show in next render)
        console.log('🔄 Store change dispatched successfully');
    };

    // Load role from cookies
    useEffect(() => {
        const userRole = getCookieValue('role'); // "store_admin", "staff", "supplier"
        setRole(userRole);
    }, []);

    // Log store changes for verification
    useEffect(() => {
        if (currentStore && currentStoreId) {
            console.log('✅ REDUX STATE UPDATED:');
            console.log('  - Current Store:', currentStore.store_name);
            console.log('  - Current Store ID:', currentStoreId);
            console.log('  - Full Store Object:', currentStore);
        }
    }, [currentStore, currentStoreId]);

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
