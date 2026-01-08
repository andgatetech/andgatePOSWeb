'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { Activity } from 'lucide-react';
import React from 'react';

interface StoreFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const StoreFilter: React.FC<StoreFilterProps> = ({ onFilterChange }) => {
    const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
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

        const apiParams = buildApiParams(additionalParams);
        onFilterChange(apiParams);
    }, [filters, selectedStatus, buildApiParams, onFilterChange]);

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
                </select>
                <Activity className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search stores..."
            showStoreFilter={false} // Typically admin views all stores or list handles it. If user can filter by store active/inactive that's different.
            showDateFilter={true}
            showSearch={true}
            customFilters={customFilters}
            onResetFilters={handleReset}
        />
    );
};

export default StoreFilter;
