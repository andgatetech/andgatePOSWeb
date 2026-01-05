// lib/menu-builder.tsx
import { BarChart, FileText, Home, Layers, MessagesSquare, Package, Receipt, ShoppingBag, ShoppingCart, Tag, Truck, Users, Wallet } from 'lucide-react';
import React from 'react';

export interface MenuItem {
    label: string;
    icon?: React.ReactNode;
    href?: string;
    subMenu?: MenuItem[];
    requiredPermissions?: string[]; // Permissions needed to access this menu item
}

/**
 * Complete menu structure with permission requirements
 * This defines ALL possible menu items - they will be filtered based on user permissions
 */
export const ALL_MENU_ITEMS: MenuItem[] = [
    {
        label: 'Dashboard',
        icon: React.createElement(Home),
        href: '/dashboard',
        requiredPermissions: ['view-dashboard'],
    },
    {
        label: 'Store',
        icon: React.createElement(ShoppingBag),
        requiredPermissions: ['stores.view', 'stores.index'],
        subMenu: [
            {
                label: 'Store',
                href: '/store',
                requiredPermissions: ['stores.view', 'stores.index'],
            },
            {
                label: 'Settings',
                href: '/store/setting',
                requiredPermissions: ['settings.store'],
            },
            {
                label: 'Employees Management',
                href: '/employees',
                requiredPermissions: ['users.view', 'users.index'],
            },
        ],
    },
    {
        label: 'Category',
        icon: React.createElement(Layers),
        requiredPermissions: ['categories.view', 'categories.index'],
        subMenu: [
            {
                label: 'Category List',
                href: '/category',
                requiredPermissions: ['categories.view', 'categories.index'],
            },
        ],
    },
    {
        label: 'Brand',
        icon: React.createElement(Tag),
        requiredPermissions: ['brands.view', 'brands.index'],
        subMenu: [
            {
                label: 'Brand List',
                href: '/brand',
                requiredPermissions: ['brands.view', 'brands.index'],
            },
        ],
    },
    {
        label: 'Product',
        icon: React.createElement(Package),
        requiredPermissions: ['products.view', 'products.index'],
        subMenu: [
            {
                label: 'Add Product',
                href: '/products/create',
                requiredPermissions: ['products.create'],
            },
            {
                label: 'Product List',
                href: '/products',
                requiredPermissions: ['products.view', 'products.index'],
            },
            {
                label: 'Stock Adjustment',
                href: '/products/stock/adjustments',
                requiredPermissions: ['stock.adjustments'],
            },
            {
                label: 'Bulk Upload',
                href: '/products/bulk',
                requiredPermissions: ['products.view'],
            },
            {
                label: 'Print Label',
                href: '/label',
                requiredPermissions: ['products.view'],
            },
        ],
    },
    {
        label: 'POS',
        icon: React.createElement(ShoppingCart),
        requiredPermissions: ['sales.view', 'sales.create'],
        subMenu: [
            {
                label: 'Terminal',
                href: '/pos',
                requiredPermissions: ['sales.create'],
            },
        ],
    },
    {
        label: 'Orders',
        icon: React.createElement(FileText),
        requiredPermissions: ['orders.view', 'orders.index'],
        subMenu: [
            {
                label: 'Order List',
                href: '/orders',
                requiredPermissions: ['orders.view', 'orders.index'],
            },
        ],
    },
    {
        label: 'Purchases Order',
        icon: React.createElement(ShoppingCart),
        requiredPermissions: ['purchase-orders.view', 'purchase-orders.index', 'purchases.view', 'purchases.index'],
        subMenu: [
            {
                label: 'Add Purchase',
                href: '/purchases/create',
                requiredPermissions: ['purchase-orders.create', 'purchases.create'],
            },
            {
                label: 'Purchase List',
                href: '/purchases/list',
                requiredPermissions: ['purchase-orders.view', 'purchase-orders.index', 'purchases.view', 'purchases.index'],
            },

            { label: 'Purchase Dues', href: '/purchases/dues', requiredPermissions: ['purchase-dues.index', 'purchase-dues.view', 'purchase-dues.update-payment', 'purchase-dues.clear-due'] },
        ],
    },
    {
        label: 'Supplier',
        icon: React.createElement(Truck),
        requiredPermissions: ['suppliers.view', 'suppliers.index'],
        subMenu: [
            {
                label: 'Add Supplier',
                href: '/suppliers/create',
                requiredPermissions: ['suppliers.create'],
            },
            {
                label: 'Supplier List',
                href: '/suppliers/list',
                requiredPermissions: ['suppliers.view', 'suppliers.index'],
            },
        ],
    },
    {
        label: 'Account',
        icon: React.createElement(Wallet),
        requiredPermissions: ['ledgers.view', 'ledgers.index', 'journals.view', 'journals.index'],
        subMenu: [
            {
                label: 'Ledger List',
                href: '/account/ledger-list',
                requiredPermissions: ['ledgers.view', 'ledgers.index'],
            },
            {
                label: 'Journal List',
                href: '/account/journal-list',
                requiredPermissions: ['journals.view', 'journals.index'],
            },
        ],
    },
    {
        label: 'Expenses',
        icon: React.createElement(Receipt),
        requiredPermissions: ['expenses.view', 'expenses.index'],
        subMenu: [
            {
                label: 'Expense List',
                href: '/expenses/expense-list',
                requiredPermissions: ['expenses.view', 'expenses.index'],
            },
        ],
    },
    {
        label: 'Customer',
        icon: React.createElement(Users),
        requiredPermissions: ['customers.view', 'customers.index'],
        subMenu: [
            {
                label: 'Add Customer',
                href: '/customers/create',
                requiredPermissions: ['customers.create'],
            },
            {
                label: 'Customer List',
                href: '/customers/list',
                requiredPermissions: ['customers.view', 'customers.index'],
            },
        ],
    },
    {
        label: 'Report',
        icon: React.createElement(BarChart),
        requiredPermissions: [
            'reports.sales',
            'reports.purchases',
            'reports.inventory',
            'reports.financial',
            'reports.expense',
            'reports.stock',
            'reports.tax',
            'reports.transaction',
            'reports.customer',
            'reports.supplier',
            'reports.profit_loss',
            'reports.purchase',
            'reports.purchase-transaction',
        ],
        subMenu: [
            // Sales & Revenue Reports
            {
                label: 'Sales & Revenue',
                requiredPermissions: ['reports.sales', 'reports.transaction'],
                subMenu: [
                    { label: 'Sales Report', href: '/reports/sales', requiredPermissions: ['reports.sales'] },
                    { label: 'Transactions', href: '/reports/transaction', requiredPermissions: ['reports.transaction'] },
                    { label: 'Invoices', href: '/reports/invoice', requiredPermissions: ['reports.sales'] },
                    { label: 'Sales Items', href: '/reports/sales-items', requiredPermissions: ['reports.sales'] },
                ],
            },
            // Customer Reports
            {
                label: 'Customer Reports',
                requiredPermissions: ['reports.customer', 'reports.sales'],
                subMenu: [{ label: 'Customer Report', href: '/reports/customer', requiredPermissions: ['reports.customer', 'reports.sales'] }],
            },
            // Purchase & Supplier Reports
            {
                label: 'Purchase & Supplier',
                requiredPermissions: ['reports.purchase', 'reports.purchases', 'reports.supplier'],
                subMenu: [
                    { label: 'Purchase Report', href: '/reports/purchase', requiredPermissions: ['reports.purchase', 'reports.purchases'] },
                    { label: 'Purchase Items', href: '/reports/purchase-items', requiredPermissions: ['reports.purchase', 'reports.purchases'] },
                    { label: 'Purchase Transactions', href: '/reports/purchase-transaction', requiredPermissions: ['reports.purchase-transaction'] },
                    { label: 'Supplier Report', href: '/reports/supplier', requiredPermissions: ['reports.supplier', 'reports.purchases'] },
                    { label: 'Supplier Dues', href: '/reports/supplier-due', requiredPermissions: ['reports.supplier', 'reports.purchases'] },
                ],
            },
            // Inventory Reports
            {
                label: 'Inventory Reports',
                requiredPermissions: ['reports.stock', 'reports.inventory'],
                subMenu: [
                    { label: 'Stock Report', href: '/reports/stock', requiredPermissions: ['reports.stock'] },
                    { label: 'Low Stock', href: '/reports/low-stock', requiredPermissions: ['reports.stock'] },
                    { label: 'Idle Products', href: '/reports/idle-product', requiredPermissions: ['reports.inventory'] },
                    { label: 'Adjustments', href: '/reports/adjustment', requiredPermissions: ['reports.stock', 'stock.reports'] },
                    { label: 'Product Report', href: '/reports/product', requiredPermissions: ['reports.inventory'] },
                ],
            },
            // Financial Reports
            {
                label: 'Financial Reports',
                requiredPermissions: ['reports.financial', 'reports.profit_loss', 'reports.expense', 'reports.tax'],
                subMenu: [
                    { label: 'Profit & Loss', href: '/reports/profit-loss', requiredPermissions: ['reports.profit_loss', 'reports.financial'] },
                    { label: 'Expense Report', href: '/reports/expense', requiredPermissions: ['reports.expense'] },
                    { label: 'Tax Report', href: '/reports/tax', requiredPermissions: ['reports.tax'] },
                ],
            },
        ],
    },
    {
        label: 'Feedback',
        icon: React.createElement(MessagesSquare),
        requiredPermissions: ['view-dashboard'], // Available to all authenticated users
        subMenu: [
            {
                label: 'Give Feedback',
                href: '/feedbacks/create-feedback',
                requiredPermissions: ['view-dashboard'],
            },
            {
                label: 'View Feedback',
                href: '/feedbacks',
                requiredPermissions: ['view-dashboard'],
            },
        ],
    },
];

