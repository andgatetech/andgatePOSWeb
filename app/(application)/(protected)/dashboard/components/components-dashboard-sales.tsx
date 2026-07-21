'use client';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { RootState } from '@/store';
import { SIMPLIFICATION_FLAGS } from '@/lib/simplification-flags';
import { useGetDashboardLayoutQuery } from '@/store/features/analytics/analyticsApi';
import { useGetDashboardOnboardingQuery } from '@/store/features/dashboard/dashboad';
import { AlertTriangle, BarChart3, Coins, PackageSearch, Rocket } from 'lucide-react';
import ManualPaymentsPage from '../../manual-payments/page';
import AlertStrip from './AlertStrip';
import Analytics from './Analytics';
import BusinessHealthScore from './BusinessHealthScore';
import CashPositionWidget from './CashPositionWidget';
import CustomerDueSnapshot from './CustomerDueSnapshot';
import DashboardSections from './DashboardSections';
import DeadStockWidget from './DeadStockWidget';
import OnboardingChecklist from './OnboardingChecklist';
import ProfitExpenseWidget from './ProfitExpenseWidget';
import QuickActions from './QuickActions';
import SectionFour from './SectionFour';
import SectionsFive from './SectionsFive';
import SubscriptionPaymentStatus from './SubscriptionPaymentStatus';
import Summary from './Summary';
import SupplierDueWidget from './SupplierDueWidget';
import TopCustomers from './TopCustomers';

// Business-owner priority sequence: setup/urgent → today's pulse → money →
// stock/sales → deeper insight. Keep in sync with DashboardLayoutController::DEFAULT_WIDGETS
// (backend) and store/dashboard-widgets/page.tsx.
const DEFAULT_WIDGETS = [
    { key: 'onboarding', visible: true, order: 1, cols: 12 },
    { key: 'alerts', visible: true, order: 2, cols: 12 },
    { key: 'summary', visible: true, order: 3, cols: 12 },
    { key: 'quick_actions', visible: true, order: 4, cols: 12 },
    { key: 'cash_position', visible: true, order: 5, cols: 12 },
    { key: 'business_health', visible: true, order: 6, cols: 12 },
    { key: 'customer_due', visible: true, order: 7, cols: 12 },
    { key: 'supplier_due', visible: true, order: 8, cols: 12 },
    { key: 'section_four', visible: true, order: 9, cols: 12 },
    { key: 'profit_expense', visible: true, order: 10, cols: 12 },
    { key: 'sections', visible: true, order: 11, cols: 12 },
    { key: 'dead_stock', visible: true, order: 12, cols: 12 },
    { key: 'analytics', visible: true, order: 13, cols: 12 },
    { key: 'section_five', visible: true, order: 14, cols: 9 },
    { key: 'top_customers', visible: true, order: 15, cols: 3 },
    { key: 'subscription', visible: true, order: 16, cols: 12 },
];

const DASHBOARD_WIDGETS_BY_EXPERIENCE: Record<string, string[]> = {
    cashier: ['onboarding', 'alerts', 'summary', 'quick_actions', 'cash_position', 'customer_due', 'sections', 'section_four'],
    accountant: ['onboarding', 'alerts', 'summary', 'cash_position', 'customer_due', 'supplier_due', 'section_four', 'profit_expense'],
    manager: ['onboarding', 'alerts', 'summary', 'quick_actions', 'cash_position', 'business_health', 'customer_due', 'supplier_due', 'sections', 'dead_stock', 'section_five', 'top_customers'],
    owner: DEFAULT_WIDGETS.map((widget) => widget.key),
};

const DASHBOARD_GROUPS = [
    {
        key: 'start',
        titleKey: 'dashboard_group_start_title',
        descKey: 'dashboard_group_start_desc',
        icon: Rocket,
        widgets: ['onboarding', 'alerts'],
    },
    {
        key: 'today',
        titleKey: 'dashboard_group_today_title',
        descKey: 'dashboard_group_today_desc',
        icon: AlertTriangle,
        widgets: ['summary', 'quick_actions', 'cash_position', 'business_health'],
    },
    {
        key: 'money',
        titleKey: 'dashboard_group_money_title',
        descKey: 'dashboard_group_money_desc',
        icon: Coins,
        widgets: ['customer_due', 'supplier_due', 'section_four', 'profit_expense'],
    },
    {
        key: 'stock',
        titleKey: 'dashboard_group_stock_title',
        descKey: 'dashboard_group_stock_desc',
        icon: PackageSearch,
        widgets: ['sections', 'dead_stock'],
    },
    {
        key: 'insight',
        titleKey: 'dashboard_group_insight_title',
        descKey: 'dashboard_group_insight_desc',
        icon: BarChart3,
        widgets: ['analytics', 'section_five', 'top_customers', 'subscription'],
    },
];

