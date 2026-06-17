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
    const { currentStoreId, currentStore } = useCurrentStore();
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <div className="space-y-6">
            {/* Header — Brand + Welcome */}
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
                        {t('dashboard_welcome_back')}, {user?.name || t('lbl_user')}
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                        {t('dashboard_store_activity')} {currentStore?.store_name || t('lbl_store')} {t('lbl_today')}
                    </p>
                </div>
                {/* App / Store Branding */}
                <div className="flex flex-shrink-0 items-center gap-3">
                    {currentStore?.logo_path && (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <Image
                                src={resolveStorageUrl(currentStore.logo_path)}
                                alt={currentStore.store_name}
                                width={48}
                                height={48}
                                className="h-12 w-12 object-contain p-1"
                                unoptimized
                            />
                        </div>
                    )}
                    <div className="hidden overflow-hidden rounded-xl border border-[#046ca9]/20 bg-white shadow-sm sm:block">
                        <Image
                            src="/images/andgatePOS.jpeg"
                            alt="AndGate POS"
                            width={120}
                            height={40}
                            className="h-12 w-auto object-contain px-3 py-1"
                            style={{ width: 'auto' }}
                            unoptimized
                        />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <QuickActions />

            <SubscriptionPaymentStatus />

            {/* Alert Strip */}
            <AlertStrip />

            {/* Customer Due Snapshot */}
            <CustomerDueSnapshot />

            {/* Current Store Info */}
            {currentStore && (
                <div className="rounded-xl border border-[#046ca9]/20 bg-gradient-to-r from-[#046ca9]/10 to-[#034d79]/5 p-3.5 sm:p-4">
                    <div className="flex items-center gap-3">
                        {currentStore.logo_path ? (
                            <div className="overflow-hidden rounded-lg border border-[#046ca9]/20 bg-white">
                                <Image
                                    src={resolveStorageUrl(currentStore.logo_path)}
                                    alt={currentStore.store_name}
                                    width={36}
                                    height={36}
                                    className="h-9 w-9 object-contain p-0.5"
                                    unoptimized
                                />
                            </div>
                        ) : (
                            <div className="rounded-lg bg-[#034d79] p-2 text-white">
                                <Store className="h-5 w-5" />
                            </div>
                        )}
                        <div>
                            <h3 className="text-sm font-semibold text-[#034d79] sm:text-base">{t('dashboard_current_store')}: {currentStore.store_name}</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{t('dashboard_store_data_note')}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard Summary */}
            <Summary />

            {/* Analytics Section */}
            <Analytics />

            {/* Top Selling / Low Stock / Recent Sales */}
            <DashboardSections />

            {/* Payment Methods + Recent Transactions */}
            <SectionFour />

            {/* Profit Trend + Expense Breakdown */}
            <ProfitExpenseWidget />

            {/* Top Categories, Top Brands, Top Purchased + Top Customers */}
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
