'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { Award } from 'lucide-react';
import React from 'react';

interface CustomerFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const CustomerFilter: React.FC<CustomerFilterProps> = ({ onFilterChange }) => {
    const [selectedMembership, setSelectedMembership] = React.useState<string>('all');

    const { currentStore, userStores } = useCurrentStore();

    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Reset function to reset all custom filters
    const handleReset = React.useCallback(() => {
        setSelectedMembership('all');
    }, []);

    // Handle filter changes separately using useEffect
    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (selectedMembership !== 'all') {
            additionalParams.membership = selectedMembership;
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
    }, [filters, selectedMembership, buildApiParams, onFilterChange, userStores]);

    // Reset filters when store selection changes
    React.useEffect(() => {
        setSelectedMembership('all');
    }, [filters.storeId]);

    const customFilters = (
        <>
            {/* Membership Filter */}
            <div className="relative">
                <select
                    value={selectedMembership}
                    onChange={(e) => setSelectedMembership(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="all">All Membership</option>
                    <option value="normal">Normal</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                </select>
                <Award className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search customers by name, email, phone..."
            showStoreFilter={true}
            showDateFilter={false}
            showSearch={true}
            customFilters={customFilters}
            onResetFilters={handleReset}
        />
    );
};

export default CustomerFilter;
