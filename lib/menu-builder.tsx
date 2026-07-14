// lib/menu-builder.tsx
import {
    BarChart,
    BarChart3,
    Bell,
    BookOpen,
    BrainCircuit,
    BriefcaseBusiness,
    CalendarCheck,
    FileText,
    Home,
    Layers,
    MessagesSquare,
    Package,
    Receipt,
    Settings,
    Shield,
    ShoppingBag,
    ShoppingCart,
    Tag,
    Truck,
    Users,
} from 'lucide-react';
import React from 'react';
import { SIMPLIFICATION_FLAGS } from './simplification-flags';

export interface MenuItem {
    label: string;
    icon?: React.ReactNode;
    href?: string;
    subMenu?: MenuItem[];
    requiredPermissions?: string[]; // RBAC check (role/permission grant)
    /**
     * Subscription-tier check — a specific Feature-catalog slug that must be in the
     * account's plan. Falls back to requiredPermissions if unset. Kept separate from
     * requiredPermissions because that field also drives the RBAC check: a slug like
     * 'ecommerce.manage' may never exist as an assignable RBAC permission, so reusing
     * it there would hide the item from every staff member regardless of plan tier.
     */
    requiredFeature?: string;
    lockedByFeature?: string;
    allowedRoles?: string[];
    ownerOnly?: boolean; // true = only visible to subscription owner (business_admin role)
    sectionBreak?: boolean; // true = render a visual divider above this item
}

const cloneMenuItem = (item: MenuItem): MenuItem => ({
    ...item,
    subMenu: item.subMenu?.map(cloneMenuItem),
});

const flattenLeafItems = (items: MenuItem[] = []): MenuItem[] => {
    const leaves: MenuItem[] = [];

    items.forEach((item) => {
        if (item.href) {
            leaves.push({ ...item, subMenu: undefined });
        }
        if (item.subMenu?.length) {
            leaves.push(...flattenLeafItems(item.subMenu));
        }
    });

    return leaves;
};

