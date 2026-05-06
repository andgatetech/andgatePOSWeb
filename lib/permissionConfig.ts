/**
 * Permission configuration — human-readable labels, sidebar menu mapping,
 * and category metadata used by the PermissionSelector UI component.
 *
 * Keep in sync with the backend $menuMap (platform-admin permissions blade).
 */

// ─── Sidebar Menu Map ────────────────────────────────────────────────────────
// Maps every permission name → the sidebar menu items it unlocks.
// If the permission unlocks NO visible menu item, the array is empty [].
export const PERMISSION_MENU_MAP: Record<string, string[]> = {
    'stores.view': ['Store', 'Store List'],
    'stores.edit': ['Store Settings'],
    'stores.create': [],
    'users.view': ['Employees Management'],
    'users.create': [],
    'users.edit': [],
    'categories.index': ['Category List'],
    'categories.create': [],
    'categories.edit': [],
    'categories.delete': [],
    'categories.view': [],
    'brands.index': ['Brand List'],
    'brands.create': [],
    'brands.edit': [],
    'brands.delete': [],
    'brands.view': [],
    'products.index': ['Product List'],
    'products.create': ['Add Product'],
    'products.edit': [],
    'products.delete': [],
    'products.view': [],
    'products.bulk-upload': ['Bulk Upload'],
    'stock.adjustments': ['Stock Adjustment'],
    'stock.summary': [],
    'stock.movement': [],
    'stock.reports': ['Stock Report', 'Adjustments Report'],
    'orders.index': ['Order List', 'Order Returns List'],
    'orders.create': ['POS Terminal'],
    'orders.edit': [],
    'orders.view': [],
    'orders.return': [],
    'purchase-orders.index': ['Purchase List'],
    'purchase-orders.create': ['Add Purchase'],
    'purchase-orders.edit': [],
    'purchase-orders.delete': [],
    'purchase-orders.view': [],
    'suppliers.index': ['Supplier List'],
    'suppliers.create': ['Add Supplier'],
    'suppliers.edit': [],
    'suppliers.delete': [],
    'suppliers.view': [],
    'ledgers.index': ['Ledger List'],
    'ledgers.create': [],
    'ledgers.edit': [],
    'ledgers.delete': [],
    'ledgers.view': [],
    'journals.index': ['Journal List'],
    'journals.create': [],
    'journals.edit': [],
    'journals.delete': [],
    'journals.view': [],
    'expenses.index': ['Expense List'],
    'expenses.create': [],
    'expenses.edit': [],
    'expenses.delete': [],
    'expenses.view': [],
    'customers.index': ['Customer List'],
    'customers.create': ['Add Customer'],
    'customers.edit': [],
    'customers.delete': [],
    'customers.view': [],
    'reports.sales': ['Sales Report', 'Order Returns', 'Invoices', 'Sales Items', 'Customer Report'],
    'reports.transaction': ['Transactions'],
    'reports.purchase': ['Purchase Report', 'Purchase Items', 'Supplier Report', 'Supplier Dues'],
    'reports.purchase-transaction': ['Purchase Transactions'],
    'reports.inventory': ['Idle Products', 'Product Report'],
    'reports.low-stock': ['Low Stock'],
    'reports.profit-loss': ['Profit & Loss'],
    'reports.expense': ['Expense Report'],
    'reports.tax': ['Tax Report'],
    'barcode.generate': ['Print Label'],
    'qrcode.generate': [],
    'payment-methods.manage': [],
    'notifications.index': ['Notifications'],
    'notifications.create': ['Send Notification'],
    'notifications.edit': [],
    'feedbacks.index': ['View Feedback'],
    'feedbacks.create': ['Give Feedback'],
    'feedbacks.edit': [],
    'feedbacks.delete': [],
    'feedbacks.view': [],
};

