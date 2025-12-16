'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import React from 'react';

interface ProfitLossReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const ProfitLossReportFilter: React.FC<ProfitLossReportFilterProps> = ({ onFilterChange }) => {
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Handle all filter changes
    React.useEffect(() => {
        const apiParams = buildApiParams();
        onFilterChange(apiParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Select date range for profit & loss analysis..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={false}
            customFilters={[]}
            initialFilters={{
                dateRange: { type: 'today' },
            }}
        />
    );
};

export default ProfitLossReportFilter;
