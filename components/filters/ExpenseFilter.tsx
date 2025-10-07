'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import React from 'react';

interface ExpenseFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
    currentStoreId?: number | null;
}

const ExpenseFilter: React.FC<ExpenseFilterProps> = ({ onFilterChange, currentStoreId }) => {
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Handle all filter changes in one effect
    React.useEffect(() => {
        const apiParams = buildApiParams({});
        onFilterChange(apiParams);
    }, [filters, buildApiParams, onFilterChange]);

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search expenses..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            initialFilters={{
                dateRange: { type: 'none' },
            }}
        />
    );
};

export default ExpenseFilter;
