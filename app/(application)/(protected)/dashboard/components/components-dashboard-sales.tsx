'use client';

import { useSelector } from 'react-redux';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { resolveStorageUrl } from '@/lib/image-url';
import { RootState } from '@/store';
import { Store } from 'lucide-react';
import Image from 'next/image';
import AlertStrip from './AlertStrip';
import Analytics from './Analytics';
import CustomerDueSnapshot from './CustomerDueSnapshot';
import DashboardSections from './DashboardSections';
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
                <div className="flex flex-shrink-0 items-center gap-3">
                    {currentStore?.logo_path && (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <Image
                                src={resolveStorageUrl(currentStore.logo_path)}
                                alt={currentStore.store_name}
                                width={48} height={48}
                                className="h-12 w-12 object-contain p-1"
                                unoptimized
                            />
                        </div>
                    )}
                    <div className="hidden overflow-hidden rounded-xl border border-primary/20 bg-white shadow-sm sm:block">
                        <Image
                            src="/images/andgatePOS.jpeg"
                            alt="AndGate POS"
                            width={120} height={40}
                            className="h-12 w-auto object-contain px-3 py-1"
                            style={{ width: 'auto' }}
                            unoptimized
                        />
                    </div>
                </div>
            </div>

            {/* ── 1. KEY METRICS — Business performance at a glance ── */}
            <Summary />

            {/* ── 2. SALES & PURCHASE TRENDS — Visual performance ── */}
            <Analytics />

            {/* ── 3. ALERTS + CUSTOMER DUES — What needs attention ── */}
            <div className="space-y-4">
                <AlertStrip />
                <CustomerDueSnapshot />
            </div>

            {/* ── 4. QUICK ACTIONS ── */}
            <QuickActions />

            {/* ── 5. TOP SELLING / LOW STOCK / RECENT SALES ── */}
            <DashboardSections />

            {/* ── 6. PAYMENT METHODS + RECENT TRANSACTIONS ── */}
            <SectionFour />

            {/* ── 7. PROFIT TREND + EXPENSE BREAKDOWN ── */}
            <ProfitExpenseWidget />

            {/* ── 8. CATEGORIES / BRANDS / PURCHASED + TOP CUSTOMERS ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                <div className="lg:col-span-3">
                    <SectionsFive />
                </div>
                <div className="lg:col-span-1">
                    <TopCustomers />
                </div>
            </div>

            {/* ── 9. SUBSCRIPTION STATUS — Administrative ── */}
            <div className="rounded-xl border border-gray-100 bg-white p-4">
                <SubscriptionPaymentStatus />
            </div>
        </div>
    );
};

export default ComponentsDashboardSales;