// ─── Action Labels ────────────────────────────────────────────────────────────
// Maps the "action" part of a permission name (after the dot) → human label.
export const ACTION_LABELS: Record<string, string> = {
    index: 'View All (List)',
    create: 'Add / Create',
    edit: 'Edit / Update',
    delete: 'Delete',
    view: 'View Details',
    adjustments: 'Stock Adjustments',
    summary: 'Stock Summary',
    movement: 'Stock Movement',
    reports: 'Reports',
    return: 'Process Returns',
    'bulk-upload': 'Bulk Upload',
    generate: 'Generate / Print',
    manage: 'Manage Settings',
    sales: 'Sales Reports',
    transaction: 'Transaction Reports',
    purchase: 'Purchase Reports',
    'purchase-transaction': 'Purchase Transaction Reports',
    inventory: 'Inventory Reports',
    'low-stock': 'Low Stock Reports',
    'profit-loss': 'Profit & Loss Reports',
    expense: 'Expense Reports',
    tax: 'Tax Reports',
};

// ─── Category Labels ──────────────────────────────────────────────────────────
// Maps the "category" part (before the dot) → human-readable module name.
export const CATEGORY_LABELS: Record<string, string> = {
    stores: 'Store Settings',
    users: 'Employees',
    categories: 'Categories',
    brands: 'Brands',
    products: 'Products',
    stock: 'Stock & Inventory',
    sales: 'POS & Sales',
    orders: 'Orders',
    'purchase-orders': 'Purchase Orders',
    suppliers: 'Suppliers',
    ledgers: 'Ledger Accounts',
    journals: 'Journal Entries',
    expenses: 'Expenses',
    customers: 'Customers',
    reports: 'Reports & Analytics',
    barcode: 'Barcode Labels',
    qrcode: 'QR Codes',
    'payment-methods': 'Payment Methods',
    notifications: 'Notifications',
    feedbacks: 'Feedback',
};

// ─── Category Sort Order ──────────────────────────────────────────────────────
// Determines display order in the permission grid.
export const CATEGORY_ORDER: string[] = [
    'stores',
    'users',
    'products',
    'categories',
    'brands',
    'stock',
    'sales',
    'orders',
    'purchase-orders',
    'suppliers',
    'customers',
    'ledgers',
    'journals',
    'expenses',
    'reports',
    'barcode',
    'qrcode',
    'payment-methods',
    'notifications',
    'feedbacks',
];

