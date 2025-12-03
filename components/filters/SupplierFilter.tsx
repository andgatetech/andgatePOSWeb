'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { CheckCircle } from 'lucide-react';
import React from 'react';

interface SupplierFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const SupplierFilter: React.FC<SupplierFilterProps> = ({ onFilterChange }) => {
    const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

    const { currentStore, userStores } = useCurrentStore();

    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Reset function to reset all custom filters
    const handleReset = React.useCallback(() => {
        setSelectedStatus('all');
    }, []);

    // Handle filter changes separately using useEffect
    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (selectedStatus !== 'all') {
            additionalParams.status = selectedStatus;
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
    }, [filters, selectedStatus, buildApiParams, onFilterChange, userStores]);

    // Reset filters when store selection changes
    React.useEffect(() => {
        setSelectedStatus('all');
    }, [filters.storeId]);

    const customFilters = (
        <>
            {/* Status Filter */}
            <div className="relative">
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                </select>
                <CheckCircle className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search suppliers by name, email, phone..."
            showStoreFilter={true}
            showDateFilter={false}
            showSearch={true}
            customFilters={customFilters}
            onResetFilters={handleReset}
        />
    );
};

export default SupplierFilter;
