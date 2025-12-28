'use client';

import { useSelector } from 'react-redux';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { RootState } from '@/store';
import { Store } from 'lucide-react';
import Analytics from './Analytics';
import DashboardSections from './DashboardSections';
import SectionsFive from './SectionsFive';
import Summary from './Summary';

const ComponentsDashboardSales = () => {
    const { currentStoreId, currentStore } = useCurrentStore();
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <div className=" sm:space-y-6 ">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">Welcome back, {user?.name || 'User'}! 👋</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:text-base">Here&apos;s what&apos;s happening with your {currentStore?.store_name || 'store'} today</p>
            </div>
            {/* Current Store Info */}
            {currentStore && (
                <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-3.5 sm:p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary p-2 text-white">
                            <Store className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-primary sm:text-base">Current Store: {currentStore.store_name}</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">All data shown below is for this store only</p>
                        </div>
                    </div>
                </div>
            )}
            {/* Dashboard Summary */}
            <Summary />
            {/* Analytics Section */}
            <Analytics />
            {/* Third Section */}
            <DashboardSections />
            {/* Sections Five - Top Categories, Top Brands, Top Purchased Products */}
            <SectionsFive />
        </div>
    );
};

export default ComponentsDashboardSales;
