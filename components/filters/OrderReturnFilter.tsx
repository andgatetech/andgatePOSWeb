'use client';

import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { RefreshCcw } from 'lucide-react';
import { getTranslation } from '@/i18n';
import React from 'react';

interface OrderReturnFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const OrderReturnFilter: React.FC<OrderReturnFilterProps> = ({ onFilterChange }) => {
    const { t } = getTranslation();
    const [selectedReturnType, setSelectedReturnType] = React.useState<string>('all');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState<string>('all');

    const { userStores } = useCurrentStore();

    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Reset function to reset all custom filters
    const handleReset = React.useCallback(() => {
        setSelectedReturnType('all');
        setSelectedPaymentStatus('all');
    }, []);

    // Handle filter changes separately using useEffect
    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (selectedReturnType !== 'all') {
            additionalParams.return_type = selectedReturnType;
        }
        if (selectedPaymentStatus !== 'all') {
            additionalParams.payment_status = selectedPaymentStatus;
        }

        // Handle store_ids for 'all' stores
        if (filters.storeId === 'all') {
            const allStoreIds = userStores.map((store: any) => store.id);
            if (allStoreIds.length > 1) {
                additionalParams.store_ids = allStoreIds.join(',');
            } else if (allStoreIds.length === 1) {
                additionalParams.store_id = allStoreIds[0];
            }
        }

        const apiParams = buildApiParams(additionalParams);
        onFilterChange(apiParams);
    }, [filters, selectedReturnType, selectedPaymentStatus, buildApiParams, onFilterChange, userStores]);

    // Reset filters when store selection changes
    React.useEffect(() => {
        setSelectedReturnType('all');
        setSelectedPaymentStatus('all');
    }, [filters.storeId]);

    const customFilters = (
        <>
            {/* Return Type Filter */}
            <div className="relative">
                <select
                    value={selectedReturnType}
                    onChange={(e) => setSelectedReturnType(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:w-auto"
                >
                    <option value="all">{t('lbl_all_return_types')}</option>
                    <option value="return">{t('lbl_pure_return')}</option>
                    <option value="exchange">{t('lbl_exchange')}</option>
                    <option value="return_and_buy">{t('lbl_return_and_buy')}</option>
                </select>
                <RefreshCcw className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
                <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:w-auto"
                >
                    <option value="all">{t('lbl_all_payment_status')}</option>
                    <option value="pending">{t('status_pending')}</option>
                    <option value="refunded">{t('status_refunded')}</option>
                    <option value="paid">{t('status_paid')}</option>
                </select>
                <RefreshCcw className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder={t('placeholder_search_returns')}
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={customFilters}
            onResetFilters={handleReset}
        />
    );
};

export default OrderReturnFilter;
