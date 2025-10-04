'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import React from 'react';

interface TaxReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const TaxReportFilter: React.FC<TaxReportFilterProps> = ({ onFilterChange }) => {
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
            placeholder="Search invoices, products, stores..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            initialFilters={{
                dateRange: { type: 'this_month' },
            }}
        />
    );
};

export default TaxReportFilter;
