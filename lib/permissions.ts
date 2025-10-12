/**
 * Permission Utility Functions
 *
 * This file contains utility functions for checking user permissions
 * based on routes and required permissions from the backend.
 */

import type { User } from '@/store/features/auth/authSlice';

interface PermissionContext {
    role?: string | null;
    permissions?: string[] | null;
}

const toContext = (user: User | null): PermissionContext => ({
    role: user?.role ?? null,
    permissions: user?.permissions ?? [],
});

const isStoreAdmin = (role?: string | null): boolean => role === 'store_admin';

export const normalizeRoutePath = (route: string): string => {
    if (!route) {
        return '/';
    }

    const lower = route.toLowerCase();
    if (lower.length === 1) {
        return lower;
    }

    return lower.replace(/\/+$/, '') || '/';
};

export const findMatchingRouteKey = (route: string): string | null => {
    const normalized = normalizeRoutePath(route);

    if (ROUTE_PERMISSIONS[normalized]) {
        return normalized;
    }

    const segments = normalized.split('/').filter(Boolean);

    while (segments.length > 0) {
        const candidate = `/${segments.join('/')}`;
        if (ROUTE_PERMISSIONS[candidate]) {
            return candidate;
        }
        segments.pop();
    }

    return null;
};

const hasRoutePermissionFromContext = (context: PermissionContext, route: string): boolean => {
    if (isStoreAdmin(context.role)) {
        return true;
    }

    const permissions = context.permissions ?? [];
    if (permissions.length === 0) {
        return false;
    }

    const requiredPermissions = ROUTE_PERMISSIONS[route];

    if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
    }

    return requiredPermissions.some((permission) => permissions.includes(permission));
};

const hasAnyPermissionFromContext = (context: PermissionContext, permissions: string[]): boolean => {
    if (isStoreAdmin(context.role)) {
        return true;
    }

    const userPermissions = context.permissions ?? [];
    if (userPermissions.length === 0) {
        return false;
    }

    return permissions.some((permission) => userPermissions.includes(permission));
};

const hasAllPermissionsFromContext = (context: PermissionContext, permissions: string[]): boolean => {
    if (isStoreAdmin(context.role)) {
        return true;
    }

    const userPermissions = context.permissions ?? [];
    if (userPermissions.length === 0) {
        return false;
    }

    return permissions.every((permission) => userPermissions.includes(permission));
};

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
export const hasRoutePermission = (user: User | null, route: string): boolean => hasRoutePermissionFromContext(toContext(user), route);

/**
 * Check if user has any of the specified permissions
 * @param user - User object from Redux state
 * @param permissions - Array of permission strings to check
 * @returns true if user has at least one permission
 */
export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => hasAnyPermissionFromContext(toContext(user), permissions);

/**
 * Check if user has all specified permissions
 * @param user - User object from Redux state
 * @param permissions - Array of permission strings to check
 * @returns true if user has all permissions
 */
export const hasAllPermissions = (user: User | null, permissions: string[]): boolean => hasAllPermissionsFromContext(toContext(user), permissions);

/**
 * Filter menu items based on user permissions
 * @param menuItems - Array of menu items
 * @param user - User object from Redux state
 * @returns Filtered menu items
 */
export const filterMenuByPermissions = (menuItems: any[], user: User | null): any[] => {
    const context = toContext(user);

    if (isStoreAdmin(context.role)) {
        return menuItems; // Admin sees everything
    }

    return menuItems.filter((item) => {
        // If item has direct href, check permission
        if (item.href) {
            return hasRoutePermissionFromContext(context, item.href);
        }

        // If item has submenu, filter submenu items
        if (item.subMenu) {
            const filteredSubMenu = item.subMenu.filter((subItem: any) => {
                if (subItem.href) {
                    return hasRoutePermissionFromContext(context, subItem.href);
                }

                // Handle nested submenu (like Stock Reports)
                if (subItem.subMenu) {
                    const filteredNestedMenu = subItem.subMenu.filter((nested: any) => {
                        if (nested.href) {
                            return hasRoutePermissionFromContext(context, nested.href);
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

export const canAccessRoute = (role: string | null | undefined, permissions: string[] | null | undefined, route: string): boolean => hasRoutePermissionFromContext({ role, permissions }, route);

export const hasAnyPermissionForValues = (role: string | null | undefined, permissions: string[] | null | undefined, required: string[]): boolean =>
    hasAnyPermissionFromContext({ role, permissions }, required);

export const hasAllPermissionsForValues = (role: string | null | undefined, permissions: string[] | null | undefined, required: string[]): boolean =>
    hasAllPermissionsFromContext({ role, permissions }, required);
