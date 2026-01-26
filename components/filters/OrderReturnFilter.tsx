'use client';

import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { RefreshCcw } from 'lucide-react';
import React from 'react';

interface OrderReturnFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const OrderReturnFilter: React.FC<OrderReturnFilterProps> = ({ onFilterChange }) => {
    const [selectedReturnType, setSelectedReturnType] = React.useState<string>('all');

    const { userStores } = useCurrentStore();

    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Reset function to reset all custom filters
    const handleReset = React.useCallback(() => {
        setSelectedReturnType('all');
    }, []);

    // Handle filter changes separately using useEffect
    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (selectedReturnType !== 'all') {
            additionalParams.return_type = selectedReturnType;
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
    }, [filters, selectedReturnType, buildApiParams, onFilterChange, userStores]);

    // Reset filters when store selection changes
    React.useEffect(() => {
        setSelectedReturnType('all');
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
                    <option value="all">All Return Types</option>
                    <option value="return">Pure Return</option>
                    <option value="exchange">Exchange</option>
                </select>
                <RefreshCcw className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search return #, invoice, customers..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={customFilters}
            onResetFilters={handleReset}
        />
    );
};

export default OrderReturnFilter;
