'use client';

import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { DollarSign, Package, WalletCards } from 'lucide-react';
import { getTranslation } from '@/i18n';
import React from 'react';

interface PurchaseDuesFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const PurchaseDuesFilter: React.FC<PurchaseDuesFilterProps> = ({ onFilterChange }) => {
    const { t } = getTranslation();
    const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState('all');
    const [selectedOrderStatus, setSelectedOrderStatus] = React.useState('all');
    const [hasDueOnly, setHasDueOnly] = React.useState(false);

    const { userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Handle filter changes
    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        // Exclude orders that are both received AND paid (completed orders)
        additionalParams.exclude_completed = 'true';

        // Payment Status filter
        if (selectedPaymentStatus !== 'all') {
            additionalParams.payment_status = selectedPaymentStatus;
        }

        // Order Status filter
        if (selectedOrderStatus !== 'all') {
            additionalParams.status = selectedOrderStatus;
        }

        // Due only filter
        if (hasDueOnly) {
            additionalParams.has_due_only = 'true';
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
    }, [filters, selectedPaymentStatus, selectedOrderStatus, hasDueOnly, buildApiParams, onFilterChange, userStores]);

    // Reset filters when store selection changes
    React.useEffect(() => {
        setSelectedPaymentStatus('all');
        setSelectedOrderStatus('all');
        setHasDueOnly(false);
    }, [filters.storeId]);

    const handleReset = React.useCallback(() => {
        setSelectedPaymentStatus('all');
        setSelectedOrderStatus('all');
        setHasDueOnly(false);
    }, []);

    const customFilters = (
        <>
            {/* Order Status Filter */}
            <div className="relative">
                <Package className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                    value={selectedOrderStatus}
                    onChange={(e) => setSelectedOrderStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
                >
                    <option value="all">{t('lbl_all_orders')}</option>
                    <option value="draft">{t('lbl_draft')}</option>
                    <option value="approved">{t('lbl_approved')}</option>
                    <option value="ordered">{t('lbl_ordered')}</option>
                    <option value="partially_received">{t('lbl_partially_received')}</option>
                    <option value="received">{t('lbl_received')}</option>
                    <option value="cancelled">{t('lbl_cancelled')}</option>
                </select>
            </div>

            {/* Payment Status Filter */}
            <div className="relative">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
                >
                    <option value="all">{t('lbl_all_payment_status')}</option>
                    <option value="pending">{t('lbl_pending')}</option>
                    <option value="due">{t('lbl_due')}</option>
                    <option value="partial">{t('lbl_partial')}</option>
                    <option value="advanced">{t('lbl_advanced')}</option>
                    <option value="paid">{t('lbl_paid')}</option>
                    <option value="failed">{t('lbl_failed')}</option>
                </select>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <input
                    type="checkbox"
                    checked={hasDueOnly}
                    onChange={(e) => setHasDueOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <WalletCards className="h-4 w-4 text-gray-400" />
                {t('lbl_filter_only_due')}
            </label>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder={t('placeholder_search_purchases')}
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={customFilters}
            customActiveCount={(selectedPaymentStatus !== 'all' ? 1 : 0) + (selectedOrderStatus !== 'all' ? 1 : 0) + (hasDueOnly ? 1 : 0)}
            onResetFilters={handleReset}
        />
    );
};

export default PurchaseDuesFilter;
