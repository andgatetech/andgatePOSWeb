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
        requiredPermissions: ['stores.view'],
        subMenu: [
            {
                label: 'Store',
                href: '/store',
                requiredPermissions: ['stores.view'],
            },
            {
                label: 'Settings',
                href: '/store/setting',
                requiredPermissions: ['stores.edit'],
            },
            {
                label: 'Employees Management',
                href: '/employees',
                requiredPermissions: ['users.view'],
            },
        ],
    },
    {
        label: 'Category',
        icon: React.createElement(Layers),
        requiredPermissions: ['categories.index'],
        subMenu: [
            {
                label: 'Category List',
                href: '/category',
                requiredPermissions: ['categories.index'],
            },
        ],
    },
    {
        label: 'Brand',
        icon: React.createElement(Tag),
        requiredPermissions: ['brands.index'],
        subMenu: [
            {
                label: 'Brand List',
                href: '/brand',
                requiredPermissions: ['brands.index'],
            },
        ],
    },
    {
        label: 'Product',
        icon: React.createElement(Package),
        requiredPermissions: ['products.index'],
        subMenu: [
            {
                label: 'Add Product',
                href: '/products/create',
                requiredPermissions: ['products.create'],
            },
            {
                label: 'Product List',
                href: '/products',
                requiredPermissions: ['products.index'],
            },
            {
                label: 'Stock Adjustment',
                href: '/products/stock/adjustments',
                requiredPermissions: ['stock.adjustments'],
            },
            {
                label: 'Bulk Upload',
                href: '/products/bulk',
                requiredPermissions: ['products.bulk-upload'],
            },
            {
                label: 'Print Label',
                href: '/label',
                requiredPermissions: ['barcode.generate'],
            },
        ],
    },
    {
        label: 'POS',
        icon: React.createElement(ShoppingCart),
        requiredPermissions: ['sales.create'],
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
        requiredPermissions: ['orders.index'],
        subMenu: [
            {
                label: 'Order List',
                href: '/orders',
                requiredPermissions: ['orders.index'],
            },
            {
                label: 'Order Returns List',
                href: '/orders/return/list',
                requiredPermissions: ['orders.index'],
            },
        ],
    },
    {
        label: 'Purchases Order',
        icon: React.createElement(ShoppingCart),
        requiredPermissions: ['purchase-orders.index'],
        subMenu: [
            {
                label: 'Add Purchase',
                href: '/purchases/create',
                requiredPermissions: ['purchase-orders.create'],
            },
            {
                label: 'Purchase List',
                href: '/purchases/list',
                requiredPermissions: ['purchase-orders.index'],
            },
        ],
    },
    {
        label: 'Supplier',
        icon: React.createElement(Truck),
        requiredPermissions: ['suppliers.index'],
        subMenu: [
            {
                label: 'Add Supplier',
                href: '/suppliers/create',
                requiredPermissions: ['suppliers.create'],
            },
            {
                label: 'Supplier List',
                href: '/suppliers/list',
                requiredPermissions: ['suppliers.index'],
            },
        ],
    },
    {
        label: 'Account',
        icon: React.createElement(Wallet),
        requiredPermissions: ['ledgers.index', 'journals.index'],
        subMenu: [
            {
                label: 'Ledger List',
                href: '/account/ledger-list',
                requiredPermissions: ['ledgers.index'],
            },
            {
                label: 'Journal List',
                href: '/account/journal-list',
                requiredPermissions: ['journals.index'],
            },
        ],
    },
    {
        label: 'Expenses',
        icon: React.createElement(Receipt),
        requiredPermissions: ['expenses.index'],
        subMenu: [
            {
                label: 'Expense List',
                href: '/expenses/expense-list',
                requiredPermissions: ['expenses.index'],
            },
        ],
    },
    {
        label: 'Customer',
        icon: React.createElement(Users),
        requiredPermissions: ['customers.index'],
        subMenu: [
            {
                label: 'Add Customer',
                href: '/customers/create',
                requiredPermissions: ['customers.create'],
            },
            {
                label: 'Customer List',
                href: '/customers/list',
                requiredPermissions: ['customers.index'],
            },
        ],
    },
    {
        label: 'Report',
        icon: React.createElement(BarChart),
        requiredPermissions: [
            'reports.sales',
            'reports.expense',
            'reports.tax',
            'reports.transaction',
            'reports.purchase',
            'reports.purchase-transaction',
            'reports.inventory',
            'reports.low-stock',
            'stock.reports',
        ],
        subMenu: [
            // Sales & Revenue Reports
            {
                label: 'Sales & Revenue',
                requiredPermissions: ['reports.sales', 'reports.transaction'],
                subMenu: [
                    { label: 'Sales Report', href: '/reports/sales', requiredPermissions: ['reports.sales'] },
                    { label: 'Order Returns', href: '/reports/order-returns', requiredPermissions: ['reports.sales'] },
                    { label: 'Transactions', href: '/reports/transaction', requiredPermissions: ['reports.transaction'] },
                    { label: 'Invoices', href: '/reports/invoice', requiredPermissions: ['reports.sales'] },
                    { label: 'Sales Items', href: '/reports/sales-items', requiredPermissions: ['reports.sales'] },
                ],
            },
            // Customer Reports
            {
                label: 'Customer Reports',
                requiredPermissions: ['reports.sales'],
                subMenu: [{ label: 'Customer Report', href: '/reports/customer', requiredPermissions: ['reports.sales'] }],
            },
            // Purchase & Supplier Reports
            {
                label: 'Purchase & Supplier',
                requiredPermissions: ['reports.purchase'],
                subMenu: [
                    { label: 'Purchase Report', href: '/reports/purchase', requiredPermissions: ['reports.purchase'] },
                    { label: 'Purchase Items', href: '/reports/purchase-items', requiredPermissions: ['reports.purchase'] },
                    { label: 'Purchase Transactions', href: '/reports/purchase-transaction', requiredPermissions: ['reports.purchase-transaction'] },
                    { label: 'Supplier Report', href: '/reports/supplier', requiredPermissions: ['reports.purchase'] },
                    { label: 'Supplier Dues', href: '/reports/supplier-due', requiredPermissions: ['reports.purchase'] },
                ],
            },
            // Inventory Reports
            {
                label: 'Inventory Reports',
                requiredPermissions: ['stock.reports', 'reports.inventory', 'reports.low-stock'],
                subMenu: [
                    { label: 'Stock Report', href: '/reports/stock', requiredPermissions: ['stock.reports'] },
                    { label: 'Low Stock', href: '/reports/low-stock', requiredPermissions: ['reports.low-stock'] },
                    { label: 'Idle Products', href: '/reports/idle-product', requiredPermissions: ['reports.inventory'] },
                    { label: 'Adjustments', href: '/reports/adjustment', requiredPermissions: ['stock.reports'] },
                    { label: 'Product Report', href: '/reports/product', requiredPermissions: ['reports.inventory'] },
                ],
            },
            // Financial Reports
            {
                label: 'Financial Reports',
                requiredPermissions: ['reports.profit-loss', 'reports.expense', 'reports.tax'],
                subMenu: [
                    { label: 'Profit & Loss', href: '/reports/profit-loss', requiredPermissions: ['reports.profit-loss'] },
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
            },
            {
                label: 'View Feedback',
                href: '/feedbacks',
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
export function buildMenuFromPermissions(userPermissions: string[] | undefined): MenuItem[] {
    // Always filter by actual permissions — the backend controls what each user can access
    return ALL_MENU_ITEMS.map((item) => filterMenuItem(item, userPermissions)).filter((item): item is MenuItem => item !== null);
}