function resolveDashboardExperience(user: any): keyof typeof DASHBOARD_WIDGETS_BY_EXPERIENCE {
    if (user?.role === 'business_admin') return 'owner';

    const permissions = new Set(user?.permissions || []);
    const hasAccounting = ['accounting.accounts.index', 'accounting.cash-book.index', 'accounting.journals.index', 'accounting.reports.view', 'reports.profit-loss'].some((permission) => permissions.has(permission));
    const hasManagerOps = ['products.index', 'purchase-orders.index', 'expenses.index', 'reports.purchase', 'stock.adjustments'].some((permission) => permissions.has(permission));
    const hasCashierOps = permissions.has('orders.create') || permissions.has('orders.index');

    if (hasAccounting && !hasManagerOps) return 'accountant';
    if (hasManagerOps) return 'manager';
    if (hasCashierOps) return 'cashier';

    return 'owner';
}

const widgetComponents: Record<string, React.ReactNode> = {
    business_health: <BusinessHealthScore />,
    quick_actions: <QuickActions />,
    onboarding: <OnboardingChecklist />,
    subscription: (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <SubscriptionPaymentStatus />
        </div>
    ),
    summary: <Summary />,
    alerts: <AlertStrip />,
    customer_due: <CustomerDueSnapshot />,
    supplier_due: <SupplierDueWidget />,
    cash_position: <CashPositionWidget />,
    analytics: <Analytics />,
    sections: <DashboardSections />,
    dead_stock: <DeadStockWidget />,
    section_four: <SectionFour />,
    profit_expense: <ProfitExpenseWidget />,
    section_five: <SectionsFive />,
    top_customers: <TopCustomers />,
};

const ComponentsDashboardSales = () => {
    const { t } = getTranslation();
    const { currentStore, currentStoreId } = useCurrentStore();
    const user = useSelector((state: RootState) => state.auth.user);
    const subscription = user?.subscription_user;
    const subscriptionExpired = !subscription || ['expired', 'blocked', 'hold'].includes(String(subscription.status || '').toLowerCase());

    const canCustomize = user?.permissions?.includes('analytics.dashboard_widgets') ?? false;

    const { data: layoutData } = useGetDashboardLayoutQuery(
        currentStoreId ? { store_id: currentStoreId } : {},
        { skip: !canCustomize }
    );
    const { data: onboardingData } = useGetDashboardOnboardingQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    ) as { data?: { data?: { is_complete?: boolean } } };
    const onboardingComplete = Boolean(onboardingData?.data?.is_complete);

    const widgets = useMemo(() => {
        const saved = layoutData?.data?.layout?.widgets;
        const experience = SIMPLIFICATION_FLAGS.roleDashboard ? resolveDashboardExperience(user) : 'owner';
        const allowedKeys = new Set(DASHBOARD_WIDGETS_BY_EXPERIENCE[experience]);
        const roleDefaults = DEFAULT_WIDGETS.filter((widget) => allowedKeys.has(widget.key));

        if (canCustomize && saved?.length) {
            // Backfill any widget key missing from an older saved layout (e.g. saved
            // before a widget existed) so it doesn't silently disappear — same fix as
            // store/dashboard-widgets/page.tsx.
            const savedKeys = new Set(saved.map((w: any) => w.key));
            const missing = roleDefaults.filter((w) => !savedKeys.has(w.key));
            return [...saved, ...missing].filter((w: any) => allowedKeys.has(w.key));
        }
        return roleDefaults;
    }, [layoutData, canCustomize, user]);

    if (subscriptionExpired) {
        return <ManualPaymentsPage />;
    }

    const visibleWidgets = widgets
        .filter((w: any) => w.visible !== false)
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    const renderWidget = (widget: any) => {
        const component = widgetComponents[widget.key];
        if (!component) return null;

        if (widget.key === 'section_five' || widget.key === 'top_customers') {
            return null;
        }

        return (
            <div key={widget.key} className={widget.cols === 6 ? 'lg:w-1/2' : 'w-full'}>
                {component}
            </div>
        );
    };

    return (
        <div className="space-y-7">
            {/* ── HEADER ── */}
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                        {t('dashboard_welcome_back')}, {user?.name || t('lbl_user')}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {currentStore?.store_name || t('lbl_store')} &middot; {t('dashboard_store_activity')} {t('lbl_today')}
                    </p>
                </div>
            </div>

            {DASHBOARD_GROUPS.map((group) => {
                if (group.key === 'start' && onboardingComplete) return null;

                const groupWidgets = visibleWidgets.filter((widget: any) => group.widgets.includes(widget.key));
                if (groupWidgets.length === 0) return null;
                const Icon = group.icon;

                return (
                    <section key={group.key} className="space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                                <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="text-base font-bold text-gray-900 dark:text-white">{t(group.titleKey)}</h2>
                                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{t(group.descKey)}</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {groupWidgets.map(renderWidget)}

                            {groupWidgets.some((w: any) => w.key === 'section_five' || w.key === 'top_customers') && (
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                                    {groupWidgets.find((w: any) => w.key === 'section_five')?.visible !== false && (
                                        <div className="lg:col-span-3">
                                            <SectionsFive />
                                        </div>
                                    )}
                                    {groupWidgets.find((w: any) => w.key === 'top_customers')?.visible !== false && (
                                        <div className="lg:col-span-1">
                                            <TopCustomers />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};

export default ComponentsDashboardSales;
