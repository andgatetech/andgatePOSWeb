'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { Layers } from 'lucide-react';
import React from 'react';

interface CategoryFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
    currentStoreId?: number | null;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ onFilterChange, currentStoreId }) => {
    const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Handle all filter changes in one effect
    React.useEffect(() => {
        const apiParams = buildApiParams({
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
        });
        onFilterChange(apiParams);
    }, [filters, selectedStatus, buildApiParams, onFilterChange]);

    const customFilters = (
        <>
            {/* Status Filter */}
            <div className="relative">
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <Layers className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search categories..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={customFilters}
            initialFilters={{
                dateRange: { type: 'none' }, // No default date filter
            }}
        />
    );
};

export default CategoryFilter;
