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


    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search categories..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
       
            initialFilters={{
                dateRange: { type: 'none' }, // No default date filter
            }}
        />
    );
};

export default CategoryFilter;