/**
 * Check if user has ANY of the required permissions
 */
function hasAnyPermission(userPermissions: string[] | undefined, requiredPermissions?: string[]): boolean {
    if (!requiredPermissions || requiredPermissions.length === 0) {
        return true; // No permissions required
    }

    if (!userPermissions || userPermissions.length === 0) {
        return false; // User has no permissions
    }

    return requiredPermissions.some((permission) => userPermissions.includes(permission));
}

/**
 * Recursively filter menu items based on user permissions
 */
function filterMenuItem(item: MenuItem, userPermissions: string[] | undefined): MenuItem | null {
    // Check if user has permission for this menu item
    if (!hasAnyPermission(userPermissions, item.requiredPermissions)) {
        return null;
    }

    // If this item has a submenu, filter it recursively
    if (item.subMenu && item.subMenu.length > 0) {
        const filteredSubMenu = item.subMenu.map((subItem) => filterMenuItem(subItem, userPermissions)).filter((subItem): subItem is MenuItem => subItem !== null);

        // If no submenu items remain after filtering, hide the parent
        if (filteredSubMenu.length === 0) {
            return null;
        }

        return {
            ...item,
            subMenu: filteredSubMenu,
        };
    }

    return item;
}

/**
 * Build menu items based on user permissions
 * @param userPermissions - Array of permission strings from backend
 * @param role - User role (store_admin has full access)
 * @returns Filtered menu items array
 */
export function buildMenuFromPermissions(userPermissions: string[] | undefined, role?: string): MenuItem[] {
    // Store admin sees everything
    if (role === 'store_admin') {
        return ALL_MENU_ITEMS;
    }

    // Filter menu items based on permissions
    return ALL_MENU_ITEMS.map((item) => filterMenuItem(item, userPermissions)).filter((item): item is MenuItem => item !== null);
}
