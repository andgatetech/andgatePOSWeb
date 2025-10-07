'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { BookText } from 'lucide-react';
import React from 'react';

interface LedgerFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
    currentStoreId?: number | null;
}

const LedgerFilter: React.FC<LedgerFilterProps> = ({ onFilterChange, currentStoreId }) => {
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Handle all filter changes in one effect
    React.useEffect(() => {
        const apiParams = buildApiParams({});
        onFilterChange(apiParams);
    }, [filters, buildApiParams, onFilterChange]);

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search ledgers..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            initialFilters={{
                dateRange: { type: 'none' }, // No default date filter
            }}
        />
    );
};

export default LedgerFilter;
