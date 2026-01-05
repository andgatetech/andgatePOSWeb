'use client';

import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { CircleAlert } from 'lucide-react';
import React, { useCallback } from 'react';

interface CustomerReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const CustomerReportFilter: React.FC<CustomerReportFilterProps> = ({ onFilterChange }) => {
    const { userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter({
        initialFilters: {
            customFilters: { only_due: false },
        },
    });

    const stableOnFilterChange = React.useCallback(onFilterChange, []);

    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (filters.storeId === 'all') {
            const allStoreIds = userStores.map((store: any) => store.id);
            if (allStoreIds.length > 1) {
                additionalParams.store_ids = allStoreIds.join(',');
            } else if (allStoreIds.length === 1) {
                additionalParams.store_id = allStoreIds[0];
            }
        }

        const apiParams = buildApiParams(additionalParams);
        stableOnFilterChange(apiParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, buildApiParams, userStores]);

    const handleDueToggle = useCallback(() => {
        const isOnlyDue = filters.customFilters?.only_due || false;
        handleFilterChange({
            ...filters,
            customFilters: {
                ...filters.customFilters,
                only_due: !isOnlyDue,
            },
        });
    }, [filters, handleFilterChange]);

    const customFiltersSlot = (
        <div className="flex items-center gap-2">
            <button
                onClick={handleDueToggle}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                    filters.customFilters?.only_due ? 'border-red-600 bg-red-50 text-red-600 shadow-sm' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
                <CircleAlert className={`h-4 w-4 ${filters.customFilters?.only_due ? 'text-red-600' : 'text-gray-400'}`} />
                {filters.customFilters?.only_due ? 'Only Dues Active' : 'Filter Only Due'}
            </button>
        </div>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search customers, phone, email..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={customFiltersSlot}
            initialFilters={filters}
        />
    );
};

export default CustomerReportFilter;
