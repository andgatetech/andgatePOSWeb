'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import React from 'react';

interface BasicReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
    placeholder?: string;
    showDateFilter?: boolean;
}

const BasicReportFilter: React.FC<BasicReportFilterProps> = ({ onFilterChange, placeholder = 'Search...', showDateFilter = true }) => {
    const { userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Stabilize the callback to prevent unnecessary re-renders
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
    }, [filters]);

    return <UniversalFilter onFilterChange={handleFilterChange} placeholder={placeholder} showStoreFilter={true} showDateFilter={showDateFilter} showSearch={true} />;
};

export default BasicReportFilter;
