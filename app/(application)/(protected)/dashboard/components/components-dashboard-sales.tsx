'use client';

import { useSelector } from 'react-redux';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { RootState } from '@/store';
import ManualPaymentsPage from '../../manual-payments/page';
import AlertStrip from './AlertStrip';
import Analytics from './Analytics';
import BusinessHealthScore from './BusinessHealthScore';
import CustomerDueSnapshot from './CustomerDueSnapshot';
import DashboardSections from './DashboardSections';
import OnboardingChecklist from './OnboardingChecklist';
import ProfitExpenseWidget from './ProfitExpenseWidget';
import QuickActions from './QuickActions';
import SectionFour from './SectionFour';
import SectionsFive from './SectionsFive';
import SubscriptionPaymentStatus from './SubscriptionPaymentStatus';
import Summary from './Summary';
import TopCustomers from './TopCustomers';

const ComponentsDashboardSales = () => {
    const { t } = getTranslation();
    const { currentStore } = useCurrentStore();
    const user = useSelector((state: RootState) => state.auth.user);
    const subscription = user?.subscription_user;
    const subscriptionExpired = !subscription || ['expired', 'blocked', 'hold'].includes(String(subscription.status || '').toLowerCase());

    if (subscriptionExpired) {
        return <ManualPaymentsPage />;
    }

    return (
        <div className="space-y-6">
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

            {/* ── 1. BUSINESS HEALTH SCORE — At-a-glance AI summary ── */}
            <BusinessHealthScore />

            {/* ── 2. QUICK ACTIONS — Daily operations at your fingertips ── */}
            <QuickActions />

            {/* ── 2. SETUP GUIDE — First-run configuration path ── */}
            <OnboardingChecklist />

            {/* ── 3. SUBSCRIPTION STATUS — Plan & payment ── */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <SubscriptionPaymentStatus />
            </div>

            {/* ── 4. KEY METRICS — Business performance at a glance ── */}
            <Summary />

            {/* ── 5. ALERTS + CUSTOMER DUES — What needs attention ── */}
            <div className="space-y-4">
                <AlertStrip />
                <CustomerDueSnapshot />
            </div>

            {/* ── 6. SALES & PURCHASE TRENDS — Visual performance ── */}
            <Analytics />

            {/* ── 7. TOP SELLING / LOW STOCK / RECENT SALES ── */}
            <DashboardSections />

            {/* ── 8. PAYMENT METHODS + RECENT TRANSACTIONS ── */}
            <SectionFour />

            {/* ── 9. PROFIT TREND + EXPENSE BREAKDOWN ── */}
            <ProfitExpenseWidget />

            {/* ── 10. CATEGORIES / BRANDS / PURCHASED + TOP CUSTOMERS ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                <div className="lg:col-span-3">
                    <SectionsFive />
                </div>
                <div className="lg:col-span-1">
                    <TopCustomers />
                </div>
            </div>
        </div>
    );
};

export default ComponentsDashboardSales;
