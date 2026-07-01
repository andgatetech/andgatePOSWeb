'use client';

import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { getTranslation } from '@/i18n';
import { CircleAlert } from 'lucide-react';
import React, { useCallback } from 'react';

interface CustomerReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const CustomerReportFilter: React.FC<CustomerReportFilterProps> = ({ onFilterChange }) => {
    const { t } = getTranslation();
    const { userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();
    const [isOnlyDue, setIsOnlyDue] = React.useState(false);

    const stableOnFilterChange = React.useCallback(onFilterChange, [onFilterChange]);

    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (isOnlyDue) {
            additionalParams.only_due = true;
        }

        if (filters.storeId === 'all') {
            const allStoreIds = userStores.map((store: any) => store.id);
            if (allStoreIds.length > 1) {
                additionalParams.store_ids = allStoreIds;
            } else if (allStoreIds.length === 1) {
                additionalParams.store_id = allStoreIds[0];
            }
        }

        const apiParams = buildApiParams(additionalParams);
        stableOnFilterChange(apiParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, isOnlyDue, userStores]);

    const handleDueToggle = useCallback(() => {
        setIsOnlyDue((prev) => !prev);
    }, []);

    const handleReset = useCallback(() => {
        setIsOnlyDue(false);
    }, []);

    const customFiltersSlot = (
        <div className="flex items-center gap-2">
            <button
                onClick={handleDueToggle}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                    isOnlyDue ? 'border-red-600 bg-red-50 text-red-600 shadow-sm' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
                <CircleAlert className={`h-4 w-4 ${isOnlyDue ? 'text-red-600' : 'text-gray-400'}`} />
                {isOnlyDue ? t('lbl_only_dues_active') : t('lbl_filter_only_due')}
            </button>
        </div>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder={t('placeholder_search_customers_report')}
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={customFiltersSlot}
            customActiveCount={isOnlyDue ? 1 : 0}
            onResetFilters={handleReset}
            initialFilters={filters}
        />
    );
};

export default CustomerReportFilter;
