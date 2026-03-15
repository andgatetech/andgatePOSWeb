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
    const userPermissions = context.permissions ?? [];
    if (userPermissions.length === 0) {
        return false;
    }

    return permissions.some((permission) => userPermissions.includes(permission));
};

const hasAllPermissionsFromContext = (context: PermissionContext, permissions: string[]): boolean => {
    const userPermissions = context.permissions ?? [];
    if (userPermissions.length === 0) {
        return false;
    }

    return permissions.every((permission) => userPermissions.includes(permission));
};

export const ROUTE_PERMISSIONS: Record<string, string[]> = {
    // ── Dashboard (no restriction — all authenticated users) ───
    '/dashboard': [],

    // ── Store ──────────────────────────────────────────────────
    '/store': ['stores.view'],
    '/store/setting': ['stores.edit'],
    '/store/payment-methods': ['payment-methods.manage'],
    '/staff': ['users.view'],

    // ── Categories ─────────────────────────────────────────────
    '/category': ['categories.index'],

    // ── Brands ─────────────────────────────────────────────────
    '/brand': ['brands.index'],

    // ── Products ───────────────────────────────────────────────
    '/products': ['products.index'],
    '/products/create': ['products.create'],
    '/products/edit': ['products.edit'],
    '/products/stock/adjustments': ['stock.adjustments'],
    '/create-adjustment': ['stock.adjustments'],
    '/products/qr-code': ['qrcode.generate'],
    '/label': ['barcode.generate'],

    // ── Product Attributes ─────────────────────────────────────
    '/product-attributes': ['products.index'],
    '/product-attributes/create': ['products.create'],

    // ── Warranty Types ─────────────────────────────────────────
    '/warranty-types': ['products.index'],
    '/warranty-types/create': ['products.create'],

    // ── Product Serials ────────────────────────────────────────
    '/product-serials': ['products.index'],
    '/product-serials/create': ['products.create'],

    // ── POS (no restriction — all authenticated users) ─────────
    '/pos': [],

    // ── Orders ─────────────────────────────────────────────────
    '/orders': ['orders.index'],

    // ── Order Returns ───────────────────────────────────────────
    '/order-returns': ['orders.return'],

    // ── Purchase Drafts & Orders ────────────────────────────────
    '/purchases/create': ['purchase-orders.create'],
    '/purchases/list': ['purchase-orders.index'],

    // ── Suppliers ──────────────────────────────────────────────
    '/suppliers/create': ['suppliers.create'],
    '/suppliers/list': ['suppliers.index'],
    '/suppliers/edit': ['suppliers.edit'],

    // ── Accounting ─────────────────────────────────────────────
    '/account/ledger-list': ['ledgers.index'],
    '/account/journal-list': ['journals.index'],

    // ── Expenses ───────────────────────────────────────────────
    '/expenses/expense-list': ['expenses.index'],

    // ── Customers ──────────────────────────────────────────────
    '/customers': ['customers.index'],
    '/customers/list': ['customers.index'],
    '/customers/create': ['customers.create'],
    '/customers/edit': ['customers.edit'],

    // ── Reports: Sales & Revenue ────────────────────────────────
    '/reports/sales': ['reports.sales'],
    '/reports/order-returns': ['reports.sales'],
    '/reports/transaction': ['reports.transaction'],
    '/reports/invoice': ['reports.sales'],
    '/reports/sales-items': ['reports.sales'],
    '/reports/customer': ['reports.sales'],
    '/reports/customer-due': ['reports.sales'],

    // ── Reports: Purchase & Supplier ────────────────────────────
    '/reports/purchase': ['reports.purchase'],
    '/reports/purchase-items': ['reports.purchase'],
    '/reports/purchase-transaction': ['reports.purchase-transaction'],
    '/reports/supplier': ['reports.purchase'],
    '/reports/supplier-due': ['reports.purchase'],

    // ── Reports: Inventory & Stock ──────────────────────────────
    '/reports/stock': ['stock.reports'],
    '/reports/low-stock': ['reports.low-stock'],
    '/reports/idle-product': ['reports.inventory'],
    '/reports/adjustment': ['stock.reports'],
    '/products/stock/stock-adjustment-list': ['stock.reports'],
    '/reports/product': ['reports.inventory'],

    // ── Reports: Financial ──────────────────────────────────────
    '/reports/profit-loss': ['reports.profit-loss'],
    '/reports/expense': ['reports.expense'],
    '/reports/tax': ['reports.tax'],

    // ── Notifications ──────────────────────────────────────────
    '/notifications': [],

    // ── Feedbacks (no restriction — no backend middleware) ──────
    '/feedbacks': [],
    '/feedbacks/create-feedback': [],
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