// ─── Category Theme Colors ──────────────────────────────────────────────────
// Tailwind border + header background color per category.
export const CATEGORY_COLORS: Record<string, { border: string; bg: string; icon: string; badge: string }> = {
    stores: { border: 'border-[#046ca9]/20', bg: 'bg-[#046ca9]/5', icon: 'text-[#046ca9]', badge: 'bg-[#046ca9]/10 text-[#034d79] border-[#046ca9]/20' },
    users: { border: 'border-[#046ca9]/20', bg: 'bg-[#046ca9]/5', icon: 'text-[#046ca9]', badge: 'bg-[#046ca9]/10 text-[#034d79] border-[#046ca9]/20' },
    products: { border: 'border-[#034d79]/20', bg: 'bg-[#034d79]/5', icon: 'text-[#034d79]', badge: 'bg-[#034d79]/10 text-[#034d79] border-[#034d79]/20' },
    categories: { border: 'border-[#e79237]/25', bg: 'bg-[#e79237]/10', icon: 'text-[#c47920]', badge: 'bg-[#e79237]/15 text-[#9a5a14] border-[#e79237]/25' },
    brands: { border: 'border-[#e79237]/25', bg: 'bg-[#e79237]/10', icon: 'text-[#c47920]', badge: 'bg-[#e79237]/15 text-[#9a5a14] border-[#e79237]/25' },
    stock: { border: 'border-[#e79237]/25', bg: 'bg-[#e79237]/10', icon: 'text-[#c47920]', badge: 'bg-[#e79237]/15 text-[#9a5a14] border-[#e79237]/25' },
    sales: { border: 'border-[#046ca9]/20', bg: 'bg-[#046ca9]/5', icon: 'text-[#046ca9]', badge: 'bg-[#046ca9]/10 text-[#034d79] border-[#046ca9]/20' },
    orders: { border: 'border-[#046ca9]/20', bg: 'bg-[#046ca9]/5', icon: 'text-[#046ca9]', badge: 'bg-[#046ca9]/10 text-[#034d79] border-[#046ca9]/20' },
    'purchase-orders': { border: 'border-[#034d79]/20', bg: 'bg-[#034d79]/5', icon: 'text-[#034d79]', badge: 'bg-[#034d79]/10 text-[#034d79] border-[#034d79]/20' },
    suppliers: { border: 'border-[#e79237]/25', bg: 'bg-[#e79237]/10', icon: 'text-[#c47920]', badge: 'bg-[#e79237]/15 text-[#9a5a14] border-[#e79237]/25' },
    customers: { border: 'border-[#046ca9]/20', bg: 'bg-[#046ca9]/5', icon: 'text-[#046ca9]', badge: 'bg-[#046ca9]/10 text-[#034d79] border-[#046ca9]/20' },
    ledgers: { border: 'border-[#e79237]/25', bg: 'bg-[#e79237]/10', icon: 'text-[#c47920]', badge: 'bg-[#e79237]/15 text-[#9a5a14] border-[#e79237]/25' },
    journals: { border: 'border-[#e79237]/25', bg: 'bg-[#e79237]/10', icon: 'text-[#c47920]', badge: 'bg-[#e79237]/15 text-[#9a5a14] border-[#e79237]/25' },
    expenses: { border: 'border-red-200', bg: 'bg-red-50', icon: 'text-red-600', badge: 'bg-red-100 text-red-700 border-red-200' },
    reports: { border: 'border-slate-200', bg: 'bg-slate-50', icon: 'text-slate-600', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
    barcode: { border: 'border-gray-200', bg: 'bg-gray-50', icon: 'text-gray-600', badge: 'bg-gray-100 text-gray-700 border-gray-200' },
    qrcode: { border: 'border-gray-200', bg: 'bg-gray-50', icon: 'text-gray-600', badge: 'bg-gray-100 text-gray-700 border-gray-200' },
    'payment-methods': { border: 'border-[#046ca9]/20', bg: 'bg-[#046ca9]/5', icon: 'text-[#046ca9]', badge: 'bg-[#046ca9]/10 text-[#034d79] border-[#046ca9]/20' },
    notifications: { border: 'border-[#046ca9]/20', bg: 'bg-[#046ca9]/5', icon: 'text-[#046ca9]', badge: 'bg-[#046ca9]/10 text-[#034d79] border-[#046ca9]/20' },
    feedbacks: { border: 'border-[#e79237]/25', bg: 'bg-[#e79237]/10', icon: 'text-[#c47920]', badge: 'bg-[#e79237]/15 text-[#9a5a14] border-[#e79237]/25' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns human-readable action label for a permission name like "products.edit" */
export function getActionLabel(permissionName: string): string {
    const action = permissionName.split('.').slice(1).join('.'); // everything after first dot
    return ACTION_LABELS[action] || capitalize(action.replace(/[_-]/g, ' '));
}

/** Returns human-readable module label for a permission name like "products.edit" */
export function getCategoryLabel(permissionName: string): string {
    const category = permissionName.split('.')[0];
    return CATEGORY_LABELS[category] || capitalize(category.replace(/[_-]/g, ' '));
}

/** Returns sidebar menu labels for a given permission name */
export function getSidebarMenus(permissionName: string): string[] {
    return PERMISSION_MENU_MAP[permissionName] || [];
}

/** Returns theme colors for a category */
export function getCategoryColors(category: string) {
    return (
        CATEGORY_COLORS[category] || {
            border: 'border-gray-200',
            bg: 'bg-gray-50',
            icon: 'text-gray-600',
            badge: 'bg-gray-100 text-gray-700 border-gray-200',
        }
    );
}

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