const uniqueMenuItems = (items: MenuItem[]): MenuItem[] => {
    const seen = new Set<string>();
    return items.filter((item) => {
        const key = item.href || item.label;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const compactGroup = (label: string, icon: React.ReactNode, items: MenuItem[]): MenuItem | null => {
    const subMenu = uniqueMenuItems(items.filter(Boolean).map(cloneMenuItem));
    if (subMenu.length === 0) return null;
    return { label, icon, subMenu };
};

const nestedGroup = (label: string, items: MenuItem[]): MenuItem | null => {
    const subMenu = uniqueMenuItems(items.filter(Boolean).map(cloneMenuItem));
    if (subMenu.length === 0) return null;
    return { label, subMenu };
};

const findMenu = (items: MenuItem[], label: string): MenuItem | undefined => items.find((item) => item.label === label);

const leavesFrom = (items: MenuItem[], labels: string[]): MenuItem[] => labels.flatMap((label) => {
    const item = findMenu(items, label);
    return item ? flattenLeafItems([item]) : [];
});

/**
 * Shopkeeper-first navigation. RBAC and package filtering happen before this
 * grouping, so this layer only reduces cognitive load; it does not grant access.
 */
function simplifyMenuForDailyUse(items: MenuItem[], userRole?: string): MenuItem[] {
    const isOwner = userRole === 'business_admin';
    const result: MenuItem[] = [];

    const dashboard = findMenu(items, 'Dashboard');
    const onboarding = findMenu(items, 'Getting Started');
    const notifications = findMenu(items, 'Notifications');
    const pos = findMenu(items, 'POS');
    const orders = findMenu(items, 'Orders');
    const operations = findMenu(items, 'operations_title');
    const accounting = findMenu(items, 'Accounting');
    const reports = findMenu(items, 'Report');
    const analytics = findMenu(items, 'Analytics & BI');
    const hr = findMenu(items, 'hr_title');
    const store = findMenu(items, 'Store');
    const ecommerce = findMenu(items, 'Ecommerce Management');
    const feedback = findMenu(items, 'Feedback');
    const administration = findMenu(items, 'Administration');
    const businessOs = findMenu(items, 'business_os_title');

    if (dashboard) result.push(cloneMenuItem(dashboard));
    if (onboarding) result.push(cloneMenuItem(onboarding));
    if (pos) result.push({ ...cloneMenuItem(pos), label: 'Sell' });
    if (orders) result.push(cloneMenuItem(orders));

    const productLeaves = leavesFrom(items, ['Product']);
    const productCoreHrefs = new Set(['/products/create', '/products']);
    const productGroup = nestedGroup('Products', productLeaves.filter((item) => item.href && productCoreHrefs.has(item.href)));
    const stockGroup = nestedGroup('Stock', productLeaves.filter((item) => !item.href || !productCoreHrefs.has(item.href)));
    const categoryGroup = nestedGroup('Category', leavesFrom(items, ['Category']));
    const brandGroup = nestedGroup('Brand', leavesFrom(items, ['Brand']));
    const productsAndStock = compactGroup('Products & Stock', React.createElement(Package), [
        ...(productGroup ? [productGroup] : []),
        ...(stockGroup ? [stockGroup] : []),
        ...(categoryGroup ? [categoryGroup] : []),
        ...(brandGroup ? [brandGroup] : []),
    ]);
    if (productsAndStock) result.push(productsAndStock);

    const purchases = findMenu(items, 'Purchases Order');
    if (purchases) {
        result.push({
            label: 'Purchases',
            icon: React.createElement(ShoppingCart),
            subMenu: flattenLeafItems([purchases]),
        });
    }

    const customers = compactGroup('Customers', React.createElement(Users), leavesFrom(items, ['Customer']));
    const suppliers = compactGroup('Suppliers', React.createElement(Truck), leavesFrom(items, ['Supplier']));
    if (customers) result.push(customers);
    if (suppliers) result.push(suppliers);

    const expensesGroup = nestedGroup('Expenses', leavesFrom(items, ['Expenses']));
    const cashOperationsGroup = nestedGroup('Cash & Operations', operations ? flattenLeafItems([operations]) : []);
    const accountingGroup = isOwner && accounting
        ? nestedGroup('Accounting', flattenLeafItems([accounting]).filter((item) => item.href !== '/accounting/running-business-migration'))
        : null;
    const money = compactGroup('Money', React.createElement(Receipt), [
        ...(expensesGroup ? [expensesGroup] : []),
        ...(cashOperationsGroup ? [cashOperationsGroup] : []),
        ...(accountingGroup ? [accountingGroup] : []),
    ]);
    if (money) result.push(money);

    if (reports) {
        const reportLeaves = flattenLeafItems([reports]);
        const everydayReportHrefs = new Set([
            '/reports/business-overview',
            '/reports/sales',
            '/reports/customer-due',
            '/reports/supplier-due',
            '/reports/stock',
            '/reports/low-stock',
            '/reports/profit-loss',
            '/reports/expense',
        ]);
        const everydayReports = reportLeaves.filter((item) => item.href && everydayReportHrefs.has(item.href));
        const advancedReports = reportLeaves.filter((item) => !item.href || !everydayReportHrefs.has(item.href));
        const reportGroup = compactGroup('Reports', React.createElement(BarChart), [
            ...everydayReports,
            ...(isOwner && advancedReports.length ? [{ label: 'Advanced Reports', icon: React.createElement(BarChart3), subMenu: uniqueMenuItems(advancedReports) }] : []),
            ...(isOwner && analytics ? [{ ...cloneMenuItem(analytics), label: 'Analytics & BI' }] : []),
        ]);
        if (reportGroup) result.push({ ...reportGroup, href: '/reports' });
    }

    const team = compactGroup('Team', React.createElement(Users), [
        ...(hr ? flattenLeafItems([hr]) : []),
    ]);
    if (team) result.push(team);

    if (ecommerce) {
        result.push({ ...cloneMenuItem(ecommerce), label: 'Online Store' });
    }

    const storeSetupGroup = nestedGroup('Store Setup', store ? flattenLeafItems([store]) : []);
    const supportGroup = nestedGroup('Support', [
        ...(notifications ? [notifications] : []),
        ...(feedback ? flattenLeafItems([feedback]) : []),
    ]);
    const adminGroup = isOwner ? nestedGroup('Administration', administration ? flattenLeafItems([administration]) : []) : null;
    const settings = compactGroup('Settings', React.createElement(Settings), [
        ...(storeSetupGroup ? [storeSetupGroup] : []),
        ...(supportGroup ? [supportGroup] : []),
        ...(adminGroup ? [adminGroup] : []),
        ...(isOwner && businessOs ? [businessOs] : []),
    ]);
    if (settings) result.push(settings);

    return result;
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
    },
    {
        label: 'Getting Started',
        icon: React.createElement(BookOpen),
        href: '/onboarding',
    },
    {
        label: 'business_os_title',
        icon: React.createElement(BriefcaseBusiness),
        href: '/business-os',
        requiredPermissions: ['business-os.view', 'orders.index', 'reports.sales', 'expenses.index'],
    },
    {
        label: 'Notifications',
        icon: React.createElement(Bell),
        href: '/notifications',
        requiredPermissions: ['notifications.index'],
    },
    {
        label: 'POS',
        icon: React.createElement(ShoppingCart),
        requiredPermissions: ['orders.create'],
        subMenu: [
            {
                label: 'Terminal',
                href: '/pos',
                requiredPermissions: ['orders.create'],
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
            {
                label: 'Coupons',
                href: '/coupons',
                requiredPermissions: ['orders.view'],
            },
        ],
    },
    {
        label: 'Product',
        icon: React.createElement(Package),
        requiredPermissions: ['products.index', 'stock-transfer.view', 'stock-transfer.manage'],
        allowedRoles: ['business_admin'],
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
                label: 'Stock Count',
                href: '/products/stock/counts',
                requiredPermissions: ['stock.adjustments'],
            },
            {
                label: 'transfer_title',
                href: '/stock-transfers',
                requiredPermissions: ['stock-transfer.view', 'stock-transfer.manage'],
                allowedRoles: ['business_admin'],
            },
            {
                label: 'Bulk Upload',
                href: '/products/bulk',
                requiredPermissions: ['products.bulk-upload'],
            },
            {
                label: 'Stock Thresholds',
                href: '/products/thresholds',
                requiredPermissions: ['products.index'],
            },
            {
                label: 'Print Label',
                href: '/label',
                requiredPermissions: ['barcode.generate'],
            },
        ],
    },
    {
        label: 'Category',
        icon: React.createElement(Layers),
        requiredPermissions: ['categories.index'],
        subMenu: [
            {
                label: 'Add Category',
                href: '/category/create',
                requiredPermissions: ['categories.create'],
            },
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
                label: 'Add Brand',
                href: '/brand/create',
                requiredPermissions: ['brands.create'],
            },
            {
                label: 'Brand List',
                href: '/brand',
                requiredPermissions: ['brands.index'],
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
            {
                label: 'Supplier Due',
                href: '/suppliers/due',
                requiredPermissions: ['reports.purchase'],
            },
        ],
    },
    {
        label: 'Customer',
        icon: React.createElement(Users),
        requiredPermissions: ['customers.index'],
        subMenu: [
            {
                label: 'crm_dashboard_title',
                href: '/customers/crm',
                requiredPermissions: ['customers.index'],
            },
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
            {
                label: 'Customer Due',
                href: '/customers/due',
                requiredPermissions: ['reports.sales'],
            },
        ],
    },
    {
        label: 'Expenses',
        icon: React.createElement(Receipt),
        requiredPermissions: ['expenses.index'],
        subMenu: [
            {
                label: 'Add Expense',
                href: '/expenses/create',
                requiredPermissions: ['expenses.create'],
            },
            {
                label: 'Expense List',
                href: '/expenses/expense-list',
                requiredPermissions: ['expenses.index'],
            },
        ],
    },
    {
        label: 'operations_title',
        icon: React.createElement(Receipt),
        requiredPermissions: [
            'cash-closing.create',
            'cash-closing.view',
            'orders.index',
            'orders.create',
            'petty-cash.create',
            'petty-cash.view',
            'expenses.index',
            'service-jobs.view',
            'service-jobs.create',
            'products.index',
        ],
        subMenu: [
            {
                label: 'cash_closing_title',
                href: '/cash-closing',
                requiredPermissions: ['cash-closing.create', 'cash-closing.view', 'orders.index', 'orders.create'],
            },
            {
                label: 'cash_drawer_history_title',
                href: '/cash-drawer/history',
                requiredPermissions: ['cash-drawer.view', 'reports.sales'],
            },
            {
                label: 'petty_cash_title',
                href: '/petty-cash',
                requiredPermissions: ['petty-cash.create', 'petty-cash.view', 'expenses.index', 'expenses.create'],
            },
            {
                label: 'service_jobs_title',
                href: '/service-jobs',
                requiredPermissions: ['service-jobs.view', 'service-jobs.create', 'orders.index', 'products.index'],
            },
        ],
    },
    {
        label: 'Accounting',
        icon: React.createElement(BookOpen),
        requiredPermissions: ['accounting.accounts.index', 'accounting.journals.index', 'accounting.cash-book.index', 'accounting.income.index', 'accounting.reports.view', 'accounting.opening-balances.view'],
        subMenu: [
            {
                label: 'rbm_title',
                href: '/accounting/running-business-migration',
                requiredPermissions: ['accounting.opening-balances.view'],
            },
            {
                label: 'Bank Accounts',
                href: '/accounting/bank-accounts',
                requiredPermissions: ['accounting.accounts.index'],
            },
            {
                label: 'Cash Book',
                href: '/accounting/cash-book',
                requiredPermissions: ['accounting.cash-book.index'],
            },
            {
                label: 'Income',
                href: '/accounting/income',
                requiredPermissions: ['accounting.income.index'],
            },
            {
                label: 'Journal Ledger',
                href: '/accounting/journals',
                requiredPermissions: ['accounting.journals.index'],
            },
            {
                label: 'Profit & Loss',
                href: '/accounting/profit-loss',
                requiredPermissions: ['accounting.reports.view'],
            },
            {
                label: 'Balance Sheet',
                href: '/accounting/balance-sheet',
                requiredPermissions: ['accounting.reports.view'],
            },
            {
                label: 'Trial Balance',
                href: '/accounting/trial-balance',
                requiredPermissions: ['accounting.reports.view'],
            },
            {
                label: 'Cash Flow',
                href: '/accounting/cash-flow',
                requiredPermissions: ['accounting.reports.view'],
            },
            {
                label: 'Chart of Accounts',
                href: '/accounting/chart-of-accounts',
                requiredPermissions: ['accounting.accounts.index'],
            },
        ],
    },
    {
        label: 'Report',
        icon: React.createElement(BarChart),
        requiredPermissions: [
            'reports.sales',
            'reports.expense',
            'reports.profit-loss',
            'reports.tax',
            'reports.transaction',
            'reports.purchase',
            'reports.purchase-transaction',
            'reports.inventory',
            'reports.low-stock',
            'stock.reports',
            'fiscal.compliance.view',
        ],
        subMenu: [
            // Sales & Revenue Reports
            {
                label: 'Sales & Revenue',
                requiredPermissions: ['reports.sales', 'reports.transaction'],
                subMenu: [
                    { label: 'Business Overview', href: '/reports/business-overview', requiredPermissions: ['reports.sales', 'reports.profit-loss'], requiredFeature: 'reports.profit-loss' },
                    { label: 'Sales Report', href: '/reports/sales', requiredPermissions: ['reports.sales'], requiredFeature: 'reports.sales' },
                    { label: 'Order Returns', href: '/reports/order-returns', requiredPermissions: ['reports.order-returns'], requiredFeature: 'reports.order-returns' },
                    { label: 'Transactions', href: '/reports/transaction', requiredPermissions: ['reports.transaction'], requiredFeature: 'reports.transaction' },
                    { label: 'Payment Mode Summary', href: '/reports/payment-summary', requiredPermissions: ['reports.transaction'], requiredFeature: 'reports.transaction' },
                    { label: 'Employee Sales', href: '/reports/employee-sales', requiredPermissions: ['reports.operations.employee-sales'], requiredFeature: 'reports.operations.employee-sales' },
                    { label: 'Discount Report', href: '/reports/discount', requiredPermissions: ['reports.operations.discount'], requiredFeature: 'reports.operations.discount' },
                    { label: 'Invoices', href: '/reports/invoice', requiredPermissions: ['reports.invoice'], requiredFeature: 'reports.invoice' },
                    { label: 'Sales Items', href: '/reports/sales-items', requiredPermissions: ['reports.sales-items'], requiredFeature: 'reports.sales-items' },
                ],
            },
            {
                label: 'lbl_fiscal_compliance',
                requiredPermissions: ['fiscal.compliance.view'],
                subMenu: [{ label: 'lbl_compliance_center', href: '/fiscal-compliance', requiredPermissions: ['fiscal.compliance.view'] }],
            },
            // Customer Reports
            {
                label: 'Customer Reports',
                requiredPermissions: ['reports.sales'],
                subMenu: [
                    { label: 'Customer Report', href: '/reports/customer', requiredPermissions: ['reports.customer'], requiredFeature: 'reports.customer' },
                    { label: 'Customer Due', href: '/reports/customer-due', requiredPermissions: ['reports.customer-due'], requiredFeature: 'reports.customer-due' },
                    {
                        label: 'Customer Statement',
                        href: '/reports/customer-statement',
                        requiredPermissions: ['reports.operations.customer-statement'],
                        requiredFeature: 'reports.operations.customer-statement',
                    },
                ],
            },
            // Purchase & Supplier Reports
            {
                label: 'Purchase & Supplier',
                requiredPermissions: ['reports.purchase'],
                subMenu: [
                    { label: 'Purchase Report', href: '/reports/purchase', requiredPermissions: ['reports.purchase'], requiredFeature: 'reports.purchase' },
                    { label: 'Purchase Items', href: '/reports/purchase-items', requiredPermissions: ['reports.purchase'], requiredFeature: 'reports.purchase' },
                    { label: 'Purchase Transactions', href: '/reports/purchase-transaction', requiredPermissions: ['reports.purchase-transaction'], requiredFeature: 'reports.purchase-transaction' },
                    { label: 'Supplier Report', href: '/reports/supplier', requiredPermissions: ['reports.purchase'], requiredFeature: 'reports.purchase' },
                    { label: 'Supplier Dues', href: '/reports/supplier-due', requiredPermissions: ['reports.purchase'], requiredFeature: 'reports.purchase' },
                    { label: 'Supplier Statement', href: '/reports/supplier-statement', requiredPermissions: ['reports.purchase'], requiredFeature: 'reports.purchase' },
                ],
            },
            // Inventory Reports
            {
                label: 'Inventory Reports',
                requiredPermissions: ['stock.reports', 'stock.adjustments', 'reports.inventory', 'reports.low-stock'],
                subMenu: [
                    { label: 'Stock Report', href: '/reports/stock', requiredPermissions: ['stock.reports'], requiredFeature: 'stock.reports' },
                    { label: 'Low Stock', href: '/reports/low-stock', requiredPermissions: ['reports.low-stock'], requiredFeature: 'reports.low-stock' },
                    {
                        label: 'Threshold Intelligence',
                        href: '/reports/threshold-intelligence',
                        requiredPermissions: ['reports.threshold-intelligence'],
                        requiredFeature: 'reports.threshold-intelligence',
                    },
                    { label: 'Stock Movement Ledger', href: '/reports/stock-movement', requiredPermissions: ['stock.reports'], requiredFeature: 'stock.reports' },
                    { label: 'Transfer Ledger', href: '/reports/transfer-ledger', requiredPermissions: ['stock.reports'], requiredFeature: 'stock.reports' },
                    { label: 'Idle Products', href: '/reports/idle-product', requiredPermissions: ['reports.inventory'], requiredFeature: 'reports.inventory' },
                    { label: 'Adjustments', href: '/reports/adjustment', requiredPermissions: ['stock.adjustments'], requiredFeature: 'stock.adjustments' },
                    { label: 'Product Report', href: '/reports/product', requiredPermissions: ['reports.inventory'], requiredFeature: 'reports.inventory' },
                ],
            },
            // Financial Reports
            {
                label: 'Financial Reports',
                requiredPermissions: ['reports.profit-loss', 'reports.expense', 'reports.tax', 'reports.sales'],
                subMenu: [
                    { label: 'Profit & Loss', href: '/reports/profit-loss', requiredPermissions: ['reports.profit-loss'], requiredFeature: 'reports.profit-loss' },
                    { label: 'Expense Report', href: '/reports/expense', requiredPermissions: ['reports.expense'], requiredFeature: 'reports.expense' },
                    { label: 'Tax Report', href: '/reports/tax', requiredPermissions: ['reports.tax'], requiredFeature: 'reports.tax' },
                    { label: 'Cash Closing Report', href: '/reports/cash-closing', requiredPermissions: ['reports.operations.cash-closing'], requiredFeature: 'reports.operations.cash-closing' },
                    { label: 'Audit Activity', href: '/reports/audit-activity', requiredPermissions: ['reports.operations.audit-activity'], requiredFeature: 'reports.operations.audit-activity' },
                ],
            },
            // AI Insights
            {
                label: 'AI Insights',
                icon: React.createElement(BrainCircuit),
                requiredPermissions: ['reports.sales'],
                subMenu: [
                    { label: 'Reorder Suggestions', href: '/reports/reorder-suggestions', requiredPermissions: ['reports.reorder-suggestions'], requiredFeature: 'reports.reorder-suggestions' },
                    { label: 'Anomaly Detection', href: '/reports/anomalies', requiredPermissions: ['reports.anomalies'], requiredFeature: 'reports.anomalies' },
                    { label: 'Demand Forecast', href: '/reports/demand-forecast', requiredPermissions: ['reports.demand-forecast'], requiredFeature: 'reports.demand-forecast' },
                    { label: 'Smart Summary', href: '/reports/smart-summary', requiredPermissions: ['reports.summary'], requiredFeature: 'reports.summary' },
                ],
            },
        ],
    },
    {
        label: 'Analytics & BI',
        icon: React.createElement(BarChart3),
        requiredPermissions: [
            'analytics.custom_reports',
            'analytics.scheduled_reports',
            'analytics.dashboard_widgets',
            'analytics.sales_tv',
            'analytics.branch_benchmark',
            'analytics.cashflow_forecast',
            'analytics.breakeven',
        ],
        subMenu: [
            {
                label: 'Custom Reports',
                href: '/analytics/custom-reports',
                requiredPermissions: ['analytics.custom_reports'],
                requiredFeature: 'analytics.custom_reports',
            },
            {
                label: 'Scheduled Reports',
                href: '/analytics/scheduled-reports',
                requiredPermissions: ['analytics.scheduled_reports'],
                requiredFeature: 'analytics.scheduled_reports',
            },
            {
                label: 'Dashboard Widgets',
                href: '/analytics/dashboard-widgets',
                requiredPermissions: ['analytics.dashboard_widgets'],
                requiredFeature: 'analytics.dashboard_widgets',
            },
            {
                label: 'Sales TV',
                href: '/analytics/sales-tv',
                requiredPermissions: ['analytics.sales_tv'],
                requiredFeature: 'analytics.sales_tv',
            },
            {
                label: 'Branch Benchmarking',
                href: '/analytics/branch-benchmarking',
                requiredPermissions: ['analytics.branch_benchmark'],
                requiredFeature: 'analytics.branch_benchmark',
            },
            {
                label: 'Cash-flow Forecast',
                href: '/analytics/cash-flow-forecast',
                requiredPermissions: ['analytics.cashflow_forecast'],
                requiredFeature: 'analytics.cashflow_forecast',
            },
            {
                label: 'Break-even Analysis',
                href: '/analytics/break-even',
                requiredPermissions: ['analytics.breakeven'],
                requiredFeature: 'analytics.breakeven',
            },
        ],
    },
    {
        label: 'hr_title',
        icon: React.createElement(CalendarCheck),
        requiredPermissions: ['hr.attendance.create', 'hr.attendance.view', 'users.view'],
        subMenu: [
            {
                label: 'hr_attendance_title',
                href: '/hr/attendance',
                requiredPermissions: ['hr.attendance.create', 'hr.attendance.view', 'users.view'],
            },
            {
                label: 'payroll_title',
                href: '/hr/payroll',
                requiredPermissions: ['hr.payroll.view', 'hr.payroll.manage'],
            },
            {
                label: 'advance_title',
                href: '/hr/salary-advance',
                requiredPermissions: ['hr.advance.view', 'hr.advance.create', 'hr.advance.approve'],
            },
            {
                label: 'bonus_title',
                href: '/hr/festival-bonus',
                requiredPermissions: ['hr.bonus.view', 'hr.bonus.manage'],
            },
            {
                label: 'leave_title',
                href: '/hr/leave',
                requiredPermissions: ['hr.leave.view', 'hr.leave.create', 'hr.leave.approve', 'hr.holiday.view', 'hr.holiday.manage'],
            },
            {
                label: 'shift_title',
                href: '/hr/shifts',
                requiredPermissions: ['hr.shift.view', 'hr.shift.manage'],
            },
            {
                label: 'document_title',
                href: '/hr/documents',
                requiredPermissions: ['hr.documents.view', 'hr.documents.manage'],
            },
            {
                label: 'Employees Management',
                href: '/employees',
                ownerOnly: true,
            },
            {
                label: 'Roles',
                href: '/roles',
                requiredPermissions: ['users.view'],
            },
        ],
    },
    {
        label: 'Store',
        icon: React.createElement(ShoppingBag),
        requiredPermissions: ['stores.view'],
        subMenu: [
            {
                label: 'Add Store',
                href: '/store/create',
                requiredPermissions: ['stores.create'],
            },
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
        ],
    },
    {
        label: 'Ecommerce Management',
        icon: React.createElement(ShoppingBag),
        sectionBreak: true,
        requiredPermissions: ['stores.view', 'orders.index', 'orders.view', 'products.index', 'stores.edit'],
        requiredFeature: 'ecommerce.manage',
        subMenu: [
            {
                label: 'Store Ecommerce Status',
                href: '/ecommerce/stores',
                requiredPermissions: ['stores.view'],
                requiredFeature: 'ecommerce.manage',
            },
            {
                label: 'Ecommerce Orders',
                href: '/ecommerce/orders',
                requiredPermissions: ['orders.index'],
                requiredFeature: 'ecommerce.manage',
            },
            {
                label: 'COD Reconciliation',
                href: '/ecommerce/cod-reconciliation',
                requiredPermissions: ['orders.index'],
                requiredFeature: 'ecommerce.manage',
            },
            {
                label: 'Ecommerce Products',
                href: '/ecommerce/products',
                requiredPermissions: ['products.index'],
                requiredFeature: 'ecommerce.manage',
            },
            {
                label: 'Settings',
                icon: React.createElement(Settings),
                requiredPermissions: ['stores.edit'],
                requiredFeature: 'ecommerce.manage',
                subMenu: [
                    {
                        label: 'Credentials',
                        href: '/ecommerce/setting/credentials',
                        requiredPermissions: ['stores.edit'],
                        requiredFeature: 'ecommerce.manage',
                    },
                    {
                        label: 'Marketing & Pixel',
                        href: '/ecommerce/setting/marketing',
                        requiredPermissions: ['stores.edit'],
                        requiredFeature: 'ecommerce.manage',
                    },
                ],
            },
        ],
    },
    {
        label: 'Feedback',
        icon: React.createElement(MessagesSquare),

        subMenu: [
            {
                label: 'Give Feedback',
                href: '/feedbacks/create-feedback',
                requiredPermissions: ['feedbacks.create'],
            },
            {
                label: 'View Feedback',
                href: '/feedbacks',
                requiredPermissions: ['feedbacks.index'],
            },
        ],
    },
    {
        label: 'Administration',
        icon: React.createElement(Shield),
        sectionBreak: true,
        requiredPermissions: ['users.view', 'stores.view'],
        subMenu: [
            {
                label: 'Audit Logs',
                href: '/audit-logs',
                requiredPermissions: ['stores.view'],
            },
            {
                label: 'Company',
                href: '/company',
                requiredPermissions: ['stores.view'],
            },
            {
                label: 'compliance_calendar_title',
                href: '/compliance-calendar',
                requiredPermissions: ['stores.view'],
            },
            {
                label: 'Package & Payments',
                href: '/manual-payments',
                ownerOnly: true,
            },
            {
                label: 'Data Export',
                href: '/data-export',
                requiredPermissions: ['stores.view'],
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
 * Check if the account's subscription plan includes the item's gated feature.
 * Only gates on requiredFeature when explicitly set — items without one are left
 * to RBAC alone, so an expired/tier-limited subscription doesn't hide the whole
 * menu (SubscriptionGate blocks the actual page content on click instead).
 */
function hasFeatureAccess(accessibleFeatures: string[] | undefined, item: MenuItem): boolean {
    // Falling back to requiredPermissions here used to collapse the whole menu to just
    // "Dashboard" on an expired subscription, since accessibleFeatures comes back [] then.
    if (!item.requiredFeature) {
        return true;
    }

    if (!accessibleFeatures) {
        return true; // Still loading — don't flash an empty menu; RBAC already gates real access
    }

    return accessibleFeatures.includes(item.requiredFeature);
}

/**
 * Recursively filter menu items based on user permissions, role, and subscription tier
 */
function filterMenuItem(item: MenuItem, userPermissions: string[] | undefined, userRole: string | undefined, accessibleFeatures: string[] | undefined): MenuItem | null {
    const isBusinessAdmin = userRole === 'business_admin';

    // ownerOnly items require business_admin role
    if (item.ownerOnly && !isBusinessAdmin) {
        return null;
    }

    const isAllowedRole = !!userRole && !!item.allowedRoles?.includes(userRole);

    // Check if user has permission for this menu item
    if (!isBusinessAdmin && !item.ownerOnly && !isAllowedRole && !hasAnyPermission(userPermissions, item.requiredPermissions)) {
        return null;
    }

    const lockedByFeature = !item.ownerOnly && !hasFeatureAccess(accessibleFeatures, item) ? item.requiredFeature : undefined;

    // If this item has a submenu, filter it recursively
    if (item.subMenu && item.subMenu.length > 0) {
        const filteredSubMenu = item.subMenu.map((subItem) => filterMenuItem(subItem, userPermissions, userRole, accessibleFeatures)).filter((subItem): subItem is MenuItem => subItem !== null);

        // If no submenu items remain after filtering, hide the parent
        if (filteredSubMenu.length === 0) {
            return null;
        }

        return {
            ...item,
            subMenu: filteredSubMenu,
            lockedByFeature,
        };
    }

    return lockedByFeature ? { ...item, lockedByFeature } : item;
}

/**
 * Build menu items based on user permissions, role, and subscription tier
 * @param userPermissions - Array of permission strings from backend
 * @param userRole - User role string (e.g. 'business_admin')
 * @param accessibleFeatures - Feature slugs the account's subscription plan includes
 *   (from GET /api/packages/features). Omit while loading to avoid flashing an
 *   empty menu; once loaded, items outside the plan are filtered out even if RBAC
 *   would otherwise allow them.
 * @returns Filtered menu items array
 */
export function buildMenuFromPermissions(userPermissions: string[] | undefined, userRole?: string, accessibleFeatures?: string[]): MenuItem[] {
    const filteredItems = ALL_MENU_ITEMS
        .map((item) => filterMenuItem(item, userPermissions, userRole, accessibleFeatures))
        .filter((item): item is MenuItem => item !== null);

    return SIMPLIFICATION_FLAGS.simplifiedNavigation ? simplifyMenuForDailyUse(filteredItems, userRole) : filteredItems;
}
