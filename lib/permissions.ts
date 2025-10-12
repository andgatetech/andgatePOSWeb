/**
 * Permission Utility Functions
 *
 * This file contains utility functions for checking user permissions
 * based on routes and required permissions from the backend.
 */

import { User } from '@/store/features/auth/authSlice';

// Route to permissions mapping (from your backend)
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
    // Dashboard
    '/dashboard': ['view-dashboard'],

    // Store
    '/store': ['stores.view'],
    '/store/setting': ['stores.edit'],
    '/staff': ['users.view'],
    '/create-adjustment': ['stock-adjustments.create'],

    // Category
    '/category': ['categories.view'],

    // Brand
    '/brand': ['brands.view'],

    // Products
    '/products/create': ['products.create'],
    '/products': ['products.view'],
    '/products/stock/create-stock-adjustment': ['stock-adjustments.create'],
    '/products/qr-code': ['products.view'],
    '/label': ['products.view'],

    // POS
    '/pos': ['pos.access'],

    // Orders
    '/orders': ['orders.view'],

    // Purchase Orders
    '/purchases/create': ['purchase-orders.create'],
    '/purchases/list': ['purchase-orders.view'],

    // Suppliers
    '/suppliers/create-supplier': ['suppliers.create'],
    '/suppliers': ['suppliers.view'],

    // Account
    '/account/ledger-list': ['ledgers.view'],
    '/account/journal-list': ['journals.view'],

    // Expenses
    '/expenses/expense-list': ['expenses.view'],

    // Customers
    '/customer': ['customers.view'],

    // Reports
    '/reports/activity': ['reports.activity-logs'],
    '/reports/sales': ['reports.sales'],
    '/reports/income': ['reports.income'],
    '/reports/expenses': ['reports.expenses'],
    '/reports/profit-loss': ['reports.profit-loss'],
    '/reports/tax': ['reports.tax'],
    '/reports/idle-product': ['reports.idle-products'],
    '/reports/purchase-order': ['reports.purchase-order'],
    '/reports/pos-transaction': ['reports.pos-transaction'],
    '/reports/purchase-transaction': ['reports.purchase-transaction'],
    '/reports/stock/current': ['reports.stock-current'],
    '/reports/stock/transactions': ['reports.stock-transactions'],
    '/products/stock/stock-adjustment-list': ['reports.stock-adjustments'],
    '/reports/stock/adjustments': ['reports.stock-adjustments'],

    // Feedback
    '/feedbacks/create-feedback': ['feedback.create'],
    '/feedbacks': ['feedback.view'],
};

/**
 * Check if user has permission to access a route
 * @param user - User object from Redux state
 * @param route - Route path to check
 * @returns true if user has permission, false otherwise
 */
export const hasRoutePermission = (user: User | null, route: string): boolean => {
    // Admin always has access
    if (user?.role === 'store_admin') {
        return true;
    }

    // If no permissions defined, deny access
    if (!user?.permissions || user.permissions.length === 0) {
        return false;
    }

    // Get required permissions for this route
    const requiredPermissions = ROUTE_PERMISSIONS[route];

    // If no specific permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
    }

    // Check if user has at least one of the required permissions
    return requiredPermissions.some((permission) => user.permissions?.includes(permission));
};

/**
 * Check if user has any of the specified permissions
 * @param user - User object from Redux state
 * @param permissions - Array of permission strings to check
 * @returns true if user has at least one permission
 */
export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
    // Admin always has access
    if (user?.role === 'store_admin') {
        return true;
    }

    if (!user?.permissions || user.permissions.length === 0) {
        return false;
    }

    return permissions.some((permission) => user.permissions?.includes(permission));
};

/**
 * Check if user has all specified permissions
 * @param user - User object from Redux state
 * @param permissions - Array of permission strings to check
 * @returns true if user has all permissions
 */
export const hasAllPermissions = (user: User | null, permissions: string[]): boolean => {
    // Admin always has access
    if (user?.role === 'store_admin') {
        return true;
    }

    if (!user?.permissions || user.permissions.length === 0) {
        return false;
    }

    return permissions.every((permission) => user.permissions?.includes(permission));
};

/**
 * Filter menu items based on user permissions
 * @param menuItems - Array of menu items
 * @param user - User object from Redux state
 * @returns Filtered menu items
 */
export const filterMenuByPermissions = (menuItems: any[], user: User | null): any[] => {
    if (user?.role === 'store_admin') {
        return menuItems; // Admin sees everything
    }

    return menuItems.filter((item) => {
        // If item has direct href, check permission
        if (item.href) {
            return hasRoutePermission(user, item.href);
        }

        // If item has submenu, filter submenu items
        if (item.subMenu) {
            const filteredSubMenu = item.subMenu.filter((subItem: any) => {
                if (subItem.href) {
                    return hasRoutePermission(user, subItem.href);
                }

                // Handle nested submenu (like Stock Reports)
                if (subItem.subMenu) {
                    const filteredNestedMenu = subItem.subMenu.filter((nested: any) => {
                        if (nested.href) {
                            return hasRoutePermission(user, nested.href);
                        }
                        return false;
                    });

                    // Only show parent if it has visible children
                    if (filteredNestedMenu.length > 0) {
                        subItem.subMenu = filteredNestedMenu;
                        return true;
                    }
                    return false;
                }

                return false;
            });

            // Only show parent menu if it has visible submenu items
            if (filteredSubMenu.length > 0) {
                item.subMenu = filteredSubMenu;
                return true;
            }
            return false;
        }

        return false;
    });
};
